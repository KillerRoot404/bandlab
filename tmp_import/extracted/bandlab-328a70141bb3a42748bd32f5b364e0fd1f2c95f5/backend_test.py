#!/usr/bin/env python3
"""
BandLab DAW Backend API Test Suite
Tests all backend functionality including authentication, projects, tracks, effects, and social features.
"""

import requests
import json
import uuid
from datetime import datetime
import os
import io
import tempfile
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

class BandLabAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_user_id = None
        self.test_project_id = None
        self.test_track_id = None
        self.test_file_id = None
        self.test_results = []
        self.test_username = None
        self.test_password = None
        
    def log_result(self, test_name, success, message="", response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        self.test_results.append({
            'test': test_name,
            'success': success,
            'message': message,
            'response_data': response_data
        })
        
    def set_auth_header(self, token):
        """Set authorization header for authenticated requests"""
        if token:
            self.session.headers.update({'Authorization': f'Bearer {token}'})
        else:
            self.session.headers.pop('Authorization', None)
            
    def test_auth_register(self):
        """Test user registration"""
        test_name = "User Registration"
        
        # Generate unique test data
        timestamp = str(int(datetime.now().timestamp()))
        self.test_username = f"testuser_{timestamp}"
        self.test_password = "SecurePassword123!"
        
        test_data = {
            "username": self.test_username,
            "email": f"test_{timestamp}@bandlab.com",
            "password": self.test_password,
            "display_name": f"Test User {timestamp}"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/register", json=test_data)
            
            if response.status_code == 200:
                data = response.json()
                if 'user' in data and 'token' in data:
                    self.auth_token = data['token']
                    self.test_user_id = data['user']['id']
                    self.set_auth_header(self.auth_token)
                    self.log_result(test_name, True, f"User registered successfully: {data['user']['username']}")
                    return True
                else:
                    self.log_result(test_name, False, "Missing user or token in response", data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_auth_login(self):
        """Test user login with existing credentials"""
        test_name = "User Login"
        
        if not self.test_username or not self.test_password:
            self.log_result(test_name, False, "No test credentials available for login test")
            return False
            
        login_data = {
            "username": self.test_username,
            "password": self.test_password
        }
        
        # Clear auth header to test login
        self.set_auth_header(None)
        
        try:
            response = self.session.post(f"{API_BASE}/auth/login", json=login_data)
            
            if response.status_code == 200:
                data = response.json()
                if 'user' in data and 'token' in data:
                    self.auth_token = data['token']
                    self.set_auth_header(self.auth_token)
                    self.log_result(test_name, True, f"Login successful for user: {data['user']['username']}")
                    return True
                else:
                    self.log_result(test_name, False, "Missing user or token in response", data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_auth_me(self):
        """Test getting current user info"""
        test_name = "Get Current User Info"
        
        if not self.auth_token:
            self.log_result(test_name, False, "No auth token available")
            return False
            
        try:
            response = self.session.get(f"{API_BASE}/auth/me")
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and 'username' in data:
                    self.log_result(test_name, True, f"Retrieved user info: {data['username']}")
                    return True
                else:
                    self.log_result(test_name, False, "Invalid user data structure", data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_create_project(self):
        """Test creating a new project - Studio Test Project"""
        test_name = "Create Project"
        
        if not self.auth_token:
            self.log_result(test_name, False, "No auth token available")
            return False
            
        project_data = {
            "name": "Studio Test Project",
            "description": "BPM/Tracks/Clips flow",
            "is_public": True
        }
        
        try:
            response = self.session.post(f"{API_BASE}/projects", json=project_data)
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and 'name' in data:
                    self.test_project_id = data['id']
                    self.log_result(test_name, True, f"Project created: {data['name']} (ID: {data['id']})")
                    return True
                else:
                    self.log_result(test_name, False, "Invalid project data structure", data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_get_user_projects(self):
        """Test getting user's projects"""
        test_name = "Get User Projects"
        
        if not self.auth_token:
            self.log_result(test_name, False, "No auth token available")
            return False
            
        try:
            response = self.session.get(f"{API_BASE}/projects")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result(test_name, True, f"Retrieved {len(data)} user projects")
                    return True
                else:
                    self.log_result(test_name, False, "Response is not a list", data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_get_public_projects(self):
        """Test getting public projects"""
        test_name = "Get Public Projects"
        
        try:
            response = self.session.get(f"{API_BASE}/projects/public")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result(test_name, True, f"Retrieved {len(data)} public projects")
                    return True
                else:
                    self.log_result(test_name, False, "Response is not a list", data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_get_specific_project(self):
        """Test getting a specific project"""
        test_name = "Get Specific Project"
        
        if not self.auth_token or not self.test_project_id:
            self.log_result(test_name, False, "No auth token or project ID available")
            return False
            
        try:
            response = self.session.get(f"{API_BASE}/projects/{self.test_project_id}")
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and data['id'] == self.test_project_id:
                    self.log_result(test_name, True, f"Retrieved project: {data['name']}")
                    return True
                else:
                    self.log_result(test_name, False, "Project ID mismatch or invalid data", data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_update_project(self):
        """Test updating a project"""
        test_name = "Update Project"
        
        if not self.auth_token or not self.test_project_id:
            self.log_result(test_name, False, "No auth token or project ID available")
            return False
            
        update_data = {
            "description": "Updated test project description",
            "bpm": 128,
            "key": "A Minor"
        }
        
        try:
            response = self.session.put(f"{API_BASE}/projects/{self.test_project_id}", json=update_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('description') == update_data['description']:
                    self.log_result(test_name, True, "Project updated successfully")
                    return True
                else:
                    self.log_result(test_name, False, "Update not reflected in response", data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_add_track_to_project(self):
        """Test adding a track to a project - Track 1 with specific properties"""
        test_name = "Add Track to Project"
        
        if not self.auth_token or not self.test_project_id:
            self.log_result(test_name, False, "No auth token or project ID available")
            return False
            
        track_data = {
            "name": "Track 1",
            "instrument": "Audio",
            "volume": 75,
            "color": "#ef4444"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/projects/{self.test_project_id}/tracks", json=track_data)
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and 'name' in data:
                    self.test_track_id = data['id']
                    self.log_result(test_name, True, f"Track added: {data['name']} (ID: {data['id']})")
                    return True
                else:
                    self.log_result(test_name, False, "Invalid track data structure", data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_update_track(self):
        """Test updating a track"""
        test_name = "Update Track"
        
        if not self.auth_token or not self.test_project_id or not self.test_track_id:
            self.log_result(test_name, False, "Missing required IDs for track update")
            return False
            
        update_data = {
            "volume": 90.0,
            "pan": -10.0,
            "muted": True
        }
        
        try:
            response = self.session.put(f"{API_BASE}/projects/{self.test_project_id}/tracks/{self.test_track_id}", json=update_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('volume') == update_data['volume']:
                    self.log_result(test_name, True, "Track updated successfully")
                    return True
                else:
                    self.log_result(test_name, False, "Update not reflected in response", data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_get_effects(self):
        """Test getting available effects"""
        test_name = "Get Available Effects"
        
        try:
            response = self.session.get(f"{API_BASE}/effects")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    effect_types = [effect.get('type') for effect in data]
                    self.log_result(test_name, True, f"Retrieved {len(data)} effects: {', '.join(effect_types)}")
                    return True
                else:
                    self.log_result(test_name, False, "No effects returned or invalid format", data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_get_instruments(self):
        """Test getting available instruments"""
        test_name = "Get Available Instruments"
        
        try:
            response = self.session.get(f"{API_BASE}/instruments")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    instrument_names = [inst.get('name') for inst in data]
                    self.log_result(test_name, True, f"Retrieved {len(data)} instruments: {', '.join(instrument_names)}")
                    return True
                else:
                    self.log_result(test_name, False, "No instruments returned or invalid format", data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_get_sample_packs(self):
        """Test getting sample packs"""
        test_name = "Get Sample Packs"
        
        try:
            response = self.session.get(f"{API_BASE}/samples/packs")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list) and len(data) > 0:
                    pack_names = [pack.get('name') for pack in data]
                    self.log_result(test_name, True, f"Retrieved {len(data)} sample packs: {', '.join(pack_names)}")
                    return True
                else:
                    self.log_result(test_name, False, "No sample packs returned or invalid format", data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_add_comment(self):
        """Test adding a comment to a project"""
        test_name = "Add Comment to Project"
        
        if not self.auth_token or not self.test_project_id:
            self.log_result(test_name, False, "No auth token or project ID available")
            return False
            
        comment_data = {
            "content": "This is a test comment on the project!",
            "timestamp": 30.5
        }
        
        try:
            response = self.session.post(f"{API_BASE}/projects/{self.test_project_id}/comments", json=comment_data)
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and 'content' in data:
                    self.log_result(test_name, True, f"Comment added: {data['content'][:50]}...")
                    return True
                else:
                    self.log_result(test_name, False, "Invalid comment data structure", data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_get_comments(self):
        """Test getting project comments"""
        test_name = "Get Project Comments"
        
        if not self.auth_token or not self.test_project_id:
            self.log_result(test_name, False, "No auth token or project ID available")
            return False
            
        try:
            response = self.session.get(f"{API_BASE}/projects/{self.test_project_id}/comments")
            
            if response.status_code == 200:
                data = response.json()
                if isinstance(data, list):
                    self.log_result(test_name, True, f"Retrieved {len(data)} comments")
                    return True
                else:
                    self.log_result(test_name, False, "Response is not a list", data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_like_project(self):
        """Test liking a project"""
        test_name = "Like Project"
        
        if not self.auth_token or not self.test_project_id:
            self.log_result(test_name, False, "No auth token or project ID available")
            return False
            
        try:
            response = self.session.post(f"{API_BASE}/projects/{self.test_project_id}/like")
            
            if response.status_code == 200:
                data = response.json()
                if 'message' in data:
                    self.log_result(test_name, True, f"Like action: {data['message']}")
                    return True
                else:
                    self.log_result(test_name, False, "No message in response", data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_delete_track(self):
        """Test deleting a track"""
        test_name = "Delete Track"
        
        if not self.auth_token or not self.test_project_id or not self.test_track_id:
            self.log_result(test_name, False, "Missing required IDs for track deletion")
            return False
            
        try:
            response = self.session.delete(f"{API_BASE}/projects/{self.test_project_id}/tracks/{self.test_track_id}")
            
            if response.status_code == 200:
                data = response.json()
                if 'message' in data:
                    self.log_result(test_name, True, f"Track deleted: {data['message']}")
                    return True
                else:
                    self.log_result(test_name, False, "No message in response", data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_delete_project(self):
        """Test deleting a project"""
        test_name = "Delete Project"
        
        if not self.auth_token or not self.test_project_id:
            self.log_result(test_name, False, "No auth token or project ID available")
            return False
            
        try:
            response = self.session.delete(f"{API_BASE}/projects/{self.test_project_id}")
            
            if response.status_code == 200:
                data = response.json()
                if 'message' in data:
                    self.log_result(test_name, True, f"Project deleted: {data['message']}")
                    return True
                else:
                    self.log_result(test_name, False, "No message in response", data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def create_test_audio_file(self):
        """Create a small test audio file for upload testing"""
        # Create a minimal WAV file (44 bytes header + some data)
        wav_header = b'RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00'
        # Add some audio data (silence)
        audio_data = b'\x00' * 1000  # 1000 bytes of silence
        return wav_header + audio_data
        
    def test_audio_upload(self):
        """Test uploading an audio file"""
        test_name = "Audio Upload"
        
        if not self.auth_token or not self.test_project_id or not self.test_track_id:
            self.log_result(test_name, False, "Missing required IDs for audio upload")
            return False
            
        try:
            # Use real audio file
            audio_file_path = '/app/test_audio.wav'
            
            with open(audio_file_path, 'rb') as audio_file:
                files = {
                    'file': ('test_audio.wav', audio_file, 'audio/wav')
                }
                data = {
                    'project_id': self.test_project_id,
                    'track_id': self.test_track_id
                }
                
                response = self.session.post(f"{API_BASE}/audio/upload", files=files, data=data)
            
            if response.status_code == 200:
                response_data = response.json()
                if 'clip' in response_data and 'file_id' in response_data:
                    clip = response_data['clip']
                    self.test_file_id = response_data['file_id']
                    
                    # Verify response structure matches Studio's usage
                    required_fields = ['id', 'file_url', 'name', 'track_id']
                    missing_fields = [field for field in required_fields if field not in clip]
                    
                    if not missing_fields:
                        self.log_result(test_name, True, f"Audio uploaded successfully: {self.test_file_id}. Clip contains all required fields: {required_fields}")
                        return True
                    else:
                        self.log_result(test_name, False, f"Missing required fields in clip response: {missing_fields}", response_data)
                else:
                    self.log_result(test_name, False, "Missing clip or file_id in response", response_data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_audio_file_serve(self):
        """Test serving uploaded audio files"""
        test_name = "Audio File Serve"
        
        if not self.test_file_id:
            self.log_result(test_name, False, "No file ID available for serving test")
            return False
            
        try:
            response = self.session.get(f"{API_BASE}/audio/file/{self.test_file_id}")
            
            if response.status_code == 200:
                # Check if we got file content
                if len(response.content) > 0:
                    self.log_result(test_name, True, f"Audio file served successfully ({len(response.content)} bytes)")
                    return True
                else:
                    self.log_result(test_name, False, "Empty file content received")
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_audio_upload_validation(self):
        """Test audio upload validation (file type, size limits)"""
        test_name = "Audio Upload Validation"
        
        if not self.auth_token or not self.test_project_id or not self.test_track_id:
            self.log_result(test_name, False, "Missing required IDs for validation test")
            return False
            
        try:
            # Test with invalid file type (text file)
            invalid_file_data = b"This is not an audio file"
            files = {
                'file': ('test.txt', io.BytesIO(invalid_file_data), 'text/plain')
            }
            data = {
                'project_id': self.test_project_id,
                'track_id': self.test_track_id
            }
            
            response = self.session.post(f"{API_BASE}/audio/upload", files=files, data=data)
            
            if response.status_code == 400:
                self.log_result(test_name, True, "Correctly rejected invalid file type")
                return True
            else:
                self.log_result(test_name, False, f"Expected 400 for invalid file type, got {response.status_code}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_audio_delete(self):
        """Test deleting uploaded audio files"""
        test_name = "Audio File Delete"
        
        if not self.auth_token or not self.test_file_id:
            self.log_result(test_name, False, "No auth token or file ID available")
            return False
            
        try:
            response = self.session.delete(f"{API_BASE}/audio/file/{self.test_file_id}")
            
            if response.status_code == 200:
                response_data = response.json()
                if 'message' in response_data:
                    self.log_result(test_name, True, f"Audio file deleted: {response_data['message']}")
                    return True
                else:
                    self.log_result(test_name, False, "No message in response", response_data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_update_project_bpm(self):
        """Test updating project BPM - Studio syncs BPM both ways"""
        test_name = "Update Project BPM"
        
        if not self.auth_token or not self.test_project_id:
            self.log_result(test_name, False, "No auth token or project ID available")
            return False
            
        update_data = {
            "bpm": 130
        }
        
        try:
            response = self.session.put(f"{API_BASE}/projects/{self.test_project_id}", json=update_data)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('bpm') == 130:
                    self.log_result(test_name, True, f"Project BPM updated to {data['bpm']}")
                    return True
                else:
                    self.log_result(test_name, False, f"BPM not updated correctly. Expected 130, got {data.get('bpm')}", data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_verify_project_bpm(self):
        """Test verifying project BPM persists"""
        test_name = "Verify Project BPM Persistence"
        
        if not self.auth_token or not self.test_project_id:
            self.log_result(test_name, False, "No auth token or project ID available")
            return False
            
        try:
            response = self.session.get(f"{API_BASE}/projects/{self.test_project_id}")
            
            if response.status_code == 200:
                data = response.json()
                if data.get('bpm') == 130:
                    self.log_result(test_name, True, f"Project BPM correctly persisted as {data['bpm']}")
                    return True
                else:
                    self.log_result(test_name, False, f"BPM not persisted correctly. Expected 130, got {data.get('bpm')}", data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_persist_clip_list_on_track(self):
        """Test persisting clip list on a track - new Studio flow"""
        test_name = "Persist Clip List on Track"
        
        if not self.auth_token or not self.test_project_id or not self.test_track_id or not self.test_file_id:
            self.log_result(test_name, False, "Missing required IDs for clip persistence test")
            return False
            
        # Create clip data as Studio would send it
        clip_id = str(uuid.uuid4())
        clip_data = {
            "clips": [
                {
                    "id": clip_id,
                    "name": "test_audio.wav",
                    "start_time": 0,
                    "duration": 2.0,
                    "track_id": self.test_track_id,
                    "file_url": f"/api/audio/file/{self.test_file_id}",
                    "type": "uploaded"
                }
            ]
        }
        
        try:
            response = self.session.put(f"{API_BASE}/projects/{self.test_project_id}/tracks/{self.test_track_id}", json=clip_data)
            
            if response.status_code == 200:
                data = response.json()
                print(f"  📋 Track update response: {json.dumps(data, indent=2)}")
                
                if 'clips' in data and len(data['clips']) > 0:
                    clip = data['clips'][0]
                    print(f"  📋 First clip data: {json.dumps(clip, indent=2)}")
                    
                    # Check if all required fields are present
                    required_fields = ['id', 'name', 'start_time', 'duration', 'track_id', 'file_url', 'type']
                    missing_fields = [field for field in required_fields if field not in clip]
                    
                    if not missing_fields:
                        self.log_result(test_name, True, f"Clip list persisted successfully with {len(data['clips'])} clips. All required fields present.")
                        return True
                    else:
                        self.log_result(test_name, False, f"Missing fields in persisted clip: {missing_fields}", data)
                else:
                    self.log_result(test_name, False, "No clips found in track after update", data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_verify_clip_persistence(self):
        """Test verifying clip persistence by getting project"""
        test_name = "Verify Clip Persistence"
        
        if not self.auth_token or not self.test_project_id:
            self.log_result(test_name, False, "No auth token or project ID available")
            return False
            
        try:
            response = self.session.get(f"{API_BASE}/projects/{self.test_project_id}")
            
            if response.status_code == 200:
                data = response.json()
                tracks = data.get('tracks', [])
                target_track = None
                for track in tracks:
                    if track['id'] == self.test_track_id:
                        target_track = track
                        break
                
                if target_track and 'clips' in target_track and len(target_track['clips']) > 0:
                    clip = target_track['clips'][0]
                    if (clip.get('name') == 'test_audio.wav' and 
                        clip.get('track_id') == self.test_track_id and
                        clip.get('type') == 'uploaded'):
                        self.log_result(test_name, True, f"Clip persistence verified - track contains {len(target_track['clips'])} clips")
                        return True
                    else:
                        self.log_result(test_name, False, "Clip data not correctly persisted in project", target_track)
                else:
                    self.log_result(test_name, False, "No clips found in track when retrieving project", data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_delete_clip_by_updating_clips_array(self):
        """Test deleting a clip by updating the clips array - Studio's delete now persists"""
        test_name = "Delete Clip by Updating Clips Array"
        
        if not self.auth_token or not self.test_project_id or not self.test_track_id:
            self.log_result(test_name, False, "Missing required IDs for clip deletion test")
            return False
            
        # Update track with empty clips array
        update_data = {
            "clips": []
        }
        
        try:
            response = self.session.put(f"{API_BASE}/projects/{self.test_project_id}/tracks/{self.test_track_id}", json=update_data)
            
            if response.status_code == 200:
                data = response.json()
                if 'clips' in data and len(data['clips']) == 0:
                    self.log_result(test_name, True, "Clip successfully deleted by updating clips array to empty")
                    return True
                else:
                    self.log_result(test_name, False, f"Clips array not emptied. Found {len(data.get('clips', []))} clips", data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_verify_clip_deletion_final(self):
        """Test verifying clip deletion by getting project"""
        test_name = "Verify Clip Deletion Final"
        
        if not self.auth_token or not self.test_project_id:
            self.log_result(test_name, False, "No auth token or project ID available")
            return False
            
        try:
            response = self.session.get(f"{API_BASE}/projects/{self.test_project_id}")
            
            if response.status_code == 200:
                data = response.json()
                tracks = data.get('tracks', [])
                target_track = None
                for track in tracks:
                    if track['id'] == self.test_track_id:
                        target_track = track
                        break
                
                if target_track and len(target_track.get('clips', [])) == 0:
                    self.log_result(test_name, True, "Clip deletion verified - track.clips array is empty")
                    return True
                else:
                    clip_count = len(target_track.get('clips', [])) if target_track else 0
                    self.log_result(test_name, False, f"Clip deletion not verified - track still has {clip_count} clips", target_track)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_negative_checks(self):
        """Test negative scenarios - unauthorized access and invalid files"""
        test_name = "Negative Checks"
        
        success_count = 0
        total_checks = 0
        
        # Test 1: Try updating clips without auth
        total_checks += 1
        try:
            self.set_auth_header(None)  # Remove auth
            update_data = {"clips": []}
            response = self.session.put(f"{API_BASE}/projects/{self.test_project_id}/tracks/{self.test_track_id}", json=update_data)
            
            if response.status_code in [401, 403]:
                print(f"  ✅ Unauthorized clip update correctly rejected with {response.status_code}")
                success_count += 1
            else:
                print(f"  ❌ Expected 401/403 for unauthorized clip update, got {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ Exception in unauthorized test: {str(e)}")
            
        # Restore auth for remaining tests
        self.set_auth_header(self.auth_token)
        
        # Test 2: Try uploading non-audio file
        total_checks += 1
        try:
            invalid_file_data = b"This is not an audio file - it's just text"
            files = {
                'file': ('test.txt', io.BytesIO(invalid_file_data), 'text/plain')
            }
            data = {
                'project_id': self.test_project_id,
                'track_id': self.test_track_id
            }
            
            response = self.session.post(f"{API_BASE}/audio/upload", files=files, data=data)
            
            if response.status_code == 400:
                print(f"  ✅ Non-audio file correctly rejected with 400")
                success_count += 1
            else:
                print(f"  ❌ Expected 400 for non-audio file, got {response.status_code}")
                
        except Exception as e:
            print(f"  ❌ Exception in file validation test: {str(e)}")
            
        if success_count == total_checks:
            self.log_result(test_name, True, f"All {total_checks} negative checks passed")
            return True
        else:
            self.log_result(test_name, False, f"Only {success_count}/{total_checks} negative checks passed")
            return False
        
    def run_studio_integration_tests(self):
        """Run Studio page integration tests as specified in review request"""
        print(f"\n🎵 Starting Studio Page Integration Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        print("=" * 60)
        
        # 1) Auth
        print("\n🔐 1) Authentication Flow")
        if not self.test_auth_register():
            return False
        if not self.test_auth_login():
            return False
        
        # 2) Create project and load
        print("\n📁 2) Create Project and Load")
        if not self.test_create_project():
            return False
        if not self.test_get_user_projects():
            return False
        
        # 3) Add track and verify
        print("\n🎵 3) Add Track and Verify")
        if not self.test_add_track_to_project():
            return False
        if not self.test_get_specific_project():
            return False
        
        # 4) Update BPM on project
        print("\n🎼 4) Update BPM on Project")
        if not self.test_update_project_bpm():
            return False
        if not self.test_verify_project_bpm():
            return False
        
        # 5) Audio upload contract
        print("\n🎧 5) Audio Upload Contract")
        if not self.test_audio_upload():
            return False
        if not self.test_audio_file_serve():
            return False
        
        # 6) Persist clip list on a track
        print("\n💾 6) Persist Clip List on Track")
        if not self.test_persist_clip_list_on_track():
            return False
        if not self.test_verify_clip_persistence():
            return False
        
        # 7) Delete a clip by updating clips array
        print("\n🗑️ 7) Delete Clip by Updating Clips Array")
        if not self.test_delete_clip_by_updating_clips_array():
            return False
        if not self.test_verify_clip_deletion_final():
            return False
        
        # 8) Negative checks
        print("\n⚠️ 8) Negative Checks")
        if not self.test_negative_checks():
            return False
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 STUDIO INTEGRATION TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if total - passed > 0:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['message']}")
        
        return passed == total
        
    def run_all_tests(self):
        """Run all API tests in sequence"""
        print(f"\n🎵 Starting BandLab DAW API Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        print("=" * 60)
        
        # Authentication Tests
        print("\n🔐 Authentication Tests")
        self.test_auth_register()
        self.test_auth_login()
        self.test_auth_me()
        
        # Project Tests
        print("\n📁 Project Management Tests")
        self.test_create_project()
        self.test_get_user_projects()
        self.test_get_public_projects()
        self.test_get_specific_project()
        self.test_update_project()
        
        # Track Tests
        print("\n🎵 Track Management Tests")
        self.test_add_track_to_project()
        self.test_update_track()
        
        # Audio Upload Tests
        print("\n🎧 Audio Upload Tests")
        self.test_audio_upload()
        self.test_audio_file_serve()
        self.test_audio_upload_validation()
        self.test_audio_delete()
        
        # Effects and Instruments Tests
        print("\n🎛️ Effects and Instruments Tests")
        self.test_get_effects()
        self.test_get_instruments()
        self.test_get_sample_packs()
        
        # Social Features Tests
        print("\n💬 Social Features Tests")
        self.test_add_comment()
        self.test_get_comments()
        self.test_like_project()
        
        # Cleanup Tests
        print("\n🗑️ Cleanup Tests")
        self.test_delete_track()
        self.test_delete_project()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result['success'])
        total = len(self.test_results)
        
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if total - passed > 0:
            print("\n❌ Failed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  - {result['test']}: {result['message']}")
        
        return passed == total

if __name__ == "__main__":
    tester = BandLabAPITester()
    
    # Run Studio integration tests as specified in review request
    success = tester.run_studio_integration_tests()
    
    if success:
        print("\n🎉 All Studio integration tests passed! Backend is ready for Studio page.")
        exit(0)
    else:
        print("\n⚠️ Some Studio integration tests failed. Check the output above for details.")
        exit(1)