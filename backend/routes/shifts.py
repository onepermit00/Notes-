"""Shift clock-in/out, history and handover."""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Cookie, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
from core import _audit, _resolve_user, db, get_session
from routes.tasks import _materialize_scheduled_tasks

api = APIRouter(prefix='/api')

@api.post('/shifts/start')
async def start_shift(request: Request, session_token: Optional[str] = Cookie(default=None)):
    session = await get_session(request, session_token)
    if not session or session['user_type'] != 'concierge':
        raise HTTPException(403, 'Concierge access required.')
    concierge = await db.concierges.find_one({'concierge_id': session['user_id']})
    if not concierge:
        raise HTTPException(404, 'Concierge not found.')
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
    await _materialize_scheduled_tasks(concierge, shift_id)

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


async def _shift_activities(shift_id: str, mgr_id: str):
    """What was actually done on a shift: everything the concierge logged, plus
    manager requests and scheduled tasks they completed during it. Requests that
    are still waiting are not activity yet, so they stay out of the report."""
    tasks = await db.tasks.find(
        {'manager_id': mgr_id, '$or': [{'shift_id': shift_id}, {'completed_shift_id': shift_id}]},
        {'_id': 0},
    ).sort('created_at', 1).to_list(500)
    done = []
    for t in tasks:
        from_manager = t.get('created_by_type') == 'manager'
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
    done.sort(key=lambda t: str(t.get('created_at') or ''))
    incidents = await db.incidents.find({'shift_id': shift_id, 'manager_id': mgr_id}, {'_id': 0}).sort('created_at', 1).to_list(200)
    for i in incidents:
        _iso(i, 'created_at')
    return done, incidents


@api.get('/shifts/active')
async def get_active_shift(request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if user_type == 'concierge':
        shift = await db.shifts.find_one({'concierge_id': user['concierge_id'], 'status': 'active'}, {'_id': 0})
        if not shift:
            return {'shift': None}
        _iso(shift, 'clock_in', 'created_at')
        tasks, incidents = await _shift_activities(shift['shift_id'], mgr_id)
        shift['activities'] = tasks
        shift['incidents']  = incidents
        return {'shift': shift}
    else:
        shifts = await db.shifts.find({'manager_id': mgr_id, 'status': 'active'}, {'_id': 0}).sort('clock_in', -1).to_list(20)
        for s in shifts:
            _iso(s, 'clock_in', 'created_at')
            tasks, incidents = await _shift_activities(s['shift_id'], mgr_id)
            s['activities'] = tasks
            s['incidents']  = incidents
        return {'shifts': shifts}


@api.get('/shifts/previous')
async def get_previous_shift(request: Request, session_token: Optional[str] = Cookie(default=None)):
    """The most recent finished shift at the property, whoever worked it, so the
    person coming on reads the handoff the last person actually left."""
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    shift = await db.shifts.find_one(
        {'manager_id': mgr_id, 'status': 'completed'},
        {'_id': 0},
        sort=[('clock_out', -1)]
    )
    if not shift:
        return {'shift': None}
    _iso(shift, 'clock_in', 'clock_out', 'created_at')
    tasks, incidents = await _shift_activities(shift['shift_id'], mgr_id)
    shift['activities'] = tasks
    shift['incidents']  = incidents
    return {'shift': shift}


@api.get('/shifts/history')
async def get_shift_history(request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if user_type == 'concierge':
        query = {'concierge_id': user['concierge_id'], 'manager_id': mgr_id}
    else:
        query = {'manager_id': mgr_id}
    raw_shifts = await db.shifts.find(query, {'_id': 0}).sort('clock_in', -1).to_list(200)
    enriched = []
    for s in raw_shifts:
        _iso(s, 'clock_in', 'clock_out', 'created_at')
        tasks, incidents = await _shift_activities(s['shift_id'], mgr_id)
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
