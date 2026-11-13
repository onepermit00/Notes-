"""Property SOPs and training materials.

The manager uploads a document, photo or short video; everyone on the desk sees it
on their own device. Files are kept with the record, so there is a size limit.
"""
from datetime import datetime, timezone
from fastapi import APIRouter, Cookie, HTTPException, Request
from pydantic import BaseModel, Field
from typing import Optional
from core import _audit, _resolve_user, db

api = APIRouter(prefix='/api')

KINDS = ('sop', 'training')
MAX_FILE_CHARS = 11_000_000   # about 8 MB of file once encoded; MongoDB caps a record at 16 MB
MAX_ITEMS = 80


class KnowledgeItem(BaseModel):
    kind:      str
    title:     str = Field(min_length=1, max_length=160)
    category:  str = Field(default='Other', max_length=80)
    file_name: str = Field(default='', max_length=200)
    file_type: str = Field(default='pdf', max_length=20)
    data_url:  str = ''
    status:    Optional[str] = Field(default=None, max_length=20)


def _public(doc: dict, viewer_id: str = '') -> dict:
    done = doc.get('completed_by') or {}
    return {
        'id':           doc['item_id'],
        'kind':         doc['kind'],
        'title':        doc['title'],
        'category':     doc.get('category', 'Other'),
        'fileName':     doc.get('file_name', ''),
        'fileType':     doc.get('file_type', 'pdf'),
        'dataURL':      doc.get('data_url', ''),
        'status':       doc.get('status') or 'published',
        'completedBy':  list(done.values()),
        'completed':    viewer_id in done,
        'updatedAt':    doc['updated_at'].isoformat() if isinstance(doc.get('updated_at'), datetime) else doc.get('updated_at'),
    }


@api.get('/knowledge')
async def list_knowledge(request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    viewer = user['manager_id'] if user_type == 'manager' else user['concierge_id']
    docs = await db.knowledge.find({'manager_id': mgr_id}, {'_id': 0}).sort('created_at', 1).to_list(MAX_ITEMS)
    return {'items': [_public(d, viewer) for d in docs]}


@api.put('/knowledge/{item_id}')
async def save_knowledge(item_id: str, data: KnowledgeItem, request: Request, session_token: Optional[str] = Cookie(default=None)):
    """Create or replace one SOP or training item. Only the manager can."""
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if user_type != 'manager':
        raise HTTPException(403, 'Only the property manager can change SOPs and training.')
    if data.kind not in KINDS:
        raise HTTPException(422, 'kind must be sop or training.')
    if not item_id or len(item_id) > 80 or not all(ch.isalnum() or ch in '-_' for ch in item_id):
        raise HTTPException(422, 'Invalid id.')
    if not data.data_url.startswith('data:'):
        raise HTTPException(400, 'Attach a file to save this item.')
    if len(data.data_url) > MAX_FILE_CHARS:
        raise HTTPException(413, 'That file is too large. Files up to 8 MB can be saved; for a longer video, upload a shorter clip.')
    existing = await db.knowledge.find_one({'manager_id': mgr_id, 'item_id': item_id})
    if not existing and await db.knowledge.count_documents({'manager_id': mgr_id}) >= MAX_ITEMS:
        raise HTTPException(400, 'The library is full. Remove an item before adding another.')
    now = datetime.now(timezone.utc)
    doc = {
        'title': data.title.strip(), 'category': data.category.strip() or 'Other', 'kind': data.kind,
        'file_name': data.file_name, 'file_type': data.file_type, 'data_url': data.data_url,
        'status': data.status or (existing or {}).get('status') or 'published', 'updated_at': now,
    }
    await db.knowledge.update_one(
        {'manager_id': mgr_id, 'item_id': item_id},
        {'$set': doc, '$setOnInsert': {'item_id': item_id, 'manager_id': mgr_id, 'created_at': now, 'completed_by': {}}},
        upsert=True,
    )
    await _audit(mgr_id, user['manager_id'], 'manager', 'update' if existing else 'create', data.kind, item_id, {'title': doc['title']})
    saved = await db.knowledge.find_one({'manager_id': mgr_id, 'item_id': item_id}, {'_id': 0})
    return _public(saved, user['manager_id'])


class KnowledgeStatus(BaseModel):
    status: str = Field(max_length=20)


@api.put('/knowledge/{item_id}/status')
async def set_knowledge_status(item_id: str, data: KnowledgeStatus, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if user_type != 'manager':
        raise HTTPException(403, 'Only the property manager can change SOPs and training.')
    result = await db.knowledge.update_one({'manager_id': mgr_id, 'item_id': item_id},
                                           {'$set': {'status': data.status, 'updated_at': datetime.now(timezone.utc)}})
    if result.matched_count == 0:
        raise HTTPException(404, 'Item not found.')
    return {'id': item_id, 'status': data.status}


@api.delete('/knowledge/{item_id}')
async def delete_knowledge(item_id: str, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if user_type != 'manager':
        raise HTTPException(403, 'Only the property manager can change SOPs and training.')
    result = await db.knowledge.delete_one({'manager_id': mgr_id, 'item_id': item_id})
    if result.deleted_count == 0:
        raise HTTPException(404, 'Item not found.')
    await _audit(mgr_id, user['manager_id'], 'manager', 'delete', 'knowledge', item_id, {})
    return {'deleted': True}


class KnowledgeCompletion(BaseModel):
    completed: bool = True


@api.put('/knowledge/{item_id}/completed')
async def mark_knowledge_completed(item_id: str, data: KnowledgeCompletion, request: Request, session_token: Optional[str] = Cookie(default=None)):
    """A concierge marks a training item as reviewed, so the manager can see who has read what."""
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if user_type != 'concierge':
        raise HTTPException(403, 'Training is marked as reviewed by the concierge who read it.')
    key = f"completed_by.{user['concierge_id']}"
    change = ({'$set': {key: f"{user['first_name']} {user['last_name']}".strip()}} if data.completed else {'$unset': {key: ''}})
    result = await db.knowledge.update_one({'manager_id': mgr_id, 'item_id': item_id}, change)
    if result.matched_count == 0:
        raise HTTPException(404, 'Item not found.')
    return {'id': item_id, 'completed': data.completed}
