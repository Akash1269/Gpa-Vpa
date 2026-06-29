# Android Publishing Guide — Expo + React Native

A complete step-by-step reference for publishing any Expo/React Native app to the Google Play Store using EAS Build.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Google Play Developer Account](#2-google-play-developer-account)
3. [App Configuration](#3-app-configuration)
4. [EAS Build Setup](#4-eas-build-setup)
5. [App Signing](#5-app-signing)
6. [Build the AAB](#6-build-the-aab)
7. [Store Listing Assets](#7-store-listing-assets)
8. [Create App on Google Play Console](#8-create-app-on-google-play-console)
9. [Store Listing Content](#9-store-listing-content)
10. [Content Rating](#10-content-rating)
11. [Pricing and Distribution](#11-pricing-and-distribution)
12. [Submit for Review](#12-submit-for-review)
13. [Post-Launch](#13-post-launch)
14. [Releasing Updates](#14-releasing-updates)
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

---

## 2. Google Play Developer Account

- [ ] Register at https://play.google.com/console/signup
- [ ] Pay one-time $25 registration fee
- [ ] Complete identity verification (can take 48 hours)
- [ ] Set up a payments profile (even for free apps)
- [ ] Note your Developer Account ID for reference

**Important:** Organization accounts require additional documentation. Individual accounts are faster to set up.

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
    "android": {
      "package": "com.yourcompany.yourapp",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "permissions": []
    },
    "plugins": [...]
  }
}
```

**Checklist:**

- [ ] `name` — Display name on device (max 30 characters for Play Store)
- [ ] `slug` — Unique Expo identifier (lowercase, hyphens)
- [ ] `version` — Semantic version shown to users (e.g., "1.0.0")
- [ ] `scheme` — Deep link scheme (lowercase, no special chars)
- [ ] `android.package` — Unique identifier in reverse domain format
  - Must be unique across all Play Store apps
  - Cannot be changed after first publish
  - Convention: `com.yourcompany.yourapp`
- [ ] `android.versionCode` — Integer, must increment with every upload
- [ ] `android.adaptiveIcon.foregroundImage` — 1024x1024 PNG with transparent padding
- [ ] `android.adaptiveIcon.backgroundColor` — Background color for adaptive icon
- [ ] `android.permissions` — Only request permissions you actually use
- [ ] `icon` — 1024x1024 PNG, no transparency, no rounded corners (store adds them)

### Versioning Rules

| Field | Type | Rule |
|-------|------|------|
| `version` | string | Semantic version (user-facing) |
| `versionCode` | integer | Must strictly increase with every Play Store upload |

---

## 4. EAS Build Setup

### Initialize EAS

```bash
eas init
```

This creates/updates `app.json` with your EAS `projectId`.

### Configure eas.json

```json
{
  "cli": {
    "version": ">= 12.0.0",
    "appVersionSource": "local"
  },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "buildArtifactName": "your-app-v${appVersion}.apk"
      }
    },
    "production": {
      "autoIncrement": true,
      "android": {
        "buildType": "app-bundle",
        "buildArtifactName": "your-app-v${appVersion}.aab"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-play-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

**Checklist:**

- [ ] `appVersionSource: "local"` — use version from app.json
- [ ] `autoIncrement: true` on production — auto-bumps versionCode
- [ ] `buildType: "app-bundle"` for production (required by Play Store since 2021)
- [ ] `buildType: "apk"` for preview/testing (sideload-friendly)
- [ ] Artifact naming with `${appVersion}` template variable
- [ ] Service account key path configured for automated submission

---

## 5. App Signing

### Option A: Google-Managed Signing (Recommended)

Google Play App Signing manages your upload key. EAS handles this automatically on first build.

- [ ] Let EAS generate credentials on first `eas build`
- [ ] EAS will prompt: "Generate a new Android Keystore?" → Yes
- [ ] Download the upload keystore from Expo dashboard for backup
- [ ] Enroll in Google Play App Signing when uploading first AAB

### Option B: Self-Managed Signing

```bash
eas credentials -p android
```

- [ ] Generate or import your own keystore
- [ ] Store keystore password securely (cannot be recovered)
- [ ] Back up keystore file (losing it = cannot update app)

**Important:**
- Never commit keystore files to git
- Add to `.gitignore`: `*.jks`, `*.keystore`
- The upload key can be reset; the app signing key cannot

---

## 6. Build the AAB

### Preview Build (APK for testing)

```bash
eas build --profile preview --platform android
```

### Production Build (AAB for Play Store)

```bash
eas build --profile production --platform android
```

**Checklist:**

- [ ] Build completes without errors
- [ ] Download and test the preview APK on a real device
- [ ] Verify app name appears correctly on home screen
- [ ] Verify adaptive icon renders properly
- [ ] Test all core features work
- [ ] Check no debug/development artifacts remain
- [ ] Verify permissions dialog shows only necessary permissions

---

## 7. Store Listing Assets

### Required Graphics

| Asset | Size | Format | Notes |
|-------|------|--------|-------|
| App icon | 512x512 | PNG (32-bit, no alpha) | Must match in-app icon |
| Feature graphic | 1024x500 | PNG or JPG | Shown at top of listing |
| Phone screenshots | 1080x1920+ | PNG or JPG | Min 2, max 8 |
| 7" tablet screenshots | 1200x1920+ | PNG or JPG | Optional but recommended |
| 10" tablet screenshots | 1920x1200+ | PNG or JPG | Optional but recommended |

### Screenshot Guidelines

- [ ] Minimum 2 screenshots, maximum 8 per device type
- [ ] Show actual app UI (not just marketing material)
- [ ] First 2-3 screenshots are most important (visible before "See more")
- [ ] Add minimal text overlay explaining features
- [ ] Use device frames for professional look (optional)
- [ ] Localize screenshots for each target language

### Feature Graphic Guidelines

- [ ] 1024x500 exactly
- [ ] May be cropped to different aspect ratios
- [ ] Keep text/logos away from edges (safe zone: center 80%)
- [ ] Used in various Play Store placements (search, home)

---

## 8. Create App on Google Play Console

1. [ ] Go to https://play.google.com/console
2. [ ] Click "Create app"
3. [ ] Fill in:
   - App name (max 30 chars)
   - Default language
   - App or Game
   - Free or Paid (cannot change after publish)
4. [ ] Accept declarations (Developer Program Policies, US export laws)
5. [ ] Click "Create app"

---

## 9. Store Listing Content

### Main Store Listing

- [ ] **Short description** (max 80 chars) — appears in search results
- [ ] **Full description** (max 4000 chars) — use features, formatting
- [ ] **App icon** — 512x512 PNG uploaded
- [ ] **Feature graphic** — 1024x500 uploaded
- [ ] **Phone screenshots** — minimum 2 uploaded
- [ ] **App category** — select primary and secondary
- [ ] **Tags** — select up to 5 relevant tags
- [ ] **Contact email** — required, publicly visible
- [ ] **Privacy policy URL** — required for all apps

### Privacy Policy Requirements

- [ ] Must be hosted at a publicly accessible URL
- [ ] Must describe what data is collected (even if none)
- [ ] Must describe how data is used and shared
- [ ] Must provide contact information
- [ ] Recommended hosting: GitHub Pages, your website, or dedicated privacy page

---

## 10. Content Rating

1. [ ] Go to "Content rating" in Play Console
2. [ ] Start questionnaire
3. [ ] Answer honestly (violence, sexuality, language, substances, etc.)
4. [ ] Submit questionnaire
5. [ ] Review assigned rating (ESRB, PEGI, etc.)
6. [ ] Accept the rating

**Note:** If your app has no user-generated content, no ads, no violence, etc., you'll typically get "Everyone" / PEGI 3.

---

## 11. Pricing and Distribution

- [ ] Set app as Free or Paid (cannot change after publish)
- [ ] Select countries/regions for distribution
- [ ] Opt in/out of Google Play programs:
  - [ ] Google Play for Families (if targeting children)
  - [ ] Ads declaration (contains ads: yes/no)
  - [ ] Data safety section
- [ ] Complete Data Safety form:
  - [ ] What data types are collected
  - [ ] Whether data is shared with third parties
  - [ ] Whether data is encrypted in transit
  - [ ] Whether users can request data deletion

---

## 12. Submit for Review

### Pre-submission Checklist

- [ ] All store listing sections show green checkmarks
- [ ] App content → Privacy policy URL is set
- [ ] App content → Data safety form completed
- [ ] Content rating completed
- [ ] Pricing and distribution configured
- [ ] Target API level meets Google's requirements (currently API 34+)

### Upload and Release

#### Option A: Manual Upload

1. [ ] Download AAB from EAS dashboard (https://expo.dev/builds)
2. [ ] Go to Play Console → Release → Production
3. [ ] Click "Create new release"
4. [ ] Upload the .aab file
5. [ ] Add release notes (what's new)
6. [ ] Click "Review release"
7. [ ] Click "Start rollout to Production"

#### Option B: Automated with EAS Submit

```bash
eas submit --platform android --profile production
```

**First-time setup for EAS Submit:**

1. [ ] Create a service account in Google Cloud Console
2. [ ] Grant "Service Account User" role
3. [ ] Download JSON key file
4. [ ] Place at path specified in `eas.json` → `submit.production.android.serviceAccountKeyPath`
5. [ ] In Play Console: Settings → API access → Link the service account
6. [ ] Grant "Release manager" permission to the service account

### Review Timeline

- First submission: 3-7 days typically
- Updates: usually 1-3 days
- Expedited reviews not available

---

## 13. Post-Launch

- [ ] Monitor crash reports (Play Console → Quality → Android Vitals)
- [ ] Respond to user reviews
- [ ] Monitor install/uninstall metrics
- [ ] Check ANR (App Not Responding) rate — target < 0.47%
- [ ] Check crash rate — target < 1.09%
- [ ] Set up staged rollouts for future updates (e.g., 10% → 50% → 100%)

---

## 14. Releasing Updates

### Version Bump

```bash
# Update version in app.json
# versionCode auto-increments if autoIncrement: true in eas.json
```

| Change Type | version | versionCode |
|-------------|---------|-------------|
| Bug fix | 1.0.1 | auto |
| New feature | 1.1.0 | auto |
| Breaking change | 2.0.0 | auto |

### Build and Submit

```bash
# Build new AAB
eas build --profile production --platform android

# Submit to Play Store
eas submit --platform android --profile production

# Or combined:
eas build --profile production --platform android --auto-submit
```

### Release Notes

- Keep concise (max 500 chars per language)
- Highlight new features and important fixes
- Use bullet points for readability

---

## 15. Troubleshooting

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| "Version code already exists" | versionCode not incremented | Set `autoIncrement: true` or manually bump |
| "Package name mismatch" | Different package in AAB vs listing | Package name in app.json must match Play Console |
| "Target API level too low" | Expo SDK doesn't target latest API | Update Expo SDK or set `targetSdkVersion` in build config |
| "Signing key mismatch" | Different key than first upload | Use same keystore, or reset upload key in Play Console |
| "Deobfuscation file missing" | ProGuard/R8 mapping not uploaded | EAS handles this automatically; if manual, upload mapping.txt |
| Build fails with OOM | Large assets or dependencies | Use `--resource-class large` in EAS build |

### Useful Commands

```bash
# Check current credentials
eas credentials -p android

# List all builds
eas build:list --platform android

# View build logs
eas build:view <build-id>

# Cancel a running build
eas build:cancel <build-id>

# Submit existing build
eas submit --platform android --id <build-id>
```

### Google Play Policy Compliance

- [ ] No misleading claims in store listing
- [ ] No impersonation of other apps/brands
- [ ] Minimum functionality (app must provide value beyond a website)
- [ ] No broken/non-functional features
- [ ] Permissions must be justified by app functionality
- [ ] Target API level must meet current year's requirement

---

## Quick Reference: Minimum Viable Submission

For the fastest path from code to Play Store:

1. `eas build --profile production --platform android`
2. Create app in Play Console
3. Upload: App icon (512x512), Feature graphic (1024x500), 2+ screenshots
4. Write: Short description, Full description
5. Set: Privacy policy URL, Contact email
6. Complete: Content rating questionnaire, Data safety form
7. Upload AAB → Start rollout

---

*Last updated: 2026-06-29*
