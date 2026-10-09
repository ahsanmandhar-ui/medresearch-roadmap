/**
 * Frame-coalescing render scheduler — a pure M3 performance primitive
 * (docs/PLAN.md M3.5). Interactive graph changes (pan, zoom, hover, node state)
 * often fire many times per frame; rendering on every change wastes work. This
 * scheduler marks the view dirty and collapses any number of `schedule()` calls
 * that happen before the next animation frame into a single flush.
 *
 * DOM-free and dependency-free (AGENTS.md §4). The frame mechanism is injected
 * so the module is deterministic under test and SSR-safe: in a browser it uses
 * requestAnimationFrame, and falls back to setTimeout where rAF is unavailable.
 * Consumption is deferred to M4/M5 when a rendered graph container exists —
 * this slice ships the tested primitive, mirroring M3.4a/M3.5a.
 */

/** Opaque handle returned by a frame scheduler (rAF id or timeout id). */
export type FrameHandle = number;

/** Requests a callback on the next frame; returns a cancellation handle. */
export type RequestFrame = (callback: () => void) => FrameHandle;

/** Cancels a previously requested frame. */
export type CancelFrame = (handle: FrameHandle) => void;

export interface RenderSchedulerOptions {
  /** Override the frame mechanism (defaults to rAF, else setTimeout). */
  requestFrame?: RequestFrame;
  /** Override frame cancellation (defaults to cancelAnimationFrame/clearTimeout). */
  cancelFrame?: CancelFrame;
}

export interface RenderScheduler {
  /** Mark the view dirty and ensure a single flush is queued for the next frame. */
  schedule(): void;
  /** Flush immediately, cancelling any pending frame. No-op when not dirty. */
  flush(): void;
  /** Cancel any pending frame without flushing and clear the dirty flag. */
  cancel(): void;
  /** True while a frame is queued but not yet run. */
  isScheduled(): boolean;
  /** True when a flush is pending (scheduled or awaiting an immediate flush). */
  isDirty(): boolean;
}

function defaultRequestFrame(callback: () => void): FrameHandle {
  if (typeof requestAnimationFrame === 'function') {
    return requestAnimationFrame(callback);
  }
  return setTimeout(callback, 0) as unknown as FrameHandle;
}

function defaultCancelFrame(handle: FrameHandle): void {
  // The default request path uses exactly one mechanism per environment, but
  // cancelling via both is harmless when an id belongs to the other (each is a
  // no-op for an unknown id), so this stays robust without tracking the source.
  if (typeof cancelAnimationFrame === 'function') {
    cancelAnimationFrame(handle);
  }
  clearTimeout(handle as unknown as ReturnType<typeof setTimeout>);
}

/**
 * Create a render scheduler whose flush runs `flushCallback`.
 *
 * Guarantees at most one `flushCallback` invocation per frame regardless of how
 * many times `schedule()` is called, and never invokes it after `cancel()`.
 */
export function createRenderScheduler(
  flushCallback: () => void,
  options: RenderSchedulerOptions = {},
): RenderScheduler {
  const requestFrame = options.requestFrame ?? defaultRequestFrame;
  const cancelFrame = options.cancelFrame ?? defaultCancelFrame;

  let handle: FrameHandle | null = null;
  let dirty = false;

  function runFrame(): void {
    handle = null;
    dirty = false;
    flushCallback();
  }

  return {
    schedule(): void {
      if (handle !== null) return; // already queued — coalesce into this frame
      dirty = true;
      handle = requestFrame(runFrame);
    },
    flush(): void {
      if (handle !== null) {
        cancelFrame(handle);
        handle = null;
      }
      if (!dirty) return;
      dirty = false;
      flushCallback();
    },
    cancel(): void {
      if (handle !== null) {
        cancelFrame(handle);
        handle = null;
      }
      dirty = false;
    },
    isScheduled(): boolean {
      return handle !== null;
    },
    isDirty(): boolean {
      return dirty;
    },
  };
}
