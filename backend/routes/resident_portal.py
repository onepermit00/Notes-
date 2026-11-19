"""The resident app: send a noise complaint, a work order or another report,
and follow it until the front desk has dealt with it.

Every request is stored once, as a task in the desk's To do, so the concierge,
the manager and the day's report all read the same record. Residents only ever
get their own requests back, and only the parts written for them."""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Cookie, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
from core import _audit, _check_rate_limit, _resolve_user, db

api = APIRouter(prefix='/api/resident')

REQUEST_TYPES = {
    'noise':      'Noise complaint',
    'work_order': 'Work order',
    'report':     'Report',
}

# Standard work order priorities in residential property management.
WORK_ORDER_URGENCY = {
    'emergency': 'Emergency',   # risk to people or the building: flooding, no heat, gas smell, sparks, locked out of utilities
    'urgent':    'Urgent',      # stops normal use of the home: no hot water, fridge out, toilet blocked (only one)
    'routine':   'Routine',     # everything else
}
WORK_ORDER_CATEGORIES = ('Plumbing', 'Electrical', 'Heating & cooling', 'Appliance', 'Doors, locks & windows',
                         'Pest control', 'Walls, floors & ceilings', 'Other')
NOISE_KINDS = ('Music or TV', 'Voices or party', 'Footsteps or banging', 'Pet', 'Construction or repairs', 'Other')
REPORT_KINDS = ('Common area problem', 'Safety or security concern', 'Lost or found item', 'Parking', 'Other')

# What a resident sees for each status. "Seen" is the first time staff open it.
STATUS_FOR_RESIDENT = {
    'pending':     'Received',
    'in_progress': 'In progress',
    'completed':   'Resolved',
    'declined':    'Closed',
}

MAX_PHOTOS = 4
MAX_PHOTO_CHARS = 2_500_000   # a phone photo after the app shrinks it is far smaller


class ResidentRequestCreate(BaseModel):
    request_type: str                    # noise | work_order | report
    description:  str
    kind:         Optional[str] = ''     # noise kind, work order category or report kind
    location:     Optional[str] = ''     # where: a unit, "hallway", "kitchen sink"...
    happening_now: Optional[bool] = None # noise
    urgency:      Optional[str] = None   # work orders: emergency | urgent | routine
    permission_to_enter: Optional[bool] = None
    pets:         Optional[str] = ''
    best_time:    Optional[str] = ''
    photos:       Optional[List[str]] = None


def _iso(value):
    return value.isoformat() if isinstance(value, datetime) else value


def public_view(task: dict) -> dict:
    """The resident's own copy of a request. Staff names, staff notes and
    anything about other residents are left out on purpose."""
    req = task.get('resident_request') or {}
    timeline = [
        {'at': _iso(e.get('at')), 'event': e.get('event')}
        for e in task.get('timeline') or [] if e.get('event') in ('sent', 'seen', 'started', 'resolved', 'closed')
    ]
    return {
        'request_id':    task['task_id'],
        'request_type':  req.get('request_type', ''),
        'type_label':    REQUEST_TYPES.get(req.get('request_type'), 'Request'),
        'kind':          req.get('kind', ''),
        'location':      req.get('location', ''),
        'description':   req.get('description', ''),
        'happening_now': req.get('happening_now'),
        'urgency':       req.get('urgency'),
        'permission_to_enter': req.get('permission_to_enter'),
        'pets':          req.get('pets', ''),
        'best_time':     req.get('best_time', ''),
        'photos':        task.get('request_photos') or [],
        'unit':          task.get('unit', ''),
        'status':        task.get('status', 'pending'),
        'status_label':  STATUS_FOR_RESIDENT.get(task.get('status'), 'Received'),
        'reply':         task.get('resident_reply') or '',
        'reference':     task['task_id'].replace('task_', '')[:6].upper(),
        'created_at':    _iso(task.get('created_at')),
        'updated_at':    _iso((task.get('timeline') or [{}])[-1].get('at') or task.get('created_at')),
        'timeline':      timeline,
    }


WORK_ORDER_STATUS_FOR_RESIDENT = {
    'open':        'Received',
    'in_progress': 'In progress',
    'on_hold':     'On hold',
    'completed':   'Resolved',
    'cancelled':   'Closed',
}
# Which steps of a work order the resident sees. Staff notes stay with staff.
WORK_ORDER_EVENTS_FOR_RESIDENT = {'sent': 'sent', 'opened': 'sent', 'seen': 'seen', 'started': 'started',
                                  'on_hold': 'on_hold', 'completed': 'completed', 'resolved': 'resolved',
                                  'cancelled': 'closed', 'reopened': 'reopened'}


