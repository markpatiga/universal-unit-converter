# Universal Unit Converter — Design Document

> Status: Approved, pre-implementation
> Last updated: 2026-10-21 (Phase 3)
> Author: Mark (with AI-assisted design review)

## 1. Overview

Universal Unit Converter is a client-side, single-page web app that converts values between units across eight categories. It runs entirely in the browser, with no backend, no API and no build step, and is hosted on **GitHub Pages**.

The project is a portfolio piece. Its goals are to show:

- clean separation between data, logic and UI
- tested, verifiably correct conversion logic
- accessibility, responsiveness and theming done properly
- a documented, critical AI-assisted development process (see `AI-WORKFLOW.md`)

### Tech stack

| Technology | Purpose |
|---|---|
| HTML | Page structure, semantic markup |
| CSS | Layout, theming (light/dark), responsive design |
| JavaScript (ES modules) | Conversion engine and UI interactions |
| Node.js built-in test runner | Unit tests (dev only, no dependencies) |
| Git + GitHub | Version control, public source |
| GitHub Pages | Hosting |
| GitHub Actions | CI: run tests on every push |

## 2. Scope

### Categories

Length, Weight/Mass, Temperature, Area, Volume, Time, Speed, Data Storage.

### Core features

- Select a conversion category
- Select source and target units
- Enter a numeric value; the result updates immediately
- Swap source and target units
- Clear/reset
- Copy the result to the clipboard
- Show the conversion formula
- Recent conversions, persisted in `localStorage`
- Responsive design (mobile-first)
- Light/dark mode
- Keyboard accessibility
- Input validation with useful error messages

### Out of scope (v1)

Backend, accounts, currency conversion, live exchange rates, Mach number, troy ounces, locale-specific decimal commas.

## 3. Decisions and assumptions

