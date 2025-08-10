#!/usr/bin/env python3
"""
Backend API Testing Script
Tests FastAPI backend endpoints with MongoDB persistence
"""

import requests
import json
import uuid
from datetime import datetime
import sys
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('/app/frontend/.env')

# Get the backend URL from frontend environment
BACKEND_URL = os.environ.get('REACT_APP_BACKEND_URL')
if not BACKEND_URL:
    print("❌ ERROR: REACT_APP_BACKEND_URL not found in frontend/.env")
    sys.exit(1)

API_BASE_URL = f"{BACKEND_URL}/api"

print(f"🔍 Testing Backend API at: {API_BASE_URL}")
print("=" * 60)

def test_get_root():
    """Test GET /api/ endpoint"""
    print("\n1️⃣ Testing GET /api/")
    try:
        response = requests.get(f"{API_BASE_URL}/")
        
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        # Check CORS headers
        cors_header = response.headers.get('Access-Control-Allow-Origin')
        print(f"   CORS Header: {cors_header}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("message") == "Hello World":
                print("   ✅ GET /api/ - SUCCESS")
                cors_ok = cors_header == "*"
                print(f"   {'✅' if cors_ok else '❌'} CORS Header - {'SUCCESS' if cors_ok else 'FAILED'}")
                return True, cors_ok
            else:
                print(f"   ❌ GET /api/ - FAILED: Expected message 'Hello World', got {data}")
                return False, False
        else:
            print(f"   ❌ GET /api/ - FAILED: Expected status 200, got {response.status_code}")
            return False, False
            
    except Exception as e:
        print(f"   ❌ GET /api/ - ERROR: {str(e)}")
        return False, False

def test_post_status():
    """Test POST /api/status endpoint"""
    print("\n2️⃣ Testing POST /api/status")
    try:
        test_data = {"client_name": "tester"}
        response = requests.post(
            f"{API_BASE_URL}/status",
            json=test_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Validate response structure
            required_fields = ["id", "client_name", "timestamp"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                print(f"   ❌ POST /api/status - FAILED: Missing fields {missing_fields}")
                return False, None
            
            # Validate field values
            if data["client_name"] != "tester":
                print(f"   ❌ POST /api/status - FAILED: Expected client_name 'tester', got '{data['client_name']}'")
                return False, None
            
            # Validate UUID format
            try:
                uuid.UUID(data["id"])
                uuid_valid = True
            except ValueError:
                uuid_valid = False
                print(f"   ❌ POST /api/status - FAILED: Invalid UUID format: {data['id']}")
                return False, None
            
            # Validate timestamp format (ISO8601)
            try:
                datetime.fromisoformat(data["timestamp"].replace('Z', '+00:00'))
                timestamp_valid = True
            except ValueError:
                timestamp_valid = False
                print(f"   ❌ POST /api/status - FAILED: Invalid timestamp format: {data['timestamp']}")
                return False, None
            
            print("   ✅ POST /api/status - SUCCESS")
            print(f"   ✅ UUID format valid: {data['id']}")
            print(f"   ✅ Timestamp format valid: {data['timestamp']}")
            return True, data
            
        else:
            print(f"   ❌ POST /api/status - FAILED: Expected status 200, got {response.status_code}")
            return False, None
            
    except Exception as e:
        print(f"   ❌ POST /api/status - ERROR: {str(e)}")
        return False, None

def test_get_status(expected_object=None):
    """Test GET /api/status endpoint"""
    print("\n3️⃣ Testing GET /api/status")
    try:
        response = requests.get(f"{API_BASE_URL}/status")
        
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   Response: Found {len(data)} status objects")
            
            if not isinstance(data, list):
                print(f"   ❌ GET /api/status - FAILED: Expected array, got {type(data)}")
                return False
            
            # If we have an expected object from POST test, verify it exists
            if expected_object:
                found_object = None
                for obj in data:
                    if obj.get("id") == expected_object["id"]:
                        found_object = obj
                        break
                
                if found_object:
                    print(f"   ✅ Found created object with ID: {expected_object['id']}")
                    print(f"   ✅ GET /api/status - SUCCESS")
                    return True
                else:
                    print(f"   ❌ GET /api/status - FAILED: Created object not found in response")
                    return False
            else:
                print("   ✅ GET /api/status - SUCCESS (array returned)")
                return True
                
        else:
            print(f"   ❌ GET /api/status - FAILED: Expected status 200, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"   ❌ GET /api/status - ERROR: {str(e)}")
        return False

def main():
    """Run all backend tests"""
    print("🚀 Starting Backend API Tests")
    
    # Test results
    results = {
        "get_root": False,
        "cors": False,
        "post_status": False,
        "get_status": False,
        "mongodb_persistence": False
    }
    
    # Test 1: GET /api/
    get_root_success, cors_success = test_get_root()
    results["get_root"] = get_root_success
    results["cors"] = cors_success
    
    # Test 2: POST /api/status
    post_success, created_object = test_post_status()
    results["post_status"] = post_success
    
    # Test 3: GET /api/status (with persistence check)
    get_success = test_get_status(created_object)
    results["get_status"] = get_success
    results["mongodb_persistence"] = get_success and created_object is not None
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    for test_name, success in results.items():
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{test_name.replace('_', ' ').title()}: {status}")
    
    total_tests = len(results)
    passed_tests = sum(results.values())
    
    print(f"\nOverall: {passed_tests}/{total_tests} tests passed")
    
    if passed_tests == total_tests:
        print("🎉 All tests PASSED!")
        return 0
    else:
        print("⚠️  Some tests FAILED!")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)