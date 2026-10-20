// Number formatting for display.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatNumber } from '../js/engine/format.js';
import { validateInput } from '../js/engine/validate.js';

test('hides floating-point noise', () => {
  assert.equal(formatNumber(0.1 + 0.2), '0.3');           // 0.30000000000000004
  assert.equal(formatNumber(0.0254 / 0.01), '2.54');       // 2.5399999999999996
});

test('rounds to 10 significant digits and trims trailing zeros', () => {
  assert.equal(formatNumber(3.1068559611866697), '3.106855961');
  assert.equal(formatNumber(2.5), '2.5');
  assert.equal(formatNumber(100), '100');
  assert.equal(formatNumber(1234567.891), '1234567.891');
  assert.equal(formatNumber(-40), '-40');
});

test('zero and negative zero both display as "0"', () => {
  assert.equal(formatNumber(0), '0');
  assert.equal(formatNumber(-0), '0');
});

test('uses plain notation between 1e-6 and 1e15', () => {
  assert.equal(formatNumber(0.000001), '0.000001');
  assert.equal(formatNumber(123456789012), '123456789000');
  assert.equal(formatNumber(123456789012345), '123456789000000');
});

test('switches to scientific notation for very small or large numbers', () => {
  assert.equal(formatNumber(1e-7), '1e-7');
  assert.equal(formatNumber(0.00000012345), '1.2345e-7');
  assert.equal(formatNumber(1e15), '1e+15');
  assert.equal(formatNumber(1125899906842624), '1.125899907e+15');
  assert.equal(formatNumber(-2.5e20), '-2.5e+20');
});

test('formatted output can be typed back into the input', () => {
  for (const n of [0.3, 2.54, 1e-7, 1.125899906842624e15, 123456.789]) {
    const result = validateInput(formatNumber(n), 'length', 'meter');
    assert.equal(result.status, 'valid', formatNumber(n));
  }
});

test('refuses to format Infinity or NaN', () => {
  assert.throws(() => formatNumber(Infinity), RangeError);
  assert.throws(() => formatNumber(NaN), RangeError);
});
