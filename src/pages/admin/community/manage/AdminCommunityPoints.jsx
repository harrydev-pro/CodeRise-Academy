import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

import Loader from "../../../../components/common/Loader";
import ErrorMessage from "../../../../components/feedback/ErrorMessage";
import Toast from "../../../../components/feedback/Toast";
import { adjustPoints, getPointSettings, savePointRules } from "../../../../features/community/admin/manage/adminManageService";
import { ConfirmDialog, Field, MemberPicker, SampleNotice, Switch } from "../../../../features/community/admin/manage/manageControls";
import { fullDate, numberFormat, useToastState } from "../../../../features/community/admin/manage/manageUtils";
import { useCommunityList } from "../../../../features/community/listHooks";

const NO_FILTERS = {};
const toForm = (rules) => rules.map((rule) => ({ ...rule, points: String(rule.points), maxPerDay: rule.maxPerDay === null || rule.maxPerDay === undefined ? "" : String(rule.maxPerDay) }));

export default function AdminCommunityPoints() {
  const { data, error, loading, reload } = useCommunityList(getPointSettings, NO_FILTERS);
  const [toast, setToast, closeToast] = useToastState();

  return (
    <>
      {loading && <section className="admin-page"><Loader label="Loading point rules…" /></section>}
      {error && <section className="admin-page community-admin cam-page"><ErrorMessage message={error} onRetry={reload} /></section>}
      {data && <PointsPage key={JSON.stringify(data.rules)} data={data} onToast={setToast} reload={reload} />}
      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </>
  );
}

function validateRules(rules) {
  const errors = {};
  rules.forEach((rule) => {
    const points = Number(rule.points);
    if (rule.points === "" || !Number.isInteger(points) || points < 0 || points > 1000) errors[`${rule.id}-points`] = "Enter a whole number from 0 to 1,000.";
    if (rule.maxPerDay !== "" && (!Number.isInteger(Number(rule.maxPerDay)) || Number(rule.maxPerDay) < 1 || Number(rule.maxPerDay) > 100)) errors[`${rule.id}-max`] = "Leave empty for no limit, or enter 1 to 100.";
  });
  return errors;
}

