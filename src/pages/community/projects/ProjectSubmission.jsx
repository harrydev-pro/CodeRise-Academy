import { useCallback, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, CircleAlert, ClipboardCheck, FileText, FolderGit2, ImageIcon, Link2, Upload, X } from "lucide-react";

import Loader from "../../../components/common/Loader";
import Modal from "../../../components/common/Modal";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import Toast from "../../../components/feedback/Toast";
import { useCommunityList } from "../../../features/community/listHooks";
import PremiumLock from "../../../features/community/projects/PremiumLock";
import {
  acceptFor,
  fileKindsText,
  fileMatchesKinds,
  formatBytes,
  formatDeadline,
  formatFullDate,
  validateSubmission,
} from "../../../features/community/projects/projectHelpers";
import {
  getProjectSubmission,
  LINK_FIELDS,
  saveSubmissionDraft,
  statusInfo,
  submitProject,
  uploadSubmissionFile,
} from "../../../features/community/projects/projectsService";

const NOTES_LIMIT = 1000;
const LINK_ICONS = { github: FolderGit2, live: Link2, figma: Link2 };

export default function ProjectSubmission() {
  const { slug } = useParams();
  const { data, error, loading, reload } = useCommunityList(getProjectSubmission, { slug });
  const briefPath = `/community/projects/${encodeURIComponent(slug)}`;

  if (loading) return <Loader label="Loading submission…" />;
  if (error) {
    return (
      <div className="cmp-page">
        <Link to={briefPath} className="cmp-back"><ChevronLeft size={16} aria-hidden="true" /> Back to the brief</Link>
        <ErrorMessage message={error} onRetry={reload} />
      </div>
    );
  }
  return <SubmissionForm key={slug} data={data} briefPath={briefPath} />;
}

function confirmationsFor(rules) {
  const types = (rules.links ?? []).map((link) => link.type);
  const list = [];
  if (types.includes("github")) list.push({ key: "public", label: "My repository is public and has a README." });
  if (types.includes("live")) list.push({ key: "works", label: "The live site works on mobile and desktop." });
  if (types.includes("figma")) list.push({ key: "shared", label: "My Figma file can be viewed by anyone with the link." });
  list.push({ key: "requirements", label: "I have met every requirement in the brief." });
  list.push({ key: "own", label: "This is my own work. I understand copied work is removed." });
  return list;
}

