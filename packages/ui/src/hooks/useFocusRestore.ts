/**
 * M5.8 — Focus restoration (M3.4b): React binding.
 *
 * docs/ARCHITECTURE.md §5 requires that closing a floating window restores focus
 * to the element that opened it. The window-manager store (M5.7) is DOM-free, so
 * the durable part lives in the pure registry ({@link file://../focusRestore.ts}).
 * This hook adds the DOM concern: it remembers which real element opened a
 * window and calls `.focus()` on it when the window closes.
 *
 * Design: an element is tagged with a stable string key the first time it opens a
 * window (WeakMap element→key, so no leak and no manual cleanup). A Map key→
 * element lets us restore focus by key later. The pure `FocusReturnMap` records
 * windowId→key and is the source of truth for what to restore.
 */
import { useCallback, useRef } from 'react';
import {
  consumeOpener,
  hasOpener as hasOpenerInMap,
  recordOpener,
  type FocusReturnMap,
} from '../focusRestore.js';

/** Stable callbacks + a snapshot accessor, safe to call during event handlers. */
export interface UseFocusRestoreResult {
  /** Register the currently-focused element as the opener for `windowId`. */
  captureOpener: (windowId: string) => void;
  /** Close `windowId` and restore focus to its opener (if one is known). */
  closeAndRestore: (windowId: string) => void;
  /** Forget `windowId`'s opener without restoring focus (minimize/dock). */
  forget: (windowId: string) => void;
  /** Whether an opener has been recorded for `windowId`. */
  hasOpener: (windowId: string) => boolean;
  /** Snapshot of the current opener map (windowId → opener key). */
  returnMap: () => FocusReturnMap;
}

/** True when any open window still points at `key` (do not GC that element). */
function keyStillReferenced(map: FocusReturnMap, key: string): boolean {
  return (Object.values(map) as string[]).includes(key);
}

export function useFocusRestore(): UseFocusRestoreResult {
  const mapRef = useRef<FocusReturnMap>({});
  const keyByElementRef = useRef<WeakMap<Element, string>>(new WeakMap());
  const elementByKeyRef = useRef<Map<string, HTMLElement>>(new Map());
  const counterRef = useRef(0);

  const captureOpener = useCallback((windowId: string): void => {
    const active = document.activeElement;
    // Nothing meaningful to restore to: skip body/headless/non-Element.
    if (!active || active === document.body || !(active instanceof HTMLElement)) {
      return;
    }

    let key = keyByElementRef.current.get(active);
    if (key === undefined) {
      counterRef.current += 1;
      key = `focus-target-${counterRef.current}`;
      keyByElementRef.current.set(active, key);
      elementByKeyRef.current.set(key, active);
    }
    mapRef.current = recordOpener(mapRef.current, windowId, key);
  }, []);

  const closeAndRestore = useCallback((windowId: string): void => {
    const { map, openerKey } = consumeOpener(mapRef.current, windowId);
    mapRef.current = map;
    if (openerKey === null) return;

    const target = elementByKeyRef.current.get(openerKey);
    if (target) {
      target.focus();
    }
    if (!keyStillReferenced(mapRef.current, openerKey)) {
      elementByKeyRef.current.delete(openerKey);
    }
  }, []);

  const forget = useCallback((windowId: string): void => {
    const { map, openerKey } = consumeOpener(mapRef.current, windowId);
    mapRef.current = map;
    if (openerKey !== null && !keyStillReferenced(mapRef.current, openerKey)) {
      elementByKeyRef.current.delete(openerKey);
    }
  }, []);

  const hasOpener = useCallback(
    (windowId: string): boolean => hasOpenerInMap(mapRef.current, windowId),
    [],
  );

  const returnMap = useCallback((): FocusReturnMap => mapRef.current, []);

  return { captureOpener, closeAndRestore, forget, hasOpener, returnMap };
}
