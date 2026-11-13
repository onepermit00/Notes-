"""Shared foundation: database, config, models, sessions, tokens, email, audit."""
import asyncio
import bcrypt as _bcrypt
import hashlib
import json as _json
import logging
import html as html_lib
import os
import re
import secrets
import urllib.error
import urllib.request
import uuid
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from fastapi import Cookie, HTTPException, Request, Response
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
from pydantic import BaseModel
from typing import Any, Dict, List, Optional

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# ── Database ───────────────────────────────────────────────────────────────────
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client    = AsyncIOMotorClient(mongo_url)
db        = client[os.environ.get('DB_NAME', 'adltrack')]

# ── Password hashing ──────────────────────────────────────────────────────────
def hash_pw(password: str) -> str:
    return _bcrypt.hashpw(password.encode(), _bcrypt.gensalt()).decode()

def verify_pw(password: str, hashed: str) -> bool:
    try:
        return _bcrypt.checkpw(password.encode(), hashed.encode())
    except Exception:
        return False

# ── App ───────────────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO, format='%(asctime)s %(levelname)s %(message)s')
logger = logging.getLogger(__name__)


async def _ensure_indexes():
    await db.sessions.create_index('token',      unique=True,  background=True)
    await db.sessions.create_index('expires_at',              background=True)
    await db.managers.create_index('email',      unique=True,  background=True)
    await db.managers.create_index('manager_id',              background=True)
    await db.contacts.create_index('manager_id',              background=True)
    await db.concierges.create_index('email',    unique=True,  background=True)
    await db.concierges.create_index('concierge_id',          background=True)
    await db.concierges.create_index([('manager_id', 1)],     background=True)
    await db.shifts.create_index([('concierge_id', 1), ('status', 1)], background=True)
    await db.shifts.create_index([('manager_id', 1),  ('status', 1)], background=True)
    await db.shifts.create_index([('clock_in', -1)],          background=True)
    await db.tasks.create_index('task_id',                    background=True)
    await db.tasks.create_index([('manager_id', 1), ('created_at', -1)], background=True)
    await db.incidents.create_index('incident_id',            background=True)
    await db.incidents.create_index([('manager_id', 1), ('created_at', -1)], background=True)
    await db.messages.create_index([('manager_id', 1), ('created_at', 1)],  background=True)
    await db.residents.create_index([('manager_id', 1), ('unit', 1)],       background=True)
    await db.audit_logs.create_index([('manager_id', 1), ('created_at', -1)], background=True)
    await db.scheduled_tasks.create_index([('manager_id', 1), ('active', 1)], background=True)
    await db.tasks.create_index('schedule_occurrence_key', unique=True, sparse=True, background=True)
    await db.password_resets.create_index('token_hash', unique=True, background=True)
    await db.password_resets.create_index('expires_at', expireAfterSeconds=0, background=True)
    await db.invitations.create_index('token_hash', unique=True, background=True)
    await db.invitations.create_index('email',                          background=True)
    await db.invitations.create_index([('manager_id', 1), ('status', 1)], background=True)
    await db.rate_limit_events.create_index('key',                      background=True)
    await db.rate_limit_events.create_index('created_at', expireAfterSeconds=900, background=True)
    await db.knowledge.create_index([('manager_id', 1), ('kind', 1)],     background=True)
    await db.knowledge_files.create_index([('file_id', 1), ('n', 1)],     background=True)
    await db.desk_state.create_index([('manager_id', 1), ('section', 1)], unique=True, background=True)
    logger.info('MongoDB indexes ensured.')

SESSION_DAYS = 30

RESET_TOKEN_MINUTES  = 45   # password-reset link lifetime
INVITE_TOKEN_DAYS    = 7    # concierge invitation link lifetime
FORGOT_PW_RATE_LIMIT  = 5   # max /auth/password/forgot requests
FORGOT_PW_RATE_WINDOW = 15  # ...per this many minutes, per email


class ManagerSignupRequest(BaseModel):
    first_name:    str
    last_name:     str
    email:         str
    phone:         str
    job_title:     str
    property_name: str
    address:       str
    city:          str
    state:         str
    units:         int
    password:      str

class SignInRequest(BaseModel):
    email:    str
    password: str
    role:     str   # 'manager' | 'concierge'

class AddConciergeRequest(BaseModel):
    first_name: str
    last_name:  str
    email:      str
    phone:      str
    title:      str
    password:   str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token:    str
    password: str

class CreateInvitationRequest(BaseModel):
    first_name: str
    last_name:  str
    email:      str
    phone:      str = ''
    title:      str = 'Concierge'

