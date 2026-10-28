import { readStore, writeStore } from "../../services/storage/storageAdapter";

const USERS_KEY = "coderise-users";

function getStoredUsers() {
  return readStore(USERS_KEY, []);
}

function saveStoredUsers(users) {
  return writeStore(USERS_KEY, users);
}

export function findUserByEmail(email) {
  const normalizedEmail = String(email ?? "").trim().toLowerCase();

  return getStoredUsers().find(
    (user) => String(user.email ?? "").toLowerCase() === normalizedEmail
  ) ?? null;
}

export function findUserById(userId) {
  return getStoredUsers().find((user) => user.id === userId) ?? null;
}

export function createUserRecord(user) {
  const users = getStoredUsers();
  const updatedUsers = [...users, user];
  const saved = saveStoredUsers(updatedUsers);

  if (!saved) {
    throw new Error("Unable to save your account in this browser.");
  }

  return user;
}

export function updateUserRecord(userId, updates) {
  const users = getStoredUsers();
  const updatedUsers = users.map((user) =>
    user.id === userId ? { ...user, ...updates } : user
  );
  const saved = saveStoredUsers(updatedUsers);

  if (!saved) {
    throw new Error("Unable to update the account.");
  }

  return updatedUsers.find((user) => user.id === userId) ?? null;
}

export function getAllUsers() {
  return getStoredUsers();
}

export function updateUser(userId, updates) {
  return updateUserRecord(userId, updates);
}
