import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FileUp, Paperclip, X } from "lucide-react";

import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { StatusBadge, TextArea, TextField } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";
import { api, uploadFile } from "../../services/api/api";
import { formatDate } from "../../utils/formatDate";

function isHttpsUrl(value) {
  if (!value.trim()) return true;
  try {
    return new URL(value.trim()).protocol === "https:";
  } catch {
    return false;
  }
}

export default function ProjectSubmission() {
  const { trackId, projectId } = useParams();
  const navigate = useNavigate();
  const projectResource = useApiResource(`/learning/projects/${encodeURIComponent(projectId)}`, "project", null);
  const submissionsResource = useApiResource("/learning/submissions", "submissions");
  const [form, setForm] = useState({ description: "", liveUrl: "", githubUrl: "", figmaUrl: "" });
  const [attachment, setAttachment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const project = projectResource.data;

  if (projectResource.loading) return <div className="page-container"><Loader label="Loading submission form…" /></div>;
  if (projectResource.error && !/not found/i.test(projectResource.error)) return <div className="page-container"><ErrorMessage message={projectResource.error} onRetry={projectResource.reload} /></div>;
  if (!project || project.trackId !== trackId) {
    return <div className="page-container"><EmptyState title="Project not found" description="The project may have been removed." actionLabel="Return to projects" actionHref={`/free-learning/${trackId}/projects`} /></div>;
  }

  const previous = submissionsResource.data.filter((item) => item.projectId === project.id);
  const set = (name) => (value) => {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "", links: "" }));
  };

  async function handleFile(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setMessage("");
    try {
      setAttachment(await uploadFile(file, "attachment"));
    } catch (error) {
      setMessage(error.message || "The file could not be uploaded.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const next = {};
    if (form.description.trim().length < 20) next.description = "Describe your work in at least 20 characters.";
    for (const key of ["liveUrl", "githubUrl", "figmaUrl"]) if (!isHttpsUrl(form[key])) next[key] = "Enter a full link starting with https://";
    if (!form.liveUrl.trim() && !form.githubUrl.trim() && !form.figmaUrl.trim() && !attachment) next.links = "Add at least one link or upload a file.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    setMessage("");
    try {
      await api.post(`/learning/projects/${encodeURIComponent(project.id)}/submissions`, {
        description: form.description.trim(),
        liveUrl: form.liveUrl.trim(),
        githubUrl: form.githubUrl.trim(),
        figmaUrl: form.figmaUrl.trim(),
        attachment: attachment ? { url: attachment.url, name: attachment.name, size: attachment.size, type: attachment.type } : null,
      });
      navigate("/my-submissions", { state: { message: "Your project submission has been saved. You will be notified when it is reviewed." } });
    } catch (error) {
      setMessage(error.message || "Unable to save your submission. Please try again.");
      setSaving(false);
    }
  }

  return (
    <div className="page-container submission-page free-learning-shell">
      <Link to={`/free-learning/${trackId}/projects/${projectId}`} className="back-link"><ArrowLeft size={17} aria-hidden="true" /> Back to the brief</Link>
      <section className="submission-header">
        <span className="eyebrow">PROJECT SUBMISSION</span>
        <h1>Submit your work</h1>
        <p>Project: <strong>{project.title}</strong></p>
        {project.submissionInstructions && <p className="muted-text">{project.submissionInstructions}</p>}
      </section>

      {!project.allowSubmissions ? <p className="alert alert-info">Submissions are not open for this project.</p> : (
        <form className="submission-form ui-form" onSubmit={handleSubmit} noValidate>
          <TextArea label="Describe your project" required rows={6} value={form.description} onChange={set("description")} error={errors.description} maxLength={5000}
            placeholder="What did you build, which tools did you use, and what did you learn?" />
          <div className="ui-form-grid">
            <TextField label="Live project link" type="url" inputMode="url" value={form.liveUrl} onChange={set("liveUrl")} error={errors.liveUrl} placeholder="https://your-project.example" />
            <TextField label="GitHub repository" type="url" inputMode="url" value={form.githubUrl} onChange={set("githubUrl")} error={errors.githubUrl} placeholder="https://github.com/you/project" />
            <TextField label="Figma file" type="url" inputMode="url" value={form.figmaUrl} onChange={set("figmaUrl")} error={errors.figmaUrl} placeholder="https://www.figma.com/file/..." />
          </div>
          <div className="ui-field">
            <span className="ui-field-label">File attachment (optional)</span>
            {attachment ? (
              <div className="selected-file">
                <Paperclip size={17} aria-hidden="true" /> {attachment.name}
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAttachment(null)} aria-label="Remove file"><X size={16} aria-hidden="true" /></button>
              </div>
            ) : (
              <label className="btn btn-outline">
                <FileUp size={17} aria-hidden="true" /> {uploading ? "Uploading…" : "Upload a file"}
                <input type="file" className="sr-only" accept=".pdf,.zip,image/png,image/jpeg,image/webp" onChange={handleFile} disabled={uploading} />
              </label>
            )}
            <p className="ui-hint">PDF, ZIP, or image, up to 10 MB.</p>
          </div>
          {errors.links && <div className="form-error" role="alert">{errors.links}</div>}
          {message && <div className="form-error" role="alert">{message}</div>}
          <div className="submission-form-footer">
            <Link to={`/free-learning/${trackId}/projects/${projectId}`} className="btn btn-outline">Cancel</Link>
            <Button type="submit" loading={saving} disabled={uploading}>Submit project</Button>
          </div>
        </form>
      )}

      {previous.length > 0 && (
        <section className="ui-card section-block">
          <h2>Your previous submissions</h2>
          <ul className="ui-list">
            {previous.map((item) => (
              <li className="ui-list-item" key={item.id}>
                <div className="min-w-0">
                  <h4>Submitted {formatDate(item.createdAt)}{item.score !== null && item.score !== undefined ? ` · ${item.score}/${item.maxScore ?? project.maxScore}` : ""}</h4>
                  <p>{item.feedback || "Feedback has not been added yet."}</p>
                </div>
                <StatusBadge status={item.status} fallback="submitted" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
