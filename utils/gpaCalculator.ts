import { Course } from '@/types/course';

// Grade point values based on a 4.0 scale
export const gradePoints: Record<string, number> = {
  A: 4.0,
  'A-': 3.7,
  'B+': 3.3,
  B: 3.0,
  'B-': 2.7,
  'C+': 2.3,
  C: 2.0,
  'C-': 1.7,
  'D+': 1.3,
  D: 1.0,
  F: 0.0,
};

// Calculate the numeric value for a letter grade
export const calculateGradeValue = (grade: string): number => {
  return gradePoints[grade] || 0;
};

// Calculate GPA for a semester (only graded courses)
export const calculateSemesterGpa = (courses: Course[]): number => {
  const gradedCourses = courses.filter((course) => course.grade !== null);
  if (gradedCourses.length === 0) return 0;

  let totalPoints = 0;
  let totalCredits = 0;

  gradedCourses.forEach((course) => {
    const gradeValue = calculateGradeValue(course.grade!);
    totalPoints += gradeValue * course.credits;
    totalCredits += course.credits;
  });

  return totalCredits > 0 ? totalPoints / totalCredits : 0;
};

// Calculate cumulative GPA (only graded courses)
export const calculateCumulativeGpa = (courses: Course[]): number => {
  const gradedCourses = courses.filter((course) => course.grade !== null);
  if (gradedCourses.length === 0) return 0;

  let totalPoints = 0;
  let totalCredits = 0;

  gradedCourses.forEach((course) => {
    const gradeValue = calculateGradeValue(course.grade!);
    totalPoints += gradeValue * course.credits;
    totalCredits += course.credits;
  });

  return totalCredits > 0 ? totalPoints / totalCredits : 0;
};

// Determine academic standing based on GPA
export const getAcademicStanding = (gpa: number) => {
  if (gpa >= 3.7) {
    return { label: 'Excellent', color: '#34A853' }; // Green
  } else if (gpa >= 3.0) {
    return { label: 'Very Good', color: '#4285F4' }; // Blue
  } else if (gpa >= 2.0) {
    return { label: 'Satisfactory', color: '#FBBC04' }; // Yellow
  } else if (gpa >= 1.0) {
    return { label: 'Probation', color: '#FA7B17' }; // Orange
  } else {
    return { label: 'Academic Warning', color: '#EA4335' }; // Red
  }
};

// Get color for a grade display
// Dark mode uses a translucent tint of a lighter text color; light pastels glare on dark cards
const darkGradeColors = {
  green: { background: 'rgba(129,201,149,0.16)', text: '#81C995' },
  blue: { background: 'rgba(138,180,248,0.16)', text: '#8AB4F8' },
  yellow: { background: 'rgba(253,214,99,0.16)', text: '#FDD663' },
  orange: { background: 'rgba(246,174,107,0.16)', text: '#F6AE6B' },
  red: { background: 'rgba(242,139,130,0.16)', text: '#F28B82' },
};

export const getGradeColor = (grade: string | number, isDark = false) => {
  let gradeValue: number;

  if (typeof grade === 'string') {
    gradeValue = calculateGradeValue(grade);
  } else {
    gradeValue = grade;
  }

  if (isDark) {
    if (gradeValue >= 3.7) return darkGradeColors.green;
    if (gradeValue >= 3.0) return darkGradeColors.blue;
    if (gradeValue >= 2.0) return darkGradeColors.yellow;
    if (gradeValue >= 1.0) return darkGradeColors.orange;
    return darkGradeColors.red;
  }

  if (gradeValue >= 3.7) {
    return { background: '#E6F4EA', text: '#34A853' }; // Green
  } else if (gradeValue >= 3.0) {
    return { background: '#E8F0FE', text: '#4285F4' }; // Blue
  } else if (gradeValue >= 2.0) {
    return { background: '#FEF7E0', text: '#FBBC04' }; // Yellow
  } else if (gradeValue >= 1.0) {
    return { background: '#FEF0E6', text: '#FA7B17' }; // Orange
  } else {
    return { background: '#FCE8E6', text: '#EA4335' }; // Red
  }
};
