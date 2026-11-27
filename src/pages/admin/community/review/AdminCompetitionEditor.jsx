import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, FileText, Plus, Trash2, Upload, X } from "lucide-react";

import Loader from "../../../../components/common/Loader";
import Modal from "../../../../components/common/Modal";
import ErrorMessage from "../../../../components/feedback/ErrorMessage";
import Toast from "../../../../components/feedback/Toast";
import {
  COMPETITION_STATUS,
  criteriaTotal,
  deleteAdminCompetition,
  getAdminCompetition,
  isoToWatInput,
  relativeTime,
  saveAdminCompetition,
  uploadCompetitionFile,
  validateCompetition,
  watInputToIso,
} from "../../../../features/community/admin/review/reviewService";
import { Avatar, Card, CompetitionTabs, Field, SampleNotice, Switch, Tag } from "../../../../features/community/admin/review/reviewControls";
import { useCommunityList } from "../../../../features/community/listHooks";

const MB = 1024 * 1024;
const FIELD_ORDER = ["title", "category", "participantLimit", "description", "rules", "entryFeeUsd", "prizes", "criteria", "registrationClosesAt", "submissionDeadline", "winnersAnnouncedAt", "judges"];
const FIELD_TARGET = { prizes: "field-prize-first" };

function fileSize(bytes = 0) {
  return bytes >= MB ? `${(bytes / MB).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

// A13 Create / edit competition.
export default function AdminCompetitionEditor() {
  const { competitionId } = useParams();
  const { data, error, loading, reload } = useCommunityList(getAdminCompetition, { id: competitionId ?? "" });

  if (loading) return <section className="admin-page"><Loader label="Loading competition…" /></section>;
  if (error) {
    return (
      <section className="admin-page community-admin">
        <Link to="/admin/community/competitions" className="community-back-link"><ChevronLeft size={16} aria-hidden="true" /> Back to competitions</Link>
        <ErrorMessage message={error} onRetry={reload} />
      </section>
    );
  }
  return (
    <CompetitionForm
      key={data.competition.id ?? "new"}
      initial={data.competition}
      categories={data.categories ?? []}
      reviewers={data.reviewers ?? []}
      freeUsed={data.freeUsed ?? 0}
      freeLimit={data.freeLimit ?? 3}
      sample={data.isSample}
    />
  );
}

// The form keeps the entry fee as 0 (free) or the typed text (paid).
function toForm(competition, freeAllowed) {
  const fee = competition.id ? (competition.entryFeeUsd === 0 ? 0 : String(competition.entryFeeUsd ?? "")) : (freeAllowed ? 0 : "");
  return { ...competition, entryFeeUsd: fee, participantLimit: competition.participantLimit === "" ? "" : String(competition.participantLimit ?? "") };
}

function CompetitionForm({ initial, categories, reviewers, freeUsed, freeLimit, sample }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = !initial.id;
  // freeUsed from the API excludes this competition, so a competition that is already free keeps its slot.
  const freeAllowed = freeUsed < freeLimit || (!isNew && initial.entryFeeUsd === 0 && initial.status !== "draft");
  const [form, setForm] = useState(() => toForm(initial, freeAllowed));
  const [saved, setSaved] = useState(() => JSON.stringify(toForm(initial, freeAllowed)));
  const [savedAt, setSavedAt] = useState(initial.updatedAt);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState("");
  const [toast, setToast] = useState(() => location.state?.toast ?? null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [, setTick] = useState(0);
  const closeToast = useCallback(() => setToast(null), []);
  const summaryRef = useRef(null);

  const dirty = JSON.stringify(form) !== saved;
  const isDraft = form.status === "draft";
  const savedTitle = JSON.parse(saved).title;

  // Refresh "Last saved … ago" every half minute.
  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = (field) => (value) => {
    setForm((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  async function save(nextStatus) {
    const publishing = nextStatus !== "draft";
    const found = validateCompetition({ ...form, status: nextStatus }, { publishing, freeAllowed });
    if (Object.values(found).some(Boolean)) {
      setErrors(found);
      const first = FIELD_ORDER.find((field) => found[field]);
      window.requestAnimationFrame(() => {
        const target = document.getElementById(FIELD_TARGET[first] ?? `field-${first}`);
        if (target) { target.scrollIntoView({ behavior: "smooth", block: "center" }); target.focus?.({ preventScroll: true }); }
        else summaryRef.current?.focus();
      });
      return;
    }
    setErrors({});
    const firstPublish = publishing && form.status === "draft";
    setBusy(firstPublish ? "publish" : "save");
    try {
      const payload = {
        ...form,
        status: nextStatus,
        entryFeeUsd: form.entryFeeUsd === 0 ? 0 : form.entryFeeUsd === "" ? null : Math.round(Number(form.entryFeeUsd) * 100) / 100,
        participantLimit: Number(form.participantLimit) || null,
        criteria: form.criteria.filter((item) => item.name.trim() || item.weight !== "").map((item) => ({ ...item, weight: Number(item.weight) || 0 })),
      };
      const result = await saveAdminCompetition(payload, { sample });
      const savedCompetition = result?.competition ?? result;
      const message = firstPublish ? `“${savedCompetition.title}” is published. Students can now register.` : isDraft ? "Draft saved." : "Changes saved.";
      if (isNew) {
        setSaved(JSON.stringify(form));
        navigate(`/admin/community/competitions/${encodeURIComponent(savedCompetition.id)}/edit`, { replace: true, state: { toast: { type: "success", message } } });
        return;
      }
      const next = toForm(savedCompetition, freeAllowed);
      setForm(next);
      setSaved(JSON.stringify(next));
      setSavedAt(savedCompetition.updatedAt ?? new Date().toISOString());
      setToast({ type: "success", message });
    } catch (saveError) {
      setToast({ type: "error", message: saveError.message || "The competition could not be saved. Please try again." });
    } finally {
      setBusy("");
    }
  }

  const errorList = FIELD_ORDER.filter((field) => errors[field]);
  const indicator = dirty ? "Unsaved changes" : savedAt ? `Last saved ${relativeTime(savedAt)}` : "Not saved yet";

  return (
    <section className="admin-page community-admin community-editor">
      <Link to="/admin/community/competitions" className="community-back-link"><ChevronLeft size={16} aria-hidden="true" /> Back to competitions</Link>

      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">COMPETITIONS</span>
          <h1>{isNew ? "New competition" : savedTitle || "Untitled competition"}</h1>
          <p>{form.number ? `Competition #${form.number} · ` : ""}{isDraft ? "Saved as draft until you publish." : "Published. Changes apply as soon as you save."}</p>
        </div>
        <p className="car-saved-indicator" aria-live="polite">
          <Tag map={COMPETITION_STATUS} value={form.status} />
          <span>{indicator}</span>
        </p>
      </header>

      {!isNew && <CompetitionTabs id={initial.id} current="details" />}
      {sample && <SampleNotice>Showing sample data: the admin Community API is not available yet. Saving keeps changes in this browser tab only, and uploads stay on this computer. This notice only appears on the local dev server.</SampleNotice>}

      {errorList.length > 0 && (
        <div className="community-error-summary" role="alert" tabIndex={-1} ref={summaryRef}>
          <strong>Fix {errorList.length === 1 ? "this" : `these ${errorList.length} things`} first:</strong>
          <ul>
            {errorList.map((field) => <li key={field}><a href={`#${FIELD_TARGET[field] ?? `field-${field}`}`}>{errors[field]}</a></li>)}
          </ul>
        </div>
      )}

      <form className="community-editor-layout car-editor-layout" onSubmit={(event) => { event.preventDefault(); save(form.status); }} noValidate>
        <div className="community-editor-main">
          <BasicsCard form={form} set={set} errors={errors} categories={categories} />
          <EntryFeeCard form={form} set={set} errors={errors} freeUsed={freeUsed} freeLimit={freeLimit} freeAllowed={freeAllowed} />
          <PrizesCard prizes={form.prizes} onChange={set("prizes")} error={errors.prizes} />
          <EvaluationCard form={form} set={set} errors={errors} sample={sample} onError={setToast} />
        </div>

        <aside className="community-editor-side">
          <ScheduleCard form={form} set={set} errors={errors} />
          <JudgesCard judges={form.judges} reviewers={reviewers} onChange={set("judges")} error={errors.judges} />
          <Card title="Visibility">
            <div className="car-switch-list">
              <Switch label="Announce to all students" checked={form.announce} onChange={set("announce")} />
              <Switch label="Send email notification" checked={form.emailNotify} onChange={set("emailNotify")} />
            </div>
            <div className="car-side-actions">
              {isDraft ? (
                <>
                  <button type="button" className="btn btn-primary" onClick={() => save("open")} disabled={Boolean(busy)}>{busy === "publish" ? "Publishing…" : "Publish competition"}</button>
                  <button type="submit" className="btn btn-outline" disabled={Boolean(busy)}>{busy === "save" ? "Saving…" : "Save draft"}</button>
                  {!isNew && <button type="button" className="btn btn-outline community-btn-danger-outline" onClick={() => setDeleteOpen(true)} disabled={Boolean(busy)}>Delete draft</button>}
                </>
              ) : (
                <>
                  <button type="submit" className="btn btn-primary" disabled={Boolean(busy) || !dirty}>{busy === "save" ? "Saving…" : "Save changes"}</button>
                  <Link to={`/admin/community/competitions/${encodeURIComponent(initial.id)}/participants`} className="btn btn-outline">View participants</Link>
                </>
              )}
            </div>
            <p className="car-field-help">The server checks every rule again when you publish.</p>
          </Card>
        </aside>
      </form>

      {!isNew && (
        <DeleteDraftDialog
          open={deleteOpen}
          title={savedTitle || "this draft"}
          onCancel={() => setDeleteOpen(false)}
          onDelete={async () => {
            await deleteAdminCompetition(initial.id, { sample });
            setSaved(JSON.stringify(form));
            navigate("/admin/community/competitions", { replace: true });
          }}
        />
      )}
      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </section>
  );
}

