import {
  gradePoints,
  calculateGradeValue,
  calculateSemesterGpa,
  calculateCumulativeGpa,
  getAcademicStanding,
  getGradeColor,
} from '../../utils/gpaCalculator';
import { Course } from '../../types/course';

describe('gpaCalculator', () => {
  describe('gradePoints', () => {
    it('maps all standard grades correctly', () => {
      expect(gradePoints['A']).toBe(4.0);
      expect(gradePoints['A-']).toBe(3.7);
      expect(gradePoints['B+']).toBe(3.3);
      expect(gradePoints['B']).toBe(3.0);
      expect(gradePoints['B-']).toBe(2.7);
      expect(gradePoints['C+']).toBe(2.3);
      expect(gradePoints['C']).toBe(2.0);
      expect(gradePoints['C-']).toBe(1.7);
      expect(gradePoints['D+']).toBe(1.3);
      expect(gradePoints['D']).toBe(1.0);
      expect(gradePoints['F']).toBe(0.0);
    });
  });

  describe('calculateGradeValue', () => {
    it('returns correct value for valid grades', () => {
      expect(calculateGradeValue('A')).toBe(4.0);
      expect(calculateGradeValue('B+')).toBe(3.3);
      expect(calculateGradeValue('F')).toBe(0.0);
    });

    it('returns 0 for invalid/unknown grade', () => {
      expect(calculateGradeValue('X')).toBe(0);
      expect(calculateGradeValue('')).toBe(0);
    });
  });

  describe('calculateSemesterGpa', () => {
    it('returns 0 for empty courses array', () => {
      expect(calculateSemesterGpa([])).toBe(0);
    });

    it('calculates GPA for single course', () => {
      const courses: Course[] = [
        { id: '1', name: 'Math', code: 'MATH101', credits: 3, grade: 'A', semester: 'Fall', year: 2025 },
      ];
      expect(calculateSemesterGpa(courses)).toBe(4.0);
    });

    it('calculates weighted GPA for multiple courses', () => {
      const courses: Course[] = [
        { id: '1', name: 'Math', code: 'MATH101', credits: 3, grade: 'A', semester: 'Fall', year: 2025 },
        { id: '2', name: 'English', code: 'ENG101', credits: 3, grade: 'B', semester: 'Fall', year: 2025 },
      ];
      // (4.0*3 + 3.0*3) / (3+3) = 21/6 = 3.5
      expect(calculateSemesterGpa(courses)).toBe(3.5);
    });

    it('weighs by credit hours correctly', () => {
      const courses: Course[] = [
        { id: '1', name: 'Math', code: 'MATH101', credits: 4, grade: 'A', semester: 'Fall', year: 2025 },
        { id: '2', name: 'Lab', code: 'LAB101', credits: 1, grade: 'C', semester: 'Fall', year: 2025 },
      ];
      // (4.0*4 + 2.0*1) / (4+1) = 18/5 = 3.6
      expect(calculateSemesterGpa(courses)).toBe(3.6);
    });

    it('handles all F grades', () => {
      const courses: Course[] = [
        { id: '1', name: 'Math', code: 'MATH101', credits: 3, grade: 'F', semester: 'Fall', year: 2025 },
        { id: '2', name: 'English', code: 'ENG101', credits: 3, grade: 'F', semester: 'Fall', year: 2025 },
      ];
      expect(calculateSemesterGpa(courses)).toBe(0);
    });
  });

  describe('calculateCumulativeGpa', () => {
    it('returns 0 for empty courses array', () => {
      expect(calculateCumulativeGpa([])).toBe(0);
    });

    it('calculates across multiple semesters', () => {
      const courses: Course[] = [
        { id: '1', name: 'Math', code: 'MATH101', credits: 3, grade: 'A', semester: 'Fall', year: 2025 },
        { id: '2', name: 'English', code: 'ENG101', credits: 3, grade: 'B', semester: 'Spring', year: 2026 },
      ];
      // (4.0*3 + 3.0*3) / (3+3) = 3.5
      expect(calculateCumulativeGpa(courses)).toBe(3.5);
    });
  });

  describe('getAcademicStanding', () => {
    it('returns Excellent for GPA >= 3.7', () => {
      expect(getAcademicStanding(4.0).label).toBe('Excellent');
      expect(getAcademicStanding(3.7).label).toBe('Excellent');
    });

    it('returns Very Good for GPA >= 3.0 and < 3.7', () => {
      expect(getAcademicStanding(3.5).label).toBe('Very Good');
      expect(getAcademicStanding(3.0).label).toBe('Very Good');
    });

    it('returns Satisfactory for GPA >= 2.0 and < 3.0', () => {
      expect(getAcademicStanding(2.5).label).toBe('Satisfactory');
      expect(getAcademicStanding(2.0).label).toBe('Satisfactory');
    });

    it('returns Probation for GPA >= 1.0 and < 2.0', () => {
      expect(getAcademicStanding(1.5).label).toBe('Probation');
      expect(getAcademicStanding(1.0).label).toBe('Probation');
    });

    it('returns Academic Warning for GPA < 1.0', () => {
      expect(getAcademicStanding(0.5).label).toBe('Academic Warning');
      expect(getAcademicStanding(0).label).toBe('Academic Warning');
    });

    it('returns appropriate colors', () => {
      expect(getAcademicStanding(4.0).color).toBe('#34A853');
      expect(getAcademicStanding(3.0).color).toBe('#4285F4');
      expect(getAcademicStanding(2.0).color).toBe('#FBBC04');
      expect(getAcademicStanding(1.0).color).toBe('#FA7B17');
      expect(getAcademicStanding(0).color).toBe('#EA4335');
    });
  });

  describe('getGradeColor', () => {
    it('returns green colors for A grades', () => {
      const color = getGradeColor('A');
      expect(color.text).toBe('#34A853');
      expect(color.background).toBe('#E6F4EA');
    });

    it('returns blue colors for B grades', () => {
      const color = getGradeColor('B');
      expect(color.text).toBe('#4285F4');
      expect(color.background).toBe('#E8F0FE');
    });

    it('returns yellow colors for C grades', () => {
      const color = getGradeColor('C');
      expect(color.text).toBe('#FBBC04');
      expect(color.background).toBe('#FEF7E0');
    });

    it('returns orange colors for D grades', () => {
      const color = getGradeColor('D');
      expect(color.text).toBe('#FA7B17');
      expect(color.background).toBe('#FEF0E6');
    });

    it('returns red colors for F grade', () => {
      const color = getGradeColor('F');
      expect(color.text).toBe('#EA4335');
      expect(color.background).toBe('#FCE8E6');
    });

    it('accepts numeric grade values', () => {
      const color = getGradeColor(4.0);
      expect(color.text).toBe('#34A853');
    });
  });
});
