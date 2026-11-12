"""Manager tools for concierge accounts and invitations."""
from core import esc
import asyncio
import os
import uuid
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Cookie, HTTPException, Request
from typing import Optional
from core import (
    AddConciergeRequest, CreateInvitationRequest, INVITE_TOKEN_DAYS, RESET_TOKEN_MINUTES,
    _generate_raw_token, _hash_token, db, get_session, hash_pw, send_email,
)

api = APIRouter(prefix='/api')

@api.post('/manager/concierge')
async def add_concierge(data: AddConciergeRequest, request: Request, session_token: Optional[str] = Cookie(default=None)):
    session = await get_session(request, session_token)
    if not session or session['user_type'] != 'manager':
        raise HTTPException(403, 'Manager access required.')

    manager = await db.managers.find_one({'manager_id': session['user_id']})
    if not manager:
        raise HTTPException(404, 'Manager not found.')

    if len(data.password) < 8:
        raise HTTPException(400, 'Password must be at least 8 characters.')
    if await db.concierges.find_one({'email': data.email.lower()}):
        raise HTTPException(400, 'A concierge with this email already exists.')

    con_id = f'con_{uuid.uuid4().hex[:12]}'
    await db.concierges.insert_one({
        'concierge_id':  con_id,
        'email':         data.email.lower(),
        'password_hash': hash_pw(data.password),
        'first_name':    data.first_name,
        'last_name':     data.last_name,
        'phone':         data.phone,
        'title':         data.title,
        'manager_id':    session['user_id'],
        'property_name': manager['property_name'],
        'is_active':     True,
        'created_at':    datetime.now(timezone.utc),
    })

    # Send credentials email to the concierge
    frontend_url   = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    manager_name   = f"{manager['first_name']} {manager['last_name']}"
    property_name  = manager['property_name']
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:40px 20px">
      <div style="background:#FF385C;border-radius:16px 16px 0 0;padding:32px;text-align:center">
        <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.7);margin:0 0 8px">Noted</p>
        <h1 style="color:white;font-size:22px;font-weight:800;margin:0">You've been added to {esc(property_name)}</h1>
      </div>
      <div style="background:#fff;border:1px solid #ebebeb;border-top:none;border-radius:0 0 16px 16px;padding:32px">
        <p style="color:#444;font-size:15px;line-height:1.7">Hi {esc(data.first_name)},</p>
        <p style="color:#444;font-size:15px;line-height:1.7">
          <strong>{esc(manager_name)}</strong> has added you as a <strong>{esc(data.title)}</strong>
          at <strong>{esc(property_name)}</strong> on the Noted platform.
        </p>
        <p style="color:#444;font-size:15px;line-height:1.7">
          Sign in with <strong>{esc(data.email)}</strong>. Your manager will give you a temporary password in person,
          or you can choose your own with <strong>Forgot password</strong> on the sign-in screen.
        </p>
        <a href="{esc(frontend_url)}/login" style="display:block;background:#FF385C;color:white;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px">Sign In to Noted</a>
      </div>
    </div>"""
    asyncio.create_task(send_email(data.email, f"You've been added to {property_name} on Noted", html))

    return {
        'concierge_id':  con_id,
        'first_name':    data.first_name,
        'last_name':     data.last_name,
        'email':         data.email.lower(),
        'title':         data.title,
        'phone':         data.phone,
        'property_name': property_name,
        'message':       'Concierge added. Welcome email sent.',
    }


@api.get('/manager/concierges')
async def list_concierges(request: Request, session_token: Optional[str] = Cookie(default=None)):
    session = await get_session(request, session_token)
    if not session or session['user_type'] != 'manager':
        raise HTTPException(403, 'Manager access required.')

    docs = await db.concierges.find(
        {'manager_id': session['user_id']},
        {'_id': 0, 'password_hash': 0}
    ).to_list(200)

    for d in docs:
        d['status'] = 'active'
        if isinstance(d.get('created_at'), datetime):
            d['created_at'] = d['created_at'].isoformat()

    invites = await db.invitations.find(
        {'manager_id': session['user_id'], 'status': 'pending', 'expires_at': {'$gt': datetime.now(timezone.utc)}},
        {'_id': 0, 'token_hash': 0},
    ).to_list(200)
    for inv in invites:
        docs.append({
            'invitation_id': inv['invitation_id'],
            'first_name':    inv['first_name'],
            'last_name':     inv['last_name'],
            'email':         inv['email'],
            'phone':         inv.get('phone', ''),
            'title':         inv.get('title', 'Concierge'),
            'status':        'invited',
            'created_at':    inv['created_at'].isoformat() if isinstance(inv.get('created_at'), datetime) else inv.get('created_at'),
        })

    return {'concierges': docs}


@api.post('/manager/concierge/{concierge_id}/resend-credentials')
async def resend_credentials(concierge_id: str, request: Request, session_token: Optional[str] = Cookie(default=None)):
    session = await get_session(request, session_token)
    if not session or session['user_type'] != 'manager':
        raise HTTPException(403, 'Manager access required.')

    manager = await db.managers.find_one({'manager_id': session['user_id']})
    con = await db.concierges.find_one({'concierge_id': concierge_id, 'manager_id': session['user_id']})
    if not con:
        raise HTTPException(404, 'Concierge not found.')

    raw_token = _generate_raw_token()
    now       = datetime.now(timezone.utc)
    await db.password_resets.insert_one({
        'token_hash': _hash_token(raw_token),
        'user_id':    concierge_id,
        'user_type':  'concierge',
        'created_at': now,
        'expires_at': now + timedelta(minutes=RESET_TOKEN_MINUTES),
        'used_at':    None,
    })

    manager_name  = f"{manager['first_name']} {manager['last_name']}"
    property_name = manager['property_name']
    frontend_url  = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    reset_link    = f'{frontend_url}/reset-password?token={raw_token}'
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:40px 20px">
      <div style="background:#FF385C;border-radius:16px 16px 0 0;padding:32px;text-align:center">
        <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.7);margin:0 0 8px">Noted</p>
        <h1 style="color:white;font-size:22px;font-weight:800;margin:0">Set a new password</h1>
      </div>
      <div style="background:#fff;border:1px solid #ebebeb;border-top:none;border-radius:0 0 16px 16px;padding:32px">
        <p style="color:#444;font-size:15px;line-height:1.7">Hi {esc(con['first_name'])},</p>
        <p style="color:#444;font-size:15px;line-height:1.7">
          <strong>{esc(manager_name)}</strong> sent you a link to set a new password for <strong>{esc(property_name)}</strong>.
          It expires in {esc(RESET_TOKEN_MINUTES)} minutes.
        </p>
        <a href="{esc(reset_link)}" style="display:block;background:#FF385C;color:white;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;margin:20px 0">Set new password</a>
        <p style="color:#aaa;font-size:13px">If you weren't expecting this, you can ignore this email. Your current password still works.</p>
      </div>
    </div>"""
    asyncio.create_task(send_email(con['email'], 'Set a new Noted password', html))
    return {'message': 'Password reset link emailed.'}


