import { useCallback, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Award, ClipboardList, Link2 } from "lucide-react";

import Loader from "../../../components/common/Loader";
import Modal from "../../../components/common/Modal";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import Toast from "../../../components/feedback/Toast";
import { FilterChip } from "../../../features/community/listControls";
import { useCommunityList, useUrlFilters } from "../../../features/community/listHooks";
import { formatBytes, formatFullDate, formatShortDate } from "../../../features/community/projects/projectHelpers";
import {
  getMyCommunityProjects,
  PROJECT_STATUSES,
  publishToShowcase,
  startProject,
  statusInfo,
} from "../../../features/community/projects/projectsService";

// The date shown under each title depends on where the project is.
function statusDate(project) {
  switch (project.status) {
    case "completed": return project.completedAt && `Completed ${formatFullDate(project.completedAt)}`;
    case "approved": return project.reviewedAt && `Approved ${formatFullDate(project.reviewedAt)}`;
    case "needs_corrections": return project.reviewedAt && `Reviewed ${formatFullDate(project.reviewedAt)}`;
    case "under_review": return project.submittedAt && `Submitted ${formatFullDate(project.submittedAt)}`;
    case "submitted": return project.submittedAt && `Submitted ${formatFullDate(project.submittedAt)} · waiting for a reviewer`;
    case "in_progress": return [project.startedAt && `Started ${formatFullDate(project.startedAt)}`, project.dueAt && `due ${formatShortDate(project.dueAt)}`].filter(Boolean).join(" · ");
    default: return project.savedAt && `Saved ${formatFullDate(project.savedAt)}`;
  }
}

