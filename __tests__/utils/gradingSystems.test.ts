import {
  GRADING_SYSTEMS,
  GRADING_SYSTEM_LIST,
  convertGpa,
  convertGradeLabel,
  getGradingSystem,
  isGradingSystemId,
} from '../../utils/gradingSystems';
import {
  calculateCumulativeGpa,
  calculateGradeValue,
  calculateSemesterGpa,
  getAcademicStanding,
  getGradeColor,
} from '../../utils/gpaCalculator';
import { guessGradingSystem } from '../../utils/region';
import { Course } from '../../types/course';

const us = getGradingSystem('us_4.0');
const india = getGradingSystem('india_10');

const course = (grade: string | null, credits: number, id = `${grade}-${credits}`): Course => ({
  id,
  name: 'Course',
  code: 'X100',
  credits,
  grade,
  semester: 'Fall',
  year: 2025,
});

describe('grading system configs', () => {
  it.each(GRADING_SYSTEM_LIST)('$id is well formed', (system) => {
    // best to worst, with the top grade worth the maximum
    const values = system.grades.map((g) => g.value);
    expect(values).toEqual([...values].sort((a, b) => b - a));
    expect(values[0]).toBe(system.maxGpa);
    expect(new Set(system.grades.map((g) => g.label)).size).toBe(system.grades.length);

    // bands are searched in order and the last one must catch everything
    const mins = system.bands.map((b) => b.min);
    expect(mins).toEqual([...mins].sort((a, b) => b - a));
    expect(mins[mins.length - 1]).toBe(0);

    expect(system.defaultTargetGpa).toBeLessThanOrEqual(system.maxGpa);
    expect(system.creditOptions.length).toBeGreaterThan(0);
  });

  it('recognises valid ids only', () => {
    expect(isGradingSystemId('india_10')).toBe(true);
    expect(isGradingSystemId('us_4.0')).toBe(true);
    expect(isGradingSystemId('uk_percent')).toBe(false);
    expect(isGradingSystemId(null)).toBe(false);
  });

  it('is keyed by each system id', () => {
    Object.entries(GRADING_SYSTEMS).forEach(([key, system]) => expect(system.id).toBe(key));
  });
});

describe('India 10-point calculations', () => {
  it('maps the CBCS grades', () => {
    expect(calculateGradeValue('O', india)).toBe(10);
    expect(calculateGradeValue('A+', india)).toBe(9);
    expect(calculateGradeValue('P', india)).toBe(4);
    expect(calculateGradeValue('F', india)).toBe(0);
  });

  it('does not read a US-only grade as an Indian one', () => {
    expect(calculateGradeValue('A-', india)).toBe(0);
    expect(calculateGradeValue('O', us)).toBe(0);
  });

  it('keeps the same letter on different scales apart', () => {
    expect(calculateGradeValue('A', us)).toBe(4);
    expect(calculateGradeValue('A', india)).toBe(8);
  });

  it('calculates a credit-weighted SGPA', () => {
    // (10*4 + 8*3 + 6*2) / 9 = 76/9
    const courses = [course('O', 4), course('A', 3), course('B', 2)];
    expect(calculateSemesterGpa(courses, india)).toBeCloseTo(76 / 9, 5);
  });

  it('counts a failed course in the denominator', () => {
    expect(calculateCumulativeGpa([course('O', 3), course('F', 3)], india)).toBe(5);
  });

  it('ignores ungraded courses and handles an empty list', () => {
    expect(calculateSemesterGpa([course(null, 3), course('A', 3)], india)).toBe(8);
    expect(calculateSemesterGpa([], india)).toBe(0);
  });

  it('uses the US scale when no system is given', () => {
    expect(calculateSemesterGpa([course('A', 3)])).toBe(4);
  });
});

describe('standings and colours per system', () => {
  it('finds India standings at the band edges', () => {
    expect(getAcademicStanding(10, india).label).toBe('Outstanding');
    expect(getAcademicStanding(9, india).label).toBe('Outstanding');
    expect(getAcademicStanding(8.99, india).label).toBe('Excellent');
    expect(getAcademicStanding(6, india).label).toBe('Good');
    expect(getAcademicStanding(5, india).label).toBe('Average');
    expect(getAcademicStanding(4, india).label).toBe('Average');
    expect(getAcademicStanding(3.99, india).label).toBe('Below Average');
    expect(getAcademicStanding(0, india).label).toBe('Below Average');
  });

  it('judges the same number differently on each scale', () => {
    expect(getAcademicStanding(3.5, us).label).toBe('Very Good');
    expect(getAcademicStanding(3.5, india).label).toBe('Below Average');
    expect(getAcademicStanding(8.5, india).label).toBe('Excellent');
  });

  it('colours Indian grades by their own bands', () => {
    expect(getGradeColor('O', false, india).text).toBe('#34A853'); // green
    expect(getGradeColor('A', false, india).text).toBe('#4285F4'); // blue
    expect(getGradeColor('B', false, india).text).toBe('#FBBC04'); // yellow
    expect(getGradeColor('P', false, india).text).toBe('#FA7B17'); // orange
    expect(getGradeColor('F', false, india).text).toBe('#EA4335'); // red
  });

  it('has dark-mode colours for the Indian scale', () => {
    expect(getGradeColor('O', true, india).text).toBe('#81C995');
  });
});

