from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timedelta
from passlib.context import CryptContext
from jose import JWTError, jwt
import random
import string
import csv
import io

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
SECRET_KEY = os.environ["SECRET_KEY"]
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30
SESSION_TIMEOUT_MINUTES = 30  # Auto-logout after 30 minutes of inactivity

# CORS
DEFAULT_CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:8081",
    "http://localhost:19000",
    "http://localhost:19006",
]

raw_cors_origins = os.environ.get("CORS_ALLOW_ORIGINS", "")
cors_origins = [origin.strip() for origin in raw_cors_origins.split(",") if origin.strip()] or DEFAULT_CORS_ORIGINS
allow_credentials = "*" not in cors_origins

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI(title="Family Expense Tracker API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

# Currency options
CURRENCIES = ["INR", "USD", "CAD", "SAR"]
CURRENCY_SYMBOLS = {"INR": "₹", "USD": "$", "CAD": "C$", "SAR": "﷼"}

# Default categories
DEFAULT_CATEGORIES = [
    {"name": "Groceries", "icon": "cart", "color": "#4CAF50"},
    {"name": "Utilities", "icon": "flash", "color": "#FF9800"},
    {"name": "Rent", "icon": "home", "color": "#9C27B0"},
    {"name": "Transport", "icon": "car", "color": "#2196F3"},
    {"name": "Entertainment", "icon": "film", "color": "#E91E63"},
    {"name": "Healthcare", "icon": "medkit", "color": "#F44336"},
    {"name": "Food & Dining", "icon": "restaurant", "color": "#FF5722"},
    {"name": "Shopping", "icon": "bag", "color": "#673AB7"},
    {"name": "Education", "icon": "school", "color": "#00BCD4"},
    {"name": "Others", "icon": "ellipsis-horizontal", "color": "#607D8B"}
]

AVATAR_COLORS = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F"]
GROUP_COLORS = ["#22D3EE", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899", "#06B6D4", "#84CC16"]

# ==================== PYDANTIC MODELS ====================

class UserCreate(BaseModel):
    name: str
    email: str
    pin: str  # 4-6 digit PIN

class UserLogin(BaseModel):
    email: str
    pin: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    avatar_color: str
    default_currency: str = "INR"
    biometric_enabled: bool = False
    auto_lock_enabled: bool = True
    auto_lock_timeout: int = 5  # minutes
    created_at: datetime

class GroupCreate(BaseModel):
    name: str
    type: str = "shared"  # "personal" or "shared"
    mode: str = "split"  # "split" (track debts) or "contribution" (family mode - no debt tracking)

class GroupJoin(BaseModel):
    invite_code: str

class GroupResponse(BaseModel):
    id: str
    name: str
    type: str  # "personal" or "shared"
    mode: str = "split"  # "split" or "contribution"
    invite_code: Optional[str] = None
    color: str
    members: List[dict]
    created_by: str
    created_at: datetime

class SettlementCreate(BaseModel):
    group_id: str
    paid_to: str  # User ID who received the payment
    amount: float
    currency: str = "INR"
    note: str = ""

class SettlementResponse(BaseModel):
    id: str
    group_id: str
    group_name: str
    paid_by: str
    paid_by_name: str
    paid_to: str
    paid_to_name: str
    amount: float
    currency: str
    note: str
    date: datetime

class MemberBalance(BaseModel):
    user_id: str
    name: str
    avatar_color: str
    total_paid: dict  # {currency: amount}
    total_share: dict  # {currency: amount}
    net_balance: dict  # {currency: amount} - positive means owed to them

class GroupBalanceResponse(BaseModel):
    group_id: str
    group_name: str
    mode: str
    member_balances: List[MemberBalance]
    debts: List[dict]  # Who owes whom (only for split mode)

class CategoryCreate(BaseModel):
    name: str
    icon: str = "ellipsis-horizontal"
    color: str = "#607D8B"

class CategoryResponse(BaseModel):
    id: str
    name: str
    icon: str
    color: str
    is_custom: bool
    group_id: Optional[str] = None

class ExpenseCreate(BaseModel):
    amount: float
    currency: str = "INR"
    category_id: str
    group_id: str
    description: str = ""
    date: Optional[datetime] = None

class ExpenseUpdate(BaseModel):
    amount: Optional[float] = None
    currency: Optional[str] = None
    category_id: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None

class ExpenseResponse(BaseModel):
    id: str
    amount: float
    currency: str
    category_id: str
    category_name: str
    category_icon: str
    category_color: str
    description: str
    paid_by: str
    paid_by_name: str
    paid_by_color: str
    group_id: str
    group_name: str
    date: datetime
    created_at: datetime

class UpdateProfile(BaseModel):
    name: Optional[str] = None
    default_currency: Optional[str] = None
    biometric_enabled: Optional[bool] = None
    auto_lock_enabled: Optional[bool] = None
    auto_lock_timeout: Optional[int] = None

class UpdatePin(BaseModel):
    current_pin: str
    new_pin: str

class VerifyPin(BaseModel):
    pin: str

class ExportRequest(BaseModel):
    group_id: Optional[str] = None  # None = all groups
    export_type: str = "all"  # "monthly", "all", "range"
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    month: Optional[int] = None  # For monthly export
    year: Optional[int] = None  # For monthly export

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# ==================== HELPER FUNCTIONS ====================

def hash_pin(pin: str) -> str:
    return pwd_context.hash(pin)

def verify_pin(plain_pin: str, hashed_pin: str) -> bool:
    return pwd_context.verify(plain_pin, hashed_pin)

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def generate_invite_code():
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = await db.users.find_one({"id": user_id})
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        
        # Update last activity for session management
        await db.users.update_one({"id": user_id}, {"$set": {"last_activity": datetime.utcnow()}})
        
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_category_info(category_id: str, group_id: str = None):
    # Check custom categories first
    if group_id:
        category = await db.categories.find_one({"id": category_id, "group_id": group_id})
        if category:
            return category
    # Check default categories
    category = await db.categories.find_one({"id": category_id, "group_id": None})
    if category:
        return category
    return {"name": "Unknown", "icon": "help-circle", "color": "#999999"}

async def get_user_info(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if user:
        return {"name": user.get("name", "Unknown"), "color": user.get("avatar_color", "#999999")}
    return {"name": "Unknown", "color": "#999999"}

async def get_group_info(group_id: str):
    group = await db.groups.find_one({"id": group_id})
    if group:
        return {"name": group.get("name", "Unknown"), "color": group.get("color", "#999999")}
    return {"name": "Unknown", "color": "#999999"}

async def create_personal_group(user_id: str, user_name: str):
    """Create a personal group for a new user"""
    group_id = str(uuid.uuid4())
    group = {
        "id": group_id,
        "name": f"{user_name}'s Personal",
        "type": "personal",
        "invite_code": None,
        "color": random.choice(GROUP_COLORS),
        "members": [user_id],
        "created_by": user_id,
        "created_at": datetime.utcnow()
    }
    await db.groups.insert_one(group)
    return group_id

async def ensure_default_categories():
    """Ensure default categories exist"""
    existing = await db.categories.find_one({"group_id": None})
    if not existing:
        for cat in DEFAULT_CATEGORIES:
            await db.categories.insert_one({
                "id": str(uuid.uuid4()),
                "name": cat["name"],
                "icon": cat["icon"],
                "color": cat["color"],
                "is_custom": False,
                "group_id": None
            })

# ==================== AUTH ROUTES ====================

@api_router.post("/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    # Check if user exists
    existing = await db.users.find_one({"email": user_data.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Validate PIN
    if not user_data.pin.isdigit() or len(user_data.pin) < 4 or len(user_data.pin) > 6:
        raise HTTPException(status_code=400, detail="PIN must be 4-6 digits")
    
    user_id = str(uuid.uuid4())
    avatar_color = random.choice(AVATAR_COLORS)
    
    user = {
        "id": user_id,
        "name": user_data.name,
        "email": user_data.email.lower(),
        "pin_hash": hash_pin(user_data.pin),
        "avatar_color": avatar_color,
        "default_currency": "INR",
        "biometric_enabled": False,
        "auto_lock_enabled": True,
        "auto_lock_timeout": 5,
        "last_activity": datetime.utcnow(),
        "created_at": datetime.utcnow()
    }
    
    await db.users.insert_one(user)
    
    # Create personal group for the user
    await create_personal_group(user_id, user_data.name)
    
    # Ensure default categories exist
    await ensure_default_categories()
    
    access_token = create_access_token({"sub": user_id})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user_id,
            name=user_data.name,
            email=user_data.email.lower(),
            avatar_color=avatar_color,
            default_currency="INR",
            biometric_enabled=False,
            auto_lock_enabled=True,
            auto_lock_timeout=5,
            created_at=user["created_at"]
        )
    )

@api_router.post("/auth/login", response_model=Token)
async def login(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email.lower()})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or PIN")
    
    if not verify_pin(login_data.pin, user["pin_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or PIN")
    
    # Update last activity
    await db.users.update_one({"id": user["id"]}, {"$set": {"last_activity": datetime.utcnow()}})
    
    access_token = create_access_token({"sub": user["id"]})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            avatar_color=user["avatar_color"],
            default_currency=user.get("default_currency", "INR"),
            biometric_enabled=user.get("biometric_enabled", False),
            auto_lock_enabled=user.get("auto_lock_enabled", True),
            auto_lock_timeout=user.get("auto_lock_timeout", 5),
            created_at=user["created_at"]
        )
    )

@api_router.post("/auth/verify-pin")
async def verify_user_pin(pin_data: VerifyPin, current_user: dict = Depends(get_current_user)):
    """Verify PIN for app unlock"""
    if not verify_pin(pin_data.pin, current_user["pin_hash"]):
        raise HTTPException(status_code=401, detail="Invalid PIN")
    
    # Update last activity
    await db.users.update_one({"id": current_user["id"]}, {"$set": {"last_activity": datetime.utcnow()}})
    
    return {"success": True, "message": "PIN verified"}

@api_router.put("/auth/update-pin")
async def update_pin(pin_data: UpdatePin, current_user: dict = Depends(get_current_user)):
    """Update user PIN"""
    if not verify_pin(pin_data.current_pin, current_user["pin_hash"]):
        raise HTTPException(status_code=401, detail="Current PIN is incorrect")
    
    if not pin_data.new_pin.isdigit() or len(pin_data.new_pin) < 4 or len(pin_data.new_pin) > 6:
        raise HTTPException(status_code=400, detail="New PIN must be 4-6 digits")
    
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"pin_hash": hash_pin(pin_data.new_pin)}}
    )
    
    return {"success": True, "message": "PIN updated successfully"}

