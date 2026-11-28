import { useCallback, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  Clock,
  Crown,
  Download,
  FileText,
  ImageIcon,
  Link2,
  Lock,
  Star,
  User,
} from "lucide-react";

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import Toast from "../../../components/feedback/Toast";
import { useCommunityList } from "../../../features/community/listHooks";
import PremiumLock from "../../../features/community/projects/PremiumLock";
import { categoryStyle, formatFullDate, numberFormat } from "../../../features/community/projects/projectHelpers";
import { getProjectDetail, startProject } from "../../../features/community/projects/projectsService";

const PROGRESS_STEPS = [
  { value: "not_started", label: "Not started" },
  { value: "in_progress", label: "In progress" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "approved", label: "Approved" },
];
const RESOURCE_STYLE = {
  pdf: { icon: FileText, tone: "red" },
  zip: { icon: ImageIcon, tone: "blue" },
  link: { icon: Link2, tone: "purple" },
};

// Where the viewer is on the progress list. Completed counts as Approved; corrections replace it.
function progressSteps(status) {
  const steps = status === "needs_corrections"
    ? [...PROGRESS_STEPS.slice(0, 4), { value: "needs_corrections", label: "Needs corrections" }]
    : PROGRESS_STEPS;
  const current = status === "completed" ? "approved" : status;
  const index = Math.max(0, steps.findIndex((step) => step.value === current));
  return steps.map((step, position) => ({ ...step, state: position < index ? "done" : position === index ? "current" : "todo" }));
}

