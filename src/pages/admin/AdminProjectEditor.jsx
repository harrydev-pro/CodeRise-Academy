import { useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { CheckboxField, ImageField, ListField, Notice, PageHeader, TextArea, TextField } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";
import { api } from "../../services/api/api";

// "Title | https://link" per line <-> [{ title, url }] (lines without a link stay as text).
const refsToText = (refs) => (refs || []).map((ref) => (typeof ref === "string" ? ref : `${ref.title} | ${ref.url}`)).join("\n");
const textToRefs = (text) => text.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
  const [title, url] = line.split("|").map((part) => part.trim());
  return url ? { title, url } : line;
});
const rubricToText = (rubric) => (rubric || []).map((item) => `${item.criteria} | ${item.points}`).join("\n");
const textToRubric = (text) => text.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
  const [criteria, points] = line.split("|").map((part) => part.trim());
  return { criteria, points: Number.parseInt(points, 10) || 0 };
});

function Editor({ project, trackId }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(() => ({
    title: project?.title || "", description: project?.description || "", level: project?.level || "", estimatedTime: project?.estimatedTime || "",
    maxScore: project?.maxScore ?? 100, imageUrl: project?.imageUrl || "", objectives: project?.objectives || [], requirements: project?.requirements || [],
    steps: project?.steps || [], expectedOutcome: project?.expectedOutcome || "", submissionInstructions: project?.submissionInstructions || "",
    references: refsToText(project?.referenceMaterials), rubric: rubricToText(project?.rubric),
    deadline: project?.deadline ? project.deadline.slice(0, 10) : "", allowSubmissions: project?.allowSubmissions ?? true,
    published: project?.published ?? false, archived: project?.archived ?? false,
  }));
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));

  async function save(event) {
    event.preventDefault();
    if (form.title.trim().length < 2) return setNotice({ tone: "error", text: "Enter a project title." });
    const body = {
      title: form.title.trim(), description: form.description.trim(), level: form.level.trim(), estimatedTime: form.estimatedTime.trim(),
      maxScore: Number(form.maxScore) || 100, imageUrl: form.imageUrl.trim(), objectives: form.objectives, requirements: form.requirements,
      steps: form.steps, expectedOutcome: form.expectedOutcome.trim(), submissionInstructions: form.submissionInstructions.trim(),
      referenceMaterials: textToRefs(form.references), rubric: textToRubric(form.rubric),
      deadline: form.deadline ? new Date(`${form.deadline}T23:59:00`).toISOString() : null,
      allowSubmissions: form.allowSubmissions, published: form.published, ...(project ? { archived: form.archived } : {}),
    };
    setSaving(true);
    setNotice(null);
    try {
      const saved = project ? await api.patch(`/admin/projects/${project.id}`, body, "project") : await api.post(`/admin/tracks/${trackId}/projects`, body, "project");
      setNotice({ tone: "info", text: "Project saved." });
      if (!project) navigate(`/admin/projects/${saved.id}`, { replace: true });
    } catch (error) {
      setNotice({ tone: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="ui-form" onSubmit={save} noValidate>
      <Notice tone={notice?.tone}>{notice?.text}</Notice>
      <div className="ui-card ui-form">
        <h2>Brief</h2>
        <TextField label="Title" value={form.title} onChange={set("title")} required />
        <TextArea label="Description" rows={3} value={form.description} onChange={set("description")} />
        <div className="ui-form-grid">
          <TextField label="Difficulty level" value={form.level} onChange={set("level")} placeholder="Beginner, Junior, Intermediate" />
          <TextField label="Estimated time" value={form.estimatedTime} onChange={set("estimatedTime")} placeholder="For example: 1 week" />
          <TextField label="Maximum score" type="number" inputMode="numeric" min="1" max="1000" value={form.maxScore} onChange={set("maxScore")} />
          <TextField label="Deadline (optional)" type="date" value={form.deadline} onChange={set("deadline")} />
        </div>
        <ImageField label="Project image" value={form.imageUrl} onChange={set("imageUrl")} />
      </div>
      <div className="ui-card ui-form">
        <h2>Details</h2>
        <div className="ui-form-grid">
          <ListField label="Learning objectives" value={form.objectives} onChange={set("objectives")} />
          <ListField label="Requirements" value={form.requirements} onChange={set("requirements")} />
          <ListField label="Instructions (steps)" value={form.steps} onChange={set("steps")} />
        </div>
        <TextArea label="Expected outcome" rows={3} value={form.expectedOutcome} onChange={set("expectedOutcome")} />
        <TextArea label="Submission instructions" rows={3} value={form.submissionInstructions} onChange={set("submissionInstructions")} />
        <TextArea label="Reference materials" rows={4} value={form.references} onChange={set("references")} hint="One per line. Add a link with “Title | https://…”." />
        <TextArea label="Marking guide" rows={4} value={form.rubric} onChange={set("rubric")} hint="One criterion per line: “Criterion | points”." />
      </div>
      <div className="ui-card ui-form">
        <h2>Visibility</h2>
        <CheckboxField label="Published" checked={form.published} onChange={set("published")} />
        <CheckboxField label="Accept submissions" checked={form.allowSubmissions} onChange={set("allowSubmissions")} />
        {project?.archived && <CheckboxField label="Archived" hint="Untick to restore." checked={form.archived} onChange={set("archived")} />}
      </div>
      <div className="ui-form-actions">
        {project && <Button type="button" variant="ghost" className="btn-danger-text" onClick={async () => {
          if (!window.confirm(`Remove "${project.title}"? Projects with submissions are archived instead, so the submissions are kept.`)) return;
          try { const result = await api.delete(`/admin/projects/${project.id}`); window.alert(result.message || "Project deleted."); navigate(`/admin/projects?trackId=${project.trackId}`); } catch (error) { setNotice({ tone: "error", text: error.message }); }
        }}>Delete project</Button>}
        <Button type="submit" loading={saving}>Save project</Button>
      </div>
    </form>
  );
}

export default function AdminProjectEditor() {
  const { projectId } = useParams();
  const [params] = useSearchParams();
  const isNew = projectId === "new";
  const { data: project, loading, error, reload } = useApiResource(`/admin/projects/${encodeURIComponent(projectId)}`, "project", null, !isNew);
  const trackId = isNew ? params.get("trackId") : project?.trackId;
  return (
    <section className="admin-page">
      <Link to={`/admin/projects${trackId ? `?trackId=${trackId}` : ""}`} className="back-link"><ArrowLeft size={17} aria-hidden="true" /> All projects</Link>
      <PageHeader eyebrow={project?.track?.title || "PRACTICAL PROJECT"} title={isNew ? "New project" : project?.title || "Edit project"} />
      {isNew && !trackId ? <p className="alert alert-error">Choose a track first from the projects list.</p>
        : !isNew && loading ? <Loader label="Loading project…" /> : !isNew && error ? <ErrorMessage message={error} onRetry={reload} />
          : <Editor key={project?.id || "new"} project={isNew ? null : project} trackId={trackId} />}
    </section>
  );
}
