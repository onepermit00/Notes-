"""Maintenance: work orders from residents, the desk and the manager go to the
maintenance team, every step is written into the one daily report, and the
desk follows up with the resident once the work is done."""
from datetime import datetime, timedelta, timezone

from server import db
from tests.test_desk_flows import _concierge, _signup
from tests.test_resident_portal import _invite_and_join


async def _maintenance(client, manager, email='james@example.com'):
    added = await client.post('/api/manager/concierge', headers=manager, json={
        'first_name': 'James', 'last_name': 'Ortiz', 'email': email, 'phone': '555-0102',
        'title': 'Maintenance', 'password': 'MaintPass1'})
    assert added.status_code == 200, added.text
    signin = await client.post('/api/auth/signin', json={'role': 'maintenance', 'email': email, 'password': 'MaintPass1'})
    client.cookies.clear()
    assert signin.status_code == 200, signin.text
    assert signin.json()['user_type'] == 'maintenance'
    return {'Authorization': f"Bearer {signin.json()['token']}"}


async def test_maintenance_signs_in_to_their_own_app_and_not_the_desk(client, server):
    manager = await _signup(client)
    james = await _maintenance(client, manager)
    me = (await client.get('/api/auth/me', headers=james)).json()
    assert me['user_type'] == 'maintenance' and me['title'] == 'Maintenance'
    # Choosing "Concierge" on the sign-in page still opens the maintenance app.
    again = await client.post('/api/auth/signin', json={'role': 'concierge', 'email': 'james@example.com', 'password': 'MaintPass1'})
    client.cookies.clear()
    assert again.json()['user_type'] == 'maintenance'
    for path in ('/api/tasks', '/api/residents', '/api/incidents'):
        assert (await client.get(path, headers=james)).status_code == 403, path
    assert (await client.post('/api/shifts/start', headers=james)).status_code == 403
    assert (await client.get('/api/work-orders', headers=james)).status_code == 200


async def test_resident_work_order_runs_through_maintenance_and_the_desk(client, server):
    manager = await _signup(client)
    dana, _ = await _invite_and_join(client, server, manager)
    sam, _ = await _concierge(client, manager, 'sam@example.com')
    james = await _maintenance(client, manager)
    await client.post('/api/shifts/start', headers=sam)

    sent = await client.post('/api/resident/requests', headers=dana, json={
        'request_type': 'work_order', 'urgency': 'urgent', 'kind': 'Plumbing', 'location': 'Kitchen sink',
        'description': 'Sink is leaking under the cabinet.', 'permission_to_enter': True})
    assert sent.status_code == 200, sent.text
    wo_id = sent.json()['request_id']
    assert wo_id.startswith('wo_') and sent.json()['status_label'] == 'Received' and sent.json()['reference'] == '1'

    # Maintenance has it.
    orders = (await client.get('/api/work-orders?status=open', headers=james)).json()['work_orders']
    assert [w['work_order_id'] for w in orders] == [wo_id]
    assert orders[0]['unit'] == '12B' and orders[0]['resident_name'] == 'Dana Fox'
    # The desk has a task to make sure maintenance picked it up.
    desk = [t for t in (await client.get('/api/tasks', headers=sam)).json()['tasks'] if t.get('work_order_id') == wo_id]
    assert [t['wo_task'] for t in desk] == ['notify'] and desk[0]['created_by_type'] == 'system'

    await client.get(f'/api/work-orders/{wo_id}', headers=james)
    await client.put(f'/api/work-orders/{wo_id}', headers=james, json={'status': 'in_progress'})
    held = await client.put(f'/api/work-orders/{wo_id}', headers=james, json={'status': 'on_hold'})
    assert held.status_code == 400   # needs a reason
    await client.put(f'/api/work-orders/{wo_id}', headers=james, json={'status': 'on_hold', 'hold_reason': 'Waiting on a part'})
    assert (await client.get(f'/api/resident/requests/{wo_id}', headers=dana)).json()['hold_reason'] == 'Waiting on a part'
    await client.post(f'/api/work-orders/{wo_id}/notes', headers=james, json={'text': 'Part arrives tomorrow.'})
    done = await client.put(f'/api/work-orders/{wo_id}', headers=james, json={'status': 'completed', 'note': 'Replaced the trap.'})
    assert done.status_code == 200, done.text

    # The one report for the shift is Sam's, with James's lines inside it.
    shift = (await client.get('/api/shifts/active', headers=sam)).json()['shift']
    lines = [a['title'] for a in shift['activities'] if a.get('work_order_id') == wo_id]
    assert any(t.startswith('Work order sent by resident') for t in lines)
    assert any(t.startswith('Work order done') and 'added by James Ortiz (Maintenance)' in t for t in lines)
    assert shift['concierge_name'] == 'Sam Lee'

    # "Check maintenance has it" is gone; "follow up with the resident" is there.
    desk = [t for t in (await client.get('/api/tasks', headers=sam)).json()['tasks'] if t.get('work_order_id') == wo_id
            and t['status'] != 'completed']
    assert [t['wo_task'] for t in desk] == ['followup']
    mine = (await client.get(f'/api/resident/requests/{wo_id}', headers=dana)).json()
    assert mine['status_label'] == 'Resolved'
    assert 'Part arrives' not in str(mine) and 'James' not in str(mine)

    await client.put(f"/api/tasks/{desk[0]['task_id']}", headers=sam, json={
        'status': 'completed', 'completion_note': 'Called Dana', 'resident_reply': 'Glad the sink is fixed.'})
    mine = (await client.get(f'/api/resident/requests/{wo_id}', headers=dana)).json()
    assert mine['reply'] == 'Glad the sink is fixed.'
    assert [e['event'] for e in mine['timeline']] == ['sent', 'seen', 'started', 'on_hold', 'completed', 'resolved']
    assert (await client.get('/api/resident/requests', headers=dana)).json()['requests'][0]['request_id'] == wo_id


