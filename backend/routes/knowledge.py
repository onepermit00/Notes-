"""Property SOPs and training materials.

The manager writes the steps, uploads a document or photo, or records a video in
the app; everyone on the desk sees it on their own device. Written steps live on
the record. Files live in `knowledge_files`, split into chunks so that a video
can be larger than one MongoDB record (16 MB). Older items kept their file
inline as `data_url`; those still work.
"""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Cookie, File, HTTPException, Request, UploadFile
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Optional
from urllib.parse import quote
from core import _audit, _resolve_user, db

api = APIRouter(prefix='/api')

KINDS = ('sop', 'training')
MAX_FILE_CHARS = 11_000_000      # inline data URLs (older clients): about 8 MB of file
MAX_UPLOAD_BYTES = 100 * 1024 * 1024   # a stored file: about 10 minutes of recorded video
CHUNK_BYTES = 4 * 1024 * 1024
MAX_ITEMS = 80
MAX_BODY_CHARS = 20_000


class KnowledgeItem(BaseModel):
    kind:      str
    title:     str = Field(min_length=1, max_length=160)
    category:  str = Field(default='Other', max_length=80)
    body:      str = Field(default='', max_length=MAX_BODY_CHARS)
    file_name: str = Field(default='', max_length=200)
    file_type: str = Field(default='pdf', max_length=20)
    data_url:  str = ''
    status:    Optional[str] = Field(default=None, max_length=20)
    # The client uploads the file right after saving, so the item may have no content yet.
    file_to_follow: bool = False
    remove_file:    bool = False


def _file_type(mime: str, name: str) -> str:
    mime, name = (mime or '').lower(), (name or '').lower()
    if mime.startswith('image/'):
        return 'image'
    if mime.startswith('video/'):
        return 'video'
    if mime == 'application/pdf' or name.endswith('.pdf'):
        return 'pdf'
    return 'doc'


def _public(doc: dict, viewer_id: str = '') -> dict:
    done = doc.get('completed_by') or {}
    has_file = bool(doc.get('file_id'))
    return {
        'id':           doc['item_id'],
        'kind':         doc['kind'],
        'title':        doc['title'],
        'category':     doc.get('category', 'Other'),
        'body':         doc.get('body', ''),
        'fileName':     doc.get('file_name', ''),
        'fileType':     doc.get('file_type', 'pdf') if (has_file or doc.get('data_url')) else '',
        'dataURL':      doc.get('data_url', ''),
        'hasFile':      has_file,
        'fileId':       doc.get('file_id', ''),
        'fileSize':     doc.get('file_size', 0),
        'mime':         doc.get('mime', ''),
        'status':       doc.get('status') or 'published',
        'completedBy':  list(done.values()),
        'completed':    viewer_id in done,
        'updatedAt':    doc['updated_at'].isoformat() if isinstance(doc.get('updated_at'), datetime) else doc.get('updated_at'),
    }


def _manager_only(user_type: str):
    if user_type != 'manager':
        raise HTTPException(403, 'Only the property manager can change SOPs and training.')


async def _drop_file(file_id: str):
    if file_id:
        await db.knowledge_files.delete_many({'file_id': file_id})


