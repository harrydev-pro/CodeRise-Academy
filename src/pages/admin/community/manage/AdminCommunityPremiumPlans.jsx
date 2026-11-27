import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, Check, Plus } from "lucide-react";

import Loader from "../../../../components/common/Loader";
import ErrorMessage from "../../../../components/feedback/ErrorMessage";
import Toast from "../../../../components/feedback/Toast";
import { emptyPlan, getAdminPlans, savePlan, setPlanEnabled } from "../../../../features/community/admin/manage/adminManageService";
import { ConfirmDialog, Field, SampleNotice, Switch, ValueBars } from "../../../../features/community/admin/manage/manageControls";
import { numberFormat, shortDate, usd, usdCents, useToastState } from "../../../../features/community/admin/manage/manageUtils";
import { useCommunityList } from "../../../../features/community/listHooks";

const NO_FILTERS = {};
const PLUS_EXTRAS = ["priority_review", "portfolio_feedback", "mentorship_priority"];
const TRIALS = [
  { value: 0, label: "No trial" },
  { value: 7, label: "7 days" },
  { value: 14, label: "14 days" },
  { value: 30, label: "30 days" },
];
const price = (value) => (Number(value) % 1 === 0 ? usd.format(Number(value)) : usdCents.format(Number(value)));
const saving = (plan) => {
  const full = Number(plan.priceMonthly) * 12;
  return full > 0 && plan.priceYearly ? Math.round((1 - Number(plan.priceYearly) / full) * 100) : 0;
};

