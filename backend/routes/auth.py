"""Sign-up, sign-in, sessions, password reset and invitation acceptance."""
from core import esc
import asyncio
import os
import uuid
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Cookie, HTTPException, Request, Response
from pydantic import BaseModel
from typing import Optional
from core import (
    AcceptInvitationRequest, FORGOT_PW_RATE_LIMIT, FORGOT_PW_RATE_WINDOW,
    ForgotPasswordRequest, ManagerSignupRequest, RESET_TOKEN_MINUTES, ResetPasswordRequest,
    SignInRequest, UpdateProfileRequest, _check_rate_limit, _generate_raw_token,
    _hash_token, account_store, clean_email, create_session, db, get_session, hash_pw, logger, send_email, set_cookie,
    validate_password_policy, verify_pw,
)

api = APIRouter(prefix='/api')

def _profile(user: dict, user_type: str) -> dict:
    """What the app needs to know about the signed-in person, in one shape for
    sign-up, sign-in, session restore and profile edits."""
    base = {
        'user_type':     user_type,
        'name':          f"{user.get('first_name', '')} {user.get('last_name', '')}".strip(),
        'first_name':    user.get('first_name', ''),
        'last_name':     user.get('last_name', ''),
        'email':         user['email'],
        'phone':         user.get('phone', ''),
        'property_name': user.get('property_name', ''),
    }
    if user_type == 'resident':
        first, _, last = (user.get('name') or '').strip().partition(' ')
        return {**base, 'user_id': user['resident_id'], 'title': 'Resident', 'unit': user.get('unit', ''),
                'name': user.get('name', ''), 'first_name': first, 'last_name': last.strip(),
                'manager_id': user['manager_id'], 'property_address': user.get('_property_address', '')}
    if user_type == 'maintenance':
        return {**base, 'user_id': user['concierge_id'], 'title': user.get('title') or 'Maintenance',
                'manager_id': user['manager_id'], 'property_address': user.get('_property_address', '')}
    if user_type == 'manager':
        return {**base, 'user_id': user['manager_id'], 'title': user.get('job_title') or 'Property Manager',
                'property_address': _address(user), 'notification_prefs': _prefs(user)}
    return {**base, 'user_id': user['concierge_id'], 'title': user.get('title', 'Concierge'),
            'manager_id': user['manager_id'], 'property_address': user.get('_property_address', '')}


def _address(manager: dict) -> str:
    street = (manager.get('address') or '').strip()
    city_state = ', '.join(x for x in [(manager.get('city') or '').strip(), (manager.get('state') or '').strip()] if x)
    return ' · '.join(x for x in [street, city_state] if x)


NOTIFICATION_DEFAULTS = {'incident': True, 'package': True}

def _prefs(manager: dict) -> dict:
    saved = manager.get('notification_prefs') or {}
    return {key: bool(saved.get(key, default)) for key, default in NOTIFICATION_DEFAULTS.items()}


async def _with_property(user: dict, user_type: str) -> dict:
    """Concierges and residents read the property's address from their manager's record."""
    if user_type in ('concierge', 'resident', 'maintenance'):
        manager = await db.managers.find_one({'manager_id': user.get('manager_id')},
                                             {'address': 1, 'city': 1, 'state': 1, 'property_name': 1})
        user = {**user, '_property_address': _address(manager or {})}
        if user_type == 'resident':
            user['property_name'] = (manager or {}).get('property_name', '')
    return user


