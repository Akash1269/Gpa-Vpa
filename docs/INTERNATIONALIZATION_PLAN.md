# Internationalization Plan — Multi-Country Grading System Support

> **Status:** Phase 1 is partly shipped. The app has a data-driven grading engine with the US 4.0 and India 10-point (UGC CBCS) scales, a user-defined custom scale, a CGPA-to-percentage estimate for the Indian scale, and a first-launch prompt that suggests a scale from the device time zone and region (no location access). The UK, European and other systems below are not built yet.

## Current State

| Dimension | Current Implementation |
|-----------|----------------------|
| Grading Scale | US 4.0 only (A through F, 11 grades) |
| Term Types | Semester (Fall / Spring / Summer) |
| Credit Range | 1–4 per course |
| Academic Standing | US thresholds (Dean's List 3.7, Good 3.0, Probation <2.0) |
| Pass/Fail | Not supported |
| Course Retakes | Not handled |
| Degree Targets | Manual entry in Goal Calculator |

---

## Target Countries & Systems

### Priority 1 — High Demand
| Country/Region | Scale | Credits | Term |
|----------------|-------|---------|------|
| **United States** (current) | 4.0 (A–F) | 1–4 per course, 120 for degree | Semester / Quarter |
| **India (CBCS)** | 10-point (O–F) | 1–6 per course, 132–180 for degree | Semester |
| **United Kingdom** | Percentage (0–100%) with Classifications | CATS 10–60 per module | Trimester |

### Priority 2 — European Expansion
| Country/Region | Scale | Credits | Term |
|----------------|-------|---------|------|
| **Germany** | 1.0–5.0 (inverted, 1.0 = best) | ECTS 1–30 | Semester |
| **France** | 0–20 numeric | ECTS 1–30 | Semester |
| **Italy** | 18–30 numeric | ECTS 1–30 | Semester |

### Priority 3 — Emerging Markets
| Country/Region | Scale | Credits | Term |
|----------------|-------|---------|------|
| **Chile** | 1.0–7.0 numeric | CLAR | Semester |
| **Mexico** | 1–10 or 0–100 | CLAR | Semester |
| **Canada** | 4.0 or 4.3 (with A+ = 4.3 variant) | Same as US | Semester / Trimester |

---

## Implementation Phases

### Phase 1: Configurable Grading Engine (v0.3.0)

**Goal:** Make the GPA calculation system data-driven instead of hardcoded.

#### Data Model — `types/gradingSystem.ts`

```typescript
export type GradingSystemId =
  | 'us_4.0'
  | 'india_10'
  | 'uk_percent'
  | 'germany_5'
  | 'france_20'
  | 'italy_30'
  | 'chile_7'
  | 'mexico_10'
  | 'custom';

export type TermType = 'semester' | 'trimester' | 'quarter' | 'block';

export interface GradeOption {
  label: string;           // Display: "A", "O", "1.0", "70%"
  value: number;           // Grade points: 4.0, 10, 1.0, 70
  description?: string;    // "Outstanding", "Sehr Gut"
}

export interface GradingSystem {
  id: GradingSystemId;
  name: string;            // "US 4.0 Scale"
  country: string;         // "United States"
  maxGpa: number;          // 4.0, 10, 5.0, 20, 30, 7.0
  minPass: number;         // 1.0 (D), 4 (P), 4.0 (DE), 10 (FR)
  isInverted: boolean;     // true for Germany (lower = better)
  grades: GradeOption[];
  creditRange: { min: number; max: number };  // {1, 4} or {1, 30}
  defaultTermType: TermType;
  degreeCredits: {
    bachelor: number;      // 120, 180, 360, etc.
    master?: number;
  };
  standings: StandingThreshold[];
}

export interface StandingThreshold {
  label: string;           // "Dean's List", "First-Class Honours"
  min: number;             // Lower bound
  max: number;             // Upper bound
}
```

#### Grading Scale Definitions — `utils/gradingScales.ts`

Define all supported systems as static config objects:

```typescript
export const GRADING_SCALES: Record<GradingSystemId, GradingSystem> = {
  'us_4.0': {
    id: 'us_4.0',
    name: 'US 4.0 Scale',
    country: 'United States',
    maxGpa: 4.0,
    minPass: 1.0,
    isInverted: false,
    grades: [
      { label: 'A', value: 4.0, description: 'Excellent' },
      { label: 'A-', value: 3.7, description: 'Very Good' },
      // ... existing grades
    ],
    creditRange: { min: 1, max: 6 },
    defaultTermType: 'semester',
    degreeCredits: { bachelor: 120, master: 36 },
    standings: [
      { label: "Dean's List", min: 3.7, max: 4.0 },
      { label: 'Good Standing', min: 2.0, max: 3.69 },
      { label: 'Academic Probation', min: 0, max: 1.99 },
    ],
  },
  'india_10': {
    id: 'india_10',
    name: 'India 10-Point (UGC CBCS)',
    country: 'India',
    maxGpa: 10,
    minPass: 4,
    isInverted: false,
    grades: [
      { label: 'O', value: 10, description: 'Outstanding' },
      { label: 'A+', value: 9, description: 'Excellent' },
      { label: 'A', value: 8, description: 'Very Good' },
      { label: 'B+', value: 7, description: 'Good' },
      { label: 'B', value: 6, description: 'Above Average' },
      { label: 'C', value: 5, description: 'Average' },
      { label: 'P', value: 4, description: 'Pass' },
      { label: 'F', value: 0, description: 'Fail' },
    ],
    creditRange: { min: 1, max: 8 },
    defaultTermType: 'semester',
    degreeCredits: { bachelor: 140, master: 80 },
    standings: [
      { label: 'Outstanding', min: 9.0, max: 10 },
      { label: 'Excellent', min: 8.0, max: 8.99 },
      { label: 'Good', min: 6.0, max: 7.99 },
      { label: 'Average', min: 5.0, max: 5.99 },
      { label: 'Below Average', min: 0, max: 4.99 },
    ],
  },
  // ... other systems
};
```

#### Changes to Existing Files

| File | Change |
|------|--------|
| `context/GpaContext.tsx` | Add `gradingSystem` to state, persist selection to AsyncStorage |
| `utils/gpaCalculator.ts` | Accept `GradingSystem` param instead of using hardcoded `gradePoints` |
| `components/GradePicker.tsx` | Read grade options from active system instead of static list |
| `components/CreditPicker.tsx` | Use `creditRange` from active system |
| `app/(tabs)/settings.tsx` | Add "Grading System" selector |
| `app/(tabs)/index.tsx` | Display GPA out of `maxGpa` (e.g., "8.5 / 10") |

---

### Phase 2: Term Types & Credit Flexibility (v0.4.0)

**Goal:** Support all academic calendar formats and credit ranges.

#### Changes

1. **Semester type selection in Settings**
   - Options: Semester / Trimester / Quarter / Block
   - Affects: semester picker labels, year planning in Goal Calculator

2. **Dynamic credit picker**
   - US: 1–6 (typical range)
   - ECTS: 1–30 (allow half-credits)
   - CATS: 10–60 (in steps of 10)
   - India: 1–8

3. **Update `SemesterYearPicker.tsx`**
   - Quarter system: Fall / Winter / Spring / Summer
   - Trimester: Term 1 / Term 2 / Term 3
   - Block: Block 1–8

4. **Goal Calculator presets**
   - Auto-populate degree credit target from selected system
   - US → 120, ECTS → 180, CATS → 360, India → 140

---

### Phase 3: Country Presets & Onboarding (v0.5.0)

**Goal:** One-tap setup for new users based on their country.

#### Onboarding Flow Update

```
Welcome → "Where do you study?"
  → [🇺🇸 United States]  [🇮🇳 India]  [🇬🇧 United Kingdom]
  → [🇩🇪 Germany]  [🇫🇷 France]  [🇮🇹 Italy]
  → [🇨🇱 Chile]  [🇲🇽 Mexico]  [🇨🇦 Canada]
  → [Custom / Other]
```

Selection auto-configures:
- Grading scale
- Term type
- Credit range
- Academic standing thresholds
- Degree credit target
- Display format (GPA vs CGPA vs Percentage)

#### GPA Conversion Tool (Settings or standalone screen)
- Input: Grade + source system
- Output: Equivalent in target system
- Example: "8.5/10 (India) ≈ 3.4/4.0 (US)"
- Useful for students applying abroad

---

### Phase 4: Advanced Features (v0.6.0+)

| Feature | Description |
|---------|-------------|
| **Pass/Fail courses** | Grade type toggle: Graded / Pass-Fail. P/F excluded from GPA, counted in credits |
| **Course retakes** | Link retake to original course, replace grade in CGPA, keep transcript history |
| **Weighted vs. unweighted** | Some schools weight honors/AP courses differently |
| **UK Classifications display** | Show "Predicted: Upper Second (2:1)" instead of numeric GPA |
| **Germany inverted display** | Lower is better — flip all progress indicators and color coding |
| **Custom scale builder** | User defines own letter grades + point values for unsupported institutions |

---

## Migration Strategy

For existing users upgrading:
1. Default to `us_4.0` (preserves current behavior exactly)
2. Show one-time prompt: "We now support multiple grading systems! Want to change yours?"
3. If user switches system, existing courses keep their stored grade labels — only new calculations use the new scale
4. Provide "Re-map grades" option if switching systems with existing data

---

## Data Storage Schema Update

```typescript
// AsyncStorage keys
'@gpa_grading_system': GradingSystemId    // 'us_4.0' | 'india_10' | ...
'@gpa_term_type': TermType                // 'semester' | 'quarter' | ...
'@gpa_custom_scale': GradingSystem | null  // Only if 'custom' selected
```

Course type updated:
```typescript
interface Course {
  id: string;
  name: string;
  grade: string;        // Grade label: "A", "O", "1.3", "70"
  credits: number;      // Now supports wider range
  semester: string;
  year: number;
  isPassFail?: boolean; // Phase 4
  isRetake?: boolean;   // Phase 4
  originalCourseId?: string; // Phase 4 — links to retaken course
}
```

---

## Testing Considerations

| Test Scenario | Validation |
|---------------|-----------|
| GPA calculation with each supported scale | Output matches hand-calculated expected values |
| Inverted scale (Germany) | 1.0 = best, color coding flipped |
| Zero courses per system | No division by zero, shows 0.0 / maxGpa |
| System switching with existing data | Grades preserved, calculations use new scale |
| Credit range boundaries | Cannot exceed system max, cannot go below 1 |
| Goal Calculator with different targets | 120 (US), 180 (ECTS), 360 (CATS), 140 (India) |
| Pass/Fail exclusion | P/F courses add credits but don't affect GPA |

---

## Success Metrics

- **Phase 1 shipped:** App usable for Indian & UK students (covers 2nd and 3rd largest English-speaking student populations)
- **Downloads growth:** Target 3x with India CBCS support (massive student population)
- **Retention:** Students who select their correct system should have higher 30-day retention
- **Store listing:** Can target country-specific keywords ("CGPA calculator India", "UK degree classification tracker")

---

## Timeline Estimate

| Phase | Version | Scope |
|-------|---------|-------|
| Phase 1 | v0.3.0 | Grading engine + India + UK + Settings picker |
| Phase 2 | v0.4.0 | Term types + credit flexibility + Goal Calculator presets |
| Phase 3 | v0.5.0 | Country presets + onboarding update + conversion tool |
| Phase 4 | v0.6.0+ | Pass/Fail, retakes, custom scales, advanced features |
