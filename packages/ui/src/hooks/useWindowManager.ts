/**
 * M5.7 — React binding for the window-manager store.
 *
 * A thin `useReducer` wrapper around the pure logic in
 * {@link file://../windowManager.ts}. All behaviour (lifecycle, geometry,
 * stacking, camera insets) is decided by the pure module; this hook only wires
 * React state and exposes stable action callbacks + memoized derived views
 * (panes to paint, minimized bars, reserved viewport, camera helpers).
 */

import { useCallback, useMemo, useReducer } from 'react';
import {
  createWindowManagerState,
  windowManagerReducer,
  getManagedPanes,
  getManagedMinimizedBars,
  getManagedViewport,
  focusCamera,
  fitCamera,
} from '../windowManager.js';
import type {
  WindowManagerState,
  WindowManagerCommand,
  ManagedPane,
  ManagedMinimizedBar,
  ManagedViewport,
} from '../windowManager.js';
import type { Rect, Size, CameraState, WorldBounds, FitInsetsOptions } from '@research-roadmap/layout';

export interface UseWindowManagerOptions {
  /** Initial stage size (e.g. the graph container's measured size). */
  stage: Size;
}

export interface UseWindowManagerResult {
  /** The full raw state (rarely needed directly). */
  state: WindowManagerState;
  /** Dispatch a raw command (escape hatch). */
  dispatch: (command: WindowManagerCommand) => void;
  /** Open (and float + raise) a window at a cascade position. */
  open: (id: string, size: Size) => void;
  close: (id: string) => void;
  float: (id: string) => void;
  minimize: (id: string) => void;
  restore: (id: string) => void;
  dock: (id: string) => void;
  /** Raise a window to the front of the focus order. */
  raise: (id: string) => void;
  /** Update a window's rect (e.g. from a drag/resize handler; clamped to stage). */
  setRect: (id: string, rect: Rect) => void;
  setStage: (stage: Size) => void;
  /** Panes ordered back → front, each with rect + z-index, ready to render. */
  panes: ManagedPane[];
  /** Minimized windows with non-overlapping docked bar rects. */
  minimizedBars: ManagedMinimizedBar[];
  /** Reserved per-edge insets + free viewport for the current visible windows. */
  viewport: ManagedViewport;
  /** Refocus the camera (zoom unchanged) onto `worldFocus` within the free area. */
  focusCameraOn: (camera: CameraState, worldFocus: { x: number; y: number }) => CameraState;
  /** Fit world `bounds` into the free viewport. */
  fitCameraTo: (
    camera: CameraState,
    bounds: WorldBounds,
    options?: FitInsetsOptions,
  ) => CameraState;
}

/**
 * Create a window-manager store bound to React. Integrates the full M5 primitive
 * set (M5.1 geometry, M5.2 lifecycle, M5.5 stacking, M5.6 camera insets).
 */
export function useWindowManager({ stage }: UseWindowManagerOptions): UseWindowManagerResult {
  const [state, dispatch] = useReducer(windowManagerReducer, stage, createWindowManagerState);

  const open = useCallback((id: string, size: Size) => dispatch({ type: 'open', id, size }), []);
  const close = useCallback((id: string) => dispatch({ type: 'close', id }), []);
  const float = useCallback((id: string) => dispatch({ type: 'float', id }), []);
  const minimize = useCallback((id: string) => dispatch({ type: 'minimize', id }), []);
  const restore = useCallback((id: string) => dispatch({ type: 'restore', id }), []);
  const dock = useCallback((id: string) => dispatch({ type: 'dock', id }), []);
  const raise = useCallback((id: string) => dispatch({ type: 'raise', id }), []);
  const setRect = useCallback((id: string, rect: Rect) => dispatch({ type: 'setRect', id, rect }), []);
  const setStage = useCallback((next: Size) => dispatch({ type: 'setStage', stage: next }), []);

  const panes = useMemo(() => getManagedPanes(state), [state]);
  const minimizedBars = useMemo(() => getManagedMinimizedBars(state), [state]);
  const viewport = useMemo(() => getManagedViewport(state), [state]);

  const focusCameraOn = useCallback(
    (camera: CameraState, worldFocus: { x: number; y: number }) =>
      focusCamera(state, camera, worldFocus),
    [state],
  );
  const fitCameraTo = useCallback(
    (camera: CameraState, bounds: WorldBounds, options?: FitInsetsOptions) =>
      fitCamera(state, camera, bounds, options),
    [state],
  );

  return {
    state,
    dispatch,
    open,
    close,
    float,
    minimize,
    restore,
    dock,
    raise,
    setRect,
    setStage,
    panes,
    minimizedBars,
    viewport,
    focusCameraOn,
    fitCameraTo,
  };
}