async def test_everyone_can_send_a_work_order(client, server):
    manager = await _signup(client)
    sam, _ = await _concierge(client, manager, 'sam@example.com')
    james = await _maintenance(client, manager)
    await client.post('/api/shifts/start', headers=sam)
    for who in (manager, sam, james):
        r = await client.post('/api/work-orders', headers=who, json={'unit': '7A', 'category': 'Electrical', 'description': 'Outlet dead.'})
        assert r.status_code == 200, r.text
    numbers = sorted(w['number'] for w in (await client.get('/api/work-orders', headers=james)).json()['work_orders'])
    assert numbers == [1, 2, 3]
    # The desk can't close maintenance's work, only cancel what it opened.
    orders = (await client.get('/api/work-orders', headers=sam)).json()['work_orders']
    by = {w['created_by_type']: w['work_order_id'] for w in orders}
    assert (await client.put(f"/api/work-orders/{by['concierge']}", headers=sam, json={'status': 'completed'})).status_code == 403
    assert (await client.put(f"/api/work-orders/{by['manager']}", headers=sam, json={'status': 'cancelled'})).status_code == 403
    assert (await client.put(f"/api/work-orders/{by['concierge']}", headers=sam, json={'status': 'cancelled'})).status_code == 200


async def test_vendor_visit_is_logged_by_maintenance_and_shows_in_the_report(client, server):
    manager = await _signup(client)
    sam, _ = await _concierge(client, manager, 'sam@example.com')
    james = await _maintenance(client, manager)
    await client.post('/api/shifts/start', headers=sam)
    visit = (await client.post('/api/work-orders', headers=james, json={
        'kind': 'vendor_visit', 'vendor_name': 'Otis Elevator', 'location': 'Elevator 2', 'category': 'Elevator',
        'description': 'Annual inspection.'})).json()
    assert visit['status'] == 'in_progress' and visit['summary'].startswith('Vendor visit #1 · Otis Elevator')
    await client.put(f"/api/work-orders/{visit['work_order_id']}", headers=james, json={'status': 'completed', 'note': 'Passed.'})
    dar = (await client.get('/api/maintenance/dar', headers=james)).json()
    titles = [a['title'] for a in dar['active'][0]['activities']]
    assert any(t.startswith('Vendor visit logged') for t in titles)
    assert any(t.startswith('Vendor visit finished') for t in titles)


