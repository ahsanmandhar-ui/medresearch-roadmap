import { describe, it, expect } from 'vitest';
import { applyWindowGesture } from './windowGesture.js';
import type { WindowGestureMode } from './windowGesture.js';
import type { Rect, Size, Point } from '@research-roadmap/layout';

const STAGE: Size = { width: 1000, height: 800 };
const START: Point = { x: 100, y: 100 };

function rect(x: number, y: number, width: number, height: number): Rect {
  return { x, y, width, height };
}

function gesture(mode: WindowGestureMode, startRect: Rect, currentPointer: Point, minSize?: Size) {
  return applyWindowGesture({
    mode,
    startRect,
    startPointer: START,
    currentPointer,
    stage: STAGE,
    ...(minSize !== undefined ? { minSize } : {}),
  });
}

describe('applyWindowGesture', () => {
  it('moves the window by the pointer delta without changing size', () => {
    const start = rect(100, 100, 300, 200);
    const next = gesture('move', start, { x: 180, y: 145 });
    expect(next).toEqual({ x: 180, y: 145, width: 300, height: 200 });
  });

  it('clamps a move so the window stays inside the stage', () => {
    const start = rect(100, 100, 300, 200);
    // Drag far past the right/bottom edge.
    const next = gesture('move', start, { x: 5000, y: 5000 });
    expect(next.x).toBe(STAGE.width - start.width); // 700
    expect(next.y).toBe(STAGE.height - start.height); // 600
    expect(next.width).toBe(300);
    expect(next.height).toBe(200);
  });

  it('clamps a move so the window cannot go negative', () => {
    const start = rect(100, 100, 300, 200);
    const next = gesture('move', start, { x: -500, y: -500 });
    expect(next.x).toBe(0);
    expect(next.y).toBe(0);
  });

  it('resizes the right edge (resize-e) keeping height and top-left', () => {
    const start = rect(100, 100, 300, 200);
    const next = gesture('resize-e', start, { x: 250, y: 150 }); // dx=+150
    expect(next).toEqual({ x: 100, y: 100, width: 450, height: 200 });
  });

  it('resizes the bottom edge (resize-s) keeping width and top-left', () => {
    const start = rect(100, 100, 300, 200);
    const next = gesture('resize-s', start, { x: 150, y: 280 }); // dy=+180
    expect(next).toEqual({ x: 100, y: 100, width: 300, height: 380 });
  });

  it('resizes the corner (resize-se) on both axes', () => {
    const start = rect(100, 100, 300, 200);
    const next = gesture('resize-se', start, { x: 160, y: 130 }); // dx=60 dy=30
    expect(next).toEqual({ x: 100, y: 100, width: 360, height: 230 });
  });

  it('enforces the minimum size when resizing smaller', () => {
    const start = rect(100, 100, 300, 200);
    const next = gesture('resize-se', start, { x: 0, y: 0 }, { width: 280, height: 200 });
    // dx=dy=-100 would shrink to 200x100, but min clamps to 280x200.
    expect(next.width).toBe(280);
    expect(next.height).toBe(200);
  });

  it('clamps a resize so the window cannot exceed the stage', () => {
    const start = rect(100, 100, 300, 200);
    const next = gesture('resize-se', start, { x: 9000, y: 9000 });
    // width clamps to stage.width - x = 900; height to stage.height - y = 700.
    expect(next.width).toBe(STAGE.width - start.x);
    expect(next.height).toBe(STAGE.height - start.y);
    expect(next.x).toBe(100);
    expect(next.y).toBe(100);
  });

  it('ignores a negative delta for resize-e beyond the minimum', () => {
    const start = rect(500, 500, 300, 200);
    const next = gesture('resize-e', start, { x: 50, y: 520 }); // dx=-450
    expect(next.width).toBe(280); // DEFAULT_MIN_WINDOW.width
  });
});
