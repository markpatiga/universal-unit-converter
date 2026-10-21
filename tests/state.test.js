// App state: derived results and actions. No browser needed.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInitialState, createStore, deriveResult } from '../js/state.js';

test('starts on Length, km → mi, with 1 typed so a result shows immediately', () => {
  const state = createInitialState();
  assert.deepEqual(state, { categoryId: 'length', fromId: 'kilometer', toId: 'mile', rawInput: '1', history: [] });
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
    categoryId: 'temperature', fromId: 'celsius', toId: 'fahrenheit', rawInput: '25', history: [],
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

test('swapUnits swaps from and to, and keeps the typed value', () => {
  const store = createStore();
  store.actions.setInput('5');
  store.actions.swapUnits();
  const state = store.getState();
  assert.equal(state.fromId, 'mile');
  assert.equal(state.toId, 'kilometer');
  assert.equal(state.rawInput, '5');
  assert.equal(deriveResult(state).display, '8.04672');
});

test('swapping can make a value invalid, and the error shows', () => {
  // -400 °F is valid (above absolute zero); -400 °C is not.
  const store = createStore({ categoryId: 'temperature', fromId: 'fahrenheit', toId: 'celsius', rawInput: '-400', history: [] });
  assert.equal(deriveResult(store.getState()).status, 'valid');
  store.actions.swapUnits();
  assert.match(deriveResult(store.getState()).message, /absolute zero/);
});

test('clear empties the input but keeps category and units', () => {
  const store = createStore();
  store.actions.selectCategory('speed');
  store.actions.setInput('120');
  store.actions.clear();
  assert.deepEqual(store.getState(), {
    categoryId: 'speed', fromId: 'kilometerPerHour', toId: 'milePerHour', rawInput: '', history: [],
  });
  assert.deepEqual(deriveResult(store.getState()), { status: 'empty' });
});

// ---- Phase 4: history ----

test('listeners receive the name of the action', () => {
  const store = createStore();
  const actions = [];
  store.subscribe((state, action) => actions.push(action));
  store.actions.setInput('5');
  store.actions.selectCategory('mass');
  store.actions.swapUnits();
  assert.deepEqual(actions, ['setInput', 'selectCategory', 'swapUnits']);
});

test('recordConversion adds the current conversion to the top', () => {
  const store = createStore();
  store.actions.setInput('5');
  store.actions.recordConversion();
  store.actions.setInput('10');
  store.actions.recordConversion();
  assert.deepEqual(store.getState().history.map((e) => e.input), ['10', '5']);
});

test('recordConversion ignores empty or invalid input, and repeats of the newest entry', () => {
  const store = createStore();
  const calls = [];
  store.subscribe((state, action) => calls.push(action));
  store.actions.recordConversion();            // records "1"
  store.actions.recordConversion();            // same again: no change, no notification
  store.actions.setInput('abc');
  store.actions.recordConversion();            // invalid: ignored
  store.actions.setInput('');
  store.actions.recordConversion();            // empty: ignored
  assert.equal(store.getState().history.length, 1);
  assert.deepEqual(calls, ['recordConversion', 'setInput', 'setInput']);
});

test('restore puts a past conversion back without reordering history', () => {
  const store = createStore();
  store.actions.selectCategory('temperature');
  store.actions.setInput('100');
  store.actions.recordConversion();
  store.actions.selectCategory('length');
  store.actions.setInput('7');
  store.actions.recordConversion();
  const before = store.getState().history;

  store.actions.restore(before[1]);
  const state = store.getState();
  assert.equal(state.categoryId, 'temperature');
  assert.equal(state.rawInput, '100');
  assert.equal(deriveResult(state).display, '212');
  assert.equal(state.history, before, 'same array: list order unchanged');
});

test('clearHistory empties the list', () => {
  const store = createStore();
  store.actions.recordConversion();
  store.actions.clearHistory();
  assert.deepEqual(store.getState().history, []);
});
