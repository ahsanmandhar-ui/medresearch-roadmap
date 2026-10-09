import { useCallback } from 'react';
import { directionFromKey, findNextNode } from '../keyboardNav.js';
import type { NavigableNode } from '../keyboardNav.js';

/** Minimal keyboard-event shape consumed by the navigation handler. */
export interface NavKeyEvent {
  key: string;
  preventDefault: () => void;
}

export interface UseGraphKeyboardNavigationOptions {
  /** All nodes eligible to receive focus. */
  nodes: readonly NavigableNode[];
  /** Currently focused node id, or null when nothing is focused. */
  currentId: string | null;
  /** Invoked with the id of the node that should receive focus. */
  onNavigate: (id: string) => void;
}

/**
 * Returns a keydown handler that moves graph focus with the arrow keys.
 *
 * The handler maps the pressed key to a direction, resolves the nearest node
 * via the pure `findNextNode` solver, and delegates the actual focus change to
 * `onNavigate`. Unmapped keys, missing focus, and dead-end directions are
 * ignored so the caller's element keeps its default behaviour.
 */
export function useGraphKeyboardNavigation({
  nodes,
  currentId,
  onNavigate,
}: UseGraphKeyboardNavigationOptions): (event: NavKeyEvent) => void {
  return useCallback(
    (event: NavKeyEvent) => {
      if (currentId === null) return;

      const direction = directionFromKey(event.key);
      if (direction === null) return;

      const nextId = findNextNode(nodes, currentId, direction);
      if (nextId === null) return;

      event.preventDefault();
      onNavigate(nextId);
    },
    [nodes, currentId, onNavigate],
  );
}
