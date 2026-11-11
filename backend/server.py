"""Noted API entrypoint: builds the FastAPI app and mounts every router.

Run with `uvicorn server:app`. Endpoints live in routes/, shared helpers in core.py.
"""
import os
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from starlette.middleware.cors import CORSMiddleware

from core import _ensure_indexes, client, logger
from core import FORGOT_PW_RATE_LIMIT, _hash_token, db, verify_pw  # noqa: F401  re-exported for tests and scripts
from routes import analytics, assistant, auth, contacts, incidents, messages, packages, residents, shifts, tasks, team


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        await client.admin.command('ping')
        logger.info('MongoDB connected.')
    except Exception as e:
        logger.error(f'MongoDB connection failed: {e}')
    await _ensure_indexes()
    yield
    client.close()


app = FastAPI(lifespan=lifespan)
api = APIRouter(prefix='/api')


@api.get('/')
async def root():
    return {'message': 'Noted API', 'version': '2.0.0'}

@api.get('/health')
async def health():
    return {'status': 'healthy'}


for module in (auth, team, shifts, tasks, incidents, messages, residents, analytics, packages, assistant, contacts):
    app.include_router(module.api)
app.include_router(api)


@app.get('/health')
async def root_health():
    return {'status': 'healthy'}

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(','),
    allow_methods=['*'],
    allow_headers=['*'],
)
