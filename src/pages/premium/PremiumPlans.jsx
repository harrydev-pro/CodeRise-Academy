import { Link } from "react-router-dom";
import { Check } from "lucide-react";

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { useCommunityList, useUrlFilters } from "../../features/community/listHooks";
import { CYCLES, getPremiumPlans, planRank } from "../../features/premium/premiumService";
import { formatPrice, yearlySavingPercent } from "../../features/premium/premiumFormat";

const COLUMNS = [
  { id: "free", label: "Free" },
  { id: "premium", label: "Premium" },
  { id: "plus", label: "Premium Plus" },
];

// S26 Premium plans (/premium). The Monthly / Yearly choice lives in the URL (?cycle=yearly).
export default function PremiumPlans() {
  const { params, update } = useUrlFilters({ cycle: "monthly" });
  const cycle = CYCLES.includes(params.get("cycle")) ? params.get("cycle") : "monthly";
  const { data, error, loading, reload } = useCommunityList(getPremiumPlans, {});

  if (loading) return <Loader label="Loading Premium plans…" />;
  if (error && !data) return <ErrorMessage message={error} onRetry={reload} />;

  const { plans, comparison, faqs, viewer } = data;
  const saving = yearlySavingPercent(plans.find((plan) => plan.id === "premium"));

  return (
    <div className="cmpr-page">
      <header className="cmpr-hero">
        <span className="eyebrow cmpr-eyebrow">CODERISE PREMIUM</span>
        <h1>Practise more. Build more. Stand out.</h1>
        <p>Free learning stays free. Premium unlocks advanced projects, team briefs and expert sessions when you are ready for more.</p>
      </header>

      {data.isSample && (
        <p className="community-sample-notice" role="status">
          Showing sample data: the Premium API is not available yet. This notice only appears on the local dev server.
        </p>
      )}

      <div className="cmpr-cycle-toggle" role="group" aria-label="Billing cycle">
        <button type="button" className={cycle === "monthly" ? "active" : ""} aria-pressed={cycle === "monthly"} onClick={() => update({ cycle: "monthly" })}>
          Monthly
        </button>
        <button type="button" className={cycle === "yearly" ? "active" : ""} aria-pressed={cycle === "yearly"} onClick={() => update({ cycle: "yearly" })}>
          Yearly {saving > 0 && <span className="cmpr-save">Save {saving}%</span>}
        </button>
      </div>

      <div className="cmpr-plans">
        {plans.map((plan) => (
          <PlanCard key={plan.id} plan={plan} cycle={cycle} viewer={viewer} />
        ))}
      </div>

      <p className="cmpr-fine-print">
        Prices in USD. Paid competition entry fees are charged separately unless a competition says otherwise. Cancel anytime.
      </p>

      <section className="community-card cmpr-compare" aria-labelledby="cmpr-compare-title">
        <h2 id="cmpr-compare-title" className="cmpr-section-title">Compare plans</h2>
        <div className="community-table-wrap" tabIndex={0} role="region" aria-label="Plan comparison (scrolls sideways)">
          <table className="community-table cmpr-compare-table">
            <thead>
              <tr>
                <th scope="col">Feature</th>
                {COLUMNS.map((column) => (
                  <th key={column.id} scope="col" className={`is-center${column.id === "premium" ? " cmpr-col-premium" : ""}`}>
                    {column.label}
                    {viewer.plan === column.id && <span className="sr-only"> (your current plan)</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparison.map((row) => (
                <tr key={row.feature}>
                  <th scope="row">{row.feature}</th>
                  {COLUMNS.map((column) => (
                    <td key={column.id} className={`is-center${column.id === "premium" ? " cmpr-col-premium" : ""}`}>
                      <ComparisonValue value={row[column.id]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {faqs.length > 0 && (
        <section className="community-card cmpr-faq" aria-labelledby="cmpr-faq-title">
          <h2 id="cmpr-faq-title" className="cmpr-section-title">Questions</h2>
          <dl>
            {faqs.map((item) => (
              <div key={item.question} className="cmpr-faq-item">
                <dt>{item.question}</dt>
                <dd>{item.answer}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}

function ComparisonValue({ value }) {
  if (value === true) return <span className="cmpr-yes">Yes</span>;
  if (value === false) return <span className="cmpr-no">No</span>;
  if (value === "Priority access") return <span className="cmpr-yes">{value}</span>;
  return <span>{value}</span>;
}

function PlanCard({ plan, cycle, viewer }) {
  const isCurrent = viewer.plan === plan.id;
  const isFree = plan.id === "free";
  const featured = plan.id === "premium";
  const yearly = cycle === "yearly";
  const price = isFree ? 0 : yearly ? plan.yearlyUsd : plan.monthlyUsd;
  const unit = isFree ? "forever" : yearly ? "year" : "month";
  const titleId = `cmpr-plan-${plan.id}`;

  let billing = null;
  if (!isFree) {
    billing = yearly
      ? `Billed yearly · ${formatPrice(Math.round((plan.yearlyUsd / 12) * 100) / 100)} a month`
      : `Billed monthly · or ${formatPrice(plan.yearlyUsd)} a year`;
  }

  let action;
  if (isCurrent) {
    action = <p className="cmpr-current-button">Your current plan</p>;
  } else if (isFree) {
    action = <Link to="/account/subscription" className="btn btn-outline btn-full">Manage subscription</Link>;
  } else if (viewer.plan === "free") {
    const to = `/premium/checkout?plan=${plan.id}&cycle=${cycle}`;
    action = featured
      ? <Link to={to} className="btn btn-full community-btn-premium">Upgrade to {plan.name}</Link>
      : <Link to={to} className="btn btn-full cmpr-btn-outline">Choose {plan.name}</Link>;
  } else {
    const label = planRank(plan.id) > planRank(viewer.plan) ? `Upgrade to ${plan.name}` : `Switch to ${plan.name}`;
    action = <Link to="/account/subscription" className="btn btn-full cmpr-btn-outline">{label}</Link>;
  }

  return (
    <article className={`community-card cmpr-plan${featured ? " is-featured" : ""}${isCurrent ? " is-current" : ""}`} aria-labelledby={titleId}>
      <div className="cmpr-plan-head">
        <h2 id={titleId}>{plan.name}</h2>
        {isCurrent ? (
          <span className="community-tag tag-neutral">Current plan</span>
        ) : plan.badge ? (
          <span className={`community-tag ${featured ? "cmpr-tag-solid" : "tag-purple"}`}>{plan.badge}</span>
        ) : null}
      </div>
      <p className="cmpr-plan-tagline">{plan.tagline}</p>
      <p className="cmpr-plan-price">
        <strong>{formatPrice(price)}</strong> <span>/ {unit}</span>
      </p>
      {billing && <p className="cmpr-plan-billing">{billing}</p>}
      <div className="cmpr-plan-action">{action}</div>
      <ul className="cmpr-checklist" aria-label={`${plan.name} includes`}>
        {plan.features.map((feature) => (
          <li key={feature}><Check size={16} aria-hidden="true" /> {feature}</li>
        ))}
      </ul>
    </article>
  );
}
