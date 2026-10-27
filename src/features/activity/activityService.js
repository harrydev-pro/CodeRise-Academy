import { STORAGE_KEYS } from "../../services/storage/storageKeys";
import {
  readStore,
  writeStore,
} from "../../services/storage/storageAdapter";
import { generateId } from "../../utils/generateId";

export function getActivityLogs() {
  return readStore(STORAGE_KEYS.activityLogs, []);
}

export function logActivity({
  userId = null,
  userName = "Guest",
  action,
  details = "",
}) {
  const logs = getActivityLogs();

  const entry = {
    id: generateId("activity"),
    userId,
    userName,
    action,
    details,
    createdAt: new Date().toISOString(),
  };

  const updatedLogs = [entry, ...logs].slice(0, 1000);

  writeStore(STORAGE_KEYS.activityLogs, updatedLogs);

  return entry;
}

export function getUserActivity(userId) {
  return getActivityLogs().filter(
    (entry) => entry.userId === userId
  );
}