import React from 'react';
import { renderHook, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GpaProvider } from '../../context/GpaContext';
import { useGpa } from '../../hooks/useGpa';
import { useAchievementQueue } from '../../hooks/useAchievementQueue';
import { Course } from '../../types/course';

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

const course = (id: string, grade: string | null): Course => ({
  id,
  name: id,
  code: id,
  credits: 3,
  grade,
  semester: 'Fall',
  year: 2024,
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <GpaProvider>{children}</GpaProvider>
);

function mockStorage(values: Record<string, string | null> = {}) {
  const store: Record<string, string | null> = {
    '@hasLaunched': 'true',
    '@gradingSystem': 'us_4.0',
    ...values,
  };
  (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) =>
    Promise.resolve(store[key] ?? null)
  );
}

// Let the provider and the hook finish reading storage and settle
const settle = () =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

async function renderQueue() {
  const utils = renderHook(() => ({ queue: useAchievementQueue(), gpa: useGpa() }), { wrapper });
  await settle();
  await settle();
  return utils;
}

const savedSeen = (): string[] | null => {
  const calls = (AsyncStorage.setItem as jest.Mock).mock.calls.filter(
    ([key]) => key === '@achievementsSeen'
  );
  return calls.length ? JSON.parse(calls[calls.length - 1][1]) : null;
};

const pendingIds = (result: { current: { queue: { pending: { id: string }[] } } }) =>
  result.current.queue.pending.map((a) => a.id);

describe('useAchievementQueue', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('is quiet on first run and records what the user already has', async () => {
    mockStorage({ courses: JSON.stringify([course('a', 'A')]) });

    const { result } = await renderQueue();

    expect(pendingIds(result)).toEqual([]);
    expect(savedSeen()).toEqual(expect.arrayContaining(['first_course', 'first_grade']));
  });

  it('records an empty baseline for a brand new user so that later unlocks celebrate', async () => {
    mockStorage();

    const { result } = await renderQueue();

    expect(pendingIds(result)).toEqual([]);
    expect(savedSeen()).toEqual([]);

    await act(async () => {
      result.current.gpa.addCourse(course('mine', null));
    });
    await settle();

    expect(pendingIds(result)).toEqual(['first_course']);
  });

  it('celebrates a new unlock once and remembers it after dismissing', async () => {
    mockStorage({ '@achievementsSeen': JSON.stringify([]) });
    const { result } = await renderQueue();
    expect(pendingIds(result)).toEqual([]);

    await act(async () => {
      result.current.gpa.addCourse(course('a', 'A'));
    });
    await settle();

    expect(pendingIds(result)).toEqual(expect.arrayContaining(['first_course', 'first_grade']));

    await act(async () => {
      result.current.queue.dismiss();
    });
    await settle();

    expect(pendingIds(result)).toEqual([]);
    expect(savedSeen()).toEqual(expect.arrayContaining(['first_course', 'first_grade']));
  });

  it('does not celebrate achievements that were already seen', async () => {
    mockStorage({
      // one graded course also completes a semester and tops the scale
      '@achievementsSeen': JSON.stringify([
        'first_course',
        'first_grade',
        'first_semester',
        'flawless',
        'top_of_class',
      ]),
      courses: JSON.stringify([course('a', 'A')]),
    });

    const { result } = await renderQueue();

    expect(pendingIds(result)).toEqual([]);
  });

  it('stays quiet while sample data is loaded, without recording anything', async () => {
    mockStorage({
      '@achievementsSeen': JSON.stringify([]),
      courses: JSON.stringify([course('demo-1', 'A'), course('demo-2', 'B')]),
    });

    const { result } = await renderQueue();

    expect(pendingIds(result)).toEqual([]);
    expect(savedSeen()).toBeNull();
  });

  it('celebrates real progress once the sample data is gone', async () => {
    mockStorage({
      '@achievementsSeen': JSON.stringify([]),
      courses: JSON.stringify([course('demo-1', 'A')]),
    });
    const { result } = await renderQueue();
    expect(pendingIds(result)).toEqual([]);

    await act(async () => {
      result.current.gpa.deleteCourse('demo-1');
    });
    await settle();
    expect(pendingIds(result)).toEqual([]); // nothing left to celebrate

    await act(async () => {
      result.current.gpa.addCourse(course('mine', null));
    });
    await settle();
    expect(pendingIds(result)).toEqual(['first_course']);
  });

  it('writes the baseline on first run even while sample data is loaded', async () => {
    mockStorage({ courses: JSON.stringify([course('demo-1', 'A')]) });

    const { result } = await renderQueue();

    expect(pendingIds(result)).toEqual([]);
    expect(savedSeen()).toEqual([]); // nothing recorded, but no longer a first run

    await act(async () => {
      result.current.gpa.deleteCourse('demo-1');
      result.current.gpa.addCourse(course('mine', 'A'));
    });
    await settle();
    expect(pendingIds(result)).toEqual(expect.arrayContaining(['first_course', 'first_grade']));
  });

  it('celebrates reaching a goal, and again after the goal is raised and reached', async () => {
    mockStorage({
      '@achievementsSeen': JSON.stringify([
        'first_course',
        'first_grade',
        'first_semester',
        'flawless',
        'top_of_class',
      ]),
      courses: JSON.stringify([course('a', 'A')]),
    });
    const { result } = await renderQueue();
    expect(pendingIds(result)).toEqual([]);

    await act(async () => {
      result.current.gpa.setTargetCgpa(3.5);
    });
    await settle();
    expect(pendingIds(result)).toEqual(['goal_cgpa']);

    await act(async () => {
      result.current.queue.dismiss();
    });
    await settle();
    expect(pendingIds(result)).toEqual([]);

    // a higher goal that is also met is a new moment
    await act(async () => {
      result.current.gpa.setTargetCgpa(3.9);
    });
    await settle();
    expect(pendingIds(result)).toEqual(['goal_cgpa']);
  });

  it('exposes every achievement, locked or not', async () => {
    mockStorage();
    const { result } = await renderQueue();
    expect(result.current.queue.achievements.length).toBeGreaterThanOrEqual(9);
  });

  it('waits for the grading-system prompt before judging anything', async () => {
    mockStorage({ '@gradingSystem': null, '@hasLaunched': null });
    const { result } = await renderQueue();

    expect(result.current.gpa.gradingSystemPrompt).toBe('new');
    expect(pendingIds(result)).toEqual([]);
    expect(savedSeen()).toBeNull();
  });
});
