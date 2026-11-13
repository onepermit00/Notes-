"""The desk's working lists: what is physically at the front desk right now.

Packages on hand, visitors in the lobby, vendors on site, loaner items that are out,
lockout records and open follow-ups belong to the property, not to one browser tab.
They are kept here so they survive a refresh, follow the concierge to another device
and are still there for the next shift.
"""
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Cookie, HTTPException, Request
from pydantic import BaseModel
from typing import Any, Optional
from core import _resolve_user, db

api = APIRouter(prefix='/api')

SECTIONS = ('packages', 'guests', 'vendors', 'loaners', 'lockouts', 'tours', 'followups', 'building')
MAX_BYTES = 400_000


class DeskState(BaseModel):
    data: Any = None


@api.get('/desk-state')
async def get_desk_state(request: Request, session_token: Optional[str] = Cookie(default=None)):
    _user, _user_type, mgr_id = await _resolve_user(request, session_token)
    docs = await db.desk_state.find({'manager_id': mgr_id}, {'_id': 0}).to_list(len(SECTIONS))
    return {'sections': {d['section']: d.get('data') for d in docs}}


@api.put('/desk-state/{section}')
async def save_desk_state(section: str, body: DeskState, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if section not in SECTIONS:
        raise HTTPException(404, 'Unknown desk section.')
    if len(json.dumps(body.data, default=str)) > MAX_BYTES:
        raise HTTPException(413, 'That list is too large to save.')
    await db.desk_state.update_one(
        {'manager_id': mgr_id, 'section': section},
        {'$set': {
            'data': body.data,
            'updated_at': datetime.now(timezone.utc),
            'updated_by': f"{user['first_name']} {user['last_name']}".strip(),
        }},
        upsert=True,
    )
    return {'section': section, 'saved': True}
