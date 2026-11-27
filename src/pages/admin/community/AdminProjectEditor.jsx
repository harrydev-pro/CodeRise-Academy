import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowDown, ArrowUp, ChevronLeft, Crown, Eye, FileText, ImagePlus, Paperclip, Plus, Trash2, Upload, X } from "lucide-react";

import Loader from "../../../components/common/Loader";
import Modal from "../../../components/common/Modal";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import Toast from "../../../components/feedback/Toast";
import {
  criteriaTotal,
  deleteAdminProject,
  getAdminProject,
  PROJECT_DURATIONS,
  PROJECT_LEVELS,
  saveAdminProject,
  setAdminProjectStatus,
  SUBMISSION_TYPES,
  uploadProjectFile,
  validateProject,
} from "../../../features/community/admin/adminProjectsService";
import DeleteProjectDialog from "../../../features/community/admin/DeleteProjectDialog";
import { useCommunityList } from "../../../features/community/listHooks";
import ProjectCard from "../../../features/community/ProjectCard";

const SHORT_LIMIT = 160;
const MB = 1024 * 1024;
const STATUS = {
  published: { label: "Published", tone: "green" },
  draft: { label: "Draft", tone: "amber" },
  unpublished: { label: "Unpublished", tone: "neutral" },
};
// Order the publish checks run in, so the first problem gets focus.
const FIELD_ORDER = ["title", "category", "level", "duration", "shortDescription", "description", "objectives", "steps", "submissionTypes", "criteria"];
const dateTime = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

