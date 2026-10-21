// Formula descriptions shown under the result.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { describeFormula } from '../js/engine/formula.js';
import { convert } from '../js/engine/convert.js';
import { categories } from '../js/data/units.js';

test('picks the simpler of × and ÷ for linear units', () => {
  assert.equal(describeFormula('length', 'kilometer', 'mile').expression, 'mi = km ÷ 1.609344');
  assert.equal(describeFormula('length', 'mile', 'kilometer').expression, 'km = mi × 1.609344');
  assert.equal(describeFormula('mass', 'pound', 'kilogram').expression, 'kg = lb × 0.45359237');
  assert.equal(describeFormula('data', 'bit', 'byte').expression, 'B = bit ÷ 8');
  assert.equal(describeFormula('length', 'inch', 'centimeter').expression, 'cm = in × 2.54');
});

test('ties between × and ÷ go to multiplication', () => {
  // 1 kg = 1000 g: "× 1000" (4 chars) vs "÷ 0.001" (5 chars), and
  // 1 m = 100 cm: "× 100" vs "÷ 0.01" — both multiply.
  assert.equal(describeFormula('mass', 'kilogram', 'gram').expression, 'g = kg × 1000');
  assert.equal(describeFormula('length', 'meter', 'centimeter').expression, 'cm = m × 100');
});

test('temperature uses its written formulas', () => {
  assert.equal(describeFormula('temperature', 'celsius', 'fahrenheit').expression, '°F = °C × 9/5 + 32');
  assert.equal(describeFormula('temperature', 'kelvin', 'celsius').expression, '°C = K − 273.15');
});

test('every temperature pair has a formula', () => {
  const ids = Object.keys(categories.temperature.units);
  for (const from of ids) {
    for (const to of ids) {
      assert.ok(describeFormula('temperature', from, to).expression, `${from} → ${to}`);
    }
  }
});

test('the same unit on both sides says so', () => {
  assert.match(describeFormula('length', 'meter', 'meter').expression, /Same unit/);
  assert.match(describeFormula('temperature', 'kelvin', 'kelvin').expression, /Same unit/);
});

test('month and year conversions explain the averages used', () => {
  const { notes } = describeFormula('time', 'year', 'day');
  assert.deepEqual(notes, ['1 year = 365.25 days (Julian year)']);
  assert.equal(describeFormula('time', 'month', 'year').notes.length, 2);
  assert.deepEqual(describeFormula('time', 'hour', 'minute').notes, []);
});

// The formula must agree with the actual conversion, for every linear pair.
test('linear formulas match what convert() does', () => {
  for (const [categoryId, category] of Object.entries(categories)) {
    if (category.formulas) continue;
    const ids = Object.keys(category.units);
    for (const from of ids) {
      for (const to of ids) {
        if (from === to) continue;
        const { expression } = describeFormula(categoryId, from, to);
        const [, op, number] = expression.match(/ ([×÷]) (\S+)$/);
        const factor = op === '×' ? Number(number) : 1 / Number(number);
        const expected = convert(1, categoryId, from, to);
        assert.ok(Math.abs(factor - expected) <= 1e-9 * Math.abs(expected),
          `${categoryId} ${from} → ${to}: formula says ${expression}, convert gives ${expected}`);
      }
    }
  }
});

test('unknown ids throw', () => {
  assert.throws(() => describeFormula('length', 'meter', 'parsec'));
});
