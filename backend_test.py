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
        """Test creating a new project"""
        test_name = "Create Project"
        
        if not self.auth_token:
            self.log_result(test_name, False, "No auth token available")
            return False
            
        project_data = {
            "name": f"Test Project {datetime.now().strftime('%Y%m%d_%H%M%S')}",
            "description": "A test project for API validation",
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
        """Test adding a track to a project"""
        test_name = "Add Track to Project"
        
        if not self.auth_token or not self.test_project_id:
            self.log_result(test_name, False, "No auth token or project ID available")
            return False
            
        track_data = {
            "name": "Test Track",
            "instrument": "piano",
            "volume": 80.0,
            "color": "#3b82f6"
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
    success = tester.run_all_tests()
    
    if success:
        print("\n🎉 All tests passed! BandLab DAW API is working correctly.")
        exit(0)
    else:
        print("\n⚠️ Some tests failed. Check the output above for details.")
        exit(1)