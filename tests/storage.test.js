// Storage wrapper: works normally, and fails safely in every way localStorage can fail.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStorage } from '../js/services/storage.js';

// A fake localStorage backed by a Map.
function fakeBackend(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    data,
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => { data.set(k, String(v)); },
    removeItem: (k) => { data.delete(k); },
  };
}

test('saves and reads back JSON', () => {
  const backend = fakeBackend();
  const storage = createStorage(() => backend);
  assert.equal(storage.available, true);
  assert.equal(storage.write('k', [{ a: 1 }]), true);
  assert.deepEqual(storage.read('k', []), [{ a: 1 }]);
  assert.equal(backend.data.has('uuc:probe'), false, 'probe key cleaned up');
});

test('returns the fallback for a missing key', () => {
  const storage = createStorage(() => fakeBackend());
  assert.deepEqual(storage.read('missing', []), []);
});

test('returns the fallback for corrupted JSON', () => {
  const storage = createStorage(() => fakeBackend({ k: '{not json' }));
  assert.deepEqual(storage.read('k', []), []);
});

test('unavailable when localStorage itself throws (blocked site data)', () => {
  const storage = createStorage(() => { throw new Error('SecurityError'); });
  assert.equal(storage.available, false);
  assert.deepEqual(storage.read('k', ['fallback']), ['fallback']);
  assert.equal(storage.write('k', 1), false);
});

test('unavailable when localStorage is missing entirely', () => {
  const storage = createStorage(() => undefined);
  assert.equal(storage.available, false);
});

test('unavailable when every write throws (some private-browsing modes)', () => {
  const backend = { ...fakeBackend(), setItem() { throw new Error('QuotaExceededError'); } };
  const storage = createStorage(() => backend);
  assert.equal(storage.available, false);
});

test('a write that fails later (storage full) returns false instead of throwing', () => {
  const backend = fakeBackend();
  const storage = createStorage(() => backend);
  backend.setItem = () => { throw new Error('QuotaExceededError'); };
  assert.equal(storage.write('k', [1, 2, 3]), false);
});
