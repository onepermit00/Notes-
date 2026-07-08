from fastapi import FastAPI, APIRouter, HTTPException, Response, Request, Cookie, UploadFile, File, Form
from fastapi.responses import JSONResponse
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from contextlib import asynccontextmanager
import bcrypt as _bcrypt
from dotenv import load_dotenv
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
from pathlib import Path
import os, logging, uuid, asyncio, base64
import urllib.request, urllib.error, json as _json

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
    logger.info('MongoDB indexes ensured.')


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

SESSION_DAYS = 30


# ══════════════════════════════════════════════════════════════════════════════
# MODELS
# ══════════════════════════════════════════════════════════════════════════════

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

class TaskUpdate(BaseModel):
    status:          Optional[str] = None
    completion_note: Optional[str] = None
    evidence_url:    Optional[str] = None

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

class IncidentUpdate(BaseModel):
    status:        Optional[str] = None
    resolved_note: Optional[str] = None

class UpdateProfileRequest(BaseModel):
    first_name: Optional[str] = None
    last_name:  Optional[str] = None
    phone:      Optional[str] = None


# ══════════════════════════════════════════════════════════════════════════════
# SESSION HELPERS
# ══════════════════════════════════════════════════════════════════════════════

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
    token = session_token
    if not token:
        auth = request.headers.get('Authorization', '')
        if auth.startswith('Bearer '):
            token = auth[7:]
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


# ══════════════════════════════════════════════════════════════════════════════
# EMAIL HELPER
# ══════════════════════════════════════════════════════════════════════════════

def _send_resend(to_email: str, subject: str, html: str):
    api_key = os.environ.get('RESEND_API_KEY', '')
    payload = _json.dumps({
        'from': 'Notes <onboarding@resend.dev>',
        'to': [to_email],
        'subject': subject,
        'html': html,
    }).encode()
    req = urllib.request.Request(
        'https://api.resend.com/emails',
        data=payload,
        headers={'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'},
    )
    with urllib.request.urlopen(req, timeout=15) as r:
        r.read()

async def send_email(to_email: str, subject: str, html: str):
    if not os.environ.get('RESEND_API_KEY'):
        logger.info(f'Resend not configured — skipping email to {to_email}')
        return
    try:
        loop = asyncio.get_running_loop()
        await loop.run_in_executor(None, _send_resend, to_email, subject, html)
        logger.info(f'Email sent → {to_email}')
    except Exception as e:
        logger.error(f'Email failed: {e}')


# ══════════════════════════════════════════════════════════════════════════════
# AUTH ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════════

