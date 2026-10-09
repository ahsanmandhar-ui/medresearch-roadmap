/**
 * Pure layout solver for the floating-window system (docs/PLAN.md M5.1).
 *
 * DOM-free and dependency-free (AGENTS.md §4): every function is a pure
 * geometry transform over {x,y,width,height} rects in stage (screen) space.
 * These encode the window-behavior rules from docs/ARCHITECTURE.md §5:
 *   - dragging/resizing remains inside the stage;
 *   - minimized bars cannot overlap.
 * Consumption (drag/resize handlers, cascade placement, minimized-bar dock) is
 * deferred to M5.2+ when the window components exist — this slice ships the
 * tested solver, mirroring the M3.4a/M3.5a primitive approach.
 */

/** An axis-aligned size. */
export interface Size {
  width: number;
  height: number;
}

/** A point in stage space. */
export interface Point {
  x: number;
  y: number;
}

/** An axis-aligned rectangle in stage space (top-left origin). */
export interface Rect extends Point, Size {}

/** Default minimum window size, keeping content usable while clamped. */
export const DEFAULT_MIN_WINDOW: Size = { width: 280, height: 200 };

/** Clamp `value` to the inclusive [min, max] range; if max < min, returns min. */
export function clamp(value: number, min: number, max: number): number {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
}

/**
 * Clamp a window rect fully inside a stage of the given size. The window is
 * first limited to the stage dimensions (it can never exceed the stage), then
 * its top-left is clamped so every edge stays within bounds. Returns a new rect.
 */
export function clampWindowToStage(rect: Rect, stage: Size): Rect {
  const width = Math.max(0, Math.min(rect.width, stage.width));
  const height = Math.max(0, Math.min(rect.height, stage.height));
  const x = clamp(rect.x, 0, stage.width - width);
  const y = clamp(rect.y, 0, stage.height - height);
  return { x, y, width, height };
}

/**
 * Move a window by `delta` and clamp it inside the stage. The window's size is
 * preserved (dragging never resizes).
 */
export function moveWindow(rect: Rect, delta: Point, stage: Size): Rect {
  return clampWindowToStage(
    { x: rect.x + delta.x, y: rect.y + delta.y, width: rect.width, height: rect.height },
    stage,
  );
}

/**
 * Resize a window to `next` size, honoring a minimum, keeping the top-left
 * fixed, and clamping inside the stage (a window can never grow past the stage).
 */
export function resizeWindow(
  rect: Rect,
  next: Size,
  stage: Size,
  min: Size = DEFAULT_MIN_WINDOW,
): Rect {
  const width = clamp(next.width, min.width, stage.width);
  const height = clamp(next.height, min.height, stage.height);
  return clampWindowToStage({ x: rect.x, y: rect.y, width, height }, stage);
}

/** True when two rects overlap by more than a shared edge (strict interior). */
export function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/** Options for {@link layoutMinimizedBars}. */
export interface MinimizedBarOptions {
  /** Gap between adjacent bars and between rows. Default 8. */
  gap?: number;
  /** Outer margin from the stage edges. Default 8. */
  margin?: number;
}

/**
 * Lay out `count` minimized bars of size `bar` docked along the bottom edge,
 * left-to-right, wrapping to a new row above when a row would overflow.
 * Guarantees bars within a row are `bar.width + gap` apart and rows are
 * `bar.height + gap` apart, so no two bars overlap (ARCHITECTURE.md §5).
 */
export function layoutMinimizedBars(
  count: number,
  stage: Size,
  bar: Size,
  options: MinimizedBarOptions = {},
): Rect[] {
  const gap = options.gap ?? 8;
  const margin = options.margin ?? 8;
  const bars: Rect[] = [];
  if (count <= 0 || bar.width <= 0 || bar.height <= 0) return bars;

  const stepX = bar.width + gap;
  const stepY = bar.height + gap;
  const usableWidth = Math.max(0, stage.width - margin * 2);
  const perRow = Math.max(1, Math.floor((usableWidth + gap) / stepX));

  for (let i = 0; i < count; i++) {
    const row = Math.floor(i / perRow);
    const col = i % perRow;
    const x = margin + col * stepX;
    // Rows stack upward from the bottom edge; never go above the top margin.
    const y = Math.max(margin, stage.height - margin - bar.height - row * stepY);
    bars.push({ x, y, width: bar.width, height: bar.height });
  }
  return bars;
}

/** Options for {@link placeWindowInStage}. */
export interface PlaceWindowOptions {
  /** Cascade offset applied per index. Default 28. */
  offset?: number;
  /** Outer margin from the stage edges. Default 16. */
  margin?: number;
}

/**
 * Place a new window with a staggered cascade offset by `index`, then clamp it
 * inside the stage. Successive windows step down-right, keeping earlier windows
 * partially visible.
 */
export function placeWindowInStage(
  index: number,
  stage: Size,
  window: Size,
  options: PlaceWindowOptions = {},
): Rect {
  const offset = options.offset ?? 28;
  const margin = options.margin ?? 16;
  const step = Math.max(0, index) * offset;
  return clampWindowToStage(
    { x: margin + step, y: margin + step, width: window.width, height: window.height },
    stage,
  );
}

/**
 * Clamp a batch of rects to the stage, preserving order and count.
 * Convenience for re-clamping a full window set after a stage resize.
 */
export function clampAllToStage(rects: readonly Rect[], stage: Size): Rect[] {
  return rects.map((rect) => clampWindowToStage(rect, stage));
}
