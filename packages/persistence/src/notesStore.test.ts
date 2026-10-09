import { describe, it, expect } from 'vitest';
import { createMemoryRegistry, planMigrations } from './keyValueStore.js';
import type { ObjectStoreBackend, StoreRegistry } from './keyValueStore.js';
import {
  createUserStore,
  userDataMigrations,
  userDataSchema,
  type AssetRef,
} from './notesStore.js';

/** A registry that counts `registerStore` calls, wrapping a memory registry. */
function createCountingRegistry() {
  const inner = createMemoryRegistry();
  let registrations = 0;
  const registry: StoreRegistry = {
    hasStore(name) {
      return inner.hasStore(name);
    },
    registerStore<V>(name: string, backend: ObjectStoreBackend<V>) {
      registrations += 1;
      inner.registerStore(name, backend);
    },
    getStore<V>(name: string) {
      return inner.getStore<V>(name);
    },
  };
  return { registry, count: () => registrations };
}

describe('M6.2a schema', () => {
  it('declares version 1 under the research-roadmap-user schema', () => {
    expect(userDataSchema).toEqual({ name: 'research-roadmap-user', version: 1 });
  });

  it('has a single migration to version 1, already satisfied at version 1', () => {
    expect(planMigrations(1, 1, userDataMigrations)).toEqual([]);
    expect(planMigrations(0, 1, userDataMigrations).map((m) => m.toVersion)).toEqual([1]);
  });

  it('registers exactly the notes and assets object stores', () => {
    const store = createUserStore();
    expect(store.store.hasStore('notes')).toBe(true);
    expect(store.store.hasStore('assets')).toBe(true);
    expect(store.store.hasStore('other')).toBe(false);
  });
});

describe('M6.2a acceptance', () => {
  it('put a note, reopen the store over the same registry, read it back — migration ran exactly once', async () => {
    const { registry, count } = createCountingRegistry();

    const first = createUserStore({ registry });
    await first.notes.put('node-a', 'first body', 1_000);
    // notes + assets object stores created once
    expect(count()).toBe(2);

    // Reopen: a brand-new store instance bound to the same (persistent) registry.
    const reopened = createUserStore({ registry });
    // The migration is guarded, so re-opening does not re-register any store.
    expect(count()).toBe(2);

    const note = await reopened.notes.get('node-a');
    expect(note).toEqual({ nodeId: 'node-a', body: 'first body', updatedAt: 1_000 });
  });
});

describe('notes facade', () => {
  it('returns undefined for a missing key', async () => {
    const store = createUserStore();
    expect(await store.notes.get('missing')).toBeUndefined();
  });

  it('overwrites an existing note (last write wins, updatedAt updates)', async () => {
    const store = createUserStore();
    await store.notes.put('n', 'v1', 1);
    await store.notes.put('n', 'v2', 2);
    expect(await store.notes.get('n')).toEqual({ nodeId: 'n', body: 'v2', updatedAt: 2 });
  });

  it('deletes a note', async () => {
    const store = createUserStore();
    await store.notes.put('n', 'v', 1);
    await store.notes.delete('n');
    expect(await store.notes.get('n')).toBeUndefined();
  });

  it('lists all notes', async () => {
    const store = createUserStore();
    await store.notes.put('a', 'A', 1);
    await store.notes.put('b', 'B', 2);
    const all = await store.notes.list();
    expect(all.map((r) => r.key).sort()).toEqual(['a', 'b']);
  });
});

describe('assets facade', () => {
  it('adds and removes references, listing by node', async () => {
    const store = createUserStore();
    const a1: AssetRef = {
      id: 'x1',
      nodeId: 'node-a',
      filename: 'paper.pdf',
      mime: 'application/pdf',
      size: 100,
    };
    const a2: AssetRef = {
      id: 'x2',
      nodeId: 'node-a',
      filename: 'notes.txt',
      mime: 'text/plain',
      size: 10,
      blobKey: 'blob:x2',
    };
    const b1: AssetRef = {
      id: 'y1',
      nodeId: 'node-b',
      filename: 'img.png',
      mime: 'image/png',
      size: 5,
    };

    await store.assets.put(a1);
    await store.assets.put(a2);
    await store.assets.put(b1);

    const forA = await store.assets.listByNode('node-a');
    expect(forA.map((a) => a.id).sort()).toEqual(['x1', 'x2']);

    await store.assets.delete('x1');
    const forAAfter = await store.assets.listByNode('node-a');
    expect(forAAfter.map((a) => a.id)).toEqual(['x2']);
    // optional blobKey is preserved on the remaining reference
    expect(forAAfter[0]).toEqual(a2);
  });

  it('returns undefined for a missing asset and empty list for a node with none', async () => {
    const store = createUserStore();
    expect(await store.assets.get('nope')).toBeUndefined();
    expect(await store.assets.listByNode('node-z')).toEqual([]);
  });
});

describe('idempotent open', () => {
  it('re-opening applies no further migration and keeps data', async () => {
    const { registry, count } = createCountingRegistry();
    const store = createUserStore({ registry });
    expect(store.store.isOpen).toBe(true);
    await store.notes.put('n', 'v', 1);
    expect(count()).toBe(2);

    store.store.open(); // idempotent re-open
    expect(store.store.isOpen).toBe(true);
    expect(count()).toBe(2);
    expect(await store.notes.get('n')).toEqual({ nodeId: 'n', body: 'v', updatedAt: 1 });
  });
});
