async def _signup(client):
    resp = await client.post('/api/auth/manager/signup', json={
        'first_name': 'Alex', 'last_name': 'Rivera', 'email': 'manager@example.com', 'phone': '555-0100',
        'job_title': 'GM', 'property_name': 'Harbor House', 'address': '1 Main St',
        'city': 'Metropolis', 'state': 'NY', 'units': 40, 'password': 'ManagerPass1'})
    return {'Authorization': f"Bearer {resp.json()['token']}"}


async def test_manager_contacts_reach_the_desk_and_only_the_manager_can_change_them(client):
    manager = await _signup(client)
    await client.post('/api/manager/concierge', headers=manager, json={
        'first_name': 'Sam', 'last_name': 'Lee', 'email': 'sam@example.com', 'phone': '555-0101', 'title': 'Concierge', 'password': 'ConciergePass1'})
    signin = await client.post('/api/auth/signin', json={'role': 'concierge', 'email': 'sam@example.com', 'password': 'ConciergePass1'})
    desk = {'Authorization': f"Bearer {signin.json()['token']}"}
    client.cookies.clear()  # each request below is told who is asking by its own header

    made = await client.post('/api/contacts', headers=manager, json={'label': 'Elevator service', 'number': '(555) 010-7788'})
    assert made.status_code == 200, made.text
    assert (await client.post('/api/contacts', headers=manager, json={'label': 'No number', 'number': 'call me'})).status_code == 400

    seen = (await client.get('/api/contacts', headers=desk)).json()
    assert [c['label'] for c in seen['contacts']] == ['Elevator service']
    assert seen['manager']['name'] == 'Alex Rivera' and seen['manager']['phone'] == '555-0100'

    contact_id = made.json()['contact_id']
    assert (await client.post('/api/contacts', headers=desk, json={'label': 'X', 'number': '555'})).status_code == 403
    assert (await client.delete(f'/api/contacts/{contact_id}', headers=desk)).status_code == 403
    assert (await client.delete(f'/api/contacts/{contact_id}', headers=manager)).status_code == 200
    assert (await client.get('/api/contacts', headers=desk)).json()['contacts'] == []


async def test_manager_files_contacts_under_a_group_and_can_edit_them(client):
    manager = await _signup(client)
    made = await client.post('/api/contacts', headers=manager, json={
        'label': 'Jordan Miles', 'number': '555-0144', 'category': 'Staff', 'role': 'Maintenance lead'})
    assert made.status_code == 200, made.text
    assert made.json()['category'] == 'Staff' and made.json()['role'] == 'Maintenance lead'
    custom = await client.post('/api/contacts', headers=manager, json={'label': 'Otis', 'number': '555-0190', 'category': 'Elevator company'})
    assert custom.json()['category'] == 'Elevator company'
    # Contacts saved before groups existed read as building contacts.
    plain = await client.post('/api/contacts', headers=manager, json={'label': 'Locksmith', 'number': '555-0191'})
    assert plain.json()['category'] == 'Building & vendors'

    contact_id = made.json()['contact_id']
    edited = await client.put(f'/api/contacts/{contact_id}', headers=manager, json={
        'label': 'Jordan Miles', 'number': '555-0145', 'category': 'Emergency services', 'role': ''})
    assert edited.status_code == 200 and edited.json()['number'] == '555-0145' and edited.json()['category'] == 'Emergency services'
    assert (await client.put('/api/contacts/ct_missing', headers=manager, json={'label': 'X', 'number': '555'})).status_code == 404
    listed = {c['label']: c for c in (await client.get('/api/contacts', headers=manager)).json()['contacts']}
    assert listed['Jordan Miles']['number'] == '555-0145'
