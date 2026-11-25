import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, CircleAlert, CreditCard } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { api } from "../../services/api/api";

export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref") || "";
  const [state, setState] = useState({ loading: Boolean(reference), status: "", courseId: "", error: "" });

  const verify = useCallback(async () => {
    if (!reference) return;
    setState((previous) => ({ ...previous, loading: true, error: "" }));
    try {
      const result = await api.get(`/payments/paystack/verify?reference=${encodeURIComponent(reference)}`);
      setState({ loading: false, status: result.payment.status, courseId: result.payment.courseId || "", error: "" });
    } catch (error) {
      setState((previous) => ({ ...previous, loading: false, error: error.message || "We couldn't verify this payment." }));
    }
  }, [reference]);

  useEffect(() => { verify(); }, [verify]);

  if (state.loading) return <div className="page-container"><Loader label="Confirming your payment…" /></div>;

  return (
    <div className="page-container mx-auto max-w-2xl py-12">
      <section className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        {state.status === "successful" ? (
          <>
            <CheckCircle2 className="mx-auto text-green-600" size={48} aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-semibold">Payment confirmed</h1>
            <p className="mt-2 text-gray-600">Your payment is confirmed. Sign in to access your course.</p>
            <Link className="btn btn-primary mt-6 inline-flex" to={state.courseId ? `/video-courses/${encodeURIComponent(state.courseId)}` : "/video-courses"}>Go to course</Link>
          </>
        ) : state.error ? (
          <>
            <CircleAlert className="mx-auto text-red-600" size={48} aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-semibold">We couldn't confirm payment</h1>
            <p className="mt-2 text-gray-600" role="alert">{state.error}</p>
            {reference && <Button className="mt-6" onClick={verify}>Check payment again</Button>}
            <p className="mt-4"><Link className="font-semibold text-brand-700 underline" to="/my-video-courses">My courses</Link></p>
          </>
        ) : state.status === "pending" ? (
          <>
            <CreditCard className="mx-auto text-brand-600" size={48} aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-semibold">Payment is still processing</h1>
            <p className="mt-2 text-gray-600">Your course access will be available after Paystack confirms payment.</p>
            <Button className="mt-6" onClick={verify}>Check payment again</Button>
          </>
        ) : (
          <>
            <CircleAlert className="mx-auto text-amber-600" size={48} aria-hidden="true" />
            <h1 className="mt-4 text-2xl font-semibold">Payment wasn't completed</h1>
            <p className="mt-2 text-gray-600">You can return to the course and try checkout again.</p>
            <Link className="btn btn-primary mt-6 inline-flex" to="/video-courses">Browse video courses</Link>
          </>
        )}
      </section>
    </div>
  );
}
