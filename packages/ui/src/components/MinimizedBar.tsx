import type { Rect } from '@research-roadmap/layout';
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

export interface MinimizedBarProps {
  /** Rect where the bar is docked (from the M5.1 `layoutMinimizedBars` solver). */
  rect: Rect;
  /** Title shown on the bar; also the button's accessible name. */
  title: string;
  /** Called when the bar is activated to restore the window (M5.4). */
  onRestore: () => void;
}

/**
 * A minimized-window bar (docs/PLAN.md M5.4, docs/ARCHITECTURE.md §5).
 *
 * Controlled component: the parent computes a non-overlapping position via the
 * pure `layoutMinimizedBars` solver (so bars never overlap) and passes it as
 * `rect`. Activating the bar — by click or keyboard (Enter/Space, native to
 * `<button>`) — invokes `onRestore` so the parent can dispatch the
 * `restore` command through the M5.2 state machine. Geometry stays in the
 * solver; this component only renders and wires the restore affordance,
 * mirroring the M5.3 `FloatingWindow` approach. Honors reduced motion (§8) and
 * exposes a visible focus ring (§8).
 */
export function MinimizedBar({ rect, title, onRestore }: MinimizedBarProps) {
  const reducedMotion = useReducedMotion();
  const transition = reducedMotion
    ? 'none'
    : `box-shadow ${transitions.fast} ${transitions.easing.easeOut}`;

  return (
    <button
      type="button"
      data-testid="minimized-bar"
      aria-label={`Restore ${title}`}
      onClick={onRestore}
      style={{
        position: 'absolute',
        left: `${rect.x}px`,
        top: `${rect.y}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`,
        display: 'inline-flex',
        alignItems: 'center',
        gap: spacing[2],
        padding: `${spacing[1]} ${spacing[3]}`,
        backgroundColor: lightColors.surface,
        border: `1px solid ${lightColors.border}`,
        borderTop: `2px solid ${colors.green[500]}`,
        borderRadius: borderRadius.md,
        boxShadow: shadows.sm,
        color: lightColors.text,
        fontFamily: typography.fontFamily.sans,
        fontSize: typography.fontSize.sm,
        cursor: 'pointer',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        textAlign: 'left',
        transition,
        outline: 'none',
      }}
      onFocus={(event) => {
        event.currentTarget.style.boxShadow = `0 0 0 ${focusRing.width} ${focusRing.color}`;
      }}
      onBlur={(event) => {
        event.currentTarget.style.boxShadow = shadows.sm;
      }}
    >
      <span
        aria-hidden="true"
        style={{
          fontSize: typography.fontSize.xs,
          color: lightColors.textSecondary,
          lineHeight: 1,
        }}
      >
        ▴
      </span>
      <span
        style={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {title}
      </span>
    </button>
  );
}
