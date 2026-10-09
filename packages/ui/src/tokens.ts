export const colors = {
  neutral: {
    0: '#ffffff',
    50: '#f5f5f5',
    100: '#e8e8e8',
    200: '#d0d0d0',
    300: '#a0a0a0',
    400: '#767676',
    500: '#4a4a4a',
    600: '#333333',
    700: '#1a1a1a',
    800: '#0d0d0d',
    900: '#000000',
  },
  green: {
    50: '#e8f5e9',
    100: '#c8e6c9',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#4a7c59',
    600: '#2d5a3d',
    700: '#1a3d26',
    800: '#0f2a18',
    900: '#051a0c',
  },
  semantic: {
    success: '#2d5a3d',
    successLight: '#e8f5e9',
    warning: '#f59e0b',
    warningLight: '#fef3c7',
    error: '#dc2626',
    errorLight: '#fee2e2',
    info: '#3b82f6',
    infoLight: '#dbeafe',
  },
} as const;

export const darkColors = {
  background: '#0d0d0d',
  surface: '#1a1a1a',
  surfaceElevated: '#262626',
  text: '#f5f5f5',
  textSecondary: '#a0a0a0',
  textMuted: '#767676',
  border: '#333333',
  borderFocus: '#4a7c59',
  primary: '#4a7c59',
  primaryHover: '#66bb6a',
  primaryActive: '#2d5a3d',
} as const;

export const lightColors = {
  background: '#ffffff',
  surface: '#f5f5f5',
  surfaceElevated: '#ffffff',
  text: '#1a1a1a',
  textSecondary: '#4a4a4a',
  textMuted: '#767676',
  border: '#d0d0d0',
  borderFocus: '#2d5a3d',
  primary: '#2d5a3d',
  primaryHover: '#1a3d26',
  primaryActive: '#0f2a18',
} as const;

export const typography = {
  fontFamily: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    base: '16px',
    lg: '18px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '30px',
    '4xl': '36px',
    '5xl': '48px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.6,
  },
} as const;

export const spacing = {
  0: '0',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

export const borderRadius = {
  none: '0',
  sm: '4px',
  md: '6px',
  lg: '8px',
  xl: '12px',
  '2xl': '16px',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px rgba(0, 0, 0, 0.07)',
  lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
} as const;

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  fixed: 1200,
  modal: 1300,
  toast: 1400,
} as const;

export const transitions = {
  fast: '150ms',
  normal: '250ms',
  slow: '350ms',
  easing: {
    ease: 'ease',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

export const breakpoints = {
  mobile: '639px',
  tablet: '1023px',
  desktop: '1024px',
} as const;

export const focusRing = {
  width: '2px',
  color: '#2d5a3d',
  offset: '2px',
} as const;

export type ThemeColors = typeof lightColors;
export type ThemeMode = 'light' | 'dark';
