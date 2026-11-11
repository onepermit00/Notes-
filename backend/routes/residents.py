"""Residents directory."""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Cookie, HTTPException, Request
from pydantic import BaseModel
from typing import Optional
from core import _audit, _resolve_user, db

api = APIRouter(prefix='/api')

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

@api.get('/residents')
async def list_residents(request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    docs = await db.residents.find({'manager_id': mgr_id}, {'_id': 0}).sort('unit', 1).to_list(2000)
    for d in docs:
        if isinstance(d.get('created_at'), datetime): d['created_at'] = d['created_at'].isoformat()
    return {'residents': docs}

@api.post('/residents')
async def create_resident(data: ResidentCreate, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if user_type != 'manager':
        raise HTTPException(403, 'Manager access required.')
    res_id = f'res_{uuid.uuid4().hex[:12]}'
    doc = {
        'resident_id': res_id,
        'manager_id':  mgr_id,
        'name':        data.name.strip(),
        'unit':        data.unit.strip(),
        'phone':       data.phone or '',
        'email':       data.email or '',
        'notes':       data.notes or '',
        'created_at':  datetime.now(timezone.utc),
    }
    await db.residents.insert_one(doc)
    doc.pop('_id', None)
    doc['created_at'] = doc['created_at'].isoformat()
    await _audit(mgr_id, user['manager_id'], 'manager', 'create', 'resident', res_id, {'name': data.name, 'unit': data.unit})
    return doc

@api.put('/residents/{resident_id}')
async def update_resident(resident_id: str, data: ResidentUpdate, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if user_type != 'manager':
        raise HTTPException(403, 'Manager access required.')
    patch = {k: v for k, v in data.model_dump().items() if v is not None}
    if not patch:
        raise HTTPException(400, 'Nothing to update.')
    result = await db.residents.update_one({'resident_id': resident_id, 'manager_id': mgr_id}, {'$set': patch})
    if result.matched_count == 0:
        raise HTTPException(404, 'Resident not found.')
    updated = await db.residents.find_one({'resident_id': resident_id}, {'_id': 0})
    if isinstance(updated.get('created_at'), datetime): updated['created_at'] = updated['created_at'].isoformat()
    await _audit(mgr_id, user['manager_id'], 'manager', 'update', 'resident', resident_id, patch)
    return updated

@api.delete('/residents/{resident_id}')
async def delete_resident(resident_id: str, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if user_type != 'manager':
        raise HTTPException(403, 'Manager access required.')
    result = await db.residents.delete_one({'resident_id': resident_id, 'manager_id': mgr_id})
    if result.deleted_count == 0:
        raise HTTPException(404, 'Resident not found.')
    await _audit(mgr_id, user['manager_id'], 'manager', 'delete', 'resident', resident_id, {})
    return {'message': 'Resident removed.'}
