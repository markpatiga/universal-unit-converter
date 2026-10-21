// Recent-conversions rules. Pure functions: no DOM, no storage, no timers.
//
// An entry stores what you typed and which units, not the result. The result
// is recalculated when the list is shown, so it is always correct, even if a
// factor or the formatting changes in a later version of the app.
//
//   { categoryId: 'length', fromId: 'kilometer', toId: 'mile', input: '5' }
import { getUnit } from '../data/units.js';
import { validateInput } from './validate.js';
import { convert } from './convert.js';

export const MAX_HISTORY = 10;

// Build an entry from the current state, or return null if there is no
// valid conversion to remember (empty, half-typed or invalid input, or a
// result too large to show).
export function makeEntry({ categoryId, fromId, toId, rawInput }) {
  if (!getUnit(categoryId, fromId) || !getUnit(categoryId, toId)) return null;
  const check = validateInput(rawInput, categoryId, fromId);
  if (check.status !== 'valid') return null;
  if (!Number.isFinite(convert(check.value, categoryId, fromId, toId))) return null;
  // Normalize so "5", "5.0" and " 5 " count as the same conversion.
  return { categoryId, fromId, toId, input: String(check.value) };
}

export function isSameEntry(a, b) {
  return a.categoryId === b.categoryId
    && a.fromId === b.fromId
    && a.toId === b.toId
    && a.input === b.input;
}

// Newest first. A repeat moves to the top instead of appearing twice.
export function addToHistory(history, entry, max = MAX_HISTORY) {
  return [entry, ...history.filter((e) => !isSameEntry(e, entry))].slice(0, max);
}

// Clean up whatever came out of storage. Anything malformed, from an older
// version, or pointing at a unit that no longer exists is dropped quietly.
export function sanitizeHistory(data, max = MAX_HISTORY) {
  if (!Array.isArray(data)) return [];
  const clean = [];
  for (const item of data) {
    if (!item || typeof item !== 'object') continue;
    const entry = makeEntry({
      categoryId: item.categoryId,
      fromId: item.fromId,
      toId: item.toId,
      rawInput: typeof item.input === 'string' ? item.input : '',
    });
    if (entry && !clean.some((e) => isSameEntry(e, entry))) clean.push(entry);
    if (clean.length === max) break;
  }
  return clean;
}
