import { Link } from "react-router-dom";
import {
  BookOpen,
  Code2,
  Palette,
  Server,
  ArrowRight,
} from "lucide-react";

import Button from "../../components/common/Button";
import { useApiResource } from "../../hooks/useApiResource";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";

const icons = {
  "Product Design": Palette,
  "Frontend Development": Code2,
  "Backend Development": Server,
};

export default function MyLearning() {
  const tracksResource = useApiResource("/learning/tracks", "tracks");
  const progressResource = useApiResource("/learning/progress", "progress");
  const tracks = tracksResource.data;
  const progress = progressResource.data;

  if (tracksResource.loading || progressResource.loading) return <div className="student-page"><Loader label="Loading your learning progress…" /></div>;
  if (tracksResource.error || progressResource.error) return <div className="student-page"><ErrorMessage message={tracksResource.error || progressResource.error} onRetry={() => { tracksResource.reload(); progressResource.reload(); }} /></div>;

  return (
    <div className="student-page">
      <div className="student-page-heading">
        <span className="eyebrow">YOUR LEARNING JOURNEY</span>
        <h1>My Learning</h1>
        <p>Explore tracks and continue building your skills.</p>
      </div>

      <div className="student-track-grid">
        {tracks.map((track) => {
          const Icon = icons[track.title] || BookOpen;

          const completed = new Set(progress.filter(
            (item) => item.trackId === track.id && item.completed
          ).map((item) => item.lessonId));
          const totalLessons = track.lessonCount || 0;
          const percentage = totalLessons ? Math.round(completed.size / totalLessons * 100) : 0;

          return (
            <article className="student-track-card" key={track.id}>
              <span className="student-track-icon">
                <Icon size={25} />
              </span>

              <h2>{track.title}</h2>

              <p>{track.description}</p>

              <div className="progress-heading">
                <span>Your progress</span>
                <strong>{percentage}%</strong>
              </div>

              <div
                className="progress-track"
                role="progressbar"
                aria-label={`${track.title} progress`}
                aria-valuenow={percentage}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className="progress-fill"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <Button
                as={Link}
                to={`/free-learning/${track.id}`}
                fullWidth
              >
                Continue Learning <ArrowRight size={17} />
              </Button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
