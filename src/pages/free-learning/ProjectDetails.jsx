import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  ClipboardList,
  Code2,
  Trophy,
} from "lucide-react";

import { useApiResource } from "../../hooks/useApiResource";
import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";

export default function ProjectDetails() {
  const { trackId } = useParams();

  const trackResource = useApiResource(`/learning/tracks/${encodeURIComponent(trackId)}`, "track", null);
  const projectsResource = useApiResource(`/learning/tracks/${encodeURIComponent(trackId)}/projects`, "projects");
  const track = trackResource.data;
  const projects = projectsResource.data;

  if (trackResource.loading || projectsResource.loading) return <main className="page-container"><Loader label="Loading projects…" /></main>;
  if (trackResource.error || projectsResource.error) return <main className="page-container"><ErrorMessage message={trackResource.error || projectsResource.error} onRetry={() => { trackResource.reload(); projectsResource.reload(); }} /></main>;

  if (!track) {
    return (
      <main className="page-container free-learning-shell">
        <EmptyState
          title="Track not found"
          description="Choose an available learning track to view its projects."
          action={
            <Link to="/free-learning" className="btn btn-primary">
              Browse tracks
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <main className="page-container free-learning-shell">
      <Link
        to={`/free-learning/${trackId}`}
        className="back-link"
      >
        <ArrowLeft size={17} />
        Back to {track.title}
      </Link>

      <section className="project-hero">
        <span className="eyebrow">PRACTICE YOUR SKILLS</span>

        <h1>Practical projects</h1>

        <p>
          Apply what you have learned by completing projects based on
          {` ${track.title}.`}
        </p>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Available projects</h2>
            <p>Read each project brief carefully before starting.</p>
          </div>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            title="No projects available yet"
            description="Practical projects will appear here when they are added to this track."
          />
        ) : (
          <div className="project-grid">
            {projects.map((project) => (
              <article className="project-card" key={project.id}>
                <div className="project-card-icon">
                  <Code2 size={24} />
                </div>

                <span className="project-level">
                  {project.level || "Practice project"}
                </span>

                <h3>{project.title}</h3>

                <p>{project.description}</p>

                <div className="project-card-meta">
                  <span>
                    <ClipboardList size={16} />
                    {project.maxScore ?? 100} points
                  </span>

                  {project.estimatedTime && (
                    <span>{project.estimatedTime}</span>
                  )}
                </div>

                <Link
                  to={`/free-learning/${trackId}/projects/${project.id}`}
                  className="text-link"
                >
                  View project brief <ArrowRight size={17} />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="learning-callout">
        <div>
          <h2>Build, test, and improve.</h2>
          <p>
            Follow the requirements, submit your work, and use feedback to
            improve your skills.
          </p>
        </div>

        <Trophy size={32} />
      </section>
    </main>
  );
}
