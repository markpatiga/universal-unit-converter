// Input validation. Turns the raw text the user typed into one of four states:
//
//   { status: 'empty' }                       nothing typed: show nothing
//   { status: 'incomplete' }                  mid-typing ("-", ".", "1e"): show nothing, no error
//   { status: 'invalid', message: '...' }     show the message
//   { status: 'valid', value: 12.5 }          convert it
//
// Pure function: no DOM. The UI decides how to display each state.
import { getCategory, getUnit } from '../data/units.js';
import { toBase } from './convert.js';

// A complete number: optional minus, digits with an optional decimal point
// (or a leading point like ".5"), optional exponent like e6 or E-3.
const COMPLETE_NUMBER = /^-?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/i;

// A number that is still being typed and could become valid.
const INCOMPLETE_NUMBER = /^(-|-?\.|-?(\d+\.?\d*|\.\d+)e[+-]?)$/i;

// Small tolerance for comparisons against absolute zero. With the current
// formulas, -273.15 °C and -459.67 °F both land on exactly 0 K, but a
// rearranged formula could land on -0.00000000000003 K and wrongly reject
// them. The "exactly absolute zero" tests guard this boundary.
const EPSILON = 1e-9;

export function validateInput(raw, categoryId, fromId) {
  const text = String(raw ?? '').replace(/\s+/g, '');

  if (text === '') return { status: 'empty' };
  if (INCOMPLETE_NUMBER.test(text)) return { status: 'incomplete' };

  if (text.includes(',')) {
    return invalid('Use a period for decimals and no thousands separators, e.g. 1234.5');
  }
  if (!COMPLETE_NUMBER.test(text)) {
    return invalid('Enter a number, e.g. 12.5, -3 or 1e6');
  }

  const value = Number(text);
  if (!Number.isFinite(value)) {
    return invalid('Number too large');
  }

  const category = getCategory(categoryId);
  const unit = getUnit(categoryId, fromId);
  if (!category || !unit) {
    throw new Error(`Unknown category/unit: ${categoryId}/${fromId}`);
  }

  if (value < 0 && !category.allowNegative) {
    return invalid(`${category.label} can't be negative`);
  }

  if (category.minBaseValue !== undefined
      && toBase(value, unit) < category.minBaseValue - EPSILON) {
    return invalid('Below absolute zero (−273.15 °C / −459.67 °F / 0 K)');
  }

  return { status: 'valid', value };
}

function invalid(message) {
  return { status: 'invalid', message };
}
