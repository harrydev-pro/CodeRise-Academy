import { useRef, useState } from "react";
import { Plus } from "lucide-react";

import Loader from "../../../../components/common/Loader";
import ErrorMessage from "../../../../components/feedback/ErrorMessage";
import Toast from "../../../../components/feedback/Toast";
import { awardBadge, emptyBadge, getAdminBadges, saveBadge, setBadgeEnabled } from "../../../../features/community/admin/manage/adminManageService";
import { BADGE_COLOURS, BADGE_ICON_LABELS, BADGE_ICONS, BADGE_TRIGGERS, badgeRule } from "../../../../features/community/admin/manage/badgeOptions";
import { Field, MemberPicker, SampleNotice, Switch } from "../../../../features/community/admin/manage/manageControls";
import { numberFormat, useToastState } from "../../../../features/community/admin/manage/manageUtils";
import { useCommunityList } from "../../../../features/community/listHooks";

const NO_FILTERS = {};
// Fields this form edits (the on/off switch and award count are changed elsewhere).
const editable = ({ id, name, description, icon, colour, trigger, count, bonusPoints, showOnProfile, premiumOnly }) => ({ id, name, description, icon, colour, trigger, count, bonusPoints, showOnProfile, premiumOnly });

function BadgeIcon({ icon, colour, size = 22, large = false }) {
  const Icon = BADGE_ICONS[icon] ?? BADGE_ICONS.award;
  return <span className={`cam-badge-icon cam-tone-${colour}${large ? " is-large" : ""}`} aria-hidden="true"><Icon size={size} /></span>;
}

