# iOS Publishing Guide — Expo + React Native

A complete step-by-step reference for publishing any Expo/React Native app to the Apple App Store using EAS Build.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Apple Developer Account](#2-apple-developer-account)
3. [App Configuration](#3-app-configuration)
4. [EAS Build Setup](#4-eas-build-setup)
5. [Code Signing and Provisioning](#5-code-signing-and-provisioning)
6. [Build the IPA](#6-build-the-ipa)
7. [App Store Connect Setup](#7-app-store-connect-setup)
8. [Store Listing Assets](#8-store-listing-assets)
9. [App Information](#9-app-information)
10. [App Review Information](#10-app-review-information)
11. [Submit for Review](#11-submit-for-review)
12. [Post-Launch](#12-post-launch)
13. [Releasing Updates](#13-releasing-updates)
14. [TestFlight](#14-testflight)
15. [Troubleshooting](#15-troubleshooting)

---

## 1. Prerequisites

- [ ] Node.js 18+ installed
- [ ] Expo CLI installed (`npm install -g expo-cli`)
- [ ] EAS CLI installed (`npm install -g eas-cli`)
- [ ] Expo account created (https://expo.dev/signup)
- [ ] Logged in to EAS (`eas login`)
- [ ] Git repository initialized with clean working tree
- [ ] App runs without errors locally (`npx expo start`)
- [ ] macOS NOT required (EAS builds in the cloud)

---

## 2. Apple Developer Account

- [ ] Enroll at https://developer.apple.com/programs/enroll/
- [ ] Pay annual $99 fee (required every year)
- [ ] Wait for enrollment approval (up to 48 hours)
- [ ] Accept the latest Apple Developer Program License Agreement
- [ ] Note your Team ID (Account → Membership → Team ID)
- [ ] Enable two-factor authentication on your Apple ID

**Account Types:**

| Type | Cost | Use Case |
|------|------|----------|
| Individual | $99/year | Solo developers |
| Organization | $99/year | Companies (requires D-U-N-S number) |

**Important:** Organization accounts require a D-U-N-S number which can take 2+ weeks to obtain. Plan ahead.

---

## 3. App Configuration

### app.json / app.config.js

```json
{
  "expo": {
    "name": "Your App Display Name",
    "slug": "your-app-slug",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "scheme": "yourappscheme",
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.yourapp",
      "buildNumber": "1",
      "infoPlist": {
        "NSCameraUsageDescription": "...",
        "NSPhotoLibraryUsageDescription": "..."
      }
    },
    "plugins": [...]
  }
}
```

**Checklist:**

- [ ] `name` — Display name on device (max 30 characters for App Store)
- [ ] `slug` — Unique Expo identifier (lowercase, hyphens)
- [ ] `version` — Marketing version shown to users (e.g., "1.0.0")
- [ ] `scheme` — Deep link scheme (lowercase, no special chars)
- [ ] `ios.bundleIdentifier` — Unique identifier in reverse domain format
  - Must be unique across all App Store apps
  - Cannot be changed after first submission
  - Convention: `com.yourcompany.yourapp`
- [ ] `ios.buildNumber` — String, must increment with every upload to same version
- [ ] `ios.supportsTablet` — Set `true` if your app works on iPad
- [ ] `ios.infoPlist` — Usage descriptions for ALL permissions used
- [ ] `icon` — 1024x1024 PNG, no transparency, no alpha channel, no rounded corners

### Versioning Rules

| Field | Type | Rule |
|-------|------|------|
| `version` | string | Marketing version (user-facing): "1.0.0" |
| `buildNumber` | string | Must increment for each upload to same version |

**Example progression:**
- 1.0.0 (build 1) → 1.0.0 (build 2) → 1.0.1 (build 1) → 1.1.0 (build 1)

### Required Permission Descriptions (Info.plist)

If your app uses any of these, you MUST provide a description:

| Key | When Required |
|-----|---------------|
| `NSCameraUsageDescription` | Camera access |
| `NSPhotoLibraryUsageDescription` | Photo library read |
| `NSPhotoLibraryAddUsageDescription` | Save to photos |
| `NSLocationWhenInUseUsageDescription` | Location while app is open |
| `NSLocationAlwaysUsageDescription` | Background location |
| `NSMicrophoneUsageDescription` | Microphone/audio recording |
| `NSContactsUsageDescription` | Contacts access |
| `NSCalendarsUsageDescription` | Calendar access |
| `NSFaceIDUsageDescription` | Face ID authentication |

**Apple will reject your app** if a permission is requested without a clear, user-facing description of why.

---

## 4. EAS Build Setup

### Initialize EAS

```bash
eas init
```

### Configure eas.json

```json
{
  "cli": {
    "version": ">= 12.0.0",
    "appVersionSource": "local"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true,
        "buildArtifactName": "your-app-dev-v${appVersion}.tar.gz"
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "buildArtifactName": "your-app-v${appVersion}.ipa"
      }
    },
    "production": {
      "autoIncrement": true,
      "ios": {
        "buildArtifactName": "your-app-v${appVersion}.ipa"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "ascAppId": "YOUR_APP_STORE_CONNECT_APP_ID"
      }
    }
  }
}
```

**Checklist:**

- [ ] `appVersionSource: "local"` — version from app.json
- [ ] `autoIncrement: true` on production — auto-bumps buildNumber
- [ ] Development profile with `simulator: true` for testing
- [ ] Preview profile for internal distribution (TestFlight alternative)
- [ ] `ascAppId` — Numeric ID from App Store Connect (found in App Information)

---

## 5. Code Signing and Provisioning

### Option A: EAS Managed Credentials (Recommended)

EAS manages all certificates and provisioning profiles automatically.

```bash
eas build --profile production --platform ios
# First time: EAS will prompt to generate credentials
# Select "Let EAS handle it" for all prompts
```

- [ ] EAS generates Apple Distribution Certificate
- [ ] EAS creates Provisioning Profile
- [ ] Credentials stored securely on Expo servers
- [ ] No macOS required

### Option B: Local Credentials

```bash
eas credentials -p ios
```

- [ ] Generate or import your own certificates
- [ ] Manage provisioning profiles manually
- [ ] Requires macOS with Xcode for some operations

### Understanding iOS Signing

| Component | Purpose | Limit |
|-----------|---------|-------|
| Distribution Certificate | Identifies you as the developer | 3 per account |
| Provisioning Profile | Links app + certificate + devices | Per bundle ID |
| Push Notification Key | For push notifications (if needed) | 2 per account |

**Important:**
- Distribution certificates expire after 1 year
- EAS will auto-renew when needed
- Revoking a certificate invalidates ALL apps using it

---

## 6. Build the IPA

### Simulator Build (for testing without device)

```bash
eas build --profile development --platform ios
```

### Preview Build (for internal testing on devices)

```bash
eas build --profile preview --platform ios
```

### Production Build (for App Store)

```bash
eas build --profile production --platform ios
```

**Checklist:**

- [ ] Build completes without errors
- [ ] If preview: install via QR code on real device and test
- [ ] Verify app name on home screen
- [ ] Verify app icon renders correctly
- [ ] Test all core features
- [ ] Test on different screen sizes (if supporting iPad)
- [ ] Verify no crash on launch
- [ ] Check memory usage is reasonable
- [ ] Verify all permission dialogs show proper descriptions

---

## 7. App Store Connect Setup

### Create App

1. [ ] Go to https://appstoreconnect.apple.com
2. [ ] Click "My Apps" → "+" → "New App"
3. [ ] Fill in:
   - Platform: iOS
   - Name (max 30 chars, must be unique on App Store)
   - Primary language
   - Bundle ID (select from dropdown — must match app.json)
   - SKU (internal reference, e.g., "your-app-001")
   - Full Access (or limit to specific users)
4. [ ] Click "Create"

### App Store Connect App ID

After creation, note the Apple ID (numeric) from "App Information" — this is your `ascAppId` for EAS Submit.

---

## 8. Store Listing Assets

### Required Screenshots

| Device | Size | Required |
|--------|------|----------|
| iPhone 6.9" (15 Pro Max) | 1320 x 2868 | Yes (or 6.7") |
| iPhone 6.7" (14 Pro Max) | 1290 x 2796 | Yes (or 6.9") |
| iPhone 6.5" (11 Pro Max) | 1284 x 2778 | Yes |
| iPhone 5.5" (8 Plus) | 1242 x 2208 | Only if supporting older devices |
| iPad Pro 12.9" (6th gen) | 2048 x 2732 | Required if iPad supported |
| iPad Pro 12.9" (2nd gen) | 2048 x 2732 | Required if iPad supported |

**Screenshot Rules:**

- [ ] Minimum 1 screenshot per required device size
- [ ] Maximum 10 screenshots per device size
- [ ] PNG or JPG format
- [ ] Must be actual app content (not just marketing)
- [ ] Can add device frames and text overlays
- [ ] First 3 screenshots appear in search results

**Tip:** You can use one set of 6.7" screenshots and Apple will scale for 6.5" and 6.9".

### App Preview Videos (Optional)

- 15-30 seconds
- App footage only (no real people, no outside content)
- Must have sound or clearly no audio
- Same dimensions as screenshots for that device

### App Icon

- [ ] 1024x1024 PNG
- [ ] No alpha/transparency
- [ ] No rounded corners (Apple adds them)
- [ ] Must match in-app icon closely
- [ ] sRGB or P3 color space

---

## 9. App Information

### Required Metadata

- [ ] **App name** — max 30 characters
- [ ] **Subtitle** — max 30 characters (appears below name in search)
- [ ] **Category** — primary (required) + secondary (optional)
- [ ] **Description** — max 4000 characters
- [ ] **Promotional text** — max 170 chars (can update without new build)
- [ ] **Keywords** — max 100 characters, comma-separated
- [ ] **Support URL** — required, publicly accessible
- [ ] **Marketing URL** — optional
- [ ] **Privacy policy URL** — required for all apps
- [ ] **Copyright** — e.g., "2026 Your Name"

### Privacy Section (App Privacy)

Apple requires detailed disclosure of data practices:

- [ ] **Data types collected** — select all that apply
- [ ] **Data linked to user** — identify which data identifies the user
- [ ] **Data used to track** — data used for cross-app tracking
- [ ] **Data not linked to user** — analytics, diagnostics, etc.

**For apps with no data collection:**
- Select "Data Not Collected" (simplest if true)

### Age Rating

- [ ] Complete age rating questionnaire
- [ ] Categories: Violence, Sexual Content, Profanity, Drugs, etc.
- [ ] Made for Kids (additional requirements if selected)
- [ ] Unrestricted Web Access declaration

---

## 10. App Review Information

### Contact Information

- [ ] First name and last name
- [ ] Phone number
- [ ] Email address

### Review Notes (Optional but Recommended)

- [ ] Demo credentials (if app requires login)
- [ ] Special configuration instructions
- [ ] Explanation of features that might not be obvious
- [ ] How to test specific features

### App Review Guidelines Compliance

Before submitting, verify:

- [ ] **Guideline 1.1** — App provides value (not just a repackaged website)
- [ ] **Guideline 2.1** — App completeness (no placeholder content, no beta labels)
- [ ] **Guideline 2.3** — Accurate metadata (screenshots match actual app)
- [ ] **Guideline 3.1.1** — In-App Purchase (if selling digital content, must use IAP)
- [ ] **Guideline 4.0** — Design (app is functional, no broken features)
- [ ] **Guideline 4.2** — Minimum functionality (not too simple)
- [ ] **Guideline 5.1** — Privacy (proper data handling and disclosure)
- [ ] **Guideline 5.1.1** — Data collection consent
- [ ] **Guideline 5.1.2** — Data use and sharing disclosure

Full guidelines: https://developer.apple.com/app-store/review/guidelines/

---

## 11. Submit for Review

### Pre-submission Checklist

- [ ] All required screenshots uploaded for each device size
- [ ] App description complete
- [ ] Privacy policy URL set and accessible
- [ ] Age rating questionnaire completed
- [ ] App Privacy section filled out
- [ ] Support URL works
- [ ] Contact info for review team provided
- [ ] No placeholder content in the app
- [ ] No crashes during normal use

### Upload and Release

#### Option A: EAS Submit (Recommended)

```bash
# Build and submit in one step
eas build --profile production --platform ios --auto-submit

# Or submit an existing build
eas submit --platform ios --profile production

# Or submit a specific build by ID
eas submit --platform ios --id <build-id>
```

**First-time EAS Submit setup:**

1. [ ] EAS will ask for Apple ID credentials
2. [ ] Provide App Store Connect API Key (recommended) OR Apple ID + app-specific password
3. [ ] Set `ascAppId` in eas.json

**Creating an App Store Connect API Key:**

1. [ ] Go to https://appstoreconnect.apple.com/access/integrations/api
2. [ ] Click "+" to generate a new key
3. [ ] Name it (e.g., "EAS Submit")
4. [ ] Role: "App Manager" or "Developer"
5. [ ] Download the .p8 file (only downloadable once!)
6. [ ] Note the Key ID and Issuer ID
7. [ ] In EAS: provide key ID, issuer ID, and path to .p8 file

#### Option B: Manual Upload via Xcode/Transporter

1. [ ] Download IPA from EAS dashboard
2. [ ] Use Transporter app (macOS) to upload
3. [ ] Wait for processing (can take 5-30 minutes)
4. [ ] Build appears in App Store Connect → TestFlight / Activity

### After Upload

1. [ ] Wait for "Processing" to complete in App Store Connect
2. [ ] Select the build in your app version
3. [ ] Set "Export Compliance" — encryption declaration
   - If your app only uses HTTPS (standard): exempt
   - [ ] Select "Yes, uses standard encryption"
4. [ ] Click "Submit for Review"

### Review Timeline

- Standard review: 24-48 hours (often same day)
- Expedited review: request via https://developer.apple.com/contact/app-store/?topic=expedite
- Rejections: respond in Resolution Center

---

## 12. Post-Launch

- [ ] Monitor crashes in App Store Connect → Analytics
- [ ] Check Xcode Organizer for crash logs (requires macOS)
- [ ] Respond to user ratings and reviews
- [ ] Monitor App Analytics (impressions, downloads, retention)
- [ ] Watch for Apple policy/guideline updates
- [ ] Renew developer account annually ($99)
- [ ] Update app if new iOS version introduces breaking changes

### Key Metrics to Monitor

| Metric | Where | Target |
|--------|-------|--------|
| Crash rate | App Store Connect | < 1% |
| Launch time | App Analytics | < 2 seconds |
| Memory usage | Xcode Organizer | < 200MB |
| Rating | App Store | > 4.0 stars |

---

## 13. Releasing Updates

### Version Bump

```bash
# Update version in app.json
# buildNumber auto-increments if autoIncrement: true
```

| Change Type | version | buildNumber |
|-------------|---------|-------------|
| Bug fix | 1.0.1 | auto |
| New feature | 1.1.0 | auto |
| Breaking change | 2.0.0 | auto |

### Build and Submit

```bash
# Build + auto submit
eas build --profile production --platform ios --auto-submit

# Or separately:
eas build --profile production --platform ios
eas submit --platform ios --profile production
```

### Release Types

| Type | Description |
|------|-------------|
| Manual release | You click "Release this version" after approval |
| Automatic release | Goes live immediately after approval |
| Phased release | 7-day gradual rollout (1%, 2%, 5%, 10%, 20%, 50%, 100%) |
| Scheduled release | Set a specific date/time |

### What's New Text

- [ ] Max 4000 characters
- [ ] Displayed on update notification and in app page
- [ ] Keep concise — users rarely read long changelogs
- [ ] Highlight most important changes

---

## 14. TestFlight

TestFlight allows testing before App Store release.

### Internal Testing (up to 100 testers)

- No review required
- Build available within minutes of upload
- Testers must be part of your App Store Connect team

### External Testing (up to 10,000 testers)

- Requires Beta App Review (usually < 24 hours)
- Invite via email or public link
- Can create multiple test groups

### Setup

1. [ ] Upload build via EAS Submit or Transporter
2. [ ] Go to App Store Connect → TestFlight
3. [ ] Add internal testers (team members)
4. [ ] For external: create a group, add testers, submit for beta review
5. [ ] Testers install via TestFlight app on their device

### TestFlight with EAS

```bash
# Build for TestFlight distribution
eas build --profile production --platform ios

# Submit to TestFlight
eas submit --platform ios --profile production
```

The build goes to TestFlight automatically. From there, manually distribute to test groups.

---

## 15. Troubleshooting

### Common Rejection Reasons

| Reason | Guideline | Fix |
|--------|-----------|-----|
| Crashes on launch | 2.1 | Test on device before submitting |
| Broken links/features | 2.1 | Test all buttons and navigation |
| Placeholder content | 2.1 | Remove "Lorem ipsum", "TODO", "Coming soon" |
| Missing privacy policy | 5.1 | Add URL in App Store Connect |
| Inaccurate screenshots | 2.3 | Screenshots must match current app |
| Inadequate permissions description | 5.1.1 | Write clear, specific usage descriptions |
| Performance — App Completeness | 2.1 | App must be fully functional |
| Design — Minimum Functionality | 4.2 | App must do more than a website |
| In-App Purchase required | 3.1.1 | Digital content must use Apple IAP |

### Common Build Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "No matching provisioning profile" | Profile expired or invalid | Run `eas credentials -p ios` and regenerate |
| "Code signing error" | Certificate issue | Let EAS manage credentials |
| "Invalid bundle structure" | Missing or wrong config | Check bundleIdentifier matches |
| "Missing compliance" | Encryption declaration needed | Answer export compliance in App Store Connect |
| Build timeout | Large app or complex dependencies | Use `--resource-class large` |
| "This bundle is invalid" | Wrong architecture or format | Ensure `distribution: "store"` for production |

### Useful Commands

```bash
# Check current credentials
eas credentials -p ios

# List all builds
eas build:list --platform ios

# View build details
eas build:view <build-id>

# Cancel a running build
eas build:cancel <build-id>

# Submit specific build
eas submit --platform ios --id <build-id>

# Clear EAS cache (if builds behave unexpectedly)
eas build --clear-cache --platform ios --profile production
```

### Responding to Rejections

1. [ ] Read rejection reason carefully in Resolution Center
2. [ ] Fix the issue in your app
3. [ ] Build and submit a new version
4. [ ] Reply in Resolution Center explaining the fix
5. [ ] If you disagree, use "Appeal" button (rarely successful for clear violations)

**Tips for avoiding rejection:**
- Test on real device, not just simulator
- Remove all debug logs and developer tools
- Ensure all features actually work
- Privacy policy must be accessible (not 404)
- Don't mention other platforms ("also on Android")
- Don't use Apple trademarks in screenshots

---

## Quick Reference: Minimum Viable Submission

For the fastest path from code to App Store:

1. `eas build --profile production --platform ios`
2. Create app in App Store Connect
3. Upload: Screenshots (6.7" + 6.5"), App icon (1024x1024)
4. Write: Description, Keywords, Subtitle
5. Set: Privacy policy URL, Support URL, Copyright
6. Complete: Age rating, App Privacy section
7. Select build → Answer export compliance → Submit for Review

---

## Apple-Specific Considerations

### Subscription/IAP Requirements

If your app sells digital goods or services, you MUST use Apple's In-App Purchase system (Apple takes 15-30% commission). Physical goods and services can use external payment.

### App Tracking Transparency (ATT)

If your app tracks users across other apps/websites:
- [ ] Add `NSUserTrackingUsageDescription` to Info.plist
- [ ] Show ATT prompt before tracking
- [ ] Respect user's choice

### Universal Links / Associated Domains

If using deep links:
- [ ] Configure `apple-app-site-association` file on your domain
- [ ] Add Associated Domains entitlement
- [ ] Test universal links on device

---

*Last updated: 2026-06-29*
