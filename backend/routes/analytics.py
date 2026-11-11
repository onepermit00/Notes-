"""Analytics and the audit trail."""
from datetime import datetime
from fastapi import APIRouter, Cookie, HTTPException, Request
from typing import Optional
from core import _resolve_user, db

api = APIRouter(prefix='/api')

@api.get('/analytics')
async def get_analytics(
    request: Request,
    from_date: Optional[str] = None,
    to_date:   Optional[str] = None,
    session_token: Optional[str] = Cookie(default=None),
):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if user_type != 'manager':
        raise HTTPException(403, 'Manager access required.')

    # Build date filter
    date_filter: dict = {}
    if from_date:
        try:    date_filter['$gte'] = datetime.fromisoformat(from_date.replace('Z', '+00:00'))
        except: pass
    if to_date:
        try:    date_filter['$lte'] = datetime.fromisoformat(to_date.replace('Z', '+00:00'))
        except: pass

    task_match = {'manager_id': mgr_id}
    inc_match  = {'manager_id': mgr_id}
    shft_match = {'manager_id': mgr_id}
    if date_filter:
        task_match['created_at'] = date_filter
        inc_match['created_at']  = date_filter
        shft_match['clock_in']   = date_filter

    # Activity by category
    cat_counts = await db.tasks.aggregate([
        {'$match': task_match},
        {'$group': {'_id': '$category', 'count': {'$sum': 1}}},
        {'$sort': {'count': -1}},
    ]).to_list(20)

    # Task status breakdown
    status_counts = await db.tasks.aggregate([
        {'$match': task_match},
        {'$group': {'_id': '$status', 'count': {'$sum': 1}}},
    ]).to_list(10)

    # Incident severity breakdown
    inc_counts = await db.incidents.aggregate([
        {'$match': inc_match},
        {'$group': {'_id': '$severity', 'count': {'$sum': 1}}},
        {'$sort': {'count': -1}},
    ]).to_list(10)

    # Incident type breakdown
    inc_types = await db.incidents.aggregate([
        {'$match': inc_match},
        {'$group': {'_id': '$type', 'count': {'$sum': 1}}},
        {'$sort': {'count': -1}},
        {'$limit': 10},
    ]).to_list(10)

    # Concierge activity totals
    con_match = {**task_match, 'created_by_type': 'concierge'}
    con_counts = await db.tasks.aggregate([
        {'$match': con_match},
        {'$group': {'_id': '$created_by_name', 'count': {'$sum': 1}}},
        {'$sort': {'count': -1}},
    ]).to_list(20)

    # Hourly activity distribution
    hourly = await db.tasks.aggregate([
        {'$match': task_match},
        {'$group': {'_id': {'$hour': '$created_at'}, 'count': {'$sum': 1}}},
        {'$sort': {'_id': 1}},
    ]).to_list(24)

    # Total counts
    total_tasks     = await db.tasks.count_documents(task_match)
    completed_tasks = await db.tasks.count_documents({**task_match, 'status': 'completed'})
    total_incidents = await db.incidents.count_documents(inc_match)
    open_incidents  = await db.incidents.count_documents({**inc_match, 'status': 'new'})
    total_shifts    = await db.shifts.count_documents(shft_match)

    return {
        'totals': {
            'tasks':           total_tasks,
            'completed_tasks': completed_tasks,
            'completion_rate': round(completed_tasks / total_tasks * 100, 1) if total_tasks else 0,
            'incidents':       total_incidents,
            'open_incidents':  open_incidents,
            'shifts':          total_shifts,
        },
        'by_category':           [{'category': r['_id'] or 'Other',   'count': r['count']} for r in cat_counts],
        'by_status':             [{'status':   r['_id'] or 'unknown',  'count': r['count']} for r in status_counts],
        'incidents_by_severity': [{'severity': r['_id'] or 'medium',  'count': r['count']} for r in inc_counts],
        'incidents_by_type':     [{'type':     r['_id'] or 'Other',   'count': r['count']} for r in inc_types],
        'by_concierge':          [{'name':     r['_id'] or 'Unknown', 'count': r['count']} for r in con_counts],
        'hourly_activity':       [{'hour': r['_id'], 'count': r['count']} for r in hourly],
    }

@api.get('/audit')
async def get_audit_log(
    request: Request,
    limit:   int = 200,
    session_token: Optional[str] = Cookie(default=None),
):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if user_type != 'manager':
        raise HTTPException(403, 'Manager access required.')
    docs = await db.audit_logs.find({'manager_id': mgr_id}, {'_id': 0}).sort('created_at', -1).to_list(limit)
    for d in docs:
        if isinstance(d.get('created_at'), datetime):
            d['created_at'] = d['created_at'].isoformat()
    return {'logs': docs}
