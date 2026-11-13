"""The manager and the desk seeing the same thing: shifts, handoffs, requests, SOPs."""


async def _signup(client, email='manager@example.com'):
    resp = await client.post('/api/auth/manager/signup', json={
        'first_name': 'Alex', 'last_name': 'Rivera', 'email': email, 'phone': '555-0100',
        'job_title': 'GM', 'property_name': 'Harbor House', 'address': '1 Main St',
        'city': 'Metropolis', 'state': 'NY', 'units': 40, 'password': 'ManagerPass1'})
    assert resp.status_code == 200, resp.text
    return {'Authorization': f"Bearer {resp.json()['token']}"}


async def _concierge(client, manager, email, first='Sam', last='Lee'):
    added = await client.post('/api/manager/concierge', headers=manager, json={
        'first_name': first, 'last_name': last, 'email': email, 'phone': '555-0101', 'title': 'Concierge', 'password': 'ConciergePass1'})
    assert added.status_code == 200, added.text
    signin = await client.post('/api/auth/signin', json={'role': 'concierge', 'email': email, 'password': 'ConciergePass1'})
    client.cookies.clear()
    return {'Authorization': f"Bearer {signin.json()['token']}"}, added.json()['concierge_id']


async def test_next_concierge_reads_the_handoff_the_last_one_left(client):
    manager = await _signup(client)
    sam, _ = await _concierge(client, manager, 'sam@example.com')
    kim, _ = await _concierge(client, manager, 'kim@example.com', 'Kim', 'Park')

    await client.post('/api/shifts/start', headers=sam)
    await client.post('/api/tasks', headers=sam, json={'title': 'Lockout · Dana Fox · Unit 4B', 'category': 'Safety / Security', 'source_section': 'lockout'})
    closed = await client.post('/api/shifts/handover', headers=sam, json={'handover_notes': 'HVAC vendor due at 8.', 'open_items': ['Release parcel to 108']})
    assert closed.status_code == 200

    # Kim has never worked a shift, and still sees what Sam left.
    previous = (await client.get('/api/shifts/previous', headers=kim)).json()['shift']
    assert previous['concierge_name'] == 'Sam Lee'
    assert previous['handover_notes'] == 'HVAC vendor due at 8.'
    assert previous['open_items'] == ['Release parcel to 108']
    assert [a['source_section'] for a in previous['activities']] == ['lockout']

    # The manager sees the same finished shift, with the handoff, in the history.
    history = (await client.get('/api/shifts/history', headers=manager)).json()['shifts']
    assert history[0]['handover_notes'] == 'HVAC vendor due at 8.'


async def test_requests_show_in_the_report_only_once_they_are_done(client):
    manager = await _signup(client)
    sam, sam_id = await _concierge(client, manager, 'sam@example.com')
    request_ = (await client.post('/api/tasks', headers=manager, json={'title': 'Walk the garage', 'assigned_to': 'Sam Lee', 'assigned_to_id': sam_id})).json()
    await client.post('/api/scheduled-tasks', headers=manager, json={'title': 'Check the pool gate'})

    await client.post('/api/shifts/start', headers=sam)
    await client.get('/api/tasks', headers=sam)   # materialises today's scheduled tasks
    active = (await client.get('/api/shifts/active', headers=sam)).json()['shift']
    assert active['activities'] == []             # nothing has actually been done yet

    done = await client.put(f"/api/tasks/{request_['task_id']}", headers=sam, json={'status': 'completed', 'completion_note': 'All clear.'})
    assert done.status_code == 200 and done.json()['completed_by_name'] == 'Sam Lee'

    live = (await client.get('/api/shifts/active', headers=manager)).json()['shifts'][0]
    assert [a['title'] for a in live['activities']] == ['Walk the garage']
    assert live['activities'][0]['notes'] == 'All clear.'


async def test_a_declined_request_is_not_reported_as_completed(client):
    manager = await _signup(client)
    sam, sam_id = await _concierge(client, manager, 'sam@example.com')
    task = (await client.post('/api/tasks', headers=manager, json={'title': 'Move the piano', 'assigned_to_id': sam_id})).json()
    declined = await client.put(f"/api/tasks/{task['task_id']}", headers=sam, json={'status': 'declined', 'completion_note': 'Not safe to do alone.'})
    assert declined.status_code == 200
    listed = (await client.get('/api/tasks', headers=manager)).json()['tasks'][0]
    assert listed['status'] == 'declined' and listed['declined_by_name'] == 'Sam Lee'
    assert listed['completion_note'] == 'Not safe to do alone.'
    assert (await client.put(f"/api/tasks/{task['task_id']}", headers=sam, json={'status': 'whatever'})).status_code == 422
    analytics = (await client.get('/api/analytics', headers=manager)).json()
    assert analytics['totals']['completed_tasks'] == 0


