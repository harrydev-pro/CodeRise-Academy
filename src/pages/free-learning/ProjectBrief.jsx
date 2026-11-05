import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, CalendarClock, CheckCircle2, ClipboardList, Flag, Target, Upload } from "lucide-react";

import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { useApiResource } from "../../hooks/useApiResource";
import { formatDate } from "../../utils/formatDate";

function BriefList({ icon: Icon, title, items, ordered = false }) {
  if (!items?.length) return null;
  const List = ordered ? "ol" : "ul";
  return (
    <section className="brief-section">
      <h2><Icon size={20} aria-hidden="true" /> {title}</h2>
      <List>{items.map((item, index) => <li key={index}>{item}</li>)}</List>
    </section>
  );
}

function BriefText({ icon: Icon, title, text }) {
  if (!text) return null;
  return (
    <section className="brief-section">
      <h2><Icon size={20} aria-hidden="true" /> {title}</h2>
      <p className="brief-text">{text}</p>
    </section>
  );
}

export default function ProjectBrief() {
  const { trackId, projectId } = useParams();
  const { data: project, loading, error, reload } = useApiResource(`/learning/projects/${encodeURIComponent(projectId)}`, "project", null);

  if (loading) return <div className="page-container"><Loader label="Loading project brief…" /></div>;
  if (error && !/not found/i.test(error)) return <div className="page-container"><ErrorMessage message={error} onRetry={reload} /></div>;
  if (!project || project.trackId !== trackId) {
    return <div className="page-container"><EmptyState title="Project not found" description="Choose a project from the learning track." actionLabel="Browse projects" actionHref={`/free-learning/${trackId}/projects`} /></div>;
  }

  const references = Array.isArray(project.referenceMaterials) ? project.referenceMaterials : [];
  const rubric = Array.isArray(project.rubric) ? project.rubric : [];

  return (
    <div className="page-container project-brief-page free-learning-shell">
      <Link to={`/free-learning/${trackId}/projects`} className="back-link"><ArrowLeft size={17} aria-hidden="true" /> All projects</Link>

      <section className="project-brief-hero">
        {project.imageUrl && <img src={project.imageUrl} alt="" className="project-brief-image" />}
        <span className="eyebrow">{project.level || "PRACTICAL PROJECT"}</span>
        <h1>{project.title}</h1>
        <p>{project.description}</p>
        <div className="project-brief-meta">
          <span><ClipboardList size={17} aria-hidden="true" /> Maximum score: {project.maxScore}</span>
          {project.estimatedTime && <span>{project.estimatedTime}</span>}
          {project.deadline && <span><CalendarClock size={17} aria-hidden="true" /> Due {formatDate(project.deadline)}</span>}
        </div>
      </section>

      <div className="project-brief-layout">
        <article className="project-brief-content">
          <BriefList icon={Target} title="Learning objectives" items={project.objectives} />
          <BriefList icon={CheckCircle2} title="Requirements" items={project.requirements} />
          <BriefList icon={ClipboardList} title="Instructions" items={project.steps} ordered />
          <BriefText icon={Flag} title="Expected outcome" text={project.expectedOutcome} />
          <BriefText icon={Upload} title="How to submit" text={project.submissionInstructions} />
          {references.length > 0 && (
            <section className="brief-section">
              <h2><BookOpen size={20} aria-hidden="true" /> Reference materials</h2>
              <ul>
                {references.map((reference, index) => (typeof reference === "string" ? <li key={index}>{reference}</li> : (
                  <li key={index}><a href={reference.url} target="_blank" rel="noopener noreferrer" className="text-link">{reference.title}</a></li>
                )))}
              </ul>
            </section>
          )}
          {rubric.length > 0 && (
            <section className="brief-section">
              <h2>Marking guide</h2>
              <div className="rubric-list">
                {rubric.map((item, index) => <div className="rubric-item" key={index}><span>{item.criteria}</span><strong>{item.points} points</strong></div>)}
              </div>
            </section>
          )}
        </article>

        <aside className="project-submit-panel">
          <h2>Ready to submit?</h2>
          <p>Check the requirements and test your work before submitting.</p>
          {project.allowSubmissions ? (
            <Link to={`/free-learning/${trackId}/projects/${projectId}/submit`} className="btn btn-primary full-width">Submit your project <ArrowRight size={17} aria-hidden="true" /></Link>
          ) : <p className="alert alert-info">Submissions are not open for this project.</p>}
          <small>Your instructor reviews every submission and gives feedback.</small>
        </aside>
      </div>
    </div>
  );
}