@api.post('/auth/manager/signup')
async def manager_signup(data: ManagerSignupRequest, response: Response):
    if len(data.password) < 8:
        raise HTTPException(400, 'Password must be at least 8 characters.')
    if await db.managers.find_one({'email': data.email.lower()}):
        raise HTTPException(400, 'An account with this email already exists.')

    mgr_id = f'mgr_{uuid.uuid4().hex[:12]}'
    await db.managers.insert_one({
        'manager_id':    mgr_id,
        'email':         data.email.lower(),
        'password_hash': hash_pw(data.password),
        'first_name':    data.first_name,
        'last_name':     data.last_name,
        'phone':         data.phone,
        'job_title':     data.job_title,
        'property_name': data.property_name,
        'address':       data.address,
        'city':          data.city,
        'state':         data.state,
        'units':         data.units,
        'created_at':    datetime.now(timezone.utc),
    })

    token = await create_session(mgr_id, 'manager')
    set_cookie(response, token)

    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:40px 20px">
      <div style="background:#0F0F0F;border-radius:16px 16px 0 0;padding:32px;text-align:center">
        <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin:0 0 8px">onepermit</p>
        <h1 style="color:white;font-size:22px;font-weight:800;margin:0">Welcome to onepermit, {data.first_name}!</h1>
      </div>
      <div style="background:#fff;border:1px solid #ebebeb;border-top:none;border-radius:0 0 16px 16px;padding:32px">
        <p style="color:#444;font-size:15px;line-height:1.7">Your manager account for <strong>{data.property_name}</strong> is ready.</p>
        <p style="color:#444;font-size:15px;line-height:1.7">Sign in any time at:</p>
        <a href="{frontend_url}" style="display:block;background:#FF385C;color:white;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px;margin:20px 0">{frontend_url}</a>
        <p style="color:#aaa;font-size:13px">You can add your concierge team from the Team section of your dashboard.</p>
      </div>
    </div>"""
    asyncio.create_task(send_email(data.email, 'Welcome to onepermit — your account is ready', html))

    return {
        'token':         token,
        'user_id':       mgr_id,
        'user_type':     'manager',
        'name':          f'{data.first_name} {data.last_name}',
        'email':         data.email.lower(),
        'property_name': data.property_name,
    }


@api.post('/auth/signin')
async def signin(data: SignInRequest, response: Response):
    email = data.email.lower().strip()

    if data.role == 'manager':
        user = await db.managers.find_one({'email': email})
        if not user or not verify_pw(data.password, user['password_hash']):
            raise HTTPException(401, 'Invalid email or password.')
        token = await create_session(user['manager_id'], 'manager')
        set_cookie(response, token)
        return {
            'token':         token,
            'user_id':       user['manager_id'],
            'user_type':     'manager',
            'name':          f"{user['first_name']} {user['last_name']}",
            'email':         user['email'],
            'property_name': user['property_name'],
        }

    if data.role == 'concierge':
        user = await db.concierges.find_one({'email': email, 'is_active': True})
        if not user or not verify_pw(data.password, user['password_hash']):
            raise HTTPException(401, 'Invalid email or password.')
        token = await create_session(user['concierge_id'], 'concierge')
        set_cookie(response, token)
        return {
            'token':         token,
            'user_id':       user['concierge_id'],
            'user_type':     'concierge',
            'name':          f"{user['first_name']} {user['last_name']}",
            'email':         user['email'],
            'property_name': user.get('property_name', ''),
            'title':         user.get('title', 'Concierge'),
            'manager_id':    user['manager_id'],
        }

    raise HTTPException(400, 'Role must be "manager" or "concierge".')


@api.get('/auth/me')
async def me(request: Request, session_token: Optional[str] = Cookie(default=None)):
    session = await get_session(request, session_token)
    if not session:
        raise HTTPException(401, 'Not authenticated.')

    if session['user_type'] == 'manager':
        user = await db.managers.find_one({'manager_id': session['user_id']}, {'_id': 0, 'password_hash': 0})
        if not user:
            raise HTTPException(401, 'User not found.')
        return {
            'user_id':       user['manager_id'],
            'user_type':     'manager',
            'name':          f"{user['first_name']} {user['last_name']}",
            'email':         user['email'],
            'property_name': user['property_name'],
        }

    user = await db.concierges.find_one({'concierge_id': session['user_id']}, {'_id': 0, 'password_hash': 0})
    if not user:
        raise HTTPException(401, 'User not found.')
    return {
        'user_id':       user['concierge_id'],
        'user_type':     'concierge',
        'name':          f"{user['first_name']} {user['last_name']}",
        'email':         user['email'],
        'property_name': user.get('property_name', ''),
        'title':         user.get('title', 'Concierge'),
        'manager_id':    user['manager_id'],
    }


@api.post('/auth/signout')
async def signout(request: Request, response: Response, session_token: Optional[str] = Cookie(default=None)):
    session = await get_session(request, session_token)
    if session:
        await db.sessions.delete_one({'token': session['token']})
    response.delete_cookie('session_token', path='/')
    return {'message': 'Signed out.'}


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password:     str

@api.put('/auth/change-password')
async def change_password(data: ChangePasswordRequest, request: Request, session_token: Optional[str] = Cookie(default=None)):
    session = await get_session(request, session_token)
    if not session:
        raise HTTPException(401, 'Not authenticated.')
    if len(data.new_password) < 6:
        raise HTTPException(400, 'New password must be at least 6 characters.')
    collection = db.managers if session['user_type'] == 'manager' else db.concierges
    id_field   = 'manager_id'  if session['user_type'] == 'manager' else 'concierge_id'
    user = await collection.find_one({id_field: session['user_id']})
    if not user:
        raise HTTPException(404, 'User not found.')
    if not verify_pw(data.current_password, user['password_hash']):
        raise HTTPException(400, 'Current password is incorrect.')
    await collection.update_one({id_field: session['user_id']}, {'$set': {'password_hash': hash_pw(data.new_password)}})
    return {'message': 'Password updated successfully.'}


@api.put('/auth/me')
async def update_profile(data: UpdateProfileRequest, request: Request, session_token: Optional[str] = Cookie(default=None)):
    session = await get_session(request, session_token)
    if not session:
        raise HTTPException(401, 'Not authenticated.')
    patch = {}
    if data.first_name is not None: patch['first_name'] = data.first_name.strip()
    if data.last_name  is not None: patch['last_name']  = data.last_name.strip()
    if data.phone      is not None: patch['phone']      = data.phone.strip()
    if not patch:
        raise HTTPException(400, 'No fields to update.')
    collection = db.managers   if session['user_type'] == 'manager' else db.concierges
    id_field   = 'manager_id'  if session['user_type'] == 'manager' else 'concierge_id'
    result = await collection.update_one({id_field: session['user_id']}, {'$set': patch})
    if result.matched_count == 0:
        raise HTTPException(404, 'User not found.')
    user = await collection.find_one({id_field: session['user_id']}, {'_id': 0, 'password_hash': 0})
    if session['user_type'] == 'manager':
        return {
            'user_id':       user['manager_id'],
            'user_type':     'manager',
            'name':          f"{user['first_name']} {user['last_name']}",
            'email':         user['email'],
            'property_name': user['property_name'],
        }
    return {
        'user_id':       user['concierge_id'],
        'user_type':     'concierge',
        'name':          f"{user['first_name']} {user['last_name']}",
        'email':         user['email'],
        'property_name': user.get('property_name', ''),
        'title':         user.get('title', 'Concierge'),
        'manager_id':    user['manager_id'],
    }


# ══════════════════════════════════════════════════════════════════════════════
# MANAGER — CONCIERGE MANAGEMENT
# ══════════════════════════════════════════════════════════════════════════════

@api.post('/manager/concierge')
async def add_concierge(data: AddConciergeRequest, request: Request, session_token: Optional[str] = Cookie(default=None)):
    session = await get_session(request, session_token)
    if not session or session['user_type'] != 'manager':
        raise HTTPException(403, 'Manager access required.')

    manager = await db.managers.find_one({'manager_id': session['user_id']})
    if not manager:
        raise HTTPException(404, 'Manager not found.')

    if len(data.password) < 8:
        raise HTTPException(400, 'Password must be at least 8 characters.')
    if await db.concierges.find_one({'email': data.email.lower()}):
        raise HTTPException(400, 'A concierge with this email already exists.')

    con_id = f'con_{uuid.uuid4().hex[:12]}'
    await db.concierges.insert_one({
        'concierge_id':  con_id,
        'email':         data.email.lower(),
        'password_hash': hash_pw(data.password),
        'first_name':    data.first_name,
        'last_name':     data.last_name,
        'phone':         data.phone,
        'title':         data.title,
        'manager_id':    session['user_id'],
        'property_name': manager['property_name'],
        'is_active':     True,
        'created_at':    datetime.now(timezone.utc),
    })

    # Send credentials email to the concierge
    frontend_url   = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    manager_name   = f"{manager['first_name']} {manager['last_name']}"
    property_name  = manager['property_name']
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:40px 20px">
      <div style="background:#FF385C;border-radius:16px 16px 0 0;padding:32px;text-align:center">
        <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.7);margin:0 0 8px">onepermit</p>
        <h1 style="color:white;font-size:22px;font-weight:800;margin:0">You've been added to {property_name}</h1>
      </div>
      <div style="background:#fff;border:1px solid #ebebeb;border-top:none;border-radius:0 0 16px 16px;padding:32px">
        <p style="color:#444;font-size:15px;line-height:1.7">Hi {data.first_name},</p>
        <p style="color:#444;font-size:15px;line-height:1.7">
          <strong>{manager_name}</strong> has added you as a <strong>{data.title}</strong>
          at <strong>{property_name}</strong> on the onepermit platform.
        </p>
        <div style="background:#f8f8f8;border:1px solid #ebebeb;border-radius:12px;padding:20px 24px;margin:24px 0">
          <p style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#aaa;margin:0 0 12px">Your Login Credentials</p>
          <p style="color:#222;font-size:15px;margin:0 0 8px"><strong>Email:</strong> {data.email}</p>
          <p style="color:#222;font-size:15px;margin:0"><strong>Password:</strong> {data.password}</p>
        </div>
        <a href="{frontend_url}" style="display:block;background:#FF385C;color:white;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px">Sign In to onepermit</a>
        <p style="color:#aaa;font-size:13px;text-align:center;margin-top:20px">
          Select <strong>Concierge</strong> on the sign-in screen and use the credentials above.
        </p>
      </div>
    </div>"""
    asyncio.create_task(send_email(data.email, f"You've been added to {property_name} on onepermit", html))

    return {
        'concierge_id':  con_id,
        'first_name':    data.first_name,
        'last_name':     data.last_name,
        'email':         data.email.lower(),
        'title':         data.title,
        'phone':         data.phone,
        'property_name': property_name,
        'message':       'Concierge added. Login credentials emailed.',
    }


