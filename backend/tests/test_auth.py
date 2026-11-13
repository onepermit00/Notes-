import asyncio
from datetime import datetime, timedelta, timezone

import pytest

from routes import team as team_routes


def _manager_payload(email='manager@example.com', password='ManagerPass1'):
    return {
        'first_name': 'Alex', 'last_name': 'Rivera', 'email': email, 'phone': '555-0100',
        'job_title': 'GM', 'property_name': 'The Hannah', 'address': '1 Main St',
        'city': 'Metropolis', 'state': 'NY', 'units': 40, 'password': password,
    }


async def _signup_manager(client, **overrides):
    payload = _manager_payload(**overrides)
    resp = await client.post('/api/auth/manager/signup', json=payload)
    assert resp.status_code == 200, resp.text
    return resp.json()


async def _add_concierge_direct(client, manager_token, email='concierge@example.com', password='ConciergePass1'):
    resp = await client.post(
        '/api/manager/concierge',
        json={'first_name': 'Sam', 'last_name': 'Lee', 'email': email, 'phone': '555-0101', 'title': 'Concierge', 'password': password},
        headers={'Authorization': f'Bearer {manager_token}'},
    )
    assert resp.status_code == 200, resp.text
    return resp.json()


# ── Existing behavior must not break ────────────────────────────────────────

class TestExistingAuthPreserved:
    async def test_manager_signup_still_works(self, client):
        data = await _signup_manager(client, email='signup-check@example.com')
        assert data['user_type'] == 'manager'
        assert data['token']
        assert data['email'] == 'signup-check@example.com'

    async def test_manager_signin_still_works(self, client):
        await _signup_manager(client, email='signin-mgr@example.com', password='ManagerPass1')
        resp = await client.post('/api/auth/signin', json={'email': 'signin-mgr@example.com', 'password': 'ManagerPass1', 'role': 'manager'})
        assert resp.status_code == 200
        assert resp.json()['user_type'] == 'manager'

    async def test_concierge_signin_still_works(self, client):
        mgr = await _signup_manager(client, email='concierge-owner@example.com')
        await _add_concierge_direct(client, mgr['token'], email='con-signin@example.com', password='ConciergePass1')
        resp = await client.post('/api/auth/signin', json={'email': 'con-signin@example.com', 'password': 'ConciergePass1', 'role': 'concierge'})
        assert resp.status_code == 200
        assert resp.json()['user_type'] == 'concierge'

    async def test_me_restoration_with_bearer_token(self, client):
        mgr = await _signup_manager(client, email='bearer-me@example.com')
        resp = await client.get('/api/auth/me', headers={'Authorization': f"Bearer {mgr['token']}"})
        assert resp.status_code == 200
        assert resp.json()['email'] == 'bearer-me@example.com'

    async def test_me_restoration_with_cookie(self, client):
        payload = _manager_payload(email='cookie-me@example.com')
        resp = await client.post('/api/auth/manager/signup', json=payload)
        assert resp.status_code == 200
        # signup sets a session_token cookie on the response; httpx.AsyncClient's
        # jar carries it forward automatically on the next request.
        me = await client.get('/api/auth/me')
        assert me.status_code == 200
        assert me.json()['email'] == 'cookie-me@example.com'

    async def test_direct_concierge_creation_still_works(self, client):
        mgr = await _signup_manager(client, email='direct-create-owner@example.com')
        con = await _add_concierge_direct(client, mgr['token'], email='direct-create@example.com')
        assert con['email'] == 'direct-create@example.com'
        assert 'password' in con or 'message' in con  # response shape unchanged


# ── Password recovery ────────────────────────────────────────────────────────

