// Light/dark theme.
//
// Rules (DESIGN.md §3):
//   - With no saved choice, follow the operating system's setting.
//   - Pressing the toggle saves a choice, which overrides the system.
//   - If you toggle back to whatever the system wants, the saved choice is
//     removed, so the app follows the system again. That gives people a way
//     back to "automatic" without a third button.
//
// index.html has a tiny inline copy of resolveTheme() that runs before the
// page paints, to avoid a flash of the wrong theme. Keep the two in step.

export const THEME_KEY = 'uuc:v1:theme';

const isTheme = (value) => value === 'light' || value === 'dark';

// Which theme to show, given the saved choice (or null) and the system setting.
export function resolveTheme(saved, systemPrefersDark) {
  if (isTheme(saved)) return saved;
  return systemPrefersDark ? 'dark' : 'light';
}

// What to save after the toggle is pressed: 'light', 'dark', or null
// (meaning "follow the system").
export function preferenceAfterToggle(current, systemPrefersDark) {
  const next = current === 'dark' ? 'light' : 'dark';
  const system = systemPrefersDark ? 'dark' : 'light';
  return next === system ? null : next;
}

// Browser part: reads and writes storage, sets data-theme on <html>, and
// follows system changes while there's no saved choice.
export function createThemeController({
  storage,
  root = document.documentElement,
  media = window.matchMedia('(prefers-color-scheme: dark)'),
  onChange = () => {},
}) {
  const stored = storage.read(THEME_KEY, null);
  let saved = isTheme(stored) ? stored : null;

  const current = () => resolveTheme(saved, media.matches);

  function apply() {
    const theme = current();
    root.dataset.theme = theme;
    onChange(theme);
  }

  // Follow the system (e.g. an OS that switches to dark at sunset) unless
  // the user has made their own choice.
  media.addEventListener('change', () => {
    if (saved === null) apply();
  });

  apply();

  return {
    current,
    toggle() {
      saved = preferenceAfterToggle(current(), media.matches);
      storage.write(THEME_KEY, saved);
      apply();
    },
  };
}
