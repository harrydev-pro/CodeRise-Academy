import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  PlayCircle,
} from "lucide-react";

import { getVideoCourseById } from "../../features/video-courses/videoCourseService";
import { formatCurrency } from "../../utils/formatCurrency";
import { useAuth } from "../../hooks/useAuth";
import EmptyState from "../../components/common/EmptyState";

export default function VideoCourseDetails() {
  const { courseId } = useParams();
  const { user } = useAuth();

  const course = getVideoCourseById(courseId);

  if (!course || course.published === false) {
    return (
      <main className="page-container">
        <EmptyState
          title="Course not found"
          description="This course may be unavailable or no longer published."
          action={
            <Link to="/video-courses" className="btn btn-primary">
              Browse video courses
            </Link>
          }
        />
      </main>
    );
  }

  const lessons = Array.isArray(course.lessons)
    ? course.lessons
    : [];

  const learningPoints = Array.isArray(course.learningPoints)
    ? course.learningPoints
    : [];

  const price = Number(course.price) || 0;

  return (
    <main className="page-container course-details-page">
      <Link to="/video-courses" className="back-link">
        <ArrowLeft size={17} />
        All video courses
      </Link>

      <section className="course-details-hero">
        <div className="course-details-main">
          <span className="eyebrow">
            {course.category || course.track || "VIDEO COURSE"}
          </span>

          <h1>{course.title}</h1>

          <p>
            {course.description ||
              "Develop practical skills through a structured course."}
          </p>

          <div className="course-details-meta">
            <span>
              <GraduationCap size={17} />
              {course.instructor || "CodeRise Academy"}
            </span>

            <span>
              <BookOpen size={17} />
              {lessons.length} lessons
            </span>

            {course.duration && (
              <span>
                <Clock3 size={17} />
                {course.duration}
              </span>
            )}
          </div>
        </div>

        <aside className="course-purchase-card">
          <div className="course-purchase-cover">
            {course.thumbnail ? (
              <img src={course.thumbnail} alt="" />
            ) : (
              <PlayCircle size={50} />
            )}
          </div>

          <div className="course-purchase-content">
            <span className="eyebrow">COURSE PRICE</span>

            <h2>{price === 0 ? "Free" : formatCurrency(price)}</h2>

            <p>
              {price === 0
                ? "This course is free to access."
                : "One-time demo purchase. No real payment will be taken."}
            </p>

            <Link
              to={
                price === 0
                  ? user && lessons[0]
                    ? `/video-courses/${course.id}/lessons/${lessons[0].id}`
                    : user
                      ? `/video-courses/${course.id}`
                      : "/login"
                  : `/checkout/${course.id}`
              }
              state={{
                from: lessons[0]
                  ? `/video-courses/${course.id}/lessons/${lessons[0].id}`
                  : `/video-courses/${course.id}`,
              }}
              className="btn btn-primary full-width"
            >
              {price === 0 ? "Start course" : "Purchase course"}
              <ArrowRight size={17} />
            </Link>

            <small>
              {price === 0
                ? "Sign in to start learning."
                : "Secure payment processing is not connected in this demo."}
            </small>
          </div>
        </aside>
      </section>

      <div className="course-details-content">
        <section className="course-description-section">
          <h2>About this course</h2>

          <p>
            {course.fullDescription ||
              course.description ||
              "This course introduces the key concepts and practical skills covered in its curriculum."}
          </p>

          <h2>What you'll learn</h2>

          {learningPoints.length > 0 ? (
            <div className="learning-points-grid">
              {learningPoints.map((point, index) => (
                <div className="learning-point" key={index}>
                  <CheckCircle2 size={19} />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          ) : (
            <p>
              Explore the curriculum below to understand the topics covered.
            </p>
          )}

          <h2>Course curriculum</h2>

          {lessons.length > 0 ? (
            <div className="curriculum-list">
              {lessons.map((lesson, index) => (
                <div className="curriculum-item" key={lesson.id || index}>
                  <div className="curriculum-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <div>
                    <h3>{lesson.title || `Lesson ${index + 1}`}</h3>

                    {lesson.description && (
                      <p>{lesson.description}</p>
                    )}
                  </div>

                  <PlayCircle size={19} />
                </div>
              ))}
            </div>
          ) : (
            <p>
              The curriculum has not been added yet. Check back when the
              instructor publishes the lessons.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}