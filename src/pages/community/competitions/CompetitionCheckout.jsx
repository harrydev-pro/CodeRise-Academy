import { useCallback, useId, useState } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, CircleAlert, CircleCheck, ExternalLink, LoaderCircle, Lock, TriangleAlert } from "lucide-react";

import CategoryIcon from "../../../features/community/competitions/CategoryIcon";
import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import Toast from "../../../components/feedback/Toast";
import CompetitionSteps from "../../../features/community/competitions/CompetitionSteps";
import { getCompetition, startCompetitionPayment } from "../../../features/community/competitions/competitionService";
import { competitionPath, formatDate, formatUsd, isFull, isRegistrationOpen } from "../../../features/community/competitions/competitionFormat";
import { usePaymentStatus } from "../../../features/community/competitions/usePaymentStatus";
import { useCommunityList } from "../../../features/community/listHooks";

// S18 Competition Payment: /community/competitions/:id/checkout (paid competitions only).
//
// Deviation from the design: the design shows card number / expiry / CVC fields on this page.
// CodeRise never collects card details itself. "Pay" asks the backend for a payment session and
// sends the student to the provider's hosted checkout; the provider returns them here with
// ?reference=…, and this page waits for the backend (which hears from the provider's webhook)
// to confirm. The registration only exists once the backend has confirmed the payment.
export default function CompetitionCheckout() {
  const { id } = useParams();
  const { data, error, loading, reload } = useCommunityList(getCompetition, { id });

  if (loading) return <Loader label="Loading checkout…" />;
  if (error) {
    return (
      <div className="cmc-page">
        <Link to={competitionPath(id)} className="cmc-back"><ArrowLeft size={17} aria-hidden="true" /> Back to competition</Link>
        <ErrorMessage message={error} onRetry={reload} />
      </div>
    );
  }
  return <Checkout key={data.competition.id} competition={data.competition} sample={Boolean(data.isSample)} />;
}

