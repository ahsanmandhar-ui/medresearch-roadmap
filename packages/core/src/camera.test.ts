import { describe, it, expect } from 'vitest';
import {
  createCamera,
  pan,
  zoom,
  focusOn,
  fitBounds,
  screenToWorld,
  worldToScreen,
  clampCamera,
  getCameraBounds,
} from './camera.js';

describe('createCamera', () => {
  it('creates camera with default state', () => {
    const camera = createCamera();
    expect(camera).toEqual({ x: 0, y: 0, zoom: 1 });
  });

  it('creates camera with custom initial state', () => {
    const camera = createCamera({ x: 100, y: 200, zoom: 2 });
    expect(camera).toEqual({ x: 100, y: 200, zoom: 2 });
  });
});

describe('pan', () => {
  it('moves camera by delta', () => {
    const camera = createCamera({ x: 0, y: 0, zoom: 1 });
    const panned = pan(camera, 50, 30);
    expect(panned).toEqual({ x: 50, y: 30, zoom: 1 });
  });

  it('does not mutate original camera', () => {
    const camera = createCamera({ x: 0, y: 0, zoom: 1 });
    pan(camera, 50, 30);
    expect(camera).toEqual({ x: 0, y: 0, zoom: 1 });
  });
});

describe('zoom', () => {
  it('zooms in by factor', () => {
    const camera = createCamera({ zoom: 1 });
    const zoomed = zoom(camera, 2);
    expect(zoomed.zoom).toBe(2);
  });

  it('zooms out by factor', () => {
    const camera = createCamera({ zoom: 2 });
    const zoomed = zoom(camera, 0.5);
    expect(zoomed.zoom).toBe(1);
  });

  it('clamps zoom to minimum', () => {
    const camera = createCamera({ zoom: 0.1 });
    const zoomed = zoom(camera, 0.1);
    expect(zoomed.zoom).toBeGreaterThanOrEqual(0.1);
  });

  it('clamps zoom to maximum', () => {
    const camera = createCamera({ zoom: 5 });
    const zoomed = zoom(camera, 2);
    expect(zoomed.zoom).toBeLessThanOrEqual(5);
  });

  it('zooms around center point', () => {
    const camera = createCamera({ x: 0, y: 0, zoom: 1 });
    const center = { x: 100, y: 100 };
    const zoomed = zoom(camera, 2, center);
    expect(zoomed.zoom).toBe(2);
    expect(zoomed.x).toBeLessThan(0);
    expect(zoomed.y).toBeLessThan(0);
  });
});

describe('focusOn', () => {
  it('centers camera on target', () => {
    const camera = createCamera({ x: 0, y: 0, zoom: 1 });
    const target = { x: 500, y: 300 };
    const viewport = { width: 800, height: 600 };
    const focused = focusOn(camera, target, viewport);
    expect(focused.x).toBe(100);
    expect(focused.y).toBe(0);
  });

  it('preserves zoom level', () => {
    const camera = createCamera({ zoom: 2 });
    const target = { x: 500, y: 300 };
    const viewport = { width: 800, height: 600 };
    const focused = focusOn(camera, target, viewport);
    expect(focused.zoom).toBe(2);
  });
});

describe('fitBounds', () => {
  it('fits camera to show all bounds', () => {
    const camera = createCamera({ zoom: 1 });
    const bounds = { minX: 0, maxX: 1000, minY: 0, maxY: 500, minZoom: 0.1, maxZoom: 5 };
    const viewport = { width: 800, height: 600 };
    const fitted = fitBounds(camera, bounds, viewport);
    expect(fitted.zoom).toBeLessThan(1);
    expect(fitted.zoom).toBeGreaterThan(0);
  });

  it('handles empty bounds', () => {
    const camera = createCamera({ x: 100, y: 100, zoom: 1 });
    const bounds = { minX: 0, maxX: 0, minY: 0, maxY: 0, minZoom: 0.1, maxZoom: 5 };
    const viewport = { width: 800, height: 600 };
    const fitted = fitBounds(camera, bounds, viewport);
    expect(fitted).toEqual(camera);
  });
});

describe('screenToWorld', () => {
  it('converts screen to world coordinates', () => {
    const camera = createCamera({ x: 100, y: 50, zoom: 2 });
    const world = screenToWorld(camera, 300, 200);
    expect(world.x).toBe(100);
    expect(world.y).toBe(75);
  });

  it('handles identity transform', () => {
    const camera = createCamera({ x: 0, y: 0, zoom: 1 });
    const world = screenToWorld(camera, 100, 200);
    expect(world).toEqual({ x: 100, y: 200 });
  });
});

describe('worldToScreen', () => {
  it('converts world to screen coordinates', () => {
    const camera = createCamera({ x: 100, y: 50, zoom: 2 });
    const screen = worldToScreen(camera, 100, 75);
    expect(screen.x).toBe(300);
    expect(screen.y).toBe(200);
  });

  it('handles identity transform', () => {
    const camera = createCamera({ x: 0, y: 0, zoom: 1 });
    const screen = worldToScreen(camera, 100, 200);
    expect(screen).toEqual({ x: 100, y: 200 });
  });
});

describe('clampCamera', () => {
  it('clamps camera within bounds', () => {
    const camera = createCamera({ x: 5000, y: -100, zoom: 10 });
    const bounds = { minX: 0, maxX: 1000, minY: 0, maxY: 1000, minZoom: 0.1, maxZoom: 5 };
    const clamped = clampCamera(camera, bounds);
    expect(clamped.x).toBeLessThanOrEqual(1000);
    expect(clamped.y).toBeGreaterThanOrEqual(0);
    expect(clamped.zoom).toBeLessThanOrEqual(5);
  });

  it('does not modify camera within bounds', () => {
    const camera = createCamera({ x: 500, y: 500, zoom: 2 });
    const bounds = { minX: 0, maxX: 1000, minY: 0, maxY: 1000, minZoom: 0.1, maxZoom: 5 };
    const clamped = clampCamera(camera, bounds);
    expect(clamped).toEqual(camera);
  });
});

describe('getCameraBounds', () => {
  it('calculates bounds from nodes', () => {
    const nodes = [
      { x: 0, y: 0 },
      { x: 1000, y: 500 },
      { x: 500, y: 1000 },
    ];
    const bounds = getCameraBounds(nodes);
    expect(bounds.minX).toBeLessThan(0);
    expect(bounds.maxX).toBeGreaterThan(1000);
    expect(bounds.minY).toBeLessThan(0);
    expect(bounds.maxY).toBeGreaterThan(1000);
  });

  it('returns default bounds for empty nodes', () => {
    const bounds = getCameraBounds([]);
    expect(bounds).toEqual({ minX: 0, maxX: 1000, minY: 0, maxY: 1000, minZoom: 0.1, maxZoom: 5 });
  });
});
