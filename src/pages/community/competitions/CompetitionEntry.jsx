import { useCallback, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CircleCheck, FileText, FolderGit2, Link2, Lock, Video } from "lucide-react";
import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import Toast from "../../../components/feedback/Toast";
import { useCommunityList } from "../../../features/community/listHooks";
import { getCompetitionEntry, saveCompetitionEntry } from "../../../features/community/competitions/competitionService";
import { competitionPath, formatDate } from "../../../features/community/competitions/competitionFormat";

// Competition entry: /community/competitions/:id/entry (registered students only).
// A draft can be saved at any time; "Submit entry" sends it to the judges. A submitted entry
// can be updated until the submission deadline. Drafts are never judged.
const LINK_FIELDS = [
  { name: "live", label: "Live project link", icon: Link2, placeholder: "https://your-project.vercel.app" },
  { name: "github", label: "GitHub repository", icon: FolderGit2, placeholder: "https://github.com/you/project" },
  { name: "video", label: "Demo video (optional)", icon: Video, placeholder: "https://youtu.be/…" },
  { name: "file", label: "File or document link (optional)", icon: FileText, placeholder: "https://drive.google.com/…" },
];
const FIELD_LABELS = { title: "Entry title", links: "Links", confirmed: "Confirmation" };
const FIELD_ORDER = ["title", "links", ...LINK_FIELDS.map((field) => field.name), "confirmed"];

const fullDateTime = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });
const isHttps = (value) => { try { return new URL(value).protocol === "https:"; } catch { return false; } };

function fieldsFrom(entry) {
  const links = Object.fromEntries(LINK_FIELDS.map((field) => [field.name, ""]));
  for (const link of entry?.links ?? []) if (link.type in links) links[link.type] = link.url;
  return { title: entry?.title ?? "", description: entry?.description ?? "", confirmed: entry?.status === "submitted", ...links };
}

function validate(fields, final) {
  const errors = {};
  for (const field of LINK_FIELDS) {
    const value = fields[field.name].trim();
    if (value && !isHttps(value)) errors[field.name] = "Use a full link that starts with https://";
  }
  if (!final) return errors;
  if (fields.title.trim().length < 3) errors.title = "Give your entry a title (at least 3 characters).";
  if (!LINK_FIELDS.some((field) => fields[field.name].trim())) errors.links = "Add at least one link to your work.";
  if (!fields.confirmed) errors.confirmed = "Confirm the entry is your own work and follows the rules.";
  return errors;
}

export default function CompetitionEntry() {
  const { id } = useParams();
  const { data, error, loading, reload } = useCommunityList(getCompetitionEntry, { id });

  if (loading) return <Loader label="Loading your entry…" />;
  if (error) {
    return (
      <div className="cmc-page">
        <Link to={competitionPath(id)} className="cmc-back"><ArrowLeft size={17} aria-hidden="true" /> Back to competition</Link>
        <ErrorMessage message={error} onRetry={reload} />
      </div>
    );
  }
  return <EntryForm key={data.competition.id} data={data} />;
}

