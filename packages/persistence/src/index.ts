/**
 * M6.1 — versioned key-value persistence primitive.
 *
 * A pure, DOM-free, dependency-free IndexedDB-style abstraction. Storage I/O is
 * injected via {@link ObjectStoreBackend}, so versioning, the store registry and
 * migration planning are fully testable in Node without a browser.
 */

export {
  planMigrations,
  createMemoryBackend,
  createMemoryRegistry,
  createPersistenceStore,
} from './keyValueStore.js';

export {
  createUserStore,
  userDataSchema,
  userDataMigrations,
} from './notesStore.js';

export type {
  StoredRecord,
  ObjectStoreBackend,
  StoreRegistry,
  Migration,
  DatabaseSchema,
  ObjectStore,
  PersistenceStore,
  PersistenceStoreOptions,
} from './keyValueStore.js';

export type {
  Note,
  AssetRef,
  NotesApi,
  AssetsApi,
  UserStore,
} from './notesStore.js';
