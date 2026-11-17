# Plan: Resident portal and Maintenance dashboard

*Written 17 November 2026. This is a plan only. Nothing here is built yet.*

## The idea in one paragraph

Today Noted has two kinds of accounts: the **manager** and the **concierge**. This plan adds two more: **residents** and **maintenance**. A resident can send a noise complaint, a report or a work order from their phone. The moment they send it, it appears as a task on the concierge's To do card with the exact time it came in. Work orders also go to maintenance. When anyone handles something, the time and the person are recorded, and the entry goes into that day's DAR. The manager, the concierge on shift and maintenance all read the same DAR, so nobody has to walk over and say "it's done", and there is always a paper trail.

## What already exists that we build on

| Already in Noted | How the plan uses it |
|---|---|
| **Residents page** (manager adds name, unit, phone, email, notes) | Becomes the place the manager invites residents. Each row gets an "Invite" button and a status (Not invited, Invited, Joined). |
| **Team invites** (join link by email, 7 days, they set their own password) | Same invite system for residents and for maintenance staff. No passwords are ever emailed. |
| **Tasks and the To do card** (with "Assigned by", Start task / Continue task, photos, completed tasks move to the DAR) | Every resident submission becomes a task on the To do card, marked "From resident, Unit 12B". |
| **Follow-ups** (tasks for later days) | "Follow up with resident" and "Remind maintenance" tasks can be pushed to a later day the same way. |
| **The DAR** (built per shift from what was logged and completed, with Not done items at the end of a shift) | Gains resident submissions, maintenance updates and completed work orders. Maintenance gets to read it too. |
| **Photos on report lines** | Residents and maintenance attach photos the same way. |
| **Email through Resend** (mail.tanotes.com) | Sends invites and "your request was updated" emails to residents. |
| **Live updates** (the app checks for new tasks every few seconds) | A resident's complaint shows up on the iPad at the desk without a refresh. |

---

## Phase 1: Resident portal

### 1. How residents join

1. The manager opens **Residents** and adds a resident (name, unit, email, phone), or imports a list from a spreadsheet (CSV) so a 300-unit building doesn't need 300 forms.
2. The manager taps **Invite** on one resident, or **Invite all not yet invited**.
3. The resident gets an email: "You've been invited to The [Property] on Noted." The link opens a page with their name and unit already filled in. They choose a password and they're in.
4. The Residents page shows who has joined. The manager can resend or cancel an invite, and can remove a resident who moved out. Removing them signs them out everywhere, like removing a team member does today.

Later, optional: a printed QR code at the front desk or in the mail room that lets a resident request an invite. The manager still approves it, so strangers can't join.

### 2. What residents see

A simple phone-first page (it works in any browser, and can be added to the home screen like an app). Four things:

- **Report something** with three choices:
  - **Noise complaint**: where the noise is coming from (unit if they know it, or "hallway", "outside"), what kind, whether it is happening now.
  - **Work order**: what is broken, where in the unit, how urgent (Emergency, Soon, Whenever), whether maintenance may enter when they're out, pets in the unit, best times.
  - **Other report**: anything else (a leak in the garage, a broken door, a suspicious person, a lost item).
  - Each one can have up to a few photos.
- **My requests**: every request they have sent, each with a plain status and a timeline, for example:
  - Sent, Tue 9:42 PM
  - Seen by the front desk, 9:44 PM
  - Concierge Sam is handling it, 9:51 PM
  - Resolved, 10:05 PM: "Spoke to unit 14C, music turned down."
- **Building info** the manager chooses to share: front desk hours and phone, emergency numbers (from the existing emergency contacts, only the ones marked as public).
- **My account**: name, phone, email preferences.

Residents never see other residents' names, other units' requests, staff notes marked internal, or the DAR.

A clear line at the top of the Report page: **"For emergencies like fire, flooding or a medical problem, call 911 or the front desk."** Noted helps, but it is not an emergency line.

### 3. How a submission becomes a concierge task

When a resident presses Send:

1. Noted saves the request with the time it came in (to the second), the resident and their unit.
2. A task appears on the **To do** card of the concierge on shift, marked **From resident · Unit 12B**, with the type, the description and the photos. Emergencies and noise complaints that are "happening now" go to the top.
3. If nobody is clocked in, it waits for whoever starts the next shift, and the manager sees it on their overview straight away.
4. The concierge taps **Start task**. That time is recorded as "handled from", and the resident's status changes to "Concierge Sam is handling it".
5. The concierge writes what they did and can add a photo. They choose either **Resolved** or (for work orders) **Sent to maintenance**.
6. The finished task goes into that shift's **DAR** like any other task, showing: who reported it, when it came in, who handled it, when, and what was done.
7. The resident gets an email (and sees in the app) that their request was updated, with the concierge's reply.

If a request is still open when the shift ends, it shows as **Not done** in that shift's DAR, the same way manager tasks do today, and moves to the next shift's To do card. So nothing quietly disappears.

### 4. The times we record

For every request, the record keeps:

| Moment | Recorded as |
|---|---|
| Resident sends it | Sent at, by whom, which unit |
| Concierge first opens it | Seen at, by whom |
| Concierge taps Start | Started at, by whom |
| Sent to maintenance (work orders) | Sent to maintenance at, by whom |
| Maintenance starts and finishes | Started / Completed at, by whom |
| Concierge confirms with resident | Followed up at, by whom |
| Closed | Closed at, by whom, with the note |

From these the manager gets real numbers later: average time to first response, how many noise complaints per floor per month, which work orders took longest. This is the paper trail George described.

---

## Phase 2: Maintenance dashboard

### 5. Who maintenance are, and how they join

Maintenance staff are invited from the **Team** page, just like a concierge, but the manager picks the role **Maintenance**. They sign in on the same sign-in page. (Outside vendors, like a plumber company, can come later as a lighter "vendor" account that only sees the jobs given to it.)

### 6. What maintenance sees

- **Work orders**: a list with New, In progress, Waiting (on parts, on the resident, on a vendor) and Done. Each card shows the unit, the problem, the photos, permission to enter, pets, and how long it has been open.
- **Today's DAR**: read-only, the same report the concierge and manager see, so maintenance knows what happened at the desk today (a leak reported, a package for them, a vendor who is coming).
- **Their own To do**: the manager can also plan recurring maintenance jobs (weekly boiler check, monthly fire extinguisher round) using the existing planned tasks screen.

### 7. The work order flow

1. **A work order comes in**, either from a resident or written by the concierge at the desk (for example a resident who walks up, or something the concierge notices on a round).
2. **It shows up in two places at once**: on the maintenance work order list as New, and on the concierge's To do as "Work order for Unit 12B: confirm maintenance has it". Both are linked to the same work order, so there is one record, not two copies that drift apart.
3. **Maintenance updates it** as they go: Start, add notes and photos, mark Waiting with a reason, mark Done. Every step has a time and a name.
4. **When maintenance marks it Done**:
   - A line goes into **that day's DAR under the concierge who is running the shift** at that moment, for example "10:32 AM, Maintenance (Luis) completed work order #118, Unit 12B kitchen sink leak. Replaced trap." with the photos.
   - The concierge gets a new task: **"Follow up with Unit 12B: sink repaired"**. When they tap Done on it, the resident's request closes and the resident is told.
   - If no concierge is clocked in, the line goes into the next shift's DAR as "while the desk was closed" and the follow-up waits on the To do card.
5. **If a work order stays open too long**, the concierge gets a task: **"Remind maintenance: Unit 12B sink, open 2 days"**. Doing that task records that the reminder was given. If it is still open after another while, the task comes back and the manager sees it on their overview as overdue.

Suggested time limits, which the manager can change per property:

| Urgency | Concierge reminds maintenance after | Manager is flagged after |
|---|---|---|
| Emergency | 1 hour | 4 hours |
| Soon | 1 day | 3 days |
| Whenever | 3 days | 7 days |

### 8. One shared DAR

There stays **one DAR per shift**, owned by the concierge running that shift. Everyone reads the same one:

| Who | What they can do with the DAR |
|---|---|
| Manager | Read all shifts, as today. |
| Concierge | Read and add to their shift, read previous shifts, as today. |
| Maintenance | Read today's and recent shifts. Their own updates are added automatically; they don't type into the DAR directly. |
| Resident | Never sees the DAR. |

Each DAR line says who did it (Concierge, Maintenance, or Resident report), so the manager can tell at a glance who did what.

---

## Phase 3: Connecting to Happy Property and other systems

### What George asked

If a property already uses HappyCo's "Happy Property" (or Yardi, AppFolio, Entrata, and so on) for work orders, can a work order sent through Noted show up there, and can its status come back to Noted?

