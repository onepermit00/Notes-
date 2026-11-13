"""Team messages and the server-sent events stream."""
import asyncio
import json as _json
import uuid
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Cookie, HTTPException, Request
from fastapi.responses import StreamingResponse
from typing import Optional
from core import MessageCreate, _resolve_user, db, get_session

api = APIRouter(prefix='/api')

@api.get('/messages')
async def get_messages(request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    docs = await db.messages.find({'manager_id': mgr_id}, {'_id': 0}).sort('created_at', 1).to_list(200)
    return {'messages': docs}


@api.post('/messages')
async def send_message(msg: MessageCreate, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if not msg.content.strip():
        raise HTTPException(400, 'Write a message first.')
    if len(msg.content) > 4000:
        raise HTTPException(400, 'That message is too long.')
    msg_id = f'msg_{uuid.uuid4().hex[:12]}'
    doc = {
        'message_id':   msg_id,
        'manager_id':   mgr_id,
        'content':      msg.content.strip(),
        'message_type': msg.message_type,
        'sender_name':  f"{user['first_name']} {user['last_name']}".strip(),
        'sender_id':    user['manager_id'] if user_type == 'manager' else user['concierge_id'],
        'sender_type':  user_type,
        'created_at':   datetime.now(timezone.utc),
    }
    await db.messages.insert_one(doc)
    doc.pop('_id', None)
    doc['created_at'] = doc['created_at'].isoformat()
    return doc


def _serialize(doc: dict) -> dict:
    """Convert all datetime values in a doc to ISO strings."""
    return {k: (v.isoformat() if isinstance(v, datetime) else v) for k, v in doc.items()}

@api.get('/events')
async def sse_events(request: Request, session_token: Optional[str] = Cookie(default=None), token: Optional[str] = None):
    # EventSource can't set headers, so accept token as query param too
    session = await get_session(request, token or session_token)
    if not session:
        raise HTTPException(401, 'Not authenticated.')
    if session['user_type'] == 'manager':
        user = await db.managers.find_one({'manager_id': session['user_id']})
    else:
        user = await db.concierges.find_one({'concierge_id': session['user_id']})
    if not user:
        raise HTTPException(401, 'Not authenticated.')
    mgr_id = user['manager_id']

    async def generator():
        # Send initial heartbeat so client knows the connection is live
        yield 'event: connected\ndata: {}\n\n'
        last_check = datetime.now(timezone.utc) - timedelta(seconds=2)
        while True:
            if await request.is_disconnected():
                break
            now_check = datetime.now(timezone.utc)
            task_query = {'manager_id': mgr_id, 'created_at': {'$gte': last_check}}
            if session['user_type'] == 'concierge':
                # The desk only hears about work that is theirs: requests sent to them
                # or to nobody in particular. Other people's entries stay out of their list.
                task_query['created_by_type'] = 'manager'
                task_query['assigned_to_id'] = {'$in': [user['concierge_id'], None, '']}
                task_query['source_section'] = {'$ne': 'scheduled'}
            tasks = await db.tasks.find(task_query, {'_id': 0}).to_list(50)
            incidents = await db.incidents.find(
                {'manager_id': mgr_id, 'created_at': {'$gte': last_check}},
                {'_id': 0}
            ).to_list(20)
            last_check = now_check
            if tasks or incidents:
                payload = _json.dumps({
                    'tasks':     [_serialize(t) for t in tasks],
                    'incidents': [_serialize(i) for i in incidents],
                })
                yield f'event: update\ndata: {payload}\n\n'
            else:
                yield ':\n\n'   # SSE comment = keepalive ping
            await asyncio.sleep(6)

    return StreamingResponse(
        generator(),
        media_type='text/event-stream',
        headers={'Cache-Control': 'no-cache', 'X-Accel-Buffering': 'no', 'Connection': 'keep-alive'},
    )
