import { useCallback, useEffect, useState } from "react";

import { getCompetitionPayment } from "./competitionService";

const POLL_EVERY_MS = 3000;
const MAX_CHECKS = 20; // about a minute

// Polls the backend for a payment's status after the provider sends the student back.
// The backend confirms the payment from the provider's webhook; the page only reads it.
// status: "pending" | "successful" | "failed" | "slow" (still pending after a minute) | "error".
export function usePaymentStatus(competitionId, reference) {
  const [state, setState] = useState({ key: "", status: "pending", payment: null, error: "" });
  const [attempt, setAttempt] = useState(0);
  const key = `${reference}:${attempt}`;

  useEffect(() => {
    if (!reference) return undefined;
    let active = true;
    let timer;
    let checks = 0;

    async function check() {
      checks += 1;
      try {
        const result = await getCompetitionPayment(competitionId, reference);
        if (!active) return;
        const payment = result?.payment ?? {};
        if (payment.status === "successful" || payment.status === "failed" || payment.status === "refunded") {
          setState({ key, status: payment.status, payment, error: "" });
        } else if (checks >= MAX_CHECKS) {
          setState({ key, status: "slow", payment, error: "" });
        } else {
          timer = window.setTimeout(check, POLL_EVERY_MS);
        }
      } catch (error) {
        if (active) setState({ key, status: "error", payment: null, error: error.message || "We couldn't check this payment." });
      }
    }

    check();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [competitionId, reference, key]);

  const recheck = useCallback(() => setAttempt((value) => value + 1), []);
  const current = state.key === key ? state : { status: "pending", payment: null, error: "" };
  return { ...current, recheck };
}
