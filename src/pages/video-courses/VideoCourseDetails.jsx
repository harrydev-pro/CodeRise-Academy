import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Circle, Clock3, GraduationCap, PlayCircle, Lock } from "lucide-react";

import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { useAuth } from "../../hooks/useAuth";
import { useApiResource } from "../../hooks/useApiResource";
import { api } from "../../services/api/api";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDuration, formatLongDuration } from "../../utils/formatDuration";

export default function VideoCourseDetails() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const isStudent = user?.role === "student";
  const courseResource = useApiResource(`/catalog/video-courses/${encodeURIComponent(courseId)}`, "course", null);
  const accessResource = useApiResource(`/video/courses/${encodeURIComponent(courseId)}/access`, null, null, isStudent);
  const [enrolling, setEnrolling] = useState(false);
  const [message, setMessage] = useState("");
  const course = courseResource.data;

  if (courseResource.loading) return <div className="page-container"><Loader label="Loading course…" /></div>;
  if (courseResource.error && !/not found/i.test(courseResource.error)) return <div className="page-container"><ErrorMessage message={courseResource.error} onRetry={courseResource.reload} /></div>;
  if (!course) return <div className="page-container"><EmptyState title="Course not found" description="This course may be unavailable." actionLabel="Browse video courses" actionHref="/video-courses" /></div>;

  const lessons = Array.isArray(course.lessons) ? course.lessons : [];
  const objectives = Array.isArray(course.learningPoints) ? course.learningPoints : [];
  const access = accessResource.data?.access;
  const progress = accessResource.data?.progress;
  const completedIds = new Set((accessResource.data?.lessons || []).filter((row) => row.completed).map((row) => row.lessonId));
  const enrollment = access?.enrollment;
  const canWatch = Boolean(access?.canWatch);
  const continueId = accessResource.data?.lastLessonId || lessons.find((lesson) => !completedIds.has(lesson.id))?.id || lessons[0]?.id;
  const lessonPath = (id) => `/video-courses/${course.id}/lessons/${id}`;

  async function enroll() {
    setEnrolling(true);
    setMessage("");
    try {
      const result = await api.post(`/video/courses/${encodeURIComponent(course.id)}/enroll`, {});
      setMessage(result.message || "");
      accessResource.reload();
    } catch (error) {
      setMessage(error.message || "We couldn't complete that request.");
    } finally {
      setEnrolling(false);
    }
  }

  let action;
  if (!user) action = <Link to="/login" state={{ from: `/video-courses/${course.id}` }} className="btn btn-primary full-width">Sign in to start</Link>;
  else if (!isStudent) action = <p className="muted-text">Course access is for student accounts.</p>;
  else if (accessResource.loading) action = <Button fullWidth loading>Checking access…</Button>;
  else if (enrollment?.status === "active" || (course.isFree && enrollment)) action = <Link to={lessonPath(continueId)} className="btn btn-primary full-width">{progress?.completedLessons ? "Continue watching" : "Start course"} <ArrowRight size={17} aria-hidden="true" /></Link>;
  else if (enrollment?.status === "pending") action = <p className="alert alert-info">Your access request is awaiting approval. You will be notified.</p>;
  else if (enrollment?.status === "revoked") action = <p className="alert alert-info">Your access to this course was removed. Contact CodeRise Academy for help.</p>;
  else if (course.isFree) action = <Button fullWidth loading={enrolling} onClick={enroll}>Enroll for free</Button>;
  else action = <Button fullWidth loading={enrolling} onClick={enroll}>Request access</Button>;

  return (
    <div className="page-container course-details-page">
      <Link to="/video-courses" className="back-link"><ArrowLeft size={17} aria-hidden="true" /> All video courses</Link>

      <section className="course-details-hero">
        <div className="course-details-main">
          <span className="eyebrow">{course.category || "VIDEO COURSE"}</span>
          <h1>{course.title}</h1>
          {course.isDemo && <p className="demo-notice">Demo content: this course shows how video courses work. Real lessons will replace it.</p>}
          <p>{course.description}</p>
          <div className="course-details-meta">
            <span><GraduationCap size={17} aria-hidden="true" /> {course.instructor || "CodeRise Academy"}</span>
            <span><BookOpen size={17} aria-hidden="true" /> {lessons.length} lessons</span>
            {(course.duration || course.totalDurationSeconds > 0) && <span><Clock3 size={17} aria-hidden="true" /> {course.duration || formatLongDuration(course.totalDurationSeconds)}</span>}
          </div>
          {progress && enrollment && (
            <div className="progress-summary">
              <div className="progress-summary-heading"><span>Your progress</span><strong>{progress.percentage}%</strong></div>
              <div className="ui-progress" role="progressbar" aria-label="Course progress" aria-valuenow={progress.percentage} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress.percentage}%` }} /></div>
              <small>{progress.completedLessons} of {progress.totalLessons} lessons completed</small>
            </div>
          )}
        </div>

        <aside className="course-purchase-card">
          <div className="course-purchase-cover">{course.thumbnail ? <img src={course.thumbnail} alt="" /> : <PlayCircle size={50} aria-hidden="true" />}</div>
          <div className="course-purchase-content">
            <span className="eyebrow">{course.isFree ? "FREE COURSE" : "COURSE PRICE"}</span>
            <h2>{course.isFree ? "Free" : formatCurrency(course.price)}</h2>
            {!course.isFree && !enrollment && <p>Request access and the academy team will contact you about payment. Access is only granted after confirmation.</p>}
            {action}
            {message && <p className="muted-text" role="status">{message}</p>}
          </div>
        </aside>
      </section>

      <div className="course-details-content">
        <section className="course-description-section">
          <h2>About this course</h2>
          <p className="brief-text">{course.fullDescription || course.description}</p>

          {objectives.length > 0 && (
            <>
              <h2>What you'll learn</h2>
              <div className="learning-points-grid">
                {objectives.map((point) => <div className="learning-point" key={point}><CheckCircle2 size={19} aria-hidden="true" /><span>{point}</span></div>)}
              </div>
            </>
          )}

          {course.instructorBio && (
            <>
              <h2>Your instructor</h2>
              <p><strong>{course.instructor}</strong></p>
              <p className="brief-text">{course.instructorBio}</p>
            </>
          )}

          <h2>Curriculum</h2>
          {lessons.length === 0 ? <p>The lessons have not been added yet.</p> : (
            <ol className="topic-list">
              {lessons.map((lesson, index) => {
                const done = completedIds.has(lesson.id);
                const open = canWatch || lesson.isPreview;
                const content = (
                  <>
                    {done ? <CheckCircle2 size={22} aria-hidden="true" className="topic-status done" /> : open ? <Circle size={22} aria-hidden="true" className="topic-status" /> : <Lock size={20} aria-hidden="true" className="topic-status" />}
                    <span className="min-w-0">
                      <strong>{index + 1}. {lesson.title}</strong>
                      {lesson.description && <small>{lesson.description}</small>}
                    </span>
                    {lesson.isPreview && !canWatch && <span className="ui-pill blue">Preview</span>}
                    {lesson.durationSeconds > 0 && <span className="ui-pill">{formatDuration(lesson.durationSeconds)}</span>}
                  </>
                );
                return (
                  <li key={lesson.id}>
                    {open && user ? <Link to={lessonPath(lesson.id)} className={`topic-row ${done ? "done" : ""}`}>{content}</Link> : <div className="topic-row locked">{content}</div>}
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}
