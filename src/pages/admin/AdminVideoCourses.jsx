import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { Notice, PageHeader, TextField } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";
import { api } from "../../services/api/api";
import { formatCurrency } from "../../utils/formatCurrency";

export default function AdminVideoCourses() {
  const navigate = useNavigate();
  const { data: courses, loading, error, reload } = useApiResource("/admin/video-courses?includeArchived=true", "courses");
  const [title, setTitle] = useState("");
  const [notice, setNotice] = useState(null);
  async function create(event) {
    event.preventDefault();
    if (title.trim().length < 2) return setNotice({ tone: "error", text: "Enter a course title." });
    try {
      const course = await api.post("/admin/video-courses", { title: title.trim() }, "course");
      navigate(`/admin/video-courses/${course.id}`);
    } catch (createError) {
      setNotice({ tone: "error", text: createError.message });
    }
  }
  return (
    <section className="admin-page">
      <PageHeader eyebrow="VIDEO LEARNING" title="Video courses" description="Courses, lessons, prices, and enrollments." />
      <Notice tone={notice?.tone}>{notice?.text}</Notice>
      <form className="ui-toolbar ui-card" onSubmit={create}>
        <TextField label="New course title" value={title} onChange={setTitle} />
        <Button type="submit" className="ui-toolbar-fixed"><Plus size={17} aria-hidden="true" /> Create course</Button>
      </form>
      {loading ? <Loader label="Loading courses…" /> : error ? <ErrorMessage message={error} onRetry={reload} /> : (
        <ul className="ui-list">
          {courses.map((course) => (
            <li className="ui-list-item" key={course.id}>
              <div className="min-w-0">
                <h3><Link to={`/admin/video-courses/${course.id}`}>{course.title}</Link></h3>
                <p>{course.price ? formatCurrency(course.price) : "Free"} · {course.lessonCount} lessons · {course.enrollmentCount} enrolled{course.pendingRequests ? ` · ${course.pendingRequests} access requests` : ""}</p>
              </div>
              <div className="ui-actions">
                {course.isDemo && <span className="ui-pill amber">Demo</span>}
                {course.archived ? <span className="ui-pill">Archived</span> : course.published ? <span className="ui-pill green">Published</span> : <span className="ui-pill">Draft</span>}
                <Link to={`/admin/video-courses/${course.id}`} className="btn btn-outline btn-sm">Manage</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
