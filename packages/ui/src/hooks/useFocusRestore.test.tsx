import { describe, it, expect, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFocusRestore } from './useFocusRestore.js';

function OpenerHarness(): { button: HTMLButtonElement } {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Open resource';
  container.appendChild(button);
  return { button };
}

describe('useFocusRestore', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('ACCEPTANCE: restores focus to the opener element after closeAndRestore', () => {
    const { result } = renderHook(() => useFocusRestore());
    const { button } = OpenerHarness();

    // Simulate the user focusing the opener, then opening a window from it.
    button.focus();
    expect(document.activeElement).toBe(button);
    result.current.captureOpener('win-1');
    expect(result.current.hasOpener('win-1')).toBe(true);

    // Focus moves into the window, then the window closes.
    const insideWindow = document.createElement('button');
    document.body.appendChild(insideWindow);
    insideWindow.focus();
    expect(document.activeElement).toBe(insideWindow);

    result.current.closeAndRestore('win-1');

    // Focus is back on the opener, and the entry was consumed.
    expect(document.activeElement).toBe(button);
    expect(result.current.hasOpener('win-1')).toBe(false);
  });

  it('records nothing when focus is on the body (no meaningful opener)', () => {
    const { result } = renderHook(() => useFocusRestore());
    // activeElement defaults to <body> in jsdom.
    result.current.captureOpener('win-1');
    expect(result.current.hasOpener('win-1')).toBe(false);

    // Closing is a safe no-op: no throw, focus unchanged.
    expect(() => result.current.closeAndRestore('win-1')).not.toThrow();
  });

  it('closeAndRestore on an unknown window is a safe no-op', () => {
    const { result } = renderHook(() => useFocusRestore());
    const { button } = OpenerHarness();
    button.focus();
    expect(() => result.current.closeAndRestore('never-opened')).not.toThrow();
    expect(document.activeElement).toBe(button);
  });

  it('forget() clears the opener without restoring focus', () => {
    const { result } = renderHook(() => useFocusRestore());
    const { button } = OpenerHarness();
    button.focus();
    result.current.captureOpener('win-1');

    const insideWindow = document.createElement('button');
    document.body.appendChild(insideWindow);
    insideWindow.focus();

    result.current.forget('win-1');

    // Entry gone, and focus was NOT moved back to the opener.
    expect(result.current.hasOpener('win-1')).toBe(false);
    expect(document.activeElement).toBe(insideWindow);
  });

  it('re-capturing the same element for a different window reuses its key', () => {
    const { result } = renderHook(() => useFocusRestore());
    const { button } = OpenerHarness();
    button.focus();
    result.current.captureOpener('win-1');
    result.current.captureOpener('win-2');

    const map = result.current.returnMap();
    // Same opener element → same key used for both windows.
    expect(map['win-1']).toBe(map['win-2']);

    // Closing one still restores focus for the other window's close.
    const insideWindow = document.createElement('button');
    document.body.appendChild(insideWindow);
    insideWindow.focus();
    result.current.closeAndRestore('win-1');
    expect(document.activeElement).toBe(button);

    // The element key survives because win-2 still references it.
    insideWindow.focus();
    result.current.closeAndRestore('win-2');
    expect(document.activeElement).toBe(button);
  });
});
