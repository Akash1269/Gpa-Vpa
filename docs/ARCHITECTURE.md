# Architecture

## Overview

GPA-VPA follows a **Context-driven architecture** with derived state, file-based routing, and local persistence. Courses are the single source of truth — all other data (semesters, GPAs, standings) is computed in real-time.

## Component Hierarchy

```
RootLayout (app/_layout.tsx)
├── GestureHandlerRootView
├── GpaProvider (context wrapper)
└── StackNavigator
    ├── Tabs Layout (app/(tabs)/_layout.tsx)
    │   ├── Dashboard (index.tsx)
    │   │   ├── GpaCard
    │   │   ├── SemesterProgress
    │   │   └── RecentCoursesList → CourseCard[]
    │   │
    │   ├── Courses (courses.tsx)
    │   │   ├── SearchInput
    │   │   ├── SemesterFilter
    │   │   ├── FlatList → CourseCard[]
    │   │   ├── FAB
    │   │   └── EmptyState
    │   │
    │   ├── Academic Record (academic-record.tsx)
    │   │   ├── GpaChart
    │   │   ├── SemesterCard[]
    │   │   └── EmptyState
    │   │
    │   └── Settings (settings.tsx)
    │
    ├── Course Detail (course/[id].tsx) — Modal
    │   ├── GradePicker
    │   ├── CreditPicker
    │   └── SemesterYearPicker
    │
    └── Semester Detail (semester/[id].tsx)
        ├── SemesterCard
        ├── FlatList → CourseCard[]
        └── FAB
```

## State Management

### Context API (`context/GpaContext.tsx`)

The app uses React Context as a global store. A single `GpaProvider` wraps the entire app in the root layout.

**State:**

| Field | Type | Description |
|-------|------|-------------|
| `courses` | `Course[]` | Master array — single source of truth |
| `semesters` | `Semester[]` | Derived groupings with calculated GPAs |
| `cumulativeGpa` | `number` | Weighted average across all courses |
| `totalCredits` | `number` | Sum of all course credits |
| `recentCourses` | `Course[]` | Top 5 most recent courses |
| `currentSemester` | `Semester \| null` | Most recent semester |

**Actions (useCallback):**

| Action | Description |
|--------|-------------|
| `addCourse(course)` | Insert new course |
| `updateCourse(course)` | Update existing course by ID |
| `deleteCourse(id)` | Remove course by ID |
| `getCourse(id)` | Retrieve single course |
| `getSemester(id)` | Retrieve semester by "semester-year" key |
| `clearAllData()` | Reset storage and state |

### Custom Hooks

| Hook | Location | Purpose |
|------|----------|---------|
| `useGpa()` | `hooks/useGpa.ts` | Access GpaContext (courses, semesters, GPA, actions) |
| `useTheme()` | `hooks/useTheme.ts` | Access theme mode, colors, and toggle |
| `useFrameworkReady()` | `hooks/useFrameworkReady.ts` | Signal framework readiness on mount |

## Data Flow

### Write Flow (Add/Edit Course)

```
Course Form → handleSave()
  → Validation (name & code required)
  → addCourse() / updateCourse() via context
  → setCourses() triggers re-render
  → useEffect: group courses into semesters
  → useEffect: recalculate all GPAs
  → useEffect: persist to AsyncStorage
  → Components re-render with updated data
```

### Read Flow (App Startup)

```
App Mount → GpaProvider renders
  → useEffect: AsyncStorage.getItem('courses')
  → setCourses(parsed data)
  → useEffect: process semesters (group + calculate)
  → Context values available to all consumers
  → Components render via useGpa() hook
```

### Navigation Flow

```
Course List → Tap Card → router.push('/course/{id}') → Modal
Semester List → Tap Card → router.push('/semester/{semester-year}')
Dashboard → "View Details" → router.push('/semester/{semester-year}')
Courses → FAB → router.push('/course/new')
```

## Data Model

### Course (`types/course.ts`)

```typescript
{
  id: string;          // Unique identifier
  name: string;        // Course title
  code: string;        // Course code (e.g., CS101)
  credits: number;     // 1–4 credit hours
  grade: string;       // Letter grade (A through F)
  semester: string;    // Fall | Spring | Summer
  year: number;        // Enrollment year
}
```

