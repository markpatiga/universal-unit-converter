// Theme rules: which theme shows, and what the toggle saves.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveTheme, preferenceAfterToggle } from '../js/services/theme.js';

test('with no saved choice, follow the system', () => {
  assert.equal(resolveTheme(null, false), 'light');
  assert.equal(resolveTheme(null, true), 'dark');
});

test('a saved choice overrides the system', () => {
  assert.equal(resolveTheme('dark', false), 'dark');
  assert.equal(resolveTheme('light', true), 'light');
});

test('anything else saved (old or corrupted data) is ignored', () => {
  for (const saved of ['blue', '', 42, undefined, { theme: 'dark' }]) {
    assert.equal(resolveTheme(saved, true), 'dark', JSON.stringify(saved));
  }
});

test('toggling away from the system saves an explicit choice', () => {
  assert.equal(preferenceAfterToggle('light', false), 'dark'); // system light → choose dark
  assert.equal(preferenceAfterToggle('dark', true), 'light');  // system dark → choose light
});

test('toggling back to the system removes the choice (follow system again)', () => {
  assert.equal(preferenceAfterToggle('dark', false), null);
  assert.equal(preferenceAfterToggle('light', true), null);
});

test('two toggles always return to following the system', () => {
  for (const systemDark of [false, true]) {
    const start = resolveTheme(null, systemDark);
    const first = preferenceAfterToggle(start, systemDark);
    const second = preferenceAfterToggle(resolveTheme(first, systemDark), systemDark);
    assert.equal(second, null);
    assert.equal(resolveTheme(second, systemDark), start);
  }
});
