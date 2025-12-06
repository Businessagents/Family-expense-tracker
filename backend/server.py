from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
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

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Security
SECRET_KEY = os.environ.get('SECRET_KEY', 'family-finance-secret-key-2024')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI(title="Family Finance App")

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
    family_id: Optional[str] = None
    family_name: Optional[str] = None
    default_currency: str = "INR"
    created_at: datetime

class FamilyCreate(BaseModel):
    name: str

class FamilyJoin(BaseModel):
    invite_code: str

class FamilyResponse(BaseModel):
    id: str
    name: str
    invite_code: str
    members: List[dict]
    created_at: datetime

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
    family_id: Optional[str] = None

class ExpenseCreate(BaseModel):
    amount: float
    currency: str = "INR"
    category_id: str
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
    family_id: str
    date: datetime
    created_at: datetime

class UpdateProfile(BaseModel):
    name: Optional[str] = None
    default_currency: Optional[str] = None

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
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

async def get_category_info(category_id: str, family_id: str):
    # Check custom categories first
    category = await db.categories.find_one({"id": category_id, "family_id": family_id})
    if category:
        return category
    # Check default categories
    category = await db.categories.find_one({"id": category_id, "family_id": None})
    if category:
        return category
    return {"name": "Unknown", "icon": "help-circle", "color": "#999999"}

async def get_user_info(user_id: str):
    user = await db.users.find_one({"id": user_id})
    if user:
        return {"name": user.get("name", "Unknown"), "color": user.get("avatar_color", "#999999")}
    return {"name": "Unknown", "color": "#999999"}

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
        "family_id": None,
        "default_currency": "INR",
        "created_at": datetime.utcnow()
    }
    
    await db.users.insert_one(user)
    
    access_token = create_access_token({"sub": user_id})
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user_id,
            name=user_data.name,
            email=user_data.email.lower(),
            avatar_color=avatar_color,
            family_id=None,
            family_name=None,
            default_currency="INR",
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
    
    access_token = create_access_token({"sub": user["id"]})
    
    # Get family name if exists
    family_name = None
    if user.get("family_id"):
        family = await db.families.find_one({"id": user["family_id"]})
        if family:
            family_name = family.get("name")
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=user["id"],
            name=user["name"],
            email=user["email"],
            avatar_color=user["avatar_color"],
            family_id=user.get("family_id"),
            family_name=family_name,
            default_currency=user.get("default_currency", "INR"),
            created_at=user["created_at"]
        )
    )

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    family_name = None
    if current_user.get("family_id"):
        family = await db.families.find_one({"id": current_user["family_id"]})
        if family:
            family_name = family.get("name")
    
    return UserResponse(
        id=current_user["id"],
        name=current_user["name"],
        email=current_user["email"],
        avatar_color=current_user["avatar_color"],
        family_id=current_user.get("family_id"),
        family_name=family_name,
        default_currency=current_user.get("default_currency", "INR"),
        created_at=current_user["created_at"]
    )

@api_router.put("/auth/profile", response_model=UserResponse)
async def update_profile(profile_data: UpdateProfile, current_user: dict = Depends(get_current_user)):
    update_data = {}
    if profile_data.name:
        update_data["name"] = profile_data.name
    if profile_data.default_currency and profile_data.default_currency in CURRENCIES:
        update_data["default_currency"] = profile_data.default_currency
    
    if update_data:
        await db.users.update_one({"id": current_user["id"]}, {"$set": update_data})
    
    updated_user = await db.users.find_one({"id": current_user["id"]})
    
    family_name = None
    if updated_user.get("family_id"):
        family = await db.families.find_one({"id": updated_user["family_id"]})
        if family:
            family_name = family.get("name")
    
    return UserResponse(
        id=updated_user["id"],
        name=updated_user["name"],
        email=updated_user["email"],
        avatar_color=updated_user["avatar_color"],
        family_id=updated_user.get("family_id"),
        family_name=family_name,
        default_currency=updated_user.get("default_currency", "INR"),
        created_at=updated_user["created_at"]
    )

