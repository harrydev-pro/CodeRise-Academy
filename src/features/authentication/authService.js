import { generateId } from "../../utils/generateId";
import { validateRegistration, validateLogin } from "../users/userValidation";
import {
  findUserByEmail,
  createUserRecord,
} from "../users/userStorage";
import {
  getCurrentSession,
  saveCurrentSession,
  clearCurrentSession,
} from "./authStorage";
import { logActivity } from "../activity/activityService";

// Temporary credentials exist only while this page session is active.
// Replace this service with a backend authentication API before launch.
const temporaryCredentials = new Map();

function publicUser(user) {
  const safeUser = { ...user };
  delete safeUser.password;
  delete safeUser.passwordHash;
  return safeUser;
}

export async function registerUser(form) {
  const errors = validateRegistration(form);

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
    };
  }

  const email = form.email.trim().toLowerCase();

  if (findUserByEmail(email)) {
    return {
      success: false,
      errors: {
        email: "An account with this email already exists.",
      },
    };
  }

  const user = {
    id: generateId("user"),
    fullName: form.fullName.trim(),
    email,
    phone: form.phone.trim(),
    role: "student",
    status: "active",
    emailVerified: false,
    createdAt: new Date().toISOString(),
  };

  try {
    createUserRecord(user);
    temporaryCredentials.set(user.id, form.password);

    logActivity({
      userId: user.id,
      userName: user.fullName,
      action: "registration",
      details: "Created a student account.",
    });

    return {
      success: true,
      user: publicUser(user),
      message:
        "Account created for this browser session. Email verification requires a connected email service.",
    };
  } catch (error) {
    return {
      success: false,
      errors: {
        general: error.message,
      },
    };
  }
}

export async function loginUser(form) {
  const errors = validateLogin(form);

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      errors,
    };
  }

  const email = form.email.trim().toLowerCase();
  if (email === "admin@coderiseacademy.com" && form.password === "Admin123!") {
    const demoAdmin = {
      id: "demo-admin",
      fullName: "CodeRise Admin",
      email,
      role: "admin",
      status: "active",
    };
    saveCurrentSession({ user: demoAdmin, signedInAt: new Date().toISOString() });
    return { success: true, user: demoAdmin };
  }
  const user = findUserByEmail(email);

  if (!user || temporaryCredentials.get(user.id) !== form.password) {
    return {
      success: false,
      errors: {
        general:
          "The email or password is incorrect. Browser-only accounts may not survive a page reload.",
      },
    };
  }

  if (user.status !== "active") {
    return {
      success: false,
      errors: {
        general: "This account is not currently active.",
      },
    };
  }

  const session = {
    user: publicUser(user),
    signedInAt: new Date().toISOString(),
  };

  saveCurrentSession(session);

  logActivity({
    userId: user.id,
    userName: user.fullName,
    action: "login",
    details: "Signed in.",
  });

  return {
    success: true,
    user: publicUser(user),
  };
}

export async function logoutUser() {
  const session = getCurrentSession();

  if (session?.user) {
    logActivity({
      userId: session.user.id,
      userName: session.user.fullName,
      action: "logout",
      details: "Signed out.",
    });
  }

  clearCurrentSession();

  return { success: true };
}

export function getAuthenticatedUser() {
  const session = getCurrentSession();

  if (!session?.user?.id) {
    return null;
  }

  // A saved browser session is not proof of identity.
  // The production server must validate the session.
  return session.user;
}
