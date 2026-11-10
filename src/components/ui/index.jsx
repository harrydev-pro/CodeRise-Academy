import { useId, useState } from "react";
import { ImagePlus, LoaderCircle } from "lucide-react";
import { uploadFile } from "../../services/api/api";
import { statusClass } from "../../utils/statuses";

export function PageHeader({ eyebrow, title, description, actions }) {
  return (
    <div className="ui-page-header">
      <div className="min-w-0">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="ui-page-actions">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, hint, to, tone = "blue" }) {
  const body = (
    <>
      {Icon && <span className={`ui-stat-icon tone-${tone}`}><Icon size={20} aria-hidden="true" /></span>}
      <div className="min-w-0">
        <p className="ui-stat-label">{label}</p>
        <strong className="ui-stat-value">{value ?? "—"}</strong>
        {hint && <p className="ui-stat-hint">{hint}</p>}
      </div>
    </>
  );
  return to ? <a className="ui-stat-card" href={to}>{body}</a> : <div className="ui-stat-card">{body}</div>;
}

export function StatusBadge({ status, fallback = "pending" }) {
  return <span className={`status-badge ${statusClass(status, fallback)}`}>{status || fallback}</span>;
}

export function Tabs({ tabs, value, onChange, label = "Sections" }) {
  return (
    <div className="ui-tabs" role="tablist" aria-label={label}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          role="tab"
          aria-selected={value === tab.value}
          className={value === tab.value ? "active" : ""}
          onClick={() => onChange(tab.value)}
        >
          {tab.label}
          {tab.count !== undefined && <span className="ui-tab-count">{tab.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Pagination({ pagination, onPage }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, total } = pagination;
  return (
    <nav className="ui-pagination" aria-label="Pages">
      <button type="button" className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button>
      <span>Page {page} of {totalPages} · {total} total</span>
      <button type="button" className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next</button>
    </nav>
  );
}

// Label + control + error/hint, with ids wired for screen readers.
export function Field({ label, error, hint, required, children, className = "" }) {
  const id = useId();
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={`ui-field ${className}`}>
      {label && <label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>}
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {hint && !error && <p id={`${id}-hint`} className="ui-hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="field-error">{error}</p>}
    </div>
  );
}

export function TextField({ label, value, onChange, error, hint, required, type = "text", ...rest }) {
  return (
    <Field label={label} error={error} hint={hint} required={required}>
      {(ids) => <input {...ids} {...rest} type={type} className="ui-input" value={value ?? ""} onChange={(event) => onChange(event.target.value)} />}
    </Field>
  );
}

export function TextArea({ label, value, onChange, error, hint, required, rows = 4, ...rest }) {
  return (
    <Field label={label} error={error} hint={hint} required={required}>
      {(ids) => <textarea {...ids} {...rest} rows={rows} className="ui-input" value={value ?? ""} onChange={(event) => onChange(event.target.value)} />}
    </Field>
  );
}

export function SelectField({ label, value, onChange, options, error, hint, required, ...rest }) {
  return (
    <Field label={label} error={error} hint={hint} required={required}>
      {(ids) => (
        <select {...ids} {...rest} className="ui-input" value={value ?? ""} onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => {
            const item = typeof option === "string" ? { value: option, label: option } : option;
            return <option key={item.value} value={item.value}>{item.label}</option>;
          })}
        </select>
      )}
    </Field>
  );
}

export function CheckboxField({ label, checked, onChange, hint }) {
  return (
    <label className="ui-checkbox">
      <input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}{hint && <small>{hint}</small>}</span>
    </label>
  );
}

// Edits a list of short texts as one item per line.
export function ListField({ label, value, onChange, hint = "One item per line.", rows = 4, error }) {
  const [text, setText] = useState(() => (Array.isArray(value) ? value.map((item) => (typeof item === "string" ? item : item?.title || "")).join("\n") : ""));
  return (
    <TextArea
      label={label}
      rows={rows}
      hint={hint}
      error={error}
      value={text}
      onChange={(next) => {
        setText(next);
        onChange(next.split("\n").map((line) => line.trim()).filter(Boolean));
      }}
    />
  );
}

// Image link with an optional upload button (uploads go to the server, which stores them safely).
export function ImageField({ label = "Image", value, onChange, purpose = "image", hint }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusy(true);
    setError("");
    try {
      const uploaded = await uploadFile(file, purpose);
      onChange(uploaded.url);
    } catch (uploadError) {
      setError(uploadError.message || "The image could not be uploaded.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="ui-image-field">
      <TextField label={label} value={value} onChange={onChange} placeholder="https://..." hint={hint || "Paste an https:// image link or upload an image (PNG, JPG, WebP, max 5 MB)."} error={error} />
      <div className="ui-image-row">
        {value ? <img src={value} alt="" className="ui-image-preview" /> : <span className="ui-image-empty"><ImagePlus size={22} aria-hidden="true" /></span>}
        <label className="btn btn-outline btn-sm">
          {busy ? <LoaderCircle size={16} className="btn-spinner" aria-hidden="true" /> : <ImagePlus size={16} aria-hidden="true" />}
          {busy ? "Uploading…" : "Upload image"}
          <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={handleFile} disabled={busy} />
        </label>
        {value && <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange("")}>Remove</button>}
      </div>
    </div>
  );
}

// Horizontal-scrolling wrapper so wide tables never push the page sideways.
export function TableWrap({ children }) {
  return <div className="ui-table-wrap">{children}</div>;
}

export function Notice({ tone = "info", children }) {
  if (!children) return null;
  return <div className={`alert alert-${tone === "error" ? "error" : "info"}`} role={tone === "error" ? "alert" : "status"}>{children}</div>;
}
