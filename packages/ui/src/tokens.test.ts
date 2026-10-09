import { describe, it, expect } from 'vitest';
import {
  colors,
  darkColors,
  lightColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  zIndex,
  transitions,
  breakpoints,
  focusRing,
} from './tokens.js';

describe('colors', () => {
  it('has neutral color scale', () => {
    expect(colors.neutral[0]).toBe('#ffffff');
    expect(colors.neutral[900]).toBe('#000000');
  });

  it('has green color scale', () => {
    expect(colors.green[50]).toBe('#e8f5e9');
    expect(colors.green[900]).toBe('#051a0c');
  });

  it('has semantic colors', () => {
    expect(colors.semantic.success).toBe('#2d5a3d');
    expect(colors.semantic.error).toBe('#dc2626');
    expect(colors.semantic.warning).toBe('#f59e0b');
  });
});

describe('darkColors', () => {
  it('has dark theme colors', () => {
    expect(darkColors.background).toBe('#0d0d0d');
    expect(darkColors.text).toBe('#f5f5f5');
    expect(darkColors.primary).toBe('#4a7c59');
  });
});

describe('lightColors', () => {
  it('has light theme colors', () => {
    expect(lightColors.background).toBe('#ffffff');
    expect(lightColors.text).toBe('#1a1a1a');
    expect(lightColors.primary).toBe('#2d5a3d');
  });
});

describe('typography', () => {
  it('has font families', () => {
    expect(typography.fontFamily.sans).toContain('system');
    expect(typography.fontFamily.mono).toContain('monospace');
  });

  it('has font sizes', () => {
    expect(typography.fontSize.xs).toBe('12px');
    expect(typography.fontSize.base).toBe('16px');
    expect(typography.fontSize['5xl']).toBe('48px');
  });

  it('has font weights', () => {
    expect(typography.fontWeight.normal).toBe(400);
    expect(typography.fontWeight.bold).toBe(700);
  });
});

describe('spacing', () => {
  it('has spacing scale', () => {
    expect(spacing[0]).toBe('0');
    expect(spacing[4]).toBe('16px');
    expect(spacing[16]).toBe('64px');
  });
});

describe('borderRadius', () => {
  it('has border radius scale', () => {
    expect(borderRadius.none).toBe('0');
    expect(borderRadius.md).toBe('6px');
    expect(borderRadius.full).toBe('9999px');
  });
});

describe('shadows', () => {
  it('has shadow scale', () => {
    expect(shadows.sm).toContain('rgba');
    expect(shadows.xl).toContain('rgba');
  });
});

describe('zIndex', () => {
  it('has z-index scale', () => {
    expect(zIndex.base).toBe(0);
    expect(zIndex.modal).toBe(1300);
    expect(zIndex.toast).toBe(1400);
  });
});

describe('transitions', () => {
  it('has transition durations', () => {
    expect(transitions.fast).toBe('150ms');
    expect(transitions.normal).toBe('250ms');
    expect(transitions.slow).toBe('350ms');
  });

  it('has easing functions', () => {
    expect(transitions.easing.ease).toBe('ease');
    expect(transitions.easing.easeInOut).toBe('ease-in-out');
  });
});

describe('breakpoints', () => {
  it('has responsive breakpoints', () => {
    expect(breakpoints.mobile).toBe('639px');
    expect(breakpoints.tablet).toBe('1023px');
    expect(breakpoints.desktop).toBe('1024px');
  });
});

describe('focusRing', () => {
  it('has focus ring tokens', () => {
    expect(focusRing.width).toBe('2px');
    expect(focusRing.color).toBe('#2d5a3d');
    expect(focusRing.offset).toBe('2px');
  });
});