# ==================== FAMILY ROUTES ====================

@api_router.post("/family/create", response_model=FamilyResponse)
async def create_family(family_data: FamilyCreate, current_user: dict = Depends(get_current_user)):
    if current_user.get("family_id"):
        raise HTTPException(status_code=400, detail="You are already in a family")
    
    family_id = str(uuid.uuid4())
    invite_code = generate_invite_code()
    
    # Ensure unique invite code
    while await db.families.find_one({"invite_code": invite_code}):
        invite_code = generate_invite_code()
    
    family = {
        "id": family_id,
        "name": family_data.name,
        "invite_code": invite_code,
        "created_by": current_user["id"],
        "created_at": datetime.utcnow()
    }
    
    await db.families.insert_one(family)
    
    # Update user's family_id
    await db.users.update_one({"id": current_user["id"]}, {"$set": {"family_id": family_id}})
    
    # Create default categories for this family
    for cat in DEFAULT_CATEGORIES:
        await db.categories.update_one(
            {"name": cat["name"], "family_id": None},
            {"$setOnInsert": {
                "id": str(uuid.uuid4()),
                "name": cat["name"],
                "icon": cat["icon"],
                "color": cat["color"],
                "is_custom": False,
                "family_id": None
            }},
            upsert=True
        )
    
    members = [{"id": current_user["id"], "name": current_user["name"], "avatar_color": current_user["avatar_color"]}]
    
    return FamilyResponse(
        id=family_id,
        name=family_data.name,
        invite_code=invite_code,
        members=members,
        created_at=family["created_at"]
    )

@api_router.post("/family/join", response_model=FamilyResponse)
async def join_family(join_data: FamilyJoin, current_user: dict = Depends(get_current_user)):
    if current_user.get("family_id"):
        raise HTTPException(status_code=400, detail="You are already in a family")
    
    family = await db.families.find_one({"invite_code": join_data.invite_code.upper()})
    if not family:
        raise HTTPException(status_code=404, detail="Invalid invite code")
    
    # Update user's family_id
    await db.users.update_one({"id": current_user["id"]}, {"$set": {"family_id": family["id"]}})
    
    # Get all family members
    members_cursor = db.users.find({"family_id": family["id"]})
    members = []
    async for member in members_cursor:
        members.append({
            "id": member["id"],
            "name": member["name"],
            "avatar_color": member["avatar_color"]
        })
    
    return FamilyResponse(
        id=family["id"],
        name=family["name"],
        invite_code=family["invite_code"],
        members=members,
        created_at=family["created_at"]
    )

@api_router.get("/family", response_model=FamilyResponse)
async def get_family(current_user: dict = Depends(get_current_user)):
    if not current_user.get("family_id"):
        raise HTTPException(status_code=404, detail="You are not in a family")
    
    family = await db.families.find_one({"id": current_user["family_id"]})
    if not family:
        raise HTTPException(status_code=404, detail="Family not found")
    
    # Get all family members
    members_cursor = db.users.find({"family_id": family["id"]})
    members = []
    async for member in members_cursor:
        members.append({
            "id": member["id"],
            "name": member["name"],
            "avatar_color": member["avatar_color"]
        })
    
    return FamilyResponse(
        id=family["id"],
        name=family["name"],
        invite_code=family["invite_code"],
        members=members,
        created_at=family["created_at"]
    )

@api_router.post("/family/leave")
async def leave_family(current_user: dict = Depends(get_current_user)):
    if not current_user.get("family_id"):
        raise HTTPException(status_code=400, detail="You are not in a family")
    
    await db.users.update_one({"id": current_user["id"]}, {"$set": {"family_id": None}})
    return {"message": "Successfully left the family"}

# ==================== CATEGORY ROUTES ====================

