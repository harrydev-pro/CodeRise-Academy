import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CheckCircle2, Clock } from "lucide-react";

import Button from "../../components/common/Button";
import { useApiResource } from "../../hooks/useApiResource";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { formatCurrency } from "../../utils/formatCurrency";
import { getProgramPrice, hasProgramDiscount } from "../../utils/programPrice";
import { curriculumTitles } from "../../utils/programContent";
import ProgramIcon from "../../components/common/ProgramIcon";

const PREVIEW_ITEMS = 5;

export default function Programs() {
  const { data: programs, loading, error, reload } = useApiResource("/catalog/programs", "programs");

  return (
    <div>
      <section className="page-hero">
        <div className="container page-hero-content">
          <span className="eyebrow">OUR TRAINING PROGRAMS</span>
          <h1>
            Choose your path. <span>Build your skills.</span>
          </h1>
          <p>
            Explore our structured technology training programs, review what you will learn and what
            each program costs, and apply when you are ready.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <div className="programs-intro">
            <div>
              <h2>Available programs</h2>
              <p>
                Prices are shown before you apply. Submitting an application does not enroll you or take
                a payment; the academy team reviews every application first.
              </p>
            </div>
          </div>

          {loading ? <Loader label="Loading programs…" /> : error ? <ErrorMessage message={error} onRetry={reload} /> : programs.length === 0 ? (
            <div className="empty-programs">
              <BookOpen size={32} />
              <h3>No published programs yet</h3>
              <p>Please check back later for available programs.</p>
            </div>
          ) : (
            <div className="programs-grid">
              {programs.map((program) => {
                const topics = curriculumTitles(program);
                return (
                  <article className="program-card" key={program.id}>
                    {program.imageUrl ? (
                      <img className="program-card-image" src={program.imageUrl} alt="" loading="lazy" />
                    ) : (
                      <div className="program-card-top">
                        <div className="program-card-icon"><ProgramIcon program={program} /></div>
                        <span className="program-badge">{program.category || "Training program"}</span>
                      </div>
                    )}

                    <h2>{program.title}</h2>
                    <p className="program-description">{program.description}</p>

                    <div className="program-price-block">
                      <span className="price-caption">Program fee</span>
                      <div className="program-price">
                        <strong>{formatCurrency(getProgramPrice(program))}</strong>
                        {hasProgramDiscount(program) && <del>{formatCurrency(program.originalPrice)}</del>}
                      </div>
                    </div>

                    <div className="program-duration-row">
                      <Clock size={17} aria-hidden="true" />
                      <span>Duration: {program.duration || "To be announced"}</span>
                    </div>

                    {topics.length > 0 && (
                      <div className="program-features">
                        <h3>What you will learn</h3>
                        {topics.slice(0, PREVIEW_ITEMS).map((topic) => (
                          <div className="program-feature" key={topic}>
                            <CheckCircle2 size={17} aria-hidden="true" />
                            <span>{topic}</span>
                          </div>
                        ))}
                        {topics.length > PREVIEW_ITEMS && (
                          <p className="muted-text">+ {topics.length - PREVIEW_ITEMS} more topics</p>
                        )}
                      </div>
                    )}

                    <div className="program-card-actions">
                      <Button as={Link} to={`/programs/${program.id}`} variant="outline" fullWidth>
                        View details
                      </Button>
                      <Button as={Link} to={`/apply/${program.id}`} fullWidth>
                        Apply now <ArrowRight size={18} aria-hidden="true" />
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          <div className="programs-bottom-note">
            <h3>Not sure where to begin?</h3>
            <p>
              Create a free account and explore our free learning tracks before deciding which training
              program is right for you.
            </p>
            <Button as={Link} to="/register" variant="outline">Create a Free Account</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
