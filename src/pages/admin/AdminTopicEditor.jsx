import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowDown, ArrowLeft, ArrowUp, Eye, ImagePlus, Pencil, Plus } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import NoteContent from "../../components/common/NoteContent";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { CheckboxField, ListField, Notice, PageHeader, SelectField, TextArea, TextField } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";
import { api, uploadFile } from "../../services/api/api";
import { QuestionBank, QuizSettings } from "./AdminQuizEditor";

function TopicForm({ topic, levels, onSaved, setNotice }) {
  const [form, setForm] = useState({
    title: topic.title, description: topic.description, levelId: topic.levelId || "", duration: topic.duration,
    objectives: topic.objectives || [], keyTakeaways: topic.keyTakeaways || [], published: topic.published, archived: topic.archived,
  });
  const [saving, setSaving] = useState(false);
  const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/admin/topics/${topic.id}`, { ...form, title: form.title.trim(), description: form.description.trim(), duration: form.duration.trim(), levelId: form.levelId || null });
      setNotice({ tone: "info", text: "Topic saved." });
      onSaved();
    } catch (error) {
      setNotice({ tone: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }
  return (
    <form className="ui-card ui-form" onSubmit={save} noValidate>
      <h2>Topic details</h2>
      <TextField label="Title" value={form.title} onChange={set("title")} required />
      <TextArea label="Short description" rows={2} value={form.description} onChange={set("description")} />
      <div className="ui-form-grid">
        <SelectField label="Level" value={form.levelId} onChange={set("levelId")} options={[{ value: "", label: "No level" }, ...levels.map((level) => ({ value: level.id, label: level.title }))]} />
        <TextField label="Reading time" value={form.duration} onChange={set("duration")} placeholder="For example: 15 min" />
      </div>
      <div className="ui-form-grid">
        <ListField label="Learning objectives" value={form.objectives} onChange={set("objectives")} />
        <ListField label="Key takeaways" value={form.keyTakeaways} onChange={set("keyTakeaways")} />
      </div>
      <CheckboxField label="Published" hint="Students only see published topics in published tracks." checked={form.published} onChange={set("published")} />
      {topic.archived && <CheckboxField label="Archived" hint="Untick to restore this topic." checked={form.archived} onChange={set("archived")} />}
      <div className="ui-form-actions"><Button type="submit" loading={saving}>Save topic</Button></div>
    </form>
  );
}

function NoteEditor({ note, topicId, onDone, onCancel }) {
  const [form, setForm] = useState({ title: note?.title || "", body: note?.body || "", published: note?.published ?? true });
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  async function insertImage(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const uploaded = await uploadFile(file, "image");
      setForm((current) => ({ ...current, body: `${current.body}${current.body.endsWith("\n") || !current.body ? "" : "\n\n"}![Illustration](${uploaded.url})\n` }));
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
    }
  }
  async function save(event) {
    event.preventDefault();
    if (!form.body.trim()) return setError("Write the note content.");
    setSaving(true);
    setError("");
    try {
      if (note) await api.patch(`/admin/notes/${note.id}`, form);
      else await api.post(`/admin/topics/${topicId}/notes`, form);
      onDone();
    } catch (saveError) {
      setError(saveError.message);
      setSaving(false);
    }
  }
  return (
    <form className="ui-form note-editor" onSubmit={save} noValidate>
      <TextField label="Section title" value={form.title} onChange={(title) => setForm((f) => ({ ...f, title }))} placeholder="For example: What is HTML?" />
      <div className="ui-actions">
        <button type="button" className={`btn btn-sm ${preview ? "btn-ghost" : "btn-outline"}`} onClick={() => setPreview(false)}><Pencil size={15} aria-hidden="true" /> Write</button>
        <button type="button" className={`btn btn-sm ${preview ? "btn-outline" : "btn-ghost"}`} onClick={() => setPreview(true)}><Eye size={15} aria-hidden="true" /> Preview</button>
        <label className="btn btn-ghost btn-sm"><ImagePlus size={15} aria-hidden="true" /> {uploading ? "Uploading…" : "Insert image"}<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={insertImage} disabled={uploading} /></label>
      </div>
      {preview ? <div className="lesson-content note-preview">{form.body ? <NoteContent body={form.body} /> : <p className="muted-text">Nothing to preview yet.</p>}</div> : (
        <TextArea label="Content" rows={12} value={form.body} onChange={(body) => setForm((f) => ({ ...f, body }))}
          hint="Formatting: # Heading, **bold**, `code`, - bullet list, 1. numbered list, ``` for code blocks, [link](https://...)." />
      )}
      <CheckboxField label="Published" checked={form.published} onChange={(published) => setForm((f) => ({ ...f, published }))} />
      {error && <p className="field-error">{error}</p>}
      <div className="ui-form-actions"><Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button><Button type="submit" loading={saving}>Save note</Button></div>
    </form>
  );
}

