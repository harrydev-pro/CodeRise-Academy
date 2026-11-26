import { useState } from "react";
import { CreditCard } from "lucide-react";

import Button from "../../components/common/Button";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { canPayApplication, getApplicationPayment } from "../../utils/applicationPayment";
import { startApplicationPayment } from "./applicationService";

// Shows the student where their program payment stands and, once the application
// is approved, a button that opens Paystack checkout.
export default function ApplicationPaymentCallout({ application, compact = false }) {
  const [starting, setStarting] = useState(false);
  const [message, setMessage] = useState("");
  const payment = getApplicationPayment(application);

  async function pay() {
    setStarting(true);
    setMessage("");
    try {
      const result = await startApplicationPayment(application.id);
      if (!result?.authorizationUrl) throw new Error("We couldn't open secure checkout. Please try again.");
      window.location.assign(result.authorizationUrl);
    } catch (error) {
      setMessage(error.message || "We couldn't open secure checkout. Please try again.");
      setStarting(false);
    }
  }

  if (canPayApplication(application)) {
    const retry = payment.status === "pending" || payment.status === "failed";
    return (
      <div className="application-payment-callout">
        <p>
          <strong>{retry ? "Finish your payment" : "Your application was approved"}</strong>
          {compact
            ? `Pay ${formatCurrency(payment.amount, payment.currency)} to secure your place.`
            : `Pay the program fee of ${formatCurrency(payment.amount, payment.currency)} to secure your place.${payment.status === "failed" ? " Your last attempt didn't go through." : ""}`}
        </p>
        <Button size={compact ? "sm" : "md"} loading={starting} onClick={pay}>
          <CreditCard size={17} aria-hidden="true" /> {starting ? "Opening checkout…" : retry ? "Try payment again" : "Pay now"}
        </Button>
        {message && <p className="application-payment-message" role="alert">{message}</p>}
      </div>
    );
  }

  if (compact) return null;

  if (payment.status === "successful") {
    return (
      <p className="application-feedback">
        <strong>Payment received:</strong> {formatCurrency(payment.amount, payment.currency)}
        {payment.paidAt ? ` on ${formatDate(payment.paidAt)}` : ""}{payment.reference ? ` · ref ${payment.reference}` : ""}
      </p>
    );
  }
  if (payment.status === "waived") {
    return <p className="application-feedback"><strong>No payment needed:</strong> the academy has waived the fee for this program.</p>;
  }
  if (["Pending", "Under Review", "Waitlisted"].includes(application.status) && payment.amount > 0) {
    return <p className="muted-text">You will be able to pay here once the academy approves your application.</p>;
  }
  return null;
}
