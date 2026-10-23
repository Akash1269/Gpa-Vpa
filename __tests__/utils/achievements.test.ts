import {
  Achievement,
  AchievementInput,
  computeAchievements,
  newlyUnlocked,
} from '../../utils/achievements';
import { getGradingSystem } from '../../utils/gradingSystems';
import { Course } from '../../types/course';
import { Semester } from '../../types/semester';

const us = getGradingSystem('us_4.0');
const india = getGradingSystem('india_10');

const course = (id: string, grade: string | null, semester = 'Fall', year = 2024): Course => ({
  id,
  name: id,
  code: id,
  credits: 3,
  grade,
  semester,
  year,
});

const sem = (
  semester: string,
  year: number,
  gpa: number,
  status: Semester['status'] = 'completed'
): Semester => ({
  semester,
  year,
  gpa,
  status,
  courses: [course(`${semester}${year}`, status === 'completed' ? 'A' : null, semester, year)],
});

const base = (overrides: Partial<AchievementInput> = {}): AchievementInput => ({
  courses: [],
  semesters: [],
  system: us,
  cumulativeGpa: 0,
  totalCredits: 0,
  targetCgpa: null,
  targetCredits: null,
  ...overrides,
});

const get = (achievements: Achievement[], id: string) => achievements.find((a) => a.id === id)!;
const unlockedIds = (input: AchievementInput) =>
  computeAchievements(input)
    .filter((a) => a.unlocked)
    .map((a) => a.id);

