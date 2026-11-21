"""Build the Noted API spec from the running code.

    cd backend && python scripts/build_api_spec.py

Writes docs/api/openapi.yaml (OpenAPI 3.1) and docs/api/API.md (readable reference).

FastAPI already knows every path and every request body (the Pydantic models).
What it cannot see is who may call an endpoint, what comes back, and which errors
the handler raises, because the routes return plain dicts and check roles by hand.
That part is written down below in META, next to each endpoint. When you add or
change an endpoint, update META and run this script again;
tests/test_api_spec.py fails if an endpoint is missing from META.
"""
import copy
import json
import os
import sys
from pathlib import Path

os.environ.setdefault('MONGO_URL', 'mongodb://127.0.0.1:27017')  # never contacted: the spec is built offline

BACKEND = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BACKEND))
DOCS = BACKEND.parent / 'docs' / 'api'

import yaml  # noqa: E402  (pyyaml, in requirements-dev.txt)

LIVE_URL = 'https://notes-slg9.onrender.com'

# ── Shared response shapes ─────────────────────────────────────────────────────
S = lambda name: {'$ref': f'#/components/schemas/{name}'}  # noqa: E731
STR, INT, BOOL, NUM = {'type': 'string'}, {'type': 'integer'}, {'type': 'boolean'}, {'type': 'number'}
DT = {'type': 'string', 'format': 'date-time'}
DATE = {'type': 'string', 'format': 'date'}
NSTR = {'type': ['string', 'null']}
NDT = {'type': ['string', 'null'], 'format': 'date-time'}
ARR = lambda item: {'type': 'array', 'items': item}  # noqa: E731


def obj(props: dict, required=None, extra=False, desc=None) -> dict:
    out = {'type': 'object', 'properties': props}
    if required:
        out['required'] = required
    if extra:
        out['additionalProperties'] = True
    if desc:
        out['description'] = desc
    return out


