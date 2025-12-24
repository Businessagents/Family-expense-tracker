#!/usr/bin/env python3
"""
Backend API Testing for Family Finance App - Balance and Settlement Features
Testing the new balance and settlement features as requested.
"""

import requests
import json
import uuid
from datetime import datetime
import time

# Configuration - Using the correct backend URL from frontend/.env
BASE_URL = "https://expensehub-13.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

class FamilyFinanceAPITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.headers = HEADERS.copy()
        self.user1_token = None
        self.user2_token = None
        self.user1_id = None
        self.user2_id = None
        self.group_id = None
        self.category_id = None
        self.test_results = []
        
    def log_test(self, test_name, success, message, response_data=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat()
        }
        if response_data:
            result["response"] = response_data
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        
    def make_request(self, method, endpoint, data=None, headers=None):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}{endpoint}"
        request_headers = headers or self.headers
        
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=request_headers, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, json=data, headers=request_headers, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, json=data, headers=request_headers, timeout=30)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=request_headers, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
                
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            return None
    
    def test_user_registration(self):
        """Test user registration for two users"""
        print("\n=== Testing User Registration ===")
        
        # Register User 1
        user1_data = {
            "name": "Alice Johnson",
            "email": f"alice.{uuid.uuid4().hex[:8]}@example.com",
            "pin": "1234"
        }
        
        response = self.make_request("POST", "/auth/register", user1_data)
        if response and response.status_code == 200:
            data = response.json()
            self.user1_token = data["access_token"]
            self.user1_id = data["user"]["id"]
            self.log_test("User 1 Registration", True, f"User 1 registered successfully: {user1_data['name']}")
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("User 1 Registration", False, f"Failed to register user 1: {error_msg}")
            return False
        
        # Register User 2
        user2_data = {
            "name": "Bob Smith",
            "email": f"bob.{uuid.uuid4().hex[:8]}@example.com",
            "pin": "5678"
        }
        
        response = self.make_request("POST", "/auth/register", user2_data)
        if response and response.status_code == 200:
            data = response.json()
            self.user2_token = data["access_token"]
            self.user2_id = data["user"]["id"]
            self.log_test("User 2 Registration", True, f"User 2 registered successfully: {user2_data['name']}")
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("User 2 Registration", False, f"Failed to register user 2: {error_msg}")
            return False
            
        return True
    
    def test_create_group_with_mode(self):
        """Test creating a group with split mode"""
        print("\n=== Testing Group Creation with Mode ===")
        
        # Set auth header for user 1
        headers = self.headers.copy()
        headers["Authorization"] = f"Bearer {self.user1_token}"
        
        group_data = {
            "name": "Test Shared Group",
            "type": "shared",
            "mode": "split"
        }
        
        response = self.make_request("POST", "/groups", group_data, headers)
        if response and response.status_code == 200:
            data = response.json()
            self.group_id = data["id"]
            invite_code = data.get("invite_code")
            
            # Verify mode is set correctly
            if data.get("mode") == "split":
                self.log_test("Create Group with Split Mode", True, f"Group created with split mode. Invite code: {invite_code}")
                
                # Store invite code for user 2 to join
                self.invite_code = invite_code
                return True
            else:
                self.log_test("Create Group with Split Mode", False, f"Group mode incorrect. Expected 'split', got '{data.get('mode')}'")
                return False
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Create Group with Split Mode", False, f"Failed to create group: {error_msg}")
            return False
    
    def test_user2_join_group(self):
        """Test user 2 joining the group"""
        print("\n=== Testing User 2 Join Group ===")
        
        headers = self.headers.copy()
        headers["Authorization"] = f"Bearer {self.user2_token}"
        
        join_data = {
            "invite_code": self.invite_code
        }
        
        response = self.make_request("POST", "/groups/join", join_data, headers)
        if response and response.status_code == 200:
            data = response.json()
            if len(data.get("members", [])) == 2:
                self.log_test("User 2 Join Group", True, "User 2 successfully joined the group")
                return True
            else:
                self.log_test("User 2 Join Group", False, f"Group should have 2 members, has {len(data.get('members', []))}")
                return False
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("User 2 Join Group", False, f"Failed to join group: {error_msg}")
            return False
    
    def test_get_categories(self):
        """Get categories for expense creation"""
        print("\n=== Getting Categories ===")
        
        headers = self.headers.copy()
        headers["Authorization"] = f"Bearer {self.user1_token}"
        
        response = self.make_request("GET", "/categories", None, headers)
        if response and response.status_code == 200:
            categories = response.json()
            if categories:
                self.category_id = categories[0]["id"]  # Use first category
                self.log_test("Get Categories", True, f"Retrieved {len(categories)} categories")
                return True
            else:
                self.log_test("Get Categories", False, "No categories found")
                return False
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Get Categories", False, f"Failed to get categories: {error_msg}")
            return False
    
    def test_create_expense(self):
        """Test creating an expense paid by user 1"""
        print("\n=== Testing Expense Creation ===")
        
        headers = self.headers.copy()
        headers["Authorization"] = f"Bearer {self.user1_token}"
        
        expense_data = {
            "amount": 100.0,
            "currency": "INR",
            "category_id": self.category_id,
            "group_id": self.group_id,
            "description": "Test expense for balance testing"
        }
        
        response = self.make_request("POST", "/expenses", expense_data, headers)
        if response and response.status_code == 200:
            data = response.json()
            self.expense_id = data["id"]
            self.log_test("Create Expense", True, f"Expense created: ₹{expense_data['amount']} paid by User 1")
            return True
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Create Expense", False, f"Failed to create expense: {error_msg}")
            return False
    
    def test_group_balances(self):
        """Test GET /api/groups/{group_id}/balances"""
        print("\n=== Testing Group Balances ===")
        
        headers = self.headers.copy()
        headers["Authorization"] = f"Bearer {self.user1_token}"
        
        response = self.make_request("GET", f"/groups/{self.group_id}/balances", None, headers)
        if response and response.status_code == 200:
            data = response.json()
            
            # Verify response structure
            required_fields = ["group_id", "group_name", "mode", "member_balances", "debts"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                self.log_test("Group Balances Structure", False, f"Missing fields: {missing_fields}")
                return False
            
            # Verify mode is split
            if data["mode"] != "split":
                self.log_test("Group Balances Mode", False, f"Expected mode 'split', got '{data['mode']}'")
                return False
            
            # Verify member balances
            member_balances = data["member_balances"]
            if len(member_balances) != 2:
                self.log_test("Group Balances Members", False, f"Expected 2 members, got {len(member_balances)}")
                return False
            
            # Find user balances
            user1_balance = None
            user2_balance = None
            
            for member in member_balances:
                if member["user_id"] == self.user1_id:
                    user1_balance = member
                elif member["user_id"] == self.user2_id:
                    user2_balance = member
            
            if not user1_balance or not user2_balance:
                self.log_test("Group Balances Users", False, "Could not find both users in balance data")
                return False
            
            # Verify User 1 paid 100 INR
            user1_paid = user1_balance["total_paid"].get("INR", 0)
            if user1_paid != 100.0:
                self.log_test("User 1 Total Paid", False, f"Expected 100 INR, got {user1_paid}")
                return False
            
            # Verify User 1's share is 50 INR (half of 100)
            user1_share = user1_balance["total_share"].get("INR", 0)
            if user1_share != 50.0:
                self.log_test("User 1 Share", False, f"Expected 50 INR share, got {user1_share}")
                return False
            
            # Verify User 1's net balance is +50 INR (they are owed 50)
            user1_net = user1_balance["net_balance"].get("INR", 0)
            if user1_net != 50.0:
                self.log_test("User 1 Net Balance", False, f"Expected +50 INR net, got {user1_net}")
                return False
            
            # Verify User 2's net balance is -50 INR (they owe 50)
            user2_net = user2_balance["net_balance"].get("INR", 0)
            if user2_net != -50.0:
                self.log_test("User 2 Net Balance", False, f"Expected -50 INR net, got {user2_net}")
                return False
            
            # Verify debts show User 2 owes User 1
            debts = data["debts"]
            if len(debts) != 1:
                self.log_test("Debts Count", False, f"Expected 1 debt, got {len(debts)}")
                return False
            
            debt = debts[0]
            if (debt["from_user_id"] != self.user2_id or 
                debt["to_user_id"] != self.user1_id or 
                debt["amount"] != 50.0 or 
                debt["currency"] != "INR"):
                self.log_test("Debt Details", False, f"Debt details incorrect: {debt}")
                return False
            
            self.log_test("Group Balances", True, "Group balances calculated correctly - User 2 owes User 1 ₹50")
            return True
            
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Group Balances", False, f"Failed to get group balances: {error_msg}")
            return False
    
    def test_overall_balance_summary(self):
        """Test GET /api/balances/summary"""
        print("\n=== Testing Overall Balance Summary ===")
        
        headers = self.headers.copy()
        headers["Authorization"] = f"Bearer {self.user1_token}"
        
        response = self.make_request("GET", "/balances/summary", None, headers)
        if response and response.status_code == 200:
            data = response.json()
            
            # Verify response structure
            required_fields = ["to_pay", "to_receive", "total_to_pay", "total_to_receive"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                self.log_test("Balance Summary Structure", False, f"Missing fields: {missing_fields}")
                return False
            
            # For User 1, they should have money to receive (User 2 owes them)
            to_receive = data["to_receive"]
            total_to_receive = data["total_to_receive"]
            
            if len(to_receive) != 1:
                self.log_test("Balance Summary To Receive Count", False, f"Expected 1 debt to receive, got {len(to_receive)}")
                return False
            
            debt_to_receive = to_receive[0]
            if (debt_to_receive["user_id"] != self.user2_id or 
                debt_to_receive["amount"] != 50.0 or 
                debt_to_receive["currency"] != "INR"):
                self.log_test("Balance Summary Debt Details", False, f"Incorrect debt to receive: {debt_to_receive}")
                return False
            
            if total_to_receive.get("INR") != 50.0:
                self.log_test("Balance Summary Total To Receive", False, f"Expected 50 INR to receive, got {total_to_receive}")
                return False
            
            self.log_test("Overall Balance Summary", True, "Balance summary shows User 1 is owed ₹50 by User 2")
            return True
            
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Overall Balance Summary", False, f"Failed to get balance summary: {error_msg}")
            return False
    
    def test_create_settlement(self):
        """Test POST /api/settlements - User 2 pays User 1"""
        print("\n=== Testing Settlement Creation ===")
        
        headers = self.headers.copy()
        headers["Authorization"] = f"Bearer {self.user2_token}"
        
        settlement_data = {
            "group_id": self.group_id,
            "paid_to": self.user1_id,
            "amount": 50.0,
            "currency": "INR",
            "note": "Settling debt for test expense"
        }
        
        response = self.make_request("POST", "/settlements", settlement_data, headers)
        if response and response.status_code == 200:
            data = response.json()
            self.settlement_id = data["id"]
            
            # Verify settlement details
            if (data["paid_by"] != self.user2_id or 
                data["paid_to"] != self.user1_id or 
                data["amount"] != 50.0 or 
                data["currency"] != "INR"):
                self.log_test("Settlement Details", False, f"Settlement details incorrect: {data}")
                return False
            
            self.log_test("Create Settlement", True, "Settlement created: User 2 paid User 1 ₹50")
            return True
            
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Create Settlement", False, f"Failed to create settlement: {error_msg}")
            return False
    
    def test_get_settlements(self):
        """Test GET /api/settlements"""
        print("\n=== Testing Get Settlements ===")
        
        headers = self.headers.copy()
        headers["Authorization"] = f"Bearer {self.user1_token}"
        
        response = self.make_request("GET", "/settlements", None, headers)
        if response and response.status_code == 200:
            settlements = response.json()
            
            if len(settlements) < 1:
                self.log_test("Get Settlements Count", False, "Expected at least 1 settlement")
                return False
            
            # Find our settlement
            our_settlement = None
            for settlement in settlements:
                if settlement["id"] == self.settlement_id:
                    our_settlement = settlement
                    break
            
            if not our_settlement:
                self.log_test("Get Settlements Find", False, "Could not find our settlement in the list")
                return False
            
            self.log_test("Get Settlements", True, f"Retrieved {len(settlements)} settlements including our test settlement")
            return True
            
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Get Settlements", False, f"Failed to get settlements: {error_msg}")
            return False
    
    def test_balances_after_settlement(self):
        """Test that balances are updated after settlement"""
        print("\n=== Testing Balances After Settlement ===")
        
        headers = self.headers.copy()
        headers["Authorization"] = f"Bearer {self.user1_token}"
        
        response = self.make_request("GET", f"/groups/{self.group_id}/balances", None, headers)
        if response and response.status_code == 200:
            data = response.json()
            
            # Find user balances
            user1_balance = None
            user2_balance = None
            
            for member in data["member_balances"]:
                if member["user_id"] == self.user1_id:
                    user1_balance = member
                elif member["user_id"] == self.user2_id:
                    user2_balance = member
            
            if not user1_balance or not user2_balance:
                self.log_test("Balances After Settlement Users", False, "Could not find both users in balance data")
                return False
            
            # After settlement, net balances should be 0
            user1_net = user1_balance["net_balance"].get("INR", 0)
            user2_net = user2_balance["net_balance"].get("INR", 0)
            
            if abs(user1_net) > 0.01 or abs(user2_net) > 0.01:
                self.log_test("Balances After Settlement", False, f"Expected net balances ~0, got User1: {user1_net}, User2: {user2_net}")
                return False
            
            # Debts should be empty or minimal
            debts = data["debts"]
            if len(debts) > 0:
                # Check if any significant debts remain
                significant_debts = [d for d in debts if d["amount"] > 0.01]
                if significant_debts:
                    self.log_test("Debts After Settlement", False, f"Significant debts remain: {significant_debts}")
                    return False
            
            self.log_test("Balances After Settlement", True, "Balances correctly updated - debts settled")
            return True
            
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Balances After Settlement", False, f"Failed to get balances after settlement: {error_msg}")
            return False
    
    def test_group_mode_toggle(self):
        """Test PUT /api/groups/{group_id}/mode"""
        print("\n=== Testing Group Mode Toggle ===")
        
        headers = self.headers.copy()
        headers["Authorization"] = f"Bearer {self.user1_token}"
        
        # Test changing to contribution mode
        response = self.make_request("PUT", f"/groups/{self.group_id}/mode?mode=contribution", None, headers)
        if response and response.status_code == 200:
            self.log_test("Change to Contribution Mode", True, "Successfully changed group mode to contribution")
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Change to Contribution Mode", False, f"Failed to change mode: {error_msg}")
            return False
        
        # Verify mode change by getting group details
        response = self.make_request("GET", f"/groups/{self.group_id}", None, headers)
        if response and response.status_code == 200:
            data = response.json()
            if data.get("mode") == "contribution":
                self.log_test("Verify Contribution Mode", True, "Group mode successfully changed to contribution")
            else:
                self.log_test("Verify Contribution Mode", False, f"Mode not changed. Expected 'contribution', got '{data.get('mode')}'")
                return False
        else:
            self.log_test("Verify Contribution Mode", False, "Failed to verify mode change")
            return False
        
        # Test changing back to split mode
        response = self.make_request("PUT", f"/groups/{self.group_id}/mode?mode=split", None, headers)
        if response and response.status_code == 200:
            self.log_test("Change Back to Split Mode", True, "Successfully changed group mode back to split")
            return True
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Change Back to Split Mode", False, f"Failed to change mode back: {error_msg}")
            return False
    
    def test_contribution_mode_behavior(self):
        """Test that contribution mode doesn't track debts"""
        print("\n=== Testing Contribution Mode Behavior ===")
        
        headers = self.headers.copy()
        headers["Authorization"] = f"Bearer {self.user1_token}"
        
        # First, set group to contribution mode
        response = self.make_request("PUT", f"/groups/{self.group_id}/mode?mode=contribution", None, headers)
        if not response or response.status_code != 200:
            self.log_test("Set Contribution Mode", False, "Failed to set contribution mode")
            return False
        
        # Create another expense
        expense_data = {
            "amount": 200.0,
            "currency": "INR",
            "category_id": self.category_id,
            "group_id": self.group_id,
            "description": "Test expense in contribution mode"
        }
        
        response = self.make_request("POST", "/expenses", expense_data, headers)
        if not response or response.status_code != 200:
            self.log_test("Create Expense in Contribution Mode", False, "Failed to create expense in contribution mode")
            return False
        
        # Check balances - in contribution mode, debts should be empty
        response = self.make_request("GET", f"/groups/{self.group_id}/balances", None, headers)
        if response and response.status_code == 200:
            data = response.json()
            
            if data["mode"] != "contribution":
                self.log_test("Contribution Mode Check", False, f"Expected contribution mode, got {data['mode']}")
                return False
            
            # In contribution mode, debts should be empty (no debt tracking)
            debts = data["debts"]
            if len(debts) > 0:
                self.log_test("Contribution Mode Debts", False, f"Expected no debts in contribution mode, got {len(debts)}")
                return False
            
            # But member balances should still show contributions
            member_balances = data["member_balances"]
            user1_balance = None
            for member in member_balances:
                if member["user_id"] == self.user1_id:
                    user1_balance = member
                    break
            
            if not user1_balance:
                self.log_test("Contribution Mode User Balance", False, "Could not find user 1 balance")
                return False
            
            # User 1 should have paid money (contributions tracked)
            user1_paid = user1_balance["total_paid"].get("INR", 0)
            if user1_paid <= 0:
                self.log_test("Contribution Mode Contributions", False, f"Expected positive contributions, got {user1_paid}")
                return False
            
            self.log_test("Contribution Mode Behavior", True, "Contribution mode correctly shows contributions but no debts")
            return True
            
        else:
            error_msg = response.json().get("detail", "Unknown error") if response else "No response"
            self.log_test("Contribution Mode Behavior", False, f"Failed to check contribution mode behavior: {error_msg}")
            return False
    
    def run_all_tests(self):
        """Run all balance and settlement tests"""
        print("🚀 Starting Family Finance API Balance & Settlement Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        # Test sequence as requested
        tests = [
            self.test_user_registration,
            self.test_create_group_with_mode,
            self.test_user2_join_group,
            self.test_get_categories,
            self.test_create_expense,
            self.test_group_balances,
            self.test_overall_balance_summary,
            self.test_create_settlement,
            self.test_get_settlements,
            self.test_balances_after_settlement,
            self.test_group_mode_toggle,
            self.test_contribution_mode_behavior
        ]
        
        passed = 0
        failed = 0
        
        for test in tests:
            try:
                if test():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"❌ FAIL: {test.__name__} - Exception: {str(e)}")
                self.log_test(test.__name__, False, f"Exception: {str(e)}")
                failed += 1
            
            # Small delay between tests
            time.sleep(0.5)
        
        # Print summary
        print("\n" + "=" * 60)
        print("🏁 TEST SUMMARY")
        print("=" * 60)
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📊 Total: {passed + failed}")
        print(f"📈 Success Rate: {(passed/(passed+failed)*100):.1f}%" if (passed+failed) > 0 else "0%")
        
        if failed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"  - {result['test']}: {result['message']}")
        
        return passed, failed

if __name__ == "__main__":
    tester = FamilyFinanceAPITester()
    passed, failed = tester.run_all_tests()
    
    # Exit with error code if any tests failed
    exit(0 if failed == 0 else 1)