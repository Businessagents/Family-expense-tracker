# Family Finance Tracker

A comprehensive mobile application for tracking household and personal expenses, similar to Splitwise. Built with React Native (Expo) and FastAPI, designed for families and groups to manage shared finances efficiently.

![Platform](https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-blue)
![Tech Stack](https://img.shields.io/badge/Stack-Expo%20%7C%20FastAPI%20%7C%20MongoDB-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## Features

### Core Functionality
- **Multi-Currency Support** - Track expenses in INR (₹), USD ($), CAD (C$), and SAR (﷼)
- **Personal & Shared Groups** - Separate personal expenses from shared group expenses
- **Expense Categories** - 10 pre-defined categories with custom icons and colors
- **Real-time Analytics** - Daily, monthly, and category-wise expense breakdowns

### Group Management
- **Personal Space** - Auto-created personal group for individual expense tracking
- **Shared Groups** - Create groups for family, roommates, or friends
- **Invite System** - Share 6-character invite codes to add members
- **Member Management** - View members, leave groups, or delete groups you own

### Security
- **PIN Authentication** - 4-6 digit PIN for login
- **Biometric Unlock** - Fingerprint/Face ID support (device dependent)
- **Auto-Lock** - Configurable auto-lock timeout (1-30 minutes)
- **Session Management** - Secure JWT-based authentication

### Export & Reports
- **CSV Export** - Export expenses to CSV for use in Google Sheets or Excel
- **Export Options**:
  - Entire history
  - Monthly exports
  - Custom date range
  - Group-wise filtering

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React Native | Cross-platform mobile framework |
| Expo SDK 53 | Development & build tooling |
| Expo Router | File-based navigation |
| TypeScript | Type safety |
| AsyncStorage | Local data persistence |
| Expo SecureStore | Secure credential storage |
| Expo LocalAuthentication | Biometric authentication |

### Backend
| Technology | Purpose |
|------------|---------|
| FastAPI | High-performance Python API framework |
| MongoDB | NoSQL database for flexible data storage |
| Motor | Async MongoDB driver |
| JWT | Secure token-based authentication |
| Passlib + Bcrypt | Password/PIN hashing |

## Project Structure

```
├── backend/
│   ├── server.py          # FastAPI application with all routes
│   ├── requirements.txt   # Python dependencies
│   └── .env              # Environment variables
│
├── frontend/
│   ├── app/
│   │   ├── (auth)/       # Authentication screens
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── family-setup.tsx
│   │   ├── (main)/       # Main app screens
│   │   │   ├── home.tsx      # Dashboard
│   │   │   ├── expenses.tsx  # Expense list
│   │   │   ├── add.tsx       # Add expense
│   │   │   ├── analytics.tsx # Charts & stats
│   │   │   ├── groups.tsx    # Group management
│   │   │   ├── export.tsx    # CSV export
│   │   │   └── profile.tsx   # Settings
│   │   ├── lock.tsx      # Lock screen
│   │   └── _layout.tsx   # Root layout
│   ├── src/
│   │   ├── contexts/     # React contexts
│   │   │   ├── AuthContext.tsx
│   │   │   └── GroupContext.tsx
│   │   └── services/
│   │       └── api.ts    # API service layer
│   └── package.json
│
└── README.md
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login with email & PIN |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/verify-pin` | Verify PIN for app unlock |
| PUT | `/api/auth/profile` | Update user profile |
| PUT | `/api/auth/change-pin` | Change PIN |

### Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/groups` | Get user's groups |
| POST | `/api/groups` | Create new group |
| POST | `/api/groups/join` | Join group with invite code |
| POST | `/api/groups/{id}/leave` | Leave a group |
| DELETE | `/api/groups/{id}` | Delete a group |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get expenses (with filters) |
| POST | `/api/expenses` | Create expense |
| PUT | `/api/expenses/{id}` | Update expense |
| DELETE | `/api/expenses/{id}` | Delete expense |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/summary` | Get expense summary |
| GET | `/api/analytics/by-category` | Category breakdown |
| GET | `/api/analytics/by-member` | Member breakdown |
| GET | `/api/analytics/trends` | Monthly trends |
| GET | `/api/analytics/daily` | Daily breakdown |

### Export
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/export/csv` | Export expenses to CSV |

## Installation

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB 6.0+
- Expo CLI (`npm install -g expo-cli`)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URL and secret key

# Run the server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
yarn install

# Configure environment
cp .env.example .env
# Edit .env with your backend URL

# Start Expo development server
yarn start
```

### Environment Variables

#### Backend (`backend/.env`)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=family_finance
SECRET_KEY=your-secret-key-here
```

#### Frontend (`frontend/.env`)
```env
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
```

## Running the App

### Development
```bash
# Terminal 1 - Backend
cd backend && uvicorn server:app --reload --port 8001

# Terminal 2 - Frontend
cd frontend && yarn start
```

### Testing on Device
1. Install **Expo Go** from App Store / Play Store
2. Scan the QR code shown in terminal
3. App will load on your device

### Building for Production

```bash
# Android APK
cd frontend
eas build --platform android --profile preview

# iOS (requires Apple Developer account)
eas build --platform ios --profile preview
```

## Default Categories

| Category | Icon | Color |
|----------|------|-------|
| Groceries | 🛒 | Green |
| Utilities | ⚡ | Orange |
| Rent | 🏠 | Purple |
| Transport | 🚗 | Blue |
| Entertainment | 🎬 | Pink |
| Healthcare | 🏥 | Red |
| Food & Dining | 🍽️ | Deep Orange |
| Shopping | 🛍️ | Deep Purple |
| Education | 🎓 | Cyan |
| Others | ⋯ | Gray |

## Screenshots

The app features a modern dark theme with intuitive navigation:

- **Home**: Dashboard with expense summaries and group selector
- **Expenses**: Filterable list of all expenses
- **Add**: Quick expense entry with category selection
- **Analytics**: Visual charts and spending insights
- **Profile**: Settings, security options, and export

## Security Considerations

- All passwords (PINs) are hashed using bcrypt
- JWT tokens expire after 30 days
- Auto-lock feature prevents unauthorized access
- Biometric authentication available on supported devices
- HTTPS should be used in production

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Expo](https://expo.dev/) - React Native development platform
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [MongoDB](https://www.mongodb.com/) - Document database
- [Ionicons](https://ionic.io/ionicons) - Icon library

---

**Built with ❤️ for families managing finances together**