SCHEMAS = {
    'Error': obj({'detail': {'description': 'A sentence the app can show as it is. A few endpoints send an object instead (see GET /api/auth/invitations/{token}).',
                             'anyOf': [STR, {'type': 'object'}]}}, ['detail']),
    'MessageResult': obj({'message': STR}, ['message']),
    'NotificationPrefs': obj({'incident': BOOL, 'package': BOOL}, desc='Which emails the manager gets. Both default to true.'),
    'Profile': obj({
        'user_type':        {'type': 'string', 'enum': ['manager', 'concierge']},
        'user_id':          {'type': 'string', 'description': 'mgr_… for a manager, con_… for a concierge.'},
        'name':             STR, 'first_name': STR, 'last_name': STR, 'email': STR, 'phone': STR,
        'property_name':    STR,
        'property_address': {'type': 'string', 'description': 'Street · City, State, from the manager record.'},
        'title':            STR,
        'manager_id':       {'type': 'string', 'description': 'Concierges only: the manager (property) they belong to.'},
        'notification_prefs': S('NotificationPrefs'),
    }, ['user_type', 'user_id', 'name', 'email', 'property_name'],
        desc='The signed-in person. `notification_prefs` is sent for managers only, `manager_id` for concierges only.'),
    'AuthResult': {'allOf': [S('Profile'), obj({'token': {'type': 'string', 'description': 'Session token (sess_…). Send it as `Authorization: Bearer <token>`. Lasts 30 days.'}}, ['token'])]},
    'InvitationPreview': obj({
        'status': {'type': 'string', 'enum': ['valid']}, 'email': STR, 'name': STR, 'property_name': STR,
        'role': {'type': 'string', 'enum': ['concierge']}, 'expires_at': DT,
    }, ['status', 'email', 'name', 'property_name', 'role', 'expires_at']),
    'InvitationProblem': obj({'detail': obj({'status': {'type': 'string', 'enum': ['invalid', 'used', 'expired']}, 'message': STR})}),
    'TeamMember': obj({
        'concierge_id':   {'type': 'string', 'description': 'Missing on a pending invitation.'},
        'invitation_id':  {'type': 'string', 'description': 'Only on a pending invitation (status `invited`).'},
        'first_name': STR, 'last_name': STR, 'email': STR, 'phone': STR, 'title': STR,
        'manager_id': STR, 'property_name': STR, 'is_active': BOOL,
        'status':         {'type': 'string', 'enum': ['on_shift', 'active', 'invited']},
        'on_shift_since': DT, 'shift_count': INT,
        'section_access': {'type': 'object', 'additionalProperties': BOOL},
        'created_at':     DT,
    }, ['first_name', 'last_name', 'email', 'status'], desc='A concierge account, or a pending invitation (status `invited`).'),
    'ConciergeCreated': obj({'concierge_id': STR, 'first_name': STR, 'last_name': STR, 'email': STR, 'title': STR,
                             'phone': STR, 'property_name': STR, 'message': STR}),
    'InvitationCreated': obj({
        'invitation_id': STR, 'email': STR, 'first_name': STR, 'last_name': STR, 'title': STR, 'property_name': STR,
        'expires_at': DT,
        'invite_link': {'type': 'string', 'description': 'FRONTEND_URL/invite/<token>. Shown to the manager so it can be shared by hand if the email fails.'},
        'email_sent': BOOL, 'email_error': STR, 'message': STR,
    }),
    'ResetLinkResult': obj({'message': STR, 'email_sent': BOOL, 'email_error': STR,
                            'reset_link': {'type': 'string', 'description': 'FRONTEND_URL/reset-password?token=…, valid 45 minutes.'}}),
    'SectionAccess': obj({'concierge_id': STR, 'sections': {'type': 'object', 'additionalProperties': BOOL,
                                                             'description': 'Section id → visible. `home` and `emergency` are always true.'}}),
    'CustomSection': obj({'id': STR, 'label': STR, 'desc': STR}, ['id', 'label']),
    'CustomSections': obj({'custom_sections': ARR(S('CustomSection'))}, ['custom_sections']),
    'MySections': obj({'sections': {'type': 'object', 'additionalProperties': BOOL}, 'custom_sections': ARR(S('CustomSection'))}),
    'Task': obj({
        'task_id': STR, 'manager_id': STR, 'shift_id': NSTR,
        'title': STR, 'notes': STR, 'category': STR,
        'priority': {'type': 'string', 'description': 'Low, Standard or High.'},
        'status': {'type': 'string', 'enum': ['pending', 'in_progress', 'completed', 'declined', 'not_done'],
                   'description': '`not_done` appears only in shift reports, for desk work still open when the shift ended.'},
        'requires_photo': BOOL, 'assigned_to': NSTR, 'assigned_to_id': NSTR,
        'source_section': {'type': 'string', 'description': 'Where it came from: `requests` (manager), `new-task` (desk), `scheduled` (a planned task), or a desk section id.'},
        'due_time': {'type': 'string', 'description': 'HH:MM or `ASAP`.'},
        'completion_note': NSTR, 'evidence_url': NSTR, 'evidence_urls': ARR(STR),
        'created_by': STR, 'created_by_name': STR, 'created_by_type': {'type': 'string', 'enum': ['manager', 'concierge']},
        'created_at': DT, 'completed_at': DT, 'completed_by_name': STR, 'completed_shift_id': STR,
        'declined_at': DT, 'declined_by_name': STR,
        'scheduled_task_id': {'type': 'string', 'description': 'Set on a day\'s copy of a planned task.'},
        'occurrence_date': DATE, 'scheduled_time': STR, 'end_time': STR, 'scheduled_by_type': STR,
        'assigned_at': {'type': 'string', 'format': 'date-time', 'description': 'Shift reports only: when it was assigned (created_at then holds when it was finished).'},
        'not_done': BOOL,
    }, ['task_id', 'title', 'status']),
    'PlanHistory': obj({
        'done_count': INT,
        'last_done': {'type': ['object', 'null'], 'properties': {'date': DATE, 'by': STR, 'at': DT}},
        'recent': ARR(obj({'date': DATE, 'status': STR, 'by': STR, 'note': STR})),
    }, desc='How often a planned task was done, with up to 14 recent days.'),
    'ScheduledTask': obj({
        'scheduled_task_id': STR, 'manager_id': STR, 'title': STR, 'notes': STR, 'category': STR, 'priority': STR,
        'recurrence': STR, 'scheduled_hour': {'type': ['integer', 'null']}, 'shift_window': STR,
        'assigned_concierge_id': STR, 'assigned_concierge_name': STR, 'assigned_to': STR, 'assigned_to_id': STR,
        'start_date': DATE, 'end_date': {'type': ['string', 'null'], 'format': 'date'},
        'repeat': {'type': 'string', 'enum': ['once', 'daily', 'days', 'weekly', 'monthly']},
        'days_of_week': {**ARR(INT), 'description': '0 = Monday … 6 = Sunday.'},
        'scheduled_time': {'type': 'string', 'description': 'HH:MM, 24-hour.'}, 'end_time': STR,
        'active': BOOL, 'created_by': STR, 'created_by_name': STR, 'created_by_type': STR, 'created_at': DT,
        'history': S('PlanHistory'),
    }, ['scheduled_task_id', 'title', 'repeat', 'start_date']),
    'CalendarItem': obj({
        'scheduled_task_id': STR, 'title': STR, 'notes': STR, 'category': STR, 'time': STR, 'end_time': STR,
        'repeat': STR, 'for_name': STR, 'added_by': STR, 'added_by_type': STR,
        'mine': {'type': 'boolean', 'description': 'True when the caller may edit it (managers: always; desk: what it added).'},
        'status': {'type': 'string', 'description': '`planned` until a copy exists, then that copy\'s status.'},
        'done_by': STR,
    }),
    'Incident': obj({
        'incident_id': STR, 'manager_id': STR, 'shift_id': NSTR, 'type': STR, 'location': STR, 'description': STR,
        'severity': {'type': 'string', 'description': 'low, medium, high or critical.'},
        'notes': NSTR, 'unit_number': STR, 'person_involved': STR, 'evidence_urls': ARR(STR),
        'status': {'type': 'string', 'description': 'Starts as `new`; the manager sets it (e.g. `resolved`).'},
        'created_by': {'type': 'string', 'description': 'Name of the person who filed it.'},
        'created_by_type': STR, 'created_at': DT, 'resolved_at': DT, 'resolved_by': STR, 'resolved_note': STR,
    }, ['incident_id', 'type', 'location', 'description', 'status']),
    'Shift': obj({
        'shift_id': STR, 'concierge_id': STR, 'concierge_name': STR, 'manager_id': STR, 'property_name': STR,
        'status': {'type': 'string', 'enum': ['active', 'completed']},
        'clock_in': DT, 'clock_out': NDT, 'created_at': DT,
        'handover_notes': STR, 'open_items': ARR(STR),
        'activities': {**ARR(S('Task')), 'description': 'What was done on the shift (the DAR), oldest first, plus `not_done` desk work once it has ended.'},
        'incidents': ARR(S('Incident')),
    }, ['shift_id', 'concierge_id', 'status', 'clock_in']),
    'ShiftResult': obj({'shift': {'anyOf': [S('Shift'), {'type': 'null'}]}}, ['shift']),
    'ChatMessage': obj({'message_id': STR, 'manager_id': STR, 'content': STR, 'message_type': STR, 'sender_name': STR,
                        'sender_id': STR, 'sender_type': {'type': 'string', 'enum': ['manager', 'concierge']}, 'created_at': DT}),
    'Resident': obj({'resident_id': STR, 'manager_id': STR, 'name': STR, 'unit': STR, 'phone': STR, 'email': STR,
                     'notes': STR, 'created_at': DT}, ['resident_id', 'name', 'unit']),
    'Analytics': obj({
        'totals': obj({'tasks': INT, 'completed_tasks': INT, 'completion_rate': {'type': 'number', 'description': 'Percent, one decimal.'},
                       'incidents': INT, 'open_incidents': INT, 'shifts': INT}),
        'by_category': ARR(obj({'category': STR, 'count': INT})),
        'by_status': ARR(obj({'status': STR, 'count': INT})),
        'incidents_by_severity': ARR(obj({'severity': STR, 'count': INT})),
        'incidents_by_type': ARR(obj({'type': STR, 'count': INT})),
        'by_concierge': ARR(obj({'name': STR, 'count': INT})),
        'hourly_activity': ARR(obj({'hour': {'type': 'integer', 'description': '0–23, UTC.'}, 'count': INT})),
    }),
    'AuditLog': obj({'log_id': STR, 'manager_id': STR, 'user_id': STR, 'user_type': STR,
                     'action': {'type': 'string', 'description': 'create, update, delete, clock_in or clock_out.'},
                     'resource_type': STR, 'resource_id': STR, 'detail': {'type': 'object'}, 'created_at': DT}),
    'PackageResult': obj({'sent': {'type': 'boolean', 'description': 'True when a resident email was found for the unit and an email was attempted.'},
                          'resident_email': STR, 'resident_name': STR}),
    'ImageUpload': obj({'image_id': STR, 'url': {'type': 'string', 'description': 'A data: URL (base64) of the image. Store it on the task or incident.'}}),
    'AssistantPlan': obj({
        'kind': {'type': 'string', 'enum': ['find', 'open', 'answer', 'log', 'package', 'visitor', 'vendor', 'incident',
                                            'task', 'message', 'handoff', 'protocol', 'emergency', 'other']},
        'reply': STR, 'ids': {**ARR(STR), 'description': 'Up to 5 ids from the property record, best match first.'},
        'open': {'type': 'string', 'description': 'A section of the app to open.'},
        'fields': {'type': ['object', 'null'], 'additionalProperties': STR, 'description': 'Draft entry values for entry kinds; the app shows a Ready to save card.'},
    }),
    'AssistantResult': obj({'answer': {'anyOf': [S('AssistantPlan'), {'type': 'null'}]},
                            'reason': {'type': 'string', 'enum': ['', 'unavailable', 'limit', 'failed'],
                                       'description': '`unavailable`: no ANTHROPIC_API_KEY on the server. `limit`: over 120 requests per hour. `failed`: the model did not answer.'}}),
    'Contact': obj({'contact_id': STR, 'manager_id': STR, 'label': STR, 'number': STR,
                    'category': {'type': 'string', 'description': 'Suggested: Emergency services, Staff, Building & vendors. Any short label is kept.'},
                    'role': STR, 'created_at': DT, 'updated_at': DT}, ['contact_id', 'label', 'number']),
    'ContactsList': obj({'contacts': ARR(S('Contact')),
                         'manager': {'type': ['object', 'null'], 'properties': {'name': STR, 'title': STR, 'phone': STR, 'email': STR}}}),
    'KnowledgeOut': obj({
        'id': STR, 'kind': {'type': 'string', 'enum': ['sop', 'training']}, 'title': STR, 'category': STR, 'body': STR,
        'fileName': STR, 'fileType': {'type': 'string', 'description': 'pdf, image, video or doc; empty when there is no file.'},
        'dataURL': {'type': 'string', 'description': 'Older items only: the file inline. Newer items have hasFile and are downloaded from …/file.'},
        'hasFile': BOOL, 'fileId': STR, 'fileSize': INT, 'mime': STR,
        'status': {'type': 'string', 'description': 'Defaults to `published`.'},
        'completedBy': {**ARR(STR), 'description': 'Names of concierges who marked it reviewed.'},
        'completed': {'type': 'boolean', 'description': 'Whether the caller marked it reviewed.'},
        'updatedAt': DT,
    }, ['id', 'kind', 'title']),
}

