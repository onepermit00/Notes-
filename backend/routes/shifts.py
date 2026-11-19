"""Shift clock-in/out, history and handover."""
import os
import uuid
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Cookie, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
from core import _audit, _resolve_user, db, get_session
from routes.tasks import _materialize_scheduled_tasks, desk_day

api = APIRouter(prefix='/api')

@api.post('/shifts/start')
async def start_shift(request: Request, day: Optional[str] = None, session_token: Optional[str] = Cookie(default=None)):
    session = await get_session(request, session_token)
    if not session or session['user_type'] != 'concierge':
        raise HTTPException(403, 'Concierge access required.')
    concierge = await db.concierges.find_one({'concierge_id': session['user_id']})
    if not concierge:
        raise HTTPException(404, 'Concierge not found.')
    await close_stale_shifts({'concierge_id': session['user_id']})
    # Return existing active shift if already clocked in
    existing = await db.shifts.find_one({'concierge_id': session['user_id'], 'status': 'active'}, {'_id': 0})
    if existing:
        _iso(existing, 'clock_in', 'created_at')
        return existing
    shift_id = f'shift_{uuid.uuid4().hex[:12]}'
    now = datetime.now(timezone.utc)
    doc = {
        'shift_id':       shift_id,
        'concierge_id':   concierge['concierge_id'],
        'concierge_name': f"{concierge['first_name']} {concierge['last_name']}",
        'manager_id':     concierge['manager_id'],
        'property_name':  concierge['property_name'],
        'status':         'active',
        'clock_in':       now,
        'clock_out':      None,
        'created_at':     now,
    }
    await db.shifts.insert_one(doc)
    doc.pop('_id', None)
    doc['clock_in'] = now.isoformat()
    doc['created_at'] = now.isoformat()

    # Materialize all of today's applicable requests, including future times.
    await _materialize_scheduled_tasks(concierge, shift_id, desk_day(day))

    await _audit(concierge['manager_id'], concierge['concierge_id'], 'concierge',
                 'clock_in', 'shift', shift_id, {'concierge': doc['concierge_name']})
    return doc


@api.post('/shifts/end')
async def end_shift(request: Request, session_token: Optional[str] = Cookie(default=None)):
    session = await get_session(request, session_token)
    if not session or session['user_type'] != 'concierge':
        raise HTTPException(403, 'Concierge access required.')
    now = datetime.now(timezone.utc)
    result = await db.shifts.update_one(
        {'concierge_id': session['user_id'], 'status': 'active'},
        {'$set': {'status': 'completed', 'clock_out': now}}
    )
    if result.matched_count == 0:
        raise HTTPException(404, 'No active shift.')
    return {'message': 'Shift ended.', 'clock_out': now.isoformat()}


def _iso(doc: dict, *fields):
    for f in fields:
        if isinstance(doc.get(f), datetime):
            doc[f] = doc[f].isoformat()


def _as_dt(value):
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    try:
        d = datetime.fromisoformat(str(value)) if value else None
    except ValueError:
        return None
    return d.replace(tzinfo=timezone.utc) if d and not d.tzinfo else d


# A shift nobody ended is closed automatically, so a report left open on
# Saturday never shows as today's live shift. Concierge shifts here run 8 to
# 12 hours; a double is 16, so anything older than that was forgotten.
MAX_SHIFT_HOURS = float(os.environ.get('MAX_SHIFT_HOURS', '16'))


async def _last_activity(shift: dict) -> Optional[datetime]:
    sid = shift['shift_id']
    times = []
    async for t in db.tasks.find({'$or': [{'shift_id': sid}, {'completed_shift_id': sid}]}, {'created_at': 1, 'completed_at': 1, 'declined_at': 1}):
        times += [_as_dt(t.get(k)) for k in ('created_at', 'completed_at', 'declined_at')]
    async for i in db.incidents.find({'shift_id': sid}, {'created_at': 1}):
        times.append(_as_dt(i.get('created_at')))
    times = [t for t in times if t]
    return max(times) if times else None


