import { describe, it, expect } from 'vitest';
import { createUserStore } from './notesStore.js';
import type { AssetRef } from './notesStore.js';
import { exportUserData, importUserData, InvalidUserDataSnapshotError } from './backup.js';

describe('M6.3 backup/restore', () => {
  it('ACCEPTANCE: round-trips notes + asset references into a fresh store', async () => {
    const a = createUserStore();
    await a.notes.put('n1', 'hello', 1000);
    await a.notes.put('n2', 'world', 2000);
    await a.assets.put({ id: 'a1', nodeId: 'n1', filename: 'x.pdf', mime: 'application/pdf', size: 10 });
    await a.assets.put({
      id: 'a2',
      nodeId: 'n2',
      filename: 'y.png',
      mime: 'image/png',
      size: 20,
      blobKey: 'blob-y',
    });

    const snap = await exportUserData(a);
    expect(snap.schemaName).toBe('research-roadmap-user');
    expect(snap.schemaVersion).toBe(1);

    const b = createUserStore();
    await importUserData(b, snap);
    const snap2 = await exportUserData(b);

    expect(snap2.notes).toEqual(snap.notes);
    expect(snap2.assets).toEqual(snap.assets);
    expect(snap2.schemaName).toBe(snap.schemaName);
    expect(snap2.schemaVersion).toBe(snap.schemaVersion);
  });

  it('preserves an asset optional blobKey, and omits it when absent', async () => {
    const a = createUserStore();
    await a.assets.put({ id: 'a1', nodeId: 'n1', filename: 'x.pdf', mime: 'application/pdf', size: 10 });
    await a.assets.put({
      id: 'a2',
      nodeId: 'n1',
      filename: 'y.png',
      mime: 'image/png',
      size: 20,
      blobKey: 'blob-y',
    });
    const snap = await exportUserData(a);

    const b = createUserStore();
    await importUserData(b, snap);

    const withKey = await b.assets.get('a2');
    expect(withKey?.blobKey).toBe('blob-y');
    const withoutKey = await b.assets.get('a1');
    expect(withoutKey).toBeDefined();
    expect('blobKey' in (withoutKey as AssetRef)).toBe(false);
  });

  it('exports an empty store as empty arrays plus schema identity', async () => {
    const a = createUserStore();
    const snap = await exportUserData(a);
    expect(snap.notes).toEqual([]);
    expect(snap.assets).toEqual([]);
    expect(snap.schemaName).toBe('research-roadmap-user');
    expect(snap.schemaVersion).toBe(1);
    expect(typeof snap.exportedAt).toBe('number');
  });

  it('import overwrites a matching note key', async () => {
    const a = createUserStore();
    await a.notes.put('n1', 'old', 1000);
    const snap = await exportUserData(a);

    const b = createUserStore();
    await b.notes.put('n1', 'newer-local', 500);
    await importUserData(b, snap);
    const after = await b.notes.get('n1');
    expect(after?.body).toBe('old');
    expect(after?.updatedAt).toBe(1000);
  });

  it('import merges new keys without deleting existing local records', async () => {
    const a = createUserStore();
    await a.notes.put('n1', 'from-snapshot', 1000);
    const snap = await exportUserData(a);

    const b = createUserStore();
    await b.notes.put('n2', 'local-only', 500);
    await importUserData(b, snap);

    expect((await b.notes.get('n1'))?.body).toBe('from-snapshot');
    expect((await b.notes.get('n2'))?.body).toBe('local-only');
  });

  it('rejects a malformed snapshot with InvalidUserDataSnapshotError and writes nothing', async () => {
    const b = createUserStore();
    await b.notes.put('keep', 'untouched', 1000);

    const bad: unknown[] = [
      null,
      42,
      'nope',
      {},
      { schemaName: 'x', schemaVersion: 1, exportedAt: 1 }, // missing notes/assets
      { schemaName: 'x', schemaVersion: 1, exportedAt: 1, notes: {}, assets: [] }, // notes not array
      { schemaName: 'x', schemaVersion: 1, exportedAt: 1, notes: [], assets: 'no' }, // assets not array
      {
        schemaName: 'x',
        schemaVersion: 1,
        exportedAt: 1,
        notes: [{ key: 'n1', value: { nodeId: 'n1', body: 5, updatedAt: 1 } }], // body not string
        assets: [],
      },
      {
        schemaName: 'x',
        schemaVersion: 1,
        exportedAt: 1,
        notes: [],
        assets: [{ id: 'a1', nodeId: 'n1', filename: 'x', mime: 'm', size: 'big' }], // size not number
      },
    ];

    for (const input of bad) {
      await expect(importUserData(b, input)).rejects.toBeInstanceOf(InvalidUserDataSnapshotError);
    }

    // Nothing was written from the malformed snapshots; the original note is
    // intact and no partial asset snuck in.
    expect((await b.notes.get('keep'))?.body).toBe('untouched');
    expect((await b.notes.get('n1'))).toBeUndefined();
    expect((await b.assets.list()).length).toBe(0);
  });
});
