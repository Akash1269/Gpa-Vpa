import { GradingSystem, GradingSystemId } from '@/types/gradingSystem';

export const GRADING_SYSTEMS: Record<GradingSystemId, GradingSystem> = {
  'us_4.0': {
    id: 'us_4.0',
    name: 'US 4.0 scale',
    country: 'United States',
    flag: '🇺🇸',
    maxGpa: 4.0,
    scaleLabel: '4.0',
    defaultTargetGpa: 3.5,
    grades: [
      { label: 'A', value: 4.0, description: 'Excellent' },
      { label: 'A-', value: 3.7, description: 'Very good' },
      { label: 'B+', value: 3.3, description: 'Good' },
      { label: 'B', value: 3.0, description: 'Above average' },
      { label: 'B-', value: 2.7, description: 'Average' },
      { label: 'C+', value: 2.3, description: 'Satisfactory' },
      { label: 'C', value: 2.0, description: 'Fair' },
      { label: 'C-', value: 1.7, description: 'Below average' },
      { label: 'D+', value: 1.3, description: 'Poor' },
      { label: 'D', value: 1.0, description: 'Barely passing' },
      { label: 'F', value: 0.0, description: 'Fail' },
    ],
    creditOptions: [1, 2, 3, 4],
    degreeCredits: 120,
    bands: [
      { min: 3.7, label: 'Excellent', tone: 'green' },
      { min: 3.0, label: 'Very Good', tone: 'blue' },
      { min: 2.0, label: 'Satisfactory', tone: 'yellow' },
      { min: 1.0, label: 'Probation', tone: 'orange' },
      { min: 0, label: 'Academic Warning', tone: 'red' },
    ],
  },
  // UGC Choice Based Credit System. Individual universities vary; this is the common baseline.
  india_10: {
    id: 'india_10',
    name: 'India 10-point (CGPA)',
    country: 'India',
    flag: '🇮🇳',
    maxGpa: 10,
    scaleLabel: '10',
    defaultTargetGpa: 8.5,
    grades: [
      { label: 'O', value: 10, description: 'Outstanding' },
      { label: 'A+', value: 9, description: 'Excellent' },
      { label: 'A', value: 8, description: 'Very good' },
      { label: 'B+', value: 7, description: 'Good' },
      { label: 'B', value: 6, description: 'Above average' },
      { label: 'C', value: 5, description: 'Average' },
      { label: 'P', value: 4, description: 'Pass' },
      { label: 'F', value: 0, description: 'Fail' },
    ],
    creditOptions: [1, 2, 3, 4, 5, 6],
    degreeCredits: 140,
    bands: [
      { min: 9, label: 'Outstanding', tone: 'green' },
      { min: 8, label: 'Excellent', tone: 'blue' },
      { min: 6, label: 'Good', tone: 'yellow' },
      // 4 is the Pass grade, so a pass must not share a colour with a fail
      { min: 4, label: 'Average', tone: 'orange' },
      { min: 0, label: 'Below Average', tone: 'red' },
    ],
  },
};

export const DEFAULT_GRADING_SYSTEM_ID: GradingSystemId = 'us_4.0';

export const GRADING_SYSTEM_LIST: GradingSystem[] = [
  GRADING_SYSTEMS['us_4.0'],
  GRADING_SYSTEMS.india_10,
];

export const isGradingSystemId = (value: unknown): value is GradingSystemId =>
  typeof value === 'string' && value in GRADING_SYSTEMS;

export const getGradingSystem = (id: GradingSystemId = DEFAULT_GRADING_SYSTEM_ID): GradingSystem =>
  GRADING_SYSTEMS[id];

// Convert a GPA between scales by keeping the same share of the maximum (3.5/4 -> 8.75/10)
export const convertGpa = (value: number, from: GradingSystem, to: GradingSystem): number =>
  Math.round((value / from.maxGpa) * to.maxGpa * 100) / 100;

// Closest grade in `to` for a grade label in `from`. Ties go to the lower grade, so conversion never flatters.
export const convertGradeLabel = (
  label: string,
  from: GradingSystem,
  to: GradingSystem
): string => {
  const source = from.grades.find((g) => g.label === label);
  if (!source) return to.grades[to.grades.length - 1].label;
  if (source.value === 0) return to.grades[to.grades.length - 1].label; // a fail stays a fail

  const target = (source.value / from.maxGpa) * to.maxGpa;
  let best = to.grades[to.grades.length - 1];
  for (const option of to.grades) {
    if (option.value === 0) continue;
    const diff = Math.abs(option.value - target);
    const bestDiff = Math.abs(best.value - target);
    if (diff < bestDiff || (diff === bestDiff && option.value < best.value)) best = option;
  }
  return best.label;
};
