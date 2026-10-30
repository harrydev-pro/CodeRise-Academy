import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Target,
} from "lucide-react";

import { getTrackById } from "../../features/free-learning/trackService";
import { getProjectsByTrack } from "../../features/assessments/submissionService";

import EmptyState from "../../components/common/EmptyState";

export default function ProjectBrief() {
  const { trackId, projectId } = useParams();

  const track = getTrackById(trackId);

  const project = getProjectsByTrack(trackId).find(
    (item) => item.id === projectId
  );

  if (!track || !project) {
    return (
      <main className="page-container free-learning-shell">
        <EmptyState
          title="Project not found"
          description="Choose a project from the learning track."
          action={
            <Link
              to={`/free-learning/${trackId}/projects`}
              className="btn btn-primary"
            >
              Browse projects
            </Link>
          }
        />
      </main>
    );
  }

  const objectives = project.objectives || [];
  const requirements = project.requirements || [];
  const steps = project.steps || [];
  const rubric = project.rubric || [];

  return (
    <main className="page-container project-brief-page free-learning-shell">
      <Link
        to={`/free-learning/${trackId}/projects`}
        className="back-link"
      >
        <ArrowLeft size={17} />
        All projects
      </Link>

      <section className="project-brief-hero">
        <span className="eyebrow">{track.title}</span>

        <h1>{project.title}</h1>

        <p>
          {project.description ||
            "Complete the project requirements and demonstrate your understanding."}
        </p>

        <div className="project-brief-meta">
          <span>
            <ClipboardList size={17} />
            Maximum score: {project.maxScore ?? 100}
          </span>

          <span>
            <Target size={17} />
            {project.level || "Practice project"}
          </span>
        </div>
      </section>

      <div className="project-brief-layout">
        <article className="project-brief-content">
          <section className="brief-section">
            <h2>
              <Target size={21} />
              Learning objectives
            </h2>

            {objectives.length ? (
              <ul>
                {objectives.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>
                Apply the concepts taught in this learning track to complete
                a practical task.
              </p>
            )}
          </section>

          <section className="brief-section">
            <h2>
              <CheckCircle2 size={21} />
              Project requirements
            </h2>

            {requirements.length ? (
              <ul>
                {requirements.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>
                Follow the project description, build a working solution, and
                explain your implementation.
              </p>
            )}
          </section>

          <section className="brief-section">
            <h2>Step-by-step instructions</h2>

            {steps.length ? (
              <ol>
                {steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            ) : (
              <ol>
                <li>Review the relevant lessons.</li>
                <li>Plan your solution before you begin.</li>
                <li>Build and test your project.</li>
                <li>Check that your solution meets the requirements.</li>
                <li>Prepare a short explanation of your work.</li>
              </ol>
            )}
          </section>

          <section className="brief-section">
            <h2>Marking guide</h2>

            {rubric.length ? (
              <div className="rubric-list">
                {rubric.map((item, index) => (
                  <div className="rubric-item" key={index}>
                    <span>{item.criteria || item.title || "Assessment"}</span>
                    <strong>{item.points ?? item.score ?? 0} points</strong>
                  </div>
                ))}
              </div>
            ) : (
              <p>
                Your project will be assessed for completeness, correctness,
                presentation, and how well it meets the stated requirements.
              </p>
            )}
          </section>
        </article>

        <aside className="project-submit-panel">
          <h2>Ready to submit?</h2>

          <p>
            Make sure you have checked the requirements and tested your work.
          </p>

          <div className="project-score-box">
            <span>Maximum score</span>
            <strong>{project.maxScore ?? 100} points</strong>
          </div>

          <Link
            to={`/free-learning/${trackId}/projects/${projectId}/submit`}
            className="btn btn-primary full-width"
          >
            Submit your project
            <ArrowRight size={17} />
          </Link>

          <small>
            Your submission will be stored in this browser demonstration.
          </small>
        </aside>
      </div>
    </main>
  );
}
