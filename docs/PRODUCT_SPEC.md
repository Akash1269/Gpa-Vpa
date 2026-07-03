# Product Specification — GPA Calculator

**App Name:** GPA Calculator  
**Package:** com.akash1269.gpavpa  
**Version:** 0.1.2  
**Platform:** Android, iOS, Web  
**Category:** Education / Productivity  

---

## 1. Product Overview

GPA Calculator is a mobile-first academic tracking app that helps students monitor their GPA, plan future semesters, and track progress toward graduation. All data is stored locally on-device — no accounts, no cloud, no tracking.

### Value Proposition

- **Instant GPA calculation** — add courses, see your GPA update in real-time
- **Goal planning** — know exactly what grades you need to hit your target
- **Zero friction** — no sign-up, no internet required, works offline
- **Privacy-first** — all data stays on your device

---

## 2. Target Audience

- University/college students tracking semester and cumulative GPA
- Students planning future course loads to reach GPA goals
- Students monitoring credit progress toward graduation

---

## 3. Core Features

### 3.1 GPA Calculation Engine

| Feature | Description |
|---------|-------------|
| Semester GPA | Weighted average per term: Σ(grade × credits) / Σ(credits) |
| Cumulative GPA | Weighted average across all courses |
| 11-Grade Scale | A (4.0), A- (3.7), B+ (3.3), B (3.0), B- (2.7), C+ (2.3), C (2.0), C- (1.7), D+ (1.3), D (1.0), F (0.0) |
| Academic Standing | Excellent (≥3.7), Very Good (≥3.0), Satisfactory (≥2.0), Probation (≥1.0), Academic Warning (<1.0) |

**Formulas:**
```
Semester GPA = Σ(grade_value × credits) / Σ(credits)
Cumulative GPA = Σ(all grade_value × credits) / Σ(all credits)
```

### 3.2 Course Management

| Feature | Description |
|---------|-------------|
| Add/Edit Course | Name, code, grade, credits (1–4), semester, year |
| Delete Course | Swipe-to-delete with undo toast (4s window) |
| Search | Real-time filter by name or code |
| Grouping | Courses organized by semester (SectionList) |
| Validation | Required fields, 2–100 char name, 2–10 char code, duplicate detection |
| Bottom Sheet Form | Slide-up panel (mobile) / centered modal (web) |

### 3.3 GPA Goal Calculator

Three planning modes:

| Tab | Input | Output |
|-----|-------|--------|
| **Semester** | Target GPA + planned courses with credits | Required average grade per course |
| **Cumulative** | Target cumulative GPA + remaining semesters + credits/sem | Required GPA each semester |
| **Graduation** | Total credits required + credits/semester | Progress %, semesters remaining |

Each result shows a step-by-step breakdown of the calculation.

### 3.4 Credits Breakdown

- Total credits earned (hero card)
- Per-semester credit summary (expandable)
- Drill-down to individual courses within each semester

### 3.5 Academic Record

- GPA progression trendline chart (expand/collapse)
- Semester cards with inline expansion to see courses
- Color-coded semester GPA badges
- Chronological display (most recent first)

### 3.6 Semester Detail

- Semester summary card (title, GPA, course count, total credits)
- Full course list for that semester
- FAB to add course (pre-fills semester & year)
- Empty state when semester has no courses

### 3.7 Dashboard

- Cumulative GPA display with progress bar
- Academic standing badge (color-coded)
- Quick stat cards: Credits, Semesters, Courses (tappable → navigate)
- Current semester overview (top 3 courses + "+N more" indicator)
- Goal Calculator entry card
- Recent courses list (last 5)

---

## 4. Data Management

### Storage
- **Engine:** AsyncStorage (local, on-device)
- **Auto-persist:** Every course change saves immediately
- **Validation:** `isValidCourse()` type guard on load — corrupted data is discarded

### Export
| Format | Contents |
|--------|----------|
| CSV | Name, Code, Credits, Grade, Semester, Year |
| JSON Backup | Full courses array + export timestamp |

Both export via native Share dialog.

### Demo Data
- 15 pre-loaded sample courses across 4 semesters
- Auto-loads on first launch
- "Load Demo Data" available in Settings

### Data Reset
- "Clear All Data" with destructive confirmation
- Removes all courses from storage and state

---

## 5. Settings & Preferences

| Setting | Behavior | Persisted |
|---------|----------|-----------|
| Dark Theme | Toggle light/dark/system | Yes (`userTheme`) |
| Hide Grades | Obscures grades in UI | Yes (`hideGrades`) |
| Export as CSV | Share course data as CSV | — |
| Export as JSON | Full backup for restore | — |
| Load Demo Data | Populate sample courses | — |
| Clear All Data | Destructive reset | — |
| Help & FAQ | In-app guide | — |
| About | Version info | — |
| Privacy Policy | Links to GitHub-hosted policy | — |

---

## 6. UX & Design Language

