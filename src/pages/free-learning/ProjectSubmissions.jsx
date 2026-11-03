import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Code2,
  Globe,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { submitProject } from "../../features/assessments/submissionService";
import { useApiResource } from "../../hooks/useApiResource";

import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";

export default function ProjectSubmission() {
  const { trackId, projectId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const trackResource = useApiResource(`/learning/tracks/${encodeURIComponent(trackId)}`, "track", null);
  const projectResource = useApiResource(`/learning/projects/${encodeURIComponent(projectId)}`, "project", null);
  const track = trackResource.data;
  const project = projectResource.data;

  const [form, setForm] = useState({
    description: "",
    liveUrl: "",
    githubUrl: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  if (trackResource.loading || projectResource.loading) return <main className="page-container"><Loader label="Loading submission form…" /></main>;
  if (trackResource.error || projectResource.error) return <main className="page-container"><ErrorMessage message={trackResource.error || projectResource.error} onRetry={() => { trackResource.reload(); projectResource.reload(); }} /></main>;

  if (!track || !project || project.trackId !== trackId) {
    return (
      <main className="page-container">
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

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};

    if (form.description.trim().length < 20) {
      nextErrors.description =
        "Describe your work in at least 20 characters.";
    }

    if (!form.liveUrl.trim() && !form.githubUrl.trim()) {
      nextErrors.project =
        "Provide a live URL or GitHub repository URL for your project.";
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
    setMessage("");
    try {
      await submitProject({
        projectId: project.id,
        description: form.description.trim(),
        liveUrl: form.liveUrl.trim(),
        githubUrl: form.githubUrl.trim(),
      });

      navigate("/my-submissions", {
        state: {
          message: "Your project submission has been saved.",
        },
      });
    } catch (error) {
      setMessage(error.message || "Unable to save your submission. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="page-container submission-page">
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

        <p className="field-hint">Submit a public live URL or GitHub repository so your instructor can review the work.</p>

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
