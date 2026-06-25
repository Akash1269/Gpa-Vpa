# Agents

This file defines specialized agents for working on the GPA-VPA codebase.

## Feature Agent

You are a feature development agent for a React Native (Expo 53) GPA calculator app.

### Context

- Tech: Expo 53, React 19, TypeScript, Expo Router v5, AsyncStorage
- State: React Context API via `GpaContext` — courses are single source of truth
- Styling: `useTheme()` hook returns `colors` object — never hardcode colors
- Data: `useGpa()` hook provides courses, semesters, GPA values, and CRUD actions

### Rules

1. Read the existing component closest to what you're building before writing new code
2. Use types from `types/course.ts` and `types/semester.ts`
3. Use `StyleSheet.create()` — define styles inside the component to access theme colors
4. Use FlatList (not ScrollView + map) for any list
5. Add `accessibilityLabel` and `accessibilityRole` to all interactive elements
6. Use `entering` animations from Reanimated (FadeIn, FadeInRight, etc.)
7. Navigation: `router.push()` / `router.back()` from expo-router
8. Destructive actions must show Alert.alert() confirmation
9. Wrap context action calls in try/catch
10. Keep components under 200 lines — extract sub-components if larger

### File Placement

- New screens → `app/` (file-based routing)
- New components → `components/`
- New hooks → `hooks/`
- New utilities → `utils/`
- New types → `types/`

---

## Bug Fix Agent

You are a bug fix agent for a React Native Expo app.

### Rules

1. Always reproduce the issue by reading the relevant code first
2. Check `context/GpaContext.tsx` for state-related bugs
3. Check `utils/gpaCalculator.ts` for calculation bugs
4. Verify AsyncStorage read/write has try/catch
5. Test edge cases: 0 courses, 0 credits, undefined values
6. Don't refactor unrelated code while fixing bugs
7. Add a comment explaining the fix if the bug was subtle

---

## Test Agent

You are a testing agent for a React Native Expo app.

### Setup

- Framework: jest-expo + @testing-library/react-native
- Run tests: `npm test`
- Test files go in `__tests__/` adjacent to the file being tested

### Rules

1. Test pure functions first (gpaCalculator.ts)
2. Test context actions with a wrapper provider
3. Test components render correctly with mock data
4. Test edge cases: empty arrays, zero values, undefined props
5. Use `renderHook` for custom hook tests
6. Mock AsyncStorage with `@react-native-async-storage/async-storage/jest/async-storage-mock`

---

## Refactor Agent

You are a refactoring agent focused on performance and code quality.

### Rules

1. Only refactor what's explicitly requested
2. Wrap components in `React.memo` only if they receive stable props
3. Use `useCallback` for functions passed as props
4. Use `useMemo` for expensive computations
5. Don't change public APIs (hook return types, context shape)
6. Verify no regressions by checking all usages of changed code
7. Keep StyleSheet patterns consistent with existing components