describe('computeAchievements', () => {
  it('unlocks nothing for an empty record', () => {
    expect(unlockedIds(base())).toEqual([]);
  });

  it('unlocks first course and first grade separately', () => {
    expect(unlockedIds(base({ courses: [course('a', null)] }))).toEqual(['first_course']);
    expect(unlockedIds(base({ courses: [course('a', 'B')], cumulativeGpa: 3 }))).toEqual([
      'first_course',
      'first_grade',
    ]);
  });

  it('needs a fully graded semester for "Semester done"', () => {
    const inProgress = base({
      courses: [course('a', null)],
      semesters: [sem('Fall', 2024, 0, 'in-progress')],
    });
    expect(unlockedIds(inProgress)).not.toContain('first_semester');

    const done = base({ courses: [course('a', 'A')], semesters: [sem('Fall', 2024, 4)] });
    expect(unlockedIds(done)).toContain('first_semester');
  });

  it('tracks progress towards ten courses', () => {
    const courses = Array.from({ length: 4 }, (_, i) => course(`c${i}`, 'A'));
    const a = get(computeAchievements(base({ courses })), 'ten_courses');
    expect(a.unlocked).toBe(false);
    expect(a.progress).toEqual({ current: 4, target: 10 });

    const ten = Array.from({ length: 12 }, (_, i) => course(`c${i}`, 'A'));
    const b = get(computeAchievements(base({ courses: ten })), 'ten_courses');
    expect(b.unlocked).toBe(true);
    expect(b.progress).toEqual({ current: 10, target: 10 });
  });

  describe('on a roll', () => {
    it('needs three good semesters in a row', () => {
      const semesters = [sem('Fall', 2023, 3.2), sem('Spring', 2024, 3.4), sem('Fall', 2024, 3.1)];
      const a = get(computeAchievements(base({ semesters })), 'on_a_roll');
      expect(a.unlocked).toBe(true);
    });

    it('is broken by a weak semester in the middle', () => {
      const semesters = [
        sem('Fall', 2023, 3.5),
        sem('Spring', 2024, 2.0),
        sem('Fall', 2024, 3.5),
        sem('Spring', 2025, 3.5),
      ];
      const a = get(computeAchievements(base({ semesters })), 'on_a_roll');
      expect(a.unlocked).toBe(false);
      expect(a.progress).toEqual({ current: 2, target: 3 });
    });

    it('orders semesters by date, not by the order given', () => {
      const semesters = [sem('Fall', 2024, 3.5), sem('Spring', 2024, 3.5), sem('Fall', 2023, 3.5)];
      expect(get(computeAchievements(base({ semesters })), 'on_a_roll').unlocked).toBe(true);
    });

    it('ignores semesters still in progress', () => {
      const semesters = [
        sem('Fall', 2023, 3.5),
        sem('Spring', 2024, 3.5),
        sem('Fall', 2024, 3.9, 'in-progress'),
      ];
      expect(get(computeAchievements(base({ semesters })), 'on_a_roll').unlocked).toBe(false);
    });

    it('uses 75% of the scale maximum', () => {
      const semesters = [sem('Fall', 2023, 7.6), sem('Spring', 2024, 7.5), sem('Fall', 2024, 8)];
      expect(
        get(computeAchievements(base({ semesters, system: india })), 'on_a_roll').unlocked
      ).toBe(true);
      // on the 4.0 scale 2.9 is below the 3.0 bar, so the same shape of run does not unlock
      const low = [sem('Fall', 2023, 2.9), sem('Spring', 2024, 3.0), sem('Fall', 2024, 3.0)];
      expect(get(computeAchievements(base({ semesters: low })), 'on_a_roll').unlocked).toBe(false);
    });

    it('states the threshold for the active scale', () => {
      expect(get(computeAchievements(base()), 'on_a_roll').description).toContain('3 or higher');
      expect(get(computeAchievements(base({ system: india })), 'on_a_roll').description).toContain(
        '7.5 or higher'
      );
    });
  });

  describe('climbing', () => {
    it('needs the GPA to rise two semesters in a row', () => {
      const up = [sem('Fall', 2023, 2.5), sem('Spring', 2024, 3.0), sem('Fall', 2024, 3.4)];
      expect(get(computeAchievements(base({ semesters: up })), 'climbing').unlocked).toBe(true);
    });

    it('does not count a flat or falling semester', () => {
      const flat = [sem('Fall', 2023, 3.0), sem('Spring', 2024, 3.0), sem('Fall', 2024, 3.4)];
      const a = get(computeAchievements(base({ semesters: flat })), 'climbing');
      expect(a.unlocked).toBe(false);
      expect(a.progress).toEqual({ current: 2, target: 3 });

      const down = [sem('Fall', 2023, 3.5), sem('Spring', 2024, 3.0), sem('Fall', 2024, 2.5)];
      expect(get(computeAchievements(base({ semesters: down })), 'climbing').unlocked).toBe(false);
    });

    it('needs three completed semesters', () => {
      const two = [sem('Fall', 2023, 2.5), sem('Spring', 2024, 3.5)];
      expect(get(computeAchievements(base({ semesters: two })), 'climbing').unlocked).toBe(false);
    });
  });

  it('unlocks Flawless only for a perfect completed semester', () => {
    expect(unlockedIds(base({ semesters: [sem('Fall', 2024, 3.99)] }))).not.toContain('flawless');
    expect(unlockedIds(base({ semesters: [sem('Fall', 2024, 4)] }))).toContain('flawless');
    expect(unlockedIds(base({ semesters: [sem('Fall', 2024, 10)], system: india }))).toContain(
      'flawless'
    );
    expect(unlockedIds(base({ semesters: [sem('Fall', 2024, 4, 'in-progress')] }))).not.toContain(
      'flawless'
    );
  });

  it('unlocks Top of the class from the best standing band', () => {
    const graded = [course('a', 'A')];
    expect(unlockedIds(base({ courses: graded, cumulativeGpa: 3.69 }))).not.toContain(
      'top_of_class'
    );
    expect(unlockedIds(base({ courses: graded, cumulativeGpa: 3.7 }))).toContain('top_of_class');
    expect(unlockedIds(base({ courses: graded, cumulativeGpa: 8.9, system: india }))).not.toContain(
      'top_of_class'
    );
    expect(unlockedIds(base({ courses: graded, cumulativeGpa: 9, system: india }))).toContain(
      'top_of_class'
    );
  });

  it('does not treat an empty record as top of the class', () => {
    expect(
      unlockedIds(
        base({
          cumulativeGpa: 0,
          system: { ...us, bands: [{ min: 0, label: 'x', tone: 'green' }] },
        })
      )
    ).not.toContain('top_of_class');
  });

  describe('goals', () => {
    const graded = [course('a', 'A')];

    it('needs a goal and a graded course', () => {
      expect(unlockedIds(base({ courses: graded, cumulativeGpa: 3.9 }))).not.toContain('goal_cgpa');
      expect(unlockedIds(base({ targetCgpa: 3.5, cumulativeGpa: 0 }))).not.toContain('goal_cgpa');
    });

    it('unlocks when the CGPA reaches the goal, inclusive', () => {
      expect(
        unlockedIds(base({ courses: graded, targetCgpa: 3.5, cumulativeGpa: 3.49 }))
      ).not.toContain('goal_cgpa');
      expect(unlockedIds(base({ courses: graded, targetCgpa: 3.5, cumulativeGpa: 3.5 }))).toContain(
        'goal_cgpa'
      );
    });

    it('re-arms when the goal changes', () => {
      const first = get(
        computeAchievements(base({ courses: graded, targetCgpa: 3.5, cumulativeGpa: 3.6 })),
        'goal_cgpa'
      );
      const raised = get(
        computeAchievements(base({ courses: graded, targetCgpa: 3.8, cumulativeGpa: 3.6 })),
        'goal_cgpa'
      );
      expect(first.unlocked).toBe(true);
      expect(raised.unlocked).toBe(false);
      expect(first.key).not.toBe(raised.key);
    });

    it('unlocks the credits goal and reports progress', () => {
      const near = get(
        computeAchievements(base({ targetCredits: 120, totalCredits: 90 })),
        'goal_credits'
      );
      expect(near.unlocked).toBe(false);
      expect(near.progress).toEqual({ current: 90, target: 120 });
      expect(unlockedIds(base({ targetCredits: 120, totalCredits: 120 }))).toContain(
        'goal_credits'
      );
    });

    it('explains how to set a missing goal', () => {
      const a = computeAchievements(base());
      expect(get(a, 'goal_cgpa').description).toMatch(/Set a cumulative GPA goal/);
      expect(get(a, 'goal_cgpa').progress).toBeUndefined();
      expect(get(a, 'goal_credits').description).toMatch(/Set a credits goal/);
    });
  });

  it('gives every achievement a unique id and key', () => {
    const list = computeAchievements(base());
    expect(new Set(list.map((a) => a.id)).size).toBe(list.length);
    expect(new Set(list.map((a) => a.key)).size).toBe(list.length);
  });
});

describe('newlyUnlocked', () => {
  const list = computeAchievements(
    base({ courses: [course('a', 'A')], cumulativeGpa: 4, semesters: [sem('Fall', 2024, 4)] })
  );

  it('returns unlocked achievements that were not celebrated', () => {
    const ids = newlyUnlocked(list, ['first_course']).map((a) => a.id);
    expect(ids).toContain('first_grade');
    expect(ids).not.toContain('first_course');
  });

  it('never returns locked achievements', () => {
    newlyUnlocked(list, []).forEach((a) => expect(a.unlocked).toBe(true));
  });

  it('returns nothing once everything is seen', () => {
    expect(
      newlyUnlocked(
        list,
        list.map((a) => a.key)
      )
    ).toEqual([]);
  });
});
