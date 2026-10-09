import { describe, it, expect } from 'vitest';
import {
  planMigrations,
  createMemoryBackend,
  createMemoryRegistry,
  createPersistenceStore,
} from './keyValueStore.js';
import type { Migration, StoreRegistry } from './keyValueStore.js';

describe('planMigrations', () => {
  const migration = (toVersion: number): Migration => ({
    toVersion,
    apply: () => undefined,
  });

  it('ACCEPTANCE: returns only pending migrations in ascending version order', () => {
    const migrations = [migration(1), migration(2), migration(3)];
    const plan = planMigrations(1, 3, migrations);
    expect(plan.map((m) => m.toVersion)).toEqual([2, 3]);
  });

  it('returns an empty plan when already at the target version', () => {
    expect(planMigrations(3, 3, [migration(1), migration(2), migration(3)])).toEqual([]);
  });

  it('sorts an unordered migration list before planning', () => {
    const plan = planMigrations(0, 2, [migration(2), migration(1)]);
    expect(plan.map((m) => m.toVersion)).toEqual([1, 2]);
  });

  it('throws on a gap between the current version and the next migration', () => {
    expect(() => planMigrations(0, 3, [migration(1), migration(3)])).toThrow(/gap/);
  });

  it('throws on a duplicate toVersion', () => {
    expect(() => planMigrations(0, 2, [migration(1), migration(1)])).toThrow(/duplicate/);
  });

  it('throws when the target version is unreachable', () => {
    expect(() => planMigrations(0, 5, [migration(1), migration(2)])).toThrow(/unreachable/);
  });

  it('throws on a non-integer or negative version', () => {
    expect(() => planMigrations(-1, 2, [migration(1), migration(2)])).toThrow(
      /non-negative integer/,
    );
  });
});

describe('createMemoryBackend', () => {
  it('reads, writes, removes, lists and clears records', async () => {
    const backend = createMemoryBackend<number>();
    await backend.write('a', 1);
    await backend.write('b', 2);
    expect(await backend.read('a')).toBe(1);
    expect(await backend.read('missing')).toBeUndefined();
    expect(await backend.readAll()).toEqual([
      { key: 'a', value: 1 },
      { key: 'b', value: 2 },
    ]);
    await backend.remove('a');
    expect(await backend.read('a')).toBeUndefined();
    await backend.clear();
    expect(await backend.readAll()).toEqual([]);
  });
});

describe('createPersistenceStore', () => {
  const schema = { name: 'test-db', version: 3 };

  const migrationsFor = (
    registry: StoreRegistry,
    log: string[],
  ): Migration[] => [
    {
      toVersion: 1,
      apply: (r) => {
        r.registerStore('v1', createMemoryBackend<string>());
        log.push('v1');
        void registry;
      },
    },
    {
      toVersion: 2,
      apply: (r) => {
        if (r.hasStore('v1')) log.push('v2');
      },
    },
    {
      toVersion: 3,
      apply: (r) => {
        if (r.hasStore('v1')) log.push('v3');
      },
    },
  ];

  it('ACCEPTANCE: applies migrations in order and exposes an open store facade', async () => {
    const log: string[] = [];
    const store = createPersistenceStore(schema, migrationsFor(createMemoryRegistry(), log));
    expect(store.isOpen).toBe(false);

    store.open();
    expect(store.isOpen).toBe(true);
    expect(log).toEqual(['v1', 'v2', 'v3']);
    expect(store.hasStore('v1')).toBe(true);

    const v1 = store.store<string>('v1');
    await v1.put('key', 'value');
    expect(await v1.get('key')).toBe('value');
    expect(await v1.list()).toEqual([{ key: 'key', value: 'value' }]);

    await v1.delete('key');
    expect(await v1.get('key')).toBeUndefined();
  });

  it('does not re-apply already-applied migrations on a second open', () => {
    const log: string[] = [];
    const store = createPersistenceStore(schema, migrationsFor(createMemoryRegistry(), log));
    store.open();
    store.close();
    store.open();
    expect(log).toEqual(['v1', 'v2', 'v3']);
  });

  it('throws when accessing a store before the database is open', () => {
    const store = createPersistenceStore(schema, migrationsFor(createMemoryRegistry(), []));
    expect(() => store.store('v1')).toThrow(/not open/);
  });

  it('throws when accessing an unregistered store', () => {
    const store = createPersistenceStore(schema, migrationsFor(createMemoryRegistry(), []));
    store.open();
    expect(() => store.store('missing')).toThrow(/not registered/);
  });
});
