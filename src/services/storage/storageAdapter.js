const store = new Map();

export function readStore(key, fallback = null) {
  if (!store.has(key)) {
    return fallback;
  }

  const value = store.get(key);
  return typeof value === 'undefined' ? fallback : value;
}

export function writeStore(key, value) {
  store.set(key, value);
  return true;
}

export function clearStore(key) {
  store.delete(key);
  return true;
}

export function resetStore() {
  store.clear();
  return true;
}
