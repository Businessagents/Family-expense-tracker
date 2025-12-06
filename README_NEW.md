# Family Expense Tracker - README

## 🌟 Overview

**Family Expense Tracker** is a collaborative mobile application that helps families track and manage their shared expenses together. Built with modern technologies, it provides real-time expense tracking, analytics, and insights for better financial management.

### 📱 Key Features

- 👨‍👩‍👧‍👦 **Family Collaboration**: Create or join family groups to track expenses together
- 💰 **Multi-Currency Support**: Track expenses in INR, USD, CAD, or SAR
- 📊 **Rich Analytics**: View spending patterns by category, member, and time period
- 🎨 **Beautiful UI**: Clean, intuitive React Native interface
- 🔒 **Secure**: JWT authentication with PIN-based login
- 📱 **Cross-Platform**: Works on iOS, Android, and Web

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE APPLICATION                       │
│              React Native + Expo Router                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   Home   │ │ Expenses │ │   Add    │ │Analytics │      │
│  │  Screen  │ │  Screen  │ │  Screen  │ │  Screen  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│         │              │             │            │         │
│         └──────────────┴─────────────┴────────────┘         │
│                          │                                   │
│                   AuthContext + API Service                 │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    REST API (JSON)
                    JWT Bearer Token
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    BACKEND SERVER                           │
│                    FastAPI (Python)                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   Auth   │ │  Family  │ │ Category │ │ Expense  │      │
│  │  Routes  │ │  Routes  │ │  Routes  │ │  Routes  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│         │              │             │            │         │
│         └──────────────┴─────────────┴────────────┘         │
│                          │                                   │
│                    Motor (Async Driver)                     │
└───────────────────────────┬─────────────────────────────────┘
                            │
                    MongoDB Protocol
                            │
┌───────────────────────────▼─────────────────────────────────┐
│                    MONGODB DATABASE                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │  users   │ │ families │ │categories│ │ expenses │      │
│  │collection│ │collection│ │collection│ │collection│      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- MongoDB
- Yarn or npm

### Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Create .env file
echo "MONGO_URL=mongodb://localhost:27017" > .env
echo "DB_NAME=family_finance" >> .env
echo "SECRET_KEY=your-secret-key" >> .env

# Start server
uvicorn server:app --reload --port 8001
```

### Frontend Setup

```bash
cd frontend
yarn install

# Create .env file
echo "EXPO_PUBLIC_BACKEND_URL=http://localhost:8001" > .env

# Start app
yarn start
```

📖 **Detailed Setup**: See [QUICK_START.md](./QUICK_START.md) for step-by-step instructions

---

## 📊 How It Works

### User Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     USER JOURNEY                             │
└─────────────────────────────────────────────────────────────┘

1️⃣ REGISTRATION
   User registers → Email + PIN → JWT Token → Stored locally

2️⃣ FAMILY SETUP
   ├─ Create Family → Get 6-char invite code → Share with family
   └─ Join Family → Enter invite code → Join existing family

3️⃣ ADD EXPENSES
   Select category → Enter amount → Choose currency → Save
   
4️⃣ VIEW ANALYTICS
   Summary cards → Category charts → Member breakdown → Trends

5️⃣ COLLABORATION
   All family members → See same expenses → Real-time updates
```

### Data Flow

```
┌───────────────────────────────────────────────────────────────┐
│              EXPENSE CREATION FLOW                            │
└───────────────────────────────────────────────────────────────┘

User fills form
     ↓
Validate inputs (React Hook Form)
     ↓
POST /api/expenses
     ↓
Backend validates (Pydantic)
     ↓
Check user is in family
     ↓
Verify category exists
     ↓
Create expense document
     ↓
Save to MongoDB
     ↓
Return expense with category/user info
     ↓
Update UI
     ↓
Visible to all family members
```

---

## 🛠️ Technology Stack

### Backend
| Technology | Purpose | Version |
|------------|---------|---------|
| FastAPI | Web framework | Latest |
| MongoDB | Database | 4.5+ |
| Motor | Async MongoDB driver | 3.3+ |
| Pydantic | Data validation | 2.12+ |
| PyJWT | JWT authentication | 2.10+ |
| Passlib | Password hashing | 1.7+ |
| Uvicorn | ASGI server | 0.25+ |

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| React Native | Mobile framework | 0.79.5 |
| React | UI library | 19.0.0 |
| Expo | Development platform | 54.0+ |
| Expo Router | File-based routing | 5.1+ |
| TypeScript | Type safety | 5.8+ |
| Zustand | State management | 5.0+ |
| React Hook Form | Form handling | 7.68+ |

