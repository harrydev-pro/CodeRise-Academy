import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { CalendarDays, ExternalLink, FileCheck2, FolderKanban, Paperclip } from "lucide-react";

import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { PageHeader, StatusBadge, Tabs } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";
import { formatDate } from "../../utils/formatDate";

const IN_REVIEW = ["Submitted", "Under Review"];
const APPROVED = ["Approved", "Reviewed"];

export default function MySubmissions() {
  const location = useLocation();
  const successMessage = location.state?.message || "";
  const projects = useApiResource("/learning/projects", "projects");
  const submissions = useApiResource("/learning/submissions", "submissions");
  const [tab, setTab] = useState("submitted");

  if (projects.loading || submissions.loading) return <div className="student-page"><Loader label="Loading your projects…" /></div>;
  const failed = projects.error ? projects : submissions.error ? submissions : null;
  if (failed) return <div className="student-page"><ErrorMessage message={failed.error} onRetry={failed.reload} /></div>;

  const latestByProject = new Map();
  for (const item of submissions.data) if (!latestByProject.has(item.projectId)) latestByProject.set(item.projectId, item);
  const latest = [...latestByProject.values()];
  const groups = {
    available: projects.data.filter((project) => !latestByProject.has(project.id)),
    submitted: submissions.data,
    review: latest.filter((item) => IN_REVIEW.includes(item.status)),
    corrections: latest.filter((item) => item.status === "Needs Corrections"),
    approved: latest.filter((item) => APPROVED.includes(item.status)),
  };
  const tabs = [
    { value: "submitted", label: "All submissions", count: groups.submitted.length },
    { value: "review", label: "In review", count: groups.review.length },
    { value: "corrections", label: "Needs corrections", count: groups.corrections.length },
    { value: "approved", label: "Approved", count: groups.approved.length },
    { value: "available", label: "Available projects", count: groups.available.length },
  ];

  return (
    <div className="student-page">
      <PageHeader eyebrow="PRACTICAL WORK" title="My Projects" description="Your submissions, their review status, and projects you can start next." />
      {successMessage && <div className="alert alert-info" role="status">{successMessage}</div>}
      <Tabs tabs={tabs} value={tab} onChange={setTab} label="Project groups" />

      {tab === "available" ? (
        groups.available.length === 0 ? <EmptyState icon={FolderKanban} title="No new projects" description="You have submitted every available project. Great work!" /> : (
          <div className="ui-grid ui-grid-cards">
            {groups.available.map((project) => (
              <article className="ui-card" key={project.id}>
                <span className="ui-pill">{project.trackTitle}</span>
                <h3 className="project-card-title">{project.title}</h3>
                <p className="muted-text">{project.description}</p>
                <Link to={`/free-learning/${project.trackId}/projects/${project.id}`} className="text-link">View brief</Link>
              </article>
            ))}
          </div>
        )
      ) : groups[tab].length === 0 ? (
        <EmptyState icon={FileCheck2} title="Nothing here yet" description="Submitted projects appear here with their status and feedback." actionLabel="Browse projects" actionHref="/free-learning" />
      ) : (
        <div className="student-record-list">
          {groups[tab].map((submission) => (
            <article className="student-record-card" key={submission.id}>
              <div className="student-record-icon"><FileCheck2 size={23} aria-hidden="true" /></div>
              <div className="student-record-content">
                <h2>{submission.projectTitle || "Practical project"}</h2>
                <div className="record-meta">
                  <span><CalendarDays size={15} aria-hidden="true" /> Submitted {formatDate(submission.createdAt)}</span>
                  {submission.score !== null && submission.score !== undefined && <span>Score: {submission.score}/{submission.maxScore}</span>}
                </div>
                <p className="application-feedback">{submission.feedback ? <><strong>Feedback:</strong> {submission.feedback}</> : "Feedback has not been added yet."}</p>
                <div className="ui-actions submission-links">
                  {[["Live", submission.liveUrl], ["GitHub", submission.githubUrl], ["Figma", submission.figmaUrl]].filter(([, url]) => url).map(([label, url]) => (
                    <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="text-link"><ExternalLink size={14} aria-hidden="true" /> {label}</a>
                  ))}
                  {submission.attachment && <a href={submission.attachment.url} target="_blank" rel="noopener noreferrer" className="text-link"><Paperclip size={14} aria-hidden="true" /> {submission.attachment.name}</a>}
                  {submission.status === "Needs Corrections" && submission.trackId && (
                    <Link className="btn btn-primary btn-sm" to={`/free-learning/${submission.trackId}/projects/${submission.projectId}/submit`}>Submit corrections</Link>
                  )}
                </div>
              </div>
              <StatusBadge status={submission.status} fallback="submitted" />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
