import { describe, it, expect, vi } from 'vitest';
import { createRenderScheduler } from './renderScheduler.js';
import type { FrameHandle, RequestFrame, CancelFrame } from './renderScheduler.js';

/** A controllable fake frame mechanism for deterministic tests. */
function createFakeFrames() {
  let nextHandle: FrameHandle = 1;
  const pending = new Map<FrameHandle, () => void>();

  const requestFrame: RequestFrame = (callback) => {
    const handle = nextHandle++;
    pending.set(handle, callback);
    return handle;
  };

  const cancelFrame: CancelFrame = (handle) => {
    pending.delete(handle);
  };

  function runAll(): number {
    // Snapshot so callbacks scheduling new frames don't run in this pass.
    const due = [...pending.entries()];
    pending.clear();
    for (const [, callback] of due) callback();
    return due.length;
  }

  return {
    requestFrame,
    cancelFrame,
    runAll,
    get size() {
      return pending.size;
    },
  };
}

describe('createRenderScheduler', () => {
  it('requests a single frame on first schedule', () => {
    const frames = createFakeFrames();
    const flush = vi.fn();
    const scheduler = createRenderScheduler(flush, frames);

    scheduler.schedule();

    expect(frames.size).toBe(1);
    expect(scheduler.isScheduled()).toBe(true);
    expect(scheduler.isDirty()).toBe(true);
    expect(flush).not.toHaveBeenCalled();
  });

  it('coalesces multiple schedule() calls into one frame and one flush', () => {
    const frames = createFakeFrames();
    const flush = vi.fn();
    const scheduler = createRenderScheduler(flush, frames);

    scheduler.schedule();
    scheduler.schedule();
    scheduler.schedule();

    expect(frames.size).toBe(1);

    const ran = frames.runAll();
    expect(ran).toBe(1);
    expect(flush).toHaveBeenCalledTimes(1);
    expect(scheduler.isScheduled()).toBe(false);
    expect(scheduler.isDirty()).toBe(false);
  });

  it('flush() runs immediately and cancels the pending frame', () => {
    const frames = createFakeFrames();
    const flush = vi.fn();
    const scheduler = createRenderScheduler(flush, frames);

    scheduler.schedule();
    scheduler.flush();

    expect(flush).toHaveBeenCalledTimes(1);
    expect(frames.size).toBe(0); // pending frame was cancelled
    expect(scheduler.isDirty()).toBe(false);

    // Running remaining frames must not double-invoke the callback.
    frames.runAll();
    expect(flush).toHaveBeenCalledTimes(1);
  });

  it('flush() is a no-op when nothing is dirty', () => {
    const frames = createFakeFrames();
    const flush = vi.fn();
    const scheduler = createRenderScheduler(flush, frames);

    scheduler.flush();

    expect(flush).not.toHaveBeenCalled();
  });

  it('cancel() drops the pending frame without flushing', () => {
    const frames = createFakeFrames();
    const flush = vi.fn();
    const scheduler = createRenderScheduler(flush, frames);

    scheduler.schedule();
    scheduler.cancel();

    expect(frames.size).toBe(0);
    expect(scheduler.isDirty()).toBe(false);

    frames.runAll();
    expect(flush).not.toHaveBeenCalled();
  });

  it('can be scheduled again after a flush', () => {
    const frames = createFakeFrames();
    const flush = vi.fn();
    const scheduler = createRenderScheduler(flush, frames);

    scheduler.schedule();
    frames.runAll();
    expect(flush).toHaveBeenCalledTimes(1);

    scheduler.schedule();
    expect(frames.size).toBe(1);
    frames.runAll();
    expect(flush).toHaveBeenCalledTimes(2);
  });

  it('falls back to setTimeout when requestAnimationFrame is unavailable', () => {
    vi.useFakeTimers();
    const originalRaf = globalThis.requestAnimationFrame;
    // Simulate an environment without rAF (no type escape hatches needed).
    Object.defineProperty(globalThis, 'requestAnimationFrame', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    try {
      const flush = vi.fn();
      const scheduler = createRenderScheduler(flush);

      scheduler.schedule();
      expect(flush).not.toHaveBeenCalled();

      vi.advanceTimersByTime(0);
      expect(flush).toHaveBeenCalledTimes(1);
    } finally {
      Object.defineProperty(globalThis, 'requestAnimationFrame', {
        value: originalRaf,
        configurable: true,
        writable: true,
      });
      vi.useRealTimers();
    }
  });
});
