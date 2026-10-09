import { describe, it, expect } from 'vitest';
import type { Size } from './layoutSolver.js';
import {
  computeViewportInsets,
  computeFreeViewport,
  focusCameraOnFreeViewport,
  fitBoundsToFreeViewport,
} from './cameraInsets.js';
import type { CameraState, InsetWindow } from './cameraInsets.js';

const STAGE: Size = { width: 1200, height: 800 };

/** Local inverse of packages/core worldToScreen for assertions (screen = world*zoom + camera). */
function worldToScreen(cam: CameraState, wx: number, wy: number): { x: number; y: number } {
  return { x: wx * cam.zoom + cam.x, y: wy * cam.zoom + cam.y };
}

describe('computeViewportInsets', () => {
  it('returns zero insets and the full stage as the free viewport when there are no windows', () => {
    const insets = computeViewportInsets([], STAGE);
    expect(insets).toEqual({ top: 0, right: 0, bottom: 0, left: 0 });
    expect(computeFreeViewport(STAGE, insets)).toEqual({
      x: 0,
      y: 0,
      width: STAGE.width,
      height: STAGE.height,
    });
  });

  it('reserves the correct per-edge inset for one window flush against each edge', () => {
    const windows: InsetWindow[] = [
      { x: 100, y: 0, width: 300, height: 200 }, // top
      { x: 100, y: 600, width: 300, height: 200 }, // bottom
      { x: 0, y: 100, width: 250, height: 300 }, // left
      { x: 950, y: 100, width: 250, height: 300 }, // right
    ];
    const insets = computeViewportInsets(windows, STAGE);
    expect(insets).toEqual({ top: 200, right: 250, bottom: 200, left: 250 });
    expect(computeFreeViewport(STAGE, insets)).toEqual({ x: 250, y: 200, width: 700, height: 400 });
  });

  it('takes the maximum intrusion per edge rather than summing overlapping windows', () => {
    const windows: InsetWindow[] = [
      { x: 0, y: 0, width: 300, height: 200 },
      { x: 50, y: 0, width: 400, height: 350 },
    ];
    const insets = computeViewportInsets(windows, STAGE);
    expect(insets.top).toBe(350);
  });

  it('ignores minimized windows', () => {
    const windows: InsetWindow[] = [{ x: 0, y: 0, width: 300, height: 200, minimized: true }];
    expect(computeViewportInsets(windows, STAGE)).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    });
  });

  it('clamps a window larger than the stage, leaving no free area', () => {
    const windows: InsetWindow[] = [{ x: 0, y: 0, width: 5000, height: 5000 }];
    const insets = computeViewportInsets(windows, STAGE);
    const free = computeFreeViewport(STAGE, insets);
    expect(free.width).toBe(0);
    expect(free.height).toBe(0);
  });
});

describe('focusCameraOnFreeViewport', () => {
  it('ACCEPTANCE: refocuses a world point into the free viewport, clear of a right-docked window', () => {
    // Full-height-ish window docked to the right edge (not flush top/bottom).
    const windows: InsetWindow[] = [{ x: 900, y: 100, width: 300, height: 600 }];
    const insets = computeViewportInsets(windows, STAGE);
    expect(insets).toEqual({ top: 0, right: 300, bottom: 0, left: 0 });

    const free = computeFreeViewport(STAGE, insets);
    expect(free).toEqual({ x: 0, y: 0, width: 900, height: 800 });

    const camera: CameraState = { x: 0, y: 0, zoom: 1 };
    const refocused = focusCameraOnFreeViewport(camera, { x: 0, y: 0 }, free);
    const onScreen = worldToScreen(refocused, 0, 0);

    // Focused content lands at the center of the free viewport...
    expect(onScreen.x).toBeCloseTo(450, 6);
    expect(onScreen.y).toBeCloseTo(400, 6);
    // ...inside the free area and strictly left of the window (x < 900).
    expect(onScreen.x).toBeGreaterThanOrEqual(free.x);
    expect(onScreen.x).toBeLessThanOrEqual(free.x + free.width);
    expect(onScreen.x).toBeLessThan(windows[0]!.x);
  });

  it('keeps the zoom unchanged while refocusing', () => {
    const free = computeFreeViewport(STAGE, { top: 0, right: 300, bottom: 0, left: 0 });
    const refocused = focusCameraOnFreeViewport({ x: 5, y: 7, zoom: 2.5 }, { x: 10, y: 20 }, free);
    expect(refocused.zoom).toBe(2.5);
  });
});

describe('fitBoundsToFreeViewport', () => {
  it('centers content in the free viewport and fits within it using the padding zoom', () => {
    const free = computeFreeViewport(STAGE, { top: 0, right: 300, bottom: 0, left: 0 }); // 900x800
    const bounds = { minX: 0, maxX: 100, minY: 0, maxY: 100 };
    const camera: CameraState = { x: 0, y: 0, zoom: 1 };
    const fitted = fitBoundsToFreeViewport(camera, bounds, free, { padding: 1 });

    // padding=1 fills the tighter axis exactly: freeW/100 = 9, freeH/100 = 8 -> zoom 8
    expect(fitted.zoom).toBeCloseTo(8, 6);
    // Content center (50,50) maps to the free-viewport center (450,400).
    const center = worldToScreen(fitted, 50, 50);
    expect(center.x).toBeCloseTo(450, 6);
    expect(center.y).toBeCloseTo(400, 6);
  });

  it('returns the camera unchanged for degenerate bounds', () => {
    const free = computeFreeViewport(STAGE, { top: 0, right: 0, bottom: 0, left: 0 });
    const camera: CameraState = { x: 3, y: 4, zoom: 1.2 };
    expect(fitBoundsToFreeViewport(camera, { minX: 0, maxX: 0, minY: 0, maxY: 0 }, free)).toBe(
      camera,
    );
  });
});