@api.get('/manager/concierges')
async def list_concierges(request: Request, session_token: Optional[str] = Cookie(default=None)):
    session = await get_session(request, session_token)
    if not session or session['user_type'] != 'manager':
        raise HTTPException(403, 'Manager access required.')

    docs = await db.concierges.find(
        {'manager_id': session['user_id']},
        {'_id': 0, 'password_hash': 0}
    ).to_list(200)

    for d in docs:
        if isinstance(d.get('created_at'), datetime):
            d['created_at'] = d['created_at'].isoformat()

    return {'concierges': docs}


@api.post('/manager/concierge/{concierge_id}/resend-credentials')
async def resend_credentials(concierge_id: str, request: Request, session_token: Optional[str] = Cookie(default=None)):
    session = await get_session(request, session_token)
    if not session or session['user_type'] != 'manager':
        raise HTTPException(403, 'Manager access required.')

    manager = await db.managers.find_one({'manager_id': session['user_id']})
    con = await db.concierges.find_one({'concierge_id': concierge_id, 'manager_id': session['user_id']})
    if not con:
        raise HTTPException(404, 'Concierge not found.')

    import random, string
    new_pw = 'Team' + ''.join(random.choices(string.digits, k=4)) + '!'
    await db.concierges.update_one({'concierge_id': concierge_id}, {'$set': {'password_hash': hash_pw(new_pw)}})

    manager_name  = f"{manager['first_name']} {manager['last_name']}"
    property_name = manager['property_name']
    frontend_url  = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    html = f"""
    <div style="font-family:Inter,sans-serif;max-width:520px;margin:0 auto;padding:40px 20px">
      <div style="background:#FF385C;border-radius:16px 16px 0 0;padding:32px;text-align:center">
        <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.7);margin:0 0 8px">onepermit</p>
        <h1 style="color:white;font-size:22px;font-weight:800;margin:0">Your login credentials have been reset</h1>
      </div>
      <div style="background:#fff;border:1px solid #ebebeb;border-top:none;border-radius:0 0 16px 16px;padding:32px">
        <p style="color:#444;font-size:15px;line-height:1.7">Hi {con['first_name']},</p>
        <p style="color:#444;font-size:15px;line-height:1.7">
          <strong>{manager_name}</strong> has reset your login credentials for <strong>{property_name}</strong>.
        </p>
        <div style="background:#f8f8f8;border:1px solid #ebebeb;border-radius:12px;padding:20px 24px;margin:24px 0">
          <p style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#aaa;margin:0 0 12px">Your New Login Credentials</p>
          <p style="color:#222;font-size:15px;margin:0 0 8px"><strong>Email:</strong> {con['email']}</p>
          <p style="color:#222;font-size:15px;margin:0"><strong>Password:</strong> {new_pw}</p>
        </div>
        <a href="{frontend_url}" style="display:block;background:#FF385C;color:white;text-align:center;padding:16px;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px">Sign In to onepermit</a>
        <p style="color:#aaa;font-size:13px;text-align:center;margin-top:20px">Select <strong>Concierge</strong> on the sign-in screen.</p>
      </div>
    </div>"""
    asyncio.create_task(send_email(con['email'], f"Your onepermit credentials have been reset", html))
    return {'message': 'Credentials reset and emailed.', 'new_password': new_pw}


