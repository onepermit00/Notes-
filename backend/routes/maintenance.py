"""Work orders and the maintenance team.

One work order record is shared by everyone: residents send them, the desk and
the manager add them, maintenance works them and logs vendor visits. Every step
has a time and a name. Opening and finishing one writes a line into the day's
report (DAR) under the concierge running the shift, so the manager, the desk
and maintenance all read the same notes.

The desk also gets tasks from work orders, made by Noted itself:
  - "check maintenance has it" when a resident sends one,
  - "remind maintenance" when one stays open past the building's time limit,
  - "follow up with the resident" when maintenance finishes a resident's order.
"""
import asyncio
import uuid
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Cookie, HTTPException, Request
from pydantic import BaseModel
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError
from typing import Dict, List, Optional
from core import _audit, _resolve_user, db, esc, send_email

api = APIRouter(prefix='/api')

STATUSES = ('open', 'in_progress', 'on_hold', 'completed', 'cancelled')
OPEN_STATUSES = ('open', 'in_progress', 'on_hold')
URGENCY_LABELS = {'emergency': 'Emergency', 'urgent': 'Urgent', 'routine': 'Routine'}

# When the desk is asked to remind maintenance about an open work order, in
# hours. Standard residential practice: emergencies are attended within hours,
# urgent repairs within a day, routine ones within a few days. Each building
# can change these.
DEFAULT_REMIND_HOURS = {'emergency': 2, 'urgent': 24, 'routine': 72}

WHO_LABEL = {'manager': 'Manager', 'concierge': 'Concierge', 'maintenance': 'Maintenance', 'resident': 'Resident'}


class WorkOrderCreate(BaseModel):
    kind:         str = 'repair'          # repair | vendor_visit
    unit:         Optional[str] = ''
    location:     Optional[str] = ''
    category:     Optional[str] = ''
    description:  str
    urgency:      Optional[str] = 'routine'
    permission_to_enter: Optional[bool] = None
    pets:         Optional[str] = ''
    best_time:    Optional[str] = ''
    vendor_name:  Optional[str] = ''
    photos:       Optional[List[str]] = None


class WorkOrderUpdate(BaseModel):
    status:       Optional[str] = None
    note:         Optional[str] = None
    photos:       Optional[List[str]] = None
    hold_reason:  Optional[str] = None


class WorkOrderNote(BaseModel):
    text:   str
    photos: Optional[List[str]] = None


class MaintenanceSettings(BaseModel):
    remind_hours: Dict[str, float]


def _iso(v):
    return v.isoformat() if isinstance(v, datetime) else v


def _as_dt(v):
    if isinstance(v, datetime):
        return v if v.tzinfo else v.replace(tzinfo=timezone.utc)
    return None


def _name(user: dict) -> str:
    return (f"{user.get('first_name', '')} {user.get('last_name', '')}".strip() or user.get('name', '') or 'Someone')


def _user_id(user: dict, user_type: str) -> str:
    return user.get('resident_id') if user_type == 'resident' else (user.get('concierge_id') or user.get('manager_id'))


def clean_photos(photos: Optional[List[str]], limit: int = 4) -> List[str]:
    out = []
    for p in (photos or [])[:limit]:
        if not isinstance(p, str) or not p.startswith('data:image/'):
            raise HTTPException(400, 'Photos must be images.')
        if len(p) > 2_500_000:
            raise HTTPException(413, 'One of the photos is too large. Try a smaller one.')
        out.append(p)
    return out


def summary(wo: dict) -> str:
    """'Work order #12 · Unit 12B · Plumbing' or 'Vendor visit #13 · GreenCo · Lawn'."""
    head = f"{'Vendor visit' if wo.get('kind') == 'vendor_visit' else 'Work order'} #{wo.get('number', '?')}"
    parts = [head]
    if wo.get('kind') == 'vendor_visit' and wo.get('vendor_name'):
        parts.append(wo['vendor_name'])
    if wo.get('unit'):
        parts.append(f"Unit {wo['unit']}")
    elif wo.get('location'):
        parts.append(wo['location'])
    if wo.get('category'):
        parts.append(wo['category'])
    return ' · '.join(parts)


