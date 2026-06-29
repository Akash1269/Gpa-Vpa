<div align="center">

# GPA-VPA

**A modern GPA Calculator & Academic Tracker for students**

Track courses, compute semester & cumulative GPA, and monitor academic standing — all locally on your device.

[![CI](https://github.com/Akash1269/Gpa-Vpa/actions/workflows/ci.yml/badge.svg)](https://github.com/Akash1269/Gpa-Vpa/actions/workflows/ci.yml)
[![Deploy](https://github.com/Akash1269/Gpa-Vpa/actions/workflows/deploy-web.yml/badge.svg)](https://github.com/Akash1269/Gpa-Vpa/actions/workflows/deploy-web.yml)
[![Expo SDK](https://img.shields.io/badge/Expo-SDK%2056-000020?logo=expo)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://typescriptlang.org)
[![React Native](https://img.shields.io/badge/React%20Native-0.85-61DAFB?logo=react&logoColor=black)](https://reactnative.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

**[Live Demo](https://akash1269.github.io/Gpa-Vpa/)** · **[Download APK](https://github.com/Akash1269/Gpa-Vpa/releases/latest)**

</div>

---

## Install on Android

1. Go to the [Latest Release](https://github.com/Akash1269/Gpa-Vpa/releases/latest)
2. Download `gpa-calculator-v0.1.0.apk`
3. On your Android device, open the downloaded file
4. If prompted, allow **"Install from unknown sources"** for your browser/file manager
5. Tap **Install** → **Open**

> Your phone may show a "Play Protect" warning since the app isn't on the Play Store — tap **"Install anyway"** to proceed.

---

## Screenshots

<!-- Replace these placeholders with actual screenshots -->
<div align="center">
<table>
<tr>
<td align="center"><strong>Dashboard</strong></td>
<td align="center"><strong>Courses</strong></td>
<td align="center"><strong>Academic Record</strong></td>
<td align="center"><strong>Settings</strong></td>
</tr>
<tr>
<td><img src="docs/screenshots/dashboard.png" width="200" alt="Dashboard"/></td>
<td><img src="docs/screenshots/courses.png" width="200" alt="Courses"/></td>
<td><img src="docs/screenshots/academic-record.png" width="200" alt="Academic Record"/></td>
<td><img src="docs/screenshots/settings.png" width="200" alt="Settings"/></td>
</tr>
</table>
</div>

> *Screenshots coming soon — add your own to `docs/screenshots/`*

---

## Features

- **Real-time GPA calculation** — weighted by credit hours on a 4.0 scale
- **Semester & cumulative GPA** — track progress across your entire academic career
- **Academic standing indicators** — color-coded status (Excellent → Academic Warning)
- **Course management** — add, edit, delete with search & semester filtering
- **GPA progression chart** — visualize your academic trajectory
- **Dark/Light theme** — automatic or manual toggle
- **Privacy-first** — all data stored locally via AsyncStorage (no server, no tracking)
- **Cross-platform** — runs on iOS, Android, and Web

---

## Quick Start

```bash
# Clone the repository
git clone https://github.com/Akash1269/Gpa-Vpa.git
cd Gpa-Vpa

# Install dependencies
npm install

# Start the development server
npm start
```

Then scan the QR code with **Expo Go** (iOS/Android) or press `w` to open in your browser.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Expo](https://expo.dev) SDK 56 |
| **UI** | React Native 0.85 + React 19 |
| **Language** | TypeScript 5.8 |
| **Routing** | Expo Router v5 (file-based) |
| **State** | React Context API |
| **Storage** | AsyncStorage (local, no backend) |
| **Animations** | React Native Reanimated |
| **Icons** | Lucide React Native |
| **Font** | Inter (via @expo-google-fonts) |
| **CI/CD** | GitHub Actions + EAS Build |

---

## Architecture

```
Single Source of Truth: courses[] → derives → semesters, GPAs, standings
```

- **Context API** (`GpaContext`) manages all global state
- **Derived data model** — semesters and GPAs are computed from courses in real-time
- **Custom hooks** — `useGpa()` for data, `useTheme()` for theming
- **Reusable components** — `CourseCard`, `SemesterCard`, `GpaChart`, `EmptyState`, etc.

> For detailed architecture docs, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## Project Structure

```
app/                  → Screens (Expo Router file-based routing)
├── (tabs)/           → Tab screens (Dashboard, Courses, Academic Record, Settings)
├── course/[id].tsx   → Course add/edit modal
└── semester/[id].tsx → Semester detail screen
components/           → Reusable UI components
context/              → GpaContext (global state + persistence)
hooks/                → Custom hooks (useGpa, useTheme)
types/                → TypeScript type definitions
utils/                → GPA calculation business logic
__tests__/            → Unit tests (Jest)
docs/                 → Documentation
.github/              → CI workflows, issue/PR templates
```

---

## GPA Scale

| Grade | Points | | Grade | Points |
|-------|--------|-|-------|--------|
| A     | 4.0    | | C+    | 2.3    |
| A-    | 3.7    | | C     | 2.0    |
| B+    | 3.3    | | C-    | 1.7    |
| B     | 3.0    | | D+    | 1.3    |
| B-    | 2.7    | | D     | 1.0    |
|       |        | | F     | 0.0    |

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Run on Android |
| `npm run ios` | Run on iOS |
| `npm run web` | Run in browser |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests |
| `npm run test:coverage` | Tests with coverage report |
| `npm run build:web` | Export for web deployment |

---

## Contributing

Contributions are welcome! Please read the [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up your development environment
- Coding conventions and project patterns
- Pull request process

See the [open issues](https://github.com/Akash1269/Gpa-Vpa/issues) for things to work on.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Expo](https://expo.dev) for the incredible React Native toolchain
- [Lucide](https://lucide.dev) for beautiful open-source icons
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) for smooth animations

---

<div align="center">

**Built by [Akash](https://github.com/Akash1269)**

</div>