# ── Per-endpoint facts the code does not declare ───────────────────────────────
# role: public | any | manager | concierge
# errors: {status: message}. 422 from request validation is added everywhere a body/query exists.
NOT_AUTH = 'Not authenticated.'
MGR = 'Manager access required.'
CON = 'Concierge access required.'


def resp(schema=None, desc='OK', key=None):
    if key:  # {key: [schema]}
        schema = obj({key: ARR(schema)}, [key])
    return {'description': desc, 'schema': schema}


META = {
    # ── Health ────────────────────────────────────────────────────────────────
    ('get', '/health'): dict(tag='Health', role='public', summary='Liveness check (outside /api)',
        ok=resp(obj({'status': {'type': 'string', 'enum': ['healthy']}}))),
    ('get', '/api/'): dict(tag='Health', role='public', summary='API name and version',
        ok=resp(obj({'message': STR, 'version': STR}))),
    ('get', '/api/health'): dict(tag='Health', role='public', summary='Health and setup hints',
        description='Non-secret hints to spot deploy problems from a browser: which email provider is set (`resend`, `brevo` or `not configured`) and whether FRONTEND_URL is set.',
        ok=resp(obj({'status': STR, 'email': STR, 'frontend_url_set': BOOL}))),

    # ── Auth ──────────────────────────────────────────────────────────────────
    ('post', '/api/auth/manager/signup'): dict(tag='Auth', role='public', summary='Create a manager account and property',
        description='Creates the manager and signs them in (also sets the `session_token` cookie). Sends a welcome email in the background.',
        ok=resp(S('AuthResult')),
        errors={400: 'Password must be at least 8 characters. / Enter a valid email address. / Enter your first name. / Enter at least 1 unit. / An account with this email already exists.'}),
    ('post', '/api/auth/signin'): dict(tag='Auth', role='public', summary='Sign in',
        description='`role` is the role picked on the sign-in screen. If the email and password match the other role, that account is signed in instead. Concierges must be active.',
        ok=resp(S('AuthResult')),
        errors={400: 'Role must be "manager" or "concierge".', 401: 'Invalid email or password.'}),
    ('get', '/api/auth/me'): dict(tag='Auth', role='any', summary='Who is signed in',
        ok=resp(S('Profile')), errors={401: 'Not authenticated. / User not found.'}),
    ('put', '/api/auth/me'): dict(tag='Auth', role='any', summary='Edit own profile',
        description='Send any of first_name, last_name, phone. `notification_prefs` is saved for managers only. A concierge\'s name change also updates their open shift.',
        ok=resp(S('Profile')), errors={400: 'Enter your name. / No fields to update.', 401: NOT_AUTH, 404: 'User not found.'}),
    ('post', '/api/auth/signout'): dict(tag='Auth', role='public', summary='Sign out',
        description='Ends the session if there is one and clears the cookie. Always succeeds.',
        ok=resp(S('MessageResult'))),
    ('put', '/api/auth/change-password'): dict(tag='Auth', role='any', summary='Change own password',
        ok=resp(S('MessageResult')),
        errors={400: 'Password must be at least 8 characters. / Current password is incorrect.', 401: NOT_AUTH, 404: 'User not found.'}),
    ('post', '/api/auth/password/forgot'): dict(tag='Auth', role='public', summary='Email a password reset link',
        description='Always answers the same way whether or not the email has an account. The link (FRONTEND_URL/reset-password?token=…) lasts 45 minutes. Limited to 5 requests per email per 15 minutes.',
        ok=resp(S('MessageResult')), errors={429: 'Too many requests. Please try again later.'}),
    ('post', '/api/auth/password/reset'): dict(tag='Auth', role='public', summary='Set a new password from a reset link',
        description='The token works once. Signs the person out on every device.',
        ok=resp(S('MessageResult')),
        errors={400: 'Password must be at least 8 characters. / This reset link is invalid or has expired.'}),
    ('get', '/api/auth/invitations/{token}'): dict(tag='Auth', role='public', summary='Check an invitation link',
        description='Used by the invite page before the person sets a password. Errors carry `detail.status` (`invalid`, `used`, `expired`) and `detail.message`.',
        ok=resp(S('InvitationPreview')),
        errors={404: ('This invitation link is not valid.', 'InvitationProblem'), 410: ('This invitation has already been used. / This invitation has expired.', 'InvitationProblem')}),
    ('post', '/api/auth/invitations/{token}/accept'): dict(tag='Auth', role='public', summary='Accept an invitation and set a password',
        description='Creates the concierge account. The person then signs in normally.',
        ok=resp(S('MessageResult')),
        errors={400: 'Password must be at least 8 characters. / This invitation link is invalid, expired, or already used.', 409: 'An account with this email already exists.'}),

    # ── Team ──────────────────────────────────────────────────────────────────
    ('get', '/api/manager/concierges'): dict(tag='Team', role='manager', strict=True, summary='List team members and pending invitations',
        ok=resp(S('TeamMember'), key='concierges')),
    ('post', '/api/manager/concierge'): dict(tag='Team', role='manager', strict=True, summary='Create a concierge with a password (older flow)',
        description='The manager sets the password. The app now uses invitations instead; this stays for older clients. Sends a welcome email without the password.',
        ok=resp(S('ConciergeCreated')),
        errors={400: 'Password must be at least 8 characters. / Enter a valid email address. / A concierge with this email already exists.', 404: 'Manager not found.'}),
    ('post', '/api/manager/concierge/invitations'): dict(tag='Team', role='manager', strict=True, summary='Invite a concierge by email',
        description='Emails a link that lasts 7 days. If the email fails, the response still has `invite_link` so the manager can pass it on.',
        ok=resp(S('InvitationCreated')),
        errors={400: "Enter a valid email address. / Enter the team member's name.", 404: 'Manager not found.',
                409: 'A concierge with this email already exists. / That is your own manager email. … / An active invitation already exists for this email.'}),
    ('delete', '/api/manager/concierge/invitations/{invitation_id}'): dict(tag='Team', role='manager', strict=True, summary='Cancel a pending invitation',
        description='The link stops working and the email can be invited again.',
        ok=resp(S('MessageResult')), errors={404: 'Invitation not found.'}),
    ('post', '/api/manager/concierge/{concierge_id}/resend-credentials'): dict(tag='Team', role='manager', strict=True, summary='Send a concierge a set-new-password link',
        description='Emails a 45-minute reset link and also returns it, so the manager can share it by hand if email is not working.',
        ok=resp(S('ResetLinkResult')), errors={404: 'Concierge not found.'}),
    ('delete', '/api/manager/concierge/{concierge_id}'): dict(tag='Team', role='manager', strict=True, summary='Remove a concierge',
        description='Deletes the account, signs them out everywhere, and clears resets and invitations so the email can be invited again. Their shifts and reports stay.',
        ok=resp(S('MessageResult')), errors={404: 'Concierge not found.'}),
    ('put', '/api/manager/concierge/{concierge_id}/sections'): dict(tag='Team', role='manager', strict=True, summary="Set which shift sections a concierge sees",
        description='Section id → on/off. Anything not listed stays on. `home` and `emergency` are always on.',
        ok=resp(S('SectionAccess')), errors={400: 'Too many sections.', 404: 'Concierge not found.'}),
    ('get', '/api/manager/shift-sections'): dict(tag='Team', role='manager', strict=True, summary="List the property's custom shift sections",
        ok=resp(S('CustomSections'))),
    ('put', '/api/manager/shift-sections'): dict(tag='Team', role='manager', strict=True, summary="Replace the property's custom shift sections",
        description='Up to 30. Entries with an empty id or label are dropped.',
        ok=resp(S('CustomSections')), errors={400: 'Too many custom sections.'}),
    ('get', '/api/concierge/sections'): dict(tag='Team', role='concierge', strict=True, summary='Sections the signed-in concierge may see',
        ok=resp(S('MySections')), errors={404: 'Concierge not found.'}),

    # ── Shifts ────────────────────────────────────────────────────────────────
    ('post', '/api/shifts/start'): dict(tag='Shifts', role='concierge', strict=True, summary='Clock in',
        description='Returns the open shift if already clocked in. Otherwise starts one and puts the day\'s planned tasks on the desk. `day` is the desk\'s local date (YYYY-MM-DD); more than a day from UTC is ignored.',
        ok=resp(S('Shift')), errors={404: 'Concierge not found.'}),
    ('post', '/api/shifts/end'): dict(tag='Shifts', role='concierge', strict=True, summary='Clock out without handover notes',
        ok=resp(obj({'message': STR, 'clock_out': DT})), errors={404: 'No active shift.'}),
    ('post', '/api/shifts/handover'): dict(tag='Shifts', role='concierge', strict=True, summary='Clock out with handover notes',
        description='Ends the open shift and saves notes and open items for the next person.',
        ok=resp(obj({'message': STR, 'clock_out': DT})), errors={404: 'No active shift to hand over.'}),
    ('get', '/api/shifts/active'): dict(tag='Shifts', role='any', summary='Open shift(s) with the live report',
        description='Concierge: `{"shift": Shift | null}`, their own open shift. Manager: `{"shifts": [Shift]}`, every open shift at the property (up to 20).',
        ok=resp({'oneOf': [S('ShiftResult'), obj({'shifts': ARR(S('Shift'))}, ['shifts'])]})),
    ('get', '/api/shifts/previous'): dict(tag='Shifts', role='any', summary='Most recent finished shift at the property',
        description='Whoever worked it, so the next person reads the real handoff.',
        ok=resp(S('ShiftResult'))),
    ('get', '/api/shifts/history'): dict(tag='Shifts', role='any', summary='Shift history with reports',
        description='Concierge: their own shifts. Manager: every shift at the property. Newest first, up to 200.',
        ok=resp(S('Shift'), key='shifts')),

    # ── Tasks ─────────────────────────────────────────────────────────────────
    ('get', '/api/tasks'): dict(tag='Tasks', role='any', summary='List tasks',
        description='Manager: every task at the property (newest 200). Concierge: tasks for them, tasks they logged, older tasks assigned by their name, and manager requests for nobody in particular; planned-task copies only for `day`. Loading it also puts the day\'s planned tasks on the desk.',
        ok=resp(S('Task'), key='tasks')),
    ('post', '/api/tasks'): dict(tag='Tasks', role='any', summary='Create a task or log an entry',
        description='From a manager it is a request to the desk (`source_section` defaults to `requests`) and emails the assignee when `assigned_to_id` is set. From a concierge it is a log entry on their open shift (`new-task`). `notes` falls back to `description`, `due_time` to `scheduled_time`, then `ASAP`.',
        ok=resp(S('Task'))),
    ('put', '/api/tasks/{task_id}'): dict(tag='Tasks', role='any', summary='Update a task (start, finish, decline, add evidence)',
        description='A concierge who starts, finishes or declines an unassigned request takes it over; finishing puts it in the report of their open shift.',
        ok=resp(S('Task')),
        errors={400: 'Nothing to update.', 404: 'Task not found.', 422: 'Status must be pending, in_progress, completed or declined.'}),
    ('get', '/api/scheduled-tasks'): dict(tag='Follow-ups', role='any', summary='List planned tasks (follow-ups)',
        description='Manager: all of them. Concierge: the ones they added. Each has `history`.',
        ok=resp(S('ScheduledTask'), key='scheduled_tasks')),
    ('post', '/api/scheduled-tasks'): dict(tag='Follow-ups', role='any', summary='Plan a task for later days',
        description='Manager or desk. `repeat` is once, daily, days (with `days_of_week`), weekly (on the start weekday) or monthly (on the start day). Up to 5 years ahead. `start_date` defaults to today (UTC).',
        ok=resp(S('ScheduledTask')),
        errors={422: 'start_date must use YYYY-MM-DD format. / End date must be on or after start date. / scheduled_time must use 24-hour HH:MM format. / Repeat must be once, daily, days, weekly or monthly. / Pick the days it repeats. / A planned task can run up to 5 years ahead.'}),
    ('put', '/api/scheduled-tasks/{task_id}'): dict(tag='Follow-ups', role='any', summary='Edit a planned task',
        description='Send only what changes; `clear_end_date: true` makes it run until removed. A concierge can edit only what they added. Waiting copies on the desk are rebuilt.',
        ok=resp(S('ScheduledTask')),
        errors={400: 'Nothing to update.', 404: 'Scheduled request not found.', 422: 'Same date, time and repeat rules as creating one.'}),
    ('delete', '/api/scheduled-tasks/{task_id}'): dict(tag='Follow-ups', role='any', summary='Delete a planned task',
        description='A concierge can delete only what they added. Copies not yet started leave the desk; finished ones stay in the reports.',
        ok=resp(S('MessageResult')), errors={404: 'Scheduled task not found.'}),
    ('get', '/api/schedule/calendar'): dict(tag='Follow-ups', role='any', summary='Planned tasks per day for the Shifts calendar',
        description='`start` and `end` are YYYY-MM-DD, inclusive, at most 62 days. Returns `{"days": {"YYYY-MM-DD": [CalendarItem]}}`; days with nothing planned are left out.',
        ok=resp(obj({'days': {'type': 'object', 'additionalProperties': ARR(S('CalendarItem'))}}, ['days'])),
        errors={422: 'Give a start and an end date. / Ask for at most 62 days at a time.'}),

    # ── Incidents ─────────────────────────────────────────────────────────────
    ('get', '/api/incidents'): dict(tag='Incidents', role='any', summary='List incidents at the property',
        description='Newest first, up to 200.', ok=resp(S('Incident'), key='incidents')),
    ('post', '/api/incidents'): dict(tag='Incidents', role='any', summary='File an incident',
        description='From a concierge it is tied to their open shift and emails the manager (unless they turned incident emails off).',
        ok=resp(S('Incident'))),
    ('put', '/api/incidents/{incident_id}'): dict(tag='Incidents', role='manager', summary='Update or resolve an incident',
        description='Setting `status` to `resolved` records who resolved it and when.',
        ok=resp(S('Incident')), errors={400: 'No fields to update.', 404: 'Incident not found.'}),

    # ── Messages ──────────────────────────────────────────────────────────────
    ('get', '/api/messages'): dict(tag='Messages', role='any', summary='Team messages',
        description='The property\'s one team thread, oldest first, up to 200.', ok=resp(S('ChatMessage'), key='messages')),
    ('post', '/api/messages'): dict(tag='Messages', role='any', summary='Send a team message',
        ok=resp(S('ChatMessage')), errors={400: 'Write a message first. / That message is too long.'}),
    ('get', '/api/events'): dict(tag='Messages', role='any', summary='Live updates (server-sent events)',
        description='A `text/event-stream`. Sends `event: connected` first, then every ~6 seconds either `event: update` with `{"tasks": [...], "incidents": [...]}` created since the last check, or a `:` keep-alive. Concierges only hear about manager requests for them or for nobody in particular. EventSource cannot set headers, so the token may be passed as `?token=`.',
        ok={'description': 'Event stream', 'content_type': 'text/event-stream', 'schema': {'type': 'string'}}),

    # ── Residents ─────────────────────────────────────────────────────────────
    ('get', '/api/residents'): dict(tag='Residents', role='any', summary='Resident directory',
        description='Sorted by unit, up to 2000.', ok=resp(S('Resident'), key='residents')),
    ('post', '/api/residents'): dict(tag='Residents', role='manager', summary='Add a resident', ok=resp(S('Resident'))),
    ('put', '/api/residents/{resident_id}'): dict(tag='Residents', role='manager', summary='Edit a resident',
        ok=resp(S('Resident')), errors={400: 'Nothing to update.', 404: 'Resident not found.'}),
    ('delete', '/api/residents/{resident_id}'): dict(tag='Residents', role='manager', summary='Remove a resident',
        ok=resp(S('MessageResult')), errors={404: 'Resident not found.'}),

    # ── Packages & uploads ────────────────────────────────────────────────────
    ('post', '/api/notify/package'): dict(tag='Packages', role='any', summary='Email a package-arrival notice',
        description='Emails the resident on file for the unit (if they have an email) and the manager (unless package emails are off). Records an audit entry.',
        ok=resp(S('PackageResult'))),
    ('post', '/api/upload/image'): dict(tag='Packages', role='any', summary='Upload a photo',
        description='Multipart form with `file` and optional `context`. Stored in the database and returned as a data: URL.',
        ok=resp(S('ImageUpload')), errors={401: NOT_AUTH}, no_role_error=True),

    # ── Analytics ─────────────────────────────────────────────────────────────
    ('get', '/api/analytics'): dict(tag='Analytics', role='manager', summary='Activity numbers for the property',
        description='Optional `from_date` / `to_date` (ISO date-time) filter tasks and incidents by created time and shifts by clock-in. Unreadable dates are ignored.',
        ok=resp(S('Analytics'))),
    ('get', '/api/audit'): dict(tag='Analytics', role='manager', summary='Audit trail',
        description='Append-only log of creates, updates, deletes, clock-ins and clock-outs. Newest first; `limit` defaults to 200.',
        ok=resp(S('AuditLog'), key='logs')),

    # ── Assistant ─────────────────────────────────────────────────────────────
    ('get', '/api/assistant/status'): dict(tag='Assistant', role='any', summary='Is the AI assistant available',
        description='True when ANTHROPIC_API_KEY is set on the server.', ok=resp(obj({'available': BOOL}, ['available']))),
    ('post', '/api/assistant'): dict(tag='Assistant', role='any', summary='Ask the assistant (returns a plan, saves nothing)',
        description='Sends the last 8 turns and a compact list of the property record to a small Claude model. The answer is only a plan the app acts on; nothing is saved here. Never fails the desk: problems come back as `answer: null` with a `reason`.',
        ok=resp(S('AssistantResult')), errors={400: 'Say what you need help with.'}),

    # ── Contacts ──────────────────────────────────────────────────────────────
    ('get', '/api/contacts'): dict(tag='Contacts & SOPs', role='any', summary='Contact directory (plus the manager)',
        ok=resp(S('ContactsList'))),
    ('post', '/api/contacts'): dict(tag='Contacts & SOPs', role='manager', summary='Add a contact',
        description='Up to 100 per property.', role_msg='Only the property manager can change the contact directory.',
        ok=resp(S('Contact')),
        errors={400: 'Give the contact a name and a phone number. / The contact directory is full. Remove one before adding another.'}),
    ('put', '/api/contacts/{contact_id}'): dict(tag='Contacts & SOPs', role='manager', summary='Edit a contact',
        role_msg='Only the property manager can change the contact directory.',
        ok=resp(S('Contact')), errors={400: 'Give the contact a name and a phone number.', 404: 'Contact not found.'}),
    ('delete', '/api/contacts/{contact_id}'): dict(tag='Contacts & SOPs', role='manager', summary='Delete a contact',
        role_msg='Only the property manager can change the contact directory.',
        ok=resp(obj({'deleted': BOOL})), errors={404: 'Contact not found.'}),

    # ── Knowledge (SOPs and training) ────────────────────────────────────────
    ('get', '/api/knowledge'): dict(tag='Contacts & SOPs', role='any', summary='SOPs and training items',
        description='Up to 80 per property, oldest first.', ok=resp(S('KnowledgeOut'), key='items')),
    ('put', '/api/knowledge/{item_id}'): dict(tag='Contacts & SOPs', role='manager', summary='Create or update an SOP or training item',
        description='The client picks `item_id` (letters, digits, - and _, up to 80). Needs written steps, a file, or `file_to_follow: true` when the file is uploaded next with POST …/file. An empty `data_url` keeps the current file unless `remove_file` is true. Inline `data_url` files are limited to about 8 MB.',
        role_msg='Only the property manager can change SOPs and training.',
        ok=resp(S('KnowledgeOut')),
        errors={400: 'That file could not be read. / The library is full. … / Write the steps, attach a file, or record a video to save this item.',
                413: 'That file is too large. Files up to 8 MB can be saved this way.', 422: 'kind must be sop or training. / Invalid id.'}),
    ('delete', '/api/knowledge/{item_id}'): dict(tag='Contacts & SOPs', role='manager', summary='Delete an SOP or training item',
        role_msg='Only the property manager can change SOPs and training.',
        ok=resp(obj({'deleted': BOOL})), errors={404: 'Item not found.'}),
    ('post', '/api/knowledge/{item_id}/file'): dict(tag='Contacts & SOPs', role='manager', summary='Attach a file or video to an item',
        description='Multipart `file`, up to 100 MB, stored in 4 MB chunks. Replaces the item\'s previous file.',
        role_msg='Only the property manager can change SOPs and training.',
        ok=resp(S('KnowledgeOut')),
        errors={400: 'That file is empty.', 404: 'Item not found.', 413: 'That file is too large. Files up to 100 MB can be saved; …'}),
    ('get', '/api/knowledge/{item_id}/file'): dict(tag='Contacts & SOPs', role='any', summary="Download an item's file",
        description='Streams the file with its own content type, `Content-Disposition: inline`.',
        ok={'description': 'The file', 'content_type': 'application/octet-stream', 'schema': {'type': 'string', 'format': 'binary'}},
        errors={404: 'File not found.'}),
    ('put', '/api/knowledge/{item_id}/status'): dict(tag='Contacts & SOPs', role='manager', summary='Set an item\'s status (e.g. draft, published)',
        role_msg='Only the property manager can change SOPs and training.',
        ok=resp(obj({'id': STR, 'status': STR})), errors={404: 'Item not found.'}),
    ('put', '/api/knowledge/{item_id}/completed'): dict(tag='Contacts & SOPs', role='concierge', summary='Mark training as reviewed (or not)',
        role_msg='Training is marked as reviewed by the concierge who read it.',
        ok=resp(obj({'id': STR, 'completed': BOOL})), errors={404: 'Item not found.'}),

    # ── Desk state ────────────────────────────────────────────────────────────
    ('get', '/api/desk-state'): dict(tag='Desk', role='any', summary="The desk's working lists",
        description='Packages on hand, guests, vendors, loaners, lockouts, tours, follow-ups and building notes, as the app saved them. `{"sections": {section: data}}`; sections never saved are left out.',
        ok=resp(obj({'sections': {'type': 'object', 'additionalProperties': True}}, ['sections']))),
    ('put', '/api/desk-state/{section}'): dict(tag='Desk', role='any', summary='Save one desk list',
        description='`section` is one of packages, guests, vendors, loaners, lockouts, tours, followups, building. `data` is whatever JSON the app keeps for that list, up to about 400 KB. Replaces what was there.',
        ok=resp(obj({'section': STR, 'saved': BOOL})),
        errors={404: 'Unknown desk section.', 413: 'That list is too large to save.'}),
}

