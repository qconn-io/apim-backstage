import React from 'react';
import { ThemeToggle } from './ThemeToggle';

interface CustomThemeProviderProps {
  children: React.ReactNode;
}

export const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({ children }) => {
  return (
    <ThemeToggle>
      {children}
    </ThemeToggle>
  );
};
