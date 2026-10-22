import { CustomScaleInput, GradingSystem, StandingBand } from '@/types/gradingSystem';

export const MAX_CUSTOM_GRADES = 20;
export const MAX_LABEL_LENGTH = 4; // grade chips are narrow

// Standing bands as a share of the maximum, since a custom scale has no official thresholds
const BAND_SHARES: { share: number; label: string; tone: StandingBand['tone'] }[] = [
  { share: 0.9, label: 'Excellent', tone: 'green' },
  { share: 0.75, label: 'Very Good', tone: 'blue' },
  { share: 0.6, label: 'Good', tone: 'yellow' },
  { share: 0.4, label: 'Pass', tone: 'orange' },
  { share: 0, label: 'Below Pass', tone: 'red' },
];

const formatNumber = (n: number) => String(Number(n.toFixed(2)));

// Returns a message describing the first problem, or null when the scale is usable
export const validateCustomScale = (input: CustomScaleInput): string | null => {
  if (!Number.isFinite(input.maxGpa) || input.maxGpa <= 0 || input.maxGpa > 100) {
    return 'The maximum must be a number above 0 and up to 100.';
  }
  if (input.grades.length < 2) return 'Add at least two grades.';
  if (input.grades.length > MAX_CUSTOM_GRADES) {
    return `Use at most ${MAX_CUSTOM_GRADES} grades.`;
  }

  const seen = new Set<string>();
  for (const grade of input.grades) {
    const label = grade.label.trim();
    if (!label) return 'Every grade needs a name, like A or O.';
    if (label.length > MAX_LABEL_LENGTH) {
      return `Grade names can be at most ${MAX_LABEL_LENGTH} characters ("${label}").`;
    }
    if (seen.has(label)) return `The grade "${label}" appears more than once.`;
    seen.add(label);

    if (!Number.isFinite(grade.value) || grade.value < 0 || grade.value > input.maxGpa) {
      return `"${label}" needs points between 0 and ${formatNumber(input.maxGpa)}.`;
    }
  }

  if (!input.grades.some((g) => g.value === input.maxGpa)) {
    return `Your best grade should be worth the maximum (${formatNumber(input.maxGpa)}).`;
  }
  return null;
};

// Build the full system from validated input. Call validateCustomScale first.
export const buildCustomSystem = (input: CustomScaleInput): GradingSystem => {
  const grades = input.grades
    .map((g) => ({ label: g.label.trim(), value: g.value, description: '' }))
    .sort((a, b) => b.value - a.value);

  return {
    id: 'custom',
    name: input.name.trim() || 'My scale',
    country: 'Custom',
    flag: '✏️',
    maxGpa: input.maxGpa,
    scaleLabel: formatNumber(input.maxGpa),
    hasPercentage: false,
    defaultTargetGpa: Math.round(input.maxGpa * 0.85 * 10) / 10,
    grades,
    creditOptions: [1, 2, 3, 4, 5, 6],
    degreeCredits: 120,
    bands: BAND_SHARES.map(({ share, label, tone }) => ({
      min: share === 0 ? 0 : Math.round(input.maxGpa * share * 100) / 100,
      label,
      tone,
    })),
  };
};

// A starting point for the editor from an existing system's grades
export const customScaleFrom = (system: GradingSystem): CustomScaleInput => ({
  name: system.id === 'custom' ? system.name : '',
  maxGpa: system.maxGpa,
  grades: system.grades.map((g) => ({ label: g.label, value: g.value })),
});

export const isCustomScaleInput = (value: unknown): value is CustomScaleInput => {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.name === 'string' &&
    typeof v.maxGpa === 'number' &&
    Array.isArray(v.grades) &&
    v.grades.every(
      (g) =>
        typeof g === 'object' &&
        g !== null &&
        typeof (g as Record<string, unknown>).label === 'string' &&
        typeof (g as Record<string, unknown>).value === 'number'
    ) &&
    validateCustomScale(v as unknown as CustomScaleInput) === null
  );
};