export default function ProjectDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data, error, loading, reload } = useCommunityList(getProjectDetail, { slug });
  const [starting, setStarting] = useState(false);
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), [setToast]);

  if (loading) return <Loader label="Loading project…" />;
  if (error) {
    return (
      <div className="cmp-page">
        <Link to="/community/projects" className="cmp-back"><ChevronLeft size={16} aria-hidden="true" /> All projects</Link>
        <ErrorMessage message={error} onRetry={reload} />
      </div>
    );
  }

  const { project, viewerStatus = "not_started", premiumFromPrice, premiumProjectCount } = data;
  const sample = Boolean(data.isSample);
  const locked = Boolean(project.locked);
  const premium = project.access === "premium";
  const style = categoryStyle(project.category);
  const Icon = style.icon;
  const submitPath = `/community/projects/${encodeURIComponent(project.slug)}/submit`;
  const brief = project.resources?.find((item) => item.kind === "pdf");
  const briefUrl = project.briefUrl ?? brief?.url;

  async function start() {
    setStarting(true);
    try {
      await startProject(project.slug, { sample });
      navigate(submitPath);
    } catch (startError) {
      setToast({ type: "error", message: startError.message || "Could not start this project. Please try again." });
      setStarting(false);
    }
  }

  function unavailable() {
    setToast({ type: "error", message: "Downloads are not available with sample data. They work once the Community API is live." });
  }

  let primary;
  if (locked) {
    primary = <Link to="/premium" className="btn community-btn-premium"><Lock size={16} aria-hidden="true" /> Unlock with Premium</Link>;
  } else if (viewerStatus === "not_started") {
    primary = (
      <button type="button" className="btn btn-primary" onClick={start} disabled={starting}>
        {starting ? "Starting…" : <>Start project <ArrowRight size={17} aria-hidden="true" /></>}
      </button>
    );
  } else if (viewerStatus === "in_progress") {
    primary = <Link to={submitPath} className="btn btn-primary">Continue project <ArrowRight size={17} aria-hidden="true" /></Link>;
  } else if (viewerStatus === "needs_corrections") {
    primary = <Link to={submitPath} className="btn btn-primary">Resubmit project <ArrowRight size={17} aria-hidden="true" /></Link>;
  } else {
    primary = <Link to="/community/my-projects" className="btn btn-primary">View my submission <ArrowRight size={17} aria-hidden="true" /></Link>;
  }

  // Only offer the brief when the project has one (sample mode keeps the button to show the layout).
  let briefAction = null;
  if (!locked && briefUrl) {
    briefAction = <a href={briefUrl} className="btn btn-outline" target="_blank" rel="noreferrer">Download brief (PDF)</a>;
  } else if (!locked && sample) {
    briefAction = <button type="button" className="btn btn-outline" onClick={unavailable}>Download brief (PDF)</button>;
  }

  // The header shows the short card summary; the full brief gets its own section below.
  const paragraphs = paragraphsOf(project.description);
  const summary = project.summary?.trim() || paragraphs[0] || "";
  const about = paragraphs.length > 1 || (paragraphs[0] && paragraphs[0] !== summary)
    ? <About paragraphs={paragraphs} />
    : null;

  return (
    <div className="cmp-page">
      <Link to="/community/projects" className="cmp-back"><ChevronLeft size={16} aria-hidden="true" /> All projects</Link>

      {sample && (
        <p className="community-sample-notice" role="status">
          Showing sample data: the Community API is not available yet. This notice only appears on the local dev server.
        </p>
      )}

      <header className="community-card cmp-hero">
        <div className={`cmp-hero-cover cover-${style.tone}`} aria-hidden="true">
          <Icon size={48} strokeWidth={1.6} />
        </div>
        <div className="cmp-hero-body">
          <div className="community-tags">
            {premium
              ? <span className="community-tag tag-purple"><Crown size={12} aria-hidden="true" /> Premium</span>
              : <span className="community-tag tag-green">Free</span>}
            <span className="community-tag tag-neutral">{project.level}</span>
            <span className="community-tag tag-blue">{project.category}</span>
          </div>
          <h1>{project.title}</h1>
          {summary && <p className={`cmp-hero-text${project.summary?.trim() ? "" : " is-excerpt"}`}>{summary}</p>}
          <ul className="cmp-hero-meta">
            <li><Clock size={15} aria-hidden="true" /> {project.duration}</li>
            {typeof project.started === "number" && <li><User size={15} aria-hidden="true" /> {numberFormat.format(project.started)} students started</li>}
            {project.points ? <li><Star size={15} aria-hidden="true" /> +{project.points} community points</li> : null}
          </ul>
        </div>
        <div className="cmp-hero-actions">
          {primary}
          {briefAction}
        </div>
      </header>

      {locked ? (
        <div className="cmp-layout">
          <div className="cmp-main">
            {about}
            {project.previewAvailable !== false && project.objectives?.length > 0 && <Objectives items={project.objectives} />}
            {project.previewAvailable !== false && project.steps?.length > 0 && (
              <section className="community-card cmp-section" aria-labelledby="cmp-steps">
                <h2 id="cmp-steps">Step-by-step instructions</h2>
                <Steps steps={project.steps} />
                {project.stepsTotal > project.steps.length && (
                  <p className="cmp-muted-note"><Lock size={14} aria-hidden="true" /> {project.stepsTotal - project.steps.length} more steps, the resources and the evaluation criteria unlock with Premium.</p>
                )}
              </section>
            )}
            <PremiumLock title={project.title} premiumFromPrice={premiumFromPrice} premiumProjectCount={premiumProjectCount} />
          </div>
          <aside className="cmp-side" aria-label="Project summary">
            <Facts project={project} />
            {project.skills?.length > 0 && <Skills skills={project.skills} />}
          </aside>
        </div>
      ) : (
        <div className="cmp-layout">
          <div className="cmp-main">
            {about}
            {project.objectives?.length > 0 && <Objectives items={project.objectives} />}

            {project.requirements?.length > 0 && (
              <section className="community-card cmp-section" aria-labelledby="cmp-requirements">
                <h2 id="cmp-requirements">Project requirements</h2>
                <ul className="cmp-bullets">
                  {project.requirements.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </section>
            )}

            {project.steps?.length > 0 && (
              <section className="community-card cmp-section" aria-labelledby="cmp-steps">
                <h2 id="cmp-steps">Step-by-step instructions</h2>
                <Steps steps={project.steps} />
              </section>
            )}

            {project.referenceImages?.length > 0 && (
              <section className="community-card cmp-section" aria-labelledby="cmp-images">
                <h2 id="cmp-images">Reference images</h2>
                <ul className="cmp-ref-images">
                  {project.referenceImages.map((image) => (
                    <li key={image.caption}>
                      {image.url ? (
                        <figure>
                          <img src={image.url} alt={image.caption} loading="lazy" />
                          <figcaption>{image.caption}</figcaption>
                        </figure>
                      ) : (
                        <div className="cmp-ref-placeholder">
                          <ImageIcon size={24} aria-hidden="true" />
                          <span>{image.caption}</span>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {project.criteria?.length > 0 && (
              <section className="community-card cmp-section" aria-labelledby="cmp-criteria">
                <h2 id="cmp-criteria">Evaluation criteria</h2>
                <div className="community-table-wrap" tabIndex={0} role="region" aria-label="Evaluation criteria (scrolls sideways)">
                  <table className="community-table cmp-criteria-table">
                    <thead>
                      <tr>
                        <th scope="col">Criterion</th>
                        <th scope="col">What reviewers check</th>
                        <th scope="col" className="is-number">Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {project.criteria.map((item) => (
                        <tr key={item.name}>
                          <th scope="row">{item.name}</th>
                          <td>{item.check}</td>
                          <td className="is-number">{item.points}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {project.passMark ? (
                  <p className="cmp-muted-note">
                    Pass mark: {project.passMark} / {project.maxScore ?? 100}.
                    {project.resubmissionsAllowed ? ` You can resubmit ${project.resubmissionsAllowed === 1 ? "once" : `${project.resubmissionsAllowed} times`} if corrections are requested.` : ""}
                  </p>
                ) : null}
              </section>
            )}
          </div>

          <aside className="cmp-side" aria-label="Project summary">
            <section className="community-card cmp-section" aria-labelledby="cmp-progress">
              <h2 id="cmp-progress">Your progress</h2>
              <ol className="cmp-progress-steps">
                {progressSteps(viewerStatus).map((step) => (
                  <li key={step.value} className={`is-${step.state}`} aria-current={step.state === "current" ? "step" : undefined}>
                    <span className="cmp-progress-dot" aria-hidden="true">{step.state === "done" && <Check size={12} />}</span>
                    {step.label}
                    {step.state === "done" && <span className="sr-only"> (done)</span>}
                  </li>
                ))}
              </ol>
            </section>

            <Facts project={project} />
            {project.skills?.length > 0 && <Skills skills={project.skills} />}

            {project.resources?.length > 0 && (
              <section className="community-card cmp-section" aria-labelledby="cmp-resources">
                <h2 id="cmp-resources">Downloadable resources</h2>
                <ul className="cmp-resources">
                  {project.resources.map((resource) => {
                    const look = RESOURCE_STYLE[resource.kind] ?? RESOURCE_STYLE.pdf;
                    const ResourceIcon = look.icon;
                    const external = resource.kind === "link";
                    const ActionIcon = external ? ArrowUpRight : Download;
                    const label = `${external ? "Open" : "Download"} ${resource.name}`;
                    const content = (
                      <>
                        <span className={`cmp-resource-icon tone-${look.tone}`} aria-hidden="true"><ResourceIcon size={18} /></span>
                        <span className="cmp-resource-name"><strong>{resource.name}</strong><small>{resource.size}</small></span>
                        <ActionIcon size={18} aria-hidden="true" className="cmp-resource-action" />
                      </>
                    );
                    return (
                      <li key={resource.name}>
                        {resource.url
                          ? <a href={resource.url} target="_blank" rel="noreferrer" aria-label={label}>{content}</a>
                          : <button type="button" onClick={unavailable} aria-label={label}>{content}</button>}
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {project.submissionRequirements?.length > 0 && (
              <section className="community-card cmp-section" aria-labelledby="cmp-submission-reqs">
                <h2 id="cmp-submission-reqs">Submission requirements</h2>
                <ul className="cmp-checks cmp-checks-small">
                  {project.submissionRequirements.map((item) => <li key={item}><Check size={16} aria-hidden="true" /> {item}</li>)}
                </ul>
              </section>
            )}
          </aside>
        </div>
      )}

      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </div>
  );
}

// Splits the brief on blank lines (or single line breaks) into paragraphs.
function paragraphsOf(text) {
  if (!text) return [];
  const blocks = String(text).split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
  return blocks.length > 1 ? blocks : String(text).split(/\n/).map((part) => part.trim()).filter(Boolean);
}

function About({ paragraphs }) {
  return (
    <section className="community-card cmp-section cmp-about" aria-labelledby="cmp-about">
      <h2 id="cmp-about">About this project</h2>
      {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    </section>
  );
}

function Objectives({ items }) {
  return (
    <section className="community-card cmp-section" aria-labelledby="cmp-objectives">
      <h2 id="cmp-objectives">Project objectives</h2>
      <ul className="cmp-checks">
        {items.map((item) => <li key={item}><Check size={18} aria-hidden="true" /> {item}</li>)}
      </ul>
    </section>
  );
}

function Steps({ steps }) {
  return (
    <ol className="cmp-steps">
      {steps.map((step, index) => (
        <li key={step.title}>
          <span className="cmp-step-number" aria-hidden="true">{index + 1}</span>
          <div>
            <h3>{step.title}</h3>
            <p>{step.details}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Facts({ project }) {
  return (
    <section className="community-card cmp-section" aria-labelledby="cmp-facts">
      <h2 id="cmp-facts">Project facts</h2>
      <dl className="cmp-facts">
        <div><dt>Difficulty</dt><dd>{project.level}</dd></div>
        <div><dt>Estimated duration</dt><dd>{project.duration}</dd></div>
        <div><dt>Access</dt><dd>{project.access === "premium" ? "Premium" : "Free"}</dd></div>
        {project.maxScore ? <div><dt>Maximum score</dt><dd>{project.maxScore}</dd></div> : null}
        {project.addedAt && <div><dt>Added</dt><dd>{formatFullDate(project.addedAt)}</dd></div>}
      </dl>
    </section>
  );
}

function Skills({ skills }) {
  return (
    <section className="community-card cmp-section" aria-labelledby="cmp-skills">
      <h2 id="cmp-skills">Required skills</h2>
      <ul className="community-skill-list">
        {skills.map((skill) => <li key={skill} className="community-skill">{skill}</li>)}
      </ul>
    </section>
  );
}
