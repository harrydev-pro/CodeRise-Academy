export function readStore(key, fallback = null) {
  try {
    const value = localStorage.getItem(key);

    if (value === null) {
      return fallback;
    }

    return JSON.parse(value);
  } catch (error) {
    console.error(
      `Failed to read storage key "${key}"`,
      error
    );

    return fallback;
  }
}

export function writeStore(key, value) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify(value)
    );

    return true;
  } catch (error) {
    console.error(
      `Failed to save storage key "${key}"`,
      error
    );

    return false;
  }
}

export function removeStore(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(
      `Failed to remove storage key "${key}"`,
      error
    );

    return false;
  }
}