function fileSize(bytes = 0) {
  return bytes >= MB ? `${(bytes / MB).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function AdminProjectEditor() {
  const { projectId } = useParams();
  const { data, error, loading, reload } = useCommunityList(getAdminProject, { id: projectId ?? "" });

  if (loading) return <section className="admin-page"><Loader label="Loading project…" /></section>;
  if (error) {
    return (
      <section className="admin-page community-admin">
        <Link to="/admin/community/projects" className="community-back-link"><ChevronLeft size={16} aria-hidden="true" /> Back to projects</Link>
        <ErrorMessage message={error} onRetry={reload} />
      </section>
    );
  }
  return <ProjectForm key={data.project.id ?? "new"} initial={data.project} categories={data.categories} sample={data.isSample} />;
}

function ProjectForm({ initial, categories, sample }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isNew = !initial.id;
  const [project, setProject] = useState(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState("");
  const [toast, setToast] = useState(() => location.state?.toast ?? null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const closeToast = useCallback(() => setToast(null), []);
  const summaryRef = useRef(null);

  const dirty = JSON.stringify(project) !== saved;
  const status = STATUS[project.status] ?? STATUS.draft;

  // Warn before leaving the page with unsaved changes.
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = (field) => (value) => {
    setProject((current) => ({ ...current, [field]: value }));
    if (errors[field]) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  async function save(nextStatus) {
    const publishing = nextStatus === "published";
    const found = validateProject(project, { publishing });
    const problems = Object.entries(found).filter(([, message]) => message);
    if (problems.length) {
      setErrors(found);
      const first = FIELD_ORDER.find((field) => found[field]);
      window.requestAnimationFrame(() => {
        const target = document.getElementById(`field-${first}`);
        if (target) { target.scrollIntoView({ behavior: "smooth", block: "center" }); target.focus?.({ preventScroll: true }); }
        else summaryRef.current?.focus();
      });
      return;
    }
    setErrors({});
    setBusy(nextStatus === "published" && project.status !== "published" ? "publish" : "save");
    try {
      const payload = {
        ...project,
        status: nextStatus,
        objectives: project.objectives.map((item) => item.trim()).filter(Boolean),
        steps: project.steps.filter((step) => step.title.trim() || step.details.trim()),
        criteria: project.criteria.filter((item) => item.name.trim() || item.weight !== "").map((item) => ({ ...item, weight: Number(item.weight) || 0 })),
      };
      const result = await saveAdminProject(payload, { sample });
      const savedProject = result?.project ?? result;
      const message = publishing && project.status !== "published"
        ? `“${savedProject.title}” is published and live in the Project Library.`
        : isNew ? "Draft saved." : "Changes saved.";
      if (isNew) {
        setSaved(JSON.stringify(project)); // let the page go without the unsaved-changes warning
        navigate(`/admin/community/projects/${encodeURIComponent(savedProject.id)}/edit`, { replace: true, state: { toast: { type: "success", message } } });
        return;
      }
      setProject(savedProject);
      setSaved(JSON.stringify(savedProject));
      setToast({ type: "success", message });
    } catch (saveError) {
      setToast({ type: "error", message: saveError.message || "The project could not be saved. Please try again." });
    } finally {
      setBusy("");
    }
  }

  async function changeStatus(nextStatus) {
    if (nextStatus === "published") return save("published");
    setBusy("status");
    try {
      const result = await setAdminProjectStatus(project.id, nextStatus, { sample });
      const updated = result?.project ?? { ...project, status: nextStatus };
      // Keep any unsaved edits; only the status changes.
      setProject((current) => ({ ...current, status: updated.status }));
      setSaved((current) => JSON.stringify({ ...JSON.parse(current), status: updated.status }));
      setToast({ type: "success", message: "Unpublished. Students can no longer open this project." });
    } catch (statusError) {
      setToast({ type: "error", message: statusError.message || "The status could not be changed." });
    } finally {
      setBusy("");
    }
    return undefined;
  }

  const errorList = FIELD_ORDER.filter((field) => errors[field]);

  return (
    <section className="admin-page community-admin community-editor">
      <Link to="/admin/community/projects" className="community-back-link"><ChevronLeft size={16} aria-hidden="true" /> Back to projects</Link>

      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">PROJECT LIBRARY</span>
          <h1>{isNew ? "Create project" : JSON.parse(saved).title || "Untitled project"}</h1>
          {isNew ? (
            <p>Fill in the brief students will see. Save as a draft at any time; publishing makes it live in the Project Library.</p>
          ) : (
            <div className="community-tags">
              <span className={`community-tag tag-${status.tone}`}>{status.label}</span>
              <span className={`community-tag ${project.access === "premium" ? "tag-purple" : "tag-green"}`}>{project.access === "premium" ? "Premium" : "Free"}</span>
              {dirty && <span className="community-tag tag-amber">Unsaved changes</span>}
            </div>
          )}
        </div>
        {isNew ? (
          <span className="community-tag tag-amber">{dirty ? "Draft · not saved yet" : "New draft"}</span>
        ) : (
          <div className="community-editor-actions">
            <button type="button" className="btn btn-outline btn-sm community-btn-danger-outline" onClick={() => setDeleteOpen(true)} disabled={Boolean(busy)}><Trash2 size={16} aria-hidden="true" /> Delete</button>
            {project.status === "published"
              ? <button type="button" className="btn btn-outline btn-sm" onClick={() => changeStatus("unpublished")} disabled={Boolean(busy)}>{busy === "status" ? "Unpublishing…" : "Unpublish"}</button>
              : <button type="button" className="btn btn-outline btn-sm" onClick={() => changeStatus("published")} disabled={Boolean(busy)}>{busy === "publish" ? "Publishing…" : "Publish"}</button>}
            <button type="button" className="btn btn-primary btn-sm" onClick={() => save(project.status)} disabled={Boolean(busy) || !dirty}>{busy === "save" ? "Saving…" : "Save changes"}</button>
          </div>
        )}
      </header>

      {sample && (
        <p className="community-sample-notice" role="status">
          Showing sample data: the admin Community API is not available yet. Saving keeps changes in this browser tab only, and uploads stay on this computer. This notice only appears on the local dev server.
        </p>
      )}

      {errorList.length > 0 && (
        <div className="community-error-summary" role="alert" tabIndex={-1} ref={summaryRef}>
          <strong>Fix {errorList.length === 1 ? "this" : `these ${errorList.length} things`} first:</strong>
          <ul>
            {errorList.map((field) => <li key={field}><a href={`#field-${field}`}>{errors[field]}</a></li>)}
          </ul>
        </div>
      )}

      <form className="community-editor-layout" onSubmit={(event) => { event.preventDefault(); save(isNew ? "draft" : project.status); }} noValidate>
        <div className="community-editor-main">
          <BasicsSection project={project} set={set} errors={errors} categories={categories} />
          <GoalsSection project={project} set={set} errors={errors} />
          <StepsSection steps={project.steps} onChange={set("steps")} error={errors.steps} />
          <EvaluationSection project={project} set={set} errors={errors} />
        </div>

        <aside className="community-editor-side">
          <AccessCard access={project.access} onChange={set("access")} />
          <ThumbnailCard url={project.thumbnailUrl} onChange={set("thumbnailUrl")} sample={sample} onError={setToast} />
          <ReferenceImagesCard images={project.referenceImages} onChange={set("referenceImages")} sample={sample} onError={setToast} />
          <StarterFilesCard files={project.starterFiles} onChange={set("starterFiles")} sample={sample} onError={setToast} />
          {!isNew && <DetailsCard project={initial} />}
        </aside>

        {isNew && (
          <div className="community-editor-bar">
            <Link to="/admin/community/projects" className="btn btn-outline btn-sm">Cancel</Link>
            <button type="submit" className="btn btn-outline btn-sm" disabled={Boolean(busy)}>{busy === "save" ? "Saving…" : "Save draft"}</button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setPreviewOpen(true)}><Eye size={16} aria-hidden="true" /> Preview</button>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => save("published")} disabled={Boolean(busy)}>{busy === "publish" ? "Publishing…" : "Publish project"}</button>
          </div>
        )}
      </form>

      {!isNew && (
        <DeleteProjectDialog
          open={deleteOpen}
          titles={[JSON.parse(saved).title]}
          submissions={initial.submissions ?? 0}
          onCancel={() => setDeleteOpen(false)}
          onUnpublish={project.status === "published" ? async () => { await changeStatus("unpublished"); setDeleteOpen(false); } : undefined}
          onDelete={async () => {
            await deleteAdminProject(project.id, { sample });
            setSaved(JSON.stringify(project));
            navigate("/admin/community/projects", { replace: true });
          }}
        />
      )}
      <PreviewDialog open={previewOpen} project={project} onClose={() => setPreviewOpen(false)} />
      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </section>
  );
}

