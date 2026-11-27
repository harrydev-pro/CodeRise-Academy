import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";

// Small shared pieces for the admin competition / payment / review screens (A12–A18).

export function SampleNotice({ children }) {
  return (
    <p className="community-sample-notice" role="status">
      {children ?? "Showing sample data: the admin Community API is not available yet. Changes are kept in this browser tab only. This notice only appears on the local dev server."}
    </p>
  );
}

export function Tag({ map, value, fallback }) {
  const item = map[value] ?? fallback ?? { label: value, tone: "neutral" };
  return <span className={`community-tag tag-${item.tone}`}>{item.label}</span>;
}

export function Avatar({ initials, index = 0, size = "" }) {
  return <span className={`community-avatar car-avatar avatar-${index % 4} ${size}`} aria-hidden="true">{initials}</span>;
}

// Stat tile (not a link) from the A12/A14/A15 designs.
export function StatTile({ label, value, suffix, icon: Icon, tone = "blue", hint, hintTone, alert = false, valueTone }) {
  return (
    <div className={`community-admin-stat car-stat${alert ? " is-alert" : ""}`}>
      {Icon && <span className={`community-icon tone-${tone}`}><Icon size={20} aria-hidden="true" /></span>}
      <span className="min-w-0">
        <span className="community-stat-label">{label}</span>
        <strong className={`community-stat-value${valueTone ? ` car-value-${valueTone}` : ""}`}>
          {value}{suffix && <small className="car-stat-suffix"> {suffix}</small>}
        </strong>
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

// Details / Participants / Payments / Submissions / Results tabs for one competition.
// Reviewers (judges) only get the tabs the backend lets them open.
export function CompetitionTabs({ id, current, viewerRole = "admin" }) {
  const base = `/admin/community/competitions/${encodeURIComponent(id)}`;
  const tabs = [
    { key: "details", label: "Details", to: `${base}/edit`, adminOnly: true },
    { key: "participants", label: "Participants", to: `${base}/participants`, adminOnly: true },
    { key: "payments", label: "Payments", to: `/admin/community/payments?competition=${encodeURIComponent(id)}`, adminOnly: true },
    { key: "submissions", label: "Submissions", to: `/admin/community/submissions?type=competition&project=${encodeURIComponent(id)}` },
    { key: "results", label: "Results", to: `${base}/results` },
  ].filter((tab) => viewerRole !== "reviewer" || !tab.adminOnly);
  return (
    <nav className="car-tabs" aria-label="Competition sections">
      {tabs.map((tab) => (
        <Link key={tab.key} to={tab.to} className={`car-tab${tab.key === current ? " active" : ""}`} aria-current={tab.key === current ? "page" : undefined}>
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

// "⋯" row menu. Fixed to the window so the table's scroll area can't clip it.
// items: [{ key, label, icon, to } | { key, label, icon, onClick, danger }]
export function RowMenu({ label, items, disabled }) {
  const [position, setPosition] = useState(null);
  const open = Boolean(position);
  const wrapper = useRef(null);

  function toggle(event) {
    if (open) { setPosition(null); return; }
    const rect = event.currentTarget.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom > 220;
    setPosition({
      right: Math.max(8, window.innerWidth - rect.right),
      ...(below ? { top: rect.bottom + 4, bottom: "auto" } : { top: "auto", bottom: window.innerHeight - rect.top + 4 }),
    });
  }

  useEffect(() => {
    if (!open) return undefined;
    const close = () => setPosition(null);
    function onPointer(event) { if (!wrapper.current?.contains(event.target)) close(); }
    function onKey(event) {
      if (event.key === "Escape") { close(); wrapper.current?.querySelector("button")?.focus(); }
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    wrapper.current?.querySelector('[role="menuitem"]')?.focus();
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  return (
    <div className="community-row-menu" ref={wrapper}>
      <button type="button" className="community-row-menu-button" aria-haspopup="menu" aria-expanded={open} aria-label={label} disabled={disabled} onClick={toggle}>
        <MoreHorizontal size={18} aria-hidden="true" />
      </button>
      {open && (
        <div className="community-row-menu-list" role="menu" aria-label={label} style={{ position: "fixed", ...position }}>
          {items.map(({ key, label: text, icon: Icon, to, onClick, danger }) => (to
            ? <Link key={key} role="menuitem" to={to}>{Icon && <Icon size={15} aria-hidden="true" />} {text}</Link>
            : (
              <button key={key} type="button" role="menuitem" className={danger ? "is-danger" : undefined} onClick={() => { setPosition(null); onClick(); }}>
                {Icon && <Icon size={15} aria-hidden="true" />} {text}
              </button>
            )))}
        </div>
      )}
    </div>
  );
}

// Labelled form field: passes id / aria props to the control.
export function Field({ id, label, optional, hint, error, counter, children }) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="community-field">
      <div className="community-field-label">
        <label htmlFor={id}>{label}{optional && <span className="community-field-optional"> (optional)</span>}</label>
        {counter}
      </div>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {hint && <p id={hintId} className="car-field-help">{hint}</p>}
      {error && <p id={errorId} className="field-error">{error}</p>}
    </div>
  );
}

export function Card({ title, aside, children, className = "" }) {
  const headingId = useId();
  return (
    <section className={`ui-card community-editor-card ${className}`} aria-labelledby={headingId}>
      <div className="ui-card-header">
        <h2 id={headingId}>{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

// Accessible on/off switch.
export function Switch({ checked, onChange, label, disabled }) {
  return (
    <label className="car-switch">
      <span>{label}</span>
      <input type="checkbox" role="switch" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
      <span className="car-switch-track" aria-hidden="true" />
    </label>
  );
}

export function SimplePager({ pagination, onPage, label }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  return (
    <nav className="community-pager car-simple-pager" aria-label={label}>
      <button type="button" className="community-page-button" disabled={pagination.page <= 1} onClick={() => onPage(pagination.page - 1)}>Previous</button>
      <span className="car-page-of">Page {pagination.page} of {pagination.totalPages}</span>
      <button type="button" className="community-page-button" disabled={pagination.page >= pagination.totalPages} onClick={() => onPage(pagination.page + 1)}>Next</button>
    </nav>
  );
}
