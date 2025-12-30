# Play Store Submission Checklist
## Family Expense Tracker - Complete Step-by-Step Guide

**Use this checklist to submit your app to Google Play Store. Follow steps in order and check them off as you complete them.**

---

## Pre-Submission Preparation

### 1. Prerequisites (Complete BEFORE starting Play Console)

#### ☐ Google Play Developer Account Setup (Est. time: 15 minutes)
- [ ] Go to https://play.google.com/console/signup
- [ ] Sign in with your Google account
- [ ] Pay one-time $25 registration fee
- [ ] Accept Developer Distribution Agreement
- [ ] Wait for account approval (usually instant, can take up to 48 hours)

**Screenshot Locations:**
- Click "Sign Up" in top right
- Fill in developer account details
- Enter payment information
- Accept agreement and submit

---

#### ☐ Prepare App Assets (Est. time: 2-4 hours)

**REQUIRED FILES - Create these BEFORE starting submission:**

1. **App Icon** (512x512px, 32-bit PNG with alpha)
   - [ ] Current icon is 512x513 - MUST be resized to EXACTLY 512x512px
   - [ ] Use image editor to crop/resize to 512x512px
   - [ ] Save as PNG with transparency
   - [ ] File location: `/home/user/Family-expense-tracker/frontend/assets/images/icon.png`

2. **Feature Graphic** (1024x500px, JPG or PNG)
   - [ ] Create promotional banner image
   - [ ] Include app name and key visual
   - [ ] No borders or padding required
   - [ ] Save as `feature-graphic.png` or `.jpg`

3. **Screenshots** (Minimum 4, Recommended 6-8)
   - [ ] Capture on device with 16:9 or 9:16 ratio
   - [ ] Recommended: 1080x1920px (portrait)
   - [ ] See `SCREENSHOT_NAMING.md` for exact requirements
   - [ ] Save with numbered filenames (01-dashboard.png, etc.)

**Tools you can use:**
- Android Device: Use device screenshots
- Emulator: Android Studio emulator
- Design Tool: Figma, Canva, Adobe Express

---

#### ☐ Build Production App Bundle (Est. time: 15-30 minutes)
- [ ] Ensure you're on the correct git branch
- [ ] Navigate to frontend directory: `cd /home/user/Family-expense-tracker/frontend`
- [ ] Run production build: `eas build --platform android --profile production`
- [ ] Wait for build to complete on EAS servers
- [ ] Download the .aab file when ready
- [ ] Note the build ID and version for reference

**Important:** The .aab file must be signed. EAS handles this automatically if configured.

---

#### ☐ Verify Support Infrastructure (Est. time: 5 minutes)
- [ ] Confirm privacy policy is live: https://businessagents.github.io/Family-expense-tracker/privacy-policy
- [ ] Test that support email exists: support@familyexpensetracker.app
- [ ] Verify website is accessible: https://businessagents.github.io/Family-expense-tracker/
- [ ] Have all URLs bookmarked for easy copy-paste

---

## Play Console Submission Process

### 2. Create Your App (Est. time: 5 minutes)

#### ☐ Initial App Setup
- [ ] Log in to https://play.google.com/console
- [ ] Click "Create app" button (top right)
- [ ] Fill in the following:
  - **App name:** Family Expense Tracker
  - **Default language:** English (United States)
  - **App or game:** App
  - **Free or paid:** Free
- [ ] Declare if app is for kids: **No**
- [ ] Accept declarations checkboxes:
  - [x] I acknowledge that the app complies with Google Play policies
  - [x] I certify that I am authorized to represent this app
- [ ] Click "Create app"

**Navigation:** Play Console > All apps > Create app

---

### 3. Set Up App Store Listing (Est. time: 15 minutes)

#### ☐ Main Store Listing
- [ ] In left sidebar, go to "Grow" > "Store presence" > "Main store listing"

#### ☐ App Details Section
Fill in these fields (copy from `COPY_PASTE_CONTENT.txt`):

