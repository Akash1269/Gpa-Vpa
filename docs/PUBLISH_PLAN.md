# Publish Plan

Prioritized roadmap to make GPA-VPA ready for deployment.

---

## 🌐 Web Deployment Checklist (GitHub Pages)

| # | Task | Status |
|---|------|--------|
| 1 | Verify `npm run build:web` completes without errors | ⏳ |
| 2 | Test built output locally (serve `dist/` folder) | ⏳ |
| 3 | Create GitHub Actions workflow for Pages deployment | ⏳ |
| 4 | Enable GitHub Pages in repo settings (source: GitHub Actions) | ⏳ |
| 5 | Verify all routes work with SPA fallback (single output mode) | ⏳ |
| 6 | Test localStorage persistence (add course → refresh → data stays) | ⏳ |
| 7 | Add favicon and meta tags (title, description, OG image) | ⏳ |
| 8 | Test responsive layout on desktop/tablet/mobile viewports | ⏳ |
| 9 | Set homepage URL in GitHub repo settings | ⏳ |
| 10 | Add web demo link to README | ⏳ |

**Deploy URL:** `https://akash1269.github.io/Gpa-Vpa/`

---

## 📱 Mobile Deployment Checklist (App Store + Google Play)

### Prerequisites

| # | Task | Status |
|---|------|--------|
| 1 | Create Expo account + run `eas login` + `eas init` | ⏳ |
| 2 | Create app icon (1024×1024 PNG, no alpha, no rounded corners) | ⏳ |
| 3 | Create splash screen asset | ⏳ |
| 4 | Host Privacy Policy at a public URL | ⏳ |
| 5 | Add open-source license attributions | ⏳ |
| 6 | Google Play Developer account ($25 one-time) | ⏳ |
| 7 | Apple Developer account ($99/year) | ⏳ |
| 8 | Set up support email for store listings | ⏳ |

### Apple App Store

| # | Task | Status |
|---|------|--------|
| 1 | App icon 1024×1024 (no alpha, no rounded corners) | ⏳ |
| 2 | Screenshots: 6.7", 6.5", 5.5" iPhone + iPad if supported | ⏳ |
| 3 | App description (max 4000 chars) | ⏳ |
| 4 | Keywords (max 100 chars) | ⏳ |
| 5 | Privacy Policy URL | ⏳ |
| 6 | App Review notes | ⏳ |
| 7 | Age rating questionnaire | ⏳ |
| 8 | App Privacy details (data not collected) | ⏳ |
| 9 | Run `eas build --platform ios --profile production` | ⏳ |
| 10 | Submit via `eas submit --platform ios` | ⏳ |

### Google Play Store

| # | Task | Status |
|---|------|--------|
| 1 | App icon 512×512 | ⏳ |
| 2 | Feature graphic 1024×500 | ⏳ |
| 3 | Screenshots: phone + tablet (min 2) | ⏳ |
| 4 | Short description (max 80 chars) | ⏳ |
| 5 | Full description (max 4000 chars) | ⏳ |
| 6 | Privacy Policy URL | ⏳ |
| 7 | Data Safety form (no data collected/shared) | ⏳ |
| 8 | Content rating questionnaire | ⏳ |
| 9 | Target audience declaration | ⏳ |
| 10 | Run `eas build --platform android --profile production` | ⏳ |
| 11 | Submit via `eas submit --platform android` | ⏳ |

---

## ⏳ Pending Tasks

### Priority 1 — Critical (Blockers)

| # | Category | Task |
|---|----------|------|
| 1 | App Config | Create proper app icon (1024×1024) and splash screen assets |
| 2 | Legal | Host Privacy Policy at a public URL (for store submission) |
| 3 | Legal | Add data handling disclosure for Google Play |
| 4 | Legal | Add open-source license attributions |

### Priority 2 — High (Quality)

| # | Category | Task |
|---|----------|------|
| 5 | Tests | Component tests for GpaCard |
| 6 | Tests | Navigation smoke tests |
| 7 | Accessibility | Test with VoiceOver (iOS) and TalkBack (Android) |
| 8 | Accessibility | Verify color contrast meets WCAG AA |
| 9 | Accessibility | Add reduced-motion support (skip animations) |

### Priority 3 — Medium (UX Polish)

| # | Category | Task |
|---|----------|------|
| 10 | Haptics | Add haptics on toggle switches |
| 11 | Undo | Undo after clearing all data |
| 12 | Data Export | Export GPA summary as shareable image/PDF |

