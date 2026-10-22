import { Course } from '@/types/course';
import { GradeTone, GradingSystem } from '@/types/gradingSystem';
import { GRADING_SYSTEMS } from '@/utils/gradingSystems';

// Every function takes the grading system as its last argument and defaults to the US 4.0 scale
const US_SYSTEM = GRADING_SYSTEMS['us_4.0'];

// Grade point values on the US 4.0 scale
export const gradePoints: Record<string, number> = Object.fromEntries(
  US_SYSTEM.grades.map((g) => [g.label, g.value])
);

// Calculate the numeric value for a letter grade
export const calculateGradeValue = (grade: string, system: GradingSystem = US_SYSTEM): number => {
  return system.grades.find((g) => g.label === grade)?.value ?? 0;
};

// Credit-weighted GPA over the graded courses in `courses`
const weightedGpa = (courses: Course[], system: GradingSystem): number => {
  const gradedCourses = courses.filter((course) => course.grade !== null);
  if (gradedCourses.length === 0) return 0;

  let totalPoints = 0;
  let totalCredits = 0;

  gradedCourses.forEach((course) => {
    totalPoints += calculateGradeValue(course.grade!, system) * course.credits;
    totalCredits += course.credits;
  });

  return totalCredits > 0 ? totalPoints / totalCredits : 0;
};

// Calculate GPA for a semester (only graded courses)
export const calculateSemesterGpa = (courses: Course[], system: GradingSystem = US_SYSTEM) =>
  weightedGpa(courses, system);

// Calculate cumulative GPA (only graded courses)
export const calculateCumulativeGpa = (courses: Course[], system: GradingSystem = US_SYSTEM) =>
  weightedGpa(courses, system);

// Hex colour for each standing/grade tone (used for text and indicators)
const toneText: Record<GradeTone, string> = {
  green: '#34A853',
  blue: '#4285F4',
  yellow: '#FBBC04',
  orange: '#FA7B17',
  red: '#EA4335',
};

const lightToneColors: Record<GradeTone, { background: string; text: string }> = {
  green: { background: '#E6F4EA', text: toneText.green },
  blue: { background: '#E8F0FE', text: toneText.blue },
  yellow: { background: '#FEF7E0', text: toneText.yellow },
  orange: { background: '#FEF0E6', text: toneText.orange },
  red: { background: '#FCE8E6', text: toneText.red },
};

// Dark mode uses a translucent tint of a lighter text color; light pastels glare on dark cards
const darkToneColors: Record<GradeTone, { background: string; text: string }> = {
  green: { background: 'rgba(129,201,149,0.16)', text: '#81C995' },
  blue: { background: 'rgba(138,180,248,0.16)', text: '#8AB4F8' },
  yellow: { background: 'rgba(253,214,99,0.16)', text: '#FDD663' },
  orange: { background: 'rgba(246,174,107,0.16)', text: '#F6AE6B' },
  red: { background: 'rgba(242,139,130,0.16)', text: '#F28B82' },
};

const findBand = (gpa: number, system: GradingSystem) =>
  system.bands.find((band) => gpa >= band.min) ?? system.bands[system.bands.length - 1];

// Determine academic standing based on GPA
export const getAcademicStanding = (gpa: number, system: GradingSystem = US_SYSTEM) => {
  const band = findBand(gpa, system);
  return { label: band.label, color: toneText[band.tone] };
};

// Get color for a grade display
export const getGradeColor = (
  grade: string | number,
  isDark = false,
  system: GradingSystem = US_SYSTEM
) => {
  const gradeValue = typeof grade === 'string' ? calculateGradeValue(grade, system) : grade;
  const { tone } = findBand(gradeValue, system);
  return (isDark ? darkToneColors : lightToneColors)[tone];
};