| Topic | Decision |
|---|---|
| Hosting | GitHub Pages. |
| Data storage | **Binary (IEC) units only**: 1 KiB = 1024 B. Labels use IEC names (KiB, MiB, GiB…) so the meaning is unambiguous. |
| Volume | Metric and US customary, plus labeled Imperial gallon and pint. |
| Time | Year = 365.25 days (Julian year); month = year ÷ 12 = 30.4375 days. The formula display notes this. |
| Weight | Avoirdupois only (oz, lb, stone). |
| Speed | No Mach (it isn't a fixed factor). |
| Negative values | Allowed only for Temperature, which must stay at or above absolute zero. Rejected elsewhere. |
| Accepted input | Digits, one `.`, optional leading `-`, scientific notation (`1e6`). Spaces are stripped. Commas are rejected with a helpful message. |
| History saving | Convert on every keystroke; save to history only on a settled value (≈1 s idle, Enter, or Copy). |
| History size | 10 entries, newest first, duplicates moved to the top, one-click restore, "Clear history" button. |
| Precision | Up to 10 significant digits, trailing zeros trimmed; scientific notation below 1e-6 or above 1e15. |
| Theme | Follows OS `prefers-color-scheme` by default; a manual toggle overrides and is persisted. |
| Swap | Swaps the units and keeps the typed value. If that makes the value invalid (−400 °F → °C), the error shows. |
| Clear | Empties the input only (button or Escape); category and units stay. Focus returns to the input. |
| Copy | Copies the number only, without the unit, so it pastes cleanly into a spreadsheet or back into the converter. Falls back to `execCommand('copy')`, then to an instruction message. |
| Formula | Linear units show `× n` or `÷ n`, whichever is shorter (km → mi is `÷ 1.609344`, exact). Temperature uses written formulas stored in `units.js`. |

## 4. Units per category

Every factor must be verified against **NIST SP 811** or the official SI definitions before merging, with the source noted in a code comment. Base units are marked with ★.

| Category | Base | Units |
|---|---|---|
| Length | meter ★ | millimeter, centimeter, meter, kilometer, inch, foot, yard, mile, nautical mile |
| Weight/Mass | kilogram ★ | milligram, gram, kilogram, metric tonne, ounce, pound, stone |
| Temperature | kelvin ★ | Celsius, Fahrenheit, Kelvin |
| Area | square meter ★ | mm², cm², m², hectare, km², in², ft², yd², acre, mi² |
| Volume | liter ★ | milliliter, liter, cubic meter, teaspoon (US), tablespoon (US), fluid ounce (US), cup (US), pint (US), quart (US), gallon (US), pint (Imperial), gallon (Imperial) |
| Time | second ★ | millisecond, second, minute, hour, day, week, month, year |
| Speed | meter per second ★ | m/s, km/h, mph, ft/s, knot |
| Data Storage | byte ★ | bit, byte, KiB, MiB, GiB, TiB, PiB |

## 5. Architecture

Vanilla JavaScript with native ES modules. Each layer depends only on the layers below it.

```
┌─────────────────────────────────────────────┐
│ main.js   — bootstraps, wires everything    │
├─────────────────────────────────────────────┤
│ ui/       — reads state, renders DOM,       │
│             turns events into actions       │
├─────────────────────────────────────────────┤
│ state.js  — single state object + update()  │
├──────────────────────┬──────────────────────┤
│ engine/ (PURE)       │ services/ (side fx)  │
│ convert, validate,   │ storage, clipboard,  │
│ format, formula      │ theme                │
├──────────────────────┴──────────────────────┤
│ data/units.js — plain data, no logic        │
└─────────────────────────────────────────────┘
```

Rules:

1. **The engine never touches the DOM.** It contains only pure functions, so it is trivially testable.
2. **Data flows one way.** Event → action → `update(state)` → `render(state)`. No scattered DOM mutations.
   Each component attaches its own event listeners and calls a store action; there is no separate `events.js` (changed in Phase 2: keeping a component's markup and listeners together was simpler).
3. **Adding a unit means adding data, not code.**

Development note: ES modules do not load from `file://`. Use the VS Code Live Server extension or `npx serve`.

### Visual direction (Phase 2)

A tape measure on a drafting table: navy ink (`#14213d`) on cool paper (`#eef1f4`), with tape-measure yellow (`#f2b705`) used only on the result readout and its tick-mark scale. One typeface, Archivo, whose width axis gives the readout its character. All values live in `css/tokens.css`.

## 6. Folder structure

```
universal-unit-converter/
├── index.html
├── css/
│   ├── tokens.css        # color/spacing variables, light + dark themes
│   ├── base.css          # reset, typography, layout
│   └── components.css    # buttons, selects, cards, history, toast
├── js/
│   ├── main.js
│   ├── state.js
│   ├── data/
│   │   └── units.js
│   ├── engine/
│   │   ├── convert.js
│   │   ├── validate.js
│   │   ├── format.js
│   │   └── formula.js
│   ├── services/
│   │   ├── storage.js
│   │   ├── clipboard.js
│   │   └── theme.js
│   └── ui/
│       ├── render.js     # connects components to the store; one render(state)
│       └── components/   # categoryPicker, unitSelect, valueInput, resultPanel, …
├── tests/
│   ├── convert.test.js
│   ├── formula.test.js
│   ├── validate.test.js
│   ├── format.test.js
│   ├── state.test.js
│   └── units.test.js
├── docs/
│   ├── DESIGN.md
│   ├── AI-WORKFLOW.md
│   └── screenshots/
├── .github/workflows/test.yml
├── package.json          # dev-only: "type": "module", "test": "node --test"
├── .gitignore
├── LICENSE
└── README.md
```

## 7. Reusable components

| Component | Responsibility |
|---|---|
| `categoryPicker` | Tab list / segmented control with arrow-key navigation |
| `unitSelect` | Renders `<option>`s for a category; used for source and target |
| `valueInput` | Text input + inline error, with `aria-invalid` and `aria-describedby` |
| `resultPanel` | Result, unit symbol, formula, Copy button; `aria-live="polite"` |
| `historyList` | List of buttons that restore past conversions |
| `themeToggle` | Light/dark switch with persisted choice |
| `toast` | Brief feedback ("Copied!") announced via a live region |
| `storage` service | Safe `get`/`set` with `try/catch`, JSON parsing, versioned keys (`uuc:v1:history`), graceful fallback |

## 8. Conversion engine

Every category has a base unit. Conversions go **source → base → target**.

**Linear units** (all categories except Temperature) carry a `factor`: "1 of this unit equals `factor` base units".

```js
result = value * (from.factor / to.factor);
```

**Temperature** is affine, so its units carry functions instead of a factor:

```js
celsius:    { toBase: c => c + 273.15,                fromBase: k => k - 273.15 }
fahrenheit: { toBase: f => (f - 32) * 5 / 9 + 273.15, fromBase: k => (k - 273.15) * 9 / 5 + 32 }
kelvin:     { toBase: k => k,                         fromBase: k => k }
```

The engine detects which shape a unit has; everything else is generic.

### Unit definition shape

```js
export const categories = {
  length: {
    label: 'Length',
    baseUnit: 'meter',
    defaultFrom: 'kilometer',
    defaultTo: 'mile',
    allowNegative: false,
    units: {
      meter:     { label: 'Meter',     symbol: 'm',  factor: 1 },
      kilometer: { label: 'Kilometer', symbol: 'km', factor: 1000 },
      inch:      { label: 'Inch',      symbol: 'in', factor: 0.0254 },   // exact, NIST SP 811
      mile:      { label: 'Mile',      symbol: 'mi', factor: 1609.344 }, // exact, NIST SP 811
    },
  },
  // temperature: units use toBase/fromBase plus a formula string; category sets minValue (0 K)
};
```

### Formula display

- Linear: generated from factors, e.g. `km → mi: value × 0.621371`.
- Temperature: explicit formula strings, e.g. `°F = °C × 9/5 + 32`.
- Time: month and year conversions append the 365.25-day assumption.

## 9. Testing strategy

| Layer | Approach |
|---|---|
| Engine & validation | Node built-in test runner (`node --test`) |
| Data integrity | Unique ids, positive finite factors (or both temperature functions), symbols present |
| Accessibility | Keyboard-only walkthrough, axe DevTools, Lighthouse ≥ 95 in all categories |
| Visual / responsive | 360px, 768px, 1280px; both themes; Chrome, Firefox, Safari or mobile |
| CI | GitHub Actions runs `npm test` on every push; status badge in README |

### Required engine test cases

- Exact reference values:
  - 1 in = 2.54 cm
  - 1 mi = 1609.344 m
  - 1 lb = 0.45359237 kg
  - 1 US gal = 3.785411784 L
  - 1 KiB = 1024 B; 1 byte = 8 bits
  - 0 °C = 32 °F; 100 °C = 212 °F; −40 °C = −40 °F; 0 K = −273.15 °C
- Identity: any unit to itself returns the same value.
- Round trip: A → B → A returns the original within tolerance.

## 10. Edge cases

- Empty input → no result, no error.
- Incomplete input while typing (`-`, `.`, `-.`) → neutral "incomplete" state, no error flash.
- `Infinity`, `NaN`, overflow (`1e400`) → "Number too large."
- Temperature below absolute zero → specific error message.
- Negative values in non-temperature categories → specific error message.
- Source unit equals target unit → valid, same value.
- Floating-point artifacts (`0.30000000000000004`) → handled by `format.js`.
- Very small or large results → scientific notation.
- Category switch → reset units to category defaults, keep the typed value.
- `localStorage` disabled, full or corrupted → app works; history silently disabled.
- History entry referencing a renamed/removed unit → skipped safely (versioned key).
- Clipboard API unavailable or denied → fallback to text selection + message.
- Theme flash on load → inline `<script>` in `<head>` sets the theme before paint.
- `prefers-reduced-motion` → disable swap animation.
- Use `<input type="text" inputmode="decimal">`, not `type="number"`.

## 11. Implementation plan

Each phase ends with a commit (ideally a PR) and a working deploy.

| Phase | Deliverable | Est. |
|---|---|---|
| 0. Setup | Repo, folders, README stub, placeholder page live on GitHub Pages | 0.5 h |
| 1. Engine | `units.js` (8 categories, verified factors), `convert`/`validate`/`format`, passing tests | 2–3 h |
| 2. Core UI | Category picker, unit selects, input, live result, inline errors, mobile-first layout | 2–3 h |
| 3. Actions | Swap, Clear, Copy + toast, formula display | 1–2 h |
| 4. History | Storage service, save-on-settle, restore, clear history | 1–2 h |
| 5. Polish | Light/dark tokens + toggle, focus styles, ARIA review, reduced motion, favicon, meta tags | 2 h |
| 6. Ship | QA checklist, Lighthouse/axe fixes, screenshots, README, AI-WORKFLOW.md, CI badge | 1–2 h |

**Total:** roughly 2–3 focused days.

### Stretch goals (post-v1)

- Shareable URLs (`?c=length&from=km&to=mi&v=5`)
- Keyboard shortcuts
- Favorite conversions
- Offline-capable PWA
- SI (decimal) data-storage units

## 12. Process conventions

- Conventional commits: `feat:`, `fix:`, `test:`, `docs:`, `style:`, `refactor:`, `chore:`.
- One branch and PR per phase.
- `docs/AI-WORKFLOW.md` records, per phase: prompts used, what the AI got wrong, and how it was verified.
