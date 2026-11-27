// Formatting helpers shared by the Premium screens (S26–S28).

const usdFormat = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const usdWholeFormat = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dateFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" });

// Always two decimals: "$99.00", "$9.99".
export const formatUsd = (value) => usdFormat.format(Number(value) || 0);

// Drops ".00" on whole amounts, as the plan cards do: "$99", "$9.99".
export const formatPrice = (value) => (Number.isInteger(Number(value)) ? usdWholeFormat.format(Number(value)) : usdFormat.format(Number(value) || 0));

export const formatDate = (iso) => (iso ? dateFormat.format(new Date(iso)) : "—");

export const cycleWord = (cycle) => (cycle === "yearly" ? "year" : "month");

export function yearlySavingPercent(plan) {
  if (!plan?.monthlyUsd || !plan?.yearlyUsd) return 0;
  return Math.round((1 - plan.yearlyUsd / (plan.monthlyUsd * 12)) * 100);
}

export const yearlySavingUsd = (plan) => Math.round((plan.monthlyUsd * 12 - plan.yearlyUsd) * 100) / 100;

export const planDisplayName = (plan, name) => (plan === "free" ? "Free" : `CodeRise ${name ?? (plan === "plus" ? "Premium Plus" : "Premium")}`);
