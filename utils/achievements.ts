import { Course } from '@/types/course';
import { GradingSystem } from '@/types/gradingSystem';
import { Semester } from '@/types/semester';

export type AchievementIcon =
  | 'star'
  | 'book'
  | 'award'
  | 'graduation'
  | 'flame'
  | 'trending'
  | 'gem'
  | 'target'
  | 'trophy'
  | 'crown';

export type Achievement = {
  id: string;
  // What is remembered as "already celebrated". Goal achievements include the goal's value, so
  // raising the goal and then reaching it again is a new moment.
  key: string;
  title: string;
  description: string;
  icon: AchievementIcon;
  unlocked: boolean;
  progress?: { current: number; target: number };
};

export type AchievementInput = {
  courses: Course[];
  semesters: Semester[];
  system: GradingSystem;
  cumulativeGpa: number;
  totalCredits: number;
  targetCgpa: number | null;
  targetCredits: number | null;
};

const TERM_ORDER: Record<string, number> = { Spring: 0, Summer: 1, Fall: 2 };

// Oldest first
const chronological = (semesters: Semester[]) =>
  [...semesters].sort((a, b) =>
    a.year !== b.year
      ? a.year - b.year
      : (TERM_ORDER[a.semester] ?? 0) - (TERM_ORDER[b.semester] ?? 0)
  );

// Longest run of consecutive items for which `continues(previous, current)` holds, counting items
const longestRun = <T>(
  items: T[],
  startsRun: (item: T) => boolean,
  continues: (prev: T, item: T) => boolean
) => {
  let best = 0;
  let run = 0;
  items.forEach((item, i) => {
    if (i > 0 && run > 0 && continues(items[i - 1], item)) run += 1;
    else run = startsRun(item) ? 1 : 0;
    best = Math.max(best, run);
  });
  return best;
};

const formatNumber = (n: number) => String(Number(n.toFixed(2)));

const STREAK_LENGTH = 3;
const COLLECTOR_TARGET = 10;
// "Good" on any scale is three quarters of the maximum: 3.0 of 4.0, 7.5 of 10
const GOOD_SHARE = 0.75;

export const computeAchievements = ({
  courses,
  semesters,
  system,
  cumulativeGpa,
  totalCredits,
  targetCgpa,
  targetCredits,
}: AchievementInput): Achievement[] => {
  const gradedCount = courses.filter((c) => c.grade !== null).length;
  const completed = chronological(
    semesters.filter((s) => s.status === 'completed' && s.courses.length > 0)
  );
  const goodThreshold = system.maxGpa * GOOD_SHARE;

  const goodStreak = longestRun(
    completed,
    (s) => s.gpa >= goodThreshold,
    (_, s) => s.gpa >= goodThreshold
  );
  const risingRun = longestRun(
    completed,
    () => true,
    (prev, s) => s.gpa > prev.gpa
  );
  const hasPerfect = completed.some((s) => Math.abs(s.gpa - system.maxGpa) < 0.005);
  const topBand = system.bands[0];

  const cgpaGoalMet = targetCgpa !== null && gradedCount > 0 && cumulativeGpa >= targetCgpa;
  const creditsGoalMet =
    targetCredits !== null && targetCredits > 0 && totalCredits >= targetCredits;

  return [
    {
      id: 'first_course',
      key: 'first_course',
      title: 'First steps',
      description: 'Add your first course.',
      icon: 'star',
      unlocked: courses.length >= 1,
    },
    {
      id: 'first_grade',
      key: 'first_grade',
      title: 'First grade in',
      description: 'Enter a grade for a course.',
      icon: 'award',
      unlocked: gradedCount >= 1,
    },
    {
      id: 'first_semester',
      key: 'first_semester',
      title: 'Semester done',
      description: 'Finish a semester with every course graded.',
      icon: 'graduation',
      unlocked: completed.length >= 1,
    },
    {
      id: 'ten_courses',
      key: 'ten_courses',
      title: 'Course collector',
      description: `Track ${COLLECTOR_TARGET} courses.`,
      icon: 'book',
      unlocked: courses.length >= COLLECTOR_TARGET,
      progress: { current: Math.min(courses.length, COLLECTOR_TARGET), target: COLLECTOR_TARGET },
    },
    {
      id: 'on_a_roll',
      key: 'on_a_roll',
      title: 'On a roll',
      description: `${STREAK_LENGTH} semesters in a row with a GPA of ${formatNumber(goodThreshold)} or higher.`,
      icon: 'flame',
      unlocked: goodStreak >= STREAK_LENGTH,
      progress: { current: Math.min(goodStreak, STREAK_LENGTH), target: STREAK_LENGTH },
    },
    {
      id: 'climbing',
      key: 'climbing',
      title: 'Climbing',
      description: 'Improve your semester GPA two semesters in a row.',
      icon: 'trending',
      unlocked: risingRun >= STREAK_LENGTH,
      progress: { current: Math.min(risingRun, STREAK_LENGTH), target: STREAK_LENGTH },
    },
    {
      id: 'flawless',
      key: 'flawless',
      title: 'Flawless',
      description: `Finish a semester with a perfect ${system.scaleLabel}.`,
      icon: 'gem',
      unlocked: hasPerfect,
    },
    {
      id: 'top_of_class',
      key: 'top_of_class',
      title: 'Top of the class',
      description: `Reach a cumulative GPA of ${formatNumber(topBand.min)} or higher (${topBand.label}).`,
      icon: 'crown',
      unlocked: gradedCount > 0 && cumulativeGpa >= topBand.min,
    },
    {
      id: 'goal_cgpa',
      key: `goal_cgpa:${targetCgpa}`,
      title: 'Goal met',
      description:
        targetCgpa !== null
          ? `Reach your cumulative GPA goal of ${targetCgpa.toFixed(2)}.`
          : 'Set a cumulative GPA goal on the Goals tab, then reach it.',
      icon: 'target',
      unlocked: cgpaGoalMet,
      progress:
        targetCgpa !== null && targetCgpa > 0
          ? { current: Math.min(cumulativeGpa, targetCgpa), target: targetCgpa }
          : undefined,
    },
    {
      id: 'goal_credits',
      key: `goal_credits:${targetCredits}`,
      title: 'Degree in sight',
      description:
        targetCredits !== null
          ? `Earn all ${targetCredits} credits of your degree.`
          : 'Set a credits goal on the Goals tab, then reach it.',
      icon: 'trophy',
      unlocked: creditsGoalMet,
      progress:
        targetCredits !== null && targetCredits > 0
          ? { current: Math.min(totalCredits, targetCredits), target: targetCredits }
          : undefined,
    },
  ];
};

// Achievements that are unlocked now but have not been celebrated yet
export const newlyUnlocked = (achievements: Achievement[], seenKeys: string[]): Achievement[] =>
  achievements.filter((a) => a.unlocked && !seenKeys.includes(a.key));
