import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarClock, Crown, LoaderCircle, TriangleAlert, X } from "lucide-react";

import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import Toast from "../../components/feedback/Toast";
import { useCommunityList } from "../../features/community/listHooks";
import {
  cancelSubscription,
  changePlan,
  getSubscriptionPage,
  planRank,
  resumeSubscription,
  updatePaymentMethod,
} from "../../features/premium/premiumService";
import { PREMIUM_FROM_PRICE } from "../../features/premium/samplePremium";
import { cycleWord, formatDate, formatPrice, formatUsd } from "../../features/premium/premiumFormat";

const SUPPORT_EMAIL = "support@coderiseacademy.com";
const CANCEL_REASONS = [
  "It's too expensive",
  "I'm not using it enough",
  "I finished what I needed",
  "Something is missing",
  "Payment problems",
  "Another reason",
];
const STATUS_TAG = {
  active: { label: "Active", className: "tag-green" },
  cancelling: { label: "Cancelling", className: "tag-amber" },
  past_due: { label: "Payment overdue", className: "cmpr-tag-red" },
  free: { label: "Free plan", className: "tag-neutral" },
};
const INVOICE_TAG = {
  paid: { label: "Paid", className: "tag-green" },
  failed: { label: "Failed", className: "cmpr-tag-red" },
  complimentary: { label: "Complimentary", className: "tag-purple" },
  refunded: { label: "Refunded", className: "tag-neutral" },
};

const planName = (plans, id) => plans.find((plan) => plan.id === id)?.name ?? (id === "plus" ? "Premium Plus" : id === "premium" ? "Premium" : "Free");

