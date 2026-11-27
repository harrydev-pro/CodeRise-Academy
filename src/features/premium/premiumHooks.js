import { useCallback, useEffect, useState } from "react";

import { getCheckoutStatus } from "./premiumService";

const POLL_EVERY_MS = 3000;
const MAX_CHECKS = 10;

// Checks a returned checkout session until the backend says it is "active" or "failed".
// The backend decides (after verifying the payment with the provider); this hook only reads it.
// While it is still "pending" after MAX_CHECKS, `gaveUp` is true and `recheck()` starts again.
export function useCheckoutStatus(reference) {
  const [state, setState] = useState({ key: null, result: null, error: "", gaveUp: false });
  const [revision, setRevision] = useState(0);
  const recheck = useCallback(() => setRevision((value) => value + 1), []);
  const key = reference ? `${reference}#${revision}` : null;

  useEffect(() => {
    if (!reference) return undefined;
    let active = true;
    let timer;
    let checks = 0;

    function check() {
      checks += 1;
      getCheckoutStatus({ reference })
        .then((result) => {
          if (!active) return;
          const pending = result.status === "pending";
          const gaveUp = pending && checks >= MAX_CHECKS;
          setState({ key, result, error: "", gaveUp });
          if (pending && !gaveUp) timer = window.setTimeout(check, POLL_EVERY_MS);
        })
        .catch((error) => {
          if (active) setState({ key, result: null, error: error.message || "We couldn't check your payment.", gaveUp: false });
        });
    }

    check();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [reference, key]);

  const settled = state.key === key;
  return {
    result: settled ? state.result : null,
    error: settled ? state.error : "",
    gaveUp: settled && state.gaveUp,
    recheck,
  };
}
