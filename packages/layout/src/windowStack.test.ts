import { describe, it, expect } from 'vitest';
import {
  STACK_LAYER,
  bringToFront,
  removeFromStack,
  stackIndex,
  isOnTop,
  getStackingOrder,
  getZIndex,
} from './windowStack.js';
import type { StackedPane } from './windowStack.js';

describe('STACK_LAYER', () => {
  it('orders bands back-to-front (minimized < docked < floating)', () => {
    expect(STACK_LAYER.minimized).toBeLessThan(STACK_LAYER.docked);
    expect(STACK_LAYER.docked).toBeLessThan(STACK_LAYER.floating);
  });
});

describe('bringToFront', () => {
  it('moves an existing id to the end without duplicating it', () => {
    expect(bringToFront(['a', 'b', 'c'], 'a')).toEqual(['b', 'c', 'a']);
  });

  it('appends an unknown id', () => {
    expect(bringToFront(['a', 'b'], 'z')).toEqual(['a', 'b', 'z']);
  });

  it('does not mutate the input', () => {
    const order = ['a', 'b'];
    bringToFront(order, 'a');
    expect(order).toEqual(['a', 'b']);
  });
});

describe('removeFromStack', () => {
  it('removes the id', () => {
    expect(removeFromStack(['a', 'b', 'c'], 'b')).toEqual(['a', 'c']);
  });

  it('is a no-op for an unknown id but still returns a new array', () => {
    const order = ['a', 'b'];
    const next = removeFromStack(order, 'z');
    expect(next).toEqual(['a', 'b']);
    expect(next).not.toBe(order);
  });
});

describe('stackIndex / isOnTop', () => {
  it('reports position or -1', () => {
    expect(stackIndex(['a', 'b', 'c'], 'c')).toBe(2);
    expect(stackIndex(['a', 'b'], 'z')).toBe(-1);
  });

  it('isOnTop is true only for the last id', () => {
    expect(isOnTop(['a', 'b', 'c'], 'c')).toBe(true);
    expect(isOnTop(['a', 'b', 'c'], 'a')).toBe(false);
    expect(isOnTop([], 'a')).toBe(false);
  });
});

describe('getStackingOrder', () => {
  it('orders bands back-to-front regardless of input order', () => {
    const panes: StackedPane[] = [
      { id: 'f', state: 'floating' },
      { id: 'd', state: 'docked' },
      { id: 'm', state: 'minimized' },
    ];
    expect(getStackingOrder(panes, ['f', 'd', 'm']).map((p) => p.id)).toEqual([
      'm',
      'd',
      'f',
    ]);
  });

  it('breaks ties within a band by focus order', () => {
    const panes: StackedPane[] = [
      { id: 'd1', state: 'docked' },
      { id: 'd2', state: 'docked' },
      { id: 'd3', state: 'docked' },
    ];
    // Focus order d3 → d1 → d2 means d3 is furthest back.
    expect(getStackingOrder(panes, ['d3', 'd1', 'd2']).map((p) => p.id)).toEqual([
      'd3',
      'd1',
      'd2',
    ]);
  });

  it('sorts panes absent from the order behind known panes in the same band', () => {
    const panes: StackedPane[] = [
      { id: 'known', state: 'docked' },
      { id: 'unknown', state: 'docked' },
    ];
    expect(getStackingOrder(panes, ['known']).map((p) => p.id)).toEqual([
      'unknown',
      'known',
    ]);
  });

  it('does not mutate the input array', () => {
    const panes: StackedPane[] = [
      { id: 'f', state: 'floating' },
      { id: 'd', state: 'docked' },
    ];
    getStackingOrder(panes, ['d', 'f']);
    expect(panes.map((p) => p.id)).toEqual(['f', 'd']);
  });
});

describe('getZIndex', () => {
  it('separates bands (floating > docked > minimized)', () => {
    expect(getZIndex('m', 'minimized', [])).toBeLessThan(
      getZIndex('d', 'docked', []),
    );
    expect(getZIndex('d', 'docked', [])).toBeLessThan(
      getZIndex('f', 'floating', []),
    );
  });

  it('preserves focus order within a band', () => {
    const order = ['d1', 'd2'];
    expect(getZIndex('d1', 'docked', order)).toBeLessThan(
      getZIndex('d2', 'docked', order),
    );
  });

  it('never lets a band bleed into the next (offset clamped below the gap)', () => {
    // A huge stack index must still keep a docked pane in the docked band.
    const order = Array.from({ length: 500 }, (_, i) => `d${i}`);
    const z = getZIndex('d499', 'docked', order);
    expect(z).toBeGreaterThanOrEqual(STACK_LAYER.docked);
    expect(z).toBeLessThan(STACK_LAYER.floating);
  });

  it('uses offset 0 for ids absent from the order', () => {
    expect(getZIndex('absent', 'floating', ['a', 'b'])).toBe(STACK_LAYER.floating);
  });
});
