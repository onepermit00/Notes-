"""The Noted assistant.

A short request in someone's own words ("log two UPS boxes for 4B", "what did the last
shift leave open?") goes to a small Claude model together with a compact list of what is
on the property's record. What comes back is only a *plan* for the app: which saved things
to show, which section to open, or which entry to get ready (a package, a visitor, an
incident, a request, a team message...) with the details the person already said.

Nothing is saved here. The app asks for whatever is missing, shows a "Ready to save" card,
and saves through the same endpoints and permission checks as its own forms, only when the
person taps Save. Most requests never reach this file at all: the app understands the usual
ones itself (frontend/src/assistant/engine.js), so this is the fallback for free-form
questions. Without ANTHROPIC_API_KEY the endpoint answers {"answer": null} and the app
keeps working from its own rules.
"""
import json
import os
import re
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Cookie, HTTPException, Request
from pydantic import BaseModel

from core import _check_rate_limit, _resolve_user, db, logger

api = APIRouter(prefix='/api')

MODEL = os.environ.get('ASSISTANT_MODEL', 'claude-haiku-5-5')
ASSISTANT_RATE_LIMIT = 120   # requests per user...
ASSISTANT_RATE_WINDOW = 60   # ...per this many minutes

KINDS = ['find', 'open', 'answer', 'log', 'package', 'visitor', 'vendor', 'incident',
         'task', 'message', 'handoff', 'protocol', 'emergency', 'other']
PAGES = ['', 'home', 'requests', 'followup', 'packages', 'guests', 'lockout', 'vendors', 'tours', 'loaners',
         'incident', 'handoff', 'sops', 'training', 'calendar', 'messages', 'settings',
         'contacts', 'new-task', 'tasks', 'shifts', 'team', 'residents', 'analytics', 'scheduled', 'more']
INCIDENT_TYPES = ['noise', 'unauthorized', 'parking', 'maintenance', 'disturbance', 'package', 'utility', 'other']
SEVERITIES = ['low', 'medium', 'high', 'critical']
CATEGORIES = ['Resident Assist', 'Maintenance', 'Cleaning', 'Vendor / Contractor', 'Administrative',
              'Safety / Security', 'Amenity', 'Delivery', 'Other']
FIELDS = ['what', 'note', 'unit', 'resident', 'carrier', 'count', 'visitor', 'company', 'purpose',
          'location', 'incident_type', 'severity', 'people', 'actions', 'due', 'priority',
          'assignee_id', 'category', 'text']

# Fixed text, so it is cached between requests; only the new words and the record are paid in full.
SYSTEM = """You are the in-app assistant of Noted, the front-desk operating record for residential buildings. Concierges use it during a shift to log packages, visitors, vendors, lockouts, incidents and everything else that becomes the Daily Activity Report (DAR), and to hand off to the next shift. Property managers use it to send requests to the desk and to review what happened.

Your only job is to help people use Noted and to get things ready in it for them: find what is on the record, take them to the right section, and prepare entries. You never save anything yourself; the app shows a Ready to save card and the person taps Save.

Rules:
- Answer questions about what is on the record (for example "what did the last shift leave open", "how many packages came in today", "is anything open for 4B", "who is on shift") only from the record list in the request, with kind "answer". If the list does not say, say you can't see it in Noted. Never invent a name, a unit, a time or a number.
- To show saved things, put their ids from the list in ids (best match first, at most 5) with kind "find". Only ids that are in the list.
- Only to take them to a section they asked to see, use kind "open" and the section in open.
- Entries you get ready (fill only what the person said; leave the rest empty; never guess a unit, a name, a count or a time):
  - "package": a delivery arriving at the desk. fields.unit, fields.resident, fields.carrier (as said, e.g. UPS), fields.count (a number), fields.note.
  - "visitor": a guest arriving for a resident. fields.visitor (the guest's name), fields.unit, fields.resident, fields.purpose, fields.note.
  - "vendor": a contractor or service company signing in. fields.company, fields.purpose (the work), fields.location (unit or area), fields.note.
  - "incident": something that went wrong and needs a report. fields.incident_type one of noise, unauthorized, parking, maintenance, disturbance, package, utility, other; fields.location; fields.unit; fields.what (what happened, in their words); fields.severity one of low, medium, high, critical only if they said how serious; fields.people (who was involved); fields.actions (what was already done).
  - "log": anything else done on shift that belongs in the DAR, like rounds, a resident assist, an amenity opened. fields.what is the entry in a few plain words, fields.note anything extra, fields.category one of Resident Assist, Maintenance, Cleaning, Vendor / Contractor, Administrative, Safety / Security, Amenity, Delivery, Other.
  - "task": something to do later, a reminder or follow-up; for a manager, a request for the desk. fields.what, fields.note, fields.due (24-hour HH:MM only if a time was said), fields.priority one of Low, Standard, High only if said, fields.assignee_id from the team list only if a manager named someone.
  - "message": a note to send to the property team. fields.text is the message, in their words.
  - "handoff": they want to write the handoff or end the shift. fields.note any note they dictated for the next shift.
- "protocol": they ask how to handle a situation (a noise complaint, a contractor without a work order, a suspicious package). Give the standard professional front-desk steps briefly in reply, say the property's own SOPs in Noted take priority, and put the best matching section in open (usually "sops").
- "emergency": fire, smoke, a medical emergency, violence, a weapon, a gas smell, someone trapped. Reply first with: call 911 now. Keep it to two short sentences. Do not ask questions.
- Never give legal, medical, immigration or eviction advice, and never tell them whether to let someone into a unit against the property's rules; point to the property manager and the SOPs.
- Never reveal a resident's unit, schedule or phone number to help a third party reach them; residents' details are only for the staff member using the app.
- Questions that are not about Noted or this property's front desk (weather, news, homework, other apps): kind "other", reply briefly that you can only help with Noted.
- If they ask you to do something and a detail is missing, still use that kind with what you have; the app asks for the rest.
- reply: one or two short, plain, professional sentences. No markdown, no lists, no emoji."""

