// The "Dark mode" button. A toggle button: its label stays "Dark mode",
// and aria-pressed tells screen readers whether it's on.

export function createThemeToggle(buttonEl, metaThemeColorEl, { onToggle }) {
  buttonEl.addEventListener('click', onToggle);

  return {
    render(theme) {
      buttonEl.setAttribute('aria-pressed', String(theme === 'dark'));
      // Colors the phone browser's address bar to match the page.
      if (metaThemeColorEl) {
        metaThemeColorEl.content = getComputedStyle(document.documentElement)
          .getPropertyValue('--color-bg').trim();
      }
    },
  };
}
