// The "How it's calculated" line under the result.
import { describeFormula } from '../../engine/formula.js';

export function createFormulaPanel(expressionEl, notesEl) {
  return {
    render(state) {
      const { expression, notes } = describeFormula(state.categoryId, state.fromId, state.toId);
      expressionEl.textContent = expression;
      notesEl.textContent = notes.join(' ');
      notesEl.hidden = notes.length === 0;
    },
  };
}