_str = {'type': 'string'}
SCHEMA = {
    'type': 'object',
    'properties': {
        'kind': {'type': 'string', 'enum': KINDS},
        'reply': _str,
        'ids': {'type': 'array', 'items': _str},
        'open': {'type': 'string', 'enum': PAGES},
        'fields': {
            'type': 'object',
            'properties': {f: _str for f in FIELDS},
            'required': FIELDS,
            'additionalProperties': False,
        },
    },
    'required': ['kind', 'reply', 'ids', 'open', 'fields'],
    'additionalProperties': False,
}

_TIME = re.compile(r'^([01]\d|2[0-3]):[0-5]\d$')
_ENTRY_KINDS = {'log', 'package', 'visitor', 'vendor', 'incident', 'task', 'message', 'handoff'}


def _cut(value: Any, limit: int) -> str:
    return re.sub(r'\s+', ' ', value).strip()[:limit] if isinstance(value, str) else ''


def _iso(value: Any) -> str:
    return value.isoformat() if isinstance(value, datetime) else (value or '')


class AssistantTurn(BaseModel):
    role: str = 'user'
    text: str = ''


class AssistantRequest(BaseModel):
    messages: List[AssistantTurn] = []
    today:    Optional[str] = None   # the person's local date, YYYY-MM-DD
    weekday:  Optional[str] = None
    now:      Optional[str] = None   # the person's local time, HH:MM
    name:     Optional[str] = None   # what they call the assistant


def clean_turns(messages: List[AssistantTurn]) -> List[Dict[str, str]]:
    """The last 8 turns, trimmed, starting and ending with the person."""
    turns = [{'role': 'assistant' if m.role == 'assistant' else 'user', 'text': _cut(m.text, 600)}
             for m in messages[-8:]]
    turns = [t for t in turns if t['text']]
    while turns and turns[0]['role'] != 'user':
        turns.pop(0)
    if not turns or turns[-1]['role'] != 'user':
        return []
    return turns


