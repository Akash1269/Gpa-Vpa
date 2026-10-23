import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useGpa } from '@/hooks/useGpa';
import { Achievement, computeAchievements, newlyUnlocked } from '@/utils/achievements';

const STORAGE_KEY = '@achievementsSeen';

const isDemoCourse = (id: string) => id.startsWith('demo-');

const parseSeen = (raw: string | null): string[] | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every((k) => typeof k === 'string') ? parsed : null;
  } catch {
    return null;
  }
};

// Every achievement for the current data, unlocked or not. Read-only: it never celebrates.
export function useAchievements() {
  const {
    courses,
    semesters,
    gradingSystem,
    cumulativeGpa,
    totalCredits,
    targetCgpa,
    targetCredits,
  } = useGpa();

  return useMemo(
    () =>
      computeAchievements({
        courses,
        semesters,
        system: gradingSystem,
        cumulativeGpa,
        totalCredits,
        targetCgpa,
        targetCredits,
      }),
    [courses, semesters, gradingSystem, cumulativeGpa, totalCredits, targetCgpa, targetCredits]
  );
}

// All achievements, plus the ones that should be celebrated right now.
//
// Two cases stay quiet. The first time this runs, the user may already hold achievements (an
// upgrade), so they are recorded as seen instead of celebrated. While sample data is loaded,
// nothing is celebrated and nothing is recorded, so real progress still counts afterwards.
// Mount this in one place only.
export function useAchievementQueue() {
  const { courses, isLoaded, gradingSystemPrompt } = useGpa();
  const achievements = useAchievements();

  // undefined = still reading storage, null = nothing stored yet
  const [seen, setSeen] = useState<string[] | null | undefined>(undefined);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => setSeen(parseSeen(raw)))
      .catch(() => setSeen(null));
  }, []);

  const ready = isLoaded && gradingSystemPrompt === null && seen !== undefined;
  const firstRun = seen === null;
  const hasSampleData = courses.some((c) => isDemoCourse(c.id));

  // On the first run, take stock of what the user already has
  const baseline = useMemo(
    () =>
      ready && firstRun && !hasSampleData ? newlyUnlocked(achievements, []).map((a) => a.key) : [],
    [ready, firstRun, hasSampleData, achievements]
  );

  useEffect(() => {
    if (!ready || !firstRun) return;
    // Wait for real data: with sample data loaded there is nothing to take stock of yet, but the
    // baseline must still be written so later unlocks are celebrated
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(baseline))
      .catch(() => {})
      .then(() => setSeen(baseline));
  }, [ready, firstRun, baseline]);

  const pending: Achievement[] = useMemo(
    () => (ready && !firstRun && !hasSampleData ? newlyUnlocked(achievements, seen ?? []) : []),
    [ready, firstRun, hasSampleData, achievements, seen]
  );

  // Mark everything currently pending as celebrated
  const dismiss = useCallback(() => {
    const next = [...(seen ?? []), ...pending.map((a) => a.key)];
    setSeen(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }, [seen, pending]);

  return { achievements, pending, dismiss };
}
