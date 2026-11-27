import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CircleCheck, Clock, FolderGit2, Link2, Lock, Upload, Video, X } from "lucide-react";

import Loader from "../../../components/common/Loader";
import Toast from "../../../components/feedback/Toast";
import { useCommunityList } from "../../../features/community/listHooks";
import { getHackathonSubmission, saveHackathonSubmission, uploadScreenshot } from "../../../features/community/hackathons/hackathonService";
import {
  clockText,
  DESCRIPTION_LIMIT,
  FIELD_ORDER,
  fullDateTime,
  MAX_SCREENSHOT_BYTES,
  MAX_SCREENSHOTS,
  numberFormat,
  SCREENSHOT_TYPES,
  shortDate,
  spokenDuration,
  timeOnly,
  useServerNow,
  validateSubmission,
  wat,
} from "../../../features/community/hackathons/hackathonUtils";

const FIELD_LABELS = {
  projectName: "Project name",
  githubUrl: "GitHub repository",
  liveUrl: "Live project link",
  videoUrl: "Demo video link",
  description: "Project description",
  screenshots: "Screenshots",
  confirmed: "Confirmation",
};

export default function HackathonSubmission() {
  const { id = "" } = useParams();
  const { data, error, loading, reload } = useCommunityList(getHackathonSubmission, { id });
  const detailsPath = `/community/hackathons/${encodeURIComponent(id)}`;

  if (loading) return <Loader label="Loading your submission…" />;
  if (error && !data) {
    return (
      <div className="community-library cmh-page">
        <Link to={detailsPath} className="cmh-back"><ArrowLeft size={17} aria-hidden="true" /> Hackathon details</Link>
        <div className="community-card community-empty">
          <span className="community-icon tone-amber"><Lock size={22} aria-hidden="true" /></span>
          <h1 className="cmh-empty-title">You can't submit to this hackathon</h1>
          <p className="muted-text">{error}</p>
          <div className="cmh-header-actions">
            <Link to={detailsPath} className="btn btn-primary">View hackathon</Link>
            <button type="button" className="btn btn-outline" onClick={reload}>Try again</button>
          </div>
        </div>
      </div>
    );
  }
  if (!data) return null;
  return <SubmissionScreen data={data} />;
}

