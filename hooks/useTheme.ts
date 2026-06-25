import { useState, useEffect, useCallback, useMemo } from 'react';
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
};

export function useTheme() {
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
    setUserTheme(current => {
      const next = current === 'light' ? 'dark' : 'light';
      AsyncStorage.setItem('userTheme', next).catch(() => {});
      return next;
    });
  }, []);
  
  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    setUserTheme(theme);
    AsyncStorage.setItem('userTheme', theme).catch(() => {});
  }, []);

  const toggleHideGrades = useCallback(() => {
    setHideGrades(current => {
      const next = !current;
      AsyncStorage.setItem('hideGrades', JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);
  
  const colors = useMemo(() => isDark ? darkColors : lightColors, [isDark]);
  
  return {
    isDark,
    toggleTheme,
    setTheme,
    colors,
    hideGrades,
    toggleHideGrades,
  };
}