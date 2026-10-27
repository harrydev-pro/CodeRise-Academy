import { Link } from "react-router-dom";
import {
  BookOpen,
  Code2,
  FileText,
  Trophy,
  ShoppingBag,
  ArrowRight,
  GraduationCap,
  Palette,
  Server,
} from "lucide-react";

import Button from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import { getTracks } from "../../features/free-learning/trackService";
import { getPrograms } from "../../features/programs/programService";
import { readStore } from "../../services/storage/storageAdapter";
import { STORAGE_KEYS } from "../../services/storage/storageKeys";

export default function Dashboard() {
  const { user } = useAuth();

  const tracks = getTracks();
  const programs = getPrograms();

  const applications = readStore(STORAGE_KEYS.APPLICATIONS, []);
  const submissions = readStore(STORAGE_KEYS.SUBMISSIONS, []);
  const results = readStore(STORAGE_KEYS.QUIZ_RESULTS, []);
  const purchases = readStore(STORAGE_KEYS.PURCHASES, []);

  const userId = user?.id;

  const myApplications = applications.filter(
    (item) => item.userId === userId
  );

  const mySubmissions = submissions.filter(
    (item) => item.userId === userId
  );

  const myResults = results.filter(
    (item) => item.userId === userId
  );

  const myPurchases = purchases.filter(
    (item) => item.userId === userId && item.status === "completed"
  );

  const quickLinks = [
    {
      title: "Free Learning",
      description: "Explore lessons and practice your skills.",
      icon: BookOpen,
      link: "/free-learning",
    },
    {
      title: "Video Courses",
      description: "Explore courses available for purchase.",
      icon: Code2,
      link: "/video-courses",
    },
    {
      title: "My Applications",
      description: "Track your training program applications.",
      icon: FileText,
      link: "/my-applications",
    },
    {
      title: "My Results",
      description: "Review your assessment performance.",
      icon: Trophy,
      link: "/my-results",
    },
  ];

  const trackIcons = {
    "Product Design": Palette,
    "Frontend Development": Code2,
    "Backend Development": Server,
  };

  return (
    <div className="student-page">
      <section className="dashboard-welcome">
        <div>
          <span className="eyebrow">STUDENT DASHBOARD</span>

          <h1>
            Welcome back, {user?.fullName?.split(" ")[0] || "Student"}!
          </h1>

          <p>
            Continue learning, check your progress, and explore your next
            opportunity.
          </p>
        </div>

        <div className="dashboard-welcome-icon">
          <GraduationCap size={38} />
        </div>
      </section>

      <section className="student-stats-grid">
        <article className="student-stat-card">
          <span className="student-stat-icon purple">
            <BookOpen size={22} />
          </span>

          <div>
            <p>Learning Tracks</p>
            <strong>{tracks.length}</strong>
          </div>
        </article>

        <article className="student-stat-card">
          <span className="student-stat-icon blue">
            <FileText size={22} />
          </span>

          <div>
            <p>Applications</p>
            <strong>{myApplications.length}</strong>
          </div>
        </article>

        <article className="student-stat-card">
          <span className="student-stat-icon green">
            <Trophy size={22} />
          </span>

          <div>
            <p>Quiz Attempts</p>
            <strong>{myResults.length}</strong>
          </div>
        </article>

        <article className="student-stat-card">
          <span className="student-stat-icon orange">
            <ShoppingBag size={22} />
          </span>

          <div>
            <p>Purchased Courses</p>
            <strong>{myPurchases.length}</strong>
          </div>
        </article>
      </section>

      <section className="student-section">
        <div className="student-section-heading">
          <div>
            <h2>Quick access</h2>
            <p>Jump straight into the areas you need.</p>
          </div>
        </div>

        <div className="student-quick-links">
          {quickLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                to={item.link}
                className="student-quick-card"
                key={item.title}
              >
                <span className="student-quick-icon">
                  <Icon size={22} />
                </span>

                <h3>{item.title}</h3>

                <p>{item.description}</p>

                <span className="text-link">
                  Open <ArrowRight size={16} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="student-section">
        <div className="student-section-heading">
          <div>
            <h2>Explore learning tracks</h2>
            <p>Build your knowledge step by step.</p>
          </div>

          <Link to="/free-learning" className="text-link">
            View all <ArrowRight size={16} />
          </Link>
        </div>

        <div className="student-track-grid">
          {tracks.slice(0, 3).map((track) => {
            const Icon = trackIcons[track.name] || BookOpen;

            return (
              <article className="student-track-card" key={track.id}>
                <span className="student-track-icon">
                  <Icon size={25} />
                </span>

                <h3>{track.name}</h3>

                <p>{track.description}</p>

                <Button
                  as={Link}
                  to={`/free-learning/${track.id}`}
                  variant="outline"
                  fullWidth
                >
                  Explore Track
                </Button>
              </article>
            );
          })}
        </div>
      </section>

      <section className="student-section dashboard-application-banner">
        <div>
          <span className="eyebrow">READY FOR STRUCTURED TRAINING?</span>

          <h2>Take the next step in your learning journey.</h2>

          <p>
            Explore the available training programs and their prices.
          </p>
        </div>

        <Button as={Link} to="/programs">
          Explore Programs <ArrowRight size={18} />
        </Button>
      </section>

      {programs.length === 0 && (
        <p className="muted-text">
          Training programs are currently being updated.
        </p>
      )}
    </div>
  );
}