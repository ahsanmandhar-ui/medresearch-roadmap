/**
 * Pure spatial keyboard-navigation logic for the research graph.
 *
 * Arrow-key traversal moves focus between nodes laid out in 2D space. The
 * algorithm selects the nearest node in the requested direction, preferring
 * nodes aligned with the current node when distances tie. Kept free of React
 * and DOM access so it is trivially unit-testable (AGENTS.md §4).
 */

/** Cardinal movement directions supported by graph keyboard navigation. */
export type NavDirection = 'up' | 'down' | 'left' | 'right';

/** A node that participates in keyboard navigation. */
export interface NavigableNode {
  id: string;
  /** Top-left X in graph space. */
  x: number;
  /** Top-left Y in graph space. */
  y: number;
  width: number;
  height: number;
}

/** Pixel tolerance used to treat two positions as aligned. */
const EPSILON = 0.5;

const KEY_TO_DIRECTION = new Map<string, NavDirection>([
  ['ArrowUp', 'up'],
  ['ArrowDown', 'down'],
  ['ArrowLeft', 'left'],
  ['ArrowRight', 'right'],
]);

/** Map a keyboard event key to a navigation direction, or null if unmapped. */
export function directionFromKey(key: string): NavDirection | null {
  return KEY_TO_DIRECTION.get(key) ?? null;
}

function centerX(node: NavigableNode): number {
  return node.x + node.width / 2;
}

function centerY(node: NavigableNode): number {
  return node.y + node.height / 2;
}

interface Candidate {
  id: string;
  primary: number;
  secondary: number;
}

/**
 * Find the nearest node to `currentId` in `direction`.
 *
 * "Primary" distance is movement along the requested axis; "secondary" is the
 * perpendicular drift used to break ties toward aligned nodes. Returns the
 * target node id, or null when the current node is missing or nothing lies in
 * that direction.
 */
export function findNextNode(
  nodes: readonly NavigableNode[],
  currentId: string,
  direction: NavDirection,
): string | null {
  const current = nodes.find((node) => node.id === currentId);
  if (!current) return null;

  const cx = centerX(current);
  const cy = centerY(current);

  const candidates: Candidate[] = [];

  for (const node of nodes) {
    if (node.id === currentId) continue;

    const dx = centerX(node) - cx;
    const dy = centerY(node) - cy;

    let primary: number;
    let secondary: number;

    switch (direction) {
      case 'right':
        primary = dx;
        secondary = Math.abs(dy);
        break;
      case 'left':
        primary = -dx;
        secondary = Math.abs(dy);
        break;
      case 'down':
        primary = dy;
        secondary = Math.abs(dx);
        break;
      case 'up':
        primary = -dy;
        secondary = Math.abs(dx);
        break;
      default:
        return null;
    }

    // Only nodes strictly in the requested direction are eligible.
    if (primary <= EPSILON) continue;

    candidates.push({ id: node.id, primary, secondary });
  }

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    if (Math.abs(a.primary - b.primary) > EPSILON) {
      return a.primary - b.primary;
    }
    return a.secondary - b.secondary;
  });

  const [first] = candidates;
  return first ? first.id : null;
}
