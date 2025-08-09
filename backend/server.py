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
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

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
