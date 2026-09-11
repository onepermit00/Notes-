import os
import sys
from pathlib import Path

# Point the app at an isolated test database *before* server.py is imported —
# server.py reads env vars at module load time. Must not touch the dev DB.
os.environ['DB_NAME'] = 'adltrack_test'
# 127.0.0.1, not 'localhost' — hostname resolution hangs for short-lived
# subprocesses in some sandboxed shells even though the daemon is reachable.
os.environ['MONGO_URL'] = 'mongodb://127.0.0.1:27017'
os.environ.setdefault('FRONTEND_URL', 'http://localhost:3000')
os.environ.pop('RESEND_API_KEY', None)  # exercise the "email delivery skipped" path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import httpx
import pytest
import pytest_asyncio

import server as server_module  # noqa: E402


@pytest_asyncio.fixture(scope='session', autouse=True)
async def _prepare_db():
    await server_module._ensure_indexes()
    yield
    await server_module.client.drop_database(server_module.db.name)


@pytest_asyncio.fixture()
async def client():
    transport = httpx.ASGITransport(app=server_module.app)
    async with httpx.AsyncClient(transport=transport, base_url='http://test') as ac:
        yield ac


@pytest_asyncio.fixture(autouse=True)
async def _clean_collections():
    yield
    for name in ('managers', 'concierges', 'sessions', 'password_resets', 'invitations', 'rate_limit_events'):
        await server_module.db[name].delete_many({})


@pytest.fixture()
def server():
    return server_module
