# Screenshot Naming Guide
## Family Expense Tracker - Play Store Screenshots

**Use this guide to create, name, and upload screenshots in the correct order for Google Play Store.**

---

## Quick Reference

**Minimum Required:** 4 screenshots
**Recommended:** 6-8 screenshots
**Maximum Allowed:** 8 screenshots per device type

**Recommended Dimensions:** 1080x1920 pixels (portrait, 9:16 ratio)
**File Format:** PNG or JPEG
**File Size:** Less than 8MB each

---

## Screenshot File Naming Convention

Use this exact naming format for easy organization:

```
[NUMBER]-[SCREEN-NAME].png
```

### Example:
- `01-dashboard.png`
- `02-add-expense.png`
- `03-analytics-categories.png`

---

## Required Screenshots (Upload in This Order)

### 1️⃣ Home Dashboard
**Filename:** `01-dashboard.png`

**What to show:**
- Main dashboard view showing today's expenses
- Month total and comparison
- Recent expense list (3-5 expenses visible)
- Navigation visible at bottom
- Group name showing at top

**Suggested caption:** "Track all family expenses at a glance"

**Why this first:** Shows the app's main interface and value proposition immediately.

---

### 2️⃣ Add Expense Screen
**Filename:** `02-add-expense.png`

**What to show:**
- Add expense form partially filled out
- Amount field with a realistic value
- Category selection visible (show icon and name)
- "Paid by" and "Split between" options visible
- Currency selector showing
- Submit button at bottom

**Suggested caption:** "Add expenses in seconds with smart categories"

**Why this second:** Demonstrates core functionality - how easy it is to add an expense.

---

### 3️⃣ Analytics - Category View
**Filename:** `03-analytics-categories.png`

**What to show:**
- Category tab selected in analytics
- Pie chart with colorful category breakdown
- At least 4-5 categories visible with amounts
- Currency filter showing at top
- Clean data visualization

**Suggested caption:** "Visualize spending with powerful analytics"

**Why this third:** Shows the app's analytical capabilities and visual appeal.

---

### 4️⃣ Analytics - Trends View
**Filename:** `04-analytics-trends.png`

**What to show:**
- Trends tab selected
- Line or bar chart showing 3-6 months of data
- Clear upward or downward trend visible
- Monthly totals visible
- Professional chart appearance

**Suggested caption:** "Track spending trends over time"

**Why this fourth:** Reinforces analytics capabilities with time-based insights.

---

## Optional but Highly Recommended Screenshots

### 5️⃣ Balances/Settlements Screen
**Filename:** `05-balances.png`

**What to show:**
- Balance summary showing who owes whom
- At least 2-3 balance entries
- Settlement button visible
- Clear indication of positive/negative balances
- Group member names visible

**Suggested caption:** "Know exactly who owes what"

**Why include:** Showcases unique value proposition of automatic balance calculations.

---

### 6️⃣ Groups Management
**Filename:** `06-groups.png`

**What to show:**
- List of family groups
- Personal group and 1-2 shared groups visible
- Group invite code visible or highlighted
- Member count for each group
- "Create Group" button visible

**Suggested caption:** "Create and manage multiple family groups"

**Why include:** Shows collaborative features and multi-group support.

---

### 7️⃣ Expense List/History
**Filename:** `07-expenses-list.png`

**What to show:**
- Full list of expenses (8-10 visible)
- Various categories shown with icons
- Different amounts and dates
- Search or filter option visible
- Pull-to-refresh indicator optional

**Suggested caption:** "Full expense history at your fingertips"

**Why include:** Shows comprehensive tracking and easy browsing.

---

### 8️⃣ Security/Settings
**Filename:** `08-security.png`

**What to show:**
- Security settings screen
- PIN lock toggle visible and enabled
- Biometric lock option visible
- Auto-lock timeout setting shown
- Professional security icon or illustration

**Suggested caption:** "Bank-level security for your data"

**Why include:** Addresses security concerns and builds trust.

---

## Technical Requirements

### Dimensions & Aspect Ratios

**Phone Screenshots (Required):**
- Recommended: 1080x1920 pixels (9:16 portrait)
- Minimum: 320 pixels for shortest side
- Maximum: 3840 pixels for longest side
- Aspect ratio: Between 16:9 and 9:16

**7-inch Tablet Screenshots (Optional):**
- Recommended: 1200x1920 pixels
- Same aspect ratio rules apply

