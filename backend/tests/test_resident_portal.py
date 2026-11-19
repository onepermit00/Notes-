"""Residents: the manager invites each occupant, they join with their own login,
send requests that land on the desk's To do, and follow them to the end."""
from tests.test_desk_flows import _concierge, _signup


async def _invite_and_join(client, server, manager, name='Dana Fox', unit='12B', email='dana@example.com'):
    added = await client.post('/api/residents', headers=manager, json={'name': name, 'unit': unit, 'email': email})
    assert added.status_code == 200, added.text
    rid = added.json()['resident_id']
    assert added.json()['account_status'] == 'not_invited'
    invite = await client.post(f'/api/residents/{rid}/invite', headers=manager)
    assert invite.status_code == 200, invite.text
    token = invite.json()['invite_link'].rsplit('/', 1)[-1]

    info = await client.get(f'/api/auth/invitations/{token}')
    assert info.json()['role'] == 'resident' and info.json()['unit'] == unit
    accepted = await client.post(f'/api/auth/invitations/{token}/accept', json={'password': 'ResidentPass1'})
    assert accepted.status_code == 200, accepted.text
    signin = await client.post('/api/auth/signin', json={'role': 'resident', 'email': email, 'password': 'ResidentPass1'})
    assert signin.status_code == 200, signin.text
    client.cookies.clear()
    assert signin.json()['user_type'] == 'resident' and signin.json()['unit'] == unit
    return {'Authorization': f"Bearer {signin.json()['token']}"}, rid


async def test_each_occupant_joins_with_their_own_login(client, server):
    manager = await _signup(client)
    dana, _ = await _invite_and_join(client, server, manager)
    lee, _ = await _invite_and_join(client, server, manager, 'Lee Fox', '12B', 'lee@example.com')

    me = (await client.get('/api/auth/me', headers=lee)).json()
    assert me['user_type'] == 'resident' and me['name'] == 'Lee Fox' and me['property_name'] == 'Harbor House'

    listed = (await client.get('/api/residents', headers=manager)).json()['residents']
    assert {r['account_status'] for r in listed} == {'active'}
    assert all('password_hash' not in r for r in listed)
    # The sign-in page's role choice doesn't matter: the right account opens.
    wrong_role = await client.post('/api/auth/signin', json={'role': 'concierge', 'email': 'dana@example.com', 'password': 'ResidentPass1'})
    client.cookies.clear()
    assert wrong_role.status_code == 200 and wrong_role.json()['user_type'] == 'resident'


async def test_residents_cannot_reach_staff_data(client, server):
    manager = await _signup(client)
    dana, _ = await _invite_and_join(client, server, manager)
    for path in ('/api/tasks', '/api/residents', '/api/incidents', '/api/messages', '/api/contacts', '/api/shifts/active'):
        resp = await client.get(path, headers=dana)
        assert resp.status_code in (401, 403), (path, resp.status_code)
    assert (await client.post('/api/tasks', headers=dana, json={'title': 'x'})).status_code == 403


async def test_request_goes_to_the_desk_and_the_resident_follows_it(client, server):
    manager = await _signup(client)
    dana, rid = await _invite_and_join(client, server, manager)
    sam, _ = await _concierge(client, manager, 'sam@example.com')
    await client.post('/api/shifts/start', headers=sam)

    sent = await client.post('/api/resident/requests', headers=dana, json={
        'request_type': 'noise', 'kind': 'Music or TV', 'location': 'Unit 14C', 'happening_now': True,
        'description': 'Loud music since 11pm.', 'photos': ['data:image/png;base64,AAAA']})
    assert sent.status_code == 200, sent.text
    request_id = sent.json()['request_id']
    assert sent.json()['status_label'] == 'Received' and [e['event'] for e in sent.json()['timeline']] == ['sent']

    todo = [t for t in (await client.get('/api/tasks', headers=sam)).json()['tasks'] if t['task_id'] == request_id]
    assert len(todo) == 1
    task = todo[0]
    assert task['created_by_type'] == 'resident' and task['priority'] == 'Urgent'
    assert 'Unit 12B' in task['title'] and task['resident_name'] == 'Dana Fox' and 'Loud music' in task['notes']
    assert task['request_photos'] == ['data:image/png;base64,AAAA']

    await client.put(f'/api/tasks/{request_id}', headers=sam, json={'status': 'in_progress'})
    done = await client.put(f'/api/tasks/{request_id}', headers=sam, json={
        'status': 'completed', 'completion_note': 'Spoke to 14C, music off.', 'resident_reply': 'We asked your neighbor to keep it down.'})
    assert done.status_code == 200, done.text

    mine = (await client.get(f'/api/resident/requests/{request_id}', headers=dana)).json()
    assert mine['status_label'] == 'Resolved' and mine['reply'] == 'We asked your neighbor to keep it down.'
    assert [e['event'] for e in mine['timeline']] == ['sent', 'started', 'resolved']
    # The resident never sees the desk's own notes or who worked on it.
    assert 'Spoke to 14C' not in str(mine) and 'Sam' not in str(mine)

    # The finished request is in the shift's report.
    shift = (await client.get('/api/shifts/active', headers=sam)).json()
    assert any(a['task_id'] == request_id for a in shift['shift']['activities'])