@api.get('/knowledge')
async def list_knowledge(request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    viewer = user['manager_id'] if user_type == 'manager' else user['concierge_id']
    docs = await db.knowledge.find({'manager_id': mgr_id}, {'_id': 0}).sort('created_at', 1).to_list(MAX_ITEMS)
    return {'items': [_public(d, viewer) for d in docs]}


@api.put('/knowledge/{item_id}')
async def save_knowledge(item_id: str, data: KnowledgeItem, request: Request, session_token: Optional[str] = Cookie(default=None)):
    """Create or update one SOP or training item. Only the manager can.

    Leaving data_url empty keeps the file the item already has, unless remove_file is set.
    """
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    _manager_only(user_type)
    if data.kind not in KINDS:
        raise HTTPException(422, 'kind must be sop or training.')
    if not item_id or len(item_id) > 80 or not all(ch.isalnum() or ch in '-_' for ch in item_id):
        raise HTTPException(422, 'Invalid id.')
    if data.data_url and not data.data_url.startswith('data:'):
        raise HTTPException(400, 'That file could not be read.')
    if len(data.data_url) > MAX_FILE_CHARS:
        raise HTTPException(413, 'That file is too large. Files up to 8 MB can be saved this way.')
    existing = await db.knowledge.find_one({'manager_id': mgr_id, 'item_id': item_id})
    if not existing and await db.knowledge.count_documents({'manager_id': mgr_id}) >= MAX_ITEMS:
        raise HTTPException(400, 'The library is full. Remove an item before adding another.')

    keeps_file = bool(existing) and not data.remove_file and not data.data_url and bool(existing.get('file_id') or existing.get('data_url'))
    body = data.body.strip()
    if not (body or data.data_url or keeps_file or data.file_to_follow):
        raise HTTPException(400, 'Write the steps, attach a file, or record a video to save this item.')

    now = datetime.now(timezone.utc)
    doc = {
        'title': data.title.strip(), 'category': data.category.strip() or 'Other', 'kind': data.kind, 'body': body,
        'status': data.status or (existing or {}).get('status') or 'published', 'updated_at': now,
    }
    unset = {}
    if data.data_url:
        doc.update({'file_name': data.file_name, 'file_type': data.file_type, 'data_url': data.data_url})
        unset = {'file_id': '', 'file_size': '', 'mime': ''}
    elif not keeps_file:
        doc.update({'file_name': '', 'file_type': '', 'data_url': ''})
        unset = {'file_id': '', 'file_size': '', 'mime': ''}
    change = {'$set': doc, '$setOnInsert': {'item_id': item_id, 'manager_id': mgr_id, 'created_at': now, 'completed_by': {}}}
    if unset:
        change['$unset'] = unset
    await db.knowledge.update_one({'manager_id': mgr_id, 'item_id': item_id}, change, upsert=True)
    if existing and unset:
        await _drop_file(existing.get('file_id', ''))
    await _audit(mgr_id, user['manager_id'], 'manager', 'update' if existing else 'create', data.kind, item_id, {'title': doc['title']})
    saved = await db.knowledge.find_one({'manager_id': mgr_id, 'item_id': item_id}, {'_id': 0})
    return _public(saved, user['manager_id'])


@api.post('/knowledge/{item_id}/file')
async def upload_knowledge_file(item_id: str, request: Request, file: UploadFile = File(...),
                                session_token: Optional[str] = Cookie(default=None)):
    """Attach a document, photo or video to an item, replacing the one it had."""
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    _manager_only(user_type)
    existing = await db.knowledge.find_one({'manager_id': mgr_id, 'item_id': item_id})
    if not existing:
        raise HTTPException(404, 'Item not found.')
    file_id = f'kf_{uuid.uuid4().hex}'
    size, n = 0, 0
    try:
        while True:
            chunk = await file.read(CHUNK_BYTES)
            if not chunk:
                break
            size += len(chunk)
            if size > MAX_UPLOAD_BYTES:
                raise HTTPException(413, 'That file is too large. Files up to 100 MB can be saved; for a longer video, record a shorter clip.')
            await db.knowledge_files.insert_one({'file_id': file_id, 'manager_id': mgr_id, 'n': n, 'data': chunk})
            n += 1
    except HTTPException:
        await _drop_file(file_id)
        raise
    if size == 0:
        raise HTTPException(400, 'That file is empty.')
    mime = (file.content_type or 'application/octet-stream')[:100]
    name = (file.filename or 'file')[:200]
    await db.knowledge.update_one({'manager_id': mgr_id, 'item_id': item_id}, {'$set': {
        'file_id': file_id, 'file_size': size, 'mime': mime, 'file_name': name,
        'file_type': _file_type(mime, name), 'data_url': '', 'updated_at': datetime.now(timezone.utc),
    }})
    await _drop_file(existing.get('file_id', ''))
    await _audit(mgr_id, user['manager_id'], 'manager', 'update', existing['kind'], item_id, {'file': name, 'bytes': size})
    saved = await db.knowledge.find_one({'manager_id': mgr_id, 'item_id': item_id}, {'_id': 0})
    return _public(saved, user['manager_id'])


@api.get('/knowledge/{item_id}/file')
async def get_knowledge_file(item_id: str, request: Request, session_token: Optional[str] = Cookie(default=None)):
    _user, _user_type, mgr_id = await _resolve_user(request, session_token)
    item = await db.knowledge.find_one({'manager_id': mgr_id, 'item_id': item_id}, {'_id': 0, 'file_id': 1, 'mime': 1, 'file_name': 1, 'file_size': 1})
    if not item or not item.get('file_id'):
        raise HTTPException(404, 'File not found.')
    file_id = item['file_id']

    async def chunks():
        cursor = db.knowledge_files.find({'file_id': file_id}, {'_id': 0, 'data': 1}).sort('n', 1)
        async for part in cursor:
            yield bytes(part['data'])

    return StreamingResponse(chunks(), media_type=item.get('mime') or 'application/octet-stream', headers={
        'Content-Length': str(item.get('file_size') or 0),
        'Content-Disposition': f"inline; filename*=UTF-8''{quote(item.get('file_name') or 'file')}",
        'Cache-Control': 'private, max-age=3600',
    })


class KnowledgeStatus(BaseModel):
    status: str = Field(max_length=20)


@api.put('/knowledge/{item_id}/status')
async def set_knowledge_status(item_id: str, data: KnowledgeStatus, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    _manager_only(user_type)
    result = await db.knowledge.update_one({'manager_id': mgr_id, 'item_id': item_id},
                                           {'$set': {'status': data.status, 'updated_at': datetime.now(timezone.utc)}})
    if result.matched_count == 0:
        raise HTTPException(404, 'Item not found.')
    return {'id': item_id, 'status': data.status}


@api.delete('/knowledge/{item_id}')
async def delete_knowledge(item_id: str, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    _manager_only(user_type)
    existing = await db.knowledge.find_one({'manager_id': mgr_id, 'item_id': item_id})
    if not existing:
        raise HTTPException(404, 'Item not found.')
    await db.knowledge.delete_one({'manager_id': mgr_id, 'item_id': item_id})
    await _drop_file(existing.get('file_id', ''))
    await _audit(mgr_id, user['manager_id'], 'manager', 'delete', 'knowledge', item_id, {'title': existing.get('title', '')})
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