// S28 Subscription management (/account/subscription). Everything shown here comes from the
// backend; plan changes and cancellations are confirmed in a dialog and carried out by the API.
export default function Subscription() {
  const { data, error, loading, refreshing, reload } = useCommunityList(getSubscriptionPage, {});
  const [dialog, setDialog] = useState(null); // { kind: "cancel" } | { kind: "change", plan, cycle }
  const [busy, setBusy] = useState("");
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), [setToast]);

  if (loading) return <Loader label="Loading your subscription…" />;
  if (error && !data) return <ErrorMessage message={error} onRetry={reload} />;

  const { subscription: sub, invoices, plans, cancellationImpact } = data;
  const paid = sub.plan !== "free";
  const currentName = planName(plans, sub.plan);
  const sample = { sample: data.isSample };

  async function run(kind, action, success) {
    setBusy(kind);
    try {
      const result = await action();
      if (result?.authorizationUrl) {
        window.location.assign(result.authorizationUrl);
        return true;
      }
      setToast({ type: "success", message: typeof success === "function" ? success(result) : success });
      setDialog(null);
      reload();
      return true;
    } catch (actionError) {
      setToast({ type: "error", message: actionError.message || "That didn't work. Please try again." });
      return false;
    } finally {
      setBusy("");
    }
  }

  function resume() {
    run("resume", () => resumeSubscription(sample), sub.status === "cancelling" ? `You're keeping ${currentName}. Nothing changes.` : "Your scheduled change was removed.");
  }

  function paymentMethod() {
    run("payment", () => updatePaymentMethod(sample), (result) => (result?.sample
      ? "Sample mode: our payment partner's secure page would open here to update your card."
      : "Your payment method was updated."));
  }

  function confirmChange(reason) {
    if (dialog.kind === "cancel") {
      return run("dialog", () => cancelSubscription({ reason }, sample), `Your subscription is cancelled. You keep ${currentName} until ${formatDate(sub.renewsAt)}.`);
    }
    const { plan, cycle } = dialog;
    const upgrade = planRank(plan) > planRank(sub.plan);
    return run("dialog", () => changePlan({ plan, cycle }, sample), upgrade
      ? `You're now on ${planName(plans, plan)}.`
      : `Your plan changes to ${planName(plans, plan)} (${cycle}) on ${formatDate(sub.renewsAt)}.`);
  }

  const otherCycle = sub.cycle === "yearly" ? "monthly" : "yearly";
  const higherPlan = plans.find((plan) => planRank(plan.id) === planRank(sub.plan) + 1);
  const tag = STATUS_TAG[sub.status] ?? STATUS_TAG.active;

  return (
    <div className="cmpr-page">
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">ACCOUNT &amp; BILLING</span>
          <h1>Subscription</h1>
          <p>Manage your CodeRise membership, payment method and receipts.</p>
        </div>
      </header>

      {data.isSample && (
        <p className="community-sample-notice" role="status">
          Showing sample data: the subscription API is not available yet, so changes are simulated and no payment is taken. This notice only appears on the local dev server.
        </p>
      )}

      <div className={`cmpr-sub-layout${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing}>
        <div className="cmpr-sub-main">
          <section className="community-card cmpr-current" aria-labelledby="cmpr-current-title">
            <div className="cmpr-current-head">
              <span className="community-icon community-icon-solid-purple cmpr-current-icon" aria-hidden="true"><Crown size={22} /></span>
              <div className="min-w-0">
                <p className="cmpr-current-label">Current plan</p>
                <h2 id="cmpr-current-title">{paid ? `CodeRise ${currentName}` : "Free"}</h2>
              </div>
              <span className={`community-tag ${tag.className}`}>{tag.label}</span>
            </div>

            {paid ? (
              <>
                <dl className="cmpr-current-facts">
                  <div><dt>Price</dt><dd>{formatUsd(sub.priceUsd)} / {cycleWord(sub.cycle)}</dd></div>
                  <div><dt>Started</dt><dd>{formatDate(sub.startedAt)}</dd></div>
                  <div><dt>{sub.status === "cancelling" ? "Premium ends" : "Next billing date"}</dt><dd>{formatDate(sub.renewsAt)}</dd></div>
                  <div>
                    <dt>Payment method</dt>
                    <dd>{sub.paymentMethod ? `${sub.paymentMethod.brand} ending ${sub.paymentMethod.last4}` : "No card on file"}</dd>
                  </div>
                </dl>

                {sub.status === "past_due" && (
                  <div className="cmpr-alert is-error" role="alert">
                    <TriangleAlert size={18} aria-hidden="true" />
                    <div>
                      <strong>Your last payment failed</strong>
                      <p>Update your payment method to keep {currentName}. We'll retry the charge automatically.</p>
                    </div>
                  </div>
                )}

                {sub.pendingChange && (
                  <div className="cmpr-alert is-warning" role="status">
                    <CalendarClock size={18} aria-hidden="true" />
                    <div>
                      <strong>
                        {sub.pendingChange.plan === "free"
                          ? `Your subscription ends on ${formatDate(sub.pendingChange.effectiveAt)}`
                          : `Changing to ${planName(plans, sub.pendingChange.plan)} (${sub.pendingChange.cycle}) on ${formatDate(sub.pendingChange.effectiveAt)}`}
                      </strong>
                      <p>
                        {sub.pendingChange.plan === "free"
                          ? `You keep ${currentName} until then, and you won't be charged again.`
                          : `You keep your current plan until then.`}
                      </p>
                    </div>
                  </div>
                )}

                <div className="cmpr-current-actions">
                  {sub.pendingChange ? (
                    <button type="button" className="btn community-btn-premium" onClick={resume} disabled={Boolean(busy)}>
                      {busy === "resume" ? "Saving…" : sub.pendingChange.plan === "free" ? `Keep ${currentName}` : "Keep current plan"}
                    </button>
                  ) : (
                    <>
                      {higherPlan && (
                        <button type="button" className="btn community-btn-premium" onClick={() => setDialog({ kind: "change", plan: higherPlan.id, cycle: sub.cycle })} disabled={Boolean(busy)}>
                          Upgrade to {higherPlan.name}
                        </button>
                      )}
                      <button type="button" className="btn btn-outline" onClick={() => setDialog({ kind: "change", plan: sub.plan, cycle: otherCycle })} disabled={Boolean(busy)}>
                        Switch to {otherCycle}
                      </button>
                    </>
                  )}
                  <button type="button" className="btn btn-outline" onClick={paymentMethod} disabled={Boolean(busy)}>
                    {busy === "payment" ? "Opening…" : "Update payment method"}
                  </button>
                  {!sub.pendingChange && (
                    <button type="button" className="btn btn-outline community-btn-danger-outline cmpr-cancel-button" onClick={() => setDialog({ kind: "cancel" })} disabled={Boolean(busy)}>
                      Cancel subscription
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="cmpr-free-state">
                <p>You're on the Free plan. Free learning, free projects and free events stay free. Premium adds advanced projects, Premium teams and masterclasses.</p>
                <Link to="/premium" className="btn community-btn-premium">See Premium plans · from {PREMIUM_FROM_PRICE}</Link>
              </div>
            )}
          </section>

          <section className="community-card cmpr-history" aria-labelledby="cmpr-history-title">
            <div className="cmpr-card-head">
              <h2 id="cmpr-history-title" className="cmpr-section-title">Payment history</h2>
              <span className="cmpr-muted-small">Amounts in USD</span>
            </div>
            {invoices.length === 0 ? (
              <p className="muted-text cmpr-history-empty">No payments yet. Receipts appear here after each charge.</p>
            ) : (
              <div className="community-table-wrap" tabIndex={0} role="region" aria-label="Payment history (scrolls sideways)">
                <table className="community-table">
                  <thead>
                    <tr>
                      <th scope="col">Date</th>
                      <th scope="col">Description</th>
                      <th scope="col" className="is-number">Amount</th>
                      <th scope="col">Status</th>
                      <th scope="col">Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((invoice) => {
                      const status = INVOICE_TAG[invoice.status] ?? INVOICE_TAG.paid;
                      return (
                        <tr key={invoice.id}>
                          <td>{formatDate(invoice.date)}</td>
                          <td>{invoice.description}</td>
                          <td className="is-number"><strong>{formatUsd(invoice.amountUsd)}</strong></td>
                          <td><span className={`community-tag ${status.className}`}>{status.label}</span></td>
                          <td>
                            {invoice.receiptUrl ? (
                              <a href={invoice.receiptUrl} target="_blank" rel="noreferrer" className="cmpr-receipt-link">
                                {invoice.receiptNumber}<span className="sr-only"> (opens in a new tab)</span>
                              </a>
                            ) : invoice.receiptNumber ? (
                              <span className="cmpr-receipt-number">{invoice.receiptNumber}</span>
                            ) : (
                              <span className="cmpr-muted-small">{invoice.note || "—"}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>

        <aside className="cmpr-sub-side" aria-label="Plans and help">
          <section className="community-card" aria-labelledby="cmpr-change-title">
            <h2 id="cmpr-change-title" className="cmpr-section-title">Change plan</h2>
            <ul className="cmpr-change-list">
              {[...plans].sort((a, b) => (a.id === sub.plan ? -1 : b.id === sub.plan ? 1 : planRank(b.id) - planRank(a.id))).map((plan) => (
                <ChangePlanOption
                  key={plan.id}
                  plan={plan}
                  sub={sub}
                  disabled={Boolean(busy)}
                  onChange={() => setDialog(plan.id === "free" ? { kind: "cancel" } : { kind: "change", plan: plan.id, cycle: sub.cycle })}
                />
              ))}
            </ul>
          </section>

          <section className="community-card cmpr-help" aria-labelledby="cmpr-help-title">
            <h2 id="cmpr-help-title" className="cmpr-section-title">Need help with billing?</h2>
            <p>Questions about a charge or a refund? Our team replies within one working day.</p>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="cmpr-help-link">{SUPPORT_EMAIL}</a>
          </section>
        </aside>
      </div>

      {dialog?.kind === "cancel" && (
        <CancelDialog
          planLabel={currentName}
          endsAt={sub.renewsAt}
          impact={cancellationImpact}
          busy={busy === "dialog"}
          onKeep={() => setDialog(null)}
          onConfirm={confirmChange}
        />
      )}
      {dialog?.kind === "change" && (
        <ChangeDialog
          sub={sub}
          plans={plans}
          plan={dialog.plan}
          cycle={dialog.cycle}
          busy={busy === "dialog"}
          onCancel={() => setDialog(null)}
          onConfirm={() => confirmChange()}
        />
      )}

      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </div>
  );
}

function ChangePlanOption({ plan, sub, disabled, onChange }) {
  const current = plan.id === sub.plan;
  const prices = plan.id === "free" ? "$0 forever" : `${formatPrice(plan.monthlyUsd)} / month or ${formatPrice(plan.yearlyUsd)} / year`;
  const scheduled = sub.pendingChange?.plan === plan.id && !current;
  const higher = planRank(plan.id) > planRank(sub.plan);

  let note = null;
  let action;
  if (current) {
    action = <span className="community-tag tag-purple">Current</span>;
  } else if (scheduled) {
    action = <span className="community-tag tag-amber">From {formatDate(sub.pendingChange.effectiveAt)}</span>;
  } else if (sub.plan === "free") {
    action = <Link to={`/premium/checkout?plan=${plan.id}&cycle=monthly`} className="cmpr-upgrade-link" aria-label={`Choose ${plan.name}`}>Choose</Link>;
  } else if (higher) {
    note = "Charged the prorated difference today.";
    action = <button type="button" className="cmpr-upgrade-link" onClick={onChange} disabled={disabled || Boolean(sub.pendingChange)} aria-label={`Upgrade to ${plan.name}`}>Upgrade</button>;
  } else {
    note = `Takes effect on ${formatDate(sub.renewsAt)}, when your paid ${cycleWord(sub.cycle)} ends.`;
    action = <button type="button" className="btn btn-outline btn-sm" onClick={onChange} disabled={disabled || Boolean(sub.pendingChange)} aria-label={`Downgrade to ${plan.name}`}>Downgrade</button>;
  }

  return (
    <li className={`cmpr-change-option${current ? " is-current" : ""}`}>
      <div className="cmpr-change-top">
        <h3>{plan.name}</h3>
        {action}
      </div>
      <p>{prices}{note ? `. ${note}` : ""}</p>
    </li>
  );
}

function ChangeDialog({ sub, plans, plan, cycle, busy, onCancel, onConfirm }) {
  const name = planName(plans, plan);
  const target = plans.find((item) => item.id === plan);
  const price = target ? (cycle === "yearly" ? target.yearlyUsd : target.monthlyUsd) : 0;
  const upgrade = planRank(plan) > planRank(sub.plan);
  const cycleSwitch = plan === sub.plan;
  const card = sub.paymentMethod ? `your ${sub.paymentMethod.brand} ending ${sub.paymentMethod.last4}` : "your card";

  let title;
  let text;
  if (upgrade) {
    title = `Upgrade to ${name}?`;
    text = `${name} starts straight away. We'll charge the prorated difference for the rest of your current ${cycleWord(sub.cycle)} to ${card} today, then ${formatUsd(price)} a ${cycleWord(cycle)} from ${formatDate(sub.renewsAt)}.`;
  } else if (cycleSwitch) {
    title = `Switch to ${cycle} billing?`;
    text = `Your current ${cycleWord(sub.cycle)} carries on as normal. From ${formatDate(sub.renewsAt)} you'll be billed ${formatUsd(price)} a ${cycleWord(cycle)}.`;
  } else {
    title = `Downgrade to ${name}?`;
    text = `You keep ${planName(plans, sub.plan)} until ${formatDate(sub.renewsAt)}. After that you move to ${name} at ${formatUsd(price)} a ${cycleWord(cycle)}, and the extra ${planName(plans, sub.plan)} benefits end.`;
  }

  return (
    <Modal open onClose={busy ? undefined : onCancel} title={title}>
      <div className="cmpr-dialog">
        <p>{text}</p>
        <div className="cmpr-dialog-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel} disabled={busy}>Not now</button>
          <button type="button" className={`btn ${upgrade ? "community-btn-premium" : "btn-primary"}`} onClick={onConfirm} disabled={busy}>
            {busy ? <><LoaderCircle size={16} className="btn-spinner" aria-hidden="true" /> Saving…</> : upgrade ? `Upgrade to ${name}` : cycleSwitch ? `Switch to ${cycle}` : `Downgrade to ${name}`}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function CancelDialog({ planLabel, endsAt, impact, busy, onKeep, onConfirm }) {
  const [reason, setReason] = useState("");
  const losses = [];
  if (impact?.premiumProjects) {
    const inProgress = impact.inProgressProjects?.length ? `, including ${impact.inProgressProjects.join(", ")} (in progress)` : "";
    losses.push(`Access to ${impact.premiumProjects} Premium projects${inProgress}`);
  }
  (impact?.premiumTeams ?? []).forEach((team) => losses.push(`Your place in the Premium team project “${team}”`));
  losses.push("Masterclasses and advanced learning resources");
  losses.push("The Premium badge on your community profile");

  return (
    <Modal open onClose={busy ? undefined : onKeep} title={`Cancel your ${planLabel} subscription?`}>
      <div className="cmpr-dialog">
        <span className="cmpr-dialog-icon" aria-hidden="true"><TriangleAlert size={22} /></span>
        <p>
          You will keep {planLabel} until <strong>{formatDate(endsAt)}</strong>. After that your account moves to the Free plan and you will lose:
        </p>
        <ul className="cmpr-loss-list">
          {losses.map((item) => <li key={item}><X size={16} aria-hidden="true" /> {item}</li>)}
        </ul>
        <p className="cmpr-dialog-note">Your completed projects, points and certificates stay on your profile.</p>
        <div className="community-field">
          <label htmlFor="cmpr-cancel-reason" className="cmpr-field-label">Why are you cancelling? <span className="community-field-optional">(optional)</span></label>
          <select id="cmpr-cancel-reason" className="ui-input" value={reason} onChange={(event) => setReason(event.target.value)} disabled={busy}>
            <option value="">Choose a reason</option>
            {CANCEL_REASONS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <div className="cmpr-dialog-actions">
          <button type="button" className="btn btn-outline" onClick={onKeep} disabled={busy}>Keep {planLabel}</button>
          <button type="button" className="btn community-btn-danger" onClick={() => onConfirm(reason)} disabled={busy}>
            {busy ? <><LoaderCircle size={16} className="btn-spinner" aria-hidden="true" /> Cancelling…</> : "Cancel subscription"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
