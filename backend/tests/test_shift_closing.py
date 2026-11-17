"""Shifts nobody ended: closed automatically after the limit, or by the manager."""
from datetime import datetime, timedelta, timezone

from core import db
from tests.test_desk_flows import _concierge, _signup


async def _age_shift(shift_id, hours, activity_hours_ago=None):
    started = datetime.now(timezone.utc) - timedelta(hours=hours)
    await db.shifts.update_one({'shift_id': shift_id}, {'$set': {'clock_in': started}})
    if activity_hours_ago is not None:
        await db.tasks.update_many({'shift_id': shift_id}, {'$set': {'created_at': datetime.now(timezone.utc) - timedelta(hours=activity_hours_ago)}})
    return started


async def test_a_forgotten_shift_closes_itself_and_becomes_the_previous_shift(client):
    manager = await _signup(client)
    sam, _ = await _concierge(client, manager, 'sam@example.com')
    shift = (await client.post('/api/shifts/start', headers=sam)).json()
    await client.post('/api/tasks', headers=sam, json={'title': 'Package delivery · UPS → Unit 4', 'source_section': 'packages'})
    # Saturday's shift, never ended; the last entry was logged 3 hours after it began.
    await _age_shift(shift['shift_id'], 75, activity_hours_ago=72)

    live = (await client.get('/api/shifts/active', headers=manager)).json()['shifts']
    assert live == []
    previous = (await client.get('/api/shifts/previous', headers=sam)).json()['shift']
    assert previous['shift_id'] == shift['shift_id']
    assert previous['closed_reason'] == 'auto'
    # It ends at the last thing logged, not now.
    ended = datetime.fromisoformat(previous['clock_out'])
    assert abs((datetime.now(timezone.utc) - ended) - timedelta(hours=72)) < timedelta(minutes=5)
    assert [a['title'] for a in previous['activities']] == ['Package delivery · UPS → Unit 4']

    # Starting again gives a fresh shift and an empty report.
    fresh = (await client.post('/api/shifts/start', headers=sam)).json()
    assert fresh['shift_id'] != shift['shift_id']
    assert (await client.get('/api/shifts/active', headers=sam)).json()['shift']['activities'] == []


async def test_a_long_but_normal_shift_stays_open(client):
    manager = await _signup(client)
    sam, _ = await _concierge(client, manager, 'sam@example.com')
    shift = (await client.post('/api/shifts/start', headers=sam)).json()
    await _age_shift(shift['shift_id'], 11)
    live = (await client.get('/api/shifts/active', headers=manager)).json()['shifts']
    assert [s['shift_id'] for s in live] == [shift['shift_id']]


async def test_the_manager_can_end_a_shift_left_open(client):
    manager = await _signup(client)
    sam, _ = await _concierge(client, manager, 'sam@example.com')
    shift = (await client.post('/api/shifts/start', headers=sam)).json()

    refused = await client.post(f"/api/shifts/{shift['shift_id']}/end", headers=sam)
    assert refused.status_code == 403
    ended = await client.post(f"/api/shifts/{shift['shift_id']}/end", headers=manager)
    assert ended.status_code == 200
    assert (await client.post(f"/api/shifts/{shift['shift_id']}/end", headers=manager)).status_code == 409

    assert (await client.get('/api/shifts/active', headers=sam)).json()['shift'] is None
    previous = (await client.get('/api/shifts/previous', headers=manager)).json()['shift']
    assert previous['closed_reason'] == 'manager'
