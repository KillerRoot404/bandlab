#!/usr/bin/env python3
"""
BandLab DAW Audio Upload Endpoints Test Suite
Focused testing of audio upload, file serving, and deletion endpoints.
"""

import requests
import json
import uuid
from datetime import datetime
import os
import io
import tempfile
import wave
import struct
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get backend URL from environment
BACKEND_URL = os.getenv('REACT_APP_BACKEND_URL', 'http://localhost:8001')
API_BASE = f"{BACKEND_URL}/api"

class AudioUploadTester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_user_id = None
        self.test_project_id = None
        self.test_track_id = None
        self.test_file_ids = []
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
            
    def create_test_wav_file(self, duration_seconds=1, sample_rate=44100):
        """Create a proper WAV file for testing"""
        # Generate sine wave audio data
        frames = int(duration_seconds * sample_rate)
        audio_data = []
        
        for i in range(frames):
            # Generate a 440Hz sine wave (A note)
            sample = int(32767 * 0.3 * (i % (sample_rate // 440)) / (sample_rate // 440))
            audio_data.append(struct.pack('<h', sample))
        
        # Create WAV file in memory
        wav_buffer = io.BytesIO()
        with wave.open(wav_buffer, 'wb') as wav_file:
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(b''.join(audio_data))
        
        wav_buffer.seek(0)
        return wav_buffer.getvalue()
        
    def create_test_mp3_file(self):
        """Create a minimal MP3-like file for testing"""
        # This is a minimal MP3 header + some data
        mp3_header = b'\xff\xfb\x90\x00'  # MP3 sync word and header
        mp3_data = b'\x00' * 1000  # Some data
        return mp3_header + mp3_data
        
    def create_large_file(self, size_mb):
        """Create a large file for size limit testing"""
        size_bytes = size_mb * 1024 * 1024
        return b'\x00' * size_bytes
        
    def setup_prerequisites(self):
        """Set up user, project, and track for testing"""
        print("\n🔧 Setting up test prerequisites...")
        
        # Register user
        timestamp = str(int(datetime.now().timestamp()))
        self.test_username = f"audiotest_{timestamp}"
        self.test_password = "AudioTest123!"
        
        user_data = {
            "username": self.test_username,
            "email": f"audiotest_{timestamp}@bandlab.com",
            "password": self.test_password,
            "display_name": f"Audio Test User {timestamp}"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/auth/register", json=user_data)
            if response.status_code == 200:
                data = response.json()
                self.auth_token = data['token']
                self.test_user_id = data['user']['id']
                self.set_auth_header(self.auth_token)
                print(f"✅ User registered: {self.test_username}")
            else:
                print(f"❌ User registration failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ User registration error: {str(e)}")
            return False
            
        # Create project
        project_data = {
            "name": f"Audio Test Project {timestamp}",
            "description": "Project for audio upload testing",
            "is_public": False
        }
        
        try:
            response = self.session.post(f"{API_BASE}/projects", json=project_data)
            if response.status_code == 200:
                data = response.json()
                self.test_project_id = data['id']
                print(f"✅ Project created: {data['name']}")
            else:
                print(f"❌ Project creation failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Project creation error: {str(e)}")
            return False
            
        # Add track to project
        track_data = {
            "name": "Audio Test Track",
            "instrument": "vocals",
            "volume": 75.0,
            "color": "#ef4444"
        }
        
        try:
            response = self.session.post(f"{API_BASE}/projects/{self.test_project_id}/tracks", json=track_data)
            if response.status_code == 200:
                data = response.json()
                self.test_track_id = data['id']
                print(f"✅ Track added: {data['name']}")
                return True
            else:
                print(f"❌ Track creation failed: {response.status_code} - {response.text}")
                return False
        except Exception as e:
            print(f"❌ Track creation error: {str(e)}")
            return False
            
    def test_audio_upload_wav(self):
        """Test uploading a valid WAV file"""
        test_name = "Audio Upload - WAV File"
        
        try:
            # Create test WAV file
            wav_data = self.create_test_wav_file()
            
            # Prepare multipart form data
            files = {
                'file': ('test_audio.wav', io.BytesIO(wav_data), 'audio/wav')
            }
            data = {
                'project_id': self.test_project_id,
                'track_id': self.test_track_id
            }
            
            response = self.session.post(f"{API_BASE}/audio/upload", files=files, data=data)
            
            if response.status_code == 200:
                response_data = response.json()
                if 'clip' in response_data and 'file_id' in response_data:
                    file_id = response_data['file_id']
                    self.test_file_ids.append(file_id)
                    clip = response_data['clip']
                    
                    # Validate response structure
                    required_fields = ['id', 'file_url']
                    missing_fields = [field for field in required_fields if field not in clip]
                    
                    if not missing_fields:
                        self.log_result(test_name, True, f"WAV file uploaded successfully. File ID: {file_id}, Clip ID: {clip['id']}")
                        return True
                    else:
                        self.log_result(test_name, False, f"Missing required fields in clip: {missing_fields}", response_data)
                else:
                    self.log_result(test_name, False, "Missing clip or file_id in response", response_data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_audio_upload_mp3(self):
        """Test uploading a valid MP3 file"""
        test_name = "Audio Upload - MP3 File"
        
        try:
            # Create test MP3 file
            mp3_data = self.create_test_mp3_file()
            
            # Prepare multipart form data
            files = {
                'file': ('test_audio.mp3', io.BytesIO(mp3_data), 'audio/mpeg')
            }
            data = {
                'project_id': self.test_project_id,
                'track_id': self.test_track_id
            }
            
            response = self.session.post(f"{API_BASE}/audio/upload", files=files, data=data)
            
            if response.status_code == 200:
                response_data = response.json()
                if 'clip' in response_data and 'file_id' in response_data:
                    file_id = response_data['file_id']
                    self.test_file_ids.append(file_id)
                    self.log_result(test_name, True, f"MP3 file uploaded successfully. File ID: {file_id}")
                    return True
                else:
                    self.log_result(test_name, False, "Missing clip or file_id in response", response_data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_audio_upload_invalid_file_type(self):
        """Test uploading a non-audio file (should return 400)"""
        test_name = "Audio Upload - Invalid File Type"
        
        try:
            # Create text file
            text_data = b"This is not an audio file, it's just text content."
            
            # Prepare multipart form data
            files = {
                'file': ('test.txt', io.BytesIO(text_data), 'text/plain')
            }
            data = {
                'project_id': self.test_project_id,
                'track_id': self.test_track_id
            }
            
            response = self.session.post(f"{API_BASE}/audio/upload", files=files, data=data)
            
            if response.status_code == 400:
                self.log_result(test_name, True, "Correctly rejected non-audio file with 400 status")
                return True
            else:
                self.log_result(test_name, False, f"Expected 400 for invalid file type, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_audio_upload_size_limit(self):
        """Test uploading a file larger than 50MB (should return 413)"""
        test_name = "Audio Upload - Size Limit (>50MB)"
        
        try:
            # Create a 51MB file (slightly over the limit)
            large_data = self.create_large_file(51)
            
            # Prepare multipart form data
            files = {
                'file': ('large_audio.wav', io.BytesIO(large_data), 'audio/wav')
            }
            data = {
                'project_id': self.test_project_id,
                'track_id': self.test_track_id
            }
            
            response = self.session.post(f"{API_BASE}/audio/upload", files=files, data=data)
            
            if response.status_code == 413:
                self.log_result(test_name, True, "Correctly rejected oversized file with 413 status")
                return True
            else:
                self.log_result(test_name, False, f"Expected 413 for oversized file, got {response.status_code}: {response.text}")
                
        except Exception as e:
            # This might fail due to infrastructure limits, which is acceptable
            if "too large" in str(e).lower() or "413" in str(e):
                self.log_result(test_name, True, f"Size limit enforced by infrastructure: {str(e)}")
                return True
            else:
                self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_audio_upload_invalid_project(self):
        """Test uploading to non-existent project (should return 404)"""
        test_name = "Audio Upload - Invalid Project ID"
        
        try:
            # Create test audio file
            wav_data = self.create_test_wav_file()
            
            # Use fake project ID
            fake_project_id = str(uuid.uuid4())
            
            # Prepare multipart form data
            files = {
                'file': ('test_audio.wav', io.BytesIO(wav_data), 'audio/wav')
            }
            data = {
                'project_id': fake_project_id,
                'track_id': self.test_track_id
            }
            
            response = self.session.post(f"{API_BASE}/audio/upload", files=files, data=data)
            
            if response.status_code == 404:
                self.log_result(test_name, True, "Correctly rejected invalid project ID with 404 status")
                return True
            else:
                self.log_result(test_name, False, f"Expected 404 for invalid project ID, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_audio_upload_invalid_track(self):
        """Test uploading to non-existent track (should return 404)"""
        test_name = "Audio Upload - Invalid Track ID"
        
        try:
            # Create test audio file
            wav_data = self.create_test_wav_file()
            
            # Use fake track ID
            fake_track_id = str(uuid.uuid4())
            
            # Prepare multipart form data
            files = {
                'file': ('test_audio.wav', io.BytesIO(wav_data), 'audio/wav')
            }
            data = {
                'project_id': self.test_project_id,
                'track_id': fake_track_id
            }
            
            response = self.session.post(f"{API_BASE}/audio/upload", files=files, data=data)
            
            if response.status_code == 404:
                self.log_result(test_name, True, "Correctly rejected invalid track ID with 404 status")
                return True
            else:
                self.log_result(test_name, False, f"Expected 404 for invalid track ID, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_audio_upload_unauthorized(self):
        """Test uploading without authentication (should return 401)"""
        test_name = "Audio Upload - Unauthorized Access"
        
        try:
            # Create test audio file
            wav_data = self.create_test_wav_file()
            
            # Remove auth header temporarily
            original_auth = self.session.headers.get('Authorization')
            self.set_auth_header(None)
            
            # Prepare multipart form data
            files = {
                'file': ('test_audio.wav', io.BytesIO(wav_data), 'audio/wav')
            }
            data = {
                'project_id': self.test_project_id,
                'track_id': self.test_track_id
            }
            
            response = self.session.post(f"{API_BASE}/audio/upload", files=files, data=data)
            
            # Restore auth header
            if original_auth:
                self.session.headers['Authorization'] = original_auth
            
            if response.status_code == 401:
                self.log_result(test_name, True, "Correctly rejected unauthorized request with 401 status")
                return True
            else:
                self.log_result(test_name, False, f"Expected 401 for unauthorized request, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_audio_file_serve(self):
        """Test serving uploaded audio files"""
        test_name = "Audio File Serve"
        
        if not self.test_file_ids:
            self.log_result(test_name, False, "No uploaded files to test serving")
            return False
            
        try:
            file_id = self.test_file_ids[0]  # Use first uploaded file
            response = self.session.get(f"{API_BASE}/audio/file/{file_id}")
            
            if response.status_code == 200:
                # Check content type
                content_type = response.headers.get('content-type', '')
                if content_type.startswith('audio/'):
                    # Check if we got file content
                    if len(response.content) > 0:
                        self.log_result(test_name, True, f"Audio file served successfully ({len(response.content)} bytes, {content_type})")
                        return True
                    else:
                        self.log_result(test_name, False, "Empty file content received")
                else:
                    self.log_result(test_name, False, f"Invalid content type: {content_type}")
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_audio_file_serve_not_found(self):
        """Test serving non-existent file (should return 404)"""
        test_name = "Audio File Serve - Not Found"
        
        try:
            fake_file_id = f"{uuid.uuid4()}.wav"
            response = self.session.get(f"{API_BASE}/audio/file/{fake_file_id}")
            
            if response.status_code == 404:
                self.log_result(test_name, True, "Correctly returned 404 for non-existent file")
                return True
            else:
                self.log_result(test_name, False, f"Expected 404 for non-existent file, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_audio_file_delete(self):
        """Test deleting uploaded audio files"""
        test_name = "Audio File Delete"
        
        if not self.test_file_ids:
            self.log_result(test_name, False, "No uploaded files to test deletion")
            return False
            
        try:
            file_id = self.test_file_ids[0]  # Use first uploaded file
            response = self.session.delete(f"{API_BASE}/audio/file/{file_id}")
            
            if response.status_code == 200:
                response_data = response.json()
                if 'message' in response_data:
                    self.log_result(test_name, True, f"Audio file deleted successfully: {response_data['message']}")
                    
                    # Verify file is actually deleted by trying to serve it
                    serve_response = self.session.get(f"{API_BASE}/audio/file/{file_id}")
                    if serve_response.status_code == 404:
                        self.log_result(f"{test_name} - Verification", True, "File confirmed deleted (404 on subsequent GET)")
                        # Remove from our list since it's deleted
                        self.test_file_ids.remove(file_id)
                        return True
                    else:
                        self.log_result(f"{test_name} - Verification", False, f"File still accessible after deletion: {serve_response.status_code}")
                else:
                    self.log_result(test_name, False, "No message in delete response", response_data)
            else:
                self.log_result(test_name, False, f"HTTP {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def test_audio_file_delete_unauthorized(self):
        """Test deleting file without authentication (should return 401)"""
        test_name = "Audio File Delete - Unauthorized"
        
        if not self.test_file_ids:
            self.log_result(test_name, False, "No uploaded files to test unauthorized deletion")
            return False
            
        try:
            file_id = self.test_file_ids[0]  # Use first remaining uploaded file
            
            # Remove auth header temporarily
            original_auth = self.session.headers.get('Authorization')
            self.set_auth_header(None)
            
            response = self.session.delete(f"{API_BASE}/audio/file/{file_id}")
            
            # Restore auth header
            if original_auth:
                self.session.headers['Authorization'] = original_auth
            
            if response.status_code == 401:
                self.log_result(test_name, True, "Correctly rejected unauthorized delete with 401 status")
                return True
            else:
                self.log_result(test_name, False, f"Expected 401 for unauthorized delete, got {response.status_code}: {response.text}")
                
        except Exception as e:
            self.log_result(test_name, False, f"Exception: {str(e)}")
            
        return False
        
    def cleanup_remaining_files(self):
        """Clean up any remaining test files"""
        print("\n🧹 Cleaning up remaining test files...")
        for file_id in self.test_file_ids[:]:  # Copy list to avoid modification during iteration
            try:
                response = self.session.delete(f"{API_BASE}/audio/file/{file_id}")
                if response.status_code == 200:
                    print(f"✅ Cleaned up file: {file_id}")
                    self.test_file_ids.remove(file_id)
                else:
                    print(f"⚠️ Could not clean up file {file_id}: {response.status_code}")
            except Exception as e:
                print(f"⚠️ Error cleaning up file {file_id}: {str(e)}")
                
    def run_audio_upload_tests(self):
        """Run all audio upload related tests"""
        print(f"\n🎧 Starting Audio Upload Endpoint Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print(f"API Base: {API_BASE}")
        print("=" * 60)
        
        # Setup prerequisites
        if not self.setup_prerequisites():
            print("❌ Failed to set up test prerequisites. Aborting tests.")
            return False
            
        # Audio Upload Tests
        print("\n📤 Audio Upload Tests")
        self.test_audio_upload_wav()
        self.test_audio_upload_mp3()
        self.test_audio_upload_invalid_file_type()
        self.test_audio_upload_size_limit()
        self.test_audio_upload_invalid_project()
        self.test_audio_upload_invalid_track()
        self.test_audio_upload_unauthorized()
        
        # Audio File Serving Tests
        print("\n📥 Audio File Serving Tests")
        self.test_audio_file_serve()
        self.test_audio_file_serve_not_found()
        
        # Audio File Deletion Tests
        print("\n🗑️ Audio File Deletion Tests")
        self.test_audio_file_delete()
        self.test_audio_file_delete_unauthorized()
        
        # Cleanup
        self.cleanup_remaining_files()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 AUDIO UPLOAD TEST SUMMARY")
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
            print("\n🎉 All audio upload tests passed!")
        
        return passed == total

if __name__ == "__main__":
    tester = AudioUploadTester()
    success = tester.run_audio_upload_tests()
    
    if success:
        print("\n🎉 All audio upload endpoint tests passed! Audio functionality is working correctly.")
        exit(0)
    else:
        print("\n⚠️ Some audio upload tests failed. Check the output above for details.")
        exit(1)