def work_order_view(wo: dict) -> dict:
    """The resident's own copy of a work order, in the same shape as a request."""
    timeline = [
        {'at': _iso(e.get('at')), 'event': WORK_ORDER_EVENTS_FOR_RESIDENT[e['event']]}
        for e in wo.get('timeline') or [] if e.get('event') in WORK_ORDER_EVENTS_FOR_RESIDENT
    ]
    status = wo.get('status', 'open')
    return {
        'request_id':    wo['work_order_id'],
        'request_type':  'work_order',
        'type_label':    REQUEST_TYPES['work_order'],
        'number':        wo.get('number'),
        'kind':          wo.get('category', ''),
        'location':      wo.get('location', ''),
        'description':   wo.get('description', ''),
        'happening_now': None,
        'urgency':       wo.get('urgency'),
        'permission_to_enter': wo.get('permission_to_enter'),
        'pets':          wo.get('pets', ''),
        'best_time':     wo.get('best_time', ''),
        'photos':        wo.get('photos') or [],
        'unit':          wo.get('unit', ''),
        'status':        status,
        'status_label':  WORK_ORDER_STATUS_FOR_RESIDENT.get(status, 'Received'),
        # "Waiting on parts" helps the resident; the rest of maintenance's notes stay internal.
        'hold_reason':   wo.get('hold_reason', '') if status == 'on_hold' else '',
        'reply':         wo.get('resident_reply') or '',
        'reference':     str(wo.get('number') or wo['work_order_id'][3:9].upper()),
        'created_at':    _iso(wo.get('created_at')),
        'updated_at':    _iso((wo.get('timeline') or [{}])[-1].get('at') or wo.get('created_at')),
        'timeline':      timeline,
    }


def _staff_title(req: dict, unit: str) -> str:
    kind = (req.get('kind') or '').strip()
    where = (req.get('location') or '').strip()
    if req['request_type'] == 'noise':
        parts = [f'Noise complaint · Unit {unit}']
        if kind and kind != 'Other':
            parts.append(kind)
        if where:
            parts.append(f'coming from {where}')
        return ' · '.join(parts)
    if req['request_type'] == 'work_order':
        label = WORK_ORDER_URGENCY.get(req.get('urgency') or 'routine', 'Routine')
        return f'Work order ({label.lower()}) · Unit {unit} · {kind or "Repair"}'
    return f'Report · Unit {unit} · {kind or "Something to look at"}'


def _staff_notes(req: dict) -> str:
    lines = [req['description'].strip()]
    details = []
    if req.get('location'):
        details.append(f"Where: {req['location']}")
    if req['request_type'] == 'noise' and req.get('happening_now') is not None:
        details.append('Happening now' if req['happening_now'] else 'Not happening right now')
    if req['request_type'] == 'work_order':
        if req.get('permission_to_enter') is not None:
            details.append('OK to enter if no one is home' if req['permission_to_enter'] else 'Do not enter unless someone is home')
        if req.get('pets'):
            details.append(f"Pets: {req['pets']}")
        if req.get('best_time'):
            details.append(f"Best time: {req['best_time']}")
    if req['request_type'] == 'noise':
        details.append('Keep who complained confidential')
    return '\n'.join(lines + ([' · '.join(details)] if details else []))


def _clean_photos(photos: Optional[List[str]]) -> List[str]:
    out = []
    for p in (photos or [])[:MAX_PHOTOS]:
        if not isinstance(p, str) or not p.startswith('data:image/'):
            raise HTTPException(400, 'Photos must be images.')
        if len(p) > MAX_PHOTO_CHARS:
            raise HTTPException(413, 'One of the photos is too large. Try a smaller one.')
        out.append(p)
    return out


async def _resident(request, session_token):
    user, user_type, mgr_id = await _resolve_user(request, session_token, allow=('resident',))
    return user, mgr_id


@api.get('/home')
async def resident_home(request: Request, session_token: Optional[str] = Cookie(default=None)):
    """Everything the resident app's home screen needs."""
    user, mgr_id = await _resident(request, session_token)
    manager = await db.managers.find_one({'manager_id': mgr_id}) or {}
    emergency = await db.contacts.find(
        {'manager_id': mgr_id, 'category': 'Emergency services'}, {'_id': 0, 'label': 1, 'number': 1},
    ).to_list(20)
    return {
        'name':          user.get('name', ''),
        'unit':          user.get('unit', ''),
        'email':         user.get('email', ''),
        'property_name': manager.get('property_name', ''),
        'front_desk_email': manager.get('front_desk_email') or manager.get('email', ''),
        'front_desk_phone': manager.get('front_desk_phone') or '',
        'emergency_contacts': emergency,
        'options': {
            'noise_kinds':          list(NOISE_KINDS),
            'work_order_categories': list(WORK_ORDER_CATEGORIES),
            'report_kinds':         list(REPORT_KINDS),
        },
    }