function PointsPage({ data, onToast, reload }) {
  const [rules, setRules] = useState(() => toForm(data.rules));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const initial = JSON.stringify(toForm(data.rules));
  const dirty = JSON.stringify(rules) !== initial;
  const sample = Boolean(data.isSample);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function change(id, field, value) {
    setRules((current) => current.map((rule) => (rule.id === id ? { ...rule, [field]: value } : rule)));
    const key = `${id}-${field === "points" ? "points" : "max"}`;
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function save() {
    const found = validateRules(rules);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) { document.getElementById(`rule-${first}`)?.focus(); return; }
    setBusy(true);
    try {
      await savePointRules(rules, { sample });
      onToast({ type: "success", message: "Point rules saved. New values apply to future events only." });
      reload();
    } catch (saveError) {
      onToast({ type: "error", message: saveError.message || "The point rules could not be saved." });
    } finally {
      setBusy(false);
    }
  }

  const errorCount = Object.values(errors).filter(Boolean).length;

  return (
    <section className="admin-page community-admin cam-page">
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">GAMIFICATION</span>
          <h1>Point system</h1>
          <p>Set how many points each activity is worth. New values apply to future events only.</p>
        </div>
        <div className="community-editor-actions">
          <button type="button" className="btn btn-outline" onClick={() => setConfirmDiscard(true)} disabled={!dirty || busy}>Discard</button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={!dirty || busy}>{busy ? "Saving…" : "Save point rules"}</button>
        </div>
      </header>

      {sample && <SampleNotice>Changes are kept in this browser tab only and no member's points change.</SampleNotice>}

      <div className="cam-notice is-info" role="note">
        <ShieldCheck size={20} aria-hidden="true" />
        <div>
          <h2>Points are awarded only by verified backend events</h2>
          <p>Students can never set or change their own points. Every award comes from an approved review, a published result or a confirmed payment, and every manual change is logged with the admin&apos;s name and reason.</p>
        </div>
      </div>

      {errorCount > 0 && (
        <div className="community-error-summary" role="alert">
          <strong>Fix {errorCount === 1 ? "this" : `these ${errorCount} values`} before saving.</strong>
        </div>
      )}

      <section className="ui-card community-admin-table-card" aria-label="Point rules">
        <div className="community-table-wrap" tabIndex={0} role="region" aria-label="Point rules (scrolls sideways)">
          <table className="community-table cam-points-table">
            <thead>
              <tr>
                <th scope="col">Activity</th>
                <th scope="col">Triggered by</th>
                <th scope="col">Points</th>
                <th scope="col">Max per day</th>
                <th scope="col" className="is-number">Awarded (30 days)</th>
                <th scope="col">Active</th>
              </tr>
            </thead>
            <tbody>
              {rules.map((rule) => (
                <tr key={rule.id} className={rule.enabled ? undefined : "cam-row-off"}>
                  <th scope="row"><strong>{rule.activity}</strong></th>
                  <td className="cam-muted-cell">{rule.triggeredBy}</td>
                  <td>
                    <input
                      id={`rule-${rule.id}-points`}
                      className="ui-input cam-number-input"
                      type="number"
                      inputMode="numeric"
                      min="0"
                      max="1000"
                      aria-label={`Points for ${rule.activity}`}
                      aria-invalid={Boolean(errors[`${rule.id}-points`])}
                      title={errors[`${rule.id}-points`]}
                      value={rule.points}
                      onChange={(event) => change(rule.id, "points", event.target.value)}
                    />
                    {errors[`${rule.id}-points`] && <span className="field-error cam-cell-error">{errors[`${rule.id}-points`]}</span>}
                  </td>
                  <td>
                    <input
                      id={`rule-${rule.id}-max`}
                      className="ui-input cam-number-input"
                      type="number"
                      inputMode="numeric"
                      min="1"
                      placeholder="No limit"
                      aria-label={`Maximum awards per day for ${rule.activity}`}
                      aria-invalid={Boolean(errors[`${rule.id}-max`])}
                      value={rule.maxPerDay}
                      onChange={(event) => change(rule.id, "maxPerDay", event.target.value)}
                    />
                    {errors[`${rule.id}-max`] && <span className="field-error cam-cell-error">{errors[`${rule.id}-max`]}</span>}
                  </td>
                  <td className="is-number">{numberFormat.format(rule.awarded30d ?? 0)}</td>
                  <td><Switch checked={rule.enabled} label={`${rule.activity} active`} onChange={(value) => change(rule.id, "enabled", value)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="cam-points-bottom">
        <ManualAdjustment sample={sample} onToast={onToast} onDone={reload} disabled={dirty} />
        <section className="ui-card community-admin-table-card" aria-labelledby="audit-title">
          <div className="ui-card-header">
            <h2 id="audit-title">Audit log</h2>
            <span className="community-timeline-month">Latest changes</span>
          </div>
          {data.audit.length === 0 ? <p className="muted-text cam-pad">No changes yet.</p> : (
            <div className="community-table-wrap" tabIndex={0} role="region" aria-label="Points audit log (scrolls sideways)">
              <table className="community-table">
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Member</th>
                    <th scope="col">Change</th>
                    <th scope="col">Reason</th>
                    <th scope="col">By</th>
                  </tr>
                </thead>
                <tbody>
                  {data.audit.map((entry) => (
                    <tr key={entry.id}>
                      <td>{fullDate.format(new Date(entry.date))}</td>
                      <td>{entry.member}</td>
                      <td>
                        {entry.kind === "rule_change" || entry.change === null
                          ? <span className="cam-muted-cell">Rule change</span>
                          : <strong className={entry.change < 0 ? "cam-negative" : "cam-positive"}>{entry.change < 0 ? "−" : "+"}{numberFormat.format(Math.abs(entry.change))}</strong>}
                      </td>
                      <td className="cam-wrap-cell">{entry.reason}</td>
                      <td>{entry.by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={confirmDiscard}
        title="Discard your changes?"
        confirmLabel="Discard changes"
        danger
        onCancel={() => setConfirmDiscard(false)}
        onConfirm={() => { setRules(toForm(data.rules)); setErrors({}); setConfirmDiscard(false); }}
      >
        <p>The point rules go back to the last saved values.</p>
      </ConfirmDialog>
    </section>
  );
}

function ManualAdjustment({ sample, onToast, onDone, disabled }) {
  const [member, setMember] = useState(null);
  const [type, setType] = useState("add");
  const [amount, setAmount] = useState("50");
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);

  function submit(event) {
    event.preventDefault();
    const found = {};
    if (!member) found.member = "Choose a member.";
    const value = Number(amount);
    if (!Number.isInteger(value) || value < 1 || value > 1000) found.amount = "Enter a whole number from 1 to 1,000.";
    if (reason.trim().length < 10) found.reason = "Explain the correction in a sentence. It is shown in the audit log.";
    setErrors(found);
    const first = ["member", "amount", "reason"].find((field) => found[field]);
    if (first) { document.getElementById(`adjust-${first}`)?.focus(); return; }
    setConfirming(true);
  }

  async function apply() {
    setBusy(true);
    try {
      await adjustPoints({ memberId: member.id, type, amount: Number(amount), reason: reason.trim() }, { sample });
      onToast({ type: "success", message: `${type === "add" ? "Added" : "Removed"} ${amount} points ${type === "add" ? "to" : "from"} ${member.name}. Logged in the audit log.` });
      setMember(null);
      setReason("");
      setConfirming(false);
      onDone();
    } catch (adjustError) {
      setConfirming(false);
      onToast({ type: "error", message: adjustError.message || "The adjustment could not be applied." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="ui-card cam-editor" aria-labelledby="adjust-title" noValidate onSubmit={submit}>
      <h2 id="adjust-title">Manual adjustment</h2>
      <p className="cam-muted-small">Use for corrections only, for example a missed award or a removed fake submission.</p>
      <div className="community-field">
        <label htmlFor="adjust-member" className="cam-label">Member</label>
        <MemberPicker id="adjust-member" value={member} onChange={(value) => { setMember(value); setErrors((current) => ({ ...current, member: undefined })); }} error={errors.member} />
      </div>
      <div className="cam-grid-2">
        <Field id="adjust-type" label="Type">
          {(props) => (
            <select {...props} className="ui-input" value={type} onChange={(event) => setType(event.target.value)}>
              <option value="add">Add points</option>
              <option value="remove">Remove points</option>
            </select>
          )}
        </Field>
        <Field id="adjust-amount" label="Amount" error={errors.amount}>
          {(props) => <input {...props} className="ui-input" type="number" inputMode="numeric" min="1" max="1000" value={amount} onChange={(event) => setAmount(event.target.value)} />}
        </Field>
      </div>
      <Field id="adjust-reason" label="Reason (required, shown in the audit log)" error={errors.reason}>
        {(props) => <textarea {...props} className="ui-input" rows={3} maxLength={300} value={reason} onChange={(event) => setReason(event.target.value)} />}
      </Field>
      {disabled && <p className="cam-muted-small">Save or discard your point rule changes first.</p>}
      <div className="cam-editor-actions">
        <button type="submit" className="btn btn-primary" disabled={busy || disabled}>{busy ? "Applying…" : "Apply adjustment"}</button>
      </div>
      <ConfirmDialog
        open={confirming}
        title={`${type === "add" ? "Add" : "Remove"} ${amount} points?`}
        confirmLabel="Apply adjustment"
        busyLabel="Applying…"
        busy={busy}
        danger={type === "remove"}
        onCancel={() => setConfirming(false)}
        onConfirm={apply}
      >
        <p>{member?.name} {type === "add" ? "gets" : "loses"} {amount} points straight away. The change is logged with your name and this reason: “{reason.trim()}”.</p>
      </ConfirmDialog>
    </form>
  );
}