**10-inch Tablet Screenshots (Optional):**
- Recommended: 1600x2560 pixels
- Same aspect ratio rules apply

### File Specifications

- **Format:** PNG (recommended) or JPEG
- **Color space:** RGB (not CMYK)
- **Max file size:** 8MB per image
- **Compression:** Optimize for web without losing quality
- **Alpha channel:** Supported in PNG

---

## Screenshot Capture Methods

### Method 1: Real Android Device (Recommended)
1. Install development build on Android device
2. Navigate to each screen
3. Use device screenshot (usually Power + Volume Down)
4. Transfer screenshots to computer
5. Rename using naming convention above
6. Optional: Remove status bar using image editor

**Pros:** Real device, authentic appearance
**Cons:** Status bar may show personal info

---

### Method 2: Android Emulator
1. Open Android Studio
2. Start AVD (Android Virtual Device)
3. Set resolution to 1080x1920 or similar
4. Install and run your app
5. Use emulator screenshot feature (camera icon)
6. Screenshots save to desktop

**Pros:** Clean status bar, easy to repeat
**Cons:** May look less authentic

---

### Method 3: Expo Go (Development)
1. Run app with `npx expo start`
2. Open on physical device via Expo Go
3. Navigate to screens and screenshot
4. Transfer and rename files

**Pros:** Quick for development testing
**Cons:** Shows Expo Go interface elements

---

### Method 4: Production Build Testing
1. Build preview APK: `eas build --platform android --profile preview`
2. Install APK on device
3. Screenshot each screen
4. Most authentic representation

**Pros:** Exactly as users will see it
**Cons:** Requires build time

---

## Screenshot Best Practices

### DO:
✅ Use realistic data (not "Test User" or "123")
✅ Show variety (different categories, amounts, currencies)
✅ Use clean, professional appearance
✅ Show app in light or dark mode (preferably dark for this app)
✅ Include enough content to look active (5+ expenses visible)
✅ Make sure all text is readable
✅ Show app features clearly
✅ Use consistent device/emulator for all screenshots

### DON'T:
❌ Include personal information (real names, emails, phone numbers)
❌ Show offensive or inappropriate content
❌ Use competitor names or logos
❌ Include watermarks or borders
❌ Show error messages or bugs
❌ Use placeholder text like "Lorem ipsum"
❌ Make claims you can't back up
❌ Show notifications or system UI elements that distract

---

## Sample Data Guidelines

When capturing screenshots, use these sample data guidelines:

### Family Names:
- "Smith Family"
- "Weekend Trip Group"
- "Roommates 2025"
- "Johnson Household"

### User Names:
- "John Doe"
- "Jane Smith"
- "Alex Johnson"
- "Sarah Williams"

### Expense Descriptions:
- "Grocery shopping at Whole Foods"
- "Monthly electricity bill"
- "Family dinner at Italian restaurant"
- "Uber ride to airport"
- "Netflix subscription"
- "Kids school supplies"

