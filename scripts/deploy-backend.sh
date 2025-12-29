#!/bin/bash

# Family Expense Tracker - Backend Deployment Script
# This script helps deploy the backend to various platforms

set -e

echo "========================================"
echo "Family Expense Tracker Backend Deployment"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "server.py" ]; then
    echo "Error: Please run this script from the backend directory"
    exit 1
fi

# Function to deploy to Railway
deploy_railway() {
    echo "Deploying to Railway..."

    if ! command -v railway &> /dev/null; then
        echo "Installing Railway CLI..."
        npm install -g @railway/cli
    fi

    echo "Please login to Railway:"
    railway login

    echo "Initializing project..."
    railway init

    echo ""
    echo "Setting environment variables..."
    echo "Please enter your MongoDB connection string:"
    read -s MONGO_URL
    railway variables set MONGO_URL="$MONGO_URL"
    railway variables set DB_NAME="family_finance"
    railway variables set SECRET_KEY="$(openssl rand -hex 32)"
    railway variables set CORS_ALLOW_ORIGINS="*"

    echo ""
    echo "Deploying..."
    railway up

    echo ""
    echo "Deployment complete!"
    echo "Your API URL will be shown above."
}

# Function to deploy to Render
deploy_render() {
    echo "Deploying to Render..."
    echo ""
    echo "For Render deployment:"
    echo "1. Go to https://render.com and sign in"
    echo "2. Click 'New +' > 'Web Service'"
    echo "3. Connect your GitHub repository"
    echo "4. Set the following:"
    echo "   - Root Directory: backend"
    echo "   - Build Command: pip install -r requirements.txt"
    echo "   - Start Command: uvicorn server:app --host 0.0.0.0 --port \$PORT"
    echo "5. Add environment variables:"
    echo "   - MONGO_URL: your MongoDB connection string"
    echo "   - DB_NAME: family_finance"
    echo "   - SECRET_KEY: (generate a random string)"
    echo "   - CORS_ALLOW_ORIGINS: *"
    echo ""
    echo "Opening Render dashboard..."
    if command -v xdg-open &> /dev/null; then
        xdg-open "https://dashboard.render.com/new/web"
    elif command -v open &> /dev/null; then
        open "https://dashboard.render.com/new/web"
    fi
}

# Function to deploy to Fly.io
deploy_fly() {
    echo "Deploying to Fly.io..."

    if ! command -v fly &> /dev/null; then
        echo "Installing Fly CLI..."
        curl -L https://fly.io/install.sh | sh
    fi

    echo "Please login to Fly.io:"
    fly auth login

    echo "Launching app..."
    fly launch --name family-expense-tracker-api

    echo ""
    echo "Setting secrets..."
    echo "Please enter your MongoDB connection string:"
    read -s MONGO_URL
    fly secrets set MONGO_URL="$MONGO_URL"
    fly secrets set DB_NAME="family_finance"
    fly secrets set SECRET_KEY="$(openssl rand -hex 32)"
    fly secrets set CORS_ALLOW_ORIGINS="*"

    echo ""
    echo "Deploying..."
    fly deploy

    echo ""
    echo "Deployment complete!"
    fly status
}

# Main menu
echo "Choose a deployment platform:"
echo "1) Railway (recommended - easy setup)"
echo "2) Render"
echo "3) Fly.io"
echo "4) Exit"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        deploy_railway
        ;;
    2)
        deploy_render
        ;;
    3)
        deploy_fly
        ;;
    4)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "========================================"
echo "NEXT STEPS:"
echo "========================================"
echo "1. Note your API URL from above"
echo "2. Update your Expo app with the API URL:"
echo "   eas secret:create --name EXPO_PUBLIC_BACKEND_URL --value 'YOUR_API_URL'"
echo "3. Rebuild your app with:"
echo "   eas build --platform android --profile production"
echo "========================================"