@api.delete('/manager/concierge/{concierge_id}')
async def remove_concierge(concierge_id: str, request: Request, session_token: Optional[str] = Cookie(default=None)):
    session = await get_session(request, session_token)
    if not session or session['user_type'] != 'manager':
        raise HTTPException(403, 'Manager access required.')

    result = await db.concierges.delete_one(
        {'concierge_id': concierge_id, 'manager_id': session['user_id']}
    )
    if result.deleted_count == 0:
        raise HTTPException(404, 'Concierge not found.')

    return {'message': 'Concierge removed.'}


# ══════════════════════════════════════════════════════════════════════════════
# SHIFTS
# ══════════════════════════════════════════════════════════════════════════════

@api.post('/shifts/start')
async def start_shift(request: Request, session_token: Optional[str] = Cookie(default=None)):
    session = await get_session(request, session_token)
    if not session or session['user_type'] != 'concierge':
        raise HTTPException(403, 'Concierge access required.')
    concierge = await db.concierges.find_one({'concierge_id': session['user_id']})
    if not concierge:
        raise HTTPException(404, 'Concierge not found.')
    # Return existing active shift if already clocked in
    existing = await db.shifts.find_one({'concierge_id': session['user_id'], 'status': 'active'}, {'_id': 0})
    if existing:
        if isinstance(existing.get('clock_in'), datetime):
            existing['clock_in'] = existing['clock_in'].isoformat()
        return existing
    shift_id = f'shift_{uuid.uuid4().hex[:12]}'
    now = datetime.now(timezone.utc)
    doc = {
        'shift_id':       shift_id,
        'concierge_id':   concierge['concierge_id'],
        'concierge_name': f"{concierge['first_name']} {concierge['last_name']}",
        'manager_id':     concierge['manager_id'],
        'property_name':  concierge['property_name'],
        'status':         'active',
        'clock_in':       now,
        'clock_out':      None,
        'created_at':     now,
    }
    await db.shifts.insert_one(doc)
    doc.pop('_id', None)
    doc['clock_in'] = now.isoformat()
    return doc


