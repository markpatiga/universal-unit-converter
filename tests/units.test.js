// Data integrity: catches typos and missing fields in units.js.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { categories, getCategory, getUnit } from '../js/data/units.js';

const EXPECTED_CATEGORIES = ['length', 'mass', 'temperature', 'area', 'volume', 'time', 'speed', 'data'];

test('all eight categories exist', () => {
  assert.deepEqual(Object.keys(categories), EXPECTED_CATEGORIES);
});

for (const [categoryId, category] of Object.entries(categories)) {
  test(`${categoryId}: category is well-formed`, () => {
    assert.ok(category.label, 'has a label');
    assert.equal(typeof category.allowNegative, 'boolean', 'allowNegative is a boolean');
    for (const key of ['baseUnit', 'defaultFrom', 'defaultTo']) {
      assert.ok(Object.hasOwn(category.units, category[key]), `${key} "${category[key]}" is a real unit`);
    }
    assert.notEqual(category.defaultFrom, category.defaultTo, 'defaults differ');
  });

  test(`${categoryId}: base unit converts 1:1`, () => {
    const base = category.units[category.baseUnit];
    if (base.factor !== undefined) {
      assert.equal(base.factor, 1);
    } else {
      assert.equal(base.toBase(42), 42);
      assert.equal(base.fromBase(42), 42);
    }
  });

  test(`${categoryId}: every unit has a label, symbol and a valid conversion`, () => {
    const symbols = new Set();
    for (const [unitId, unit] of Object.entries(category.units)) {
      assert.ok(unit.label, `${unitId} has a label`);
      assert.ok(unit.symbol, `${unitId} has a symbol`);
      assert.ok(!symbols.has(unit.symbol), `${unitId} symbol "${unit.symbol}" is unique`);
      symbols.add(unit.symbol);

      const linear = unit.factor !== undefined;
      const affine = typeof unit.toBase === 'function' && typeof unit.fromBase === 'function';
      assert.ok(linear !== affine, `${unitId} is either linear or affine, not both or neither`);
      if (linear) {
        assert.ok(Number.isFinite(unit.factor) && unit.factor > 0, `${unitId} factor is a positive number`);
      }
    }
  });
}

test('getCategory and getUnit return undefined for unknown ids', () => {
  assert.equal(getCategory('nope'), undefined);
  assert.equal(getUnit('length', 'nope'), undefined);
  assert.equal(getUnit('nope', 'meter'), undefined);
  // Built-in object properties must not count as categories or units.
  assert.equal(getCategory('toString'), undefined);
  assert.equal(getUnit('length', 'constructor'), undefined);
});
