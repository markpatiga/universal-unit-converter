// App state: one object, one way to change it, one way to listen.
//
//   event → action (e.g. setInput) → update(state) → every subscriber re-renders
//
// No DOM in this file, so the state logic can be tested in Node.
import { categories, getCategory } from './data/units.js';
import { convert } from './engine/convert.js';
import { validateInput } from './engine/validate.js';
import { formatNumber } from './engine/format.js';

const DEFAULT_CATEGORY = 'length';

export function createInitialState(categoryId = DEFAULT_CATEGORY) {
  const category = getCategory(categoryId);
  return {
    categoryId,
    fromId: category.defaultFrom,
    toId: category.defaultTo,
    rawInput: '1',
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
export function createStore(initialState = createInitialState()) {
  let state = initialState;
  const listeners = new Set();

  function update(patch) {
    state = { ...state, ...patch };
    for (const listener of listeners) listener(state);
  }

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
        update({ categoryId, fromId: category.defaultFrom, toId: category.defaultTo });
      },
      setFrom(fromId) {
        if (Object.hasOwn(categories[state.categoryId].units, fromId)) update({ fromId });
      },
      setTo(toId) {
        if (Object.hasOwn(categories[state.categoryId].units, toId)) update({ toId });
      },
      setInput(rawInput) {
        update({ rawInput });
      },
      // Swap units, keep the typed value: "5 km → mi" becomes "5 mi → km".
      swapUnits() {
        update({ fromId: state.toId, toId: state.fromId });
      },
      // Clear empties the input only; category and units stay as chosen.
      clear() {
        update({ rawInput: '' });
      },
    },
  };
}
