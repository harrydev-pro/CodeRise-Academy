import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, CircleAlert, CreditCard } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { api } from "../../services/api/api";

// Paystack sends students here after checkout, for both video courses and
// approved program applications. The backend's verify response says which.
export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref") || "";
  const [state, setState] = useState({ loading: Boolean(reference), status: "", courseId: "", applicationId: "", programTitle: "", error: "" });
  const hintedProgram = searchParams.get("type") === "application";

  const verify = useCallback(async () => {
    if (!reference) return;
    setState((previous) => ({ ...previous, loading: true, error: "" }));
    try {
      const result = await api.get(`/payments/paystack/verify?reference=${encodeURIComponent(reference)}`);
      const payment = result.payment || {};
      setState({
        loading: false,
        status: payment.status,
        courseId: payment.courseId || "",
        applicationId: payment.applicationId || (payment.type === "application" ? payment.itemId || "" : ""),
        programTitle: payment.programTitle || "",
        error: "",
      });
    } catch (error) {
      setState((previous) => ({ ...previous, loading: false, error: error.message || "We couldn't verify this payment." }));
    }
  }, [reference]);

  useEffect(() => { verify(); }, [verify]);

  if (state.loading) return <div className="page-container"><Loader label="Confirming your payment…" /></div>;

  const isProgram = Boolean(state.applicationId) || hintedProgram;
  const backLink = isProgram
    ? { to: "/my-applications", label: "My applications" }
    : { to: "/my-video-courses", label: "My courses" };

  return (
    <div className="page-container mx-auto max-w-2xl py-12">
      <section className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        {state.status === "successful" ? (
          <>
            <CheckCircle2 className="mx-auto text-green-600" size={48} aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-semibold">Payment confirmed</h1>
            {isProgram ? (
              <>
                <p className="mt-2 text-gray-600">
                  Thank you. Your program fee{state.programTitle ? ` for ${state.programTitle}` : ""} is paid and your place is secured.
                  The academy team will contact you with your start details.
                </p>
                <Link className="btn btn-primary mt-6 inline-flex" to="/my-applications">View my applications</Link>
              </>
            ) : (
              <>
                <p className="mt-2 text-gray-600">Your payment is confirmed. Sign in to access your course.</p>
                <Link className="btn btn-primary mt-6 inline-flex" to={state.courseId ? `/video-courses/${encodeURIComponent(state.courseId)}` : "/video-courses"}>Go to course</Link>
              </>
            )}
          </>
        ) : state.error ? (
          <>
            <CircleAlert className="mx-auto text-red-600" size={48} aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-semibold">We couldn't confirm payment</h1>
            <p className="mt-2 text-gray-600" role="alert">{state.error}</p>
            {reference && <Button className="mt-6" onClick={verify}>Check payment again</Button>}
            <p className="mt-4"><Link className="font-semibold text-brand-700 underline" to={backLink.to}>{backLink.label}</Link></p>
          </>
        ) : state.status === "pending" ? (
          <>
            <CreditCard className="mx-auto text-brand-600" size={48} aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-semibold">Payment is still processing</h1>
            <p className="mt-2 text-gray-600">
              {isProgram
                ? "Your application will show as paid once Paystack confirms the payment."
                : "Your course access will be available after Paystack confirms payment."}
            </p>
            <Button className="mt-6" onClick={verify}>Check payment again</Button>
          </>
        ) : (
          <>
            <CircleAlert className="mx-auto text-amber-600" size={48} aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-semibold">Payment wasn't completed</h1>
            {isProgram ? (
              <>
                <p className="mt-2 text-gray-600">The payment didn't go through. You can try again from My Applications.</p>
                <Link className="btn btn-primary mt-6 inline-flex" to="/my-applications">Back to my applications</Link>
              </>
            ) : (
              <>
                <p className="mt-2 text-gray-600">You can return to the course and try checkout again.</p>
                <Link className="btn btn-primary mt-6 inline-flex" to="/video-courses">Browse video courses</Link>
              </>
            )}
          </>
        )}
      </section>
    </div>
  );
}
