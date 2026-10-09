import { describe, it, expect } from 'vitest';
import {
  lightNodeStyles,
  darkNodeStyles,
  getNodeStyles,
  getNodeStyle,
  nodeTransition,
  nodeBorderRadius,
} from './nodeStyles.js';

describe('lightNodeStyles', () => {
  it('has all node states', () => {
    expect(lightNodeStyles.default).toBeDefined();
    expect(lightNodeStyles.hover).toBeDefined();
    expect(lightNodeStyles.focused).toBeDefined();
    expect(lightNodeStyles.selected).toBeDefined();
    expect(lightNodeStyles.completed).toBeDefined();
    expect(lightNodeStyles.locked).toBeDefined();
    expect(lightNodeStyles.current).toBeDefined();
  });

  it('has correct default colors', () => {
    expect(lightNodeStyles.default.backgroundColor).toBe('#f5f5f5');
    expect(lightNodeStyles.default.textColor).toBe('#1a1a1a');
  });

  it('has hover state with scale transform', () => {
    expect(lightNodeStyles.hover.transform).toBe('scale(1.02)');
  });

  it('has selected state with larger scale', () => {
    expect(lightNodeStyles.selected.transform).toBe('scale(1.05)');
  });

  it('has locked state with reduced opacity', () => {
    expect(lightNodeStyles.locked.opacity).toBeLessThan(1);
  });

  it('has focused state with thicker border', () => {
    expect(lightNodeStyles.focused.borderWidth).toBeGreaterThan(lightNodeStyles.default.borderWidth);
  });
});

describe('darkNodeStyles', () => {
  it('has all node states', () => {
    expect(darkNodeStyles.default).toBeDefined();
    expect(darkNodeStyles.hover).toBeDefined();
    expect(darkNodeStyles.focused).toBeDefined();
    expect(darkNodeStyles.selected).toBeDefined();
    expect(darkNodeStyles.completed).toBeDefined();
    expect(darkNodeStyles.locked).toBeDefined();
    expect(darkNodeStyles.current).toBeDefined();
  });

  it('has correct default colors', () => {
    expect(darkNodeStyles.default.backgroundColor).toBe('#1a1a1a');
    expect(darkNodeStyles.default.textColor).toBe('#f5f5f5');
  });

  it('has selected state with green background', () => {
    expect(darkNodeStyles.selected.backgroundColor).toBe('#1a3d26');
  });
});

describe('getNodeStyles', () => {
  it('returns light styles for light mode', () => {
    expect(getNodeStyles('light')).toBe(lightNodeStyles);
  });

  it('returns dark styles for dark mode', () => {
    expect(getNodeStyles('dark')).toBe(darkNodeStyles);
  });
});

describe('getNodeStyle', () => {
  it('returns correct style for light mode', () => {
    const style = getNodeStyle('light', 'selected');
    expect(style).toBe(lightNodeStyles.selected);
  });

  it('returns correct style for dark mode', () => {
    const style = getNodeStyle('dark', 'hover');
    expect(style).toBe(darkNodeStyles.hover);
  });
});

describe('nodeTransition', () => {
  it('has transition string', () => {
    expect(nodeTransition).toContain('background-color');
    expect(nodeTransition).toContain('transform');
  });
});

describe('nodeBorderRadius', () => {
  it('has border radius value', () => {
    expect(nodeBorderRadius).toBe('8px');
  });
});