@api_router.get("/categories", response_model=List[CategoryResponse])
async def get_categories(current_user: dict = Depends(get_current_user)):
    categories = []
    
    # Get default categories
    default_cats = db.categories.find({"family_id": None})
    async for cat in default_cats:
        categories.append(CategoryResponse(
            id=cat["id"],
            name=cat["name"],
            icon=cat["icon"],
            color=cat["color"],
            is_custom=False,
            family_id=None
        ))
    
    # If no default categories exist, create them
    if not categories:
        for cat in DEFAULT_CATEGORIES:
            cat_id = str(uuid.uuid4())
            await db.categories.insert_one({
                "id": cat_id,
                "name": cat["name"],
                "icon": cat["icon"],
                "color": cat["color"],
                "is_custom": False,
                "family_id": None
            })
            categories.append(CategoryResponse(
                id=cat_id,
                name=cat["name"],
                icon=cat["icon"],
                color=cat["color"],
                is_custom=False,
                family_id=None
            ))
    
    # Get custom categories for user's family
    if current_user.get("family_id"):
        custom_cats = db.categories.find({"family_id": current_user["family_id"]})
        async for cat in custom_cats:
            categories.append(CategoryResponse(
                id=cat["id"],
                name=cat["name"],
                icon=cat["icon"],
                color=cat["color"],
                is_custom=True,
                family_id=cat["family_id"]
            ))
    
    return categories

@api_router.post("/categories", response_model=CategoryResponse)
async def create_category(cat_data: CategoryCreate, current_user: dict = Depends(get_current_user)):
    if not current_user.get("family_id"):
        raise HTTPException(status_code=400, detail="You must be in a family to create custom categories")
    
    cat_id = str(uuid.uuid4())
    category = {
        "id": cat_id,
        "name": cat_data.name,
        "icon": cat_data.icon,
        "color": cat_data.color,
        "is_custom": True,
        "family_id": current_user["family_id"]
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
    
    if category.get("family_id") != current_user.get("family_id"):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.categories.delete_one({"id": category_id})
    return {"message": "Category deleted"}

# ==================== EXPENSE ROUTES ====================

@api_router.post("/expenses", response_model=ExpenseResponse)
async def create_expense(expense_data: ExpenseCreate, current_user: dict = Depends(get_current_user)):
    if not current_user.get("family_id"):
        raise HTTPException(status_code=400, detail="You must be in a family to add expenses")
    
    if expense_data.currency not in CURRENCIES:
        raise HTTPException(status_code=400, detail=f"Invalid currency. Allowed: {CURRENCIES}")
    
    category = await get_category_info(expense_data.category_id, current_user["family_id"])
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
        "family_id": current_user["family_id"],
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
        family_id=current_user["family_id"],
        date=expense_date,
        created_at=expense["created_at"]
    )

@api_router.get("/expenses", response_model=List[ExpenseResponse])
async def get_expenses(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    category_id: Optional[str] = None,
    paid_by: Optional[str] = None,
    limit: int = 100,
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("family_id"):
        raise HTTPException(status_code=400, detail="You must be in a family to view expenses")
    
    query = {"family_id": current_user["family_id"]}
    
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
    
    # Batch fetch categories and users to avoid N+1 queries
    category_ids = list(set(exp["category_id"] for exp in expenses_list))
    user_ids = list(set(exp["paid_by"] for exp in expenses_list))
    
    # Fetch all categories in one query
    categories_dict = {}
    async for cat in db.categories.find({"id": {"$in": category_ids}}, {"id": 1, "name": 1, "icon": 1, "color": 1}):
        categories_dict[cat["id"]] = cat
    
    # Fetch all users in one query
    users_dict = {}
    async for user in db.users.find({"id": {"$in": user_ids}}, {"id": 1, "name": 1, "avatar_color": 1}):
        users_dict[user["id"]] = {"name": user.get("name", "Unknown"), "color": user.get("avatar_color", "#999999")}
    
    expenses = []
    for exp in expenses_list:
        category = categories_dict.get(exp["category_id"], {"name": "Unknown", "icon": "help-circle", "color": "#999999"})
        user_info = users_dict.get(exp["paid_by"], {"name": "Unknown", "color": "#999999"})
        
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
            family_id=exp["family_id"],
            date=exp["date"],
            created_at=exp["created_at"]
        ))
    
    return expenses