TAGS = [
    ('Health', 'Is the server up, and is it set up.'),
    ('Auth', 'Sign-up, sign-in, sessions, password reset and invitation links.'),
    ('Team', 'Manager tools for concierge accounts, invitations and which shift sections each person sees.'),
    ('Shifts', 'Clock in and out, the live report (DAR), handover and history.'),
    ('Tasks', 'Requests from the manager and entries the desk logs.'),
    ('Follow-ups', 'Tasks planned for later days, once or repeating, and the calendar of them.'),
    ('Incidents', 'Incident reports.'),
    ('Messages', 'The team thread and the live update stream.'),
    ('Residents', 'Resident directory.'),
    ('Packages', 'Package notices and photo upload.'),
    ('Analytics', 'Numbers and the audit trail, for managers.'),
    ('Assistant', 'The Noted Assistant server fallback.'),
    ('Contacts & SOPs', 'Contact directory, SOPs and training material.'),
    ('Desk', 'The desk\'s working lists, kept on the server so they survive a refresh and the next shift sees them.'),
]

ROLE_TEXT = {'public': 'Public', 'any': 'Manager or concierge', 'manager': 'Manager only', 'concierge': 'Concierge only'}


def _errors(meta: dict, has_input: bool) -> dict:
    out = {}
    role = meta['role']
    if role != 'public':
        if meta.get('strict'):
            # These handlers check the session and role in one step, so no session is also a 403.
            out[403] = MGR if role == 'manager' else CON
            out[403] += ' (also returned when not signed in)'
        else:
            out[401] = NOT_AUTH
            if role in ('manager', 'concierge') and not meta.get('no_role_error'):
                out[403] = meta.get('role_msg') or (MGR if role == 'manager' else CON)
    for code, msg in (meta.get('errors') or {}).items():
        out[code] = msg
    if has_input and 422 not in out:
        out[422] = 'Request validation failed (missing or wrong-type field).'
    return dict(sorted(out.items()))


