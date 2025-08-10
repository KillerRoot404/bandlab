#!/usr/bin/env python3
"""
Debug Audio Upload Integration
Investigate the clip data structure issue found in testing.
"""

import requests
import json
import uuid
from datetime import datetime
import os
import io
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

def debug_audio_upload():
    session = requests.Session()
    
    # Register user
    timestamp = str(int(datetime.now().timestamp()))
    test_data = {
        "username": f"debuguser_{timestamp}",
        "email": f"debuguser_{timestamp}@bandlab.com",
        "password": "DebugTest123!",
        "display_name": f"Debug User {timestamp}"
    }
    
    response = session.post(f"{API_BASE}/auth/register", json=test_data)
    if response.status_code != 200:
        print(f"❌ Failed to register user: {response.text}")
        return
        
    data = response.json()
    auth_token = data['token']
    session.headers.update({'Authorization': f'Bearer {auth_token}'})
    print(f"✅ User registered: {data['user']['username']}")
    
    # Create project
    project_data = {
        "name": f"Debug Project {timestamp}",
        "description": "Debug project for audio upload",
        "is_public": True
    }
    
    response = session.post(f"{API_BASE}/projects", json=project_data)
    if response.status_code != 200:
        print(f"❌ Failed to create project: {response.text}")
        return
        
    data = response.json()
    project_id = data['id']
    print(f"✅ Project created: {data['name']} (ID: {data['id']})")
    
    # Add track to project
    track_data = {
        "name": "Debug Track",
        "instrument": "vocals",
        "volume": 75.0,
        "color": "#ef4444"
    }
    
    response = session.post(f"{API_BASE}/projects/{project_id}/tracks", json=track_data)
    if response.status_code != 200:
        print(f"❌ Failed to create track: {response.text}")
        return
        
    data = response.json()
    track_id = data['id']
    print(f"✅ Track created: {data['name']} (ID: {data['id']})")
    
    # Upload audio file
    wav_data = b'RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x44\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00' + b'\x00' * 1000
    
    files = {'file': ('debug_test.wav', io.BytesIO(wav_data), 'audio/wav')}
    data = {
        'project_id': project_id,
        'track_id': track_id
    }
    
    print("\n🎧 Uploading audio file...")
    response = session.post(f"{API_BASE}/audio/upload", files=files, data=data)
    
    if response.status_code == 200:
        upload_response = response.json()
        print("✅ Upload successful!")
        print("📄 Upload Response:")
        print(json.dumps(upload_response, indent=2))
        
        # Now get the project to see what was actually stored
        print("\n📁 Checking project data after upload...")
        response = session.get(f"{API_BASE}/projects/{project_id}")
        
        if response.status_code == 200:
            project_data = response.json()
            print("📄 Project Data:")
            print(json.dumps(project_data, indent=2))
            
            # Focus on the track clips
            tracks = project_data.get('tracks', [])
            for track in tracks:
                if track['id'] == track_id:
                    print(f"\n🎵 Track '{track['name']}' clips:")
                    clips = track.get('clips', [])
                    if clips:
                        for i, clip in enumerate(clips):
                            print(f"  Clip {i+1}:")
                            print(json.dumps(clip, indent=4))
                    else:
                        print("  No clips found in track")
                    break
        else:
            print(f"❌ Failed to get project: {response.text}")
    else:
        print(f"❌ Upload failed: {response.status_code} - {response.text}")

if __name__ == "__main__":
    debug_audio_upload()