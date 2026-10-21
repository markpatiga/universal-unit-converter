// App state: one object, one way to change it, one way to listen.
//
//   event → action (e.g. setInput) → update(state) → every subscriber re-renders
//
// No DOM in this file, so the state logic can be tested in Node.
import { categories, getCategory } from './data/units.js';
import { convert } from './engine/convert.js';
import { validateInput } from './engine/validate.js';
import { formatNumber } from './engine/format.js';
import { makeEntry, addToHistory, isSameEntry } from './engine/history.js';

const DEFAULT_CATEGORY = 'length';

export function createInitialState({ categoryId = DEFAULT_CATEGORY, history = [] } = {}) {
  const category = getCategory(categoryId);
  return {
    categoryId,
    fromId: category.defaultFrom,
    toId: category.defaultTo,
    rawInput: '1',
    history, // recent conversions, newest first (see engine/history.js)
  };
}

// Pure: given the state, work out what the result area should show.
//
//   { status: 'empty' | 'incomplete' }        → show a placeholder
//   { status: 'invalid', message }            → show the error by the input
//   { status: 'valid', value, result, display } → show the result
export function deriveResult(state) {
  const check = validateInput(state.rawInput, state.categoryId, state.fromId);
  if (check.status !== 'valid') return check;

  const result = convert(check.value, state.categoryId, state.fromId, state.toId);
  if (!Number.isFinite(result)) {
    return { status: 'invalid', message: 'Result is too large to show. Try a smaller number.' };
  }
  return { status: 'valid', value: check.value, result, display: formatNumber(result) };
}

// The store. Components never change state directly; they call actions.
// Listeners receive the new state and the name of the action that caused it,
// so the history recorder can tell typing apart from switching category.
export function createStore(initialState = createInitialState()) {
  let state = initialState;
  const listeners = new Set();

  function update(patch, action) {
    state = { ...state, ...patch };
    for (const listener of listeners) listener(state, action);
  }

  const unitExists = (id) => Object.hasOwn(categories[state.categoryId].units, id);

  return {
    getState: () => state,

    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },

    actions: {
      // Switching category resets both units to that category's defaults
      // but keeps what the user typed (DESIGN.md §10).
      selectCategory(categoryId) {
        const category = getCategory(categoryId);
        if (!category || categoryId === state.categoryId) return;
        update({ categoryId, fromId: category.defaultFrom, toId: category.defaultTo }, 'selectCategory');
      },
      setFrom(fromId) {
        if (unitExists(fromId)) update({ fromId }, 'setFrom');
      },
      setTo(toId) {
        if (unitExists(toId)) update({ toId }, 'setTo');
      },
      setInput(rawInput) {
        update({ rawInput }, 'setInput');
      },
      // Swap units, keep the typed value: "5 km → mi" becomes "5 mi → km".
      swapUnits() {
        update({ fromId: state.toId, toId: state.fromId }, 'swapUnits');
      },
      // Clear empties the input only; category and units stay as chosen.
      clear() {
        update({ rawInput: '' }, 'clear');
      },

      // Save the current conversion to history, if it's valid and not
      // already the newest entry.
      recordConversion() {
        const entry = makeEntry(state);
        if (!entry) return;
        if (state.history[0] && isSameEntry(state.history[0], entry)) return;
        update({ history: addToHistory(state.history, entry) }, 'recordConversion');
      },
      // Put a past conversion back on screen. History order doesn't change.
      restore(entry) {
        if (!getCategory(entry.categoryId)) return;
        update({
          categoryId: entry.categoryId,
          fromId: entry.fromId,
          toId: entry.toId,
          rawInput: entry.input,
        }, 'restore');
      },
      clearHistory() {
        if (state.history.length === 0) return;
        update({ history: [] }, 'clearHistory');
      },
    },
  };
}