class AcceptInvitationRequest(BaseModel):
    password: str

class TaskCreate(BaseModel):
    title:          str
    description:    Optional[str] = None
    notes:          Optional[str] = None
    category:       Optional[str] = None
    instructions:   Optional[str] = None
    scheduled_time: Optional[str] = None
    due_time:       Optional[str] = None
    time_window:    Optional[str] = None
    priority:       str = 'Standard'
    requires_photo: bool = False
    assigned_to:    Optional[str] = None
    assigned_to_id: Optional[str] = None
    source_section: Optional[str] = None
    evidence_urls:  Optional[List[str]] = None

class TaskUpdate(BaseModel):
    status:          Optional[str] = None
    completion_note: Optional[str] = None
    evidence_url:    Optional[str] = None
    evidence_urls:   Optional[List[str]] = None

class MessageCreate(BaseModel):
    content:      str
    message_type: str = 'text'

class ActivityCreate(BaseModel):
    activity_type: str
    title:         str
    description:   Optional[str] = None
    metadata:      Optional[Dict[str, Any]] = None

class IncidentCreate(BaseModel):
    type:             str
    location:         str
    description:      str
    severity:         str = 'medium'
    notes:            Optional[str] = None
    unit_number:      Optional[str] = None
    person_involved:  Optional[str] = None
    evidence_urls:    Optional[List[str]] = None

class IncidentUpdate(BaseModel):
    status:        Optional[str] = None
    resolved_note: Optional[str] = None

class UpdateProfileRequest(BaseModel):
    first_name: Optional[str] = None
    last_name:  Optional[str] = None
    phone:      Optional[str] = None
    notification_prefs: Optional[Dict[str, bool]] = None


async def create_session(user_id: str, user_type: str) -> str:
    token   = f'sess_{uuid.uuid4().hex}'
    expires = datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS)
    await db.sessions.insert_one({
        'token':      token,
        'user_id':    user_id,
        'user_type':  user_type,
        'expires_at': expires,
        'created_at': datetime.now(timezone.utc),
    })
    return token

async def get_session(request: Request, session_token: Optional[str] = Cookie(default=None)):
    # The token the app sends on purpose wins over a cookie left in the browser,
    # so signing in as someone else on a shared desk computer cannot mix accounts.
    token = None
    auth = request.headers.get('Authorization', '')
    if auth.startswith('Bearer '):
        token = auth[7:].strip()
    if not token:
        token = session_token
    if not token:
        return None
    doc = await db.sessions.find_one({'token': token})
    if not doc:
        return None
    expires = doc['expires_at']
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if expires < datetime.now(timezone.utc):
        await db.sessions.delete_one({'token': token})
        return None
    return doc

def set_cookie(response: Response, token: str):
    response.set_cookie(
        key='session_token', value=token,
        httponly=True, samesite='lax', secure=False,
        max_age=SESSION_DAYS * 86400, path='/',
    )


# ── Password / invitation tokens ────────────────────────────────────────────────
# Raw tokens are shown to the user exactly once (in the email link) and are never
# persisted or logged. Only a sha256 hash of the token is stored, so a database
# read alone can never be used to reset a password or accept an invitation.

def _generate_raw_token() -> str:
    return secrets.token_urlsafe(32)

def _hash_token(raw_token: str) -> str:
    return hashlib.sha256(raw_token.encode()).hexdigest()

_EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')

def clean_email(value: str) -> str:
    """Lower-cased, trimmed email, or a 400 the form can show next to the field."""
    email = (value or '').strip().lower()
    if not _EMAIL_RE.match(email) or len(email) > 254:
        raise HTTPException(400, 'Enter a valid email address.')
    return email


def validate_password_policy(password: str):
    """Same minimum bar enforced at manager signup — kept in one place so every
    entry point (signup, reset, invitation-accept) stays consistent."""
    if len(password) < 8:
        raise HTTPException(400, 'Password must be at least 8 characters.')


async def _check_rate_limit(key: str, limit: int, window_minutes: int):
    """Lightweight Mongo-backed sliding-window limiter. The events collection has
    a TTL index matching the window, so it self-cleans without a background job."""
    window_start = datetime.now(timezone.utc) - timedelta(minutes=window_minutes)
    count = await db.rate_limit_events.count_documents({'key': key, 'created_at': {'$gte': window_start}})
    if count >= limit:
        raise HTTPException(429, 'Too many requests. Please try again later.')
    await db.rate_limit_events.insert_one({'key': key, 'created_at': datetime.now(timezone.utc)})


