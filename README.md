# Family Expense Tracker 🏠💰

A collaborative mobile application for families to track and manage shared expenses together.

[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React Native](https://img.shields.io/badge/React_Native-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=flat&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=flat&logo=expo&logoColor=white)](https://expo.dev/)

---

## 📚 Documentation

I've created comprehensive documentation to help you understand and work with this application:

### 📖 Quick Navigation

| Document | Purpose | Best For |
|----------|---------|----------|
| **[QUICK_START.md](./QUICK_START.md)** | Get the app running in under 10 minutes | Setting up locally |
| **[APP_ANALYSIS.md](./APP_ANALYSIS.md)** | Complete technical deep-dive (25KB) | Understanding architecture |
| **[API_REFERENCE.md](./API_REFERENCE.md)** | All 30+ API endpoints with examples | API integration |
| **[DOCUMENTATION_SUMMARY.md](./DOCUMENTATION_SUMMARY.md)** | Guide to all documentation | Navigation |

---

## 🚀 Quick Start

```bash
# 1. Start Backend
cd backend
pip install -r requirements.txt
# Create .env: MONGO_URL, DB_NAME, SECRET_KEY
uvicorn server:app --reload --port 8001

# 2. Start Frontend (new terminal)
cd frontend
yarn install
# Create .env: EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
yarn start

# 3. Scan QR code with Expo Go app
```

**Full setup instructions:** [QUICK_START.md](./QUICK_START.md)

---

## ✨ Features

- 👨‍👩‍👧‍👦 **Family Collaboration** - Create/join family groups with invite codes
- 💰 **Multi-Currency Support** - INR, USD, CAD, SAR
- 📊 **Rich Analytics** - Category, member, and time-based insights  
- 🎨 **Beautiful Mobile UI** - React Native with Expo
- 🔒 **Secure** - JWT authentication with PIN-based login
- 📱 **Cross-Platform** - iOS, Android, and Web

---

## 🏗️ Architecture

```
┌─────────────────────────────────┐
│   React Native Mobile App       │
│   (Expo Router)                │
└──────────────┬──────────────────┘
               │ REST API + JWT
               ▼
┌─────────────────────────────────┐
│   FastAPI Backend Server        │
│   (Python)                     │
└──────────────┬──────────────────┘
               │ Motor (Async)
               ▼
┌─────────────────────────────────┐
│   MongoDB Database              │
│   (4 Collections)              │
└─────────────────────────────────┘
```

**Technology Stack:**
- **Backend:** FastAPI, MongoDB, JWT, BCrypt
- **Frontend:** React Native, Expo Router, TypeScript
- **Features:** 30+ API endpoints, 6 analytics views, 10 default categories

**See full architecture:** [APP_ANALYSIS.md](./APP_ANALYSIS.md)

---

## 📖 Documentation Overview

### 🎯 [QUICK_START.md](./QUICK_START.md) (7KB)
Step-by-step setup guide to get running quickly:
- Prerequisites and installation
- Backend setup (Python, MongoDB)
- Frontend setup (Node.js, Expo)
- Running on device/emulator/web
- Troubleshooting common issues

### 🔍 [APP_ANALYSIS.md](./APP_ANALYSIS.md) (25KB)
Complete technical documentation:
- Architecture overview with diagrams
- Technology stack details
- All 6 feature areas explained
- Backend architecture (models, routes, database)
- Frontend architecture (screens, navigation)
- Complete data models
- Security implementation
- Deployment guides (Docker, cloud)

### 🔌 [API_REFERENCE.md](./API_REFERENCE.md) (19KB)
Complete API endpoint reference:
- All 30+ endpoints documented
- Request/response schemas
- Authentication (register, login, profile)
- CRUD operations (families, categories, expenses)
- Analytics endpoints (5 types)
- cURL and TypeScript examples
- Error response formats

### 📊 [DOCUMENTATION_SUMMARY.md](./DOCUMENTATION_SUMMARY.md) (13KB)
Navigation guide to all documentation:
- Overview of what each document covers
- Audience-specific reading paths
- Key insights and statistics
- Use cases and examples

---

## 🎯 Key Features Explained

### Family Management
- Create family groups with unique invite codes
- Join existing families using 6-character codes
- View all family members with color-coded avatars
- Leave family when needed

### Expense Tracking  
- Add expenses with amount, category, currency, description
- Edit and delete your expenses
- Filter by date range, category, or family member
- See who paid for each expense

### Categories
- 10 default categories (Groceries, Utilities, Rent, etc.)
- Create custom categories for your family
- Each category has icon and color
- Delete custom categories (default ones protected)

### Analytics
- **Summary:** Today, month, and total spending
- **By Category:** See spending breakdown by category
- **By Member:** Compare spending across family members
- **Trends:** Monthly spending patterns (6 months)
- **Daily:** Daily spending patterns (30 days)

### Multi-Currency
- Support for 4 currencies: INR (₹), USD ($), CAD (C$), SAR (﷼)
- Each expense tracked in original currency
- Analytics grouped by currency
- User can set default currency preference

---

## 🔒 Security

- **Authentication:** JWT tokens with 30-day expiry
- **Password Hashing:** BCrypt with automatic salting
- **PIN-based Login:** 4-6 digit PINs for mobile convenience
- **Data Isolation:** Users only access their family's data
- **Input Validation:** Pydantic models validate all inputs

**Security details:** [APP_ANALYSIS.md#security](./APP_ANALYSIS.md#security)

---

## 🧪 Testing

```bash
# Run backend tests
pytest backend_test.py
pytest core_backend_test.py
pytest validation_test.py

# Frontend linting
cd frontend
yarn lint
```

---

## 🚀 Deployment

### Backend
```bash
# Production with Gunicorn
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8001
```

### Frontend
```bash
# Build APK/IPA
eas build --platform android
eas build --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

**Full deployment guide:** [APP_ANALYSIS.md#setup-and-deployment](./APP_ANALYSIS.md#setup-and-deployment)

---

## 📊 Project Statistics

- **Backend:** 1,034 lines in `server.py`
- **API Endpoints:** 30+ endpoints across 6 route groups
- **Database Collections:** 4 (users, families, categories, expenses)
- **Supported Currencies:** 4 (INR, USD, CAD, SAR)
- **Default Categories:** 10 predefined categories
- **Documentation:** 2,000+ lines across 5 documents

---

## 💡 Use Cases

- **Families:** Track household expenses and bills
- **Roommates:** Split rent, utilities, groceries
- **Couples:** Manage joint finances together
- **Small Teams:** Track project or team expenses
- **Travel Groups:** Monitor shared trip costs

---

## 📱 API Endpoints

| Category | Endpoints | Description |
|----------|-----------|-------------|
| **Authentication** | 4 endpoints | Register, login, profile |
| **Family** | 4 endpoints | Create, join, get, leave |
| **Categories** | 3 endpoints | List, create, delete |
| **Expenses** | 5 endpoints | Full CRUD + filtering |
| **Analytics** | 5 endpoints | Summary, category, member, trends, daily |
| **Utilities** | 2 endpoints | Currencies, health check |

**Interactive API docs:** `http://localhost:8001/docs` (when backend running)

**Complete reference:** [API_REFERENCE.md](./API_REFERENCE.md)

---

## 🗂️ Project Structure

```
Family-expense-tracker/
├── backend/
│   ├── server.py              # Main FastAPI application (1034 lines)
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables (create this)
│
├── frontend/
│   ├── app/                   # Expo Router pages
│   │   ├── (auth)/           # Login, register, family-setup
│   │   └── (main)/           # Home, expenses, add, analytics, profile
│   ├── src/
│   │   ├── contexts/         # AuthContext
│   │   └── services/         # API service
│   └── package.json
│
├── tests/                     # Backend tests
├── APP_ANALYSIS.md           # Complete technical docs
├── API_REFERENCE.md          # API endpoint reference
├── QUICK_START.md            # Setup guide
├── DOCUMENTATION_SUMMARY.md  # Documentation index
└── README.md                 # This file
```

---

## 🛠️ Technology Details

### Backend Stack
- **FastAPI** - Modern Python web framework
- **MongoDB** - NoSQL database with Motor async driver
- **Pydantic** - Data validation and settings management
- **PyJWT** - JSON Web Token implementation
- **Passlib** - Password hashing with BCrypt
- **Uvicorn** - Lightning-fast ASGI server

### Frontend Stack
- **React Native 0.79.5** - Native mobile framework
- **React 19.0.0** - Latest React version
- **Expo 54.0+** - Development platform
- **Expo Router 5.1+** - File-based routing
- **TypeScript 5.8+** - Type safety
- **Zustand 5.0+** - State management
- **AsyncStorage** - Local persistence

---

## 🎓 Learning Path

**For New Developers:**
1. Read [DOCUMENTATION_SUMMARY.md](./DOCUMENTATION_SUMMARY.md) for overview
2. Follow [QUICK_START.md](./QUICK_START.md) to set up
3. Study [APP_ANALYSIS.md](./APP_ANALYSIS.md) for architecture

**For API Integration:**
1. Use [API_REFERENCE.md](./API_REFERENCE.md) for all endpoints
2. Test at `http://localhost:8001/docs`
3. Check examples in API_REFERENCE.md

**For Understanding Codebase:**
1. Read [APP_ANALYSIS.md](./APP_ANALYSIS.md) → Backend/Frontend sections
2. Review `backend/server.py` (1034 lines, well-commented)
3. Explore `frontend/app/` for screen components

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pytest`
5. Commit with clear messages
6. Open a Pull Request

---

## 📞 Support & Resources

- **📖 Documentation:** See files listed above
- **🐛 Issues:** Open GitHub issue
- **💡 Features:** Create feature request
- **📧 Contact:** [Repository owner]

---

## 🌟 Future Enhancements

Potential features for future development:
- Budget limits and alerts
- Receipt photo uploads (S3)
- Recurring expenses
- Bill splitting algorithms
- Export to CSV/PDF
- Bank account integration
- Multi-language support (i18n)
- Push notifications
- Dark mode
- Offline support with sync

**See full list:** [APP_ANALYSIS.md#future-enhancements](./APP_ANALYSIS.md)

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🎉 Getting Started Now

1. **Read this:** [QUICK_START.md](./QUICK_START.md)
2. **Set up locally:** Follow the Quick Start section above
3. **Explore API:** Visit `http://localhost:8001/docs`
4. **Start coding:** Check [APP_ANALYSIS.md](./APP_ANALYSIS.md) for architecture

---

**Built with ❤️ for families who want to manage finances together**

*For detailed technical documentation, see the documents linked above. Each document serves a specific purpose - choose based on what you need to accomplish.*
