"""Tasks and recurring scheduled tasks."""
import hashlib
import uuid
from datetime import date, datetime, timezone
from fastapi import APIRouter, Cookie, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
from core import TaskCreate, TaskUpdate, _audit, _resolve_user, db
from notifications import _notify_task_assigned

api = APIRouter(prefix='/api')

def _parse_schedule_date(value: Optional[str], field_name: str) -> Optional[date]:
    if not value:
        return None
    try:
        return date.fromisoformat(value)
    except ValueError:
        raise HTTPException(422, f'{field_name} must use YYYY-MM-DD format.')


def _validate_schedule_fields(start_date: Optional[str], end_date: Optional[str],
                              scheduled_time: Optional[str], days_of_week: Optional[List[int]]):
    start = _parse_schedule_date(start_date, 'start_date')
    end = _parse_schedule_date(end_date, 'end_date')
    if start and end and end < start:
        raise HTTPException(422, 'End date must be on or after start date.')
    if scheduled_time:
        try:
            datetime.strptime(scheduled_time, '%H:%M')
        except ValueError:
            raise HTTPException(422, 'scheduled_time must use 24-hour HH:MM format.')
    if days_of_week is not None and any(day not in range(7) for day in days_of_week):
        raise HTTPException(422, 'days_of_week values must be between 0 (Monday) and 6 (Sunday).')


async def _materialize_scheduled_tasks(concierge: dict, shift_id: Optional[str] = None):
    """Create today's concierge-specific occurrences once, preserving per-day completion."""
    now = datetime.now(timezone.utc)
    today = now.date()
    schedules = await db.scheduled_tasks.find({
        'manager_id': concierge['manager_id'],
        'active': True,
    }, {'_id': 0}).to_list(500)

    for schedule in schedules:
        assigned_id = schedule.get('assigned_concierge_id') or schedule.get('assigned_to_id') or ''
        if assigned_id and assigned_id != concierge['concierge_id']:
            continue
        start = _parse_schedule_date(schedule.get('start_date'), 'start_date')
        end = _parse_schedule_date(schedule.get('end_date'), 'end_date')
        if start and today < start or end and today > end:
            continue
        days = schedule.get('days_of_week')
        if days is not None and today.weekday() not in days:
            continue

        scheduled_time = schedule.get('scheduled_time')
        if not scheduled_time:
            scheduled_time = f"{int(schedule.get('scheduled_hour', 8)):02d}:00"
        occurrence_key = f"{schedule['scheduled_task_id']}:{concierge['concierge_id']}:{today.isoformat()}"
        task_id = f"task_{hashlib.sha256(occurrence_key.encode()).hexdigest()[:12]}"
        task_doc = {
            'task_id': task_id,
            'manager_id': concierge['manager_id'],
            'shift_id': shift_id,
            'scheduled_task_id': schedule['scheduled_task_id'],
            'schedule_occurrence_key': occurrence_key,
            'occurrence_date': today.isoformat(),
            'title': schedule['title'],
            'notes': schedule.get('notes', ''),
            'category': schedule.get('category', 'Administrative'),
            'priority': schedule.get('priority', 'Standard'),
            'assigned_to': f"{concierge['first_name']} {concierge['last_name']}",
            'assigned_to_id': concierge['concierge_id'],
            'due_time': scheduled_time,
            'scheduled_time': scheduled_time,
            'status': 'pending',
            'created_by_type': 'manager',
            'source_section': 'scheduled',
            'requires_photo': False,
            'created_at': now,
        }
        await db.tasks.update_one(
            {'schedule_occurrence_key': occurrence_key},
            {'$setOnInsert': task_doc, '$set': {'shift_id': shift_id} if shift_id else {}},
            upsert=True,
        )


