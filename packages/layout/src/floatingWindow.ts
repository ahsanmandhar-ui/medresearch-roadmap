/**
 * Pure floating-window state machine (docs/PLAN.md M5.2, docs/ARCHITECTURE.md §5).
 *
 * DOM-free and dependency-free (AGENTS.md §4). Models the lifecycle
 *
 *   DOCKED → FLOATING → MINIMIZED
 *      ↑         ↓          |
 *      └─────────┴──────────┘
 *
 * and enforces the documented rules:
 *   - one detached (FLOATING) partition at a time;
 *   - MINIMIZED windows return to FLOATING (and displace any current float);
 *   - FLOATING windows return to DOCKED.
 *
 * Geometry stays out of this module (that is M5.1's solver): the machine only
 * tracks window ids and states, so it is trivially unit-testable. React
 * bindings that render panes and wire drag/resize arrive in M5.3+.
 */

/** Lifecycle states for a floating-window partition. */
export type WindowState = 'docked' | 'floating' | 'minimized';

/** The full floating-window model: per-window state + the active float. */
export interface FloatingWindowModel {
  /** Window id → current state. */
  states: Record<string, WindowState>;
  /** Id of the single window currently FLOATING, or null when none is. */
  floatingId: string | null;
}

/** A command that mutates the model. */
export type WindowCommand =
  | { type: 'float'; id: string }
  | { type: 'minimize'; id: string }
  | { type: 'restore'; id: string }
  | { type: 'dock'; id: string };

/**
 * Create an empty model. Windows are added lazily and default to DOCKED, which
 * represents "shown inline in the map / sidebar" rather than detached.
 */
export function createFloatingWindowModel(
  knownIds: readonly string[] = [],
): FloatingWindowModel {
  const states: Record<string, WindowState> = {};
  for (const id of knownIds) states[id] = 'docked';
  return { states, floatingId: null };
}

/** The state of a single window, defaulting to DOCKED when unknown. */
export function getWindowState(model: FloatingWindowModel, id: string): WindowState {
  return model.states[id] ?? 'docked';
}

/**
 * Apply a command to `model`, returning a NEW model (the input is never
 * mutated). Invalid or no-op transitions return the model unchanged, so callers
 * can compare references to detect changes.
 */
export function reduceWindow(
  model: FloatingWindowModel,
  command: WindowCommand,
): FloatingWindowModel {
  const states: Record<string, WindowState> = { ...model.states };

  switch (command.type) {
    case 'float': {
      const current = getWindowState(model, command.id);
      // Already the active float → no-op.
      if (current === 'floating' && model.floatingId === command.id) return model;

      // Enforce "one detached partition at a time": demote any other float to
      // DOCKED before floating this window.
      if (model.floatingId !== null && model.floatingId !== command.id) {
        states[model.floatingId] = 'docked';
      }
      states[command.id] = 'floating';
      return { states, floatingId: command.id };
    }

    case 'minimize': {
      const current = getWindowState(model, command.id);
      // Only FLOATING windows can be minimized to a bar.
      if (current !== 'floating') return model;
      states[command.id] = 'minimized';
      // Floating slot is now empty.
      return { states, floatingId: null };
    }

    case 'restore': {
      const current = getWindowState(model, command.id);
      // Only MINIMIZED windows can be restored.
      if (current !== 'minimized') return model;

      // Displace any other float back to DOCKED (single-float invariant).
      if (model.floatingId !== null && model.floatingId !== command.id) {
        states[model.floatingId] = 'docked';
      }
      states[command.id] = 'floating';
      return { states, floatingId: command.id };
    }

    case 'dock': {
      const current = getWindowState(model, command.id);
      // A DOCKED window is already docked → no-op.
      if (current === 'docked') return model;
      states[command.id] = 'docked';
      const floatingId = model.floatingId === command.id ? null : model.floatingId;
      return { states, floatingId };
    }

    default: {
      // Exhaustiveness guard: every WindowCommand is handled above.
      const _exhaustive: never = command;
      return _exhaustive;
    }
  }
}

/** True when exactly the invariant holds: `floatingId` is null XOR is FLOATING. */
export function isModelConsistent(model: FloatingWindowModel): boolean {
  const floatingIds = Object.keys(model.states).filter(
    (id) => model.states[id] === 'floating',
  );
  if (model.floatingId === null) return floatingIds.length === 0;
  return floatingIds.length === 1 && model.states[model.floatingId] === 'floating';
}
