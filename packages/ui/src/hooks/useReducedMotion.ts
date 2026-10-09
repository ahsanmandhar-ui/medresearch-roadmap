import { useMediaQuery } from './useMediaQuery.js';

/**
 * Media feature used to detect the operating-system "reduce motion" preference.
 * Consumers should disable nonessential animation when this matches.
 */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Returns true when the user has requested reduced motion at the OS/browser
 * level. Built on `useMediaQuery` so it inherits SSR safety and change
 * subscription behaviour.
 */
export function useReducedMotion(): boolean {
  return useMediaQuery(REDUCED_MOTION_QUERY);
}
