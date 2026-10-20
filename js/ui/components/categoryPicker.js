// Category tabs, following the WAI-ARIA "Tabs" pattern:
// https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
//
// Keyboard: Tab moves into the tab list and out again (only the selected tab
// is in the tab order). Arrow keys move between tabs, Home/End jump to the
// first/last. Moving selects the tab immediately ("automatic activation"),
// which suits us because switching category is instant.
import { categories } from '../../data/units.js';

export function createCategoryPicker(listEl, { panelId, onSelect }) {
  const ids = Object.keys(categories);

  const tabs = ids.map((id) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.id = `tab-${id}`;
    tab.className = 'category-tab';
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panelId);
    tab.dataset.category = id;
    tab.textContent = categories[id].label;
    tab.addEventListener('click', () => onSelect(id));
    listEl.append(tab);
    return tab;
  });

  listEl.addEventListener('keydown', (event) => {
    const current = ids.indexOf(event.target.dataset.category);
    if (current === -1) return;

    const last = ids.length - 1;
    const next = {
      ArrowRight: current === last ? 0 : current + 1,
      ArrowDown: current === last ? 0 : current + 1,
      ArrowLeft: current === 0 ? last : current - 1,
      ArrowUp: current === 0 ? last : current - 1,
      Home: 0,
      End: last,
    }[event.key];

    if (next === undefined) return;
    event.preventDefault(); // stop the page from scrolling
    onSelect(ids[next]);
    tabs[next].focus();
  });

  return {
    render(state) {
      for (const tab of tabs) {
        const selected = tab.dataset.category === state.categoryId;
        tab.setAttribute('aria-selected', String(selected));
        tab.tabIndex = selected ? 0 : -1;
      }
    },
  };
}
