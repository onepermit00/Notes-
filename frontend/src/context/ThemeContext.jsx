import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved preference, default to dark
    const saved = localStorage.getItem('adltrack-theme');
    return saved ? saved === 'dark' : true;
  });

  useEffect(() => {
    // Save preference to localStorage
    localStorage.setItem('adltrack-theme', isDarkMode ? 'dark' : 'light');
    
    // Update document class for global styling
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    // Background colors
    bg: isDarkMode ? 'bg-stone-950' : 'bg-stone-50',
    bgCard: isDarkMode ? 'bg-stone-900' : 'bg-white',
    bgCardHover: isDarkMode ? 'hover:bg-stone-800' : 'hover:bg-stone-100',
    bgInput: isDarkMode ? 'bg-stone-800' : 'bg-stone-100',
    bgHeader: isDarkMode ? 'bg-stone-900' : 'bg-white',
    bgNav: isDarkMode ? 'bg-stone-900' : 'bg-white',
    // Border colors
    border: isDarkMode ? 'border-stone-800' : 'border-stone-200',
    borderLight: isDarkMode ? 'border-stone-700' : 'border-stone-300',
    // Text colors
    text: isDarkMode ? 'text-white' : 'text-stone-900',
    textSecondary: isDarkMode ? 'text-stone-300' : 'text-stone-600',
    textMuted: isDarkMode ? 'text-stone-400' : 'text-stone-500',
    textPlaceholder: isDarkMode ? 'placeholder-stone-400' : 'placeholder-stone-500',
    // Icon colors
    iconMuted: isDarkMode ? 'text-stone-400' : 'text-stone-500',
    // Shadows
    shadow: isDarkMode ? '' : 'shadow-sm',
    shadowCard: isDarkMode ? '' : 'shadow-[0_2px_12px_rgba(0,0,0,0.04)]',
  };

  return (
    <ThemeContext.Provider value={theme}>
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

export default ThemeContext;
