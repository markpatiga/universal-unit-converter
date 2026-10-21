// Decides WHEN a conversion is finished and worth remembering.
//
// Results update on every keystroke, but saving every keystroke would fill
// the list with "1", "10", "100". So a conversion is saved when it settles:
//   - after 1 second with no further changes, or
//   - straight away on Enter or Copy (the caller calls flush()).
//
// Only deliberate edits start the timer: typing, changing a unit, swapping.
// Switching category, clearing, or restoring from the list cancel it, so
// browsing through categories doesn't record anything by itself.
//
// Timer functions are passed in so tests can control time.

const SETTLING_ACTIONS = new Set(['setInput', 'setFrom', 'setTo', 'swapUnits']);

export function createHistoryRecorder({
  onSettle,
  delay = 1000,
  setTimer = setTimeout,
  clearTimer = clearTimeout,
}) {
  let timer = null;

  function cancel() {
    if (timer !== null) clearTimer(timer);
    timer = null;
  }

  return {
    // Call after every state change, with the name of the action.
    notify(action) {
      cancel();
      if (SETTLING_ACTIONS.has(action)) {
        timer = setTimer(() => {
          timer = null;
          onSettle();
        }, delay);
      }
    },

    // Save now (Enter or Copy).
    flush() {
      cancel();
      onSettle();
    },

    // Save now only if a save was waiting (used when the page is closed).
    flushPending() {
      if (timer !== null) this.flush();
    },
  };
}
