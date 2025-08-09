from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timedelta
import jwt
import bcrypt
import shutil
import json
import asyncio
import io
import base64


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Create uploads directory
UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()
JWT_SECRET = os.environ.get('JWT_SECRET', 'bandlab-secret-key-2025')
JWT_ALGORITHM = 'HS256'

# Authentication Models
class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    display_name: str
    avatar: Optional[str] = None
    followers: int = 0
    following: int = 0
    verified: bool = False
    bio: Optional[str] = None
    location: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    display_name: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None

# Project and Track Models
class AudioClip(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    start_time: float
    duration: float
    file_path: Optional[str] = None
    audio_data: Optional[str] = None  # Base64 encoded audio
    waveform_data: Optional[List[float]] = None
    effects: List[Dict[str, Any]] = []

class Track(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    instrument: str
    volume: float = 75.0
    pan: float = 0.0
    muted: bool = False
    solo: bool = False
    effects: List[Dict[str, Any]] = []
    color: str = "#ef4444"
    clips: List[AudioClip] = []
    is_recording: bool = False

class Project(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    owner_id: str
    collaborators: List[str] = []
    tracks: List[Track] = []
    bpm: int = 120
    time_signature: str = "4/4"
    key: str = "C Major"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_public: bool = False
    tags: List[str] = []
    genre: Optional[str] = None

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_public: bool = False

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    bpm: Optional[int] = None
    time_signature: Optional[str] = None
    key: Optional[str] = None
    is_public: Optional[bool] = None
    tags: Optional[List[str]] = None
    genre: Optional[str] = None

# Audio Effects Models
class EffectParameter(BaseModel):
    name: str
    value: float
    min_value: float = 0.0
    max_value: float = 100.0

class AudioEffect(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: str  # autotune, reverb, delay, compressor, eq, etc
    name: str
    enabled: bool = True
    parameters: List[EffectParameter] = []

# Virtual Instrument Models
class InstrumentPreset(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    instrument_type: str
    parameters: Dict[str, Any] = {}

class VirtualInstrument(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    type: str  # piano, synth, drums, bass, etc
    category: str
    presets: List[InstrumentPreset] = []
    enabled: bool = True

# Sample and Loop Models
class SamplePack(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: Optional[str] = None
    genre: str
    bpm: int
    samples_count: int
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Sample(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    pack_id: str
    file_path: str
    duration: float
    bpm: int
    key: Optional[str] = None
    tags: List[str] = []

# Social Models
class Comment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    project_id: str
    content: str
    timestamp: float = 0.0  # Position in track where comment was made
    created_at: datetime = Field(default_factory=datetime.utcnow)
    likes: int = 0

class Like(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    project_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class Follow(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    follower_id: str
    following_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Collaboration Models
class Collaboration(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str
    user_id: str
    role: str = "collaborator"  # owner, collaborator, viewer
    permissions: List[str] = ["read", "write"]
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Legacy Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

# Authentication Helper Functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_jwt_token(user_id: str) -> str:
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_jwt_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    try:
        user_id = verify_jwt_token(credentials.credentials)
        user = await db.users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user_id
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication")

# Audio Processing Utilities
def encode_audio_to_base64(audio_data: bytes) -> str:
    return base64.b64encode(audio_data).decode('utf-8')

def decode_audio_from_base64(base64_data: str) -> bytes:
    return base64.b64decode(base64_data)

# File handling utilities
async def save_uploaded_file(file: UploadFile) -> str:
    file_id = str(uuid.uuid4())
    file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'wav'
    file_path = UPLOAD_DIR / f"{file_id}.{file_extension}"
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    return str(file_path)

# Initialize default effects and instruments
DEFAULT_EFFECTS = [
    {
        "type": "autotune",
        "name": "Auto-Tune",
        "parameters": [
            {"name": "correction", "value": 50.0, "min_value": 0.0, "max_value": 100.0},
            {"name": "speed", "value": 50.0, "min_value": 0.0, "max_value": 100.0},
            {"name": "key", "value": 0.0, "min_value": -12.0, "max_value": 12.0}
        ]
    },
    {
        "type": "reverb",
        "name": "Reverb",
        "parameters": [
            {"name": "room_size", "value": 30.0, "min_value": 0.0, "max_value": 100.0},
            {"name": "dampening", "value": 50.0, "min_value": 0.0, "max_value": 100.0},
            {"name": "wet_dry", "value": 30.0, "min_value": 0.0, "max_value": 100.0}
        ]
    },
    {
        "type": "delay",
        "name": "Delay",
        "parameters": [
            {"name": "time", "value": 250.0, "min_value": 10.0, "max_value": 2000.0},
            {"name": "feedback", "value": 40.0, "min_value": 0.0, "max_value": 90.0},
            {"name": "wet_dry", "value": 25.0, "min_value": 0.0, "max_value": 100.0}
        ]
    },
    {
        "type": "compressor",
        "name": "Compressor",
        "parameters": [
            {"name": "threshold", "value": -10.0, "min_value": -40.0, "max_value": 0.0},
            {"name": "ratio", "value": 3.0, "min_value": 1.0, "max_value": 20.0},
            {"name": "attack", "value": 3.0, "min_value": 0.1, "max_value": 100.0},
            {"name": "release", "value": 100.0, "min_value": 10.0, "max_value": 1000.0}
        ]
    },
    {
        "type": "eq",
        "name": "3-Band EQ",
        "parameters": [
            {"name": "low_gain", "value": 0.0, "min_value": -15.0, "max_value": 15.0},
            {"name": "mid_gain", "value": 0.0, "min_value": -15.0, "max_value": 15.0},
            {"name": "high_gain", "value": 0.0, "min_value": -15.0, "max_value": 15.0}
        ]
    },
    {
        "type": "chorus",
        "name": "Chorus",
        "parameters": [
            {"name": "rate", "value": 1.0, "min_value": 0.1, "max_value": 10.0},
            {"name": "depth", "value": 50.0, "min_value": 0.0, "max_value": 100.0},
            {"name": "wet_dry", "value": 50.0, "min_value": 0.0, "max_value": 100.0}
        ]
    },
    {
        "type": "distortion",
        "name": "Distortion",
        "parameters": [
            {"name": "drive", "value": 30.0, "min_value": 0.0, "max_value": 100.0},
            {"name": "tone", "value": 50.0, "min_value": 0.0, "max_value": 100.0},
            {"name": "level", "value": 75.0, "min_value": 0.0, "max_value": 100.0}
        ]
    }
]

DEFAULT_INSTRUMENTS = [
    {
        "name": "Grand Piano",
        "type": "piano",
        "category": "Piano",
        "presets": [
            {"name": "Bright Piano", "parameters": {"brightness": 80, "sustain": 60}},
            {"name": "Warm Piano", "parameters": {"brightness": 40, "sustain": 80}}
        ]
    },
    {
        "name": "Analog Synth",
        "type": "synth",
        "category": "Synthesizer",
        "presets": [
            {"name": "Lead Synth", "parameters": {"cutoff": 70, "resonance": 30, "envelope": 50}},
            {"name": "Pad Synth", "parameters": {"cutoff": 40, "resonance": 10, "envelope": 80}}
        ]
    },
    {
        "name": "Drum Kit",
        "type": "drums",
        "category": "Percussion",
        "presets": [
            {"name": "Rock Kit", "parameters": {"kick_punch": 80, "snare_crack": 70}},
            {"name": "Electronic Kit", "parameters": {"kick_punch": 60, "snare_crack": 90}}
        ]
    },
    {
        "name": "Electric Bass",
        "type": "bass",
        "category": "Bass",
        "presets": [
            {"name": "Finger Bass", "parameters": {"tone": 60, "attack": 40}},
            {"name": "Slap Bass", "parameters": {"tone": 80, "attack": 90}}
        ]
    }
]

DEFAULT_SAMPLE_PACKS = [
    {
        "name": "Hip Hop Essentials",
        "description": "Essential hip hop drums and samples",
        "genre": "Hip Hop",
        "bpm": 90,
        "samples_count": 25
    },
    {
        "name": "Electronic Vibes",
        "description": "Modern electronic sounds and loops",
        "genre": "Electronic",
        "bpm": 128,
        "samples_count": 30
    },
    {
        "name": "Lo-Fi Chill",
        "description": "Chill lo-fi beats and textures",
        "genre": "Lo-Fi",
        "bpm": 85,
        "samples_count": 20
    },
    {
        "name": "Trap Beats",
        "description": "Hard-hitting trap drums",
        "genre": "Trap",
        "bpm": 140,
        "samples_count": 15
    }
]
# Authentication Routes
@api_router.post("/auth/register", response_model=Dict[str, Any])
async def register_user(user_data: UserCreate):
    # Check if user already exists
    existing_user = await db.users.find_one({"$or": [{"username": user_data.username}, {"email": user_data.email}]})
    if existing_user:
        raise HTTPException(status_code=400, detail="Username or email already exists")
    
    # Create new user
    hashed_password = hash_password(user_data.password)
    user = User(
        username=user_data.username,
        email=user_data.email,
        display_name=user_data.display_name
    )
    
    # Save to database
    user_dict = user.dict()
    user_dict['password'] = hashed_password
    await db.users.insert_one(user_dict)
    
    # Create JWT token
    token = create_jwt_token(user.id)
    
    return {"user": user.dict(), "token": token}

@api_router.post("/auth/login", response_model=Dict[str, Any])
async def login_user(login_data: UserLogin):
    # Find user
    user = await db.users.find_one({"username": login_data.username})
    if not user or not verify_password(login_data.password, user['password']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create JWT token
    token = create_jwt_token(user['id'])
    
    # Remove password and MongoDB _id from response
    del user['password']
    if '_id' in user:
        del user['_id']
    
    return {"user": user, "token": token}

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user_id: str = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    del user['password']
    if '_id' in user:
        del user['_id']
    return User(**user)

@api_router.put("/auth/me", response_model=User)
async def update_current_user(user_update: UserUpdate, current_user_id: str = Depends(get_current_user)):
    update_data = {k: v for k, v in user_update.dict().items() if v is not None}
    
    if update_data:
        await db.users.update_one({"id": current_user_id}, {"$set": update_data})
    
    user = await db.users.find_one({"id": current_user_id})
    del user['password']
    if '_id' in user:
        del user['_id']
    return User(**user)

# Project Routes
@api_router.post("/projects", response_model=Project)
async def create_project(project_data: ProjectCreate, current_user_id: str = Depends(get_current_user)):
    project = Project(
        name=project_data.name,
        description=project_data.description,
        owner_id=current_user_id,
        is_public=project_data.is_public
    )
    
    await db.projects.insert_one(project.dict())
    return project

@api_router.get("/projects", response_model=List[Project])
async def get_user_projects(current_user_id: str = Depends(get_current_user)):
    projects = await db.projects.find({
        "$or": [
            {"owner_id": current_user_id},
            {"collaborators": current_user_id}
        ]
    }).to_list(100)
    
    return [Project(**project) for project in projects]

@api_router.get("/projects/public", response_model=List[Project])
async def get_public_projects(limit: int = 20):
    projects = await db.projects.find({"is_public": True}).limit(limit).to_list(limit)
    return [Project(**project) for project in projects]

@api_router.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str, current_user_id: str = Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user has access
    if project['owner_id'] != current_user_id and current_user_id not in project.get('collaborators', []) and not project.get('is_public', False):
        raise HTTPException(status_code=403, detail="Access denied")
    
    return Project(**project)

@api_router.put("/projects/{project_id}", response_model=Project)
async def update_project(project_id: str, project_update: ProjectUpdate, current_user_id: str = Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user is owner or collaborator
    if project['owner_id'] != current_user_id and current_user_id not in project.get('collaborators', []):
        raise HTTPException(status_code=403, detail="Access denied")
    
    update_data = {k: v for k, v in project_update.dict().items() if v is not None}
    update_data['updated_at'] = datetime.utcnow()
    
    await db.projects.update_one({"id": project_id}, {"$set": update_data})
    
    updated_project = await db.projects.find_one({"id": project_id})
    return Project(**updated_project)

@api_router.delete("/projects/{project_id}")
async def delete_project(project_id: str, current_user_id: str = Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Only owner can delete
    if project['owner_id'] != current_user_id:
        raise HTTPException(status_code=403, detail="Only owner can delete project")
    
    await db.projects.delete_one({"id": project_id})
    return {"message": "Project deleted successfully"}

# Track Routes
@api_router.post("/projects/{project_id}/tracks", response_model=Track)
async def add_track_to_project(project_id: str, track_data: Dict[str, Any], current_user_id: str = Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check access
    if project['owner_id'] != current_user_id and current_user_id not in project.get('collaborators', []):
        raise HTTPException(status_code=403, detail="Access denied")
    
    track = Track(**track_data)
    
    # Add track to project
    await db.projects.update_one(
        {"id": project_id},
        {"$push": {"tracks": track.dict()}, "$set": {"updated_at": datetime.utcnow()}}
    )
    
    return track

@api_router.put("/projects/{project_id}/tracks/{track_id}", response_model=Track)
async def update_track(project_id: str, track_id: str, track_data: Dict[str, Any], current_user_id: str = Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check access
    if project['owner_id'] != current_user_id and current_user_id not in project.get('collaborators', []):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Update specific track
    tracks = project.get('tracks', [])
    for i, track in enumerate(tracks):
        if track['id'] == track_id:
            tracks[i].update(track_data)
            break
    else:
        raise HTTPException(status_code=404, detail="Track not found")
    
    await db.projects.update_one(
        {"id": project_id},
        {"$set": {"tracks": tracks, "updated_at": datetime.utcnow()}}
    )
    
    updated_track = next(track for track in tracks if track['id'] == track_id)
    return Track(**updated_track)

@api_router.delete("/projects/{project_id}/tracks/{track_id}")
async def delete_track(project_id: str, track_id: str, current_user_id: str = Depends(get_current_user)):
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check access
    if project['owner_id'] != current_user_id and current_user_id not in project.get('collaborators', []):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Remove track
    tracks = [track for track in project.get('tracks', []) if track['id'] != track_id]
    
    await db.projects.update_one(
        {"id": project_id},
        {"$set": {"tracks": tracks, "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Track deleted successfully"}

# Audio Upload Routes
@api_router.post("/audio/upload")
async def upload_audio(
    file: UploadFile = File(...),
    project_id: str = Form(...),
    track_id: str = Form(...),
    current_user_id: str = Depends(get_current_user)
):
    # Validate file type
    if not file.content_type.startswith('audio/'):
        raise HTTPException(status_code=400, detail="File must be an audio file")
    
    # Check project access
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project['owner_id'] != current_user_id and current_user_id not in project.get('collaborators', []):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Save file
    file_path = await save_uploaded_file(file)
    
    # Create audio clip
    clip = AudioClip(
        name=file.filename or "Uploaded Audio",
        start_time=0.0,
        duration=0.0,  # Will be calculated on frontend
        file_path=file_path
    )
    
    return {"clip": clip.dict(), "message": "Audio uploaded successfully"}

# Effects Routes
@api_router.get("/effects", response_model=List[Dict[str, Any]])
async def get_available_effects():
    return DEFAULT_EFFECTS

@api_router.post("/projects/{project_id}/tracks/{track_id}/effects")
async def add_effect_to_track(
    project_id: str,
    track_id: str,
    effect_data: Dict[str, Any],
    current_user_id: str = Depends(get_current_user)
):
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check access
    if project['owner_id'] != current_user_id and current_user_id not in project.get('collaborators', []):
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Find and update track
    tracks = project.get('tracks', [])
    for track in tracks:
        if track['id'] == track_id:
            if 'effects' not in track:
                track['effects'] = []
            track['effects'].append(effect_data)
            break
    else:
        raise HTTPException(status_code=404, detail="Track not found")
    
    await db.projects.update_one(
        {"id": project_id},
        {"$set": {"tracks": tracks, "updated_at": datetime.utcnow()}}
    )
    
    return {"message": "Effect added successfully"}

# Instruments Routes
@api_router.get("/instruments", response_model=List[Dict[str, Any]])
async def get_available_instruments():
    return DEFAULT_INSTRUMENTS

# Sample Packs Routes
@api_router.get("/samples/packs", response_model=List[Dict[str, Any]])
async def get_sample_packs():
    return DEFAULT_SAMPLE_PACKS

# Social Features Routes
@api_router.post("/projects/{project_id}/comments", response_model=Comment)
async def add_comment(
    project_id: str,
    comment_data: Dict[str, Any],
    current_user_id: str = Depends(get_current_user)
):
    # Check if project exists and is accessible
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not project.get('is_public', False) and project['owner_id'] != current_user_id and current_user_id not in project.get('collaborators', []):
        raise HTTPException(status_code=403, detail="Access denied")
    
    comment = Comment(
        user_id=current_user_id,
        project_id=project_id,
        content=comment_data['content'],
        timestamp=comment_data.get('timestamp', 0.0)
    )
    
    await db.comments.insert_one(comment.dict())
    return comment

@api_router.get("/projects/{project_id}/comments", response_model=List[Comment])
async def get_project_comments(project_id: str, current_user_id: str = Depends(get_current_user)):
    # Check project access
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if not project.get('is_public', False) and project['owner_id'] != current_user_id and current_user_id not in project.get('collaborators', []):
        raise HTTPException(status_code=403, detail="Access denied")
    
    comments = await db.comments.find({"project_id": project_id}).to_list(100)
    return [Comment(**comment) for comment in comments]

@api_router.post("/projects/{project_id}/like")
async def like_project(project_id: str, current_user_id: str = Depends(get_current_user)):
    # Check if already liked
    existing_like = await db.likes.find_one({"user_id": current_user_id, "project_id": project_id})
    if existing_like:
        # Unlike
        await db.likes.delete_one({"user_id": current_user_id, "project_id": project_id})
        return {"message": "Project unliked"}
    else:
        # Like
        like = Like(user_id=current_user_id, project_id=project_id)
        await db.likes.insert_one(like.dict())
        return {"message": "Project liked"}

@api_router.get("/projects/{project_id}/likes")
async def get_project_likes(project_id: str):
    likes_count = await db.likes.count_documents({"project_id": project_id})
    return {"count": likes_count}

# Collaboration Routes
@api_router.post("/projects/{project_id}/collaborators")
async def add_collaborator(
    project_id: str,
    collaborator_data: Dict[str, str],
    current_user_id: str = Depends(get_current_user)
):
    project = await db.projects.find_one({"id": project_id})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Only owner can add collaborators
    if project['owner_id'] != current_user_id:
        raise HTTPException(status_code=403, detail="Only owner can add collaborators")
    
    # Find user by username
    username = collaborator_data['username']
    user = await db.users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Add to collaborators
    if user['id'] not in project.get('collaborators', []):
        await db.projects.update_one(
            {"id": project_id},
            {"$push": {"collaborators": user['id']}}
        )
    
    return {"message": f"User {username} added as collaborator"}

# Audio Upload Routes
@api_router.post("/audio/upload")
async def upload_audio_file(
    file: UploadFile = File(...),
    project_id: str = Form(...),
    track_id: str = Form(...),
    current_user_id: str = Depends(get_current_user)
):
    """
    Upload audio file and add it to a project track
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('audio/'):
            raise HTTPException(status_code=400, detail=f"Invalid file type: {file.content_type}")
        
        # Check file size (50MB limit)
        file_size = 0
        file_content = io.BytesIO()
        
        # Read file in chunks to handle large files
        chunk_size = 1024 * 1024  # 1MB chunks
        while True:
            chunk = await file.read(chunk_size)
            if not chunk:
                break
            file_size += len(chunk)
            file_content.write(chunk)
            
            # Check size limit (50MB)
            if file_size > 50 * 1024 * 1024:
                raise HTTPException(status_code=413, detail="File too large (max 50MB)")
        
        file_content.seek(0)
        
        # Verify project exists and user has access
        project = await db.projects.find_one({"id": project_id})
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Check if user is owner or collaborator
        if (project['owner_id'] != current_user_id and 
            current_user_id not in project.get('collaborators', [])):
            raise HTTPException(status_code=403, detail="Access denied")
        
        # Check if track exists in project
        track_exists = any(track['id'] == track_id for track in project.get('tracks', []))
        if not track_exists:
            raise HTTPException(status_code=404, detail="Track not found in project")
        
        # Generate unique filename
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'mp3'
        unique_filename = f"{uuid.uuid4()}.{file_extension}"
        file_path = UPLOAD_DIR / unique_filename
        
        # Save file to disk
        with open(file_path, 'wb') as f:
            f.write(file_content.getvalue())
        
        # Create audio clip data
        clip_data = {
            "id": str(uuid.uuid4()),
            "name": file.filename,
            "file_path": str(file_path),
            "file_size": file_size,
            "duration": 0.0,  # Will be calculated on frontend
            "start_time": 0.0,  # Will be set on frontend
            "track_id": track_id,
            "created_at": datetime.utcnow().isoformat(),
            "file_url": f"/api/audio/file/{unique_filename}"
        }
        
        # Add clip to project track in database
        await db.projects.update_one(
            {"id": project_id, "tracks.id": track_id},
            {"$push": {"tracks.$.clips": clip_data}}
        )
        
        logger.info(f"Audio file uploaded: {file.filename} -> {unique_filename} (Size: {file_size} bytes)")
        
        return {
            "message": "File uploaded successfully",
            "clip": clip_data,
            "file_id": unique_filename
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Audio upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@api_router.get("/audio/file/{file_id}")
async def get_audio_file(file_id: str):
    """
    Serve uploaded audio files
    """
    from fastapi.responses import FileResponse
    
    file_path = UPLOAD_DIR / file_id
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found")
    
    return FileResponse(
        path=str(file_path),
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename={file_id}"}
    )

@api_router.delete("/audio/file/{file_id}")
async def delete_audio_file(file_id: str, current_user_id: str = Depends(get_current_user)):
    """
    Delete uploaded audio file
    """
    file_path = UPLOAD_DIR / file_id
    if file_path.exists():
        file_path.unlink()
    
    # Also remove from any projects (this is a simplified version)
    await db.projects.update_many(
        {},
        {"$pull": {"tracks.$[].clips": {"file_url": f"/api/audio/file/{file_id}"}}}
    )
    
    return {"message": "File deleted successfully"}

# Legacy Routes (for backwards compatibility)
@api_router.get("/")
async def root():
    return {"message": "BandLab DAW API v2.0 - Ready for music creation!"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
