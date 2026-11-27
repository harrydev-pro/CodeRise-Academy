import { Link } from "react-router-dom";
import {
  Bot,
  CalendarDays,
  ChartNoAxesColumn,
  Clock,
  CodeXml,
  Crown,
  Gamepad2,
  Layers,
  Lock,
  Megaphone,
  Palette,
  ReceiptText,
  Server,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

// Cover icon and colour for each skill category.
const CATEGORY_STYLE = {
  "Frontend Development": { icon: CodeXml, tone: "blue" },
  "Backend Development": { icon: Server, tone: "orange" },
  "Fullstack Development": { icon: Layers, tone: "purple" },
  "Product Design (UI/UX)": { icon: Smartphone, tone: "purple" },
  "Graphic Design": { icon: Palette, tone: "pink" },
  "Data Analysis": { icon: ChartNoAxesColumn, tone: "teal" },
  "Mobile App Development": { icon: ReceiptText, tone: "sky" },
  "Virtual Assistance": { icon: CalendarDays, tone: "slate" },
  "Game Development": { icon: Gamepad2, tone: "purple" },
  Cybersecurity: { icon: ShieldCheck, tone: "slate" },
  "Digital Marketing": { icon: Megaphone, tone: "orange" },
  "AI & Machine Learning": { icon: Bot, tone: "sky" },
};

const numberFormat = new Intl.NumberFormat("en-GB");

// One project card, shared by Community Home (S01) and the Project Library (S02).
// - canOpenPremium: the viewer has an active Premium plan (the backend still checks access).
// - lockedAction: what a free user sees on a Premium project:
//     "upgrade" -> "Unlock with Premium" (goes to /premium)
//     "preview" -> "Preview · Unlock" (opens the project page, which shows a preview)
//   A Premium project with previewAvailable === false is shown fully locked instead.
export default function ProjectCard({ project, canOpenPremium = false, lockedAction = "preview", showStarted = false, premiumFromPrice }) {
  const category = project.category ?? project.track ?? "";
  const style = CATEGORY_STYLE[category] ?? { icon: CodeXml, tone: "blue" };
  const Icon = style.icon;
  const premium = project.access === "premium";
  const locked = premium && !canOpenPremium;
  const fullyLocked = locked && project.previewAvailable === false;
  const projectPath = `/community/projects/${encodeURIComponent(project.slug)}`;

  let action;
  if (!locked) {
    action = <Link to={projectPath} className="btn btn-primary btn-sm" aria-label={`Start project: ${project.title}`}>Start project</Link>;
  } else if (lockedAction === "upgrade") {
    action = <Link to="/premium" className="btn btn-outline btn-sm" aria-label={`Unlock ${project.title} with Premium`}><Lock size={15} aria-hidden="true" /> Unlock with Premium</Link>;
  } else {
    action = <Link to={projectPath} className="btn btn-outline btn-sm" aria-label={`Preview ${project.title} and unlock with Premium`}><Lock size={15} aria-hidden="true" /> Preview · Unlock</Link>;
  }

  const body = (
    <>
      <div className={`community-project-cover cover-${style.tone}`}>
        <span className={`community-access ${premium ? "is-premium" : "is-free"}`}>
          {premium && <Crown size={12} aria-hidden="true" />}{premium ? "Premium" : "Free"}
        </span>
        {project.isNew && <span className="community-new-flag">New</span>}
        <Icon size={44} strokeWidth={1.6} aria-hidden="true" />
      </div>
      <div className="community-project-body">
        <p className="community-project-track">{category}</p>
        <h3>{project.title}</h3>
        <p className="community-project-text">{project.description}</p>
        <div className="community-project-meta">
          <span className="community-chip">{project.level}</span>
          <span className="community-duration"><Clock size={14} aria-hidden="true" /> {project.duration}</span>
          {showStarted && typeof project.started === "number" && (
            <span className="community-duration">· {numberFormat.format(project.started)} started</span>
          )}
        </div>
        {!fullyLocked && action}
      </div>
    </>
  );

  if (fullyLocked) {
    return (
      <article className="community-card community-project community-project-locked" aria-label={`${project.title}: Premium project`}>
        <div className="community-project-faded" aria-hidden="true" inert>{body}</div>
        <div className="community-project-lock">
          <span className="community-lock-badge"><Lock size={22} aria-hidden="true" /></span>
          <h3>Premium project</h3>
          <p>Upgrade to see the full brief, resources and submit for review.</p>
          <Link to="/premium" className="btn btn-sm community-btn-premium">
            {premiumFromPrice ? `Upgrade from ${premiumFromPrice}` : "Upgrade to Premium"}
          </Link>
        </div>
      </article>
    );
  }

  return <article className="community-card community-project">{body}</article>;
}
