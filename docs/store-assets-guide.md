# Google Play Store Assets Guide
## Family Expense Tracker - Visual Asset Requirements

This document provides comprehensive requirements and guidelines for creating all visual assets needed for the Google Play Store listing.

---

## Table of Contents
1. [App Icon](#app-icon)
2. [Feature Graphic](#feature-graphic)
3. [Screenshots](#screenshots)
4. [Promotional Video](#promotional-video)
5. [Brand Guidelines](#brand-guidelines)
6. [Asset Creation Tools](#asset-creation-tools)

---

## App Icon

### Requirements
- **Size:** 512 x 512 pixels
- **Format:** 32-bit PNG with alpha channel
- **Max File Size:** 1024 KB
- **Current Location:** `/frontend/assets/images/icon.png`
- **Adaptive Icon:** `/frontend/assets/images/adaptive-icon.png`

### Design Guidelines
- **Background:** #0B1F2A (deep teal/navy from app theme)
- **Primary Element:** Dollar/Rupee symbol or family icon
- **Style:** Flat design, modern, minimal
- **Visibility:** Must be recognizable at small sizes (48x48dp)
- **No Text:** Avoid putting app name in icon
- **Safe Zone:** Keep important elements 64px from edges

### Current Icon Status
✅ App icon exists at `/frontend/assets/images/icon.png`
✅ Adaptive icon exists at `/frontend/assets/images/adaptive-icon.png`

**Action Required:**
- Verify icon is 512x512 resolution
- Ensure it follows Material Design guidelines
- Test visibility at various sizes

---

## Feature Graphic

### Requirements
- **Size:** 1024 x 500 pixels (exact)
- **Format:** 24-bit PNG or JPEG (no alpha)
- **Max File Size:** 1024 KB
- **Aspect Ratio:** 2.048:1 (fixed, no variation allowed)

### Design Specifications

#### Layout Structure
```
┌─────────────────────────────────────────────────────────┐
│  [App Icon]  Family Expense Tracker                     │
│              Manage Family Finances Together             │
│                                                          │
│  [UI Preview Screenshots]  [Analytics Chart Preview]    │
└─────────────────────────────────────────────────────────┘
```

#### Required Elements
1. **App Name:** "Family Expense Tracker"
   - Font: Bold, sans-serif (e.g., SF Pro Display Bold, Roboto Bold)
   - Size: 48-60pt
   - Color: #F8FAFC (white/off-white)

2. **Tagline:** "Manage Family Finances Together"
   - Font: Regular, sans-serif
   - Size: 24-32pt
   - Color: #94A3B8 (light gray)

3. **Background**
   - Primary: #0B1F2A (app's dark theme)
   - Gradient: Optional subtle gradient to #1E293B
   - Pattern: Optional subtle geometric pattern

4. **Visual Elements**
   - App icon (128x128 positioned on left)
   - 2-3 mockup screenshots showing key features
   - OR sample UI elements (expense cards, charts)
   - Accent color: #22D3EE (cyan/teal)

#### Design Tips
- Keep text readable at thumbnail size
- Use high contrast between text and background
- Avoid cluttered design
- Show actual app interface for authenticity
- No misleading imagery
- Comply with Google Play policies

#### Safe Zones
- **Top/Bottom:** 64px margin
- **Left/Right:** 96px margin
- **Critical content:** Keep within center 832x372px

### Suggested Mockup Content
- Dashboard with expense summary
- Analytics chart (category pie chart or trends)
- Family group interface
- Settlement/balance screen

---

## Screenshots

### Overview
- **Minimum Required:** 2 screenshots
- **Recommended:** 4-8 screenshots
- **Optimal:** 6-8 screenshots showcasing all major features

### Phone Screenshots

#### Dimensions
- **Minimum:** 320 pixels
- **Maximum:** 3840 pixels
- **Recommended:** 1080 x 1920 pixels (9:16 ratio)
- **Aspect Ratio:** Between 16:9 and 9:16

#### Format
- **Type:** 24-bit PNG or JPEG
- **Max File Size:** 8 MB per image
- **Orientation:** Portrait (vertical)

### Required Screenshots & Content

#### Screenshot 1: Home Dashboard
**Filename:** `01_home_dashboard.png`
**Screen:** Home screen (`/app/(main)/home.tsx`)

**What to Capture:**
- User greeting at top
- Group selector showing a family group
- Currency selector (showing multiple currencies)
- Summary cards (Today, This Month, Last Month, Total)
- Recent expenses list (3-5 items)
- Bottom navigation bar

**Caption Ideas:**
- "Track all family expenses at a glance"
- "Your financial dashboard in one view"
- "Monitor spending across multiple currencies"

**Setup Notes:**
- Use realistic sample data (not 0s)
- Show Today: ₹2,450, This Month: ₹45,890
- Display 4-5 recent expenses with different categories
- Select a family group named something relatable ("Home" or "Family")

---

#### Screenshot 2: Add Expense
**Filename:** `02_add_expense.png`
**Screen:** Add expense screen (`/app/(main)/add.tsx`)

**What to Capture:**
- Amount input field with currency
- Category selector (showing all 10 categories with icons)
- Group selection
- Split options
- Description field
- Date picker
- "Add Expense" button

**Caption Ideas:**
- "Add expenses in seconds with smart categories"
- "Quick expense entry with beautiful categories"
- "Categorize spending with one tap"

**Setup Notes:**
- Show amount like ₹1,250
- Have category grid expanded showing all icons
- Sample description: "Weekly groceries"

---

#### Screenshot 3: Analytics - Category View
**Filename:** `03_analytics_categories.png`
**Screen:** Analytics screen - Category tab (`/app/(main)/analytics.tsx`)

**What to Capture:**
- Currency selector at top
- Tab selector showing "Category" active
- Pie chart showing category breakdown
- List below showing:
  - Groceries: ₹12,450 (28 expenses)
  - Utilities: ₹8,900 (12 expenses)
  - Food & Dining: ₹6,780 (19 expenses)
  - Transport: ₹4,230 (15 expenses)

**Caption Ideas:**
- "Visualize spending with powerful analytics"
- "See where your money goes with beautiful charts"
- "Category breakdown with detailed insights"

**Setup Notes:**
- Use colorful pie chart with 5-6 segments
- Ensure colors match app's category colors
- Show meaningful percentages

---

#### Screenshot 4: Analytics - Trends View
**Filename:** `04_analytics_trends.png`
**Screen:** Analytics screen - Trends tab

**What to Capture:**
- Tab selector showing "Trends" active
- Monthly bar chart (6 months)
- List showing monthly totals
- Clear upward/downward trends

**Caption Ideas:**
- "Track spending trends over time"
- "Monthly insights to understand patterns"
- "6-month spending history at your fingertips"

**Setup Notes:**
- Show realistic trend (not all increasing or flat)
- Label months clearly (Jan, Feb, Mar...)
- Include month totals in list below

---

#### Screenshot 5: Balances & Settlements
**Filename:** `05_balances.png`
**Screen:** Balances screen (`/app/(main)/balances.tsx`)

**What to Capture:**
- Summary cards showing:
  - You Owe: ₹3,450
  - You're Owed: ₹1,200
- "You Owe" section with 2-3 people
- "You're Owed" section with 1-2 people
- "Settle" and "Remind" buttons visible
- Member avatars with colors

**Caption Ideas:**
- "Know exactly who owes what"
- "Automatic balance calculations"
- "Settle up with one tap"

**Setup Notes:**
- Use realistic names (avoid test/fake looking names)
- Show different amounts owed to different people
- Display colorful avatars

---

#### Screenshot 6: Groups Management
**Filename:** `06_groups.png`
**Screen:** Groups screen (`/app/(main)/groups.tsx`)

**What to Capture:**
- Personal group card
- 2-3 family/shared group cards
- Group details showing:
  - Group name with color dot
  - Member count
  - Total expenses
  - Invite code visible on one expanded group
- "Create New Group" button

**Caption Ideas:**
- "Create and manage multiple family groups"
- "Share expenses with different groups"
- "Easy invite codes for joining groups"

**Setup Notes:**
- Show variety: Personal, Family, Roommates, Travel group
- Display member avatars on cards
- Show realistic member counts (3-5 members)

---

#### Screenshot 7: Expense List with Filters
**Filename:** `07_expenses_list.png`
**Screen:** Expenses screen (`/app/(main)/expenses.tsx`)

**What to Capture:**
- Search bar at top
- Filter chips (Category, Date, Group, Member)
- Expense list showing:
  - Category icons with colors
  - Expense descriptions
  - Amount and date
  - Paid by indicator
  - Group name
- Mix of different categories and amounts

**Caption Ideas:**
- "Full expense history at your fingertips"
- "Search and filter expenses easily"
- "Complete transaction history"

**Setup Notes:**
- Show 8-10 expenses
- Use diverse categories
- Include recent and older dates
- Show filter chips as active/inactive

---

#### Screenshot 8: Security/Profile
**Filename:** `08_security.png`
**Screen:** Profile/Settings screen (`/app/(main)/profile.tsx`)

**What to Capture:**
- User profile section
- Security settings:
  - Biometric unlock toggle (ON)
  - Auto-lock timer setting
  - Change PIN option
- Export option
- App version
- Logout button

**Caption Ideas:**
- "Bank-level security for your data"
- "Biometric unlock for quick access"
- "Your data, your control"

**Setup Notes:**
- Show biometric toggle as enabled
- Display realistic user name and email
- Include security icons (fingerprint, lock)

---

### Screenshot Best Practices

#### Device Frames
- **Option 1:** No device frame (full bleed screenshot)
- **Option 2:** Include device frame (mockup)
  - Use mockup tools like Mockuphone, Figma, or Canva
  - Choose modern Android device (Pixel, Samsung Galaxy)

#### Data Preparation
- Create realistic test data before capturing
- Use consistent date ranges
- Show meaningful amounts (not all round numbers)
- Use relatable names and descriptions
- Ensure all text is readable

#### Quality Standards
- High resolution (1080x1920 recommended)
- No pixelation or artifacts
- Proper contrast and lighting
- Consistent status bar appearance
- Hide sensitive test information

#### Capture Process
1. Set up test environment with sample data
2. Clear notifications before capturing
3. Set time to 9:41 (Apple standard) or similar
4. Ensure battery is >80% for clean status bar
5. Use Android's built-in screenshot or emulator screenshot
6. Review for clarity before finalizing

---

## Tablet Screenshots (Optional but Recommended)

### 7-inch Tablet
- **Size:** 1200 x 1920 pixels
- **Minimum:** 1 screenshot
- **Recommended:** 2-4 screenshots

### 10-inch Tablet
- **Size:** 1600 x 2560 pixels
- **Minimum:** 1 screenshot
- **Recommended:** 2-4 screenshots

**Note:** Family Expense Tracker UI scales well to tablets but is optimized for phones. Tablet screenshots are optional unless you want to highlight tablet support.

---

## Promotional Video (Optional)

### Specifications
- **Length:** 30 seconds to 2 minutes (ideal: 45-60 seconds)
- **Aspect Ratio:** 16:9 (1920x1080) or 9:16 (1080x1920)
- **Platform:** YouTube (unlisted or public)
- **Format:** MP4, AVI, or MOV

### Video Structure (60-second version)

**0:00-0:05** - Hook
- "Tired of splitting bills on spreadsheets?"
- Show messy spreadsheet → Family Expense Tracker logo

**0:05-0:20** - Problem
- Quick clips showing common pain points:
  - Forgotten expenses
  - Calculation errors
  - Awkward money conversations

**0:20-0:50** - Solution (Features)
- Quick screen recordings showing:
  - Adding an expense (5s)
  - Beautiful analytics (5s)
  - Group management (5s)
  - Balance settlements (5s)
  - Biometric unlock (3s)
  - Export to CSV (3s)

**0:50-0:60** - Call to Action
- "Download Family Expense Tracker"
- "Free. No Ads. Forever."
- App icon + "Available on Google Play" badge

### Production Tips
- Use screen recordings from actual app
- Add subtle background music (royalty-free)
- Include captions/text overlays
- Keep animations quick and smooth
- Show real features, no mockups
- Maintain 9:16 ratio for vertical video

### Tools for Creation
- **Screen Recording:** Android Studio emulator recording, AZ Screen Recorder
- **Video Editing:** CapCut, Adobe Premiere Rush, DaVinci Resolve
- **Music:** YouTube Audio Library, Epidemic Sound
- **Hosting:** YouTube (link in Play Store listing)

---

## Brand Guidelines

### Color Palette

#### Primary Colors
```
Dark Background:  #0B1F2A  (rgb(11, 31, 42))
Card Background:  #1E293B  (rgb(30, 41, 59))
Primary Accent:   #22D3EE  (rgb(34, 211, 238)) - Cyan
```

#### Text Colors
```
Primary Text:     #F8FAFC  (rgb(248, 250, 252)) - White
Secondary Text:   #94A3B8  (rgb(148, 163, 184)) - Light Gray
Tertiary Text:    #64748B  (rgb(100, 116, 139)) - Medium Gray
```

#### Category Colors (for reference)
```
Groceries:        #4CAF50  (Green)
Utilities:        #FF9800  (Orange)
Rent:             #9C27B0  (Purple)
Transport:        #2196F3  (Blue)
Entertainment:    #E91E63  (Pink)
Healthcare:       #F44336  (Red)
Food & Dining:    #FF5722  (Deep Orange)
Shopping:         #673AB7  (Deep Purple)
Education:        #00BCD4  (Cyan)
Others:           #9E9E9E  (Gray)
```

#### Currency Colors
```
INR:              #22D3EE  (Cyan)
USD:              #3B82F6  (Blue)
CAD:              #F59E0B  (Amber)
SAR:              #8B5CF6  (Purple)
```

### Typography
- **Primary Font:** System default (Roboto on Android, SF Pro on iOS)
- **Headings:** Bold (600-700 weight)
- **Body:** Regular (400 weight)
- **Sizes:**
  - Large Title: 24-28pt
  - Title: 20-24pt
  - Headline: 16-18pt
  - Body: 14-16pt
  - Caption: 12-14pt

### Logo Usage
- App icon should always be visible at recommended sizes
- Don't alter colors or proportions
- Maintain clear space around icon
- Use on appropriate backgrounds for contrast

---

## Asset Creation Tools

### Design Tools

#### Professional (Paid)
1. **Adobe Photoshop** - Full image editing
   - Best for: Feature graphic, icon refinement
   - Skill level: Intermediate to Advanced

2. **Adobe Illustrator** - Vector graphics
   - Best for: Icon design, scalable graphics
   - Skill level: Intermediate to Advanced

3. **Figma** - Collaborative design
   - Best for: UI mockups, asset creation
   - Skill level: Beginner to Advanced
   - Free tier available

4. **Sketch** - Mac-only design tool
   - Best for: UI/UX design, mockups
   - Skill level: Intermediate

#### Free Alternatives
1. **Canva** - Easy template-based design
   - Best for: Feature graphic, promotional materials
   - Skill level: Beginner
   - Templates: Search "Google Play Feature Graphic"

2. **GIMP** - Free Photoshop alternative
   - Best for: Image editing, icon creation
   - Skill level: Intermediate

3. **Inkscape** - Free vector editor
   - Best for: Icon design, scalable graphics
   - Skill level: Intermediate

4. **Figma (Free)** - Free tier with limitations
   - Best for: All design needs
   - Skill level: Beginner to Advanced

### Mockup Tools

1. **Mockuphone.com** - Free device mockups
   - Upload screenshot → Get framed mockup
   - Multiple device options

2. **Smartmockups.com** - Premium mockup generator
   - More realistic device frames
   - Free trial available

3. **Previewed.app** - High-quality mockups
   - Professional looking frames
   - Paid service

4. **Figma Plugins**
   - Mockup plugins available
   - Free with Figma account

### Screenshot Capture

1. **Android Emulator (Android Studio)**
   - Built-in screenshot tool
   - Adjustable resolution
   - Multiple device profiles

2. **Physical Device**
   - Power + Volume Down (most Android devices)
   - Screenshots saved to Gallery

3. **ADB (Android Debug Bridge)**
   ```bash
   adb exec-out screencap -p > screenshot.png
   ```

4. **Browser DevTools** (for testing)
   - Chrome DevTools device mode
   - Not recommended for final screenshots

### Video Recording

1. **Android Studio Emulator**
   - Built-in screen recording
   - High quality output

2. **AZ Screen Recorder** (Android app)
   - Free, no watermark
   - Internal audio recording

3. **Scrcpy** (Desktop tool)
   - Mirror Android screen to PC
   - Record with OBS or similar

4. **OBS Studio** (Desktop)
   - Free, professional recording
   - Works with screen mirroring

---

## File Organization

### Recommended Folder Structure
```
/assets/
├── play-store/
│   ├── app-icon/
│   │   ├── icon-512.png
│   │   ├── adaptive-icon-512.png
│   │   └── icon-source.psd (source file)
│   │
│   ├── feature-graphic/
│   │   ├── feature-graphic-1024x500.png
│   │   └── feature-graphic-source.psd
│   │
│   ├── screenshots/
│   │   ├── phone/
│   │   │   ├── 01_home_dashboard.png
│   │   │   ├── 02_add_expense.png
│   │   │   ├── 03_analytics_categories.png
│   │   │   ├── 04_analytics_trends.png
│   │   │   ├── 05_balances.png
│   │   │   ├── 06_groups.png
│   │   │   ├── 07_expenses_list.png
│   │   │   └── 08_security.png
│   │   │
│   │   └── with-frames/ (optional)
│   │       └── [same files with device frames]
│   │
│   └── promotional-video/
│       ├── family-expense-tracker-promo.mp4
│       └── youtube-link.txt
```

### Naming Conventions
- Use lowercase
- Separate words with hyphens
- Include dimensions in filename
- Number screenshots in display order
- Keep names descriptive but concise

---

## Quality Checklist

### Before Uploading
- [ ] All images are exact required dimensions
- [ ] File sizes are within limits
- [ ] No copyrighted content used
- [ ] Text is readable at thumbnail size
- [ ] Colors match brand guidelines
- [ ] Screenshots show actual app features
- [ ] No placeholder or "lorem ipsum" text
- [ ] Status bars look clean (good time, battery, signal)
- [ ] App name spelling is consistent
- [ ] All images are high resolution (no pixelation)

### Testing
- [ ] View feature graphic at thumbnail size (200x100px)
- [ ] View screenshots on mobile device
- [ ] Check contrast ratios for text
- [ ] Verify all screenshots are portrait orientation
- [ ] Ensure consistent visual style across all assets
- [ ] Get feedback from team/testers
- [ ] Compare with competitor apps

---

## Common Mistakes to Avoid

### Feature Graphic
- ❌ Text too small to read
- ❌ Too cluttered with information
- ❌ Wrong dimensions (must be exactly 1024x500)
- ❌ Using JPEG with transparency (use PNG)
- ❌ Misleading imagery

### Screenshots
- ❌ Using emulator screenshots with "Android" watermark
- ❌ Showing error states or bugs
- ❌ Empty screens with no data
- ❌ Inconsistent data across screenshots
- ❌ Personal information visible
- ❌ Test/dummy data that looks fake
- ❌ Wrong orientation (landscape for phone screenshots)
- ❌ Blurry or low-resolution images

### General
- ❌ Using Google Play badge incorrectly
- ❌ Showing competitor logos
- ❌ Inconsistent branding
- ❌ Outdated screenshots after app updates
- ❌ Missing required assets

---

## Timeline Estimate

### Asset Creation Schedule
| Task | Time Estimate | Priority |
|------|---------------|----------|
| Review existing app icon | 30 min | High |
| Create feature graphic | 2-3 hours | High |
| Set up test data in app | 1-2 hours | High |
| Capture phone screenshots (8) | 1-2 hours | High |
| Edit and optimize screenshots | 2-3 hours | High |
| Create device mockups | 1-2 hours | Medium |
| Create promotional video | 4-6 hours | Low |
| Review and revisions | 1-2 hours | High |
| **Total** | **12-21 hours** | - |

**Note:** Timeline assumes basic design skills. Add 50% more time if learning tools.

---

## Resources & References

### Google Play Requirements
- [App Icon Specifications](https://developer.android.com/google-play/resources/icon-design-specifications)
- [Feature Graphic Guidelines](https://support.google.com/googleplay/android-developer/answer/9866151)
- [Screenshot Requirements](https://support.google.com/googleplay/android-developer/answer/9866151)

### Design Inspiration
- Browse top Finance apps on Play Store
- Study Splitwise, Money Manager, Wallet by BudgetBakers
- Visit Dribbble and Behance for "expense tracker" designs

### Free Resources
- [Unsplash](https://unsplash.com) - Free stock photos
- [Flaticon](https://flaticon.com) - Free icons
- [Google Fonts](https://fonts.google.com) - Free fonts
- [Coolors](https://coolors.co) - Color palette generator

---

## Next Steps

1. **Immediate (Required for Launch)**
   - ✅ Review existing app icon quality
   - ⬜ Create feature graphic (1024x500)
   - ⬜ Set up realistic test data in app
   - ⬜ Capture 6-8 phone screenshots
   - ⬜ Optimize all images

2. **Short-term (First Update)**
   - ⬜ Create tablet screenshots
   - ⬜ Produce promotional video
   - ⬜ Create device mockup versions

3. **Ongoing**
   - ⬜ Update screenshots with each major release
   - ⬜ A/B test different feature graphics
   - ⬜ Gather user screenshots for social proof

---

## Support & Questions

For questions about asset creation or Google Play requirements:
- Review [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- Consult [Material Design Guidelines](https://material.io/design)
- Contact: support@familyexpensetracker.app

---

*Last Updated: December 29, 2025*
*Document Version: 1.0*
*Status: Ready for Asset Creation*
