export interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

export interface CameraBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZoom: number;
  maxZoom: number;
}

export interface ViewportSize {
  width: number;
  height: number;
}

export function createCamera(initial?: Partial<CameraState>): CameraState {
  return {
    x: initial?.x ?? 0,
    y: initial?.y ?? 0,
    zoom: initial?.zoom ?? 1,
  };
}

export function pan(camera: CameraState, dx: number, dy: number): CameraState {
  return {
    ...camera,
    x: camera.x + dx,
    y: camera.y + dy,
  };
}

export function zoom(camera: CameraState, factor: number, center?: { x: number; y: number }): CameraState {
  const newZoom = Math.max(0.1, Math.min(5, camera.zoom * factor));

  if (!center) {
    return { ...camera, zoom: newZoom };
  }

  const scale = newZoom / camera.zoom;
  const newX = center.x - (center.x - camera.x) * scale;
  const newY = center.y - (center.y - camera.y) * scale;

  return { x: newX, y: newY, zoom: newZoom };
}

export function focusOn(
  camera: CameraState,
  target: { x: number; y: number },
  viewport: ViewportSize,
): CameraState {
  return {
    x: target.x - viewport.width / 2,
    y: target.y - viewport.height / 2,
    zoom: camera.zoom,
  };
}

export function fitBounds(
  camera: CameraState,
  bounds: CameraBounds,
  viewport: ViewportSize,
): CameraState {
  const boundsWidth = bounds.maxX - bounds.minX;
  const boundsHeight = bounds.maxY - bounds.minY;

  if (boundsWidth === 0 || boundsHeight === 0) {
    return camera;
  }

  const scaleX = viewport.width / boundsWidth;
  const scaleY = viewport.height / boundsHeight;
  const newZoom = Math.min(scaleX, scaleY) * 0.9;

  const clampedZoom = Math.max(bounds.minZoom, Math.min(bounds.maxZoom, newZoom));

  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;

  return {
    x: centerX - viewport.width / (2 * clampedZoom),
    y: centerY - viewport.height / (2 * clampedZoom),
    zoom: clampedZoom,
  };
}

export function screenToWorld(
  camera: CameraState,
  screenX: number,
  screenY: number,
): { x: number; y: number } {
  return {
    x: (screenX - camera.x) / camera.zoom,
    y: (screenY - camera.y) / camera.zoom,
  };
}

export function worldToScreen(
  camera: CameraState,
  worldX: number,
  worldY: number,
): { x: number; y: number } {
  return {
    x: worldX * camera.zoom + camera.x,
    y: worldY * camera.zoom + camera.y,
  };
}

export function clampCamera(camera: CameraState, bounds: CameraBounds): CameraState {
  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, camera.x)),
    y: Math.max(bounds.minY, Math.min(bounds.maxY, camera.y)),
    zoom: Math.max(bounds.minZoom, Math.min(bounds.maxZoom, camera.zoom)),
  };
}

export function getCameraBounds(nodes: { x: number; y: number }[]): CameraBounds {
  if (nodes.length === 0) {
    return { minX: 0, maxX: 1000, minY: 0, maxY: 1000, minZoom: 0.1, maxZoom: 5 };
  }

  const xs = nodes.map((n) => n.x);
  const ys = nodes.map((n) => n.y);

  const padding = 100;
  return {
    minX: Math.min(...xs) - padding,
    maxX: Math.max(...xs) + padding,
    minY: Math.min(...ys) - padding,
    maxY: Math.max(...ys) + padding,
    minZoom: 0.1,
    maxZoom: 5,
  };
}
