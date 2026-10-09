/**
 * M5.7 — React window-manager store: pure state logic.
 *
 * DOM-free and dependency-free (AGENTS.md §4). This is the first module that
 * integrates the whole M5 primitive set — the M5.2 lifecycle state machine
 * ({@link reduceWindow}), the M5.1 geometry solver ({@link placeWindowInStage},
 * {@link clampWindowToStage}, {@link layoutMinimizedBars}),
 * the M5.5 stacking solver ({@link bringToFront}, {@link removeFromStack},
 * {@link getStackingOrder}, {@link getZIndex}) and the M5.6 camera insets
 * ({@link computeViewportInsets}, {@link computeFreeViewport},
 * {@link focusCameraOnFreeViewport}, {@link fitBoundsToFreeViewport}).
 *
 * The React binding is a thin wrapper ({@link file://./hooks/useWindowManager.ts});
 * all behaviour lives here so it is unit-testable without a renderer.
 */

import {
  createFloatingWindowModel,
  getWindowState,
  reduceWindow,
  bringToFront,
  removeFromStack,
  getStackingOrder,
  getZIndex,
  placeWindowInStage,
  clampWindowToStage,
  layoutMinimizedBars,
  computeViewportInsets,
  computeFreeViewport,
  focusCameraOnFreeViewport,
  fitBoundsToFreeViewport,
} from '@research-roadmap/layout';
import type {
  FloatingWindowModel,
  WindowState,
  Rect,
  Size,
  StackedPane,
  ViewInsets,
  CameraState,
  WorldBounds,
  InsetWindow,
  FitInsetsOptions,
} from '@research-roadmap/layout';

/** Default minimized-bar footprint used by the hook's derived bar layout. */
export const DEFAULT_MINIMIZED_BAR: Size = { width: 200, height: 40 };

/** Full manager state: lifecycle model + per-window geometry + stacking order. */
export interface WindowManagerState {
  /** M5.2 lifecycle model (states + single active float). */
  model: FloatingWindowModel;
  /** Window id → current rect (stage space). */
  rects: Record<string, Rect>;
  /** Stacking/focus order, back → front (M5.5). */
  focusOrder: string[];
  /** All open window ids, in open order (drives cascade + bar order). */
  ids: string[];
  /** Current stage size. */
  stage: Size;
}

/** Every command the manager understands. */
export type WindowManagerCommand =
  | { type: 'open'; id: string; size: Size }
  | { type: 'close'; id: string }
  | { type: 'float'; id: string }
  | { type: 'minimize'; id: string }
  | { type: 'restore'; id: string }
  | { type: 'dock'; id: string }
  | { type: 'raise'; id: string }
  | { type: 'setRect'; id: string; rect: Rect }
  | { type: 'setStage'; stage: Size };

/** Create an empty manager state over a stage of the given size. */
export function createWindowManagerState(stage: Size): WindowManagerState {
  return {
    model: createFloatingWindowModel(),
    rects: {},
    focusOrder: [],
    ids: [],
    stage,
  };
}

function raise(state: WindowManagerState, id: string): WindowManagerState {
  if (!state.ids.includes(id)) return state;
  return { ...state, focusOrder: bringToFront(state.focusOrder, id) };
}

/**
 * Pure reducer over {@link WindowManagerCommand}. Returns a NEW state; identical
 * reference is returned for no-ops so callers can detect changes cheaply.
 */
export function windowManagerReducer(
  state: WindowManagerState,
  command: WindowManagerCommand,
): WindowManagerState {
  switch (command.type) {
    case 'open': {
      // Re-opening an existing window re-floats and raises it (idempotent).
      if (state.ids.includes(command.id)) {
        const floated = reduceWindow(state.model, { type: 'float', id: command.id });
        return raise({ ...state, model: floated }, command.id);
      }
      const rect = placeWindowInStage(state.ids.length, state.stage, command.size);
      const model = reduceWindow(
        { ...state.model, states: { ...state.model.states, [command.id]: 'docked' } },
        { type: 'float', id: command.id },
      );
      return {
        model,
        rects: { ...state.rects, [command.id]: rect },
        focusOrder: bringToFront(state.focusOrder, command.id),
        ids: [...state.ids, command.id],
        stage: state.stage,
      };
    }

    case 'close': {
      if (!state.ids.includes(command.id)) return state;
      const states = { ...state.model.states };
      delete states[command.id];
      const rects = { ...state.rects };
      delete rects[command.id];
      return {
        model: {
          states,
          floatingId: state.model.floatingId === command.id ? null : state.model.floatingId,
        },
        rects,
        focusOrder: removeFromStack(state.focusOrder, command.id),
        ids: state.ids.filter((id) => id !== command.id),
        stage: state.stage,
      };
    }

    case 'float':
    case 'restore': {
      const model = reduceWindow(state.model, command);
      return raise({ ...state, model }, command.id);
    }

    case 'minimize':
    case 'dock': {
      const model = reduceWindow(state.model, command);
      return { ...state, model };
    }

    case 'raise': {
      return raise(state, command.id);
    }

    case 'setRect': {
      const existing = state.rects[command.id];
      if (!existing) return state;
      return {
        ...state,
        rects: {
          ...state.rects,
          [command.id]: clampWindowToStage(command.rect, state.stage),
        },
      };
    }

    case 'setStage': {
      const rects: Record<string, Rect> = {};
      for (const id of state.ids) {
        const rect = state.rects[id];
        if (rect) rects[id] = clampWindowToStage(rect, command.stage);
      }
      return { ...state, stage: command.stage, rects };
    }

    default: {
      const _exhaustive: never = command;
      return _exhaustive;
    }
  }
}

