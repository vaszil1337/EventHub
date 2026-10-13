import { createTheme } from '@mui/material/styles';

/**
 * EventHub Central Design System Tokens (Theme Configuration).
 * Similar to shadcn/ui's tailwind/css variables setup, all semantic tokens
 * (colors, typography, surfaces, borders) are declared here in a single place.
 *
 * Components consume built-in theme variables:
 * - 'background.default', 'background.paper'
 * - 'text.primary', 'text.secondary'
 * - 'divider' (borders)
 * - 'primary.main', 'primary.contrastText', 'primary.light', 'primary.dark'
 * - 'error.main', 'error.light', 'error.dark'
 * - 'warning.main', 'warning.light', 'warning.dark'
 * - 'success.main', 'success.light', 'success.dark'
 * - 'action.hover', 'action.selected'
 * - 'grey.50', 'grey.100', 'grey.200', etc.
 */
export const theme = createTheme({
  cssVariables: true,
  palette: {
    mode: 'light',
    primary: {
      main: '#18181b', // Zinc 900
      light: '#27272a',
      dark: '#09090b',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2563eb', // Royal Blue
      light: '#3b82f6',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    background: {
      default: '#fafafa', // Neutral canvas
      paper: '#ffffff',   // Cards & modals
    },
    text: {
      primary: '#09090b',   // Zinc 950
      secondary: '#71717a', // Zinc 500
    },
    divider: '#e4e4e7', // Zinc 200 (standard border)
    grey: {
      50: '#fafafa',
      100: '#f4f4f5',
      200: '#e4e4e7',
      300: '#d4d4d8',
      400: '#a1a1aa',
      500: '#71717a',
      600: '#52525b',
      700: '#3f3f46',
      800: '#27272a',
      900: '#18181b',
    },
    error: {
      main: '#dc2626',
      light: '#fef2f2',
      dark: '#991b1b',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#d97706',
      light: '#fffbeb',
      dark: '#92400e',
      contrastText: '#ffffff',
    },
    success: {
      main: '#16a34a',
      light: '#f0fdf4',
      dark: '#166534',
      contrastText: '#ffffff',
    },
    action: {
      hover: '#f4f4f5',
      selected: '#e4e4e7',
    },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.03em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.015em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    subtitle1: {
      fontSize: '0.95rem',
      fontWeight: 500,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    caption: {
      fontSize: '0.75rem',
      letterSpacing: '0.01em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
      }),
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 600,
          transition: 'all 0.15s ease-in-out',
        },
        containedPrimary: ({ theme }) => ({
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          '&:hover': {
            backgroundColor: theme.palette.primary.light,
          },
        }),
        outlined: ({ theme }) => ({
          borderColor: theme.palette.divider,
          color: theme.palette.text.primary,
          '&:hover': {
            borderColor: theme.palette.grey[400],
            backgroundColor: theme.palette.action.hover,
          },
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 10,
          border: '1px solid',
          borderColor: theme.palette.divider,
          backgroundColor: theme.palette.background.paper,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            borderColor: theme.palette.grey[400],
            boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.05)',
          },
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        outlined: ({ theme }) => ({
          borderColor: theme.palette.divider,
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          borderRadius: 6,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.divider,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.grey[400],
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
            borderWidth: '1.5px',
          },
        }),
      },
    },
  },
});
