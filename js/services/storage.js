// A safe wrapper around localStorage.
//
// localStorage can fail in ordinary situations: some private-browsing modes
// block it, a full disk throws "QuotaExceededError", the user can disable
// site data, and another script (or an old version of this app) can leave
// text that isn't valid JSON. None of that should break the converter, so
// every call is wrapped and failures return a fallback instead of throwing.
//
// The backend is passed in so tests can use a fake one in Node.

export function createStorage(getBackend = () => globalThis.localStorage) {
  let backend = null;
  try {
    const candidate = getBackend();
    // Some browsers expose localStorage but throw on write, so test a write.
    const probe = 'uuc:probe';
    candidate.setItem(probe, '1');
    candidate.removeItem(probe);
    backend = candidate;
  } catch {
    backend = null;
  }

  return {
    // false means history works for this visit but won't be remembered.
    available: backend !== null,

    read(key, fallback) {
      if (!backend) return fallback;
      try {
        const raw = backend.getItem(key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch {
        return fallback; // corrupted JSON or a read error
      }
    },

    // Returns true if saved, false if not (full, blocked, or unavailable).
    write(key, value) {
      if (!backend) return false;
      try {
        backend.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },
  };
}
