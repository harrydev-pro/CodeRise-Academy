export function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

export function validatePhone(value) {
  return /^\d{10}$/.test(String(value || '').trim());
}
