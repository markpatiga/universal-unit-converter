// Connects the components to the page and to the store.
// Returns one render(state) function that redraws everything from state.
import { deriveResult } from '../state.js';
import { getUnit } from '../data/units.js';
import { copyText } from '../services/clipboard.js';
import { createCategoryPicker } from './components/categoryPicker.js';
import { createUnitSelect } from './components/unitSelect.js';
import { createValueInput } from './components/valueInput.js';
import { createResultPanel } from './components/resultPanel.js';
import { createFormulaPanel } from './components/formulaPanel.js';
import { createActionButtons } from './components/actionButtons.js';
import { createToast } from './components/toast.js';
import { createHistoryList } from './components/historyList.js';

// options.commitConversion: save the current conversion to history now
//   (called on Enter and Copy).
// options.storageAvailable: false shows a note that history won't be kept.
export function createRenderer(doc, store, { commitConversion = () => {}, storageAvailable = true } = {}) {
  const { actions } = store;
  const $ = (id) => {
    const el = doc.getElementById(id);
    if (!el) throw new Error(`Missing element #${id} in index.html`);
    return el;
  };

  const toast = createToast($('toast'));

  const picker = createCategoryPicker($('category-tabs'), {
    panelId: 'converter-panel',
    onSelect: actions.selectCategory,
  });
  const fromSelect = createUnitSelect($('from-unit'), { onChange: actions.setFrom });
  const toSelect = createUnitSelect($('to-unit'), { onChange: actions.setTo });
  const input = createValueInput($('value-input'), $('value-error'), {
    onInput: actions.setInput,
    onEscape: clear,
    onEnter: commitConversion,
  });
  const output = createResultPanel($('result-value'), $('result-symbol'));
  const formula = createFormulaPanel($('formula-expression'), $('formula-notes'));
  const buttons = createActionButtons(
    { swapEl: $('swap-button'), clearEl: $('clear-button'), copyEl: $('copy-button') },
    { onSwap: actions.swapUnits, onClear: clear, onCopy: copy },
  );
  const historyList = createHistoryList(
    { listEl: $('history-list'), emptyEl: $('history-empty'), clearEl: $('history-clear'), noticeEl: $('history-notice') },
    { onRestore: restore, onClear: clearHistory, storageAvailable },
  );
  const panel = $('converter-panel');

  // Restoring moves the cursor to the input, so you can see the result
  // (on phones the list is below it) and edit the number straight away.
  function restore(entry) {
    actions.restore(entry);
    input.focus();
  }

  function clearHistory() {
    actions.clearHistory();
    toast.show('History cleared');
    input.focus(); // the Clear history button disappears, so move focus somewhere useful
  }

  // Clear empties the input and puts the cursor back in it, ready to type.
  function clear() {
    actions.clear();
    input.focus();
  }

  // Copy the number only (no unit), so it pastes cleanly into a spreadsheet
  // or back into this converter.
  async function copy() {
    const state = store.getState();
    const result = deriveResult(state);
    if (result.status !== 'valid') return;

    commitConversion(); // copying means "this is the one I wanted"
    const ok = await copyText(result.display);
    const symbol = getUnit(state.categoryId, state.toId).symbol;
    toast.show(ok
      ? `Copied ${result.display} ${symbol}`
      : 'Couldn’t copy. Select the result and press Ctrl+C.');
  }

  return function render(state) {
    const result = deriveResult(state);
    panel.setAttribute('aria-labelledby', `tab-${state.categoryId}`);
    picker.render(state);
    fromSelect.render(state.categoryId, state.fromId);
    toSelect.render(state.categoryId, state.toId);
    input.render(state.rawInput, result);
    output.render(state, result);
    formula.render(state);
    buttons.render(state, result);
    historyList.render(state.history);
  };
}