describe('conversion between systems', () => {
  it('converts GPAs by share of the maximum', () => {
    expect(convertGpa(3.5, us, india)).toBe(8.75);
    expect(convertGpa(8.5, india, us)).toBe(3.4);
    expect(convertGpa(4, us, india)).toBe(10);
    expect(convertGpa(0, us, india)).toBe(0);
  });

  it('maps US grades to the closest Indian grade', () => {
    expect(convertGradeLabel('A', us, india)).toBe('O');
    expect(convertGradeLabel('A-', us, india)).toBe('A+'); // 9.25 -> 9
    expect(convertGradeLabel('C', us, india)).toBe('C'); // 5
    expect(convertGradeLabel('D', us, india)).toBe('P'); // 2.5 -> 4 is the lowest pass
  });

  it('rounds ties down so a conversion never flatters', () => {
    // US B = 3.0 -> 7.5, exactly between B+ (7) and A (8)
    expect(convertGradeLabel('B', us, india)).toBe('B+');
  });

  it('keeps a fail a fail in both directions', () => {
    expect(convertGradeLabel('F', us, india)).toBe('F');
    expect(convertGradeLabel('F', india, us)).toBe('F');
  });

  it('maps Indian grades to the closest US grade', () => {
    expect(convertGradeLabel('O', india, us)).toBe('A');
    expect(convertGradeLabel('A+', india, us)).toBe('A-'); // 3.6 -> 3.7
    expect(convertGradeLabel('P', india, us)).toBe('C-'); // 1.6 -> 1.7
  });

  it('falls back to the lowest grade for an unknown label', () => {
    expect(convertGradeLabel('Z', us, india)).toBe('F');
  });

  it('is the identity within one system', () => {
    us.grades.forEach((g) => expect(convertGradeLabel(g.label, us, us)).toBe(g.label));
    india.grades.forEach((g) => expect(convertGradeLabel(g.label, india, india)).toBe(g.label));
  });

  it('keeps a US -> India -> US round trip within 0.7 grade points', () => {
    // The Indian scale has fewer grades, so the trip is lossy; the lowest passing grades move most
    us.grades.forEach((g) => {
      const back = convertGradeLabel(convertGradeLabel(g.label, us, india), india, us);
      expect(Math.abs(calculateGradeValue(back, us) - g.value)).toBeLessThanOrEqual(0.7);
    });
  });
});

describe('guessGradingSystem', () => {
  it('picks India for Indian time zones', () => {
    expect(guessGradingSystem({ timeZone: 'Asia/Kolkata', locale: 'en-US' })).toBe('india_10');
    expect(guessGradingSystem({ timeZone: 'Asia/Calcutta' })).toBe('india_10');
  });

  it('picks India for an Indian locale region', () => {
    expect(guessGradingSystem({ locale: 'en-IN' })).toBe('india_10');
    expect(guessGradingSystem({ locale: 'hi_IN' })).toBe('india_10');
    expect(guessGradingSystem({ timeZone: 'UTC', locale: 'en-Latn-IN' })).toBe('india_10');
  });

  it('defaults to the US scale everywhere else', () => {
    expect(guessGradingSystem({ timeZone: 'America/New_York', locale: 'en-US' })).toBe('us_4.0');
    expect(guessGradingSystem({ timeZone: 'Europe/London', locale: 'en-GB' })).toBe('us_4.0');
    expect(guessGradingSystem({ locale: 'en' })).toBe('us_4.0');
    expect(guessGradingSystem({})).toBe('us_4.0');
  });

  it('does not mistake other regions that contain the letters "in"', () => {
    expect(guessGradingSystem({ locale: 'en-ID' })).toBe('us_4.0');
    expect(guessGradingSystem({ locale: 'fi-FI' })).toBe('us_4.0');
  });
});