class TestPasswordRecovery:
    async def test_recovery_response_identical_for_known_and_unknown_email(self, client):
        await _signup_manager(client, email='known-user@example.com')
        known = await client.post('/api/auth/password/forgot', json={'email': 'known-user@example.com'})
        unknown = await client.post('/api/auth/password/forgot', json={'email': 'nobody-here@example.com'})
        assert known.status_code == unknown.status_code == 200
        assert known.json() == unknown.json()

    async def test_forgot_password_does_not_crash_without_resend_key(self, client):
        # RESEND_API_KEY is unset for the whole test session (see conftest).
        resp = await client.post('/api/auth/password/forgot', json={'email': 'anyone@example.com'})
        assert resp.status_code == 200

    async def test_reset_token_created_and_hashed_only(self, client, server):
        await _signup_manager(client, email='hash-check@example.com')
        await client.post('/api/auth/password/forgot', json={'email': 'hash-check@example.com'})
        record = await server.db.password_resets.find_one({'user_type': 'manager'})
        assert record is not None
        assert 'token' not in record
        assert len(record['token_hash']) == 64  # sha256 hex digest

    async def test_reset_rejects_short_password(self, client, server):
        await _signup_manager(client, email='policy@example.com')
        raw_token = 'raw-token-policy'
        await server.db.password_resets.insert_one({
            'token_hash': server._hash_token(raw_token),
            'user_id': 'whatever', 'user_type': 'manager',
            'created_at': datetime.now(timezone.utc),
            'expires_at': datetime.now(timezone.utc) + timedelta(minutes=30),
            'used_at': None,
        })
        resp = await client.post('/api/auth/password/reset', json={'token': raw_token, 'password': 'short'})
        assert resp.status_code == 400

    async def test_reset_token_expires(self, client, server):
        mgr = await _signup_manager(client, email='expiry@example.com', password='OldPass123')
        raw_token = 'raw-token-expired'
        await server.db.password_resets.insert_one({
            'token_hash': server._hash_token(raw_token),
            'user_id': mgr['user_id'], 'user_type': 'manager',
            'created_at': datetime.now(timezone.utc) - timedelta(hours=2),
            'expires_at': datetime.now(timezone.utc) - timedelta(minutes=1),
            'used_at': None,
        })
        resp = await client.post('/api/auth/password/reset', json={'token': raw_token, 'password': 'NewPass123'})
        assert resp.status_code == 400

    async def test_reset_token_single_use_and_full_flow(self, client, server):
        mgr = await _signup_manager(client, email='full-flow@example.com', password='OldPass123')
        session_before = await client.get('/api/auth/me', headers={'Authorization': f"Bearer {mgr['token']}"})
        assert session_before.status_code == 200

        raw_token = 'raw-token-single-use'
        await server.db.password_resets.insert_one({
            'token_hash': server._hash_token(raw_token),
            'user_id': mgr['user_id'], 'user_type': 'manager',
            'created_at': datetime.now(timezone.utc),
            'expires_at': datetime.now(timezone.utc) + timedelta(minutes=30),
            'used_at': None,
        })

        first = await client.post('/api/auth/password/reset', json={'token': raw_token, 'password': 'NewPass123'})
        assert first.status_code == 200

        # cannot reuse the same token
        second = await client.post('/api/auth/password/reset', json={'token': raw_token, 'password': 'AnotherPass1'})
        assert second.status_code == 400

        # old session was revoked
        after = await client.get('/api/auth/me', headers={'Authorization': f"Bearer {mgr['token']}"})
        assert after.status_code == 401

        # old password no longer works
        old_pw = await client.post('/api/auth/signin', json={'email': 'full-flow@example.com', 'password': 'OldPass123', 'role': 'manager'})
        assert old_pw.status_code == 401

        # new password works
        new_pw = await client.post('/api/auth/signin', json={'email': 'full-flow@example.com', 'password': 'NewPass123', 'role': 'manager'})
        assert new_pw.status_code == 200

    async def test_forgot_password_rate_limited(self, client, server):
        email = 'rate-limited@example.com'
        for _ in range(server.FORGOT_PW_RATE_LIMIT):
            resp = await client.post('/api/auth/password/forgot', json={'email': email})
            assert resp.status_code == 200
        blocked = await client.post('/api/auth/password/forgot', json={'email': email})
        assert blocked.status_code == 429


# ── Invitations ───────────────────────────────────────────────────────────────

async def _insert_invitation(server, raw_token, manager_id, property_name='The Hannah', email='invitee@example.com', **overrides):
    now = datetime.now(timezone.utc)
    doc = {
        'invitation_id': 'inv_test', 'token_hash': server._hash_token(raw_token),
        'manager_id': manager_id, 'property_name': property_name,
        'first_name': 'Jordan', 'last_name': 'Kim', 'email': email, 'phone': '555-0199',
        'title': 'Concierge', 'status': 'pending',
        'created_at': now, 'expires_at': now + timedelta(days=7), 'used_at': None,
    }
    doc.update(overrides)
    await server.db.invitations.insert_one(doc)
    return doc


