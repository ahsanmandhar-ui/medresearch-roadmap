import { describe, it, expect } from 'vitest';
import {
  DEFAULT_MIN_WINDOW,
  clamp,
  clampWindowToStage,
  moveWindow,
  resizeWindow,
  rectsOverlap,
  layoutMinimizedBars,
  placeWindowInStage,
  clampAllToStage,
} from './layoutSolver.js';
import type { Rect, Size } from './layoutSolver.js';

const STAGE: Size = { width: 1200, height: 800 };

describe('clamp', () => {
  it('clamps within [min, max]', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-3, 0, 10)).toBe(0);
    expect(clamp(20, 0, 10)).toBe(10);
  });

  it('returns min when max < min', () => {
    expect(clamp(5, 10, 2)).toBe(10);
  });
});

describe('clampWindowToStage', () => {
  it('leaves a fully-inside window unchanged', () => {
    const rect: Rect = { x: 100, y: 100, width: 400, height: 300 };
    expect(clampWindowToStage(rect, STAGE)).toEqual(rect);
  });

  it('pulls a window back inside when it overflows the right/bottom edges', () => {
    const rect: Rect = { x: 1100, y: 780, width: 400, height: 300 };
    expect(clampWindowToStage(rect, STAGE)).toEqual({ x: 800, y: 500, width: 400, height: 300 });
  });

  it('pulls a window back inside when it has negative coordinates', () => {
    const rect: Rect = { x: -50, y: -20, width: 400, height: 300 };
    expect(clampWindowToStage(rect, STAGE)).toEqual({ x: 0, y: 0, width: 400, height: 300 });
  });

  it('never lets a window exceed the stage size', () => {
    const rect: Rect = { x: 0, y: 0, width: 5000, height: 5000 };
    expect(clampWindowToStage(rect, STAGE)).toEqual({ x: 0, y: 0, width: 1200, height: 800 });
  });

  it('keeps the whole window visible (every edge in bounds)', () => {
    const rect: Rect = { x: 1150, y: 790, width: 200, height: 150 };
    const result = clampWindowToStage(rect, STAGE);
    expect(result.x).toBeGreaterThanOrEqual(0);
    expect(result.y).toBeGreaterThanOrEqual(0);
    expect(result.x + result.width).toBeLessThanOrEqual(STAGE.width);
    expect(result.y + result.height).toBeLessThanOrEqual(STAGE.height);
  });
});

describe('moveWindow', () => {
  it('moves by delta while preserving size', () => {
    const rect: Rect = { x: 100, y: 100, width: 400, height: 300 };
    const moved = moveWindow(rect, { x: 50, y: 30 }, STAGE);
    expect(moved).toEqual({ x: 150, y: 130, width: 400, height: 300 });
  });

  it('clamps a drag that would push the window off the bottom-right', () => {
    const rect: Rect = { x: 100, y: 100, width: 400, height: 300 };
    const moved = moveWindow(rect, { x: 5000, y: 5000 }, STAGE);
    expect(moved).toEqual({ x: 800, y: 500, width: 400, height: 300 });
  });

  it('clamps a drag that would push the window off the top-left', () => {
    const rect: Rect = { x: 100, y: 100, width: 400, height: 300 };
    const moved = moveWindow(rect, { x: -5000, y: -5000 }, STAGE);
    expect(moved).toEqual({ x: 0, y: 0, width: 400, height: 300 });
  });
});

describe('resizeWindow', () => {
  it('resizes while keeping the top-left fixed', () => {
    const rect: Rect = { x: 100, y: 100, width: 400, height: 300 };
    const resized = resizeWindow(rect, { width: 600, height: 400 }, STAGE);
    expect(resized).toEqual({ x: 100, y: 100, width: 600, height: 400 });
  });

  it('enforces a minimum size', () => {
    const rect: Rect = { x: 0, y: 0, width: 400, height: 300 };
    const resized = resizeWindow(rect, { width: 10, height: 10 }, STAGE);
    expect(resized.width).toBe(DEFAULT_MIN_WINDOW.width);
    expect(resized.height).toBe(DEFAULT_MIN_WINDOW.height);
  });

  it('clamps growth so the window never exceeds the stage', () => {
    const rect: Rect = { x: 0, y: 0, width: 400, height: 300 };
    const resized = resizeWindow(rect, { width: 9999, height: 9999 }, STAGE);
    expect(resized).toEqual({ x: 0, y: 0, width: 1200, height: 800 });
  });

  it('keeps the top-left fixed and clamps to the remaining space when a window not at the origin grows past the stage', () => {
    // Regression: previously the size clamped to the absolute stage size and
    // clampWindowToStage then shifted x/y to 0, making the window jump to the
    // origin instead of growing with a fixed top-left (ARCHITECTURE.md §5).
    const rect: Rect = { x: 100, y: 100, width: 300, height: 200 };
    const resized = resizeWindow(rect, { width: 9999, height: 9999 }, STAGE);
    expect(resized).toEqual({ x: 100, y: 100, width: STAGE.width - 100, height: STAGE.height - 100 });
  });

  it('accepts a custom minimum', () => {
    const rect: Rect = { x: 0, y: 0, width: 400, height: 300 };
    const resized = resizeWindow(
      rect,
      { width: 10, height: 10 },
      STAGE,
      { width: 500, height: 500 },
    );
    expect(resized.width).toBe(500);
    expect(resized.height).toBe(500);
  });
});

