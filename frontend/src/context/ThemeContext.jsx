import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const LIGHT = {
  BG:      '#FFFFFF',
  CARD:    '#FFFFFF',
  CARD2:   '#F7F7F7',
  TEXT:    '#222222',
  MUTED:   '#717171',
  BORDER:  '#EBEBEB',
  SIDEBAR: '#FFFFFF',
  SHADOW:  '0 2px 12px rgba(0,0,0,0.08)',
  INPUT_BG:'#F7F7F7',
};

const DARK = {
  BG:      '#0A0A0A',
  CARD:    '#141414',
  CARD2:   '#1C1C1C',
  TEXT:    '#F5F5F5',
  MUTED:   '#8A8A8A',
  BORDER:  '#2A2A2A',
  SIDEBAR: '#111111',
  SHADOW:  '0 2px 16px rgba(0,0,0,0.5)',
  INPUT_BG:'#1C1C1C',
};

// Brand / status colors — identical in both themes
const SHARED = {
  BLUE:   '#FF385C',
  GREEN:  '#34C759',
  RED:    '#FF3B30',
  ORANGE: '#FF9500',
  INTER:  `'Inter','Plus Jakarta Sans',sans-serif`,
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('adltrack-theme');
    return saved ? saved === 'dark' : false; // default light
  });

  useEffect(() => {
    localStorage.setItem('adltrack-theme', isDarkMode ? 'dark' : 'light');
    const palette = isDarkMode ? DARK : LIGHT;
    document.body.style.background = palette.BG;
    document.body.style.color      = palette.TEXT;
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const palette = isDarkMode ? DARK : LIGHT;
  const colors  = { ...palette, ...SHARED };

  // Legacy Tailwind class names kept for any components still using them
  const theme = {
    isDarkMode,
    toggleTheme,
    colors,
    bg:           isDarkMode ? 'bg-stone-950' : 'bg-stone-50',
    bgCard:       isDarkMode ? 'bg-stone-900' : 'bg-white',
    bgCardHover:  isDarkMode ? 'hover:bg-stone-800' : 'hover:bg-stone-100',
    bgInput:      isDarkMode ? 'bg-stone-800' : 'bg-stone-100',
    bgHeader:     isDarkMode ? 'bg-stone-900' : 'bg-white',
    bgNav:        isDarkMode ? 'bg-stone-900' : 'bg-white',
    border:       isDarkMode ? 'border-stone-800' : 'border-stone-200',
    borderLight:  isDarkMode ? 'border-stone-700' : 'border-stone-300',
    text:         isDarkMode ? 'text-white' : 'text-stone-900',
    textSecondary:isDarkMode ? 'text-stone-300' : 'text-stone-600',
    textMuted:    isDarkMode ? 'text-stone-400' : 'text-stone-500',
    textPlaceholder:isDarkMode ? 'placeholder-stone-400' : 'placeholder-stone-500',
    iconMuted:    isDarkMode ? 'text-stone-400' : 'text-stone-500',
    shadow:       isDarkMode ? '' : 'shadow-sm',
    shadowCard:   isDarkMode ? '' : 'shadow-[0_2px_12px_rgba(0,0,0,0.04)]',
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

export default ThemeContext;
