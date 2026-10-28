export function generateId(prefix = 'item') {
  const random = Math.random().toString(16).slice(2, 10);
  return `${prefix}-${Date.now()}-${random}`;
}
