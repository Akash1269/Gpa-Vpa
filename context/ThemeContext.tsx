import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const lightColors = {
  background: '#F8F9FA',
  card: '#FFFFFF',
  text: '#212529',
  textSecondary: '#6C757D',
  border: '#E9ECEF',
  primary: '#1A73E8',
  primaryLight: '#E8F0FE',
  secondary: '#5F6368',
  success: '#34A853',
  warning: '#FBBC04',
  error: '#EA4335',
  onPrimary: '#FFFFFF',
  onError: '#FFFFFF',
  hero: '#1A73E8',
  // Secondary accent: warm gold, reserved for achievements (goals met, best semester)
  accent: '#F5A623',
  accentSoft: '#FFF4D6',
  accentText: '#8A5A00',
  onAccent: '#3D2600',
  heroGradient: ['#1A73E8', '#5B3FD6'] as [string, string],
  status: {
    inProgress: { bg: '#E3F2FD', text: '#1976D2' },
    completed: { bg: '#E8F5E9', text: '#34A853' },
    warning: { bg: '#FFF3E0', text: '#F57C00' },
    na: { bg: '#FFF3E0', text: '#F57C00' },
    goal: { bg: '#F3E5F5', text: '#9C27B0' },
  },
};

const darkColors = {
  background: '#121212',
  card: '#1E1E1E',
  text: '#E9ECEF',
  textSecondary: '#ADB5BD',
  border: '#2C2C2C',
  primary: '#8AB4F8',
  primaryLight: '#174EA6',
  secondary: '#9AA0A6',
  success: '#81C995',
  warning: '#FDD663',
  error: '#F28B82',
  // Dark text on the light dark-mode primary/error fills; white on them is unreadable
  onPrimary: '#0B1E3D',
  onError: '#3B0A06',
  hero: '#1B4F9C',
  accent: '#FFC857',
  accentSoft: 'rgba(255,200,87,0.16)',
  accentText: '#FFC857',
  onAccent: '#3D2600',
  heroGradient: ['#1B4F9C', '#3B2E8F'] as [string, string],
  status: {
    inProgress: { bg: 'rgba(138,180,248,0.16)', text: '#8AB4F8' },
    completed: { bg: 'rgba(129,201,149,0.16)', text: '#81C995' },
    warning: { bg: 'rgba(246,174,107,0.16)', text: '#F6AE6B' },
    na: { bg: 'rgba(246,174,107,0.16)', text: '#F6AE6B' },
    goal: { bg: 'rgba(206,147,216,0.16)', text: '#CE93D8' },
  },
};

type ThemeContextType = {
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  colors: typeof lightColors;
  hideGrades: boolean;
  toggleHideGrades: () => void;
};

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme preferences live in one provider so every screen sees a toggle immediately
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [userTheme, setUserTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [hideGrades, setHideGrades] = useState(false);

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('userTheme');
        if (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system') {
          setUserTheme(savedTheme);
        }
        const savedHideGrades = await AsyncStorage.getItem('hideGrades');
        if (savedHideGrades !== null) {
          setHideGrades(JSON.parse(savedHideGrades));
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      }
    };
    loadPreferences();
  }, []);

  const isDark = useMemo(() => {
    if (userTheme === 'system') {
      return systemColorScheme === 'dark';
    }
    return userTheme === 'dark';
  }, [userTheme, systemColorScheme]);

  const toggleTheme = useCallback(() => {
    const next = isDark ? 'light' : 'dark';
    setUserTheme(next);
    AsyncStorage.setItem('userTheme', next).catch(() => {});
  }, [isDark]);

  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    setUserTheme(theme);
    AsyncStorage.setItem('userTheme', theme).catch(() => {});
  }, []);

  const toggleHideGrades = useCallback(() => {
    setHideGrades((current) => {
      const next = !current;
      AsyncStorage.setItem('hideGrades', JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const colors = useMemo(() => (isDark ? darkColors : lightColors), [isDark]);

  const value = useMemo(
    () => ({ isDark, toggleTheme, setTheme, colors, hideGrades, toggleHideGrades }),
    [isDark, toggleTheme, setTheme, colors, hideGrades, toggleHideGrades]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
