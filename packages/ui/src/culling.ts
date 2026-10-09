/**
 * Viewport culling — the first performance unit of the M3 visual-system
 * milestone (docs/PLAN.md M3.5). Rendering every node regardless of what is on
 * screen is the dominant cost for a large research graph. These pure helpers
 * return only the nodes whose world-space rectangle intersects the visible
 * region so a renderer can skip the rest.
 *
 * Deliberately dependency-free and DOM-free (AGENTS.md §4: pure algorithms live
 * outside UI components). The visible region is expressed as world-space bounds
 * (`WorldBounds`) which the caller derives from the camera — see
 * `packages/core` `screenToWorld`, the single source of truth for the
 * world↔screen transform. Keeping that transform in core avoids duplicating it
 * here and avoids a `ui → core` dependency. Actual consumption is deferred
 * until a graph container exists (M4/M5); this slice ships the tested
 * primitives, mirroring the M3.4a keyboard-navigation approach.
 */

/** A node's footprint in world space (top-left origin + size). */
export interface WorldRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** An axis-aligned visible region in world space. */
export interface WorldBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/** Summary of a culling pass, useful for on-screen perf instrumentation. */
export interface CullStats {
  total: number;
  visible: number;
  culled: number;
}

/**
 * True when `rect` overlaps `bounds`, optionally expanded by `padding` world
 * units on every side. Padding lets callers render a margin of nodes just off
 * the edge to avoid pop-in during pan/zoom. Edges that exactly touch count as
 * visible.
 */
export function isRectInBounds(
  rect: WorldRect,
  bounds: WorldBounds,
  padding = 0,
): boolean {
  const left = rect.x;
  const right = rect.x + rect.width;
  const top = rect.y;
  const bottom = rect.y + rect.height;

  return (
    right >= bounds.minX - padding &&
    left <= bounds.maxX + padding &&
    bottom >= bounds.minY - padding &&
    top <= bounds.maxY + padding
  );
}

/**
 * Return the subset of `nodes` intersecting `bounds`, preserving input order
 * and any extra properties (the generic keeps the caller's node type intact).
 */
export function cullNodesToBounds<T extends WorldRect>(
  nodes: readonly T[],
  bounds: WorldBounds,
  padding = 0,
): T[] {
  return nodes.filter((node) => isRectInBounds(node, bounds, padding));
}

/** Count how many of `nodes` are visible within `bounds`. */
export function countVisible(
  nodes: readonly WorldRect[],
  bounds: WorldBounds,
  padding = 0,
): number {
  return cullNodesToBounds(nodes, bounds, padding).length;
}

/** Aggregate visible/culled/total counts for a culling pass. */
export function getCullStats(
  nodes: readonly WorldRect[],
  bounds: WorldBounds,
  padding = 0,
): CullStats {
  const visible = countVisible(nodes, bounds, padding);
  return { total: nodes.length, visible, culled: nodes.length - visible };
}