export default function AdminCommunityPremiumPlans() {
  const { data, error, loading, refreshing, reload } = useCommunityList(getAdminPlans, NO_FILTERS);
  const [editing, setEditing] = useState(null); // plan id, "new" or null (defaults to the first paid plan)
  const [busy, setBusy] = useState("");
  const [toast, setToast, closeToast] = useToastState();
  const formRef = useRef(null);
  const sample = Boolean(data?.isSample);
  const plans = data?.plans ?? [];
  const currentId = editing ?? plans.find((plan) => !plan.isFree)?.id ?? "new";
  const current = currentId === "new" ? emptyPlan() : plans.find((plan) => plan.id === currentId);

  function edit(id) {
    setEditing(id);
    window.requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      formRef.current?.querySelector("input")?.focus({ preventScroll: true });
    });
  }

  async function toggle(plan, enabled) {
    setBusy(plan.id);
    try {
      await setPlanEnabled(plan.id, enabled, { sample });
      setToast({ type: "success", message: enabled ? `${plan.name} is available to new subscribers.` : `${plan.name} is closed to new subscribers. Existing members keep it until they cancel.` });
      reload();
    } catch (toggleError) {
      setToast({ type: "error", message: toggleError.message || "That didn't work. Please try again." });
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="admin-page community-admin cam-page">
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">PREMIUM MEMBERSHIP</span>
          <h1>Membership plans</h1>
          <p>Set prices, benefits and availability. Changes apply to new subscriptions; existing members keep their price until renewal.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => edit("new")}><Plus size={17} aria-hidden="true" /> New plan</button>
      </header>

      {sample && <SampleNotice>Changes are kept in this browser tab only and no emails are sent.</SampleNotice>}
      {loading && <Loader label="Loading plans…" />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && (
        <>
          <div className={`cam-plan-grid${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing}>
            {plans.map((plan) => (
              <PlanCard key={plan.id} plan={plan} editing={plan.id === currentId} busy={busy === plan.id} onEdit={() => edit(plan.id)} onToggle={(value) => toggle(plan, value)} benefitOptions={data.benefitOptions} />
            ))}
          </div>

          <div className="cam-split cam-split-wide" ref={formRef}>
            {current && (
              <PlanForm
                key={`${currentId}-${current.updatedAt ?? ""}`}
                initial={current}
                benefitOptions={data.benefitOptions}
                sample={sample}
                onCancel={() => setEditing(null)}
                onSaved={(saved, message) => { setEditing(saved.id); setToast({ type: "success", message }); reload(); }}
                onError={setToast}
              />
            )}
            <aside className="cam-split-side cam-stack">
              <div className="cam-notice is-warning" role="note">
                <AlertCircle size={20} aria-hidden="true" />
                <div>
                  <h2>Price change notice</h2>
                  <p>Changing a price emails all {numberFormat.format(current?.subscribers ?? 0)} {current?.name || "plan"} subscribers 30 days before their next renewal. Only advertise benefits the team can deliver.</p>
                </div>
              </div>
              <section className="ui-card" aria-labelledby="plan-revenue-title">
                <h2 id="plan-revenue-title">Plan revenue this month</h2>
                <ValueBars label="Revenue by plan this month" format={(value) => usd.format(value)} items={plans.filter((plan) => !plan.isFree).map((plan) => ({ label: plan.name, value: plan.revenueThisMonth ?? 0 }))} />
                <Link to="/admin/community/subscriptions" className="community-admin-link">View subscriptions</Link>
              </section>
            </aside>
          </div>
        </>
      )}
      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </section>
  );
}

function PlanCard({ plan, editing, busy, onEdit, onToggle, benefitOptions }) {
  const labels = plan.benefits.map((key) => benefitOptions.find((item) => item.key === key)?.label ?? key);
  // Higher tiers lead with "Everything in Premium" and their extra benefits.
  const extras = plan.benefits.filter((key) => PLUS_EXTRAS.includes(key));
  const shown = !plan.isFree && extras.length
    ? ["Everything in Premium", ...extras.map((key) => benefitOptions.find((item) => item.key === key)?.label ?? key)].slice(0, 3)
    : labels.slice(0, 3);
  const disabledHint = `plan-${plan.id}-enabled-hint`;
  return (
    <article className={`ui-card cam-plan${editing ? " is-editing" : ""}${plan.enabled ? "" : " is-off"}`} aria-labelledby={`plan-${plan.id}-name`}>
      <div className="cam-plan-top">
        <h2 id={`plan-${plan.id}-name`}>{plan.name}{editing && <span className="community-tag tag-purple">Editing</span>}</h2>
        <span className="cam-plan-toggle">
          <span className="cam-muted-small" aria-hidden="true">{plan.enabled ? "Enabled" : "Disabled"}</span>
          <Switch checked={plan.enabled} label={`${plan.name} plan enabled`} disabled={busy || plan.isFree} describedBy={plan.isFree ? disabledHint : undefined} onChange={onToggle} />
          {plan.isFree && <span id={disabledHint} className="sr-only">The Free plan is always on.</span>}
        </span>
      </div>
      <p className="cam-plan-price"><strong>{price(plan.priceMonthly)}</strong> / {plan.isFree ? "forever" : "month"}</p>
      {!plan.isFree && plan.billing?.yearly && <p className="cam-muted-small">or {price(plan.priceYearly)} / year{saving(plan) > 0 ? ` (save ${saving(plan)}%)` : ""}</p>}
      <p className="cam-muted-small cam-plan-count">
        {plan.isFree
          ? `${numberFormat.format(plan.members ?? 0)} members · default plan for every new student`
          : `${numberFormat.format(plan.subscribers ?? 0)} subscribers · ${plan.monthly ?? 0} monthly · ${plan.yearly ?? 0} yearly`}
      </p>
      <ul className="cam-check-list">
        {shown.map((label) => <li key={label}><Check size={16} aria-hidden="true" />{label}</li>)}
      </ul>
      <button type="button" className={`btn btn-sm ${editing ? "btn-primary" : "btn-outline"}`} onClick={onEdit} disabled={editing} aria-label={editing ? `${plan.name} is open below` : `Edit ${plan.name} plan`}>
        {editing ? "Editing below" : "Edit plan"}
      </button>
    </article>
  );
}

const FIELD_ORDER = ["name", "priceMonthly", "priceYearly", "billing", "benefits"];

function validatePlan(plan) {
  const errors = {};
  if (!plan.name.trim()) errors.name = "Give the plan a name.";
  if (plan.isFree) return errors;
  const monthly = Number(plan.priceMonthly);
  const yearly = Number(plan.priceYearly);
  if (plan.priceMonthly === "" || !(monthly > 0)) errors.priceMonthly = "Enter a monthly price above $0.";
  else if (monthly > 500) errors.priceMonthly = "That price looks too high. Enter a monthly price under $500.";
  if (plan.billing.yearly && (plan.priceYearly === "" || !(yearly > 0))) errors.priceYearly = "Enter a yearly price, or turn off yearly billing.";
  else if (plan.billing.yearly && monthly > 0 && yearly >= monthly * 12) errors.priceYearly = "The yearly price should cost less than 12 monthly payments.";
  if (!plan.billing.monthly && !plan.billing.yearly && !plan.billing.quarterly) errors.billing = "Choose at least one billing option.";
  if (plan.benefits.length === 0) errors.benefits = "Choose at least one benefit.";
  return errors;
}

function PlanForm({ initial, benefitOptions, sample, onCancel, onSaved, onError }) {
  const isNew = !initial.id;
  const toForm = (plan) => ({ ...plan, name: plan.displayName || plan.name, priceMonthly: String(plan.priceMonthly ?? ""), priceYearly: plan.priceYearly === "" ? "" : Number(plan.priceYearly).toFixed(2) });
  const [form, setForm] = useState(() => toForm(initial));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const saved = JSON.stringify(toForm(initial));
  const dirty = JSON.stringify(form) !== saved;
  const priceChanged = !isNew && (Number(form.priceMonthly) !== Number(initial.priceMonthly) || Number(form.priceYearly) !== Number(initial.priceYearly));

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };
  const toggleBenefit = (key) => set("benefits", form.benefits.includes(key) ? form.benefits.filter((item) => item !== key) : [...form.benefits, key]);
  const setBilling = (key, value) => set("billing", { ...form.billing, [key]: value });

  function submit(event) {
    event.preventDefault();
    const found = validatePlan(form);
    if (Object.keys(found).length) {
      setErrors(found);
      const first = FIELD_ORDER.find((field) => found[field]);
      window.requestAnimationFrame(() => document.getElementById(`plan-${first}`)?.focus());
      return;
    }
    setErrors({});
    if (priceChanged && initial.subscribers > 0) { setConfirming(true); return; }
    save();
  }

  async function save() {
    setBusy(true);
    try {
      const shortName = form.name.trim().replace(/^CodeRise\s+/i, "") || form.name.trim();
      const payload = {
        ...form,
        name: isNew ? shortName : initial.name,
        displayName: form.name.trim(),
        enabled: isNew ? false : initial.enabled,
        priceMonthly: form.isFree ? 0 : Number(form.priceMonthly),
        priceYearly: form.isFree || !form.billing.yearly ? 0 : Number(form.priceYearly),
        trialDays: Number(form.trialDays) || 0,
      };
      const result = await savePlan(payload, { sample });
      setConfirming(false);
      onSaved(result?.plan ?? result, isNew ? `${payload.name} created. Turn it on when it's ready for students.` : priceChanged ? "Plan saved. New prices apply to new subscriptions only." : "Plan saved.");
    } catch (saveError) {
      setConfirming(false);
      onError({ type: "error", message: saveError.message || "The plan could not be saved." });
    } finally {
      setBusy(false);
    }
  }

  const errorList = FIELD_ORDER.filter((field) => errors[field]);
  return (
    <form className="ui-card cam-editor cam-split-main" aria-labelledby="plan-form-title" noValidate onSubmit={submit}>
      <div className="ui-card-header">
        <h2 id="plan-form-title">{isNew ? "New plan" : `Edit plan: ${initial.name}`}</h2>
        {!isNew && initial.updatedAt && <span className="cam-muted-small">Last changed {shortDate.format(new Date(initial.updatedAt))}{initial.updatedBy ? ` by ${initial.updatedBy}` : ""}</span>}
      </div>

      {errorList.length > 1 && (
        <div className="community-error-summary" role="alert">
          <strong>Fix these {errorList.length} things first:</strong>
          <ul>{errorList.map((field) => <li key={field}><a href={`#plan-${field}`}>{errors[field]}</a></li>)}</ul>
        </div>
      )}

      <div className="cam-grid-3">
        <Field id="plan-name" label="Plan name" error={errors.name}>
          {(props) => <input {...props} className="ui-input" value={form.name} maxLength={60} onChange={(event) => set("name", event.target.value)} />}
        </Field>
        <Field id="plan-priceMonthly" label="Monthly price (USD)" error={errors.priceMonthly}>
          {(props) => <input {...props} className="ui-input" type="number" inputMode="decimal" min="0" step="0.01" value={form.priceMonthly} disabled={form.isFree} onChange={(event) => set("priceMonthly", event.target.value)} />}
        </Field>
        <Field id="plan-priceYearly" label="Yearly price (USD)" error={errors.priceYearly}>
          {(props) => <input {...props} className="ui-input" type="number" inputMode="decimal" min="0" step="0.01" value={form.priceYearly} disabled={form.isFree || !form.billing.yearly} onChange={(event) => set("priceYearly", event.target.value)} />}
        </Field>
      </div>
      <div className="cam-grid-3">
        <Field id="plan-trial" label="Free trial">
          {(props) => (
            <select {...props} className="ui-input" value={form.trialDays} disabled={form.isFree} onChange={(event) => set("trialDays", Number(event.target.value))}>
              {TRIALS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          )}
        </Field>
      </div>
      <Field id="plan-description" label="Short description">
        {(props) => <textarea {...props} className="ui-input" rows={2} maxLength={200} value={form.description} onChange={(event) => set("description", event.target.value)} />}
      </Field>

      <fieldset className="community-fieldset" id="plan-benefits" tabIndex={-1}>
        <legend>Benefits included</legend>
        <div className="community-checkbox-grid">
          {benefitOptions.filter((item) => form.isFree || !["free_projects", "free_events", "showcase"].includes(item.key)).map((item) => (
            <label key={item.key} className="community-checkbox">
              <input type="checkbox" checked={form.benefits.includes(item.key)} onChange={() => toggleBenefit(item.key)} />
              {item.label}
            </label>
          ))}
        </div>
        {errors.benefits && <p className="field-error">{errors.benefits}</p>}
      </fieldset>

      {!form.isFree && (
        <fieldset className="community-fieldset" id="plan-billing" tabIndex={-1}>
          <legend>Plan duration options</legend>
          <div className="cam-inline-checks">
            {[["monthly", "Monthly billing"], ["yearly", "Yearly billing"], ["quarterly", "Quarterly billing"]].map(([key, label]) => (
              <label key={key} className="community-checkbox">
                <input type="checkbox" checked={form.billing[key]} onChange={(event) => setBilling(key, event.target.checked)} />
                {label}
              </label>
            ))}
          </div>
          {errors.billing && <p className="field-error">{errors.billing}</p>}
        </fieldset>
      )}

      {!form.isFree && (
        <div className="cam-toggle-card">
          <span><strong id="plan-entry-label">Include paid competition entry</strong><small id="plan-entry-hint">Off by default. When on, members join paid competitions without paying the entry fee.</small></span>
          <Switch checked={form.includePaidCompetitionEntry} label="Include paid competition entry" describedBy="plan-entry-hint" onChange={(value) => set("includePaidCompetitionEntry", value)} />
        </div>
      )}
      <div className="cam-toggle-card">
        <span><strong>Show on pricing page</strong><small id="plan-pricing-hint">Hidden plans can still be granted as complimentary access.</small></span>
        <Switch checked={form.showOnPricing} label="Show on pricing page" describedBy="plan-pricing-hint" onChange={(value) => set("showOnPricing", value)} />
      </div>

      <div className="cam-editor-actions">
        <button type="button" className="btn btn-outline" onClick={() => { setForm(toForm(initial)); setErrors({}); if (isNew) onCancel(); }} disabled={busy}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={busy || (!isNew && !dirty)}>{busy ? "Saving…" : isNew ? "Create plan" : "Save plan"}</button>
      </div>

      <ConfirmDialog
        open={confirming}
        title={`Change the ${initial.name} price?`}
        confirmLabel="Save new price"
        busyLabel="Saving…"
        busy={busy}
        onCancel={() => setConfirming(false)}
        onConfirm={save}
      >
        <p>
          New subscribers pay {price(form.priceMonthly || 0)} a month{form.billing.yearly ? ` or ${price(form.priceYearly || 0)} a year` : ""}. The {numberFormat.format(initial.subscribers)} existing
          subscribers keep {price(initial.priceMonthly)} until renewal and are emailed 30 days before it changes.
        </p>
      </ConfirmDialog>
    </form>
  );
}