### What we found

| System | Can an outside app create or read work orders? | How you get access |
|---|---|---|
| **HappyCo (Happy Property)** | HappyCo has an API, but it is not self-serve. An independent review of it found inspections, reports and assets in the published API, but **work orders and maintenance tasks are not in the published packages**. | HappyCo gives API credentials to enterprise customers, and outside apps apply to its **Plugin Partner** program. Their partner list includes ResMan and Propexo, so connections are possible, but HappyCo has to agree. |
| **Yardi (Voyager, RentCafe)** | Yes. Yardi has a Service Requests interface that outside apps use. | Through Yardi's **Interface Partner** program: a separate agreement per interface, an **annual license fee per interface**, and for the standard interfaces Yardi asks for at least two years in business and at least three shared Yardi clients. Each property's Yardi admin then switches it on. |
| **AppFolio** | Yes. AppFolio's partner API lists a Work Orders endpoint to get, create or update work orders. | Through AppFolio's **Stack** partner program (apply and be approved). |
| **Entrata, ResMan, RealPage and others** | Generally yes, through each one's partner program. | One agreement per company. |
| **"Unified" connectors such as Propexo** | Yes. One connection that can create service requests in Yardi, Entrata, ResMan, Rentvine, Propertyware and more. | A paid service. They hold the partner agreements, so we wouldn't need one with each company. |

### What this means

- **It is possible, but not something we can switch on ourselves.** Every one of these companies decides who can connect, and most charge for it.
- **Happy Property is the hardest one right now**, because its work orders are not in its public API. It would take a partner conversation with HappyCo.
- **The fastest realistic path** is a unified connector like Propexo for the property management systems, once we have a real property that wants it, and a HappyCo partner application in parallel.
- **That's why our own maintenance dashboard comes first.** It works for every property on day one, with no agreements, and it is what makes Noted useful for buildings that don't use any of these tools.

How it would work once connected: when a work order is created in Noted for a connected property, Noted sends it to their system and keeps the link. Status changes come back into Noted (checked every few minutes, or sent to us instantly where the other system allows), and they flow into the DAR and the concierge's tasks exactly as in Phase 2. The concierge never has to open a second app.

---

## Things to be careful about

- **Photos and storage.** Photos are stored inside the database today. Residents sending photos will fill the free Atlas database (512 MB) quickly. Before residents go live we should move photos to file storage (for example Cloudflare R2 or Amazon S3, a few dollars a month).
- **Privacy.** A noise complaint names a neighbor's unit. Only staff should see who complained about whom. Residents only ever see their own requests.
- **Spam and abuse.** Limit how many requests one resident can send per hour, and let the manager pause a resident's account.
- **Emergencies.** Keep the "call 911 or the desk" line on the Report page, and show emergency requests in red at the top of the To do card.
- **The server going to sleep.** The backend is on Render. If the free plan sleeps when nobody is using it, the "remind maintenance" checks should run whenever someone opens the app (the same way planned tasks are created today), so no extra paid background job is needed at first.
- **Keeping records.** Requests and their timelines should never be deleted, only closed, so the property has a complete record if there is ever a dispute.

---

## Questions for George

1. **Several people in one unit.** Should every adult on a lease get their own login, and should they see each other's requests for that unit?
2. **Anonymous noise complaints.** Should a resident be able to ask that their name not be shared with the neighbor? (Staff would still see it.)
3. **Who can send a work order to maintenance?** Straight from the resident to maintenance, or does the concierge always look at it first? The plan assumes it goes to both at once.
4. **Time limits.** Are the reminder times in section 7 right for a typical building?
5. **Text messages.** Is email enough for telling residents about updates, or do you want text messages? Texts cost a little per message (through a service like Twilio).
6. **Outside vendors.** Do you want plumbers and electricians from outside companies to get their own logins in Phase 2, or later?
7. **Integrations.** Is there one real property, and which system does it use (Happy Property, Yardi, AppFolio)? That decides which connection to pursue first.
8. **Desk closed.** When nobody is clocked in, is it right to put maintenance updates into the next shift's DAR?

---

## Phases and rough effort

Effort is in the same kind of pull requests we have been doing (each one reviewed, tested and screenshotted before you merge).

