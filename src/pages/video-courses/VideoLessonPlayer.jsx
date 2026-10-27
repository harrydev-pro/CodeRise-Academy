import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  CirclePlay,
  LockKeyhole,
  PlayCircle,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import {
  getVideoCourseById,
} from "../../features/video-courses/videoCourseService";
import {
  hasPurchasedCourse,
} from "../../features/video-courses/purchaseService";

import EmptyState from "../../components/common/EmptyState";

export default function VideoLessonPlayer() {
  const { courseId, lessonId } = useParams();
  const { user } = useAuth();

  const course = getVideoCourseById(courseId);

  const lessons = Array.isArray(course?.lessons)
    ? course.lessons
    : [];

  const [completedIds, setCompletedIds] = useState([]);

  const purchased = Boolean(user && course && hasPurchasedCourse(user.id, course.id));

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
              state={{ from: `/video-courses/${courseId}/learn` }}
              className="btn btn-primary"
            >
              Sign in
            </Link>
          }
        />
      </main>
    );
  }

  if (!isFree && !purchased) {
    return (
      <main className="page-container">
        <EmptyState
          title="Course access required"
          description="A completed purchase record is required before opening this course."
          action={
            <Link
              to={`/video-courses/${courseId}/checkout`}
              className="btn btn-primary"
            >
              Continue to checkout
            </Link>
          }
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

  function toggleCompleted(id) {
    setCompletedIds((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
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

            <button
              type="button"
              className={`btn ${
                completedIds.includes(activeLesson.id)
                  ? "btn-outline"
                  : "btn-primary"
              }`}
              onClick={() => toggleCompleted(activeLesson.id)}
            >
              <CheckCircle2 size={18} />

              {completedIds.includes(activeLesson.id)
                ? "Mark as incomplete"
                : "Mark lesson as complete"}
            </button>
          </div>
        </section>

        <aside className="video-playlist">
          <div className="video-playlist-heading">
            <h2>Course content</h2>
            <span>{lessons.length} lessons</span>
          </div>

          {lessons.map((lesson, index) => {
            const isActive = lesson.id === activeLesson.id;
            const isCompleted = completedIds.includes(lesson.id);

            return (
              <Link
                key={lesson.id || index}
                to={`/video-courses/${courseId}/learn/${lesson.id}`}
                className={`video-playlist-item ${
                  isActive ? "active" : ""
                }`}
              >
                <div className="video-playlist-icon">
                  {isCompleted ? (
                    <CheckCircle2 size={19} />
                  ) : isActive ? (
                    <CirclePlay size={19} />
                  ) : (
                    <LockKeyhole size={17} />
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
