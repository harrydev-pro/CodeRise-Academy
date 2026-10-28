import { Link } from "react-router-dom";
import {
  Target,
  Eye,
  Heart,
  Lightbulb,
  Users,
  Code2,
  ArrowRight,
} from "lucide-react";

import Button from "../../components/common/Button";

const values = [
  {
    icon: Target,
    title: "Practical learning",
    description:
      "We emphasize understanding, practice, and applying knowledge to meaningful projects.",
  },
  {
    icon: Lightbulb,
    title: "Continuous growth",
    description:
      "We encourage curiosity, experimentation, and consistent improvement.",
  },
  {
    icon: Heart,
    title: "Accessible education",
    description:
      "We aim to make technology learning approachable for people at different skill levels.",
  },
  {
    icon: Users,
    title: "Learning together",
    description:
      "We believe learners benefit from guidance, constructive feedback, and shared experiences.",
  },
];

export default function About() {
  return (
    <main>
      <section className="page-hero">
        <div className="container page-hero-content">
          <span className="eyebrow">ABOUT CODERISE ACADEMY</span>

          <h1>
            Helping people grow through <span>technology.</span>
          </h1>

          <p>
            We are building a learning environment where people can explore
            digital skills, practice their knowledge, and prepare for
            opportunities in technology.
          </p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container about-intro-grid">
          <div>
            <span className="eyebrow">WHO WE ARE</span>

            <h2>Technology education for a digital future</h2>

            <p>
              CodeRise Academy is a technology education initiative focused
              on ICT, digital technology, coding, robotics, product design,
              and software development.
            </p>

            <p>
              Our goal is to help learners move from curiosity to practical
              understanding through structured lessons, assessments,
              projects, and guided training programs.
            </p>

            <p>
              We are building the academy progressively, with learning
              resources and features introduced as they become available.
            </p>

            <Button as={Link} to="/programs">
              Explore Our Programs <ArrowRight size={18} />
            </Button>
          </div>

          <div className="about-visual">
            <div className="about-visual-icon">
              <Code2 size={54} />
            </div>

            <h3>Learn with purpose.</h3>

            <p>Practice with intention. Build with confidence.</p>

            <div className="about-visual-tags">
              <span>Design</span>
              <span>Development</span>
              <span>Robotics</span>
            </div>
          </div>
        </div>
      </section>

      <section className="values-section section-padding">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">WHAT GUIDES US</span>

            <h2>Our values</h2>

            <p>
              The principles that shape how we approach technology education.
            </p>
          </div>

          <div className="values-grid">
            {values.map((value) => {
              const Icon = value.icon;

              return (
                <article className="value-card" key={value.title}>
                  <div className="learning-icon">
                    <Icon size={25} />
                  </div>

                  <h3>{value.title}</h3>

                  <p>{value.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mission-section section-padding">
        <div className="container mission-grid">
          <article className="mission-card">
            <Target size={30} />

            <h2>Our mission</h2>

            <p>
              To make technology education more accessible and practical
              through structured learning, useful resources, and
              opportunities to build real skills.
            </p>
          </article>

          <article className="mission-card mission-card-highlight">
            <Eye size={30} />

            <h2>Our vision</h2>

            <p>
              To contribute to a future where more people can use technology
              creatively, solve problems, and participate in the digital
              economy.
            </p>
          </article>
        </div>
      </section>

      <section className="cta-section">
        <div className="container cta-content">
          <div>
            <h2>Start learning with CodeRise Academy.</h2>

            <p>
              Explore our programs and find a suitable starting point.
            </p>
          </div>

          <Button as={Link} to="/programs" variant="outline">
            Explore Programs <ArrowRight size={18} />
          </Button>
        </div>
      </section>
    </main>
  );
}