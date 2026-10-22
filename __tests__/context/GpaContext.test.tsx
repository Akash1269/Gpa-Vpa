import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GpaContext, GpaProvider } from '../../context/GpaContext';
import { Course } from '../../types/course';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

const mockCourse: Course = {
  id: 'test-1',
  name: 'Introduction to CS',
  code: 'CS101',
  credits: 3,
  grade: 'A',
  semester: 'Fall',
  year: 2025,
};

const mockCourse2: Course = {
  id: 'test-2',
  name: 'Calculus',
  code: 'MATH201',
  credits: 4,
  grade: 'B+',
  semester: 'Fall',
  year: 2025,
};

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <GpaProvider>{children}</GpaProvider>
);

function useGpaContext() {
  return React.useContext(GpaContext);
}

// Back AsyncStorage.getItem with a key/value map. '@hasLaunched' defaults to
// set so tests don't take the first-launch demo-data path unless they opt in.
function mockStorage(values: Record<string, string | null> = {}) {
  const store: Record<string, string | null> = { '@hasLaunched': 'true', ...values };
  (AsyncStorage.getItem as jest.Mock).mockImplementation((key: string) =>
    Promise.resolve(store[key] ?? null)
  );
}

// Render the provider and let its async storage load settle inside act(),
// so the load can't race with (or overwrite) the test's own updates.
async function renderGpaContext() {
  const utils = renderHook(() => useGpaContext(), { wrapper });
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
  return utils;
}

describe('GpaContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage();
  });

  it('provides default values', async () => {
    const { result } = await renderGpaContext();

    expect(result.current.courses).toEqual([]);
    expect(result.current.semesters).toEqual([]);
    expect(result.current.cumulativeGpa).toBe(0);
    expect(result.current.totalCredits).toBe(0);
    expect(result.current.recentCourses).toEqual([]);
    expect(result.current.currentSemester).toBeNull();
  });

  it('loads courses from AsyncStorage on mount', async () => {
    mockStorage({ courses: JSON.stringify([mockCourse]) });

    const { result } = await renderGpaContext();

    await waitFor(() => {
      expect(result.current.courses).toHaveLength(1);
      expect(result.current.courses[0].id).toBe('test-1');
    });
  });

  it('loads demo data on first launch', async () => {
    mockStorage({ '@hasLaunched': null });

    const { result } = await renderGpaContext();

    expect(result.current.courses.length).toBeGreaterThan(0);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith('@hasLaunched', 'true');
  });

  it('adds a course', async () => {
    const { result } = await renderGpaContext();

    act(() => {
      result.current.addCourse(mockCourse);
    });

    await waitFor(() => {
      expect(result.current.courses).toHaveLength(1);
      expect(result.current.courses[0].name).toBe('Introduction to CS');
    });
  });

  it('updates a course', async () => {
    mockStorage({ courses: JSON.stringify([mockCourse]) });

    const { result } = await renderGpaContext();

    await waitFor(() => {
      expect(result.current.courses).toHaveLength(1);
    });

    const updatedCourse = { ...mockCourse, grade: 'B' };
    act(() => {
      result.current.updateCourse(updatedCourse);
    });

    await waitFor(() => {
      expect(result.current.courses[0].grade).toBe('B');
    });
  });

  it('deletes a course', async () => {
    mockStorage({ courses: JSON.stringify([mockCourse, mockCourse2]) });

    const { result } = await renderGpaContext();

    await waitFor(() => {
      expect(result.current.courses).toHaveLength(2);
    });

    act(() => {
      result.current.deleteCourse('test-1');
    });

    await waitFor(() => {
      expect(result.current.courses).toHaveLength(1);
      expect(result.current.courses[0].id).toBe('test-2');
    });
  });

  it('calculates cumulative GPA after adding courses', async () => {
    const { result } = await renderGpaContext();

    act(() => {
      result.current.addCourse(mockCourse); // A = 4.0, 3 credits
      result.current.addCourse(mockCourse2); // B+ = 3.3, 4 credits
    });

    await waitFor(() => {
      // (4.0*3 + 3.3*4) / (3+4) = (12 + 13.2) / 7 = 25.2/7 = 3.6
      expect(result.current.cumulativeGpa).toBeCloseTo(3.6, 1);
    });
  });

  it('calculates total credits', async () => {
    const { result } = await renderGpaContext();

    act(() => {
      result.current.addCourse(mockCourse); // 3 credits
      result.current.addCourse(mockCourse2); // 4 credits
    });

    await waitFor(() => {
      expect(result.current.totalCredits).toBe(7);
    });
  });

  it('groups courses into semesters', async () => {
    const springCourse: Course = {
      id: 'test-3',
      name: 'Physics',
      code: 'PHY101',
      credits: 3,
      grade: 'A-',
      semester: 'Spring',
      year: 2026,
    };

    const { result } = await renderGpaContext();

    act(() => {
      result.current.addCourse(mockCourse); // Fall 2025
      result.current.addCourse(mockCourse2); // Fall 2025
      result.current.addCourse(springCourse); // Spring 2026
    });

    await waitFor(() => {
      expect(result.current.semesters).toHaveLength(2);
    });
  });

  it('gets a course by id', async () => {
    mockStorage({ courses: JSON.stringify([mockCourse]) });

    const { result } = await renderGpaContext();

    await waitFor(() => {
      expect(result.current.getCourse('test-1')).toEqual(mockCourse);
      expect(result.current.getCourse('nonexistent')).toBeUndefined();
    });
  });

  it('clears all data', async () => {
    mockStorage({ courses: JSON.stringify([mockCourse]) });

    const { result } = await renderGpaContext();

    await waitFor(() => {
      expect(result.current.courses).toHaveLength(1);
    });

    await act(async () => {
      await result.current.clearAllData();
    });

    await waitFor(() => {
      expect(result.current.courses).toEqual([]);
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('courses');
    });
  });

  it('persists courses to AsyncStorage on change', async () => {
    const { result } = await renderGpaContext();

    act(() => {
      result.current.addCourse(mockCourse);
    });

    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'courses',
        expect.stringContaining('test-1')
      );
    });
  });
});
