import { STORAGE_KEYS } from "../../services/storage/storageKeys";
import {
  readStore,
  writeStore,
  removeStore,
} from "../../services/storage/storageAdapter";

export function getStoredUsers() {
  return readStore(STORAGE_KEYS.users, []);
}

export function saveStoredUsers(users) {
  return writeStore(STORAGE_KEYS.users, users);
}

export function getCurrentSession() {
  return readStore(STORAGE_KEYS.session, null);
}

export function saveCurrentSession(session) {
  return writeStore(STORAGE_KEYS.session, session);
}

export function clearCurrentSession() {
  return removeStore(STORAGE_KEYS.session);
}