@api.post('/shifts/end')
async def end_shift(request: Request, session_token: Optional[str] = Cookie(default=None)):
    session = await get_session(request, session_token)
    if not session or session['user_type'] != 'concierge':
        raise HTTPException(403, 'Concierge access required.')
    now = datetime.now(timezone.utc)
    result = await db.shifts.update_one(
        {'concierge_id': session['user_id'], 'status': 'active'},
        {'$set': {'status': 'completed', 'clock_out': now}}
    )
    if result.matched_count == 0:
        raise HTTPException(404, 'No active shift.')
    return {'message': 'Shift ended.', 'clock_out': now.isoformat()}


async def _shift_activities(shift_id: str, mgr_id: str):
    tasks = await db.tasks.find({'shift_id': shift_id, 'manager_id': mgr_id}, {'_id': 0}).sort('created_at', 1).to_list(500)
    incidents = await db.incidents.find({'shift_id': shift_id, 'manager_id': mgr_id}, {'_id': 0}).sort('created_at', 1).to_list(200)
    for t in tasks:
        if isinstance(t.get('created_at'), datetime): t['created_at'] = t['created_at'].isoformat()
    for i in incidents:
        if isinstance(i.get('created_at'), datetime): i['created_at'] = i['created_at'].isoformat()
    return tasks, incidents


