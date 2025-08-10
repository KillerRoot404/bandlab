#!/usr/bin/env python3
"""
Final Audio System Verification
Complete verification of all audio-related functionality for user issue resolution.
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

def final_audio_verification():
    print("🎧 FINAL AUDIO SYSTEM VERIFICATION")
    print("=" * 60)
    print(f"Backend URL: {BACKEND_URL}")
    print(f"API Base: {API_BASE}")
    print("=" * 60)
    
    session = requests.Session()
    
    # 1. Test API Health
    print("\n1️⃣ API Health Check")
    try:
        response = session.get(f"{API_BASE}/")
        if response.status_code == 200:
            print("✅ API is responding correctly")
        else:
            print(f"❌ API health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ API connection failed: {str(e)}")
        return False
    
    # 2. Authentication Flow
    print("\n2️⃣ Authentication System")
    timestamp = str(int(datetime.now().timestamp()))
    
    # Register
    user_data = {
        "username": f"finaltest_{timestamp}",
        "email": f"finaltest_{timestamp}@bandlab.com",
        "password": "FinalTest123!",
        "display_name": f"Final Test User {timestamp}"
    }
    
    response = session.post(f"{API_BASE}/auth/register", json=user_data)
    if response.status_code != 200:
        print(f"❌ Registration failed: {response.text}")
        return False
    
    auth_data = response.json()
    token = auth_data['token']
    session.headers.update({'Authorization': f'Bearer {token}'})
    print(f"✅ User registered and authenticated: {auth_data['user']['username']}")
    
    # 3. Project Setup
    print("\n3️⃣ Project Management")
    project_data = {
        "name": f"Final Audio Test {timestamp}",
        "description": "Final verification project",
        "is_public": True
    }
    
    response = session.post(f"{API_BASE}/projects", json=project_data)
    if response.status_code != 200:
        print(f"❌ Project creation failed: {response.text}")
        return False
    
    project = response.json()
    project_id = project['id']
    print(f"✅ Project created: {project['name']}")
    
    # 4. Track Setup
    print("\n4️⃣ Track Management")
    track_data = {
        "name": "Vocal Track",
        "instrument": "vocals",
        "volume": 80.0,
        "color": "#ef4444"
    }
    
    response = session.post(f"{API_BASE}/projects/{project_id}/tracks", json=track_data)
    if response.status_code != 200:
        print(f"❌ Track creation failed: {response.text}")
        return False
    
    track = response.json()
    track_id = track['id']
    print(f"✅ Track created: {track['name']}")
    
    # 5. Audio Upload - Multiple Formats
    print("\n5️⃣ Audio Upload System")
    
    # Test WAV upload
    wav_data = b'RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x44\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00' + b'\x00' * 2000
    files = {'file': ('final_test.wav', io.BytesIO(wav_data), 'audio/wav')}
    data = {'project_id': project_id, 'track_id': track_id}
    
    response = session.post(f"{API_BASE}/audio/upload", files=files, data=data)
    if response.status_code != 200:
        print(f"❌ WAV upload failed: {response.text}")
        return False
    
    upload_result = response.json()
    file_id = upload_result['file_id']
    clip_data = upload_result['clip']
    
    print(f"✅ WAV file uploaded successfully")
    print(f"   File ID: {file_id}")
    print(f"   Clip ID: {clip_data['id']}")
    print(f"   File URL: {clip_data['file_url']}")
    print(f"   Track ID: {clip_data['track_id']}")
    
    # 6. File Serving
    print("\n6️⃣ Audio File Serving")
    response = session.get(f"{API_BASE}/audio/file/{file_id}")
    if response.status_code != 200:
        print(f"❌ File serving failed: {response.status_code}")
        return False
    
    content_type = response.headers.get('content-type', '')
    content_length = len(response.content)
    print(f"✅ File served successfully")
    print(f"   Content-Type: {content_type}")
    print(f"   Content-Length: {content_length} bytes")
    
    # 7. Project Integration Verification
    print("\n7️⃣ Project Integration")
    response = session.get(f"{API_BASE}/projects/{project_id}")
    if response.status_code != 200:
        print(f"❌ Project retrieval failed: {response.status_code}")
        return False
    
    project_data = response.json()
    tracks = project_data.get('tracks', [])
    
    # Find our track and verify clips
    target_track = None
    for track in tracks:
        if track['id'] == track_id:
            target_track = track
            break
    
    if not target_track:
        print("❌ Track not found in project")
        return False
    
    clips = target_track.get('clips', [])
    if not clips:
        print("❌ No clips found in track")
        return False
    
    clip = clips[0]
    required_fields = ['id', 'name', 'file_url', 'track_id', 'file_path']
    missing_fields = [field for field in required_fields if field not in clip]
    
    if missing_fields:
        print(f"❌ Clip missing required fields: {missing_fields}")
        return False
    
    print(f"✅ Audio clip properly integrated into track")
    print(f"   Clip Name: {clip['name']}")
    print(f"   File URL: {clip['file_url']}")
    print(f"   Track ID: {clip['track_id']}")
    
    # 8. Essential DAW APIs
    print("\n8️⃣ Essential DAW APIs")
    
    # Effects
    response = session.get(f"{API_BASE}/effects")
    if response.status_code == 200:
        effects = response.json()
        print(f"✅ Effects API: {len(effects)} effects available")
    else:
        print(f"❌ Effects API failed: {response.status_code}")
        return False
    
    # Instruments
    response = session.get(f"{API_BASE}/instruments")
    if response.status_code == 200:
        instruments = response.json()
        print(f"✅ Instruments API: {len(instruments)} instruments available")
    else:
        print(f"❌ Instruments API failed: {response.status_code}")
        return False
    
    # Sample Packs
    response = session.get(f"{API_BASE}/samples/packs")
    if response.status_code == 200:
        packs = response.json()
        print(f"✅ Sample Packs API: {len(packs)} sample packs available")
    else:
        print(f"❌ Sample Packs API failed: {response.status_code}")
        return False
    
    # 9. File Cleanup
    print("\n9️⃣ File Cleanup")
    response = session.delete(f"{API_BASE}/audio/file/{file_id}")
    if response.status_code == 200:
        print("✅ File cleanup successful")
    else:
        print(f"❌ File cleanup failed: {response.status_code}")
        return False
    
    # Verify file is gone
    response = session.get(f"{API_BASE}/audio/file/{file_id}")
    if response.status_code == 404:
        print("✅ File properly removed (404 confirmed)")
    else:
        print(f"❌ File still accessible after deletion: {response.status_code}")
        return False
    
    print("\n" + "=" * 60)
    print("🎉 FINAL VERIFICATION COMPLETE")
    print("=" * 60)
    print("✅ All audio upload functionality working correctly")
    print("✅ File serving operational")
    print("✅ Project integration working")
    print("✅ Authentication system functional")
    print("✅ Essential DAW APIs operational")
    print("✅ File cleanup working")
    print("\n🎵 Backend is ready for audio production!")
    
    return True

if __name__ == "__main__":
    success = final_audio_verification()
    if success:
        print("\n🎉 All systems operational!")
        exit(0)
    else:
        print("\n⚠️ Issues found during verification.")
        exit(1)