async def test_team_list_shows_who_is_on_shift(client):
    manager = await _signup(client)
    sam, sam_id = await _concierge(client, manager, 'sam@example.com')
    before = (await client.get('/api/manager/concierges', headers=manager)).json()['concierges'][0]
    assert before['status'] == 'active' and before['shift_count'] == 0
    await client.post('/api/shifts/start', headers=sam)
    during = (await client.get('/api/manager/concierges', headers=manager)).json()['concierges'][0]
    assert during['status'] == 'on_shift' and during['shift_count'] == 1 and during['on_shift_since']
    await client.post('/api/shifts/end', headers=sam)
    after = (await client.get('/api/manager/concierges', headers=manager)).json()['concierges'][0]
    assert after['status'] == 'active' and after['shift_count'] == 1


async def test_sops_and_training_reach_the_desk_and_report_back(client):
    manager = await _signup(client)
    sam, _ = await _concierge(client, manager, 'sam@example.com')
    item = {'kind': 'training', 'title': 'Fire panel walkthrough', 'category': 'Safety & Emergency', 'file_name': 'panel.pdf', 'file_type': 'pdf', 'data_url': 'data:application/pdf;base64,AAAA'}
    assert (await client.put('/api/knowledge/training-1', headers=sam, json=item)).status_code == 403
    saved = await client.put('/api/knowledge/training-1', headers=manager, json=item)
    assert saved.status_code == 200, saved.text
    await client.put('/api/knowledge/upload-1', headers=manager, json={**item, 'kind': 'sop', 'title': 'Guest policy'})

    seen = (await client.get('/api/knowledge', headers=sam)).json()['items']
    assert {(i['kind'], i['title']) for i in seen} == {('training', 'Fire panel walkthrough'), ('sop', 'Guest policy')}
    assert seen[0]['dataURL'].startswith('data:application/pdf')

    assert (await client.put('/api/knowledge/training-1/completed', headers=sam, json={'completed': True})).status_code == 200
    for_manager = {i['id']: i for i in (await client.get('/api/knowledge', headers=manager)).json()['items']}
    assert for_manager['training-1']['completedBy'] == ['Sam Lee']

    assert (await client.put('/api/knowledge/big', headers=manager, json={**item, 'data_url': 'data:video/mp4;base64,' + 'A' * 11_000_001})).status_code == 413
    assert (await client.delete('/api/knowledge/upload-1', headers=manager)).status_code == 200
    other = await _signup(client, 'other@example.com')
    client.cookies.clear()
    assert (await client.get('/api/knowledge', headers=other)).json()['items'] == []


async def test_desk_lists_survive_and_are_shared_across_the_property(client):
    manager = await _signup(client)
    sam, _ = await _concierge(client, manager, 'sam@example.com')
    kim, _ = await _concierge(client, manager, 'kim@example.com', 'Kim', 'Park')
    saved = await client.put('/api/desk-state/vendors', headers=sam, json={'data': [{'id': 1, 'company': 'City Plumbing', 'status': 'active'}]})
    assert saved.status_code == 200
    assert (await client.get('/api/desk-state', headers=kim)).json()['sections']['vendors'][0]['company'] == 'City Plumbing'
    assert (await client.put('/api/desk-state/nonsense', headers=sam, json={'data': []})).status_code == 404
    other = await _signup(client, 'other@example.com')
    client.cookies.clear()
    assert (await client.get('/api/desk-state', headers=other)).json()['sections'] == {}


async def test_picking_the_wrong_role_still_signs_you_in(client):
    await _signup(client)
    client.cookies.clear()
    resp = await client.post('/api/auth/signin', json={'role': 'concierge', 'email': 'manager@example.com', 'password': 'ManagerPass1'})
    assert resp.status_code == 200 and resp.json()['user_type'] == 'manager'
    client.cookies.clear()
    assert (await client.post('/api/auth/signin', json={'role': 'concierge', 'email': 'manager@example.com', 'password': 'nope-nope'})).status_code == 401


async def test_profile_edits_are_saved(client):
    manager = await _signup(client)
    client.cookies.clear()
    me = (await client.get('/api/auth/me', headers=manager)).json()
    assert me['property_address'] == '1 Main St · Metropolis, NY' and me['phone'] == '555-0100'
    updated = await client.put('/api/auth/me', headers=manager, json={'first_name': 'Alexis', 'phone': '555-0199', 'notification_prefs': {'incident': False}})
    assert updated.status_code == 200
    again = (await client.get('/api/auth/me', headers=manager)).json()
    assert again['name'] == 'Alexis Rivera' and again['phone'] == '555-0199'
    assert again['notification_prefs'] == {'incident': False, 'package': True}
    assert (await client.post('/api/auth/manager/signup', json={
        'first_name': 'A', 'last_name': 'B', 'email': 'not-an-email', 'phone': '1', 'job_title': 'GM', 'property_name': 'X',
        'address': '1', 'city': 'C', 'state': 'NY', 'units': 1, 'password': 'ManagerPass1'})).status_code == 400
