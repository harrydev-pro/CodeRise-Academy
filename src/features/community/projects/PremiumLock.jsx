import { Link } from "react-router-dom";
import { Lock } from "lucide-react";

// Shown to free users on a Premium project (S03 preview, S04). Access is enforced by the API;
// this only explains it and links to the Premium plans page.
export default function PremiumLock({ title, premiumFromPrice, premiumProjectCount, headingLevel = 2 }) {
  const Heading = `h${headingLevel}`;
  const more = typeof premiumProjectCount === "number" && premiumProjectCount > 1 ? `, plus ${premiumProjectCount - 1} more Premium projects and team briefs` : "";
  return (
    <section className="community-card cmp-lock" aria-label="Premium project">
      <span className="community-icon tone-purple"><Lock size={22} aria-hidden="true" /></span>
      <Heading>{title} is a Premium project</Heading>
      <p>Upgrade to see the full brief, resources and evaluation criteria, and to submit it for review{more}.</p>
      <Link to="/premium" className="btn community-btn-premium">
        {premiumFromPrice ? `See Premium plans · from ${premiumFromPrice.replace(/\/mo$/, "")}` : "See Premium plans"}
      </Link>
      <Link to="/community/projects" className="cmp-text-link">Not now — back to all projects</Link>
    </section>
  );
}