def esc(value) -> str:
    """Make a value safe to place in an HTML email. Names, titles and notes are typed by people."""
    return html_lib.escape('' if value is None else str(value))


# ── Email ──────────────────────────────────────────────────────────────────────
# Two providers are supported, both over HTTPS (Render's free plan blocks SMTP):
#   RESEND_API_KEY  → resend.com  (needs a verified domain to email anyone but yourself)
#   BREVO_API_KEY   → brevo.com   (can send from a single verified address, no domain needed)
# EMAIL_FROM sets the sender, e.g. "Noted <hello@yourdomain.com>".

def email_provider() -> Optional[str]:
    if os.environ.get('RESEND_API_KEY'):
        return 'resend'
    if os.environ.get('BREVO_API_KEY'):
        return 'brevo'
    return None


def _sender() -> tuple:
    """Split EMAIL_FROM ("Name <addr>" or "addr") into (name, address)."""
    raw = os.environ.get('EMAIL_FROM', '').strip() or 'Noted <onboarding@resend.dev>'
    if '<' in raw and raw.endswith('>'):
        name, addr = raw[:-1].split('<', 1)
        return name.strip().strip('"') or 'Noted', addr.strip()
    return 'Noted', raw


def _post_json(url: str, payload: dict, headers: dict):
    req = urllib.request.Request(
        url, data=_json.dumps(payload).encode(),
        # Resend sits behind Cloudflare, which rejects Python's default User-Agent
        # (error 1010), so always send our own.
        headers={'Content-Type': 'application/json', 'Accept': 'application/json',
                 'User-Agent': 'Noted/1.0 (+https://notes-six-orcin.vercel.app)', **headers},
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            r.read()
    except urllib.error.HTTPError as e:
        body = e.read().decode(errors='replace')[:500]
        try:
            parsed = _json.loads(body)
            body = parsed.get('message') or parsed.get('title') or parsed.get('error') or body
        except Exception:
            pass
        raise RuntimeError(f'{e.code}: {body}') from None


def _send_sync(provider: str, to_email: str, subject: str, html: str):
    name, addr = _sender()
    if provider == 'resend':
        _post_json('https://api.resend.com/emails', {
            'from': f'{name} <{addr}>', 'to': [to_email], 'subject': subject, 'html': html,
        }, {'Authorization': f"Bearer {os.environ['RESEND_API_KEY']}"})
    else:
        _post_json('https://api.brevo.com/v3/smtp/email', {
            'sender': {'name': name, 'email': addr},
            'to': [{'email': to_email}], 'subject': subject, 'htmlContent': html,
        }, {'api-key': os.environ['BREVO_API_KEY']})


async def send_email(to_email: str, subject: str, html: str) -> tuple:
    """Send one email. Returns (sent, reason) and never raises, so callers can
    either fire-and-forget it or await it and tell the user what happened."""
    provider = email_provider()
    if not provider:
        logger.warning(f'Email not configured (no RESEND_API_KEY or BREVO_API_KEY) — skipping email to {to_email}')
        return False, 'Email sending is not set up on the server yet.'
    try:
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, _send_sync, provider, to_email, subject, html)
        logger.info(f'Email sent via {provider} → {to_email}')
        return True, ''
    except Exception as e:
        logger.error(f'Email via {provider} to {to_email} failed: {e}')
        return False, f'The email provider rejected the message ({e}).'


async def _resolve_user(request, session_token):
    session = await get_session(request, session_token)
    if not session:
        raise HTTPException(401, 'Not authenticated.')
    if session['user_type'] == 'manager':
        user = await db.managers.find_one({'manager_id': session['user_id']})
    else:
        user = await db.concierges.find_one({'concierge_id': session['user_id']})
    if not user:
        # The account was removed while the session was still open.
        raise HTTPException(401, 'Not authenticated.')
    return user, session['user_type'], user['manager_id']


async def _audit(manager_id: str, user_id: str, user_type: str, action: str,
                 resource_type: str, resource_id: str = '', detail: dict = None):
    """Append-only audit log entry — never deleted."""
    await db.audit_logs.insert_one({
        'log_id':        f'log_{uuid.uuid4().hex[:12]}',
        'manager_id':    manager_id,
        'user_id':       user_id,
        'user_type':     user_type,
        'action':        action,          # 'create' | 'update' | 'delete' | 'clock_in' | 'clock_out'
        'resource_type': resource_type,   # 'task' | 'incident' | 'shift' | 'resident' | 'package'
        'resource_id':   resource_id,
        'detail':        detail or {},
        'created_at':    datetime.now(timezone.utc),
    })