@api_router.get("/auth/session")
async def check_session(current_user: dict = Depends(get_current_user)):
    """Check if session is still valid based on last activity"""
    last_activity = current_user.get("last_activity", datetime.utcnow())
    auto_lock_timeout = current_user.get("auto_lock_timeout", 5)
    auto_lock_enabled = current_user.get("auto_lock_enabled", True)
    
    if auto_lock_enabled:
        time_since_activity = (datetime.utcnow() - last_activity).total_seconds() / 60
        if time_since_activity > auto_lock_timeout:
            return {"session_valid": False, "requires_unlock": True}
    
    return {"session_valid": True, "requires_unlock": False}

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        avatar_color=current_user["avatar_color"],
        default_currency=current_user.get("default_currency", "INR"),
        biometric_enabled=current_user.get("biometric_enabled", False),
        auto_lock_enabled=current_user.get("auto_lock_enabled", True),
        auto_lock_timeout=current_user.get("auto_lock_timeout", 5),
        created_at=current_user["created_at"]
    )

@api_router.put("/auth/profile", response_model=UserResponse)
async def update_profile(profile_data: UpdateProfile, current_user: dict = Depends(get_current_user)):
    update_data = {}
    if profile_data.name:
        update_data["name"] = profile_data.name
    if profile_data.default_currency and profile_data.default_currency in CURRENCIES:
        update_data["default_currency"] = profile_data.default_currency
    if profile_data.biometric_enabled is not None:
        update_data["biometric_enabled"] = profile_data.biometric_enabled
    if profile_data.auto_lock_enabled is not None:
        update_data["auto_lock_enabled"] = profile_data.auto_lock_enabled
    if profile_data.auto_lock_timeout is not None:
        update_data["auto_lock_timeout"] = profile_data.auto_lock_timeout
    
    if update_data:
        await db.users.update_one({"id": current_user["id"]}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"id": current_user["id"]})
    
    return UserResponse(
        id=updated_user["id"],
        name=updated_user["name"],
        email=updated_user["email"],
        avatar_color=updated_user["avatar_color"],
        default_currency=updated_user.get("default_currency", "INR"),
        biometric_enabled=updated_user.get("biometric_enabled", False),
        auto_lock_enabled=updated_user.get("auto_lock_enabled", True),
        auto_lock_timeout=updated_user.get("auto_lock_timeout", 5),
        created_at=updated_user["created_at"]
    )

# ==================== GROUP ROUTES ====================

@api_router.get("/groups", response_model=List[GroupResponse])
async def get_groups(current_user: dict = Depends(get_current_user)):
    """Get all groups the user is a member of"""
    groups_cursor = db.groups.find({"members": current_user["id"]})
    groups = []
    
    async for group in groups_cursor:
        # Get member details
        members = []
        for member_id in group.get("members", []):
            user = await db.users.find_one({"id": member_id}, {"id": 1, "name": 1, "avatar_color": 1})
            if user:
                members.append({
                    "id": user["id"],
                    "name": user["name"],
                    "avatar_color": user["avatar_color"]
                })
        
        groups.append(GroupResponse(
            id=group["id"],
            name=group["name"],
            type=group.get("type", "shared"),
            mode=group.get("mode", "split"),
            invite_code=group.get("invite_code"),
            color=group.get("color", "#22D3EE"),
            members=members,
            created_by=group["created_by"],
            created_at=group["created_at"]
        ))
    
    return groups

@api_router.post("/groups", response_model=GroupResponse)
async def create_group(group_data: GroupCreate, current_user: dict = Depends(get_current_user)):
    """Create a new group"""
    group_id = str(uuid.uuid4())
    invite_code = generate_invite_code() if group_data.type == "shared" else None
    
    # Ensure unique invite code
    if invite_code:
        while await db.groups.find_one({"invite_code": invite_code}):
            invite_code = generate_invite_code()
    
    # Personal groups always use contribution mode (no debt tracking)
    mode = "contribution" if group_data.type == "personal" else group_data.mode
    
    group = {
        "id": group_id,
        "name": group_data.name,
        "type": group_data.type,
        "mode": mode,
        "invite_code": invite_code,
        "color": random.choice(GROUP_COLORS),
        "members": [current_user["id"]],
        "created_by": current_user["id"],
        "created_at": datetime.utcnow()
    }
    
    await db.groups.insert_one(group)
    
    members = [{
        "id": current_user["id"],
        "name": current_user["name"],
        "avatar_color": current_user["avatar_color"]
    }]
    
    return GroupResponse(
        id=group_id,
        name=group_data.name,
        type=group_data.type,
        mode=mode,
        invite_code=invite_code,
        color=group["color"],
        members=members,
        created_by=current_user["id"],
        created_at=group["created_at"]
    )

