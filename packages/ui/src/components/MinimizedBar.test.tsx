import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Rect } from '@research-roadmap/layout';
import { MinimizedBar } from './MinimizedBar.js';

const RECT: Rect = { x: 12, y: 200, width: 160, height: 32 };

function renderBar(overrides: Partial<React.ComponentProps<typeof MinimizedBar>> = {}) {
  const onRestore = vi.fn();
  const { container } = render(
    <MinimizedBar rect={RECT} title="Resources" onRestore={onRestore} {...overrides} />,
  );
  return { onRestore, container };
}

describe('MinimizedBar', () => {
  it('renders an accessible restore button named by its title', () => {
    renderBar();
    const button = screen.getByRole('button', { name: 'Restore Resources' });
    expect(button).toBeTruthy();
    expect(button.getAttribute('data-testid')).toBe('minimized-bar');
    expect(screen.getByText('Resources')).toBeTruthy();
  });

  it('positions itself at the provided rect', () => {
    const { container } = renderBar();
    const bar = container.querySelector('[data-testid="minimized-bar"]') as HTMLElement;
    expect(bar.style.left).toBe('12px');
    expect(bar.style.top).toBe('200px');
    expect(bar.style.width).toBe('160px');
    expect(bar.style.height).toBe('32px');
  });

  it('calls onRestore when clicked', () => {
    const { onRestore } = renderBar();
    fireEvent.click(screen.getByTestId('minimized-bar'));
    expect(onRestore).toHaveBeenCalledTimes(1);
  });

  it('is a native <button> so Enter/Space activate it in real browsers', () => {
    // Keyboard activation is provided by using a native <button>; jsdom does
    // not translate Enter/Space keydown into a click (a browser-native default
    // action), and user-event is intentionally not installed. We therefore
    // assert the accessibility guarantee directly: a real button element with
    // an accessible name. Click-to-restore is covered by the test above.
    renderBar();
    const button = screen.getByRole('button', { name: 'Restore Resources' });
    expect(button.tagName).toBe('BUTTON');
    expect(button.getAttribute('type')).toBe('button');
  });

  it('exposes a visible focus ring on focus and clears it on blur', () => {
    renderBar();
    const bar = screen.getByTestId('minimized-bar') as HTMLElement;
    fireEvent.focus(bar);
    expect(bar.style.boxShadow).toContain('0 0 0');
    fireEvent.blur(bar);
    expect(bar.style.boxShadow).not.toContain('0 0 0');
  });
});
