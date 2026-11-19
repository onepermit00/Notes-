"""Residents directory, resident invitations and the building's resident settings."""
import os
import uuid
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Cookie, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
from core import (
    INVITE_TOKEN_DAYS, _audit, _generate_raw_token, _hash_token, _resolve_user,
    clean_email, db, esc, send_email,
)

api = APIRouter(prefix='/api')

# What staff screens may read about a resident. The password hash never leaves the server.
_HIDDEN = {'_id': 0, 'password_hash': 0}


class ResidentCreate(BaseModel):
    name:  str
    unit:  str
    phone: Optional[str] = ''
    email: Optional[str] = ''
    notes: Optional[str] = ''

class ResidentUpdate(BaseModel):
    name:  Optional[str] = None
    unit:  Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    notes: Optional[str] = None

class ResidentImport(BaseModel):
    residents: List[ResidentCreate]

class ResidentSettings(BaseModel):
    front_desk_email: Optional[str] = None
    front_desk_phone: Optional[str] = None


def _iso(doc: dict) -> dict:
    for f in ('created_at', 'joined_at'):
        if isinstance(doc.get(f), datetime):
            doc[f] = doc[f].isoformat()
    return doc


async def _invite_status(mgr_id: str) -> dict:
    """resident_id -> 'invited' | 'expired' for the latest pending invitation."""
    now = datetime.now(timezone.utc)
    out = {}
    async for inv in db.invitations.find({'manager_id': mgr_id, 'kind': 'resident', 'status': 'pending'},
                                         {'resident_id': 1, 'expires_at': 1}):
        exp = inv.get('expires_at')
        if exp is not None and exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        state = 'invited' if exp and exp > now else 'expired'
        if out.get(inv.get('resident_id')) != 'invited':
            out[inv.get('resident_id')] = state
    return out


def _with_status(doc: dict, invites: dict) -> dict:
    if doc.get('is_active'):
        doc['account_status'] = 'active'
    else:
        doc['account_status'] = invites.get(doc['resident_id'], 'not_invited')
    doc.pop('is_active', None)
    return _iso(doc)


def _settings(manager: dict) -> dict:
    return {
        'front_desk_email': manager.get('front_desk_email') or '',
        'front_desk_phone': manager.get('front_desk_phone') or '',
    }


async def _require_manager(request, session_token):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if user_type != 'manager':
        raise HTTPException(403, 'Manager access required.')
    return user, mgr_id


def _clean_fields(data) -> dict:
    out = {}
    for key, limit in (('name', 120), ('unit', 30), ('phone', 40), ('notes', 1000)):
        value = getattr(data, key, None)
        if value is not None:
            out[key] = value.strip()[:limit]
    if getattr(data, 'email', None) is not None:
        out['email'] = clean_email(data.email) if data.email.strip() else ''
    return out


