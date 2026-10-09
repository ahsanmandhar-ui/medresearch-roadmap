import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGraphKeyboardNavigation } from './useGraphKeyboardNavigation.js';
import type { NavigableNode } from '../keyboardNav.js';

const nodes: NavigableNode[] = [
  { id: 'a', x: 0, y: 0, width: 200, height: 80 },
  { id: 'b', x: 300, y: 0, width: 200, height: 80 },
];

describe('useGraphKeyboardNavigation', () => {
  it('navigates to the next node on ArrowRight and prevents default', () => {
    const onNavigate = vi.fn();
    const preventDefault = vi.fn();
    const { result } = renderHook(() =>
      useGraphKeyboardNavigation({ nodes, currentId: 'a', onNavigate }),
    );

    act(() => {
      result.current({ key: 'ArrowRight', preventDefault });
    });

    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(onNavigate).toHaveBeenCalledWith('b');
  });

  it('ignores unmapped keys', () => {
    const onNavigate = vi.fn();
    const { result } = renderHook(() =>
      useGraphKeyboardNavigation({ nodes, currentId: 'a', onNavigate }),
    );

    act(() => {
      result.current({ key: 'Enter', preventDefault: vi.fn() });
    });

    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('does nothing when no node is focused', () => {
    const onNavigate = vi.fn();
    const { result } = renderHook(() =>
      useGraphKeyboardNavigation({ nodes, currentId: null, onNavigate }),
    );

    act(() => {
      result.current({ key: 'ArrowRight', preventDefault: vi.fn() });
    });

    expect(onNavigate).not.toHaveBeenCalled();
  });

  it('does not navigate when no node exists in that direction', () => {
    const onNavigate = vi.fn();
    const { result } = renderHook(() =>
      useGraphKeyboardNavigation({ nodes, currentId: 'a', onNavigate }),
    );

    act(() => {
      result.current({ key: 'ArrowLeft', preventDefault: vi.fn() });
    });

    expect(onNavigate).not.toHaveBeenCalled();
  });
});