function SubmissionScreen({ data }) {
  const { hackathon, isSample, clockOffset, viewerIsLeader, teamName, teamSize } = data;
  const now = useServerNow(clockOffset);
  const deadline = new Date(hackathon.endsAt).getTime();
  const remaining = Math.max(0, deadline - now);
  const [closedByServer, setClosedByServer] = useState(false);
  const closed = remaining === 0 || closedByServer;
  const team = hackathon.participation === "team";
  const workspacePath = `/community/hackathons/${encodeURIComponent(hackathon.id)}/workspace`;

  const [fields, setFields] = useState(() => ({
    projectName: data.submission.projectName ?? "",
    githubUrl: data.submission.githubUrl ?? "",
    liveUrl: data.submission.liveUrl ?? "",
    videoUrl: data.submission.videoUrl ?? "",
    description: data.submission.description ?? "",
    screenshots: data.submission.screenshots ?? [],
    confirmed: Boolean(data.submission.confirmed),
  }));
  const [saved, setSaved] = useState(data.submission);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(null); // "final" | "draft" | null
  const [uploading, setUploading] = useState(0);
  const [formError, setFormError] = useState("");
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);
  const summaryRef = useRef(null);
  const successRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const readOnly = !viewerIsLeader || closed;

  useEffect(() => {
    if (justSubmitted) successRef.current?.focus();
  }, [justSubmitted]);

  function change(name, value) {
    setFields((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function addFiles(fileList) {
    const files = [...fileList];
    const room = MAX_SCREENSHOTS - fields.screenshots.length;
    const problems = [];
    const accepted = [];
    files.forEach((file) => {
      if (!SCREENSHOT_TYPES.includes(file.type)) problems.push(`${file.name} is not a PNG or JPG.`);
      else if (file.size > MAX_SCREENSHOT_BYTES) problems.push(`${file.name} is larger than 5 MB.`);
      else if (accepted.length >= room) problems.push(`${file.name} was not added: up to ${MAX_SCREENSHOTS} screenshots.`);
      else accepted.push(file);
    });
    setErrors((current) => ({ ...current, screenshots: problems.length ? problems.join(" ") : undefined }));
    if (!accepted.length) return;
    setUploading((count) => count + accepted.length);
    for (const file of accepted) {
      try {
        const uploaded = await uploadScreenshot(file, { sample: isSample });
        setFields((current) => ({ ...current, screenshots: [...current.screenshots, uploaded].slice(0, MAX_SCREENSHOTS) }));
      } catch (uploadError) {
        setErrors((current) => ({ ...current, screenshots: `${file.name} could not be uploaded. ${uploadError.message || "Please try again."}` }));
      } finally {
        setUploading((count) => count - 1);
      }
    }
  }

  function removeShot(index) {
    setFields((current) => ({ ...current, screenshots: current.screenshots.filter((_, position) => position !== index) }));
  }

  async function save(final) {
    setFormError("");
    const found = validateSubmission(fields, { final, teamSize });
    setErrors(found);
    if (Object.keys(found).length) {
      window.setTimeout(() => summaryRef.current?.focus(), 0);
      return;
    }
    setSending(final ? "final" : "draft");
    try {
      const result = await saveHackathonSubmission(hackathon.id, fields, { final, sample: isSample, deadline: hackathon.endsAt });
      const submission = result?.submission ?? { ...saved, status: final ? "submitted" : saved.status, updatedAt: new Date().toISOString() };
      setSaved(submission);
      if (final) {
        setJustSubmitted(true);
        setToast({ type: "success", message: `${fields.projectName.trim()} was submitted.` });
      } else {
        setToast({ type: "success", message: "Draft saved." });
      }
    } catch (saveError) {
      if (saveError.code === "closed" || saveError.status === 409) setClosedByServer(true);
      setFormError(saveError.message || "Your submission could not be saved. Your answers are still here — please try again.");
    } finally {
      setSending(null);
    }
  }

  const errorList = FIELD_ORDER.filter((name) => errors[name]);
  const describedBy = (name, hint) => [errors[name] ? `err-${name}` : null, hint ? `hint-${name}` : null].filter(Boolean).join(" ") || undefined;

  return (
    <div className="community-library cmh-page">
      <Link to={workspacePath} className="cmh-back"><ArrowLeft size={17} aria-hidden="true" /> Back to workspace</Link>

      {isSample && (
        <p className="community-sample-notice" role="status">
          Showing sample data: the Community API is not available yet. Nothing is sent and uploads stay in your browser. This notice only appears on the local dev server.
        </p>
      )}

      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">HACKATHON SUBMISSION</span>
          <h1>Submit your project</h1>
          <p>{hackathon.title}{teamName ? ` · ${teamName}` : ""}</p>
        </div>
        <p className={`cmh-closes${closed ? " is-closed" : ""}`} role="timer" aria-label={closed ? "Submissions closed" : `Closes in ${spokenDuration(remaining)}`}>
          <Clock size={17} aria-hidden="true" />
          <span aria-hidden="true">{closed ? "Submissions closed" : <>Closes in <strong>{clockText(remaining)}</strong></>}</span>
        </p>
      </header>

      <div className="cmh-submit-layout">
        <section className="community-card cmh-form-card" aria-label="Submission form">
          {justSubmitted && (
            <div className="cmh-success" role="status" tabIndex={-1} ref={successRef}>
              <CircleCheck size={22} aria-hidden="true" />
              <div>
                <strong>Project submitted</strong>
                <p>
                  {fields.projectName.trim()} was submitted {saved.submittedAt ? `at ${wat(timeOnly, saved.submittedAt)}` : ""}.
                  {" "}You can update it until {wat(fullDateTime, hackathon.endsAt)}. Results will be published by {shortDate.format(new Date(hackathon.resultsAt ?? hackathon.endsAt))}.
                </p>
                <Link to={workspacePath}>Back to workspace</Link>
              </div>
            </div>
          )}

          {!justSubmitted && saved.status === "submitted" && !closed && (
            <p className="cmh-alert is-info"><CircleCheck size={18} aria-hidden="true" /><span><strong>Already submitted.</strong> Changes you submit now replace your earlier entry.</span></p>
          )}

          {closed && (
            <p className="cmh-alert is-closed" role="status">
              <Lock size={18} aria-hidden="true" />
              <span><strong>Submissions closed.</strong> The {hackathon.title} deadline passed on {shortDate.format(new Date(hackathon.endsAt))} at {wat(timeOnly, hackathon.endsAt)}.{saved.status === "submitted" ? " Your submission was received." : ""}</span>
            </p>
          )}

          {!viewerIsLeader && !closed && (
            <p className="cmh-alert is-info"><Lock size={18} aria-hidden="true" /><span><strong>Only the team leader can submit.</strong> You can see what your team has saved so far.</span></p>
          )}

          {errorList.length > 0 && (
            <div className="community-error-summary" tabIndex={-1} ref={summaryRef} role="alert">
              <strong>Fix {errorList.length === 1 ? "this problem" : `these ${errorList.length} problems`} first:</strong>
              <ul>
                {errorList.map((name) => (
                  <li key={name}><a href={`#field-${name}`} onClick={(event) => { event.preventDefault(); document.getElementById(`field-${name}`)?.focus(); }}>{FIELD_LABELS[name]}: {errors[name]}</a></li>
                ))}
              </ul>
            </div>
          )}

          <form className="cmh-form" onSubmit={(event) => { event.preventDefault(); save(true); }} noValidate>
            <fieldset disabled={readOnly} className="cmh-form-fields">
              <legend className="sr-only">Your project</legend>

              <div className="community-field">
                <label htmlFor="field-projectName" className="cmh-label">Project name</label>
                <input id="field-projectName" className="ui-input" value={fields.projectName} maxLength={80} aria-invalid={Boolean(errors.projectName)} aria-describedby={describedBy("projectName")} onChange={(event) => change("projectName", event.target.value)} />
                {errors.projectName && <p id="err-projectName" className="field-error">{errors.projectName}</p>}
              </div>

              <UrlField name="githubUrl" label="GitHub repository" icon={FolderGit2} placeholder="https://github.com/your-team/project" value={fields.githubUrl} error={errors.githubUrl} describedBy={describedBy("githubUrl")} onChange={change} />
              <UrlField name="liveUrl" label="Live project link" icon={Link2} placeholder="https://your-project.vercel.app" value={fields.liveUrl} error={errors.liveUrl} describedBy={describedBy("liveUrl", true)} hint="Or a link to download your APK for mobile apps." onChange={change} />
              <UrlField name="videoUrl" label="Demo video link" icon={Video} placeholder="https://youtu.be/…  or  https://loom.com/…" value={fields.videoUrl} error={errors.videoUrl} describedBy={describedBy("videoUrl", true)} hint="Up to 3 minutes. YouTube (unlisted is fine) or Loom." onChange={change} />

              <div className="community-field">
                <label htmlFor="field-description" className="cmh-label">Project description</label>
                <textarea id="field-description" className="ui-input" rows={5} value={fields.description} aria-invalid={Boolean(errors.description)} aria-describedby={describedBy("description", true)} onChange={(event) => change("description", event.target.value)} />
                <p id="hint-description" className={`community-field-counter cmh-counter${fields.description.length > DESCRIPTION_LIMIT ? " is-over" : ""}`}>
                  {numberFormat.format(fields.description.length)} / {numberFormat.format(DESCRIPTION_LIMIT)} characters
                </p>
                {errors.description && <p id="err-description" className="field-error">{errors.description}</p>}
              </div>

              <div className="community-field">
                <span className="cmh-label" id="label-screenshots">Screenshots</span>
                <label
                  className={`cmh-dropzone${dragging ? " is-dragging" : ""}`}
                  onDragOver={(event) => { event.preventDefault(); if (!readOnly) setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(event) => { event.preventDefault(); setDragging(false); if (!readOnly) addFiles(event.dataTransfer.files); }}
                >
                  <input
                    id="field-screenshots"
                    type="file"
                    className="sr-only"
                    accept="image/png,image/jpeg"
                    multiple
                    aria-labelledby="label-screenshots"
                    aria-describedby={describedBy("screenshots", true)}
                    disabled={readOnly || fields.screenshots.length >= MAX_SCREENSHOTS}
                    onChange={(event) => { addFiles(event.target.files); event.target.value = ""; }}
                  />
                  <Upload size={24} aria-hidden="true" />
                  <span><strong>Click to upload</strong> or drag and drop</span>
                  <small id="hint-screenshots">PNG or JPG · up to {MAX_SCREENSHOTS} files · 5 MB each</small>
                </label>
                {uploading > 0 && <p className="cmh-muted" role="status">Uploading {uploading} file{uploading === 1 ? "" : "s"}…</p>}
                {errors.screenshots && <p id="err-screenshots" className="field-error">{errors.screenshots}</p>}
                {fields.screenshots.length > 0 && (
                  <ul className="cmh-shots" aria-label="Uploaded screenshots">
                    {fields.screenshots.map((shot, index) => (
                      <li key={`${shot.url}-${shot.name}`}>
                        <img src={shot.url} alt={`Screenshot: ${shot.name}`} />
                        <span>{shot.name}</span>
                        {!readOnly && (
                          <button type="button" onClick={() => removeShot(index)} aria-label={`Remove ${shot.name}`}><X size={14} aria-hidden="true" /></button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="cmh-agree">
                  <input id="field-confirmed" type="checkbox" checked={fields.confirmed} aria-invalid={Boolean(errors.confirmed)} aria-describedby={describedBy("confirmed")} onChange={(event) => change("confirmed", event.target.checked)} />
                  <span>
                    {team
                      ? `I confirm all ${teamSize} team members contributed and this work was created during the hackathon.`
                      : "I confirm this is my own work and it was created during the hackathon."}
                  </span>
                </label>
                {errors.confirmed && <p id="err-confirmed" className="field-error">{errors.confirmed}</p>}
              </div>
            </fieldset>

            {formError && <p className="field-error" role="alert">{formError}</p>}

            {!readOnly && (
              <div className="cmh-form-actions">
                <button type="submit" className="btn btn-primary" disabled={Boolean(sending) || uploading > 0}>
                  {sending === "final" ? "Submitting…" : saved.status === "submitted" ? "Update submission" : "Submit project"}
                </button>
                <button type="button" className="btn btn-outline" disabled={Boolean(sending) || uploading > 0} onClick={() => save(false)}>
                  {sending === "draft" ? "Saving…" : "Save draft"}
                </button>
                {saved.updatedAt && <span className="cmh-muted">Last saved {wat(fullDateTime, saved.updatedAt)}</span>}
              </div>
            )}
          </form>
        </section>

        <aside className="cmh-details-side" aria-label="Before you submit">
          <section className="community-card" aria-labelledby="cmh-before">
            <h2 id="cmh-before" className="cmh-card-title">Before you submit</h2>
            <ul className="cmh-bullets">
              <li>Make the repository public</li>
              <li>Check the live link opens in a private window</li>
              {team && <li>Only the team leader can submit</li>}
              <li>You can update until {wat(timeOnly, hackathon.endsAt)} on {shortDate.format(new Date(hackathon.endsAt))}</li>
            </ul>
          </section>
          <section className="community-card" aria-labelledby="cmh-status">
            <h2 id="cmh-status" className="cmh-card-title">Submission status</h2>
            <p className="cmh-status-line">
              <span className={`community-tag ${saved.status === "submitted" ? "tag-green" : saved.status === "draft" ? "tag-amber" : "tag-neutral"}`}>
                {saved.status === "submitted" ? "Submitted" : saved.status === "draft" ? "Draft saved" : "Not started"}
              </span>
            </p>
            <p className="cmh-note">
              {saved.status === "submitted"
                ? `Submitted ${saved.submittedAt ? wat(fullDateTime, saved.submittedAt) : ""}. The judges see your latest version at the deadline.`
                : "Drafts are not judged. Submit before the deadline — late entries are closed automatically."}
            </p>
          </section>
        </aside>
      </div>

      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </div>
  );
}

function UrlField({ name, label, icon: Icon, placeholder, value, error, describedBy, hint, onChange }) {
  return (
    <div className="community-field">
      <label htmlFor={`field-${name}`} className="cmh-label">{label}</label>
      <div className={`cmh-input-icon${error ? " is-invalid" : ""}`}>
        <span aria-hidden="true"><Icon size={18} /></span>
        <input
          id={`field-${name}`}
          type="url"
          inputMode="url"
          autoComplete="url"
          className="ui-input"
          placeholder={placeholder}
          value={value}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={(event) => onChange(name, event.target.value)}
        />
      </div>
      {hint && <p id={`hint-${name}`} className="community-field-hint">{hint}</p>}
      {error && <p id={`err-${name}`} className="field-error">{error}</p>}
    </div>
  );
}