| Phase | What you get | Rough size |
|---|---|---|
| **1a. Resident accounts** | Invite from the Residents page, CSV import, join link, resident sign-in, remove resident. | 2 pull requests, about 2 to 3 days |
| **1b. Resident requests** | Report something (noise, work order, other) with photos, My requests with timeline, tasks on the To do card, entries and Not done in the DAR, update emails. Photo storage moved out of the database. | 3 to 4 pull requests, about 1 week |
| **2a. Maintenance accounts and work orders** | Maintenance role on the Team page, work order list, statuses with times and photos, read-only DAR. | 2 to 3 pull requests, about 1 week |
| **2b. Linking it together** | Done work orders post to the DAR under the concierge on shift, Follow up with resident tasks, Remind maintenance tasks, manager overdue view, time limits setting. | 2 pull requests, about 3 to 4 days |
| **2c. Reports** | Response times, complaints per floor, work order times, on the manager's side. | 1 to 2 pull requests, about 2 days |
| **3. Integrations** | First outside connection (likely through a unified connector) for one pilot property, then HappyCo if the partnership is approved. | Depends on the partner agreements. About 1 to 2 weeks of building once access is granted; the agreements themselves can take weeks to months. |

Phases 1 and 2 together are roughly **3 to 4 weeks** of building, done step by step so you can try each part as it lands.

---

## For the developer (technical notes)

- **Roles.** Add `resident` and `maintenance` session types. `_resolve_user` in `backend/core.py`, `/auth/signin`, `/auth/me` and the SSE `/events` stream currently only know `manager` and `concierge`; each needs the new types, and every existing route must reject them unless it opts in. Residents live in the existing `residents` collection (add `email` uniqueness per property, `password_hash`, `is_active`, `joined_at`); maintenance can live in a `maintenance_staff` collection or as team members with a `role` field. Reuse `invitations` with a `kind` field (`concierge` | `resident` | `maintenance`).
- **Requests.** A resident submission is a `tasks` document with `source_section: 'resident'`, `created_by_type: 'resident'`, `resident_id`, `unit`, `request_type` (`noise` | `work_order` | `report`) and a `timeline` array of `{at, by_id, by_name, by_type, event, note}`. Residents read a whitelisted projection of their own tasks only. Internal notes go in a separate field residents never receive.
- **To do and DAR.** `GET /tasks` for concierges must include unassigned `resident` tasks the way it already includes unassigned manager requests. `_shift_activities` and `_not_done_on_shift` in `backend/routes/shifts.py` treat `created_by_type: 'manager'` as "given to the desk"; extend that to `resident` and to system-created follow-up tasks.
- **Work orders.** New `work_orders` collection with `status` (`new` | `in_progress` | `waiting` | `done` | `cancelled`), `priority`, `unit`, `permission_to_enter`, `pets`, `assigned_to_id`, photos, `timeline`, `linked_task_ids`, and later `external: {system, id, synced_at}`. When it moves to `done`, insert a DAR entry tied to the active shift (`shift_id` of whoever is clocked in for that `manager_id`; if none, a pending entry picked up by the next `/shifts/start`) and a follow-up task.
- **Overdue reminders.** Run the check lazily on `GET /tasks` and the manager overview, like `_materialize_scheduled_tasks`, using a deterministic key (`remind:{work_order_id}:{n}`) with the existing unique sparse index pattern so reminders are never duplicated.
- **Photos.** Move `evidence_urls` from data URLs in MongoDB to object storage with signed URLs before resident launch.
- **API spec.** Every new endpoint needs a `META` entry in `backend/scripts/build_api_spec.py` and a rerun (see PR #17).
- **Integrations.** Put each outside system behind one small adapter (`create_work_order`, `fetch_updates`) so a unified connector or a direct HappyCo/Yardi/AppFolio adapter can be swapped in per property.

## Sources

- HappyCo Plugins announcement: https://happy.co/press/happyco-debuts-plugins
- Independent review of HappyCo's API: https://supergood.ai/api-report-card/happyco
- Yardi Interface Partner program: https://yardi.com/?p=2754
- Yardi Service Requests interface setup (Propexo guide): https://docs.propexo.com/pms-guidance/yardi/interface-setup-guides/service-requests-interface-setup
- AppFolio Stack partner API: https://www.appfolio.com/stack/partners/api
- Propexo create service request (Yardi): https://docs.propexo.com/api-reference/yardi/service-requests/create-service-request-yardi
