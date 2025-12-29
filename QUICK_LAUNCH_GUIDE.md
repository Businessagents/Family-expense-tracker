# Quick Launch Guide - Complete These Steps Now

Everything is prepared! Complete these steps to launch on Play Store today.

---

## Step 1: Login to Expo (2 minutes)

Open a terminal and run:

```bash
cd /home/user/Family-expense-tracker/frontend

# Login to Expo (you'll be prompted for credentials)
eas login

# After login, initialize your project
eas init
```

**Don't have an Expo account?**
- Go to https://expo.dev/signup
- Create account, verify email
- Then run the commands above

---

## Step 2: Deploy Backend (10 minutes)

### Option A: Railway (Recommended - Fastest)

1. Go to https://railway.app and sign up with GitHub
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `Businessagents/Family-expense-tracker`
4. Set root directory to `backend`
5. Add these environment variables:
   ```
   MONGO_URL=mongodb+srv://<your-connection-string>
   DB_NAME=family_finance
   SECRET_KEY=<generate-random-string>
   CORS_ALLOW_ORIGINS=*
   ```
6. Click Deploy

**Need MongoDB?** Get free database at https://mongodb.com/atlas

### Option B: Use the Script
```bash
cd /home/user/Family-expense-tracker/backend
../scripts/deploy-backend.sh
```

---

## Step 3: Build Android App (15 minutes)

```bash
cd /home/user/Family-expense-tracker/frontend

# Build for Play Store
eas build --platform android --profile production
```

Wait for build to complete (~10-15 minutes). You'll get a download link.

---

## Step 4: Create Google Play Developer Account

1. Go to https://play.google.com/console
2. Pay $25 one-time fee
3. Complete identity verification
4. Create new app:
   - Name: Family Expense Tracker
   - Category: Finance
   - Free

---

## Step 5: Upload to Play Store

### Manual Upload (Faster for first time):
1. Download the .aab file from Expo dashboard
2. In Play Console → Release → Production
3. Create new release
4. Upload the .aab file
5. Add release notes (see docs/PLAY_STORE_LISTING.md)

### Or use EAS Submit:
```bash
# First, add your Play Store service account key
# Save it as frontend/play-store-key.json

eas submit --platform android --latest
```

---

## Step 6: Complete Store Listing

In Play Console, complete:

- [ ] App icon (512x512) - use `frontend/assets/images/icon.png`
- [ ] Feature graphic (1024x500)
- [ ] Screenshots (minimum 2)
- [ ] Short description (80 chars)
- [ ] Full description (see docs/PLAY_STORE_LISTING.md)
- [ ] Privacy policy URL: `https://businessagents.github.io/Family-expense-tracker/privacy-policy.html`
- [ ] Content rating questionnaire
- [ ] Data safety form

---

## Step 7: Enable GitHub Pages for Privacy Policy

1. Go to your repo settings on GitHub
2. Navigate to Pages
3. Set source to: `main` branch, `/docs` folder
4. Save

Your privacy policy will be live at:
`https://businessagents.github.io/Family-expense-tracker/privacy-policy.html`

---

## Step 8: Submit for Review

1. In Play Console, go to "Publishing overview"
2. Review all checklist items
3. Click "Start rollout to Production"
4. Wait 3-7 days for initial review

---

## Quick Commands Reference

```bash
# Navigate to frontend
cd /home/user/Family-expense-tracker/frontend

# Login to Expo
eas login

# Initialize EAS project
eas init

# Build preview APK (for testing)
eas build --platform android --profile preview

# Build production AAB (for Play Store)
eas build --platform android --profile production

# Submit to Play Store
eas submit --platform android --latest

# Check build status
eas build:list
```

---

## Troubleshooting

**"projectId not found"**
→ Run `eas init` after logging in

**Build fails**
→ Check that app.json has valid projectId and owner

**Submit fails**
→ Ensure play-store-key.json exists and has correct permissions

---

## Files Created for You

| File | Purpose |
|------|---------|
| `PLAY_STORE_LAUNCH_PLAN.md` | Detailed launch plan |
| `docs/privacy-policy.html` | Hostable privacy policy |
| `docs/PLAY_STORE_LISTING.md` | Store listing content |
| `scripts/deploy-backend.sh` | Backend deployment helper |
| `scripts/build-and-submit.sh` | Build automation |
| `.github/workflows/eas-build.yml` | CI/CD automation |
| `backend/Procfile` | Railway/Heroku deployment |
| `backend/render.yaml` | Render.com deployment |

---

## Need Help?

- Expo docs: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
- Play Console: https://support.google.com/googleplay/android-developer

**Good luck with your launch!**
