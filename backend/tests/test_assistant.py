import json
from types import SimpleNamespace

from routes import assistant as assistant_routes
from routes.assistant import AssistantTurn, clean, clean_turns


def _manager_payload(email='manager@example.com'):
    return {
        'first_name': 'Alex', 'last_name': 'Rivera', 'email': email, 'phone': '555-0100',
        'job_title': 'GM', 'property_name': 'Harbor House', 'address': '1 Main St',
        'city': 'Metropolis', 'state': 'NY', 'units': 40, 'password': 'ManagerPass1',
    }


async def _manager(client):
    resp = await client.post('/api/auth/manager/signup', json=_manager_payload())
    assert resp.status_code == 200, resp.text
    return {'Authorization': f"Bearer {resp.json()['token']}"}


class _FakeClient:
    """Stands in for the model: returns one prepared plan and records what it was sent."""

    def __init__(self, plan, stop_reason='end_turn'):
        self.plan, self.stop_reason, self.calls = plan, stop_reason, []
        self.messages = SimpleNamespace(create=self._create)

    async def _create(self, **kwargs):
        self.calls.append(kwargs)
        return SimpleNamespace(
            stop_reason=self.stop_reason, usage=None,
            content=[SimpleNamespace(type='text', text=json.dumps(self.plan))],
        )


class TestCleaning:
    def test_turns_start_and_end_with_the_person(self):
        turns = clean_turns([
            AssistantTurn(role='assistant', text='Hi'),
            AssistantTurn(role='user', text='  log a package  '),
            AssistantTurn(role='assistant', text='Which unit?'),
            AssistantTurn(role='user', text='312'),
        ])
        assert [t['role'] for t in turns] == ['user', 'assistant', 'user']
        assert turns[0]['text'] == 'log a package'

    def test_turns_ending_with_the_assistant_are_refused(self):
        assert clean_turns([AssistantTurn(role='user', text='hi'), AssistantTurn(role='assistant', text='hello')]) == []

    def test_unknown_ids_pages_and_values_are_dropped(self):
        record = {'residents': [{'id': 'res_1', 'name': 'Maria', 'unit': '524'}], 'team': [{'id': 'con_1', 'name': 'Casey'}]}
        out = clean({
            'kind': 'find', 'reply': 'Here.', 'ids': ['res_1', 'res_made_up', 'res_1'], 'open': 'packages',
            'fields': {'unit': '524'},
        }, record)
        assert out['ids'] == ['res_1']
        assert out['open'] == ''        # only "open" and "protocol" answers may send someone to a section
        assert out['fields'] is None    # a find never carries an entry

    def test_entry_fields_are_validated(self):
        record = {'team': [{'id': 'con_1', 'name': 'Casey'}]}
        out = clean({'kind': 'task', 'reply': 'ok', 'fields': {
            'what': 'Check the pool gate', 'due': '3pm', 'priority': 'Urgent', 'assignee_id': 'con_other',
            'count': '250', 'severity': 'catastrophic', 'incident_type': 'alien',
        }}, record)
        f = out['fields']
        assert f['what'] == 'Check the pool gate'
        assert f['due'] == '' and f['priority'] == '' and f['assignee_id'] == ''
        assert f['count'] == '' and f['severity'] == '' and f['incident_type'] == ''

    def test_unknown_kind_becomes_other(self):
        assert clean({'kind': 'delete_everything', 'reply': 'x'}, {})['kind'] == 'other'


class TestEndpoint:
    async def test_requires_sign_in(self, client):
        resp = await client.post('/api/assistant', json={'messages': [{'role': 'user', 'text': 'hello'}]})
        assert resp.status_code == 401

    async def test_without_a_key_the_app_is_told_to_use_its_own_rules(self, client, monkeypatch):
        monkeypatch.setattr(assistant_routes, 'get_client', lambda: None)
        headers = await _manager(client)
        status = await client.get('/api/assistant/status', headers=headers)
        assert status.json() == {'available': False}
        resp = await client.post('/api/assistant', json={'messages': [{'role': 'user', 'text': 'hello'}]}, headers=headers)
        assert resp.status_code == 200
        assert resp.json() == {'answer': None, 'reason': 'unavailable'}

    async def test_plan_is_cleaned_against_the_property_record(self, client, monkeypatch):
        headers = await _manager(client)
        made = await client.post('/api/residents', json={'name': 'Maria Alvarez', 'unit': '524', 'phone': '555-2001', 'email': 'maria@example.com'}, headers=headers)
        resident_id = made.json()['resident_id']
        fake = _FakeClient({'kind': 'find', 'reply': 'Maria is in 524.', 'ids': [resident_id, 'res_not_real'], 'open': '', 'fields': None})
        monkeypatch.setattr(assistant_routes, 'get_client', lambda: fake)

        resp = await client.post('/api/assistant', json={'messages': [{'role': 'user', 'text': 'where does Maria live'}]}, headers=headers)
        assert resp.status_code == 200, resp.text
        answer = resp.json()['answer']
        assert answer['kind'] == 'find' and answer['ids'] == [resident_id]

        sent = fake.calls[0]
        text = sent['messages'][-1]['content']
        assert 'Maria Alvarez' in text and '524' in text
        # contact details never leave the property record
        assert '555-2001' not in text and 'maria@example.com' not in text

    async def test_a_refusal_is_a_polite_other(self, client, monkeypatch):
        headers = await _manager(client)
        monkeypatch.setattr(assistant_routes, 'get_client', lambda: _FakeClient({}, stop_reason='refusal'))
        resp = await client.post('/api/assistant', json={'messages': [{'role': 'user', 'text': 'something odd'}]}, headers=headers)
        assert resp.json()['answer']['kind'] == 'other'

    async def test_empty_message_is_rejected(self, client):
        headers = await _manager(client)
        resp = await client.post('/api/assistant', json={'messages': [{'role': 'user', 'text': '   '}]}, headers=headers)
        assert resp.status_code == 400


class TestConciergeTaskVisibility:
    async def test_a_concierge_does_not_see_a_namesake_colleagues_tasks(self, client):
        headers = await _manager(client)
        ids = {}
        for first, email in (('Sam', 'sam@example.com'), ('Samantha', 'samantha@example.com')):
            r = await client.post('/api/manager/concierge', headers=headers, json={
                'first_name': first, 'last_name': 'Lee', 'email': email, 'phone': '555-0101', 'title': 'Concierge', 'password': 'ConciergePass1'})
            ids[first] = r.json()['concierge_id']
        await client.post('/api/tasks', headers=headers, json={'title': 'For Samantha', 'assigned_to': 'Samantha Lee', 'assigned_to_id': ids['Samantha']})
        await client.post('/api/tasks', headers=headers, json={'title': 'For whoever is on', 'category': 'Other'})

        signin = await client.post('/api/auth/signin', json={'role': 'concierge', 'email': 'sam@example.com', 'password': 'ConciergePass1'})
        sam = {'Authorization': f"Bearer {signin.json()['token']}"}
        titles = [t['title'] for t in (await client.get('/api/tasks', headers=sam)).json()['tasks']]
        assert 'For Samantha' not in titles
        assert 'For whoever is on' in titles