@api_router.get("/expenses/{expense_id}", response_model=ExpenseResponse)
async def get_expense(expense_id: str, current_user: dict = Depends(get_current_user)):
    expense = await db.expenses.find_one({"id": expense_id})
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    if expense["family_id"] != current_user.get("family_id"):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    category = await get_category_info(expense["category_id"], current_user["family_id"])
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
        family_id=expense["family_id"],
        date=expense["date"],
        created_at=expense["created_at"]
    )

@api_router.put("/expenses/{expense_id}", response_model=ExpenseResponse)
async def update_expense(expense_id: str, expense_data: ExpenseUpdate, current_user: dict = Depends(get_current_user)):
    expense = await db.expenses.find_one({"id": expense_id})
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    if expense["family_id"] != current_user.get("family_id"):
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
    category = await get_category_info(updated_expense["category_id"], current_user["family_id"])
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
        family_id=updated_expense["family_id"],
        date=updated_expense["date"],
        created_at=updated_expense["created_at"]
    )

@api_router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str, current_user: dict = Depends(get_current_user)):
    expense = await db.expenses.find_one({"id": expense_id})
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")
    
    if expense["family_id"] != current_user.get("family_id"):
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.expenses.delete_one({"id": expense_id})
    return {"message": "Expense deleted"}

# ==================== ANALYTICS ROUTES ====================

@api_router.get("/analytics/summary")
async def get_analytics_summary(current_user: dict = Depends(get_current_user)):
    if not current_user.get("family_id"):
        raise HTTPException(status_code=400, detail="You must be in a family")
    
    family_id = current_user["family_id"]
    now = datetime.utcnow()
    
    # Today's start
    today_start = datetime(now.year, now.month, now.day)
    
    # This month's start
    month_start = datetime(now.year, now.month, 1)
    
    # Last month's start and end
    if now.month == 1:
        last_month_start = datetime(now.year - 1, 12, 1)
        last_month_end = datetime(now.year, 1, 1)
    else:
        last_month_start = datetime(now.year, now.month - 1, 1)
        last_month_end = datetime(now.year, now.month, 1)
    
    # Today's expenses by currency
    today_expenses = {}
    async for exp in db.expenses.find({"family_id": family_id, "date": {"$gte": today_start}}):
        currency = exp["currency"]
        if currency not in today_expenses:
            today_expenses[currency] = 0
        today_expenses[currency] += exp["amount"]
    
    # This month's expenses by currency
    month_expenses = {}
    async for exp in db.expenses.find({"family_id": family_id, "date": {"$gte": month_start}}):
        currency = exp["currency"]
        if currency not in month_expenses:
            month_expenses[currency] = 0
        month_expenses[currency] += exp["amount"]
    
    # Last month's expenses by currency
    last_month_expenses = {}
    async for exp in db.expenses.find({"family_id": family_id, "date": {"$gte": last_month_start, "$lt": last_month_end}}):
        currency = exp["currency"]
        if currency not in last_month_expenses:
            last_month_expenses[currency] = 0
        last_month_expenses[currency] += exp["amount"]
    
    # Total expenses by currency
    total_expenses = {}
    async for exp in db.expenses.find({"family_id": family_id}):
        currency = exp["currency"]
        if currency not in total_expenses:
            total_expenses[currency] = 0
        total_expenses[currency] += exp["amount"]
    
    # Total expense count
    total_count = await db.expenses.count_documents({"family_id": family_id})
    
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
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("family_id"):
        raise HTTPException(status_code=400, detail="You must be in a family")
    
    family_id = current_user["family_id"]
    
    query = {"family_id": family_id}
    if start_date:
        query["date"] = {"$gte": datetime.fromisoformat(start_date)}
    if end_date:
        if "date" in query:
            query["date"]["$lte"] = datetime.fromisoformat(end_date)
        else:
            query["date"] = {"$lte": datetime.fromisoformat(end_date)}
    
    category_expenses = {}
    async for exp in db.expenses.find(query):
        cat_id = exp["category_id"]
        currency = exp["currency"]
        
        if cat_id not in category_expenses:
            category = await get_category_info(cat_id, family_id)
            category_expenses[cat_id] = {
                "category_id": cat_id,
                "category_name": category.get("name", "Unknown"),
                "category_icon": category.get("icon", "help-circle"),
                "category_color": category.get("color", "#999999"),
                "amounts": {},
                "count": 0
            }
        
        if currency not in category_expenses[cat_id]["amounts"]:
            category_expenses[cat_id]["amounts"][currency] = 0
        category_expenses[cat_id]["amounts"][currency] += exp["amount"]
        category_expenses[cat_id]["count"] += 1
    
    return list(category_expenses.values())

