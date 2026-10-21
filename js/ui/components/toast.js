// A short message that appears, then fades out ("Copied 3.106855961 mi").
// The element has role="status" (in index.html), so screen readers read it.

export function createToast(el, { duration = 2500 } = {}) {
  let hideTimer;
  let clearTimer;

  return {
    show(message) {
      clearTimeout(hideTimer);
      clearTimeout(clearTimer);
      el.textContent = message;
      el.classList.add('is-visible');
      hideTimer = setTimeout(() => {
        el.classList.remove('is-visible');
        // Empty it after the fade, so a screen reader browsing the page
        // later doesn't find a stale "Copied" message.
        clearTimer = setTimeout(() => { el.textContent = ''; }, 200);
      }, duration);
    },
  };
}
