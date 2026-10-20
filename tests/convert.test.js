// Conversion engine: exact reference values, identity, and round trips.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { convert } from '../js/engine/convert.js';
import { categories } from '../js/data/units.js';

// Floating-point math is rarely exact (0.0254 / 0.01 is 2.5399999999999996),
// so compare with a relative tolerance instead of strict equality.
function assertClose(actual, expected, message, tolerance = 1e-12) {
  const scale = Math.max(1, Math.abs(expected));
  assert.ok(
    Math.abs(actual - expected) <= tolerance * scale,
    `${message}: expected ${expected}, got ${actual}`,
  );
}

// Reference values from exact definitions (see sources in units.js).
const REFERENCE = [
  // [value, category, from, to, expected]
  [1, 'length', 'inch', 'centimeter', 2.54],
  [1, 'length', 'foot', 'meter', 0.3048],
  [1, 'length', 'mile', 'meter', 1609.344],
  [1, 'length', 'nauticalMile', 'meter', 1852],
  [5, 'length', 'kilometer', 'mile', 3.1068559611866697],
  [1, 'mass', 'pound', 'kilogram', 0.45359237],
  [1, 'mass', 'pound', 'ounce', 16],
  [1, 'mass', 'stone', 'pound', 14],
  [1, 'mass', 'tonne', 'kilogram', 1000],
  [1, 'area', 'acre', 'squareMeter', 4046.8564224],
  [1, 'area', 'squareMile', 'acre', 640],
  [1, 'area', 'hectare', 'squareMeter', 10000],
  [1, 'area', 'squareFoot', 'squareInch', 144],
  [1, 'volume', 'usGallon', 'liter', 3.785411784],
  [1, 'volume', 'usGallon', 'usFluidOunce', 128],
  [1, 'volume', 'usCup', 'milliliter', 236.5882365],
  [1, 'volume', 'usTablespoon', 'usTeaspoon', 3],
  [1, 'volume', 'imperialGallon', 'liter', 4.54609],
  [1, 'volume', 'cubicMeter', 'liter', 1000],
  [1, 'time', 'hour', 'second', 3600],
  [1, 'time', 'week', 'day', 7],
  [1, 'time', 'year', 'day', 365.25],
  [1, 'time', 'year', 'month', 12],
  [1, 'speed', 'milePerHour', 'meterPerSecond', 0.44704],
  [36, 'speed', 'kilometerPerHour', 'meterPerSecond', 10],
  [1, 'speed', 'knot', 'kilometerPerHour', 1.852],
  [1, 'data', 'kibibyte', 'byte', 1024],
  [1, 'data', 'byte', 'bit', 8],
  [1, 'data', 'gibibyte', 'mebibyte', 1024],
  [1, 'data', 'pebibyte', 'byte', 1125899906842624],
  [0, 'temperature', 'celsius', 'fahrenheit', 32],
  [100, 'temperature', 'celsius', 'fahrenheit', 212],
  [-40, 'temperature', 'celsius', 'fahrenheit', -40],
  [0, 'temperature', 'kelvin', 'celsius', -273.15],
  [32, 'temperature', 'fahrenheit', 'kelvin', 273.15],
  [98.6, 'temperature', 'fahrenheit', 'celsius', 37],
];

for (const [value, categoryId, from, to, expected] of REFERENCE) {
  test(`${value} ${from} = ${expected} ${to}`, () => {
    assertClose(convert(value, categoryId, from, to), expected, `${from} → ${to}`);
  });
}

test('converting a unit to itself returns the same value', () => {
  for (const [categoryId, category] of Object.entries(categories)) {
    for (const unitId of Object.keys(category.units)) {
      assert.equal(convert(12.345, categoryId, unitId, unitId), 12.345, `${categoryId}/${unitId}`);
    }
  }
});

test('round trip A → B → A returns the original value, for every pair', () => {
  for (const [categoryId, category] of Object.entries(categories)) {
    const ids = Object.keys(category.units);
    for (const a of ids) {
      for (const b of ids) {
        const there = convert(123.456, categoryId, a, b);
        const back = convert(there, categoryId, b, a);
        assertClose(back, 123.456, `${categoryId}: ${a} → ${b} → ${a}`);
      }
    }
  }
});

test('zero converts to zero for linear units', () => {
  assert.equal(convert(0, 'length', 'mile', 'meter'), 0);
});

test('negative temperatures convert correctly', () => {
  assertClose(convert(-10, 'temperature', 'celsius', 'fahrenheit'), 14, '-10 °C → °F');
});

test('unknown category or unit throws (a programming error, not user error)', () => {
  assert.throws(() => convert(1, 'nope', 'meter', 'foot'), /Unknown category/);
  assert.throws(() => convert(1, 'length', 'parsec', 'foot'), /Unknown unit "parsec"/);
  assert.throws(() => convert(1, 'length', 'meter', 'kilogram'), /Unknown unit "kilogram"/);
});