### Amounts:
- Use realistic amounts: $45.50, ₹1,250, C$75.00
- Vary the amounts (don't use round numbers only)
- Mix small and large expenses

---

## Image Optimization

Before uploading, optimize your screenshots:

### Using ImageOptim (Mac) or TinyPNG (Web):
1. Drag screenshots to tool
2. Reduce file size by 40-70%
3. No visible quality loss
4. Faster uploads to Play Console

### Using Online Tools:
- **TinyPNG:** https://tinypng.com (free, up to 20 images)
- **Compressor.io:** https://compressor.io
- **Squoosh:** https://squoosh.app (by Google)

### Command Line (if you prefer):
```bash
# Install ImageMagick
brew install imagemagick  # Mac
sudo apt install imagemagick  # Linux

# Optimize PNG
convert 01-dashboard.png -strip -quality 85 01-dashboard-optimized.png

# Resize if needed
convert 01-dashboard.png -resize 1080x1920 01-dashboard-resized.png
```

---

## Upload Order in Play Console

When uploading to Play Console, the order matters:

1. **First screenshot is the hero image** - appears in search results
2. **First 2-3 screenshots** - visible without scrolling on most devices
3. **Remaining screenshots** - users must scroll to see

### Recommended Upload Sequence:

**Priority 1 (Must be first 3):**
1. 01-dashboard.png (Shows main value)
2. 02-add-expense.png (Shows core action)
3. 03-analytics-categories.png (Shows key feature)

**Priority 2 (Next 2-3):**
4. 04-analytics-trends.png (Additional analytics)
5. 05-balances.png (Unique feature)
6. 06-groups.png (Collaboration feature)

**Priority 3 (Optional last 2):**
7. 07-expenses-list.png (Browsing capability)
8. 08-security.png (Trust builder)

---

## Screenshot Checklist

Before uploading, verify each screenshot:

### Technical Check:
- [ ] Correct dimensions (1080x1920 or similar)
- [ ] File size under 8MB
- [ ] PNG or JPEG format
- [ ] Named correctly with number prefix
- [ ] Optimized for web

### Content Check:
- [ ] No personal information visible
- [ ] Realistic, professional data shown
- [ ] App features clearly visible
- [ ] Text is readable and clear
- [ ] No errors or bugs visible
- [ ] Consistent theme (dark mode) across all
- [ ] Status bar clean (or removed)
- [ ] Navigation elements visible

### Quality Check:
- [ ] Sharp and clear (not blurry)
- [ ] Good contrast and colors
- [ ] Proper alignment
- [ ] No compression artifacts
- [ ] Looks professional

---

## Troubleshooting

### "Screenshot dimensions are invalid"
**Solution:** Use exact 1080x1920 or resize to meet aspect ratio requirements (16:9 to 9:16)

### "File too large"
**Solution:** Compress using TinyPNG or ImageOptim to get under 8MB

### "Screenshot appears blurry in preview"
**Solution:** Use higher resolution source (at least 1080px on shortest side)

### "Cannot upload screenshot"
**Solution:** Check file format (PNG/JPEG only), clear browser cache, try different browser

### "Screenshot order is wrong"
**Solution:** In Play Console, drag and drop screenshots to reorder them

---

## Alternative: Using Screenshot Frames

For a more polished look, you can add device frames around screenshots:

### Tools for Adding Frames:
- **Figma:** Free, professional results
- **Canva:** Easy to use, has phone mockup templates
- **Mockuphone:** https://mockuphone.com (free online tool)
- **Screenshot.rocks:** https://screenshot.rocks (nice design)

### Frame Specifications:
- Use phone frame for all screenshots (consistency)
- Ensure final dimensions still meet Play Store requirements
- Add subtle shadow for depth (optional)
- Keep frame minimal - focus on app content

---

## Screenshot Captions (Optional but Recommended)

While Google Play doesn't support caption text directly on screenshots, you can:

1. **Add text overlay** to screenshots themselves
2. **Use the promotional text** field to describe key features
3. **Include in description** referencing "as shown in screenshots"

### If Adding Text to Screenshots:

**Guidelines:**
- Use large, readable font (minimum 24pt)
- High contrast with background
- Place at top or bottom (not covering important UI)
- Keep it short (5-7 words max)
- Match your brand colors

**Example Text Overlays:**
- "Track Every Expense Effortlessly"
- "Split Bills Automatically"
- "Beautiful Visual Analytics"
- "Secure with Biometric Lock"

---

## Final Checklist Before Upload

- [ ] All screenshots captured
- [ ] Files named using convention (01-, 02-, etc.)
- [ ] Dimensions verified (1080x1920 recommended)
- [ ] Files optimized for size
- [ ] No personal data visible
- [ ] Realistic sample data used
- [ ] All screenshots reviewed for quality
- [ ] Screenshots organized in upload order
- [ ] Backup copies saved
- [ ] Ready to upload to Play Console

---

## Quick Commands for Batch Processing

### Rename Multiple Files at Once (Mac/Linux):
```bash
cd /path/to/screenshots
rename 's/IMG_//' *.png  # Remove IMG_ prefix
rename 's/(.*)\.png/$1/' *.png  # Remove extension for editing
# Then manually add numbers and re-add .png
```

### Batch Resize (ImageMagick):
```bash
for file in *.png; do
  convert "$file" -resize 1080x1920 "resized-$file"
done
```

### Batch Optimize (macOS with ImageOptim CLI):
```bash
imageoptim *.png
```

---

## Resources

- **Play Store Screenshot Requirements:** https://support.google.com/googleplay/android-developer/answer/9866151
- **Google Play Asset Guidelines:** https://developer.android.com/distribute/marketing-tools/device-art-generator
- **Screenshot Examples:** https://play.google.com/store/apps/category/FINANCE (browse top apps)

---

**Last Updated:** December 29, 2025
**App Version:** 1.0.0
**Document Version:** 1.0

**Good luck with your screenshots!** 📸