// ---------- small form helpers ----------

function Field({ id, label, optional, hint, error, counter, children }) {
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined;
  return (
    <div className="community-field">
      <div className="community-field-label">
        <label htmlFor={id}>{label}{optional && <span className="community-field-optional"> (optional)</span>}</label>
        {hint && <span id={hintId} className="community-field-hint">{hint}</span>}
        {counter}
      </div>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": describedBy })}
      {error && <p id={errorId} className="field-error">{error}</p>}
    </div>
  );
}

function Card({ title, aside, children, className = "" }) {
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

// ---------- main sections ----------

function BasicsSection({ project, set, errors, categories }) {
  const shortLength = project.shortDescription.length;
  return (
    <Card title="Basics">
      <Field id="field-title" label="Project title" error={errors.title}>
        {(props) => <input {...props} className="ui-input" value={project.title} maxLength={140} onChange={(event) => set("title")(event.target.value)} />}
      </Field>
      <div className="community-field-grid">
        <Field id="field-category" label="Category" error={errors.category}>
          {(props) => (
            <select {...props} className="ui-input" value={project.category} onChange={(event) => set("category")(event.target.value)}>
              <option value="">Choose a category</option>
              {categories.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          )}
        </Field>
        <Field id="field-level" label="Difficulty" error={errors.level}>
          {(props) => (
            <select {...props} className="ui-input" value={project.level} onChange={(event) => set("level")(event.target.value)}>
              <option value="">Choose a difficulty</option>
              {PROJECT_LEVELS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          )}
        </Field>
        <Field id="field-duration" label="Estimated duration" error={errors.duration}>
          {(props) => (
            <select {...props} className="ui-input" value={project.duration} onChange={(event) => set("duration")(event.target.value)}>
              <option value="">Choose a duration</option>
              {PROJECT_DURATIONS.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          )}
        </Field>
        <Field id="field-deadline" label="Submission deadline" optional>
          {(props) => <input {...props} type="date" className="ui-input" value={project.deadline ?? ""} onChange={(event) => set("deadline")(event.target.value)} />}
        </Field>
      </div>
      <Field
        id="field-shortDescription"
        label="Short description"
        hint={`shown on project cards, ${SHORT_LIMIT} characters max`}
        error={errors.shortDescription}
        counter={<span className={`community-field-counter${shortLength > SHORT_LIMIT ? " is-over" : ""}`} aria-live="polite">{shortLength}/{SHORT_LIMIT}</span>}
      >
        {(props) => <textarea {...props} className="ui-input" rows={2} value={project.shortDescription} onChange={(event) => set("shortDescription")(event.target.value)} />}
      </Field>
      <Field id="field-description" label="Full description" error={errors.description}>
        {(props) => <textarea {...props} className="ui-input" rows={5} value={project.description} onChange={(event) => set("description")(event.target.value)} />}
      </Field>
    </Card>
  );
}

function GoalsSection({ project, set, errors }) {
  const objectives = project.objectives.length ? project.objectives : [""];
  const updateObjective = (index, value) => set("objectives")(objectives.map((item, i) => (i === index ? value : item)));
  return (
    <Card title="Learning goals">
      <fieldset className="community-fieldset" aria-describedby={errors.objectives ? "objectives-error" : undefined}>
        <legend>Objectives</legend>
        <div id="field-objectives" tabIndex={-1} className="community-repeat-list">
          {objectives.map((item, index) => (
            <div key={index} className="community-repeat-row">
              <input className="ui-input" aria-label={`Objective ${index + 1}`} value={item} placeholder="What will students be able to do?" onChange={(event) => updateObjective(index, event.target.value)} />
              <button type="button" className="community-icon-button" aria-label={`Remove objective ${index + 1}`} onClick={() => set("objectives")(objectives.filter((_, i) => i !== index))} disabled={objectives.length === 1 && !item}>
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        {errors.objectives && <p id="objectives-error" className="field-error">{errors.objectives}</p>}
        <button type="button" className="btn btn-outline btn-sm community-add-button" onClick={() => set("objectives")([...objectives, ""])}><Plus size={15} aria-hidden="true" /> Add objective</button>
      </fieldset>

      <SkillsInput skills={project.skills} onChange={set("skills")} />

      <Field id="field-requirements" label="Project requirements" hint="one per line">
        {(props) => <textarea {...props} className="ui-input" rows={4} value={project.requirements} onChange={(event) => set("requirements")(event.target.value)} />}
      </Field>
    </Card>
  );
}

function SkillsInput({ skills, onChange }) {
  const [text, setText] = useState("");
  function add(value) {
    const skill = value.trim().replace(/,$/, "").trim();
    if (skill && !skills.some((item) => item.toLowerCase() === skill.toLowerCase())) onChange([...skills, skill]);
    setText("");
  }
  return (
    <div className="community-field">
      <div className="community-field-label"><label htmlFor="field-skills">Required skills</label><span className="community-field-hint">press Enter or comma to add</span></div>
      <div className="community-chip-input">
        <ul aria-label="Required skills" className="community-chip-input-list">
          {skills.map((skill) => (
            <li key={skill} className="community-skill-chip">
              {skill}
              <button type="button" aria-label={`Remove ${skill}`} onClick={() => onChange(skills.filter((item) => item !== skill))}><X size={13} aria-hidden="true" /></button>
            </li>
          ))}
        </ul>
        <input
          id="field-skills"
          value={text}
          placeholder="Add a skill and press Enter"
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

function StepsSection({ steps, onChange, error }) {
  const list = steps.length ? steps : [{ title: "", details: "" }];
  const update = (index, changes) => onChange(list.map((step, i) => (i === index ? { ...step, ...changes } : step)));
  function move(index, direction) {
    const next = [...list];
    const target = index + direction;
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }
  return (
    <Card title="Step-by-step instructions" aside={<span className="community-timeline-month">Use the arrows to reorder</span>}>
      <ol id="field-steps" tabIndex={-1} className="community-step-list">
        {list.map((step, index) => (
          <li key={index} className="community-step">
            <span className="community-step-number" aria-hidden="true">{index + 1}</span>
            <div className="community-step-fields">
              <input className="ui-input" aria-label={`Step ${index + 1} title`} placeholder="Step title" value={step.title} onChange={(event) => update(index, { title: event.target.value })} />
              <textarea className="ui-input" rows={2} aria-label={`Step ${index + 1} instructions`} placeholder="What should students do in this step?" value={step.details} onChange={(event) => update(index, { details: event.target.value })} />
            </div>
            <div className="community-step-tools">
              <button type="button" className="community-icon-button" aria-label={`Move step ${index + 1} up`} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={15} aria-hidden="true" /></button>
              <button type="button" className="community-icon-button" aria-label={`Move step ${index + 1} down`} disabled={index === list.length - 1} onClick={() => move(index, 1)}><ArrowDown size={15} aria-hidden="true" /></button>
              <button type="button" className="community-icon-button" aria-label={`Delete step ${index + 1}`} disabled={list.length === 1} onClick={() => onChange(list.filter((_, i) => i !== index))}><Trash2 size={15} aria-hidden="true" /></button>
            </div>
          </li>
        ))}
      </ol>
      {error && <p className="field-error">{error}</p>}
      <button type="button" className="btn btn-outline btn-sm community-add-button" onClick={() => onChange([...list, { title: "", details: "" }])}><Plus size={15} aria-hidden="true" /> Add step</button>
    </Card>
  );
}

function EvaluationSection({ project, set, errors }) {
  const criteria = project.criteria.length ? project.criteria : [{ name: "", weight: "" }];
  const total = criteriaTotal(criteria);
  const update = (index, changes) => set("criteria")(criteria.map((item, i) => (i === index ? { ...item, ...changes } : item)));
  const toggleType = (value) => set("submissionTypes")(
    project.submissionTypes.includes(value) ? project.submissionTypes.filter((item) => item !== value) : [...project.submissionTypes, value],
  );
  return (
    <Card title="Submission & evaluation">
      <fieldset id="field-submissionTypes" tabIndex={-1} className="community-fieldset">
        <legend>Allowed submission types</legend>
        <div className="community-checkbox-grid">
          {SUBMISSION_TYPES.map((type) => (
            <label key={type.value} className="community-checkbox">
              <input type="checkbox" checked={project.submissionTypes.includes(type.value)} onChange={() => toggleType(type.value)} />
              {type.label}
            </label>
          ))}
        </div>
        {errors.submissionTypes && <p className="field-error">{errors.submissionTypes}</p>}
      </fieldset>

      <fieldset id="field-criteria" tabIndex={-1} className="community-fieldset">
        <legend>Evaluation criteria</legend>
        <div className="community-criteria-head" aria-hidden="true"><span>Criterion</span><span>Weight %</span></div>
        <div className="community-repeat-list">
          {criteria.map((item, index) => (
            <div key={index} className="community-repeat-row community-criterion">
              <input className="ui-input" aria-label={`Criterion ${index + 1}`} placeholder="What will reviewers check?" value={item.name} onChange={(event) => update(index, { name: event.target.value })} />
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
    </Card>
  );
}

// ---------- side column ----------

function AccessCard({ access, onChange }) {
  return (
    <Card title="Access">
      <div className="community-access-toggle" role="radiogroup" aria-label="Who can open this project">
        {[{ value: "free", label: "Free" }, { value: "premium", label: "Premium" }].map((option) => (
          <button key={option.value} type="button" role="radio" aria-checked={access === option.value} className={access === option.value ? "active" : ""} onClick={() => onChange(option.value)}>
            {option.value === "premium" && <Crown size={14} aria-hidden="true" />}{option.label}
          </button>
        ))}
      </div>
      <p className="community-side-note community-access-note">Free projects are open to every registered student. Premium projects show a preview and an upgrade prompt to free students.</p>
    </Card>
  );
}

function useUploader({ sample, onError, purpose, maxBytes, accept }) {
  const [uploading, setUploading] = useState(false);
  async function upload(files) {
    const list = [...files];
    const tooBig = list.find((file) => file.size > maxBytes);
    if (tooBig) { onError({ type: "error", message: `${tooBig.name} is larger than ${fileSize(maxBytes)}.` }); return []; }
    const wrongType = accept && list.find((file) => !accept.includes(file.type));
    if (wrongType) { onError({ type: "error", message: `${wrongType.name} isn't a supported file type.` }); return []; }
    setUploading(true);
    try {
      return await Promise.all(list.map((file) => uploadProjectFile(file, purpose, { sample })));
    } catch (uploadError) {
      onError({ type: "error", message: uploadError.message || "The upload failed. Please try again." });
      return [];
    } finally {
      setUploading(false);
    }
  }
  return { uploading, upload };
}

const IMAGE_TYPES = ["image/png", "image/jpeg", "image/webp"];

function ThumbnailCard({ url, onChange, sample, onError }) {
  const { uploading, upload } = useUploader({ sample, onError, purpose: "image", maxBytes: 5 * MB, accept: IMAGE_TYPES });
  const [dragging, setDragging] = useState(false);
  async function handle(files) {
    const [first] = await upload([...files].slice(0, 1));
    if (first) onChange(first.url);
  }
  return (
    <Card title="Thumbnail">
      {url ? (
        <div className="community-thumb-preview">
          <img src={url} alt="Project thumbnail" />
          <div className="community-hackathon-buttons">
            <label className="btn btn-outline btn-sm">Replace image<input type="file" className="sr-only" accept={IMAGE_TYPES.join(",")} onChange={(event) => { handle(event.target.files); event.target.value = ""; }} /></label>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => onChange("")}>Remove</button>
          </div>
        </div>
      ) : (
        <label
          className={`community-dropzone${dragging ? " is-dragging" : ""}`}
          onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => { event.preventDefault(); setDragging(false); handle(event.dataTransfer.files); }}
        >
          <Upload size={22} aria-hidden="true" />
          <strong>{uploading ? "Uploading…" : <>Drop an image or <span>browse</span></>}</strong>
          <span>PNG or JPG, 1200 × 675 recommended, up to 5 MB</span>
          <input type="file" className="sr-only" accept={IMAGE_TYPES.join(",")} onChange={(event) => { handle(event.target.files); event.target.value = ""; }} />
        </label>
      )}
    </Card>
  );
}

function ReferenceImagesCard({ images, onChange, sample, onError }) {
  const { uploading, upload } = useUploader({ sample, onError, purpose: "image", maxBytes: 5 * MB, accept: IMAGE_TYPES });
  return (
    <Card title="Reference images">
      {images.length > 0 && (
        <ul className="community-ref-images">
          {images.map((image) => (
            <li key={image.url}>
              <img src={image.url} alt={image.name} />
              <button type="button" aria-label={`Remove ${image.name}`} onClick={() => onChange(images.filter((item) => item.url !== image.url))}><X size={13} aria-hidden="true" /></button>
            </li>
          ))}
        </ul>
      )}
      <label className="btn btn-outline btn-sm">
        <ImagePlus size={15} aria-hidden="true" /> {uploading ? "Uploading…" : "Upload images"}
        <input type="file" multiple className="sr-only" accept={IMAGE_TYPES.join(",")} disabled={uploading} onChange={async (event) => { const added = await upload(event.target.files); event.target.value = ""; if (added.length) onChange([...images, ...added.map(({ url, name }) => ({ url, name }))]); }} />
      </label>
    </Card>
  );
}

function StarterFilesCard({ files, onChange, sample, onError }) {
  const { uploading, upload } = useUploader({ sample, onError, purpose: "attachment", maxBytes: 25 * MB });
  return (
    <Card title="Starter files">
      {files.length > 0 && (
        <ul className="community-file-list">
          {files.map((file) => (
            <li key={file.url}>
              <FileText size={18} aria-hidden="true" />
              <span className="min-w-0"><strong>{file.name}</strong><small>{fileSize(file.size)}</small></span>
              <button type="button" className="community-icon-button" aria-label={`Remove ${file.name}`} onClick={() => onChange(files.filter((item) => item.url !== file.url))}><X size={15} aria-hidden="true" /></button>
            </li>
          ))}
        </ul>
      )}
      <label className="btn btn-outline btn-sm">
        <Paperclip size={15} aria-hidden="true" /> {uploading ? "Uploading…" : "Attach file"}
        <input type="file" multiple className="sr-only" disabled={uploading} onChange={async (event) => { const added = await upload(event.target.files); event.target.value = ""; if (added.length) onChange([...files, ...added.map(({ url, name, size }) => ({ url, name, size }))]); }} />
      </label>
      <p className="community-side-note community-access-note">Up to 25 MB per file. Students download these with the brief.</p>
    </Card>
  );
}

function DetailsCard({ project }) {
  const rows = [
    ["Created", project.createdAt ? `${dateTime.format(new Date(project.createdAt))}${project.createdBy ? ` by ${project.createdBy}` : ""}` : "—"],
    ["Published", project.publishedAt ? dateTime.format(new Date(project.publishedAt)) : "Not yet"],
    ["Last edited", project.updatedAt ? `${dateTime.format(new Date(project.updatedAt))}${project.lastEditedBy ? ` by ${project.lastEditedBy}` : ""}` : "—"],
    ["Students started", project.studentsStarted ?? 0],
    ["Approval rate", typeof project.approvalRate === "number" ? `${project.approvalRate}%` : "—"],
  ];
  return (
    <Card title="Details">
      <dl className="community-points-list community-details-list">
        {rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
      </dl>
    </Card>
  );
}

// Shows the project as students will see it, before it is saved.
function PreviewDialog({ open, project, onClose }) {
  const card = {
    slug: project.id ?? "preview",
    title: project.title || "Untitled project",
    category: project.category || "Category",
    description: project.shortDescription || "Short description",
    level: project.level || "Level",
    duration: project.duration || "Duration",
    access: project.access,
  };
  return (
    <Modal open={open} onClose={onClose} title="Student preview" description="This is how the project card and brief will look in the Project Library." size="max-w-2xl">
      <div className="community-preview">
        {/* inert: the preview card's buttons must not navigate away from unsaved work. */}
        <div className="community-preview-card" inert><ProjectCard project={card} canOpenPremium /></div>
        <div className="community-preview-brief">
          <h3>About this project</h3>
          <p>{project.description || "No full description yet."}</p>
          {project.objectives.some((item) => item.trim()) && (
            <>
              <h3>You will</h3>
              <ul>{project.objectives.filter((item) => item.trim()).map((item) => <li key={item}>{item}</li>)}</ul>
            </>
          )}
          {project.steps.some((step) => step.title.trim()) && (
            <>
              <h3>Steps</h3>
              <ol>{project.steps.filter((step) => step.title.trim()).map((step, index) => <li key={index}><strong>{step.title}</strong>{step.details ? ` — ${step.details}` : ""}</li>)}</ol>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}
