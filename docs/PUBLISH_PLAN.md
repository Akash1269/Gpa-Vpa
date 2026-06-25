# Publish Plan

Prioritized roadmap to make GPA-VPA ready for App Store and Google Play submission.

## Priority 1 — Critical (Blockers)

### 1.1 Fix App Configuration (`app.json`)

- [x] Rename app: "bolt-expo-nativewind" → "GPA Calculator"
- [x] Set `slug`: "gpa-calculator"
- [x] Set `scheme`: "gpacalculator"
- [x] Add iOS `bundleIdentifier`: "com.akash1269.gpacalculator"
- [x] Add iOS `buildNumber`: "1"
- [x] Add Android `package`: "com.akash1269.gpacalculator"
- [x] Add Android `versionCode`: 1
- [x] Add Android `adaptiveIcon` with foreground/background
- [x] Add `runtimeVersion`: "1.0.0"
- [x] Add EAS `projectId` in `extra` (placeholder — needs real ID)
- [ ] Create proper app icon (1024x1024) and splash screen assets

### 1.2 Create EAS Build Config

- [x] Create `eas.json` with development/preview/production profiles
- [x] Configure submission for iOS and Android
- [x] Set up build versioning strategy (autoIncrement for iOS)

### 1.3 Add Privacy Policy & Legal

- [x] Create Privacy Policy (docs/PRIVACY_POLICY.md)
- [x] Create Terms of Service (docs/TERMS_OF_SERVICE.md)
- [ ] Host Privacy Policy at a public URL (for store submission)
- [ ] Add data handling disclosure for Google Play
- [ ] Add open-source license attributions

### 1.4 Add Basic Tests

- [x] Install jest + @testing-library/react-native + jest-expo
- [x] Unit tests for `utils/gpaCalculator.ts` (22 tests)
- [x] Unit tests for GpaContext actions (11 tests)
- [x] Component tests for CourseCard (6 tests)
- [ ] Component tests for GpaCard
- [ ] Navigation smoke tests

---

## Priority 2 — High (Bugs & Core Quality)

### 2.1 Fix Bugs

- [x] Replace `Date.now()` IDs with UUID (`crypto.randomUUID()`)
- [x] Persist "Hide Grades" setting to AsyncStorage
- [x] Fix semester chronological sort (Spring < Summer < Fall)
- [x] Add data validation on AsyncStorage load (handle corruption)
- [x] Trim whitespace on course name/code inputs
- [x] Cap year picker at current year (already correct)

### 2.2 Add Error Boundary

- [x] Wrap app in ErrorBoundary component
- [x] Show recovery UI on crashes
- [x] Log errors for debugging

### 2.3 Add Accessibility

- [x] `accessibilityLabel` on all buttons and interactive elements
- [x] `accessibilityRole` on cards, buttons, inputs, lists
- [x] `accessibilityHint` on primary actions
- [ ] Test with VoiceOver (iOS) and TalkBack (Android)
- [ ] Verify color contrast meets WCAG AA
- [ ] Add reduced-motion support (skip animations)

---

## Priority 3 — Medium (UX Polish)

### 3.1 Onboarding

- [x] First-run tutorial screen (3 slides max)
- [x] Persist "hasSeenOnboarding" flag

### 3.2 Haptic Feedback

- [x] Add haptics on course save/delete
- [x] Add haptics on FAB press
- [ ] Add haptics on toggle switches

### 3.3 Better Notifications

- [x] Replace `Alert.alert()` with toast notifications for non-destructive events
- [x] Keep alerts only for destructive confirmations (delete, clear)

### 3.4 Undo Support

- [x] Undo after deleting a course (toast with undo button)
- [ ] Undo after clearing all data

### 3.5 Data Export

- [x] Export courses to CSV via native share sheet
- [ ] Export GPA summary as shareable image/PDF
- [x] JSON backup/restore in settings

### 3.6 Input Validation

- [x] Course name: 2–100 chars
- [x] Course code: 2–10 chars (maxLength enforced)
- [x] Show inline validation errors (not alerts)
- [x] Duplicate course detection (same code + semester + year)

---

## Priority 4 — Low (Nice to Have)

### 4.1 Performance

- [x] Wrap components in `React.memo`
- [x] Memoize theme colors with `useMemo`
- [x] Add `getItemLayout` to FlatLists
- [x] Add `maxToRenderPerBatch` for large lists

### 4.2 Additional Features

- [x] Swipe-to-delete on course cards
- [ ] App lock (biometric/PIN)
- [ ] Rate/review prompt after 5 courses added
- [ ] What's New screen after updates
- [ ] Widget support (iOS/Android)
- [ ] Multiple grading scale support (4.0, 5.0, 10.0, percentage)

### 4.3 CI/CD

- [x] GitHub Actions workflow for EAS builds
- [ ] Auto-increment build numbers
- [x] Lint + test on PR
- [ ] Auto-submit to TestFlight/Internal Testing

---

## Store Submission Checklist

### Apple App Store

- [ ] App icon 1024x1024 (no alpha, no rounded corners)
- [ ] Screenshots: 6.7", 6.5", 5.5" iPhone + iPad if supported
- [ ] App description (max 4000 chars)
- [ ] Keywords (max 100 chars)
- [ ] Privacy Policy URL
- [ ] App Review notes
- [ ] Age rating questionnaire
- [ ] App Privacy details (data not collected)

### Google Play Store

- [ ] App icon 512x512
- [ ] Feature graphic 1024x500
- [ ] Screenshots: phone + tablet (min 2)
- [ ] Short description (max 80 chars)
- [ ] Full description (max 4000 chars)
- [ ] Privacy Policy URL
- [ ] Data Safety form (no data collected/shared)
- [ ] Content rating questionnaire
- [ ] Target audience declaration
