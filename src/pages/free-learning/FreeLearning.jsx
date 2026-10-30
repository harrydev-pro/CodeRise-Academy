import { Link } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Code2,
  Palette,
  Server,
} from "lucide-react";

import { getTracks } from "../../features/free-learning/trackService";
import { useAuth } from "../../hooks/useAuth";
import EmptyState from "../../components/common/EmptyState";

const trackIcons = {
  "Product Design": Palette,
  "Frontend Development": Code2,
  "Backend Development": Server,
};

const trackDescriptions = {
  "Product Design":
    "Learn design thinking, user research, wireframing, prototyping, and interface design.",
  "Frontend Development":
    "Learn how to build websites using HTML, CSS, JavaScript, and modern frontend concepts.",
  "Backend Development":
    "Understand servers, APIs, databases, authentication, and how web applications work behind the scenes.",
};

export default function FreeLearning() {
  const { user } = useAuth();

  const tracks = getTracks().filter((track) => track.published !== false);

  return (
    <main className="page-container free-learning-shell">
      <section className="learning-hero">
        <span className="eyebrow">CODERISE ACADEMY</span>

        <h1>Learn a new skill, one lesson at a time.</h1>

        <p>
          Explore free, text-based learning materials, complete quizzes,
          practice with projects, and track your progress.
        </p>

        <div className="learning-hero-stats">
          <div>
            <BookOpen size={20} />
            <span>Guided lessons</span>
          </div>

          <div>
            <CheckCircle2 size={20} />
            <span>Practice assessments</span>
          </div>

          <div>
            <Code2 size={20} />
            <span>Practical projects</span>
          </div>
        </div>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">START LEARNING</span>
            <h2>Choose your learning track</h2>
            <p>Select a track to explore its lessons and activities.</p>
          </div>

          <span className="count-badge">
            {tracks.length} {tracks.length === 1 ? "track" : "tracks"}
          </span>
        </div>

        {tracks.length === 0 ? (
          <EmptyState
            title="No learning tracks available"
            description="Learning tracks will appear here when they are published."
          />
        ) : (
          <div className="track-grid">
            {tracks.map((track) => {
              const Icon = trackIcons[track.title] || BookOpen;

              return (
                <article className="track-card" key={track.id}>
                  <div className="track-card-icon">
                    <Icon size={25} />
                  </div>

                  <span className="track-level">
                    {track.level || "Beginner friendly"}
                  </span>

                  <h3>{track.title}</h3>

                  <p>
                    {track.description ||
                      trackDescriptions[track.title] ||
                      "Explore guided lessons and practical learning activities."}
                  </p>

                  <div className="track-card-footer">
                    <span>Free learning</span>

                    <Link
                      to={`/free-learning/${track.id}`}
                      state={{ trackTitle: track.title }}
                      className="text-link"
                    >
                      Explore track <ArrowRight size={16} />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="learning-callout">
        <div>
          <h2>Your progress starts with one lesson.</h2>
          <p>
            Sign in to keep track of your learning activities and assessment
            results.
          </p>
        </div>

        {!user && (
          <Link to="/login" className="btn btn-primary">
            Sign in to learn
          </Link>
        )}
      </section>
    </main>
  );
}