class TestInvitations:
    async def test_manager_can_create_invitation(self, client):
        mgr = await _signup_manager(client, email='inviter@example.com')
        resp = await client.post(
            '/api/manager/concierge/invitations',
            json={'first_name': 'Jordan', 'last_name': 'Kim', 'email': 'invited@example.com', 'phone': '555-0102', 'title': 'Concierge'},
            headers={'Authorization': f"Bearer {mgr['token']}"},
        )
        assert resp.status_code == 200, resp.text
        body = resp.json()
        assert body['email'] == 'invited@example.com'
        assert body['property_name'] == 'The Hannah'

    async def test_unauthenticated_cannot_create_invitation(self, client):
        resp = await client.post('/api/manager/concierge/invitations', json={'first_name': 'A', 'last_name': 'B', 'email': 'x@example.com'})
        assert resp.status_code == 403

    async def test_invitation_creation_stores_hash_only(self, client, server):
        mgr = await _signup_manager(client, email='hash-inviter@example.com')
        await client.post(
            '/api/manager/concierge/invitations',
            json={'first_name': 'Jordan', 'last_name': 'Kim', 'email': 'hashed-invite@example.com'},
            headers={'Authorization': f"Bearer {mgr['token']}"},
        )
        doc = await server.db.invitations.find_one({'email': 'hashed-invite@example.com'})
        assert doc is not None
        assert 'token' not in doc
        assert len(doc['token_hash']) == 64

    async def test_verify_valid_invitation(self, client, server):
        mgr = await _signup_manager(client, email='verify-owner@example.com')
        await _insert_invitation(server, 'tok-valid', mgr['user_id'])
        resp = await client.get('/api/auth/invitations/tok-valid')
        assert resp.status_code == 200
        body = resp.json()
        assert body['status'] == 'valid'
        assert body['email'] == 'invitee@example.com'
        assert body['property_name'] == 'The Hannah'
        assert body['role'] == 'concierge'
        assert 'password_hash' not in body

    async def test_verify_invalid_invitation(self, client):
        resp = await client.get('/api/auth/invitations/does-not-exist')
        assert resp.status_code == 404
        assert resp.json()['detail']['status'] == 'invalid'

    async def test_verify_expired_invitation(self, client, server):
        mgr = await _signup_manager(client, email='expired-owner@example.com')
        past = datetime.now(timezone.utc) - timedelta(days=1)
        await _insert_invitation(server, 'tok-expired', mgr['user_id'], email='expired@example.com', expires_at=past)
        resp = await client.get('/api/auth/invitations/tok-expired')
        assert resp.status_code == 410
        assert resp.json()['detail']['status'] == 'expired'

    async def test_verify_used_invitation(self, client, server):
        mgr = await _signup_manager(client, email='used-owner@example.com')
        await _insert_invitation(server, 'tok-used', mgr['user_id'], email='used@example.com', status='accepted')
        resp = await client.get('/api/auth/invitations/tok-used')
        assert resp.status_code == 410
        assert resp.json()['detail']['status'] == 'used'

    async def test_accept_invitation_activates_concierge(self, client, server):
        mgr = await _signup_manager(client, email='accept-owner@example.com')
        await _insert_invitation(server, 'tok-accept', mgr['user_id'], email='accepted-concierge@example.com')

        resp = await client.post('/api/auth/invitations/tok-accept/accept', json={'password': 'NewConciergePass1'})
        assert resp.status_code == 200

        con = await server.db.concierges.find_one({'email': 'accepted-concierge@example.com'})
        assert con is not None
        assert con['manager_id'] == mgr['user_id']
        assert con['property_name'] == 'The Hannah'
        assert con['is_active'] is True
        assert server.verify_pw('NewConciergePass1', con['password_hash'])

        signin = await client.post('/api/auth/signin', json={'email': 'accepted-concierge@example.com', 'password': 'NewConciergePass1', 'role': 'concierge'})
        assert signin.status_code == 200

    async def test_accept_invitation_rejects_short_password(self, client, server):
        mgr = await _signup_manager(client, email='short-pw-owner@example.com')
        await _insert_invitation(server, 'tok-short-pw', mgr['user_id'], email='short-pw@example.com')
        resp = await client.post('/api/auth/invitations/tok-short-pw/accept', json={'password': 'short'})
        assert resp.status_code == 400

    async def test_invitation_cannot_be_accepted_twice(self, client, server):
        mgr = await _signup_manager(client, email='twice-owner@example.com')
        await _insert_invitation(server, 'tok-twice', mgr['user_id'], email='twice@example.com')

        first = await client.post('/api/auth/invitations/tok-twice/accept', json={'password': 'FirstPass123'})
        assert first.status_code == 200

        second = await client.post('/api/auth/invitations/tok-twice/accept', json={'password': 'SecondPass123'})
        assert second.status_code == 400

    async def test_manager_cannot_manage_another_managers_invitation(self, client, server):
        mgr_a = await _signup_manager(client, email='owner-a@example.com')
        mgr_b = await _signup_manager(client, email='owner-b@example.com')
        # Both signups left a session_token cookie in this shared client's jar
        # (the second overwrote the first). Clear it so each request below is
        # authenticated purely by its own Bearer header, like two separate users.
        client.cookies.clear()

        # Manager A invites someone; manager B independently invites a different
        # email. B's invitation must be attached to B, never to A — there is no
        # request field that lets a manager attach an invite to someone else's id.
        await client.post(
            '/api/manager/concierge/invitations',
            json={'first_name': 'A', 'last_name': 'Invitee', 'email': 'invitee-of-a@example.com'},
            headers={'Authorization': f"Bearer {mgr_a['token']}"},
        )
        await client.post(
            '/api/manager/concierge/invitations',
            json={'first_name': 'B', 'last_name': 'Invitee', 'email': 'invitee-of-b@example.com'},
            headers={'Authorization': f"Bearer {mgr_b['token']}"},
        )

        inv_a = await server.db.invitations.find_one({'email': 'invitee-of-a@example.com'})
        inv_b = await server.db.invitations.find_one({'email': 'invitee-of-b@example.com'})
        assert inv_a['manager_id'] == mgr_a['user_id']
        assert inv_b['manager_id'] == mgr_b['user_id']
        assert inv_a['manager_id'] != inv_b['manager_id']

    async def test_full_invitation_pipeline_end_to_end(self, client, server, monkeypatch):
        """Exercises create -> verify -> accept through the real HTTP endpoints,
        with the token generator patched so the test can know the raw value
        (the API never returns it — only the emailed link would)."""
        monkeypatch.setattr(team_routes, '_generate_raw_token', lambda: 'e2e-fixed-token')

        mgr = await _signup_manager(client, email='e2e-owner@example.com')
        created = await client.post(
            '/api/manager/concierge/invitations',
            json={'first_name': 'Casey', 'last_name': 'Ng', 'email': 'e2e-invitee@example.com'},
            headers={'Authorization': f"Bearer {mgr['token']}"},
        )
        assert created.status_code == 200

        verify = await client.get('/api/auth/invitations/e2e-fixed-token')
        assert verify.status_code == 200
        assert verify.json()['email'] == 'e2e-invitee@example.com'

        accept = await client.post('/api/auth/invitations/e2e-fixed-token/accept', json={'password': 'E2EPassword1'})
        assert accept.status_code == 200

        signin = await client.post('/api/auth/signin', json={'email': 'e2e-invitee@example.com', 'password': 'E2EPassword1', 'role': 'concierge'})
        assert signin.status_code == 200