---

## 📁 Project Structure

```
Family-expense-tracker/
│
├── backend/                    # FastAPI backend
│   ├── server.py              # Main application file
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables (create this)
│
├── frontend/                   # React Native frontend
│   ├── app/                   # Expo Router pages
│   │   ├── (auth)/           # Authentication screens
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── family-setup.tsx
│   │   ├── (main)/           # Main app screens
│   │   │   ├── home.tsx
│   │   │   ├── expenses.tsx
│   │   │   ├── add.tsx
│   │   │   ├── analytics.tsx
│   │   │   └── profile.tsx
│   │   └── index.tsx         # Entry point
│   │
│   ├── src/
│   │   ├── contexts/         # React contexts
│   │   │   └── AuthContext.tsx
│   │   └── services/         # API layer
│   │       └── api.ts
│   │
│   ├── package.json
│   └── .env                  # Environment variables (create this)
│
├── tests/                     # Test files
│   ├── backend_test.py
│   ├── core_backend_test.py
│   └── validation_test.py
│
├── APP_ANALYSIS.md           # Comprehensive documentation
├── QUICK_START.md            # Setup guide
└── README.md                 # This file
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/PIN
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Family Management
- `POST /api/family/create` - Create family
- `POST /api/family/join` - Join family
- `GET /api/family` - Get family details
- `POST /api/family/leave` - Leave family

### Expense Tracking
- `POST /api/expenses` - Create expense
- `GET /api/expenses` - List expenses (with filters)
- `GET /api/expenses/{id}` - Get expense
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense

### Analytics
- `GET /api/analytics/summary` - Overall summary
- `GET /api/analytics/by-category` - Category breakdown
- `GET /api/analytics/by-member` - Member breakdown
- `GET /api/analytics/trends` - Monthly trends
- `GET /api/analytics/daily` - Daily patterns

📚 **Full API Documentation**: Visit `http://localhost:8001/docs` when backend is running

---

## 💾 Database Schema

### Users Collection
```javascript
{
  id: "uuid",
  name: "John Doe",
  email: "john@example.com",
  pin_hash: "bcrypt_hash",
  avatar_color: "#FF6B6B",
  family_id: "family_uuid",
  default_currency: "USD",
  created_at: "2024-01-01T00:00:00Z"
}
```

### Families Collection
```javascript
{
  id: "uuid",
  name: "Doe Family",
  invite_code: "ABC123",
  created_by: "user_uuid",
  created_at: "2024-01-01T00:00:00Z"
}
```

### Expenses Collection
```javascript
{
  id: "uuid",
  amount: 150.00,
  currency: "USD",
  category_id: "category_uuid",
  description: "Grocery shopping",
  paid_by: "user_uuid",
  family_id: "family_uuid",
  date: "2024-01-15T10:30:00Z",
  created_at: "2024-01-15T10:30:00Z"
}
```

### Categories Collection
```javascript
{
  id: "uuid",
  name: "Groceries",
  icon: "cart",
  color: "#4CAF50",
  is_custom: false,
  family_id: null  // null for default categories
}
```

---

## 🔒 Security

### Authentication
- **PIN-based login**: 4-6 digit PIN for quick mobile access
- **BCrypt hashing**: Secure password hashing with automatic salting
- **JWT tokens**: 30-day expiry, signed with secret key
- **Bearer authentication**: Token sent in Authorization header

### Data Protection
- **Family isolation**: Users only access their family's data
- **Input validation**: All inputs validated with Pydantic
- **HTTPS recommended**: Use SSL/TLS in production
- **Environment secrets**: Sensitive data in .env files

---

## 🧪 Testing

### Run Backend Tests
```bash
# Run all tests
pytest

# Run specific test file
pytest backend_test.py

# Run with coverage
pytest --cov=backend
```

### Test Coverage
- User registration and login
- Family creation and joining
- Expense CRUD operations
- Category management
- Analytics endpoints
- Input validation

---

## 🎯 Use Cases

### Perfect For
- 👨‍👩‍👧‍👦 **Families**: Track household expenses together
- 🏠 **Roommates**: Split bills and shared costs
- 💑 **Couples**: Manage joint finances
- 👥 **Small Teams**: Track project expenses
- 🎓 **Student Groups**: Manage group expenses

