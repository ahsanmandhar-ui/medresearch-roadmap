import { describe, it, expect } from 'vitest';
import {
  isRectInBounds,
  cullNodesToBounds,
  countVisible,
  getCullStats,
} from './culling.js';
import type { WorldBounds, WorldRect } from './culling.js';

const bounds: WorldBounds = { minX: 0, minY: 0, maxX: 1000, maxY: 800 };

function rect(id: string, x: number, y: number, w = 200, h = 80): WorldRect & { id: string } {
  return { id, x, y, width: w, height: h };
}

describe('isRectInBounds', () => {
  it('is true for a rect fully inside the bounds', () => {
    expect(isRectInBounds(rect('a', 100, 100), bounds)).toBe(true);
  });

  it('is true for a rect partially overlapping each edge', () => {
    // extends past the right edge
    expect(isRectInBounds(rect('r', 950, 100), bounds)).toBe(true);
    // extends past the top (negative y)
    expect(isRectInBounds(rect('t', 100, -40), bounds)).toBe(true);
  });

  it('is false for a rect entirely to the right', () => {
    expect(isRectInBounds(rect('r', 1001, 100), bounds)).toBe(false);
  });

  it('is false for a rect entirely below', () => {
    expect(isRectInBounds(rect('b', 100, 801), bounds)).toBe(false);
  });

  it('treats an exactly touching edge as visible', () => {
    // rect right edge == bounds.minX
    expect(isRectInBounds({ x: -200, y: 100, width: 200, height: 80 }, bounds)).toBe(true);
    // rect left edge == bounds.maxX
    expect(isRectInBounds({ x: 1000, y: 100, width: 200, height: 80 }, bounds)).toBe(true);
  });

  it('includes off-edge rects within the padding margin', () => {
    const offscreen = rect('r', 1100, 100);
    expect(isRectInBounds(offscreen, bounds)).toBe(false);
    expect(isRectInBounds(offscreen, bounds, 150)).toBe(true);
  });
});

describe('cullNodesToBounds', () => {
  it('returns only visible nodes, preserving order', () => {
    const nodes = [
      rect('visible', 100, 100),
      rect('offscreen-right', 2000, 100),
      rect('visible2', 400, 300),
      rect('offscreen-below', 100, 3000),
    ];
    const result = cullNodesToBounds(nodes, bounds);
    expect(result.map((n) => n.id)).toEqual(['visible', 'visible2']);
  });

  it('preserves extra properties via the generic type', () => {
    const nodes = [rect('a', 100, 100)];
    const result = cullNodesToBounds(nodes, bounds);
    expect(result[0]?.id).toBe('a');
  });

  it('returns an empty array for empty input', () => {
    expect(cullNodesToBounds([], bounds)).toEqual([]);
  });

  it('applies padding to include near-edge nodes', () => {
    const nodes = [rect('near', 1100, 100)];
    expect(cullNodesToBounds(nodes, bounds)).toEqual([]);
    expect(cullNodesToBounds(nodes, bounds, 150).map((n) => n.id)).toEqual(['near']);
  });
});

describe('countVisible', () => {
  it('counts visible nodes', () => {
    const nodes = [
      rect('a', 100, 100),
      rect('b', 2000, 100),
      rect('c', 400, 300),
    ];
    expect(countVisible(nodes, bounds)).toBe(2);
  });
});

describe('getCullStats', () => {
  it('reports total, visible, and culled counts', () => {
    const nodes = [
      rect('a', 100, 100),
      rect('b', 2000, 100),
      rect('c', 400, 300),
      rect('d', 100, 3000),
    ];
    expect(getCullStats(nodes, bounds)).toEqual({ total: 4, visible: 2, culled: 2 });
  });

  it('reports zero visible for an empty graph', () => {
    expect(getCullStats([], bounds)).toEqual({ total: 0, visible: 0, culled: 0 });
  });
});
