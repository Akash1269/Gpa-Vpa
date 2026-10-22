import {
  DEFAULT_PERCENT_FORMULA,
  PERCENT_PRESETS,
  PercentFormula,
  cgpaToPercent,
  describeFormula,
  isPercentFormula,
  percentToCgpa,
} from '../../utils/percentage';

const preset = (id: string): PercentFormula => PERCENT_PRESETS.find((p) => p.id === id)!.formula;

describe('cgpaToPercent', () => {
  it('multiplies by 9.5 by default', () => {
    expect(DEFAULT_PERCENT_FORMULA).toEqual(preset('times_9_5'));
    expect(cgpaToPercent(8, DEFAULT_PERCENT_FORMULA)).toBeCloseTo(76, 5);
    expect(cgpaToPercent(8.74, DEFAULT_PERCENT_FORMULA)).toBeCloseTo(83.03, 5);
  });

  it('supports the simple and offset formulas', () => {
    expect(cgpaToPercent(8.5, preset('times_10'))).toBeCloseTo(85, 5);
    expect(cgpaToPercent(8.5, preset('minus_0_75'))).toBeCloseTo(77.5, 5); // (8.5 - 0.75) * 10
  });

  it('supports a custom multiplier and offset', () => {
    const custom: PercentFormula = { id: 'custom', multiplier: 7.1, offset: 11 };
    expect(cgpaToPercent(8, custom)).toBeCloseTo(67.8, 5);
  });

  it('never goes below 0 or above 100', () => {
    expect(cgpaToPercent(0, preset('minus_0_75'))).toBe(0); // would be -7.5
    expect(cgpaToPercent(10, preset('times_10'))).toBe(100);
    expect(cgpaToPercent(10, { id: 'custom', multiplier: 12, offset: 0 })).toBe(100);
  });
});

describe('percentToCgpa', () => {
  it('inverts each preset', () => {
    PERCENT_PRESETS.forEach(({ formula }) => {
      expect(percentToCgpa(cgpaToPercent(8.2, formula), formula, 10)).toBeCloseTo(8.2, 5);
    });
  });

  it('stays within the scale', () => {
    expect(percentToCgpa(100, preset('times_9_5'), 10)).toBe(10); // 10.5 capped
    expect(percentToCgpa(0, preset('minus_0_75'), 10)).toBeCloseTo(0.75, 5); // 0% is CGPA 0.75 here
    expect(percentToCgpa(-10, preset('minus_0_75'), 10)).toBe(0); // would be -0.25
    expect(percentToCgpa(50, { id: 'custom', multiplier: 0, offset: 0 }, 10)).toBe(0);
  });
});

describe('describeFormula', () => {
  it('uses the preset label', () => {
    expect(describeFormula(preset('times_9_5'))).toBe('CGPA × 9.5');
    expect(describeFormula(preset('minus_0_75'))).toBe('(CGPA − 0.75) × 10');
  });

  it('writes out a custom formula', () => {
    expect(describeFormula({ id: 'custom', multiplier: 7.1, offset: 11 })).toBe('CGPA × 7.1 + 11');
    expect(describeFormula({ id: 'custom', multiplier: 10, offset: -5 })).toBe('CGPA × 10 − 5');
    expect(describeFormula({ id: 'custom', multiplier: 9, offset: 0 })).toBe('CGPA × 9');
  });
});

describe('isPercentFormula', () => {
  it('accepts valid formulas', () => {
    expect(isPercentFormula(preset('times_10'))).toBe(true);
    expect(isPercentFormula({ id: 'custom', multiplier: 8, offset: -2 })).toBe(true);
  });

  it('rejects malformed stored data', () => {
    expect(isPercentFormula(null)).toBe(false);
    expect(isPercentFormula('times_10')).toBe(false);
    expect(isPercentFormula({ id: 'nope', multiplier: 1, offset: 0 })).toBe(false);
    expect(isPercentFormula({ id: 'custom', multiplier: NaN, offset: 0 })).toBe(false);
    expect(isPercentFormula({ id: 'custom', multiplier: 1 })).toBe(false);
  });
});
