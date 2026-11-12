"""Email delivery: provider selection, sender parsing, and invite fallback."""
import pytest

import core


@pytest.fixture(autouse=True)
def _no_keys(monkeypatch):
    for k in ('RESEND_API_KEY', 'BREVO_API_KEY', 'EMAIL_FROM'):
        monkeypatch.delenv(k, raising=False)


def test_provider_selection(monkeypatch):
    assert core.email_provider() is None
    monkeypatch.setenv('BREVO_API_KEY', 'b')
    assert core.email_provider() == 'brevo'
    monkeypatch.setenv('RESEND_API_KEY', 'r')
    assert core.email_provider() == 'resend'


def test_sender_parsing(monkeypatch):
    assert core._sender() == ('Noted', 'onboarding@resend.dev')
    monkeypatch.setenv('EMAIL_FROM', 'Front Desk <desk@example.com>')
    assert core._sender() == ('Front Desk', 'desk@example.com')
    monkeypatch.setenv('EMAIL_FROM', 'desk@example.com')
    assert core._sender() == ('Noted', 'desk@example.com')


@pytest.mark.asyncio
async def test_send_email_reports_not_configured():
    sent, reason = await core.send_email('a@example.com', 's', '<p>x</p>')
    assert sent is False and 'not set up' in reason


@pytest.mark.asyncio
async def test_send_email_reports_provider_error(monkeypatch):
    monkeypatch.setenv('BREVO_API_KEY', 'b')
    calls = []

    def fake_post(url, payload, headers):
        calls.append((url, payload, headers))
        raise RuntimeError('400: sender not verified')

    monkeypatch.setattr(core, '_post_json', fake_post)
    sent, reason = await core.send_email('a@example.com', 'Hi', '<p>x</p>')
    assert sent is False and 'sender not verified' in reason
    url, payload, headers = calls[0]
    assert 'brevo' in url and headers['api-key'] == 'b'
    assert payload['to'] == [{'email': 'a@example.com'}]


@pytest.mark.asyncio
async def test_send_email_success_via_resend(monkeypatch):
    monkeypatch.setenv('RESEND_API_KEY', 'r')
    monkeypatch.setenv('EMAIL_FROM', 'Noted <hi@example.com>')
    calls = []
    monkeypatch.setattr(core, '_post_json', lambda *a: calls.append(a))
    assert await core.send_email('a@example.com', 'Hi', '<p>x</p>') == (True, '')
    assert calls[0][1]['from'] == 'Noted <hi@example.com>'


@pytest.mark.asyncio
async def test_invite_returns_link_when_email_not_sent(client):
    from tests.test_auth import _signup_manager
    token = (await _signup_manager(client, email='mgr-email@example.com'))['token']
    resp = await client.post('/api/manager/concierge/invitations',
                             headers={'Authorization': f'Bearer {token}'},
                             json={'first_name': 'Jo', 'last_name': 'Kim', 'email': 'jo@example.com'})
    assert resp.status_code == 200
    data = resp.json()
    assert data['email_sent'] is False
    assert data['invite_link'].startswith('http://localhost:3000/invite/')
    assert data['email_error']


@pytest.mark.asyncio
async def test_health_reports_email_setup(client):
    data = (await client.get('/api/health')).json()
    assert data['email'] == 'not configured'


def test_requests_send_a_user_agent(monkeypatch):
    seen = {}

    class Resp:
        def __enter__(self): return self
        def __exit__(self, *a): return False
        def read(self): return b'{}'

    def fake_urlopen(req, timeout=0):
        seen.update(req.header_items())
        return Resp()

    monkeypatch.setattr(core.urllib.request, 'urlopen', fake_urlopen)
    core._post_json('https://api.resend.com/emails', {}, {'Authorization': 'Bearer x'})
    assert 'Noted/' in seen.get('User-agent', '')