@api_router.get("/groups/{group_id}", response_model=GroupResponse)
async def get_group(group_id: str, current_user: dict = Depends(get_current_user)):
    """Get group details"""
    group = await db.groups.find_one({"id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    if current_user["id"] not in group.get("members", []):
        raise HTTPException(status_code=403, detail="Not a member of this group")
    
    # Get member details
    members = []
    for member_id in group.get("members", []):
        user = await db.users.find_one({"id": member_id}, {"id": 1, "name": 1, "avatar_color": 1})
        if user:
            members.append({
                "id": user["id"],
                "name": user["name"],
                "avatar_color": user["avatar_color"]
            })
    
    return GroupResponse(
        id=group["id"],
        name=group["name"],
        type=group.get("type", "shared"),
        mode=group.get("mode", "split"),
        invite_code=group.get("invite_code"),
        color=group.get("color", "#22D3EE"),
        members=members,
        created_by=group["created_by"],
        created_at=group["created_at"]
    )

@api_router.put("/groups/{group_id}", response_model=GroupResponse)
async def update_group(group_id: str, group_data: GroupCreate, current_user: dict = Depends(get_current_user)):
    """Update group details"""
    group = await db.groups.find_one({"id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    if current_user["id"] not in group.get("members", []):
        raise HTTPException(status_code=403, detail="Not a member of this group")
    
    if group.get("type") == "personal":
        raise HTTPException(status_code=400, detail="Cannot modify personal group")
    
    await db.groups.update_one({"id": group_id}, {"$set": {"name": group_data.name}})
    
    updated_group = await db.groups.find_one({"id": group_id})
    
    # Get member details
    members = []
    for member_id in updated_group.get("members", []):
        user = await db.users.find_one({"id": member_id}, {"id": 1, "name": 1, "avatar_color": 1})
        if user:
            members.append({
                "id": user["id"],
                "name": user["name"],
                "avatar_color": user["avatar_color"]
            })
    
    return GroupResponse(
        id=updated_group["id"],
        name=updated_group["name"],
        type=updated_group.get("type", "shared"),
        invite_code=updated_group.get("invite_code"),
        color=updated_group.get("color", "#22D3EE"),
        members=members,
        created_by=updated_group["created_by"],
        created_at=updated_group["created_at"]
    )

@api_router.post("/groups/join", response_model=GroupResponse)
async def join_group(join_data: GroupJoin, current_user: dict = Depends(get_current_user)):
    """Join a group with invite code"""
    group = await db.groups.find_one({"invite_code": join_data.invite_code.upper()})
    if not group:
        raise HTTPException(status_code=404, detail="Invalid invite code")
    
    if current_user["id"] in group.get("members", []):
        raise HTTPException(status_code=400, detail="Already a member of this group")
    
    # Add user to group
    await db.groups.update_one(
        {"id": group["id"]},
        {"$push": {"members": current_user["id"]}}
    )
    
    # Get updated group
    updated_group = await db.groups.find_one({"id": group["id"]})
    
    # Get member details
    members = []
    for member_id in updated_group.get("members", []):
        user = await db.users.find_one({"id": member_id}, {"id": 1, "name": 1, "avatar_color": 1})
        if user:
            members.append({
                "id": user["id"],
                "name": user["name"],
                "avatar_color": user["avatar_color"]
            })
    
    return GroupResponse(
        id=updated_group["id"],
        name=updated_group["name"],
        type=updated_group.get("type", "shared"),
        invite_code=updated_group.get("invite_code"),
        color=updated_group.get("color", "#22D3EE"),
        members=members,
        created_by=updated_group["created_by"],
        created_at=updated_group["created_at"]
    )

@api_router.post("/groups/{group_id}/leave")
async def leave_group(group_id: str, current_user: dict = Depends(get_current_user)):
    """Leave a group"""
    group = await db.groups.find_one({"id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    if group.get("type") == "personal":
        raise HTTPException(status_code=400, detail="Cannot leave personal group")
    
    if current_user["id"] not in group.get("members", []):
        raise HTTPException(status_code=400, detail="Not a member of this group")
    
    # Remove user from group
    await db.groups.update_one(
        {"id": group_id},
        {"$pull": {"members": current_user["id"]}}
    )
    
    return {"message": "Successfully left the group"}

@api_router.delete("/groups/{group_id}")
async def delete_group(group_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a group (only creator can delete)"""
    group = await db.groups.find_one({"id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    if group.get("type") == "personal":
        raise HTTPException(status_code=400, detail="Cannot delete personal group")
    
    if group["created_by"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Only the creator can delete this group")
    
    # Delete all expenses in this group
    await db.expenses.delete_many({"group_id": group_id})
    
    # Delete custom categories for this group
    await db.categories.delete_many({"group_id": group_id})
    
    # Delete the group
    await db.groups.delete_one({"id": group_id})
    
    return {"message": "Group deleted successfully"}

# ==================== BALANCE & SETTLEMENT ROUTES ====================

@api_router.get("/groups/{group_id}/balances")
async def get_group_balances(group_id: str, current_user: dict = Depends(get_current_user)):
    """Get balance summary for a group showing contributions and debts"""
    group = await db.groups.find_one({"id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    if current_user["id"] not in group.get("members", []):
        raise HTTPException(status_code=403, detail="Not a member of this group")
    
    mode = group.get("mode", "split")
    
    # Get all expenses for this group
    expenses = await db.expenses.find({"group_id": group_id}).to_list(length=10000)
    
    # Get all settlements for this group
    settlements = await db.settlements.find({"group_id": group_id}).to_list(length=10000)
    
    # Get member details
    members = {}
    for member_id in group.get("members", []):
        user = await db.users.find_one({"id": member_id})
        if user:
            members[member_id] = {
                "id": member_id,
                "name": user["name"],
                "avatar_color": user["avatar_color"]
            }
    
    # Calculate balances per currency
    member_balances = {}
    for member_id in members:
        member_balances[member_id] = {
            "total_paid": {},     # What they actually paid
            "total_share": {},    # What they should have paid (equal split)
            "net_balance": {}     # Difference (positive = owed to them)
        }
    
    num_members = len(members)
    
    # Process expenses
    for expense in expenses:
        currency = expense["currency"]
        amount = expense["amount"]
        paid_by = expense["paid_by"]
        
        if paid_by not in member_balances:
            continue
        
        # Add to payer's total paid
        if currency not in member_balances[paid_by]["total_paid"]:
            member_balances[paid_by]["total_paid"][currency] = 0
        member_balances[paid_by]["total_paid"][currency] += amount
        
        # Calculate each member's share (equal split)
        share_per_person = amount / num_members
        for member_id in members:
            if currency not in member_balances[member_id]["total_share"]:
                member_balances[member_id]["total_share"][currency] = 0
            member_balances[member_id]["total_share"][currency] += share_per_person
    
    # Process settlements
    for settlement in settlements:
        currency = settlement["currency"]
        amount = settlement["amount"]
        paid_by = settlement["paid_by"]
        paid_to = settlement["paid_to"]
        
        # Settlement reduces what paid_by owes and what paid_to is owed
        if paid_by in member_balances:
            if currency not in member_balances[paid_by]["total_paid"]:
                member_balances[paid_by]["total_paid"][currency] = 0
            member_balances[paid_by]["total_paid"][currency] += amount
        
        if paid_to in member_balances:
            if currency not in member_balances[paid_to]["total_share"]:
                member_balances[paid_to]["total_share"][currency] = 0
            member_balances[paid_to]["total_share"][currency] += amount
    
    # Calculate net balance for each member
    for member_id, balances in member_balances.items():
        all_currencies = set(list(balances["total_paid"].keys()) + list(balances["total_share"].keys()))
        for currency in all_currencies:
            paid = balances["total_paid"].get(currency, 0)
            share = balances["total_share"].get(currency, 0)
            balances["net_balance"][currency] = round(paid - share, 2)
    
    # Calculate simplified debts (who owes whom) - only for split mode
    debts = []
    if mode == "split":
        # Group debts by currency
        currency_debts = {}
        for member_id, balances in member_balances.items():
            for currency, net in balances["net_balance"].items():
                if currency not in currency_debts:
                    currency_debts[currency] = {}
                currency_debts[currency][member_id] = net
        
        # Calculate simplified debts for each currency
        for currency, net_balances in currency_debts.items():
            # Separate into creditors and debtors
            creditors = [(mid, amt) for mid, amt in net_balances.items() if amt > 0]
            debtors = [(mid, -amt) for mid, amt in net_balances.items() if amt < 0]
            
            # Sort by amount
            creditors.sort(key=lambda x: x[1], reverse=True)
            debtors.sort(key=lambda x: x[1], reverse=True)
            
            # Match debtors to creditors
            i, j = 0, 0
            while i < len(debtors) and j < len(creditors):
                debtor_id, debt_amount = debtors[i]
                creditor_id, credit_amount = creditors[j]
                
                settle_amount = min(debt_amount, credit_amount)
                
                if settle_amount > 0.01:  # Ignore tiny amounts
                    debts.append({
                        "from_user_id": debtor_id,
                        "from_user_name": members[debtor_id]["name"],
                        "from_avatar_color": members[debtor_id]["avatar_color"],
                        "to_user_id": creditor_id,
                        "to_user_name": members[creditor_id]["name"],
                        "to_avatar_color": members[creditor_id]["avatar_color"],
                        "amount": round(settle_amount, 2),
                        "currency": currency
                    })
                
                debtors[i] = (debtor_id, debt_amount - settle_amount)
                creditors[j] = (creditor_id, credit_amount - settle_amount)
                
                if debtors[i][1] < 0.01:
                    i += 1
                if creditors[j][1] < 0.01:
                    j += 1
    
    # Format response
    member_balance_list = []
    for member_id, member_info in members.items():
        balances = member_balances.get(member_id, {"total_paid": {}, "total_share": {}, "net_balance": {}})
        member_balance_list.append({
            "user_id": member_id,
            "name": member_info["name"],
            "avatar_color": member_info["avatar_color"],
            "total_paid": balances["total_paid"],
            "total_share": balances["total_share"],
            "net_balance": balances["net_balance"]
        })
    
    return {
        "group_id": group_id,
        "group_name": group["name"],
        "mode": mode,
        "member_balances": member_balance_list,
        "debts": debts
    }

@api_router.post("/settlements")
async def create_settlement(settlement_data: SettlementCreate, current_user: dict = Depends(get_current_user)):
    """Record a settlement payment between two users"""
    group = await db.groups.find_one({"id": settlement_data.group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    if current_user["id"] not in group.get("members", []):
        raise HTTPException(status_code=403, detail="Not a member of this group")
    
    if settlement_data.paid_to not in group.get("members", []):
        raise HTTPException(status_code=400, detail="Recipient is not a member of this group")
    
    if settlement_data.paid_to == current_user["id"]:
        raise HTTPException(status_code=400, detail="Cannot settle with yourself")
    
    # Get user details
    paid_to_user = await db.users.find_one({"id": settlement_data.paid_to})
    if not paid_to_user:
        raise HTTPException(status_code=404, detail="Recipient user not found")
    
    settlement_id = str(uuid.uuid4())
    settlement = {
        "id": settlement_id,
        "group_id": settlement_data.group_id,
        "paid_by": current_user["id"],
        "paid_to": settlement_data.paid_to,
        "amount": settlement_data.amount,
        "currency": settlement_data.currency,
        "note": settlement_data.note,
        "date": datetime.utcnow()
    }
    
    await db.settlements.insert_one(settlement)
    
    return {
        "id": settlement_id,
        "group_id": settlement_data.group_id,
        "group_name": group["name"],
        "paid_by": current_user["id"],
        "paid_by_name": current_user["name"],
        "paid_to": settlement_data.paid_to,
        "paid_to_name": paid_to_user["name"],
        "amount": settlement_data.amount,
        "currency": settlement_data.currency,
        "note": settlement_data.note,
        "date": settlement["date"]
    }

@api_router.get("/settlements")
async def get_settlements(group_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    """Get settlements for the user"""
    query = {"$or": [{"paid_by": current_user["id"]}, {"paid_to": current_user["id"]}]}
    
    if group_id:
        query["group_id"] = group_id
    
    settlements_cursor = db.settlements.find(query).sort("date", -1)
    settlements = []
    
    async for settlement in settlements_cursor:
        # Get group name
        group = await db.groups.find_one({"id": settlement["group_id"]})
        group_name = group["name"] if group else "Unknown"
        
        # Get user names
        paid_by_user = await db.users.find_one({"id": settlement["paid_by"]})
        paid_to_user = await db.users.find_one({"id": settlement["paid_to"]})
        
        settlements.append({
            "id": settlement["id"],
            "group_id": settlement["group_id"],
            "group_name": group_name,
            "paid_by": settlement["paid_by"],
            "paid_by_name": paid_by_user["name"] if paid_by_user else "Unknown",
            "paid_to": settlement["paid_to"],
            "paid_to_name": paid_to_user["name"] if paid_to_user else "Unknown",
            "amount": settlement["amount"],
            "currency": settlement["currency"],
            "note": settlement.get("note", ""),
            "date": settlement["date"]
        })
    
    return settlements

@api_router.get("/balances/summary")
async def get_all_balances(current_user: dict = Depends(get_current_user)):
    """Get overall balance summary across all groups (what you owe/are owed)"""
    # Get all user's groups
    groups = await db.groups.find({"members": current_user["id"], "mode": "split"}).to_list(length=100)
    
    all_debts_to_pay = []  # What current user owes to others
    all_debts_to_receive = []  # What others owe to current user
    
    for group in groups:
        # Get balances for this group
        group_id = group["id"]
        expenses = await db.expenses.find({"group_id": group_id}).to_list(length=10000)
        settlements = await db.settlements.find({"group_id": group_id}).to_list(length=10000)
        
        members = {}
        for member_id in group.get("members", []):
            user = await db.users.find_one({"id": member_id})
            if user:
                members[member_id] = {"name": user["name"], "avatar_color": user["avatar_color"]}
        
        if len(members) < 2:
            continue
        
        # Calculate net balances
        member_net = {mid: {} for mid in members}
        num_members = len(members)
        
        for expense in expenses:
            currency = expense["currency"]
            amount = expense["amount"]
            paid_by = expense["paid_by"]
            share_per_person = amount / num_members
            
            for member_id in members:
                if currency not in member_net[member_id]:
                    member_net[member_id][currency] = 0
                if member_id == paid_by:
                    member_net[member_id][currency] += amount - share_per_person
                else:
                    member_net[member_id][currency] -= share_per_person
        
        for settlement in settlements:
            currency = settlement["currency"]
            amount = settlement["amount"]
            paid_by = settlement["paid_by"]
            paid_to = settlement["paid_to"]
            
            if paid_by in member_net:
                if currency not in member_net[paid_by]:
                    member_net[paid_by][currency] = 0
                member_net[paid_by][currency] += amount
            
            if paid_to in member_net:
                if currency not in member_net[paid_to]:
                    member_net[paid_to][currency] = 0
                member_net[paid_to][currency] -= amount
        
        # Calculate debts for current user
        current_user_net = member_net.get(current_user["id"], {})
        
        for currency, net in current_user_net.items():
            if abs(net) < 0.01:
                continue
            
            if net < 0:
                # Current user owes money - find who to pay
                for other_id, other_net in member_net.items():
                    if other_id == current_user["id"]:
                        continue
                    other_balance = other_net.get(currency, 0)
                    if other_balance > 0.01:
                        owe_amount = min(-net, other_balance)
                        if owe_amount > 0.01:
                            all_debts_to_pay.append({
                                "group_id": group_id,
                                "group_name": group["name"],
                                "user_id": other_id,
                                "user_name": members[other_id]["name"],
                                "avatar_color": members[other_id]["avatar_color"],
                                "amount": round(owe_amount, 2),
                                "currency": currency
                            })
                            net += owe_amount
                            if net >= -0.01:
                                break
            elif net > 0:
                # Current user is owed money
                for other_id, other_net in member_net.items():
                    if other_id == current_user["id"]:
                        continue
                    other_balance = other_net.get(currency, 0)
                    if other_balance < -0.01:
                        owed_amount = min(net, -other_balance)
                        if owed_amount > 0.01:
                            all_debts_to_receive.append({
                                "group_id": group_id,
                                "group_name": group["name"],
                                "user_id": other_id,
                                "user_name": members[other_id]["name"],
                                "avatar_color": members[other_id]["avatar_color"],
                                "amount": round(owed_amount, 2),
                                "currency": currency
                            })
                            net -= owed_amount
                            if net <= 0.01:
                                break
    
    # Calculate totals by currency
    total_to_pay = {}
    total_to_receive = {}
    
    for debt in all_debts_to_pay:
        currency = debt["currency"]
        if currency not in total_to_pay:
            total_to_pay[currency] = 0
        total_to_pay[currency] += debt["amount"]
    
    for debt in all_debts_to_receive:
        currency = debt["currency"]
        if currency not in total_to_receive:
            total_to_receive[currency] = 0
        total_to_receive[currency] += debt["amount"]
    
    return {
        "to_pay": all_debts_to_pay,
        "to_receive": all_debts_to_receive,
        "total_to_pay": total_to_pay,
        "total_to_receive": total_to_receive
    }

@api_router.put("/groups/{group_id}/mode")
async def update_group_mode(group_id: str, mode: str, current_user: dict = Depends(get_current_user)):
    """Update group mode (split/contribution)"""
    if mode not in ["split", "contribution"]:
        raise HTTPException(status_code=400, detail="Mode must be 'split' or 'contribution'")
    
    group = await db.groups.find_one({"id": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    
    if current_user["id"] not in group.get("members", []):
        raise HTTPException(status_code=403, detail="Not a member of this group")
    
    if group.get("type") == "personal":
        raise HTTPException(status_code=400, detail="Cannot change mode for personal group")
    
    await db.groups.update_one({"id": group_id}, {"$set": {"mode": mode}})
    
    return {"message": f"Group mode updated to {mode}"}

# ==================== CATEGORY ROUTES ====================

@api_router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(group_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    categories = []
    
    # Ensure default categories exist
    await ensure_default_categories()
    
    # Get default categories
    default_cats = db.categories.find({"group_id": None})
    async for cat in default_cats:
        categories.append(CategoryResponse(
            id=cat["id"],
            name=cat["name"],
            icon=cat["icon"],
            color=cat["color"],
            is_custom=False,
            group_id=None
        ))
    
    # Get custom categories for specified group or all user's groups
    if group_id:
        custom_cats = db.categories.find({"group_id": group_id})
        async for cat in custom_cats:
            categories.append(CategoryResponse(
                id=cat["id"],
                name=cat["name"],
                icon=cat["icon"],
                color=cat["color"],
                is_custom=True,
                group_id=cat["group_id"]
            ))
    else:
        # Get all groups user is member of
        groups = await db.groups.find({"members": current_user["id"]}).to_list(length=100)
        group_ids = [g["id"] for g in groups]
        
        custom_cats = db.categories.find({"group_id": {"$in": group_ids}})
        async for cat in custom_cats:
            categories.append(CategoryResponse(
                id=cat["id"],
                name=cat["name"],
                icon=cat["icon"],
                color=cat["color"],
                is_custom=True,
                group_id=cat["group_id"]
            ))
    
    return categories

@api_router.post("/categories", response_model=CategoryResponse)
async def create_category(cat_data: CategoryCreate, group_id: str, current_user: dict = Depends(get_current_user)):
    # Verify user is member of the group
    group = await db.groups.find_one({"id": group_id, "members": current_user["id"]})
    if not group:
        raise HTTPException(status_code=403, detail="Not a member of this group")
    
    cat_id = str(uuid.uuid4())
    category = {
        "id": cat_id,
        "name": cat_data.name,
        "icon": cat_data.icon,
        "color": cat_data.color,
        "is_custom": True,
        "group_id": group_id
    }
    
    await db.categories.insert_one(category)
    
    return CategoryResponse(**category)

@api_router.delete("/categories/{category_id}")
async def delete_category(category_id: str, current_user: dict = Depends(get_current_user)):
    category = await db.categories.find_one({"id": category_id})
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    if not category.get("is_custom"):
        raise HTTPException(status_code=400, detail="Cannot delete default categories")
    
    # Verify user is member of the group
    group = await db.groups.find_one({"id": category["group_id"], "members": current_user["id"]})
    if not group:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.categories.delete_one({"id": category_id})
    return {"message": "Category deleted"}

# ==================== EXPENSE ROUTES ====================

@api_router.post("/expenses", response_model=ExpenseResponse)
async def create_expense(expense_data: ExpenseCreate, current_user: dict = Depends(get_current_user)):
    # Verify user is member of the group
    group = await db.groups.find_one({"id": expense_data.group_id, "members": current_user["id"]})
    if not group:
        raise HTTPException(status_code=403, detail="Not a member of this group")
    
    if expense_data.currency not in CURRENCIES:
        raise HTTPException(status_code=400, detail=f"Invalid currency. Allowed: {CURRENCIES}")
    
    category = await get_category_info(expense_data.category_id, expense_data.group_id)
    user_info = await get_user_info(current_user["id"])
    
    expense_id = str(uuid.uuid4())
    expense_date = expense_data.date or datetime.utcnow()
    
    expense = {
        "id": expense_id,
        "amount": expense_data.amount,
        "currency": expense_data.currency,
        "category_id": expense_data.category_id,
        "description": expense_data.description,
        "paid_by": current_user["id"],
        "group_id": expense_data.group_id,
        "date": expense_date,
        "created_at": datetime.utcnow()
    }
    
    await db.expenses.insert_one(expense)
    
    return ExpenseResponse(
        id=expense_id,
        amount=expense_data.amount,
        currency=expense_data.currency,
        category_id=expense_data.category_id,
        category_name=category.get("name", "Unknown"),
        category_icon=category.get("icon", "help-circle"),
        category_color=category.get("color", "#999999"),
        description=expense_data.description,
        paid_by=current_user["id"],
        paid_by_name=user_info["name"],
        paid_by_color=user_info["color"],
        group_id=expense_data.group_id,
        group_name=group["name"],
        date=expense_date,
        created_at=expense["created_at"]
    )

@api_router.get("/expenses", response_model=List[ExpenseResponse])
async def get_expenses(
    group_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category_id: Optional[str] = None,
    paid_by: Optional[str] = None,
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
):
    # Get all groups user is member of
    if group_id:
        group = await db.groups.find_one({"id": group_id, "members": current_user["id"]})
        if not group:
            raise HTTPException(status_code=403, detail="Not a member of this group")
        group_ids = [group_id]
    else:
        groups = await db.groups.find({"members": current_user["id"]}).to_list(length=100)
        group_ids = [g["id"] for g in groups]
    
    query = {"group_id": {"$in": group_ids}}
    
    if start_date:
        query["date"] = {"$gte": datetime.fromisoformat(start_date)}
    if end_date:
        if "date" in query:
            query["date"]["$lte"] = datetime.fromisoformat(end_date)
        else:
            query["date"] = {"$lte": datetime.fromisoformat(end_date)}
    if category_id:
        query["category_id"] = category_id
    if paid_by:
        query["paid_by"] = paid_by
    
    # Fetch expenses first
    expenses_cursor = db.expenses.find(query).sort("date", -1).limit(limit)
    expenses_list = await expenses_cursor.to_list(length=limit)
    
    if not expenses_list:
        return []
    
    # Batch fetch categories, users, and groups
    category_ids = list(set(exp["category_id"] for exp in expenses_list))
    user_ids = list(set(exp["paid_by"] for exp in expenses_list))
    exp_group_ids = list(set(exp["group_id"] for exp in expenses_list))
    
    categories_dict = {}
    async for cat in db.categories.find({"id": {"$in": category_ids}}, {"id": 1, "name": 1, "icon": 1, "color": 1}):
        categories_dict[cat["id"]] = cat
    
    users_dict = {}
    async for user in db.users.find({"id": {"$in": user_ids}}, {"id": 1, "name": 1, "avatar_color": 1}):
        users_dict[user["id"]] = {"name": user.get("name", "Unknown"), "color": user.get("avatar_color", "#999999")}
    
    groups_dict = {}
    async for grp in db.groups.find({"id": {"$in": exp_group_ids}}, {"id": 1, "name": 1}):
        groups_dict[grp["id"]] = grp.get("name", "Unknown")
    
    expenses = []
    for exp in expenses_list:
        category = categories_dict.get(exp["category_id"], {"name": "Unknown", "icon": "help-circle", "color": "#999999"})
        user_info = users_dict.get(exp["paid_by"], {"name": "Unknown", "color": "#999999"})
        group_name = groups_dict.get(exp["group_id"], "Unknown")
        
        expenses.append(ExpenseResponse(
            id=exp["id"],
            amount=exp["amount"],
            currency=exp["currency"],
            category_id=exp["category_id"],
            category_name=category.get("name", "Unknown"),
            category_icon=category.get("icon", "help-circle"),
            category_color=category.get("color", "#999999"),
            description=exp.get("description", ""),
            paid_by=exp["paid_by"],
            paid_by_name=user_info["name"],
            paid_by_color=user_info["color"],
            group_id=exp["group_id"],
            group_name=group_name,
            date=exp["date"],
            created_at=exp["created_at"]
        ))
    
    return expenses

@api_router.get("/expenses/{expense_id}", response_model=ExpenseResponse)
async def get_expense(expense_id: str, current_user: dict = Depends(get_current_user)):
    expense = await db.expenses.find_one({"id": expense_id})
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    # Verify user is member of the group
    group = await db.groups.find_one({"id": expense["group_id"], "members": current_user["id"]})
    if not group:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    category = await get_category_info(expense["category_id"], expense["group_id"])
    user_info = await get_user_info(expense["paid_by"])
    
    return ExpenseResponse(
        id=expense["id"],
        amount=expense["amount"],
        currency=expense["currency"],
        category_id=expense["category_id"],
        category_name=category.get("name", "Unknown"),
        category_icon=category.get("icon", "help-circle"),
        category_color=category.get("color", "#999999"),
        description=expense.get("description", ""),
        paid_by=expense["paid_by"],
        paid_by_name=user_info["name"],
        paid_by_color=user_info["color"],
        group_id=expense["group_id"],
        group_name=group["name"],
        date=expense["date"],
        created_at=expense["created_at"]
    )

@api_router.put("/expenses/{expense_id}", response_model=ExpenseResponse)
async def update_expense(expense_id: str, expense_data: ExpenseUpdate, current_user: dict = Depends(get_current_user)):
    expense = await db.expenses.find_one({"id": expense_id})
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    # Verify user is member of the group
    group = await db.groups.find_one({"id": expense["group_id"], "members": current_user["id"]})
    if not group:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    update_data = {}
    if expense_data.amount is not None:
        update_data["amount"] = expense_data.amount
    if expense_data.currency is not None:
        if expense_data.currency not in CURRENCIES:
            raise HTTPException(status_code=400, detail=f"Invalid currency. Allowed: {CURRENCIES}")
        update_data["currency"] = expense_data.currency
    if expense_data.category_id is not None:
        update_data["category_id"] = expense_data.category_id
    if expense_data.description is not None:
        update_data["description"] = expense_data.description
    if expense_data.date is not None:
        update_data["date"] = expense_data.date
    
    if update_data:
        await db.expenses.update_one({"id": expense_id}, {"$set": update_data})
    
    updated_expense = await db.expenses.find_one({"id": expense_id})
    category = await get_category_info(updated_expense["category_id"], updated_expense["group_id"])
    user_info = await get_user_info(updated_expense["paid_by"])
    
    return ExpenseResponse(
        id=updated_expense["id"],
        amount=updated_expense["amount"],
        currency=updated_expense["currency"],
        category_id=updated_expense["category_id"],
        category_name=category.get("name", "Unknown"),
        category_icon=category.get("icon", "help-circle"),
        category_color=category.get("color", "#999999"),
        description=updated_expense.get("description", ""),
        paid_by=updated_expense["paid_by"],
        paid_by_name=user_info["name"],
        paid_by_color=user_info["color"],
        group_id=updated_expense["group_id"],
        group_name=group["name"],
        date=updated_expense["date"],
        created_at=updated_expense["created_at"]
    )

@api_router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str, current_user: dict = Depends(get_current_user)):
    expense = await db.expenses.find_one({"id": expense_id})
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    # Verify user is member of the group
    group = await db.groups.find_one({"id": expense["group_id"], "members": current_user["id"]})
    if not group:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.expenses.delete_one({"id": expense_id})
    return {"message": "Expense deleted"}

# ==================== ANALYTICS ROUTES ====================

@api_router.get("/analytics/summary")
async def get_analytics_summary(group_id: Optional[str] = None, current_user: dict = Depends(get_current_user)):
    # Get group IDs
    if group_id:
        group = await db.groups.find_one({"id": group_id, "members": current_user["id"]})
        if not group:
            raise HTTPException(status_code=403, detail="Not a member of this group")
        group_ids = [group_id]
    else:
        groups = await db.groups.find({"members": current_user["id"]}).to_list(length=100)
        group_ids = [g["id"] for g in groups]
    
    now = datetime.utcnow()
    today_start = datetime(now.year, now.month, now.day)
    month_start = datetime(now.year, now.month, 1)
    
    if now.month == 1:
        last_month_start = datetime(now.year - 1, 12, 1)
        last_month_end = datetime(now.year, 1, 1)
    else:
        last_month_start = datetime(now.year, now.month - 1, 1)
        last_month_end = datetime(now.year, now.month, 1)
    
    projection = {"currency": 1, "amount": 1, "_id": 0}
    base_query = {"group_id": {"$in": group_ids}}
    
    today_expenses = {}
    async for exp in db.expenses.find({**base_query, "date": {"$gte": today_start}}, projection):
        currency = exp["currency"]
        today_expenses[currency] = today_expenses.get(currency, 0) + exp["amount"]
    
    month_expenses = {}
    async for exp in db.expenses.find({**base_query, "date": {"$gte": month_start}}, projection):
        currency = exp["currency"]
        month_expenses[currency] = month_expenses.get(currency, 0) + exp["amount"]
    
    last_month_expenses = {}
    async for exp in db.expenses.find({**base_query, "date": {"$gte": last_month_start, "$lt": last_month_end}}, projection):
        currency = exp["currency"]
        last_month_expenses[currency] = last_month_expenses.get(currency, 0) + exp["amount"]
    
    total_expenses = {}
    async for exp in db.expenses.find(base_query, projection):
        currency = exp["currency"]
        total_expenses[currency] = total_expenses.get(currency, 0) + exp["amount"]
    
    total_count = await db.expenses.count_documents(base_query)
    
    return {
        "today": today_expenses,
        "this_month": month_expenses,
        "last_month": last_month_expenses,
        "total": total_expenses,
        "total_count": total_count,
        "currency_symbols": CURRENCY_SYMBOLS
    }

@api_router.get("/analytics/by-category")
async def get_analytics_by_category(
    group_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    if group_id:
        group = await db.groups.find_one({"id": group_id, "members": current_user["id"]})
        if not group:
            raise HTTPException(status_code=403, detail="Not a member of this group")
        group_ids = [group_id]
    else:
        groups = await db.groups.find({"members": current_user["id"]}).to_list(length=100)
        group_ids = [g["id"] for g in groups]
    
    query = {"group_id": {"$in": group_ids}}
    if start_date:
        query["date"] = {"$gte": datetime.fromisoformat(start_date)}
    if end_date:
        if "date" in query:
            query["date"]["$lte"] = datetime.fromisoformat(end_date)
        else:
            query["date"] = {"$lte": datetime.fromisoformat(end_date)}
    
    projection = {"category_id": 1, "currency": 1, "amount": 1, "_id": 0}
    expenses_list = await db.expenses.find(query, projection).to_list(length=10000)
    
    if not expenses_list:
        return []
    
    category_ids = list(set(exp["category_id"] for exp in expenses_list))
    categories_dict = {}
    async for cat in db.categories.find({"id": {"$in": category_ids}}, {"id": 1, "name": 1, "icon": 1, "color": 1}):
        categories_dict[cat["id"]] = cat
    
    category_expenses = {}
    for exp in expenses_list:
        cat_id = exp["category_id"]
        currency = exp["currency"]
        
        if cat_id not in category_expenses:
            category = categories_dict.get(cat_id, {"name": "Unknown", "icon": "help-circle", "color": "#999999"})
            category_expenses[cat_id] = {
                "category_id": cat_id,
                "category_name": category.get("name", "Unknown"),
                "category_icon": category.get("icon", "help-circle"),
                "category_color": category.get("color", "#999999"),
                "amounts": {},
                "count": 0
            }
        
        category_expenses[cat_id]["amounts"][currency] = category_expenses[cat_id]["amounts"].get(currency, 0) + exp["amount"]
        category_expenses[cat_id]["count"] += 1
    
    return list(category_expenses.values())

@api_router.get("/analytics/by-member")
async def get_analytics_by_member(
    group_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    if group_id:
        group = await db.groups.find_one({"id": group_id, "members": current_user["id"]})
        if not group:
            raise HTTPException(status_code=403, detail="Not a member of this group")
        group_ids = [group_id]
    else:
        groups = await db.groups.find({"members": current_user["id"]}).to_list(length=100)
        group_ids = [g["id"] for g in groups]
    
    query = {"group_id": {"$in": group_ids}}
    if start_date:
        query["date"] = {"$gte": datetime.fromisoformat(start_date)}
    if end_date:
        if "date" in query:
            query["date"]["$lte"] = datetime.fromisoformat(end_date)
        else:
            query["date"] = {"$lte": datetime.fromisoformat(end_date)}
    
    projection = {"paid_by": 1, "currency": 1, "amount": 1, "_id": 0}
    expenses_list = await db.expenses.find(query, projection).to_list(length=10000)
    
    if not expenses_list:
        return []
    
    user_ids = list(set(exp["paid_by"] for exp in expenses_list))
    users_dict = {}
    async for user in db.users.find({"id": {"$in": user_ids}}, {"id": 1, "name": 1, "avatar_color": 1}):
        users_dict[user["id"]] = {"name": user.get("name", "Unknown"), "color": user.get("avatar_color", "#999999")}
    
    member_expenses = {}
    for exp in expenses_list:
        user_id = exp["paid_by"]
        currency = exp["currency"]
        
        if user_id not in member_expenses:
            user_info = users_dict.get(user_id, {"name": "Unknown", "color": "#999999"})
            member_expenses[user_id] = {
                "user_id": user_id,
                "user_name": user_info["name"],
                "user_color": user_info["color"],
                "amounts": {},
                "count": 0
            }
        
        member_expenses[user_id]["amounts"][currency] = member_expenses[user_id]["amounts"].get(currency, 0) + exp["amount"]
        member_expenses[user_id]["count"] += 1
    
    return list(member_expenses.values())

@api_router.get("/analytics/by-group")
async def get_analytics_by_group(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Get expense breakdown by group"""
    groups = await db.groups.find({"members": current_user["id"]}).to_list(length=100)
    group_ids = [g["id"] for g in groups]
    groups_dict = {g["id"]: g for g in groups}
    
    query = {"group_id": {"$in": group_ids}}
    if start_date:
        query["date"] = {"$gte": datetime.fromisoformat(start_date)}
    if end_date:
        if "date" in query:
            query["date"]["$lte"] = datetime.fromisoformat(end_date)
        else:
            query["date"] = {"$lte": datetime.fromisoformat(end_date)}
    
    projection = {"group_id": 1, "currency": 1, "amount": 1, "_id": 0}
    expenses_list = await db.expenses.find(query, projection).to_list(length=10000)
    
    group_expenses = {}
    for exp in expenses_list:
        grp_id = exp["group_id"]
        currency = exp["currency"]
        
        if grp_id not in group_expenses:
            grp = groups_dict.get(grp_id, {"name": "Unknown", "color": "#999999", "type": "shared"})
            group_expenses[grp_id] = {
                "group_id": grp_id,
                "group_name": grp.get("name", "Unknown"),
                "group_color": grp.get("color", "#999999"),
                "group_type": grp.get("type", "shared"),
                "amounts": {},
                "count": 0
            }
        
        group_expenses[grp_id]["amounts"][currency] = group_expenses[grp_id]["amounts"].get(currency, 0) + exp["amount"]
        group_expenses[grp_id]["count"] += 1
    
    return list(group_expenses.values())

@api_router.get("/analytics/trends")
async def get_analytics_trends(
    group_id: Optional[str] = None,
    months: int = 6,
    current_user: dict = Depends(get_current_user)
):
    if group_id:
        group = await db.groups.find_one({"id": group_id, "members": current_user["id"]})
        if not group:
            raise HTTPException(status_code=403, detail="Not a member of this group")
        group_ids = [group_id]
    else:
        groups = await db.groups.find({"members": current_user["id"]}).to_list(length=100)
        group_ids = [g["id"] for g in groups]
    
    now = datetime.utcnow()
    projection = {"currency": 1, "amount": 1, "date": 1, "_id": 0}
    
    trends = []
    for i in range(months - 1, -1, -1):
        year = now.year
        month = now.month - i
        while month <= 0:
            month += 12
            year -= 1
        
        month_start = datetime(year, month, 1)
        if month == 12:
            month_end = datetime(year + 1, 1, 1)
        else:
            month_end = datetime(year, month + 1, 1)
        
        month_name = month_start.strftime("%b %Y")
        
        month_expenses = {}
        async for exp in db.expenses.find({"group_id": {"$in": group_ids}, "date": {"$gte": month_start, "$lt": month_end}}, projection):
            currency = exp["currency"]
            month_expenses[currency] = month_expenses.get(currency, 0) + exp["amount"]
        
        trends.append({
            "month": month_name,
            "year": year,
            "month_num": month,
            "amounts": month_expenses
        })
    
    return trends

@api_router.get("/analytics/daily")
async def get_analytics_daily(
    group_id: Optional[str] = None,
    days: int = 30,
    current_user: dict = Depends(get_current_user)
):
    if group_id:
        group = await db.groups.find_one({"id": group_id, "members": current_user["id"]})
        if not group:
            raise HTTPException(status_code=403, detail="Not a member of this group")
        group_ids = [group_id]
    else:
        groups = await db.groups.find({"members": current_user["id"]}).to_list(length=100)
        group_ids = [g["id"] for g in groups]
    
    now = datetime.utcnow()
    projection = {"currency": 1, "amount": 1, "date": 1, "_id": 0}
    
    daily_data = []
    for i in range(days - 1, -1, -1):
        day_start = datetime(now.year, now.month, now.day) - timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        
        day_expenses = {}
        async for exp in db.expenses.find({"group_id": {"$in": group_ids}, "date": {"$gte": day_start, "$lt": day_end}}, projection):
            currency = exp["currency"]
            day_expenses[currency] = day_expenses.get(currency, 0) + exp["amount"]
        
        daily_data.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "day": day_start.strftime("%d"),
            "month": day_start.strftime("%b"),
            "amounts": day_expenses
        })
    
    return daily_data

# ==================== EXPORT ROUTES ====================

@api_router.post("/export/csv")
async def export_expenses_csv(export_data: ExportRequest, current_user: dict = Depends(get_current_user)):
    """Export expenses to CSV file"""
    # Get group IDs
    if export_data.group_id:
        group = await db.groups.find_one({"id": export_data.group_id, "members": current_user["id"]})
        if not group:
            raise HTTPException(status_code=403, detail="Not a member of this group")
        group_ids = [export_data.group_id]
    else:
        groups = await db.groups.find({"members": current_user["id"]}).to_list(length=100)
        group_ids = [g["id"] for g in groups]
    
    query = {"group_id": {"$in": group_ids}}
    
    # Apply date filters based on export type
    if export_data.export_type == "monthly" and export_data.month and export_data.year:
        month_start = datetime(export_data.year, export_data.month, 1)
        if export_data.month == 12:
            month_end = datetime(export_data.year + 1, 1, 1)
        else:
            month_end = datetime(export_data.year, export_data.month + 1, 1)
        query["date"] = {"$gte": month_start, "$lt": month_end}
    elif export_data.export_type == "range" and export_data.start_date and export_data.end_date:
        query["date"] = {
            "$gte": datetime.fromisoformat(export_data.start_date),
            "$lte": datetime.fromisoformat(export_data.end_date)
        }
    
    # Fetch expenses
    expenses = await db.expenses.find(query).sort("date", -1).to_list(length=10000)
    
    if not expenses:
        raise HTTPException(status_code=404, detail="No expenses found for the specified criteria")
    
    # Batch fetch related data
    category_ids = list(set(exp["category_id"] for exp in expenses))
    user_ids = list(set(exp["paid_by"] for exp in expenses))
    exp_group_ids = list(set(exp["group_id"] for exp in expenses))
    
    categories_dict = {}
    async for cat in db.categories.find({"id": {"$in": category_ids}}):
        categories_dict[cat["id"]] = cat.get("name", "Unknown")
    
    users_dict = {}
    async for user in db.users.find({"id": {"$in": user_ids}}):
        users_dict[user["id"]] = user.get("name", "Unknown")
    
    groups_dict = {}
    async for grp in db.groups.find({"id": {"$in": exp_group_ids}}):
        groups_dict[grp["id"]] = grp.get("name", "Unknown")
    
    # Create CSV
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Header
    writer.writerow(["Date", "Group", "Category", "Amount", "Currency", "Description", "Paid By"])
    
    # Data rows
    for exp in expenses:
        writer.writerow([
            exp["date"].strftime("%Y-%m-%d"),
            groups_dict.get(exp["group_id"], "Unknown"),
            categories_dict.get(exp["category_id"], "Unknown"),
            exp["amount"],
            exp["currency"],
            exp.get("description", ""),
            users_dict.get(exp["paid_by"], "Unknown")
        ])
    
    output.seek(0)
    
    # Generate filename
    if export_data.group_id:
        group_name = groups_dict.get(export_data.group_id, "expenses").replace(" ", "_")
    else:
        group_name = "all_groups"
    
    if export_data.export_type == "monthly":
        filename = f"{group_name}_{export_data.year}_{export_data.month:02d}.csv"
    elif export_data.export_type == "range":
        filename = f"{group_name}_{export_data.start_date}_to_{export_data.end_date}.csv"
    else:
        filename = f"{group_name}_all_expenses.csv"
    
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

# ==================== UTILITY ROUTES ====================

@api_router.get("/currencies")
async def get_currencies():
    return {
        "currencies": CURRENCIES,
        "symbols": CURRENCY_SYMBOLS
    }

@api_router.get("/")
async def root():
    return {"message": "Family Expense Tracker API v2.0"}

# Health check endpoint for Railway
@app.get("/")
async def health_check():
    return {"status": "healthy", "message": "Family Expense Tracker API v2.0"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=allow_credentials,
    allow_origins=cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