function SubmissionForm({ data, briefPath }) {
  const navigate = useNavigate();
  const { project, viewerStatus, dueAt, draft, feedback, resubmissionsLeft, canSubmit } = data;
  const sample = Boolean(data.isSample);
  const rules = project.submission ?? { links: [], files: null };
  const fileRules = rules.files;
  const checks = confirmationsFor(rules);
  const resubmitting = viewerStatus === "needs_corrections";

  const [links, setLinks] = useState(() => ({ github: "", live: "", figma: "", ...(draft?.links ?? {}) }));
  const [files, setFiles] = useState(() => (draft?.files ?? []).map((file, index) => ({ ...file, id: `draft-${index}` })));
  const [notes, setNotes] = useState(draft?.notes ?? "");
  const [confirmations, setConfirmations] = useState({});
  const [errors, setErrors] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sending, setSending] = useState("");
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), [setToast]);
  const closeConfirm = useCallback(() => setConfirmOpen(false), [setConfirmOpen]);
  const summaryRef = useRef(null);
  const fileInput = useRef(null);
  const nextId = useRef(0);

  if (project.locked) {
    return (
      <div className="cmp-page">
        <Link to={briefPath} className="cmp-back"><ChevronLeft size={16} aria-hidden="true" /> Back to the brief</Link>
        <PremiumLock title={project.title} premiumFromPrice={data.premiumFromPrice} headingLevel={1} />
      </div>
    );
  }

  if (!canSubmit) {
    const status = statusInfo(viewerStatus);
    return (
      <div className="cmp-page">
        <Link to={briefPath} className="cmp-back"><ChevronLeft size={16} aria-hidden="true" /> Back to the brief</Link>
        <div className="community-card community-empty">
          <span className="community-icon tone-blue"><ClipboardCheck size={22} aria-hidden="true" /></span>
          <h1 className="cmp-empty-title">{project.title} can’t be submitted right now</h1>
          <p className="muted-text">
            {resubmitting ? "You have used all your resubmissions for this project." : `Its status is ${status.label}. You can follow the review in My Community Projects.`}
          </p>
          <Link to="/community/my-projects" className="btn btn-primary btn-sm">Go to My Community Projects</Link>
        </div>
      </div>
    );
  }

  const values = { links, files, confirmations };
  const formErrors = (submitting) => validateSubmission(values, rules, { submitting, confirmationKeys: checks.map((item) => item.key) });

  function setLink(type, value) {
    setLinks((current) => ({ ...current, [type]: value }));
    if (errors[`link-${type}`]) setErrors((current) => ({ ...current, [`link-${type}`]: undefined }));
  }

  function setConfirmation(key, checked) {
    setConfirmations((current) => ({ ...current, [key]: checked }));
    if (errors.confirmations) setErrors((current) => ({ ...current, confirmations: undefined }));
  }

  function addFiles(list) {
    if (!fileRules) return;
    const chosen = [...list];
    const problems = [];
    const room = fileRules.maxFiles - files.length;
    const accepted = [];
    for (const file of chosen) {
      if (!fileMatchesKinds(file, fileRules.kinds)) problems.push(`${file.name}: upload a ${fileKindsText(fileRules.kinds)} file.`);
      else if (file.size > fileRules.maxSizeMb * 1024 * 1024) problems.push(`${file.name} is ${formatBytes(file.size)}. Files can be up to ${fileRules.maxSizeMb} MB.`);
      else if (accepted.length >= room) problems.push(`${file.name}: you can add up to ${fileRules.maxFiles} files.`);
      else accepted.push(file);
    }
    setErrors((current) => ({ ...current, files: problems.length ? problems.join(" ") : undefined }));
    for (const file of accepted) {
      nextId.current += 1;
      const id = `file-${nextId.current}`;
      setFiles((current) => [...current, { id, name: file.name, size: file.size, uploading: true }]);
      uploadSubmissionFile(file, { sample })
        .then((uploaded) => setFiles((current) => current.map((item) => (item.id === id ? { ...item, ...uploaded, uploading: false } : item))))
        .catch((uploadError) => {
          setFiles((current) => current.filter((item) => item.id !== id));
          setErrors((current) => ({ ...current, files: `${file.name} was not uploaded: ${uploadError.message || "please try again."}` }));
        });
    }
  }

  function removeFile(id) {
    setFiles((current) => current.filter((item) => item.id !== id));
  }

  function payload() {
    return {
      links: Object.fromEntries((rules.links ?? []).map(({ type }) => [type, links[type].trim()])),
      files: files.filter((file) => !file.uploading).map(({ name, size, url }) => ({ name, size, url })),
      notes: notes.trim(),
    };
  }

  async function saveDraft() {
    const found = formErrors(false);
    setErrors(found);
    if (Object.keys(found).length) {
      setShowSummary(true);
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setSending("draft");
    try {
      await saveSubmissionDraft(project.slug, payload(), { sample });
      setToast({ type: "success", message: sample ? "Draft saved (sample data: kept until the page reloads)." : "Draft saved." });
    } catch (saveError) {
      setToast({ type: "error", message: saveError.message || "Could not save your draft. Please try again." });
    } finally {
      setSending("");
    }
  }

  function reviewSubmission(event) {
    event.preventDefault();
    const found = formErrors(true);
    setErrors(found);
    if (Object.keys(found).length) {
      setShowSummary(true);
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setShowSummary(false);
    setConfirmOpen(true);
  }

  async function send() {
    setSending("submit");
    try {
      await submitProject(project.slug, { ...payload(), confirmations }, { sample });
      navigate("/community/my-projects", { state: { submitted: project.title, sample } });
    } catch (submitError) {
      setConfirmOpen(false);
      setSending("");
      setToast({ type: "error", message: submitError.message || "Your project was not submitted. Please try again." });
    }
  }

  const errorList = Object.entries(errors).filter(([, message]) => message);
  const fieldFor = (key) => (key.startsWith("link-") ? `cmp-${key}` : key === "files" ? "cmp-file-input" : `cmp-check-${checks[0].key}`);
  const busy = Boolean(sending);
  const linkTypes = rules.links ?? [];

  return (
    <div className="cmp-page">
      <Link to={briefPath} className="cmp-back"><ChevronLeft size={16} aria-hidden="true" /> Back to the brief</Link>

      <header className="cmp-page-header">
        <span className="eyebrow">{resubmitting ? "PROJECT RESUBMISSION" : "PROJECT SUBMISSION"}</span>
        <h1>{resubmitting ? "Resubmit your work" : "Submit your work"}</h1>
        <p>Project: {project.title} · {project.category}{dueAt ? ` · Due ${formatFullDate(dueAt)}` : ""}</p>
      </header>

      {sample && (
        <p className="community-sample-notice" role="status">
          Showing sample data: the Community API is not available yet. Uploads stay in your browser and nothing is sent. This notice only appears on the local dev server.
        </p>
      )}

      {resubmitting && feedback && (
        <section className="cmp-feedback is-corrections" aria-label="Reviewer feedback">
          <p><strong>Feedback{feedback.reviewer ? ` · ${feedback.reviewer}` : ""}:</strong> {feedback.text}</p>
          <p className="cmp-feedback-meta">
            {resubmissionsLeft} {resubmissionsLeft === 1 ? "resubmission" : "resubmissions"} left{dueAt ? ` · due ${formatDeadline(dueAt)}` : ""}
          </p>
        </section>
      )}

      {showSummary && errorList.length > 0 && (
        <div className="community-error-summary" role="alert" tabIndex={-1} ref={summaryRef}>
          <strong>Please fix {errorList.length === 1 ? "this problem" : `these ${errorList.length} problems`}:</strong>
          <ul>
            {errorList.map(([key, message]) => <li key={key}><a href={`#${fieldFor(key)}`}>{message}</a></li>)}
          </ul>
        </div>
      )}

      <form className="cmp-layout" onSubmit={reviewSubmission} noValidate>
        <div className="cmp-main">
          {linkTypes.length > 0 && (
            <section className="community-card cmp-section" aria-labelledby="cmp-links-title">
              <h2 id="cmp-links-title">Project links</h2>
              <p className="cmp-section-hint">Add at least one link. Links must be public so reviewers can open them.</p>
              <div className="cmp-fields">
                {linkTypes.map(({ type, required }) => {
                  const field = LINK_FIELDS[type];
                  const LinkIcon = LINK_ICONS[type] ?? Link2;
                  const errorId = `cmp-link-${type}-error`;
                  const message = errors[`link-${type}`];
                  return (
                    <div className="community-field" key={type}>
                      <label htmlFor={`cmp-link-${type}`} className="cmp-label">
                        {field.label} {!required && <span className="community-field-optional">(optional)</span>}
                      </label>
                      <div className="cmp-input-icon">
                        <LinkIcon size={18} aria-hidden="true" />
                        <input
                          id={`cmp-link-${type}`}
                          type="url"
                          inputMode="url"
                          className="ui-input"
                          placeholder={field.placeholder}
                          value={links[type]}
                          onChange={(event) => setLink(type, event.target.value)}
                          aria-invalid={message ? "true" : undefined}
                          aria-describedby={message ? errorId : undefined}
                          aria-required={required || undefined}
                          autoComplete="url"
                        />
                      </div>
                      {message && <p id={errorId} className="cmp-field-error"><CircleAlert size={15} aria-hidden="true" /> {message}</p>}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {fileRules && (
            <section className="community-card cmp-section" aria-labelledby="cmp-files-title">
              <h2 id="cmp-files-title">Files {!fileRules.required && <span className="community-field-optional">(optional)</span>}</h2>
              <p className="cmp-section-hint">{fileKindsText(fileRules.kinds)}. Up to {fileRules.maxFiles} files, {fileRules.maxSizeMb} MB each.</p>
              <label
                className={`cmp-dropzone${dragging ? " is-dragging" : ""}`}
                onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => { event.preventDefault(); setDragging(false); addFiles(event.dataTransfer.files); }}
              >
                <span className="community-icon tone-blue" aria-hidden="true"><Upload size={20} /></span>
                <strong>Drag files here or <span>browse</span></strong>
                <small>Screenshots of desktop and mobile views are recommended</small>
                <input
                  ref={fileInput}
                  id="cmp-file-input"
                  type="file"
                  className="sr-only"
                  multiple
                  accept={acceptFor(fileRules.kinds)}
                  disabled={files.length >= fileRules.maxFiles}
                  aria-invalid={errors.files ? "true" : undefined}
                  aria-describedby={errors.files ? "cmp-files-error" : undefined}
                  onChange={(event) => { addFiles(event.target.files); event.target.value = ""; }}
                />
              </label>
              {errors.files && <p id="cmp-files-error" className="cmp-field-error" role="alert"><CircleAlert size={15} aria-hidden="true" /> {errors.files}</p>}
              {files.length > 0 && (
                <ul className="cmp-files" aria-label="Your files">
                  {files.map((file) => {
                    const FileIcon = /\.(png|jpe?g)$/i.test(file.name) ? ImageIcon : FileText;
                    return (
                      <li key={file.id}>
                        <span className="cmp-resource-icon tone-blue" aria-hidden="true"><FileIcon size={18} /></span>
                        <span className="cmp-file-name">
                          <strong>{file.name}</strong>
                          {file.uploading ? (
                            <span className="cmp-upload-bar" role="progressbar" aria-label={`Uploading ${file.name}`} aria-busy="true"><span /></span>
                          ) : (
                            <small>{formatBytes(file.size)} · Uploaded</small>
                          )}
                        </span>
                        {file.uploading
                          ? <small className="cmp-muted-note">Uploading…</small>
                          : (
                            <button type="button" className="cmp-remove" onClick={() => removeFile(file.id)} aria-label={`Remove ${file.name}`} disabled={busy}>
                              <X size={16} aria-hidden="true" />
                            </button>
                          )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          )}

          <section className="community-card cmp-section" aria-labelledby="cmp-notes-title">
            <h2 id="cmp-notes-title"><label htmlFor="cmp-notes">Notes for the reviewer</label> <span className="community-field-optional">(optional)</span></h2>
            <textarea
              id="cmp-notes"
              className="ui-input cmp-notes"
              rows={5}
              maxLength={NOTES_LIMIT}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Anything the reviewer should know: extras you added, decisions you made, what you would improve."
              aria-describedby="cmp-notes-count"
            />
            <p id="cmp-notes-count" className="cmp-counter">{notes.length} / {NOTES_LIMIT}</p>
          </section>
        </div>

        <aside className="cmp-side" aria-label="Submit">
          <fieldset className="community-card cmp-section cmp-fieldset" aria-describedby={errors.confirmations ? "cmp-check-error" : undefined}>
            <legend className="cmp-legend">Before you submit</legend>
            <div className="cmp-check-list">
              {checks.map((item) => (
                <label key={item.key} className="cmp-check" htmlFor={`cmp-check-${item.key}`}>
                  <input
                    id={`cmp-check-${item.key}`}
                    type="checkbox"
                    checked={Boolean(confirmations[item.key])}
                    onChange={(event) => setConfirmation(item.key, event.target.checked)}
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
            {errors.confirmations && <p id="cmp-check-error" className="cmp-field-error"><CircleAlert size={15} aria-hidden="true" /> {errors.confirmations}</p>}
          </fieldset>

          <section className="community-card cmp-section" aria-labelledby="cmp-next-title">
            <h2 id="cmp-next-title">What happens next</h2>
            <ol className="cmp-next">
              <li>Status changes to Under Review.</li>
              <li>A reviewer scores it out of {project.maxScore ?? 100}.</li>
              <li>Approved projects earn +{project.points ?? 50} points and can go to the Showcase.</li>
              <li>If corrections are needed you can resubmit {resubmitting ? `${resubmissionsLeft === 1 ? "once more" : `${resubmissionsLeft} more times`}` : "once"}.</li>
            </ol>
          </section>

          <div className="cmp-submit-actions">
            <button type="submit" className="btn btn-primary" disabled={busy}>
              {sending === "submit" ? "Submitting…" : resubmitting ? "Resubmit project" : "Submit project"}
            </button>
            <button type="button" className="btn btn-outline" onClick={saveDraft} disabled={busy}>
              {sending === "draft" ? "Saving…" : "Save draft"}
            </button>
          </div>
        </aside>
      </form>

      <Modal
        open={confirmOpen}
        onClose={sending ? undefined : closeConfirm}
        title={`${resubmitting ? "Resubmit" : "Submit"} “${project.title}”?`}
        description="You can’t edit your links or files while the project is under review."
      >
        <dl className="cmp-confirm-list">
          {linkTypes.filter(({ type }) => links[type].trim()).map(({ type }) => (
            <div key={type}><dt>{LINK_FIELDS[type].label}</dt><dd>{links[type].trim()}</dd></div>
          ))}
          <div><dt>Files</dt><dd>{files.length ? files.map((file) => file.name).join(", ") : "None"}</dd></div>
        </dl>
        <div className="cmp-modal-actions">
          <button type="button" className="btn btn-outline" onClick={closeConfirm} disabled={busy}>Keep editing</button>
          <button type="button" className="btn btn-primary" onClick={send} disabled={busy}>
            {sending === "submit" ? "Submitting…" : resubmitting ? "Resubmit for review" : "Submit for review"}
          </button>
        </div>
      </Modal>

      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </div>
  );
}