### Semester (`types/semester.ts`)

```typescript
{
  semester: string;    // Season string
  year: number;        // Year
  courses: Course[];   // Courses in this semester
  gpa: number;         // Calculated semester GPA
}
```

## Navigation

**Router:** Expo Router v5 (file-based routing)

| Route | Presentation | Animation |
|-------|-------------|-----------|
| `(tabs)/` | Tab navigator | Default |
| `course/[id]` | Modal | slide_from_bottom |
| `semester/[id]` | Screen | slide_from_right |
| `+not-found` | Screen | Default |

**Tab Bar:** 4 tabs — Dashboard, Courses, Academic Record, Settings (themed styling, Lucide icons)

## Theming

### Theme Hook (`hooks/useTheme.ts`)

- Supports `light`, `dark`, and `system` modes
- System mode respects device preference via `useColorScheme()`
- Toggle function switches between light/dark manually
- Returns `{ isDark, colors, toggleTheme }`

### Color Palette

| Token | Light | Dark |
|-------|-------|------|
| background | #F8F9FA | #121212 |
| card | #FFFFFF | #1E1E1E |
| text | #212529 | #E9ECEF |
| textSecondary | #6C757D | #ADB5BD |
| border | #E9ECEF | #2C2C2C |
| primary | #1A73E8 | #8AB4F8 |
| primaryLight | #E8F0FE | #174EA6 |
| success | #34A853 | #81C995 |
| warning | #FBBC04 | #FDD663 |
| error | #EA4335 | #F28B82 |

### Implementation

Each component consumes `useTheme()` and applies colors from the `colors` object to `StyleSheet`. Styles are created inside the component to access dynamic color values.

## Storage & Persistence

| Technology | AsyncStorage (`@react-native-async-storage/async-storage`) |
|---|---|
| **Storage Key** | `'courses'` (JSON stringified array) |
| **Persistence Timing** | Automatic save when courses array changes |
| **Hydration** | Loads on app startup before rendering |
| **Error Handling** | try-catch with console.error logging |
| **Reset** | `clearAllData()` removes key from storage |

## GPA Calculation (`utils/gpaCalculator.ts`)

### Grade Point Mapping

```
A=4.0, A-=3.7, B+=3.3, B=3.0, B-=2.7,
C+=2.3, C=2.0, C-=1.7, D+=1.3, D=1.0, F=0.0
```

### Calculation

- **Semester GPA** = Σ(grade_value × credits) / Σ(credits) for courses in that semester
- **Cumulative GPA** = Σ(grade_value × credits) / Σ(credits) for all courses
- Returns 0 when no courses exist (divide-by-zero guard)

### Academic Standing

Determined by cumulative GPA value — mapped to color and label for UI display.

## Performance

| Strategy | Implementation |
|----------|---------------|
| FlatList | Used for all lists with `keyExtractor` |
| useCallback | All context actions memoized |
| useMemo | Theme `isDark` computation |
| Lazy derivation | Semesters recalculated only when courses change |
| Single storage blob | One AsyncStorage key for all courses |
| StyleSheet | Created per-component to avoid object recreation |

## Error Handling & Validation

- **Course form:** Name and code required (Alert on submit)
- **Delete:** Confirmation dialog before destructive action
- **Clear data:** Confirmation alert with destructive styling
- **Storage:** try-catch blocks around all AsyncStorage calls
- **Null safety:** `getCourse` / `getSemester` return undefined if not found; screens show fallback UI

## Dependencies

| Package | Role |
|---------|------|
| `expo-router` | File-based routing & navigation |
| `@react-native-async-storage/async-storage` | Data persistence |
| `react-native-reanimated` | Animations |
| `lucide-react-native` | Icons |
| `@expo-google-fonts/inter` | Typography |
| `@react-native-picker/picker` | Native picker UI |
| `react-native-gesture-handler` | Touch gestures |
| `react-native-safe-area-context` | Safe area insets |
| `expo-linear-gradient` | Gradient backgrounds |