@api_router.get("/analytics/by-member")
async def get_analytics_by_member(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("family_id"):
        raise HTTPException(status_code=400, detail="You must be in a family")
    
    family_id = current_user["family_id"]
    
    query = {"family_id": family_id}
    if start_date:
        query["date"] = {"$gte": datetime.fromisoformat(start_date)}
    if end_date:
        if "date" in query:
            query["date"]["$lte"] = datetime.fromisoformat(end_date)
        else:
            query["date"] = {"$lte": datetime.fromisoformat(end_date)}
    
    member_expenses = {}
    async for exp in db.expenses.find(query):
        user_id = exp["paid_by"]
        currency = exp["currency"]
        
        if user_id not in member_expenses:
            user_info = await get_user_info(user_id)
            member_expenses[user_id] = {
                "user_id": user_id,
                "user_name": user_info["name"],
                "user_color": user_info["color"],
                "amounts": {},
                "count": 0
            }
        
        if currency not in member_expenses[user_id]["amounts"]:
            member_expenses[user_id]["amounts"][currency] = 0
        member_expenses[user_id]["amounts"][currency] += exp["amount"]
        member_expenses[user_id]["count"] += 1
    
    return list(member_expenses.values())

@api_router.get("/analytics/trends")
async def get_analytics_trends(
    months: int = 6,
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("family_id"):
        raise HTTPException(status_code=400, detail="You must be in a family")
    
    family_id = current_user["family_id"]
    now = datetime.utcnow()
    
    trends = []
    for i in range(months - 1, -1, -1):
        # Calculate month start and end
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
        async for exp in db.expenses.find({"family_id": family_id, "date": {"$gte": month_start, "$lt": month_end}}):
            currency = exp["currency"]
            if currency not in month_expenses:
                month_expenses[currency] = 0
            month_expenses[currency] += exp["amount"]
        
        trends.append({
            "month": month_name,
            "year": year,
            "month_num": month,
            "amounts": month_expenses
        })
    
    return trends

@api_router.get("/analytics/daily")
async def get_analytics_daily(
    days: int = 30,
    current_user: dict = Depends(get_current_user)
):
    if not current_user.get("family_id"):
        raise HTTPException(status_code=400, detail="You must be in a family")
    
    family_id = current_user["family_id"]
    now = datetime.utcnow()
    
    daily_data = []
    for i in range(days - 1, -1, -1):
        day_start = datetime(now.year, now.month, now.day) - timedelta(days=i)
        day_end = day_start + timedelta(days=1)
        
        day_expenses = {}
        async for exp in db.expenses.find({"family_id": family_id, "date": {"$gte": day_start, "$lt": day_end}}):
            currency = exp["currency"]
            if currency not in day_expenses:
                day_expenses[currency] = 0
            day_expenses[currency] += exp["amount"]
        
        daily_data.append({
            "date": day_start.strftime("%Y-%m-%d"),
            "day": day_start.strftime("%d"),
            "month": day_start.strftime("%b"),
            "amounts": day_expenses
        })
    
    return daily_data

# ==================== UTILITY ROUTES ====================

@api_router.get("/currencies")
async def get_currencies():
    return {
        "currencies": CURRENCIES,
        "symbols": CURRENCY_SYMBOLS
    }

@api_router.get("/")
async def root():
    return {"message": "Family Finance API"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