function BasicsCard({ form, set, errors, categories }) {
  return (
    <Card title="Basics">
      <Field id="field-title" label="Competition title" error={errors.title}>
        {(props) => <input {...props} className="ui-input" value={form.title} maxLength={140} onChange={(event) => set("title")(event.target.value)} />}
      </Field>
      <div className="community-field-grid">
        <Field id="field-category" label="Category" error={errors.category}>
          {(props) => (
            <select {...props} className="ui-input" value={form.category} onChange={(event) => set("category")(event.target.value)}>
              <option value="">Choose a category</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          )}
        </Field>
        <Field id="field-participantLimit" label="Participant limit" error={errors.participantLimit}>
          {(props) => <input {...props} className="ui-input" type="number" inputMode="numeric" min={1} value={form.participantLimit} onChange={(event) => set("participantLimit")(event.target.value)} />}
        </Field>
      </div>
      <Field id="field-description" label="Description" error={errors.description}>
        {(props) => <textarea {...props} className="ui-input" rows={4} value={form.description} onChange={(event) => set("description")(event.target.value)} />}
      </Field>
      <Field id="field-rules" label="Rules" hint="One rule per line." error={errors.rules}>
        {(props) => <textarea {...props} className="ui-input" rows={4} value={form.rules} onChange={(event) => set("rules")(event.target.value)} />}
      </Field>
    </Card>
  );
}