export default function AdminTopicEditor() {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const topicResource = useApiResource(`/admin/topics/${encodeURIComponent(topicId)}`, "topic", null);
  const topic = topicResource.data;
  const trackResource = useApiResource(topic ? `/admin/tracks/${encodeURIComponent(topic.trackId)}` : null, "track", null);
  const [notice, setNotice] = useState(null);
  const [editingNote, setEditingNote] = useState(null);

  if (topicResource.loading) return <section className="admin-page"><Loader label="Loading topic…" /></section>;
  if (topicResource.error) return <section className="admin-page"><ErrorMessage message={topicResource.error} onRetry={topicResource.reload} /></section>;
  const notes = topic.notes;
  const levels = trackResource.data?.levels || [];

  async function moveNote(index, delta) {
    const ids = notes.map((note) => note.id);
    [ids[index], ids[index + delta]] = [ids[index + delta], ids[index]];
    try {
      await api.put(`/admin/topics/${topic.id}/notes/order`, { ids });
      topicResource.reload();
    } catch (error) {
      setNotice({ tone: "error", text: error.message });
    }
  }

  return (
    <section className="admin-page">
      <Link to={`/admin/learning/${topic.trackId}`} className="back-link"><ArrowLeft size={17} aria-hidden="true" /> {topic.track?.title || "Back to track"}</Link>
      <PageHeader eyebrow={topic.level?.title || "TOPIC"} title={topic.title} description={`${topic.completions} students have completed this topic.`}
        actions={<Button variant="ghost" className="btn-danger-text" onClick={async () => {
          if (!window.confirm(`Remove "${topic.title}"? If students have completed it or taken its quiz, it is archived and their records are kept.`)) return;
          try {
            const result = await api.delete(`/admin/topics/${topic.id}`);
            if (result.deleted) navigate(`/admin/learning/${topic.trackId}`);
            else { setNotice({ tone: "info", text: result.message }); topicResource.reload(); }
          } catch (error) { setNotice({ tone: "error", text: error.message }); }
        }}>Delete topic</Button>} />
      <Notice tone={notice?.tone}>{notice?.text}</Notice>

      <div className="ui-grid admin-topic-layout">
        <TopicForm key={topic.updatedAt} topic={topic} levels={levels} onSaved={topicResource.reload} setNotice={setNotice} />

        <section className="ui-card">
          <div className="ui-card-header">
            <h2>Learning notes ({notes.length})</h2>
            {editingNote !== "new" && <Button variant="outline" onClick={() => setEditingNote("new")}><Plus size={16} aria-hidden="true" /> Add note</Button>}
          </div>
          {editingNote === "new" && <NoteEditor topicId={topic.id} onDone={() => { setEditingNote(null); topicResource.reload(); }} onCancel={() => setEditingNote(null)} />}
          {notes.length === 0 && editingNote !== "new" && <p className="muted-text">No notes yet. Notes are what students read on the topic page.</p>}
          <ul className="ui-list">
            {notes.map((note, index) => (
              <li key={note.id} className="note-item">
                {editingNote === note.id ? (
                  <NoteEditor note={note} topicId={topic.id} onDone={() => { setEditingNote(null); topicResource.reload(); }} onCancel={() => setEditingNote(null)} />
                ) : (
                  <div className="ui-list-item">
                    <div className="min-w-0"><h4>{note.title || `Section ${index + 1}`}</h4><p>{note.body.slice(0, 120)}{note.body.length > 120 ? "…" : ""}</p></div>
                    <div className="ui-actions">
                      {!note.published && <span className="ui-pill amber">Hidden</span>}
                      <button type="button" className="btn btn-ghost btn-sm" aria-label="Move note up" disabled={index === 0} onClick={() => moveNote(index, -1)}><ArrowUp size={16} aria-hidden="true" /></button>
                      <button type="button" className="btn btn-ghost btn-sm" aria-label="Move note down" disabled={index === notes.length - 1} onClick={() => moveNote(index, 1)}><ArrowDown size={16} aria-hidden="true" /></button>
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditingNote(note.id)}>Edit</button>
                      <button type="button" className="btn btn-ghost btn-sm btn-danger-text" onClick={async () => {
                        if (!window.confirm("Delete this note?")) return;
                        try { await api.delete(`/admin/notes/${note.id}`); topicResource.reload(); } catch (error) { setNotice({ tone: "error", text: error.message }); }
                      }}>Delete</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>

        <QuizSettings key={topic.quiz?.id || "new-quiz"} topic={topic} quiz={topic.quiz} onSaved={topicResource.reload} />
        {topic.quiz && <QuestionBank quiz={topic.quiz} onChanged={topicResource.reload} />}
      </div>
    </section>
  );
}