- [ ] **App name:** Family Expense Tracker
  - (Must match exactly, max 50 characters)

- [ ] **Short description:** (80 characters max)
  - Copy from COPY_PASTE_CONTENT.txt

- [ ] **Full description:** (4000 characters max)
  - Copy entire formatted description from COPY_PASTE_CONTENT.txt
  - Paste as-is, formatting will be preserved

#### ☐ Graphics Assets
Upload in this order:

1. [ ] **App icon** (512x512px PNG)
   - Click "Upload" under "App icon"
   - Select your fixed 512x512px icon
   - Wait for validation (should show green checkmark)

2. [ ] **Feature graphic** (1024x500px PNG/JPG)
   - Click "Upload" under "Feature graphic"
   - Select your feature graphic
   - Wait for validation

3. [ ] **Phone screenshots** (Minimum 4 required)
   - Click "Add" under "Phone screenshots"
   - Upload screenshots in order (see SCREENSHOT_NAMING.md)
   - Drag to reorder if needed
   - First screenshot is most important (shows in search)

**Optional but recommended:**
- [ ] 7-inch tablet screenshots (if you have tablet designs)
- [ ] 10-inch tablet screenshots (if you have tablet designs)
- [ ] Promo video (YouTube URL)

#### ☐ Categorization
- [ ] **App category:** Finance
- [ ] **Tags:** (Select 5 relevant tags)
  - Budget & Finance
  - Expense Tracking
  - Personal Finance
  - Money Management
  - Family Tools

