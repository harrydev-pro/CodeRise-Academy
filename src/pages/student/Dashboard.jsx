import { Link } from "react-router-dom";
import {
  BookOpen,
  Code2,
  FileText,
  Trophy,
  ArrowRight,
  GraduationCap,
  Palette,
  Server,
} from "lucide-react";

import Button from "../../components/common/Button";
import { useAuth } from "../../hooks/useAuth";
import { useApiResource } from "../../hooks/useApiResource";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";

export default function Dashboard() {
  const { user } = useAuth();

  const tracksResource = useApiResource("/learning/tracks", "tracks");
  const programsResource = useApiResource("/catalog/programs", "programs");
  const applicationsResource = useApiResource("/applications/me", "applications");
  const resultsResource = useApiResource("/learning/attempts", "attempts");
  const submissionsResource = useApiResource("/learning/submissions", "submissions");
  const tracks = tracksResource.data;
  const programs = programsResource.data;
  const applications = applicationsResource.data;
  const results = resultsResource.data;
  const submissions = submissionsResource.data;
  const resources = [tracksResource, programsResource, applicationsResource, resultsResource, submissionsResource];
  if (resources.some((resource) => resource.loading)) return <div className="student-page"><Loader label="Loading your dashboard…" /></div>;
  const failedResource = resources.find((resource) => resource.error);
  if (failedResource) return <div className="student-page"><ErrorMessage message={failedResource.error} onRetry={() => resources.forEach((resource) => resource.reload())} /></div>;
  const studentName = user?.name || user?.fullName || user?.full_name;

  const quickLinks = [
    {
      title: "Free Learning",
      description: "Explore lessons and practice your skills.",
      icon: BookOpen,
      link: "/free-learning",
    },
    {
      title: "Video Courses",
      description: "Explore video courses available in the catalog.",
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
      title: "My Submissions",
      description: "Review your practical project work.",
      icon: Trophy,
      link: "/my-submissions",
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
            Welcome back, {studentName?.trim().split(/\s+/)[0] || "Student"}!
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
            <strong>{applications.length}</strong>
          </div>
        </article>

        <article className="student-stat-card">
          <span className="student-stat-icon green">
            <Trophy size={22} />
          </span>

          <div>
            <p>Quiz Attempts</p>
            <strong>{results.length}</strong>
          </div>
        </article>

        <article className="student-stat-card">
          <span className="student-stat-icon orange"><Trophy size={22} /></span>
          <div><p>Project Submissions</p><strong>{submissions.length}</strong></div>
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
            const Icon = trackIcons[track.title] || BookOpen;

            return (
              <article className="student-track-card" key={track.id}>
                <span className="student-track-icon">
                  <Icon size={25} />
                </span>

                <h3>{track.title}</h3>

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