function EntryForm({ data }) {
  const { competition, acceptingSubmissions, isSample } = data;
  const path = competitionPath(competition.id);
  const [saved, setSaved] = useState(data.entry ?? { status: "none" });
  const [fields, setFields] = useState(() => fieldsFrom(data.entry));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [sending, setSending] = useState(null);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [toast, setToast] = useState(null);
  const summaryRef = useRef(null);
  const closeToast = useCallback(() => setToast(null), []);

  const locked = !["none", "draft", "submitted"].includes(saved.status);
  const readOnly = !acceptingSubmissions || locked;

  function change(name, value) {
    setFields((current) => ({ ...current, [name]: value }));
    if (errors[name] || (errors.links && LINK_FIELDS.some((field) => field.name === name))) {
      setErrors((current) => ({ ...current, [name]: undefined, links: undefined }));
    }
  }

  async function save(final) {
    const found = validate(fields, final);
    setErrors(found);
    setFormError("");
    if (Object.values(found).some(Boolean)) {
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setSending(final ? "final" : "draft");
    try {
      const body = {
        title: fields.title.trim(),
        description: fields.description.trim(),
        links: LINK_FIELDS.filter((field) => fields[field.name].trim()).map((field) => ({ type: field.name, url: fields[field.name].trim() })),
        confirmed: fields.confirmed,
        final,
      };
      const result = await saveCompetitionEntry(competition.id, body, { sample: isSample });
      const wasSubmitted = saved.status === "submitted";
      setSaved(result.entry);
      if (result.entry.status === "submitted" && !wasSubmitted) setJustSubmitted(true);
      else setToast({ message: result.entry.status === "submitted" ? "Entry updated." : "Draft saved.", type: "success" });
    } catch (saveError) {
      setFormError(saveError.message || "We couldn't save your entry. Try again.");
    } finally {
      setSending(null);
    }
  }

  const errorList = FIELD_ORDER.filter((name) => errors[name]);
  const describedBy = (name) => (errors[name] ? `err-${name}` : undefined);
  const deadline = competition.submissionDeadline ? fullDateTime.format(new Date(competition.submissionDeadline)) : null;

  return (
    <div className="community-library cmh-page">
      <Link to={path} className="cmh-back"><ArrowLeft size={17} aria-hidden="true" /> Back to competition</Link>

      {isSample && (
        <p className="community-sample-notice" role="status">
          Showing sample data: the Community API is not available yet. Nothing is sent. This notice only appears on the local dev server.
        </p>
      )}

      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">COMPETITION ENTRY</span>
          <h1>Submit your entry</h1>
          <p>{competition.title}{deadline ? ` · Deadline ${deadline} WAT` : ""}</p>
        </div>
      </header>

      <div className="cmh-submit-layout">
        <section className="community-card cmh-form-card" aria-label="Entry form">
          {justSubmitted && (
            <div className="cmh-success" role="status">
              <CircleCheck size={22} aria-hidden="true" />
              <div>
                <strong>Entry submitted</strong>
                <p>{saved.title} was sent to the judges.{deadline ? ` You can update it until ${deadline} WAT.` : ""}</p>
                <Link to={path}>Back to competition</Link>
              </div>
            </div>
          )}

          {!justSubmitted && saved.status === "submitted" && !readOnly && (
            <p className="cmh-alert is-info"><CircleCheck size={18} aria-hidden="true" /><span><strong>Already submitted.</strong> Changes you save now replace your earlier entry.</span></p>
          )}

          {readOnly && (
            <p className="cmh-alert is-closed" role="status">
              <Lock size={18} aria-hidden="true" />
              <span>
                <strong>{locked ? "Your entry is being judged." : competition.resultsPublished ? "Results are published." : "Submissions closed."}</strong>
                {" "}{saved.status === "none" || saved.status === "draft" ? "No entry was submitted." : "Your entry was received."}
              </span>
            </p>
          )}

          {errorList.length > 0 && (
            <div className="community-error-summary" tabIndex={-1} ref={summaryRef} role="alert">
              <strong>Fix {errorList.length === 1 ? "this problem" : `these ${errorList.length} problems`} first:</strong>
              <ul>
                {errorList.map((name) => (
                  <li key={name}>
                    <a href={`#field-${name === "links" ? "live" : name}`} onClick={(event) => { event.preventDefault(); document.getElementById(`field-${name === "links" ? "live" : name}`)?.focus(); }}>
                      {FIELD_LABELS[name] ?? LINK_FIELDS.find((field) => field.name === name)?.label}: {errors[name]}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <form className="cmh-form" onSubmit={(event) => { event.preventDefault(); save(true); }} noValidate>
            <fieldset disabled={readOnly} className="cmh-form-fields">
              <legend className="sr-only">Your entry</legend>

              <div className="community-field">
                <label htmlFor="field-title" className="cmh-label">Entry title</label>
                <input id="field-title" className="ui-input" value={fields.title} maxLength={120} aria-invalid={Boolean(errors.title)} aria-describedby={describedBy("title")} onChange={(event) => change("title", event.target.value)} />
                {errors.title && <p id="err-title" className="field-error">{errors.title}</p>}
              </div>

              <div className="community-field">
                <label htmlFor="field-description" className="cmh-label">Description</label>
                <textarea id="field-description" className="ui-input" rows={5} maxLength={3000} value={fields.description} aria-describedby="hint-description" onChange={(event) => change("description", event.target.value)} />
                <p id="hint-description" className="community-field-hint">What you built, the tools you used and anything the judges should know.</p>
              </div>

              {competition.submissionRequirements && (
                <p className="cmh-alert is-info"><FileText size={18} aria-hidden="true" /><span><strong>What to submit:</strong> {competition.submissionRequirements}</span></p>
              )}

              {LINK_FIELDS.map((field) => (
                <div className="community-field" key={field.name}>
                  <label htmlFor={`field-${field.name}`} className="cmh-label">{field.label}</label>
                  <div className={`cmh-input-icon${errors[field.name] ? " is-invalid" : ""}`}>
                    <span aria-hidden="true"><field.icon size={18} /></span>
                    <input
                      id={`field-${field.name}`} type="url" inputMode="url" autoComplete="url" className="ui-input"
                      placeholder={field.placeholder} value={fields[field.name]}
                      aria-invalid={Boolean(errors[field.name] || (errors.links && field.name === "live"))}
                      aria-describedby={[describedBy(field.name), errors.links && field.name === "live" ? "err-links" : null].filter(Boolean).join(" ") || undefined}
                      onChange={(event) => change(field.name, event.target.value)}
                    />
                  </div>
                  {errors[field.name] && <p id={`err-${field.name}`} className="field-error">{errors[field.name]}</p>}
                  {field.name === "live" && errors.links && <p id="err-links" className="field-error">{errors.links}</p>}
                </div>
              ))}

              <div>
                <label className="cmh-agree">
                  <input id="field-confirmed" type="checkbox" checked={fields.confirmed} aria-invalid={Boolean(errors.confirmed)} aria-describedby={describedBy("confirmed")} onChange={(event) => change("confirmed", event.target.checked)} />
                  <span>I confirm this entry is my own work and follows the competition rules.</span>
                </label>
                {errors.confirmed && <p id="err-confirmed" className="field-error">{errors.confirmed}</p>}
              </div>
            </fieldset>

            {formError && <p className="field-error" role="alert">{formError}</p>}

            {!readOnly && (
              <div className="cmh-form-actions">
                <button type="submit" className="btn btn-primary" disabled={Boolean(sending)}>
                  {sending === "final" ? "Submitting…" : saved.status === "submitted" ? "Update entry" : "Submit entry"}
                </button>
                {saved.status !== "submitted" && (
                  <button type="button" className="btn btn-outline" disabled={Boolean(sending)} onClick={() => save(false)}>
                    {sending === "draft" ? "Saving…" : "Save draft"}
                  </button>
                )}
                {saved.updatedAt && <span className="cmh-muted">Last saved {fullDateTime.format(new Date(saved.updatedAt))}</span>}
              </div>
            )}
          </form>
        </section>

        <aside className="cmh-details-side" aria-label="Entry status">
          <section className="community-card" aria-labelledby="cmc-entry-status">
            <h2 id="cmc-entry-status" className="cmh-card-title">Entry status</h2>
            <p className="cmh-status-line">
              <span className={`community-tag ${saved.status === "submitted" ? "tag-green" : saved.status === "draft" ? "tag-amber" : "tag-neutral"}`}>
                {saved.status === "submitted" ? "Submitted" : saved.status === "draft" ? "Draft saved" : saved.status === "none" ? "Not started" : "With the judges"}
              </span>
            </p>
            <p className="cmh-note">
              {saved.status === "submitted"
                ? `Submitted ${saved.submittedAt ? formatDate(saved.submittedAt) : ""}. The judges see your latest version at the deadline.`
                : "Drafts are not judged. Submit before the deadline."}
            </p>
          </section>
          <section className="community-card" aria-labelledby="cmc-entry-tips">
            <h2 id="cmc-entry-tips" className="cmh-card-title">Before you submit</h2>
            <ul className="cmh-bullets">
              <li>Make your repository public</li>
              <li>Check your links open in a private window</li>
              {deadline && <li>You can update your entry until {deadline} WAT</li>}
            </ul>
          </section>
        </aside>
      </div>

      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </div>
  );
}