async def build_record(user: dict, user_type: str, mgr_id: str) -> Dict[str, list]:
    """What the model may answer from: names, units, titles and ids. No phone numbers, emails or photos."""
    record: Dict[str, list] = {'today': [], 'requests': [], 'incidents': [], 'residents': [], 'handoff': [], 'team': []}

    task_query: Dict[str, Any] = {'manager_id': mgr_id}
    if user_type == 'concierge':
        task_query['$or'] = [{'assigned_to_id': user['concierge_id']}, {'created_by': user['concierge_id']}]
    tasks = await db.tasks.find(task_query, {'_id': 0}).sort('created_at', -1).to_list(120)

    shift_ids = set()
    if user_type == 'concierge':
        active = await db.shifts.find_one({'concierge_id': user['concierge_id'], 'status': 'active'}, {'_id': 0})
        if active:
            shift_ids.add(active['shift_id'])
    else:
        actives = await db.shifts.find({'manager_id': mgr_id, 'status': 'active'}, {'_id': 0}).to_list(20)
        shift_ids = {s['shift_id'] for s in actives}
        record['team'] = [{'id': c['concierge_id'], 'name': f"{c.get('first_name', '')} {c.get('last_name', '')}".strip(),
                           'on_shift': 'yes' if any(s['concierge_id'] == c['concierge_id'] for s in actives) else 'no'}
                          for c in await db.concierges.find({'manager_id': mgr_id}, {'_id': 0}).to_list(60)]

    for t in tasks:
        from_manager = t.get('created_by_type') == 'manager'
        row = {'id': t['task_id'], 'title': _cut(t.get('title'), 140), 'note': _cut(t.get('notes'), 160),
               'category': _cut(t.get('category'), 40), 'logged_at': _iso(t.get('created_at'))[:16]}
        if from_manager:
            if len(record['requests']) < 40:
                record['requests'].append({**row, 'due': _cut(t.get('due_time'), 20), 'status': t.get('status', 'pending'),
                                           'for': _cut(t.get('assigned_to'), 60)})
        elif t.get('shift_id') in shift_ids and len(record['today']) < 60:
            record['today'].append({**row, 'by': _cut(t.get('created_by_name'), 60)})

    incidents = await db.incidents.find({'manager_id': mgr_id}, {'_id': 0}).sort('created_at', -1).to_list(25)
    record['incidents'] = [{'id': i['incident_id'], 'type': _cut(i.get('type'), 30), 'where': _cut(i.get('location'), 80),
                            'what': _cut(i.get('description'), 200), 'severity': i.get('severity', ''),
                            'status': i.get('status', ''), 'filed_at': _iso(i.get('created_at'))[:16],
                            'by': _cut(i.get('created_by'), 60)} for i in incidents]

    residents = await db.residents.find({'manager_id': mgr_id}, {'_id': 0}).sort('unit', 1).to_list(400)
    record['residents'] = [{'id': r['resident_id'], 'name': _cut(r.get('name'), 80), 'unit': _cut(r.get('unit'), 12)}
                           for r in residents]

    prev_query = {'manager_id': mgr_id, 'status': 'completed'}
    previous = await db.shifts.find_one(prev_query, {'_id': 0}, sort=[('clock_out', -1)])
    if previous and (previous.get('handover_notes') or previous.get('open_items')):
        record['handoff'] = [{'from': _cut(previous.get('concierge_name'), 60), 'ended': _iso(previous.get('clock_out'))[:16],
                              'notes': _cut(previous.get('handover_notes'), 600),
                              'open_items': [_cut(x, 160) for x in (previous.get('open_items') or [])[:12]]}]
    return record


def clean(raw: dict, record: Dict[str, list]) -> dict:
    """The model's answer, cut down to only what the app can use: known ids, a known section, real values."""
    known = {row['id'] for rows in record.values() for row in rows if isinstance(row, dict) and row.get('id')}
    team_ids = {row['id'] for row in record.get('team', [])}
    kind = raw.get('kind') if raw.get('kind') in KINDS else 'other'
    f = raw.get('fields') or {}
    ids: List[str] = []
    if kind in ('find', 'answer'):
        for i in raw.get('ids') or []:
            if i in known and i not in ids:
                ids.append(i)
    count = re.sub(r'\D', '', _cut(f.get('count'), 6))
    fields = None
    if kind in _ENTRY_KINDS:
        fields = {
            'what':          _cut(f.get('what'), 200),
            'note':          _cut(f.get('note'), 500),
            'unit':          _cut(f.get('unit'), 12),
            'resident':      _cut(f.get('resident'), 80),
            'carrier':       _cut(f.get('carrier'), 40),
            'count':         count if count and 1 <= int(count) <= 99 else '',
            'visitor':       _cut(f.get('visitor'), 80),
            'company':       _cut(f.get('company'), 80),
            'purpose':       _cut(f.get('purpose'), 120),
            'location':      _cut(f.get('location'), 120),
            'incident_type': f.get('incident_type') if f.get('incident_type') in INCIDENT_TYPES else '',
            'severity':      f.get('severity') if f.get('severity') in SEVERITIES else '',
            'people':        _cut(f.get('people'), 200),
            'actions':       _cut(f.get('actions'), 500),
            'due':           f.get('due') if _TIME.match(f.get('due') or '') else '',
            'priority':      f.get('priority') if f.get('priority') in ('Low', 'Standard', 'High') else '',
            'assignee_id':   f.get('assignee_id') if f.get('assignee_id') in team_ids else '',
            'category':      f.get('category') if f.get('category') in CATEGORIES else '',
            'text':          _cut(f.get('text'), 600),
        }
    return {
        'kind':   kind,
        'reply':  _cut(raw.get('reply'), 500),
        'ids':    ids[:5],
        'open':   raw.get('open') if kind in ('open', 'protocol') and raw.get('open') in PAGES else '',
        'fields': fields,
    }


