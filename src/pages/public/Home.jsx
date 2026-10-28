import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Code2,
  Palette,
  Server,
  CheckCircle2,
  GraduationCap,
  Lightbulb,
} from "lucide-react";

import Button from "../../components/common/Button";
import { getPrograms } from "../../features/programs/programService";
import { formatCurrency } from "../../utils/formatCurrency";

const learningAreas = [
  {
    title: "Product Design",
    description:
      "Learn user research, wireframing, prototyping, and interface design.",
    icon: Palette,
  },
  {
    title: "Frontend Development",
    description:
      "Build responsive websites using HTML, CSS, JavaScript, and React.",
    icon: Code2,
  },
  {
    title: "Backend Development",
    description:
      "Learn how servers, databases, APIs, and application logic work.",
    icon: Server,
  },
];

const benefits = [
  "Beginner-friendly learning resources",
  "Practical projects and assignments",
  "Knowledge assessments and feedback",
  "Structured learning tracks",
];

export default function Home() {
  const programs = getPrograms().filter((program) => program.published);

  return (
    <>
      <section className="hero-section">
        <div className="container hero-grid">
          <div className="hero-content">
            <span className="eyebrow">
              <GraduationCap size={17} />
              YOUR JOURNEY INTO TECHNOLOGY STARTS HERE
            </span>

            <h1>
              Learn technology.
              <span> Build your future.</span>
            </h1>

            <p className="hero-description">
              CodeRise Academy helps aspiring digital professionals
              develop practical technology skills through structured
              learning, assessments, and hands-on projects.
            </p>

            <div className="hero-actions">
              <Button as={Link} to="/programs">
                Explore Programs <ArrowRight size={18} />
              </Button>

              <Button as={Link} to="/register" variant="outline">
                Create Account
              </Button>
            </div>

            <div className="hero-trust">
              <span>
                <CheckCircle2 size={17} />
                Practical learning
              </span>

              <span>
                <CheckCircle2 size={17} />
                Beginner-friendly
              </span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-visual-glow" />
            <img className="hero-illustration" src="/hero-learning.svg" alt="A learner practicing software development at a computer" />

            <div className="floating-card floating-card-top">
              <span className="floating-icon">
                <Lightbulb size={19} />
              </span>

              <div>
                <strong>Learn by doing</strong>
                <small>Turn knowledge into skills</small>
              </div>
            </div>

            <div className="floating-card floating-card-bottom">
              <span className="floating-icon">
                <Code2 size={19} />
              </span>

              <div>
                <strong>Build projects</strong>
                <small>Practice what you learn</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="learning-section section-padding">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">EXPLORE YOUR OPTIONS</span>

            <h2>
              Find your path in <span>technology</span>
            </h2>

            <p>
              Choose a learning path that matches your interests and
              career goals.
            </p>
          </div>

          <div className="learning-grid">
            {learningAreas.map((area) => {
              const Icon = area.icon;

              return (
                <article className="learning-card" key={area.title}>
                  <div className="learning-icon">
                    <Icon size={25} />
                  </div>

                  <h3>{area.title}</h3>

                  <p>{area.description}</p>

                  <Link to="/programs" className="text-link">
                    Explore program <ArrowRight size={16} />
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="benefits-section section-padding">
        <div className="container benefits-grid">
          <div className="benefits-visual">
            <div className="benefits-icon">
              <BookOpen size={48} />
            </div>

            <div className="benefits-caption">
              <strong>Learn. Practice. Improve.</strong>
              <p>Build your skills one step at a time.</p>
            </div>
          </div>

          <div className="benefits-content">
            <span className="eyebrow">WHY CODERISE ACADEMY?</span>

            <h2>
              Turn your interest in technology into{" "}
              <span>real skills.</span>
            </h2>

            <p>
              Learning technology is easier when you have a clear path,
              useful resources, and opportunities to practice.
            </p>

            <div className="benefits-list">
              {benefits.map((benefit) => (
                <div className="benefit-item" key={benefit}>
                  <CheckCircle2 size={19} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            <Button as={Link} to="/about">
              Learn About Us <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </section>

      <section className="program-preview-section section-padding">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">STRUCTURED TRAINING</span>

            <h2>Explore our training programs</h2>

            <p>
              Review the available programs, duration, and current
              promotional prices before applying.
            </p>
          </div>

          {programs.length === 0 ? (
            <div className="empty-programs">
              <BookOpen size={30} />

              <h3>Programs are being updated</h3>

              <p>
                Please check again soon for available training programs.
              </p>
            </div>
          ) : (
            <div className="program-preview-grid">
              {programs.map((program) => (
                <article className="program-preview-card" key={program.id}>
                  <span className="program-badge">Training program</span>

                  <h3>{program.title}</h3>

                  <p>{program.description}</p>

                  <div className="program-price">
                    {/* <strong> */}
                      {/* {formatCurrency(program.promotionalPrice)} */}
                    {/* </strong> */}

                    <strong>{formatCurrency(program.originalPrice)}</strong>
                  </div>

                  <p className="program-duration">
                    {program.duration}
                  </p>

                  <Button
                    as={Link}
                    to={`/apply/${program.id}`}
                    fullWidth
                  >
                    Apply Now <ArrowRight size={17} />
                  </Button>
                </article>
              ))}
            </div>
          )}

          <div className="centered-action">
            <Button as={Link} to="/programs" variant="outline">
              View All Programs
            </Button>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-content">
          <div>
            <span className="eyebrow">YOUR NEXT CHAPTER STARTS HERE</span>

            <h2>Ready to begin your technology journey?</h2>

            <p>
              Create your account to access our free text-based learning
              resources and explore opportunities at CodeRise Academy.
            </p>
          </div>

          <Button as={Link} to="/register" variant="outline">
            Get Started <ArrowRight size={18} />
          </Button>
        </div>
      </section>
    </>
  );
}