def build():
    from server import app
    spec = copy.deepcopy(app.openapi())

    spec['openapi'] = '3.1.0'
    spec['info'] = {
        'title': 'Noted API',
        'version': '2.0.0',
        'description': (
            'Backend for Noted, the front-desk operations app for residential buildings. '
            'Managers run a property; concierges work shifts at its desk.\n\n'
            '**Auth.** Sign in (or sign up) to get a session token, then send `Authorization: Bearer <token>`. '
            'The server also sets an httpOnly `session_token` cookie; the header wins when both are present. '
            'Sessions last 30 days.\n\n'
            '**Scope.** Everything is scoped to the signed-in person\'s property (their manager). '
            'Nobody can read or change another property\'s data; a record from another property answers 404.\n\n'
            '**Errors.** Errors are JSON `{"detail": "..."}` with a sentence the app can show as it is.\n\n'
            'Generated by `backend/scripts/build_api_spec.py`; see docs/api/API.md for the readable version.'
        ),
    }
    spec['servers'] = [{'url': LIVE_URL, 'description': 'Production (Render)'},
                       {'url': 'http://localhost:8001', 'description': 'Local'}]
    spec['tags'] = [{'name': n, 'description': d} for n, d in TAGS]

    comps = spec.setdefault('components', {})
    comps['securitySchemes'] = {
        'bearerAuth': {'type': 'http', 'scheme': 'bearer', 'description': 'Session token from sign-in or sign-up (sess_…).'},
        'cookieAuth': {'type': 'apiKey', 'in': 'cookie', 'name': 'session_token', 'description': 'Set by sign-in and sign-up.'},
    }
    comps['schemas'].update(SCHEMAS)
    for name in list(comps['schemas']):
        if name.startswith('Body_'):
            comps['schemas'][name].pop('title', None)

    missing = []
    for path, ops in spec['paths'].items():
        for method, op in ops.items():
            meta = META.get((method, path))
            if not meta:
                missing.append(f'{method.upper()} {path}')
                continue
            params = [p for p in op.get('parameters', []) if not (p['in'] == 'cookie' and p['name'] == 'session_token')]
            if path == '/api/events':
                for p in params:
                    if p['name'] == 'token':
                        p['description'] = 'Session token, for EventSource which cannot send headers.'
            if params:
                op['parameters'] = params
            else:
                op.pop('parameters', None)
            has_input = bool(params) or 'requestBody' in op

            op['tags'] = [meta['tag']]
            op['summary'] = meta['summary']
            desc = f"**Who:** {ROLE_TEXT[meta['role']]}."
            if meta.get('description'):
                desc += '\n\n' + meta['description']
            op['description'] = desc
            op['x-noted-role'] = meta['role']
            op['security'] = [] if meta['role'] == 'public' else [{'bearerAuth': []}, {'cookieAuth': []}]

            ok = meta['ok']
            responses = {'200': {'description': ok['description'],
                                 'content': {ok.get('content_type', 'application/json'): {'schema': ok['schema'] or {}}}}}
            for code, msg in _errors(meta, has_input).items():
                schema = S('Error')
                if isinstance(msg, tuple):
                    msg, ref = msg
                    schema = S(ref)
                if code == 422 and msg.startswith('Request validation'):
                    schema = S('HTTPValidationError')
                elif code == 422 and has_input:
                    # The handler's own 422 sentence, or FastAPI's field-by-field list.
                    msg += ' Or: request validation failed (missing or wrong-type field).'
                    schema = {'anyOf': [S('Error'), S('HTTPValidationError')]}
                responses[str(code)] = {'description': msg, 'content': {'application/json': {'schema': schema}}}
            op['responses'] = responses
    if missing:
        raise SystemExit('Add these endpoints to META in build_api_spec.py:\n  ' + '\n  '.join(missing))
    stale = [f'{m.upper()} {p}' for (m, p) in META if m not in spec['paths'].get(p, {})]
    if stale:
        raise SystemExit('These META entries no longer exist in the app:\n  ' + '\n  '.join(stale))
    return spec


