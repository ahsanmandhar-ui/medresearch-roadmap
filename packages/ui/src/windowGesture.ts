/**
 * Pure pointer-gesture → window-rect math (docs/PLAN.md M5.3 drag/resize).
 *
 * DOM-free (AGENTS.md §4): translates a pointer drag into a new window rect by
 * delegating all stage clamping and minimum-size enforcement to the M5.1 layout
 * solver (@research-roadmap/layout). Kept separate from the React component so
 * the geometry is unit-testable without a browser.
 */

import {
  moveWindow,
  resizeWindow,
  DEFAULT_MIN_WINDOW,
} from '@research-roadmap/layout';
import type { Rect, Size, Point } from '@research-roadmap/layout';

/**
 * Gesture kinds. `move` drags the whole window (size preserved); the `resize-*`
 * kinds grow an edge/corner while keeping the top-left fixed.
 */
export type WindowGestureMode = 'move' | 'resize-e' | 'resize-s' | 'resize-se';

export interface WindowGestureInput {
  mode: WindowGestureMode;
  /** Window rect when the gesture started. */
  startRect: Rect;
  /** Pointer position when the gesture started (client coordinates). */
  startPointer: Point;
  /** Current pointer position (client coordinates). */
  currentPointer: Point;
  /** Stage size the window must stay within. */
  stage: Size;
  /** Minimum window size; defaults to the shared DEFAULT_MIN_WINDOW. */
  minSize?: Size;
}

/**
 * Compute the window rect for a drag/resize gesture. The pointer delta drives
 * the change; the layout solver clamps the result inside `stage` and enforces
 * `minSize`, so callers never need to re-implement those rules.
 */
export function applyWindowGesture(input: WindowGestureInput): Rect {
  const {
    mode,
    startRect,
    startPointer,
    currentPointer,
    stage,
    minSize = DEFAULT_MIN_WINDOW,
  } = input;

  const dx = currentPointer.x - startPointer.x;
  const dy = currentPointer.y - startPointer.y;

  switch (mode) {
    case 'move':
      return moveWindow(startRect, { x: dx, y: dy }, stage);
    case 'resize-e':
      return resizeWindow(
        startRect,
        { width: startRect.width + dx, height: startRect.height },
        stage,
        minSize,
      );
    case 'resize-s':
      return resizeWindow(
        startRect,
        { width: startRect.width, height: startRect.height + dy },
        stage,
        minSize,
      );
    case 'resize-se':
      return resizeWindow(
        startRect,
        { width: startRect.width + dx, height: startRect.height + dy },
        stage,
        minSize,
      );
    default: {
      // Exhaustiveness guard: every WindowGestureMode is handled above.
      const exhaustive: never = mode;
      return exhaustive;
    }
  }
}
