// CGPA -> percentage. Universities publish their own formula, so these are estimates:
// percentage = CGPA * multiplier + offset
export type PercentFormulaId = 'times_9_5' | 'times_10' | 'minus_0_75' | 'custom';

export type PercentFormula = {
  id: PercentFormulaId;
  multiplier: number;
  offset: number;
};

export const PERCENT_PRESETS: {
  id: Exclude<PercentFormulaId, 'custom'>;
  label: string;
  formula: PercentFormula;
}[] = [
  {
    id: 'times_9_5',
    label: 'CGPA × 9.5',
    formula: { id: 'times_9_5', multiplier: 9.5, offset: 0 },
  },
  {
    id: 'times_10',
    label: 'CGPA × 10',
    formula: { id: 'times_10', multiplier: 10, offset: 0 },
  },
  {
    id: 'minus_0_75',
    label: '(CGPA − 0.75) × 10',
    formula: { id: 'minus_0_75', multiplier: 10, offset: -7.5 },
  },
];

export const DEFAULT_PERCENT_FORMULA: PercentFormula = PERCENT_PRESETS[0].formula;

export const isPercentFormula = (value: unknown): value is PercentFormula => {
  if (typeof value !== 'object' || value === null) return false;
  const f = value as Record<string, unknown>;
  return (
    ['times_9_5', 'times_10', 'minus_0_75', 'custom'].includes(f.id as string) &&
    typeof f.multiplier === 'number' &&
    Number.isFinite(f.multiplier) &&
    typeof f.offset === 'number' &&
    Number.isFinite(f.offset)
  );
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const cgpaToPercent = (cgpa: number, formula: PercentFormula): number =>
  clamp(cgpa * formula.multiplier + formula.offset, 0, 100);

// Inverse, for turning a percentage goal into the CGPA needed
export const percentToCgpa = (
  percent: number,
  formula: PercentFormula,
  maxCgpa: number
): number => {
  if (formula.multiplier === 0) return 0;
  return clamp((percent - formula.offset) / formula.multiplier, 0, maxCgpa);
};

export const describeFormula = (formula: PercentFormula): string => {
  const preset = PERCENT_PRESETS.find((p) => p.id === formula.id);
  if (preset) return preset.label;
  const sign = formula.offset < 0 ? '−' : '+';
  const offset = formula.offset === 0 ? '' : ` ${sign} ${Math.abs(formula.offset)}`;
  return `CGPA × ${formula.multiplier}${offset}`;
};
