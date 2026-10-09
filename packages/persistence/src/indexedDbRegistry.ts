/**
 * M6.2b — real browser IndexedDB `ObjectStoreBackend` driver.
 *
 * Implements the M6.1 {@link StoreRegistry} contract so that
 * `createPersistenceStore` persists data in the browser via IndexedDB instead of
 * the in-memory driver. This is the ONLY file in packages/persistence allowed to
 * touch IndexedDB — the pure core (keyValueStore.ts, notesStore.ts) stays DOM-free.
 *
 * Sync/async bridge: `createPersistenceStore().open()` and `Migration.apply()` are
 * synchronous, while IndexedDB's open/createObjectStore are asynchronous. This
 * registry records the needed object-store names SYNCHRONOUSLY in `registerStore`
 * (during the synchronous migration pass) and opens the database connection LAZILY
 * on the first async operation. By the time any operation runs, every migration has
 * completed, so all needed store names are known and are created together inside
 * `onupgradeneeded`.
 *
 * The in-memory backend a migration passes to `registerStore` is intentionally
 * IGNORED — real storage is always IndexedDB.
 */

import type {
  ObjectStoreBackend,
  StoreRegistry,
  StoredRecord,
} from './keyValueStore.js';

export interface IndexedDbRegistryOptions {
  /** Schema version to open the database at. Defaults to 1. */
  readonly version?: number;
  /**
   * The `IDBFactory` to use. Defaults to the browser global `indexedDB`. In Node
   * tests, inject a fake factory (e.g. `{ indexedDB }` from `fake-indexeddb`).
   */
  readonly factory?: IDBFactory;
}

function getGlobalIndexedDb(): IDBFactory {
  const candidate = (globalThis as { indexedDB?: IDBFactory }).indexedDB;
  if (!candidate) {
    throw new Error(
      'No global indexedDB available. Run in a browser, or inject a factory via ' +
        'createIndexedDbRegistry(name, { factory }) — e.g. fake-indexeddb in Node tests.',
    );
  }
  return candidate;
}

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function transactionToPromise(transaction: IDBTransaction): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () =>
      reject(transaction.error ?? new Error('IndexedDB transaction aborted'));
    transaction.onerror = () =>
      reject(transaction.error ?? new Error('IndexedDB transaction error'));
  });
}

export function createIndexedDbRegistry(
  dbName: string,
  options: IndexedDbRegistryOptions = {},
): StoreRegistry {
  const version = options.version ?? 1;
  const factory = options.factory ?? getGlobalIndexedDb();
  const neededStores = new Set<string>();
  let connection: Promise<IDBDatabase> | null = null;

  function ensureConnection(): Promise<IDBDatabase> {
    if (!connection) {
      connection = new Promise<IDBDatabase>((resolve, reject) => {
        const request = factory.open(dbName, version);
        request.onupgradeneeded = () => {
          const db = request.result;
          for (const name of neededStores) {
            if (!db.objectStoreNames.contains(name)) {
              db.createObjectStore(name);
            }
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        request.onblocked = () =>
          reject(new Error(`IndexedDB open of "${dbName}" was blocked`));
      });
    }
    return connection;
  }

  function makeBackend<V>(storeName: string): ObjectStoreBackend<V> {
    return {
      async read(key) {
        const db = await ensureConnection();
        const transaction = db.transaction(storeName, 'readonly');
        const value = await requestToPromise<V | undefined>(
          transaction.objectStore(storeName).get(key) as IDBRequest<V | undefined>,
        );
        return value;
      },
      async write(key, value) {
        const db = await ensureConnection();
        const transaction = db.transaction(storeName, 'readwrite');
        transaction.objectStore(storeName).put(value, key);
        await transactionToPromise(transaction);
      },
      async remove(key) {
        const db = await ensureConnection();
        const transaction = db.transaction(storeName, 'readwrite');
        transaction.objectStore(storeName).delete(key);
        await transactionToPromise(transaction);
      },
      async readAll() {
        const db = await ensureConnection();
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const records: StoredRecord<V>[] = [];
        await new Promise<void>((resolve, reject) => {
          const cursorRequest = store.openCursor();
          cursorRequest.onsuccess = () => {
            const cursor = cursorRequest.result;
            if (cursor) {
              records.push({ key: String(cursor.key), value: cursor.value as V });
              cursor.continue();
            } else {
              resolve();
            }
          };
          cursorRequest.onerror = () => reject(cursorRequest.error);
        });
        return records;
      },
      async clear() {
        const db = await ensureConnection();
        const transaction = db.transaction(storeName, 'readwrite');
        transaction.objectStore(storeName).clear();
        await transactionToPromise(transaction);
      },
    };
  }

  const registry: StoreRegistry = {
    registerStore(name, _backend) {
      // The passed in-memory backend is intentionally ignored: real storage is IDB.
      neededStores.add(name);
    },
    hasStore(name) {
      return neededStores.has(name);
    },
    getStore(name) {
      if (!neededStores.has(name)) {
        return undefined;
      }
      return makeBackend(name);
    },
  };

  return registry;
}
