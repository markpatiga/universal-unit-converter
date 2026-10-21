// The number input plus its inline error message.
//
// Why type="text" and not type="number"? A number input changes its value
// when you scroll over it, reports "" for half-typed values like "1e", and
// behaves differently across browsers. inputmode="decimal" still brings up
// the number keyboard on phones. (DESIGN.md §10)

export function createValueInput(inputEl, errorEl, { onInput, onEscape, onEnter }) {
  inputEl.addEventListener('input', () => onInput(inputEl.value));

  // Escape clears the input, a common keyboard convention for search-like fields.
  // Enter means "done": save this conversion to history now.
  inputEl.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && inputEl.value !== '') {
      event.preventDefault();
      onEscape();
    } else if (event.key === 'Enter') {
      event.preventDefault();
      onEnter();
    }
  });

  return {
    render(rawInput, result) {
      // Don't overwrite what the user is typing; only sync when they differ
      // (e.g. when Clear empties the input).
      if (inputEl.value !== rawInput) inputEl.value = rawInput;

      const hasError = result.status === 'invalid';
      inputEl.setAttribute('aria-invalid', String(hasError));
      errorEl.textContent = hasError ? result.message : '';
      errorEl.hidden = !hasError;
    },

    focus() {
      inputEl.focus();
    },
  };
}
