import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, FolderKanban, Gift, Sparkles, Wrench, BookMarked } from "lucide-react";

import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { useApiResource } from "../../hooks/useApiResource";
import { formatCurrency } from "../../utils/formatCurrency";
import { getProgramPrice, hasProgramDiscount } from "../../utils/programPrice";
import { listOf } from "../../utils/programContent";
import ProgramIcon from "../../components/common/ProgramIcon";

function Section({ icon: Icon, title, items }) {
  if (!items.length) return null;
  return (
    <section className="ui-card program-detail-section">
      <h2><Icon size={20} aria-hidden="true" /> {title}</h2>
      <ul className="program-detail-list">
        {items.map((item, index) => (
          <li key={`${item.title}-${index}`}>
            <CheckCircle2 size={17} aria-hidden="true" />
            <div>
              <strong>{item.title}</strong>
              {item.description && <p>{item.description}</p>}
              {Array.isArray(item.items) && item.items.length > 0 && (
                <ul className="program-detail-sublist">{item.items.map((sub) => <li key={sub}>{sub}</li>)}</ul>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function ProgramDetails() {
  const { programId } = useParams();
  const { data: program, loading, error, reload } = useApiResource(`/catalog/programs/${encodeURIComponent(programId)}`, "program", null);

  if (loading) return <div className="page-container"><Loader label="Loading program…" /></div>;
  if (error && !/not found/i.test(error)) return <div className="page-container"><ErrorMessage message={error} onRetry={reload} /></div>;
  if (!program) {
    return (
      <div className="page-container">
        <EmptyState title="Program not found" description="This program may no longer be available." actionLabel="View all programs" actionHref="/programs" />
      </div>
    );
  }

  const curriculum = listOf(program.curriculum);
  const applyLink = `/apply/${program.id}`;

  return (
    <div className="page-container program-details-page">
      <Link to="/programs" className="back-link"><ArrowLeft size={17} aria-hidden="true" /> All programs</Link>

      <section className="program-details-hero">
        <div className="min-w-0">
          <span className="eyebrow">{program.category || "TRAINING PROGRAM"}</span>
          <h1>{program.title}</h1>
          <p className="program-details-lead">{program.description}</p>
          {program.overview && <p className="program-details-overview">{program.overview}</p>}
        </div>

        <aside className="program-details-card">
          {program.imageUrl ? <img src={program.imageUrl} alt="" className="program-details-image" /> : <div className="program-details-icon"><ProgramIcon program={program} size={40} /></div>}
          <span className="price-caption">Program fee</span>
          <div className="program-price">
            <strong>{formatCurrency(getProgramPrice(program))}</strong>
            {hasProgramDiscount(program) && <del>{formatCurrency(program.originalPrice)}</del>}
          </div>
          <p className="program-details-duration"><Clock size={17} aria-hidden="true" /> Duration: {program.duration || "To be announced"}</p>
          <Button as={Link} to={applyLink} fullWidth>Apply for this program <ArrowRight size={18} aria-hidden="true" /></Button>
          <small>Applying does not take a payment. The academy team reviews every application.</small>
        </aside>
      </section>

      <div className="ui-grid program-details-sections">
        <Section icon={BookMarked} title="What you will learn" items={curriculum} />
        <Section icon={Sparkles} title="Learning objectives" items={listOf(program.objectives)} />
        <Section icon={Wrench} title="Skills you will gain" items={listOf(program.skills)} />
        <Section icon={FolderKanban} title="Practical projects" items={listOf(program.projects)} />
        <Section icon={Gift} title="Program benefits" items={listOf([...(program.benefits || []), ...(program.features || [])])} />
        <Section icon={BookMarked} title="Learning resources" items={listOf(program.resources)} />
      </div>

      <section className="program-details-cta">
        <div>
          <h2>Ready to join {program.title}?</h2>
          <p>Submit your application and follow its status from your dashboard.</p>
        </div>
        <Button as={Link} to={applyLink}>Apply now <ArrowRight size={18} aria-hidden="true" /></Button>
      </section>
    </div>
  );
}
