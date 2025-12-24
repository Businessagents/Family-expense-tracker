#!/usr/bin/env python3
"""
Family Finance App Backend API Testing Suite
Tests all backend endpoints for the Family Finance App
"""

import requests
import json
import sys
from datetime import datetime, timedelta
import random
import string

# Backend URL
BACKEND_URL = "http://localhost:8001/api"

class FamilyFinanceAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.auth_token = None
        self.user_data = None
        self.personal_group_id = None
        self.shared_group_id = None
        self.category_ids = []
        self.expense_ids = []
        self.test_results = []
        
    def log_test(self, test_name, success, details=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
        print(f"{status}: {test_name}")
        if details and not success:
            print(f"   Details: {details}")
    
    def make_request(self, method, endpoint, data=None, headers=None):
        """Make HTTP request with proper error handling"""
        url = f"{self.base_url}{endpoint}"
        
        # Add auth header if token exists
        if self.auth_token and headers is None:
            headers = {"Authorization": f"Bearer {self.auth_token}"}
        elif self.auth_token and headers:
            headers["Authorization"] = f"Bearer {self.auth_token}"
        
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, timeout=10)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=headers, timeout=10)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=headers, timeout=10)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=headers, timeout=10)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            return None
    
    def test_user_registration(self):
        """Test user registration with PIN"""
        test_name = "User Registration API"
        
        # Generate unique test data
        timestamp = str(int(datetime.now().timestamp()))
        test_email = f"testuser{timestamp}@example.com"
        test_name_val = f"Test User {timestamp}"
        test_pin = "1234"
        
        data = {
            "name": test_name_val,
            "email": test_email,
            "pin": test_pin
        }
        
        response = self.make_request("POST", "/auth/register", data)
        
        if response is None:
            self.log_test(test_name, False, "Network error")
            return False
        
        if response.status_code == 200:
            try:
                result = response.json()
                if "access_token" in result and "user" in result:
                    self.auth_token = result["access_token"]
                    self.user_data = result["user"]
                    self.log_test(test_name, True, f"User registered: {test_email}")
                    return True
                else:
                    self.log_test(test_name, False, "Missing token or user data in response")
                    return False
            except json.JSONDecodeError:
                self.log_test(test_name, False, "Invalid JSON response")
                return False
        else:
            self.log_test(test_name, False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_user_login(self):
        """Test user login with email and PIN"""
        test_name = "User Login API"
        
        if not self.user_data:
            self.log_test(test_name, False, "No user data from registration")
            return False
        
        data = {
            "email": self.user_data["email"],
            "pin": "1234"
        }
        
        response = self.make_request("POST", "/auth/login", data, headers={})
        
        if response is None:
            self.log_test(test_name, False, "Network error")
            return False
        
        if response.status_code == 200:
            try:
                result = response.json()
                if "access_token" in result:
                    self.log_test(test_name, True, "Login successful")
                    return True
                else:
                    self.log_test(test_name, False, "Missing access token")
                    return False
            except json.JSONDecodeError:
                self.log_test(test_name, False, "Invalid JSON response")
                return False
        else:
            self.log_test(test_name, False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_get_current_user(self):
        """Test getting current user info"""
        test_name = "Get Current User API"
        
        response = self.make_request("GET", "/auth/me")
        
        if response is None:
            self.log_test(test_name, False, "Network error")
            return False
        
        if response.status_code == 200:
            try:
                user = response.json()
                if "id" in user and "email" in user:
                    self.log_test(test_name, True, f"User info retrieved: {user['email']}")
                    return True
                else:
                    self.log_test(test_name, False, "Missing user fields")
                    return False
            except json.JSONDecodeError:
                self.log_test(test_name, False, "Invalid JSON response")
                return False
        else:
            self.log_test(test_name, False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_pin_verification(self):
        """Test PIN verification for app unlock"""
        test_name = "PIN Verification API"
        
        data = {"pin": "1234"}
        response = self.make_request("POST", "/auth/verify-pin", data)
        
        if response is None:
            self.log_test(test_name, False, "Network error")
            return False
        
        if response.status_code == 200:
            try:
                result = response.json()
                if result.get("success"):
                    self.log_test(test_name, True, "PIN verification successful")
                    return True
                else:
                    self.log_test(test_name, False, "PIN verification failed")
                    return False
            except json.JSONDecodeError:
                self.log_test(test_name, False, "Invalid JSON response")
                return False
        else:
            self.log_test(test_name, False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_get_groups(self):
        """Test getting user's groups (should include auto-created personal group)"""
        test_name = "Get Groups API"
        
        response = self.make_request("GET", "/groups")
        
        if response is None:
            self.log_test(test_name, False, "Network error")
            return False
        
        if response.status_code == 200:
            try:
                groups = response.json()
                if isinstance(groups, list) and len(groups) > 0:
                    # Find personal group
                    personal_group = next((g for g in groups if g.get("type") == "personal"), None)
                    if personal_group:
                        self.personal_group_id = personal_group["id"]
                        self.log_test(test_name, True, f"Found {len(groups)} groups including personal group")
                        return True
                    else:
                        self.log_test(test_name, False, "No personal group found")
                        return False
                else:
                    self.log_test(test_name, False, "No groups returned")
                    return False
            except json.JSONDecodeError:
                self.log_test(test_name, False, "Invalid JSON response")
                return False
        else:
            self.log_test(test_name, False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_create_shared_group(self):
        """Test creating a shared group"""
        test_name = "Create Shared Group API"
        
        data = {
            "name": f"Test Family Group {datetime.now().strftime('%H%M%S')}",
            "type": "shared"
        }
        
        response = self.make_request("POST", "/groups", data)
        
        if response is None:
            self.log_test(test_name, False, "Network error")
            return False
        
        if response.status_code == 200:
            try:
                group = response.json()
                if "id" in group and "invite_code" in group:
                    self.shared_group_id = group["id"]
                    self.invite_code = group["invite_code"]
                    self.log_test(test_name, True, f"Group created with invite code: {self.invite_code}")
                    return True
                else:
                    self.log_test(test_name, False, "Missing group ID or invite code")
                    return False
            except json.JSONDecodeError:
                self.log_test(test_name, False, "Invalid JSON response")
                return False
        else:
            self.log_test(test_name, False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_join_group(self):
        """Test joining a group with invite code"""
        test_name = "Join Group API"
        
        if not hasattr(self, 'invite_code'):
            self.log_test(test_name, False, "No invite code available")
            return False
        
        # Create second user first
        timestamp = str(int(datetime.now().timestamp()))
        user2_data = {
            "name": f"Test User 2 {timestamp}",
            "email": f"testuser2{timestamp}@example.com",
            "pin": "5678"
        }
        
        response = self.make_request("POST", "/auth/register", user2_data)
        if not response or response.status_code != 200:
            self.log_test(test_name, False, "Failed to create second user")
            return False
        
        user2_token = response.json()["access_token"]
        
        # Join group with second user
        data = {"invite_code": self.invite_code}
        response = self.make_request("POST", "/groups/join", data, headers={"Authorization": f"Bearer {user2_token}"})
        
        if response is None:
            self.log_test(test_name, False, "Network error")
            return False
        
        if response.status_code == 200:
            try:
                group = response.json()
                if len(group.get("members", [])) >= 2:
                    self.log_test(test_name, True, f"Successfully joined group with {len(group['members'])} members")
                    return True
                else:
                    self.log_test(test_name, False, "Group doesn't have expected number of members")
                    return False
            except json.JSONDecodeError:
                self.log_test(test_name, False, "Invalid JSON response")
                return False
        else:
            self.log_test(test_name, False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_get_categories(self):
        """Test getting categories (default + custom)"""
        test_name = "Get Categories API"
        
        response = self.make_request("GET", "/categories")
        
        if response is None:
            self.log_test(test_name, False, "Network error")
            return False
        
        if response.status_code == 200:
            try:
                categories = response.json()
                if isinstance(categories, list) and len(categories) >= 10:  # Should have default categories
                    self.category_ids = [cat["id"] for cat in categories]
                    default_count = len([cat for cat in categories if not cat.get("is_custom")])
                    self.log_test(test_name, True, f"Found {len(categories)} categories ({default_count} default)")
                    return True
                else:
                    self.log_test(test_name, False, f"Expected at least 10 categories, got {len(categories) if isinstance(categories, list) else 0}")
                    return False
            except json.JSONDecodeError:
                self.log_test(test_name, False, "Invalid JSON response")
                return False
        else:
            self.log_test(test_name, False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_create_expense(self):
        """Test creating expenses in different currencies"""
        test_name = "Create Expense API"
        
        if not self.category_ids or not self.personal_group_id:
            self.log_test(test_name, False, "Missing category IDs or group ID")
            return False
        
        # Test expenses in different currencies
        currencies = ["INR", "USD", "CAD", "SAR"]
        success_count = 0
        
        for currency in currencies:
            data = {
                "amount": round(random.uniform(10, 1000), 2),
                "currency": currency,
                "category_id": random.choice(self.category_ids),
                "group_id": self.personal_group_id,
                "description": f"Test expense in {currency}",
                "date": datetime.now().isoformat()
            }
            
            response = self.make_request("POST", "/expenses", data)
            
            if response and response.status_code == 200:
                try:
                    expense = response.json()
                    if "id" in expense:
                        self.expense_ids.append(expense["id"])
                        success_count += 1
                except json.JSONDecodeError:
                    pass
        
        if success_count == len(currencies):
            self.log_test(test_name, True, f"Created expenses in all {len(currencies)} currencies")
            return True
        else:
            self.log_test(test_name, False, f"Only created {success_count}/{len(currencies)} expenses")
            return False
    
    def test_get_expenses(self):
        """Test getting expenses with filters"""
        test_name = "Get Expenses API"
        
        response = self.make_request("GET", "/expenses")
        
        if response is None:
            self.log_test(test_name, False, "Network error")
            return False
        
        if response.status_code == 200:
            try:
                expenses = response.json()
                if isinstance(expenses, list):
                    self.log_test(test_name, True, f"Retrieved {len(expenses)} expenses")
                    return True
                else:
                    self.log_test(test_name, False, "Response is not a list")
                    return False
            except json.JSONDecodeError:
                self.log_test(test_name, False, "Invalid JSON response")
                return False
        else:
            self.log_test(test_name, False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_analytics_summary(self):
        """Test analytics summary endpoint"""
        test_name = "Analytics Summary API"
        
        response = self.make_request("GET", "/analytics/summary")
        
        if response is None:
            self.log_test(test_name, False, "Network error")
            return False
        
        if response.status_code == 200:
            try:
                analytics = response.json()
                required_fields = ["today", "this_month", "total", "total_count", "currency_symbols"]
                if all(field in analytics for field in required_fields):
                    self.log_test(test_name, True, f"Analytics summary with {analytics['total_count']} total expenses")
                    return True
                else:
                    missing = [f for f in required_fields if f not in analytics]
                    self.log_test(test_name, False, f"Missing fields: {missing}")
                    return False
            except json.JSONDecodeError:
                self.log_test(test_name, False, "Invalid JSON response")
                return False
        else:
            self.log_test(test_name, False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_analytics_by_category(self):
        """Test analytics by category endpoint"""
        test_name = "Analytics By Category API"
        
        response = self.make_request("GET", "/analytics/by-category")
        
        if response is None:
            self.log_test(test_name, False, "Network error")
            return False
        
        if response.status_code == 200:
            try:
                analytics = response.json()
                if isinstance(analytics, list):
                    self.log_test(test_name, True, f"Category analytics with {len(analytics)} categories")
                    return True
                else:
                    self.log_test(test_name, False, "Response is not a list")
                    return False
            except json.JSONDecodeError:
                self.log_test(test_name, False, "Invalid JSON response")
                return False
        else:
            self.log_test(test_name, False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_analytics_by_member(self):
        """Test analytics by member endpoint"""
        test_name = "Analytics By Member API"
        
        response = self.make_request("GET", "/analytics/by-member")
        
        if response is None:
            self.log_test(test_name, False, "Network error")
            return False
        
        if response.status_code == 200:
            try:
                analytics = response.json()
                if isinstance(analytics, list):
                    self.log_test(test_name, True, f"Member analytics with {len(analytics)} members")
                    return True
                else:
                    self.log_test(test_name, False, "Response is not a list")
                    return False
            except json.JSONDecodeError:
                self.log_test(test_name, False, "Invalid JSON response")
                return False
        else:
            self.log_test(test_name, False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_analytics_trends(self):
        """Test analytics trends endpoint"""
        test_name = "Analytics Trends API"
        
        response = self.make_request("GET", "/analytics/trends?months=6")
        
        if response is None:
            self.log_test(test_name, False, "Network error")
            return False
        
        if response.status_code == 200:
            try:
                trends = response.json()
                if isinstance(trends, list) and len(trends) == 6:
                    self.log_test(test_name, True, f"Trends data for {len(trends)} months")
                    return True
                else:
                    self.log_test(test_name, False, f"Expected 6 months of data, got {len(trends) if isinstance(trends, list) else 0}")
                    return False
            except json.JSONDecodeError:
                self.log_test(test_name, False, "Invalid JSON response")
                return False
        else:
            self.log_test(test_name, False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_analytics_daily(self):
        """Test analytics daily endpoint"""
        test_name = "Analytics Daily API"
        
        response = self.make_request("GET", "/analytics/daily?days=30")
        
        if response is None:
            self.log_test(test_name, False, "Network error")
            return False
        
        if response.status_code == 200:
            try:
                daily = response.json()
                if isinstance(daily, list) and len(daily) == 30:
                    self.log_test(test_name, True, f"Daily analytics for {len(daily)} days")
                    return True
                else:
                    self.log_test(test_name, False, f"Expected 30 days of data, got {len(daily) if isinstance(daily, list) else 0}")
                    return False
            except json.JSONDecodeError:
                self.log_test(test_name, False, "Invalid JSON response")
                return False
        else:
            self.log_test(test_name, False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_csv_export(self):
        """Test CSV export functionality"""
        test_name = "CSV Export API"
        
        data = {
            "export_type": "all"
        }
        
        response = self.make_request("POST", "/export/csv", data)
        
        if response is None:
            self.log_test(test_name, False, "Network error")
            return False
        
        if response.status_code == 200:
            content_type = response.headers.get("content-type", "")
            if "text/csv" in content_type:
                content = response.text
                if "Date,Group,Category,Amount,Currency,Description,Paid By" in content:
                    self.log_test(test_name, True, f"CSV export successful ({len(content)} bytes)")
                    return True
                else:
                    self.log_test(test_name, False, "CSV header not found")
                    return False
            else:
                self.log_test(test_name, False, f"Wrong content type: {content_type}")
                return False
        else:
            self.log_test(test_name, False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def test_currencies_endpoint(self):
        """Test currencies endpoint"""
        test_name = "Get Currencies API"
        
        response = self.make_request("GET", "/currencies")
        
        if response is None:
            self.log_test(test_name, False, "Network error")
            return False
        
        if response.status_code == 200:
            try:
                currencies = response.json()
                if "currencies" in currencies and "symbols" in currencies:
                    expected_currencies = ["INR", "USD", "CAD", "SAR"]
                    if all(curr in currencies["currencies"] for curr in expected_currencies):
                        self.log_test(test_name, True, f"All {len(expected_currencies)} currencies available")
                        return True
                    else:
                        self.log_test(test_name, False, "Missing expected currencies")
                        return False
                else:
                    self.log_test(test_name, False, "Missing currencies or symbols")
                    return False
            except json.JSONDecodeError:
                self.log_test(test_name, False, "Invalid JSON response")
                return False
        else:
            self.log_test(test_name, False, f"HTTP {response.status_code}: {response.text}")
            return False
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print(f"🚀 Starting Family Finance Backend API Tests")
        print(f"📍 Backend URL: {self.base_url}")
        print("=" * 60)
        
        # Authentication tests
        if not self.test_user_registration():
            print("❌ Registration failed - stopping tests")
            return False
        
        if not self.test_user_login():
            print("❌ Login failed - stopping tests")
            return False
        
        self.test_get_current_user()
        self.test_pin_verification()
        
        # Group tests
        self.test_get_groups()
        self.test_create_shared_group()
        self.test_join_group()
        
        # Category tests
        self.test_get_categories()
        
        # Expense tests
        self.test_create_expense()
        self.test_get_expenses()
        
        # Analytics tests
        self.test_analytics_summary()
        self.test_analytics_by_category()
        self.test_analytics_by_member()
        self.test_analytics_trends()
        self.test_analytics_daily()
        
        # Export tests
        self.test_csv_export()
        
        # Utility tests
        self.test_currencies_endpoint()
        
        # Summary
        print("=" * 60)
        passed = len([r for r in self.test_results if r["success"]])
        total = len(self.test_results)
        success_rate = (passed / total) * 100 if total > 0 else 0
        
        print(f"📊 Test Results: {passed}/{total} tests passed ({success_rate:.1f}%)")
        
        if passed == total:
            print("🎉 All tests passed! Backend is working correctly.")
            return True
        else:
            print("⚠️  Some tests failed. Check the details above.")
            failed_tests = [r for r in self.test_results if not r["success"]]
            print("\n❌ Failed Tests:")
            for test in failed_tests:
                print(f"   - {test['test']}: {test['details']}")
            return False

def main():
    """Main test runner"""
    tester = FamilyFinanceAPITester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()