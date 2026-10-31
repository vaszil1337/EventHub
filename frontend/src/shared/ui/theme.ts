import { createTheme } from '@mui/material/styles';

/**
 * EventHub Central Design System Tokens (Theme Configuration).
 * Similar to shadcn/ui's tailwind/css variables setup, all semantic tokens
 * (colors, typography, surfaces, borders) are declared here in a single place.
 *
 * Supports native MUI v6 Color Schemes (Light & Dark mode):
 * - Light canvas: Zinc 50 (#fafafa) with white cards (#ffffff) and Zinc 900 text/buttons (#18181b).
 * - Dark canvas: Deep Zinc 950 (#09090b) with elevated Zinc 900 cards (#141417) and crisp Zinc 50 text/buttons (#fafafa).
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
  cssVariables: {
    colorSchemeSelector: 'data-mui-color-scheme',
  },
  defaultColorScheme: 'light',
  colorSchemes: {
    light: {
      palette: {
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
    },
    dark: {
      palette: {
        primary: {
          main: '#fafafa', // Zinc 50 (light crisp button on dark canvas)
          light: '#ffffff',
          dark: '#e4e4e7',
          contrastText: '#09090b',
        },
        secondary: {
          main: '#3b82f6', // Bright Royal Blue
          light: '#60a5fa',
          dark: '#1d4ed8',
          contrastText: '#ffffff',
        },
        background: {
          default: '#09090b', // Zinc 950 canvas
          paper: '#141417',   // Zinc 900 elevated surfaces
        },
        text: {
          primary: '#f4f4f5',   // Zinc 100
          secondary: '#a1a1aa', // Zinc 400
        },
        divider: '#27272a', // Zinc 800 subtle borders
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
          main: '#f87171',
          light: '#450a0a',
          dark: '#b91c1c',
          contrastText: '#ffffff',
        },
        warning: {
          main: '#fbbf24',
          light: '#451a03',
          dark: '#d97706',
          contrastText: '#ffffff',
        },
        success: {
          main: '#4ade80',
          light: '#052e16',
          dark: '#15803d',
          contrastText: '#ffffff',
        },
        action: {
          hover: '#27272a',
          selected: '#3f3f46',
        },
      },
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
          backgroundColor: theme.vars ? theme.vars.palette.background.default : theme.palette.background.default,
          color: theme.vars ? theme.vars.palette.text.primary : theme.palette.text.primary,
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
          backgroundColor: theme.vars ? theme.vars.palette.primary.main : theme.palette.primary.main,
          color: theme.vars ? theme.vars.palette.primary.contrastText : theme.palette.primary.contrastText,
          '&:hover': {
            backgroundColor: theme.vars ? theme.vars.palette.primary.light : theme.palette.primary.light,
          },
          ...theme.applyStyles('dark', {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: theme.palette.grey[300],
            },
          }),
        }),
        outlined: ({ theme }) => ({
          borderColor: theme.vars ? theme.vars.palette.divider : theme.palette.divider,
          color: theme.vars ? theme.vars.palette.text.primary : theme.palette.text.primary,
          '&:hover': {
            borderColor: theme.vars ? theme.vars.palette.grey[400] : theme.palette.grey[400],
            backgroundColor: theme.vars ? theme.vars.palette.action.hover : theme.palette.action.hover,
          },
          ...theme.applyStyles('dark', {
            '&:hover': {
              borderColor: theme.palette.grey[600],
            },
          }),
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 10,
          border: '1px solid',
          borderColor: theme.vars ? theme.vars.palette.divider : theme.palette.divider,
          backgroundColor: theme.vars ? theme.vars.palette.background.paper : theme.palette.background.paper,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            borderColor: theme.vars ? theme.vars.palette.grey[400] : theme.palette.grey[400],
            boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.05)',
          },
          ...theme.applyStyles('dark', {
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.4)',
            '&:hover': {
              borderColor: theme.palette.grey[700],
              boxShadow: '0 6px 20px 0 rgba(0, 0, 0, 0.6)',
            },
          }),
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        outlined: ({ theme }) => ({
          borderColor: theme.vars ? theme.vars.palette.divider : theme.palette.divider,
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
            borderColor: theme.vars ? theme.vars.palette.divider : theme.palette.divider,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.vars ? theme.vars.palette.grey[400] : theme.palette.grey[400],
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.vars ? theme.vars.palette.primary.main : theme.palette.primary.main,
            borderWidth: '1.5px',
          },
          ...theme.applyStyles('dark', {
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: theme.palette.grey[600],
            },
          }),
        }),
      },
    },
  },
});