async def close_shift(shift: dict, reason: str, closed_by: str = '', when: Optional[datetime] = None) -> datetime:
    """Ends a shift that the concierge did not end themselves."""
    clock_in = _as_dt(shift.get('clock_in')) or datetime.now(timezone.utc)
    if when is None:
        # The shift really ended around the last thing that was logged.
        last = await _last_activity(shift)
        when = min(last or clock_in + timedelta(hours=MAX_SHIFT_HOURS), clock_in + timedelta(hours=MAX_SHIFT_HOURS))
        when = max(when, clock_in)
    await db.shifts.update_one(
        {'shift_id': shift['shift_id'], 'status': 'active'},
        {'$set': {'status': 'completed', 'clock_out': when, 'closed_reason': reason, 'closed_by': closed_by}},
    )
    await _audit(shift.get('manager_id', ''), closed_by or 'system', 'manager' if reason == 'manager' else 'system',
                 'clock_out', 'shift', shift['shift_id'], {'closed_reason': reason, 'concierge': shift.get('concierge_name', '')})
    return when


async def close_stale_shifts(query: dict):
    """Closes every active shift matching `query` that has run past the limit."""
    cutoff = datetime.now(timezone.utc) - timedelta(hours=MAX_SHIFT_HOURS)
    async for shift in db.shifts.find({**query, 'status': 'active'}, {'_id': 0}):
        started = _as_dt(shift.get('clock_in'))
        if started and started < cutoff:
            await close_shift(shift, 'auto')


async def _not_done_on_shift(shift: dict, mgr_id: str) -> list:
    """Tasks given to the desk that were still open when this shift ended. The
    report says so, whoever added the task, so the manager can see what was missed."""
    clock_out = _as_dt(shift.get('clock_out'))
    if shift.get('status') != 'completed' or not clock_out:
        return []
    cid = shift.get('concierge_id')
    rows = await db.tasks.find({
        'manager_id': mgr_id,
        # work handed to the desk: manager requests, follow-ups and resident requests
        'created_by_type': {'$in': ['manager', 'resident']},
        'status': {'$ne': 'declined'},
        '$or': [
            # a scheduled task picked up on this shift
            {'source_section': 'scheduled', 'shift_id': shift['shift_id']},
            # a task assigned to this person, or to whoever is at the desk
            {'source_section': {'$nin': ['scheduled', 'resident']}, 'assigned_to_id': {'$in': [cid, '', None]}},
            # a resident's request is the whole desk's until it is dealt with
            {'source_section': 'resident'},
        ],
    }, {'_id': 0}).to_list(500)
    out = []
    for t in rows:
        created = _as_dt(t.get('created_at'))
        finished = _as_dt(t.get('completed_at')) if t.get('status') == 'completed' else None
        if created and created > clock_out:
            continue  # added after this shift was over
        if finished and finished <= clock_out:
            continue  # done in time
        t['not_done'] = True
        t['status'] = 'not_done'
        t['assigned_at'] = t.get('created_at')
        t['created_at'] = clock_out
        t['notes'] = ''
        out.append(t)
    return out


async def _shift_activities(shift_id: str, mgr_id: str, shift: Optional[dict] = None):
    """What was actually done on a shift: everything the concierge logged, plus
    manager requests and scheduled tasks they completed during it. Requests that
    are still waiting are not activity yet; once the shift ends, the ones still
    open are listed as not done."""
    tasks = await db.tasks.find(
        {'manager_id': mgr_id, '$or': [{'shift_id': shift_id}, {'completed_shift_id': shift_id}]},
        {'_id': 0},
    ).sort('created_at', 1).to_list(500)
    done = []
    for t in tasks:
        from_manager = t.get('created_by_type') in ('manager', 'resident')
        if from_manager and t.get('status') != 'completed':
            continue
        if from_manager and t.get('completed_at'):
            # A request belongs in the report at the time it was finished, not assigned.
            t['assigned_at'] = t.get('created_at')
            t['created_at'] = t['completed_at']
            if t.get('completion_note'):
                t['notes'] = t['completion_note']
        _iso(t, 'created_at', 'completed_at', 'assigned_at', 'declined_at')
        done.append(t)
    if shift:
        seen = {t['task_id'] for t in done}
        for t in await _not_done_on_shift(shift, mgr_id):
            if t['task_id'] not in seen:
                _iso(t, 'created_at', 'completed_at', 'assigned_at', 'declined_at')
                done.append(t)
    done.sort(key=lambda t: str(t.get('created_at') or ''))
    incidents = await db.incidents.find({'shift_id': shift_id, 'manager_id': mgr_id}, {'_id': 0}).sort('created_at', 1).to_list(200)
    for i in incidents:
        _iso(i, 'created_at')
    return done, incidents


