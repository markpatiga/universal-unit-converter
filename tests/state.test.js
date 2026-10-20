// App state: derived results and actions. No browser needed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, createStore, deriveResult } from '../js/state.js';

test('starts on Length, km → mi, with 1 typed so a result shows immediately', () => {
  const state = createInitialState();
  assert.deepEqual(state, { categoryId: 'length', fromId: 'kilometer', toId: 'mile', rawInput: '1' });
  assert.equal(deriveResult(state).display, '0.6213711922');
});

test('deriveResult passes empty, incomplete and invalid states through', () => {
  const base = createInitialState();
  assert.deepEqual(deriveResult({ ...base, rawInput: '' }), { status: 'empty' });
  assert.deepEqual(deriveResult({ ...base, rawInput: '-' }), { status: 'incomplete' });
  assert.equal(deriveResult({ ...base, rawInput: 'abc' }).status, 'invalid');
});

test('deriveResult reports a result too large to show', () => {
  // 1e300 PiB is a valid input, but in bits it is beyond JavaScript's range.
  const state = { categoryId: 'data', fromId: 'pebibyte', toId: 'bit', rawInput: '1e300' };
  const result = deriveResult(state);
  assert.equal(result.status, 'invalid');
  assert.match(result.message, /too large/);
});

test('selectCategory resets units to defaults and keeps the typed value', () => {
  const store = createStore();
  store.actions.setInput('25');
  store.actions.selectCategory('temperature');
  assert.deepEqual(store.getState(), {
    categoryId: 'temperature', fromId: 'celsius', toId: 'fahrenheit', rawInput: '25',
  });
  assert.equal(deriveResult(store.getState()).display, '77');
});

test('setFrom and setTo ignore units from another category', () => {
  const store = createStore();
  store.actions.setFrom('kilogram');
  store.actions.setTo('celsius');
  assert.equal(store.getState().fromId, 'kilometer');
  assert.equal(store.getState().toId, 'mile');
});

test('selectCategory ignores unknown categories', () => {
  const store = createStore();
  store.actions.selectCategory('currency');
  assert.equal(store.getState().categoryId, 'length');
});

test('subscribers are called with the new state on every change', () => {
  const store = createStore();
  const seen = [];
  const unsubscribe = store.subscribe((state) => seen.push(state.rawInput));
  store.actions.setInput('2');
  store.actions.setInput('20');
  unsubscribe();
  store.actions.setInput('200');
  assert.deepEqual(seen, ['2', '20']);
});

test('a temperature below absolute zero shows an error, not a result', () => {
  const state = { categoryId: 'temperature', fromId: 'kelvin', toId: 'celsius', rawInput: '-5' };
  assert.match(deriveResult(state).message, /absolute zero/);
});