### Example Scenarios
1. **Monthly Groceries**: Family tracks weekly grocery expenses
2. **Utilities**: Roommates split electricity, water, internet bills
3. **Trip Expenses**: Group tracks vacation costs
4. **Household Maintenance**: Track repairs and improvements
5. **Entertainment**: Monitor dining out and entertainment spending

---

## 📈 Features in Detail

### 1. Dashboard (Home Screen)
- Summary cards showing:
  - Today's spending
  - This month's spending
  - Total spending
- Recent 5 expenses
- Quick access to add expense
- Pull-to-refresh

### 2. Expense List
- All expenses sorted by date
- Filter by:
  - Date range
  - Category
  - Family member
- Edit/delete capabilities
- Pagination support

### 3. Add Expense
- Category selection with icons
- Amount input with currency
- Optional description
- Date picker
- Form validation

### 4. Analytics
- **Summary Stats**: Today, month, total
- **Category Breakdown**: Pie/bar charts
- **Member Comparison**: Who spent what
- **Trends**: Monthly and daily patterns
- **Filters**: Custom date ranges

### 5. Profile Management
- View family information
- Share invite code
- Update name and currency
- Leave family option
- Logout

---

## 🚀 Deployment

### Backend Deployment

**Option 1: Traditional Server**
```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export MONGO_URL="your-mongodb-url"
export DB_NAME="family_finance"
export SECRET_KEY="your-secret-key"

# Run with Gunicorn
gunicorn server:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8001
```

**Option 2: Docker**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

**Option 3: Cloud Platforms**
- **Heroku**: Use Procfile with uvicorn
- **AWS**: Deploy on EC2 or use Elastic Beanstalk
- **Google Cloud**: Use Cloud Run or App Engine
- **Azure**: Use App Service

### Frontend Deployment

**Build APK/IPA**
```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

**Publish to App Stores**
```bash
# Submit to Google Play
eas submit --platform android

# Submit to App Store
eas submit --platform ios
```

---

## 📝 Environment Variables

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=family_finance
SECRET_KEY=your-super-secret-key-change-this
```

### Frontend (.env)
```env
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
```

⚠️ **Security Note**: Never commit .env files to git. They're in .gitignore.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `pytest`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

---

## 📄 Documentation

- **[APP_ANALYSIS.md](./APP_ANALYSIS.md)** - Comprehensive technical documentation
- **[QUICK_START.md](./QUICK_START.md)** - Step-by-step setup guide
- **API Docs** - Interactive docs at `http://localhost:8001/docs`

---

## 🐛 Troubleshooting

### Common Issues

**Backend won't start**
- Check MongoDB is running
- Verify .env file exists with correct values
- Ensure port 8001 is not in use

**Frontend can't connect to backend**
- Verify backend is running on port 8001
- Check EXPO_PUBLIC_BACKEND_URL in .env
- On physical device, use computer's IP instead of localhost

**Database errors**
- Ensure MongoDB is running
- Check database name in .env
- Verify MongoDB connection string

See [QUICK_START.md](./QUICK_START.md) for detailed troubleshooting steps.

---

## 📊 System Requirements

### Backend
- Python 3.8 or higher
- MongoDB 4.4 or higher
- 512MB RAM minimum
- Linux, macOS, or Windows

### Frontend Development
- Node.js 16 or higher
- 2GB RAM minimum
- iOS Simulator (macOS only)
- Android Emulator or physical device
- Modern web browser

---

## 🌟 Future Enhancements

Potential features for future development:

- [ ] Budget limits and alerts
- [ ] Receipt photo uploads (S3 integration)
- [ ] Recurring expenses
- [ ] Expense splitting algorithms
- [ ] Export to CSV/PDF
- [ ] Bank account integration
- [ ] Multi-language support (i18n)
- [ ] Push notifications
- [ ] Dark mode
- [ ] Offline support with sync
- [ ] Expense categories with subcategories
- [ ] Bill reminders
- [ ] Monthly reports via email
- [ ] Data visualization improvements

---

## 📞 Support

- 📖 **Documentation**: See APP_ANALYSIS.md
- 🐛 **Bug Reports**: Open an issue on GitHub
- 💡 **Feature Requests**: Create a feature request issue
- 📧 **Contact**: [Your contact information]

---

## 📜 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

Built with:
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [React Native](https://reactnative.dev/) - Mobile app framework
- [Expo](https://expo.dev/) - Development platform
- [MongoDB](https://www.mongodb.com/) - Database
- [Ionicons](https://ionic.io/ionicons) - Beautiful icons

---

**Made with ❤️ for families who want to manage finances together**