async def test_desk_closed_updates_keep_their_time_and_follow_up_next_shift(client, server):
    manager = await _signup(client)
    dana, _ = await _invite_and_join(client, server, manager)
    sam, _ = await _concierge(client, manager, 'sam@example.com')
    kim, _ = await _concierge(client, manager, 'kim@example.com', 'Kim', 'Park')
    james = await _maintenance(client, manager)
    await client.post('/api/shifts/start', headers=sam)
    wo_id = (await client.post('/api/resident/requests', headers=dana, json={
        'request_type': 'work_order', 'kind': 'Heating & cooling', 'description': 'No heat.'})).json()['request_id']
    await client.post('/api/shifts/handover', headers=sam, json={'handover_notes': '', 'open_items': []})

    # Overnight, no one at the desk.
    await client.put(f'/api/work-orders/{wo_id}', headers=james, json={'status': 'completed', 'note': 'Reset the boiler.'})
    log = await db.tasks.find_one({'work_order_id': wo_id, 'title': {'$regex': '^No one on shift'}})
    assert log and log['desk_closed'] is True and 'added by James Ortiz (Maintenance)' in log['title']
    assert log['completed_at'] is not None

    await client.post('/api/shifts/start', headers=kim)
    todo = [t for t in (await client.get('/api/tasks', headers=kim)).json()['tasks'] if t.get('work_order_id') == wo_id]
    assert [t['wo_task'] for t in todo] == ['followup']


async def test_open_work_order_past_its_limit_reminds_the_desk_once(client, server):
    manager = await _signup(client)
    sam, _ = await _concierge(client, manager, 'sam@example.com')
    james = await _maintenance(client, manager)
    await client.post('/api/shifts/start', headers=sam)
    wo = (await client.post('/api/work-orders', headers=sam, json={'unit': '3C', 'urgency': 'emergency', 'description': 'Water coming through ceiling.'})).json()
    await db.work_orders.update_one({'work_order_id': wo['work_order_id']},
                                    {'$set': {'created_at': datetime.now(timezone.utc) - timedelta(hours=3)}})
    await client.get('/api/work-orders', headers=james)
    await client.get('/api/work-orders', headers=sam)
    reminders = [t for t in (await client.get('/api/tasks', headers=sam)).json()['tasks'] if t.get('wo_task') == 'remind']
    assert len(reminders) == 1 and reminders[0]['priority'] == 'Urgent'
    assert reminders[0]['title'].startswith('Remind maintenance · Work order #1 · Unit 3C')

    # Building changes its emergency limit.
    saved = await client.put('/api/manager/maintenance-settings', headers=manager, json={'remind_hours': {'emergency': 4}})
    assert saved.json()['remind_hours']['emergency'] == 4
    assert (await client.put('/api/manager/maintenance-settings', headers=sam, json={'remind_hours': {'emergency': 4}})).status_code == 403


async def test_desk_signs_a_vendor_in_and_out(client, server):
    manager = await _signup(client)
    sam, _ = await _concierge(client, manager, 'sam@example.com')
    await client.post('/api/shifts/start', headers=sam)
    visit = (await client.post('/api/work-orders', headers=sam, json={
        'kind': 'vendor_visit', 'vendor_name': 'Orkin', 'location': 'Garage', 'category': 'Pest control',
        'description': 'Monthly treatment.'})).json()
    assert visit['status'] == 'in_progress'
    done = await client.put(f"/api/work-orders/{visit['work_order_id']}", headers=sam, json={'status': 'completed', 'note': 'Left 3 PM.'})
    assert done.status_code == 200, done.text
    shift = (await client.get('/api/shifts/active', headers=sam)).json()['shift']
    assert any('added by Sam Lee (Concierge)' in a['title'] for a in shift['activities'])
