/**
 * M6.2b — tests for the real IndexedDB `ObjectStoreBackend` driver.
 *
 * `fake-indexeddb` provides a spec-compliant, in-memory IndexedDB engine so the
 * driver is exercised against a real IDB implementation in the Node (vitest) env,
 * where the browser global `indexedDB` is absent. It is imported ONLY here (never
 * from src/*) and is a devDependency — it never reaches the shipped bundle.
 *
 * Each test uses a unique database name, so no cross-test cleanup is required.
 */

import { describe, expect, it } from 'vitest';
import { indexedDB } from 'fake-indexeddb';
import { createMemoryBackend, createPersistenceStore } from './keyValueStore.js';
import type { Migration } from './keyValueStore.js';
import { createIndexedDbRegistry } from './indexedDbRegistry.js';

interface Thing {
  readonly id: string;
  readonly value: number;
}

let counter = 0;
function uniqueDbName(prefix: string): string {
  counter += 1;
  return `${prefix}-${counter}`;
}

/** One migration registering a single `items` object store (mirrors notesStore). */
const migrations: readonly Migration[] = [
  {
    toVersion: 1,
    apply(registry) {
      if (!registry.hasStore('items')) {
        registry.registerStore<Thing>('items', createMemoryBackend<Thing>());
      }
    },
  },
];

function openStore(dbName: string) {
  const registry = createIndexedDbRegistry(dbName, { factory: indexedDB });
  const store = createPersistenceStore({ name: dbName, version: 1 }, migrations, {
    registry,
  });
  store.open();
  return store;
}

describe('createIndexedDbRegistry (IndexedDB driver)', () => {
  it('ACCEPTANCE: persists a record across separate store instances on the same database', async () => {
    const dbName = uniqueDbName('accept');
    const first = openStore(dbName);
    await first.store<Thing>('items').put('a', { id: 'a', value: 1 });
    first.close();

    // A brand-new store instance over the same database name + factory must read
    // the data written by the first instance (proves real persistence + that the
    // migration's createObjectStore did not re-run and wipe the store).
    const second = openStore(dbName);
    const back = await second.store<Thing>('items').get('a');
    expect(back).toEqual({ id: 'a', value: 1 });
    second.close();
  });

  it('creates the object store on open (registered name becomes a real IDB store)', async () => {
    const dbName = uniqueDbName('create');
    const store = openStore(dbName);
    // put/get round-trips only if the store was created during open (onupgradeneeded).
    await store.store<Thing>('items').put('k', { id: 'k', value: 7 });
    expect(await store.store<Thing>('items').get('k')).toEqual({ id: 'k', value: 7 });
    store.close();
  });

  it('returns undefined for a missing key', async () => {
    const dbName = uniqueDbName('missing');
    const store = openStore(dbName);
    expect(await store.store<Thing>('items').get('nope')).toBeUndefined();
    store.close();
  });

  it('overwrites an existing key', async () => {
    const dbName = uniqueDbName('overwrite');
    const store = openStore(dbName);
    const items = store.store<Thing>('items');
    await items.put('a', { id: 'a', value: 1 });
    await items.put('a', { id: 'a', value: 2 });
    expect(await items.get('a')).toEqual({ id: 'a', value: 2 });
    store.close();
  });

  it('deletes a key', async () => {
    const dbName = uniqueDbName('delete');
    const store = openStore(dbName);
    const items = store.store<Thing>('items');
    await items.put('a', { id: 'a', value: 1 });
    await items.delete('a');
    expect(await items.get('a')).toBeUndefined();
    store.close();
  });

  it('lists all records with their keys and values', async () => {
    const dbName = uniqueDbName('list');
    const store = openStore(dbName);
    const items = store.store<Thing>('items');
    await items.put('a', { id: 'a', value: 1 });
    await items.put('b', { id: 'b', value: 2 });
    await items.put('c', { id: 'c', value: 3 });

    const records = await items.list();
    expect(records).toHaveLength(3);
    expect(
      records
        .map((record) => record.key)
        .slice()
        .sort(),
    ).toEqual(['a', 'b', 'c']);
    expect(records.find((record) => record.key === 'b')?.value).toEqual({
      id: 'b',
      value: 2,
    });
    store.close();
  });

  it('clears every record in a store', async () => {
    const dbName = uniqueDbName('clear');
    const store = openStore(dbName);
    const items = store.store<Thing>('items');
    await items.put('a', { id: 'a', value: 1 });
    await items.put('b', { id: 'b', value: 2 });
    await items.clear();
    expect(await items.list()).toEqual([]);
    store.close();
  });

  it('hasStore reflects registrations; getStore returns a backend for known names and undefined otherwise', () => {
    const dbName = uniqueDbName('registry');
    const registry = createIndexedDbRegistry(dbName, { factory: indexedDB });
    expect(registry.hasStore('items')).toBe(false);
    expect(registry.getStore('items')).toBeUndefined();

    registry.registerStore('items', createMemoryBackend<Thing>());
    expect(registry.hasStore('items')).toBe(true);
    expect(registry.getStore('items')).toBeDefined();
    expect(registry.getStore('other')).toBeUndefined();
  });

  it('throws a clear error when no indexedDB is available and none is injected', () => {
    expect(() => createIndexedDbRegistry('no-factory')).toThrow(/indexedDB/);
  });
});
