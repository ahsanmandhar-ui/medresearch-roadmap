/**
 * Pure pane-stacking / z-order logic (docs/PLAN.md M5.5, docs/ARCHITECTURE.md
 * §5, §8). DOM-free and dependency-free (AGENTS.md §4).
 *
 * The single-float invariant (ARCHITECTURE.md §5: "one detached partition at a
 * time") is enforced by the M5.2 state machine — NOT here. This module answers
 * only the orthogonal question: when several panes overlap on the stage, which
 * is painted on top? It tracks a focus/stacking order (a list of window ids,
 * back → front) and derives stable z-index bands:
 *
 *   minimized (0)  <  docked (100)  <  floating (200)
 *
 * Within a band, the focus order breaks ties (most-recently-focused in front).
 * The focus order is forward-compatible with future multi-pane layouts without
 * changing the single-float rule. React bindings that bring a pane to front on
 * click/focus arrive with the window manager (M5.5+ UI layer).
 */

/** Lifecycle bands used to derive coarse z-index layers, back → front. */
export const STACK_LAYER = {
  /** Minimized bars sit at the very back. */
  minimized: 0,
  /** Docked/inline panes sit above minimized bars. */
  docked: 100,
  /** Floating panes sit above everything docked. */
  floating: 200,
} as const;

/** Gap between bands; within-band offsets are clamped below this so a band can
 * never bleed into the next one (e.g. a stack of 200+ panes stays docked). */
const BAND_GAP = 100;

/** Window states that participate in stacking (mirrors WindowState). */
export type StackableState = 'docked' | 'floating' | 'minimized';

/** A pane to be ordered for painting. */
export interface StackedPane {
  id: string;
  state: StackableState;
}

function bandOf(state: StackableState): number {
  switch (state) {
    case 'minimized':
      return STACK_LAYER.minimized;
    case 'floating':
      return STACK_LAYER.floating;
    case 'docked':
      return STACK_LAYER.docked;
    default: {
      // Exhaustiveness guard.
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}

/**
 * Move `id` to the front of the stacking order (most recently focused).
 * Returns a NEW array; the input is never mutated. Unknown ids are appended.
 */
export function bringToFront(order: readonly string[], id: string): string[] {
  return [...order.filter((existing) => existing !== id), id];
}

/** Remove `id` from the stacking order (e.g. on close). Returns a new array;
 * an unknown id is a no-op that still returns a fresh array. */
export function removeFromStack(order: readonly string[], id: string): string[] {
  return order.filter((existing) => existing !== id);
}

/** Position of `id` within the stacking order, or -1 when absent. */
export function stackIndex(order: readonly string[], id: string): number {
  return order.indexOf(id);
}

/** True when `id` is at the front (top) of the stack. */
export function isOnTop(order: readonly string[], id: string): boolean {
  return order.length > 0 && order[order.length - 1] === id;
}

/**
 * Sort panes back → front for painting: by band first (minimized, then docked,
 * then floating), then by focus order within a band (earlier = further back).
 * Panes absent from `order` sort behind known panes within their band. Returns
 * a new array; inputs are not mutated.
 */
export function getStackingOrder(
  panes: readonly StackedPane[],
  order: readonly string[],
): StackedPane[] {
  const focusRank = (id: string): number => {
    const idx = order.indexOf(id);
    return idx === -1 ? -1 : idx;
  };

  return [...panes].sort((a, b) => {
    const bandDelta = bandOf(a.state) - bandOf(b.state);
    if (bandDelta !== 0) return bandDelta;
    return focusRank(a.id) - focusRank(b.id);
  });
}

/**
 * Compute a concrete z-index for a pane. The band sets the coarse layer; the
 * pane's position in the focus order is a fine-grained offset clamped below the
 * band gap, so relative order is preserved within a band while bands never
 * overlap. Panes absent from `order` use offset 0. Always non-negative.
 */
export function getZIndex(
  id: string,
  state: StackableState,
  order: readonly string[],
): number {
  const base = bandOf(state);
  const idx = order.indexOf(id);
  const offset = idx === -1 ? 0 : Math.min(idx, BAND_GAP - 1);
  return base + offset;
}