@api.delete('/manager/concierge/{concierge_id}')
async def remove_concierge(concierge_id: str, request: Request, session_token: Optional[str] = Cookie(default=None)):
    session = await get_session(request, session_token)
    if not session or session['user_type'] != 'manager':
        raise HTTPException(403, 'Manager access required.')

    result = await db.concierges.delete_one(
        {'concierge_id': concierge_id, 'manager_id': session['user_id']}
    )
    if result.deleted_count == 0:
        raise HTTPException(404, 'Concierge not found.')

    return {'message': 'Concierge removed.'}


@api.post('/manager/concierge/invitations')
async def create_concierge_invitation(data: CreateInvitationRequest, request: Request, session_token: Optional[str] = Cookie(default=None)):
    """Alternative to POST /manager/concierge — invites a concierge to set their own
    password instead of the manager generating one. The direct-create endpoint above
    is unchanged and still supported."""
    session = await get_session(request, session_token)
    if not session or session['user_type'] != 'manager':
        raise HTTPException(403, 'Manager access required.')

    manager = await db.managers.find_one({'manager_id': session['user_id']})
    if not manager:
        raise HTTPException(404, 'Manager not found.')

    email = data.email.lower().strip()
    if await db.concierges.find_one({'email': email}):
        raise HTTPException(409, 'A concierge with this email already exists.')

    now = datetime.now(timezone.utc)
    if await db.invitations.find_one({'email': email, 'status': 'pending', 'expires_at': {'$gt': now}}):
        raise HTTPException(409, 'An active invitation already exists for this email.')

    inv_id    = f'inv_{uuid.uuid4().hex[:12]}'
    raw_token = _generate_raw_token()
    expires_at = now + timedelta(days=INVITE_TOKEN_DAYS)
    await db.invitations.insert_one({
        'invitation_id': inv_id,
        'token_hash':    _hash_token(raw_token),
        'manager_id':    session['user_id'],       # scopes this invitation to the issuing manager only
        'property_name': manager['property_name'],
        'first_name':    data.first_name,
        'last_name':     data.last_name,
        'email':         email,
        'phone':         data.phone or '',
        'title':         data.title or 'Concierge',
        'status':        'pending',
        'created_at':    now,
        'expires_at':    expires_at,
        'used_at':       None,
    })

    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    invite_link  = f'{frontend_url}/invite/{raw_token}'
    manager_name = f"{manager['first_name']} {manager['last_name']}"
    property_name = manager['property_name']
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:40px 20px">
      <div style="background:#FF385C;border-radius:16px 16px 0 0;padding:32px;text-align:center">
        <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.7);margin:0 0 8px">Noted</p>
        <h1 style="color:white;font-size:22px;font-weight:800;margin:0">You've been invited to {esc(property_name)}</h1>
      </div>
      <div style="background:#fff;border:1px solid #ebebeb;border-top:none;border-radius:0 0 16px 16px;padding:32px">
        <p style="color:#444;font-size:15px;line-height:1.7">Hi {esc(data.first_name)},</p>
        <p style="color:#444;font-size:15px;line-height:1.7">
          <strong>{esc(manager_name)}</strong> has invited you to join <strong>{esc(property_name)}</strong> as a <strong>{data.title or 'Concierge'}</strong> on the Noted platform.
        </p>
        <a href="{esc(invite_link)}" style="display:block;background:#FF385C;color:white;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;margin:20px 0">Accept invitation</a>
        <p style="color:#aaa;font-size:13px">This link expires in {esc(INVITE_TOKEN_DAYS)} days and lets you set your own password.</p>
      </div>
    </div>"""
    email_sent, email_error = await send_email(email, f"You've been invited to {property_name} on Noted", html)

    return {
        'invitation_id': inv_id,
        'email':         email,
        'first_name':    data.first_name,
        'last_name':     data.last_name,
        'title':         data.title or 'Concierge',
        'property_name': property_name,
        'expires_at':    expires_at.isoformat(),
        # The manager who issued the invite can share the link by hand if email fails.
        'invite_link':   invite_link,
        'email_sent':    email_sent,
        'email_error':   email_error,
        'message':       'Invitation sent.' if email_sent else 'Invitation created, but the email could not be sent.',
    }