@api.get('/residents')
async def list_residents(request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    docs = await db.residents.find({'manager_id': mgr_id}, _HIDDEN).sort('unit', 1).to_list(5000)
    invites = await _invite_status(mgr_id)
    docs = [_with_status(d, invites) for d in docs]
    manager = await db.managers.find_one({'manager_id': mgr_id}) or {}
    return {'residents': docs, 'settings': _settings(manager)}


async def _insert_resident(mgr_id: str, fields: dict) -> dict:
    res_id = f'res_{uuid.uuid4().hex[:12]}'
    doc = {
        'resident_id': res_id,
        'manager_id':  mgr_id,
        'name':        fields.get('name', ''),
        'unit':        fields.get('unit', ''),
        'phone':       fields.get('phone', ''),
        'email':       fields.get('email', ''),
        'notes':       fields.get('notes', ''),
        'is_active':   False,
        'created_at':  datetime.now(timezone.utc),
    }
    await db.residents.insert_one(doc)
    doc.pop('_id', None)
    return doc


@api.post('/residents')
async def create_resident(data: ResidentCreate, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, mgr_id = await _require_manager(request, session_token)
    fields = _clean_fields(data)
    if not fields.get('name') or not fields.get('unit'):
        raise HTTPException(400, 'Enter the resident\'s name and unit.')
    doc = await _insert_resident(mgr_id, fields)
    await _audit(mgr_id, user['manager_id'], 'manager', 'create', 'resident', doc['resident_id'], {'name': doc['name'], 'unit': doc['unit']})
    return _with_status(doc, {})


@api.post('/residents/import')
async def import_residents(data: ResidentImport, request: Request, session_token: Optional[str] = Cookie(default=None)):
    """Add many residents at once, from a spreadsheet the manager uploads.
    A row with the same name and unit as someone already listed is skipped."""
    user, mgr_id = await _require_manager(request, session_token)
    if len(data.residents) > 2000:
        raise HTTPException(400, 'Import up to 2,000 residents at a time.')
    existing = {(r['name'].strip().lower(), r['unit'].strip().lower())
                async for r in db.residents.find({'manager_id': mgr_id}, {'name': 1, 'unit': 1})}
    added, skipped, problems = [], 0, []
    for i, row in enumerate(data.residents, start=1):
        try:
            fields = _clean_fields(row)
        except HTTPException:
            problems.append(f'Row {i}: the email address is not valid.')
            continue
        if not fields.get('name') or not fields.get('unit'):
            problems.append(f'Row {i}: a name and a unit are needed.')
            continue
        key = (fields['name'].lower(), fields['unit'].lower())
        if key in existing:
            skipped += 1
            continue
        existing.add(key)
        added.append(_with_status(await _insert_resident(mgr_id, fields), {}))
    await _audit(mgr_id, user['manager_id'], 'manager', 'create', 'resident', '', {'imported': len(added)})
    return {'added': added, 'skipped': skipped, 'problems': problems[:50]}


@api.put('/residents/{resident_id}')
async def update_resident(resident_id: str, data: ResidentUpdate, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, mgr_id = await _require_manager(request, session_token)
    patch = _clean_fields(data)
    if not patch:
        raise HTTPException(400, 'Nothing to update.')
    if 'name' in patch and not patch['name'] or 'unit' in patch and not patch['unit']:
        raise HTTPException(400, 'A resident needs a name and a unit.')
    current = await db.residents.find_one({'resident_id': resident_id, 'manager_id': mgr_id})
    if not current:
        raise HTTPException(404, 'Resident not found.')
    if 'email' in patch and patch['email'] != current.get('email', ''):
        if current.get('is_active') and not patch['email']:
            raise HTTPException(400, 'This resident signs in with their email, so it cannot be left empty.')
        if patch['email'] and await db.residents.find_one({'email': patch['email'], 'is_active': True, 'resident_id': {'$ne': resident_id}}):
            raise HTTPException(409, 'Another resident account already uses this email.')
        # An invitation sent to the old address must stop working.
        await db.invitations.delete_many({'kind': 'resident', 'resident_id': resident_id, 'status': 'pending'})
    await db.residents.update_one({'resident_id': resident_id, 'manager_id': mgr_id}, {'$set': patch})
    updated = await db.residents.find_one({'resident_id': resident_id}, _HIDDEN)
    await _audit(mgr_id, user['manager_id'], 'manager', 'update', 'resident', resident_id, patch)
    return _with_status(updated, await _invite_status(mgr_id))


@api.delete('/residents/{resident_id}')
async def delete_resident(resident_id: str, request: Request, session_token: Optional[str] = Cookie(default=None)):
    """Remove a resident who moved out. Their account stops working at once.
    Requests they sent stay on record, because the building's history must be kept."""
    user, mgr_id = await _require_manager(request, session_token)
    result = await db.residents.delete_one({'resident_id': resident_id, 'manager_id': mgr_id})
    if result.deleted_count == 0:
        raise HTTPException(404, 'Resident not found.')
    await db.sessions.delete_many({'user_id': resident_id, 'user_type': 'resident'})
    await db.password_resets.delete_many({'user_id': resident_id, 'user_type': 'resident'})
    await db.invitations.delete_many({'kind': 'resident', 'resident_id': resident_id})
    await _audit(mgr_id, user['manager_id'], 'manager', 'delete', 'resident', resident_id, {})
    return {'message': 'Resident removed.'}


# ── Invitations ─────────────────────────────────────────────────────────────

async def _send_resident_invite(manager: dict, resident: dict) -> dict:
    email = (resident.get('email') or '').strip().lower()
    if not email:
        raise HTTPException(400, 'Add an email address for this resident first.')
    if resident.get('is_active'):
        raise HTTPException(409, 'This resident has already joined.')
    if await db.residents.find_one({'email': email, 'is_active': True, 'resident_id': {'$ne': resident['resident_id']}}):
        raise HTTPException(409, 'Another resident account already uses this email.')

    now = datetime.now(timezone.utc)
    # A new invite replaces any earlier one, so only the latest link works.
    await db.invitations.delete_many({'kind': 'resident', 'resident_id': resident['resident_id'], 'status': 'pending'})
    inv_id     = f'inv_{uuid.uuid4().hex[:12]}'
    raw_token  = _generate_raw_token()
    expires_at = now + timedelta(days=INVITE_TOKEN_DAYS)
    first, _, last = (resident.get('name') or '').strip().partition(' ')
    await db.invitations.insert_one({
        'invitation_id': inv_id,
        'kind':          'resident',
        'resident_id':   resident['resident_id'],
        'unit':          resident.get('unit', ''),
        'token_hash':    _hash_token(raw_token),
        'manager_id':    manager['manager_id'],
        'property_name': manager['property_name'],
        'first_name':    first,
        'last_name':     last.strip(),
        'email':         email,
        'title':         'Resident',
        'status':        'pending',
        'created_at':    now,
        'expires_at':    expires_at,
        'used_at':       None,
    })

    frontend_url  = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    invite_link   = f'{frontend_url}/invite/{raw_token}'
    property_name = manager['property_name']
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:40px 20px">
      <div style="background:#FF385C;border-radius:16px 16px 0 0;padding:32px;text-align:center">
        <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.7);margin:0 0 8px">Noted</p>
        <h1 style="color:white;font-size:22px;font-weight:800;margin:0">Join {esc(property_name)} on Noted</h1>
      </div>
      <div style="background:#fff;border:1px solid #ebebeb;border-top:none;border-radius:0 0 16px 16px;padding:32px">
        <p style="color:#444;font-size:15px;line-height:1.7">Hi {esc(first or 'there')},</p>
        <p style="color:#444;font-size:15px;line-height:1.7">
          {esc(property_name)} uses Noted for resident requests. Once you join, you can send a noise complaint,
          a work order or any other report for Unit {esc(resident.get('unit', ''))} from your phone, and follow it until it is done.
        </p>
        <a href="{esc(invite_link)}" style="display:block;background:#FF385C;color:white;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;margin:20px 0">Join your building</a>
        <p style="color:#aaa;font-size:13px">This link expires in {esc(INVITE_TOKEN_DAYS)} days and lets you set your own password.</p>
      </div>
    </div>"""
    email_sent, email_error = await send_email(email, f'Join {property_name} on Noted', html)
    return {
        'resident_id': resident['resident_id'],
        'invitation_id': inv_id,
        'email': email,
        'expires_at': expires_at.isoformat(),
        'invite_link': invite_link,
        'email_sent': email_sent,
        'email_error': email_error,
    }


@api.post('/residents/{resident_id}/invite')
async def invite_resident(resident_id: str, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, mgr_id = await _require_manager(request, session_token)
    resident = await db.residents.find_one({'resident_id': resident_id, 'manager_id': mgr_id})
    if not resident:
        raise HTTPException(404, 'Resident not found.')
    result = await _send_resident_invite(user, resident)
    await _audit(mgr_id, user['manager_id'], 'manager', 'create', 'resident_invitation', resident_id, {'email': result['email']})
    return result


@api.post('/residents/invite-all')
async def invite_all_residents(request: Request, session_token: Optional[str] = Cookie(default=None)):
    """Invite every resident with an email who has not joined and has no live invitation."""
    user, mgr_id = await _require_manager(request, session_token)
    invites = await _invite_status(mgr_id)
    sent, failed = 0, 0
    residents = await db.residents.find({'manager_id': mgr_id, 'is_active': {'$ne': True}, 'email': {'$nin': ['', None]}}).to_list(5000)
    for resident in residents:
        if invites.get(resident['resident_id']) == 'invited':
            continue
        try:
            result = await _send_resident_invite(user, resident)
            sent += 1 if result['email_sent'] else 0
            failed += 0 if result['email_sent'] else 1
        except HTTPException:
            failed += 1
    await _audit(mgr_id, user['manager_id'], 'manager', 'create', 'resident_invitation', '', {'sent': sent, 'failed': failed})
    return {'sent': sent, 'failed': failed}


@api.delete('/residents/{resident_id}/invite')
async def cancel_resident_invite(resident_id: str, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, mgr_id = await _require_manager(request, session_token)
    result = await db.invitations.delete_many({'manager_id': mgr_id, 'kind': 'resident', 'resident_id': resident_id, 'status': 'pending'})
    if result.deleted_count == 0:
        raise HTTPException(404, 'No invitation to cancel.')
    return {'message': 'Invitation cancelled.'}


@api.put('/manager/resident-settings')
async def save_resident_settings(data: ResidentSettings, request: Request, session_token: Optional[str] = Cookie(default=None)):
    """How residents reach the front desk: the Email and Call buttons in their app."""
    user, mgr_id = await _require_manager(request, session_token)
    patch = {}
    if data.front_desk_email is not None:
        patch['front_desk_email'] = clean_email(data.front_desk_email) if data.front_desk_email.strip() else ''
    if data.front_desk_phone is not None:
        patch['front_desk_phone'] = data.front_desk_phone.strip()[:40]
    if patch:
        await db.managers.update_one({'manager_id': mgr_id}, {'$set': patch})
    manager = await db.managers.find_one({'manager_id': mgr_id}) or {}
    return _settings(manager)
