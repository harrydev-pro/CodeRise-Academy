import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, Check, CheckCircle2, ChevronRight, Crown, ExternalLink, Info, Lock, LoaderCircle, TriangleAlert } from "lucide-react";

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { useAuth } from "../../hooks/useAuth";
import { useCommunityList } from "../../features/community/listHooks";
import { getCheckoutQuote, normaliseCheckoutParams, planRank, startCheckout } from "../../features/premium/premiumService";
import { useCheckoutStatus } from "../../features/premium/premiumHooks";
import { formatDate, formatPrice, formatUsd } from "../../features/premium/premiumFormat";

const STEPS = ["Choose plan", "Payment", "Confirmation"];
const SUPPORT_EMAIL = "support@coderiseacademy.com";

// S27 Premium checkout (/premium/checkout?plan=premium|plus&cycle=monthly|yearly).
// Payment happens on the payment provider's hosted page: this screen never asks for card details.
// After paying, the provider sends the student back here with ?reference=…, and the confirmation
// step shows what the backend has verified (see premiumService.js).
export default function PremiumCheckout() {
  const [params] = useSearchParams();
  const { plan, cycle } = normaliseCheckoutParams(params);
  const reference = params.get("reference") || params.get("trxref") || "";

  return reference
    ? <CheckoutConfirmation plan={plan} cycle={cycle} reference={reference} />
    : <CheckoutPayment plan={plan} cycle={cycle} />;
}

function CheckoutHeader({ planName, step }) {
  return (
    <header className="cmpr-checkout-header">
      <Link to="/premium" className="cmpr-back-link"><ArrowLeft size={17} aria-hidden="true" /> Back to plans</Link>
      <span className="eyebrow cmpr-eyebrow">PREMIUM CHECKOUT</span>
      <h1>Upgrade to CodeRise {planName}</h1>
      <ol className="cmpr-steps" aria-label="Checkout steps">
        {STEPS.map((label, index) => {
          const number = index + 1;
          const state = number < step ? "is-done" : number === step ? "is-current" : "";
          return (
            <li key={label} className={state} aria-current={number === step ? "step" : undefined}>
              <span className="cmpr-step-number" aria-hidden="true">{number}</span>
              {label}
              {number < step && <span className="sr-only"> (done)</span>}
              {number < STEPS.length && <ChevronRight size={15} aria-hidden="true" className="cmpr-step-arrow" />}
            </li>
          );
        })}
      </ol>
    </header>
  );
}

