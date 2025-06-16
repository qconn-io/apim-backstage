import React, { useState } from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Brightness4, Brightness7 } from '@material-ui/icons';
import { UnifiedThemeProvider } from '@backstage/theme';
import { apimDarkTheme, apimLightTheme } from '../../themes/apimTheme';

const useStyles = makeStyles((theme) => ({
  themeToggle: {
    position: 'fixed',
    bottom: 20,
    right: 20,
    zIndex: 1000,
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: '1px solid',
    borderColor: theme.palette.divider,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

interface ThemeToggleProps {
  children: React.ReactNode;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const classes = useStyles();

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <UnifiedThemeProvider theme={isDarkMode ? apimDarkTheme : apimLightTheme}>
      {children}
      <Tooltip title={`Switch to ${isDarkMode ? 'light' : 'dark'} theme`}>
        <IconButton
          onClick={toggleTheme}
          className={classes.themeToggle}
        >
          {isDarkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Tooltip>
    </UnifiedThemeProvider>
  );
};
