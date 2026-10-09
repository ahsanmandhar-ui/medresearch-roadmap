import { describe, it, expect, beforeEach } from 'vitest';
import {
  createProgressState,
  markComplete,
  markIncomplete,
  toggleComplete,
  isComplete,
  setNote,
  getNote,
  removeNote,
  setLastVisited,
  getProgressStats,
  getCompletedNodes,
  getIncompleteNodes,
  resetProgress,
  saveProgress,
  loadProgress,
} from './progress.js';

describe('createProgressState', () => {
  it('creates empty progress state', () => {
    const state = createProgressState();
    expect(state.completedNodes).toEqual([]);
    expect(state.notes).toEqual({});
    expect(state.lastVisited).toBeNull();
    expect(state.startedAt).toBeNull();
    expect(state.completedAt).toBeNull();
  });
});

describe('markComplete', () => {
  it('marks a node as complete', () => {
    const state = createProgressState();
    const updated = markComplete(state, 'node1', 10);
    expect(updated.completedNodes).toContain('node1');
  });

  it('does not duplicate completed nodes', () => {
    const state = createProgressState();
    const updated = markComplete(state, 'node1', 10);
    const updated2 = markComplete(updated, 'node1', 10);
    expect(updated2.completedNodes).toHaveLength(1);
  });

  it('sets startedAt on first completion', () => {
    const state = createProgressState();
    const updated = markComplete(state, 'node1', 10);
    expect(updated.startedAt).not.toBeNull();
  });

  it('sets completedAt when all nodes complete', () => {
    const state = createProgressState();
    const updated = markComplete(state, 'node1', 1);
    expect(updated.completedAt).not.toBeNull();
  });

  it('does not mutate original state', () => {
    const state = createProgressState();
    markComplete(state, 'node1', 10);
    expect(state.completedNodes).toHaveLength(0);
  });
});

describe('markIncomplete', () => {
  it('marks a node as incomplete', () => {
    const state = createProgressState();
    const completed = markComplete(state, 'node1', 10);
    const updated = markIncomplete(completed, 'node1');
    expect(updated.completedNodes).not.toContain('node1');
  });

  it('does nothing if node not completed', () => {
    const state = createProgressState();
    const updated = markIncomplete(state, 'node1');
    expect(updated.completedNodes).toHaveLength(0);
  });

  it('clears completedAt', () => {
    const state = createProgressState();
    const completed = markComplete(state, 'node1', 1);
    const updated = markIncomplete(completed, 'node1');
    expect(updated.completedAt).toBeNull();
  });
});

describe('toggleComplete', () => {
  it('toggles from incomplete to complete', () => {
    const state = createProgressState();
    const updated = toggleComplete(state, 'node1', 10);
    expect(updated.completedNodes).toContain('node1');
  });

  it('toggles from complete to incomplete', () => {
    const state = createProgressState();
    const completed = markComplete(state, 'node1', 10);
    const updated = toggleComplete(completed, 'node1', 10);
    expect(updated.completedNodes).not.toContain('node1');
  });
});

describe('isComplete', () => {
  it('returns true for completed node', () => {
    const state = createProgressState();
    const updated = markComplete(state, 'node1', 10);
    expect(isComplete(updated, 'node1')).toBe(true);
  });

  it('returns false for incomplete node', () => {
    const state = createProgressState();
    expect(isComplete(state, 'node1')).toBe(false);
  });
});

describe('notes', () => {
  it('sets a note for a node', () => {
    const state = createProgressState();
    const updated = setNote(state, 'node1', 'My note');
    expect(getNote(updated, 'node1')).toBe('My note');
  });

  it('updates an existing note', () => {
    const state = createProgressState();
    const withNote = setNote(state, 'node1', 'First note');
    const updated = setNote(withNote, 'node1', 'Updated note');
    expect(getNote(updated, 'node1')).toBe('Updated note');
  });

  it('removes a note', () => {
    const state = createProgressState();
    const withNote = setNote(state, 'node1', 'My note');
    const updated = removeNote(withNote, 'node1');
    expect(getNote(updated, 'node1')).toBeUndefined();
  });

  it('returns undefined for missing note', () => {
    const state = createProgressState();
    expect(getNote(state, 'node1')).toBeUndefined();
  });
});

describe('setLastVisited', () => {
  it('sets last visited node', () => {
    const state = createProgressState();
    const updated = setLastVisited(state, 'node1');
    expect(updated.lastVisited).toBe('node1');
  });
});

describe('getProgressStats', () => {
  it('calculates progress correctly', () => {
    const state = createProgressState();
    const updated = markComplete(state, 'node1', 4);
    const stats = getProgressStats(updated, 4);
    expect(stats.totalNodes).toBe(4);
    expect(stats.completedCount).toBe(1);
    expect(stats.percentage).toBe(25);
    expect(stats.remainingCount).toBe(3);
    expect(stats.isComplete).toBe(false);
  });

  it('returns 100% when all complete', () => {
    const state = createProgressState();
    const updated = markComplete(state, 'node1', 1);
    const stats = getProgressStats(updated, 1);
    expect(stats.percentage).toBe(100);
    expect(stats.isComplete).toBe(true);
  });

  it('handles zero total nodes', () => {
    const state = createProgressState();
    const stats = getProgressStats(state, 0);
    expect(stats.percentage).toBe(0);
    expect(stats.isComplete).toBe(false);
  });
});

describe('getCompletedNodes', () => {
  it('returns all completed node IDs', () => {
    const state = createProgressState();
    const updated = markComplete(state, 'node1', 10);
    const updated2 = markComplete(updated, 'node2', 10);
    expect(getCompletedNodes(updated2)).toEqual(['node1', 'node2']);
  });
});

describe('getIncompleteNodes', () => {
  it('returns incomplete node IDs', () => {
    const state = createProgressState();
    const updated = markComplete(state, 'node1', 3);
    const incomplete = getIncompleteNodes(updated, ['node1', 'node2', 'node3']);
    expect(incomplete).toEqual(['node2', 'node3']);
  });
});

describe('resetProgress', () => {
  it('resets to empty state', () => {
    const state = createProgressState();
    const updated = markComplete(state, 'node1', 10);
    const reset = resetProgress();
    expect(reset.completedNodes).toHaveLength(0);
    expect(reset.notes).toEqual({});
  });
});

describe('saveProgress and loadProgress', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and loads progress', () => {
    const state = createProgressState();
    const updated = markComplete(state, 'node1', 10);
    saveProgress(updated);
    const loaded = loadProgress();
    expect(loaded.completedNodes).toContain('node1');
  });

  it('returns empty state when nothing saved', () => {
    const loaded = loadProgress();
    expect(loaded.completedNodes).toHaveLength(0);
  });

  it('handles corrupted data', () => {
    localStorage.setItem('research-roadmap-progress', 'invalid json');
    const loaded = loadProgress();
    expect(loaded.completedNodes).toHaveLength(0);
  });
});
