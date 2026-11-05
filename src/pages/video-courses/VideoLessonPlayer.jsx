import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, CirclePlay, ExternalLink, PlayCircle } from "lucide-react";

import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { useApiResource } from "../../hooks/useApiResource";
import { api } from "../../services/api/api";
import { formatDuration } from "../../utils/formatDuration";
import { videoSource } from "../../utils/videoSource";

const SAVE_EVERY_SECONDS = 15;

export default function VideoLessonPlayer() {
  const { courseId, lessonId } = useParams();
  const courseResource = useApiResource(`/catalog/video-courses/${encodeURIComponent(courseId)}`, "course", null);
  const accessResource = useApiResource(`/video/courses/${encodeURIComponent(courseId)}/access`, null, null);
  const lessonResource = useApiResource(`/video/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}`, "lesson", null);
  const [completedNow, setCompletedNow] = useState(() => new Set());
  const [saveError, setSaveError] = useState("");
  const [marking, setMarking] = useState(false);
  const videoRef = useRef(null);
  const lastSaved = useRef(0);

  const lesson = lessonResource.data;
  const course = courseResource.data;

  async function saveProgress({ completed = false } = {}) {
    const video = videoRef.current;
    const body = {
      positionSeconds: video ? Math.floor(video.currentTime || 0) : 0,
      durationSeconds: video && Number.isFinite(video.duration) ? Math.floor(video.duration) : null,
      ...(completed ? { completed: true } : {}),
    };
    try {
      const saved = await api.put(`/video/lessons/${encodeURIComponent(lessonId)}/progress`, body, "progress");
      if (saved.completed) setCompletedNow((previous) => new Set(previous).add(lessonId));
      setSaveError("");
    } catch (error) {
      setSaveError(error.message || "Your progress could not be saved.");
    }
  }

  // Save the position when leaving the page or switching lessons.
  const saveRef = useRef(saveProgress);
  useEffect(() => {
    saveRef.current = saveProgress;
  });
  useEffect(() => () => {
    if (videoRef.current && videoRef.current.currentTime > 0) saveRef.current();
  }, [lessonId]);

  if (courseResource.loading || lessonResource.loading || accessResource.loading) return <div className="page-container"><Loader label="Loading lesson…" /></div>;
  if (lessonResource.error && /enroll/i.test(lessonResource.error)) {
    return <div className="page-container"><EmptyState title="Enroll to watch this lesson" description={lessonResource.error} actionLabel="Back to the course" actionHref={`/video-courses/${courseId}`} /></div>;
  }
  if (lessonResource.error && !/not found/i.test(lessonResource.error)) return <div className="page-container"><ErrorMessage message={lessonResource.error} onRetry={lessonResource.reload} /></div>;
  if (!course || !lesson) return <div className="page-container"><EmptyState title="Lesson not found" description="This lesson is unavailable." actionLabel="Browse courses" actionHref="/video-courses" /></div>;

  const lessons = Array.isArray(course.lessons) ? course.lessons : [];
  const savedRows = accessResource.data?.lessons || [];
  const completedIds = new Set([...savedRows.filter((row) => row.completed).map((row) => row.lessonId), ...completedNow]);
  const isComplete = completedIds.has(lesson.id);
  const percentage = lessons.length ? Math.round((lessons.filter((item) => completedIds.has(item.id)).length / lessons.length) * 100) : 0;
  const source = videoSource(lesson.videoUrl);
  const resumeAt = lesson.progress && !lesson.progress.completed ? lesson.progress.positionSeconds : 0;

  async function markComplete() {
    setMarking(true);
    await saveProgress({ completed: true });
    setMarking(false);
  }

  return (
    <div className="page-container video-player-page">
      <Link to={`/video-courses/${courseId}`} className="back-link"><ArrowLeft size={17} aria-hidden="true" /> Back to course details</Link>

      <div className="video-player-layout">
        <section className="video-player-main">
          <div className="video-player-screen">
            {source.kind === "file" && (
              <video
                key={lesson.id}
                ref={videoRef}
                src={source.src}
                controls
                playsInline
                preload="metadata"
                className="video-player-element"
                onLoadedMetadata={(event) => {
                  if (resumeAt > 5 && resumeAt < event.currentTarget.duration - 5) event.currentTarget.currentTime = resumeAt;
                }}
                onTimeUpdate={(event) => {
                  const position = event.currentTarget.currentTime;
                  if (Math.abs(position - lastSaved.current) >= SAVE_EVERY_SECONDS) {
                    lastSaved.current = position;
                    saveProgress();
                  }
                }}
                onPause={() => saveProgress()}
                onEnded={() => saveProgress({ completed: true })}
              >
                Your browser does not support video playback.
              </video>
            )}
            {source.kind === "embed" && (
              <iframe
                key={lesson.id}
                src={source.src}
                title={lesson.title}
                className="video-player-element"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            )}
            {(source.kind === "none" || source.kind === "link") && (
              <div className="video-player-placeholder">
                <PlayCircle size={56} aria-hidden="true" />
                <h2>{course.isDemo ? "Demo lesson" : "Video not available yet"}</h2>
                <p>{course.isDemo ? "This is demonstration content: the video for this lesson has not been uploaded yet. You can still try the progress tracking below." : "This lesson does not have a playable video yet."}</p>
                {source.kind === "link" && <a href={source.src} target="_blank" rel="noopener noreferrer" className="btn btn-outline"><ExternalLink size={16} aria-hidden="true" /> Open the video</a>}
              </div>
            )}
          </div>

          <div className="video-player-lesson-details">
            <span className="eyebrow">{course.title}</span>
            {course.isDemo && <span className="demo-badge demo-badge-inline">Demo content</span>}
            <h1>{lesson.title}</h1>
            {lesson.description && <p>{lesson.description}</p>}
            {resumeAt > 5 && source.kind === "file" && <p className="muted-text">Resuming from {formatDuration(resumeAt)}.</p>}

            <div className="video-lesson-actions">
              {isComplete ? (
                <span className="ui-pill green"><CheckCircle2 size={14} aria-hidden="true" /> Lesson completed</span>
              ) : (
                <Button variant="outline" onClick={markComplete} loading={marking}>Mark as complete</Button>
              )}
              {saveError && <p className="field-error">{saveError}</p>}
            </div>

            <nav className="lesson-pagination" aria-label="Lesson navigation">
              {lesson.previousLessonId ? (
                <Link to={`/video-courses/${courseId}/lessons/${lesson.previousLessonId}`} className="lesson-pagination-link"><ArrowLeft size={17} aria-hidden="true" /><span><small>PREVIOUS</small><strong>{lessons.find((item) => item.id === lesson.previousLessonId)?.title}</strong></span></Link>
              ) : <span />}
              {lesson.nextLessonId && (
                <Link to={`/video-courses/${courseId}/lessons/${lesson.nextLessonId}`} className="lesson-pagination-link next"><span><small>NEXT</small><strong>{lessons.find((item) => item.id === lesson.nextLessonId)?.title}</strong></span><ArrowRight size={17} aria-hidden="true" /></Link>
              )}
            </nav>

            {lesson.notes && (
              <div className="video-lesson-notes">
                <h2>Lesson notes</h2>
                <p className="brief-text">{lesson.notes}</p>
              </div>
            )}
          </div>
        </section>

        <aside className="video-playlist">
          <div className="video-playlist-heading">
            <h2>Course content</h2>
            <span>{percentage}% complete</span>
          </div>
          <div className="ui-progress" aria-hidden="true"><span style={{ width: `${percentage}%` }} /></div>
          {lessons.map((item, index) => {
            const active = item.id === lesson.id;
            return (
              <Link key={item.id} to={`/video-courses/${courseId}/lessons/${item.id}`} className={`video-playlist-item ${active ? "active" : ""}`} aria-current={active ? "page" : undefined}>
                <div className="video-playlist-icon">
                  {completedIds.has(item.id) ? <CheckCircle2 size={18} aria-hidden="true" /> : active ? <CirclePlay size={19} aria-hidden="true" /> : <PlayCircle size={17} aria-hidden="true" />}
                </div>
                <div className="min-w-0">
                  <strong>{item.title}</strong>
                  <span>{formatDuration(item.durationSeconds) || `Lesson ${index + 1}`}</span>
                </div>
              </Link>
            );
          })}
        </aside>
      </div>
    </div>
  );
}