function EntryFeeCard({ form, set, errors, freeUsed, freeLimit, freeAllowed }) {
  const free = form.entryFeeUsd === 0;
  function choose(nextFree) {
    if (nextFree) {
      set("entryFeeUsd")(0);
      set("premiumPlusFree")(false);
    } else if (free) set("entryFeeUsd")("");
  }
  return (
    <Card title="Entry fee" aside={<span className="community-timeline-month">Free competitions used: {freeUsed} of {freeLimit}</span>}>
      <div className="car-segmented" role="radiogroup" aria-label="Entry type">
        <button type="button" role="radio" aria-checked={free} className={free ? "active" : ""} disabled={!freeAllowed} onClick={() => choose(true)}>Free entry</button>
        <button type="button" role="radio" aria-checked={!free} className={!free ? "active" : ""} onClick={() => choose(false)}>Paid entry</button>
      </div>
      {!freeAllowed && (
        <p className="car-inline-note">The first {freeLimit} competitions are free to enter and all {freeLimit} have been used, so new competitions are paid.</p>
      )}
      {free ? (
        <p className="car-field-help">Students register without paying. {freeAllowed && freeUsed < freeLimit ? `This uses free slot ${freeUsed + 1} of ${freeLimit} when you publish.` : ""}</p>
      ) : (
        <div className="community-field-grid">
          <Field id="field-entryFeeUsd" label="Entry fee (USD)" hint="Students pay at registration. Payment is verified by the server before access." error={errors.entryFeeUsd}>
            {(props) => (
              <span className="car-money-input">
                <span aria-hidden="true">$</span>
                <input {...props} className="ui-input" inputMode="decimal" placeholder="0.00" value={form.entryFeeUsd} onChange={(event) => set("entryFeeUsd")(event.target.value.replace(/[^0-9.]/g, ""))} />
              </span>
            )}
          </Field>
          <div className="community-field">
            <span className="car-field-title">Premium benefit</span>
            <Switch label="Premium Plus members enter free" checked={form.premiumPlusFree} onChange={set("premiumPlusFree")} />
          </div>
        </div>
      )}
      {free && errors.entryFeeUsd && <p id="field-entryFeeUsd" tabIndex={-1} className="field-error">{errors.entryFeeUsd}</p>}
    </Card>
  );
}

