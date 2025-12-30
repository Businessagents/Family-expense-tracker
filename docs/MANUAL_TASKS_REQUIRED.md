# Manual Tasks Required
## What YOU Must Do - Cannot Be Automated

**This document lists all tasks that MUST be completed manually by you. These cannot be automated and require your direct action.**

---

## Critical Pre-Submission Tasks

### 1. Fix App Icon Dimensions ⚠️ BLOCKING ISSUE

**Current Status:** Icon is 512x513px (INVALID)
**Required:** Exactly 512x512px
**Priority:** CRITICAL - App will be rejected without this

**Steps to fix:**
```
1. Locate file: /home/user/Family-expense-tracker/frontend/assets/images/icon.png
2. Open in image editor (Photoshop, GIMP, Preview, or online tool)
3. Resize/crop to EXACTLY 512x512 pixels
4. Ensure it's 32-bit PNG with alpha channel
5. Save and verify dimensions
6. Replace the existing icon.png file
```

**Tools you can use:**
- **Mac Preview:** Open > Tools > Adjust Size > 512x512
- **GIMP (Free):** Image > Scale Image > 512x512
- **Online:** https://www.iloveimg.com/resize-image (set to 512x512)
- **Photoshop:** Image > Image Size > 512x512

**Why manual:** Image editing requires human judgment to ensure quality and proper cropping.

---

### 2. Create Feature Graphic

**Required:** 1024x500px promotional banner
**Format:** PNG or JPG
**Priority:** HIGH - Required for Play Store listing

