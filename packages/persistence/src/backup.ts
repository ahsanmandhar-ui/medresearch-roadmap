/**
 * M6.3 — DOM-free, dependency-free backup/restore for the user-local store.
 *
 * Exports the notes + asset references held in a {@link UserStore} into a plain,
 * serializable JSON snapshot, and imports such a snapshot back. This is the
 * user's own data (their browser); a snapshot is never committed to the repo or
 * written into content JSON files.
 *
 * Asset records carry METADATA AND REFERENCES ONLY — blob bytes are never stored
 * or fabricated, so a snapshot restores references, not file contents.
 *
 * External input is validated structurally (AGENTS.md §1/§4) WITHOUT zod, to keep
 * this package dependency-free; malformed input throws {@link InvalidUserDataSnapshotError}
 * and nothing is written.
 */

import type { AssetRef, Note, UserStore } from './notesStore.js';
import type { StoredRecord } from './keyValueStore.js';

/** A serializable snapshot of the user-local notes + asset references. */
export interface UserDataSnapshot {
  readonly schemaName: string;
  readonly schemaVersion: number;
  readonly exportedAt: number;
  readonly notes: readonly StoredRecord<Note>[];
  readonly assets: readonly AssetRef[];
}

/** Thrown when a value is not a structurally valid {@link UserDataSnapshot}. */
export class InvalidUserDataSnapshotError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidUserDataSnapshotError';
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

function validateNotes(input: unknown): StoredRecord<Note>[] {
  if (!isArray(input)) {
    throw new InvalidUserDataSnapshotError('snapshot.notes must be an array');
  }
  return input.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new InvalidUserDataSnapshotError(`snapshot.notes[${index}] must be an object`);
    }
    const { key, value } = entry;
    if (!isString(key)) {
      throw new InvalidUserDataSnapshotError(`snapshot.notes[${index}].key must be a string`);
    }
    if (!isRecord(value)) {
      throw new InvalidUserDataSnapshotError(`snapshot.notes[${index}].value must be an object`);
    }
    if (!isString(value.nodeId)) {
      throw new InvalidUserDataSnapshotError(
        `snapshot.notes[${index}].value.nodeId must be a string`,
      );
    }
    if (!isString(value.body)) {
      throw new InvalidUserDataSnapshotError(
        `snapshot.notes[${index}].value.body must be a string`,
      );
    }
    if (!isFiniteNumber(value.updatedAt)) {
      throw new InvalidUserDataSnapshotError(
        `snapshot.notes[${index}].value.updatedAt must be a number`,
      );
    }
    const note: Note = { nodeId: value.nodeId, body: value.body, updatedAt: value.updatedAt };
    return { key, value: note };
  });
}

function validateAssets(input: unknown): AssetRef[] {
  if (!isArray(input)) {
    throw new InvalidUserDataSnapshotError('snapshot.assets must be an array');
  }
  return input.map((entry, index) => {
    if (!isRecord(entry)) {
      throw new InvalidUserDataSnapshotError(`snapshot.assets[${index}] must be an object`);
    }
    if (!isString(entry.id)) {
      throw new InvalidUserDataSnapshotError(`snapshot.assets[${index}].id must be a string`);
    }
    if (!isString(entry.nodeId)) {
      throw new InvalidUserDataSnapshotError(`snapshot.assets[${index}].nodeId must be a string`);
    }
    if (!isString(entry.filename)) {
      throw new InvalidUserDataSnapshotError(`snapshot.assets[${index}].filename must be a string`);
    }
    if (!isString(entry.mime)) {
      throw new InvalidUserDataSnapshotError(`snapshot.assets[${index}].mime must be a string`);
    }
    if (!isFiniteNumber(entry.size)) {
      throw new InvalidUserDataSnapshotError(`snapshot.assets[${index}].size must be a number`);
    }
    if (entry.blobKey !== undefined && !isString(entry.blobKey)) {
      throw new InvalidUserDataSnapshotError(
        `snapshot.assets[${index}].blobKey must be a string when present`,
      );
    }
    // Preserve optional blobKey WITHOUT introducing an `undefined` property
    // (exactOptionalPropertyTypes).
    const asset: AssetRef =
      entry.blobKey === undefined
        ? {
            id: entry.id,
            nodeId: entry.nodeId,
            filename: entry.filename,
            mime: entry.mime,
            size: entry.size,
          }
        : {
            id: entry.id,
            nodeId: entry.nodeId,
            filename: entry.filename,
            mime: entry.mime,
            size: entry.size,
            blobKey: entry.blobKey,
          };
    return asset;
  });
}

function validateSnapshot(input: unknown): UserDataSnapshot {
  if (!isRecord(input)) {
    throw new InvalidUserDataSnapshotError('snapshot must be an object');
  }
  if (!isString(input.schemaName)) {
    throw new InvalidUserDataSnapshotError('snapshot.schemaName must be a string');
  }
  if (!isFiniteNumber(input.schemaVersion)) {
    throw new InvalidUserDataSnapshotError('snapshot.schemaVersion must be a number');
  }
  if (!isFiniteNumber(input.exportedAt)) {
    throw new InvalidUserDataSnapshotError('snapshot.exportedAt must be a number');
  }
  const notes = validateNotes(input.notes);
  const assets = validateAssets(input.assets);
  return {
    schemaName: input.schemaName,
    schemaVersion: input.schemaVersion,
    exportedAt: input.exportedAt,
    notes,
    assets,
  };
}

/**
 * Export the user-local notes + asset references from `user` into a
 * serializable {@link UserDataSnapshot}. `exportedAt` is stamped at call time.
 */
export async function exportUserData(user: UserStore): Promise<UserDataSnapshot> {
  const notes = await user.notes.list();
  const assets = await user.assets.list();
  return {
    schemaName: user.schema.name,
    schemaVersion: user.schema.version,
    exportedAt: Date.now(),
    notes,
    assets,
  };
}

/**
 * Import a {@link UserDataSnapshot} into `user`. Validates the snapshot first
 * (throwing {@link InvalidUserDataSnapshotError} on any structural problem and
 * writing nothing), then upserts each record by key. This is an idempotent
 * merge: it overwrites matching keys and adds new ones, but does NOT delete
 * local records absent from the snapshot (a replace-all is a documented future
 * option, not done here to avoid data loss).
 */
export async function importUserData(user: UserStore, snapshot: unknown): Promise<void> {
  const validated = validateSnapshot(snapshot);
  for (const record of validated.notes) {
    await user.notes.put(record.value.nodeId, record.value.body, record.value.updatedAt);
  }
  for (const asset of validated.assets) {
    await user.assets.put(asset);
  }
}
