import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CalendarClock, ClipboardList, Code2 } from "lucide-react";

import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { StatusBadge } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";
import { formatDate } from "../../utils/formatDate";

export default function ProjectDetails() {
  const { trackId } = useParams();
  const trackResource = useApiResource(`/learning/tracks/${encodeURIComponent(trackId)}`, "track", null);
  const projectsResource = useApiResource(`/learning/tracks/${encodeURIComponent(trackId)}/projects`, "projects");
  const submissionsResource = useApiResource("/learning/submissions", "submissions");
  const track = trackResource.data;

  if (trackResource.loading || projectsResource.loading) return <div className="page-container"><Loader label="Loading projects…" /></div>;
  if (projectsResource.error) return <div className="page-container"><ErrorMessage message={projectsResource.error} onRetry={projectsResource.reload} /></div>;
  if (!track) return <div className="page-container"><EmptyState title="Track not found" description="Choose an available learning track." actionLabel="Browse tracks" actionHref="/free-learning" /></div>;

  const latest = new Map();
  for (const submission of submissionsResource.data) if (!latest.has(submission.projectId)) latest.set(submission.projectId, submission);

  return (
    <div className="page-container free-learning-shell">
      <Link to={`/free-learning/${trackId}`} className="back-link"><ArrowLeft size={17} aria-hidden="true" /> Back to {track.title}</Link>
      <section className="project-hero">
        <span className="eyebrow">PRACTISE YOUR SKILLS</span>
        <h1>{track.title} projects</h1>
        <p>Apply what you have learned. Read each brief, build the project, and submit it for feedback.</p>
      </section>

      {projectsResource.data.length === 0 ? (
        <EmptyState title="No projects yet" description="Practical projects will appear here when they are added to this track." />
      ) : (
        <div className="ui-grid ui-grid-cards section-block">
          {projectsResource.data.map((project) => {
            const submission = latest.get(project.id);
            return (
              <article className="project-card" key={project.id}>
                {project.imageUrl ? <img src={project.imageUrl} alt="" className="learning-track-image" loading="lazy" /> : <div className="project-card-icon"><Code2 size={24} aria-hidden="true" /></div>}
                <div className="ui-actions">
                  {project.level && <span className="project-level">{project.level}</span>}
                  {submission && <StatusBadge status={submission.status} fallback="submitted" />}
                </div>
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <div className="project-card-meta">
                  <span><ClipboardList size={16} aria-hidden="true" /> {project.maxScore} points</span>
                  {project.estimatedTime && <span>{project.estimatedTime}</span>}
                  {project.deadline && <span><CalendarClock size={16} aria-hidden="true" /> Due {formatDate(project.deadline)}</span>}
                </div>
                <Link to={`/free-learning/${trackId}/projects/${project.id}`} className="text-link">View project brief <ArrowRight size={17} aria-hidden="true" /></Link>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
