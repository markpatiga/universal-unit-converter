// Recent-conversion rules: building, adding, and cleaning entries.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeEntry, addToHistory, sanitizeHistory, MAX_HISTORY } from '../js/engine/history.js';

const km = (input) => ({ categoryId: 'length', fromId: 'kilometer', toId: 'mile', input });

test('makeEntry builds an entry from a valid state', () => {
  const state = { categoryId: 'length', fromId: 'kilometer', toId: 'mile', rawInput: '5' };
  assert.deepEqual(makeEntry(state), km('5'));
});

test('makeEntry normalizes the number so equal values match', () => {
  for (const raw of ['5', '5.0', ' 5 ', '5.', '5e0']) {
    assert.equal(makeEntry({ categoryId: 'length', fromId: 'kilometer', toId: 'mile', rawInput: raw }).input, '5', raw);
  }
});

test('makeEntry returns null when there is nothing valid to remember', () => {
  for (const rawInput of ['', '-', 'abc', '-5']) {
    assert.equal(makeEntry({ categoryId: 'length', fromId: 'kilometer', toId: 'mile', rawInput }), null, rawInput);
  }
  assert.equal(makeEntry({ categoryId: 'length', fromId: 'parsec', toId: 'mile', rawInput: '1' }), null);
});

test('makeEntry returns null when the result is too large to show', () => {
  // A valid input whose result overflows: it must never reach the list.
  assert.equal(makeEntry({ categoryId: 'data', fromId: 'pebibyte', toId: 'bit', rawInput: '1e300' }), null);
});

test('addToHistory puts new entries first', () => {
  assert.deepEqual(addToHistory([km('1')], km('2')), [km('2'), km('1')]);
});

test('addToHistory moves a repeat to the top instead of duplicating it', () => {
  const history = [km('3'), km('2'), km('1')];
  assert.deepEqual(addToHistory(history, km('1')), [km('1'), km('3'), km('2')]);
});

test(`addToHistory keeps at most ${MAX_HISTORY} entries, dropping the oldest`, () => {
  let history = [];
  for (let i = 1; i <= 12; i++) history = addToHistory(history, km(String(i)));
  assert.equal(history.length, MAX_HISTORY);
  assert.equal(history[0].input, '12');
  assert.equal(history.at(-1).input, '3');
});

test('addToHistory does not change the original array', () => {
  const history = [km('1')];
  addToHistory(history, km('2'));
  assert.deepEqual(history, [km('1')]);
});

test('sanitizeHistory returns [] for anything that is not a list', () => {
  for (const data of [null, undefined, 'text', 42, { entries: [] }]) {
    assert.deepEqual(sanitizeHistory(data), [], JSON.stringify(data));
  }
});

test('sanitizeHistory drops malformed, outdated and invalid entries', () => {
  const data = [
    km('5'),
    null,
    'not an entry',
    { categoryId: 'length', fromId: 'furlong', toId: 'mile', input: '1' }, // unit doesn't exist
    { categoryId: 'currency', fromId: 'usd', toId: 'php', input: '1' },    // category doesn't exist
    { categoryId: 'length', fromId: 'meter', toId: 'mile', input: 'abc' }, // bad number
    { categoryId: 'length', fromId: 'meter', toId: 'mile', input: 7 },     // wrong type
    { categoryId: 'temperature', fromId: 'kelvin', toId: 'celsius', input: '-5' }, // below absolute zero
    { ...km('9'), extra: 'ignored' },
  ];
  assert.deepEqual(sanitizeHistory(data), [km('5'), km('9')]);
});

test('sanitizeHistory removes duplicates and caps the list', () => {
  const data = [km('1'), km('1.0'), ...Array.from({ length: 15 }, (_, i) => km(String(i + 2)))];
  const clean = sanitizeHistory(data);
  assert.equal(clean.length, MAX_HISTORY);
  assert.deepEqual(clean.slice(0, 2), [km('1'), km('2')]);
});
