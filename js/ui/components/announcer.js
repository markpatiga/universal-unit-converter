// Tells screen-reader users the result (or the error) once they pause typing.
//
// Why not just make the result a live region? It changes on every keystroke,
// so typing "250" would announce three results, and the error message (which
// isn't a live region at all) would never be announced. This waits until
// typing pauses, then announces one short message, and only if it changed.
//
// The element is a visually hidden role="status" region in index.html.

export function createAnnouncer(el, { delay = 700, setTimer = setTimeout, clearTimer = clearTimeout } = {}) {
  let timer = null;
  let lastAnnounced = '';

  return {
    // Pass '' to announce nothing (e.g. while the input is empty).
    announce(message) {
      if (timer !== null) clearTimer(timer);
      timer = setTimer(() => {
        timer = null;
        if (message === '' || message === lastAnnounced) return;
        lastAnnounced = message;
        el.textContent = message;
      }, delay);
    },
  };
}
