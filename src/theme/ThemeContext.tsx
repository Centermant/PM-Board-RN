import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAppStore } from '../app/store';
import { getColors, ColorScheme, lightColors } from './colors';

interface ThemeContextType {
  isDark: boolean;
  colors: ColorScheme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { settings, updateSettings } = useAppStore();
  const [isDark, setIsDark] = useState(settings.theme === 'dark');

  // Синхронизация при изменении settings
  useEffect(() => {
    setIsDark(settings.theme === 'dark');
  }, [settings.theme]);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
  };

  const colors = getColors(isDark);

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}