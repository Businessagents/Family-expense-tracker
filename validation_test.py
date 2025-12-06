#!/usr/bin/env python3
"""
Simple validation test for debugging
"""

import requests
import uuid

BACKEND_URL = "https://splitfamily.preview.emergentagent.com/api"

def test_pin_validation():
    """Test PIN validation"""
    print("Testing PIN validation...")
    
    # Test invalid PIN
    unique_email = f'test.{uuid.uuid4().hex[:8]}@example.com'
    invalid_user = {
        "name": "Test User",
        "email": unique_email,
        "pin": "12"  # Too short
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/auth/register", json=invalid_user, timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 400 and "PIN must be 4-6 digits" in response.text:
            print("✅ PIN validation working correctly")
        else:
            print("❌ PIN validation not working as expected")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

def test_login_validation():
    """Test login validation"""
    print("\nTesting login validation...")
    
    # Test invalid credentials
    invalid_login = {
        "email": "nonexistent@example.com",
        "pin": "9999"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/auth/login", json=invalid_login, timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 401:
            print("✅ Login validation working correctly")
        else:
            print("❌ Login validation not working as expected")
            
    except Exception as e:
        print(f"❌ Request failed: {e}")

if __name__ == "__main__":
    test_pin_validation()
    test_login_validation()