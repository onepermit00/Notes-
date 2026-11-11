"""Package notifications and image upload."""
from core import esc
import base64
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Cookie, File, Form, HTTPException, Request, UploadFile
from pydantic import BaseModel
from typing import Optional
from core import _audit, _resolve_user, db, get_session, send_email

api = APIRouter(prefix='/api')

class PackageNotifyRequest(BaseModel):
    unit:           str
    carrier:        Optional[str] = ''
    count:          Optional[int] = 1
    resident_name:  Optional[str] = ''
    photo_url:      Optional[str] = None


@api.post('/notify/package')
async def notify_package(data: PackageNotifyRequest, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    # Look up resident email by unit
    resident = await db.residents.find_one({'manager_id': mgr_id, 'unit': data.unit.strip()})
    to_email   = (resident or {}).get('email', '')
    res_name   = data.resident_name or (resident or {}).get('name', f'Unit {data.unit} Resident')
    photo_url  = data.photo_url if (data.photo_url or '').startswith(('https://', 'http://')) else ''
    photo_html = f'<img src="{esc(photo_url)}" style="max-width:100%;border-radius:8px;margin-top:16px" />' if photo_url else ''
    if to_email:
        html = f"""
        <div style="font-family:sans-serif;max-width:480px">
          <h2 style="color:#111">📦 Package Ready for Pickup</h2>
          <p>Hi {esc(res_name)},</p>
          <p>You have <strong>{data.count} package{'s' if data.count != 1 else ''}</strong>
             {f'from <strong>{esc(data.carrier)}</strong> ' if data.carrier else ''}
             waiting for you at the front desk.</p>
          {photo_html}
          <p style="color:#666;font-size:12px">Please bring your key fob or ID when picking up.</p>
        </div>"""
        await send_email(to_email, f'📦 Package Ready – Unit {data.unit}', html)
    # Also notify manager
    manager = await db.managers.find_one({'manager_id': mgr_id})
    if manager and manager.get('email'):
        mgr_html = f"""
        <div style="font-family:sans-serif;max-width:480px">
          <h2 style="color:#111">📦 Package Logged</h2>
          <p>A package was logged for Unit {esc(data.unit)} ({esc(res_name)}).
          Carrier: {esc(data.carrier or 'N/A')} · Count: {data.count}.</p>
          {photo_html}
        </div>"""
        await send_email(manager['email'], f'📦 Package Logged – Unit {data.unit}', mgr_html)
    await _audit(mgr_id, user.get('concierge_id') or user.get('manager_id', ''), user_type,
                 'create', 'package', '', {'unit': data.unit, 'carrier': data.carrier})
    return {'sent': bool(to_email), 'resident_email': to_email, 'resident_name': res_name}


@api.post('/upload/image')
async def upload_image(
    request: Request,
    file:    UploadFile = File(...),
    context: str        = Form(default='general'),
    session_token: Optional[str] = Cookie(default=None),
):
    session = await get_session(request, session_token)
    if not session:
        raise HTTPException(401, 'Not authenticated.')

    content      = await file.read()
    content_type = file.content_type or 'image/jpeg'
    data_url     = f"data:{content_type};base64,{base64.b64encode(content).decode()}"
    image_id     = f'img_{uuid.uuid4().hex[:12]}'

    await db.images.insert_one({
        'image_id':    image_id,
        'filename':    file.filename,
        'data_url':    data_url,
        'context':     context,
        'uploaded_by': session['user_id'],
        'user_type':   session['user_type'],
        'uploaded_at': datetime.now(timezone.utc).isoformat(),
    })

    return {'image_id': image_id, 'url': data_url}
