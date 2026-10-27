export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    String(email || "").trim()
  );
}

export function validatePhone(phone) {
  const normalized = String(phone || "").replace(/[\s()-]/g, "");

  return /^\+?\d{10,15}$/.test(normalized);
}

export function validatePassword(password) {
  return typeof password === "string" && password.length >= 8;
}

export function validateRequired(value) {
  return String(value ?? "").trim().length > 0;
}