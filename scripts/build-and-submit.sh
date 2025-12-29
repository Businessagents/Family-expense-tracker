#!/bin/bash

# Family Expense Tracker - Build and Submit Script
# This script builds and submits the app to Play Store

set -e

echo "========================================"
echo "Family Expense Tracker Build & Submit"
echo "========================================"
echo ""

# Navigate to frontend directory
cd "$(dirname "$0")/../frontend"

# Check if logged in to Expo
echo "Checking Expo login status..."
if ! npx expo whoami 2>/dev/null; then
    echo "Not logged in to Expo. Please login:"
    npx expo login
fi

# Check if EAS is configured
if grep -q "your-project-id" app.json; then
    echo ""
    echo "EAS not configured. Running eas init..."
    eas init
fi

echo ""
echo "Choose an action:"
echo "1) Build Preview APK (for testing)"
echo "2) Build Production AAB (for Play Store)"
echo "3) Submit to Play Store"
echo "4) Build and Submit (Production)"
echo "5) Check build status"
echo "6) Exit"
echo ""
read -p "Enter choice [1-6]: " choice

case $choice in
    1)
        echo "Building Preview APK..."
        eas build --platform android --profile preview
        ;;
    2)
        echo "Building Production AAB..."
        eas build --platform android --profile production
        ;;
    3)
        echo "Submitting to Play Store..."
        if [ ! -f "play-store-key.json" ]; then
            echo "Warning: play-store-key.json not found"
            echo "Please add your Google Play service account key."
            exit 1
        fi
        eas submit --platform android --latest
        ;;
    4)
        echo "Building and Submitting to Play Store..."
        if [ ! -f "play-store-key.json" ]; then
            echo "Warning: play-store-key.json not found"
            echo "Building only (you'll need to submit manually)..."
            eas build --platform android --profile production
        else
            eas build --platform android --profile production --auto-submit
        fi
        ;;
    5)
        echo "Checking build status..."
        eas build:list --limit 5
        ;;
    6)
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
echo "Done!"
echo "========================================"
