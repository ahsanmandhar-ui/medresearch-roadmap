import { useState, useEffect, useRef } from 'react';
import { moveWindow } from '@research-roadmap/layout';
import type { Rect, Size } from '@research-roadmap/layout';
import { applyWindowGesture } from '../windowGesture.js';
import type { WindowGestureMode } from '../windowGesture.js';
import {
  colors,
  lightColors,
  typography,
  spacing,
  borderRadius,
  shadows,
  focusRing,
  transitions,
} from '../tokens.js';
import { useReducedMotion } from '../hooks/useReducedMotion.js';

export interface FloatingWindowProps {
  /** Current window rect (controlled). */
  rect: Rect;
  /** Stage size the window must stay within. */
  stage: Size;
  /** Window title, also the dialog's accessible name. */
  title: string;
  /** Window body. */
  children?: React.ReactNode;
  /** Called with the new rect after a drag/resize/keyboard-move. */
  onRectChange: (rect: Rect) => void;
  /** When provided, renders a close button that invokes this handler. */
  onClose?: () => void;
  /** When provided, renders a minimize button that invokes this handler (M5.4). */
  onMinimize?: () => void;
}

/** Pixels moved per arrow-key press. */
const KEYBOARD_STEP = 16;

interface ActiveGesture {
  mode: WindowGestureMode;
  startRect: Rect;
  startPointer: { x: number; y: number };
}

/**
 * Draggable / resizable floating window (docs/PLAN.md M5.3).
 *
 * Controlled component: the parent owns `rect` and receives updates via
 * `onRectChange`. All gesture geometry is delegated to the pure
 * `applyWindowGesture` helper (which clamps to the stage and enforces the
 * minimum size via the M5.1 layout solver), so the component only wires
 * pointer/keyboard events. Drag/resize use window-level mouse listeners so the
 * gesture keeps tracking even if the pointer leaves the handle, and arrow keys
 * on the title bar move the window for keyboard users (AGENTS.md §8).
 */
