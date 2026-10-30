import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  FileUp,
  Code2,
  Globe,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { getTrackById } from "../../features/free-learning/trackService";
import { getProjectsByTrack, submitProject } from "../../features/assessments/submissionService";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import EmptyState from "../../components/common/EmptyState";

export default function ProjectSubmission() {
  const { trackId, projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const track = getTrackById(trackId);

  const project = getProjectsByTrack(trackId).find(
    (item) => item.id === projectId
  );

  const [form, setForm] = useState({
    description: "",
    liveUrl: "",
    githubUrl: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  if (!track || !project) {
    return (
      <main className="page-container free-learning-shell">
        <EmptyState
          title="Project not found"
          description="The project may have been removed or its address is incorrect."
          action={
            <Link
              to={`/free-learning/${trackId}/projects`}
              className="btn btn-primary"
            >
              Return to projects
            </Link>
          }
        />
      </main>
    );
  }

  function updateField(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  }

  function validateUrl(value) {
    if (!value.trim()) return true;

    try {
      const url = new URL(value);

      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }

  function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};

    if (form.description.trim().length < 20) {
      nextErrors.description =
        "Describe your work in at least 20 characters.";
    }

    if (!form.liveUrl.trim() && !form.githubUrl.trim() && !selectedFile) {
      nextErrors.project =
        "Provide a live URL, a GitHub URL, or select a file for this session.";
    }

    if (!validateUrl(form.liveUrl)) {
      nextErrors.liveUrl = "Enter a valid live project URL.";
    }

    if (!validateUrl(form.githubUrl)) {
      nextErrors.githubUrl = "Enter a valid GitHub repository URL.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (!user) {
      setMessage("Please sign in before submitting your project.");
      return;
    }

    setSaving(true);

    try {
      submitProject({
        userId: user.id,
        userName: user.fullName || user.name || user.email,
        trackId,
        projectId: project.id,
        projectTitle: project.title,
        description: form.description.trim(),
        liveUrl: form.liveUrl.trim(),
        githubUrl: form.githubUrl.trim(),
        selectedFileName: selectedFile?.name || "",
        status: "Submitted",
        submittedAt: new Date().toISOString(),
      });

      navigate("/my-submissions", {
        state: {
          message: "Your project submission has been saved.",
        },
      });
    } catch (error) {
      console.error("Project submission failed:", error);
      setMessage("Unable to save your submission. Please try again.");
      setSaving(false);
    }
  }

  return (
    <main className="page-container submission-page free-learning-shell">
      <Link
        to={`/free-learning/${trackId}/projects/${projectId}`}
        className="back-link"
      >
        <ArrowLeft size={17} />
        Back to project
      </Link>

      <section className="submission-header">
        <span className="eyebrow">PROJECT SUBMISSION</span>

        <h1>Submit your work</h1>

        <p>
          Project: <strong>{project.title}</strong>
        </p>
      </section>

      <form className="submission-form" onSubmit={handleSubmit}>
        <div className="form-section-heading">
          <h2>Project details</h2>
          <p>Tell us what you built and how it meets the requirements.</p>
        </div>

        {errors.project && (
          <div className="form-error" role="alert">
            {errors.project}
          </div>
        )}

        <div className="form-field">
          <label htmlFor="description">Describe your project *</label>

          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={updateField}
            rows={6}
            placeholder="Explain what you built, the technologies used, and what you learned."
            aria-invalid={Boolean(errors.description)}
          />

          {errors.description && (
            <span className="field-error">{errors.description}</span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="liveUrl">
            <Globe size={17} />
            Live project URL
          </label>

          <Input
            id="liveUrl"
            name="liveUrl"
            type="url"
            value={form.liveUrl}
            onChange={updateField}
            placeholder="https://your-project.example"
            error={errors.liveUrl}
          />
        </div>

        <div className="form-field">
          <label htmlFor="githubUrl">
            <Code2 size={17} />
            GitHub repository URL
          </label>

          <Input
            id="githubUrl"
            name="githubUrl"
            type="url"
            value={form.githubUrl}
            onChange={updateField}
            placeholder="https://github.com/username/project"
            error={errors.githubUrl}
          />
        </div>

        <div className="form-field">
          <label htmlFor="projectFile">
            <FileUp size={17} />
            Select a project file (optional)
          </label>

          <input
            id="projectFile"
            type="file"
            accept=".zip,.html,.css,.js,.jsx,.pdf,.png,.jpg,.jpeg"
            onChange={(event) => {
              setSelectedFile(event.target.files?.[0] || null);
            }}
          />

          {selectedFile && (
            <div className="selected-file">
              <CheckCircle2 size={17} />
              <span>{selectedFile.name}</span>
            </div>
          )}

          <small className="field-hint">
            Demo only: the selected file is not uploaded or permanently stored.
            Use a live URL or GitHub repository for a shareable submission.
          </small>
        </div>

        {message && (
          <div className="inline-message" role="status">
            {message}
          </div>
        )}

        <div className="submission-form-footer">
          <Link
            to={`/free-learning/${trackId}/projects/${projectId}`}
            className="btn btn-outline"
          >
            Cancel
          </Link>

          <Button type="submit" loading={saving}>
            Submit project
          </Button>
        </div>
      </form>
    </main>
  );
}
