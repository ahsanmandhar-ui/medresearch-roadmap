import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  createWindowManagerState,
  windowManagerReducer,
  getManagedPanes,
  getManagedMinimizedBars,
  getManagedViewport,
} from './windowManager.js';
import type { WindowManagerState, WindowManagerCommand } from './windowManager.js';
import { useWindowManager } from './hooks/useWindowManager.js';
import type { Size } from '@research-roadmap/layout';

const STAGE: Size = { width: 1000, height: 800 };

function run(state: WindowManagerState, ...commands: WindowManagerCommand[]): WindowManagerState {
  return commands.reduce(windowManagerReducer, state);
}

/** Assert a value the test has already guaranteed to exist (narrows for strict tsc). */
function req<T>(value: T | undefined | null): T {
  if (value === undefined || value === null) {
    throw new Error('expected a defined value');
  }
  return value;
}

describe('windowManagerReducer', () => {
  it('ACCEPTANCE: single-float invariant — opening a second window docks the first, floats the new', () => {
    const s0 = createWindowManagerState(STAGE);
    const s1 = run(
      s0,
      { type: 'open', id: 'a', size: { width: 300, height: 200 } },
      { type: 'open', id: 'b', size: { width: 300, height: 200 } },
    );
    const panes = getManagedPanes(s1);
    // Both panes exist, painted docked → floating (a behind, b in front).
    expect(panes.map((p) => p.id)).toEqual(['a', 'b']);
    expect(req(panes[0]).state).toBe('docked');
    expect(req(panes[1]).state).toBe('floating');
    expect(req(panes[1]).zIndex).toBeGreaterThan(req(panes[0]).zIndex);
    // Both rects live inside the stage (cascade, clamped).
    for (const p of panes) {
      expect(p.rect.x).toBeGreaterThanOrEqual(0);
      expect(p.rect.y).toBeGreaterThanOrEqual(0);
      expect(p.rect.x + p.rect.width).toBeLessThanOrEqual(STAGE.width);
      expect(p.rect.y + p.rect.height).toBeLessThanOrEqual(STAGE.height);
    }
  });

  it('re-opening an existing window is idempotent (no duplicate id) and raises it to front', () => {
    let s = run(createWindowManagerState(STAGE), { type: 'open', id: 'a', size: { width: 100, height: 100 } });
    s = run(s, { type: 'open', id: 'b', size: { width: 100, height: 100 } });
    s = run(s, { type: 'open', id: 'a', size: { width: 100, height: 100 } });
    // Open order unchanged (no duplicate).
    expect(s.ids).toEqual(['a', 'b']);
    // Re-opening floats 'a' again (displacing 'b') and raises it to the front.
    expect(s.model.floatingId).toBe('a');
    expect(s.focusOrder).toEqual(['b', 'a']);
  });

  it('close removes the window from states, rects, stack and ids', () => {
    let s = run(createWindowManagerState(STAGE), { type: 'open', id: 'a', size: { width: 100, height: 100 } });
    s = run(s, { type: 'close', id: 'a' });
    expect(s.ids).toEqual([]);
    expect(s.rects.a).toBeUndefined();
    expect(s.model.states.a).toBeUndefined();
    expect(s.focusOrder).not.toContain('a');
  });

  it('minimize → minimized state, docks a non-overlapping bar, reserves no inset', () => {
    let s = run(createWindowManagerState(STAGE), { type: 'open', id: 'a', size: { width: 300, height: 200 } });
    s = run(s, { type: 'minimize', id: 'a' });
    const bars = getManagedMinimizedBars(s);
    expect(bars).toHaveLength(1);
    expect(req(bars[0]).id).toBe('a');
    // Bar sits at the bottom of the stage.
    expect(req(bars[0]).rect.y + req(bars[0]).rect.height).toBeLessThanOrEqual(STAGE.height);
    // Minimized windows are not visible → zero insets.
    const vp = getManagedViewport(s);
    expect(vp.insets).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    expect(vp.freeViewport).toEqual({ x: 0, y: 0, width: STAGE.width, height: STAGE.height });
  });

  it('restore re-floats a minimized window', () => {
    let s = run(createWindowManagerState(STAGE), { type: 'open', id: 'a', size: { width: 300, height: 200 } });
    s = run(s, { type: 'minimize', id: 'a' }, { type: 'restore', id: 'a' });
    expect(getManagedPanes(s).find((p) => p.id === 'a')?.state).toBe('floating');
  });

  it('setRect clamps the rect into the stage', () => {
    let s = run(createWindowManagerState(STAGE), { type: 'open', id: 'a', size: { width: 300, height: 200 } });
    s = run(s, { type: 'setRect', id: 'a', rect: { x: -50, y: 5000, width: 300, height: 200 } });
    const rect = req(s.rects.a);
    expect(rect.x).toBe(0);
    expect(rect.y + rect.height).toBeLessThanOrEqual(STAGE.height);
  });

  it('setStage clamps every open window into the new, smaller stage', () => {
    let s = run(createWindowManagerState(STAGE), { type: 'open', id: 'a', size: { width: 900, height: 700 } });
    s = run(s, { type: 'setStage', stage: { width: 400, height: 300 } });
    const rect = req(s.rects.a);
    expect(rect.x + rect.width).toBeLessThanOrEqual(400);
    expect(rect.y + rect.height).toBeLessThanOrEqual(300);
  });

  it('ACCEPTANCE: a visible window reserves viewport insets and shrinks the free area', () => {
    let s = run(createWindowManagerState(STAGE), { type: 'open', id: 'a', size: { width: 300, height: 200 } });
    // Pin it flush to the top-left so its insets are deterministic.
    s = run(s, { type: 'setRect', id: 'a', rect: { x: 0, y: 0, width: 300, height: 200 } });
    const vp = getManagedViewport(s);
    expect(vp.insets.left).toBe(300);
    expect(vp.insets.top).toBe(200);
    expect(vp.freeViewport).toEqual({ x: 300, y: 200, width: 700, height: 600 });
  });
});

describe('useWindowManager (React binding)', () => {
  it('opens a window and exposes a paint-ordered pane', () => {
    const { result } = renderHook(() => useWindowManager({ stage: STAGE }));
    act(() => result.current.open('a', { width: 300, height: 200 }));
    expect(result.current.panes.map((p) => p.id)).toEqual(['a']);
    expect(req(result.current.panes[0]).state).toBe('floating');
  });

  it('minimize moves the pane out of viewport insets and into a docked bar', () => {
    const { result } = renderHook(() => useWindowManager({ stage: STAGE }));
    act(() => result.current.open('a', { width: 300, height: 200 }));
    act(() => result.current.minimize('a'));
    expect(result.current.viewport.insets).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    expect(result.current.minimizedBars.map((b) => b.id)).toEqual(['a']);
  });
});