function Checkout({ competition, sample }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const reference = searchParams.get("reference") ?? "";
  const payment = usePaymentStatus(competition.id, reference);
  const path = competitionPath(competition.id);
  const free = !competition.entryFeeUsd;

  const [starting, setStarting] = useState(false);
  const [outcome, setOutcome] = useState("successful");
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);

  // Arriving back from the provider (a reference in the URL) means the rules were accepted
  // when that payment session was created; the backend records and checks this either way.
  const accepted = Boolean(location.state?.acceptedRules) || Boolean(reference);
  const confirmations = location.state?.confirmations ?? Array.from({ length: (competition.checklist?.length ?? 0) + 1 }, (_, index) => index);

  async function pay() {
    setStarting(true);
    try {
      const result = await startCompetitionPayment(competition.id, { confirmations, outcome }, { sample });
      if (result?.authorizationUrl) {
        window.location.assign(result.authorizationUrl);
        return;
      }
      if (result?.isSample && result.reference) {
        // Sample mode: no provider page. Pretend the provider sent the student back.
        setSearchParams({ reference: result.reference }, { state: { acceptedRules: true, confirmations } });
        setStarting(false);
        return;
      }
      throw new Error("We couldn't open secure checkout. Please try again.");
    } catch (payError) {
      setToast({ type: "error", message: payError.message || "We couldn't open secure checkout. Please try again." });
      setStarting(false);
    }
  }

  // ---- Paid and confirmed (just now, or earlier) ----
  if (payment.status === "successful" && reference) {
    const amount = payment.payment?.amountUsd ?? competition.entryFeeUsd;
    return (
      <Shell competition={competition} sample={sample} step={3} complete>
        <section className="community-card cmc-result-card is-success" aria-labelledby="cmc-paid" role="status">
          <span className="cmc-result-icon"><CircleCheck size={30} aria-hidden="true" /></span>
          <h2 id="cmc-paid">Registration confirmed</h2>
          <p>Your {formatUsd(amount)} payment was verified. You now have access to the competition brief, resources and submission page.</p>
          {payment.payment?.receiptNumber && <span className="community-tag tag-blue">Receipt {payment.payment.receiptNumber}</span>}
          <div className="cmc-result-actions">
            <Link to={path} className="btn btn-primary">Open competition materials</Link>
            <Link to="/community/activities?tab=competitions" className="btn btn-outline">My registrations</Link>
          </div>
        </section>
      </Shell>
    );
  }

  if (!reference && competition.viewerRegistered) {
    return (
      <Shell competition={competition} sample={sample} step={3} complete>
        <section className="community-card cmc-result-card is-success" aria-labelledby="cmc-already">
          <span className="cmc-result-icon"><CircleCheck size={30} aria-hidden="true" /></span>
          <h2 id="cmc-already">You're already registered</h2>
          <p>Your place in {competition.title} is confirmed. There is nothing more to pay.</p>
          <div className="cmc-result-actions">
            <Link to={path} className="btn btn-primary">Open competition materials</Link>
          </div>
        </section>
      </Shell>
    );
  }

  if (!reference && (free || competition.status === "results" || !isRegistrationOpen(competition) || isFull(competition))) {
    const message = free ? "This competition is free to enter, so there is nothing to pay."
      : competition.status === "results" ? "Results for this competition are already published."
        : !isRegistrationOpen(competition) ? "Registration has closed for this competition." : "This competition is full.";
    return (
      <Shell competition={competition} sample={sample} step={2}>
        <section className="community-card community-empty">
          <span className="community-icon tone-amber"><CircleAlert size={22} aria-hidden="true" /></span>
          <h2>No payment needed</h2>
          <p className="muted-text">{message}</p>
          <Link to={free ? `${path}/register` : path} className="btn btn-outline">{free ? "Go to registration" : "Back to competition"}</Link>
        </section>
      </Shell>
    );
  }

  // ---- Waiting for the backend to confirm ----
  if (reference && (payment.status === "pending" || payment.status === "slow" || payment.status === "error")) {
    return (
      <Shell competition={competition} sample={sample} step={2}>
        <section className="community-card cmc-result-card" aria-labelledby="cmc-processing" aria-live="polite">
          {payment.status === "pending" ? (
            <>
              <span className="cmc-result-icon is-pending"><LoaderCircle size={30} className="animate-spin" aria-hidden="true" /></span>
              <h2 id="cmc-processing">Confirming your payment…</h2>
              <p>This usually takes a few seconds. Please keep this page open.</p>
            </>
          ) : (
            <>
              <span className="cmc-result-icon is-warning"><TriangleAlert size={28} aria-hidden="true" /></span>
              <h2 id="cmc-processing">{payment.status === "slow" ? "Still confirming your payment" : "We couldn't check your payment"}</h2>
              <p>
                {payment.status === "slow"
                  ? "Your payment provider hasn't confirmed yet. If you were charged, your place will be confirmed automatically and we'll email you."
                  : payment.error}
                {" "}Reference: <strong>{reference}</strong>
              </p>
              <div className="cmc-result-actions">
                <button type="button" className="btn btn-primary" onClick={payment.recheck}>Check again</button>
                <Link to="/contact" className="btn btn-outline">Contact support</Link>
              </div>
            </>
          )}
        </section>
      </Shell>
    );
  }

  if (reference && payment.status === "refunded") {
    return (
      <Shell competition={competition} sample={sample} step={2}>
        <section className="community-card community-empty">
          <span className="community-icon tone-blue"><CircleAlert size={22} aria-hidden="true" /></span>
          <h2>This entry fee was refunded</h2>
          <p className="muted-text">Your payment was refunded, so you're no longer registered for this competition.</p>
          <Link to={path} className="btn btn-primary">Back to competition</Link>
        </section>
      </Shell>
    );
  }

  // ---- Pay (first time, or again after a declined payment) ----
  const declined = reference && payment.status === "failed";

  if (!accepted && !declined) {
    return (
      <Shell competition={competition} sample={sample} step={2}>
        <section className="community-card community-empty">
          <span className="community-icon tone-blue"><CircleAlert size={22} aria-hidden="true" /></span>
          <h2>Review the requirements first</h2>
          <p className="muted-text">Tick the requirements and accept the rules before you pay the entry fee.</p>
          <Link to={`${path}/register`} className="btn btn-primary">Go to registration</Link>
        </section>
      </Shell>
    );
  }

  return (
    <Shell competition={competition} sample={sample} step={2}>
      {declined && (
        <div className="cmc-alert" role="alert">
          <TriangleAlert size={20} aria-hidden="true" />
          <div className="min-w-0">
            <strong>Payment declined</strong>
            <p>{payment.payment?.failureReason || "Your card was declined. You have not been charged and your registration is not confirmed yet."}</p>
            <div className="cmc-alert-actions">
              <button type="button" className="btn community-btn-danger btn-sm" onClick={pay} disabled={starting}>
                {starting ? "Opening checkout…" : "Try another card"}
              </button>
              <Link to="/contact" className="cmc-alert-link">Contact support</Link>
            </div>
          </div>
        </div>
      )}

      <div className="cmc-layout">
        <div className="cmc-main">
          <section className="community-card cmc-section" aria-labelledby="cmc-method">
            <div className="cmc-section-head">
              <h2 id="cmc-method">Card details</h2>
              <ul className="cmc-brands" aria-label="Accepted cards">
                <li>VISA</li><li>Mastercard</li><li>Verve</li>
              </ul>
            </div>
            <p className="cmc-section-intro">
              You'll enter your card on our payment provider's secure page, not on CodeRise.
              CodeRise never sees or stores your card number.
            </p>
            <ol className="cmc-handoff">
              <li><span aria-hidden="true">1</span><div><strong>Select Pay {formatUsd(competition.entryFeeUsd + (competition.processingFeeUsd ?? 0))}</strong><p>We open a secure checkout for this entry fee.</p></div></li>
              <li><span aria-hidden="true">2</span><div><strong>Pay on the provider's page</strong><p>Enter your card there. Your bank may ask you to approve the payment.</p></div></li>
              <li><span aria-hidden="true">3</span><div><strong>Come back here</strong><p>We confirm the payment with the provider, then confirm your place.</p></div></li>
            </ol>

            {sample && (
              <fieldset className="cmc-simulate">
                <legend>Sample mode: choose the simulated result</legend>
                <SimulateOption value="successful" label="Payment succeeds" outcome={outcome} onChange={setOutcome} />
                <SimulateOption value="failed" label="Card declined" outcome={outcome} onChange={setOutcome} />
              </fieldset>
            )}

            <p className="cmc-secure-note"><Lock size={16} aria-hidden="true" /> Payments are processed securely by our payment provider. Your registration is confirmed once the payment is verified.</p>
          </section>
        </div>

        <aside className="cmc-side" aria-label="Order summary">
          <section className="community-card" aria-labelledby="cmc-order">
            <h2 className="community-side-title" id="cmc-order">Order summary</h2>
            <OrderSummary competition={competition} />
            <button type="button" className="btn btn-primary btn-full cmc-submit" onClick={pay} disabled={starting}>
              {starting ? <><LoaderCircle size={17} className="animate-spin" aria-hidden="true" /> Opening checkout…</> : <><Lock size={17} aria-hidden="true" /> Pay {formatUsd(competition.entryFeeUsd + (competition.processingFeeUsd ?? 0))}</>}
            </button>
            <button type="button" className="btn btn-outline btn-full cmc-back-button" onClick={() => navigate(`${path}/register`)}>Back</button>
            <p className="cmc-small-note">
              {sample ? "Sample mode: no money moves and no provider page opens. " : <>You'll be taken to the provider's secure page <ExternalLink size={12} aria-label="(opens the payment provider)" />. </>}
              Your bank may show the charge in your local currency. Entry fees are non-refundable unless CodeRise cancels the competition.
            </p>
          </section>
        </aside>
      </div>

      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </Shell>
  );
}

