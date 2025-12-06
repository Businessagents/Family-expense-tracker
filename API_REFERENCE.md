# Family Expense Tracker - API Reference

Complete API documentation for the Family Expense Tracker backend.

**Base URL**: `http://localhost:8001/api`  
**Authentication**: JWT Bearer Token (except where noted)  
**Content-Type**: `application/json`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Family Management](#family-management)
3. [Categories](#categories)
4. [Expenses](#expenses)
5. [Analytics](#analytics)
6. [Utilities](#utilities)
7. [Error Responses](#error-responses)
8. [Examples](#examples)

---

## Authentication

### Register User

Create a new user account.

**Endpoint**: `POST /api/auth/register`  
**Authentication**: None

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "pin": "1234"
}
```

**Validation**:
- `name`: Required, string
- `email`: Required, valid email format
- `pin`: Required, 4-6 digits only

**Response** (201):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar_color": "#FF6B6B",
    "family_id": null,
    "family_name": null,
    "default_currency": "INR",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Errors**:
- `400`: Email already registered
- `400`: Invalid PIN format

---

### Login

Authenticate and receive JWT token.

**Endpoint**: `POST /api/auth/login`  
**Authentication**: None

**Request Body**:
```json
{
  "email": "john@example.com",
  "pin": "1234"
}
```

**Response** (200):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "avatar_color": "#FF6B6B",
    "family_id": "660e8400-e29b-41d4-a716-446655440001",
    "family_name": "Doe Family",
    "default_currency": "USD",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

**Errors**:
- `401`: Invalid email or PIN

---

### Get Current User

Get details of the authenticated user.

**Endpoint**: `GET /api/auth/me`  
**Authentication**: Required

**Headers**:
```
Authorization: Bearer <token>
```

**Response** (200):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "avatar_color": "#FF6B6B",
  "family_id": "660e8400-e29b-41d4-a716-446655440001",
  "family_name": "Doe Family",
  "default_currency": "USD",
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Errors**:
- `401`: Invalid or expired token

---

### Update Profile

Update user profile information.

**Endpoint**: `PUT /api/auth/profile`  
**Authentication**: Required

**Request Body**:
```json
{
  "name": "John Smith",
  "default_currency": "CAD"
}
```

**Fields** (all optional):
- `name`: New display name
- `default_currency`: Must be one of: INR, USD, CAD, SAR

**Response** (200):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Smith",
  "email": "john@example.com",
  "avatar_color": "#FF6B6B",
  "family_id": "660e8400-e29b-41d4-a716-446655440001",
  "family_name": "Doe Family",
  "default_currency": "CAD",
  "created_at": "2024-01-01T00:00:00Z"
}
```

---

## Family Management

### Create Family

Create a new family group and get invite code.

**Endpoint**: `POST /api/family/create`  
**Authentication**: Required

**Request Body**:
```json
{
  "name": "Smith Family"
}
```

**Response** (200):
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "name": "Smith Family",
  "invite_code": "ABC123",
  "members": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Smith",
      "avatar_color": "#FF6B6B"
    }
  ],
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Errors**:
- `400`: User already in a family

---

### Join Family

Join an existing family using invite code.

**Endpoint**: `POST /api/family/join`  
**Authentication**: Required

**Request Body**:
```json
{
  "invite_code": "ABC123"
}
```

**Response** (200):
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "name": "Smith Family",
  "invite_code": "ABC123",
  "members": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Smith",
      "avatar_color": "#FF6B6B"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "Jane Smith",
      "avatar_color": "#4ECDC4"
    }
  ],
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Errors**:
- `400`: User already in a family
- `404`: Invalid invite code

---

### Get Family Details

Get information about the current family.

**Endpoint**: `GET /api/family`  
**Authentication**: Required

**Response** (200):
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "name": "Smith Family",
  "invite_code": "ABC123",
  "members": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Smith",
      "avatar_color": "#FF6B6B"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "name": "Jane Smith",
      "avatar_color": "#4ECDC4"
    }
  ],
  "created_at": "2024-01-01T00:00:00Z"
}
```

**Errors**:
- `404`: User not in a family

---

### Leave Family

Remove yourself from the current family.

**Endpoint**: `POST /api/family/leave`  
**Authentication**: Required

**Response** (200):
```json
{
  "message": "Successfully left the family"
}
```

**Errors**:
- `400`: User not in a family

---

## Categories

### List Categories

Get all available categories (default + custom for family).

**Endpoint**: `GET /api/categories`  
**Authentication**: Required

**Response** (200):
```json
[
  {
    "id": "cat-001",
    "name": "Groceries",
    "icon": "cart",
    "color": "#4CAF50",
    "is_custom": false,
    "family_id": null
  },
  {
    "id": "cat-002",
    "name": "Utilities",
    "icon": "flash",
    "color": "#FF9800",
    "is_custom": false,
    "family_id": null
  },
  {
    "id": "cat-custom-001",
    "name": "Pet Care",
    "icon": "paw",
    "color": "#8B4513",
    "is_custom": true,
    "family_id": "660e8400-e29b-41d4-a716-446655440001"
  }
]
```

**Default Categories**:
1. Groceries (cart, #4CAF50)
2. Utilities (flash, #FF9800)
3. Rent (home, #9C27B0)
4. Transport (car, #2196F3)
5. Entertainment (film, #E91E63)
6. Healthcare (medkit, #F44336)
7. Food & Dining (restaurant, #FF5722)
8. Shopping (bag, #673AB7)
9. Education (school, #00BCD4)
10. Others (ellipsis-horizontal, #607D8B)

---

### Create Category

Create a custom category for your family.

**Endpoint**: `POST /api/categories`  
**Authentication**: Required

**Request Body**:
```json
{
  "name": "Pet Care",
  "icon": "paw",
  "color": "#8B4513"
}
```

**Fields**:
- `name`: Required, category name
- `icon`: Optional, Ionicon name (default: "ellipsis-horizontal")
- `color`: Optional, hex color (default: "#607D8B")

**Response** (200):
```json
{
  "id": "cat-custom-001",
  "name": "Pet Care",
  "icon": "paw",
  "color": "#8B4513",
  "is_custom": true,
  "family_id": "660e8400-e29b-41d4-a716-446655440001"
}
```

**Errors**:
- `400`: User not in a family

---

### Delete Category

Delete a custom category.

**Endpoint**: `DELETE /api/categories/{category_id}`  
**Authentication**: Required

**Response** (200):
```json
{
  "message": "Category deleted"
}
```

**Errors**:
- `404`: Category not found
- `400`: Cannot delete default categories
- `403`: Not authorized (category belongs to different family)

---

## Expenses

### Create Expense

Add a new expense.

**Endpoint**: `POST /api/expenses`  
**Authentication**: Required

**Request Body**:
```json
{
  "amount": 150.50,
  "currency": "USD",
  "category_id": "cat-001",
  "description": "Weekly grocery shopping",
  "date": "2024-01-15T10:30:00Z"
}
```

**Fields**:
- `amount`: Required, positive number
- `currency`: Required, one of: INR, USD, CAD, SAR
- `category_id`: Required, valid category ID
- `description`: Optional, string (default: "")
- `date`: Optional, ISO datetime (default: current time)

**Response** (200):
```json
{
  "id": "exp-001",
  "amount": 150.50,
  "currency": "USD",
  "category_id": "cat-001",
  "category_name": "Groceries",
  "category_icon": "cart",
  "category_color": "#4CAF50",
  "description": "Weekly grocery shopping",
  "paid_by": "550e8400-e29b-41d4-a716-446655440000",
  "paid_by_name": "John Smith",
  "paid_by_color": "#FF6B6B",
  "family_id": "660e8400-e29b-41d4-a716-446655440001",
  "date": "2024-01-15T10:30:00Z",
  "created_at": "2024-01-15T10:35:00Z"
}
```

**Errors**:
- `400`: User not in a family
- `400`: Invalid currency

---

### List Expenses

Get expenses with optional filtering.

**Endpoint**: `GET /api/expenses`  
**Authentication**: Required

**Query Parameters** (all optional):
- `start_date`: ISO datetime (filter from date)
- `end_date`: ISO datetime (filter to date)
- `category_id`: UUID (filter by category)
- `paid_by`: UUID (filter by user)
- `limit`: Integer (default: 100, max results)

**Examples**:
```
GET /api/expenses
GET /api/expenses?limit=10
GET /api/expenses?start_date=2024-01-01T00:00:00Z&end_date=2024-01-31T23:59:59Z
GET /api/expenses?category_id=cat-001
GET /api/expenses?paid_by=550e8400-e29b-41d4-a716-446655440000
```

**Response** (200):
```json
[
  {
    "id": "exp-001",
    "amount": 150.50,
    "currency": "USD",
    "category_id": "cat-001",
    "category_name": "Groceries",
    "category_icon": "cart",
    "category_color": "#4CAF50",
    "description": "Weekly grocery shopping",
    "paid_by": "550e8400-e29b-41d4-a716-446655440000",
    "paid_by_name": "John Smith",
    "paid_by_color": "#FF6B6B",
    "family_id": "660e8400-e29b-41d4-a716-446655440001",
    "date": "2024-01-15T10:30:00Z",
    "created_at": "2024-01-15T10:35:00Z"
  }
]
```

**Errors**:
- `400`: User not in a family

---

### Get Single Expense

Get details of a specific expense.

**Endpoint**: `GET /api/expenses/{expense_id}`  
**Authentication**: Required

**Response** (200):
```json
{
  "id": "exp-001",
  "amount": 150.50,
  "currency": "USD",
  "category_id": "cat-001",
  "category_name": "Groceries",
  "category_icon": "cart",
  "category_color": "#4CAF50",
  "description": "Weekly grocery shopping",
  "paid_by": "550e8400-e29b-41d4-a716-446655440000",
  "paid_by_name": "John Smith",
  "paid_by_color": "#FF6B6B",
  "family_id": "660e8400-e29b-41d4-a716-446655440001",
  "date": "2024-01-15T10:30:00Z",
  "created_at": "2024-01-15T10:35:00Z"
}
```

**Errors**:
- `404`: Expense not found
- `403`: Not authorized (expense belongs to different family)

---

### Update Expense

Update an existing expense.

**Endpoint**: `PUT /api/expenses/{expense_id}`  
**Authentication**: Required

**Request Body** (all fields optional):
```json
{
  "amount": 175.00,
  "currency": "USD",
  "category_id": "cat-002",
  "description": "Updated description",
  "date": "2024-01-16T10:30:00Z"
}
```

**Response** (200):
```json
{
  "id": "exp-001",
  "amount": 175.00,
  "currency": "USD",
  "category_id": "cat-002",
  "category_name": "Utilities",
  "category_icon": "flash",
  "category_color": "#FF9800",
  "description": "Updated description",
  "paid_by": "550e8400-e29b-41d4-a716-446655440000",
  "paid_by_name": "John Smith",
  "paid_by_color": "#FF6B6B",
  "family_id": "660e8400-e29b-41d4-a716-446655440001",
  "date": "2024-01-16T10:30:00Z",
  "created_at": "2024-01-15T10:35:00Z"
}
```

**Errors**:
- `404`: Expense not found
- `403`: Not authorized
- `400`: Invalid currency

---

### Delete Expense

Delete an expense.

**Endpoint**: `DELETE /api/expenses/{expense_id}`  
**Authentication**: Required

**Response** (200):
```json
{
  "message": "Expense deleted"
}
```

**Errors**:
- `404`: Expense not found
- `403`: Not authorized

---

## Analytics

### Summary Analytics

Get overall spending summary.

**Endpoint**: `GET /api/analytics/summary`  
**Authentication**: Required

**Response** (200):
```json
{
  "today": {
    "USD": 45.00,
    "INR": 500.00
  },
  "this_month": {
    "USD": 1250.50,
    "INR": 15000.00
  },
  "last_month": {
    "USD": 1100.00,
    "INR": 12000.00
  },
  "total": {
    "USD": 5500.00,
    "INR": 65000.00
  },
  "total_count": 156,
  "currency_symbols": {
    "INR": "₹",
    "USD": "$",
    "CAD": "C$",
    "SAR": "﷼"
  }
}
```

**Errors**:
- `400`: User not in a family

---

### Category Analytics

Get spending breakdown by category.

**Endpoint**: `GET /api/analytics/by-category`  
**Authentication**: Required

**Query Parameters** (optional):
- `start_date`: ISO datetime
- `end_date`: ISO datetime

**Response** (200):
```json
[
  {
    "category_id": "cat-001",
    "category_name": "Groceries",
    "category_icon": "cart",
    "category_color": "#4CAF50",
    "amounts": {
      "USD": 450.00,
      "INR": 5000.00
    },
    "count": 12
  },
  {
    "category_id": "cat-002",
    "category_name": "Utilities",
    "category_icon": "flash",
    "category_color": "#FF9800",
    "amounts": {
      "USD": 200.00
    },
    "count": 5
  }
]
```

---

### Member Analytics

Get spending breakdown by family member.

**Endpoint**: `GET /api/analytics/by-member`  
**Authentication**: Required

**Query Parameters** (optional):
- `start_date`: ISO datetime
- `end_date`: ISO datetime

**Response** (200):
```json
[
  {
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "user_name": "John Smith",
    "user_color": "#FF6B6B",
    "amounts": {
      "USD": 800.00,
      "INR": 10000.00
    },
    "count": 25
  },
  {
    "user_id": "770e8400-e29b-41d4-a716-446655440002",
    "user_name": "Jane Smith",
    "user_color": "#4ECDC4",
    "amounts": {
      "USD": 450.00,
      "INR": 5000.00
    },
    "count": 18
  }
]
```

---

### Trend Analytics

Get monthly spending trends.

**Endpoint**: `GET /api/analytics/trends`  
**Authentication**: Required

**Query Parameters** (optional):
- `months`: Integer (default: 6, number of months)

**Response** (200):
```json
[
  {
    "month": "Aug 2023",
    "year": 2023,
    "month_num": 8,
    "amounts": {
      "USD": 950.00,
      "INR": 12000.00
    }
  },
  {
    "month": "Sep 2023",
    "year": 2023,
    "month_num": 9,
    "amounts": {
      "USD": 1100.00,
      "INR": 13500.00
    }
  }
]
```

---

### Daily Analytics

Get daily spending patterns.

**Endpoint**: `GET /api/analytics/daily`  
**Authentication**: Required

**Query Parameters** (optional):
- `days`: Integer (default: 30, number of days)

**Response** (200):
```json
[
  {
    "date": "2024-01-01",
    "day": "01",
    "month": "Jan",
    "amounts": {
      "USD": 45.00,
      "INR": 500.00
    }
  },
  {
    "date": "2024-01-02",
    "day": "02",
    "month": "Jan",
    "amounts": {
      "USD": 32.50
    }
  }
]
```

---

## Utilities

### Get Currencies

Get list of supported currencies.

**Endpoint**: `GET /api/currencies`  
**Authentication**: None

**Response** (200):
```json
{
  "currencies": ["INR", "USD", "CAD", "SAR"],
  "symbols": {
    "INR": "₹",
    "USD": "$",
    "CAD": "C$",
    "SAR": "﷼"
  }
}
```

---

### Health Check

API health check endpoint.

**Endpoint**: `GET /api/`  
**Authentication**: None

**Response** (200):
```json
{
  "message": "Family Finance API"
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### HTTP Status Codes

| Code | Meaning | Description |
|------|---------|-------------|
| 200 | OK | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Not authorized to access resource |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Server error |

---

## Examples

### Complete Workflow Example

```bash
# 1. Register a user
curl -X POST http://localhost:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "pin": "1234"
  }'

# Save the token from response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 2. Create a family
curl -X POST http://localhost:8001/api/family/create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Doe Family"
  }'

# Save the invite code from response
INVITE_CODE="ABC123"

# 3. Get categories
curl -X GET http://localhost:8001/api/categories \
  -H "Authorization: Bearer $TOKEN"

# Save a category_id from response
CATEGORY_ID="cat-001"

# 4. Create an expense
curl -X POST http://localhost:8001/api/expenses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "amount": 150.50,
    "currency": "USD",
    "category_id": "'$CATEGORY_ID'",
    "description": "Grocery shopping"
  }'

# 5. Get analytics summary
curl -X GET http://localhost:8001/api/analytics/summary \
  -H "Authorization: Bearer $TOKEN"

# 6. Get expenses with filters
curl -X GET "http://localhost:8001/api/expenses?limit=10&category_id=$CATEGORY_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### JavaScript/TypeScript Example

```typescript
const API_URL = 'http://localhost:8001/api';

// Register
const register = async () => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'John Doe',
      email: 'john@example.com',
      pin: '1234'
    })
  });
  return response.json();
};

// Create expense
const createExpense = async (token: string) => {
  const response = await fetch(`${API_URL}/expenses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      amount: 150.50,
      currency: 'USD',
      category_id: 'cat-001',
      description: 'Grocery shopping'
    })
  });
  return response.json();
};

// Get analytics
const getAnalytics = async (token: string) => {
  const response = await fetch(`${API_URL}/analytics/summary`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

---

## Interactive Documentation

For interactive API testing, visit:
- **Swagger UI**: `http://localhost:8001/docs`
- **ReDoc**: `http://localhost:8001/redoc`

These provide a web interface to test all endpoints directly in your browser.

---

*Last updated: December 2024*
