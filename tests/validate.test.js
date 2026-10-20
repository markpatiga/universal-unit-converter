// Input validation: every state the input box can be in.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateInput } from '../js/engine/validate.js';

const len = (raw) => validateInput(raw, 'length', 'meter');

test('empty input is "empty", not an error', () => {
  for (const raw of ['', '   ', null, undefined]) {
    assert.deepEqual(len(raw), { status: 'empty' }, JSON.stringify(raw));
  }
});

test('partially typed numbers are "incomplete", not an error', () => {
  for (const raw of ['-', '.', '-.', '1e', '1e-', '2.5E+', '-.5e']) {
    assert.deepEqual(validateInput(raw, 'temperature', 'celsius'), { status: 'incomplete' }, raw);
  }
});

test('valid numbers parse to their value', () => {
  const cases = [
    ['42', 42], ['3.14', 3.14], ['.5', 0.5], ['5.', 5], ['0', 0],
    ['1e6', 1e6], ['2.5E-3', 0.0025], ['1e+3', 1000],
    [' 12 ', 12], ['1 000', 1000], ['007', 7],
  ];
  for (const [raw, value] of cases) {
    assert.deepEqual(len(raw), { status: 'valid', value }, raw);
  }
});

test('commas get a specific, helpful message', () => {
  for (const raw of ['1,000', '1,5']) {
    const result = len(raw);
    assert.equal(result.status, 'invalid', raw);
    assert.match(result.message, /period/);
  }
});

test('non-numbers are invalid', () => {
  for (const raw of ['abc', '12abc', '1.2.3', '--5', '1e5.5', '0x10', 'Infinity', 'NaN', '+-1', '5-']) {
    const result = len(raw);
    assert.equal(result.status, 'invalid', raw);
    assert.match(result.message, /Enter a number/, raw);
  }
});

test('numbers too large for JavaScript are rejected', () => {
  assert.deepEqual(len('1e400'), { status: 'invalid', message: 'Number too large' });
});

test('negative values are rejected outside temperature', () => {
  const result = len('-5');
  assert.equal(result.status, 'invalid');
  assert.equal(result.message, "Length can't be negative");
  assert.equal(validateInput('-1', 'data', 'byte').status, 'invalid');
});

test('-0 is allowed (it is zero)', () => {
  assert.equal(len('-0').status, 'valid');
});

test('negative temperatures above absolute zero are valid', () => {
  assert.deepEqual(validateInput('-40', 'temperature', 'celsius'), { status: 'valid', value: -40 });
  assert.deepEqual(validateInput('-300', 'temperature', 'fahrenheit'), { status: 'valid', value: -300 });
});

test('exactly absolute zero is valid in every temperature unit', () => {
  // Boundary values. If a formula change introduces floating-point drift
  // below 0 K, these fail, which is exactly the point.
  assert.equal(validateInput('-273.15', 'temperature', 'celsius').status, 'valid');
  assert.equal(validateInput('-459.67', 'temperature', 'fahrenheit').status, 'valid');
  assert.equal(validateInput('0', 'temperature', 'kelvin').status, 'valid');
});

test('below absolute zero is rejected with a specific message', () => {
  for (const [raw, unit] of [['-273.16', 'celsius'], ['-460', 'fahrenheit'], ['-1', 'kelvin']]) {
    const result = validateInput(raw, 'temperature', unit);
    assert.equal(result.status, 'invalid', `${raw} ${unit}`);
    assert.match(result.message, /absolute zero/);
  }
});

test('unknown category or unit throws', () => {
  assert.throws(() => validateInput('1', 'nope', 'meter'));
  assert.throws(() => validateInput('1', 'length', 'nope'));
});
