"""Incident reports."""
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Cookie, HTTPException, Request
from typing import Optional
from core import IncidentCreate, IncidentUpdate, _audit, _resolve_user, db
from notifications import _notify_incident_filed

api = APIRouter(prefix='/api')

@api.get('/incidents')
async def get_incidents(request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    docs = await db.incidents.find({'manager_id': mgr_id}, {'_id': 0}).sort('created_at', -1).to_list(200)
    return {'incidents': docs}


@api.post('/incidents')
async def create_incident(incident: IncidentCreate, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    shift_id = None
    if user_type == 'concierge':
        active = await db.shifts.find_one({'concierge_id': user['concierge_id'], 'status': 'active'}, {'shift_id': 1})
        if active:
            shift_id = active['shift_id']
    inc_id = f'inc_{uuid.uuid4().hex[:12]}'
    doc = {
        'incident_id':     inc_id,
        'manager_id':      mgr_id,
        'shift_id':        shift_id,
        'type':            incident.type,
        'location':        incident.location,
        'description':     incident.description,
        'severity':        incident.severity,
        'notes':           incident.notes,
        'unit_number':     incident.unit_number or '',
        'person_involved': incident.person_involved or '',
        'evidence_urls':   incident.evidence_urls or [],
        'status':          'new',
        'created_by':      f"{user['first_name']} {user['last_name']}",
        'created_by_type': user_type,
        'created_at':      datetime.now(timezone.utc),
    }
    await db.incidents.insert_one(doc)
    doc.pop('_id', None)
    doc['created_at'] = doc['created_at'].isoformat()
    await _audit(mgr_id, user.get('manager_id') or user.get('concierge_id', ''), user_type,
                 'create', 'incident', doc['incident_id'], {'type': incident.type, 'severity': incident.severity})
    # Notify manager by email when concierge files an incident
    if user_type == 'concierge':
        manager = await db.managers.find_one({'manager_id': mgr_id})
        if manager:
            await _notify_incident_filed(doc, manager, doc['created_by'])
    return doc


@api.put('/incidents/{incident_id}')
async def update_incident(incident_id: str, update: IncidentUpdate, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if user_type != 'manager':
        raise HTTPException(403, 'Manager access required.')
    patch = {}
    if update.status:
        patch['status'] = update.status
    if update.status == 'resolved':
        patch['resolved_at'] = datetime.now(timezone.utc).isoformat()
        patch['resolved_by'] = f"{user['first_name']} {user['last_name']}"
    if update.resolved_note:
        patch['resolved_note'] = update.resolved_note
    if not patch:
        raise HTTPException(400, 'No fields to update.')
    result = await db.incidents.update_one({'incident_id': incident_id, 'manager_id': mgr_id}, {'$set': patch})
    if result.matched_count == 0:
        raise HTTPException(404, 'Incident not found.')
    updated = await db.incidents.find_one({'incident_id': incident_id}, {'_id': 0})
    if isinstance(updated.get('created_at'), datetime):
        updated['created_at'] = updated['created_at'].isoformat()
    return updated
