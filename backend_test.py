#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for Family Finance App
Tests all endpoints according to the specified test flow.
"""

import requests
import json
import uuid
from datetime import datetime, timedelta
import time

# Backend URL from environment
BACKEND_URL = "https://splitfamily.preview.emergentagent.com/api"

class FamilyFinanceAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.user1_token = None
        self.user2_token = None
        self.user1_data = None
        self.user2_data = None
        self.family_data = None
        self.categories = []
        self.expenses = []
        self.test_results = []
        
    def log_test(self, test_name, success, details=""):
        """Log test results"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
        
    def make_request(self, method, endpoint, data=None, token=None, params=None):
        """Make HTTP request with proper headers"""
        url = f"{BACKEND_URL}{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        if token:
            headers["Authorization"] = f"Bearer {token}"
            
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=headers, params=params, timeout=30)
            elif method.upper() == "POST":
                response = self.session.post(url, headers=headers, json=data, timeout=30)
            elif method.upper() == "PUT":
                response = self.session.put(url, headers=headers, json=data, timeout=30)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            return response
        except Exception as e:
            print(f"Request failed: {e}")
            return None

    def test_user_registration(self):
        """Test user registration API"""
        print("\n=== Testing User Registration ===")
        
        # Test valid registration
        user_data = {
            "name": "Rajesh Kumar",
            "email": f"rajesh.kumar.{uuid.uuid4().hex[:8]}@example.com",
            "pin": "1234"
        }
        
        response = self.make_request("POST", "/auth/register", user_data)
        
        if response and response.status_code == 200:
            data = response.json()
            self.user1_token = data["access_token"]
            self.user1_data = data["user"]
            self.log_test("User Registration", True, f"User ID: {self.user1_data['id']}")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("User Registration", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            
        # Test invalid PIN
        invalid_user = {
            "name": "Test User",
            "email": f"test.{uuid.uuid4().hex[:8]}@example.com",
            "pin": "12"  # Too short
        }
        
        response = self.make_request("POST", "/auth/register", invalid_user)
        if response and response.status_code == 400 and "PIN must be 4-6 digits" in response.text:
            self.log_test("User Registration - Invalid PIN", True, "Correctly rejected short PIN")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("User Registration - Invalid PIN", False, f"Expected PIN validation error, got: {error_msg}")

    def test_user_login(self):
        """Test user login API"""
        print("\n=== Testing User Login ===")
        
        if not self.user1_data:
            self.log_test("User Login", False, "No user data available for login test")
            return
            
        # Test valid login
        login_data = {
            "email": self.user1_data["email"],
            "pin": "1234"
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("User Login", True, f"Token received: {data['access_token'][:20]}...")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("User Login", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            
        # Test invalid credentials
        invalid_login = {
            "email": self.user1_data["email"],
            "pin": "9999"
        }
        
        response = self.make_request("POST", "/auth/login", invalid_login)
        if response and response.status_code == 401:
            self.log_test("User Login - Invalid Credentials", True, "Correctly rejected invalid PIN")
        else:
            self.log_test("User Login - Invalid Credentials", False, "Should reject invalid PIN")

    def test_auth_me(self):
        """Test get current user API"""
        print("\n=== Testing Auth Me ===")
        
        if not self.user1_token:
            self.log_test("Auth Me", False, "No token available")
            return
            
        response = self.make_request("GET", "/auth/me", token=self.user1_token)
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Auth Me", True, f"User: {data['name']}")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Auth Me", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")

    def test_profile_update(self):
        """Test profile update API"""
        print("\n=== Testing Profile Update ===")
        
        if not self.user1_token:
            self.log_test("Profile Update", False, "No token available")
            return
            
        update_data = {
            "name": "Rajesh Kumar Updated",
            "default_currency": "USD"
        }
        
        response = self.make_request("PUT", "/auth/profile", update_data, token=self.user1_token)
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Profile Update", True, f"Updated name: {data['name']}, Currency: {data['default_currency']}")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Profile Update", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")

    def test_family_creation(self):
        """Test family creation API"""
        print("\n=== Testing Family Creation ===")
        
        if not self.user1_token:
            self.log_test("Family Creation", False, "No token available")
            return
            
        family_data = {
            "name": "Kumar Family"
        }
        
        response = self.make_request("POST", "/family/create", family_data, token=self.user1_token)
        
        if response and response.status_code == 200:
            self.family_data = response.json()
            self.log_test("Family Creation", True, f"Family ID: {self.family_data['id']}, Invite Code: {self.family_data['invite_code']}")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Family Creation", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")

    def test_family_join(self):
        """Test family join API with second user"""
        print("\n=== Testing Family Join ===")
        
        # First register second user
        user2_data = {
            "name": "Priya Kumar",
            "email": f"priya.kumar.{uuid.uuid4().hex[:8]}@example.com",
            "pin": "5678"
        }
        
        response = self.make_request("POST", "/auth/register", user2_data)
        
        if response and response.status_code == 200:
            data = response.json()
            self.user2_token = data["access_token"]
            self.user2_data = data["user"]
            self.log_test("Second User Registration", True, f"User ID: {self.user2_data['id']}")
        else:
            self.log_test("Second User Registration", False, "Failed to register second user")
            return
            
        # Now test family join
        if not self.family_data:
            self.log_test("Family Join", False, "No family data available")
            return
            
        join_data = {
            "invite_code": self.family_data["invite_code"]
        }
        
        response = self.make_request("POST", "/family/join", join_data, token=self.user2_token)
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Family Join", True, f"Joined family: {data['name']}, Members: {len(data['members'])}")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Family Join", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")

    def test_get_family(self):
        """Test get family details API"""
        print("\n=== Testing Get Family ===")
        
        if not self.user1_token:
            self.log_test("Get Family", False, "No token available")
            return
            
        response = self.make_request("GET", "/family", token=self.user1_token)
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Get Family", True, f"Family: {data['name']}, Members: {len(data['members'])}")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Get Family", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")

    def test_categories(self):
        """Test categories API"""
        print("\n=== Testing Categories ===")
        
        if not self.user1_token:
            self.log_test("Get Categories", False, "No token available")
            return
            
        # Get categories
        response = self.make_request("GET", "/categories", token=self.user1_token)
        
        if response and response.status_code == 200:
            self.categories = response.json()
            self.log_test("Get Categories", True, f"Found {len(self.categories)} categories")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Get Categories", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return
            
        # Create custom category
        custom_category = {
            "name": "Family Vacation",
            "icon": "airplane",
            "color": "#FF6B6B"
        }
        
        response = self.make_request("POST", "/categories", custom_category, token=self.user1_token)
        
        if response and response.status_code == 200:
            data = response.json()
            self.categories.append(data)
            self.log_test("Create Custom Category", True, f"Created: {data['name']}")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Create Custom Category", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")

    def test_expenses_crud(self):
        """Test expenses CRUD operations"""
        print("\n=== Testing Expenses CRUD ===")
        
        if not self.user1_token or not self.categories:
            self.log_test("Expenses CRUD", False, "Missing token or categories")
            return
            
        # Create expenses with different currencies
        expenses_data = [
            {
                "amount": 500.0,
                "currency": "INR",
                "category_id": self.categories[0]["id"],
                "description": "Grocery shopping at Big Bazaar"
            },
            {
                "amount": 25.0,
                "currency": "USD", 
                "category_id": self.categories[1]["id"] if len(self.categories) > 1 else self.categories[0]["id"],
                "description": "Netflix subscription"
            },
            {
                "amount": 75.0,
                "currency": "CAD",
                "category_id": self.categories[2]["id"] if len(self.categories) > 2 else self.categories[0]["id"],
                "description": "Gas bill payment"
            }
        ]
        
        # Create expenses
        for i, expense_data in enumerate(expenses_data):
            response = self.make_request("POST", "/expenses", expense_data, token=self.user1_token)
            
            if response and response.status_code == 200:
                data = response.json()
                self.expenses.append(data)
                self.log_test(f"Create Expense {i+1}", True, f"Amount: {data['amount']} {data['currency']}")
            else:
                error_msg = response.text if response else "No response"
                self.log_test(f"Create Expense {i+1}", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
                
        # Add expenses from second user
        if self.user2_token:
            user2_expense = {
                "amount": 200.0,
                "currency": "SAR",
                "category_id": self.categories[0]["id"],
                "description": "Lunch at restaurant"
            }
            
            response = self.make_request("POST", "/expenses", user2_expense, token=self.user2_token)
            
            if response and response.status_code == 200:
                data = response.json()
                self.expenses.append(data)
                self.log_test("Create Expense - User 2", True, f"Amount: {data['amount']} {data['currency']}")
            else:
                error_msg = response.text if response else "No response"
                self.log_test("Create Expense - User 2", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
        
        # Test get expenses
        response = self.make_request("GET", "/expenses", token=self.user1_token)
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Get Expenses", True, f"Retrieved {len(data)} expenses")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Get Expenses", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            
        # Test get single expense
        if self.expenses:
            expense_id = self.expenses[0]["id"]
            response = self.make_request("GET", f"/expenses/{expense_id}", token=self.user1_token)
            
            if response and response.status_code == 200:
                data = response.json()
                self.log_test("Get Single Expense", True, f"Retrieved expense: {data['description']}")
            else:
                error_msg = response.text if response else "No response"
                self.log_test("Get Single Expense", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
                
            # Test update expense
            update_data = {
                "amount": 550.0,
                "description": "Updated grocery shopping"
            }
            
            response = self.make_request("PUT", f"/expenses/{expense_id}", update_data, token=self.user1_token)
            
            if response and response.status_code == 200:
                data = response.json()
                self.log_test("Update Expense", True, f"Updated amount: {data['amount']}")
            else:
                error_msg = response.text if response else "No response"
                self.log_test("Update Expense", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")

    def test_expense_filters(self):
        """Test expense filtering"""
        print("\n=== Testing Expense Filters ===")
        
        if not self.user1_token:
            self.log_test("Expense Filters", False, "No token available")
            return
            
        # Test filter by category
        if self.categories:
            params = {"category_id": self.categories[0]["id"]}
            response = self.make_request("GET", "/expenses", token=self.user1_token, params=params)
            
            if response and response.status_code == 200:
                data = response.json()
                self.log_test("Filter by Category", True, f"Found {len(data)} expenses")
            else:
                error_msg = response.text if response else "No response"
                self.log_test("Filter by Category", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
                
        # Test filter by date range
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        params = {
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat()
        }
        
        response = self.make_request("GET", "/expenses", token=self.user1_token, params=params)
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Filter by Date Range", True, f"Found {len(data)} expenses in last 7 days")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Filter by Date Range", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")

    def test_analytics(self):
        """Test analytics APIs"""
        print("\n=== Testing Analytics ===")
        
        if not self.user1_token:
            self.log_test("Analytics", False, "No token available")
            return
            
        # Test summary analytics
        response = self.make_request("GET", "/analytics/summary", token=self.user1_token)
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Analytics Summary", True, f"Total currencies: {len(data.get('total', {}))}")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Analytics Summary", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            
        # Test by-category analytics
        response = self.make_request("GET", "/analytics/by-category", token=self.user1_token)
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Analytics by Category", True, f"Categories with expenses: {len(data)}")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Analytics by Category", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            
        # Test by-member analytics
        response = self.make_request("GET", "/analytics/by-member", token=self.user1_token)
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Analytics by Member", True, f"Members with expenses: {len(data)}")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Analytics by Member", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            
        # Test trends analytics
        response = self.make_request("GET", "/analytics/trends", token=self.user1_token, params={"months": 3})
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Analytics Trends", True, f"Months of data: {len(data)}")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Analytics Trends", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            
        # Test daily analytics
        response = self.make_request("GET", "/analytics/daily", token=self.user1_token, params={"days": 7})
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Analytics Daily", True, f"Days of data: {len(data)}")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Analytics Daily", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")

    def test_currencies(self):
        """Test currencies API"""
        print("\n=== Testing Currencies ===")
        
        response = self.make_request("GET", "/currencies")
        
        if response and response.status_code == 200:
            data = response.json()
            currencies = data.get("currencies", [])
            self.log_test("Get Currencies", True, f"Supported currencies: {', '.join(currencies)}")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Get Currencies", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")

    def test_category_deletion(self):
        """Test category deletion"""
        print("\n=== Testing Category Deletion ===")
        
        if not self.user1_token or not self.categories:
            self.log_test("Category Deletion", False, "Missing token or categories")
            return
            
        # Find a custom category to delete
        custom_category = None
        for cat in self.categories:
            if cat.get("is_custom"):
                custom_category = cat
                break
                
        if not custom_category:
            self.log_test("Category Deletion", False, "No custom category found to delete")
            return
            
        response = self.make_request("DELETE", f"/categories/{custom_category['id']}", token=self.user1_token)
        
        if response and response.status_code == 200:
            self.log_test("Delete Custom Category", True, f"Deleted: {custom_category['name']}")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Delete Custom Category", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Family Finance API Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 60)
        
        # Authentication tests
        self.test_user_registration()
        self.test_user_login()
        self.test_auth_me()
        self.test_profile_update()
        
        # Family tests
        self.test_family_creation()
        self.test_family_join()
        self.test_get_family()
        
        # Categories tests
        self.test_categories()
        
        # Expenses tests
        self.test_expenses_crud()
        self.test_expense_filters()
        
        # Analytics tests
        self.test_analytics()
        
        # Utility tests
        self.test_currencies()
        
        # Cleanup tests
        self.test_category_deletion()
        
        # Print summary
        self.print_summary()
        
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        failed = len(self.test_results) - passed
        
        print(f"Total Tests: {len(self.test_results)}")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"Success Rate: {(passed/len(self.test_results)*100):.1f}%")
        
        if failed > 0:
            print("\n🔍 FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   ❌ {result['test']}: {result['details']}")
        
        print("\n" + "=" * 60)

if __name__ == "__main__":
    tester = FamilyFinanceAPITester()
    tester.run_all_tests()