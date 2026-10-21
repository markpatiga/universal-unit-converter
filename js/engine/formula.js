// Describes how a conversion is calculated, for the formula line under the
// result. Pure function: no DOM.
//
//   describeFormula('length', 'kilometer', 'mile')
//   → { expression: 'mi = km ÷ 1.609344', notes: [] }
import { getCategory, getUnit } from '../data/units.js';
import { formatNumber } from './format.js';

export function describeFormula(categoryId, fromId, toId) {
  const category = getCategory(categoryId);
  const from = getUnit(categoryId, fromId);
  const to = getUnit(categoryId, toId);
  if (!category || !from || !to) {
    throw new Error(`Unknown category/unit: ${categoryId}/${fromId}/${toId}`);
  }

  const notes = [from.note, to.note].filter(Boolean);
  if (fromId === toId) {
    return { expression: 'Same unit, so the value doesn’t change', notes: [] };
  }

  if (category.formulas) {
    const expression = category.formulas[`${fromId}>${toId}`];
    if (!expression) throw new Error(`No formula for ${categoryId}: ${fromId} → ${toId}`);
    return { expression, notes };
  }

  // Linear: the result is value × ratio. Show whichever of "× ratio" or
  // "÷ (1 / ratio)" reads more simply. km → mi is "÷ 1.609344" (exact)
  // rather than "× 0.6213711922" (rounded). Ties go to multiplication.
  const ratio = from.factor / to.factor;
  const times = formatNumber(ratio);
  const divide = formatNumber(1 / ratio);
  const operation = divide.length < times.length ? `÷ ${divide}` : `× ${times}`;

  return { expression: `${to.symbol} = ${from.symbol} ${operation}`, notes };
}
