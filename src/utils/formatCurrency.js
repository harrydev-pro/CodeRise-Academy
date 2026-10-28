export function formatCurrency(amount, currency = 'NGN') {
  const numericAmount = Number(amount ?? 0);

  if (!Number.isFinite(numericAmount)) {
    return `${currency} 0`;
  }

  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(numericAmount);
}
