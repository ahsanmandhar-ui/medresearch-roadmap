import { describe, it, expect } from 'vitest';
import { resolveTransition, resolveDuration, NO_MOTION } from './motion.js';

describe('resolveTransition', () => {
  it('returns the base transition when motion is allowed', () => {
    expect(resolveTransition('opacity 250ms ease', false)).toBe('opacity 250ms ease');
  });

  it('removes the transition when reduced motion is preferred', () => {
    expect(resolveTransition('opacity 250ms ease', true)).toBe(NO_MOTION);
  });

  it('uses the NO_MOTION sentinel for an empty base when reduced motion is preferred', () => {
    expect(resolveTransition('', true)).toBe(NO_MOTION);
  });
});

describe('resolveDuration', () => {
  it('returns the base duration when motion is allowed', () => {
    expect(resolveDuration('250ms', false)).toBe('250ms');
  });

  it('collapses the duration to zero when reduced motion is preferred', () => {
    expect(resolveDuration('250ms', true)).toBe('0ms');
  });
});
