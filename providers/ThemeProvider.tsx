import React, { createContext, useContext, ReactNode } from 'react';
import { COLORS } from '../constants/colors';

// Create a theme context
const ThemeContext = createContext(COLORS);

// Theme provider props
interface ThemeProviderProps {
  children: ReactNode;
}

// Theme provider component
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={COLORS}>{children}</ThemeContext.Provider>
  );
}

// Custom hook to use the theme
export function useTheme() {
  return useContext(ThemeContext);
}