**What it should include:**
- App name: "Family Expense Tracker"
- Key visual (app icon, screenshots, or design element)
- Optional tagline: "Manage Family Finances Together"
- Your brand colors (dark blue: #0B1F2A)

**Steps:**
```
1. Use design tool (Canva, Figma, Adobe Express, Photoshop)
2. Create canvas sized 1024x500px
3. Add app icon or screenshot montage
4. Add app name in readable font
5. Add brief tagline or key features
6. Export as PNG or JPG
7. Save as: feature-graphic.png
```

**Free tools:**
- **Canva:** https://www.canva.com (has templates for app graphics)
- **Figma:** https://www.figma.com (professional, free tier)
- **Adobe Express:** https://www.adobe.com/express (free with templates)
- **GIMP:** Free desktop app for Mac/Windows/Linux

**Why manual:** Creative design requires human aesthetic judgment and branding decisions.

---

### 3. Capture App Screenshots

**Required:** Minimum 4, recommended 6-8 screenshots
**Dimensions:** 1080x1920px (portrait) recommended
**Priority:** HIGH - Required for Play Store listing

**What you need to capture:**
```
Required (minimum 4):
1. Home dashboard with expenses
2. Add expense screen (partially filled)
3. Analytics with charts (category view)
4. Analytics trends over time

Recommended additional:
5. Balances/settlements screen
6. Groups management screen
7. Expense list/history
8. Security settings screen
```

**Steps:**
```
1. Build and install app on Android device or emulator
2. Add realistic sample data (expenses, groups, members)
3. Navigate to each screen listed above
4. Take screenshot (Power + Volume Down on most devices)
5. Transfer to computer
6. Rename using format: 01-dashboard.png, 02-add-expense.png, etc.
7. Optimize file sizes if needed (use TinyPNG.com)
```

**Detailed guide:** See SCREENSHOT_NAMING.md

**Why manual:** Requires running the app, navigating UI, and making aesthetic decisions about what to show.

---

### 4. Set Up Google Play Developer Account

**Required:** One-time setup
**Cost:** $25 USD (one-time fee)
**Time:** 15 minutes + approval wait (usually instant, up to 48 hours)
**Priority:** CRITICAL - Cannot submit without this

**Steps:**
```
1. Go to https://play.google.com/console/signup
2. Sign in with your Google account (personal or business)
3. Fill in developer account information
   - Developer name (individual or organization)
   - Contact information
   - Payment details for the $25 fee
4. Accept Developer Distribution Agreement
5. Pay $25 registration fee
6. Wait for account approval (check email)
7. Once approved, access Play Console
```

**What you need:**
- Google account
- Credit/debit card for $25 payment
- Developer name (can be your name or business name)
- Contact email (can use support@familyexpensetracker.app)

**Why manual:** Google requires identity verification and payment from actual person/business.

---

### 5. Build Production App Bundle

**Required:** .aab file for Play Store
**Priority:** HIGH - Required for submission
**Time:** 15-30 minutes (mostly waiting for build)

**Steps:**
```
1. Ensure you're on correct branch: claude/play-store-release-prep-eW6nS
2. Navigate to frontend directory:
   cd /home/user/Family-expense-tracker/frontend
3. Run production build command:
   eas build --platform android --profile production
4. Wait for build to complete on EAS servers
5. When complete, download the .aab file
6. Save build ID for reference
7. Keep .aab file for upload to Play Console
```

**Prerequisites:**
- EAS account set up (already done)
- Expo project configured (already done)
- Internet connection for cloud build

**Why manual:** Build process requires command execution and file management decisions.

---

## Play Console Submission Tasks

### 6. Complete Play Console Forms

**Required:** All Play Console sections must be filled
**Priority:** CRITICAL - Required for submission
**Time:** 1-2 hours for first submission

**What you'll do:**
```
1. Log in to Play Console
2. Create new app
3. Fill out these sections:
   - Main store listing (text, graphics)
   - Store settings (category, contact info)
   - Data safety form
   - Content rating questionnaire
   - Target audience
   - App access
   - Ads declaration
   - Pricing & distribution
   - Upload app bundle
```

**All content ready in:** COPY_PASTE_CONTENT.txt
**Step-by-step guide:** PLAY_STORE_SUBMISSION_CHECKLIST.md

**Why manual:** Google Play Console requires human interaction, account verification, and legal confirmations.

---

### 7. Upload All Assets to Play Console

**Required:** Manual file uploads through web interface
**Priority:** HIGH
**Time:** 10-15 minutes

**What you'll upload:**
```
1. App icon (512x512px) - after you fix it
2. Feature graphic (1024x500px) - after you create it
3. Screenshots (4-8 files) - after you capture them
4. App bundle (.aab file) - after you build it
```

**Where to upload:**
- Play Console > Your App > Main Store Listing > Graphics
- Play Console > Your App > Production > Upload

**Why manual:** File uploads require browser interaction and Play Console doesn't have an API for initial submission.

---

### 8. Answer Content Rating Questionnaire

**Required:** Interactive questionnaire in Play Console
**Priority:** CRITICAL - App cannot be published without rating
**Time:** 15 minutes

**What it involves:**
```
1. Navigate to Policy > App content > Content rating
2. Start questionnaire
3. Answer 20-30 questions about app content
4. Submit for rating
5. Receive rating certificate (usually "Everyone")
```

**All answers ready in:** COPY_PASTE_CONTENT.txt (Section 7)

**Why manual:** Requires clicking through interactive form and agreeing to rating board terms.

---

### 9. Complete Data Safety Form

**Required:** Interactive form in Play Console
**Priority:** CRITICAL - Required since May 2022
**Time:** 10-15 minutes

**What it involves:**
```
1. Navigate to Policy > App content > Data safety
2. Declare what data you collect
3. Explain how data is used
4. Describe security practices
5. Submit form
```

**All answers ready in:** COPY_PASTE_CONTENT.txt (Section 6)

**Why manual:** Requires clicking through multi-step form and legal confirmations.

---

### 10. Review and Submit App for Publication

**Required:** Final review and submission
**Priority:** CRITICAL - Last step before going live
**Time:** 10-15 minutes

**What you'll do:**
```
1. Review all Play Console sections (should all be green checkmarks)
2. Navigate to Release > Production
3. Review release summary
4. Click "Send for review"
5. Confirm submission
6. Wait for Google's review (1-7 days)
```

**Why manual:** Legal responsibility confirmation and final approval requires human decision.

---

## Post-Submission Manual Tasks

### 11. Respond to Review Feedback (if any)

**Required:** Only if app is rejected or Google requests changes
**Priority:** CRITICAL if it happens
**Time:** Varies based on issue

**What you might need to do:**
```
1. Read rejection reason carefully
2. Fix issues identified by Google
3. Update app bundle if needed
4. Resubmit with explanation
5. Respond to reviewer questions
```

**Why manual:** Requires understanding context and making judgment calls.

---

### 12. Monitor App After Launch

**Required:** Ongoing after approval
**Priority:** HIGH - Ensures app quality
**Time:** 15-30 minutes daily initially

**What you'll do:**
```
1. Check Play Console daily for:
   - User reviews (respond within 24 hours)
   - Crash reports
   - ANR (App Not Responding) reports
   - Download statistics
2. Monitor support email
3. Respond to user feedback
4. Plan updates based on user needs
```

**Why manual:** Requires human judgment for customer support and product decisions.

---

### 13. Set Up Support Email

**Required:** support@familyexpensetracker.app must be active
**Priority:** HIGH - Google will verify this
**Time:** 30 minutes

**What you need to do:**
```
1. Ensure email address exists and is accessible
2. Set up email forwarding to your personal email (if needed)
3. Create email signature for professional replies
4. Optional: Set up auto-reply (template in COPY_PASTE_CONTENT.txt)
5. Test by sending email to yourself
6. Monitor regularly for user inquiries
```

**Why manual:** Email setup and customer service requires human setup and monitoring.

---

## Tasks That Are Partially Automated

### 14. Test App Before Submission

**Partially automated:** Some testing can be automated, but you must manually verify
**Priority:** CRITICAL
**Time:** 1-2 hours

**What you must test manually:**
```
1. Install production build on real device
2. Create account and log in
3. Test all major features:
   - Create group
   - Add expenses
   - View analytics
   - Settle balances
   - Export CSV
   - Security (PIN, biometric)
4. Test on different Android versions if possible
5. Test network offline/online scenarios
6. Verify no crashes or major bugs
```

**Why manual:** Human testing catches UX issues that automated tests miss.

---

## Optional But Recommended Manual Tasks

### 15. Create Promotional Video (Optional)

**Time:** 2-4 hours
**Impact:** Can increase conversion by 20-30%

**What to create:**
```
- 30-60 second video showing app in action
- Upload to YouTube
- Add YouTube URL to Play Store listing
```

**Why manual:** Video creation requires creativity and editing skills.

---

### 16. Localize to Other Languages (Optional)

**Time:** 2-4 hours per language
**Impact:** Increases downloads in non-English markets

**What to translate:**
```
- App name (if culturally appropriate)
- Short description
- Full description
- Screenshots (with translated UI)
- Release notes
```

**Why manual:** Translation requires language expertise or paid service.

---

### 17. Set Up Play Console User Accounts (Optional)

**Time:** 15 minutes
**Impact:** Allows team members to help manage app

**What to do:**
```
1. Go to Users and Permissions in Play Console
2. Add team members with appropriate roles
3. Set permissions (view only, release management, etc.)
```

**Why manual:** Requires trust decisions about access levels.

---

## Summary Checklist

**Before You Can Submit, You MUST Complete:**

### Critical Path (Must Do):
- [ ] Fix app icon to 512x512px
- [ ] Create feature graphic (1024x500px)
- [ ] Capture 4-8 screenshots
- [ ] Set up Google Play Developer account ($25)
- [ ] Build production .aab file
- [ ] Fill out all Play Console forms
- [ ] Upload all assets
- [ ] Answer content rating questionnaire
- [ ] Complete data safety form
- [ ] Submit app for review

### Important But Can Do Later:
- [ ] Set up professional email auto-replies
- [ ] Create promotional video
- [ ] Add localized listings
- [ ] Set up user accounts for team

### Ongoing After Launch:
- [ ] Monitor and respond to reviews
- [ ] Check crash reports
- [ ] Answer support emails
- [ ] Plan updates based on feedback

---

## Estimated Time Investment

**First-time submission:**
- Asset preparation: 2-4 hours
- Form completion: 1-2 hours
- Testing and QA: 1-2 hours
- **Total: 4-8 hours**

**Review wait time:** 1-7 days (usually 1-3 days)

**Updates/resubmissions:**
- Typically faster: 2-3 hours
- Review time: Usually 1-2 days

---

## What Is Automated/Documented

**These are NOT manual - already done for you:**
- ✅ All text content written (COPY_PASTE_CONTENT.txt)
- ✅ Step-by-step instructions (PLAY_STORE_SUBMISSION_CHECKLIST.md)
- ✅ Screenshot guidelines (SCREENSHOT_NAMING.md)
- ✅ App configuration (app.json)
- ✅ Privacy policy published
- ✅ Build configuration (eas.json)
- ✅ Package name set
- ✅ Version numbers set

**You just need to:**
- Execute the manual tasks listed above
- Copy/paste the provided content
- Follow the step-by-step guides

---

## Getting Help

**If you get stuck on manual tasks:**

1. **App Icon Resizing:** Search "resize image to 512x512" or use iloveimg.com
2. **Feature Graphic:** Use Canva.com templates for "app store banner"
3. **Screenshots:** Follow SCREENSHOT_NAMING.md guide
4. **Play Console:** Google has help at support.google.com/googleplay/android-developer
5. **Build Issues:** Check EAS docs at docs.expo.dev/build
6. **General Questions:** Reddit r/androiddev community is helpful

---

**Remember:** All the hard work (content writing, documentation, configuration) is done. You just need to execute these manual steps, which are clearly documented!

**Last Updated:** December 29, 2025
**Document Version:** 1.0
