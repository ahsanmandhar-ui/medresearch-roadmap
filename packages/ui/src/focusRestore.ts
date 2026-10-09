/**
 * M5.8 — Focus restoration (M3.4b): pure return-target registry.
 *
 * docs/ARCHITECTURE.md §5 requires that closing a floating window restores focus
 * to the element that opened it. The window-manager store (M5.7) is deliberately
 * DOM-free, so focus restoration is split into this pure registry (windowId →
 * opener key, fully unit-testable without a DOM) and a thin React hook
 * ({@link file://./hooks/useFocusRestore.ts}) that maps keys to real elements and
 * calls `.focus()`.
 *
 * The registry stores string keys, not elements, so it stays serializable and
 * DOM-free. The hook owns the key ↔ element binding.
 */

/** Maps an open window id to the key of the element that opened it. */
export type FocusReturnMap = Readonly<Record<string, string>>;

/**
 * Record that `windowId` was opened from the element identified by `openerKey`.
 * Overwrites any previous opener for the same window (last open wins). Returns a
 * new map; the input is not mutated.
 */
export function recordOpener(
  map: FocusReturnMap,
  windowId: string,
  openerKey: string,
): FocusReturnMap {
  return { ...map, [windowId]: openerKey };
}

/** Result of {@link consumeOpener}. */
export interface ConsumeOpenerResult {
  /** The updated map with `windowId` removed. */
  map: FocusReturnMap;
  /** The opener key to restore focus to, or null when none was recorded. */
  openerKey: string | null;
}

/**
 * Remove `windowId` from the map and return its opener key (or null when the
 * window had no recorded opener). The entry is cleared so a window cannot be
 * "restored" twice. For an unknown id the same map reference is returned.
 */
export function consumeOpener(map: FocusReturnMap, windowId: string): ConsumeOpenerResult {
  if (!Object.prototype.hasOwnProperty.call(map, windowId)) {
    return { map, openerKey: null };
  }
  const openerKey = map[windowId];
  if (openerKey === undefined) {
    return { map, openerKey: null };
  }
  const next: Record<string, string> = { ...map };
  delete next[windowId];
  return { map: next, openerKey };
}

/**
 * Forget `windowId`'s opener without restoring focus (e.g. the window was
 * minimized/docked rather than closed). Returns a new map, or the same reference
 * when the window is unknown.
 */
export function forgetOpener(map: FocusReturnMap, windowId: string): FocusReturnMap {
  if (!Object.prototype.hasOwnProperty.call(map, windowId)) return map;
  const next: Record<string, string> = { ...map };
  delete next[windowId];
  return next;
}

/** Whether an opener has been recorded for `windowId`. */
export function hasOpener(map: FocusReturnMap, windowId: string): boolean {
  return Object.prototype.hasOwnProperty.call(map, windowId);
}
