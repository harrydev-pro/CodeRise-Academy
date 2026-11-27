import { useState } from "react";

import Modal from "../../../../components/common/Modal";
import { grantComplimentary, PLAN_LABELS } from "./adminManageService";
import { MemberPicker } from "./manageControls";

// "Grant complimentary Premium" (A20 Members and A22 Subscriptions). No payment is taken: the
// backend gives access straight away, emails the member and records the admin and reason in the
// activity log. Pass `member` to grant to a known member; otherwise the admin searches for one.
const REASONS = ["Hackathon winner reward", "Competition prize", "Scholarship", "Support goodwill", "Staff or mentor access", "Other"];
const DURATIONS = [
  { value: 1, label: "1 month" },
  { value: 3, label: "3 months" },
  { value: 6, label: "6 months" },
  { value: 12, label: "12 months" },
];

export default function GrantPremiumDialog({ open, member: fixedMember, sample, onClose, onGranted }) {
  const [member, setMember] = useState(fixedMember ?? null);
  const [plan, setPlan] = useState("premium");
  const [months, setMonths] = useState(1);
  const [reason, setReason] = useState(REASONS[0]);
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const found = {};
    if (!member) found.member = "Choose the member who should get access.";
    else if (member.plan && member.plan !== "free") found.member = `${member.name} already has ${PLAN_LABELS[member.plan]}.`;
    if (reason === "Other" && !note.trim()) found.note = "Explain the reason in the note.";
    setErrors(found);
    if (Object.keys(found).length) {
      document.getElementById(found.member ? "grant-member" : "grant-note")?.focus();
      return;
    }
    setBusy(true);
    try {
      await grantComplimentary({ memberId: member.id, plan, months, reason, note: note.trim() }, { sample });
      onGranted(`${member.name} now has complimentary ${PLAN_LABELS[plan]} for ${months} ${months === 1 ? "month" : "months"}.`);
    } catch (grantError) {
      setErrors({ form: grantError.message || "Access could not be granted. Please try again." });
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={busy ? undefined : onClose} title="Grant complimentary Premium" description="The member gets access immediately and is notified by email. No payment is taken." size="max-w-lg">
      <form className="cam-dialog-form" onSubmit={submit} noValidate>
        <div className="community-field">
          <label htmlFor="grant-member" className="cam-label">Member</label>
          {fixedMember ? (
            <div className="cam-picked"><span className="min-w-0"><strong>{fixedMember.name}</strong><small>{fixedMember.email}</small></span></div>
          ) : (
            <MemberPicker id="grant-member" value={member} onChange={(value) => { setMember(value); setErrors((current) => ({ ...current, member: undefined })); }} error={errors.member} />
          )}
          {fixedMember && errors.member && <p className="field-error">{errors.member}</p>}
        </div>
        <div className="community-field-grid cam-grid-2">
          <div className="community-field">
            <label htmlFor="grant-plan" className="cam-label">Plan</label>
            <select id="grant-plan" className="ui-input" value={plan} onChange={(event) => setPlan(event.target.value)}>
              <option value="premium">Premium</option>
              <option value="premium_plus">Premium Plus</option>
            </select>
          </div>
          <div className="community-field">
            <label htmlFor="grant-months" className="cam-label">Duration</label>
            <select id="grant-months" className="ui-input" value={months} onChange={(event) => setMonths(Number(event.target.value))}>
              {DURATIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </div>
        </div>
        <div className="community-field">
          <label htmlFor="grant-reason" className="cam-label">Reason (kept in the activity log)</label>
          <select id="grant-reason" className="ui-input" value={reason} onChange={(event) => setReason(event.target.value)}>
            {REASONS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <div className="community-field">
          <label htmlFor="grant-note" className="cam-label">Note{reason !== "Other" && <span className="community-field-optional"> (optional)</span>}</label>
          <textarea id="grant-note" className="ui-input" rows={2} value={note} aria-invalid={Boolean(errors.note)} aria-describedby={errors.note ? "grant-note-error" : undefined} onChange={(event) => setNote(event.target.value)} />
          {errors.note && <p id="grant-note-error" className="field-error">{errors.note}</p>}
        </div>
        {sample && <p className="community-sample-notice">Sample mode: access is granted in this browser tab only and no email is sent.</p>}
        {errors.form && <p className="field-error" role="alert">{errors.form}</p>}
        <div className="community-delete-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={onClose} disabled={busy}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-sm cam-btn-admin" disabled={busy}>{busy ? "Granting…" : "Grant access"}</button>
        </div>
      </form>
    </Modal>
  );
}
