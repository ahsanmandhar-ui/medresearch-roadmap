/**
 * M6.2a — pure, DOM-free notes + asset-reference store built on the M6.1
 * versioned key-value primitive (`createPersistenceStore` / `planMigrations`).
 *
 * This is USER-LOCAL data only (the visitor's own browser). It must never be
 * committed to the repo or written into content JSON files.
 *
 * It does NOT touch or duplicate the M2.6 progress notes in packages/core,
 * which persist a `Record<nodeId, string>` in localStorage under
 * `'research-roadmap-progress'`. Bridging/migrating between the two is a
 * documented future slice, not part of M6.2a.
 *
 * Asset records store METADATA AND REFERENCES ONLY (id, nodeId, filename, mime,
 * size, optional blobKey). Blob bytes are never stored or fabricated here.
 */

import { createMemoryBackend, createPersistenceStore } from './keyValueStore.js';
import type {
  DatabaseSchema,
  Migration,
  PersistenceStore,
  PersistenceStoreOptions,
  StoredRecord,
} from './keyValueStore.js';

const NOTES_OBJECT_STORE = 'notes';
const ASSETS_OBJECT_STORE = 'assets';

/** The versioned schema for user-local notes and asset references. */
export const userDataSchema: DatabaseSchema = {
  name: 'research-roadmap-user',
  version: 1,
};

/** A user note for a single roadmap node, keyed by node id. */
export interface Note {
  readonly nodeId: string;
  readonly body: string;
  readonly updatedAt: number;
}

/**
 * A reference to a local asset attached to a node. Metadata + reference only;
 * blob bytes live behind an external/blob store and are never fabricated here.
 */
export interface AssetRef {
  readonly id: string;
  readonly nodeId: string;
  readonly filename: string;
  readonly mime: string;
  readonly size: number;
  readonly blobKey?: string;
}

/**
 * Ordered migrations for the user-local store. Version 1 creates the `notes`
 * and `assets` object stores. Each registration is guarded by `hasStore`, so the
 * migration is idempotent: re-opening a fresh store instance over the same
 * (persistent) registry never re-registers a store and never wipes data. (The
 * M6.1 primitive resets its per-instance reached-version to 0, so `apply` is
 * re-invoked on every open — the guard is what makes the side effect run once.)
 */
export const userDataMigrations: readonly Migration[] = [
  {
    toVersion: 1,
    apply(registry) {
      if (!registry.hasStore(NOTES_OBJECT_STORE)) {
        registry.registerStore<Note>(NOTES_OBJECT_STORE, createMemoryBackend<Note>());
      }
      if (!registry.hasStore(ASSETS_OBJECT_STORE)) {
        registry.registerStore<AssetRef>(ASSETS_OBJECT_STORE, createMemoryBackend<AssetRef>());
      }
    },
  },
];

/** Notes facade: get / put / delete + list all. */
export interface NotesApi {
  get(nodeId: string): Promise<Note | undefined>;
  put(nodeId: string, body: string, updatedAt: number): Promise<void>;
  delete(nodeId: string): Promise<void>;
  list(): Promise<StoredRecord<Note>[]>;
}

/** Assets facade: get / put / delete + list references (all, or by node). */
export interface AssetsApi {
  get(id: string): Promise<AssetRef | undefined>;
  put(asset: AssetRef): Promise<void>;
  delete(id: string): Promise<void>;
  list(): Promise<AssetRef[]>;
  listByNode(nodeId: string): Promise<AssetRef[]>;
}

/** The opened user-local store: schema handle + the two facades. */
export interface UserStore {
  readonly schema: DatabaseSchema;
  readonly store: PersistenceStore;
  readonly notes: NotesApi;
  readonly assets: AssetsApi;
}

/**
 * Open the user-local notes/assets store over the M6.1 primitive, applying
 * migrations exactly once. Pass a persistent `registry` (e.g. a future IndexedDB
 * driver's registry) to keep data across store instances; omit it for an
 * ephemeral in-memory store (used by tests and Node callers).
 */
export function createUserStore(options: PersistenceStoreOptions = {}): UserStore {
  const store = createPersistenceStore(userDataSchema, userDataMigrations, options);
  store.open();

  const notesStore = store.store<Note>(NOTES_OBJECT_STORE);
  const assetsStore = store.store<AssetRef>(ASSETS_OBJECT_STORE);

  const notes: NotesApi = {
    async get(nodeId) {
      return notesStore.get(nodeId);
    },
    async put(nodeId, body, updatedAt) {
      await notesStore.put(nodeId, { nodeId, body, updatedAt });
    },
    async delete(nodeId) {
      await notesStore.delete(nodeId);
    },
    async list() {
      return notesStore.list();
    },
  };

  const assets: AssetsApi = {
    async get(id) {
      return assetsStore.get(id);
    },
    async put(asset) {
      await assetsStore.put(asset.id, asset);
    },
    async delete(id) {
      await assetsStore.delete(id);
    },
    async list() {
      const all = await assetsStore.list();
      return all.map((record) => record.value);
    },
    async listByNode(nodeId) {
      const all = await assetsStore.list();
      return all
        .filter((record) => record.value.nodeId === nodeId)
        .map((record) => record.value);
    },
  };

  return { schema: userDataSchema, store, notes, assets };
}