export function FloatingWindow({
  rect,
  stage,
  title,
  children,
  onRectChange,
  onClose,
  onMinimize,
}: FloatingWindowProps) {
  const reducedMotion = useReducedMotion();
  const [dragging, setDragging] = useState(false);
  const gestureRef = useRef<ActiveGesture | null>(null);

  // Attach window-level listeners only while a gesture is active.
  useEffect(() => {
    if (!dragging) return;

    function handleMove(event: MouseEvent) {
      const gesture = gestureRef.current;
      if (!gesture) return;
      onRectChange(
        applyWindowGesture({
          mode: gesture.mode,
          startRect: gesture.startRect,
          startPointer: gesture.startPointer,
          currentPointer: { x: event.clientX, y: event.clientY },
          stage,
        }),
      );
    }

    function handleUp() {
      gestureRef.current = null;
      setDragging(false);
    }

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [dragging, stage, onRectChange]);

  function beginGesture(mode: WindowGestureMode) {
    return (event: React.MouseEvent) => {
      if (event.button !== 0) return;
      event.preventDefault();
      gestureRef.current = {
        mode,
        startRect: rect,
        startPointer: { x: event.clientX, y: event.clientY },
      };
      setDragging(true);
    };
  }

  function handleTitleKeyDown(event: React.KeyboardEvent) {
    let dx = 0;
    let dy = 0;
    switch (event.key) {
      case 'ArrowRight':
        dx = KEYBOARD_STEP;
        break;
      case 'ArrowLeft':
        dx = -KEYBOARD_STEP;
        break;
      case 'ArrowDown':
        dy = KEYBOARD_STEP;
        break;
      case 'ArrowUp':
        dy = -KEYBOARD_STEP;
        break;
      default:
        return;
    }
    event.preventDefault();
    onRectChange(moveWindow(rect, { x: dx, y: dy }, stage));
  }

  const surface = lightColors.surface;
  const bodyFg = lightColors.text;
  const transition = reducedMotion
    ? 'none'
    : `box-shadow ${transitions.fast} ${transitions.easing.easeOut}`;
  const handleBase: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: 'transparent',
  };
  const titleButton: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    padding: 0,
    border: 'none',
    borderRadius: borderRadius.sm,
    backgroundColor: 'transparent',
    color: lightColors.textSecondary,
    fontSize: typography.fontSize.base,
    lineHeight: 1,
    cursor: 'pointer',
    transition,
    outline: 'none',
  };

  return (
    <div
      data-testid="floating-window"
      role="dialog"
      aria-label={title}
      style={{
        position: 'absolute',
        left: `${rect.x}px`,
        top: `${rect.y}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: surface,
        border: `1px solid ${lightColors.border}`,
        borderRadius: borderRadius.lg,
        boxShadow: shadows.xl,
        overflow: 'hidden',
        fontFamily: typography.fontFamily.sans,
      }}
    >
      <div
        data-testid="floating-window-titlebar"
        tabIndex={0}
        onMouseDown={beginGesture('move')}
        onKeyDown={handleTitleKeyDown}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: spacing[2],
          padding: `${spacing[2]} ${spacing[3]}`,
          backgroundColor: colors.neutral[100],
          borderBottom: `1px solid ${lightColors.border}`,
          cursor: 'move',
          userSelect: 'none',
          outline: 'none',
        }}
      >
        <span
          data-testid="floating-window-title"
          style={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            color: bodyFg,
          }}
        >
          {title}
        </span>
        {onMinimize || onClose ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[1] }}>
            {onMinimize ? (
              <button
                type="button"
                data-testid="floating-window-minimize"
                aria-label="Minimize"
                onClick={onMinimize}
                style={titleButton}
                onFocus={(event) => {
                  event.currentTarget.style.boxShadow = `0 0 0 ${focusRing.width} ${focusRing.color}`;
                }}
                onBlur={(event) => {
                  event.currentTarget.style.boxShadow = 'none';
                }}
              >
                –
              </button>
            ) : null}
            {onClose ? (
              <button
                type="button"
                data-testid="floating-window-close"
                aria-label="Close"
                onClick={onClose}
                style={titleButton}
                onFocus={(event) => {
                  event.currentTarget.style.boxShadow = `0 0 0 ${focusRing.width} ${focusRing.color}`;
                }}
                onBlur={(event) => {
                  event.currentTarget.style.boxShadow = 'none';
                }}
              >
                ×
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <div
        style={{
          flex: 1,
          padding: spacing[3],
          overflow: 'auto',
          color: bodyFg,
          fontSize: typography.fontSize.sm,
        }}
      >
        {children}
      </div>

      {/* East edge — resize width */}
      <div
        data-testid="floating-window-resize-e"
        role="separator"
        aria-label="Resize width"
        aria-orientation="vertical"
        onMouseDown={beginGesture('resize-e')}
        style={{
          ...handleBase,
          top: 0,
          right: 0,
          width: 6,
          height: '100%',
          cursor: 'ew-resize',
        }}
      />
      {/* South edge — resize height */}
      <div
        data-testid="floating-window-resize-s"
        role="separator"
        aria-label="Resize height"
        aria-orientation="horizontal"
        onMouseDown={beginGesture('resize-s')}
        style={{
          ...handleBase,
          bottom: 0,
          left: 0,
          width: '100%',
          height: 6,
          cursor: 'ns-resize',
        }}
      />
      {/* South-east corner — resize both */}
      <div
        data-testid="floating-window-resize-se"
        role="separator"
        aria-label="Resize width and height"
        onMouseDown={beginGesture('resize-se')}
        style={{
          ...handleBase,
          bottom: 0,
          right: 0,
          width: 14,
          height: 14,
          cursor: 'nwse-resize',
        }}
      />
    </div>
  );
}
