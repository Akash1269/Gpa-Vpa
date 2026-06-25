# Features

## Dashboard (Home Tab)

- **Cumulative GPA Display** — Large, prominent GPA card (4.0 scale) with progress bar
- **Academic Standing Badge** — Color-coded status indicator (Excellent / Very Good / Satisfactory / Probation / Academic Warning)
- **Quick Statistics** — Total credits and current semester course count
- **Current Semester Overview** — Shows the most recent semester with its GPA and top courses (first 3 courses + "+N more" indicator)
- **Recent Courses List** — Displays up to 5 most recent courses across all semesters
- **Welcome Message** — Personalized greeting with app name

## Courses Tab

- **Course Listing** — Filterable and searchable view of all courses with grade and credit info
- **Search Functionality** — Real-time search by course name or course code
- **Semester Filter** — Expandable animated filter panel to view courses by semester (with "All Semesters" option)
- **Course Cards** — Display course name, code, semester/year, grade (color-coded circle), and credits
- **Floating Action Button** — Add new course button positioned bottom-right
- **Empty State** — Helpful message when no courses exist
- **Animated Filter Panel** — Smooth transitions using React Native Reanimated

## Academic Record Tab

- **Cumulative GPA Summary** — Two-column summary cards showing GPA and total credits
- **GPA Progression Chart** — Bar chart showing GPA trends across all semesters (staggered animation)
- **Semester Cards** — Complete semester history with:
  - Semester/year title
  - Semester GPA (color-coded badge)
  - Number of courses and credit hours
  - Footer with "View Details" navigation
- **Chronological Display** — Most recent semester first
- **Empty State** — Shows when no data exists

## Course Detail Screen (Modal)

- **Add/Edit Course** — Full course form with validation
- **Form Fields**:
  - Course Name (required text input)
  - Course Code (required text input)
  - Grade Picker — Horizontal scrollable selector (A, A-, B+, B, B-, C+, C, C-, D+, D, F)
  - Credit Hours Picker — Inline picker for 1–4 credits
  - Semester & Year — Native Picker for semester (Fall/Spring/Summer) and year (10-year range)
- **Grade Value Display** — Shows calculated grade point value (0–4.0)
- **Save Button** — Saves course and navigates back
- **Delete Button** — Only shown in edit mode with confirmation dialog
- **Close Button** — Navigate away without saving

## Semester Detail Screen

- **Semester Summary Card** — Title, GPA, course count, total credits
- **Courses List** — All courses in that semester as tappable cards
- **Floating Action Button** — Add course button with semester/year pre-filled
- **Empty State** — Shows when semester has no courses
- **Navigation** — Tap semester cards from Academic Record or Dashboard to view

## Settings Tab

- **Dark Theme Toggle** — Switch between light and dark modes
- **Hide Grades Option** — Privacy toggle to obscure grades in UI
- **Help & FAQ** — Built-in help dialog with usage instructions
- **About** — App version and description (v1.0.0)
- **Clear All Data** — Destructive action with confirmation dialog to reset all app data
- **Platform-specific UI** — Different styling for iOS vs Android

## GPA Calculation

### Grade Point Scale

| Grade | Points |
|-------|--------|
| A     | 4.0    |
| A-    | 3.7    |
| B+    | 3.3    |
| B     | 3.0    |
| B-    | 2.7    |
| C+    | 2.3    |
| C     | 2.0    |
| C-    | 1.7    |
| D+    | 1.3    |
| D     | 1.0    |
| F     | 0.0    |

### Formulas

**Semester GPA:**
```
Semester GPA = Σ(grade_value × credits) / Σ(credits)
```

**Cumulative GPA:**
```
Cumulative GPA = Σ(all grade_value × credits) / Σ(all credits)
```

### Academic Standing

| Standing          | GPA Range | Color  |
|-------------------|-----------|--------|
| Excellent         | ≥ 3.7     | Green  |
| Very Good         | ≥ 3.0     | Blue   |
| Satisfactory      | ≥ 2.0     | Yellow |
| Probation         | ≥ 1.0     | Orange |
| Academic Warning  | < 1.0     | Red    |

## UX Patterns

- **Empty States** — Custom component with icon, title, and message
- **Floating Action Button** — Fixed positioning with elevation shadow for "Add Course"
- **Color Coding** — Grades and GPAs use a consistent color system for quick scanning
- **Touch Feedback** — Cards use TouchableOpacity for press feedback
- **Confirmation Dialogs** — Destructive actions (delete course, clear data) use Alert.alert()
- **Animated Transitions** — FadeIn, FadeInRight, FadeInDown, FadeInUp with staggered delays

## Animations

| Element | Animation | Duration |
|---------|-----------|----------|
| GPA Card | FadeIn | 800ms |
| Course Cards | FadeInRight | 300ms + 100ms stagger |
| Semester Cards | FadeInDown | 300ms + 100ms stagger |
| Chart Bars | FadeInUp | Staggered 100ms delays |
| Filter Panel | FadeIn/FadeOut | 200ms |
| Course Modal | slide_from_bottom | Native |
| Semester Detail | slide_from_right | Native |
