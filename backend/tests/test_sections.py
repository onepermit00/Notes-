async def _signup(client, email='manager@example.com'):
    resp = await client.post('/api/auth/manager/signup', json={
        'first_name': 'Alex', 'last_name': 'Rivera', 'email': email, 'phone': '555-0100',
        'job_title': 'GM', 'property_name': 'Harbor House', 'address': '1 Main St',
        'city': 'Metropolis', 'state': 'NY', 'units': 40, 'password': 'ManagerPass1'})
    return {'Authorization': f"Bearer {resp.json()['token']}"}


async def test_section_switches_are_saved_and_reach_the_concierge(client):
    manager = await _signup(client)
    added = await client.post('/api/manager/concierge', headers=manager, json={
        'first_name': 'Sam', 'last_name': 'Lee', 'email': 'sam@example.com', 'phone': '555-0101', 'title': 'Concierge', 'password': 'ConciergePass1'})
    con_id = added.json()['concierge_id']
    signin = await client.post('/api/auth/signin', json={'role': 'concierge', 'email': 'sam@example.com', 'password': 'ConciergePass1'})
    desk = {'Authorization': f"Bearer {signin.json()['token']}"}
    client.cookies.clear()

    # Nothing switched off yet: only the always-on sections are listed.
    first = (await client.get('/api/concierge/sections', headers=desk)).json()
    assert first == {'sections': {'home': True, 'emergency': True}, 'custom_sections': []}

    saved = await client.put(f'/api/manager/concierge/{con_id}/sections', headers=manager,
                             json={'sections': {'packages': False, 'guests': True, 'home': False}})
    assert saved.status_code == 200, saved.text
    await client.put('/api/manager/shift-sections', headers=manager,
                     json={'custom_sections': [{'id': 'custom_1', 'label': 'Pool checks', 'desc': ''}]})

    seen = (await client.get('/api/concierge/sections', headers=desk)).json()
    assert seen['sections']['packages'] is False and seen['sections']['guests'] is True
    assert seen['sections']['home'] is True  # required sections cannot be switched off
    assert [s['label'] for s in seen['custom_sections']] == ['Pool checks']

    # The manager sees the saved switches again after a refresh.
    listed = (await client.get('/api/manager/concierges', headers=manager)).json()['concierges']
    assert listed[0]['section_access']['packages'] is False
    assert (await client.get('/api/manager/shift-sections', headers=manager)).json()['custom_sections'][0]['id'] == 'custom_1'

    # Concierges cannot change their own access, and managers cannot touch another property's staff.
    assert (await client.put(f'/api/manager/concierge/{con_id}/sections', headers=desk, json={'sections': {}})).status_code == 403
    other = await _signup(client, 'other@example.com')
    client.cookies.clear()
    assert (await client.put(f'/api/manager/concierge/{con_id}/sections', headers=other, json={'sections': {'packages': True}})).status_code == 404