function Shell({ competition, sample, step, complete = false, children }) {
  return (
    <div className="cmc-page">
      <Link to={`${competitionPath(competition.id)}/register`} className="cmc-back"><ArrowLeft size={17} aria-hidden="true" /> Back to review</Link>
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">COMPETITION REGISTRATION</span>
          <h1>Pay entry fee</h1>
          <p>{competition.title} · Your place is confirmed once we verify the payment.</p>
        </div>
      </header>
      {sample && (
        <p className="community-sample-notice" role="status">
          Showing sample data: the Community API is not available yet. Payments are simulated: no money moves and no card is charged. This notice only appears on the local dev server.
        </p>
      )}
      <CompetitionSteps current={step} complete={complete} />
      {children}
    </div>
  );
}

function OrderSummary({ competition }) {
  const fee = competition.processingFeeUsd ?? 0;
  return (
    <>
      <div className="cmc-mini">
        <span className="cmc-mini-icon"><CategoryIcon category={competition.category} size={20} /></span>
        <div className="min-w-0">
          <h3>{competition.title}</h3>
          <p>Competition entry · 1 place · Entry closes {formatDate(competition.registrationClosesAt)}</p>
        </div>
      </div>
      <dl className="cmc-facts">
        <div><dt>Entry fee</dt><dd>{formatUsd(competition.entryFeeUsd)}</dd></div>
        <div><dt>Processing fee</dt><dd>{formatUsd(fee)}</dd></div>
        <div className="cmc-total"><dt>Total</dt><dd>{formatUsd(competition.entryFeeUsd + fee)} USD</dd></div>
      </dl>
    </>
  );
}

function SimulateOption({ value, label, outcome, onChange }) {
  const id = useId();
  return (
    <label className="community-checkbox" htmlFor={id}>
      <input id={id} type="radio" name="cmc-simulate" value={value} checked={outcome === value} onChange={() => onChange(value)} />
      {label}
    </label>
  );
}
