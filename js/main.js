// Entry point: load saved history, create the store, connect the UI,
// and keep history saved in the browser.
import { createStore, createInitialState } from './state.js';
import { sanitizeHistory } from './engine/history.js';
import { createStorage } from './services/storage.js';
import { createHistoryRecorder } from './services/historyRecorder.js';
import { createThemeController } from './services/theme.js';
import { createRenderer } from './ui/render.js';
import { createThemeToggle } from './ui/components/themeToggle.js';

// The version is in the key: if the entry format ever changes, a new key
// (uuc:v2:history) starts fresh instead of misreading old data.
const HISTORY_KEY = 'uuc:v1:history';

const storage = createStorage();
const history = sanitizeHistory(storage.read(HISTORY_KEY, []));
const store = createStore(createInitialState({ history }));

const recorder = createHistoryRecorder({ onSettle: store.actions.recordConversion });
const render = createRenderer(document, store, {
  commitConversion: recorder.flush,
  storageAvailable: storage.available,
});

// Save history whenever the list itself changes (not on every keystroke).
let savedHistory = history;
store.subscribe((state, action) => {
  render(state);
  recorder.notify(action);
  if (state.history !== savedHistory) {
    savedHistory = state.history;
    storage.write(HISTORY_KEY, state.history);
  }
});

// If the page is closed or hidden during the 1-second wait, save right away.
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') recorder.flushPending();
});

render(store.getState());

// Theme: separate from the converter state, because it's about the page,
// not the conversion. The inline script in index.html already set the
// first theme; this takes over from there.
const toggle = createThemeToggle(
  document.getElementById('theme-toggle'),
  document.querySelector('meta[name="theme-color"]'),
  { onToggle: () => theme.toggle() },
);
const theme = createThemeController({ storage, onChange: (t) => toggle.render(t) });
