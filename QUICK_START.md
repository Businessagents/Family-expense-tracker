# Family Expense Tracker - Quick Start Guide

This guide will help you get the Family Expense Tracker app running on your local machine in under 10 minutes.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** - [Download](https://www.python.org/downloads/)
- **Node.js 16+** - [Download](https://nodejs.org/)
- **MongoDB** - [Download](https://www.mongodb.com/try/download/community) or use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier)
- **Yarn** (optional but recommended) - `npm install -g yarn`
- **Expo CLI** (optional) - `npm install -g expo-cli`

## Setup Steps

### 1. Clone the Repository

```bash
git clone https://github.com/Businessagents/Family-expense-tracker.git
cd Family-expense-tracker
```

### 2. Setup MongoDB

**Option A: Local MongoDB**
```bash
# Start MongoDB service
# On macOS:
brew services start mongodb-community

# On Linux:
sudo systemctl start mongod

# On Windows:
# MongoDB runs as a service automatically after installation
```

**Option B: MongoDB Atlas (Cloud)**
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/`)

### 3. Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=family_finance
SECRET_KEY=family-finance-secret-key-2024-change-me
EOF

# Note: If using MongoDB Atlas, replace MONGO_URL with your Atlas connection string

# Start the backend server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

The backend will start on `http://localhost:8001`

You can view the API documentation at `http://localhost:8001/docs`

### 4. Setup Frontend

Open a **new terminal window** (keep the backend running):

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
yarn install
# or: npm install

# Create .env file
cat > .env << EOF
EXPO_PUBLIC_BACKEND_URL=http://localhost:8001
EOF

# Start the Expo development server
yarn start
# or: npm start
```

### 5. Run the App

After running `yarn start`, you'll see a QR code and several options:

**Option A: Run on Physical Device (Recommended for Testing)**
1. Install **Expo Go** app on your phone:
   - iOS: [App Store](https://apps.apple.com/app/expo-go/id982107779)
   - Android: [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Scan the QR code with your phone camera (iOS) or Expo Go app (Android)
3. The app will open in Expo Go

**Option B: Run on Android Emulator**
```bash
yarn android
# or: npm run android
```

**Option C: Run on iOS Simulator (macOS only)**
```bash
yarn ios
# or: npm run ios
```

**Option D: Run in Web Browser**
```bash
yarn web
# or: npm run web
```

## Using the App

### First Time Setup

1. **Register**: Create an account with your name, email, and a 4-6 digit PIN
2. **Create Family**: Set up your family group and get an invite code
3. **Add Expenses**: Start tracking your expenses!

### Inviting Family Members

1. Go to **Profile** tab
2. Share your **Family Invite Code** (6 characters)
3. Family members enter this code during their family setup

### Adding an Expense

1. Tap the **Add** tab (+ icon)
2. Select a category
3. Enter the amount
4. Choose currency (defaults to your preference)
5. Add description (optional)
6. Set date (defaults to today)
7. Tap **Add Expense**

### Viewing Analytics

1. Go to **Analytics** tab
2. See spending by:
   - Category
   - Family member
   - Time period
3. View trends over time

## Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'fastapi'`
- **Solution**: Make sure you've installed dependencies: `pip install -r requirements.txt`

**Problem**: `Connection refused` or MongoDB connection error
- **Solution**: 
  - Check if MongoDB is running: `mongo --version` or `mongod --version`
  - Verify MONGO_URL in `.env` file
  - For MongoDB Atlas, ensure your IP is whitelisted

**Problem**: Port 8001 already in use
- **Solution**: 
  - Find and kill the process: `lsof -ti:8001 | xargs kill -9` (macOS/Linux)
  - Or use a different port: `uvicorn server:app --port 8002`
  - Update frontend .env accordingly

### Frontend Issues

**Problem**: `Unable to resolve module`
- **Solution**: 
  - Clear cache: `yarn start --clear`
  - Delete node_modules and reinstall: `rm -rf node_modules && yarn install`

**Problem**: "Network request failed" when using the app
- **Solution**: 
  - Make sure backend is running on `http://localhost:8001`
  - On physical device, replace `localhost` with your computer's IP:
    ```bash
    # In frontend/.env
    EXPO_PUBLIC_BACKEND_URL=http://192.168.1.100:8001
    ```
  - Find your IP with `ipconfig` (Windows) or `ifconfig` (macOS/Linux)

**Problem**: Expo Go won't connect
- **Solution**: 
  - Ensure phone and computer are on the same WiFi network
  - Disable VPN on computer
  - Try running with tunnel: `yarn start --tunnel`

### General Tips

- **Clear App Cache**: In Expo Go, shake device → Clear cache
- **Restart Everything**: Stop both servers, clear caches, restart
- **Check Logs**: Backend logs appear in terminal where you ran uvicorn
- **Network Debugging**: Use `http://localhost:8001/docs` to test API directly

## Next Steps

Now that you have the app running:

1. 📖 Read the [full documentation](./APP_ANALYSIS.md) to understand the architecture
2. 🧪 Run the tests: `pytest` in the backend directory
3. 🎨 Explore the code and customize it
4. 🚀 Deploy to production (see deployment section in APP_ANALYSIS.md)

## Quick Reference

### Useful Commands

**Backend**:
```bash
# Start server
uvicorn server:app --reload --port 8001

# Run tests
pytest

# Format code
black server.py
```

**Frontend**:
```bash
# Start dev server
yarn start

# Run on Android
yarn android

# Run on iOS
yarn ios

# Run linter
yarn lint

# Clear cache
yarn start --clear
```

### Default Credentials

There are no default credentials. Each user must register with:
- Name (any string)
- Email (valid email format)
- PIN (4-6 digits)

### API Endpoints

- API Base URL: `http://localhost:8001/api`
- API Documentation: `http://localhost:8001/docs`
- Interactive API: `http://localhost:8001/redoc`

### Supported Currencies

- 🇮🇳 INR (Indian Rupee) - ₹
- 🇺🇸 USD (US Dollar) - $
- 🇨🇦 CAD (Canadian Dollar) - C$
- 🇸🇦 SAR (Saudi Riyal) - ﷼

## Getting Help

- **Documentation**: See [APP_ANALYSIS.md](./APP_ANALYSIS.md)
- **Issues**: Check existing tests in `backend_test.py`, `core_backend_test.py`
- **API Reference**: Visit `http://localhost:8001/docs` when backend is running

## Development Workflow

1. Make changes to backend code → Server auto-reloads (if using `--reload`)
2. Make changes to frontend code → App auto-refreshes in Expo Go
3. Test your changes manually in the app
4. Run automated tests: `pytest`
5. Commit your changes

Happy coding! 🎉
