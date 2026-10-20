// The result readout. It lives in an aria-live region (set in index.html), so
// screen readers announce the new result after the user stops typing.
import { getUnit } from '../../data/units.js';

export function createResultPanel(valueEl, symbolEl) {
  return {
    render(state, result) {
      const unit = getUnit(state.categoryId, state.toId);
      const showing = result.status === 'valid';

      valueEl.textContent = showing ? result.display : '—';
      valueEl.classList.toggle('is-placeholder', !showing);
      symbolEl.textContent = unit.symbol;
      // A long number like "1.125899907e+15" gets a smaller size so it fits.
      valueEl.classList.toggle('is-long', showing && result.display.length > 12);
    },
  };
}