function CheckoutPayment({ plan, cycle }) {
  const navigate = useNavigate();
  const [, setParams] = useSearchParams();
  const { user } = useAuth();
  const { data, error, loading, refreshing, reload } = useCommunityList(getCheckoutQuote, { plan, cycle });
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState("");

  if (loading) return <Loader label="Preparing checkout…" />;
  if (error && !data) return <ErrorMessage message={error} onRetry={reload} />;

  const { quote, viewer } = data;
  const email = viewer?.email || user?.email;
  const yearly = cycle === "yearly";
  const viewerPaid = viewer && viewer.plan !== "free";

  function chooseCycle(next) {
    setStartError("");
    setParams((current) => {
      const updated = new URLSearchParams(current);
      updated.set("plan", plan);
      updated.set("cycle", next);
      return updated;
    }, { replace: true });
  }

  async function pay() {
    setStarting(true);
    setStartError("");
    try {
      const returnPath = `/premium/checkout?plan=${plan}&cycle=${cycle}`;
      const result = await startCheckout({ plan, cycle, returnPath }, { sample: data.isSample });
      if (result?.authorizationUrl) {
        window.location.assign(result.authorizationUrl);
        return;
      }
      if (result?.sample && result.reference) {
        navigate(`${returnPath}&reference=${encodeURIComponent(result.reference)}`);
        return;
      }
      throw new Error("We couldn't open secure checkout. Please try again.");
    } catch (payError) {
      setStartError(payError.message || "We couldn't open secure checkout. Please try again.");
      setStarting(false);
    }
  }

  return (
    <div className="cmpr-page cmpr-checkout">
      <CheckoutHeader planName={quote.planName} step={2} />

      {data.isSample && (
        <p className="community-sample-notice" role="status">
          Sample mode: the Premium API is not available yet, so checkout is simulated. No payment provider is contacted and no money is taken.
          This notice only appears on the local dev server.
        </p>
      )}

      {viewerPaid ? (
        <section className="community-card cmpr-already" aria-labelledby="cmpr-already-title">
          <h2 id="cmpr-already-title">
            {viewer.plan === plan ? `You already have CodeRise ${quote.planName}` : "You already have a paid plan"}
          </h2>
          <p>
            {viewer.plan === plan
              ? "Switch between monthly and yearly billing, or update your card, from Subscription."
              : `${planRank(plan) > planRank(viewer.plan) ? "Upgrade" : "Switch"} from Subscription. We only charge the prorated difference, so you are never billed twice.`}
          </p>
          <Link to="/account/subscription" className="btn btn-primary">Go to Subscription</Link>
        </section>
      ) : (
        <div className={`cmpr-checkout-layout${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing}>
          <div className="cmpr-checkout-main">
            <section className="community-card" aria-labelledby="cmpr-cycle-title">
              <fieldset className="cmpr-cycle-options">
                <legend id="cmpr-cycle-title" className="cmpr-section-title">Billing cycle</legend>
                <label className={`cmpr-cycle-option${!yearly ? " is-selected" : ""}`}>
                  <input type="radio" name="cycle" value="monthly" checked={!yearly} onChange={() => chooseCycle("monthly")} />
                  <span className="cmpr-cycle-text">
                    <strong>Monthly</strong>
                    <span>{formatPrice(quote.prices.monthly)} billed every month</span>
                  </span>
                  <span className="cmpr-cycle-price">{formatPrice(quote.prices.monthly)}</span>
                </label>
                <label className={`cmpr-cycle-option${yearly ? " is-selected" : ""}`}>
                  <input type="radio" name="cycle" value="yearly" checked={yearly} onChange={() => chooseCycle("yearly")} />
                  <span className="cmpr-cycle-text">
                    <strong>
                      Yearly{" "}
                      <span className="community-tag tag-green">Save {formatUsd(quote.prices.monthly * 12 - quote.prices.yearly)}</span>
                    </strong>
                    <span>{formatPrice(quote.prices.yearly)} billed once a year · {formatPrice(Math.round((quote.prices.yearly / 12) * 100) / 100)} a month</span>
                  </span>
                  <span className="cmpr-cycle-price">{formatPrice(quote.prices.yearly)}</span>
                </label>
              </fieldset>
            </section>

            <section className="community-card" aria-labelledby="cmpr-payment-title">
              <div className="cmpr-card-head">
                <h2 id="cmpr-payment-title" className="cmpr-section-title">Payment details</h2>
                <span className="cmpr-secured"><Lock size={14} aria-hidden="true" /> Secured by our payment partner</span>
              </div>
              <div className="cmpr-handoff">
                <span className="community-icon tone-purple" aria-hidden="true"><ExternalLink size={20} /></span>
                <div>
                  <p className="cmpr-handoff-title">You'll enter your card on our payment partner's secure page</p>
                  <p>
                    When you select <strong>Subscribe and pay</strong>, we open their checkout. Afterwards you come straight back here to see your
                    confirmation. CodeRise never sees or stores your card number.
                  </p>
                </div>
              </div>
              {email && (
                <dl className="cmpr-receipt">
                  <dt>Receipt email</dt>
                  <dd>{email}</dd>
                </dl>
              )}
              <p className="cmpr-info-note">
                <Info size={17} aria-hidden="true" />
                <span>You will be charged in US dollars. Your bank may add a currency conversion fee. Card details are handled by our payment partner and never stored by CodeRise.</span>
              </p>
            </section>
          </div>

          <aside className="cmpr-checkout-side" aria-label="Order summary">
            <section className="community-card cmpr-summary">
              <div className="cmpr-summary-plan">
                <span className="community-icon community-icon-solid-purple" aria-hidden="true"><Crown size={20} /></span>
                <div>
                  <h2>CodeRise {quote.planName}</h2>
                  <p>{yearly ? "Yearly plan · 12 months" : "Monthly plan · 1 month"}</p>
                </div>
              </div>
              <dl className="cmpr-summary-rows">
                <div><dt>Plan price</dt><dd>{formatUsd(quote.priceUsd)}</dd></div>
                {quote.discountUsd > 0 && (
                  <div><dt>Discount</dt><dd className="cmpr-discount">−{formatUsd(quote.discountUsd)} vs monthly</dd></div>
                )}
                <div><dt>Tax</dt><dd>{formatUsd(quote.taxUsd)}</dd></div>
                <div className="cmpr-summary-total"><dt>Total due today</dt><dd>{formatUsd(quote.totalUsd)}</dd></div>
              </dl>
              <p className="cmpr-summary-note">
                Renews automatically on {formatDate(quote.renewsAt)} at {formatUsd(quote.priceUsd)}. Cancel anytime from Subscription.
              </p>
              {startError && (
                <div className="cmpr-alert is-error" role="alert">
                  <TriangleAlert size={18} aria-hidden="true" />
                  <div>
                    <strong>Checkout didn't open</strong>
                    <p>{startError} You have not been charged.</p>
                  </div>
                </div>
              )}
              <button type="button" className="btn btn-full community-btn-premium" onClick={pay} disabled={starting || refreshing}>
                {starting ? <><LoaderCircle size={17} className="btn-spinner" aria-hidden="true" /> Opening secure checkout…</> : `Subscribe and pay ${formatUsd(quote.totalUsd)}`}
              </button>
              <p className="cmpr-terms">By subscribing you agree to the CodeRise Premium terms.</p>
            </section>

            {quote.benefits?.length > 0 && (
              <section className="community-card cmpr-benefits" aria-labelledby="cmpr-benefits-title">
                <h2 id="cmpr-benefits-title">You get immediately</h2>
                <ul className="cmpr-checklist">
                  {quote.benefits.map((item) => <li key={item}><Check size={16} aria-hidden="true" /> {item}</li>)}
                </ul>
              </section>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function CheckoutConfirmation({ plan, cycle, reference }) {
  const { result, error, gaveUp, recheck } = useCheckoutStatus(reference);
  const planName = plan === "plus" ? "Premium Plus" : "Premium";
  const retryTo = `/premium/checkout?plan=${plan}&cycle=${cycle}`;
  const status = result?.status;

  let body;
  if (error) {
    body = <ErrorMessage message={`${error} If you completed payment, don't pay again: your plan will appear under Subscription once it is confirmed.`} onRetry={recheck} />;
  } else if (!result || (status === "pending" && !gaveUp)) {
    body = (
      <section className="community-card cmpr-result" aria-busy="true">
        <LoaderCircle size={36} className="btn-spinner cmpr-result-spinner" aria-hidden="true" />
        <h2>Confirming your payment…</h2>
        <p>We're waiting for our payment partner to confirm it. This page updates by itself, so please keep it open.</p>
      </section>
    );
  } else if (status === "pending") {
    body = (
      <section className="community-card cmpr-result">
        <span className="community-icon tone-amber cmpr-result-icon" aria-hidden="true"><Info size={26} /></span>
        <h2>Your payment is still being confirmed</h2>
        <p>This can take a few minutes. Please don't pay again. We'll email you when Premium is active, and it will show under Subscription.</p>
        <div className="cmpr-result-actions">
          <button type="button" className="btn btn-primary" onClick={recheck}>Check again</button>
          <Link to="/account/subscription" className="btn btn-outline">Go to Subscription</Link>
        </div>
      </section>
    );
  } else if (status === "active") {
    const subscription = result.subscription ?? {};
    const name = subscription.plan === "plus" ? "Premium Plus" : subscription.plan === "premium" ? "Premium" : planName;
    body = (
      <section className="community-card cmpr-result is-success">
        <span className="community-icon tone-green cmpr-result-icon" aria-hidden="true"><CheckCircle2 size={28} /></span>
        <h2>{name} unlocked</h2>
        <p>
          Welcome to CodeRise {name}. Your {subscription.cycle === "yearly" ? "yearly" : "monthly"} plan
          {subscription.renewsAt ? ` renews on ${formatDate(subscription.renewsAt)}` : " is active"}. A receipt is on its way to your email.
        </p>
        <div className="cmpr-result-actions">
          <Link to="/community/projects?access=premium" className="btn community-btn-premium">Browse Premium projects</Link>
          <Link to="/account/subscription" className="btn btn-outline">Manage subscription</Link>
        </div>
      </section>
    );
  } else {
    body = (
      <section className="cmpr-alert is-error cmpr-result-failed" role="alert">
        <TriangleAlert size={20} aria-hidden="true" />
        <div>
          <h2>Payment failed</h2>
          <p>{result.failureReason || "Your payment didn't go through."} You have not been charged and Premium is not active yet.</p>
          <div className="cmpr-result-actions">
            <Link to={retryTo} className="btn btn-sm community-btn-danger">Try again</Link>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="cmpr-danger-link">Contact support</a>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="cmpr-page cmpr-checkout">
      <CheckoutHeader planName={planName} step={status === "failed" ? 2 : 3} />
      {result?.isSample && (
        <p className="community-sample-notice" role="status">
          Sample mode: this confirmation is simulated. No payment provider was contacted and no money was taken. This notice only appears on the local dev server.
        </p>
      )}
      <div role="status" aria-live="polite" className="cmpr-result-wrap">{body}</div>
    </div>
  );
}