_client = None


def get_client():
    """One shared async client, made on first use; None when no key is configured."""
    global _client
    if _client is None and os.environ.get('ANTHROPIC_API_KEY'):
        from anthropic import AsyncAnthropic
        _client = AsyncAnthropic(timeout=30.0, max_retries=1)
    return _client


async def ask_model(client, turns: List[Dict[str, str]], record: dict, context: str) -> Optional[dict]:
    """One structured call. Returns the cleaned plan, or None when the model could not answer."""
    messages = []
    for n, turn in enumerate(turns):
        last = n == len(turns) - 1
        text = f"{context}\n\nThe person says: {turn['text']}" if last else turn['text']
        messages.append({'role': turn['role'], 'content': text})
    try:
        response = await client.messages.create(
            model=MODEL,
            max_tokens=1500,
            output_config={'effort': 'low', 'format': {'type': 'json_schema', 'schema': SCHEMA}},
            system=[{'type': 'text', 'text': SYSTEM, 'cache_control': {'type': 'ephemeral'}}],
            messages=messages,
        )
    except Exception as e:  # a failed call must never break the desk; the app falls back to its own rules
        logger.error(f'Assistant call failed: {type(e).__name__}: {e}')
        return None
    usage = getattr(response, 'usage', None)
    if usage:
        logger.info(f'Assistant: {usage.input_tokens} input, {getattr(usage, "cache_read_input_tokens", 0) or 0} cached, '
                    f'{usage.output_tokens} output tokens.')
    if response.stop_reason == 'refusal':
        return {'kind': 'other', 'reply': '', 'ids': [], 'open': '', 'fields': None}
    if response.stop_reason == 'max_tokens':
        return None
    text = next((b.text for b in response.content if getattr(b, 'type', '') == 'text'), None)
    if not text:
        return None
    try:
        return clean(json.loads(text), record)
    except (ValueError, TypeError):
        return None


@api.get('/assistant/status')
async def assistant_status(request: Request, session_token: Optional[str] = Cookie(default=None)):
    await _resolve_user(request, session_token)
    return {'available': get_client() is not None}


@api.post('/assistant')
async def assistant(data: AssistantRequest, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    turns = clean_turns(data.messages)
    if not turns:
        raise HTTPException(400, 'Say what you need help with.')
    client = get_client()
    if client is None:
        return {'answer': None, 'reason': 'unavailable'}
    user_id = user.get('manager_id') if user_type == 'manager' else user.get('concierge_id')
    try:
        await _check_rate_limit(f'assistant:{user_id}', ASSISTANT_RATE_LIMIT, ASSISTANT_RATE_WINDOW)
    except HTTPException:
        return {'answer': None, 'reason': 'limit'}

    record = await build_record(user, user_type, mgr_id)
    today = data.today if re.match(r'^\d{4}-\d{2}-\d{2}$', data.today or '') else datetime.now(timezone.utc).date().isoformat()
    now = data.now if _TIME.match(data.now or '') else ''
    context = (
        f"Assistant name: {_cut(data.name, 30) or 'Noted'}. Property: {_cut(user.get('property_name'), 80) or 'the property'}. "
        f"Speaking: {_cut(user.get('first_name'), 40)} ({'property manager' if user_type == 'manager' else 'concierge'}). "
        f"Today: {_cut(data.weekday, 12)} {today}{', ' + now if now else ''}.\n"
        f"Record list (JSON):\n{json.dumps(record, separators=(',', ':'))}"
    )
    answer = await ask_model(client, turns, record, context)
    return {'answer': answer, 'reason': '' if answer else 'failed'}