@api.post('/auth/manager/signup')
async def manager_signup(data: ManagerSignupRequest, response: Response):
    validate_password_policy(data.password)
    email = clean_email(data.email)
    for field, label in ((data.first_name, 'first name'), (data.last_name, 'last name'), (data.property_name, 'property name')):
        if not field.strip():
            raise HTTPException(400, f'Enter your {label}.')
    if data.units < 1:
        raise HTTPException(400, 'Enter at least 1 unit.')
    if await db.managers.find_one({'email': email}):
        raise HTTPException(400, 'An account with this email already exists.')

    mgr_id = f'mgr_{uuid.uuid4().hex[:12]}'
    await db.managers.insert_one({
        'manager_id':    mgr_id,
        'email':         email,
        'password_hash': hash_pw(data.password),
        'first_name':    data.first_name.strip(),
        'last_name':     data.last_name.strip(),
        'phone':         data.phone,
        'job_title':     data.job_title,
        'property_name': data.property_name.strip(),
        'address':       data.address,
        'city':          data.city,
        'state':         data.state,
        'units':         data.units,
        'created_at':    datetime.now(timezone.utc),
    })

    token = await create_session(mgr_id, 'manager')
    set_cookie(response, token)

    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:40px 20px">
      <div style="background:#0F0F0F;border-radius:16px 16px 0 0;padding:32px;text-align:center">
        <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin:0 0 8px">Noted</p>
        <h1 style="color:white;font-size:22px;font-weight:800;margin:0">Welcome to Noted, {esc(data.first_name)}!</h1>
      </div>
      <div style="background:#fff;border:1px solid #ebebeb;border-top:none;border-radius:0 0 16px 16px;padding:32px">
        <p style="color:#444;font-size:15px;line-height:1.7">Your manager account for <strong>{esc(data.property_name)}</strong> is ready.</p>
        <p style="color:#444;font-size:15px;line-height:1.7">Sign in any time at:</p>
        <a href="{esc(frontend_url)}" style="display:block;background:#FF385C;color:white;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;margin:20px 0">{esc(frontend_url)}</a>
        <p style="color:#aaa;font-size:13px">You can add your concierge team from the Team section of your dashboard.</p>
      </div>
    </div>"""
    asyncio.create_task(send_email(email, 'Welcome to Noted — your account is ready', html))

    manager = await db.managers.find_one({'manager_id': mgr_id})
    return {'token': token, **_profile(manager, 'manager')}


@api.post('/auth/signin')
async def signin(data: SignInRequest, response: Response):
    email = data.email.lower().strip()
    if data.role == 'maintenance':
        data.role = 'concierge'   # maintenance staff are team members; the account decides which app opens
    if data.role not in ('manager', 'concierge', 'resident'):
        raise HTTPException(400, 'Role must be "manager", "concierge", "maintenance" or "resident".')

    async def _find(role: str):
        if role == 'manager':
            user = await db.managers.find_one({'email': email})
        elif role == 'resident':
            user = await db.residents.find_one({'email': email, 'is_active': True})
        else:
            user = await db.concierges.find_one({'email': email, 'is_active': True})
        return user if user and user.get('password_hash') and verify_pw(data.password, user['password_hash']) else None

    # Try the role that was picked first. If the email and password are right but
    # the other role was picked by mistake, sign them in to the account they have
    # instead of telling them their password is wrong.
    role, user = data.role, await _find(data.role)
    for other in ('manager', 'concierge', 'resident'):
        if user:
            break
        if other != data.role:
            role, user = other, await _find(other)
    if not user:
        raise HTTPException(401, 'Invalid email or password.')

    if role == 'concierge' and user.get('role') == 'maintenance':
        role = 'maintenance'
    user_id = user[account_store(role)[1]]
    token = await create_session(user_id, role)
    set_cookie(response, token)
    return {'token': token, **_profile(await _with_property(user, role), role)}


@api.get('/auth/me')
async def me(request: Request, session_token: Optional[str] = Cookie(default=None)):
    session = await get_session(request, session_token)
    if not session:
        raise HTTPException(401, 'Not authenticated.')

    collection, id_field = account_store(session['user_type'])
    user = await collection.find_one({id_field: session['user_id']}, {'_id': 0, 'password_hash': 0})
    if not user or (session['user_type'] == 'resident' and not user.get('is_active')):
        raise HTTPException(401, 'User not found.')
    return _profile(await _with_property(user, session['user_type']), session['user_type'])


@api.post('/auth/signout')
async def signout(request: Request, response: Response, session_token: Optional[str] = Cookie(default=None)):
    session = await get_session(request, session_token)
    if session:
        await db.sessions.delete_one({'token': session['token']})
    response.delete_cookie('session_token', path='/')
    return {'message': 'Signed out.'}


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password:     str

@api.put('/auth/change-password')
async def change_password(data: ChangePasswordRequest, request: Request, session_token: Optional[str] = Cookie(default=None)):
    session = await get_session(request, session_token)
    if not session:
        raise HTTPException(401, 'Not authenticated.')
    validate_password_policy(data.new_password)
    collection, id_field = account_store(session['user_type'])
    user = await collection.find_one({id_field: session['user_id']})
    if not user:
        raise HTTPException(404, 'User not found.')
    if not verify_pw(data.current_password, user['password_hash']):
        raise HTTPException(400, 'Current password is incorrect.')
    await collection.update_one({id_field: session['user_id']}, {'$set': {'password_hash': hash_pw(data.new_password)}})
    return {'message': 'Password updated successfully.'}


# ── Password recovery ────────────────────────────────────────────────────────

FORGOT_PASSWORD_NEUTRAL_RESPONSE = {
    'message': 'If an account exists for that email, password reset instructions will be sent.'
}

@api.post('/auth/password/forgot')
async def forgot_password(data: ForgotPasswordRequest):
    email = data.email.lower().strip()
    if not email:
        return FORGOT_PASSWORD_NEUTRAL_RESPONSE

    # Rate-limited by normalized email, independent of whether the account
    # exists, so the limiter itself can't be used to test for an account.
    await _check_rate_limit(f'forgot-password:{email}', FORGOT_PW_RATE_LIMIT, FORGOT_PW_RATE_WINDOW)

    user_type = 'manager'
    user = await db.managers.find_one({'email': email})
    if not user:
        user_type = 'concierge'
        user = await db.concierges.find_one({'email': email, 'is_active': True})
    if not user:
        user_type = 'resident'
        user = await db.residents.find_one({'email': email, 'is_active': True})

    if user:
        user_id   = user[account_store(user_type)[1]]
        raw_token = _generate_raw_token()
        now       = datetime.now(timezone.utc)
        await db.password_resets.insert_one({
            'token_hash': _hash_token(raw_token),
            'user_id':    user_id,
            'user_type':  user_type,
            'created_at': now,
            'expires_at': now + timedelta(minutes=RESET_TOKEN_MINUTES),
            'used_at':    None,
        })

        frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
        reset_link   = f'{frontend_url}/reset-password?token={raw_token}'
        html = f"""
        <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:40px 20px">
          <div style="background:#0F0F0F;border-radius:16px 16px 0 0;padding:32px;text-align:center">
            <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin:0 0 8px">Noted</p>
            <h1 style="color:white;font-size:22px;font-weight:800;margin:0">Reset your password</h1>
          </div>
          <div style="background:#fff;border:1px solid #ebebeb;border-top:none;border-radius:0 0 16px 16px;padding:32px">
            <p style="color:#444;font-size:15px;line-height:1.7">Hi {esc(user.get('first_name') or (user.get('name') or '').split(' ')[0])},</p>
            <p style="color:#444;font-size:15px;line-height:1.7">We received a request to reset your Noted password. This link expires in {esc(RESET_TOKEN_MINUTES)} minutes.</p>
            <a href="{esc(reset_link)}" style="display:block;background:#FF385C;color:white;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;margin:20px 0">Reset password</a>
            <p style="color:#aaa;font-size:13px">If you didn't request this, you can safely ignore this email.</p>
          </div>
        </div>"""
        asyncio.create_task(send_email(user['email'], 'Reset your Noted password', html))
        logger.info(f'Password reset requested for {user_type} {user_id}')  # never log the raw token
    else:
        logger.info(f'Password reset requested for unregistered email — no email sent')

    return FORGOT_PASSWORD_NEUTRAL_RESPONSE


@api.post('/auth/password/reset')
async def reset_password(data: ResetPasswordRequest):
    validate_password_policy(data.password)

    now = datetime.now(timezone.utc)
    record = await db.password_resets.find_one_and_update(
        {'token_hash': _hash_token(data.token), 'used_at': None, 'expires_at': {'$gt': now}},
        {'$set': {'used_at': now}},
    )
    if not record:
        raise HTTPException(400, 'This reset link is invalid or has expired.')

    collection, id_field = account_store(record['user_type'])
    user = await collection.find_one({id_field: record['user_id']})
    if not user:
        raise HTTPException(400, 'This reset link is invalid or has expired.')

    await collection.update_one({id_field: record['user_id']}, {'$set': {'password_hash': hash_pw(data.password)}})
    await db.sessions.delete_many({'user_id': record['user_id']})
    return {'message': 'Password reset successfully. You can now sign in.'}


# ── Concierge invitations ────────────────────────────────────────────────────

@api.get('/auth/invitations/{token}')
async def get_invitation(token: str):
    inv = await db.invitations.find_one({'token_hash': _hash_token(token)})
    if not inv:
        raise HTTPException(404, detail={'status': 'invalid', 'message': 'This invitation link is not valid.'})

    expires_at = inv['expires_at']
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)

    if inv['status'] == 'accepted':
        raise HTTPException(410, detail={'status': 'used', 'message': 'This invitation has already been used.'})
    if inv['status'] == 'revoked':
        raise HTTPException(404, detail={'status': 'invalid', 'message': 'This invitation link is not valid.'})
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(410, detail={'status': 'expired', 'message': 'This invitation has expired.'})

    return {
        'status':        'valid',
        'email':         inv['email'],
        'name':          f"{inv['first_name']} {inv['last_name']}".strip(),
        'property_name': inv['property_name'],
        'role':          inv.get('kind') or inv.get('role') or 'concierge',
        'unit':          inv.get('unit', ''),
        'expires_at':    expires_at.isoformat(),
    }


@api.post('/auth/invitations/{token}/accept')
async def accept_invitation(token: str, data: AcceptInvitationRequest):
    validate_password_policy(data.password)

    now = datetime.now(timezone.utc)
    inv = await db.invitations.find_one_and_update(
        {'token_hash': _hash_token(token), 'status': 'pending', 'expires_at': {'$gt': now}},
        {'$set': {'status': 'accepted', 'used_at': now}},
    )
    if not inv:
        raise HTTPException(400, 'This invitation link is invalid, expired, or already used.')

    manager = await db.managers.find_one({'manager_id': inv['manager_id']})
    if not manager:
        raise HTTPException(400, 'This invitation is no longer valid.')

    if inv.get('kind') == 'resident':
        # The manager already added this person to the directory; the invite
        # only turns that entry into an account they can sign in with.
        resident = await db.residents.find_one({'resident_id': inv.get('resident_id'), 'manager_id': inv['manager_id']})
        if not resident:
            raise HTTPException(400, 'This invitation is no longer valid.')
        if await db.residents.find_one({'email': inv['email'], 'is_active': True, 'resident_id': {'$ne': resident['resident_id']}}):
            raise HTTPException(409, 'An account with this email already exists.')
        await db.residents.update_one({'resident_id': resident['resident_id']}, {'$set': {
            'email':         inv['email'],
            'password_hash': hash_pw(data.password),
            'is_active':     True,
            'joined_at':     datetime.now(timezone.utc),
        }})
        return {'message': 'Account activated. You can now sign in.'}

    if await db.concierges.find_one({'email': inv['email']}):
        raise HTTPException(409, 'An account with this email already exists.')

    con_id = f'con_{uuid.uuid4().hex[:12]}'
    await db.concierges.insert_one({
        'concierge_id':  con_id,
        'role':          inv.get('role') or ('maintenance' if (inv.get('title') or '').strip().lower() == 'maintenance' else 'concierge'),
        'email':         inv['email'],
        'password_hash': hash_pw(data.password),
        'first_name':    inv['first_name'],
        'last_name':     inv['last_name'],
        'phone':         inv.get('phone', ''),
        'title':         inv.get('title', 'Concierge'),
        'manager_id':    inv['manager_id'],
        'property_name': manager['property_name'],
        'is_active':     True,
        'created_at':    datetime.now(timezone.utc),
    })

    return {'message': 'Account activated. You can now sign in.'}


@api.put('/auth/me')
async def update_profile(data: UpdateProfileRequest, request: Request, session_token: Optional[str] = Cookie(default=None)):
    session = await get_session(request, session_token)
    if not session:
        raise HTTPException(401, 'Not authenticated.')
    patch = {}
    if session['user_type'] == 'resident':
        # Residents have one name field, and the manager's directory shows it.
        if data.first_name is not None or data.last_name is not None:
            name = f"{data.first_name or ''} {data.last_name or ''}".strip()
            if not name:
                raise HTTPException(400, 'Enter your name.')
            patch['name'] = name[:120]
    else:
        if data.first_name is not None:
            if not data.first_name.strip():
                raise HTTPException(400, 'Enter your name.')
            patch['first_name'] = data.first_name.strip()[:80]
        if data.last_name  is not None: patch['last_name']  = data.last_name.strip()[:80]
    if data.phone      is not None: patch['phone']      = data.phone.strip()[:40]
    if data.notification_prefs is not None and session['user_type'] == 'manager':
        patch['notification_prefs'] = {key: bool(data.notification_prefs.get(key, default)) for key, default in NOTIFICATION_DEFAULTS.items()}
    if not patch:
        raise HTTPException(400, 'No fields to update.')
    collection, id_field = account_store(session['user_type'])
    result = await collection.update_one({id_field: session['user_id']}, {'$set': patch})
    if result.matched_count == 0:
        raise HTTPException(404, 'User not found.')
    user = await collection.find_one({id_field: session['user_id']}, {'_id': 0, 'password_hash': 0})
    if 'first_name' in patch or 'last_name' in patch:
        # Keep the name on an open shift in step, so today's report shows the right person.
        if session['user_type'] == 'concierge':
            await db.shifts.update_many({'concierge_id': session['user_id'], 'status': 'active'},
                                        {'$set': {'concierge_name': f"{user['first_name']} {user['last_name']}".strip()}})
    return _profile(await _with_property(user, session['user_type']), session['user_type'])