@api.get('/shifts/active')
async def get_active_shift(request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    await close_stale_shifts({'manager_id': mgr_id})
    if user_type == 'concierge':
        shift = await db.shifts.find_one({'concierge_id': user['concierge_id'], 'status': 'active'}, {'_id': 0})
        if not shift:
            return {'shift': None}
        _iso(shift, 'clock_in', 'created_at')
        tasks, incidents = await _shift_activities(shift['shift_id'], mgr_id, shift)
        shift['activities'] = tasks
        shift['incidents']  = incidents
        return {'shift': shift}
    else:
        shifts = await db.shifts.find({'manager_id': mgr_id, 'status': 'active'}, {'_id': 0}).sort('clock_in', -1).to_list(20)
        for s in shifts:
            _iso(s, 'clock_in', 'created_at')
            tasks, incidents = await _shift_activities(s['shift_id'], mgr_id, s)
            s['activities'] = tasks
            s['incidents']  = incidents
        return {'shifts': shifts}


@api.get('/shifts/previous')
async def get_previous_shift(request: Request, session_token: Optional[str] = Cookie(default=None)):
    """The most recent finished shift at the property, whoever worked it, so the
    person coming on reads the handoff the last person actually left."""
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    await close_stale_shifts({'manager_id': mgr_id})
    shift = await db.shifts.find_one(
        {'manager_id': mgr_id, 'status': 'completed'},
        {'_id': 0},
        sort=[('clock_out', -1)]
    )
    if not shift:
        return {'shift': None}
    _iso(shift, 'clock_in', 'clock_out', 'created_at')
    tasks, incidents = await _shift_activities(shift['shift_id'], mgr_id, shift)
    shift['activities'] = tasks
    shift['incidents']  = incidents
    return {'shift': shift}


@api.get('/shifts/history')
async def get_shift_history(request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    await close_stale_shifts({'manager_id': mgr_id})
    if user_type == 'concierge':
        query = {'concierge_id': user['concierge_id'], 'manager_id': mgr_id}
    else:
        query = {'manager_id': mgr_id}
    raw_shifts = await db.shifts.find(query, {'_id': 0}).sort('clock_in', -1).to_list(200)
    enriched = []
    for s in raw_shifts:
        _iso(s, 'clock_in', 'clock_out', 'created_at')
        tasks, incidents = await _shift_activities(s['shift_id'], mgr_id, s)
        enriched.append({**s, 'activities': tasks, 'incidents': incidents})
    return {'shifts': enriched}


class ShiftHandoverRequest(BaseModel):
    handover_notes: str = ''
    open_items:     Optional[List[str]] = []

@api.post('/shifts/handover')
async def shift_handover(data: ShiftHandoverRequest, request: Request, session_token: Optional[str] = Cookie(default=None)):
    session = await get_session(request, session_token)
    if not session or session['user_type'] != 'concierge':
        raise HTTPException(403, 'Concierge access required.')
    now = datetime.now(timezone.utc)
    result = await db.shifts.update_one(
        {'concierge_id': session['user_id'], 'status': 'active'},
        {'$set': {
            'status':          'completed',
            'clock_out':       now,
            'handover_notes':  data.handover_notes.strip(),
            'open_items':      data.open_items or [],
        }}
    )
    if result.matched_count == 0:
        raise HTTPException(404, 'No active shift to hand over.')
    shift = await db.shifts.find_one({'concierge_id': session['user_id'], 'status': 'completed'}, {'_id': 0}, sort=[('clock_out', -1)])
    mgr_id = (shift or {}).get('manager_id', '')
    await _audit(mgr_id, session['user_id'], 'concierge', 'clock_out', 'shift',
                 (shift or {}).get('shift_id', ''), {'handover_notes': data.handover_notes[:200]})
    return {'message': 'Shift closed with handover notes.', 'clock_out': now.isoformat()}


@api.post('/shifts/{shift_id}/end')
async def manager_end_shift(shift_id: str, request: Request, session_token: Optional[str] = Cookie(default=None)):
    """Lets the manager close a shift the concierge forgot to end."""
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if user_type != 'manager':
        raise HTTPException(403, 'Manager access required.')
    shift = await db.shifts.find_one({'shift_id': shift_id, 'manager_id': mgr_id}, {'_id': 0})
    if not shift:
        raise HTTPException(404, 'Shift not found.')
    if shift.get('status') != 'active':
        raise HTTPException(409, 'This shift has already ended.')
    when = await close_shift(shift, 'manager', mgr_id, datetime.now(timezone.utc))
    return {'message': 'Shift ended.', 'clock_out': when.isoformat()}
