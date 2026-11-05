import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, FolderKanban, Target } from "lucide-react";

import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import NoteContent from "../../components/common/NoteContent";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { useApiResource } from "../../hooks/useApiResource";
import { markLessonCompleted } from "../../features/free-learning/progressService";

export default function LessonDetails() {
  const { trackId, lessonId } = useParams();
  const lessonResource = useApiResource(`/learning/lessons/${encodeURIComponent(lessonId)}`, "lesson", null);
  const progressResource = useApiResource("/learning/progress", "progress");
  const [justCompleted, setJustCompleted] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const lesson = lessonResource.data;

  if (lessonResource.loading || progressResource.loading) return <div className="page-container"><Loader label="Loading topic…" /></div>;
  if (lessonResource.error && !/not found/i.test(lessonResource.error)) return <div className="page-container"><ErrorMessage message={lessonResource.error} onRetry={lessonResource.reload} /></div>;
  if (!lesson || lesson.trackId !== trackId) {
    return <div className="page-container"><EmptyState title="Topic not found" description="This topic could not be found in the selected learning track." actionLabel="Return to track" actionHref={`/free-learning/${trackId}`} /></div>;
  }

  const completed = justCompleted || progressResource.data.some((item) => item.lessonId === lesson.id);
  const objectives = Array.isArray(lesson.objectives) ? lesson.objectives : [];
  const takeaways = Array.isArray(lesson.keyTakeaways) ? lesson.keyTakeaways : [];
  const notes = Array.isArray(lesson.notes) ? lesson.notes : [];

  async function handleComplete() {
    setSaving(true);
    setMessage("");
    try {
      await markLessonCompleted(null, trackId, lesson.id);
      setJustCompleted(true);
      setMessage("Topic completed. Your progress has been saved.");
    } catch (error) {
      setMessage(error.message || "We couldn't save your progress. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="page-container lesson-page">
      <Link to={`/free-learning/${trackId}`} className="back-link"><ArrowLeft size={17} aria-hidden="true" /> Back to the track</Link>

      <article className="lesson-reading">
        <header className="lesson-reading-header">
          <span className="eyebrow">{lesson.level?.title || "TOPIC"}</span>
          <h1>{lesson.title}</h1>
          {lesson.description && <p>{lesson.description}</p>}
          <span className={`ui-pill ${completed ? "green" : ""}`}>
            {completed ? <><CheckCircle2 size={14} aria-hidden="true" /> Completed</> : "Not completed yet"}
          </span>
        </header>

        {objectives.length > 0 && (
          <section className="lesson-objectives">
            <h2><Target size={19} aria-hidden="true" /> Learning objectives</h2>
            <ul>{objectives.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        )}

        <div className="lesson-content">
          {notes.length > 0 ? notes.map((note) => (
            <section className="lesson-content-section" key={note.id}>
              {note.title && <h2>{note.title}</h2>}
              <NoteContent body={note.body} />
            </section>
          )) : lesson.content ? <NoteContent body={lesson.content} /> : (
            <p className="muted-text">The notes for this topic have not been published yet.</p>
          )}
        </div>

        {takeaways.length > 0 && (
          <section className="takeaways-card">
            <h2><CheckCircle2 size={20} aria-hidden="true" /> Key takeaways</h2>
            <ul>{takeaways.map((item) => <li key={item}>{item}</li>)}</ul>
          </section>
        )}

        {message && <div className="inline-message" role="status">{message}</div>}

        <section className="lesson-next-steps">
          <div className="lesson-completion-card">
            <div>
              <h3>{completed ? "Topic completed" : "Finished reading?"}</h3>
              <p>{completed ? "Great work. Test yourself with the quiz or continue to the next topic." : "Mark this topic as complete when you understand the notes."}</p>
            </div>
            <Button onClick={handleComplete} disabled={completed || saving} loading={saving}>
              {completed ? "Completed" : "Mark as complete"}
            </Button>
          </div>

          <div className="lesson-actions">
            {lesson.quiz && (
              <Link to={`/free-learning/${trackId}/quizzes/${lesson.quiz.id}`} className="btn btn-primary">
                <ClipboardCheck size={18} aria-hidden="true" /> Take the quiz ({lesson.quiz.questionsServed} questions)
              </Link>
            )}
            <Link to={`/free-learning/${trackId}/projects`} className="btn btn-outline">
              <FolderKanban size={18} aria-hidden="true" /> Practical projects
            </Link>
          </div>
        </section>

        <nav className="lesson-pagination" aria-label="Topic navigation">
          {lesson.previousTopic ? (
            <Link to={`/free-learning/${trackId}/lessons/${lesson.previousTopic.id}`} className="lesson-pagination-link">
              <ArrowLeft size={17} aria-hidden="true" />
              <span><small>PREVIOUS TOPIC</small><strong>{lesson.previousTopic.title}</strong></span>
            </Link>
          ) : <span />}
          {lesson.nextTopic && (
            <Link to={`/free-learning/${trackId}/lessons/${lesson.nextTopic.id}`} className="lesson-pagination-link next">
              <span><small>NEXT TOPIC</small><strong>{lesson.nextTopic.title}</strong></span>
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          )}
        </nav>
      </article>
    </div>
  );
}
