# Noted API reference

Generated from the code by `backend/scripts/build_api_spec.py`, together with the machine-readable [openapi.yaml](openapi.yaml) (OpenAPI 3.1). Open that file in Swagger Editor, Postman or Insomnia to try requests. The live server also serves its own bare spec at `/docs` and `/openapi.json`.

- **Production:** `https://notes-slg9.onrender.com`
- **Local:** `http://localhost:8001` (`cd backend && uvicorn server:app --port 8001`)

## How it works

- **Two roles.** A *manager* signs up and owns a property. *Concierges* (desk staff) join through an invitation from their manager.
- **Auth.** `POST /api/auth/signin` (or signup) returns a `token`. Send it on every call as `Authorization: Bearer <token>`. The server also sets an httpOnly `session_token` cookie; when both are sent, the header wins. Sessions last 30 days.
- **Property scope.** Every record belongs to one property (its `manager_id`). You only ever see and change your own property; an id from another property answers 404, never someone else's data.
- **Errors** are JSON `{"detail": "<sentence>"}` the app shows as it is. `401` means not signed in (or the account was removed), `403` means the wrong role, `404` not found at your property, `409` a conflict such as an email already in use, `413` too large, `422` a field is missing or in the wrong format, `429` too many requests.
- **Some endpoints answer 403 instead of 401 when not signed in.** The Team endpoints and clock in/out check the session and the role in one step. They are marked below.
- **Dates** are ISO 8601 in UTC (`2026-11-14T09:30:00+00:00`). Desk dates are `YYYY-MM-DD`, times `HH:MM` (24-hour).
- **Ids** are prefixed strings: `mgr_`, `con_`, `inv_`, `shift_`, `task_`, `sched_`, `inc_`, `msg_`, `res_`, `ct_`, `img_`, `log_`.

## Endpoints at a glance

| Method | Path | Who | What |
|---|---|---|---|
| `GET` | `/api/` | Public | API name and version |
| `GET` | `/api/health` | Public | Health and setup hints |
| `GET` | `/health` | Public | Liveness check (outside /api) |
| `POST` | `/api/auth/manager/signup` | Public | Create a manager account and property |
| `POST` | `/api/auth/signin` | Public | Sign in |
| `GET` | `/api/auth/me` | Manager or concierge | Who is signed in |
| `PUT` | `/api/auth/me` | Manager or concierge | Edit own profile |
| `POST` | `/api/auth/signout` | Public | Sign out |
| `PUT` | `/api/auth/change-password` | Manager or concierge | Change own password |
| `POST` | `/api/auth/password/forgot` | Public | Email a password reset link |
| `POST` | `/api/auth/password/reset` | Public | Set a new password from a reset link |
| `GET` | `/api/auth/invitations/{token}` | Public | Check an invitation link |
| `POST` | `/api/auth/invitations/{token}/accept` | Public | Accept an invitation and set a password |
| `POST` | `/api/manager/concierge` | Manager only | Create a concierge with a password (older flow) |
| `GET` | `/api/manager/concierges` | Manager only | List team members and pending invitations |
| `POST` | `/api/manager/concierge/{concierge_id}/resend-credentials` | Manager only | Send a concierge a set-new-password link |
| `DELETE` | `/api/manager/concierge/{concierge_id}` | Manager only | Remove a concierge |
| `DELETE` | `/api/manager/concierge/invitations/{invitation_id}` | Manager only | Cancel a pending invitation |
| `POST` | `/api/manager/concierge/invitations` | Manager only | Invite a concierge by email |
| `PUT` | `/api/manager/concierge/{concierge_id}/sections` | Manager only | Set which shift sections a concierge sees |
| `GET` | `/api/manager/shift-sections` | Manager only | List the property's custom shift sections |
| `PUT` | `/api/manager/shift-sections` | Manager only | Replace the property's custom shift sections |
| `GET` | `/api/concierge/sections` | Concierge only | Sections the signed-in concierge may see |
| `POST` | `/api/shifts/start` | Concierge only | Clock in |
| `POST` | `/api/shifts/end` | Concierge only | Clock out without handover notes |
| `GET` | `/api/shifts/active` | Manager or concierge | Open shift(s) with the live report |
| `GET` | `/api/shifts/previous` | Manager or concierge | Most recent finished shift at the property |
| `GET` | `/api/shifts/history` | Manager or concierge | Shift history with reports |
| `POST` | `/api/shifts/handover` | Concierge only | Clock out with handover notes |
| `GET` | `/api/tasks` | Manager or concierge | List tasks |
| `POST` | `/api/tasks` | Manager or concierge | Create a task or log an entry |
| `PUT` | `/api/tasks/{task_id}` | Manager or concierge | Update a task (start, finish, decline, add evidence) |
| `GET` | `/api/scheduled-tasks` | Manager or concierge | List planned tasks (follow-ups) |
| `POST` | `/api/scheduled-tasks` | Manager or concierge | Plan a task for later days |
| `PUT` | `/api/scheduled-tasks/{task_id}` | Manager or concierge | Edit a planned task |
| `DELETE` | `/api/scheduled-tasks/{task_id}` | Manager or concierge | Delete a planned task |
| `GET` | `/api/schedule/calendar` | Manager or concierge | Planned tasks per day for the Shifts calendar |
| `GET` | `/api/incidents` | Manager or concierge | List incidents at the property |
| `POST` | `/api/incidents` | Manager or concierge | File an incident |
| `PUT` | `/api/incidents/{incident_id}` | Manager only | Update or resolve an incident |
| `GET` | `/api/messages` | Manager or concierge | Team messages |
| `POST` | `/api/messages` | Manager or concierge | Send a team message |
| `GET` | `/api/events` | Manager or concierge | Live updates (server-sent events) |
| `GET` | `/api/residents` | Manager or concierge | Resident directory |
| `POST` | `/api/residents` | Manager only | Add a resident |
| `PUT` | `/api/residents/{resident_id}` | Manager only | Edit a resident |
| `DELETE` | `/api/residents/{resident_id}` | Manager only | Remove a resident |
| `POST` | `/api/notify/package` | Manager or concierge | Email a package-arrival notice |
| `POST` | `/api/upload/image` | Manager or concierge | Upload a photo |
| `GET` | `/api/analytics` | Manager only | Activity numbers for the property |
| `GET` | `/api/audit` | Manager only | Audit trail |
| `GET` | `/api/assistant/status` | Manager or concierge | Is the AI assistant available |
| `POST` | `/api/assistant` | Manager or concierge | Ask the assistant (returns a plan, saves nothing) |
| `GET` | `/api/contacts` | Manager or concierge | Contact directory (plus the manager) |
| `POST` | `/api/contacts` | Manager only | Add a contact |
| `PUT` | `/api/contacts/{contact_id}` | Manager only | Edit a contact |
| `DELETE` | `/api/contacts/{contact_id}` | Manager only | Delete a contact |
| `GET` | `/api/knowledge` | Manager or concierge | SOPs and training items |
| `PUT` | `/api/knowledge/{item_id}` | Manager only | Create or update an SOP or training item |
| `DELETE` | `/api/knowledge/{item_id}` | Manager only | Delete an SOP or training item |
| `POST` | `/api/knowledge/{item_id}/file` | Manager only | Attach a file or video to an item |
| `GET` | `/api/knowledge/{item_id}/file` | Manager or concierge | Download an item's file |
| `PUT` | `/api/knowledge/{item_id}/status` | Manager only | Set an item's status (e.g. draft, published) |
| `PUT` | `/api/knowledge/{item_id}/completed` | Concierge only | Mark training as reviewed (or not) |
| `GET` | `/api/desk-state` | Manager or concierge | The desk's working lists |
| `PUT` | `/api/desk-state/{section}` | Manager or concierge | Save one desk list |