/** A pane ready to render, with its resolved stacking order and z-index. */
export interface ManagedPane {
  id: string;
  state: WindowState;
  rect: Rect;
  /** Back → front index within the paint order (lower paints first). */
  paintIndex: number;
  zIndex: number;
}

/**
 * Panes ordered back → front for painting (minimized, then docked, then
 * floating; focus order breaks ties within a band), each carrying its resolved
 * rect and z-index. This is the render list the window manager hands to the UI.
 */
export function getManagedPanes(state: WindowManagerState): ManagedPane[] {
  const panes: StackedPane[] = state.ids.map((id) => ({
    id,
    state: getWindowState(state.model, id),
  }));
  return getStackingOrder(panes, state.focusOrder).map((pane, paintIndex) => ({
    id: pane.id,
    state: pane.state,
    rect: state.rects[pane.id] ?? { x: 0, y: 0, width: 0, height: 0 },
    paintIndex,
    zIndex: getZIndex(pane.id, pane.state, state.focusOrder),
  }));
}

/** A minimized window paired with its docked bar rect. */
export interface ManagedMinimizedBar {
  id: string;
  rect: Rect;
}

/**
 * Minimized windows paired with non-overlapping bottom-docked bar rects, in
 * open order. Uses the M5.1 {@link layoutMinimizedBars} solver.
 */
export function getManagedMinimizedBars(
  state: WindowManagerState,
  bar: Size = DEFAULT_MINIMIZED_BAR,
): ManagedMinimizedBar[] {
  const minimizedIds = state.ids.filter(
    (id) => getWindowState(state.model, id) === 'minimized',
  );
  const rects = layoutMinimizedBars(minimizedIds.length, state.stage, bar);
  return minimizedIds
    .map((id, i) => ({ id, rect: rects[i] }))
    .filter((entry): entry is { id: string; rect: Rect } => entry.rect !== undefined);
}

/** The reserved insets + free viewport for the current visible windows. */
export interface ManagedViewport {
  insets: ViewInsets;
  freeViewport: Rect;
}

/**
 * Compute the per-edge insets reserved by visible (non-minimized) floating
 * windows and the resulting free-viewport rect, via the M5.6 camera-inset
 * primitives. Minimized windows reserve no inset (they are thin bottom bars).
 */
export function getManagedViewport(state: WindowManagerState): ManagedViewport {
  const windows: InsetWindow[] = state.ids
    .filter((id) => getWindowState(state.model, id) !== 'minimized')
    .map((id) => ({ ...(state.rects[id] ?? { x: 0, y: 0, width: 0, height: 0 }), minimized: false }));
  const insets = computeViewportInsets(windows, state.stage);
  return { insets, freeViewport: computeFreeViewport(state.stage, insets) };
}

/** Refocus the camera (zoom unchanged) onto `worldFocus` within the free area. */
export function focusCamera(
  state: WindowManagerState,
  camera: CameraState,
  worldFocus: { x: number; y: number },
): CameraState {
  return focusCameraOnFreeViewport(camera, worldFocus, getManagedViewport(state).freeViewport);
}

/** Fit world `bounds` into the free viewport, honoring optional padding. */
export function fitCamera(
  state: WindowManagerState,
  camera: CameraState,
  bounds: WorldBounds,
  options?: FitInsetsOptions,
): CameraState {
  return fitBoundsToFreeViewport(
    camera,
    bounds,
    getManagedViewport(state).freeViewport,
    options,
  );
}

