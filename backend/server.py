from fastapi import FastAPI, APIRouter, HTTPException, Response, Request, Cookie, UploadFile, File, Form
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import httpx
import base64

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Import emergentintegrations for LLM
try:
    from emergentintegrations.llm.chat import LlmChat, UserMessage
    LLM_AVAILABLE = True
except ImportError:
    LLM_AVAILABLE = False
    logging.warning("emergentintegrations not available, copilot will use fallback responses")

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# ============== MODELS ==============

class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

# User models
class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str
    picture: Optional[str] = None
    role: Optional[str] = None
    available_roles: List[str] = ["caregiver", "family", "enterprise"]

class SessionRequest(BaseModel):
    session_id: str
    role: Optional[str] = None

class RoleUpdateRequest(BaseModel):
    role: str

# Task models
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    scheduled_time: str
    time_window: Optional[str] = None
    priority: str = "standard"
    requires_photo: bool = False

class TaskUpdate(BaseModel):
    status: Optional[str] = None
    completion_note: Optional[str] = None
    evidence_url: Optional[str] = None
    completed_at: Optional[str] = None

class TaskResponse(BaseModel):
    task_id: str
    title: str
    description: Optional[str] = None
    instructions: Optional[str] = None
    scheduled_time: str
    time_window: Optional[str] = None
    priority: str
    status: str
    requires_photo: bool
    completion_note: Optional[str] = None
    evidence_url: Optional[str] = None
    completed_at: Optional[str] = None
    created_by: str
    created_by_role: str
    created_at: str

# Activity/Timeline models
class ActivityCreate(BaseModel):
    activity_type: str  # task_completed, vital_recorded, photo_uploaded, note_added
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class ActivityResponse(BaseModel):
    activity_id: str
    activity_type: str
    title: str
    description: Optional[str] = None
    image_url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    created_by: str
    created_by_name: str
    created_by_role: str
    created_at: str

# Vital models
class VitalCreate(BaseModel):
    vital_type: str  # bp, hr, temp, pain
    value: str
    notes: Optional[str] = None

class VitalResponse(BaseModel):
    vital_id: str
    vital_type: str
    value: str
    notes: Optional[str] = None
    recorded_by: str
    recorded_by_name: str
    recorded_by_role: str
    recorded_at: str

# Message models
class MessageCreate(BaseModel):
    content: str
    message_type: str = "text"  # text, image, system

class MessageResponse(BaseModel):
    message_id: str
    content: str
    message_type: str
    sender_id: str
    sender_name: str
    sender_role: str
    created_at: str

# Copilot models
class CopilotChatRequest(BaseModel):
    session_id: str
    message: str
    role: str = "caregiver"
    context: Optional[Dict[str, Any]] = None

class CopilotChatResponse(BaseModel):
    response: str
    session_id: str

# Store chat sessions
chat_sessions = {}


# ============== HELPER FUNCTIONS ==============

async def get_current_user(request: Request, session_token: Optional[str] = Cookie(default=None)) -> Optional[User]:
    """Get current user from session token (cookie or header)"""
    token = session_token
    
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if not token:
        return None
    
    session_doc = await db.user_sessions.find_one(
        {"session_token": token},
        {"_id": 0}
    )
    
    if not session_doc:
        return None
    
    expires_at = session_doc.get("expires_at")
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        return None
    
    user_doc = await db.users.find_one(
        {"user_id": session_doc["user_id"]},
        {"_id": 0}
    )
    
    if not user_doc:
        return None
    
    return User(**user_doc)


# ============== AUTH ENDPOINTS ==============

