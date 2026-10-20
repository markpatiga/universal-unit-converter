// The number input plus its inline error message.
//
// Why type="text" and not type="number"? A number input changes its value
// when you scroll over it, reports "" for half-typed values like "1e", and
// behaves differently across browsers. inputmode="decimal" still brings up
// the number keyboard on phones. (DESIGN.md §10)

export function createValueInput(inputEl, errorEl, { onInput }) {
  inputEl.addEventListener('input', () => onInput(inputEl.value));

  return {
    render(rawInput, result) {
      // Don't overwrite what the user is typing; only sync when they differ
      // (e.g. when state changes from somewhere else, like Clear in Phase 3).
      if (inputEl.value !== rawInput) inputEl.value = rawInput;

      const hasError = result.status === 'invalid';
      inputEl.setAttribute('aria-invalid', String(hasError));
      errorEl.textContent = hasError ? result.message : '';
      errorEl.hidden = !hasError;
    },
  };
}
