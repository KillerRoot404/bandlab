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

# Add your routes to the router instead of directly to app
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
