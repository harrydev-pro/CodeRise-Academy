import { Link } from "react-router-dom";
import {
  BookOpen,
  Code2,
  Palette,
  Server,
  ArrowRight,
} from "lucide-react";

import Button from "../../components/common/Button";
import { getTracks } from "../../features/free-learning/trackService";
import { getUserProgress } from "../../features/free-learning/progressService";
import { useAuth } from "../../hooks/useAuth";

const icons = {
  "Product Design": Palette,
  "Frontend Development": Code2,
  "Backend Development": Server,
};

export default function MyLearning() {
  const { user } = useAuth();

  const tracks = getTracks();
  const progress = getUserProgress(user?.id);

  return (
    <div className="student-page">
      <div className="student-page-heading">
        <span className="eyebrow">YOUR LEARNING JOURNEY</span>
        <h1>My Learning</h1>
        <p>Explore tracks and continue building your skills.</p>
      </div>

      <div className="student-track-grid">
        {tracks.map((track) => {
          const Icon = icons[track.name] || BookOpen;

          const trackProgress = progress.find(
            (item) => item.trackId === track.id
          );

          const percentage = Math.max(
            0,
            Math.min(100, Number(trackProgress?.percentage) || 0)
          );

          return (
            <article className="student-track-card" key={track.id}>
              <span className="student-track-icon">
                <Icon size={25} />
              </span>

              <h2>{track.name}</h2>

              <p>{track.description}</p>

              <div className="progress-heading">
                <span>Your progress</span>
                <strong>{percentage}%</strong>
              </div>

              <div
                className="progress-track"
                role="progressbar"
                aria-label={`${track.name} progress`}
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