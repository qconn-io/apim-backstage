import {
  createUnifiedTheme,
  palettes,
  genPageTheme,
  shapes,
} from '@backstage/theme';

// Create a stunning dark theme for the API Management Platform
export const apimDarkTheme = createUnifiedTheme({
  palette: {
    ...palettes.dark,
    primary: {
      main: '#6366f1', // Indigo
    },
    secondary: {
      main: '#06b6d4', // Cyan
    },
    background: {
      default: '#0f172a', // Deep slate
      paper: '#1e293b', // Slate 800
    },
    text: {
      primary: '#f1f5f9', // Slate 100
      secondary: '#cbd5e1', // Slate 300
    },
    error: {
      main: '#ef4444', // Red
    },
    warning: {
      main: '#f59e0b', // Amber
    },
    info: {
      main: '#06b6d4', // Cyan
    },
    success: {
      main: '#10b981', // Emerald
    },
  },
  defaultPageTheme: 'home',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  pageTheme: {
    home: genPageTheme({
      colors: ['#6366f1', '#06b6d4'],
      shape: shapes.round,
    }),
    documentation: genPageTheme({
      colors: ['#06b6d4', '#10b981'],
      shape: shapes.round,
    }),
    tool: genPageTheme({
      colors: ['#f59e0b', '#ef4444'],
      shape: shapes.round,
    }),
    service: genPageTheme({
      colors: ['#10b981', '#06b6d4'],
      shape: shapes.round,
    }),
    website: genPageTheme({
      colors: ['#ef4444', '#f59e0b'],
      shape: shapes.round,
    }),
    library: genPageTheme({
      colors: ['#8b5cf6', '#6366f1'],
      shape: shapes.round,
    }),
    other: genPageTheme({
      colors: ['#64748b', '#475569'],
      shape: shapes.round,
    }),
    app: genPageTheme({
      colors: ['#6366f1', '#8b5cf6'],
      shape: shapes.round,
    }),
    apis: genPageTheme({
      colors: ['#06b6d4', '#10b981'],
      shape: shapes.round,
    }),
  },
});

// Light theme variant
export const apimLightTheme = createUnifiedTheme({
  palette: {
    ...palettes.light,
    primary: {
      main: '#6366f1', // Indigo
    },
    secondary: {
      main: '#06b6d4', // Cyan
    },
  },
  defaultPageTheme: 'home',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  pageTheme: {
    home: genPageTheme({
      colors: ['#6366f1', '#06b6d4'],
      shape: shapes.round,
    }),
    documentation: genPageTheme({
      colors: ['#06b6d4', '#10b981'],
      shape: shapes.round,
    }),
    tool: genPageTheme({
      colors: ['#f59e0b', '#ef4444'],
      shape: shapes.round,
    }),
    service: genPageTheme({
      colors: ['#10b981', '#06b6d4'],
      shape: shapes.round,
    }),
    website: genPageTheme({
      colors: ['#ef4444', '#f59e0b'],
      shape: shapes.round,
    }),
    library: genPageTheme({
      colors: ['#8b5cf6', '#6366f1'],
      shape: shapes.round,
    }),
    other: genPageTheme({
      colors: ['#64748b', '#475569'],
      shape: shapes.round,
    }),
    app: genPageTheme({
      colors: ['#6366f1', '#8b5cf6'],
      shape: shapes.round,
    }),
    apis: genPageTheme({
      colors: ['#06b6d4', '#10b981'],
      shape: shapes.round,
    }),
  },
});
