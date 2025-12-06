# Family Expense Tracker - Comprehensive Application Analysis

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Features](#features)
5. [Backend Architecture](#backend-architecture)
6. [Frontend Architecture](#frontend-architecture)
7. [Data Models](#data-models)
8. [API Endpoints](#api-endpoints)
9. [Security](#security)
10. [User Flow](#user-flow)
11. [Setup and Deployment](#setup-and-deployment)

---

## Overview

**Family Expense Tracker** is a full-stack mobile application designed to help families collaboratively track and manage their shared expenses. The application enables multiple family members to record expenses, view analytics, and gain insights into spending patterns across different categories.

### Key Concepts
- **Family-based tracking**: Users create or join a family group to share expenses
- **Multi-currency support**: Supports INR, USD, CAD, and SAR
- **Category-based organization**: Expenses are organized into predefined and custom categories
- **Real-time analytics**: Provides spending insights by category, member, and time period

---

## Architecture

The application follows a **client-server architecture** with clear separation of concerns:

```
┌─────────────────────────────────────┐
│     React Native Mobile App         │
│     (Expo Framework)                │
│     - iOS, Android, Web support     │
└──────────────┬──────────────────────┘
               │ HTTP/REST API
               │ JSON payloads
               ▼
┌─────────────────────────────────────┐
│     FastAPI Backend Server          │
│     - JWT Authentication            │
│     - Business Logic                │
│     - API Endpoints                 │
└──────────────┬──────────────────────┘
               │ Motor (async driver)
               ▼
┌─────────────────────────────────────┐
│     MongoDB Database                │
│     - users collection              │
│     - families collection           │
│     - categories collection         │
│     - expenses collection           │
└─────────────────────────────────────┘
```

---

## Technology Stack

### Backend
- **Framework**: FastAPI (Python) - Modern, fast web framework for building APIs
- **Database**: MongoDB - NoSQL document database with Motor async driver
- **Authentication**: 
  - JWT (JSON Web Tokens) via `python-jose`
  - PIN-based authentication (4-6 digits) using `passlib` with bcrypt
- **Security**: 
  - CORS middleware for cross-origin requests
  - Password hashing with bcrypt
  - Bearer token authentication
- **Environment Management**: `python-dotenv` for configuration

### Frontend
- **Framework**: React Native 0.79.5 with React 19.0.0
- **Navigation**: Expo Router 5.1.4 (file-based routing)
- **State Management**: 
  - Zustand 5.0.9 for global state
  - React Context API for authentication
- **UI Components**: 
  - Custom components with React Native core
  - Ionicons for icons
  - react-native-gifted-charts for data visualization
- **Storage**: AsyncStorage for persistent local data
- **Forms**: react-hook-form for form management
- **Build Tool**: Expo 54.0.27 (managed workflow)

### Development Tools
- **Backend Testing**: pytest
- **Backend Linting**: flake8, black, mypy, isort
- **Frontend Linting**: ESLint with Expo config
- **TypeScript**: Type safety on the frontend

---

## Features

### 1. **User Management**
- User registration with name, email, and PIN (4-6 digits)
- PIN-based login for quick mobile access
- Profile management (name, default currency)
- Avatar color assignment for visual identification

### 2. **Family Management**
- Create a new family group
- Join existing family using 6-character invite code
- View family members with their avatars
- Leave family (removes access to shared expenses)
- Only one family per user

### 3. **Expense Tracking**
- Add expenses with:
  - Amount and currency
  - Category
  - Description
  - Date (defaults to current date/time)
- Update and delete expenses
- View expense history with filtering:
  - Date range
  - Category
  - Family member (who paid)
  - Limit results
- See who paid for each expense

### 4. **Categories**
- **Default Categories** (10 predefined):
  - Groceries, Utilities, Rent, Transport
  - Entertainment, Healthcare, Food & Dining
  - Shopping, Education, Others
- **Custom Categories**: Family members can create additional categories
- Each category has:
  - Name
  - Icon (Ionicons name)
  - Color code (hex)
- Delete custom categories (default categories cannot be deleted)

### 5. **Analytics & Insights**
- **Summary Analytics**:
  - Today's spending
  - This month's spending
  - Last month's spending
  - Total spending (all-time)
  - Expense count
  - All amounts shown by currency

- **Category Analytics**:
  - Spending breakdown by category
  - Filter by date range
  - Shows count and amounts per category

- **Member Analytics**:
  - Spending breakdown by family member
  - See who paid what
  - Filter by date range

- **Trend Analytics**:
  - Monthly spending trends (default: 6 months)
  - Daily spending patterns (default: 30 days)

### 6. **Multi-Currency Support**
- Supported currencies: INR (₹), USD ($), CAD (C$), SAR (﷼)
- Each expense tracked in its original currency
- Analytics show amounts grouped by currency
- User can set default currency preference

---

## Backend Architecture

### File Structure
```
backend/
├── server.py          # Main FastAPI application
├── requirements.txt   # Python dependencies
└── .env              # Environment variables (not in repo)
```

### Key Components

#### 1. **Application Setup** (Lines 1-46)
- FastAPI app initialization
- MongoDB connection via Motor (async driver)
- CORS middleware configuration
- Security configuration (JWT, bcrypt)
- Logging setup

#### 2. **Data Models** (Lines 47-152)
Pydantic models for request/response validation:
- `UserCreate`, `UserLogin`, `UserResponse`
- `FamilyCreate`, `FamilyJoin`, `FamilyResponse`
- `CategoryCreate`, `CategoryResponse`
- `ExpenseCreate`, `ExpenseUpdate`, `ExpenseResponse`
- `UpdateProfile`, `Token`

#### 3. **Helper Functions** (Lines 153-200)
- `hash_pin()`: Hash PIN using bcrypt
- `verify_pin()`: Verify PIN against hash
- `create_access_token()`: Generate JWT token (30-day expiry)
- `generate_invite_code()`: Create 6-character alphanumeric code
- `get_current_user()`: Extract and validate JWT from bearer token
- `get_category_info()`: Fetch category details
- `get_user_info()`: Fetch user details

#### 4. **Route Groups**

**Authentication Routes** (Lines 201-327):
- `POST /api/auth/register` - Create new user account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user details
- `PUT /api/auth/profile` - Update user profile

**Family Routes** (Lines 329-444):
- `POST /api/family/create` - Create new family
- `POST /api/family/join` - Join family with invite code
- `GET /api/family` - Get family details and members
- `POST /api/family/leave` - Leave current family

**Category Routes** (Lines 446-532):
- `GET /api/categories` - List all categories (default + custom)
- `POST /api/categories` - Create custom category
- `DELETE /api/categories/{id}` - Delete custom category

**Expense Routes** (Lines 534-738):
- `POST /api/expenses` - Create new expense
- `GET /api/expenses` - List expenses with filters
- `GET /api/expenses/{id}` - Get single expense
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense

**Analytics Routes** (Lines 740-1006):
- `GET /api/analytics/summary` - Overall spending summary
- `GET /api/analytics/by-category` - Spending by category
- `GET /api/analytics/by-member` - Spending by family member
- `GET /api/analytics/trends` - Monthly trends
- `GET /api/analytics/daily` - Daily spending patterns

**Utility Routes** (Lines 1008-1019):
- `GET /api/currencies` - Get supported currencies
- `GET /api/` - API health check

### Database Schema

#### Collections

**users**
```javascript
{
  id: "uuid",
  name: "string",
  email: "string (lowercase)",
  pin_hash: "string (bcrypt)",
  avatar_color: "string (hex color)",
  family_id: "uuid | null",
  default_currency: "string (INR|USD|CAD|SAR)",
  created_at: "datetime"
}
```

**families**
```javascript
{
  id: "uuid",
  name: "string",
  invite_code: "string (6 chars, uppercase)",
  created_by: "uuid (user_id)",
  created_at: "datetime"
}
```

**categories**
```javascript
{
  id: "uuid",
  name: "string",
  icon: "string (ionicon name)",
  color: "string (hex color)",
  is_custom: "boolean",
  family_id: "uuid | null"  // null for default categories
}
```

**expenses**
```javascript
{
  id: "uuid",
  amount: "float",
  currency: "string",
  category_id: "uuid",
  description: "string",
  paid_by: "uuid (user_id)",
  family_id: "uuid",
  date: "datetime",
  created_at: "datetime"
}
```

### Performance Optimizations

1. **Batch Queries** (Lines 608-648):
   - Fetches all categories and users in single queries
   - Avoids N+1 query problem when listing expenses

2. **Projections** (Lines 765-890):
   - Only fetches required fields in analytics queries
   - Reduces data transfer and processing time

3. **Indexing Recommendations**:
   - `users.email` (unique)
   - `users.family_id`
   - `families.invite_code` (unique)
   - `categories.family_id`
   - `expenses.family_id`
   - `expenses.date`
   - `expenses.category_id`
   - `expenses.paid_by`

---

## Frontend Architecture

### File Structure
```
frontend/
├── app/                        # Expo Router file-based routing
│   ├── (auth)/                # Authentication screens
│   │   ├── _layout.tsx       # Auth layout wrapper
│   │   ├── login.tsx         # Login screen
│   │   ├── register.tsx      # Register screen
│   │   └── family-setup.tsx  # Create/Join family
│   ├── (main)/               # Main app screens
│   │   ├── _layout.tsx       # Tab navigation layout
│   │   ├── home.tsx          # Dashboard/Home screen
│   │   ├── expenses.tsx      # Expense list screen
│   │   ├── add.tsx           # Add expense screen
│   │   ├── analytics.tsx     # Analytics screen
│   │   └── profile.tsx       # Profile screen
│   ├── _layout.tsx           # Root layout
│   └── index.tsx             # Entry point/splash
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx   # Authentication state management
│   └── services/
│       └── api.ts            # API service layer
├── assets/                    # Images, fonts, icons
└── package.json
```

### Key Components

#### 1. **API Service** (`src/services/api.ts`)
- Singleton class managing all HTTP requests
- Automatic JWT token injection in headers
- Centralized error handling
- Methods for all backend endpoints
- Base URL configuration via environment variable

#### 2. **Auth Context** (`src/contexts/AuthContext.tsx`)
- React Context for global authentication state
- Manages:
  - Current user object
  - JWT token
  - Loading state
- Functions:
  - `login()`, `register()`, `logout()`
  - `updateUser()`, `refreshUser()`
- Persists auth state to AsyncStorage
- Auto-refreshes user data on app start

#### 3. **Routing Flow**

**Entry Point** (`app/index.tsx`):
```
Check auth state →
  ├─ Not authenticated → /login
  ├─ Authenticated but no family → /family-setup
  └─ Authenticated with family → /home
```

**Auth Routes** (`app/(auth)/`):
- Stack navigation for login → register → family-setup
- No tab bar visible
- Redirects to main app after family setup

**Main Routes** (`app/(main)/`):
- Bottom tab navigation
- 5 tabs: Home, Expenses, Add, Analytics, Profile
- Shared header and styling

#### 4. **Screen Responsibilities**

**Home Screen**:
- Summary cards (today, month, total spending)
- Recent expenses list
- Currency selector
- Pull-to-refresh
- Quick access to add expense

**Expenses Screen**:
- Full expense history
- Filter by date range, category, member
- Edit/delete expense actions
- Infinite scroll / pagination

**Add Screen**:
- Form to create new expense
- Category picker
- Amount input with currency
- Date picker
- Description field

**Analytics Screen**:
- Charts and visualizations
- Category breakdown (pie/bar charts)
- Member spending comparison
- Trend graphs (monthly/daily)
- Export/share functionality

**Profile Screen**:
- User info and settings
- Family information
- Invite code display
- Currency preference
- Leave family option
- Logout

---

## Data Models

### User Object
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  avatar_color: string;        // Hex color for UI
  family_id: string | null;
  family_name: string | null;
  default_currency: string;    // INR, USD, CAD, SAR
  created_at: string;          // ISO datetime
}
```

### Family Object
```typescript
interface Family {
  id: string;
  name: string;
  invite_code: string;         // 6-character code
  members: {
    id: string;
    name: string;
    avatar_color: string;
  }[];
  created_at: string;
}
```

### Category Object
```typescript
interface Category {
  id: string;
  name: string;
  icon: string;                // Ionicon name
  color: string;               // Hex color
  is_custom: boolean;
  family_id: string | null;    // null for default
}
```

### Expense Object
```typescript
interface Expense {
  id: string;
  amount: number;
  currency: string;
  category_id: string;
  category_name: string;       // Denormalized for performance
  category_icon: string;
  category_color: string;
  description: string;
  paid_by: string;             // User ID
  paid_by_name: string;        // Denormalized
  paid_by_color: string;       // Denormalized
  family_id: string;
  date: string;                // ISO datetime
  created_at: string;
}
```

---

## API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login with email/PIN | No |
| GET | `/api/auth/me` | Get current user | Yes |
| PUT | `/api/auth/profile` | Update profile | Yes |

### Family
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/family/create` | Create family | Yes |
| POST | `/api/family/join` | Join with invite code | Yes |
| GET | `/api/family` | Get family details | Yes |
| POST | `/api/family/leave` | Leave family | Yes |

### Categories
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/categories` | List all categories | Yes |
| POST | `/api/categories` | Create custom category | Yes |
| DELETE | `/api/categories/{id}` | Delete custom category | Yes |

### Expenses
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/expenses` | Create expense | Yes |
| GET | `/api/expenses` | List expenses (filterable) | Yes |
| GET | `/api/expenses/{id}` | Get single expense | Yes |
| PUT | `/api/expenses/{id}` | Update expense | Yes |
| DELETE | `/api/expenses/{id}` | Delete expense | Yes |

**Query Parameters for GET /api/expenses**:
- `start_date`: ISO datetime string
- `end_date`: ISO datetime string
- `category_id`: UUID string
- `paid_by`: UUID string (user ID)
- `limit`: Integer (default: 100)

### Analytics
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/analytics/summary` | Overall summary | Yes |
| GET | `/api/analytics/by-category` | Category breakdown | Yes |
| GET | `/api/analytics/by-member` | Member breakdown | Yes |
| GET | `/api/analytics/trends` | Monthly trends | Yes |
| GET | `/api/analytics/daily` | Daily patterns | Yes |

**Query Parameters**:
- `start_date`, `end_date`: For category/member analytics
- `months`: Integer for trends (default: 6)
- `days`: Integer for daily (default: 30)

### Utilities
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/currencies` | List supported currencies | No |
| GET | `/api/` | Health check | No |

---

## Security

### Authentication Flow
1. **Registration**:
   - User provides name, email, PIN (4-6 digits)
   - PIN is hashed using bcrypt
   - JWT token generated with 30-day expiry
   - Token and user data returned

2. **Login**:
   - User provides email and PIN
   - PIN verified against bcrypt hash
   - New JWT token generated
   - Token stored in AsyncStorage on mobile

3. **Protected Routes**:
   - All routes except auth and health check require JWT
   - Token sent in `Authorization: Bearer <token>` header
   - Backend validates token on each request
   - Extracts user ID from token payload

### Security Features
- **PIN Hashing**: BCrypt with automatic salt generation
- **JWT Tokens**: Signed with secret key, 30-day expiry
- **Email Normalization**: All emails stored in lowercase
- **Family Isolation**: Users can only access their family's data
- **Invite Code**: Random 6-character code, validated on join
- **CORS**: Configured to allow all origins (adjust for production)
- **Input Validation**: Pydantic models validate all inputs

### Security Considerations
⚠️ **Production Recommendations**:
1. Use HTTPS in production
2. Restrict CORS to specific origins
3. Rotate SECRET_KEY regularly
4. Add rate limiting to prevent brute force
5. Implement refresh tokens
6. Add 2FA for sensitive operations
7. Log authentication attempts
8. Add password strength requirements
9. Implement account lockout after failed attempts
10. Use environment-specific MongoDB credentials

---

## User Flow

### First-Time User Journey
```
1. Launch App
   ↓
2. Register Screen
   - Enter name, email, PIN
   - Submit registration
   ↓
3. Family Setup Screen
   - Option A: Create New Family
     - Enter family name
     - Get invite code
   - Option B: Join Existing Family
     - Enter invite code
     - Join family
   ↓
4. Home Screen (Main App)
   - View summary and recent expenses
   - Access all features
```

### Regular User Journey
```
1. Launch App
   ↓
2. Auto-login (if token valid)
   ↓
3. Home Screen
   - View summary
   - See recent expenses
   ↓
4. Common Actions:
   - Add Expense (+ button)
   - View All Expenses (Expenses tab)
   - Check Analytics (Analytics tab)
   - Manage Profile (Profile tab)
```

### Adding an Expense
```
1. Tap "Add" tab or + button
   ↓
2. Fill Expense Form
   - Select category
   - Enter amount
   - Select currency
   - Add description (optional)
   - Set date (defaults to today)
   ↓
3. Submit
   ↓
4. Expense Saved
   - Appears in family's expense list
   - Updates analytics
   - Visible to all family members
```

### Analytics Workflow
```
1. Navigate to Analytics Tab
   ↓
2. View Default Analytics
   - Summary cards
   - Category breakdown chart
   - Member spending comparison
   ↓
3. Apply Filters
   - Date range
   - Specific categories
   - Specific members
   ↓
4. View Trends
   - Monthly spending graph
   - Daily spending pattern
   ↓
5. Share/Export (if implemented)
```

---

## Setup and Deployment

### Backend Setup

**Prerequisites**:
- Python 3.8+
- MongoDB instance (local or cloud)

**Steps**:
```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
pip install -r requirements.txt

# 3. Create .env file
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=family_finance
SECRET_KEY=your-secret-key-here
EOF

# 4. Run server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# Server will be available at http://localhost:8001
# API documentation at http://localhost:8001/docs
```

**Environment Variables**:
- `MONGO_URL`: MongoDB connection string
- `DB_NAME`: Database name
- `SECRET_KEY`: JWT signing key (generate secure random string)

**Production Deployment**:
```bash
# Use production WSGI server
uvicorn server:app --host 0.0.0.0 --port 8001 --workers 4

# Or with Gunicorn
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8001
```

### Frontend Setup

**Prerequisites**:
- Node.js 16+
- Yarn (recommended) or npm
- Expo CLI

**Steps**:
```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
yarn install
# or: npm install

# 3. Create .env file
cat > .env << EOF
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
EOF

# 4. Start development server
yarn start
# or: npm start

# 5. Run on specific platform
yarn android    # Android emulator
yarn ios        # iOS simulator (Mac only)
yarn web        # Web browser
```

**Environment Variables**:
- `EXPO_PUBLIC_BACKEND_URL`: Backend API base URL

**Build for Production**:
```bash
# Android APK
eas build --platform android

# iOS IPA
eas build --platform ios

# Or local builds
yarn android --variant=release
```

### Database Setup

**MongoDB Indexes** (recommended for production):
```javascript
// In MongoDB shell or Compass
use family_finance

// Users collection
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "family_id": 1 })

// Families collection
db.families.createIndex({ "invite_code": 1 }, { unique: true })

// Categories collection
db.categories.createIndex({ "family_id": 1 })

// Expenses collection
db.expenses.createIndex({ "family_id": 1 })
db.expenses.createIndex({ "date": -1 })
db.expenses.createIndex({ "category_id": 1 })
db.expenses.createIndex({ "paid_by": 1 })
db.expenses.createIndex({ "family_id": 1, "date": -1 })
```

### Testing

**Backend Tests**:
```bash
cd /path/to/Family-expense-tracker

# Run all tests
pytest

# Run specific test file
pytest backend_test.py
pytest core_backend_test.py
pytest validation_test.py

# Run with coverage
pytest --cov=backend --cov-report=html
```

**Frontend Linting**:
```bash
cd frontend

# Run ESLint
yarn lint
# or: npm run lint
```

### Docker Deployment (Optional)

**Backend Dockerfile**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 8001

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

**Docker Compose**:
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      MONGO_INITDB_DATABASE: family_finance

  backend:
    build: .
    ports:
      - "8001:8001"
    environment:
      MONGO_URL: mongodb://mongodb:27017
      DB_NAME: family_finance
      SECRET_KEY: your-secret-key-here
    depends_on:
      - mongodb

volumes:
  mongo_data:
```

---

## Summary

The **Family Expense Tracker** is a well-architected application that demonstrates:

✅ **Modern Stack**: FastAPI backend + React Native frontend
✅ **RESTful API Design**: Clear, consistent endpoint structure
✅ **Security Best Practices**: JWT authentication, PIN hashing
✅ **Scalable Database**: MongoDB with proper indexing strategies
✅ **Mobile-First UX**: Built with Expo for iOS/Android/Web
✅ **Real-Time Collaboration**: Family members share expense data
✅ **Rich Analytics**: Multiple views of spending patterns
✅ **Developer Experience**: Type safety, linting, testing infrastructure

**Use Cases**:
- Roommates splitting bills
- Families managing household expenses
- Small teams tracking project costs
- Couples managing shared finances

**Future Enhancement Opportunities**:
1. Budget limits and alerts
2. Receipt photo uploads
3. Recurring expenses
4. Expense splitting algorithms
5. Export to CSV/PDF
6. Bank account integration
7. Multi-language support
8. Push notifications
9. Dark mode
10. Offline support with sync

---

*This document provides a comprehensive overview of the Family Expense Tracker application. For specific implementation details, refer to the source code in `backend/server.py` and the frontend components.*
