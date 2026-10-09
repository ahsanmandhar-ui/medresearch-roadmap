/**
 * Pure motion helpers. When a user prefers reduced motion, nonessential
 * animation must be disabled (AGENTS.md §4/§8, ARCHITECTURE.md §5/§8). These
 * helpers collapse animation-related style values to static equivalents while
 * preserving state-conveying values where possible.
 */

/** Transition value that removes all animation. */
export const NO_MOTION = 'none';

/**
 * Resolve a CSS `transition` shorthand for the current motion preference.
 * Returns `none` when reduced motion is preferred, otherwise the base value.
 */
export function resolveTransition(baseTransition: string, prefersReducedMotion: boolean): string {
  return prefersReducedMotion ? NO_MOTION : baseTransition;
}

/**
 * Resolve a CSS transition `duration` for the current motion preference.
 * Collapses to `0ms` when reduced motion is preferred so state changes apply
 * instantly without motion.
 */
export function resolveDuration(duration: string, prefersReducedMotion: boolean): string {
  return prefersReducedMotion ? '0ms' : duration;
}