@api_router.post("/auth/session")
async def create_session(request: SessionRequest, response: Response):
    """Exchange Emergent session_id for app session"""
    try:
        async with httpx.AsyncClient() as client_http:
            emergent_response = await client_http.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": request.session_id}
            )
            
            if emergent_response.status_code != 200:
                raise HTTPException(status_code=401, detail="Invalid session")
            
            user_data = emergent_response.json()
        
        existing_user = await db.users.find_one(
            {"email": user_data["email"]},
            {"_id": 0}
        )
        
        if existing_user:
            user_id = existing_user["user_id"]
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {
                    "name": user_data["name"],
                    "picture": user_data.get("picture"),
                    "role": request.role or existing_user.get("role")
                }}
            )
        else:
            user_id = f"user_{uuid.uuid4().hex[:12]}"
            await db.users.insert_one({
                "user_id": user_id,
                "email": user_data["email"],
                "name": user_data["name"],
                "picture": user_data.get("picture"),
                "role": request.role,
                "created_at": datetime.now(timezone.utc).isoformat()
            })
        
        session_token = f"sess_{uuid.uuid4().hex}"
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        await db.user_sessions.insert_one({
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": expires_at.isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            max_age=7 * 24 * 60 * 60,
            path="/"
        )
        
        user_doc = await db.users.find_one(
            {"user_id": user_id},
            {"_id": 0}
        )
        
        return {
            "user_id": user_doc["user_id"],
            "email": user_doc["email"],
            "name": user_doc["name"],
            "picture": user_doc.get("picture"),
            "role": user_doc.get("role"),
            "available_roles": ["caregiver", "family", "enterprise"]
        }
        
    except httpx.HTTPError as e:
        logger.error(f"Error calling Emergent auth: {e}")
        raise HTTPException(status_code=500, detail="Authentication service error")

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(request: Request, session_token: Optional[str] = Cookie(default=None)):
    """Get current authenticated user"""
    user = await get_current_user(request, session_token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    return UserResponse(
        user_id=user.user_id,
        email=user.email,
        name=user.name,
        picture=user.picture,
        role=user.role,
        available_roles=["caregiver", "family", "enterprise"]
    )

@api_router.post("/auth/switch-role")
async def switch_role(role_data: RoleUpdateRequest, request: Request, session_token: Optional[str] = Cookie(default=None)):
    """Switch user's current role (same email, different view)"""
    user = await get_current_user(request, session_token)
    
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if role_data.role not in ["caregiver", "family", "enterprise"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    await db.users.update_one(
        {"user_id": user.user_id},
        {"$set": {"role": role_data.role}}
    )
    
    return {
        "message": "Role switched successfully",
        "role": role_data.role,
        "user_id": user.user_id,
        "email": user.email
    }

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response, session_token: Optional[str] = Cookie(default=None)):
    """Logout and clear session"""
    token = session_token
    
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
    
    if token:
        await db.user_sessions.delete_one({"session_token": token})
    
    response.delete_cookie(
        key="session_token",
        path="/",
        secure=True,
        samesite="none"
    )
    
    return {"message": "Logged out successfully"}


# ============== SHARED DATA ENDPOINTS ==============
# All data is shared across roles for the same user/email

@api_router.get("/tasks")
async def get_tasks(request: Request, session_token: Optional[str] = Cookie(default=None)):
    """Get all tasks - shared across all roles"""
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    tasks = await db.tasks.find({}, {
        "_id": 0,
        "task_id": 1,
        "title": 1,
        "description": 1,
        "instructions": 1,
        "scheduled_time": 1,
        "time_window": 1,
        "priority": 1,
        "status": 1,
        "requires_photo": 1,
        "completion_note": 1,
        "evidence_url": 1,
        "completed_at": 1,
        "created_by": 1,
        "created_by_name": 1,
        "created_at": 1
    }).sort("created_at", -1).to_list(100)
    return {"tasks": tasks}

@api_router.post("/tasks")
async def create_task(task: TaskCreate, request: Request, session_token: Optional[str] = Cookie(default=None)):
    """Create a new task"""
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    task_id = f"task_{uuid.uuid4().hex[:12]}"
    task_doc = {
        "task_id": task_id,
        "title": task.title,
        "description": task.description,
        "instructions": task.instructions,
        "scheduled_time": task.scheduled_time,
        "time_window": task.time_window,
        "priority": task.priority,
        "status": "pending",
        "requires_photo": task.requires_photo,
        "completion_note": None,
        "evidence_url": None,
        "completed_at": None,
        "created_by": user.user_id,
        "created_by_name": user.name,
        "created_by_role": user.role,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.tasks.insert_one(task_doc)
    if "_id" in task_doc:
        del task_doc["_id"]
    
    # Also create an activity for the timeline
    await create_activity_internal(
        user=user,
        activity_type="task_created",
        title=f"New task: {task.title}",
        description=task.description,
        metadata={"task_id": task_id}
    )
    
    return task_doc

@api_router.put("/tasks/{task_id}")
async def update_task(task_id: str, task_update: TaskUpdate, request: Request, session_token: Optional[str] = Cookie(default=None)):
    """Update a task (complete it, add notes, etc.)"""
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    update_data = {}
    if task_update.status:
        update_data["status"] = task_update.status
    if task_update.completion_note:
        update_data["completion_note"] = task_update.completion_note
    if task_update.evidence_url:
        update_data["evidence_url"] = task_update.evidence_url
    if task_update.completed_at:
        update_data["completed_at"] = task_update.completed_at
    
    if task_update.status == "completed":
        update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
        update_data["completed_by"] = user.user_id
        update_data["completed_by_name"] = user.name
        update_data["completed_by_role"] = user.role
    
    result = await db.tasks.update_one(
        {"task_id": task_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Get updated task
    updated_task = await db.tasks.find_one({"task_id": task_id}, {"_id": 0})
    
    # Create activity if task was completed
    if task_update.status == "completed":
        await create_activity_internal(
            user=user,
            activity_type="task_completed",
            title=f"Completed: {updated_task['title']}",
            description=task_update.completion_note,
            image_url=task_update.evidence_url,
            metadata={"task_id": task_id}
        )
    
    return updated_task


# ============== ACTIVITIES/TIMELINE ENDPOINTS ==============

async def create_activity_internal(user: User, activity_type: str, title: str, description: str = None, image_url: str = None, metadata: dict = None):
    """Internal function to create activities"""
    activity_id = f"activity_{uuid.uuid4().hex[:12]}"
    activity_doc = {
        "activity_id": activity_id,
        "activity_type": activity_type,
        "title": title,
        "description": description,
        "image_url": image_url,
        "metadata": metadata or {},
        "created_by": user.user_id,
        "created_by_name": user.name,
        "created_by_role": user.role,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.activities.insert_one(activity_doc)
    return activity_id

@api_router.get("/activities")
async def get_activities(request: Request, session_token: Optional[str] = Cookie(default=None), limit: int = 50):
    """Get activity timeline - shared across all roles"""
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    activities = await db.activities.find({}, {
        "_id": 0,
        "activity_id": 1,
        "activity_type": 1,
        "title": 1,
        "description": 1,
        "image_url": 1,
        "metadata": 1,
        "created_by": 1,
        "created_by_name": 1,
        "created_at": 1
    }).sort("created_at", -1).to_list(limit)
    return {"activities": activities}

@api_router.post("/activities")
async def create_activity(activity: ActivityCreate, request: Request, session_token: Optional[str] = Cookie(default=None)):
    """Create a new activity entry"""
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    activity_id = await create_activity_internal(
        user=user,
        activity_type=activity.activity_type,
        title=activity.title,
        description=activity.description,
        image_url=activity.image_url,
        metadata=activity.metadata
    )
    
    return {"activity_id": activity_id, "message": "Activity created"}


# ============== VITALS ENDPOINTS ==============

@api_router.get("/vitals")
async def get_vitals(request: Request, session_token: Optional[str] = Cookie(default=None)):
    """Get all vitals - shared across all roles"""
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    vitals = await db.vitals.find({}, {
        "_id": 0,
        "vital_id": 1,
        "vital_type": 1,
        "value": 1,
        "systolic": 1,
        "diastolic": 1,
        "recorded_at": 1,
        "recorded_by": 1,
        "recorded_by_name": 1,
        "notes": 1
    }).sort("recorded_at", -1).to_list(100)
    
    # Group by type
    grouped = {
        "bloodPressure": [],
        "heartRate": [],
        "temperature": [],
        "pain": []
    }
    
    type_map = {
        "bp": "bloodPressure",
        "hr": "heartRate",
        "temp": "temperature",
        "pain": "pain"
    }
    
    for vital in vitals:
        key = type_map.get(vital.get("vital_type"), vital.get("vital_type"))
        if key in grouped:
            grouped[key].append(vital)
    
    return {"vitals": grouped, "all_vitals": vitals}

@api_router.post("/vitals")
async def record_vital(vital: VitalCreate, request: Request, session_token: Optional[str] = Cookie(default=None)):
    """Record a new vital"""
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    vital_id = f"vital_{uuid.uuid4().hex[:12]}"
    vital_doc = {
        "vital_id": vital_id,
        "vital_type": vital.vital_type,
        "value": vital.value,
        "notes": vital.notes,
        "recorded_by": user.user_id,
        "recorded_by_name": user.name,
        "recorded_by_role": user.role,
        "recorded_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.vitals.insert_one(vital_doc)
    
    # Create activity
    type_names = {"bp": "Blood Pressure", "hr": "Heart Rate", "temp": "Temperature", "pain": "Pain Level"}
    await create_activity_internal(
        user=user,
        activity_type="vital_recorded",
        title=f"{type_names.get(vital.vital_type, vital.vital_type)}: {vital.value}",
        description=vital.notes,
        metadata={"vital_id": vital_id, "vital_type": vital.vital_type}
    )
    
    return {"vital_id": vital_id, "message": "Vital recorded"}


# ============== MESSAGES ENDPOINTS ==============

@api_router.get("/messages")
async def get_messages(request: Request, session_token: Optional[str] = Cookie(default=None), limit: int = 50):
    """Get messages - shared across all roles"""
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    messages = await db.messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(limit)
    return {"messages": list(reversed(messages))}

@api_router.post("/messages")
async def send_message(message: MessageCreate, request: Request, session_token: Optional[str] = Cookie(default=None)):
    """Send a message"""
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    message_id = f"msg_{uuid.uuid4().hex[:12]}"
    message_doc = {
        "message_id": message_id,
        "content": message.content,
        "message_type": message.message_type,
        "sender_id": user.user_id,
        "sender_name": user.name,
        "sender_role": user.role,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.messages.insert_one(message_doc)
    
    return {"message_id": message_id, "message": "Message sent"}


# ============== IMAGE UPLOAD ENDPOINT ==============

@api_router.post("/upload/image")
async def upload_image(
    request: Request,
    file: UploadFile = File(...),
    context: str = Form(default="general"),
    session_token: Optional[str] = Cookie(default=None)
):
    """Upload an image and get a URL back"""
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Read file content
    content = await file.read()
    
    # For now, store as base64 data URL (in production, use cloud storage)
    content_type = file.content_type or "image/jpeg"
    base64_data = base64.b64encode(content).decode('utf-8')
    data_url = f"data:{content_type};base64,{base64_data}"
    
    # Store in database
    image_id = f"img_{uuid.uuid4().hex[:12]}"
    image_doc = {
        "image_id": image_id,
        "filename": file.filename,
        "content_type": content_type,
        "data_url": data_url,
        "context": context,
        "uploaded_by": user.user_id,
        "uploaded_by_name": user.name,
        "uploaded_by_role": user.role,
        "uploaded_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.images.insert_one(image_doc)
    
    # Create activity
    await create_activity_internal(
        user=user,
        activity_type="photo_uploaded",
        title=f"Photo uploaded: {file.filename}",
        description=f"Context: {context}",
        image_url=data_url,
        metadata={"image_id": image_id, "context": context}
    )
    
    return {
        "image_id": image_id,
        "url": data_url,
        "message": "Image uploaded successfully"
    }

@api_router.get("/images")
async def get_images(request: Request, session_token: Optional[str] = Cookie(default=None)):
    """Get all uploaded images"""
    user = await get_current_user(request, session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    images = await db.images.find({}, {"_id": 0}).sort("uploaded_at", -1).to_list(100)
    return {"images": images}


# ============== EXISTING ENDPOINTS ==============

@api_router.get("/")
async def root():
    return {"message": "ADLTrack API", "version": "1.0.0"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks


# ============== COPILOT ENDPOINT ==============

@api_router.post("/copilot/chat", response_model=CopilotChatResponse)
async def copilot_chat(request: CopilotChatRequest):
    """AI Copilot chat endpoint"""
    
    if request.role == "caregiver":
        system_message = """You are an AI Care Assistant for caregivers using ADLTrack. 
You help with care-related questions, task guidance, and documentation. 
Be concise, supportive, and focus on practical care advice.
IMPORTANT: Never provide medical diagnosis. For emergencies, always advise calling 911.
Keep responses brief and actionable."""
    else:
        system_message = """You are a Family Care Assistant for ADLTrack. 
You help family members understand their loved one's care plan, explain medical terms simply, 
and provide reassurance about the care being delivered.
Be warm, reassuring, and clear in your explanations.
IMPORTANT: Never provide medical diagnosis. For emergencies, always advise calling 911."""

    if LLM_AVAILABLE:
        try:
            api_key = os.environ.get('EMERGENT_LLM_KEY')
            if not api_key:
                raise ValueError("EMERGENT_LLM_KEY not found")
            
            if request.session_id not in chat_sessions:
                chat = LlmChat(
                    api_key=api_key,
                    session_id=request.session_id,
                    system_message=system_message
                ).with_model("gemini", "gemini-3-flash-preview")
                chat_sessions[request.session_id] = chat
            else:
                chat = chat_sessions[request.session_id]
            
            user_message = UserMessage(text=request.message)
            response = await chat.send_message(user_message)
            
            return CopilotChatResponse(response=response, session_id=request.session_id)
        except Exception as e:
            logger.error(f"Copilot error: {str(e)}")
            return CopilotChatResponse(
                response=get_fallback_response(request.message, request.role),
                session_id=request.session_id
            )
    else:
        return CopilotChatResponse(
            response=get_fallback_response(request.message, request.role),
            session_id=request.session_id
        )

def get_fallback_response(message: str, role: str) -> str:
    """Fallback responses when AI is unavailable"""
    lower_message = message.lower()
    
    if any(word in lower_message for word in ['emergency', '911', 'heart attack', 'not breathing', 'unconscious']):
        return "⚠️ EMERGENCY: If this is a medical emergency, please call 911 immediately."
    
    if role == "caregiver":
        if 'medication' in lower_message:
            return "For medication questions, always refer to the care plan. If unsure, contact the supervising nurse before administering."
        if 'transfer' in lower_message or 'lift' in lower_message:
            return "For safe transfers: 1) Ensure patient is ready, 2) Use proper body mechanics, 3) Use transfer aids when available."
    else:
        if 'how is' in lower_message or 'doing' in lower_message:
            return "Check the Timeline tab for completed tasks and caregiver notes. The Vitals section shows the latest health readings."
    
    return "I'm here to help with care-related questions. For medical emergencies, always call 911."


# Include the router
app.include_router(api_router)

# Root-level health check endpoint for Kubernetes liveness/readiness probes
@app.get("/health")
async def health_check():
    """Health check endpoint for Kubernetes deployment"""
    return {"status": "healthy", "service": "adltrack-api"}

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
