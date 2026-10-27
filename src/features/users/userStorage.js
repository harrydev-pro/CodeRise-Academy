import {
  getStoredUsers,
  saveStoredUsers,
} from "../authentication/authStorage";

export function findUserByEmail(email) {
  const normalizedEmail = email.trim().toLowerCase();

  return getStoredUsers().find(
    (user) => user.email === normalizedEmail
  ) ?? null;
}

export function findUserById(userId) {
  return getStoredUsers().find(
    (user) => user.id === userId
  ) ?? null;
}

export function createUserRecord(user) {
  const users = getStoredUsers();

  const updatedUsers = [...users, user];

  const saved = saveStoredUsers(updatedUsers);

  if (!saved) {
    throw new Error(
      "Unable to save your account in this browser."
    );
  }

  return user;
}

export function updateUserRecord(userId, updates) {
  const users = getStoredUsers();

  const updatedUsers = users.map((user) =>
    user.id === userId
      ? { ...user, ...updates }
      : user
  );

  const saved = saveStoredUsers(updatedUsers);

  if (!saved) {
    throw new Error("Unable to update the account.");
  }

  return updatedUsers.find(
    (user) => user.id === userId
  );
}

export function getAllUsers() {
  return getStoredUsers();
}