export default function MyCommunityProjects() {
  const location = useLocation();
  const navigate = useNavigate();
  const { params, update } = useUrlFilters();
  const status = PROJECT_STATUSES.some((item) => item.value === params.get("status")) ? params.get("status") : "";
  const { data, error, loading, refreshing, reload } = useCommunityList(getMyCommunityProjects, { status });
  const sample = Boolean(data?.isSample);

  const [toast, setToast] = useState(() => (location.state?.submitted
    ? { type: "success", message: `Project submitted. ${location.state.submitted} is now Under Review.${location.state.sample ? " (Sample data: nothing was sent.)" : ""}` }
    : null));
  const closeToast = useCallback(() => setToast(null), [setToast]);
  const [publishing, setPublishing] = useState(null);
  const [busy, setBusy] = useState("");
  const [openSubmission, setOpenSubmission] = useState("");
  const closePublish = useCallback(() => setPublishing(null), [setPublishing]);

  // Clear the "just submitted" message from history so a reload doesn't show it again.
  useEffect(() => {
    if (location.state?.submitted) navigate(`${location.pathname}${location.search}`, { replace: true, state: null });
  }, [location.state, location.pathname, location.search, navigate]);

  async function confirmPublish() {
    const project = publishing;
    setBusy(`publish-${project.slug}`);
    try {
      await publishToShowcase(project.slug, { sample });
      setToast({ type: "success", message: `${project.title} is now in the Showcase.` });
      setPublishing(null);
      reload();
    } catch (publishError) {
      setToast({ type: "error", message: publishError.message || "Could not publish to the Showcase. Please try again." });
    } finally {
      setBusy("");
    }
  }

  async function start(project) {
    setBusy(`start-${project.slug}`);
    try {
      await startProject(project.slug, { sample });
      navigate(`/community/projects/${encodeURIComponent(project.slug)}/submit`);
    } catch (startError) {
      setToast({ type: "error", message: startError.message || "Could not start this project. Please try again." });
      setBusy("");
    }
  }

  const counts = data?.counts ?? {};

  return (
    <div className="cmp-page">
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">COMMUNITY PROJECTS</span>
          <h1>My Community Projects</h1>
          <p>Projects you started from the library, their review status and reviewer feedback.</p>
        </div>
        <Link to="/community/projects" className="btn btn-primary">Browse projects</Link>
      </header>

      {sample && (
        <p className="community-sample-notice" role="status">
          Showing sample data: the Community API is not available yet. This notice only appears on the local dev server.
        </p>
      )}

      <div className="community-chip-group cmp-status-chips" role="group" aria-label="Filter by status">
        <FilterChip active={!status} onClick={() => update({ status: "" })} count={counts.all}>All</FilterChip>
        {PROJECT_STATUSES.map((item) => (
          <FilterChip key={item.value} active={status === item.value} onClick={() => update({ status: item.value })} count={data ? counts[item.value] ?? 0 : undefined}>
            {item.label}
          </FilterChip>
        ))}
      </div>

      {loading && <Loader label="Loading your projects…" />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && !error && (
        data.projects.length === 0 ? (
          <div className="community-card community-empty">
            <span className="community-icon tone-amber"><ClipboardList size={22} aria-hidden="true" /></span>
            {status ? (
              <>
                <h2>No projects are {statusInfo(status).label.toLowerCase()}</h2>
                <p className="muted-text">Projects with this status will appear here.</p>
                <button type="button" className="btn btn-outline btn-sm" onClick={() => update({ status: "" })}>Show all projects</button>
              </>
            ) : (
              <>
                <h2>No submissions yet</h2>
                <p className="muted-text">When you submit a Community project, its review status and feedback will appear here.</p>
                <Link to="/community/projects" className="btn btn-primary btn-sm">Browse projects</Link>
              </>
            )}
          </div>
        ) : (
          <ul className={`cmp-my-list${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing} aria-label="Your community projects">
            {data.projects.map((project) => {
              const info = statusInfo(project.status);
              const projectPath = `/community/projects/${encodeURIComponent(project.slug)}`;
              const submitPath = `${projectPath}/submit`;
              const showSubmission = openSubmission === project.slug;
              const progress = project.progress;
              const percent = progress?.total ? Math.round((progress.done / progress.total) * 100) : 0;
              const linksList = project.links.length > 0 && (
                <ul className="cmp-my-links">
                  {project.links.map((link) => (
                    <li key={link.url}>
                      <a href={link.url} target="_blank" rel="noreferrer">
                        {project.status === "completed" && <Link2 size={14} aria-hidden="true" />} {link.label}
                      </a>
                    </li>
                  ))}
                  {project.status === "completed" && (
                    <li>
                      {project.certificateUrl
                        ? <a href={project.certificateUrl} target="_blank" rel="noreferrer"><Award size={14} aria-hidden="true" /> Certificate</a>
                        : <Link to="/community/activities?tab=certificates"><Award size={14} aria-hidden="true" /> Certificate</Link>}
                    </li>
                  )}
                </ul>
              );

              return (
                <li key={project.slug} className={`community-card cmp-my-card${project.status === "needs_corrections" ? " is-corrections" : ""}`}>
                  <div className="cmp-my-top">
                    <div className="min-w-0">
                      <h2><Link to={projectPath}>{project.title}</Link></h2>
                      <p className="cmp-my-meta">
                        {[project.category, project.access === "premium" ? "Premium" : project.access === "free" ? "Free" : "", statusDate(project)].filter(Boolean).join(" · ")}
                      </p>
                    </div>
                    <div className="cmp-my-status">
                      {typeof project.score === "number" && (
                        <strong className="cmp-score" aria-label={`Score ${project.score} out of ${project.maxScore}`}>{project.score} / {project.maxScore}</strong>
                      )}
                      <span className={`community-tag tag-${info.tone}`}>{info.label}</span>
                    </div>
                  </div>

                  {project.feedback?.text && (
                    <div className={`cmp-feedback${project.status === "needs_corrections" ? " is-corrections" : ""}`}>
                      <p><strong>Feedback{project.feedback.reviewer ? ` · ${project.feedback.reviewer}` : ""}:</strong> {project.feedback.text}</p>
                    </div>
                  )}

                  {project.status === "in_progress" && progress?.total ? (
                    <div className="cmp-my-footer">
                      <div className="cmp-my-progress">
                        <div className="community-progress community-progress-gradient community-progress-wide" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label={`${project.title} progress`}>
                          <span style={{ width: `${percent}%` }} />
                        </div>
                        <span>{progress.done} of {progress.total} steps</span>
                      </div>
                      <Link to={submitPath} className="btn btn-outline btn-sm" aria-label={`Continue ${project.title}`}>Continue</Link>
                    </div>
                  ) : null}

                  {project.status === "in_progress" && !progress?.total && (
                    <div className="cmp-my-footer">
                      <span />
                      <Link to={submitPath} className="btn btn-outline btn-sm" aria-label={`Continue ${project.title}`}>Continue</Link>
                    </div>
                  )}

                  {project.status === "not_started" && (
                    <div className="cmp-my-footer cmp-my-footer-end">
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => start(project)} disabled={busy === `start-${project.slug}`} aria-label={`Start project: ${project.title}`}>
                        {busy === `start-${project.slug}` ? "Starting…" : "Start project"}
                      </button>
                    </div>
                  )}

                  {project.status === "needs_corrections" && (
                    <div className="cmp-my-footer">
                      {linksList || <span />}
                      <div className="cmp-my-actions">
                        <span className="cmp-muted-note">
                          {project.resubmissionsLeft ?? 0} {project.resubmissionsLeft === 1 ? "resubmission" : "resubmissions"} left{project.dueAt ? ` · due ${formatShortDate(project.dueAt)}` : ""}
                        </span>
                        {project.resubmissionsLeft > 0 && <Link to={submitPath} className="btn btn-primary btn-sm" aria-label={`Resubmit ${project.title}`}>Resubmit</Link>}
                      </div>
                    </div>
                  )}

                  {project.status === "approved" && (
                    <>
                      <div className="cmp-my-footer">
                        <button type="button" className="community-link-button cmp-muted-link" aria-expanded={showSubmission} aria-controls={`cmp-sub-${project.slug}`} onClick={() => setOpenSubmission(showSubmission ? "" : project.slug)}>
                          {showSubmission ? "Hide submission" : "View submission"}
                        </button>
                        {project.canPublishToShowcase && (
                          <button type="button" className="btn btn-outline btn-sm" onClick={() => setPublishing(project)}>Publish to Showcase</button>
                        )}
                      </div>
                      {showSubmission && (
                        <div id={`cmp-sub-${project.slug}`} className="cmp-submission-detail">
                          {linksList}
                          {project.files.length > 0 && (
                            <p><strong>Files:</strong> {project.files.map((file) => `${file.name}${file.size ? ` (${formatBytes(file.size)})` : ""}`).join(", ")}</p>
                          )}
                          {project.notes && <p><strong>Notes:</strong> {project.notes}</p>}
                          {!linksList && project.files.length === 0 && !project.notes && <p>No links or files were attached.</p>}
                        </div>
                      )}
                    </>
                  )}

                  {(project.status === "completed" || project.status === "under_review") && Boolean(linksList || project.pointsEarned) && (
                    <div className="cmp-my-footer">
                      {linksList || <span />}
                      {project.pointsEarned ? <span className="cmp-muted-note">+{project.pointsEarned} points earned</span> : null}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )
      )}

      <Modal
        open={Boolean(publishing)}
        onClose={busy ? undefined : closePublish}
        title={publishing ? `Publish “${publishing.title}” to the Showcase?` : "Publish to the Showcase?"}
        description="Everyone in the CodeRise community will be able to see, like and comment on your project and its links."
      >
        <div className="cmp-modal-actions">
          <button type="button" className="btn btn-outline" onClick={closePublish} disabled={Boolean(busy)}>Cancel</button>
          <button type="button" className="btn btn-primary" onClick={confirmPublish} disabled={Boolean(busy)}>
            {busy ? "Publishing…" : "Publish to Showcase"}
          </button>
        </div>
      </Modal>

      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </div>
  );
}