function PrizesCard({ prizes, onChange, error }) {
  const update = (key) => (event) => onChange({ ...prizes, [key]: event.target.value });
  return (
    <Card title="Prizes">
      <div className="community-field-grid">
        <Field id="field-prize-first" label="1st place" error={error}>
          {(props) => <input {...props} className="ui-input" value={prizes.first} onChange={update("first")} />}
        </Field>
        <Field id="field-prize-second" label="2nd place" optional>
          {(props) => <input {...props} className="ui-input" value={prizes.second} onChange={update("second")} />}
        </Field>
        <Field id="field-prize-third" label="3rd place" optional>
          {(props) => <input {...props} className="ui-input" value={prizes.third} onChange={update("third")} />}
        </Field>
        <Field id="field-prize-mentions" label="Honourable mentions" optional>
          {(props) => <input {...props} className="ui-input" value={prizes.mentions} onChange={update("mentions")} />}
        </Field>
      </div>
    </Card>
  );
}

function EvaluationCard({ form, set, errors, sample, onError }) {
  const criteria = form.criteria.length ? form.criteria : [{ name: "", weight: "" }];
  const total = criteriaTotal(criteria);
  const update = (index, changes) => set("criteria")(criteria.map((item, i) => (i === index ? { ...item, ...changes } : item)));
  return (
    <Card title="Evaluation & submission">
      <fieldset id="field-criteria" tabIndex={-1} className="community-fieldset">
        <legend>Judging criteria (weights must total 100%)</legend>
        <div className="community-criteria-head" aria-hidden="true"><span>Criterion</span><span>Weight %</span></div>
        <div className="community-repeat-list">
          {criteria.map((item, index) => (
            <div key={index} className="community-repeat-row community-criterion">
              <input className="ui-input" aria-label={`Criterion ${index + 1}`} placeholder="What will judges score?" value={item.name} onChange={(event) => update(index, { name: event.target.value })} />
              <input
                className="ui-input"
                type="number"
                inputMode="numeric"
                min={0}
                max={100}
                aria-label={`Criterion ${index + 1} weight, percent`}
                aria-invalid={Boolean(errors.criteria) && total !== 100}
                value={item.weight}
                onChange={(event) => update(index, { weight: event.target.value === "" ? "" : Math.max(0, Math.min(100, Number(event.target.value))) })}
              />
              <button type="button" className="community-icon-button" aria-label={`Remove criterion ${index + 1}`} disabled={criteria.length === 1} onClick={() => set("criteria")(criteria.filter((_, i) => i !== index))}><X size={16} aria-hidden="true" /></button>
            </div>
          ))}
        </div>
        <div className="community-criteria-total">
          {errors.criteria ? <p className="field-error">{errors.criteria}</p> : <span />}
          <strong className={total === 100 ? "is-good" : "is-bad"} aria-live="polite">Total {total} / 100</strong>
        </div>
        <button type="button" className="btn btn-outline btn-sm community-add-button" onClick={() => set("criteria")([...criteria, { name: "", weight: "" }])}><Plus size={15} aria-hidden="true" /> Add criterion</button>
      </fieldset>

      <Field id="field-submissionRequirements" label="Submission requirements" optional>
        {(props) => <textarea {...props} className="ui-input" rows={3} value={form.submissionRequirements} onChange={(event) => set("submissionRequirements")(event.target.value)} />}
      </Field>

      <ResourcesField files={form.resources} onChange={set("resources")} sample={sample} onError={onError} />
    </Card>
  );
}

const RESOURCE_TYPES = ["application/pdf", "application/zip", "application/x-zip-compressed", "image/png"];