describe('rectsOverlap', () => {
  it('is true for overlapping interiors', () => {
    const a: Rect = { x: 0, y: 0, width: 100, height: 100 };
    const b: Rect = { x: 50, y: 50, width: 100, height: 100 };
    expect(rectsOverlap(a, b)).toBe(true);
  });

  it('is false for rects that only share an edge', () => {
    const a: Rect = { x: 0, y: 0, width: 100, height: 100 };
    const b: Rect = { x: 100, y: 0, width: 100, height: 100 };
    expect(rectsOverlap(a, b)).toBe(false);
  });

  it('is false for disjoint rects', () => {
    const a: Rect = { x: 0, y: 0, width: 100, height: 100 };
    const b: Rect = { x: 200, y: 200, width: 100, height: 100 };
    expect(rectsOverlap(a, b)).toBe(false);
  });
});

describe('layoutMinimizedBars', () => {
  const bar: Size = { width: 160, height: 40 };

  it('returns an empty list for zero count', () => {
    expect(layoutMinimizedBars(0, STAGE, bar)).toEqual([]);
  });

  it('lays a single bar at the bottom-left with margin', () => {
    const bars = layoutMinimizedBars(1, STAGE, bar);
    expect(bars).toHaveLength(1);
    expect(bars[0]).toEqual({ x: 8, y: STAGE.height - 8 - bar.height, width: 160, height: 40 });
  });

  it('spaces bars in a row so none overlap', () => {
    const bars = layoutMinimizedBars(3, STAGE, bar);
    expect(bars).toHaveLength(3);
    for (let i = 0; i < bars.length; i++) {
      for (let j = i + 1; j < bars.length; j++) {
        const a = bars[i];
        const b = bars[j];
        if (!a || !b) continue;
        expect(rectsOverlap(a, b)).toBe(false);
      }
    }
  });

  it('keeps every bar inside the stage', () => {
    const bars = layoutMinimizedBars(40, STAGE, bar);
    for (const r of bars) {
      expect(r.x).toBeGreaterThanOrEqual(0);
      expect(r.y).toBeGreaterThanOrEqual(0);
      expect(r.x + r.width).toBeLessThanOrEqual(STAGE.width);
      expect(r.y + r.height).toBeLessThanOrEqual(STAGE.height);
    }
  });

  it('wraps to a second row (higher on screen) when the row overflows', () => {
    const narrow: Size = { width: 400, height: 800 };
    const bars = layoutMinimizedBars(6, narrow, bar);
    // perRow = floor((400-16+8)/(160+8)) = floor(392/168) = 2
    const firstRowY = bars[0]?.y ?? 0;
    const secondRowY = bars[2]?.y ?? 0;
    expect(secondRowY).toBeLessThan(firstRowY);
  });
});

describe('placeWindowInStage', () => {
  const win: Size = { width: 600, height: 400 };

  it('places the first window at the margin', () => {
    expect(placeWindowInStage(0, STAGE, win)).toEqual({ x: 16, y: 16, width: 600, height: 400 });
  });

  it('cascades successive windows down-right', () => {
    const a = placeWindowInStage(0, STAGE, win);
    const b = placeWindowInStage(1, STAGE, win);
    expect(b.x).toBeGreaterThan(a.x);
    expect(b.y).toBeGreaterThan(a.y);
  });

  it('clamps a deep cascade so the window stays inside the stage', () => {
    const placed = placeWindowInStage(1000, STAGE, win);
    expect(placed.x + placed.width).toBeLessThanOrEqual(STAGE.width);
    expect(placed.y + placed.height).toBeLessThanOrEqual(STAGE.height);
  });
});

describe('clampAllToStage', () => {
  it('clamps every rect and preserves count and order', () => {
    const rects: Rect[] = [
      { x: 1150, y: 780, width: 200, height: 150 },
      { x: 100, y: 100, width: 300, height: 200 },
      { x: -50, y: -50, width: 200, height: 150 },
    ];
    const clamped = clampAllToStage(rects, STAGE);
    expect(clamped).toHaveLength(3);
    for (const r of clamped) {
      expect(r.x).toBeGreaterThanOrEqual(0);
      expect(r.y).toBeGreaterThanOrEqual(0);
      expect(r.x + r.width).toBeLessThanOrEqual(STAGE.width);
      expect(r.y + r.height).toBeLessThanOrEqual(STAGE.height);
    }
    // The middle, already-inside rect must be unchanged.
    expect(clamped[1]).toEqual(rects[1]);
  });
});