@api.get('/requests')
async def my_requests(request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, mgr_id = await _resident(request, session_token)
    rows = await db.tasks.find(
        {'manager_id': mgr_id, 'resident_id': user['resident_id'], 'source_section': 'resident'}, {'_id': 0},
    ).sort('created_at', -1).to_list(200)
    orders = await db.work_orders.find(
        {'manager_id': mgr_id, 'resident_id': user['resident_id']}, {'_id': 0},
    ).sort('created_at', -1).to_list(200)
    out = [public_view(t) for t in rows] + [work_order_view(w) for w in orders]
    out.sort(key=lambda r: str(r.get('created_at') or ''), reverse=True)
    return {'requests': out}


@api.get('/requests/{request_id}')
async def my_request(request_id: str, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, mgr_id = await _resident(request, session_token)
    if request_id.startswith('wo_'):
        wo = await db.work_orders.find_one({'work_order_id': request_id, 'manager_id': mgr_id,
                                            'resident_id': user['resident_id']}, {'_id': 0})
        if not wo:
            raise HTTPException(404, 'Request not found.')
        return work_order_view(wo)
    task = await db.tasks.find_one({'task_id': request_id, 'manager_id': mgr_id, 'resident_id': user['resident_id'],
                                    'source_section': 'resident'}, {'_id': 0})
    if not task:
        raise HTTPException(404, 'Request not found.')
    return public_view(task)


@api.post('/requests')
async def send_request(data: ResidentRequestCreate, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, mgr_id = await _resident(request, session_token)
    if data.request_type not in REQUEST_TYPES:
        raise HTTPException(422, 'Choose noise complaint, work order or report.')
    description = (data.description or '').strip()
    if len(description) < 3:
        raise HTTPException(400, 'Tell us a little about what is happening.')
    urgency = None
    if data.request_type == 'work_order':
        urgency = data.urgency if data.urgency in WORK_ORDER_URGENCY else 'routine'
    photos = _clean_photos(data.photos)
    # Enough for a real problem, not enough to flood the desk.
    await _check_rate_limit(f"resident-request:{user['resident_id']}", 6, 15)

    if data.request_type == 'work_order':
        # A work order goes straight to maintenance; the desk gets a task to make sure it was picked up.
        from routes.maintenance import WorkOrderCreate, create_work_order
        wo = await create_work_order(mgr_id, user, 'resident', WorkOrderCreate(
            unit=user.get('unit', ''), location=data.location or '', category=data.kind or '',
            description=description, urgency=urgency, permission_to_enter=data.permission_to_enter,
            pets=data.pets or '', best_time=data.best_time or '', photos=photos,
        ), resident=user)
        return work_order_view(wo)

    now = datetime.now(timezone.utc)
    unit = user.get('unit', '')
    name = user.get('name', '') or 'A resident'
    req = {
        'request_type': data.request_type,
        'description':  description[:4000],
        'kind':         (data.kind or '').strip()[:80],
        'location':     (data.location or '').strip()[:120],
        'happening_now': data.happening_now if data.request_type == 'noise' else None,
        'urgency':      urgency,
        'permission_to_enter': data.permission_to_enter if data.request_type == 'work_order' else None,
        'pets':         (data.pets or '').strip()[:120] if data.request_type == 'work_order' else '',
        'best_time':    (data.best_time or '').strip()[:120] if data.request_type == 'work_order' else '',
    }
    urgent = urgency == 'emergency' or (data.request_type == 'noise' and data.happening_now)
    task_id = f'task_{uuid.uuid4().hex[:12]}'
    doc = {
        'task_id':          task_id,
        'manager_id':       mgr_id,
        'shift_id':         None,
        'title':            _staff_title(req, unit),
        'notes':            _staff_notes(req),
        'category':         'Resident Assist',
        'priority':         'Urgent' if urgent else 'Standard',
        'status':           'pending',
        'requires_photo':   False,
        'assigned_to':      '',
        'assigned_to_id':   '',
        'source_section':   'resident',
        'due_time':         'ASAP',
        'completion_note':  None,
        'evidence_url':     None,
        'evidence_urls':    [],
        'request_photos':   photos,
        'resident_id':      user['resident_id'],
        'resident_name':    name,
        'unit':             unit,
        'resident_request': req,
        'created_by':       user['resident_id'],
        'created_by_name':  name,
        'created_by_type':  'resident',
        'created_at':       now,
        'timeline':         [{'at': now, 'event': 'sent', 'by_type': 'resident', 'by_id': user['resident_id'], 'by_name': name}],
    }
    await db.tasks.insert_one(doc)
    doc.pop('_id', None)
    await _audit(mgr_id, user['resident_id'], 'resident', 'create', 'resident_request', task_id,
                 {'type': data.request_type, 'unit': unit})
    return public_view(doc)
