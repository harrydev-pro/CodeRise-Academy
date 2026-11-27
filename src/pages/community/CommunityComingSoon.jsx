import { Link } from "react-router-dom";
import { Hammer } from "lucide-react";

// Placeholder for Community screens that are designed but not built yet, so every tab and
// shortcut on Community Home leads somewhere instead of the 404 page.
export default function CommunityComingSoon({ title, backTo = "/community", backLabel = "Back to Community Home" }) {
  return (
    <section className="community-card community-coming-soon">
      <span className="community-icon tone-blue"><Hammer size={22} aria-hidden="true" /></span>
      <h1>{title}</h1>
      <p className="muted-text">This part of the community is on its way. Check back soon.</p>
      <Link to={backTo} className="btn btn-outline btn-sm">{backLabel}</Link>
    </section>
  );
}
