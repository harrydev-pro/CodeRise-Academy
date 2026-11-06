import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
} from "lucide-react";

import { getTrackById } from "../../features/free-learning/trackService";
import {
  getLessonById,
  getLessonsByTrack,
} from "../../features/free-learning/lessonService";
import {
  getUserProgress,
  markLessonCompleted,
} from "../../features/free-learning/progressService";
import { getQuizByLesson } from "../../features/assessments/quizService";

import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";

export default function LessonDetails() {
  const { trackId, lessonId } = useParams();
  const { user } = useAuth();

  const [completed, setCompleted] = useState(false);
  const [message, setMessage] = useState("");

  const track = getTrackById(trackId);
  const lesson = getLessonById(lessonId);
  const lessons = getLessonsByTrack(trackId);
  const quiz = getQuizByLesson(lessonId);

  const lessonIndex = lessons.findIndex((item) => item.id === lessonId);

  const nextLesson = lessonIndex >= 0
    ? lessons[lessonIndex + 1]
    : null;

  const previousLesson = lessonIndex > 0
    ? lessons[lessonIndex - 1]
    : null;

  const savedProgress = useMemo(() => {
    return user ? getUserProgress(user.id) : [];
  }, [user]);

  if (!track || !lesson || lesson.trackId !== trackId) {
    return (
      <main className="page-container free-learning-shell">
        <EmptyState
          title="Lesson not found"
          description="This lesson could not be found in the selected learning track."
          action={
            <Link
              to={`/free-learning/${trackId}`}
              className="btn btn-primary"
            >
              Return to track
            </Link>
          }
        />
      </main>
    );
  }

  const isCompleted =
    completed ||
    savedProgress.some(
      (item) => item.lessonId === lessonId && item.completed
    );

  function handleComplete() {
    if (!user) {
      setMessage("Please sign in to save your learning progress.");
      return;
    }

    markLessonCompleted(user.id, trackId, lessonId);

    setCompleted(true);
    setMessage("Lesson completed. Your progress has been saved.");
  }

  function renderContent(content) {
    if (typeof content === "string") {
      return content.split("\n").map((paragraph, index) =>
        paragraph.trim() ? <p key={index}>{paragraph}</p> : null
      );
    }

    if (Array.isArray(content)) {
      return content.map((section, index) => {
        if (typeof section === "string") {
          return <p key={index}>{section}</p>;
        }

        return (
          <section className="lesson-content-section" key={index}>
            {section.heading && <h2>{section.heading}</h2>}

            {section.body && <p>{section.body}</p>}

            {Array.isArray(section.points) && (
              <ul>
                {section.points.map((point, pointIndex) => (
                  <li key={pointIndex}>{point}</li>
                ))}
              </ul>
            )}

            {section.code && (
              <pre className="lesson-code">
                <code>{section.code}</code>
              </pre>
            )}

            {section.example && (
              <div className="lesson-example">
                <strong>Example</strong>
                <p>{section.example}</p>
              </div>
            )}
          </section>
        );
      });
    }

    return <p>No lesson content is available yet.</p>;
  }

  return (
    <main className="page-container lesson-page free-learning-shell">
      <Link
        to={`/free-learning/${trackId}`}
        className="back-link"
      >
        <ArrowLeft size={17} />
        Back to {track.title}
      </Link>

      <div className="lesson-page-grid">
        <article className="lesson-reading">
          <div className="lesson-reading-header">
            <span className="eyebrow">{track.title}</span>

            <h1>{lesson.title}</h1>

            <p>
              {lesson.description ||
                "Study the lesson carefully and try the examples yourself."}
            </p>
          </div>

          <div className="lesson-content">
            {renderContent(lesson.content)}
          </div>

          {lesson.keyTakeaways?.length > 0 && (
            <section className="takeaways-card">
              <h2>
                <CheckCircle2 size={20} />
                Key takeaways
              </h2>

              <ul>
                {lesson.keyTakeaways.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {message && (
            <div className="inline-message" role="status">
              {message}
            </div>
          )}

          <div className="lesson-completion-card">
            <div>
              <h3>{isCompleted ? "Lesson completed" : "Finished reading?"}</h3>

              <p>
                {isCompleted
                  ? "Great work! Continue with the next lesson."
                  : "Mark this lesson as completed when you understand the material."}
              </p>
            </div>

            <Button
              onClick={handleComplete}
              disabled={isCompleted}
            >
              {isCompleted ? "Completed" : "Mark as complete"}
            </Button>
          </div>

          <div className="lesson-pagination">
            {previousLesson ? (
              <Link
                to={`/free-learning/${trackId}/lessons/${previousLesson.id}`}
                className="lesson-pagination-link"
              >
                <ArrowLeft size={17} />
                <span>
                  <small>PREVIOUS LESSON</small>
                  <strong>{previousLesson.title}</strong>
                </span>
              </Link>
            ) : (
              <span />
            )}

            {nextLesson && (
              <Link
                to={`/free-learning/${trackId}/lessons/${nextLesson.id}`}
                className="lesson-pagination-link next"
              >
                <span>
                  <small>NEXT LESSON</small>
                  <strong>{nextLesson.title}</strong>
                </span>
                <ArrowRight size={17} />
              </Link>
            )}
          </div>
        </article>

        <aside className="lesson-sidebar">
          <div className="lesson-sidebar-card">
            <BookOpen size={23} />

            <h3>Keep learning</h3>

            <p>
              Test what you learned in this lesson or practice with a project.
            </p>

            {quiz ? <Link
              to={`/free-learning/${trackId}/quizzes/${quiz.id}`}
              className="sidebar-action"
            >
              <ClipboardCheck size={17} />
              Take this lesson’s quiz
            </Link> : <button type="button" className="sidebar-action quiz-unavailable" disabled>
              <ClipboardCheck size={17} />
              Lesson quiz coming soon
            </button>}

            <Link
              to={`/free-learning/${trackId}/projects`}
              className="sidebar-action"
            >
              <ArrowRight size={17} />
              View projects
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
