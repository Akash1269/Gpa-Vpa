# Contributing to GPA-VPA

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

### Prerequisites

- **Node.js** (LTS version, currently 20.x)
- **npm** (comes with Node.js)
- **Expo CLI** — installed globally or via npx
- **Git** configured with your GitHub account
- A mobile device or emulator for testing (iOS Simulator / Android Emulator)

### Setup

1. **Fork** the repository on GitHub
2. **Clone** your fork:
   ```bash
   git clone https://github.com/<your-username>/Gpa-Vpa.git
   cd Gpa-Vpa
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Start the development server:**
   ```bash
   npm start
   ```
5. Scan the QR code with Expo Go (mobile) or press `w` for web.

## Development Workflow

1. Create a new branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes following the [coding conventions](#coding-conventions)
3. Run checks before committing:
   ```bash
   npm run lint        # Lint check
   npx tsc --noEmit   # Type check
   npm test           # Unit tests
   ```
4. Commit with a descriptive message
5. Push to your fork and open a Pull Request

## Coding Conventions

### TypeScript

- Use proper types from the `types/` folder — avoid `any`
- All new components should be typed with explicit props interfaces

### Components

- Use `StyleSheet.create()` with dynamic colors from `useTheme()`
- **Never hardcode colors** — always use the theme hook
- Use `FlatList` for lists (not `ScrollView` with `.map()`)
- Animations use `entering` prop from React Native Reanimated
- One responsibility per component file

### State Management

- Access data via `useGpa()` hook — never import context directly
- `courses` array is the single source of truth
- Semesters/GPAs are derived (computed) from courses

### File Organization

| What | Where |
|------|-------|
| Screens | `app/` (Expo Router file-based routing) |
| Reusable UI components | `components/` |
| Business logic | `utils/` |
| TypeScript types | `types/` |
| Hooks | `hooks/` |
| Global state | `context/` |

### Naming

- Components: `PascalCase.tsx` (e.g., `CourseCard.tsx`)
- Hooks: `camelCase.ts` prefixed with `use` (e.g., `useGpa.ts`)
- Types: `camelCase.ts` (e.g., `course.ts`)
- Utils: `camelCase.ts` (e.g., `gpaCalculator.ts`)

## Pull Request Guidelines

- Fill out the PR template completely
- Link related issues using `Closes #123`
- Include screenshots for UI changes
- Ensure CI passes (lint + type check + tests)
- Keep PRs focused — one feature/fix per PR

## Reporting Bugs

Use the [Bug Report template](https://github.com/Akash1269/Gpa-Vpa/issues/new?template=bug_report.md) and include:
- Steps to reproduce
- Expected vs actual behavior
- Device/OS information
- Screenshots if applicable

## Requesting Features

Use the [Feature Request template](https://github.com/Akash1269/Gpa-Vpa/issues/new?template=feature_request.md) and describe:
- The problem you're trying to solve
- Your proposed solution
- Any alternatives considered

## Code of Conduct

Be respectful and constructive. We're all here to learn and build together.

---

Thank you for contributing! 🎉
