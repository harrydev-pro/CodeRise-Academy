import { getProgramPrice } from "./programPrice";

// Payment for a program application. Students pay only after an admin approves
// their application. The backend sends either `application.payment` (an object)
// or a flat `application.paymentStatus`; both are read here so pages stay simple.
//
// API values -> labels shown in the app.
const PAYMENT_LABELS = {
  unpaid: "Unpaid",
  pending: "Payment Pending",
  successful: "Paid",
  paid: "Paid",
  failed: "Payment Failed",
  abandoned: "Payment Failed",
  waived: "Payment Waived",
};

// Values an admin can record by hand (bank transfer, cash, scholarship, correction).
export const ADMIN_PAYMENT_STATUSES = [
  { value: "unpaid", label: "Unpaid" },
  { value: "successful", label: "Paid (recorded manually)" },
  { value: "waived", label: "Waived (no payment needed)" },
];

export const PAYMENT_FILTERS = [
  { value: "", label: "All" },
  { value: "unpaid", label: "Unpaid" },
  { value: "pending", label: "Pending" },
  { value: "successful", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "waived", label: "Waived" },
];

export function normalizePaymentStatus(status) {
  const value = String(status || "unpaid").toLowerCase();
  if (value === "paid") return "successful";
  if (value === "abandoned") return "failed";
  return PAYMENT_LABELS[value] ? value : "unpaid";
}

export function paymentLabel(status) {
  return PAYMENT_LABELS[normalizePaymentStatus(status)];
}

export function getApplicationPayment(application) {
  const payment = application?.payment || {};
  const status = normalizePaymentStatus(payment.status ?? application?.paymentStatus);
  const amount = Number(payment.amount ?? application?.amountDue ?? getProgramPrice(application)) || 0;
  return {
    status,
    label: paymentLabel(status),
    amount,
    currency: payment.currency || "NGN",
    reference: payment.reference || application?.paymentReference || "",
    method: payment.method || "",
    paidAt: payment.paidAt || application?.paidAt || "",
    settled: status === "successful" || status === "waived" || amount <= 0,
  };
}

// A student can pay once the application is approved, the program has a price,
// and nothing has been paid or waived yet.
export function canPayApplication(application) {
  const payment = getApplicationPayment(application);
  return application?.status === "Approved" && !payment.settled;
}
