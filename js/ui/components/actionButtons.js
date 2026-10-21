// Swap, Clear and Copy buttons.
//
// Each button calls a handler; it doesn't change state itself.
// Copy is disabled when there's no result; Clear is hidden when there's
// nothing to clear.

export function createActionButtons({ swapEl, clearEl, copyEl }, { onSwap, onClear, onCopy }) {
  swapEl.addEventListener('click', () => {
    onSwap();
    // Restart the half-turn animation (skipped when reduced motion is on, in CSS).
    swapEl.classList.remove('is-turning');
    void swapEl.offsetWidth; // force a reflow so the animation can replay
    swapEl.classList.add('is-turning');
  });
  clearEl.addEventListener('click', onClear);
  copyEl.addEventListener('click', onCopy);

  return {
    render(state, result) {
      copyEl.disabled = result.status !== 'valid';
      clearEl.hidden = state.rawInput === '';
    },
  };
}