### Navigation
- 4-tab bottom navigator: Dashboard, Courses, Semesters, Settings
- Bottom sheet for course add/edit (mobile) / centered modal (web)
- Stack push for detail screens (semester, credits, goal calculator)

### Visual Design
- **Font:** Inter (Regular, Medium, SemiBold, Bold)
- **Grade colors:** Green (A) → Blue (B) → Yellow (C) → Orange (D) → Red (F)
- **Card-based layout** with consistent border radius, elevation, spacing
- **Dark mode** with full theme support (no hardcoded colors)

### Animations (React Native Reanimated)
| Element | Animation | Timing |
|---------|-----------|--------|
| Section content | FadeInDown | 400ms + 100ms delay |
| Course cards | FadeInRight | 300ms staggered |
| Chart | FadeInUp | Staggered |
| Modal/sheet | slide_from_bottom | Native |
| Detail screens | slide_from_right | Native |
| Toast | FadeInDown/FadeOutDown | 300ms |

### Haptics
- Course add/remove: `ImpactFeedbackStyle.Light`
- Course save: `NotificationFeedbackType.Success`
- Delete: `NotificationFeedbackType.Warning`
- Validation error: `NotificationFeedbackType.Error`

---

## 7. Platform Behavior

| Aspect | Mobile (Android/iOS) | Web |
|--------|---------------------|-----|
| Course form | Bottom drawer (80% height) | Centered modal (500px) |
| Content width | Full screen | Max 1200px centered |
| UUID generation | Fallback for Hermes engine | `crypto.randomUUID()` |
| Haptics | Native feedback | No-op (graceful) |
| Safe areas | Insets via `react-native-safe-area-context` | N/A |
| Deployment | APK via GitHub Releases / EAS | GitHub Pages |

---

## 8. Accessibility

- `accessibilityLabel` on all interactive elements
- `accessibilityRole` (button, tab, list)
- `accessibilityHint` on primary navigation actions
- `accessibilityState` on tabs (selected)
- Color contrast for light and dark themes
- Destructive actions require confirmation dialogs

---

## 9. Technical Architecture

| Layer | Technology |
|-------|-----------|
| Framework | Expo 56 + React Native 0.85 + React 19 |
| Language | TypeScript 5.8 |
| Routing | Expo Router v5 (file-based) |
| State | React Context API (GpaContext) |
| Storage | AsyncStorage |
| Animations | React Native Reanimated |
| Gestures | react-native-gesture-handler |
| Icons | Lucide React Native |
| Build | EAS Build (cloud) |
| CI/CD | GitHub Actions (Build & Test, Release App, Deploy Web) |

### Data Flow
```
User Action → Context Dispatch → State Update → AsyncStorage Persist
                                       ↓
                              Derived (useMemo): Semesters, GPAs, Standing
                                       ↓
                              UI Re-render
```

---

## 10. Release & Distribution

| Channel | Method | URL |
|---------|--------|-----|
| Web | GitHub Pages (auto-deploy on push) | https://akash1269.github.io/Gpa-Vpa/ |
| Android APK | GitHub Releases (tag-based workflow) | https://github.com/Akash1269/Gpa-Vpa/releases |
| Play Store | EAS Build + Submit (planned) | — |
| App Store | EAS Build + Submit (planned) | — |

### Release Process
```bash
# Bump version in app.json, commit, then:
git tag vX.Y.Z
git push origin vX.Y.Z   # Triggers: lint → test → build APK → create GitHub Release
```

---

## 11. Future Roadmap

### Priority 2 — Next Up
- **What-If Simulator** — hypothetical courses to see projected GPA without saving
- **Grade Distribution** — visual breakdown (pie/bar) of grade counts
- **Export Transcript** — PDF or shareable summary

### Priority 3 — Planned
- Strongest/Weakest Subjects (GPA by course prefix)
- Academic Standing Warnings (approaching probation alert)
- Dean's List Tracker (3.5+ per semester)
- Cloud Backup/Restore (JSON import on new device)

### Priority 4 — Wishlist
- Semester Notes
- Course Difficulty Rating (1–5 stars)
- Streak/Achievements ("3 semesters above 3.0")
- Course Schedule Import

---

## 12. Onboarding

3-slide first-run experience:
1. **Welcome** — App intro with icon
2. **How it works** — Add courses, track GPA
3. **Get started** — CTA to begin

Persisted via `@hasSeenOnboarding` flag. Never shown again after completion.

---

## 13. Privacy & Legal

- **Data:** 100% local, never transmitted
- **Analytics:** None
- **Permissions:** None required
- **License:** MIT (open source)
- **Privacy Policy:** https://github.com/Akash1269/Gpa-Vpa/blob/main/docs/PRIVACY_POLICY.md
- **Terms of Service:** https://github.com/Akash1269/Gpa-Vpa/blob/main/docs/TERMS_OF_SERVICE.md