def staff_view(wo: dict) -> dict:
    out = {k: _iso(v) for k, v in wo.items() if k != '_id'}
    out['timeline'] = [{**e, 'at': _iso(e.get('at'))} for e in wo.get('timeline') or []]
    out['summary'] = summary(wo)
    return out


async def remind_hours(mgr_id: str) -> dict:
    manager = await db.managers.find_one({'manager_id': mgr_id}, {'maintenance_remind_hours': 1}) or {}
    saved = manager.get('maintenance_remind_hours') or {}
    return {k: float(saved.get(k, v)) for k, v in DEFAULT_REMIND_HOURS.items()}


# ── The day's report ────────────────────────────────────────────────────────

async def report_shift(mgr_id: str):
    """The shift a maintenance update belongs to: the concierge running the desk
    now. If no one is clocked in, the last shift, marked as 'no one on shift'."""
    active = await db.shifts.find({'manager_id': mgr_id, 'status': 'active'}).sort('clock_in', 1).to_list(1)
    if active:
        return active[0], False
    last = await db.shifts.find({'manager_id': mgr_id, 'status': 'completed'}).sort('clock_out', -1).to_list(1)
    return (last[0] if last else None), True


async def add_to_report(mgr_id: str, wo: dict, what: str, user: dict, user_type: str,
                        notes: str = '', photos: Optional[List[str]] = None):
    """One line in the DAR, 'added by' the person who did it."""
    shift, desk_closed = await report_shift(mgr_id)
    now = datetime.now(timezone.utc)
    who = f"{_name(user)} ({WHO_LABEL.get(user_type, 'Staff')})"
    title = f"{what} · {summary(wo)} · added by {who}"
    if desk_closed:
        title = f'No one on shift · {title}'
    doc = {
        'task_id':          f'task_{uuid.uuid4().hex[:12]}',
        'manager_id':       mgr_id,
        'shift_id':         shift['shift_id'] if shift else None,
        'desk_closed':      desk_closed,
        'title':            title,
        'notes':            notes,
        'category':         'Maintenance',
        'priority':         'Standard',
        'status':           'completed',
        'source_section':   'maintenance',
        'work_order_id':    wo['work_order_id'],
        'evidence_urls':    photos or [],
        'created_by':       _user_id(user, user_type),
        'created_by_name':  _name(user),
        'created_by_type':  'maintenance_log',
        'created_at':       now,
        'completed_at':     now,
    }
    await db.tasks.insert_one(doc)


# ── Desk tasks made by Noted ────────────────────────────────────────────────

async def desk_task(wo: dict, kind: str, title: str, notes: str, key: Optional[str] = None, extra: Optional[dict] = None):
    now = datetime.now(timezone.utc)
    doc = {
        'task_id':         f'task_{uuid.uuid4().hex[:12]}',
        'manager_id':      wo['manager_id'],
        'shift_id':        None,
        'title':           title,
        'notes':           notes,
        'category':        'Maintenance',
        'priority':        'Urgent' if wo.get('urgency') == 'emergency' else 'Standard',
        'status':          'pending',
        'requires_photo':  False,
        'assigned_to':     '',
        'assigned_to_id':  '',
        'source_section':  'work_order',
        'work_order_id':   wo['work_order_id'],
        'work_order_number': wo.get('number'),
        'wo_task':         kind,             # notify | remind | followup
        'due_time':        'ASAP',
        'evidence_urls':   [],
        'request_photos':  wo.get('photos') or [],
        'unit':            wo.get('unit', ''),
        'resident_id':     wo.get('resident_id'),
        'resident_name':   wo.get('resident_name', ''),
        'created_by':      'noted',
        'created_by_name': 'Noted',
        'created_by_type': 'system',
        'created_at':      now,
        **(extra or {}),
    }
    if key:
        doc['reminder_key'] = key
    try:
        await db.tasks.insert_one(doc)
    except DuplicateKeyError:
        return None
    return doc


