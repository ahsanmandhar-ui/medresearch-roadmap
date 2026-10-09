import { describe, it, expect } from 'vitest';
import {
  createFloatingWindowModel,
  getWindowState,
  reduceWindow,
  isModelConsistent,
  type FloatingWindowModel,
} from './floatingWindow.js';

function modelWith(...ids: string[]): FloatingWindowModel {
  return createFloatingWindowModel(ids);
}

describe('createFloatingWindowModel', () => {
  it('defaults all known ids to docked with no active float', () => {
    const model = modelWith('a', 'b');
    expect(getWindowState(model, 'a')).toBe('docked');
    expect(getWindowState(model, 'b')).toBe('docked');
    expect(model.floatingId).toBeNull();
  });

  it('treats unknown ids as docked', () => {
    const model = createFloatingWindowModel();
    expect(getWindowState(model, 'ghost')).toBe('docked');
  });
});

describe('reduceWindow — float', () => {
  it('floats a docked window and records it as active', () => {
    const next = reduceWindow(modelWith('a'), { type: 'float', id: 'a' });
    expect(getWindowState(next, 'a')).toBe('floating');
    expect(next.floatingId).toBe('a');
  });

  it('does not mutate the input model', () => {
    const model = modelWith('a');
    const next = reduceWindow(model, { type: 'float', id: 'a' });
    expect(model.states.a).toBe('docked');
    expect(model.floatingId).toBeNull();
    expect(next).not.toBe(model);
  });

  it('enforces one float at a time by docking the previous float', () => {
    let model = modelWith('a', 'b');
    model = reduceWindow(model, { type: 'float', id: 'a' });
    model = reduceWindow(model, { type: 'float', id: 'b' });
    expect(getWindowState(model, 'a')).toBe('docked');
    expect(getWindowState(model, 'b')).toBe('floating');
    expect(model.floatingId).toBe('b');
  });

  it('is a no-op (same reference) when already floating', () => {
    const model = reduceWindow(modelWith('a'), { type: 'float', id: 'a' });
    const same = reduceWindow(model, { type: 'float', id: 'a' });
    expect(same).toBe(model);
  });
});

describe('reduceWindow — minimize / restore', () => {
  it('minimizes the active float and clears the float slot', () => {
    let model = reduceWindow(modelWith('a'), { type: 'float', id: 'a' });
    model = reduceWindow(model, { type: 'minimize', id: 'a' });
    expect(getWindowState(model, 'a')).toBe('minimized');
    expect(model.floatingId).toBeNull();
  });

  it('ignores minimize for a non-floating window', () => {
    const model = modelWith('a');
    const same = reduceWindow(model, { type: 'minimize', id: 'a' });
    expect(same).toBe(model);
  });

  it('restores a minimized window and displaces any current float', () => {
    let model = modelWith('a', 'b');
    model = reduceWindow(model, { type: 'float', id: 'a' });
    model = reduceWindow(model, { type: 'minimize', id: 'a' });
    model = reduceWindow(model, { type: 'float', id: 'b' });
    // Now 'a' minimized, 'b' floating. Restore 'a':
    model = reduceWindow(model, { type: 'restore', id: 'a' });
    expect(getWindowState(model, 'a')).toBe('floating');
    expect(getWindowState(model, 'b')).toBe('docked');
    expect(model.floatingId).toBe('a');
  });

  it('ignores restore for a non-minimized window', () => {
    const model = reduceWindow(modelWith('a'), { type: 'float', id: 'a' });
    const same = reduceWindow(model, { type: 'restore', id: 'a' });
    expect(same).toBe(model);
  });
});

describe('reduceWindow — dock', () => {
  it('docks a floating window and clears the float slot', () => {
    let model = reduceWindow(modelWith('a'), { type: 'float', id: 'a' });
    model = reduceWindow(model, { type: 'dock', id: 'a' });
    expect(getWindowState(model, 'a')).toBe('docked');
    expect(model.floatingId).toBeNull();
  });

  it('docks a minimized window without touching an unrelated float', () => {
    let model = modelWith('a', 'b');
    model = reduceWindow(model, { type: 'float', id: 'a' });
    model = reduceWindow(model, { type: 'minimize', id: 'a' });
    model = reduceWindow(model, { type: 'float', id: 'b' });
    // Dock the minimized 'a'; 'b' stays floating.
    model = reduceWindow(model, { type: 'dock', id: 'a' });
    expect(getWindowState(model, 'a')).toBe('docked');
    expect(getWindowState(model, 'b')).toBe('floating');
    expect(model.floatingId).toBe('b');
  });

  it('is a no-op when already docked', () => {
    const model = modelWith('a');
    const same = reduceWindow(model, { type: 'dock', id: 'a' });
    expect(same).toBe(model);
  });
});

describe('isModelConsistent', () => {
  it('holds after a full DOCKED → FLOATING → MINIMIZED cycle', () => {
    let model = modelWith('a');
    model = reduceWindow(model, { type: 'float', id: 'a' });
    expect(isModelConsistent(model)).toBe(true);
    model = reduceWindow(model, { type: 'minimize', id: 'a' });
    expect(isModelConsistent(model)).toBe(true);
    model = reduceWindow(model, { type: 'restore', id: 'a' });
    expect(isModelConsistent(model)).toBe(true);
    model = reduceWindow(model, { type: 'dock', id: 'a' });
    expect(isModelConsistent(model)).toBe(true);
  });

  it('detects a model that violates the single-float invariant', () => {
    const bad: FloatingWindowModel = {
      states: { a: 'floating', b: 'floating' },
      floatingId: 'a',
    };
    expect(isModelConsistent(bad)).toBe(false);
  });

  it('detects a dangling floatingId', () => {
    const bad: FloatingWindowModel = {
      states: { a: 'docked' },
      floatingId: 'a',
    };
    expect(isModelConsistent(bad)).toBe(false);
  });
});
