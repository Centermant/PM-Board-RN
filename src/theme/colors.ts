export const lightColors = {
  // Backgrounds
  background: '#f9fafb',
  surface: '#ffffff',
  surfaceSecondary: '#f3f4f6',
  
  // Borders
  border: '#e5e7eb',
  borderLight: '#f3f4f6',
  
  // Text
  text: '#111827',
  textSecondary: '#4b5563',
  textMuted: '#9ca3af',
  
  // Primary (Blue)
  primary: '#155CFB',
  primaryLight: '#dbeafe',
  primaryForeground: '#ffffff',
  primaryHover: '#1d4ed8',
  
  // Success (Green)
  success: '#16a34a',
  successLight: '#dcfce7',
  
  // Warning (Amber)
  warning: '#d97706',
  warningLight: '#fef3c7',
  
  // Danger (Red)
  danger: '#E7000B',
  dangerLight: '#fee2e2',
  dangerHover: '#b91c1c',
  
  // Status colors
  slate: '#475569',
  slateLight: '#f1f5f9',
  
  // Purple (для задач)
  purple: '#9333ea',
  purpleLight: '#f3e8ff',
  
  // Input
  input: '#ffffff',
  inputBackground: '#f9fafb',
  inputBorder: '#d1d5db',
  
  // Sidebar
  sidebar: '#ffffff',
  sidebarForeground: '#1f2937',
  sidebarBorder: '#e5e7eb',
  sidebarAccent: '#f3f4f6',
};

export const darkColors = {
  // Backgrounds
  background: '#111827',
  surface: '#1f2937',
  surfaceSecondary: '#374151',
  
  // Borders
  border: '#374151',
  borderLight: '#4b5563',
  
  // Text
  text: '#f9fafb',
  textSecondary: '#d1d5db',
  textMuted: '#9ca3af',
  
  // Primary (Blue)
  primary: '#155DFC',
  primaryLight: '#1e3a5f',
  primaryForeground: '#ffffff',
  primaryHover: '#60a5fa',
  
  // Success (Green)
  success: '#22c55e',
  successLight: '#064e3b',
  
  // Warning (Amber)
  warning: '#f59e0b',
  warningLight: '#78350f',
  
  // Danger (Red)
  danger: '#E7000B',
  dangerLight: '#7f1d1d',
  dangerHover: '#f87171',
  
  // Status colors
  slate: '#94a3b8',
  slateLight: '#1e293b',
  
  // Purple (для задач)
  purple: '#a855f7',
  purpleLight: '#3b0764',
  
  // Input
  input: '#374151',
  inputBackground: '#4b5563',
  inputBorder: '#4b5563',
  
  // Sidebar
  sidebar: '#1f2937',
  sidebarForeground: '#f9fafb',
  sidebarBorder: '#374151',
  sidebarAccent: '#374151',
};

export type ColorScheme = typeof lightColors;

export function getColors(isDark: boolean): ColorScheme {
  return isDark ? darkColors : lightColors;
}