import { colors, darkColors, lightColors, shadows, transitions, borderRadius, focusRing } from './tokens.js';

export interface NodeStyle {
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  secondaryTextColor: string;
  shadow: string;
  opacity: number;
  transform: string;
  borderWidth: number;
}

export interface NodeStyles {
  default: NodeStyle;
  hover: NodeStyle;
  focused: NodeStyle;
  selected: NodeStyle;
  completed: NodeStyle;
  locked: NodeStyle;
  current: NodeStyle;
}

const baseTransition = `background-color ${transitions.normal} ${transitions.easing.easeOut}, border-color ${transitions.normal} ${transitions.easing.easeOut}, box-shadow ${transitions.normal} ${transitions.easing.easeOut}, transform ${transitions.normal} ${transitions.easing.easeOut}`;

const baseStyle: NodeStyle = {
  backgroundColor: lightColors.surface,
  borderColor: colors.neutral[200],
  textColor: colors.neutral[700],
  secondaryTextColor: colors.neutral[400],
  shadow: shadows.sm,
  opacity: 1,
  transform: 'scale(1)',
  borderWidth: 2,
};

export const lightNodeStyles: NodeStyles = {
  default: { ...baseStyle },
  hover: {
    ...baseStyle,
    backgroundColor: colors.neutral[50],
    borderColor: colors.green[500],
    shadow: shadows.md,
    transform: 'scale(1.02)',
  },
  focused: {
    ...baseStyle,
    borderColor: focusRing.color,
    borderWidth: 3,
    shadow: shadows.md,
  },
  selected: {
    ...baseStyle,
    backgroundColor: colors.green[50],
    borderColor: colors.green[600],
    textColor: colors.green[700],
    secondaryTextColor: colors.green[600],
    shadow: shadows.lg,
    transform: 'scale(1.05)',
  },
  completed: {
    ...baseStyle,
    backgroundColor: colors.green[50],
    borderColor: colors.green[500],
    textColor: colors.green[600],
    secondaryTextColor: colors.green[500],
    shadow: shadows.sm,
  },
  locked: {
    ...baseStyle,
    backgroundColor: colors.neutral[100],
    borderColor: colors.neutral[200],
    textColor: colors.neutral[300],
    secondaryTextColor: colors.neutral[300],
    opacity: 0.6,
    shadow: 'none',
  },
  current: {
    ...baseStyle,
    backgroundColor: colors.green[100],
    borderColor: colors.green[500],
    textColor: colors.green[700],
    secondaryTextColor: colors.green[600],
    shadow: shadows.md,
    borderWidth: 3,
  },
};

export const darkNodeStyles: NodeStyles = {
  default: {
    backgroundColor: darkColors.surface,
    borderColor: colors.neutral[600],
    textColor: darkColors.text,
    secondaryTextColor: darkColors.textSecondary,
    shadow: shadows.sm,
    opacity: 1,
    transform: 'scale(1)',
    borderWidth: 2,
  },
  hover: {
    backgroundColor: darkColors.surfaceElevated,
    borderColor: colors.green[500],
    textColor: darkColors.text,
    secondaryTextColor: darkColors.textSecondary,
    shadow: shadows.md,
    transform: 'scale(1.02)',
    borderWidth: 2,
    opacity: 1,
  },
  focused: {
    backgroundColor: darkColors.surface,
    borderColor: colors.green[500],
    textColor: darkColors.text,
    secondaryTextColor: darkColors.textSecondary,
    shadow: shadows.md,
    opacity: 1,
    transform: 'scale(1)',
    borderWidth: 3,
  },
  selected: {
    backgroundColor: colors.green[700],
    borderColor: colors.green[500],
    textColor: colors.neutral[0],
    secondaryTextColor: colors.neutral[100],
    shadow: shadows.lg,
    transform: 'scale(1.05)',
    borderWidth: 2,
    opacity: 1,
  },
  completed: {
    backgroundColor: colors.green[800],
    borderColor: colors.green[600],
    textColor: colors.green[100],
    secondaryTextColor: colors.green[200],
    shadow: shadows.sm,
    opacity: 1,
    transform: 'scale(1)',
    borderWidth: 2,
  },
  locked: {
    backgroundColor: colors.neutral[800],
    borderColor: colors.neutral[700],
    textColor: colors.neutral[500],
    secondaryTextColor: colors.neutral[500],
    opacity: 0.5,
    shadow: 'none',
    transform: 'scale(1)',
    borderWidth: 2,
  },
  current: {
    backgroundColor: colors.green[800],
    borderColor: colors.green[500],
    textColor: colors.neutral[0],
    secondaryTextColor: colors.green[200],
    shadow: shadows.md,
    opacity: 1,
    transform: 'scale(1)',
    borderWidth: 3,
  },
};

export function getNodeStyles(mode: 'light' | 'dark'): NodeStyles {
  return mode === 'dark' ? darkNodeStyles : lightNodeStyles;
}

export function getNodeStyle(
  mode: 'light' | 'dark',
  state: 'default' | 'hover' | 'focused' | 'selected' | 'completed' | 'locked' | 'current',
): NodeStyle {
  const styles = getNodeStyles(mode);
  return styles[state];
}

export const nodeTransition = baseTransition;
export const nodeBorderRadius = borderRadius.lg;