# ── Markdown reference ────────────────────────────────────────────────────────

def _ref_name(schema: dict) -> str:
    if not isinstance(schema, dict):
        return ''
    if '$ref' in schema:
        return schema['$ref'].rsplit('/', 1)[-1]
    if schema.get('type') == 'array':
        return f"[{_ref_name(schema.get('items', {})) or 'object'}]"
    if 'oneOf' in schema or 'anyOf' in schema:
        return ' or '.join(_ref_name(s) or 'null' for s in schema.get('oneOf') or schema.get('anyOf'))
    if schema.get('type') == 'object':
        props = schema.get('properties', {})
        return '{ ' + ', '.join(f'{k}: {_ref_name(v) or _type(v)}' for k, v in props.items()) + ' }' if props else 'object'
    return _type(schema)


def _type(schema: dict) -> str:
    if not isinstance(schema, dict):
        return ''
    if '$ref' in schema or schema.get('type') in ('array',) or 'oneOf' in schema:
        return _ref_name(schema)
    if 'anyOf' in schema:
        kinds = [_type(s) for s in schema['anyOf'] if s.get('type') != 'null']
        return (' or '.join(kinds) or 'any') + (' (nullable)' if any(s.get('type') == 'null' for s in schema['anyOf']) else '')
    t = schema.get('type', 'any')
    if isinstance(t, list):
        t = ' or '.join(x for x in t if x != 'null') + (' (nullable)' if 'null' in t else '')
    if schema.get('format') in ('date-time', 'date'):
        t += f" ({schema['format']})"
    if schema.get('enum'):
        t += ': ' + ', '.join(f'`{e}`' for e in schema['enum'] if e != '')
    return t


