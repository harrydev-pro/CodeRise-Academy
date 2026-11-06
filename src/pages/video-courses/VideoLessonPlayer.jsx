import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CirclePlay,
  PlayCircle,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useApiResource } from "../../hooks/useApiResource";
import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";

export default function VideoLessonPlayer() {
  const { courseId, lessonId } = useParams();
  const { user } = useAuth();

  const { data: course, loading, error, reload } = useApiResource(`/catalog/video-courses/${encodeURIComponent(courseId)}`, "course", null);

  const lessons = Array.isArray(course?.lessons)
    ? course.lessons
    : [];

  if (loading) return <main className="page-container"><Loader label="Loading course lesson…" /></main>;
  if (error) return <main className="page-container"><ErrorMessage message={error} onRetry={reload} /></main>;

  if (!course || course.published === false) {
    return (
      <main className="page-container">
        <EmptyState
          title="Course not found"
          description="This video course is unavailable."
          action={
            <Link to="/video-courses" className="btn btn-primary">
              Browse courses
            </Link>
          }
        />
      </main>
    );
  }

  const isFree = Number(course.price) === 0;

  if (!user) {
    return (
      <main className="page-container">
        <EmptyState
          title="Sign in to access your course"
          description="Sign in to continue to the course learning area."
          action={
            <Link
              to="/login"
              state={{ from: `/video-courses/${courseId}/lessons/${lessonId || ""}` }}
              className="btn btn-primary"
            >
              Sign in
            </Link>
          }
        />
      </main>
    );
  }

  if (!isFree) {
    return (
      <main className="page-container">
        <EmptyState
          title="Course access required"
          description="Paid course access is unavailable until secure payment processing is configured."
        />
      </main>
    );
  }

  const activeLesson =
    lessons.find((lesson) => lesson.id === lessonId) || lessons[0];

  if (!activeLesson) {
    return (
      <main className="page-container">
        <EmptyState
          title="No lessons available"
          description="The instructor has not added any lessons to this course yet."
          action={
            <Link
              to={`/video-courses/${courseId}`}
              className="btn btn-primary"
            >
              Back to course details
            </Link>
          }
        />
      </main>
    );
  }

  return (
    <main className="page-container video-player-page">
      <Link
        to={`/video-courses/${courseId}`}
        className="back-link"
      >
        <ArrowLeft size={17} />
        Back to course details
      </Link>

      <div className="video-player-layout">
        <section className="video-player-main">
          <div className="video-player-screen">
            {activeLesson.videoUrl ? (
              <video
                src={activeLesson.videoUrl}
                controls
                preload="metadata"
                className="video-player-element"
              >
                Your browser does not support video playback.
              </video>
            ) : (
              <div className="video-player-placeholder">
                <PlayCircle size={60} />

                <h2>Video not available yet</h2>

                <p>
                  This lesson does not have a video file configured.
                </p>
              </div>
            )}
          </div>

          <div className="video-player-lesson-details">
            <span className="eyebrow">{course.title}</span>

            <h1>{activeLesson.title}</h1>

            <p>
              {activeLesson.description ||
                "Watch the lesson and review the learning material."}
            </p>

            {activeLesson.content && (
              <div className="video-lesson-notes">
                <h2>Lesson notes</h2>
                <p>{activeLesson.content}</p>
              </div>
            )}

          </div>
        </section>

        <aside className="video-playlist">
          <div className="video-playlist-heading">
            <h2>Course content</h2>
            <span>{lessons.length} lessons</span>
          </div>

          {lessons.map((lesson, index) => {
            const isActive = lesson.id === activeLesson.id;
            return (
              <Link
                key={lesson.id || index}
                to={`/video-courses/${courseId}/lessons/${lesson.id}`}
                className={`video-playlist-item ${
                  isActive ? "active" : ""
                }`}
              >
                <div className="video-playlist-icon">
                  {isActive ? (
                    <CirclePlay size={19} />
                  ) : (
                    <PlayCircle size={17} />
                  )}
                </div>

                <div>
                  <strong>{lesson.title || `Lesson ${index + 1}`}</strong>

                  <span>
                    {lesson.duration || `Lesson ${index + 1}`}
                  </span>
                </div>
              </Link>
            );
          })}
        </aside>
      </div>
    </main>
  );
}
