/**
 * M6.1 — versioned key-value persistence primitive.
 *
 * A pure, DOM-free, dependency-free IndexedDB-style abstraction. Storage I/O is
 * provided by an injected {@link ObjectStoreBackend}, so the versioning, store
 * registry and migration logic are fully testable in Node without a browser.
 * Wiring a real IndexedDB driver is a later M6 slice.
 */

/** A single stored key/value pair. */
export interface StoredRecord<V> {
  key: string;
  value: V;
}

/**
 * The minimal storage contract the persistence layer needs. A real IndexedDB
 * driver, a file driver, or an in-memory test fake can all satisfy this.
 */
export interface ObjectStoreBackend<V> {
  read(key: string): Promise<V | undefined>;
  write(key: string, value: V): Promise<void>;
  remove(key: string): Promise<void>;
  readAll(): Promise<StoredRecord<V>[]>;
  clear(): Promise<void>;
}

/** Holds the named object stores created by migrations. */
export interface StoreRegistry {
  hasStore(name: string): boolean;
  registerStore<V>(name: string, backend: ObjectStoreBackend<V>): void;
  getStore<V>(name: string): ObjectStoreBackend<V> | undefined;
}

/** A single versioned schema change. */
export interface Migration {
  readonly toVersion: number;
  apply(registry: StoreRegistry): void;
}

/** The database schema: a stable name and the target version. */
export interface DatabaseSchema {
  readonly name: string;
  readonly version: number;
}

/** Public per-store facade returned by {@link PersistenceStore.store}. */
export interface ObjectStore<V> {
  get(key: string): Promise<V | undefined>;
  put(key: string, value: V): Promise<void>;
  delete(key: string): Promise<void>;
  list(): Promise<StoredRecord<V>[]>;
  clear(): Promise<void>;
}

/** A versioned persistence store bound to a {@link DatabaseSchema}. */
export interface PersistenceStore {
  readonly name: string;
  readonly version: number;
  readonly isOpen: boolean;
  open(): void;
  close(): void;
  hasStore(name: string): boolean;
  store<V>(name: string): ObjectStore<V>;
}

/**
 * Plan the ordered list of migrations needed to go from `current` to `target`.
 *
 * Throws on: a gap in versions, a duplicate `toVersion`, a descending
 * migration, or a target that is unreachable (past the last migration).
 * Already-applied migrations (toVersion <= current) are skipped.
 */
export function planMigrations(
  current: number,
  target: number,
  migrations: readonly Migration[],
): Migration[] {
  if (!Number.isInteger(current) || current < 0) {
    throw new Error(`current version must be a non-negative integer, got ${current}`);
  }
  if (!Number.isInteger(target) || target < 0) {
    throw new Error(`target version must be a non-negative integer, got ${target}`);
  }

  const sorted = [...migrations].sort((a, b) => a.toVersion - b.toVersion);

  const seen = new Set<number>();
  for (const migration of sorted) {
    if (seen.has(migration.toVersion)) {
      throw new Error(`duplicate migration toVersion ${migration.toVersion}`);
    }
    seen.add(migration.toVersion);
  }

  const pending = sorted.filter((m) => m.toVersion > current);

  // Versions must advance by exactly one from `current` to `target`.
  let expected = current;
  for (const migration of pending) {
    if (migration.toVersion !== expected + 1) {
      if (migration.toVersion <= expected) {
        throw new Error(`descending migration toVersion ${migration.toVersion}`);
      }
      throw new Error(
        `migration gap: expected toVersion ${expected + 1}, got ${migration.toVersion}`,
      );
    }
    expected = migration.toVersion;
  }

  if (expected !== target) {
    throw new Error(
      `target version ${target} is unreachable; highest reachable is ${expected}`,
    );
  }

  return pending;
}

/**
 * An in-memory {@link ObjectStoreBackend} backed by a `Map`. This is the fake
 * driver used in tests and the default when a migration registers a store
 * without providing its own backend.
 */
export function createMemoryBackend<V>(): ObjectStoreBackend<V> {
  const data = new Map<string, V>();
  return {
    async read(key) {
      return data.get(key);
    },
    async write(key, value) {
      data.set(key, value);
    },
    async remove(key) {
      data.delete(key);
    },
    async readAll() {
      const records: StoredRecord<V>[] = [];
      for (const [key, value] of data) {
        records.push({ key, value });
      }
      return records;
    },
    async clear() {
      data.clear();
    },
  };
}

/** Create an in-memory {@link StoreRegistry}. */
export function createMemoryRegistry(): StoreRegistry {
  const stores = new Map<string, ObjectStoreBackend<unknown>>();
  return {
    hasStore(name) {
      return stores.has(name);
    },
    registerStore<V>(name: string, backend: ObjectStoreBackend<V>) {
      stores.set(name, backend as ObjectStoreBackend<unknown>);
    },
    getStore<V>(name: string) {
      return stores.get(name) as ObjectStoreBackend<V> | undefined;
    },
  };
}

/** Options for {@link createPersistenceStore}. */
export interface PersistenceStoreOptions {
  /**
   * A pre-existing registry to bind to. Defaults to a fresh in-memory registry.
   * Supplying one lets a caller persist the registry across store instances
   * (the real IndexedDB driver will provide this in a later slice).
   */
  registry?: StoreRegistry;
}

/**
 * Create a {@link PersistenceStore} for `schema`, applying `migrations` on
 * `open()`. Only migrations whose `toVersion` is beyond the version already
 * reached run, so re-opening a store never re-applies an applied migration. The
 * version only ever advances toward `schema.version`.
 */
export function createPersistenceStore(
  schema: DatabaseSchema,
  migrations: readonly Migration[],
  options: PersistenceStoreOptions = {},
): PersistenceStore {
  const registry = options.registry ?? createMemoryRegistry();
  let open = false;
  let reachedVersion = 0;

  return {
    name: schema.name,
    version: schema.version,
    get isOpen() {
      return open;
    },
    open() {
      // Idempotent: pending migrations only (toVersion > reachedVersion), so a
      // second open after reaching the target runs nothing.
      const pending = planMigrations(reachedVersion, schema.version, migrations);
      for (const migration of pending) {
        migration.apply(registry);
        reachedVersion = migration.toVersion;
      }
      open = true;
    },
    close() {
      open = false;
    },
    hasStore(name: string) {
      return registry.hasStore(name);
    },
    store<V>(name: string): ObjectStore<V> {
      if (!open) {
        throw new Error(`store "${schema.name}" is not open`);
      }
      const backend = registry.getStore<V>(name);
      if (backend === undefined) {
        throw new Error(`object store "${name}" is not registered`);
      }
      return {
        async get(key: string) {
          return backend.read(key);
        },
        async put(key: string, value: V) {
          return backend.write(key, value);
        },
        async delete(key: string) {
          return backend.remove(key);
        },
        async list() {
          return backend.readAll();
        },
        async clear() {
          return backend.clear();
        },
      };
    },
  };
}
