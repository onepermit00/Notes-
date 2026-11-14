"""Tasks and recurring scheduled tasks."""
import calendar
import hashlib
import re
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


REPEATS = ('once', 'daily', 'days', 'weekly', 'monthly')
MAX_YEARS_AHEAD = 5


def _schedule_repeat(schedule: dict) -> str:
    """Older schedules have no repeat field: they ran on their chosen weekdays."""
    repeat = schedule.get('repeat')
    if repeat in REPEATS:
        return repeat
    days = schedule.get('days_of_week')
    return 'daily' if days is None or sorted(days) == list(range(7)) else 'days'


def occurs_on(schedule: dict, day: date) -> bool:
    """Whether a planned task is due on this day (the desk's local date)."""
    start = _parse_schedule_date(schedule.get('start_date'), 'start_date')
    end = _parse_schedule_date(schedule.get('end_date'), 'end_date')
    if start and day < start:
        return False
    repeat = _schedule_repeat(schedule)
    if repeat == 'once':
        return bool(start) and day == start
    if end and day > end:
        return False
    if repeat == 'daily':
        return True
    if repeat == 'days':
        return day.weekday() in (schedule.get('days_of_week') or [])
    if repeat == 'weekly':
        return bool(start) and day.weekday() == start.weekday()
    if repeat == 'monthly':
        if not start:
            return False
        last_day = calendar.monthrange(day.year, day.month)[1]
        return day.day == min(start.day, last_day)
    return False


def desk_day(value: Optional[str]) -> date:
    """The desk's own calendar date. The browser sends it because a property's
    evening is already tomorrow in UTC; anything more than a day off is ignored."""
    utc_today = datetime.now(timezone.utc).date()
    try:
        day = date.fromisoformat(value) if value else None
    except ValueError:
        day = None
    if day and abs((day - utc_today).days) <= 1:
        return day
    return utc_today


async def _materialize_scheduled_tasks(concierge: dict, shift_id: Optional[str] = None, day: Optional[date] = None):
    """Create the day's concierge-specific occurrences once, preserving per-day completion."""
    now = datetime.now(timezone.utc)
    today = day or now.date()
    schedules = await db.scheduled_tasks.find({
        'manager_id': concierge['manager_id'],
        'active': True,
    }, {'_id': 0}).to_list(500)

    for schedule in schedules:
        assigned_id = schedule.get('assigned_concierge_id') or schedule.get('assigned_to_id') or ''
        if assigned_id and assigned_id != concierge['concierge_id']:
            continue
        if not occurs_on(schedule, today):
            continue

        scheduled_time = schedule.get('scheduled_time')
        if not scheduled_time:
            scheduled_time = f"{int(schedule.get('scheduled_hour', 8)):02d}:00"
        occurrence_key = f"{schedule['scheduled_task_id']}:{concierge['concierge_id']}:{today.isoformat()}"
        task_id = f"task_{hashlib.sha256(occurrence_key.encode()).hexdigest()[:12]}"
        task_doc = {
            'task_id': task_id,
            'manager_id': concierge['manager_id'],
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
            'end_time': schedule.get('end_time') or '',
            'status': 'pending',
            # Desk work handed over ahead of time, whoever planned it: the desk
            # sees it in To do, and the reports treat it like the manager's tasks.
            'created_by_type': 'manager',
            'scheduled_by_type': schedule.get('created_by_type', 'manager'),
            'created_by_name': schedule.get('created_by_name', ''),
            'source_section': 'scheduled',
            'requires_photo': False,
            'created_at': now,
        }
        if shift_id:
            # The occurrence belongs to whichever shift is open when it is picked up.
            await db.tasks.update_one(
                {'schedule_occurrence_key': occurrence_key},
                {'$setOnInsert': task_doc, '$set': {'shift_id': shift_id}},
                upsert=True,
            )
        else:
            await db.tasks.update_one(
                {'schedule_occurrence_key': occurrence_key},
                {'$setOnInsert': {**task_doc, 'shift_id': None}},
                upsert=True,
            )


