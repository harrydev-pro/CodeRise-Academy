import { useEffect, useId, useState } from "react";
import { Search, X } from "lucide-react";

import Modal from "../../../../components/common/Modal";
import { searchMembers, PLAN_LABELS } from "./adminManageService";
import { initials } from "./manageUtils";

// Small components shared by the admin "manage" screens (A19–A27). Helpers live in manageUtils.js.

export function SampleNotice({ children }) {
  return (
    <p className="community-sample-notice" role="status">
      Showing sample data: the admin Community API is not available yet. {children ?? "Changes are kept in this browser tab only."} This notice only appears on the local dev server.
    </p>
  );
}

// An on/off switch. `label` is the accessible name (visible text, if any, is up to the caller).
export function Switch({ checked, onChange, label, disabled = false, describedBy }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      aria-describedby={describedBy}
      className={`cam-switch${checked ? " is-on" : ""}`}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span aria-hidden="true" />
    </button>
  );
}

// Pill filters with counts ("All 14", "Published 9"…). They filter the list below, so they are
// toggle buttons (aria-pressed) rather than ARIA tabs.
export function StatusTabs({ tabs, value, onChange, label }) {
  return (
    <div className="cam-tabs" role="group" aria-label={label}>
      {tabs.map((tab) => (
        <button key={tab.value} type="button" className={`cam-tab${value === tab.value ? " is-active" : ""}`} aria-pressed={value === tab.value} onClick={() => onChange(tab.value)}>
          {tab.label}{typeof tab.count === "number" && <span className="cam-tab-count"> {tab.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, tone = "blue", hint, hintTone, valueTone }) {
  return (
    <div className="community-admin-stat cam-stat">
      {Icon && <span className={`community-icon tone-${tone}`}><Icon size={20} aria-hidden="true" /></span>}
      <span className="min-w-0">
        <span className="community-stat-label">{label}</span>
        <strong className={`community-stat-value${valueTone ? ` cam-value-${valueTone}` : ""}`}>{value}</strong>
        {hint && <span className={`community-admin-hint${hintTone ? ` is-${hintTone}` : ""}`}>{hint}</span>}
      </span>
    </div>
  );
}

export function FilterSelect({ label, value, onChange, options, hideLabel = false }) {
  return (
    <label className="community-admin-field">
      <span className={hideLabel ? "sr-only" : undefined}>{label}</span>
      <select className="ui-input" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

// Label + control + hint + inline error, wired with aria-describedby.
export function Field({ id, label, optional, hint, error, children, className = "" }) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className={`community-field ${className}`}>
      <div className="community-field-label">
        <label htmlFor={id}>{label}{optional && <span className="community-field-optional"> (optional)</span>}</label>
      </div>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {hint && <span id={hintId} className="community-field-hint">{hint}</span>}
      {error && <p id={errorId} className="field-error">{error}</p>}
    </div>
  );
}

export function MemberAvatar({ name, index = 0 }) {
  return <span className={`community-avatar avatar-${index % 4} cam-avatar`} aria-hidden="true">{initials(name)}</span>;
}

// Search-as-you-type member picker. value: the chosen member { id, name, email } or null.
export function MemberPicker({ id, value, onChange, error, filter, emptyText = "No members match that search." }) {
  const listId = useId();
  const [text, setText] = useState("");
  const [found, setFound] = useState({ term: "", members: [] });
  const term = text.trim();

  useEffect(() => {
    if (term.length < 2) return undefined;
    let active = true;
    const timer = window.setTimeout(() => {
      searchMembers(term)
        .then((members) => active && setFound({ term, members }))
        .catch(() => active && setFound({ term, members: [] }));
    }, 250);
    return () => { active = false; window.clearTimeout(timer); };
  }, [term]);

  if (value) {
    return (
      <div className="cam-picked" id={id} tabIndex={-1}>
        <span className="min-w-0"><strong>{value.name}</strong><small>{value.email}</small></span>
        <button type="button" className="community-icon-button" aria-label={`Change member (${value.name})`} onClick={() => onChange(null)}><X size={15} aria-hidden="true" /></button>
      </div>
    );
  }

  const settled = found.term === term && term.length >= 2;
  const members = settled ? found.members.filter((member) => !filter || filter(member)) : [];
  const choose = (member) => { onChange({ id: member.id, name: member.name, email: member.email, plan: member.plan }); setText(""); };
  return (
    <div className="cam-picker">
      <span className="community-search">
        <Search size={18} aria-hidden="true" />
        <input
          id={id}
          type="search"
          className="ui-input"
          autoComplete="off"
          placeholder="Search by name, username or email"
          value={text}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          aria-controls={listId}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            // Enter picks the only match instead of submitting the surrounding form.
            if (event.key !== "Enter") return;
            event.preventDefault();
            if (members.length === 1) choose(members[0]);
          }}
        />
      </span>
      <div id={listId} aria-live="polite">
        {term.length >= 2 && !settled && <p className="cam-picker-note">Searching…</p>}
        {settled && members.length === 0 && <p className="cam-picker-note">{emptyText}</p>}
        {members.length > 0 && (
          <ul className="cam-picker-list" aria-label="Matching members">
            {members.map((member) => (
              <li key={member.id}>
                <button type="button" onClick={() => choose(member)}>
                  <strong>{member.name}</strong>
                  <small>{member.email} · {PLAN_LABELS[member.plan] ?? member.plan}</small>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {error && <p id={`${id}-error`} className="field-error">{error}</p>}
    </div>
  );
}

// Stacked monthly bars (A23 "Revenue by source"). series: [{ key, label, tone }].
export function StackedBars({ items, series, format = (value) => value, label }) {
  if (!items?.length) return <p className="muted-text">No data for this period.</p>;
  const max = Math.max(1, ...items.map((item) => series.reduce((sum, s) => sum + (item[s.key] || 0), 0)));
  const summary = items.map((item) => `${item.label}: ${series.map((s) => `${s.label} ${format(item[s.key] || 0)}`).join(", ")}`).join("; ");
  return (
    <figure className="cam-stacked">
      <ul className="cam-legend" aria-hidden="true">
        {series.map((s) => <li key={s.key}><span className={`cam-dot tone-${s.tone}`} />{s.label}</li>)}
      </ul>
      <div className="cam-stacked-plot" role="img" aria-label={`${label}. ${summary}`}>
        {items.map((item) => (
          <div key={item.label} className="cam-stacked-col">
            <div className="cam-stacked-bar">
              {[...series].reverse().map((s) => (
                <span key={s.key} className={`tone-${s.tone}`} style={{ height: `${((item[s.key] || 0) / max) * 100}%` }} title={`${s.label}: ${format(item[s.key] || 0)}`} />
              ))}
            </div>
            <span className="cam-stacked-label">{item.label}</span>
          </div>
        ))}
      </div>
    </figure>
  );
}

// Labelled progress bars with a formatted value (plan revenue, funnels).
export function ValueBars({ items, format = (value) => value, label }) {
  const max = Math.max(1, ...items.map((item) => item.value));
  return (
    <ul className="ui-bar-list cam-value-bars" aria-label={label}>
      {items.map((item) => (
        <li key={item.label}>
          <div className="ui-bar-label"><span>{item.label}</span><strong>{format(item.value)}</strong></div>
          <div className="ui-bar-track" role="progressbar" aria-label={item.label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={item.value} aria-valuetext={format(item.value)}>
            <div className="ui-bar-fill cam-bar-purple" style={{ width: `${(item.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

// Simple confirmation dialog for destructive or important actions.
export function ConfirmDialog({ open, title, children, confirmLabel, busyLabel, danger = false, onCancel, onConfirm, busy = false, error, confirmDisabled = false, icon }) {
  return (
    <Modal open={open} onClose={busy ? undefined : onCancel} title={title} size="max-w-lg">
      <div className="community-delete-dialog cam-confirm">
        {icon && <span className={danger ? "community-delete-icon" : "cam-confirm-icon"} aria-hidden="true">{icon}</span>}
        {children}
        {error && <p className="field-error" role="alert">{error}</p>}
        <div className="community-delete-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="button" className={`btn btn-sm ${danger ? "community-btn-danger" : "btn-primary cam-btn-admin"}`} onClick={onConfirm} disabled={busy || confirmDisabled}>
            {busy ? busyLabel ?? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