@api.get('/shifts/active')
async def get_active_shift(request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if user_type == 'concierge':
        shift = await db.shifts.find_one({'concierge_id': user['concierge_id'], 'status': 'active'}, {'_id': 0})
        if not shift:
            return {'shift': None}
        if isinstance(shift.get('clock_in'), datetime): shift['clock_in'] = shift['clock_in'].isoformat()
        tasks, incidents = await _shift_activities(shift['shift_id'], mgr_id)
        shift['activities'] = tasks
        shift['incidents']  = incidents
        return {'shift': shift}
    else:
        shifts = await db.shifts.find({'manager_id': mgr_id, 'status': 'active'}, {'_id': 0}).to_list(20)
        for s in shifts:
            if isinstance(s.get('clock_in'), datetime): s['clock_in'] = s['clock_in'].isoformat()
            tasks, incidents = await _shift_activities(s['shift_id'], mgr_id)
            s['activities'] = tasks
            s['incidents']  = incidents
        return {'shifts': shifts}


@api.get('/shifts/previous')
async def get_previous_shift(request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if user_type != 'concierge':
        raise HTTPException(403, 'Concierge access required.')
    shift = await db.shifts.find_one(
        {'concierge_id': user['concierge_id'], 'status': 'completed'},
        {'_id': 0},
        sort=[('clock_out', -1)]
    )
    if not shift:
        return {'shift': None}
    if isinstance(shift.get('clock_in'),  datetime): shift['clock_in']  = shift['clock_in'].isoformat()
    if isinstance(shift.get('clock_out'), datetime): shift['clock_out'] = shift['clock_out'].isoformat()
    tasks, incidents = await _shift_activities(shift['shift_id'], mgr_id)
    shift['activities'] = tasks
    shift['incidents']  = incidents
    return {'shift': shift}


@api.get('/shifts/history')
async def get_shift_history(request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    if user_type == 'concierge':
        query = {'concierge_id': user['concierge_id'], 'manager_id': mgr_id}
    else:
        query = {'manager_id': mgr_id}
    raw_shifts = await db.shifts.find(query, {'_id': 0}).sort('clock_in', -1).to_list(200)
    enriched = []
    for s in raw_shifts:
        if isinstance(s.get('clock_in'),  datetime): s['clock_in']  = s['clock_in'].isoformat()
        if isinstance(s.get('clock_out'), datetime): s['clock_out'] = s['clock_out'].isoformat()
        tasks, incidents = await _shift_activities(s['shift_id'], mgr_id)
        enriched.append({**s, 'activities': tasks, 'incidents': incidents})
    return {'shifts': enriched}


# ══════════════════════════════════════════════════════════════════════════════
# TASKS  (scoped to manager's property)
# ══════════════════════════════════════════════════════════════════════════════

async def _resolve_user(request, session_token):
    session = await get_session(request, session_token)
    if not session:
        raise HTTPException(401, 'Not authenticated.')
    if session['user_type'] == 'manager':
        user = await db.managers.find_one({'manager_id': session['user_id']})
        return user, session['user_type'], user['manager_id']
    else:
        user = await db.concierges.find_one({'concierge_id': session['user_id']})
        return user, session['user_type'], user['manager_id']


@api.get('/tasks')
async def get_tasks(request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    query = {'manager_id': mgr_id}
    if user_type == 'concierge':
        # concierge only sees tasks assigned to them (by id or name)
        cid = user['concierge_id']
        cname = f"{user['first_name']} {user['last_name']}"
        query = {'manager_id': mgr_id, '$or': [{'assigned_to_id': cid}, {'assigned_to': {'$regex': cname.split()[0], '$options': 'i'}}]}
    tasks = await db.tasks.find(query, {'_id': 0}).sort('created_at', -1).to_list(200)
    return {'tasks': tasks}


@api.post('/tasks')
async def create_task(task: TaskCreate, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    # Auto-tag with active shift if concierge
    shift_id = None
    if user_type == 'concierge':
        active = await db.shifts.find_one({'concierge_id': user['concierge_id'], 'status': 'active'}, {'shift_id': 1})
        if active:
            shift_id = active['shift_id']
    task_id = f'task_{uuid.uuid4().hex[:12]}'
    doc = {
        'task_id':         task_id,
        'manager_id':      mgr_id,
        'shift_id':        shift_id,
        'title':           task.title,
        'notes':           task.notes or task.description or '',
        'category':        task.category or 'Other',
        'priority':        task.priority,
        'status':          'pending',
        'requires_photo':  task.requires_photo,
        'assigned_to':     task.assigned_to,
        'assigned_to_id':  task.assigned_to_id,
        'due_time':        task.due_time or task.scheduled_time or 'ASAP',
        'completion_note': None,
        'evidence_url':    None,
        'created_by':      user['manager_id'] if user_type == 'manager' else user['concierge_id'],
        'created_by_name': f"{user['first_name']} {user['last_name']}",
        'created_by_type': user_type,
        'created_at':      datetime.now(timezone.utc),
    }
    await db.tasks.insert_one(doc)
    doc.pop('_id', None)
    doc['created_at'] = doc['created_at'].isoformat()
    return doc


@api.put('/tasks/{task_id}')
async def update_task(task_id: str, update: TaskUpdate, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    patch = {}
    if update.status:          patch['status']          = update.status
    if update.completion_note: patch['completion_note'] = update.completion_note
    if update.evidence_url:    patch['evidence_url']    = update.evidence_url
    if update.status == 'completed':
        patch['completed_at']        = datetime.now(timezone.utc).isoformat()
        patch['completed_by_name']   = f"{user['first_name']} {user['last_name']}"
    result = await db.tasks.update_one({'task_id': task_id, 'manager_id': mgr_id}, {'$set': patch})
    if result.matched_count == 0:
        raise HTTPException(404, 'Task not found.')
    updated = await db.tasks.find_one({'task_id': task_id}, {'_id': 0})
    return updated


# ══════════════════════════════════════════════════════════════════════════════
# INCIDENTS
# ══════════════════════════════════════════════════════════════════════════════

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
        'status':          'new',
        'created_by':      f"{user['first_name']} {user['last_name']}",
        'created_by_type': user_type,
        'created_at':      datetime.now(timezone.utc),
    }
    await db.incidents.insert_one(doc)
    doc.pop('_id', None)
    doc['created_at'] = doc['created_at'].isoformat()
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


# ══════════════════════════════════════════════════════════════════════════════
# MESSAGES
# ══════════════════════════════════════════════════════════════════════════════

@api.get('/messages')
async def get_messages(request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    docs = await db.messages.find({'manager_id': mgr_id}, {'_id': 0}).sort('created_at', 1).to_list(200)
    return {'messages': docs}


@api.post('/messages')
async def send_message(msg: MessageCreate, request: Request, session_token: Optional[str] = Cookie(default=None)):
    user, user_type, mgr_id = await _resolve_user(request, session_token)
    msg_id = f'msg_{uuid.uuid4().hex[:12]}'
    doc = {
        'message_id':   msg_id,
        'manager_id':   mgr_id,
        'content':      msg.content,
        'message_type': msg.message_type,
        'sender_name':  f"{user['first_name']} {user['last_name']}",
        'sender_type':  user_type,
        'created_at':   datetime.now(timezone.utc),
    }
    await db.messages.insert_one(doc)
    doc.pop('_id', None)
    doc['created_at'] = doc['created_at'].isoformat()
    return doc


# ══════════════════════════════════════════════════════════════════════════════
# IMAGE UPLOAD
# ══════════════════════════════════════════════════════════════════════════════

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


# ══════════════════════════════════════════════════════════════════════════════
# HEALTH / STATUS
# ══════════════════════════════════════════════════════════════════════════════

@api.get('/')
async def root():
    return {'message': 'onepermit API', 'version': '2.0.0'}

@api.get('/health')
async def health():
    return {'status': 'healthy'}


# ══════════════════════════════════════════════════════════════════════════════
# MOUNT + CORS
# ══════════════════════════════════════════════════════════════════════════════

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