async def test_resident_only_sees_their_own_requests(client, server):
    manager = await _signup(client)
    dana, _ = await _invite_and_join(client, server, manager)
    lee, _ = await _invite_and_join(client, server, manager, 'Lee Park', '14C', 'lee@example.com')
    sent = await client.post('/api/resident/requests', headers=dana, json={'request_type': 'work_order', 'urgency': 'urgent',
                                                                          'kind': 'Plumbing', 'description': 'Kitchen sink leaking.',
                                                                          'permission_to_enter': True})
    request_id = sent.json()['request_id']
    assert (await client.get('/api/resident/requests', headers=lee)).json()['requests'] == []
    assert (await client.get(f'/api/resident/requests/{request_id}', headers=lee)).status_code == 404


async def test_open_request_moves_to_the_next_shift(client, server):
    manager = await _signup(client)
    dana, _ = await _invite_and_join(client, server, manager)
    sam, _ = await _concierge(client, manager, 'sam@example.com')
    kim, _ = await _concierge(client, manager, 'kim@example.com', 'Kim', 'Park')
    await client.post('/api/shifts/start', headers=sam)
    request_id = (await client.post('/api/resident/requests', headers=dana, json={
        'request_type': 'report', 'kind': 'Common area problem', 'description': 'Lobby light out.'})).json()['request_id']
    await client.put(f'/api/tasks/{request_id}', headers=sam, json={'status': 'in_progress'})
    await client.post('/api/shifts/handover', headers=sam, json={'handover_notes': '', 'open_items': []})

    await client.post('/api/shifts/start', headers=kim)
    assert any(t['task_id'] == request_id for t in (await client.get('/api/tasks', headers=kim)).json()['tasks'])


async def test_removed_resident_is_signed_out_but_requests_stay(client, server):
    manager = await _signup(client)
    dana, rid = await _invite_and_join(client, server, manager)
    await client.post('/api/resident/requests', headers=dana, json={'request_type': 'report', 'description': 'Gym door broken.'})
    assert (await client.delete(f'/api/residents/{rid}', headers=manager)).status_code == 200
    assert (await client.get('/api/resident/home', headers=dana)).status_code == 401
    assert len((await client.get('/api/tasks', headers=manager)).json()['tasks']) == 1


async def test_import_and_front_desk_settings(client, server):
    manager = await _signup(client)
    imported = await client.post('/api/residents/import', headers=manager, json={'residents': [
        {'name': 'A One', 'unit': '101', 'email': 'a@example.com'},
        {'name': 'B Two', 'unit': '102'},
        {'name': '', 'unit': '103'},
        {'name': 'A One', 'unit': '101'},
    ]})
    body = imported.json()
    assert len(body['added']) == 2 and body['skipped'] == 1 and len(body['problems']) == 1

    saved = await client.put('/api/manager/resident-settings', headers=manager, json={'front_desk_email': 'Desk@Harbor.com', 'front_desk_phone': '555-0199'})
    assert saved.json() == {'front_desk_email': 'desk@harbor.com', 'front_desk_phone': '555-0199'}
    dana, _ = await _invite_and_join(client, server, manager)
    home = (await client.get('/api/resident/home', headers=dana)).json()
    assert home['front_desk_email'] == 'desk@harbor.com' and home['unit'] == '12B'