function ResourcesField({ files, onChange, sample, onError }) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  async function handle(list) {
    const chosen = [...list];
    const tooBig = chosen.find((file) => file.size > 25 * MB);
    if (tooBig) { onError({ type: "error", message: `${tooBig.name} is larger than 25 MB.` }); return; }
    const wrong = chosen.find((file) => !RESOURCE_TYPES.includes(file.type));
    if (wrong) { onError({ type: "error", message: `${wrong.name} isn't a PDF, ZIP or PNG file.` }); return; }
    setUploading(true);
    try {
      const added = await Promise.all(chosen.map((file) => uploadCompetitionFile(file, { sample })));
      onChange([...files, ...added.map(({ url, name, size }) => ({ url, name, size }))]);
    } catch (uploadError) {
      onError({ type: "error", message: uploadError.message || "The upload failed. Please try again." });
    } finally {
      setUploading(false);
    }
  }
  return (
    <div className="community-field">
      <span className="car-field-title" id="resources-label">Competition resources</span>
      <label
        className={`community-dropzone${dragging ? " is-dragging" : ""}`}
        aria-labelledby="resources-label"
        onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => { event.preventDefault(); setDragging(false); handle(event.dataTransfer.files); }}
      >
        <Upload size={22} aria-hidden="true" />
        <strong>{uploading ? "Uploading…" : <>Drop files or <span>browse</span></>}</strong>
        <span>PDF, ZIP, PNG up to 25 MB · shown to registered participants only</span>
        <input type="file" multiple className="sr-only" accept=".pdf,.zip,.png" disabled={uploading} onChange={(event) => { handle(event.target.files); event.target.value = ""; }} />
      </label>
      {files.length > 0 && (
        <ul className="community-file-list">
          {files.map((file) => (
            <li key={file.url}>
              <FileText size={18} aria-hidden="true" />
              <span className="min-w-0"><strong>{file.name}</strong><small>{fileSize(file.size)}</small></span>
              <button type="button" className="btn btn-outline btn-sm" aria-label={`Remove ${file.name}`} onClick={() => onChange(files.filter((item) => item.url !== file.url))}>Remove</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ScheduleCard({ form, set, errors }) {
  const field = (key, label) => (
    <Field id={`field-${key}`} label={label} error={errors[key]}>
      {(props) => <input {...props} type="datetime-local" className="ui-input" value={isoToWatInput(form[key])} onChange={(event) => set(key)(watInputToIso(event.target.value))} />}
    </Field>
  );
  return (
    <Card title="Schedule" aside={<span className="community-timeline-month">West Africa Time (WAT)</span>}>
      {field("registrationClosesAt", "Registration deadline")}
      {field("submissionDeadline", "Submission deadline")}
      {field("winnersAnnouncedAt", "Winner announcement")}
      <p className="car-field-help">Deadlines are enforced by the server; late uploads are rejected.</p>
    </Card>
  );
}

function JudgesCard({ judges, reviewers, onChange, error }) {
  const available = reviewers.filter((item) => !judges.some((judge) => judge.id === item.id));
  function add(id) {
    const reviewer = reviewers.find((item) => item.id === id);
    if (!reviewer) return;
    onChange([...judges, { id: reviewer.id, name: reviewer.name, role: judges.length === 0 ? "Lead judge" : reviewer.role ?? "Judge" }]);
  }
  return (
    <Card title="Judges">
      {judges.length > 0 ? (
        <ul className="car-judge-list">
          {judges.map((judge, index) => (
            <li key={judge.id}>
              <Avatar initials={judge.name.split(" ").map((part) => part[0]).join("")} index={index + 1} />
              <span className="min-w-0"><strong>{judge.name}</strong><small>{index === 0 ? "Lead judge" : judge.role}</small></span>
              <button type="button" className="btn btn-outline btn-sm" aria-label={`Remove ${judge.name}`} onClick={() => onChange(judges.filter((item) => item.id !== judge.id))}>Remove</button>
            </li>
          ))}
        </ul>
      ) : <p className="car-field-help">No judges yet. Judges can only see this competition's submissions and results.</p>}
      <Field id="field-judges" label="Add judge" error={error}>
        {(props) => (
          <select {...props} className="ui-input" value="" onChange={(event) => add(event.target.value)} disabled={available.length === 0}>
            <option value="">{available.length ? "Select a reviewer…" : "Everyone is already a judge"}</option>
            {available.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        )}
      </Field>
    </Card>
  );
}

function DeleteDraftDialog({ open, title, onCancel, onDelete }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function run() {
    setBusy(true);
    setError("");
    try {
      await onDelete();
    } catch (deleteError) {
      setError(deleteError.message || "The draft could not be deleted.");
      setBusy(false);
    }
  }
  return (
    <Modal open={open} onClose={() => !busy && onCancel()} title={`Delete “${title}”?`}>
      <div className="community-delete-dialog">
        <span className="community-delete-icon" aria-hidden="true"><Trash2 size={22} /></span>
        <p>This draft has not been published, so no student has seen it. Deleting it removes the brief, prizes, criteria and uploaded resources. This cannot be undone.</p>
        {error && <p className="field-error" role="alert">{error}</p>}
        <div className="community-delete-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="button" className="btn btn-sm community-btn-danger" onClick={run} disabled={busy}>{busy ? "Deleting…" : "Delete draft"}</button>
        </div>
      </div>
    </Modal>
  );
}