### Priority 4 — Low (Nice to Have)

| # | Category | Task |
|---|----------|------|
| 13 | Features | App lock (biometric/PIN) |
| 14 | Features | Rate/review prompt after 5 courses added |
| 15 | Features | What's New screen after updates |
| 16 | Features | Widget support (iOS/Android) |
| 17 | Features | Multiple grading scale support (4.0, 5.0, 10.0, percentage) |
| 18 | CI/CD | Auto-increment build numbers |
| 19 | CI/CD | Auto-submit to TestFlight/Internal Testing |

---

## ✅ Completed Tasks

| # | Category | Task |
|---|----------|------|
| 1 | App Config | Rename app: "bolt-expo-nativewind" → "GPA Calculator" |
| 2 | App Config | Set `slug`: "gpa-calculator" |
| 3 | App Config | Set `scheme`: "gpacalculator" |
| 4 | App Config | Add iOS `bundleIdentifier`: "com.akash1269.gpacalculator" |
| 5 | App Config | Add iOS `buildNumber`: "1" |
| 6 | App Config | Add Android `package`: "com.akash1269.gpacalculator" |
| 7 | App Config | Add Android `versionCode`: 1 |
| 8 | App Config | Add Android `adaptiveIcon` with foreground/background |
| 9 | App Config | Add `runtimeVersion`: "1.0.0" |
| 10 | App Config | Add EAS `projectId` in `extra` (placeholder — needs real ID) |
| 11 | EAS Build | Create `eas.json` with development/preview/production profiles |
| 12 | EAS Build | Configure submission for iOS and Android |
| 13 | EAS Build | Set up build versioning strategy (autoIncrement for iOS) |
| 14 | Legal | Create Privacy Policy (docs/PRIVACY_POLICY.md) |
| 15 | Legal | Create Terms of Service (docs/TERMS_OF_SERVICE.md) |
| 16 | Tests | Install jest + @testing-library/react-native + jest-expo |
| 17 | Tests | Unit tests for `utils/gpaCalculator.ts` (22 tests) |
| 18 | Tests | Unit tests for GpaContext actions (11 tests) |
| 19 | Tests | Component tests for CourseCard (6 tests) |
| 20 | Bug Fixes | Replace `Date.now()` IDs with UUID (`crypto.randomUUID()`) |
| 21 | Bug Fixes | Persist "Hide Grades" setting to AsyncStorage |
| 22 | Bug Fixes | Fix semester chronological sort (Spring < Summer < Fall) |
| 23 | Bug Fixes | Add data validation on AsyncStorage load (handle corruption) |
| 24 | Bug Fixes | Trim whitespace on course name/code inputs |
| 25 | Bug Fixes | Cap year picker at current year |
| 26 | Error Handling | Wrap app in ErrorBoundary component |
| 27 | Error Handling | Show recovery UI on crashes |
| 28 | Error Handling | Log errors for debugging |
| 29 | Accessibility | `accessibilityLabel` on all buttons and interactive elements |
| 30 | Accessibility | `accessibilityRole` on cards, buttons, inputs, lists |
| 31 | Accessibility | `accessibilityHint` on primary actions |
| 32 | Onboarding | First-run tutorial screen (3 slides max) |
| 33 | Onboarding | Persist "hasSeenOnboarding" flag |
| 34 | Haptics | Add haptics on course save/delete |
| 35 | Haptics | Add haptics on FAB press |
| 36 | Notifications | Replace `Alert.alert()` with toast for non-destructive events |
| 37 | Notifications | Keep alerts only for destructive confirmations |
| 38 | Undo | Undo after deleting a course (toast with undo button) |
| 39 | Data Export | Export courses to CSV via native share sheet |
| 40 | Data Export | JSON backup/restore in settings |
| 41 | Validation | Course name: 2–100 chars |
| 42 | Validation | Course code: 2–10 chars (maxLength enforced) |
| 43 | Validation | Show inline validation errors (not alerts) |
| 44 | Validation | Duplicate course detection (same code + semester + year) |
| 45 | Performance | Wrap components in `React.memo` |
| 46 | Performance | Memoize theme colors with `useMemo` |
| 47 | Performance | Add `getItemLayout` to FlatLists |
| 48 | Performance | Add `maxToRenderPerBatch` for large lists |
| 49 | Features | Swipe-to-delete on course cards |
| 50 | CI/CD | GitHub Actions workflow for EAS builds |
| 51 | CI/CD | Lint + test on PR |
