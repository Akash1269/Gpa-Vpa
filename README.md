# GPA-VPA

A mobile GPA Calculator & Academic Tracker built with React Native (Expo). Helps students track courses, calculate GPA, and monitor academic progress — all data stored locally on-device.

## Tech Stack

- **Expo 53** + **React 19** + **React Native 0.79** + **TypeScript 5.8**
- **Expo Router** — File-based routing
- **AsyncStorage** — Local data persistence
- **React Native Reanimated** — Animations
- **Lucide React Native** — Icons
- **Inter font** via @expo-google-fonts

## Features

| Tab | Purpose |
|-----|---------|
| **Dashboard** | Cumulative GPA, quick stats, current semester preview, recent courses |
| **Courses** | Add/edit/delete courses with search & semester filtering |
| **Academic Record** | Full history, GPA progression chart, semester breakdowns |
| **Settings** | Dark/light theme, hide grades, clear all data |

### GPA Calculation

- Standard **4.0 scale** (A = 4.0, A- = 3.7, B+ = 3.3, …)
- Weighted average by credit hours
- Semester GPA and Cumulative GPA computed in real-time

### Academic Standing (color-coded)

| Standing | GPA Range |
|----------|-----------|
| Excellent | ≥ 3.7 |
| Very Good | ≥ 3.0 |
| Satisfactory | ≥ 2.0 |
| Probation | ≥ 1.0 |
| Academic Warning | < 1.0 |

## Project Structure

```
app/
  (tabs)/          → Tab screens (Dashboard, Courses, Academic Record, Settings)
  course/[id].tsx  → Course detail/edit screen
  semester/[id].tsx→ Semester detail screen
components/        → Reusable UI components (CourseCard, GpaChart, etc.)
context/           → GpaContext (global state via Context API)
hooks/             → Custom hooks (useGpa, useTheme, useFrameworkReady)
types/             → TypeScript types (Course, Semester)
utils/             → GPA calculation logic
```

## Architecture

- **Context API** (`GpaContext`) manages all state globally
- **Derived data model**: courses are the single source of truth → semesters and GPAs are computed in real-time
- **Custom hooks** (`useGpa`, `useTheme`) for clean data access
- **Reusable components** (`CourseCard`, `SemesterCard`, `GpaChart`, `EmptyState`, etc.)

## Getting Started

### Prerequisites

- Node.js (LTS)
- Expo CLI (`npm install -g expo-cli`)

### Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on specific platform
npm run android
npm run ios
npm run web
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run dev` | Start without telemetry |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS |
| `npm run web` | Run in browser |
| `npm run build:web` | Export for web deployment |
| `npm run lint` | Run linter |

## License

Private project.
