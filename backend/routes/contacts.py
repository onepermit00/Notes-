"""The property's own contact directory: numbers the manager adds for the desk."""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Cookie, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional
from core import _audit, _resolve_user, db

api = APIRouter(prefix='/api')


class ContactCreate(BaseModel):
    label: str = Field(min_length=1, max_length=80)
    number: str = Field(min_length=3, max_length=40)


@api.get('/contacts')
async def get_contacts(request: Request, session_token: Optional[str] = Cookie(default=None)):
    """Contacts for the property, plus the manager, so the desk always has someone real to call."""
    _user, _user_type, mgr_id = await _resolve_user(request, session_token)
    contacts = await db.contacts.find({'manager_id': mgr_id}, {'_id': 0}).sort('created_at', 1).to_list(100)
    for c in contacts:
        if isinstance(c.get('created_at'), datetime):
            c['created_at'] = c['created_at'].isoformat()
    manager = await db.managers.find_one({'manager_id': mgr_id}, {'_id': 0, 'first_name': 1, 'last_name': 1, 'phone': 1, 'email': 1, 'job_title': 1})
    return {
        'contacts': contacts,
        'manager': {
            'name':  f"{manager.get('first_name', '')} {manager.get('last_name', '')}".strip(),
            'title': manager.get('job_title') or 'Property Manager',
            'phone': manager.get('phone', ''),
            'email': manager.get('email', ''),
        } if manager else None,
    }


@api.post('/contacts')
async def add_contact(data: ContactCreate, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if user_type != 'manager':
        raise HTTPException(403, 'Only the property manager can change the contact directory.')
    label, number = data.label.strip(), data.number.strip()
    if not label or not any(ch.isdigit() for ch in number):
        raise HTTPException(400, 'Give the contact a name and a phone number.')
    if await db.contacts.count_documents({'manager_id': mgr_id}) >= 100:
        raise HTTPException(400, 'The contact directory is full. Remove one before adding another.')
    doc = {
        'contact_id': f'ct_{uuid.uuid4().hex[:12]}',
        'manager_id': mgr_id,
        'label':      label,
        'number':     number,
        'created_at': datetime.now(timezone.utc),
    }
    await db.contacts.insert_one(doc)
    doc.pop('_id', None)
    doc['created_at'] = doc['created_at'].isoformat()
    await _audit(mgr_id, user['manager_id'], user_type, 'create', 'contact', doc['contact_id'], {'label': label})
    return doc


@api.delete('/contacts/{contact_id}')
async def delete_contact(contact_id: str, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if user_type != 'manager':
        raise HTTPException(403, 'Only the property manager can change the contact directory.')
    result = await db.contacts.delete_one({'contact_id': contact_id, 'manager_id': mgr_id})
    if not result.deleted_count:
        raise HTTPException(404, 'Contact not found.')
    await _audit(mgr_id, user['manager_id'], user_type, 'delete', 'contact', contact_id, {})
    return {'deleted': True}
