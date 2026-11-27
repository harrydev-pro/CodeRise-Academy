import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MoreHorizontal, Search, X } from "lucide-react";

// Shared components for the admin Collaboration, Team and Hackathon screens (A05–A11).
// Helpers and hooks live in eventHelpers.js.

export function SampleNotice({ editing = false }) {
  return (
    <p className="community-sample-notice" role="status">
      Showing sample data: the admin Community API is not available yet. {editing ? "Saving keeps" : "Changes are kept"} in this browser tab only.
      This notice only appears on the local dev server.
    </p>
  );
}

export function SearchField({ label, placeholder, value, onChange }) {
  return (
    <label className="community-admin-field community-admin-search">
      <span className="sr-only">{label}</span>
      <span className="community-search">
        <Search size={18} aria-hidden="true" />
        <input type="search" className="ui-input" placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
      </span>
    </label>
  );
}

export function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="community-admin-field">
      <span className="sr-only">{label}</span>
      <select className="ui-input" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

export function StatCard({ label, value, icon: Icon, tone, hint, hintTone }) {
  return (
    <div className="community-admin-stat cae-stat">
      {Icon && <span className={`community-icon tone-${tone}`}><Icon size={20} aria-hidden="true" /></span>}
      <span className="min-w-0">
        <span className="community-stat-label">{label}</span>
        <strong className="community-stat-value">{value}</strong>
        {hint && <span className={`community-admin-hint${hintTone ? ` is-${hintTone}` : ""}`}>{hint}</span>}
      </span>
    </div>
  );
}

export function Tag({ tone = "neutral", children }) {
  return <span className={`community-tag tag-${tone}`}>{children}</span>;
}

// "⋯" menu. items: [{ label, icon, to } | { label, icon, href } (new tab) | { label, icon, onSelect, danger }]
// The list is fixed to the window so a table's scroll area can't clip it.
export function RowMenu({ label, items, disabled }) {
  const [position, setPosition] = useState(null);
  const open = Boolean(position);
  const wrapper = useRef(null);

  function toggle(event) {
    if (open) { setPosition(null); return; }
    const rect = event.currentTarget.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom > 60 + items.length * 40;
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

  const close = () => setPosition(null);

  return (
    <div className="community-row-menu" ref={wrapper}>
      <button type="button" className="community-row-menu-button cae-menu-button" aria-haspopup="menu" aria-expanded={open} aria-label={label} disabled={disabled} onClick={toggle}>
        <MoreHorizontal size={18} aria-hidden="true" />
      </button>
      {open && (
        <div className="community-row-menu-list" role="menu" aria-label={label} style={{ position: "fixed", ...position }}>
          {items.map(({ label: text, icon: Icon, to, href, onSelect, danger }) => {
            const content = <>{Icon && <Icon size={15} aria-hidden="true" />} {text}</>;
            if (to) return <Link key={text} role="menuitem" to={to} onClick={close}>{content}</Link>;
            if (href) {
              return (
                <a key={text} role="menuitem" href={href} target="_blank" rel="noopener noreferrer" onClick={close}>
                  {content}<span className="sr-only"> (opens in a new tab)</span>
                </a>
              );
            }
            return <button key={text} type="button" role="menuitem" className={danger ? "is-danger" : undefined} onClick={() => { close(); onSelect(); }}>{content}</button>;
          })}
        </div>
      )}
    </div>
  );
}

export function ProgressBar({ value, label }) {
  return (
    <span className="cae-progress">
      <span className="cae-progress-track" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
        <span style={{ width: `${value}%` }} />
      </span>
      <span className="cae-progress-value">{value}%</span>
    </span>
  );
}

// ---------- editor helpers ----------

export function Field({ id, label, optional, hint, error, children }) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="community-field">
      <div className="community-field-label">
        <label htmlFor={id}>{label}{optional && <span className="community-field-optional"> (optional)</span>}</label>
      </div>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {hint && <p id={hintId} className="cae-hint">{hint}</p>}
      {error && <p id={errorId} className="field-error">{error}</p>}
    </div>
  );
}

export function EditorCard({ title, aside, children, className = "" }) {
  const headingId = useId();
  return (
    <section className={`ui-card community-editor-card ${className}`} aria-labelledby={headingId}>
      <div className="ui-card-header cae-card-header">
        <h2 id={headingId}>{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

// Two-option radio pill (Free / Premium, Individual / Teams).
export function RadioPill({ name, legend, value, options, onChange, describedBy }) {
  return (
    <fieldset className="community-fieldset" aria-describedby={describedBy}>
      <legend>{legend}</legend>
      <div className="cae-radio-pill">
        {options.map((option) => (
          <label key={option.value} className={value === option.value ? "is-checked" : undefined}>
            <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={() => onChange(option.value)} />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function SkillsInput({ id, label, skills, onChange }) {
  const [text, setText] = useState("");
  function add(value) {
    const skill = value.trim().replace(/,$/, "").trim();
    if (skill && !skills.some((item) => item.toLowerCase() === skill.toLowerCase())) onChange([...skills, skill]);
    setText("");
  }
  return (
    <div className="community-field">
      <div className="community-field-label"><label htmlFor={id}>{label}</label><span className="community-field-hint">press Enter or comma to add</span></div>
      <div className="community-chip-input">
        <ul aria-label={label} className="community-chip-input-list">
          {skills.map((skill) => (
            <li key={skill} className="community-skill-chip">
              {skill}
              <button type="button" aria-label={`Remove ${skill}`} onClick={() => onChange(skills.filter((item) => item !== skill))}><X size={13} aria-hidden="true" /></button>
            </li>
          ))}
        </ul>
        <input
          id={id}
          value={text}
          placeholder="Add a skill"
          onChange={(event) => (event.target.value.endsWith(",") ? add(event.target.value) : setText(event.target.value))}
          onKeyDown={(event) => {
            if (event.key === "Enter") { event.preventDefault(); add(text); }
            if (event.key === "Backspace" && !text && skills.length) onChange(skills.slice(0, -1));
          }}
          onBlur={() => text.trim() && add(text)}
        />
      </div>
    </div>
  );
}

export function ErrorSummary({ order, errors, summaryRef }) {
  const list = order.filter((field) => errors[field]);
  if (list.length === 0) return null;
  return (
    <div className="community-error-summary" role="alert" tabIndex={-1} ref={summaryRef}>
      <strong>Fix {list.length === 1 ? "this" : `these ${list.length} things`} first:</strong>
      <ul>
        {list.map((field) => <li key={field}><a href={`#field-${field}`}>{errors[field]}</a></li>)}
      </ul>
    </div>
  );
}

// "Restore autosaved draft?" banner shown when this browser holds newer unsaved work.
export function RestoreDraftNotice({ savedAt, onRestore, onDiscard }) {
  return (
    <div className="cae-restore" role="status">
      <p>You have unsaved changes from {savedAt} in this browser.</p>
      <div className="cae-actions">
        <button type="button" className="btn btn-primary btn-sm" onClick={onRestore}>Restore them</button>
        <button type="button" className="btn btn-outline btn-sm" onClick={onDiscard}>Discard</button>
      </div>
    </div>
  );
}
