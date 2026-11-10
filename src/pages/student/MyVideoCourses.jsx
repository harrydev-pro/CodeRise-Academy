import { Link } from "react-router-dom";
import { PlayCircle, Video } from "lucide-react";

import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { PageHeader, StatusBadge } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";

export default function MyVideoCourses() {
  const { data: courses, loading, error, reload } = useApiResource("/video/my-courses", "courses");
  if (loading) return <div className="student-page"><Loader label="Loading your video courses…" /></div>;
  if (error) return <div className="student-page"><ErrorMessage message={error} onRetry={reload} /></div>;

  return (
    <div className="student-page">
      <PageHeader eyebrow="VIDEO LEARNING" title="My Video Courses" description="Courses you are enrolled in and your progress." />
      {courses.length === 0 ? (
        <EmptyState icon={Video} title="No video courses yet" description="Enroll in a video course to see it here." actionLabel="Browse video courses" actionHref="/video-courses" />
      ) : (
        <div className="ui-grid ui-grid-cards">
          {courses.map(({ course, enrollment, progress, continueLessonId }) => (
            <article className="ui-card my-video-card" key={course.id}>
              <div className="my-video-cover">{course.thumbnail ? <img src={course.thumbnail} alt="" loading="lazy" /> : <PlayCircle size={40} aria-hidden="true" />}</div>
              <div className="ui-actions">{course.isDemo && <span className="ui-pill amber">Demo</span>}{enrollment.status === "pending" && <StatusBadge status="Pending" />}</div>
              <h2>{course.title}</h2>
              <div className="ui-progress" role="progressbar" aria-label={`${course.title} progress`} aria-valuenow={progress.percentage} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${progress.percentage}%` }} /></div>
              <p className="muted-text">{progress.completedLessons} completed · {progress.remainingLessons} remaining · {progress.percentage}%</p>
              {enrollment.status === "active" && continueLessonId ? (
                <Link to={`/video-courses/${course.id}/lessons/${continueLessonId}`} className="btn btn-primary">{progress.completedLessons ? "Continue watching" : "Start watching"}</Link>
              ) : enrollment.status === "pending" ? (
                <p className="muted-text">Awaiting approval from the academy team.</p>
              ) : (
                <Link to={`/video-courses/${course.id}`} className="btn btn-outline">View course</Link>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
