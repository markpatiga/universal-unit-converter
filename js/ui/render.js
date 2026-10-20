// Connects the components to the page and to the store's actions.
// Returns one render(state) function that redraws everything from state.
import { deriveResult } from '../state.js';
import { createCategoryPicker } from './components/categoryPicker.js';
import { createUnitSelect } from './components/unitSelect.js';
import { createValueInput } from './components/valueInput.js';
import { createResultPanel } from './components/resultPanel.js';

export function createRenderer(doc, actions) {
  const $ = (id) => {
    const el = doc.getElementById(id);
    if (!el) throw new Error(`Missing element #${id} in index.html`);
    return el;
  };

  const picker = createCategoryPicker($('category-tabs'), {
    panelId: 'converter-panel',
    onSelect: actions.selectCategory,
  });
  const fromSelect = createUnitSelect($('from-unit'), { onChange: actions.setFrom });
  const toSelect = createUnitSelect($('to-unit'), { onChange: actions.setTo });
  const input = createValueInput($('value-input'), $('value-error'), { onInput: actions.setInput });
  const output = createResultPanel($('result-value'), $('result-symbol'));
  const panel = $('converter-panel');

  return function render(state) {
    const result = deriveResult(state);
    panel.setAttribute('aria-labelledby', `tab-${state.categoryId}`);
    picker.render(state);
    fromSelect.render(state.categoryId, state.fromId);
    toSelect.render(state.categoryId, state.toId);
    input.render(state.rawInput, result);
    output.render(state, result);
  };
}
