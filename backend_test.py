#!/usr/bin/env python3
"""
Backend API Testing for Notes (onepermit) Editorial Redesign
Tests all auth endpoints to verify backend functionality is preserved.
"""
import requests
import sys
from datetime import datetime

class NotesAPITester:
    def __init__(self, base_url="https://add-repo-guide-1.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.manager_id = None
        self.concierge_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        req_headers = {'Content-Type': 'application/json'}
        if self.token:
            req_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            req_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=req_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=req_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=req_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=req_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"   Response: {response.json()}")
                except:
                    print(f"   Response: {response.text[:200]}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_manager_signup(self):
        """Test manager signup endpoint"""
        timestamp = datetime.now().strftime('%H%M%S')
        email = f"designtest+{timestamp}@example.com"
        
        success, response = self.run_test(
            "Manager Signup",
            "POST",
            "auth/manager/signup",
            200,
            data={
                "first_name": "Design",
                "last_name": "Test",
                "email": email,
                "phone": "(555) 123-4567",
                "job_title": "Property Manager",
                "property_name": "Test Property",
                "address": "123 Test St",
                "city": "Philadelphia",
                "state": "PA",
                "units": 100,
                "password": "TestPass1234!"
            }
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.manager_id = response.get('user_id')
            print(f"   Manager ID: {self.manager_id}")
            print(f"   Email: {email}")
            return True, email
        return False, None

    def test_get_me(self):
        """Test /auth/me endpoint"""
        success, response = self.run_test(
            "Get Current User (/auth/me)",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_signin_manager(self, email, password="TestPass1234!"):
        """Test manager signin"""
        # Clear token first
        self.token = None
        
        success, response = self.run_test(
            "Manager Sign In",
            "POST",
            "auth/signin",
            200,
            data={
                "email": email,
                "password": password,
                "role": "manager"
            }
        )
        
        if success and 'token' in response:
            self.token = response['token']
            return True
        return False

    def test_signin_wrong_credentials(self):
        """Test signin with wrong credentials"""
        success, response = self.run_test(
            "Sign In with Wrong Credentials (should fail)",
            "POST",
            "auth/signin",
            401,
            data={
                "email": "wrong@example.com",
                "password": "wrongpassword",
                "role": "manager"
            }
        )
        # For this test, success means we got 401 as expected
        return success

    def test_add_concierge(self):
        """Test adding a concierge"""
        timestamp = datetime.now().strftime('%H%M%S')
        email = f"concierge+{timestamp}@example.com"
        
        success, response = self.run_test(
            "Add Concierge",
            "POST",
            "manager/concierge",
            200,
            data={
                "first_name": "Test",
                "last_name": "Concierge",
                "email": email,
                "phone": "(555) 987-6543",
                "title": "Front Desk Concierge",
                "password": "Concierge123!"
            }
        )
        
        if success and 'concierge_id' in response:
            self.concierge_id = response['concierge_id']
            print(f"   Concierge ID: {self.concierge_id}")
            return True, email
        return False, None

    def test_list_concierges(self):
        """Test listing concierges"""
        success, response = self.run_test(
            "List Concierges",
            "GET",
            "manager/concierges",
            200
        )
        
        if success and 'concierges' in response:
            print(f"   Found {len(response['concierges'])} concierge(s)")
            return True
        return False

    def test_signout(self):
        """Test signout"""
        success, response = self.run_test(
            "Sign Out",
            "POST",
            "auth/signout",
            200
        )
        if success:
            self.token = None
        return success

def main():
    print("=" * 70)
    print("Notes (onepermit) Backend API Test Suite")
    print("Testing Editorial Redesign - Backend Functionality Preservation")
    print("=" * 70)
    
    tester = NotesAPITester()
    
    # Test 1: Manager Signup
    signup_success, manager_email = tester.test_manager_signup()
    if not signup_success:
        print("\n❌ Manager signup failed - cannot continue")
        return 1
    
    # Test 2: Get Me (with token from signup)
    if not tester.test_get_me():
        print("\n⚠️  /auth/me failed after signup")
    
    # Test 3: Sign Out
    if not tester.test_signout():
        print("\n⚠️  Sign out failed")
    
    # Test 4: Sign In with created account
    if not tester.test_signin_manager(manager_email):
        print("\n❌ Manager sign in failed - cannot continue")
        return 1
    
    # Test 5: Get Me again (after signin)
    if not tester.test_get_me():
        print("\n⚠️  /auth/me failed after signin")
    
    # Test 6: Wrong credentials (should fail with 401)
    tester.test_signin_wrong_credentials()
    
    # Test 7: Add Concierge
    concierge_success, concierge_email = tester.test_add_concierge()
    if not concierge_success:
        print("\n⚠️  Add concierge failed")
    
    # Test 8: List Concierges
    if not tester.test_list_concierges():
        print("\n⚠️  List concierges failed")
    
    # Test 9: Sign Out
    tester.test_signout()
    
    # Print results
    print("\n" + "=" * 70)
    print(f"📊 Tests passed: {tester.tests_passed}/{tester.tests_run}")
    success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
    print(f"📈 Success rate: {success_rate:.1f}%")
    print("=" * 70)
    
    if tester.tests_passed == tester.tests_run:
        print("✅ All backend tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} test(s) failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())