export default function AdminCommunityBadges() {
  const { data, error, loading, refreshing, reload } = useCommunityList(getAdminBadges, NO_FILTERS);
  const [editing, setEditing] = useState(null); // badge id, "new" or null
  const [busy, setBusy] = useState("");
  const [toast, setToast, closeToast] = useToastState();
  const panelRef = useRef(null);
  const sample = Boolean(data?.isSample);
  const badges = data?.badges ?? [];
  const current = editing === "new" ? emptyBadge() : badges.find((badge) => badge.id === editing);

  function edit(id) {
    setEditing(id);
    window.requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 1099px)").matches) panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      panelRef.current?.querySelector("input")?.focus({ preventScroll: true });
    });
  }

  async function toggle(badge, enabled) {
    setBusy(badge.id);
    try {
      await setBadgeEnabled(badge.id, enabled, { sample });
      setToast({ type: "success", message: enabled ? `${badge.name} is on. Members who meet the rule from now on will receive it.` : `${badge.name} is off. Members keep badges they already earned.` });
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
          <span className="eyebrow">GAMIFICATION</span>
          <h1>Achievement badges</h1>
          <p>Badges are awarded automatically when a verified backend event meets the rule, or manually by an admin.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => edit("new")}><Plus size={17} aria-hidden="true" /> New badge</button>
      </header>

      {sample && <SampleNotice />}
      {loading && <Loader label="Loading badges…" />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && (
        <div className={`cam-split${current ? "" : " is-single"}`}>
          <ul className={`cam-badge-grid cam-split-main${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing} aria-label="Badges">
            {badges.map((badge) => {
              const active = badge.id === editing;
              return (
                <li key={badge.id} className={`ui-card cam-badge${active ? " is-editing" : ""}${badge.enabled ? "" : " is-off"}`}>
                  <div className="cam-badge-top">
                    <BadgeIcon icon={badge.icon} colour={badge.colour} />
                    <Switch checked={badge.enabled} label={`${badge.name} badge enabled`} disabled={busy === badge.id} onChange={(value) => toggle(badge, value)} />
                  </div>
                  <h2 className="cam-badge-name">
                    {badge.name}
                    {active && <span className="community-tag tag-blue">Editing</span>}
                    {!badge.enabled && <span className="community-tag tag-neutral">Inactive</span>}
                  </h2>
                  <p className="cam-muted-small">{badgeRule(badge)}</p>
                  <div className="cam-badge-foot">
                    <span className="cam-muted-small">Awarded {numberFormat.format(badge.awarded)} {badge.awarded === 1 ? "time" : "times"}</span>
                    <button type="button" className={`btn btn-sm ${active ? "btn-primary" : "btn-outline"}`} onClick={() => edit(badge.id)} aria-label={active ? `Editing ${badge.name}` : `Edit ${badge.name}`} aria-pressed={active}>
                      {active ? "Editing" : "Edit"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {current && (
            <div className="cam-split-side" ref={panelRef}>
              <BadgeForm
                key={editing}
                initial={current}
                sample={sample}
                onCancel={() => setEditing(null)}
                onSaved={(saved, message) => { setEditing(saved.id); setToast({ type: "success", message }); reload(); }}
                onToast={setToast}
                onAwarded={reload}
              />
            </div>
          )}
        </div>
      )}
      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </section>
  );
}

function BadgeForm({ initial, sample, onCancel, onSaved, onToast, onAwarded }) {
  const isNew = !initial.id;
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [pickIcon, setPickIcon] = useState(false);
  const dirty = JSON.stringify(editable(form)) !== JSON.stringify(editable(initial));
  const set = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  async function submit(event) {
    event.preventDefault();
    const found = {};
    if (!form.name.trim()) found.name = "Give the badge a name.";
    if (!form.description.trim()) found.description = "Describe what students did to earn it.";
    if (form.trigger !== "manual_only" && !(Number(form.count) >= 1)) found.count = "Enter 1 or more.";
    if (!(Number(form.bonusPoints) >= 0) || Number(form.bonusPoints) > 1000) found.bonusPoints = "Enter 0 to 1,000 points.";
    setErrors(found);
    const first = ["name", "description", "count", "bonusPoints"].find((field) => found[field]);
    if (first) { document.getElementById(`badge-${first}`)?.focus(); return; }
    setBusy(true);
    try {
      const result = await saveBadge({ ...editable(form), enabled: isNew ? false : initial.enabled, name: form.name.trim(), description: form.description.trim(), count: Number(form.count) || 1, bonusPoints: Number(form.bonusPoints) || 0 }, { sample });
      onSaved(result?.badge ?? result, isNew ? `${form.name.trim()} created. Turn it on when it's ready.` : "Badge saved.");
    } catch (saveError) {
      onToast({ type: "error", message: saveError.message || "The badge could not be saved." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cam-stack">
      <form className="ui-card cam-editor" aria-labelledby="badge-form-title" noValidate onSubmit={submit}>
        <h2 id="badge-form-title">{isNew ? "New badge" : "Edit badge"}</h2>
        <div className="cam-badge-preview">
          <BadgeIcon icon={form.icon} colour={form.colour} size={28} large />
          <button type="button" className="btn btn-outline btn-sm" aria-expanded={pickIcon} aria-controls="badge-icon-picker" onClick={() => setPickIcon((value) => !value)}>Change icon</button>
        </div>
        {pickIcon && (
          <fieldset id="badge-icon-picker" className="community-fieldset">
            <legend>Icon</legend>
            <div className="cam-icon-picker">
              {Object.keys(BADGE_ICONS).map((key) => {
                const Icon = BADGE_ICONS[key];
                return (
                  <label key={key} className={`cam-icon-option${form.icon === key ? " is-checked" : ""}`}>
                    <input type="radio" name="badge-icon" className="sr-only" checked={form.icon === key} onChange={() => set("icon", key)} />
                    <Icon size={20} aria-hidden="true" />
                    <span className="sr-only">{BADGE_ICON_LABELS[key]}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}
        <Field id="badge-name" label="Badge name" error={errors.name}>
          {(props) => <input {...props} className="ui-input" maxLength={40} value={form.name} onChange={(event) => set("name", event.target.value)} />}
        </Field>
        <Field id="badge-description" label="Description shown to students" error={errors.description}>
          {(props) => <textarea {...props} className="ui-input" rows={2} maxLength={160} value={form.description} onChange={(event) => set("description", event.target.value)} />}
        </Field>
        <Field id="badge-trigger" label="Trigger event">
          {(props) => (
            <select {...props} className="ui-input" value={form.trigger} onChange={(event) => set("trigger", event.target.value)}>
              {BADGE_TRIGGERS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          )}
        </Field>
        <div className="cam-grid-2">
          <Field id="badge-count" label="Required count" error={errors.count}>
            {(props) => <input {...props} className="ui-input" type="number" inputMode="numeric" min="1" value={form.count} disabled={form.trigger === "manual_only"} onChange={(event) => set("count", event.target.value)} />}
          </Field>
          <Field id="badge-bonusPoints" label="Bonus points" error={errors.bonusPoints}>
            {(props) => <input {...props} className="ui-input" type="number" inputMode="numeric" min="0" max="1000" value={form.bonusPoints} onChange={(event) => set("bonusPoints", event.target.value)} />}
          </Field>
        </div>
        <p className="cam-muted-small" aria-live="polite">{badgeRule(form)}</p>
        <Field id="badge-colour" label="Badge colour">
          {(props) => (
            <select {...props} className="ui-input" value={form.colour} onChange={(event) => set("colour", event.target.value)}>
              {BADGE_COLOURS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          )}
        </Field>
        <label className="community-checkbox"><input type="checkbox" checked={form.showOnProfile} onChange={(event) => set("showOnProfile", event.target.checked)} /> Show on public profiles</label>
        <label className="community-checkbox"><input type="checkbox" checked={form.premiumOnly} onChange={(event) => set("premiumOnly", event.target.checked)} /> Premium members only</label>
        <div className="cam-editor-actions">
          <button type="button" className="btn btn-outline" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={busy || (!isNew && !dirty)}>{busy ? "Saving…" : isNew ? "Create badge" : "Save badge"}</button>
        </div>
      </form>
      {!isNew && <ManualAward badge={initial} sample={sample} onToast={onToast} onAwarded={onAwarded} />}
    </div>
  );
}

function ManualAward({ badge, sample, onToast, onAwarded }) {
  const [member, setMember] = useState(null);
  const [reason, setReason] = useState("");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const found = {};
    if (!member) found.member = "Choose a member.";
    if (!reason.trim()) found.reason = "Give a reason. It is kept in the activity log.";
    setErrors(found);
    if (found.member) { document.getElementById("award-member")?.focus(); return; }
    if (found.reason) { document.getElementById("award-reason")?.focus(); return; }
    setBusy(true);
    try {
      await awardBadge(badge.id, { memberId: member.id, reason: reason.trim() }, { sample });
      onToast({ type: "success", message: `${badge.name} awarded to ${member.name}.` });
      setMember(null);
      setReason("");
      onAwarded();
    } catch (awardError) {
      onToast({ type: "error", message: awardError.message || "The badge could not be awarded." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="ui-card cam-editor" aria-labelledby="award-title" noValidate onSubmit={submit}>
      <h2 id="award-title">Award manually</h2>
      <p className="cam-muted-small">For events the system could not see, such as an offline event. The award and reason are logged with your name.</p>
      <div className="community-field">
        <label htmlFor="award-member" className="cam-label">Member</label>
        <MemberPicker id="award-member" value={member} onChange={(value) => { setMember(value); setErrors((current) => ({ ...current, member: undefined })); }} error={errors.member} />
      </div>
      <Field id="award-reason" label="Reason" error={errors.reason}>
        {(props) => <input {...props} className="ui-input" value={reason} maxLength={200} onChange={(event) => setReason(event.target.value)} />}
      </Field>
      <div className="cam-editor-actions">
        <button type="submit" className="btn btn-outline" disabled={busy}>{busy ? "Awarding…" : "Award badge"}</button>
      </div>
    </form>
  );
}
