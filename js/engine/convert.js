// Conversion engine. Pure functions: no DOM, no storage, no side effects.
import { getCategory, getUnit } from '../data/units.js';

// Is this an affine unit (temperature), which converts with functions
// instead of a single multiplication factor?
export function isAffine(unit) {
  return typeof unit.toBase === 'function';
}

// Convert any unit's value into the category's base unit (e.g. °F → K).
export function toBase(value, unit) {
  return isAffine(unit) ? unit.toBase(value) : value * unit.factor;
}

// Convert a number between two units of the same category.
//
//   convert(5, 'length', 'kilometer', 'mile')  → 3.106855961...
//
// Throws an Error if the category or a unit id is unknown. That is a bug in
// the calling code, not bad user input, so it should fail loudly.
export function convert(value, categoryId, fromId, toId) {
  if (!getCategory(categoryId)) {
    throw new Error(`Unknown category: "${categoryId}"`);
  }
  const from = getUnit(categoryId, fromId);
  const to = getUnit(categoryId, toId);
  if (!from) throw new Error(`Unknown unit "${fromId}" in ${categoryId}`);
  if (!to) throw new Error(`Unknown unit "${toId}" in ${categoryId}`);

  if (fromId === toId) return value;

  if (isAffine(from) || isAffine(to)) {
    // Affine: go through the base unit explicitly.
    return to.fromBase(toBase(value, from));
  }

  // Linear: multiply by the ratio of factors in one step.
  return value * (from.factor / to.factor);
}
