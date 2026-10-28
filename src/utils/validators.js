export function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

export function validatePhone(value) {
  const normalized = String(value || '').trim();
  return /^[+]?[(]?[0-9]{1,4}[)]?[-\s0-9]{7,15}$/.test(normalized);
}
