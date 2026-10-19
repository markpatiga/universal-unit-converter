// Smoke test: proves the test runner works before the real engine exists.
// Delete this file in Phase 1 once convert.test.js is in place.
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('test runner is wired up', () => {
  assert.equal(1 + 1, 2);
});
