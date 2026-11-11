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
        if isinstance(existing.get('clock_in'), datetime):
            existing['clock_in'] = existing['clock_in'].isoformat()
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


async def _shift_activities(shift_id: str, mgr_id: str):
    tasks = await db.tasks.find({'shift_id': shift_id, 'manager_id': mgr_id}, {'_id': 0}).sort('created_at', 1).to_list(500)
    incidents = await db.incidents.find({'shift_id': shift_id, 'manager_id': mgr_id}, {'_id': 0}).sort('created_at', 1).to_list(200)
    for t in tasks:
        if isinstance(t.get('created_at'), datetime): t['created_at'] = t['created_at'].isoformat()
    for i in incidents:
        if isinstance(i.get('created_at'), datetime): i['created_at'] = i['created_at'].isoformat()
    return tasks, incidents


@api.get('/shifts/active')
async def get_active_shift(request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if user_type == 'concierge':
        shift = await db.shifts.find_one({'concierge_id': user['concierge_id'], 'status': 'active'}, {'_id': 0})
        if not shift:
            return {'shift': None}
        if isinstance(shift.get('clock_in'), datetime): shift['clock_in'] = shift['clock_in'].isoformat()
        tasks, incidents = await _shift_activities(shift['shift_id'], mgr_id)
        shift['activities'] = tasks
        shift['incidents']  = incidents
        return {'shift': shift}
    else:
        shifts = await db.shifts.find({'manager_id': mgr_id, 'status': 'active'}, {'_id': 0}).to_list(20)
        for s in shifts:
            if isinstance(s.get('clock_in'), datetime): s['clock_in'] = s['clock_in'].isoformat()
            tasks, incidents = await _shift_activities(s['shift_id'], mgr_id)
            s['activities'] = tasks
            s['incidents']  = incidents
        return {'shifts': shifts}


@api.get('/shifts/previous')
async def get_previous_shift(request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if user_type != 'concierge':
        raise HTTPException(403, 'Concierge access required.')
    shift = await db.shifts.find_one(
        {'concierge_id': user['concierge_id'], 'status': 'completed'},
        {'_id': 0},
        sort=[('clock_out', -1)]
    )
    if not shift:
        return {'shift': None}
    if isinstance(shift.get('clock_in'),  datetime): shift['clock_in']  = shift['clock_in'].isoformat()
    if isinstance(shift.get('clock_out'), datetime): shift['clock_out'] = shift['clock_out'].isoformat()
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
        if isinstance(s.get('clock_in'),  datetime): s['clock_in']  = s['clock_in'].isoformat()
        if isinstance(s.get('clock_out'), datetime): s['clock_out'] = s['clock_out'].isoformat()
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
