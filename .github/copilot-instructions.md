# Project: GPA-VPA (GPA Calculator & Academic Tracker)

## Overview

This is a React Native (Expo 56) mobile app for tracking courses, calculating GPA, and monitoring academic progress. All data is stored locally on-device via AsyncStorage.

## Tech Stack

- **Framework:** Expo 56 + React 19 + React Native 0.85
- **Language:** TypeScript 5.8
- **Routing:** Expo Router v5 (file-based)
- **State:** React Context API (single GpaContext provider)
- **Storage:** AsyncStorage (local, no backend)
- **Animations:** React Native Reanimated
- **Icons:** Lucide React Native
- **Font:** Inter (via @expo-google-fonts)
- **Build:** EAS Build (cloud)
- **CI/CD:** GitHub Actions (lint, test, web deploy)

## Architecture

- **Single source of truth:** `courses` array in GpaContext
- **Derived state:** Semesters, GPAs, standings are computed from courses
- **Hooks:** `useGpa()` for data access, `useTheme()` for theming
- **Navigation:** Tab navigator (4 tabs) + modal stack for course/semester detail

## Project Structure

```
app/              → Screens (file-based routing)
  (tabs)/         → Tab screens (index, courses, academic-record, settings)
  course/[id]     → Course add/edit modal
  semester/[id]   → Semester detail screen
components/       → Reusable UI (CourseCard, GpaChart, SemesterCard, etc.)
context/          → GpaContext (global state + persistence)
hooks/            → useGpa, useTheme, useFrameworkReady
types/            → Course, Semester TypeScript types
utils/            → GPA calculation logic
assets/images/    → App icons and images
docs/             → Documentation, publishing guides
```

## Naming Convention

- **Project/repo identity:** `gpa-vpa` (slug, filenames, artifacts)
- **User-facing display name:** "GPA Calculator" (app.json name, UI strings)
- **Package identifiers:** `com.akash1269.gpavpa` (Android/iOS)
- **Deep link scheme:** `gpavpa://`

## Key Conventions

- Components use `StyleSheet.create()` with dynamic colors from `useTheme()`
- All interactive elements should have accessibility labels
- Use `useCallback` for context actions, `useMemo` for derived values
- FlatList for all lists (not ScrollView with map)
- Animations use `entering` prop from Reanimated (FadeIn, FadeInRight, etc.)
- Destructive actions require Alert.alert() confirmation
- Course IDs should use UUID (not Date.now())
- Web layout uses max-width 1200px for content areas

## GPA Scale

A=4.0, A-=3.7, B+=3.3, B=3.0, B-=2.7, C+=2.3, C=2.0, C-=1.7, D+=1.3, D=1.0, F=0.0

## Commands

```bash
npm start          # Start Expo dev server
npm run android    # Run on Android
npm run ios        # Run on iOS
npm run web        # Run in browser
npm run lint       # Run linter
npm test           # Run unit tests
npm run build:web  # Export for web deployment
```

## Build & Deploy

```bash
eas build --profile preview --platform android   # APK for testing
eas build --profile production --platform android # AAB for Play Store
```

- EAS project ID: `cdc61fa1-5392-47ce-a861-ce415358623e`
- Web hosted at: https://akash1269.github.io/Gpa-Vpa/
- Releases at: https://github.com/Akash1269/Gpa-Vpa/releases

## Guidelines for AI Assistants

1. Always use TypeScript with proper types from `types/` folder
2. Follow existing patterns — check similar components before creating new ones
3. Use `useGpa()` hook to access courses/semesters/GPA data
4. Use `useTheme()` hook for all colors — never hardcode colors
5. New screens go in `app/` following Expo Router conventions
6. New reusable UI goes in `components/`
7. Business logic goes in `utils/`
8. Keep components focused — one responsibility per file
9. Test GPA calculations with edge cases (0 courses, 0 credits)
10. Persist user preferences to AsyncStorage
11. Never commit `.apk`, `.aab`, or keystore files (see .gitignore)
12. Use `gpa-vpa` for artifact/file naming, "GPA Calculator" for user-facing text
