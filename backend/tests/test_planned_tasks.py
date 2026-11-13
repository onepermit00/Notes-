"""Planned tasks: a manager plans work for one team member, it shows on their
shift every day it is due, and once done it is in that shift's report."""
from datetime import date, timedelta

from routes.tasks import desk_day, occurs_on
from tests.test_desk_flows import _concierge, _signup


def test_repeat_rules():
    monday = date(2026, 11, 16)
    once = {'repeat': 'once', 'start_date': '2026-11-16'}
    assert occurs_on(once, monday) and not occurs_on(once, monday + timedelta(days=7))

    daily = {'repeat': 'daily', 'start_date': '2026-11-16', 'end_date': '2027-05-16'}
    assert occurs_on(daily, date(2027, 3, 1))
    assert not occurs_on(daily, date(2027, 5, 17)) and not occurs_on(daily, date(2026, 11, 15))

    forever = {'repeat': 'daily', 'start_date': '2026-11-16', 'end_date': None}
    assert occurs_on(forever, date(2029, 1, 1))

    weekly = {'repeat': 'weekly', 'start_date': '2026-11-16'}
    assert occurs_on(weekly, monday + timedelta(days=21)) and not occurs_on(weekly, monday + timedelta(days=1))

    chosen = {'repeat': 'days', 'start_date': '2026-11-16', 'days_of_week': [1, 3]}  # Tue, Thu
    assert occurs_on(chosen, monday + timedelta(days=1)) and not occurs_on(chosen, monday)

    monthly = {'repeat': 'monthly', 'start_date': '2026-01-31'}
    assert occurs_on(monthly, date(2026, 3, 31)) and occurs_on(monthly, date(2026, 2, 28))
    assert not occurs_on(monthly, date(2026, 3, 30))

    # Schedules saved before repeat existed keep running on their weekdays.
    assert occurs_on({'start_date': '2026-11-01', 'days_of_week': [0]}, monday)
    assert not occurs_on({'start_date': '2026-11-01', 'days_of_week': [0]}, monday + timedelta(days=1))


def test_desk_day_trusts_the_browser_only_near_today():
    today = date.today()
    assert desk_day((today - timedelta(days=1)).isoformat()) == today - timedelta(days=1)
    assert abs((desk_day('2001-01-01') - today).days) <= 1
    assert abs((desk_day('not a date') - today).days) <= 1


async def test_planned_task_reaches_only_its_team_member_and_lands_in_the_report(client):
    manager = await _signup(client)
    sam, sam_id = await _concierge(client, manager, 'sam@example.com')
    kim, _ = await _concierge(client, manager, 'kim@example.com', 'Kim', 'Park')
    today = date.today().isoformat()

    plan = await client.post('/api/scheduled-tasks', headers=manager, json={
        'title': 'Test the fire panel', 'notes': 'Log the reading.', 'repeat': 'daily',
        'start_date': today, 'end_date': None, 'scheduled_time': '09:00',
        'assigned_concierge_id': sam_id, 'assigned_concierge_name': 'Sam Lee'})
    assert plan.status_code == 200, plan.text
    plan_id = plan.json()['scheduled_task_id']
    assert plan.json()['end_date'] is None and plan.json()['created_by_name'] == 'Alex Rivera'

    await client.post(f'/api/shifts/start?day={today}', headers=sam)
    sam_tasks = (await client.get(f'/api/tasks?day={today}', headers=sam)).json()['tasks']
    planned = [t for t in sam_tasks if t.get('scheduled_task_id') == plan_id]
    assert len(planned) == 1 and planned[0]['status'] == 'pending' and planned[0]['due_time'] == '09:00'
    # Loading again does not make a second copy.
    again = (await client.get(f'/api/tasks?day={today}', headers=sam)).json()['tasks']
    assert len([t for t in again if t.get('scheduled_task_id') == plan_id]) == 1

    kim_tasks = (await client.get(f'/api/tasks?day={today}', headers=kim)).json()['tasks']
    assert not [t for t in kim_tasks if t.get('scheduled_task_id') == plan_id]

    done = await client.put(f"/api/tasks/{planned[0]['task_id']}", headers=sam, json={'status': 'completed', 'completion_note': 'Panel normal.'})
    assert done.status_code == 200

    report = (await client.get('/api/shifts/active', headers=sam)).json()['shift']['activities']
    assert [(a['title'], a['source_section'], a['notes']) for a in report] == [('Test the fire panel', 'scheduled', 'Panel normal.')]

    plans = (await client.get('/api/scheduled-tasks', headers=manager)).json()['scheduled_tasks']
    history = plans[0]['history']
    assert history['done_count'] == 1 and history['last_done']['by'] == 'Sam Lee'
    assert history['recent'][0] == {'date': today, 'status': 'completed', 'by': 'Sam Lee', 'note': 'Panel normal.'}

    # Removing the plan keeps what was done in the report.
    assert (await client.delete(f'/api/scheduled-tasks/{plan_id}', headers=manager)).status_code == 200
    report = (await client.get('/api/shifts/active', headers=sam)).json()['shift']['activities']
    assert [a['title'] for a in report] == ['Test the fire panel']


async def test_pausing_or_removing_takes_waiting_copies_off_the_desk(client):
    manager = await _signup(client)
    sam, sam_id = await _concierge(client, manager, 'sam@example.com')
    today = date.today().isoformat()
    plan_id = (await client.post('/api/scheduled-tasks', headers=manager, json={
        'title': 'Water the lobby plants', 'repeat': 'weekly', 'start_date': today, 'end_date': None,
        'assigned_concierge_id': sam_id})).json()['scheduled_task_id']

    def mine(tasks):
        return [t for t in tasks if t.get('scheduled_task_id') == plan_id]

    assert len(mine((await client.get(f'/api/tasks?day={today}', headers=sam)).json()['tasks'])) == 1
    paused = await client.put(f'/api/scheduled-tasks/{plan_id}', headers=manager, json={'active': False})
    assert paused.status_code == 200 and paused.json()['active'] is False
    assert mine((await client.get(f'/api/tasks?day={today}', headers=sam)).json()['tasks']) == []

    renamed = await client.put(f'/api/scheduled-tasks/{plan_id}', headers=manager, json={'active': True, 'title': 'Water the plants'})
    assert renamed.status_code == 200
    tasks = mine((await client.get(f'/api/tasks?day={today}', headers=sam)).json()['tasks'])
    assert [t['title'] for t in tasks] == ['Water the plants']

    await client.delete(f'/api/scheduled-tasks/{plan_id}', headers=manager)
    assert mine((await client.get(f'/api/tasks?day={today}', headers=sam)).json()['tasks']) == []


async def test_plan_rules_are_checked(client):
    manager = await _signup(client)
    today = date.today()
    too_far = await client.post('/api/scheduled-tasks', headers=manager, json={
        'title': 'x', 'repeat': 'daily', 'start_date': today.isoformat(), 'end_date': (today + timedelta(days=366 * 6)).isoformat()})
    assert too_far.status_code == 422
    no_days = await client.post('/api/scheduled-tasks', headers=manager, json={
        'title': 'x', 'repeat': 'days', 'start_date': today.isoformat(), 'days_of_week': []})
    assert no_days.status_code == 422
    months_ahead = await client.post('/api/scheduled-tasks', headers=manager, json={
        'title': 'Elevator inspection', 'repeat': 'monthly', 'start_date': today.isoformat(),
        'end_date': (today + timedelta(days=365 * 2)).isoformat()})
    assert months_ahead.status_code == 200
