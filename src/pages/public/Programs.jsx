import { Link } from "react-router-dom";
import {
  Palette,
  Code2,
  Server,
  Clock,
  CheckCircle2,
  ArrowRight,
  BookOpen,
} from "lucide-react";

import Button from "../../components/common/Button";
import { getPrograms } from "../../features/programs/programService";
import { formatCurrency } from "../../utils/formatCurrency";

const programIcons = {
  "Product Design": Palette,
  "Frontend Development": Code2,
  "Backend Development": Server,
};

export default function Programs() {
  const programs = getPrograms().filter((program) => program.published);

  return (
    <main>
      <section className="page-hero">
        <div className="container page-hero-content">
          <span className="eyebrow">OUR TRAINING PROGRAMS</span>

          <h1>
            Choose your path. <span>Build your skills.</span>
          </h1>

          <p>
            Explore our structured technology training programs, review
            their prices and durations, and submit an application when
            you are ready.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container">
          <div className="programs-intro">
            <div>
              <h2>Available programs</h2>

              <p>
                Program prices are displayed before you apply. Submitting
                an application does not automatically enroll you or confirm
                payment.
              </p>
            </div>

            <div className="programs-intro-note">
              <BookOpen size={20} />

              <span>Choose the path that suits your goals.</span>
            </div>
          </div>

          {programs.length === 0 ? (
            <div className="empty-programs">
              <BookOpen size={32} />

              <h3>No published programs yet</h3>

              <p>
                Please check back later for currently available programs.
              </p>
            </div>
          ) : (
            <div className="programs-grid">
              {programs.map((program) => {
                const Icon =
                  programIcons[program.title] || BookOpen;

                return (
                  <article className="program-card" key={program.id}>
                    <div className="program-card-top">
                      <div className="program-card-icon">
                        <Icon size={28} />
                      </div>

                      <span className="program-badge">
                        Training program
                      </span>
                    </div>

                    <h2>{program.title}</h2>

                    <p className="program-description">
                      {program.description}
                    </p>

                    <div className="program-price-block">
                      <span className="price-caption">
                        Current promotional price
                      </span>

                      <div className="program-price">
                        <strong>
                          {formatCurrency(program.promotionalPrice)}
                        </strong>

                        {program.originalPrice > program.promotionalPrice && (
                          <del>
                            {formatCurrency(program.originalPrice)}
                          </del>
                        )}
                      </div>
                    </div>

                    <div className="program-duration-row">
                      <Clock size={17} />

                      <span>
                        Duration: {program.duration}
                      </span>
                    </div>

                    <div className="program-features">
                      <h3>Program highlights</h3>

                      {(program.features || []).map((feature) => (
                        <div className="program-feature" key={feature}>
                          <CheckCircle2 size={17} />

                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      as={Link}
                      to={`/apply/${program.id}`}
                      fullWidth
                    >
                      Apply Now <ArrowRight size={18} />
                    </Button>

                    <p className="program-card-note">
                      You will need to sign in before submitting an
                      application.
                    </p>
                  </article>
                );
              })}
            </div>
          )}

          <div className="programs-bottom-note">
            <h3>Not sure where to begin?</h3>

            <p>
              Create an account and explore our free text-based learning
              resources before deciding which training path is right for
              you.
            </p>

            <Button as={Link} to="/register" variant="outline">
              Create a Free Account
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
