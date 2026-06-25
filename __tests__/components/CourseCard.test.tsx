import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CourseCard from '../../components/CourseCard';
import { Course } from '../../types/course';

// Mock dependencies
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Warning: 'warning' },
}));

jest.mock('@/hooks/useGpa', () => ({
  useGpa: () => ({
    deleteCourse: jest.fn(),
  }),
}));

jest.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    colors: {
      card: '#FFFFFF',
      text: '#212529',
      textSecondary: '#6C757D',
      error: '#EA4335',
    },
  }),
}));

jest.mock('react-native-gesture-handler', () => {
  const View = require('react-native').View;
  return {
    Swipeable: View,
    GestureHandlerRootView: View,
  };
});

jest.mock('lucide-react-native', () => {
  const View = require('react-native').View;
  return {
    Trash2: View,
  };
});

jest.mock('react-native-reanimated', () => {
  const View = require('react-native').View;
  return {
    __esModule: true,
    default: {
      View,
    },
    FadeInRight: {
      duration: () => ({ delay: () => ({}) }),
    },
  };
});

const mockCourse: Course = {
  id: 'test-1',
  name: 'Introduction to Computer Science',
  code: 'CS101',
  credits: 3,
  grade: 'A',
  semester: 'Fall',
  year: 2025,
};

describe('CourseCard', () => {
  it('renders course name', () => {
    const { getByText } = render(<CourseCard course={mockCourse} />);
    expect(getByText('Introduction to Computer Science')).toBeTruthy();
  });

  it('renders course code', () => {
    const { getByText } = render(<CourseCard course={mockCourse} />);
    expect(getByText('CS101')).toBeTruthy();
  });

  it('renders grade', () => {
    const { getByText } = render(<CourseCard course={mockCourse} />);
    expect(getByText('A')).toBeTruthy();
  });

  it('renders credits', () => {
    const { getByText } = render(<CourseCard course={mockCourse} />);
    expect(getByText('3 CR')).toBeTruthy();
  });

  it('renders semester and year', () => {
    const { getByText } = render(<CourseCard course={mockCourse} />);
    expect(getByText('Fall 2025')).toBeTruthy();
  });

  it('navigates to course detail on press', () => {
    const { router } = require('expo-router');
    const { getByText } = render(<CourseCard course={mockCourse} />);

    fireEvent.press(getByText('Introduction to Computer Science'));
    expect(router.push).toHaveBeenCalledWith('/course/test-1');
  });
});
