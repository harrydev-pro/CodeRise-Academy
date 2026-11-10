import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowDown, ArrowLeft, ArrowUp, Plus } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { CheckboxField, ImageField, ListField, Notice, PageHeader, StatusBadge, TableWrap, Tabs, TextArea, TextField } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";
import { api } from "../../services/api/api";
import { formatDate } from "../../utils/formatDate";
import { formatDuration } from "../../utils/formatDuration";

const parseDuration = (text) => {
  const value = String(text || "").trim();
  if (!value) return null;
  const parts = value.split(":").map((part) => Number(part));
  if (parts.some((part) => !Number.isInteger(part) || part < 0)) return undefined;
  return parts.reduce((total, part) => total * 60 + part, 0);
};

function CourseForm({ course, onSaved, setNotice }) {
  const [form, setForm] = useState({
    title: course.title, description: course.description, overview: course.overview, category: course.category, level: course.level,
    duration: course.duration, price: course.price, thumbnail: course.thumbnail, instructorName: course.instructorName,
    instructorBio: course.instructorBio, learningObjectives: course.learningObjectives || [], isDemo: course.isDemo,
    published: course.published, archived: course.archived,
  });
  const [saving, setSaving] = useState(false);
  const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
  async function save(event) {
    event.preventDefault();
    const price = Number(form.price);
    if (!Number.isInteger(price) || price < 0) return setNotice({ tone: "error", text: "Enter the price in naira as a whole number (0 for free)." });
    setSaving(true);
    try {
      await api.patch(`/admin/video-courses/${course.id}`, { ...form, price });
      setNotice({ tone: "info", text: "Course saved." });
      onSaved();
    } catch (error) {
      setNotice({ tone: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }
  return (
    <form className="ui-form" onSubmit={save} noValidate>
      <div className="ui-card ui-form">
        <TextField label="Title" value={form.title} onChange={set("title")} required />
        <TextArea label="Short description" rows={2} value={form.description} onChange={set("description")} />
        <TextArea label="Course overview" rows={4} value={form.overview} onChange={set("overview")} />
        <div className="ui-form-grid">
          <TextField label="Category" value={form.category} onChange={set("category")} placeholder="Frontend Development" />
          <TextField label="Level" value={form.level} onChange={set("level")} />
          <TextField label="Duration label" value={form.duration} onChange={set("duration")} hint="Optional; otherwise the lesson lengths are added up." />
          <TextField label="Price (₦, 0 = free)" type="number" inputMode="numeric" min="0" value={form.price} onChange={set("price")} />
        </div>
        <ListField label="Learning objectives" value={form.learningObjectives} onChange={set("learningObjectives")} />
        <div className="ui-form-grid">
          <TextField label="Instructor name" value={form.instructorName} onChange={set("instructorName")} />
          <TextArea label="Instructor bio" rows={2} value={form.instructorBio} onChange={set("instructorBio")} />
        </div>
        <ImageField label="Thumbnail" value={form.thumbnail} onChange={set("thumbnail")} />
        <CheckboxField label="Demo content" hint="Shows a clear “Demo content” label to students." checked={form.isDemo} onChange={set("isDemo")} />
        <CheckboxField label="Published" checked={form.published} onChange={set("published")} />
        {course.archived && <CheckboxField label="Archived" hint="Untick to restore." checked={form.archived} onChange={set("archived")} />}
        <div className="ui-form-actions"><Button type="submit" loading={saving}>Save course</Button></div>
      </div>
    </form>
  );
}

function LessonForm({ lesson, onSave, onCancel }) {
  const [form, setForm] = useState({
    title: lesson?.title || "", description: lesson?.description || "", videoUrl: lesson?.videoUrl || "",
    duration: lesson?.durationSeconds ? formatDuration(lesson.durationSeconds) : "", notes: lesson?.notes || "",
    isPreview: lesson?.isPreview ?? false, published: lesson?.published ?? true,
  });
  const [error, setError] = useState("");
  const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
  return (
    <form className="ui-form question-form" onSubmit={(event) => {
      event.preventDefault();
      const durationSeconds = parseDuration(form.duration);
      if (form.title.trim().length < 2) return setError("Enter a lesson title.");
      if (durationSeconds === undefined) return setError("Write the length as minutes:seconds, for example 12:30.");
      if (form.videoUrl && !/^https:\/\//i.test(form.videoUrl.trim())) return setError("The video link must start with https://");
      setError("");
      onSave({ title: form.title.trim(), description: form.description.trim(), videoUrl: form.videoUrl.trim(), durationSeconds, notes: form.notes, isPreview: form.isPreview, published: form.published });
    }} noValidate>
      <TextField label="Lesson title" value={form.title} onChange={set("title")} />
      <TextField label="Video link" type="url" value={form.videoUrl} onChange={set("videoUrl")} placeholder="https://www.youtube.com/watch?v=… or https://…/video.mp4"
        hint="YouTube (unlisted is fine), Vimeo, or a direct .mp4 link. Leave empty until the video is ready." />
      <div className="ui-form-grid">
        <TextField label="Length (mm:ss)" value={form.duration} onChange={set("duration")} placeholder="12:30" />
      </div>
      <TextArea label="Description" rows={2} value={form.description} onChange={set("description")} />
      <TextArea label="Lesson notes" rows={3} value={form.notes} onChange={set("notes")} />
      <CheckboxField label="Free preview" hint="Anyone can watch this lesson before enrolling." checked={form.isPreview} onChange={set("isPreview")} />
      <CheckboxField label="Published" checked={form.published} onChange={set("published")} />
      {error && <p className="field-error">{error}</p>}
      <div className="ui-form-actions"><Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button><Button type="submit">Save lesson</Button></div>
    </form>
  );
}

function Enrollments({ course }) {
  const { data: enrollments, loading, error, reload } = useApiResource(`/admin/video-courses/${course.id}/enrollments`, "enrollments");
  const [email, setEmail] = useState("");
  const [notice, setNotice] = useState(null);
  async function act(action, message) {
    setNotice(null);
    try {
      await action();
      setNotice({ tone: "info", text: message });
      reload();
    } catch (actionError) {
      setNotice({ tone: "error", text: actionError.message });
    }
  }
  return (
    <section className="ui-card">
      <h2>Enrollments</h2>
      <Notice tone={notice?.tone}>{notice?.text}</Notice>
      <form className="ui-toolbar" onSubmit={(event) => { event.preventDefault(); if (email.trim()) act(() => api.post(`/admin/video-courses/${course.id}/enrollments`, { email: email.trim() }), "Access granted.").then(() => setEmail("")); }}>
        <TextField label="Grant access by student email" type="email" value={email} onChange={setEmail} hint="For example after confirming a bank transfer." />
        <Button type="submit" variant="outline" className="ui-toolbar-fixed">Grant access</Button>
      </form>
      {loading ? <Loader label="Loading enrollments…" /> : error ? <ErrorMessage message={error} onRetry={reload} /> : enrollments.length === 0 ? <p className="muted-text">No enrollments yet.</p> : (
        <TableWrap>
          <table className="ui-table">
            <thead><tr><th>Student</th><th>Status</th><th>Source</th><th>Enrolled</th><th>Progress</th><th>Actions</th></tr></thead>
            <tbody>
              {enrollments.map((row) => (
                <tr key={row.id}>
                  <td><Link to={`/admin/users/${row.student.id}`}>{row.student.name}</Link><div className="muted-text">{row.student.email}</div></td>
                  <td><StatusBadge status={row.status} /></td>
                  <td>{row.source}</td>
                  <td>{formatDate(row.enrolledAt)}</td>
                  <td>{row.completedLessons}/{row.totalLessons} ({row.percentage}%)</td>
                  <td>
                    <div className="ui-actions">
                      {row.status !== "active" && <button type="button" className="btn btn-outline btn-sm" onClick={() => act(() => api.patch(`/admin/enrollments/${row.id}`, { status: "active" }), "Access approved.")}>Approve</button>}
                      {row.status !== "revoked" && <button type="button" className="btn btn-ghost btn-sm btn-danger-text" onClick={() => window.confirm(`Remove ${row.student.name}'s access?`) && act(() => api.patch(`/admin/enrollments/${row.id}`, { status: "revoked" }), "Access removed.")}>Revoke</button>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </section>
  );
}

export default function AdminVideoCourseEditor() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { data: course, loading, error, reload } = useApiResource(`/admin/video-courses/${encodeURIComponent(courseId)}`, "course", null);
  const [tab, setTab] = useState("details");
  const [editing, setEditing] = useState(null);
  const [notice, setNotice] = useState(null);

  if (loading) return <section className="admin-page"><Loader label="Loading course…" /></section>;
  if (error) return <section className="admin-page"><ErrorMessage message={error} onRetry={reload} /></section>;
  const lessons = course.lessons;

  async function run(action, message) {
    setNotice(null);
    try {
      const result = await action();
      if (message) setNotice({ tone: "info", text: typeof message === "function" ? message(result) : message });
      setEditing(null);
      reload();
    } catch (actionError) {
      setNotice({ tone: "error", text: actionError.message });
    }
  }
  const move = (index, delta) => {
    const ids = lessons.map((lesson) => lesson.id);
    [ids[index], ids[index + delta]] = [ids[index + delta], ids[index]];
    run(() => api.put(`/admin/video-courses/${course.id}/lessons/order`, { ids }));
  };

  return (
    <section className="admin-page">
      <Link to="/admin/video-courses" className="back-link"><ArrowLeft size={17} aria-hidden="true" /> All video courses</Link>
      <PageHeader eyebrow="VIDEO COURSE" title={course.title} actions={<Button variant="ghost" className="btn-danger-text" onClick={async () => {
        if (!window.confirm(`Remove "${course.title}"? Courses with enrollments are archived instead.`)) return;
        try { const result = await api.delete(`/admin/video-courses/${course.id}`); if (result.deleted) navigate("/admin/video-courses"); else { setNotice({ tone: "info", text: result.message }); reload(); } } catch (deleteError) { setNotice({ tone: "error", text: deleteError.message }); }
      }}>Delete course</Button>} />
      <Notice tone={notice?.tone}>{notice?.text}</Notice>
      <Tabs value={tab} onChange={setTab} tabs={[{ value: "details", label: "Details" }, { value: "lessons", label: "Lessons", count: lessons.length }, { value: "enrollments", label: "Enrollments", count: course.enrollmentCount }]} />

      {tab === "details" && <CourseForm key={course.updatedAt} course={course} onSaved={reload} setNotice={setNotice} />}
      {tab === "lessons" && (
        <section className="ui-card">
          <div className="ui-card-header"><h2>Lessons</h2>{editing !== "new" && <Button variant="outline" onClick={() => setEditing("new")}><Plus size={16} aria-hidden="true" /> Add lesson</Button>}</div>
          {editing === "new" && <LessonForm onCancel={() => setEditing(null)} onSave={(body) => run(() => api.post(`/admin/video-courses/${course.id}/lessons`, body), "Lesson added.")} />}
          <ol className="ui-list">
            {lessons.map((lesson, index) => (
              <li key={lesson.id} className="note-item">
                {editing === lesson.id ? (
                  <LessonForm lesson={lesson} onCancel={() => setEditing(null)} onSave={(body) => run(() => api.patch(`/admin/video-lessons/${lesson.id}`, body), "Lesson saved.")} />
                ) : (
                  <div className="ui-list-item">
                    <div className="min-w-0"><h4>{index + 1}. {lesson.title}</h4><p>{lesson.videoUrl ? "Video linked" : "No video yet"}{lesson.durationSeconds ? ` · ${formatDuration(lesson.durationSeconds)}` : ""} · {lesson.viewers} viewers</p></div>
                    <div className="ui-actions">
                      {lesson.isPreview && <span className="ui-pill blue">Preview</span>}
                      {lesson.archived ? <span className="ui-pill">Archived</span> : !lesson.published && <span className="ui-pill amber">Hidden</span>}
                      <button type="button" className="btn btn-ghost btn-sm" aria-label="Move up" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={16} aria-hidden="true" /></button>
                      <button type="button" className="btn btn-ghost btn-sm" aria-label="Move down" disabled={index === lessons.length - 1} onClick={() => move(index, 1)}><ArrowDown size={16} aria-hidden="true" /></button>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(lesson.id)}>Edit</button>
                      <button type="button" className="btn btn-ghost btn-sm btn-danger-text" onClick={() => window.confirm(`Remove "${lesson.title}"?`) && run(() => api.delete(`/admin/video-lessons/${lesson.id}`), (result) => result.message || "Lesson deleted.")}>Delete</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ol>
          {lessons.length === 0 && editing !== "new" && <p className="muted-text">No lessons yet.</p>}
        </section>
      )}
      {tab === "enrollments" && <Enrollments course={course} />}
    </section>
  );
}
