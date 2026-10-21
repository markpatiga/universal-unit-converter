// "Recent conversions": a list of buttons that put a past conversion back.
//
// Each result is recalculated from the stored input, so it always matches
// the current engine. The list is only rebuilt when the history array
// changes; restoring an entry doesn't change it, so the button you clicked
// keeps its place.
import { getCategory, getUnit } from '../../data/units.js';
import { deriveResult } from '../../state.js';

export function createHistoryList({ listEl, emptyEl, clearEl, noticeEl }, { onRestore, onClear, storageAvailable }) {
  let renderedHistory = null;

  clearEl.addEventListener('click', onClear);
  noticeEl.hidden = storageAvailable;

  return {
    render(history) {
      if (history === renderedHistory) return;
      renderedHistory = history;

      listEl.replaceChildren(...history.map((entry) => {
        const item = document.createElement('li');
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'history-item';

        const result = deriveResult({ ...entry, rawInput: entry.input });
        const from = getUnit(entry.categoryId, entry.fromId).symbol;
        const to = getUnit(entry.categoryId, entry.toId).symbol;
        const conversion = document.createElement('span');
        conversion.className = 'history-conversion';
        conversion.textContent = `${entry.input} ${from} = ${result.display} ${to}`;

        const category = document.createElement('span');
        category.className = 'history-category';
        category.textContent = getCategory(entry.categoryId).label;

        button.append(conversion, category);
        button.addEventListener('click', () => onRestore(entry));
        item.append(button);
        return item;
      }));

      const empty = history.length === 0;
      listEl.hidden = empty;
      emptyEl.hidden = !empty;
      clearEl.hidden = empty;
    },
  };
}