async def _drop_waiting_occurrences(scheduled_task_id: str, mgr_id: str):
    """Take a planned task's not-yet-started occurrences off the desk. Anything
    already done, declined or in progress stays, so the reports keep their history."""
    await db.tasks.delete_many({'manager_id': mgr_id, 'scheduled_task_id': scheduled_task_id, 'status': 'pending'})


@api.get('/tasks')
async def get_tasks(request: Request, day: Optional[str] = None, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    query = {'manager_id': mgr_id}
    if user_type == 'concierge':
        today = desk_day(day)
        active_shift = await db.shifts.find_one({'concierge_id': user['concierge_id'], 'status': 'active'}, {'shift_id': 1})
        await _materialize_scheduled_tasks(user, (active_shift or {}).get('shift_id'), today)
        # concierge only sees tasks assigned to them (by id or name)
        cid = user['concierge_id']
        cname = f"{user['first_name']} {user['last_name']}"
        query = {
            'manager_id': mgr_id,
            '$and': [
                {'$or': [
                    {'assigned_to_id': cid},
                    {'created_by': cid},
                    # older tasks were assigned by name only; match the full name, never a fragment of it
                    {'assigned_to_id': {'$in': [None, '']}, 'assigned_to': {'$regex': f'^{re.escape(cname)}$', '$options': 'i'}},
                    # a manager request addressed to nobody in particular goes to whoever is at the desk
                    {'assigned_to_id': {'$in': [None, '']}, 'assigned_to': {'$in': [None, '']}, 'created_by_type': 'manager'},
                ]},
                {'$or': [{'source_section': {'$ne': 'scheduled'}}, {'occurrence_date': today.isoformat()}]},
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
        'evidence_urls':   (task.evidence_urls or [])[:12],
        'created_by':      user['manager_id'] if user_type == 'manager' else user['concierge_id'],
        'created_by_name': f"{user['first_name']} {user['last_name']}",
        'created_by_type': user_type,
        'created_at':      datetime.now(timezone.utc),
    }
    await db.tasks.insert_one(doc)
    doc.pop('_id', None)
    doc['created_at'] = doc['created_at'].isoformat()
    await _audit(mgr_id, user['manager_id'] if user_type == 'manager' else user.get('concierge_id', ''), user_type,
                 'create', 'task', doc['task_id'], {'title': task.title, 'assigned_to': task.assigned_to})
    # Notify assigned concierge by email when manager creates a task
    if user_type == 'manager' and task.assigned_to_id:
        concierge = await db.concierges.find_one({'concierge_id': task.assigned_to_id})
        if concierge:
            await _notify_task_assigned(doc, user, concierge)
    return doc


TASK_STATUSES = ('pending', 'in_progress', 'completed', 'declined')


@api.put('/tasks/{task_id}')
async def update_task(task_id: str, update: TaskUpdate, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if update.status and update.status not in TASK_STATUSES:
        raise HTTPException(422, 'Status must be pending, in_progress, completed or declined.')
    existing = await db.tasks.find_one({'task_id': task_id, 'manager_id': mgr_id})
    if not existing:
        raise HTTPException(404, 'Task not found.')
    now = datetime.now(timezone.utc)
    who = f"{user['first_name']} {user['last_name']}".strip()
    patch = {}
    if update.status:          patch['status']          = update.status
    if update.completion_note: patch['completion_note'] = update.completion_note
    if update.evidence_url:    patch['evidence_url']    = update.evidence_url
    if update.evidence_urls:   patch['evidence_urls']   = update.evidence_urls[:12]
    if update.status == 'completed':
        patch['completed_at']      = now
        patch['completed_by_name'] = who
    if update.status == 'declined':
        patch['declined_at']      = now
        patch['declined_by_name'] = who
    if update.status in ('in_progress', 'completed', 'declined') and user_type == 'concierge':
        # Whoever at the desk picks a request up owns it from then on, and the
        # finished work lands in the report of the shift it was done on.
        if not existing.get('assigned_to_id'):
            patch['assigned_to_id'] = user['concierge_id']
            patch['assigned_to']    = who
        if update.status == 'completed':
            active = await db.shifts.find_one({'concierge_id': user['concierge_id'], 'status': 'active'}, {'shift_id': 1})
            if active:
                patch['completed_shift_id'] = active['shift_id']
    if not patch:
        raise HTTPException(400, 'Nothing to update.')
    await db.tasks.update_one({'task_id': task_id, 'manager_id': mgr_id}, {'$set': patch})
    updated = await db.tasks.find_one({'task_id': task_id}, {'_id': 0})
    for f in ('created_at', 'completed_at', 'declined_at'):
        if isinstance(updated.get(f), datetime):
            updated[f] = updated[f].isoformat()
    if update.status and update.status != existing.get('status'):
        await _audit(mgr_id, user.get('manager_id') if user_type == 'manager' else user.get('concierge_id', ''), user_type,
                     'update', 'task', task_id, {'title': existing.get('title', ''), 'status': update.status})
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
    repeat:                  Optional[str] = None  # once | daily | days | weekly | monthly
    end_time:                Optional[str] = ''    # optional HH:MM, for a window like an elevator booking
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
    repeat: Optional[str] = None
    end_time: Optional[str] = None
    clear_end_date: Optional[bool] = None   # true = runs until the manager removes it


def _validate_plan(repeat: str, start_date: Optional[str], end_date: Optional[str], days_of_week: Optional[List[int]]):
    if repeat not in REPEATS:
        raise HTTPException(422, 'Repeat must be once, daily, days, weekly or monthly.')
    if not start_date:
        raise HTTPException(422, 'Pick the day the task starts.')
    if repeat == 'days' and not days_of_week:
        raise HTTPException(422, 'Pick the days it repeats.')
    end = _parse_schedule_date(end_date, 'end_date')
    today = date.today()
    if end and end > date(today.year + MAX_YEARS_AHEAD, today.month, min(today.day, 28)):
        raise HTTPException(422, f'A planned task can run up to {MAX_YEARS_AHEAD} years ahead.')


async def _plan_history(mgr_id: str, ids: List[str]) -> dict:
    """How often each planned task was done, and its most recent days."""
    if not ids:
        return {}
    rows = await db.tasks.find(
        {'manager_id': mgr_id, 'scheduled_task_id': {'$in': ids}},
        {'_id': 0, 'scheduled_task_id': 1, 'occurrence_date': 1, 'status': 1, 'assigned_to': 1,
         'completed_by_name': 1, 'completed_at': 1, 'completion_note': 1},
    ).sort('occurrence_date', -1).to_list(5000)
    out = {}
    for r in rows:
        h = out.setdefault(r['scheduled_task_id'], {'done_count': 0, 'last_done': None, 'recent': []})
        if r.get('status') == 'completed':
            h['done_count'] += 1
            if not h['last_done']:
                at = r.get('completed_at')
                h['last_done'] = {'date': r.get('occurrence_date'), 'by': r.get('completed_by_name') or r.get('assigned_to') or '',
                                  'at': at.isoformat() if isinstance(at, datetime) else at}
        if len(h['recent']) < 14:
            h['recent'].append({'date': r.get('occurrence_date'), 'status': r.get('status'),
                                'by': r.get('completed_by_name') or r.get('assigned_to') or '',
                                'note': r.get('completion_note') or ''})
    return out


@api.get('/scheduled-tasks')
async def list_scheduled_tasks(request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    query = {'manager_id': mgr_id}
    if user_type != 'manager':
        query['created_by'] = user['concierge_id']   # the desk sees what it scheduled
    docs = await db.scheduled_tasks.find(query, {'_id': 0}).sort('created_at', -1).to_list(500)
    history = await _plan_history(mgr_id, [d['scheduled_task_id'] for d in docs])
    empty = {'done_count': 0, 'last_done': None, 'recent': []}
    for d in docs:
        if isinstance(d.get('created_at'), datetime): d['created_at'] = d['created_at'].isoformat()
        d['repeat'] = _schedule_repeat(d)
        d['history'] = history.get(d['scheduled_task_id'], empty)
    return {'scheduled_tasks': docs}

@api.post('/scheduled-tasks')
async def create_scheduled_task(data: ScheduledTaskCreate, request: Request, session_token: Optional[str] = Cookie(default=None)):
    # The desk can schedule too: a concierge who takes a booking for another day
    # leaves it for whoever is on duty then.
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    _validate_schedule_fields(data.start_date, data.end_date, data.scheduled_time, data.days_of_week)
    _validate_schedule_fields(None, None, data.end_time or None, None)
    repeat = data.repeat or _schedule_repeat({'days_of_week': data.days_of_week})
    data.start_date = data.start_date or datetime.now(timezone.utc).date().isoformat()
    _validate_plan(repeat, data.start_date, data.end_date, data.days_of_week)
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
        'end_date':               None if repeat == 'once' else data.end_date,
        'repeat':                 repeat,
        'created_by_name':        f"{user['first_name']} {user['last_name']}".strip(),
        'created_by_type':        user_type,
        'created_by':             user['manager_id'] if user_type == 'manager' else user['concierge_id'],
        'end_time':               data.end_time or '',
        'scheduled_time':         data.scheduled_time or f"{int(data.scheduled_hour or 8):02d}:00",
        'days_of_week':           data.days_of_week if data.days_of_week is not None else list(range(7)),
        'active':                 data.active,
        'created_at':             now,
    }
    await db.scheduled_tasks.insert_one(doc)
    doc.pop('_id', None)
    doc['created_at'] = now.isoformat()
    doc['history'] = {'done_count': 0, 'last_done': None, 'recent': []}
    await _audit(mgr_id, user['manager_id'] if user_type == 'manager' else user['concierge_id'], user_type,
                 'create', 'scheduled_task', task_id, {'title': data.title})
    return doc

@api.put('/scheduled-tasks/{task_id}')
async def update_scheduled_task(task_id: str, data: ScheduledTaskUpdate, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    patch = {k: v for k, v in data.dict().items() if v is not None and k != 'clear_end_date'}
    if data.clear_end_date:
        patch['end_date'] = None
    if not patch:
        raise HTTPException(400, 'Nothing to update.')
    owner = {'scheduled_task_id': task_id, 'manager_id': mgr_id}
    if user_type != 'manager':
        owner['created_by'] = user['concierge_id']   # the desk can change only what it scheduled
    existing = await db.scheduled_tasks.find_one(owner)
    if not existing:
        raise HTTPException(404, 'Scheduled request not found.')
    if 'end_time' in patch:
        _validate_schedule_fields(None, None, patch['end_time'] or None, None)
    _validate_schedule_fields(
        patch.get('start_date', existing.get('start_date')),
        patch.get('end_date', existing.get('end_date')),
        patch.get('scheduled_time', existing.get('scheduled_time')),
        patch.get('days_of_week', existing.get('days_of_week')),
    )
    merged = {**existing, **patch}
    if {'repeat', 'start_date', 'end_date', 'days_of_week'} & set(patch):
        _validate_plan(_schedule_repeat(merged), merged.get('start_date'), merged.get('end_date'), merged.get('days_of_week'))
    if _schedule_repeat(merged) == 'once':
        patch['end_date'] = None
    await db.scheduled_tasks.update_one({'scheduled_task_id': task_id, 'manager_id': mgr_id}, {'$set': patch})
    # Waiting copies on the desk are rebuilt from the new details on the next load.
    await _drop_waiting_occurrences(task_id, mgr_id)
    doc = await db.scheduled_tasks.find_one({'scheduled_task_id': task_id}, {'_id': 0})
    if doc and isinstance(doc.get('created_at'), datetime):
        doc['created_at'] = doc['created_at'].isoformat()
    if doc:
        doc['repeat'] = _schedule_repeat(doc)
        doc['history'] = (await _plan_history(mgr_id, [task_id])).get(task_id, {'done_count': 0, 'last_done': None, 'recent': []})
    return doc or {}

@api.delete('/scheduled-tasks/{task_id}')
async def delete_scheduled_task(task_id: str, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    query = {'scheduled_task_id': task_id, 'manager_id': mgr_id}
    if user_type != 'manager':
        query['created_by'] = user['concierge_id']   # the desk can remove only what it scheduled
    result = await db.scheduled_tasks.delete_one(query)
    if not result.deleted_count:
        raise HTTPException(404, 'Scheduled task not found.')
    await _drop_waiting_occurrences(task_id, mgr_id)
    await _audit(mgr_id, user['manager_id'] if user_type == 'manager' else user['concierge_id'], user_type,
                 'delete', 'scheduled_task', task_id, {})
    return {'message': 'Deleted.'}


MAX_CALENDAR_DAYS = 62


@api.get('/schedule/calendar')
async def schedule_calendar(start: str, end: str, request: Request, session_token: Optional[str] = Cookie(default=None)):
    """What is planned for each day between start and end (inclusive), for the
    Shifts calendar: scheduled tasks with their time, who it is for, who added
    it, and whether it was done. Manager and desk both read it."""
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    first = _parse_schedule_date(start, 'start')
    last = _parse_schedule_date(end, 'end')
    if not first or not last or last < first:
        raise HTTPException(422, 'Give a start and an end date.')
    if (last - first).days >= MAX_CALENDAR_DAYS:
        raise HTTPException(422, f'Ask for at most {MAX_CALENDAR_DAYS} days at a time.')
    schedules = await db.scheduled_tasks.find({'manager_id': mgr_id, 'active': True}, {'_id': 0}).to_list(500)
    ids = [s['scheduled_task_id'] for s in schedules]
    done_rows = await db.tasks.find(
        {'manager_id': mgr_id, 'scheduled_task_id': {'$in': ids},
         'occurrence_date': {'$gte': first.isoformat(), '$lte': last.isoformat()}},
        {'_id': 0, 'scheduled_task_id': 1, 'occurrence_date': 1, 'status': 1, 'completed_by_name': 1, 'assigned_to': 1},
    ).to_list(5000)
    status_of = {}
    for r in done_rows:
        key = (r['scheduled_task_id'], r.get('occurrence_date'))
        if r.get('status') == 'completed' or key not in status_of:
            status_of[key] = {'status': r.get('status'), 'by': r.get('completed_by_name') or ''}
    days = {}
    day = first
    while day <= last:
        for sch in schedules:
            if not occurs_on(sch, day):
                continue
            key = day.isoformat()
            st = status_of.get((sch['scheduled_task_id'], key), {})
            days.setdefault(key, []).append({
                'scheduled_task_id': sch['scheduled_task_id'],
                'title': sch.get('title', ''),
                'notes': sch.get('notes', ''),
                'category': sch.get('category', ''),
                'time': sch.get('scheduled_time') or '',
                'end_time': sch.get('end_time') or '',
                'repeat': _schedule_repeat(sch),
                'for_name': sch.get('assigned_concierge_name') or sch.get('assigned_to') or '',
                'added_by': sch.get('created_by_name', ''),
                'added_by_type': sch.get('created_by_type', 'manager'),
                'mine': user_type == 'manager' or sch.get('created_by') == user.get('concierge_id'),
                'status': st.get('status') or 'planned',
                'done_by': st.get('by', ''),
            })
        day = date.fromordinal(day.toordinal() + 1)
    for items in days.values():
        items.sort(key=lambda i: i['time'])
    return {'days': days}
