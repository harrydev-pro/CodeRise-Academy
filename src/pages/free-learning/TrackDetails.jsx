import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useApiResource } from "../../hooks/useApiResource";
import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";

export default function TrackDetails() {
  const { trackId } = useParams();
  const { user } = useAuth();

  const trackResource = useApiResource(`/learning/tracks/${encodeURIComponent(trackId)}`, "track", null);
  const lessonResource = useApiResource(`/learning/tracks/${encodeURIComponent(trackId)}/lessons`, "lessons");
  const progressResource = useApiResource("/learning/progress", "progress", undefined, Boolean(user));
  const track = trackResource.data;
  const lessons = lessonResource.data;
  const progress = progressResource.data;

  if (trackResource.loading || lessonResource.loading || progressResource.loading) {
    return <main className="page-container"><Loader label="Loading this learning track…" /></main>;
  }
  if (trackResource.error || lessonResource.error || progressResource.error) {
    return <main className="page-container"><ErrorMessage message={trackResource.error || lessonResource.error || progressResource.error} onRetry={() => { trackResource.reload(); lessonResource.reload(); progressResource.reload(); }} /></main>;
  }

  if (!track) {
    return (
      <main className="page-container">
        <EmptyState
          title="Learning track not found"
          description="This track may have been removed or its address may be incorrect."
          action={
            <Link to="/free-learning" className="btn btn-primary">
              Browse learning tracks
            </Link>
          }
        />
      </main>
    );
  }

  const completedLessonIds = new Set(
    progress
      .filter((item) => item.completed)
      .map((item) => item.lessonId)
      .filter(Boolean)
  );

  const completedCount = lessons.filter((lesson) =>
    completedLessonIds.has(lesson.id)
  ).length;

  const percentage = lessons.length
    ? Math.round((completedCount / lessons.length) * 100)
    : 0;

  return (
    <main className="page-container">
      <Link to="/free-learning" className="back-link">
        <ArrowLeft size={17} />
        All learning tracks
      </Link>

      <section className="track-detail-hero">
        <span className="eyebrow">FREE LEARNING TRACK</span>

        <h1>{track.title}</h1>

        <p>
          {track.description ||
            "Build your knowledge through guided lessons and practical activities."}
        </p>

        <div className="track-detail-meta">
          <span>
            <BookOpen size={17} />
            {lessons.length} lessons
          </span>

          <span>
            <GraduationCap size={17} />
            {track.level || "Beginner friendly"}
          </span>
        </div>

        {user && (
          <div className="progress-summary">
            <div className="progress-summary-heading">
              <span>Your lesson progress</span>
              <strong>{percentage}%</strong>
            </div>

            <div
              className="progress-track"
              role="progressbar"
              aria-label="Learning track progress"
              aria-valuenow={percentage}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="progress-fill"
                style={{ width: `${percentage}%` }}
              />
            </div>

            <small>
              {completedCount} of {lessons.length} lessons completed
            </small>
          </div>
        )}
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <h2>Lessons in this track</h2>
            <p>Work through the lessons and practice what you learn.</p>
          </div>
        </div>

        {lessons.length === 0 ? (
          <EmptyState
            title="No lessons published yet"
            description="Lessons will appear here when they are added to this track."
          />
        ) : (
          <div className="lesson-list">
            {lessons.map((lesson, index) => {
              const completed = completedLessonIds.has(lesson.id);

              return (
                <article className="lesson-list-item" key={lesson.id}>
                  <div className="lesson-number">
                    {completed ? (
                      <CheckCircle2 size={22} />
                    ) : (
                      String(index + 1).padStart(2, "0")
                    )}
                  </div>

                  <div className="lesson-list-content">
                    <div className="lesson-list-meta">
                      <span>LESSON {index + 1}</span>

                      {lesson.duration && (
                        <span>
                          <Clock3 size={14} />
                          {lesson.duration}
                        </span>
                      )}
                    </div>

                    <h3>{lesson.title}</h3>

                    <p>
                      {lesson.description ||
                        "Read the lesson and complete the learning activities."}
                    </p>
                  </div>

                  <Link
                    to={`/free-learning/${trackId}/lessons/${lesson.id}`}
                    className="lesson-open-link"
                    aria-label={`Open ${lesson.title}`}
                  >
                    <ArrowRight size={20} />
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
