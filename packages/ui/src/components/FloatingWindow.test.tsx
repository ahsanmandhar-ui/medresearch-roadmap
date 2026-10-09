import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Rect, Size } from '@research-roadmap/layout';
import { FloatingWindow } from './FloatingWindow.js';

const STAGE: Size = { width: 1000, height: 800 };
const RECT: Rect = { x: 100, y: 100, width: 300, height: 200 };

function renderWindow(overrides: Partial<React.ComponentProps<typeof FloatingWindow>> = {}) {
  const onRectChange = vi.fn();
  const onClose = vi.fn();
  render(
    <FloatingWindow
      rect={RECT}
      stage={STAGE}
      title="Resources"
      onRectChange={onRectChange}
      onClose={onClose}
      {...overrides}
    >
      <p>Body content</p>
    </FloatingWindow>,
  );
  return { onRectChange, onClose };
}

/** Simulate a drag by dispatching mousedown → mousemove → mouseup on window. */
function drag(
  el: Element,
  start: { clientX: number; clientY: number },
  current: { clientX: number; clientY: number },
) {
  fireEvent.mouseDown(el, { button: 0, ...start });
  fireEvent.mouseMove(window, current);
  fireEvent.mouseUp(window);
}

describe('FloatingWindow', () => {
  it('renders as a labelled dialog with title and content', () => {
    renderWindow();
    const dialog = screen.getByRole('dialog', { name: 'Resources' });
    expect(dialog).toBeTruthy();
    expect(screen.getByTestId('floating-window-title').textContent).toBe('Resources');
    expect(screen.getByText('Body content')).toBeTruthy();
  });

  it('positions itself at the provided rect', () => {
    const { container } = render(
      <FloatingWindow rect={RECT} stage={STAGE} title="W" onRectChange={vi.fn()}>
        {null}
      </FloatingWindow>,
    );
    const win = container.querySelector('[data-testid="floating-window"]') as HTMLElement;
    expect(win.style.left).toBe('100px');
    expect(win.style.top).toBe('100px');
    expect(win.style.width).toBe('300px');
    expect(win.style.height).toBe('200px');
  });

  it('drags the window by the pointer delta via the title bar', () => {
    const { onRectChange } = renderWindow();
    const titleBar = screen.getByTestId('floating-window-titlebar');
    drag(titleBar, { clientX: 100, clientY: 100 }, { clientX: 180, clientY: 145 });
    expect(onRectChange).toHaveBeenCalledWith({ x: 180, y: 145, width: 300, height: 200 });
  });

  it('clamps a drag so the window stays inside the stage', () => {
    const { onRectChange } = renderWindow();
    const titleBar = screen.getByTestId('floating-window-titlebar');
    drag(titleBar, { clientX: 100, clientY: 100 }, { clientX: 5000, clientY: 5000 });
    const next = onRectChange.mock.calls[0]?.[0] as Rect;
    expect(next.x).toBe(STAGE.width - RECT.width); // 700
    expect(next.y).toBe(STAGE.height - RECT.height); // 600
  });

  it('resizes from the east handle, keeping the top-left fixed', () => {
    const { onRectChange } = renderWindow();
    const handle = screen.getByTestId('floating-window-resize-e');
    drag(handle, { clientX: 100, clientY: 100 }, { clientX: 250, clientY: 100 });
    const next = onRectChange.mock.calls[0]?.[0] as Rect;
    expect(next.x).toBe(RECT.x);
    expect(next.y).toBe(RECT.y);
    expect(next.width).toBe(450); // 300 + 150
    expect(next.height).toBe(RECT.height);
  });

  it('resizes from the south-east corner', () => {
    const { onRectChange } = renderWindow();
    const handle = screen.getByTestId('floating-window-resize-se');
    drag(handle, { clientX: 100, clientY: 100 }, { clientX: 200, clientY: 250 });
    const next = onRectChange.mock.calls[0]?.[0] as Rect;
    expect(next.width).toBe(400); // 300 + 100
    expect(next.height).toBe(350); // 200 + 150
  });

  it('moves the window with arrow keys on the title bar (keyboard accessible)', () => {
    const { onRectChange } = renderWindow();
    const titleBar = screen.getByTestId('floating-window-titlebar');
    fireEvent.keyDown(titleBar, { key: 'ArrowRight' });
    const next = onRectChange.mock.calls[0]?.[0] as Rect;
    expect(next.x).toBe(RECT.x + 16);
    expect(next.y).toBe(RECT.y);
  });

  it('calls onClose when the close button is activated', () => {
    const { onClose, onRectChange } = renderWindow();
    fireEvent.click(screen.getByTestId('floating-window-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onRectChange).not.toHaveBeenCalled();
  });

  it('calls onMinimize when the minimize button is activated', () => {
    const onMinimize = vi.fn();
    const { onRectChange } = renderWindow({ onMinimize });
    fireEvent.click(screen.getByTestId('floating-window-minimize'));
    expect(onMinimize).toHaveBeenCalledTimes(1);
    expect(onRectChange).not.toHaveBeenCalled();
  });

  it('renders no minimize button when onMinimize is omitted', () => {
    renderWindow();
    expect(screen.queryByTestId('floating-window-minimize')).toBeNull();
  });

  it('renders no close button when onClose is omitted', () => {
    render(
      <FloatingWindow rect={RECT} stage={STAGE} title="W" onRectChange={vi.fn()}>
        {null}
      </FloatingWindow>,
    );
    expect(screen.queryByTestId('floating-window-close')).toBeNull();
  });

  it('exposes resize handles as labelled separators', () => {
    renderWindow();
    expect(screen.getByLabelText('Resize width')).toBeTruthy();
    expect(screen.getByLabelText('Resize height')).toBeTruthy();
    expect(screen.getByLabelText('Resize width and height')).toBeTruthy();
  });
});
