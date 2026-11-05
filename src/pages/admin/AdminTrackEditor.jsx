import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowDown, ArrowLeft, ArrowUp, FolderKanban, Plus, Trash2 } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { CheckboxField, ImageField, Notice, PageHeader, SelectField, TextArea, TextField } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";
import { api } from "../../services/api/api";

const ICONS = [{ value: "BookOpen", label: "Book" }, { value: "Code2", label: "Code" }, { value: "Server", label: "Server" }, { value: "Palette", label: "Design" }];

function TrackForm({ track, onSaved, setNotice }) {
  const [form, setForm] = useState({ title: track.title, description: track.description, icon: track.icon || "BookOpen", imageUrl: track.imageUrl || "", published: track.published, archived: track.archived });
  const [saving, setSaving] = useState(false);
  const set = (key) => (value) => setForm((current) => ({ ...current, [key]: value }));
  async function save(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await api.patch(`/admin/tracks/${track.id}`, { ...form, title: form.title.trim(), description: form.description.trim() });
      setNotice({ tone: "info", text: "Track saved." });
      onSaved();
    } catch (error) {
      setNotice({ tone: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }
  return (
    <form className="ui-card ui-form" onSubmit={save} noValidate>
      <h2>Track details</h2>
      <div className="ui-form-grid">
        <TextField label="Title" value={form.title} onChange={set("title")} required />
        <SelectField label="Icon" value={form.icon} onChange={set("icon")} options={ICONS} />
      </div>
      <TextArea label="Description" rows={3} value={form.description} onChange={set("description")} />
      <ImageField label="Track image" value={form.imageUrl} onChange={set("imageUrl")} />
      <CheckboxField label="Published" hint="Students only see published tracks." checked={form.published} onChange={set("published")} />
      {track.archived && <CheckboxField label="Archived" hint="Untick to restore this track." checked={form.archived} onChange={set("archived")} />}
      <div className="ui-form-actions"><Button type="submit" loading={saving}>Save track</Button></div>
    </form>
  );
}

export default function AdminTrackEditor() {
  const { trackId } = useParams();
  const navigate = useNavigate();
  const { data: track, loading, error, reload } = useApiResource(`/admin/tracks/${encodeURIComponent(trackId)}`, "track", null);
  const [notice, setNotice] = useState(null);
  const [levelTitle, setLevelTitle] = useState("");
  const [topic, setTopic] = useState({ title: "", levelId: "" });
  const [busy, setBusy] = useState(false);

  if (loading) return <section className="admin-page"><Loader label="Loading track…" /></section>;
  if (error) return <section className="admin-page"><ErrorMessage message={error} onRetry={reload} /></section>;

  async function run(action, success) {
    setBusy(true);
    setNotice(null);
    try {
      const result = await action();
      if (success) setNotice({ tone: "info", text: typeof success === "function" ? success(result) : success });
      reload();
      return result;
    } catch (actionError) {
      setNotice({ tone: "error", text: actionError.message });
      return null;
    } finally {
      setBusy(false);
    }
  }

  const levels = track.levels;
  const levelOrder = new Map(levels.map((level, index) => [level.id, index]));
  const topics = [...track.topics].sort((a, b) => (levelOrder.get(a.levelId) ?? 999) - (levelOrder.get(b.levelId) ?? 999) || a.order - b.order);
  const groups = [...levels.map((level) => ({ level, topics: topics.filter((item) => item.levelId === level.id) })), { level: null, topics: topics.filter((item) => !levelOrder.has(item.levelId)) }];

  const moveLevel = (index, delta) => {
    const ids = levels.map((level) => level.id);
    [ids[index], ids[index + delta]] = [ids[index + delta], ids[index]];
    run(() => api.put(`/admin/tracks/${track.id}/levels/order`, { ids }));
  };
  const moveTopic = (group, index, delta) => {
    const inGroup = group.topics.map((item) => item.id);
    [inGroup[index], inGroup[index + delta]] = [inGroup[index + delta], inGroup[index]];
    const ids = groups.flatMap((other) => (other === group ? inGroup : other.topics.map((item) => item.id)));
    run(() => api.put(`/admin/tracks/${track.id}/topics/order`, { ids }));
  };

  async function addTopic(event) {
    event.preventDefault();
    if (topic.title.trim().length < 2) return setNotice({ tone: "error", text: "Enter a topic title." });
    const created = await run(() => api.post(`/admin/tracks/${track.id}/topics`, { title: topic.title.trim(), levelId: topic.levelId || null }, "topic"));
    if (created) navigate(`/admin/topics/${created.id}`);
  }

  return (
    <section className="admin-page">
      <Link to="/admin/learning" className="back-link"><ArrowLeft size={17} aria-hidden="true" /> All tracks</Link>
      <PageHeader eyebrow="LEARNING TRACK" title={track.title}
        actions={<>
          <Link to={`/admin/projects?trackId=${track.id}`} className="btn btn-outline"><FolderKanban size={17} aria-hidden="true" /> Projects</Link>
          <Button variant="ghost" className="btn-danger-text" disabled={busy} onClick={async () => {
            if (!window.confirm(`Remove "${track.title}"? If students have used it, it is archived (hidden) and their records are kept.`)) return;
            const result = await run(() => api.delete(`/admin/tracks/${track.id}`));
            if (result?.deleted) navigate("/admin/learning");
            else if (result?.archived) setNotice({ tone: "info", text: result.message });
          }}>Delete track</Button>
        </>} />
      <Notice tone={notice?.tone}>{notice?.text}</Notice>

      <div className="ui-grid admin-editor-grid">
        <TrackForm key={track.updatedAt} track={track} onSaved={reload} setNotice={setNotice} />

        <section className="ui-card">
          <h2>Levels</h2>
          <ul className="ui-list">
            {levels.map((level, index) => (
              <li className="ui-list-item" key={level.id}>
                <div className="min-w-0"><h4>{level.title}</h4><p>{track.topics.filter((item) => item.levelId === level.id).length} topics{level.published ? "" : " · hidden"}</p></div>
                <div className="ui-actions">
                  <button type="button" className="btn btn-ghost btn-sm" aria-label={`Move ${level.title} up`} disabled={busy || index === 0} onClick={() => moveLevel(index, -1)}><ArrowUp size={16} aria-hidden="true" /></button>
                  <button type="button" className="btn btn-ghost btn-sm" aria-label={`Move ${level.title} down`} disabled={busy || index === levels.length - 1} onClick={() => moveLevel(index, 1)}><ArrowDown size={16} aria-hidden="true" /></button>
                  <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => {
                    const next = window.prompt("Rename level", level.title);
                    if (next && next.trim()) run(() => api.patch(`/admin/levels/${level.id}`, { title: next.trim() }), "Level renamed.");
                  }}>Rename</button>
                  <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => run(() => api.patch(`/admin/levels/${level.id}`, { published: !level.published }))}>{level.published ? "Hide" : "Show"}</button>
                  <button type="button" className="btn btn-ghost btn-sm btn-danger-text" aria-label={`Delete ${level.title}`} disabled={busy} onClick={() => {
                    if (window.confirm(`Delete the level "${level.title}"? Its topics are kept and become ungrouped.`)) run(() => api.delete(`/admin/levels/${level.id}`), "Level deleted; its topics were kept.");
                  }}><Trash2 size={16} aria-hidden="true" /></button>
                </div>
              </li>
            ))}
          </ul>
          <form className="ui-toolbar" style={{ marginTop: 12 }} onSubmit={(event) => {
            event.preventDefault();
            if (levelTitle.trim()) run(() => api.post(`/admin/tracks/${track.id}/levels`, { title: levelTitle.trim() }), "Level added.").then(() => setLevelTitle(""));
          }}>
            <TextField label="New level" value={levelTitle} onChange={setLevelTitle} placeholder="For example: Advanced" />
            <Button type="submit" variant="outline" className="ui-toolbar-fixed" disabled={busy}><Plus size={16} aria-hidden="true" /> Add level</Button>
          </form>
        </section>
      </div>

      <section className="ui-card" style={{ marginTop: 20 }}>
        <h2>Topics</h2>
        <form className="ui-toolbar" onSubmit={addTopic}>
          <TextField label="New topic title" value={topic.title} onChange={(title) => setTopic((t) => ({ ...t, title }))} />
          <SelectField label="Level" value={topic.levelId} onChange={(levelId) => setTopic((t) => ({ ...t, levelId }))} options={[{ value: "", label: "No level" }, ...levels.map((level) => ({ value: level.id, label: level.title }))]} />
          <Button type="submit" className="ui-toolbar-fixed" disabled={busy}><Plus size={16} aria-hidden="true" /> Add topic</Button>
        </form>
        {groups.filter((group) => group.topics.length).map((group) => (
          <div key={group.level?.id || "none"} className="admin-topic-group">
            <h3>{group.level?.title || "Not in a level"}</h3>
            <ul className="ui-list">
              {group.topics.map((item, index) => (
                <li className="ui-list-item" key={item.id}>
                  <div className="min-w-0">
                    <h4><Link to={`/admin/topics/${item.id}`}>{item.title}</Link></h4>
                    <p>{item.noteCount} notes · {item.quiz ? `quiz with ${item.quiz.questionCount} questions${item.quiz.published ? "" : " (draft)"}` : "no quiz"} · {item.completions} completions</p>
                  </div>
                  <div className="ui-actions">
                    {item.archived ? <span className="ui-pill">Archived</span> : item.published ? <span className="ui-pill green">Published</span> : <span className="ui-pill amber">Draft</span>}
                    <button type="button" className="btn btn-ghost btn-sm" aria-label={`Move ${item.title} up`} disabled={busy || index === 0} onClick={() => moveTopic(group, index, -1)}><ArrowUp size={16} aria-hidden="true" /></button>
                    <button type="button" className="btn btn-ghost btn-sm" aria-label={`Move ${item.title} down`} disabled={busy || index === group.topics.length - 1} onClick={() => moveTopic(group, index, 1)}><ArrowDown size={16} aria-hidden="true" /></button>
                    <Link to={`/admin/topics/${item.id}`} className="btn btn-outline btn-sm">Edit</Link>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
        {topics.length === 0 && <p className="muted-text">No topics yet. Add the first one above.</p>}
      </section>
    </section>
  );
}