async def check_overdue(mgr_id: str):
    """Give the desk a 'remind maintenance' task for each work order open past
    the building's time limit. Runs whenever the desk or maintenance loads work,
    so no background job is needed. One open reminder per work order at a time;
    once it is done, another comes after the next period."""
    hours = await remind_hours(mgr_id)
    now = datetime.now(timezone.utc)
    rows = await db.work_orders.find({'manager_id': mgr_id, 'status': {'$in': list(OPEN_STATUSES)},
                                      'kind': {'$ne': 'vendor_visit'}}).to_list(1000)
    for wo in rows:
        limit = hours.get(wo.get('urgency') or 'routine', DEFAULT_REMIND_HOURS['routine'])
        created = _as_dt(wo.get('created_at'))
        if not created or limit <= 0:
            continue
        periods = int((now - created).total_seconds() // (limit * 3600))
        if periods < 1:
            continue
        if await db.tasks.find_one({'work_order_id': wo['work_order_id'], 'wo_task': 'remind',
                                    'status': {'$nin': ['completed', 'declined']}}):
            continue
        open_for = now - created
        age = f'{int(open_for.total_seconds() // 3600)} hours' if open_for < timedelta(days=2) else f'{open_for.days} days'
        state = {'open': 'not started', 'in_progress': 'in progress', 'on_hold': f"on hold{': ' + wo['hold_reason'] if wo.get('hold_reason') else ''}"}[wo['status']]
        await desk_task(
            wo, 'remind',
            f"Remind maintenance · {summary(wo)} · open {age}",
            f"{URGENCY_LABELS.get(wo.get('urgency'), 'Routine')} work order, {state}. The building's limit is {limit:g} hours. "
            f"Check with maintenance and note what they said.\n{wo.get('description', '')}",
            key=f"remind:{wo['work_order_id']}:{periods}",
        )


async def _clear_waiting_desk_tasks(wo_id: str):
    """Reminders and 'check maintenance has it' are moot once the work is done."""
    await db.tasks.delete_many({'work_order_id': wo_id, 'wo_task': {'$in': ['notify', 'remind']},
                                'status': {'$nin': ['completed', 'declined']}})


# ── Creating ────────────────────────────────────────────────────────────────

async def next_number(mgr_id: str) -> int:
    doc = await db.counters.find_one_and_update(
        {'_id': f'work_order:{mgr_id}'}, {'$inc': {'n': 1}}, upsert=True, return_document=ReturnDocument.AFTER)
    return int(doc['n'])


async def create_work_order(mgr_id: str, user: dict, user_type: str, data: WorkOrderCreate,
                            resident: Optional[dict] = None) -> dict:
    description = (data.description or '').strip()
    if len(description) < 3:
        raise HTTPException(400, 'Describe the work in a few words.')
    kind = 'vendor_visit' if data.kind == 'vendor_visit' else 'repair'
    urgency = data.urgency if data.urgency in URGENCY_LABELS else 'routine'
    now = datetime.now(timezone.utc)
    who = _name(user)
    wo = {
        'work_order_id': f'wo_{uuid.uuid4().hex[:12]}',
        'number':        await next_number(mgr_id),
        'manager_id':    mgr_id,
        'kind':          kind,
        'unit':          (resident or {}).get('unit') or (data.unit or '').strip()[:30],
        'location':      (data.location or '').strip()[:120],
        'category':      (data.category or '').strip()[:80],
        'description':   description[:4000],
        'urgency':       urgency if kind == 'repair' else 'routine',
        'permission_to_enter': data.permission_to_enter,
        'pets':          (data.pets or '').strip()[:120],
        'best_time':     (data.best_time or '').strip()[:120],
        'vendor_name':   (data.vendor_name or '').strip()[:120] if kind == 'vendor_visit' else '',
        'photos':        clean_photos(data.photos),
        'status':        'open',
        'resident_id':   (resident or {}).get('resident_id'),
        'resident_name': (resident or {}).get('name', ''),
        'created_by':    _user_id(user, user_type),
        'created_by_name': who,
        'created_by_type': user_type,
        'created_at':    now,
        'timeline':      [{'at': now, 'event': 'sent' if user_type == 'resident' else 'opened',
                           'by_type': user_type, 'by_name': who}],
    }
    if kind == 'vendor_visit':
        # A vendor who is here is already being dealt with; whoever logged them closes it when they leave.
        wo['status'] = 'in_progress'
        wo['started_at'] = now
        wo['started_by_name'] = who
    await db.work_orders.insert_one(wo)
    wo.pop('_id', None)

    if kind == 'vendor_visit':
        what = 'Vendor visit logged'
    else:
        what = 'Work order sent by resident' if user_type == 'resident' else 'Work order opened'
    await add_to_report(mgr_id, wo, what, user, user_type, notes=description[:600], photos=wo['photos'])
    if user_type in ('resident', 'manager'):
        # The desk makes sure maintenance has it, and has the time it came in.
        details = [f"Urgency: {URGENCY_LABELS[wo['urgency']]}"]
        if wo['location']:
            details.append(f"Where: {wo['location']}")
        if wo['permission_to_enter'] is not None:
            details.append('OK to enter if no one is home' if wo['permission_to_enter'] else 'Enter only when someone is home')
        if wo['pets']:
            details.append(f"Pets: {wo['pets']}")
        if wo['best_time']:
            details.append(f"Best time: {wo['best_time']}")
        source = f"from {wo['resident_name'] or 'a resident'}" if user_type == 'resident' else f'from {who}'
        await desk_task(wo, 'notify', f"Check maintenance has it · {summary(wo)} · {source}",
                        f"{description}\n{' · '.join(details)}")
    await _audit(mgr_id, _user_id(user, user_type), user_type, 'create', 'work_order', wo['work_order_id'], {'number': wo['number']})
    return wo


# ── Routes ──────────────────────────────────────────────────────────────────

WORK_ROLES = ('manager', 'concierge', 'maintenance')


@api.get('/work-orders')
async def list_work_orders(request: Request, status: Optional[str] = None, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token, allow=WORK_ROLES)
    await check_overdue(mgr_id)
    query = {'manager_id': mgr_id}
    if status == 'open':
        query['status'] = {'$in': list(OPEN_STATUSES)}
    elif status in STATUSES:
        query['status'] = status
    rows = await db.work_orders.find(query, {'_id': 0}).sort('created_at', -1).to_list(500)
    return {'work_orders': [staff_view(w) for w in rows], 'remind_hours': await remind_hours(mgr_id)}


@api.get('/work-orders/{wo_id}')
async def get_work_order(wo_id: str, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token, allow=WORK_ROLES)
    wo = await db.work_orders.find_one({'work_order_id': wo_id, 'manager_id': mgr_id}, {'_id': 0})
    if not wo:
        raise HTTPException(404, 'Work order not found.')
    if user_type == 'maintenance' and not any(e.get('event') == 'seen' for e in wo.get('timeline') or []):
        # The resident's timeline shows when maintenance first looked at it.
        seen = {'at': datetime.now(timezone.utc), 'event': 'seen', 'by_type': user_type, 'by_name': _name(user)}
        await db.work_orders.update_one({'work_order_id': wo_id}, {'$push': {'timeline': seen}})
        wo['timeline'] = (wo.get('timeline') or []) + [seen]
    return staff_view(wo)


@api.post('/work-orders')
async def new_work_order(data: WorkOrderCreate, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token, allow=WORK_ROLES)
    return staff_view(await create_work_order(mgr_id, user, user_type, data))


async def _tell_resident_done(wo: dict):
    resident = await db.residents.find_one({'resident_id': wo.get('resident_id'), 'is_active': True})
    if not resident or not resident.get('email'):
        return
    manager = await db.managers.find_one({'manager_id': wo['manager_id']}, {'property_name': 1}) or {}
    first = (resident.get('name') or '').split(' ')[0] or 'there'
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:40px 20px">
      <div style="background:#fff;border:1px solid #ebebeb;border-radius:16px;padding:32px">
        <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#FF385C;margin:0 0 12px;font-weight:800">{esc(manager.get('property_name', 'Noted'))}</p>
        <h1 style="color:#222;font-size:21px;font-weight:800;margin:0 0 14px">Your work order is done</h1>
        <p style="color:#444;font-size:15px;line-height:1.7">Hi {esc(first)}, maintenance finished work order #{esc(wo.get('number'))}{f" ({esc(wo['category'])})" if wo.get('category') else ''}. The front desk will check in with you.</p>
        <p style="color:#aaa;font-size:13px">If something is still not right, send a new request from Noted.</p>
      </div>
    </div>"""
    await send_email(resident['email'], 'Your work order is done', html)


@api.put('/work-orders/{wo_id}')
async def update_work_order(wo_id: str, data: WorkOrderUpdate, request: Request, session_token: Optional[str] = Cookie(default=None)):
    """Maintenance (or the manager) moves a work order along. The desk can only cancel one it opened."""
    user, user_type, mgr_id = await _resolve_user(request, session_token, allow=WORK_ROLES)
    wo = await db.work_orders.find_one({'work_order_id': wo_id, 'manager_id': mgr_id})
    if not wo:
        raise HTTPException(404, 'Work order not found.')
    if data.status not in STATUSES:
        raise HTTPException(422, 'Choose open, in progress, on hold, completed or cancelled.')
    if user_type == 'concierge':
        own = wo.get('created_by') == user.get('concierge_id')
        # The desk can sign out a vendor it signed in, and cancel what it opened. The rest is maintenance's.
        allowed = own and (data.status == 'cancelled' or (wo.get('kind') == 'vendor_visit' and data.status == 'completed'))
        if not allowed:
            raise HTTPException(403, 'Maintenance updates work orders. You can cancel one you opened.')
    if wo['status'] in ('completed', 'cancelled') and data.status != 'open':
        raise HTTPException(409, 'This work order is already closed. Reopen it first.')
    if data.status == 'on_hold' and not (data.hold_reason or '').strip():
        raise HTTPException(400, 'Say what it is waiting on, like parts or the resident.')

    now = datetime.now(timezone.utc)
    who = _name(user)
    note = (data.note or '').strip()[:2000]
    photos = clean_photos(data.photos)
    patch = {'status': data.status, 'updated_at': now}
    event = {'open': 'reopened', 'in_progress': 'started', 'on_hold': 'on_hold',
             'completed': 'completed', 'cancelled': 'cancelled'}[data.status]
    if data.status == 'in_progress' and not wo.get('started_at'):
        patch.update(started_at=now, started_by_name=who)
    if data.status == 'on_hold':
        patch['hold_reason'] = data.hold_reason.strip()[:200]
    if data.status == 'completed':
        patch.update(completed_at=now, completed_by_name=who, completion_note=note, completion_photos=photos)
    if data.status == 'cancelled':
        patch.update(cancelled_at=now, cancelled_by_name=who, cancel_reason=note)
    entry = {'at': now, 'event': event, 'by_type': user_type, 'by_name': who}
    if note or data.hold_reason:
        entry['note'] = note or data.hold_reason.strip()[:200]
    await db.work_orders.update_one({'work_order_id': wo_id}, {'$set': patch, '$push': {'timeline': entry}})
    wo = await db.work_orders.find_one({'work_order_id': wo_id}, {'_id': 0})

    if data.status == 'completed':
        await add_to_report(mgr_id, wo, 'Vendor visit finished' if wo.get('kind') == 'vendor_visit' else 'Work order done',
                            user, user_type, notes=note, photos=photos)
        await _clear_waiting_desk_tasks(wo_id)
        if wo.get('resident_id'):
            await desk_task(wo, 'followup', f"Follow up with resident · {summary(wo)} · done by maintenance",
                            f"Maintenance finished this{': ' + note if note else '.'} Check with {wo.get('resident_name') or 'the resident'} that all is well, then mark it done. Your reply goes to them.",
                            extra={'request_photos': photos or wo.get('photos') or []})
            asyncio.create_task(_tell_resident_done(wo))
    elif data.status == 'on_hold':
        await add_to_report(mgr_id, wo, 'Work order on hold', user, user_type, notes=patch['hold_reason'])
    elif data.status == 'cancelled':
        await add_to_report(mgr_id, wo, 'Work order cancelled', user, user_type, notes=note)
        await _clear_waiting_desk_tasks(wo_id)
    await _audit(mgr_id, _user_id(user, user_type), user_type, 'update', 'work_order', wo_id, {'status': data.status})
    return staff_view(wo)


@api.post('/work-orders/{wo_id}/notes')
async def add_work_order_note(wo_id: str, data: WorkOrderNote, request: Request, session_token: Optional[str] = Cookie(default=None)):
    """A progress note, like 'plumber arrived, taking him to 505'. It goes in the DAR too."""
    user, user_type, mgr_id = await _resolve_user(request, session_token, allow=WORK_ROLES)
    wo = await db.work_orders.find_one({'work_order_id': wo_id, 'manager_id': mgr_id}, {'_id': 0})
    if not wo:
        raise HTTPException(404, 'Work order not found.')
    text = (data.text or '').strip()[:2000]
    if not text:
        raise HTTPException(400, 'Write the note first.')
    photos = clean_photos(data.photos)
    now = datetime.now(timezone.utc)
    await db.work_orders.update_one({'work_order_id': wo_id}, {'$push': {'timeline': {
        'at': now, 'event': 'note', 'note': text, 'photos': photos, 'by_type': user_type, 'by_name': _name(user)}}})
    await add_to_report(mgr_id, wo, 'Note', user, user_type, notes=text, photos=photos)
    return staff_view(await db.work_orders.find_one({'work_order_id': wo_id}, {'_id': 0}))


@api.put('/manager/maintenance-settings')
async def save_maintenance_settings(data: MaintenanceSettings, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if user_type != 'manager':
        raise HTTPException(403, 'Manager access required.')
    clean = {}
    for key in DEFAULT_REMIND_HOURS:
        value = data.remind_hours.get(key)
        if value is not None:
            if not 0.25 <= float(value) <= 24 * 30:
                raise HTTPException(400, 'Pick a time between 15 minutes and 30 days.')
            clean[key] = float(value)
    await db.managers.update_one({'manager_id': mgr_id}, {'$set': {'maintenance_remind_hours': {**(await remind_hours(mgr_id)), **clean}}})
    return {'remind_hours': await remind_hours(mgr_id)}


@api.get('/maintenance/dar')
async def maintenance_dar(request: Request, session_token: Optional[str] = Cookie(default=None)):
    """The day's report, read-only, for maintenance: the shift running now and the last one."""
    from routes.shifts import _iso as iso_fields, _shift_activities, close_stale_shifts
    user, user_type, mgr_id = await _resolve_user(request, session_token, allow=('maintenance',))
    await close_stale_shifts({'manager_id': mgr_id})
    shifts = await db.shifts.find({'manager_id': mgr_id, 'status': 'active'}, {'_id': 0}).sort('clock_in', -1).to_list(10)
    last = await db.shifts.find({'manager_id': mgr_id, 'status': 'completed'}, {'_id': 0}).sort('clock_out', -1).to_list(1)
    out = []
    for s in shifts + last:
        tasks, incidents = await _shift_activities(s['shift_id'], mgr_id, s)
        iso_fields(s, 'clock_in', 'clock_out', 'created_at')
        s['activities'], s['incidents'] = tasks, incidents
        out.append(s)
    return {'active': out[:len(shifts)], 'previous': out[len(shifts)] if last else None}