# ── No plain-text passwords in email ─────────────────────────────────────────

class TestNoPasswordsInEmail:
    async def test_direct_add_email_omits_password(self, client, server, monkeypatch):
        sent = []
        async def fake_send(to, subject, html): sent.append(html)
        monkeypatch.setattr(team_routes, 'send_email', fake_send)
        mgr = await _signup_manager(client, email='nopw-owner@example.com')
        await _add_concierge_direct(client, mgr['token'], email='nopw-con@example.com', password='SecretPass99')
        await asyncio.sleep(0)
        assert sent and not any('SecretPass99' in h for h in sent)

    async def test_reset_credentials_sends_link_not_password(self, client, server, monkeypatch):
        sent = []
        async def fake_send(to, subject, html):
            sent.append(html)
            return True, ''
        monkeypatch.setattr(team_routes, 'send_email', fake_send)
        monkeypatch.setattr(team_routes, '_generate_raw_token', lambda: 'mgr-reset-token')
        mgr = await _signup_manager(client, email='reset-owner@example.com')
        con = await _add_concierge_direct(client, mgr['token'], email='reset-con@example.com')
        resp = await client.post(
            f"/api/manager/concierge/{con['concierge_id']}/resend-credentials",
            headers={'Authorization': f"Bearer {mgr['token']}"},
        )
        assert resp.status_code == 200
        assert 'new_password' not in resp.json()
        await asyncio.sleep(0)
        assert any('/reset-password?token=mgr-reset-token' in h for h in sent)

        reset = await client.post('/api/auth/password/reset', json={'token': 'mgr-reset-token', 'password': 'BrandNewPass1'})
        assert reset.status_code == 200
        signin = await client.post('/api/auth/signin', json={'email': 'reset-con@example.com', 'password': 'BrandNewPass1', 'role': 'concierge'})
        assert signin.status_code == 200

    async def test_team_list_includes_pending_invitations(self, client):
        mgr = await _signup_manager(client, email='list-owner@example.com')
        headers = {'Authorization': f"Bearer {mgr['token']}"}
        await _add_concierge_direct(client, mgr['token'], email='list-active@example.com')
        await client.post('/api/manager/concierge/invitations', json={'first_name': 'Pat', 'last_name': 'Q', 'email': 'list-invited@example.com'}, headers=headers)
        team = (await client.get('/api/manager/concierges', headers=headers)).json()['concierges']
        status = {m['email']: m['status'] for m in team}
        assert status == {'list-active@example.com': 'active', 'list-invited@example.com': 'invited'}


