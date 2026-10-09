/**
 * M5.6 — Camera insets: reserve graph viewport space around floating windows so
 * the map stays visible (docs/ARCHITECTURE.md §5: "map camera refits around
 * large windows").
 *
 * DOM-free and dependency-free. Built on the rect/stage primitives from the M5.1
 * layout solver ({@link clampWindowToStage}, {@link clamp}) and treats camera
 * state structurally.
 *
 * packages/layout does NOT depend on packages/core (core's lint gate is still
 * red — see docs/STATE.md open risks), so the camera shapes here (CameraState,
 * WorldBounds) are declared locally as minimal structural types that are
 * compatible with packages/core's `CameraState` / geometry fields of
 * `CameraBounds`. A caller can pass core objects directly.
 *
 * Model: four per-edge insets (top/right/bottom/left) reserved by windows flush
 * against a stage edge. The remaining free-viewport rect is what the map camera
 * should keep focused content inside. Interior windows that touch no edge are
 * overlays the map renders under and reserve no inset (documented limitation —
 * a largest-free-rectangle solver for arbitrary interior windows is out of
 * scope for this primitive).
 */

import { clampWindowToStage, clamp } from './layoutSolver.js';
import type { Rect, Size } from './layoutSolver.js';

/** Minimal camera state, structurally compatible with packages/core CameraState. */
export interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Minimal world-space bounds, structurally compatible with the geometry fields
 * of packages/core CameraBounds (minZoom/maxZoom are not needed here).
 */
export interface WorldBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

/** A floating window considered for insets. `minimized` windows are ignored. */
export interface InsetWindow extends Rect {
  minimized?: boolean;
}

/** Per-edge viewport insets in stage (screen) pixels. */
export interface ViewInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** Options for {@link fitBoundsToFreeViewport}. */
export interface FitInsetsOptions {
  /** Fraction of the free viewport to fill; 1 fills it exactly. Default 0.9. */
  padding?: number;
}

/** Tolerance for treating a clamped window as flush against a stage edge. */
const EDGE_EPSILON = 1e-6;

/** Drop float dust so a near-zero reach does not register as an inset. */
function positive(value: number): number {
  return value > EDGE_EPSILON ? value : 0;
}

/** Center point (screen space) of a rect. */
function rectCenter(rect: Rect): { x: number; y: number } {
  return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
}

/**
 * Compute the per-edge insets reserved by visible, non-minimized floating
 * windows flush against the stage edges. Each window is clamped to the stage
 * first, so a window larger than the stage becomes the whole stage and reserves
 * every edge. Per edge the maximum intrusion wins; overlapping windows never
 * sum. Opposing insets are then clamped so they can never exceed the stage.
 */
export function computeViewportInsets(
  windows: readonly InsetWindow[],
  stage: Size,
): ViewInsets {
  const insets: ViewInsets = { top: 0, right: 0, bottom: 0, left: 0 };

  for (const window of windows) {
    if (window.minimized === true) continue;
    if (window.width <= 0 || window.height <= 0) continue;

    const r = clampWindowToStage(window, stage);

    if (r.y <= EDGE_EPSILON) {
      insets.top = Math.max(insets.top, positive(r.y + r.height));
    }
    if (r.y + r.height >= stage.height - EDGE_EPSILON) {
      insets.bottom = Math.max(insets.bottom, positive(stage.height - r.y));
    }
    if (r.x <= EDGE_EPSILON) {
      insets.left = Math.max(insets.left, positive(r.x + r.width));
    }
    if (r.x + r.width >= stage.width - EDGE_EPSILON) {
      insets.right = Math.max(insets.right, positive(stage.width - r.x));
    }
  }

  // Never let opposing insets exceed the stage; the free area must not invert.
  insets.left = clamp(insets.left, 0, stage.width);
  insets.right = clamp(insets.right, 0, stage.width - insets.left);
  insets.top = clamp(insets.top, 0, stage.height);
  insets.bottom = clamp(insets.bottom, 0, stage.height - insets.top);
  return insets;
}

/**
 * The free-viewport rect left after applying `insets` to `stage`. The origin is
 * the top-left of the free area; the size is the remaining space (never
 * negative). When the windows fill the stage this is a zero-area rect.
 */
export function computeFreeViewport(stage: Size, insets: ViewInsets): Rect {
  const left = clamp(insets.left, 0, stage.width);
  const top = clamp(insets.top, 0, stage.height);
  const right = clamp(insets.right, 0, stage.width - left);
  const bottom = clamp(insets.bottom, 0, stage.height - top);
  const width = Math.max(0, stage.width - left - right);
  const height = Math.max(0, stage.height - top - bottom);
  return { x: left, y: top, width, height };
}

/**
 * Refocus the camera (zoom unchanged) so `worldFocus` maps to the center of the
 * free viewport. This is the inverse of worldToScreen
 * (`screen = world * zoom + camera`), so `camera = screenCenter - world * zoom`.
 */
export function focusCameraOnFreeViewport(
  camera: CameraState,
  worldFocus: { x: number; y: number },
  freeViewport: Rect,
): CameraState {
  const center = rectCenter(freeViewport);
  return {
    zoom: camera.zoom,
    x: center.x - worldFocus.x * camera.zoom,
    y: center.y - worldFocus.y * camera.zoom,
  };
}

/**
 * Fit world `bounds` into the free viewport: choose the zoom so the content fits
 * (honoring `padding`), then center it in the free area. Mirrors packages/core
 * `fitBounds` but against the free viewport instead of the full stage. Degenerate
 * bounds or an empty free viewport return the camera unchanged (nothing to fit).
 */
export function fitBoundsToFreeViewport(
  camera: CameraState,
  bounds: WorldBounds,
  freeViewport: Rect,
  options: FitInsetsOptions = {},
): CameraState {
  const padding = options.padding ?? 0.9;
  const boundsWidth = bounds.maxX - bounds.minX;
  const boundsHeight = bounds.maxY - bounds.minY;
  if (
    boundsWidth <= 0 ||
    boundsHeight <= 0 ||
    freeViewport.width <= 0 ||
    freeViewport.height <= 0
  ) {
    return camera;
  }

  const scaleX = freeViewport.width / boundsWidth;
  const scaleY = freeViewport.height / boundsHeight;
  const newZoom = Math.min(scaleX, scaleY) * padding;

  const contentCenterX = (bounds.minX + bounds.maxX) / 2;
  const contentCenterY = (bounds.minY + bounds.maxY) / 2;
  const center = rectCenter(freeViewport);

  return {
    zoom: newZoom,
    x: center.x - contentCenterX * newZoom,
    y: center.y - contentCenterY * newZoom,
  };
}

