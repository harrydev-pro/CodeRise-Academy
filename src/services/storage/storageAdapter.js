const store = new Map();

function getBrowserStorage() {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function readStore(key, fallback = null) {
  if (store.has(key)) return store.get(key);
  const storage = getBrowserStorage();
  if (!storage) return fallback;
  try {
    const serialized = storage.getItem(key);
    if (serialized === null) return fallback;
    const value = JSON.parse(serialized);
    store.set(key, value);
    return value;
  } catch {
    return fallback;
  }
}

export function writeStore(key, value) {
  store.set(key, value);
  const storage = getBrowserStorage();
  if (storage) {
    try {
      storage.setItem(key, JSON.stringify(value));
    } catch {
      // Keep the in-memory copy available when browser storage is full or blocked.
    }
  }
  return true;
}

export function clearStore(key) {
  store.delete(key);
  const storage = getBrowserStorage();
  try {
    storage?.removeItem(key);
  } catch {
    // The in-memory value is already cleared.
  }
  return true;
}

export function resetStore() {
  const storage = getBrowserStorage();
  if (storage) {
    try {
      const keys = new Set(store.keys());
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key?.startsWith("coderise_")) keys.add(key);
      }
      keys.forEach((key) => storage.removeItem(key));
    } catch {
      // Continue resetting the in-memory store if browser storage is unavailable.
    }
  }
  store.clear();
  return true;
}
