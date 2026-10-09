import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useReducedMotion, REDUCED_MOTION_QUERY } from './useReducedMotion.js';

function mockMatchMedia(matchesFor: (query: string) => boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: matchesFor(query),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

describe('useReducedMotion', () => {
  beforeEach(() => {
    mockMatchMedia(() => false);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('queries the prefers-reduced-motion media feature', () => {
    renderHook(() => useReducedMotion());
    expect(window.matchMedia).toHaveBeenCalledWith(REDUCED_MOTION_QUERY);
  });

  it('returns true when the user prefers reduced motion', () => {
    mockMatchMedia((query) => query === REDUCED_MOTION_QUERY);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('returns false when the user does not prefer reduced motion', () => {
    mockMatchMedia(() => false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });
});