@api.get('/tasks')
async def get_tasks(request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    query = {'manager_id': mgr_id}
    if user_type == 'concierge':
        active_shift = await db.shifts.find_one({'concierge_id': user['concierge_id'], 'status': 'active'}, {'shift_id': 1})
        await _materialize_scheduled_tasks(user, (active_shift or {}).get('shift_id'))
        # concierge only sees tasks assigned to them (by id or name)
        cid = user['concierge_id']
        cname = f"{user['first_name']} {user['last_name']}"
        query = {
            'manager_id': mgr_id,
            '$and': [
                {'$or': [{'assigned_to_id': cid}, {'assigned_to': {'$regex': cname.split()[0], '$options': 'i'}}]},
                {'$or': [{'source_section': {'$ne': 'scheduled'}}, {'occurrence_date': datetime.now(timezone.utc).date().isoformat()}]},
            ],
        }
    tasks = await db.tasks.find(query, {'_id': 0}).sort('created_at', -1).to_list(200)
    return {'tasks': tasks}


@api.post('/tasks')
async def create_task(task: TaskCreate, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    # Auto-tag with active shift if concierge
    shift_id = None
    if user_type == 'concierge':
        active = await db.shifts.find_one({'concierge_id': user['concierge_id'], 'status': 'active'}, {'shift_id': 1})
        if active:
            shift_id = active['shift_id']
    task_id = f'task_{uuid.uuid4().hex[:12]}'
    doc = {
        'task_id':         task_id,
        'manager_id':      mgr_id,
        'shift_id':        shift_id,
        'title':           task.title,
        'notes':           task.notes or task.description or '',
        'category':        task.category or 'Other',
        'priority':        task.priority,
        'status':          'pending',
        'requires_photo':  task.requires_photo,
        'assigned_to':     task.assigned_to,
        'assigned_to_id':  task.assigned_to_id,
        'source_section':   task.source_section or ('requests' if user_type == 'manager' else 'new-task'),
        'due_time':        task.due_time or task.scheduled_time or 'ASAP',
        'completion_note': None,
        'evidence_url':    None,
        'created_by':      user['manager_id'] if user_type == 'manager' else user['concierge_id'],
        'created_by_name': f"{user['first_name']} {user['last_name']}",
        'created_by_type': user_type,
        'created_at':      datetime.now(timezone.utc),
    }
    await db.tasks.insert_one(doc)
    doc.pop('_id', None)
    doc['created_at'] = doc['created_at'].isoformat()
    await _audit(mgr_id, user.get('manager_id') or user.get('concierge_id', ''), user_type,
                 'create', 'task', doc['task_id'], {'title': task.title, 'assigned_to': task.assigned_to})
    # Notify assigned concierge by email when manager creates a task
    if user_type == 'manager' and task.assigned_to_id:
        concierge = await db.concierges.find_one({'concierge_id': task.assigned_to_id})
        if concierge:
            await _notify_task_assigned(doc, user, concierge)
    return doc


@api.put('/tasks/{task_id}')
async def update_task(task_id: str, update: TaskUpdate, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    patch = {}
    if update.status:          patch['status']          = update.status
    if update.completion_note: patch['completion_note'] = update.completion_note
    if update.evidence_url:    patch['evidence_url']    = update.evidence_url
    if update.status == 'completed':
        patch['completed_at']        = datetime.now(timezone.utc)
        patch['completed_by_name']   = f"{user['first_name']} {user['last_name']}"
    result = await db.tasks.update_one({'task_id': task_id, 'manager_id': mgr_id}, {'$set': patch})
    if result.matched_count == 0:
        raise HTTPException(404, 'Task not found.')
    updated = await db.tasks.find_one({'task_id': task_id}, {'_id': 0})
    for f in ('created_at', 'completed_at'):
        if isinstance(updated.get(f), datetime):
            updated[f] = updated[f].isoformat()
    return updated


class ScheduledTaskCreate(BaseModel):
    title:                   str
    notes:                   Optional[str] = ''
    category:                Optional[str] = 'Administrative'
    priority:                Optional[str] = 'Standard'
    recurrence:              str = 'shift_start'   # 'shift_start' | 'daily'
    scheduled_hour:          Optional[int] = 8     # For 'daily' — hour in 24h (local)
    shift_window:            Optional[str] = 'all' # 'all' | 'morning' | 'afternoon' | 'night'
    assigned_concierge_id:   Optional[str] = ''    # empty = all concierges
    assigned_concierge_name: Optional[str] = ''
    assigned_to:             Optional[str] = ''
    assigned_to_id:          Optional[str] = ''
    start_date:              Optional[str] = None
    end_date:                Optional[str] = None
    scheduled_time:          Optional[str] = '08:00'
    days_of_week:            Optional[List[int]] = None  # Monday=0 ... Sunday=6
    active:                  bool = True

class ScheduledTaskUpdate(BaseModel):
    active: Optional[bool] = None
    title: Optional[str] = None
    notes: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None
    recurrence: Optional[str] = None
    scheduled_hour: Optional[int] = None
    scheduled_time: Optional[str] = None
    shift_window: Optional[str] = None
    assigned_concierge_id: Optional[str] = None
    assigned_concierge_name: Optional[str] = None
    assigned_to: Optional[str] = None
    assigned_to_id: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    days_of_week: Optional[List[int]] = None


@api.get('/scheduled-tasks')
async def list_scheduled_tasks(request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if user_type != 'manager':
        raise HTTPException(403, 'Manager access required.')
    docs = await db.scheduled_tasks.find({'manager_id': mgr_id}, {'_id': 0}).sort('created_at', -1).to_list(500)
    for d in docs:
        if isinstance(d.get('created_at'), datetime): d['created_at'] = d['created_at'].isoformat()
    return {'scheduled_tasks': docs}

@api.post('/scheduled-tasks')
async def create_scheduled_task(data: ScheduledTaskCreate, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if user_type != 'manager':
        raise HTTPException(403, 'Manager access required.')
    _validate_schedule_fields(data.start_date, data.end_date, data.scheduled_time, data.days_of_week)
    task_id = f'sched_{uuid.uuid4().hex[:12]}'
    now = datetime.now(timezone.utc)
    doc = {
        'scheduled_task_id':      task_id,
        'manager_id':             mgr_id,
        'title':                  data.title,
        'notes':                  data.notes or '',
        'category':               data.category or 'Administrative',
        'priority':               data.priority or 'Standard',
        'recurrence':             data.recurrence,
        'scheduled_hour':         data.scheduled_hour,
        'shift_window':           data.shift_window or 'all',
        'assigned_concierge_id':  data.assigned_concierge_id or '',
        'assigned_concierge_name':data.assigned_concierge_name or '',
        'assigned_to':            data.assigned_to or '',
        'assigned_to_id':         data.assigned_to_id or '',
        'start_date':             data.start_date,
        'end_date':               data.end_date,
        'scheduled_time':         data.scheduled_time or f"{int(data.scheduled_hour or 8):02d}:00",
        'days_of_week':           data.days_of_week if data.days_of_week is not None else list(range(7)),
        'active':                 data.active,
        'created_at':             now,
    }
    await db.scheduled_tasks.insert_one(doc)
    doc.pop('_id', None)
    doc['created_at'] = now.isoformat()
    await _audit(mgr_id, user['manager_id'], 'manager', 'create', 'scheduled_task', task_id, {'title': data.title})
    return doc

@api.put('/scheduled-tasks/{task_id}')
async def update_scheduled_task(task_id: str, data: ScheduledTaskUpdate, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if user_type != 'manager':
        raise HTTPException(403, 'Manager access required.')
    patch = {k: v for k, v in data.dict().items() if v is not None}
    if not patch:
        raise HTTPException(400, 'Nothing to update.')
    existing = await db.scheduled_tasks.find_one({'scheduled_task_id': task_id, 'manager_id': mgr_id})
    if not existing:
        raise HTTPException(404, 'Scheduled request not found.')
    _validate_schedule_fields(
        patch.get('start_date', existing.get('start_date')),
        patch.get('end_date', existing.get('end_date')),
        patch.get('scheduled_time', existing.get('scheduled_time')),
        patch.get('days_of_week', existing.get('days_of_week')),
    )
    await db.scheduled_tasks.update_one({'scheduled_task_id': task_id, 'manager_id': mgr_id}, {'$set': patch})
    doc = await db.scheduled_tasks.find_one({'scheduled_task_id': task_id}, {'_id': 0})
    if doc and isinstance(doc.get('created_at'), datetime):
        doc['created_at'] = doc['created_at'].isoformat()
    return doc or {}

@api.delete('/scheduled-tasks/{task_id}')
async def delete_scheduled_task(task_id: str, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if user_type != 'manager':
        raise HTTPException(403, 'Manager access required.')
    await db.scheduled_tasks.delete_one({'scheduled_task_id': task_id, 'manager_id': mgr_id})
    await _audit(mgr_id, user['manager_id'], 'manager', 'delete', 'scheduled_task', task_id, {})
    return {'message': 'Deleted.'}
