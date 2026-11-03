export function validateEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
}

export function validatePhone(value) {
  const input = String(value || '').trim();
  if (input.length < 10 || input.length > 24) return false;

  const compact = input.replace(/[\s().-]/g, '');
  const withoutCountryCode = compact.startsWith('+234')
    ? compact.slice(4)
    : compact.startsWith('234') && compact.length === 13
      ? compact.slice(3)
      : compact;
  const nationalNumber = withoutCountryCode.length === 11 && withoutCountryCode.startsWith('0')
    ? withoutCountryCode.slice(1)
    : withoutCountryCode;

  return /^\d{10}$/.test(nationalNumber);
}
