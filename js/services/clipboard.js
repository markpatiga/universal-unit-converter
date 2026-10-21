// Copy text to the clipboard. Returns true if it worked, false if not.
//
// The modern Clipboard API needs a secure page (https or localhost) and can
// be blocked by the browser. When it's missing or fails, fall back to the
// older execCommand('copy') trick. If both fail, the caller shows a message.

export async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Permission denied or not available: try the fallback below.
  }
  return legacyCopy(text);
}

function legacyCopy(text) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}
