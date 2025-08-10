#!/usr/bin/env python3
"""
Detailed Audio Upload Test Suite
Focused testing for audio upload functionality that user is reporting issues with.
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

class AudioUploadDetailedTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_user_id = None
        self.test_project_id = None
        self.test_track_id = None
        self.test_results = []
        
    def log_result(self, test_name, success, message="", response_data=None):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if response_data and not success:
            print(f"   Response: {json.dumps(response_data, indent=2)}")
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
            
    def setup_test_environment(self):
        """Setup user, project, and track for testing"""
        print("🔧 Setting up test environment...")
        
        # Register user
        timestamp = str(int(datetime.now().timestamp()))
        test_data = {
            "username": f"audiotest_{timestamp}",
            "email": f"audiotest_{timestamp}@bandlab.com",
            "password": "AudioTest123!",
            "display_name": f"Audio Test User {timestamp}"
        }
        
        response = self.session.post(f"{API_BASE}/auth/register", json=test_data)
        if response.status_code != 200:
            print(f"❌ Failed to register user: {response.text}")
            return False
            
        data = response.json()
        self.auth_token = data['token']
        self.test_user_id = data['user']['id']
        self.set_auth_header(self.auth_token)
        print(f"✅ User registered: {data['user']['username']}")
        
        # Create project
        project_data = {
            "name": f"Audio Test Project {timestamp}",
            "description": "Project for testing audio upload functionality",
            "is_public": True
        }
        
        response = self.session.post(f"{API_BASE}/projects", json=project_data)
        if response.status_code != 200:
            print(f"❌ Failed to create project: {response.text}")
            return False
            
        data = response.json()
        self.test_project_id = data['id']
        print(f"✅ Project created: {data['name']} (ID: {data['id']})")
        
        # Add track to project
        track_data = {
            "name": "Audio Upload Track",
            "instrument": "vocals",
            "volume": 75.0,
            "color": "#ef4444"
        }
        
        response = self.session.post(f"{API_BASE}/projects/{self.test_project_id}/tracks", json=track_data)
        if response.status_code != 200:
            print(f"❌ Failed to create track: {response.text}")
            return False
            
        data = response.json()
        self.test_track_id = data['id']
        print(f"✅ Track created: {data['name']} (ID: {data['id']})")
        
        return True
        
    def create_realistic_audio_files(self):
        """Create realistic test audio files in different formats"""
        audio_files = {}
        
        # WAV file (minimal but valid)
        wav_header = b'RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x44\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00'
        wav_data = b'\x00' * 1000  # 1000 bytes of silence
        audio_files['test_audio.wav'] = ('audio/wav', wav_header + wav_data)
        
        # MP3 file (minimal but valid header)
        mp3_header = b'\xff\xfb\x90\x00'  # MP3 frame header
        mp3_data = b'\x00' * 1000
        audio_files['test_audio.mp3'] = ('audio/mpeg', mp3_header + mp3_data)
        
        # OGG file (minimal header)
        ogg_header = b'OggS\x00\x02\x00\x00\x00\x00\x00\x00\x00\x00'
        ogg_data = b'\x00' * 1000
        audio_files['test_audio.ogg'] = ('audio/ogg', ogg_header + ogg_data)
        
        return audio_files
        
    def test_audio_upload_comprehensive(self):
        """Comprehensive audio upload testing with multiple formats"""
        print("\n🎧 COMPREHENSIVE AUDIO UPLOAD TESTING")
        print("=" * 50)
        
        audio_files = self.create_realistic_audio_files()
        uploaded_files = []
        
        for filename, (content_type, file_data) in audio_files.items():
            test_name = f"Audio Upload - {filename}"
            
            try:
                files = {
                    'file': (filename, io.BytesIO(file_data), content_type)
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
                        file_id = response_data['file_id']
                        uploaded_files.append(file_id)
                        
                        # Verify clip structure
                        required_fields = ['id', 'name', 'file_url', 'track_id']
                        missing_fields = [field for field in required_fields if field not in clip]
                        
                        if not missing_fields:
                            self.log_result(test_name, True, 
                                f"Upload successful - File ID: {file_id}, Clip ID: {clip['id']}, URL: {clip['file_url']}")
                        else:
                            self.log_result(test_name, False, 
                                f"Missing required fields in clip: {missing_fields}", response_data)
                    else:
                        self.log_result(test_name, False, "Missing clip or file_id in response", response_data)
                else:
                    self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result(test_name, False, f"Exception: {str(e)}")
                
        return uploaded_files
        
    def test_audio_file_serving_comprehensive(self, uploaded_files):
        """Test serving all uploaded audio files"""
        print("\n📁 COMPREHENSIVE AUDIO FILE SERVING")
        print("=" * 50)
        
        for file_id in uploaded_files:
            test_name = f"Audio File Serve - {file_id}"
            
            try:
                response = self.session.get(f"{API_BASE}/audio/file/{file_id}")
                
                if response.status_code == 200:
                    content_type = response.headers.get('content-type', '')
                    content_length = len(response.content)
                    
                    if content_type.startswith('audio/') and content_length > 0:
                        self.log_result(test_name, True, 
                            f"File served correctly - Type: {content_type}, Size: {content_length} bytes")
                    else:
                        self.log_result(test_name, False, 
                            f"Invalid content type or empty file - Type: {content_type}, Size: {content_length}")
                else:
                    self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                    
            except Exception as e:
                self.log_result(test_name, False, f"Exception: {str(e)}")
                
    def test_project_track_integration(self):
        """Test that uploaded audio is properly integrated into project tracks"""
        test_name = "Project Track Integration"
        
        try:
            # Get the project to verify clips were added to tracks
            response = self.session.get(f"{API_BASE}/projects/{self.test_project_id}")
            
            if response.status_code == 200:
                project_data = response.json()
                tracks = project_data.get('tracks', [])
                
                # Find our test track
                test_track = None
                for track in tracks:
                    if track['id'] == self.test_track_id:
                        test_track = track
                        break
                        
                if test_track:
                    clips = test_track.get('clips', [])
                    if len(clips) > 0:
                        # Verify clip structure
                        clip = clips[0]
                        required_fields = ['id', 'name', 'file_url', 'track_id']
                        missing_fields = [field for field in required_fields if field not in clip]
                        
                        if not missing_fields:
                            self.log_result(test_name, True, 
                                f"Audio clips properly integrated - Found {len(clips)} clips in track")
                        else:
                            self.log_result(test_name, False, 
                                f"Clip missing required fields: {missing_fields}")
                    else:
                        self.log_result(test_name, False, "No clips found in track after upload")
                else:
                    self.log_result(test_name, False, "Test track not found in project")
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
    def test_audio_upload_edge_cases(self):
        """Test edge cases for audio upload"""
        print("\n⚠️ AUDIO UPLOAD EDGE CASES")
        print("=" * 50)
        
        # Test 1: Missing project_id
        test_name = "Upload Missing Project ID"
        try:
            files = {'file': ('test.wav', io.BytesIO(b'RIFF\x24\x00\x00\x00WAVE'), 'audio/wav')}
            data = {'track_id': self.test_track_id}
            
            response = self.session.post(f"{API_BASE}/audio/upload", files=files, data=data)
            if response.status_code == 422:  # Validation error
                self.log_result(test_name, True, "Correctly rejected missing project_id")
            else:
                self.log_result(test_name, False, f"Expected 422, got {response.status_code}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        # Test 2: Missing track_id
        test_name = "Upload Missing Track ID"
        try:
            files = {'file': ('test.wav', io.BytesIO(b'RIFF\x24\x00\x00\x00WAVE'), 'audio/wav')}
            data = {'project_id': self.test_project_id}
            
            response = self.session.post(f"{API_BASE}/audio/upload", files=files, data=data)
            if response.status_code == 422:  # Validation error
                self.log_result(test_name, True, "Correctly rejected missing track_id")
            else:
                self.log_result(test_name, False, f"Expected 422, got {response.status_code}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        # Test 3: Invalid project_id
        test_name = "Upload Invalid Project ID"
        try:
            files = {'file': ('test.wav', io.BytesIO(b'RIFF\x24\x00\x00\x00WAVE'), 'audio/wav')}
            data = {
                'project_id': 'invalid-project-id',
                'track_id': self.test_track_id
            }
            
            response = self.session.post(f"{API_BASE}/audio/upload", files=files, data=data)
            if response.status_code == 404:
                self.log_result(test_name, True, "Correctly rejected invalid project_id")
            else:
                self.log_result(test_name, False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        # Test 4: Invalid track_id
        test_name = "Upload Invalid Track ID"
        try:
            files = {'file': ('test.wav', io.BytesIO(b'RIFF\x24\x00\x00\x00WAVE'), 'audio/wav')}
            data = {
                'project_id': self.test_project_id,
                'track_id': 'invalid-track-id'
            }
            
            response = self.session.post(f"{API_BASE}/audio/upload", files=files, data=data)
            if response.status_code == 404:
                self.log_result(test_name, True, "Correctly rejected invalid track_id")
            else:
                self.log_result(test_name, False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        # Test 5: No authentication
        test_name = "Upload Without Authentication"
        try:
            # Temporarily remove auth header
            original_auth = self.session.headers.get('Authorization')
            self.set_auth_header(None)
            
            files = {'file': ('test.wav', io.BytesIO(b'RIFF\x24\x00\x00\x00WAVE'), 'audio/wav')}
            data = {
                'project_id': self.test_project_id,
                'track_id': self.test_track_id
            }
            
            response = self.session.post(f"{API_BASE}/audio/upload", files=files, data=data)
            
            # Restore auth header
            if original_auth:
                self.session.headers['Authorization'] = original_auth
                
            if response.status_code == 403:
                self.log_result(test_name, True, "Correctly rejected unauthenticated request")
            else:
                self.log_result(test_name, False, f"Expected 403, got {response.status_code}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
    def test_audio_formats_validation(self):
        """Test various audio formats and invalid files"""
        print("\n🎵 AUDIO FORMAT VALIDATION")
        print("=" * 50)
        
        # Valid audio formats
        valid_formats = [
            ('test.wav', 'audio/wav', b'RIFF\x24\x00\x00\x00WAVE'),
            ('test.mp3', 'audio/mpeg', b'\xff\xfb\x90\x00'),
            ('test.ogg', 'audio/ogg', b'OggS\x00\x02'),
            ('test.m4a', 'audio/mp4', b'ftypM4A '),
        ]
        
        for filename, content_type, file_data in valid_formats:
            test_name = f"Valid Format - {filename}"
            try:
                files = {'file': (filename, io.BytesIO(file_data + b'\x00' * 1000), content_type)}
                data = {
                    'project_id': self.test_project_id,
                    'track_id': self.test_track_id
                }
                
                response = self.session.post(f"{API_BASE}/audio/upload", files=files, data=data)
                
                if response.status_code == 200:
                    self.log_result(test_name, True, f"Accepted {content_type} format")
                else:
                    self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
            except Exception as e:
                self.log_result(test_name, False, f"Exception: {str(e)}")
                
        # Invalid formats
        invalid_formats = [
            ('test.txt', 'text/plain', b'This is not audio'),
            ('test.jpg', 'image/jpeg', b'\xff\xd8\xff\xe0'),
            ('test.pdf', 'application/pdf', b'%PDF-1.4'),
            ('test.mp4', 'video/mp4', b'ftypmp4'),
            ('test.js', 'application/javascript', b'console.log("test")'),
        ]
        
        for filename, content_type, file_data in invalid_formats:
            test_name = f"Invalid Format - {filename}"
            try:
                files = {'file': (filename, io.BytesIO(file_data), content_type)}
                data = {
                    'project_id': self.test_project_id,
                    'track_id': self.test_track_id
                }
                
                response = self.session.post(f"{API_BASE}/audio/upload", files=files, data=data)
                
                if response.status_code == 400:
                    self.log_result(test_name, True, f"Correctly rejected {content_type}")
                else:
                    self.log_result(test_name, False, f"Expected 400, got {response.status_code}")
            except Exception as e:
                self.log_result(test_name, False, f"Exception: {str(e)}")
                
    def test_file_serving_detailed(self):
        """Detailed testing of file serving functionality"""
        print("\n📁 DETAILED FILE SERVING TESTS")
        print("=" * 50)
        
        # Upload a test file first
        test_name = "Upload for Serving Test"
        wav_data = b'RIFF\x24\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00\x44\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00' + b'\x00' * 2000
        
        files = {'file': ('serving_test.wav', io.BytesIO(wav_data), 'audio/wav')}
        data = {
            'project_id': self.test_project_id,
            'track_id': self.test_track_id
        }
        
        response = self.session.post(f"{API_BASE}/audio/upload", files=files, data=data)
        
        if response.status_code != 200:
            self.log_result(test_name, False, f"Failed to upload test file: {response.text}")
            return
            
        response_data = response.json()
        file_id = response_data['file_id']
        self.log_result(test_name, True, f"Test file uploaded: {file_id}")
        
        # Test serving the file
        test_name = "File Serving Headers"
        try:
            response = self.session.get(f"{API_BASE}/audio/file/{file_id}")
            
            if response.status_code == 200:
                content_type = response.headers.get('content-type', '')
                content_length = response.headers.get('content-length', '0')
                actual_length = len(response.content)
                
                if content_type.startswith('audio/') and actual_length > 0:
                    self.log_result(test_name, True, 
                        f"Correct headers - Type: {content_type}, Length: {content_length}, Actual: {actual_length}")
                else:
                    self.log_result(test_name, False, 
                        f"Invalid headers - Type: {content_type}, Length: {actual_length}")
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        # Test serving non-existent file
        test_name = "Non-existent File Serving"
        try:
            response = self.session.get(f"{API_BASE}/audio/file/non-existent-file.wav")
            
            if response.status_code == 404:
                self.log_result(test_name, True, "Correctly returned 404 for non-existent file")
            else:
                self.log_result(test_name, False, f"Expected 404, got {response.status_code}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        # Clean up test file
        try:
            self.session.delete(f"{API_BASE}/audio/file/{file_id}")
        except:
            pass
            
    def test_essential_daw_apis(self):
        """Test essential DAW APIs as requested"""
        print("\n🎛️ ESSENTIAL DAW APIs")
        print("=" * 50)
        
        # Effects API
        test_name = "Effects API"
        try:
            response = self.session.get(f"{API_BASE}/effects")
            if response.status_code == 200:
                effects = response.json()
                if isinstance(effects, list) and len(effects) >= 7:
                    effect_types = [e.get('type') for e in effects]
                    expected_effects = ['autotune', 'reverb', 'delay', 'compressor', 'eq']
                    found_effects = [e for e in expected_effects if e in effect_types]
                    self.log_result(test_name, True, 
                        f"Found {len(effects)} effects including: {', '.join(found_effects)}")
                else:
                    self.log_result(test_name, False, f"Expected at least 7 effects, got {len(effects) if isinstance(effects, list) else 'invalid'}")
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        # Instruments API
        test_name = "Instruments API"
        try:
            response = self.session.get(f"{API_BASE}/instruments")
            if response.status_code == 200:
                instruments = response.json()
                if isinstance(instruments, list) and len(instruments) >= 4:
                    instrument_names = [i.get('name') for i in instruments]
                    self.log_result(test_name, True, 
                        f"Found {len(instruments)} instruments: {', '.join(instrument_names)}")
                else:
                    self.log_result(test_name, False, f"Expected at least 4 instruments, got {len(instruments) if isinstance(instruments, list) else 'invalid'}")
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        # Sample Packs API
        test_name = "Sample Packs API"
        try:
            response = self.session.get(f"{API_BASE}/samples/packs")
            if response.status_code == 200:
                packs = response.json()
                if isinstance(packs, list) and len(packs) >= 4:
                    pack_names = [p.get('name') for p in packs]
                    self.log_result(test_name, True, 
                        f"Found {len(packs)} sample packs: {', '.join(pack_names)}")
                else:
                    self.log_result(test_name, False, f"Expected at least 4 sample packs, got {len(packs) if isinstance(packs, list) else 'invalid'}")
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
    def run_detailed_tests(self):
        """Run all detailed audio upload tests"""
        print(f"\n🎧 BandLab DAW - DETAILED AUDIO UPLOAD TESTING")
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        print("=" * 60)
        
        # Setup test environment
        if not self.setup_test_environment():
            print("❌ Failed to setup test environment")
            return False
            
        # Run comprehensive audio upload tests
        uploaded_files = self.test_audio_upload_comprehensive()
        
        # Test file serving
        if uploaded_files:
            self.test_audio_file_serving_comprehensive(uploaded_files)
            
        # Test project integration
        self.test_project_track_integration()
        
        # Test edge cases
        self.test_audio_upload_edge_cases()
        
        # Test essential DAW APIs
        self.test_essential_daw_apis()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 DETAILED TEST SUMMARY")
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
        else:
            print("\n🎉 ALL AUDIO UPLOAD TESTS PASSED!")
            print("✅ Audio upload endpoints are working correctly")
            print("✅ File serving is operational")
            print("✅ Project integration is working")
            print("✅ All validation and edge cases handled properly")
            print("✅ Essential DAW APIs are functional")
        
        return passed == total

if __name__ == "__main__":
    tester = AudioUploadDetailedTester()
    success = tester.run_detailed_tests()
    
    if success:
        print("\n🎉 All detailed audio upload tests passed!")
        exit(0)
    else:
        print("\n⚠️ Some tests failed. Check the output above for details.")
        exit(1)