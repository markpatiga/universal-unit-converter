// A unit dropdown. Used twice: once for "From", once for "To".
//
// A native <select> gives us keyboard support, screen-reader support and the
// phone's own picker for free, which no custom dropdown matches cheaply.
import { getCategory } from '../../data/units.js';

export function createUnitSelect(selectEl, { onChange }) {
  let renderedCategory = null;

  selectEl.addEventListener('change', () => onChange(selectEl.value));

  return {
    render(categoryId, selectedId) {
      // Only rebuild the options when the category changes, so the list
      // isn't torn down (and focus lost) on every keystroke.
      if (categoryId !== renderedCategory) {
        const { units } = getCategory(categoryId);
        selectEl.replaceChildren(
          ...Object.entries(units).map(([id, unit]) => new Option(`${unit.label} (${unit.symbol})`, id)),
        );
        renderedCategory = categoryId;
      }
      selectEl.value = selectedId;
    },
  };
}
