import {
  buildCustomSystem,
  customScaleFrom,
  isCustomScaleInput,
  validateCustomScale,
} from '../../utils/customScale';
import {
  calculateSemesterGpa,
  getAcademicStanding,
  getGradeColor,
} from '../../utils/gpaCalculator';
import { convertGradeLabel, getGradingSystem } from '../../utils/gradingSystems';
import { CustomScaleInput } from '../../types/gradingSystem';

const valid: CustomScaleInput = {
  name: 'My Uni',
  maxGpa: 10,
  grades: [
    { label: 'S', value: 10 },
    { label: 'A', value: 9 },
    { label: 'B', value: 8 },
    { label: 'C', value: 7 },
    { label: 'U', value: 0 },
  ],
};

const withGrades = (grades: CustomScaleInput['grades'], maxGpa = 10): CustomScaleInput => ({
  ...valid,
  maxGpa,
  grades,
});

describe('validateCustomScale', () => {
  it('accepts a normal scale', () => {
    expect(validateCustomScale(valid)).toBeNull();
  });

  it('rejects a bad maximum', () => {
    expect(validateCustomScale({ ...valid, maxGpa: NaN })).toMatch(/maximum/);
    expect(validateCustomScale({ ...valid, maxGpa: 0 })).toMatch(/maximum/);
    expect(validateCustomScale({ ...valid, maxGpa: -4 })).toMatch(/maximum/);
    expect(validateCustomScale({ ...valid, maxGpa: 101 })).toMatch(/maximum/);
  });

  it('needs at least two grades and no more than twenty', () => {
    expect(validateCustomScale(withGrades([{ label: 'A', value: 10 }]))).toMatch(/at least two/);
    const many = Array.from({ length: 21 }, (_, i) => ({
      label: `G${i}`,
      value: i === 0 ? 10 : 1,
    }));
    expect(validateCustomScale(withGrades(many))).toMatch(/at most 20/);
  });

  it('rejects empty, long and duplicate names', () => {
    expect(
      validateCustomScale(
        withGrades([
          { label: ' ', value: 10 },
          { label: 'B', value: 5 },
        ])
      )
    ).toMatch(/needs a name/);
    expect(
      validateCustomScale(
        withGrades([
          { label: 'ABCDE', value: 10 },
          { label: 'B', value: 5 },
        ])
      )
    ).toMatch(/at most 4/);
    expect(
      validateCustomScale(
        withGrades([
          { label: 'A', value: 10 },
          { label: 'A', value: 5 },
        ])
      )
    ).toMatch(/more than once/);
  });

  it('rejects points outside 0 to the maximum', () => {
    expect(
      validateCustomScale(
        withGrades([
          { label: 'A', value: 10 },
          { label: 'B', value: 11 },
        ])
      )
    ).toMatch(/between 0 and 10/);
    expect(
      validateCustomScale(
        withGrades([
          { label: 'A', value: 10 },
          { label: 'B', value: -1 },
        ])
      )
    ).toMatch(/between 0 and 10/);
    expect(
      validateCustomScale(
        withGrades([
          { label: 'A', value: 10 },
          { label: 'B', value: NaN },
        ])
      )
    ).toMatch(/between 0 and 10/);
  });

  it('requires the best grade to equal the maximum', () => {
    expect(
      validateCustomScale(
        withGrades([
          { label: 'A', value: 9 },
          { label: 'B', value: 5 },
        ])
      )
    ).toMatch(/worth the maximum/);
  });
});

describe('buildCustomSystem', () => {
  const system = buildCustomSystem(valid);

  it('derives the system fields', () => {
    expect(system.id).toBe('custom');
    expect(system.name).toBe('My Uni');
    expect(system.maxGpa).toBe(10);
    expect(system.scaleLabel).toBe('10');
    expect(system.hasPercentage).toBe(false);
    expect(system.defaultTargetGpa).toBe(8.5);
  });

  it('sorts grades best to worst and trims labels', () => {
    const shuffled = buildCustomSystem(
      withGrades([
        { label: ' C ', value: 7 },
        { label: 'S', value: 10 },
        { label: 'B', value: 8 },
      ])
    );
    expect(shuffled.grades.map((g) => g.label)).toEqual(['S', 'B', 'C']);
  });

  it('names an unnamed scale', () => {
    expect(buildCustomSystem({ ...valid, name: '   ' }).name).toBe('My scale');
  });

  it('formats a fractional maximum', () => {
    expect(
      buildCustomSystem({
        ...valid,
        maxGpa: 4.3,
        grades: [
          { label: 'A', value: 4.3 },
          { label: 'F', value: 0 },
        ],
      }).scaleLabel
    ).toBe('4.3');
  });

  it('has bands from highest to lowest ending at 0', () => {
    const mins = system.bands.map((b) => b.min);
    expect(mins).toEqual([9, 7.5, 6, 4, 0]);
  });

  it('works with the calculator', () => {
    const courses = [
      { id: '1', name: 'a', code: 'a', credits: 4, grade: 'S', semester: 'Fall', year: 2025 },
      { id: '2', name: 'b', code: 'b', credits: 2, grade: 'C', semester: 'Fall', year: 2025 },
    ];
    expect(calculateSemesterGpa(courses, system)).toBeCloseTo((40 + 14) / 6, 5);
    expect(getAcademicStanding(9.5, system).label).toBe('Excellent');
    expect(getGradeColor('U', false, system).text).toBe('#EA4335');
  });

  it('converts to and from the presets', () => {
    const india = getGradingSystem('india_10');
    expect(convertGradeLabel('O', india, system)).toBe('S'); // 10 -> 10
    expect(convertGradeLabel('S', system, getGradingSystem('us_4.0'))).toBe('A');
  });
});

describe('customScaleFrom / isCustomScaleInput', () => {
  it('starts from a preset without a name', () => {
    const input = customScaleFrom(getGradingSystem('india_10'));
    expect(input.name).toBe('');
    expect(input.maxGpa).toBe(10);
    expect(input.grades[0]).toEqual({ label: 'O', value: 10 });
  });

  it('keeps the name when starting from a custom system', () => {
    expect(customScaleFrom(buildCustomSystem(valid)).name).toBe('My Uni');
  });

  it('accepts valid stored data and rejects the rest', () => {
    expect(isCustomScaleInput(valid)).toBe(true);
    expect(isCustomScaleInput(null)).toBe(false);
    expect(isCustomScaleInput({ ...valid, grades: 'nope' })).toBe(false);
    expect(isCustomScaleInput({ ...valid, grades: [{ label: 1, value: 2 }] })).toBe(false);
    expect(
      isCustomScaleInput(
        withGrades([
          { label: 'A', value: 9 },
          { label: 'B', value: 5 },
        ])
      )
    ).toBe(false);
  });
});
