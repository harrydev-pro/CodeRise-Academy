import {
  readStore,
  writeStore,
  removeStore,
} from "./storageAdapter";

export const localStorageAdapter = {
  get(key, fallback = null) {
    return readStore(key, fallback);
  },

  set(key, value) {
    return writeStore(key, value);
  },

  remove(key) {
    return removeStore(key);
  },
};