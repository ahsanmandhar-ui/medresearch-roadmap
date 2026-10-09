import { describe, it, expect } from 'vitest';
import {
  consumeOpener,
  forgetOpener,
  hasOpener,
  recordOpener,
  type FocusReturnMap,
} from './focusRestore.js';

describe('focusRestore registry', () => {
  describe('recordOpener', () => {
    it('records an opener key for a window', () => {
      const map = recordOpener({}, 'win-1', 'focus-target-1');
      expect(map).toEqual({ 'win-1': 'focus-target-1' });
    });

    it('overwrites the previous opener for the same window (last open wins)', () => {
      let map: FocusReturnMap = recordOpener({}, 'win-1', 'focus-target-1');
      map = recordOpener(map, 'win-1', 'focus-target-2');
      expect(map['win-1']).toBe('focus-target-2');
    });

    it('does not mutate the input map', () => {
      const original: FocusReturnMap = {};
      recordOpener(original, 'win-1', 'focus-target-1');
      expect(original).toEqual({});
    });
  });

  describe('consumeOpener', () => {
    it('ACCEPTANCE: returns the opener key and removes the entry', () => {
      const map = recordOpener({}, 'win-1', 'focus-target-1');
      const result = consumeOpener(map, 'win-1');
      expect(result.openerKey).toBe('focus-target-1');
      expect(result.map).toEqual({});
    });

    it('returns null and the same map for an unknown window', () => {
      const map: FocusReturnMap = { 'win-1': 'focus-target-1' };
      const result = consumeOpener(map, 'missing');
      expect(result.openerKey).toBeNull();
      expect(result.map).toBe(map);
    });

    it('cannot be consumed twice', () => {
      const map = recordOpener({}, 'win-1', 'focus-target-1');
      const first = consumeOpener(map, 'win-1');
      const second = consumeOpener(first.map, 'win-1');
      expect(second.openerKey).toBeNull();
    });
  });

  describe('forgetOpener', () => {
    it('removes the entry without returning it', () => {
      const map = recordOpener({}, 'win-1', 'focus-target-1');
      const next = forgetOpener(map, 'win-1');
      expect(next).toEqual({});
      expect(hasOpener(next, 'win-1')).toBe(false);
    });

    it('returns the same map for an unknown window', () => {
      const map: FocusReturnMap = { 'win-1': 'focus-target-1' };
      expect(forgetOpener(map, 'missing')).toBe(map);
    });
  });

  describe('hasOpener', () => {
    it('reports presence and absence correctly', () => {
      const map = recordOpener({}, 'win-1', 'focus-target-1');
      expect(hasOpener(map, 'win-1')).toBe(true);
      expect(hasOpener(map, 'win-2')).toBe(false);
    });
  });
});