#### ☐ Contact Details
- [ ] **Email:** support@familyexpensetracker.app
- [ ] **Phone:** (Optional - leave blank if you don't want to provide)
- [ ] **Website:** https://businessagents.github.io/Family-expense-tracker/
- [ ] **Privacy policy URL:** https://businessagents.github.io/Family-expense-tracker/privacy-policy

- [ ] Click "Save" at bottom of page

**Navigation:** Dashboard > Grow > Store presence > Main store listing

---

### 4. Set Up Store Settings (Est. time: 10 minutes)

#### ☐ App Category and Contact Details
- [ ] Navigate to "Grow" > "Store presence" > "Store settings"

- [ ] **App category:** Finance
- [ ] **Store listing contact details:**
  - Email: support@familyexpensetracker.app
  - Phone: (Optional)
  - Website: https://businessagents.github.io/Family-expense-tracker/

- [ ] **External marketing:** (Optional - check if you want users to opt-in to marketing)

- [ ] Click "Save"

**Navigation:** Dashboard > Grow > Store presence > Store settings

---

### 5. Complete Data Safety Section (Est. time: 10 minutes)

#### ☐ Data Safety Form
- [ ] Navigate to "Policy" > "App content" > "Data safety"
- [ ] Click "Start" or "Edit" to begin form

#### ☐ Section 1: Data Collection and Security
- [ ] **Does your app collect or share user data?** Yes
- [ ] Click "Next"

#### ☐ Section 2: Data Types Collected

**Personal Info - Name:**
- [ ] Collected: Yes
- [ ] Shared: Yes
- [ ] Shared with: Other users (group members)
- [ ] Optional: No
- [ ] Ephemeral: No
- [ ] Purpose: App functionality

**Personal Info - Email:**
- [ ] Collected: Yes
- [ ] Shared: No
- [ ] Optional: No
- [ ] Ephemeral: No
- [ ] Purpose: Account management

**Financial Info - Purchase history or other financial info:**
- [ ] Collected: Yes
- [ ] Shared: Yes
- [ ] Shared with: Other users (group members)
- [ ] Optional: No
- [ ] Ephemeral: No
- [ ] Purpose: App functionality

**App activity - App interactions:**
- [ ] Collected: Yes
- [ ] Shared: No
- [ ] Optional: Yes
- [ ] Ephemeral: No
- [ ] Purpose: Analytics

- [ ] Click "Next"

#### ☐ Section 3: Data Security
- [ ] **Is all user data encrypted in transit?** Yes
- [ ] **Do you provide a way for users to request their data be deleted?** Yes
- [ ] Click "Next"

#### ☐ Section 4: Review
- [ ] Review all entries for accuracy
- [ ] Click "Submit"

**Navigation:** Dashboard > Policy > App content > Data safety

---

### 6. Complete Content Rating (Est. time: 15 minutes)

#### ☐ Content Rating Questionnaire
- [ ] Navigate to "Policy" > "App content" > "Content rating"
- [ ] Click "Start questionnaire"

#### ☐ Basic Information
- [ ] **Email address:** support@familyexpensetracker.app
- [ ] **App category:** Utility, Productivity, Communication, or Other

#### ☐ Questionnaire (Select answers carefully)

**Violence:**
- [ ] Does your app contain depictions of realistic violence? **No**
- [ ] Does your app contain depictions of unrealistic or cartoon violence? **No**

**Sexuality:**
- [ ] Does your app contain sexual content? **No**

**Language:**
- [ ] Does your app contain profanity? **No**

**Controlled Substances:**
- [ ] Does your app reference or depict drugs, alcohol, or tobacco? **No**

**Gambling:**
- [ ] Does your app simulate gambling? **No**

**User Interactions:**
- [ ] Do users interact with each other in your app? **No**
  - (Expenses are shared but users don't chat/message)
- [ ] Can users share their personal information? **Yes**
  - (Name and expenses are shared with group members)
- [ ] Does your app include location sharing? **No**

**Data Collection:**
- [ ] Does your app collect personal information? **Yes**
  - Types: Name, Email

- [ ] Click "Next" to see rating preview
- [ ] Expected rating: **Everyone** (all regions)
- [ ] Click "Submit"

**Navigation:** Dashboard > Policy > App content > Content rating

---

### 7. Complete Target Audience and Content (Est. time: 10 minutes)

#### ☐ Target Audience
- [ ] Navigate to "Policy" > "App content" > "Target audience and content"
- [ ] Click "Start"

- [ ] **Target age groups:** Select appropriate ages
  - Recommended: 18 and over (financial app)
  - Or: 13 and over if suitable for teens

- [ ] **Is your app appealing to children?** No
- [ ] Click "Save"

#### ☐ News Apps (if asked)
- [ ] Is this a news app? **No**

**Navigation:** Dashboard > Policy > App content > Target audience and content

---

### 8. Select App Category and Provide Details (Est. time: 5 minutes)

#### ☐ App Category
- [ ] Navigate to "Grow" > "Store presence" > "Store settings"
- [ ] **Category:** Finance
- [ ] **Tags:** Select up to 5 tags
  - Suggested: Budget, Expense Tracking, Personal Finance, Money Management, Family
- [ ] Click "Save"

**Navigation:** Dashboard > Grow > Store presence > Store settings

---

### 9. Set Up Pricing and Distribution (Est. time: 10 minutes)

#### ☐ Countries and Regions
- [ ] Navigate to "Grow" > "Store presence" > "Countries/regions"
- [ ] Choose distribution strategy:
  - **Option 1:** Select "Add countries/regions" and choose specific countries
  - **Option 2:** Select "Available in all countries" (recommended)
- [ ] Click "Save"

#### ☐ Pricing
- [ ] Navigate to "Monetize" > "Monetization setup" > "Pricing"
- [ ] **Pricing:** Free
- [ ] **Contains ads:** No
- [ ] **Contains in-app purchases:** No
- [ ] Click "Save"

**Navigation:** Dashboard > Monetize > Monetization setup

---

### 10. Upload App Bundle (Est. time: 10 minutes)

#### ☐ Create Production Release
- [ ] Navigate to "Release" > "Production" > "Create new release"
- [ ] If prompted about app signing, select:
  - **Recommended:** Let Google manage and protect your app signing key
  - This is easier and more secure

#### ☐ Upload App Bundle
- [ ] Click "Upload" button
- [ ] Select your .aab file (downloaded from EAS)
- [ ] Wait for upload and processing (may take 5-10 minutes)
- [ ] Verify version name shows: 1.0.0
- [ ] Verify version code shows: 1

#### ☐ Release Details
- [ ] **Release name:** 1.0.0 (Initial Release)
- [ ] **Release notes:**
  - Copy "What's New" content from COPY_PASTE_CONTENT.txt
  - Paste into the release notes field
  - You can add translations later if needed

- [ ] Click "Next"

#### ☐ Review and Rollout
- [ ] Review all information
- [ ] Click "Start rollout to Production"
- [ ] Confirm rollout

**Important:** Your app will now enter review. This typically takes 1-3 days but can take up to 7 days.

**Navigation:** Dashboard > Release > Production > Create new release

---

### 11. Complete App Access (Est. time: 5 minutes)

#### ☐ Declare App Access
- [ ] Navigate to "Policy" > "App content" > "App access"
- [ ] Click "Start"

- [ ] **Does your app have any restricted features?** No
  - (All features are accessible without special credentials)

  **OR if you need to provide test credentials:**
  - [ ] **Does your app have any restricted features?** Yes
  - [ ] Provide instructions for testing:
    ```
    Test Account:
    Email: test@example.com
    Password: TestPass123

    Instructions:
    1. Install the app
    2. Log in with the provided credentials
    3. You'll have access to a pre-populated test family group
    ```

- [ ] Click "Save"

**Navigation:** Dashboard > Policy > App content > App access

---

### 12. Complete Ads Declaration (Est. time: 2 minutes)

#### ☐ Ads Declaration
- [ ] Navigate to "Policy" > "App content" > "Ads"
- [ ] Click "Start"
- [ ] **Does your app contain ads?** No
- [ ] Click "Save"

**Navigation:** Dashboard > Policy > App content > Ads

---

### 13. Government Apps Declaration (Est. time: 2 minutes)

#### ☐ Government Apps
- [ ] Navigate to "Policy" > "App content" > "Government apps"
- [ ] **Is this a government app?** No
- [ ] Click "Save"

**Navigation:** Dashboard > Policy > App content > Government apps

---

### 14. Final Review and Submit (Est. time: 10 minutes)

#### ☐ Pre-Submission Checklist
Verify all sections show green checkmarks in the dashboard:

**Policy:**
- [ ] ✓ Privacy policy
- [ ] ✓ App access
- [ ] ✓ Ads
- [ ] ✓ Content rating
- [ ] ✓ Target audience
- [ ] ✓ Data safety
- [ ] ✓ Government apps

**Store Presence:**
- [ ] ✓ Main store listing
- [ ] ✓ Store settings
- [ ] ✓ Countries/regions

**Release:**
- [ ] ✓ Production release created
- [ ] ✓ App bundle uploaded

#### ☐ Submit for Review
- [ ] Review dashboard for any warnings or errors
- [ ] All sections should show "Completed" or green checkmarks
- [ ] Navigate to "Release" > "Production"
- [ ] Click "Send for review" (if not already sent)
- [ ] Confirm submission

---

## Post-Submission Tasks

### 15. After Submission (Est. time: Ongoing)

#### ☐ Immediate Actions (Day 1)
- [ ] Save your app's Play Store URL for reference
- [ ] Set up email filters for Play Console notifications
- [ ] Monitor your support email for any issues
- [ ] Announce submission to your team/stakeholders

#### ☐ During Review Period (1-7 days)
- [ ] Check Play Console daily for status updates
- [ ] Check email for any review team questions
- [ ] Be ready to respond to review feedback within 24 hours
- [ ] Don't make any changes to the app during review

#### ☐ If Rejected
- [ ] Read rejection reason carefully
- [ ] Fix the specific issues mentioned
- [ ] Update app bundle if needed
- [ ] Resubmit through Production release section
- [ ] Respond to reviewer comments if provided

#### ☐ When Approved
- [ ] Verify app is live on Play Store
- [ ] Test downloading and installing from Play Store
- [ ] Share Play Store link on social media
- [ ] Update your website with Play Store badge
- [ ] Monitor reviews and respond promptly
- [ ] Set up alerts for crashes and ANRs

#### ☐ First Week After Launch
- [ ] Respond to all user reviews (aim for within 24 hours)
- [ ] Monitor crash reports in Play Console
- [ ] Check analytics for download and usage stats
- [ ] Gather user feedback for future updates
- [ ] Plan next version based on feedback

---

## Troubleshooting Common Issues

### App Bundle Upload Fails
**Issue:** Upload fails or shows errors
**Solutions:**
- [ ] Verify .aab file is not corrupted (re-download from EAS)
- [ ] Check version code is higher than any previous uploads
- [ ] Ensure app is signed properly (EAS handles this)
- [ ] Clear browser cache and try again

### App Icon Rejected
**Issue:** "Icon dimensions are incorrect"
**Solutions:**
- [ ] Use image editor to resize to EXACTLY 512x512px
- [ ] Ensure it's a 32-bit PNG with alpha channel
- [ ] No transparency in all four corners
- [ ] File size should be under 1MB

### Privacy Policy Not Accessible
**Issue:** "Privacy policy URL is not reachable"
**Solutions:**
- [ ] Test URL in incognito browser window
- [ ] Ensure GitHub Pages is published
- [ ] Check for HTTPS (required)
- [ ] Verify no authentication required to access

### Content Rating Issues
**Issue:** Unexpected rating (e.g., Mature 17+ instead of Everyone)
**Solutions:**
- [ ] Review questionnaire answers carefully
- [ ] Resubmit questionnaire with correct answers
- [ ] Contact support if rating seems incorrect

### Data Safety Confusion
**Issue:** Unsure how to answer data safety questions
**Solutions:**
- [ ] Refer to your app's actual data practices
- [ ] Use the answers provided in COPY_PASTE_CONTENT.txt
- [ ] When in doubt, be transparent and disclose collection
- [ ] Review Google's data safety examples

---

## Important Notes

### Timeline Expectations
- **Account setup:** Instant to 48 hours
- **Asset preparation:** 2-4 hours
- **Form completion:** 1-2 hours
- **First review:** 1-3 days (up to 7 days)
- **Subsequent reviews:** Usually faster (1-2 days)

### Do's and Don'ts

**DO:**
- Use exact copy from COPY_PASTE_CONTENT.txt
- Test all URLs before submitting
- Respond quickly to reviewer questions
- Keep support email monitored
- Update store listing based on user feedback

**DON'T:**
- Change package name after creation
- Use copyrighted images without permission
- Make false claims in description
- Upload debug builds to production
- Ignore user reviews or crash reports

### Getting Help
- **Play Console Help:** https://support.google.com/googleplay/android-developer
- **Policy Questions:** https://support.google.com/googleplay/android-developer/topic/9858052
- **Developer Community:** https://www.reddit.com/r/androiddev
- **EAS Build Issues:** https://docs.expo.dev/build/introduction/

---

## Quick Reference Links

- **Play Console:** https://play.google.com/console
- **App Privacy Policy:** https://businessagents.github.io/Family-expense-tracker/privacy-policy
- **App Website:** https://businessagents.github.io/Family-expense-tracker/
- **Support Email:** support@familyexpensetracker.app
- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **Play Store Policies:** https://play.google.com/about/developer-content-policy/

---

## Completion Summary

**Total Estimated Time:** 4-6 hours (excluding review time)

**Breakdown:**
- Pre-submission preparation: 2-4 hours
- Console form completion: 1-2 hours
- Final review and submission: 30 minutes

**Documents Needed:**
- ☐ COPY_PASTE_CONTENT.txt (for all text fields)
- ☐ SCREENSHOT_NAMING.md (for asset preparation)
- ☐ App icon (512x512px)
- ☐ Feature graphic (1024x500px)
- ☐ 4-8 screenshots (1080x1920px recommended)
- ☐ Production .aab file

---

**Last Updated:** December 29, 2025
**App Version:** 1.0.0
**Document Version:** 1.0

**Good luck with your submission!** 🚀
