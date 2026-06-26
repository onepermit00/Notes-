import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemeContext = createContext(null);

export const colors = {
  light: {
    background: '#ffffff',
    card: '#ffffff',
    cardHover: '#f5f5f5',
    text: '#1c1917',
    textSecondary: '#78716c',
    border: '#e7e5e4',
    primary: '#25D366',
    primaryHover: '#20bd5a',
    danger: '#f43f5e',
    dangerLight: '#fef2f2',
  },
  dark: {
    background: '#0c0a09',
    card: '#1c1917',
    cardHover: '#292524',
    text: '#ffffff',
    textSecondary: '#a8a29e',
    border: '#44403c',
    primary: '#25D366',
    primaryHover: '#20bd5a',
    danger: '#f43f5e',
    dangerLight: '#2d1f1f',
  },
};

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true); // Default to dark for caregiver

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const stored = await AsyncStorage.getItem('theme');
      if (stored !== null) {
        setIsDark(stored === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const setDarkMode = async (dark) => {
    setIsDark(dark);
    await AsyncStorage.setItem('theme', dark ? 'dark' : 'light');
  };

  const theme = isDark ? colors.dark : colors.light;

  return (
    <ThemeContext.Provider value={{ isDark, theme, toggleTheme, setDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
