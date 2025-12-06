#!/usr/bin/env python3
"""
Core Backend API Tests for Family Finance App
Focuses on main functionality without edge case validation
"""

import requests
import json
import uuid
from datetime import datetime, timedelta

# Backend URL from environment
BACKEND_URL = "https://splitfamily.preview.emergentagent.com/api"

class CoreAPITester:
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

    def run_core_tests(self):
        """Run core functionality tests"""
        print("🚀 Starting Core Family Finance API Tests")
        print(f"Backend URL: {BACKEND_URL}")
        print("=" * 60)
        
        # 1. User Registration
        print("\n=== 1. User Registration ===")
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
            return
            
        # 2. User Login
        print("\n=== 2. User Login ===")
        login_data = {
            "email": self.user1_data["email"],
            "pin": "1234"
        }
        
        response = self.make_request("POST", "/auth/login", login_data)
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("User Login", True, f"Token received")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("User Login", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            
        # 3. Get Current User
        print("\n=== 3. Get Current User ===")
        response = self.make_request("GET", "/auth/me", token=self.user1_token)
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Get Current User", True, f"User: {data['name']}")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Get Current User", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            
        # 4. Update Profile
        print("\n=== 4. Update Profile ===")
        update_data = {
            "name": "Rajesh Kumar Updated",
            "default_currency": "USD"
        }
        
        response = self.make_request("PUT", "/auth/profile", update_data, token=self.user1_token)
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Update Profile", True, f"Updated name: {data['name']}, Currency: {data['default_currency']}")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Update Profile", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            
        # 5. Create Family
        print("\n=== 5. Create Family ===")
        family_data = {
            "name": "Kumar Family"
        }
        
        response = self.make_request("POST", "/family/create", family_data, token=self.user1_token)
        
        if response and response.status_code == 200:
            self.family_data = response.json()
            self.log_test("Create Family", True, f"Family ID: {self.family_data['id']}, Invite Code: {self.family_data['invite_code']}")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Create Family", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return
            
        # 6. Register Second User and Join Family
        print("\n=== 6. Second User Registration & Family Join ===")
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
            
            # Join family
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
        else:
            self.log_test("Second User Registration", False, "Failed to register second user")
            
        # 7. Get Family Details
        print("\n=== 7. Get Family Details ===")
        response = self.make_request("GET", "/family", token=self.user1_token)
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Get Family Details", True, f"Family: {data['name']}, Members: {len(data['members'])}")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Get Family Details", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            
        # 8. Get Categories
        print("\n=== 8. Get Categories ===")
        response = self.make_request("GET", "/categories", token=self.user1_token)
        
        if response and response.status_code == 200:
            self.categories = response.json()
            self.log_test("Get Categories", True, f"Found {len(self.categories)} categories")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Get Categories", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            return
            
        # 9. Create Custom Category
        print("\n=== 9. Create Custom Category ===")
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
            
        # 10. Create Expenses (Multi-currency)
        print("\n=== 10. Create Expenses (Multi-currency) ===")
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
        
        for i, expense_data in enumerate(expenses_data):
            response = self.make_request("POST", "/expenses", expense_data, token=self.user1_token)
            
            if response and response.status_code == 200:
                data = response.json()
                self.expenses.append(data)
                self.log_test(f"Create Expense {i+1} ({expense_data['currency']})", True, f"Amount: {data['amount']} {data['currency']}")
            else:
                error_msg = response.text if response else "No response"
                self.log_test(f"Create Expense {i+1}", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
                
        # Add expense from second user
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
                self.log_test("Create Expense - User 2 (SAR)", True, f"Amount: {data['amount']} {data['currency']}")
            else:
                error_msg = response.text if response else "No response"
                self.log_test("Create Expense - User 2", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
                
        # 11. Get Expenses
        print("\n=== 11. Get Expenses ===")
        response = self.make_request("GET", "/expenses", token=self.user1_token)
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Get All Expenses", True, f"Retrieved {len(data)} expenses")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Get All Expenses", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            
        # 12. Get Single Expense
        if self.expenses:
            print("\n=== 12. Get Single Expense ===")
            expense_id = self.expenses[0]["id"]
            response = self.make_request("GET", f"/expenses/{expense_id}", token=self.user1_token)
            
            if response and response.status_code == 200:
                data = response.json()
                self.log_test("Get Single Expense", True, f"Retrieved: {data['description']}")
            else:
                error_msg = response.text if response else "No response"
                self.log_test("Get Single Expense", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
                
            # 13. Update Expense
            print("\n=== 13. Update Expense ===")
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
                
        # 14. Test Expense Filters
        print("\n=== 14. Test Expense Filters ===")
        
        # Filter by category
        if self.categories:
            params = {"category_id": self.categories[0]["id"]}
            response = self.make_request("GET", "/expenses", token=self.user1_token, params=params)
            
            if response and response.status_code == 200:
                data = response.json()
                self.log_test("Filter by Category", True, f"Found {len(data)} expenses")
            else:
                error_msg = response.text if response else "No response"
                self.log_test("Filter by Category", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
                
        # Filter by date range
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
            
        # 15. Test Analytics APIs
        print("\n=== 15. Test Analytics APIs ===")
        
        # Summary analytics
        response = self.make_request("GET", "/analytics/summary", token=self.user1_token)
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Analytics Summary", True, f"Total currencies: {len(data.get('total', {}))}")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Analytics Summary", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            
        # By-category analytics
        response = self.make_request("GET", "/analytics/by-category", token=self.user1_token)
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Analytics by Category", True, f"Categories with expenses: {len(data)}")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Analytics by Category", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            
        # By-member analytics
        response = self.make_request("GET", "/analytics/by-member", token=self.user1_token)
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Analytics by Member", True, f"Members with expenses: {len(data)}")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Analytics by Member", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            
        # Trends analytics
        response = self.make_request("GET", "/analytics/trends", token=self.user1_token, params={"months": 3})
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Analytics Trends", True, f"Months of data: {len(data)}")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Analytics Trends", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            
        # Daily analytics
        response = self.make_request("GET", "/analytics/daily", token=self.user1_token, params={"days": 7})
        
        if response and response.status_code == 200:
            data = response.json()
            self.log_test("Analytics Daily", True, f"Days of data: {len(data)}")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Analytics Daily", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            
        # 16. Test Currencies API
        print("\n=== 16. Test Currencies API ===")
        response = self.make_request("GET", "/currencies")
        
        if response and response.status_code == 200:
            data = response.json()
            currencies = data.get("currencies", [])
            self.log_test("Get Currencies", True, f"Supported currencies: {', '.join(currencies)}")
        else:
            error_msg = response.text if response else "No response"
            self.log_test("Get Currencies", False, f"Status: {response.status_code if response else 'None'}, Error: {error_msg}")
            
        # Print summary
        self.print_summary()
        
    def print_summary(self):
        """Print test summary"""
        print("\n" + "=" * 60)
        print("📊 CORE API TEST SUMMARY")
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
    tester = CoreAPITester()
    tester.run_core_tests()