def _fields_table(schema: dict, all_schemas: dict) -> list:
    props = schema.get('properties', {})
    required = set(schema.get('required', []))
    rows = ['| Field | Type | Required | Default / notes |', '|---|---|---|---|']
    for name, p in props.items():
        notes = []
        if 'default' in p and p['default'] not in (None,):
            notes.append(f"default `{json.dumps(p['default'])}`")
        for key, label in (('minLength', 'min length'), ('maxLength', 'max length')):
            if key in p:
                notes.append(f'{label} {p[key]}')
        if p.get('description'):
            notes.append(p['description'])
        rows.append(f"| `{name}` | {_type(p)} | {'yes' if name in required else ''} | {'; '.join(notes)} |")
    return rows


def to_markdown(spec: dict) -> str:
    schemas = spec['components']['schemas']
    out = [
        '# Noted API reference', '',
        'Generated from the code by `backend/scripts/build_api_spec.py`, together with the machine-readable '
        '[openapi.yaml](openapi.yaml) (OpenAPI 3.1). Open that file in Swagger Editor, Postman or Insomnia to try requests. '
        'The live server also serves its own bare spec at `/docs` and `/openapi.json`.', '',
        f'- **Production:** `{LIVE_URL}`',
        '- **Local:** `http://localhost:8001` (`cd backend && uvicorn server:app --port 8001`)', '',
        '## How it works', '',
        '- **Two roles.** A *manager* signs up and owns a property. *Concierges* (desk staff) join through an invitation from their manager.',
        '- **Auth.** `POST /api/auth/signin` (or signup) returns a `token`. Send it on every call as `Authorization: Bearer <token>`. '
        'The server also sets an httpOnly `session_token` cookie; when both are sent, the header wins. Sessions last 30 days.',
        '- **Property scope.** Every record belongs to one property (its `manager_id`). You only ever see and change your own property; '
        'an id from another property answers 404, never someone else\'s data.',
        '- **Errors** are JSON `{"detail": "<sentence>"}` the app shows as it is. `401` means not signed in (or the account was removed), '
        '`403` means the wrong role, `404` not found at your property, `409` a conflict such as an email already in use, '
        '`413` too large, `422` a field is missing or in the wrong format, `429` too many requests.',
        '- **Some endpoints answer 403 instead of 401 when not signed in.** The Team endpoints and clock in/out check the session and the role in one step. They are marked below.',
        '- **Dates** are ISO 8601 in UTC (`2026-11-14T09:30:00+00:00`). Desk dates are `YYYY-MM-DD`, times `HH:MM` (24-hour).',
        '- **Ids** are prefixed strings: `mgr_`, `con_`, `inv_`, `shift_`, `task_`, `sched_`, `inc_`, `msg_`, `res_`, `ct_`, `img_`, `log_`.', '',
        '## Endpoints at a glance', '',
        '| Method | Path | Who | What |', '|---|---|---|---|',
    ]
    by_tag = {}
    for path, ops in spec['paths'].items():
        for method, op in ops.items():
            by_tag.setdefault(op['tags'][0], []).append((method, path, op))
    order = [t['name'] for t in spec['tags']]
    for tag in order:
        for method, path, op in by_tag.get(tag, []):
            out.append(f"| `{method.upper()}` | `{path}` | {ROLE_TEXT[op['x-noted-role']]} | {op['summary']} |")
    out.append('')

    for tag in order:
        tag_desc = next(t['description'] for t in spec['tags'] if t['name'] == tag)
        out += [f'## {tag}', '', tag_desc, '']
        for method, path, op in by_tag.get(tag, []):
            out += [f"### `{method.upper()} {path}`", '', f"**{op['summary']}.** {op['description'].split(chr(10), 1)[0]}"]
            rest = op['description'].split('\n\n', 1)
            if len(rest) > 1:
                out += ['', rest[1]]
            out.append('')
            params = op.get('parameters', [])
            if params:
                out += ['| Parameter | In | Type | Required | Notes |', '|---|---|---|---|---|']
                for p in params:
                    out.append(f"| `{p['name']}` | {p['in']} | {_type(p['schema'])} | {'yes' if p.get('required') else ''} | {p.get('description', '')} |")
                out.append('')
            body = op.get('requestBody')
            if body:
                ctype, content = next(iter(body['content'].items()))
                ref = content['schema'].get('$ref', '')
                name = ref.rsplit('/', 1)[-1]
                schema = schemas.get(name, content['schema'])
                label = 'Body' + (' (multipart form)' if 'multipart' in ctype else f' (`{name}`)')
                out += [f'{label}:', ''] + _fields_table(schema, schemas) + ['']
            ok = op['responses']['200']
            ctype, content = next(iter(ok['content'].items()))
            shape = _ref_name(content['schema']) if ctype == 'application/json' else f'`{ctype}`'
            out += [f'**200:** {shape}', '']
            errs = [(c, r['description']) for c, r in op['responses'].items() if c != '200']
            if errs:
                out += ['Errors:', '']
                out += [f'- `{c}` {d}' for c, d in errs]
                out.append('')

    out += ['## Response shapes', '', 'Fields the server may send. Most fields are always there; optional ones are noted.', '']
    for name in SCHEMAS:
        schema = schemas[name]
        out += [f'### {name}', '']
        if schema.get('description'):
            out += [schema['description'], '']
        if 'allOf' in schema:
            parts = [_ref_name(s) if '$ref' in s else None for s in schema['allOf']]
            extra = next(s for s in schema['allOf'] if '$ref' not in s)
            out += [f"Everything in {', '.join(p for p in parts if p)}, plus:", ''] + _fields_table(extra, schemas) + ['']
        elif schema.get('properties'):
            out += _fields_table(schema, schemas) + ['']
    return '\n'.join(out).rstrip() + '\n'


def main():
    spec = build()
    DOCS.mkdir(parents=True, exist_ok=True)
    header = '# Noted API, OpenAPI 3.1. Generated by backend/scripts/build_api_spec.py; edit that script, not this file.\n'
    (DOCS / 'openapi.yaml').write_text(header + yaml.safe_dump(spec, sort_keys=False, allow_unicode=True, width=120))
    (DOCS / 'API.md').write_text(to_markdown(spec))
    count = sum(len(ops) for ops in spec['paths'].values())
    print(f'Wrote {DOCS / "openapi.yaml"} and {DOCS / "API.md"}: {len(spec["paths"])} paths, {count} operations.')


if __name__ == '__main__':
    main()
