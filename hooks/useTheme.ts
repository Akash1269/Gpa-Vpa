import { useState, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';

export function useTheme() {
  const systemColorScheme = useColorScheme();
  const [userTheme, setUserTheme] = useState<'light' | 'dark' | 'system'>('system');
  
  const isDark = useMemo(() => {
    if (userTheme === 'system') {
      return systemColorScheme === 'dark';
    }
    return userTheme === 'dark';
  }, [userTheme, systemColorScheme]);
  
  const toggleTheme = useCallback(() => {
    setUserTheme(current => (current === 'light' ? 'dark' : 'light'));
  }, []);
  
  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    setUserTheme(theme);
  }, []);
  
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
  
  const colors = isDark ? darkColors : lightColors;
  
  return {
    isDark,
    toggleTheme,
    setTheme,
    colors,
  };
}