@pytest.mark.asyncio
class TestRemovingTeamMembers:
    async def _invite(self, client, token, email):
        return await client.post(
            '/api/manager/concierge/invitations',
            json={'first_name': 'Jordan', 'last_name': 'Kim', 'email': email},
            headers={'Authorization': f'Bearer {token}'},
        )

    async def test_cancel_pending_invite_allows_reinvite(self, client, server):
        mgr = await _signup_manager(client, email='cancel-owner@example.com')
        client.cookies.clear()
        auth = {'Authorization': f"Bearer {mgr['token']}"}
        first = await self._invite(client, mgr['token'], 'again@example.com')
        assert first.status_code == 200
        assert (await self._invite(client, mgr['token'], 'again@example.com')).status_code == 409

        raw_token = first.json()['invite_link'].rsplit('/', 1)[-1]
        resp = await client.delete(f"/api/manager/concierge/invitations/{first.json()['invitation_id']}", headers=auth)
        assert resp.status_code == 200

        listed = (await client.get('/api/manager/concierges', headers=auth)).json()['concierges']
        assert listed == []
        assert (await client.get(f'/api/auth/invitations/{raw_token}')).status_code != 200
        assert (await self._invite(client, mgr['token'], 'again@example.com')).status_code == 200

    async def test_cannot_cancel_another_managers_invite(self, client, server):
        owner = await _signup_manager(client, email='inv-owner@example.com')
        client.cookies.clear()
        other = await _signup_manager(client, email='inv-other@example.com')
        client.cookies.clear()
        inv = await self._invite(client, owner['token'], 'mine@example.com')
        resp = await client.delete(
            f"/api/manager/concierge/invitations/{inv.json()['invitation_id']}",
            headers={'Authorization': f"Bearer {other['token']}"},
        )
        assert resp.status_code == 404
        assert await server.db.invitations.find_one({'email': 'mine@example.com'})

    async def test_cancel_invite_requires_manager(self, client):
        assert (await client.delete('/api/manager/concierge/invitations/inv_x')).status_code == 403

    async def test_removed_concierge_is_signed_out_and_can_be_reinvited(self, client, server):
        mgr = await _signup_manager(client, email='remove-owner@example.com')
        client.cookies.clear()
        auth = {'Authorization': f"Bearer {mgr['token']}"}
        con = await _add_concierge_direct(client, mgr['token'], email='leaver@example.com')
        client.cookies.clear()
        signin = await client.post('/api/auth/signin', json={'email': 'leaver@example.com', 'password': 'ConciergePass1', 'role': 'concierge'})
        assert signin.status_code == 200
        client.cookies.clear()
        assert await server.db.sessions.find_one({'user_id': con['concierge_id']})

        resp = await client.delete(f"/api/manager/concierge/{con['concierge_id']}", headers=auth)
        assert resp.status_code == 200
        assert await server.db.sessions.find_one({'user_id': con['concierge_id']}) is None
        assert await server.db.concierges.find_one({'email': 'leaver@example.com'}) is None
        assert (await self._invite(client, mgr['token'], 'leaver@example.com')).status_code == 200