## Health

Is the server up, and is it set up.

### `GET /api/`

**API name and version.** **Who:** Public.

**200:** { message: string, version: string }

### `GET /api/health`

**Health and setup hints.** **Who:** Public.

Non-secret hints to spot deploy problems from a browser: which email provider is set (`resend`, `brevo` or `not configured`) and whether FRONTEND_URL is set.

**200:** { status: string, email: string, frontend_url_set: boolean }

### `GET /health`

**Liveness check (outside /api).** **Who:** Public.

**200:** { status: string: `healthy` }

## Auth

Sign-up, sign-in, sessions, password reset and invitation links.

### `POST /api/auth/manager/signup`

**Create a manager account and property.** **Who:** Public.

Creates the manager and signs them in (also sets the `session_token` cookie). Sends a welcome email in the background.

Body (`ManagerSignupRequest`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `first_name` | string | yes |  |
| `last_name` | string | yes |  |
| `email` | string | yes |  |
| `phone` | string | yes |  |
| `job_title` | string | yes |  |
| `property_name` | string | yes |  |
| `address` | string | yes |  |
| `city` | string | yes |  |
| `state` | string | yes |  |
| `units` | integer | yes |  |
| `password` | string | yes |  |

**200:** AuthResult

Errors:

- `400` Password must be at least 8 characters. / Enter a valid email address. / Enter your first name. / Enter at least 1 unit. / An account with this email already exists.
- `422` Request validation failed (missing or wrong-type field).

### `POST /api/auth/signin`

**Sign in.** **Who:** Public.

`role` is the role picked on the sign-in screen. If the email and password match the other role, that account is signed in instead. Concierges must be active.

Body (`SignInRequest`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `email` | string | yes |  |
| `password` | string | yes |  |
| `role` | string | yes |  |

**200:** AuthResult

Errors:

- `400` Role must be "manager" or "concierge".
- `401` Invalid email or password.
- `422` Request validation failed (missing or wrong-type field).

### `GET /api/auth/me`

**Who is signed in.** **Who:** Manager or concierge.

**200:** Profile

Errors:

- `401` Not authenticated. / User not found.

### `PUT /api/auth/me`

**Edit own profile.** **Who:** Manager or concierge.

Send any of first_name, last_name, phone. `notification_prefs` is saved for managers only. A concierge's name change also updates their open shift.

Body (`UpdateProfileRequest`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `first_name` | string (nullable) |  |  |
| `last_name` | string (nullable) |  |  |
| `phone` | string (nullable) |  |  |
| `notification_prefs` | object (nullable) |  |  |

**200:** Profile

Errors:

- `400` Enter your name. / No fields to update.
- `401` Not authenticated.
- `404` User not found.
- `422` Request validation failed (missing or wrong-type field).

### `POST /api/auth/signout`

**Sign out.** **Who:** Public.

Ends the session if there is one and clears the cookie. Always succeeds.

**200:** MessageResult

### `PUT /api/auth/change-password`

**Change own password.** **Who:** Manager or concierge.

Body (`ChangePasswordRequest`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `current_password` | string | yes |  |
| `new_password` | string | yes |  |

**200:** MessageResult

Errors:

- `400` Password must be at least 8 characters. / Current password is incorrect.
- `401` Not authenticated.
- `404` User not found.
- `422` Request validation failed (missing or wrong-type field).

### `POST /api/auth/password/forgot`

**Email a password reset link.** **Who:** Public.

Always answers the same way whether or not the email has an account. The link (FRONTEND_URL/reset-password?token=…) lasts 45 minutes. Limited to 5 requests per email per 15 minutes.

Body (`ForgotPasswordRequest`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `email` | string | yes |  |

**200:** MessageResult

Errors:

- `422` Request validation failed (missing or wrong-type field).
- `429` Too many requests. Please try again later.

### `POST /api/auth/password/reset`

**Set a new password from a reset link.** **Who:** Public.

The token works once. Signs the person out on every device.

Body (`ResetPasswordRequest`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `token` | string | yes |  |
| `password` | string | yes |  |

**200:** MessageResult

Errors:

- `400` Password must be at least 8 characters. / This reset link is invalid or has expired.
- `422` Request validation failed (missing or wrong-type field).

### `GET /api/auth/invitations/{token}`

**Check an invitation link.** **Who:** Public.

Used by the invite page before the person sets a password. Errors carry `detail.status` (`invalid`, `used`, `expired`) and `detail.message`.

| Parameter | In | Type | Required | Notes |
|---|---|---|---|---|
| `token` | path | string | yes |  |

**200:** InvitationPreview

Errors:

- `404` This invitation link is not valid.
- `410` This invitation has already been used. / This invitation has expired.
- `422` Request validation failed (missing or wrong-type field).

### `POST /api/auth/invitations/{token}/accept`

**Accept an invitation and set a password.** **Who:** Public.

Creates the concierge account. The person then signs in normally.

| Parameter | In | Type | Required | Notes |
|---|---|---|---|---|
| `token` | path | string | yes |  |

Body (`AcceptInvitationRequest`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `password` | string | yes |  |

**200:** MessageResult

Errors:

- `400` Password must be at least 8 characters. / This invitation link is invalid, expired, or already used.
- `409` An account with this email already exists.
- `422` Request validation failed (missing or wrong-type field).

## Team

Manager tools for concierge accounts, invitations and which shift sections each person sees.

### `POST /api/manager/concierge`

**Create a concierge with a password (older flow).** **Who:** Manager only.

The manager sets the password. The app now uses invitations instead; this stays for older clients. Sends a welcome email without the password.

Body (`AddConciergeRequest`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `first_name` | string | yes |  |
| `last_name` | string | yes |  |
| `email` | string | yes |  |
| `phone` | string | yes |  |
| `title` | string | yes |  |
| `password` | string | yes |  |

**200:** ConciergeCreated

Errors:

- `400` Password must be at least 8 characters. / Enter a valid email address. / A concierge with this email already exists.
- `403` Manager access required. (also returned when not signed in)
- `404` Manager not found.
- `422` Request validation failed (missing or wrong-type field).

### `GET /api/manager/concierges`

**List team members and pending invitations.** **Who:** Manager only.

**200:** { concierges: [TeamMember] }

Errors:

- `403` Manager access required. (also returned when not signed in)

### `POST /api/manager/concierge/{concierge_id}/resend-credentials`

**Send a concierge a set-new-password link.** **Who:** Manager only.

Emails a 45-minute reset link and also returns it, so the manager can share it by hand if email is not working.

| Parameter | In | Type | Required | Notes |
|---|---|---|---|---|
| `concierge_id` | path | string | yes |  |

**200:** ResetLinkResult

Errors:

- `403` Manager access required. (also returned when not signed in)
- `404` Concierge not found.
- `422` Request validation failed (missing or wrong-type field).

### `DELETE /api/manager/concierge/{concierge_id}`

**Remove a concierge.** **Who:** Manager only.

Deletes the account, signs them out everywhere, and clears resets and invitations so the email can be invited again. Their shifts and reports stay.

| Parameter | In | Type | Required | Notes |
|---|---|---|---|---|
| `concierge_id` | path | string | yes |  |

**200:** MessageResult

Errors:

- `403` Manager access required. (also returned when not signed in)
- `404` Concierge not found.
- `422` Request validation failed (missing or wrong-type field).

### `DELETE /api/manager/concierge/invitations/{invitation_id}`

**Cancel a pending invitation.** **Who:** Manager only.

The link stops working and the email can be invited again.

| Parameter | In | Type | Required | Notes |
|---|---|---|---|---|
| `invitation_id` | path | string | yes |  |

**200:** MessageResult

Errors:

- `403` Manager access required. (also returned when not signed in)
- `404` Invitation not found.
- `422` Request validation failed (missing or wrong-type field).

### `POST /api/manager/concierge/invitations`

**Invite a concierge by email.** **Who:** Manager only.

Emails a link that lasts 7 days. If the email fails, the response still has `invite_link` so the manager can pass it on.

Body (`CreateInvitationRequest`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `first_name` | string | yes |  |
| `last_name` | string | yes |  |
| `email` | string | yes |  |
| `phone` | string |  | default `""` |
| `title` | string |  | default `"Concierge"` |

**200:** InvitationCreated

Errors:

- `400` Enter a valid email address. / Enter the team member's name.
- `403` Manager access required. (also returned when not signed in)
- `404` Manager not found.
- `409` A concierge with this email already exists. / That is your own manager email. … / An active invitation already exists for this email.
- `422` Request validation failed (missing or wrong-type field).

### `PUT /api/manager/concierge/{concierge_id}/sections`

**Set which shift sections a concierge sees.** **Who:** Manager only.

Section id → on/off. Anything not listed stays on. `home` and `emergency` are always on.

| Parameter | In | Type | Required | Notes |
|---|---|---|---|---|
| `concierge_id` | path | string | yes |  |

Body (`SectionAccessRequest`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `sections` | object | yes |  |

**200:** SectionAccess

Errors:

- `400` Too many sections.
- `403` Manager access required. (also returned when not signed in)
- `404` Concierge not found.
- `422` Request validation failed (missing or wrong-type field).

### `GET /api/manager/shift-sections`

**List the property's custom shift sections.** **Who:** Manager only.

**200:** CustomSections

Errors:

- `403` Manager access required. (also returned when not signed in)

### `PUT /api/manager/shift-sections`

**Replace the property's custom shift sections.** **Who:** Manager only.

Up to 30. Entries with an empty id or label are dropped.

Body (`CustomSectionsRequest`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `custom_sections` | [CustomSection] | yes |  |

**200:** CustomSections

Errors:

- `400` Too many custom sections.
- `403` Manager access required. (also returned when not signed in)
- `422` Request validation failed (missing or wrong-type field).

### `GET /api/concierge/sections`

**Sections the signed-in concierge may see.** **Who:** Concierge only.

**200:** MySections

Errors:

- `403` Concierge access required. (also returned when not signed in)
- `404` Concierge not found.

## Shifts

Clock in and out, the live report (DAR), handover and history.

### `POST /api/shifts/start`

**Clock in.** **Who:** Concierge only.

Returns the open shift if already clocked in. Otherwise starts one and puts the day's planned tasks on the desk. `day` is the desk's local date (YYYY-MM-DD); more than a day from UTC is ignored.

| Parameter | In | Type | Required | Notes |
|---|---|---|---|---|
| `day` | query | string (nullable) |  |  |

**200:** Shift

Errors:

- `403` Concierge access required. (also returned when not signed in)
- `404` Concierge not found.
- `422` Request validation failed (missing or wrong-type field).

### `POST /api/shifts/end`

**Clock out without handover notes.** **Who:** Concierge only.

**200:** { message: string, clock_out: string (date-time) }

Errors:

- `403` Concierge access required. (also returned when not signed in)
- `404` No active shift.

### `GET /api/shifts/active`

**Open shift(s) with the live report.** **Who:** Manager or concierge.

Concierge: `{"shift": Shift | null}`, their own open shift. Manager: `{"shifts": [Shift]}`, every open shift at the property (up to 20).

**200:** ShiftResult or { shifts: [Shift] }

Errors:

- `401` Not authenticated.

### `GET /api/shifts/previous`

**Most recent finished shift at the property.** **Who:** Manager or concierge.

Whoever worked it, so the next person reads the real handoff.

**200:** ShiftResult

Errors:

- `401` Not authenticated.

### `GET /api/shifts/history`

**Shift history with reports.** **Who:** Manager or concierge.

Concierge: their own shifts. Manager: every shift at the property. Newest first, up to 200.

**200:** { shifts: [Shift] }

Errors:

- `401` Not authenticated.

### `POST /api/shifts/handover`

**Clock out with handover notes.** **Who:** Concierge only.

Ends the open shift and saves notes and open items for the next person.

Body (`ShiftHandoverRequest`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `handover_notes` | string |  | default `""` |
| `open_items` | [string] (nullable) |  | default `[]` |

**200:** { message: string, clock_out: string (date-time) }

Errors:

- `403` Concierge access required. (also returned when not signed in)
- `404` No active shift to hand over.
- `422` Request validation failed (missing or wrong-type field).

## Tasks

Requests from the manager and entries the desk logs.

### `GET /api/tasks`

**List tasks.** **Who:** Manager or concierge.

Manager: every task at the property (newest 200). Concierge: tasks for them, tasks they logged, older tasks assigned by their name, and manager requests for nobody in particular; planned-task copies only for `day`. Loading it also puts the day's planned tasks on the desk.

| Parameter | In | Type | Required | Notes |
|---|---|---|---|---|
| `day` | query | string (nullable) |  |  |

**200:** { tasks: [Task] }

Errors:

- `401` Not authenticated.
- `422` Request validation failed (missing or wrong-type field).

### `POST /api/tasks`

**Create a task or log an entry.** **Who:** Manager or concierge.

From a manager it is a request to the desk (`source_section` defaults to `requests`) and emails the assignee when `assigned_to_id` is set. From a concierge it is a log entry on their open shift (`new-task`). `notes` falls back to `description`, `due_time` to `scheduled_time`, then `ASAP`.

Body (`TaskCreate`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `title` | string | yes |  |
| `description` | string (nullable) |  |  |
| `notes` | string (nullable) |  |  |
| `category` | string (nullable) |  |  |
| `instructions` | string (nullable) |  |  |
| `scheduled_time` | string (nullable) |  |  |
| `due_time` | string (nullable) |  |  |
| `time_window` | string (nullable) |  |  |
| `priority` | string |  | default `"Standard"` |
| `requires_photo` | boolean |  | default `false` |
| `assigned_to` | string (nullable) |  |  |
| `assigned_to_id` | string (nullable) |  |  |
| `source_section` | string (nullable) |  |  |
| `evidence_urls` | [string] (nullable) |  |  |

**200:** Task

Errors:

- `401` Not authenticated.
- `422` Request validation failed (missing or wrong-type field).

### `PUT /api/tasks/{task_id}`

**Update a task (start, finish, decline, add evidence).** **Who:** Manager or concierge.

A concierge who starts, finishes or declines an unassigned request takes it over; finishing puts it in the report of their open shift.

| Parameter | In | Type | Required | Notes |
|---|---|---|---|---|
| `task_id` | path | string | yes |  |

Body (`TaskUpdate`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `status` | string (nullable) |  |  |
| `completion_note` | string (nullable) |  |  |
| `evidence_url` | string (nullable) |  |  |
| `evidence_urls` | [string] (nullable) |  |  |

**200:** Task

Errors:

- `400` Nothing to update.
- `401` Not authenticated.
- `404` Task not found.
- `422` Status must be pending, in_progress, completed or declined. Or: request validation failed (missing or wrong-type field).

## Follow-ups

Tasks planned for later days, once or repeating, and the calendar of them.

### `GET /api/scheduled-tasks`

**List planned tasks (follow-ups).** **Who:** Manager or concierge.

Manager: all of them. Concierge: the ones they added. Each has `history`.

**200:** { scheduled_tasks: [ScheduledTask] }

Errors:

- `401` Not authenticated.

### `POST /api/scheduled-tasks`

**Plan a task for later days.** **Who:** Manager or concierge.

Manager or desk. `repeat` is once, daily, days (with `days_of_week`), weekly (on the start weekday) or monthly (on the start day). Up to 5 years ahead. `start_date` defaults to today (UTC).

Body (`ScheduledTaskCreate`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `title` | string | yes |  |
| `notes` | string (nullable) |  | default `""` |
| `category` | string (nullable) |  | default `"Administrative"` |
| `priority` | string (nullable) |  | default `"Standard"` |
| `recurrence` | string |  | default `"shift_start"` |
| `scheduled_hour` | integer (nullable) |  | default `8` |
| `shift_window` | string (nullable) |  | default `"all"` |
| `assigned_concierge_id` | string (nullable) |  | default `""` |
| `assigned_concierge_name` | string (nullable) |  | default `""` |
| `assigned_to` | string (nullable) |  | default `""` |
| `assigned_to_id` | string (nullable) |  | default `""` |
| `start_date` | string (nullable) |  |  |
| `end_date` | string (nullable) |  |  |
| `scheduled_time` | string (nullable) |  | default `"08:00"` |
| `days_of_week` | [integer] (nullable) |  |  |
| `repeat` | string (nullable) |  |  |
| `end_time` | string (nullable) |  | default `""` |
| `active` | boolean |  | default `true` |

**200:** ScheduledTask

Errors:

- `401` Not authenticated.
- `422` start_date must use YYYY-MM-DD format. / End date must be on or after start date. / scheduled_time must use 24-hour HH:MM format. / Repeat must be once, daily, days, weekly or monthly. / Pick the days it repeats. / A planned task can run up to 5 years ahead. Or: request validation failed (missing or wrong-type field).

### `PUT /api/scheduled-tasks/{task_id}`

**Edit a planned task.** **Who:** Manager or concierge.

Send only what changes; `clear_end_date: true` makes it run until removed. A concierge can edit only what they added. Waiting copies on the desk are rebuilt.

| Parameter | In | Type | Required | Notes |
|---|---|---|---|---|
| `task_id` | path | string | yes |  |

Body (`ScheduledTaskUpdate`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `active` | boolean (nullable) |  |  |
| `title` | string (nullable) |  |  |
| `notes` | string (nullable) |  |  |
| `category` | string (nullable) |  |  |
| `priority` | string (nullable) |  |  |
| `recurrence` | string (nullable) |  |  |
| `scheduled_hour` | integer (nullable) |  |  |
| `scheduled_time` | string (nullable) |  |  |
| `shift_window` | string (nullable) |  |  |
| `assigned_concierge_id` | string (nullable) |  |  |
| `assigned_concierge_name` | string (nullable) |  |  |
| `assigned_to` | string (nullable) |  |  |
| `assigned_to_id` | string (nullable) |  |  |
| `start_date` | string (nullable) |  |  |
| `end_date` | string (nullable) |  |  |
| `days_of_week` | [integer] (nullable) |  |  |
| `repeat` | string (nullable) |  |  |
| `end_time` | string (nullable) |  |  |
| `clear_end_date` | boolean (nullable) |  |  |

**200:** ScheduledTask

Errors:

- `400` Nothing to update.
- `401` Not authenticated.
- `404` Scheduled request not found.
- `422` Same date, time and repeat rules as creating one. Or: request validation failed (missing or wrong-type field).

### `DELETE /api/scheduled-tasks/{task_id}`

**Delete a planned task.** **Who:** Manager or concierge.

A concierge can delete only what they added. Copies not yet started leave the desk; finished ones stay in the reports.

| Parameter | In | Type | Required | Notes |
|---|---|---|---|---|
| `task_id` | path | string | yes |  |

**200:** MessageResult

Errors:

- `401` Not authenticated.
- `404` Scheduled task not found.
- `422` Request validation failed (missing or wrong-type field).

### `GET /api/schedule/calendar`

**Planned tasks per day for the Shifts calendar.** **Who:** Manager or concierge.

`start` and `end` are YYYY-MM-DD, inclusive, at most 62 days. Returns `{"days": {"YYYY-MM-DD": [CalendarItem]}}`; days with nothing planned are left out.

| Parameter | In | Type | Required | Notes |
|---|---|---|---|---|
| `start` | query | string | yes |  |
| `end` | query | string | yes |  |

**200:** { days: object }

Errors:

- `401` Not authenticated.
- `422` Give a start and an end date. / Ask for at most 62 days at a time. Or: request validation failed (missing or wrong-type field).

## Incidents

Incident reports.

### `GET /api/incidents`

**List incidents at the property.** **Who:** Manager or concierge.

Newest first, up to 200.

**200:** { incidents: [Incident] }

Errors:

- `401` Not authenticated.

### `POST /api/incidents`

**File an incident.** **Who:** Manager or concierge.

From a concierge it is tied to their open shift and emails the manager (unless they turned incident emails off).

Body (`IncidentCreate`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `type` | string | yes |  |
| `location` | string | yes |  |
| `description` | string | yes |  |
| `severity` | string |  | default `"medium"` |
| `notes` | string (nullable) |  |  |
| `unit_number` | string (nullable) |  |  |
| `person_involved` | string (nullable) |  |  |
| `evidence_urls` | [string] (nullable) |  |  |

**200:** Incident

Errors:

- `401` Not authenticated.
- `422` Request validation failed (missing or wrong-type field).

### `PUT /api/incidents/{incident_id}`

**Update or resolve an incident.** **Who:** Manager only.

Setting `status` to `resolved` records who resolved it and when.

| Parameter | In | Type | Required | Notes |
|---|---|---|---|---|
| `incident_id` | path | string | yes |  |

Body (`IncidentUpdate`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `status` | string (nullable) |  |  |
| `resolved_note` | string (nullable) |  |  |

**200:** Incident

Errors:

- `400` No fields to update.
- `401` Not authenticated.
- `403` Manager access required.
- `404` Incident not found.
- `422` Request validation failed (missing or wrong-type field).

## Messages

The team thread and the live update stream.

### `GET /api/messages`

**Team messages.** **Who:** Manager or concierge.

The property's one team thread, oldest first, up to 200.

**200:** { messages: [ChatMessage] }

Errors:

- `401` Not authenticated.

### `POST /api/messages`

**Send a team message.** **Who:** Manager or concierge.

Body (`MessageCreate`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `content` | string | yes |  |
| `message_type` | string |  | default `"text"` |

**200:** ChatMessage

Errors:

- `400` Write a message first. / That message is too long.
- `401` Not authenticated.
- `422` Request validation failed (missing or wrong-type field).

### `GET /api/events`

**Live updates (server-sent events).** **Who:** Manager or concierge.

A `text/event-stream`. Sends `event: connected` first, then every ~6 seconds either `event: update` with `{"tasks": [...], "incidents": [...]}` created since the last check, or a `:` keep-alive. Concierges only hear about manager requests for them or for nobody in particular. EventSource cannot set headers, so the token may be passed as `?token=`.

| Parameter | In | Type | Required | Notes |
|---|---|---|---|---|
| `token` | query | string (nullable) |  | Session token, for EventSource which cannot send headers. |

**200:** `text/event-stream`

Errors:

- `401` Not authenticated.
- `422` Request validation failed (missing or wrong-type field).

## Residents

Resident directory.

### `GET /api/residents`

**Resident directory.** **Who:** Manager or concierge.

Sorted by unit, up to 2000.

**200:** { residents: [Resident] }

Errors:

- `401` Not authenticated.

### `POST /api/residents`

**Add a resident.** **Who:** Manager only.

Body (`ResidentCreate`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `name` | string | yes |  |
| `unit` | string | yes |  |
| `phone` | string (nullable) |  | default `""` |
| `email` | string (nullable) |  | default `""` |
| `notes` | string (nullable) |  | default `""` |

**200:** Resident

Errors:

- `401` Not authenticated.
- `403` Manager access required.
- `422` Request validation failed (missing or wrong-type field).

### `PUT /api/residents/{resident_id}`

**Edit a resident.** **Who:** Manager only.

| Parameter | In | Type | Required | Notes |
|---|---|---|---|---|
| `resident_id` | path | string | yes |  |

Body (`ResidentUpdate`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `name` | string (nullable) |  |  |
| `unit` | string (nullable) |  |  |
| `phone` | string (nullable) |  |  |
| `email` | string (nullable) |  |  |
| `notes` | string (nullable) |  |  |

**200:** Resident

Errors:

- `400` Nothing to update.
- `401` Not authenticated.
- `403` Manager access required.
- `404` Resident not found.
- `422` Request validation failed (missing or wrong-type field).

### `DELETE /api/residents/{resident_id}`

**Remove a resident.** **Who:** Manager only.

| Parameter | In | Type | Required | Notes |
|---|---|---|---|---|
| `resident_id` | path | string | yes |  |

**200:** MessageResult

Errors:

- `401` Not authenticated.
- `403` Manager access required.
- `404` Resident not found.
- `422` Request validation failed (missing or wrong-type field).

## Packages

Package notices and photo upload.

### `POST /api/notify/package`

**Email a package-arrival notice.** **Who:** Manager or concierge.

Emails the resident on file for the unit (if they have an email) and the manager (unless package emails are off). Records an audit entry.

Body (`PackageNotifyRequest`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `unit` | string | yes |  |
| `carrier` | string (nullable) |  | default `""` |
| `count` | integer (nullable) |  | default `1` |
| `resident_name` | string (nullable) |  | default `""` |
| `photo_url` | string (nullable) |  |  |

**200:** PackageResult

Errors:

- `401` Not authenticated.
- `422` Request validation failed (missing or wrong-type field).

### `POST /api/upload/image`

**Upload a photo.** **Who:** Manager or concierge.

Multipart form with `file` and optional `context`. Stored in the database and returned as a data: URL.

Body (multipart form):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `file` | string | yes |  |
| `context` | string |  | default `"general"` |

**200:** ImageUpload

Errors:

- `401` Not authenticated.
- `422` Request validation failed (missing or wrong-type field).

## Analytics

Numbers and the audit trail, for managers.

### `GET /api/analytics`

**Activity numbers for the property.** **Who:** Manager only.

Optional `from_date` / `to_date` (ISO date-time) filter tasks and incidents by created time and shifts by clock-in. Unreadable dates are ignored.

| Parameter | In | Type | Required | Notes |
|---|---|---|---|---|
| `from_date` | query | string (nullable) |  |  |
| `to_date` | query | string (nullable) |  |  |

**200:** Analytics

Errors:

- `401` Not authenticated.
- `403` Manager access required.
- `422` Request validation failed (missing or wrong-type field).

### `GET /api/audit`

**Audit trail.** **Who:** Manager only.

Append-only log of creates, updates, deletes, clock-ins and clock-outs. Newest first; `limit` defaults to 200.

| Parameter | In | Type | Required | Notes |
|---|---|---|---|---|
| `limit` | query | integer |  |  |

**200:** { logs: [AuditLog] }

Errors:

- `401` Not authenticated.
- `403` Manager access required.
- `422` Request validation failed (missing or wrong-type field).

## Assistant

The Noted Assistant server fallback.

### `GET /api/assistant/status`

**Is the AI assistant available.** **Who:** Manager or concierge.

True when ANTHROPIC_API_KEY is set on the server.

**200:** { available: boolean }

Errors:

- `401` Not authenticated.

### `POST /api/assistant`

**Ask the assistant (returns a plan, saves nothing).** **Who:** Manager or concierge.

Sends the last 8 turns and a compact list of the property record to a small Claude model. The answer is only a plan the app acts on; nothing is saved here. Never fails the desk: problems come back as `answer: null` with a `reason`.

Body (`AssistantRequest`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `messages` | [AssistantTurn] |  | default `[]` |
| `today` | string (nullable) |  |  |
| `weekday` | string (nullable) |  |  |
| `now` | string (nullable) |  |  |
| `name` | string (nullable) |  |  |

**200:** AssistantResult

Errors:

- `400` Say what you need help with.
- `401` Not authenticated.
- `422` Request validation failed (missing or wrong-type field).

## Contacts & SOPs

Contact directory, SOPs and training material.

### `GET /api/contacts`

**Contact directory (plus the manager).** **Who:** Manager or concierge.

**200:** ContactsList

Errors:

- `401` Not authenticated.

### `POST /api/contacts`

**Add a contact.** **Who:** Manager only.

Up to 100 per property.

Body (`ContactCreate`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `label` | string | yes | min length 1; max length 80 |
| `number` | string | yes | min length 3; max length 40 |
| `category` | string |  | default `"Building & vendors"`; max length 40 |
| `role` | string |  | default `""`; max length 80 |

**200:** Contact

Errors:

- `400` Give the contact a name and a phone number. / The contact directory is full. Remove one before adding another.
- `401` Not authenticated.
- `403` Only the property manager can change the contact directory.
- `422` Request validation failed (missing or wrong-type field).

### `PUT /api/contacts/{contact_id}`

**Edit a contact.** **Who:** Manager only.

| Parameter | In | Type | Required | Notes |
|---|---|---|---|---|
| `contact_id` | path | string | yes |  |

Body (`ContactCreate`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `label` | string | yes | min length 1; max length 80 |
| `number` | string | yes | min length 3; max length 40 |
| `category` | string |  | default `"Building & vendors"`; max length 40 |
| `role` | string |  | default `""`; max length 80 |

**200:** Contact

Errors:

- `400` Give the contact a name and a phone number.
- `401` Not authenticated.
- `403` Only the property manager can change the contact directory.
- `404` Contact not found.
- `422` Request validation failed (missing or wrong-type field).

### `DELETE /api/contacts/{contact_id}`

**Delete a contact.** **Who:** Manager only.

| Parameter | In | Type | Required | Notes |
|---|---|---|---|---|
| `contact_id` | path | string | yes |  |

**200:** { deleted: boolean }

Errors:

- `401` Not authenticated.
- `403` Only the property manager can change the contact directory.
- `404` Contact not found.
- `422` Request validation failed (missing or wrong-type field).

### `GET /api/knowledge`

**SOPs and training items.** **Who:** Manager or concierge.

Up to 80 per property, oldest first.

**200:** { items: [KnowledgeOut] }

Errors:

- `401` Not authenticated.

### `PUT /api/knowledge/{item_id}`

**Create or update an SOP or training item.** **Who:** Manager only.

The client picks `item_id` (letters, digits, - and _, up to 80). Needs written steps, a file, or `file_to_follow: true` when the file is uploaded next with POST …/file. An empty `data_url` keeps the current file unless `remove_file` is true. Inline `data_url` files are limited to about 8 MB.

| Parameter | In | Type | Required | Notes |
|---|---|---|---|---|
| `item_id` | path | string | yes |  |

Body (`KnowledgeItem`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `kind` | string | yes |  |
| `title` | string | yes | min length 1; max length 160 |
| `category` | string |  | default `"Other"`; max length 80 |
| `body` | string |  | default `""`; max length 20000 |
| `file_name` | string |  | default `""`; max length 200 |
| `file_type` | string |  | default `"pdf"`; max length 20 |
| `data_url` | string |  | default `""` |
| `status` | string (nullable) |  |  |
| `file_to_follow` | boolean |  | default `false` |
| `remove_file` | boolean |  | default `false` |

**200:** KnowledgeOut

Errors:

- `400` That file could not be read. / The library is full. … / Write the steps, attach a file, or record a video to save this item.
- `401` Not authenticated.
- `403` Only the property manager can change SOPs and training.
- `413` That file is too large. Files up to 8 MB can be saved this way.
- `422` kind must be sop or training. / Invalid id. Or: request validation failed (missing or wrong-type field).

### `DELETE /api/knowledge/{item_id}`

**Delete an SOP or training item.** **Who:** Manager only.

| Parameter | In | Type | Required | Notes |
|---|---|---|---|---|
| `item_id` | path | string | yes |  |

**200:** { deleted: boolean }

Errors:

- `401` Not authenticated.
- `403` Only the property manager can change SOPs and training.
- `404` Item not found.
- `422` Request validation failed (missing or wrong-type field).

### `POST /api/knowledge/{item_id}/file`

**Attach a file or video to an item.** **Who:** Manager only.

Multipart `file`, up to 100 MB, stored in 4 MB chunks. Replaces the item's previous file.

| Parameter | In | Type | Required | Notes |
|---|---|---|---|---|
| `item_id` | path | string | yes |  |

Body (multipart form):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `file` | string | yes |  |

**200:** KnowledgeOut

Errors:

- `400` That file is empty.
- `401` Not authenticated.
- `403` Only the property manager can change SOPs and training.
- `404` Item not found.
- `413` That file is too large. Files up to 100 MB can be saved; …
- `422` Request validation failed (missing or wrong-type field).

### `GET /api/knowledge/{item_id}/file`

**Download an item's file.** **Who:** Manager or concierge.

Streams the file with its own content type, `Content-Disposition: inline`.

| Parameter | In | Type | Required | Notes |
|---|---|---|---|---|
| `item_id` | path | string | yes |  |

**200:** `application/octet-stream`

Errors:

- `401` Not authenticated.
- `404` File not found.
- `422` Request validation failed (missing or wrong-type field).

### `PUT /api/knowledge/{item_id}/status`

**Set an item's status (e.g. draft, published).** **Who:** Manager only.

| Parameter | In | Type | Required | Notes |
|---|---|---|---|---|
| `item_id` | path | string | yes |  |

Body (`KnowledgeStatus`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `status` | string | yes | max length 20 |

**200:** { id: string, status: string }

Errors:

- `401` Not authenticated.
- `403` Only the property manager can change SOPs and training.
- `404` Item not found.
- `422` Request validation failed (missing or wrong-type field).

### `PUT /api/knowledge/{item_id}/completed`

**Mark training as reviewed (or not).** **Who:** Concierge only.

| Parameter | In | Type | Required | Notes |
|---|---|---|---|---|
| `item_id` | path | string | yes |  |

Body (`KnowledgeCompletion`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `completed` | boolean |  | default `true` |

**200:** { id: string, completed: boolean }

Errors:

- `401` Not authenticated.
- `403` Training is marked as reviewed by the concierge who read it.
- `404` Item not found.
- `422` Request validation failed (missing or wrong-type field).

## Desk

The desk's working lists, kept on the server so they survive a refresh and the next shift sees them.

### `GET /api/desk-state`

**The desk's working lists.** **Who:** Manager or concierge.

Packages on hand, guests, vendors, loaners, lockouts, tours, follow-ups and building notes, as the app saved them. `{"sections": {section: data}}`; sections never saved are left out.

**200:** { sections: object }

Errors:

- `401` Not authenticated.

### `PUT /api/desk-state/{section}`

**Save one desk list.** **Who:** Manager or concierge.

`section` is one of packages, guests, vendors, loaners, lockouts, tours, followups, building. `data` is whatever JSON the app keeps for that list, up to about 400 KB. Replaces what was there.

| Parameter | In | Type | Required | Notes |
|---|---|---|---|---|
| `section` | path | string | yes |  |

Body (`DeskState`):

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `data` | any |  |  |

**200:** { section: string, saved: boolean }

Errors:

- `401` Not authenticated.
- `404` Unknown desk section.
- `413` That list is too large to save.
- `422` Request validation failed (missing or wrong-type field).

## Response shapes

Fields the server may send. Most fields are always there; optional ones are noted.

### Error

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `detail` | string or object | yes | A sentence the app can show as it is. A few endpoints send an object instead (see GET /api/auth/invitations/{token}). |

### MessageResult

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `message` | string | yes |  |

### NotificationPrefs

Which emails the manager gets. Both default to true.

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `incident` | boolean |  |  |
| `package` | boolean |  |  |

### Profile

The signed-in person. `notification_prefs` is sent for managers only, `manager_id` for concierges only.

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `user_type` | string: `manager`, `concierge` | yes |  |
| `user_id` | string | yes | mgr_… for a manager, con_… for a concierge. |
| `name` | string | yes |  |
| `first_name` | string |  |  |
| `last_name` | string |  |  |
| `email` | string | yes |  |
| `phone` | string |  |  |
| `property_name` | string | yes |  |
| `property_address` | string |  | Street · City, State, from the manager record. |
| `title` | string |  |  |
| `manager_id` | string |  | Concierges only: the manager (property) they belong to. |
| `notification_prefs` | NotificationPrefs |  |  |

### AuthResult

Everything in Profile, plus:

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `token` | string | yes | Session token (sess_…). Send it as `Authorization: Bearer <token>`. Lasts 30 days. |

### InvitationPreview

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `status` | string: `valid` | yes |  |
| `email` | string | yes |  |
| `name` | string | yes |  |
| `property_name` | string | yes |  |
| `role` | string: `concierge` | yes |  |
| `expires_at` | string (date-time) | yes |  |

### InvitationProblem

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `detail` | object |  |  |

### TeamMember

A concierge account, or a pending invitation (status `invited`).

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `concierge_id` | string |  | Missing on a pending invitation. |
| `invitation_id` | string |  | Only on a pending invitation (status `invited`). |
| `first_name` | string | yes |  |
| `last_name` | string | yes |  |
| `email` | string | yes |  |
| `phone` | string |  |  |
| `title` | string |  |  |
| `manager_id` | string |  |  |
| `property_name` | string |  |  |
| `is_active` | boolean |  |  |
| `status` | string: `on_shift`, `active`, `invited` | yes |  |
| `on_shift_since` | string (date-time) |  |  |
| `shift_count` | integer |  |  |
| `section_access` | object |  |  |
| `created_at` | string (date-time) |  |  |

### ConciergeCreated

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `concierge_id` | string |  |  |
| `first_name` | string |  |  |
| `last_name` | string |  |  |
| `email` | string |  |  |
| `title` | string |  |  |
| `phone` | string |  |  |
| `property_name` | string |  |  |
| `message` | string |  |  |

### InvitationCreated

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `invitation_id` | string |  |  |
| `email` | string |  |  |
| `first_name` | string |  |  |
| `last_name` | string |  |  |
| `title` | string |  |  |
| `property_name` | string |  |  |
| `expires_at` | string (date-time) |  |  |
| `invite_link` | string |  | FRONTEND_URL/invite/<token>. Shown to the manager so it can be shared by hand if the email fails. |
| `email_sent` | boolean |  |  |
| `email_error` | string |  |  |
| `message` | string |  |  |

### ResetLinkResult

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `message` | string |  |  |
| `email_sent` | boolean |  |  |
| `email_error` | string |  |  |
| `reset_link` | string |  | FRONTEND_URL/reset-password?token=…, valid 45 minutes. |

### SectionAccess

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `concierge_id` | string |  |  |
| `sections` | object |  | Section id → visible. `home` and `emergency` are always true. |

### CustomSection

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `id` | string | yes |  |
| `label` | string | yes |  |
| `desc` | string |  |  |

### CustomSections

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `custom_sections` | [CustomSection] | yes |  |

### MySections

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `sections` | object |  |  |
| `custom_sections` | [CustomSection] |  |  |

### Task

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `task_id` | string | yes |  |
| `manager_id` | string |  |  |
| `shift_id` | string (nullable) |  |  |
| `title` | string | yes |  |
| `notes` | string |  |  |
| `category` | string |  |  |
| `priority` | string |  | Low, Standard or High. |
| `status` | string: `pending`, `in_progress`, `completed`, `declined`, `not_done` | yes | `not_done` appears only in shift reports, for desk work still open when the shift ended. |
| `requires_photo` | boolean |  |  |
| `assigned_to` | string (nullable) |  |  |
| `assigned_to_id` | string (nullable) |  |  |
| `source_section` | string |  | Where it came from: `requests` (manager), `new-task` (desk), `scheduled` (a planned task), or a desk section id. |
| `due_time` | string |  | HH:MM or `ASAP`. |
| `completion_note` | string (nullable) |  |  |
| `evidence_url` | string (nullable) |  |  |
| `evidence_urls` | [string] |  |  |
| `created_by` | string |  |  |
| `created_by_name` | string |  |  |
| `created_by_type` | string: `manager`, `concierge` |  |  |
| `created_at` | string (date-time) |  |  |
| `completed_at` | string (date-time) |  |  |
| `completed_by_name` | string |  |  |
| `completed_shift_id` | string |  |  |
| `declined_at` | string (date-time) |  |  |
| `declined_by_name` | string |  |  |
| `scheduled_task_id` | string |  | Set on a day's copy of a planned task. |
| `occurrence_date` | string (date) |  |  |
| `scheduled_time` | string |  |  |
| `end_time` | string |  |  |
| `scheduled_by_type` | string |  |  |
| `assigned_at` | string (date-time) |  | Shift reports only: when it was assigned (created_at then holds when it was finished). |
| `not_done` | boolean |  |  |

### PlanHistory

How often a planned task was done, with up to 14 recent days.

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `done_count` | integer |  |  |
| `last_done` | object (nullable) |  |  |
| `recent` | [{ date: string (date), status: string, by: string, note: string }] |  |  |

### ScheduledTask

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `scheduled_task_id` | string | yes |  |
| `manager_id` | string |  |  |
| `title` | string | yes |  |
| `notes` | string |  |  |
| `category` | string |  |  |
| `priority` | string |  |  |
| `recurrence` | string |  |  |
| `scheduled_hour` | integer (nullable) |  |  |
| `shift_window` | string |  |  |
| `assigned_concierge_id` | string |  |  |
| `assigned_concierge_name` | string |  |  |
| `assigned_to` | string |  |  |
| `assigned_to_id` | string |  |  |
| `start_date` | string (date) | yes |  |
| `end_date` | string (nullable) (date) |  |  |
| `repeat` | string: `once`, `daily`, `days`, `weekly`, `monthly` | yes |  |
| `days_of_week` | [integer] |  | 0 = Monday … 6 = Sunday. |
| `scheduled_time` | string |  | HH:MM, 24-hour. |
| `end_time` | string |  |  |
| `active` | boolean |  |  |
| `created_by` | string |  |  |
| `created_by_name` | string |  |  |
| `created_by_type` | string |  |  |
| `created_at` | string (date-time) |  |  |
| `history` | PlanHistory |  |  |

### CalendarItem

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `scheduled_task_id` | string |  |  |
| `title` | string |  |  |
| `notes` | string |  |  |
| `category` | string |  |  |
| `time` | string |  |  |
| `end_time` | string |  |  |
| `repeat` | string |  |  |
| `for_name` | string |  |  |
| `added_by` | string |  |  |
| `added_by_type` | string |  |  |
| `mine` | boolean |  | True when the caller may edit it (managers: always; desk: what it added). |
| `status` | string |  | `planned` until a copy exists, then that copy's status. |
| `done_by` | string |  |  |

### Incident

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `incident_id` | string | yes |  |
| `manager_id` | string |  |  |
| `shift_id` | string (nullable) |  |  |
| `type` | string | yes |  |
| `location` | string | yes |  |
| `description` | string | yes |  |
| `severity` | string |  | low, medium, high or critical. |
| `notes` | string (nullable) |  |  |
| `unit_number` | string |  |  |
| `person_involved` | string |  |  |
| `evidence_urls` | [string] |  |  |
| `status` | string | yes | Starts as `new`; the manager sets it (e.g. `resolved`). |
| `created_by` | string |  | Name of the person who filed it. |
| `created_by_type` | string |  |  |
| `created_at` | string (date-time) |  |  |
| `resolved_at` | string (date-time) |  |  |
| `resolved_by` | string |  |  |
| `resolved_note` | string |  |  |

### Shift

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `shift_id` | string | yes |  |
| `concierge_id` | string | yes |  |
| `concierge_name` | string |  |  |
| `manager_id` | string |  |  |
| `property_name` | string |  |  |
| `status` | string: `active`, `completed` | yes |  |
| `clock_in` | string (date-time) | yes |  |
| `clock_out` | string (nullable) (date-time) |  |  |
| `created_at` | string (date-time) |  |  |
| `handover_notes` | string |  |  |
| `open_items` | [string] |  |  |
| `activities` | [Task] |  | What was done on the shift (the DAR), oldest first, plus `not_done` desk work once it has ended. |
| `incidents` | [Incident] |  |  |

### ShiftResult

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `shift` | Shift (nullable) | yes |  |

### ChatMessage

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `message_id` | string |  |  |
| `manager_id` | string |  |  |
| `content` | string |  |  |
| `message_type` | string |  |  |
| `sender_name` | string |  |  |
| `sender_id` | string |  |  |
| `sender_type` | string: `manager`, `concierge` |  |  |
| `created_at` | string (date-time) |  |  |

### Resident

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `resident_id` | string | yes |  |
| `manager_id` | string |  |  |
| `name` | string | yes |  |
| `unit` | string | yes |  |
| `phone` | string |  |  |
| `email` | string |  |  |
| `notes` | string |  |  |
| `created_at` | string (date-time) |  |  |

### Analytics

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `totals` | object |  |  |
| `by_category` | [{ category: string, count: integer }] |  |  |
| `by_status` | [{ status: string, count: integer }] |  |  |
| `incidents_by_severity` | [{ severity: string, count: integer }] |  |  |
| `incidents_by_type` | [{ type: string, count: integer }] |  |  |
| `by_concierge` | [{ name: string, count: integer }] |  |  |
| `hourly_activity` | [{ hour: integer, count: integer }] |  |  |

### AuditLog

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `log_id` | string |  |  |
| `manager_id` | string |  |  |
| `user_id` | string |  |  |
| `user_type` | string |  |  |
| `action` | string |  | create, update, delete, clock_in or clock_out. |
| `resource_type` | string |  |  |
| `resource_id` | string |  |  |
| `detail` | object |  |  |
| `created_at` | string (date-time) |  |  |

### PackageResult

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `sent` | boolean |  | True when a resident email was found for the unit and an email was attempted. |
| `resident_email` | string |  |  |
| `resident_name` | string |  |  |

### ImageUpload

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `image_id` | string |  |  |
| `url` | string |  | A data: URL (base64) of the image. Store it on the task or incident. |

### AssistantPlan

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `kind` | string: `find`, `open`, `answer`, `log`, `package`, `visitor`, `vendor`, `incident`, `task`, `message`, `handoff`, `protocol`, `emergency`, `other` |  |  |
| `reply` | string |  |  |
| `ids` | [string] |  | Up to 5 ids from the property record, best match first. |
| `open` | string |  | A section of the app to open. |
| `fields` | object (nullable) |  | Draft entry values for entry kinds; the app shows a Ready to save card. |

### AssistantResult

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `answer` | AssistantPlan (nullable) |  |  |
| `reason` | string: `unavailable`, `limit`, `failed` |  | `unavailable`: no ANTHROPIC_API_KEY on the server. `limit`: over 120 requests per hour. `failed`: the model did not answer. |

### Contact

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `contact_id` | string | yes |  |
| `manager_id` | string |  |  |
| `label` | string | yes |  |
| `number` | string | yes |  |
| `category` | string |  | Suggested: Emergency services, Staff, Building & vendors. Any short label is kept. |
| `role` | string |  |  |
| `created_at` | string (date-time) |  |  |
| `updated_at` | string (date-time) |  |  |

### ContactsList

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `contacts` | [Contact] |  |  |
| `manager` | object (nullable) |  |  |

### KnowledgeOut

| Field | Type | Required | Default / notes |
|---|---|---|---|
| `id` | string | yes |  |
| `kind` | string: `sop`, `training` | yes |  |
| `title` | string | yes |  |
| `category` | string |  |  |
| `body` | string |  |  |
| `fileName` | string |  |  |
| `fileType` | string |  | pdf, image, video or doc; empty when there is no file. |
| `dataURL` | string |  | Older items only: the file inline. Newer items have hasFile and are downloaded from …/file. |
| `hasFile` | boolean |  |  |
| `fileId` | string |  |  |
| `fileSize` | integer |  |  |
| `mime` | string |  |  |
| `status` | string |  | Defaults to `published`. |
| `completedBy` | [string] |  | Names of concierges who marked it reviewed. |
| `completed` | boolean |  | Whether the caller marked it reviewed. |
| `updatedAt` | string (date-time) |  |  |
