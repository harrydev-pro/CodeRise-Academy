import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import TrackIcon from "../../components/common/TrackIcon";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { Notice, PageHeader, TextField } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";
import { api } from "../../services/api/api";

export default function AdminLearning() {
  const navigate = useNavigate();
  const { data: tracks, loading, error, reload } = useApiResource("/admin/tracks?includeArchived=true", "tracks");
  const [title, setTitle] = useState("");
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);

  async function create(event) {
    event.preventDefault();
    if (title.trim().length < 2) return setNotice({ tone: "error", text: "Enter a track title." });
    setSaving(true);
    try {
      const track = await api.post("/admin/tracks", { title: title.trim() }, "track");
      navigate(`/admin/learning/${track.id}`);
    } catch (createError) {
      setNotice({ tone: "error", text: createError.message });
      setSaving(false);
    }
  }

  return (
    <section className="admin-page">
      <PageHeader eyebrow="FREE LEARNING" title="Learning tracks" description="Tracks contain levels, topics with notes, quizzes, and practical projects." />
      <Notice tone={notice?.tone}>{notice?.text}</Notice>
      <form className="ui-toolbar ui-card" onSubmit={create}>
        <TextField label="New track title" value={title} onChange={setTitle} placeholder="For example: Data Analysis" />
        <Button type="submit" loading={saving} className="ui-toolbar-fixed"><Plus size={17} aria-hidden="true" /> Create track</Button>
      </form>
      {loading ? <Loader label="Loading tracks…" /> : error ? <ErrorMessage message={error} onRetry={reload} /> : (
        <ul className="ui-list">
          {tracks.map((track) => (
            <li className="ui-list-item" key={track.id}>
              <span className="student-track-icon"><TrackIcon track={track} size={22} /></span>
              <div className="min-w-0">
                <h3><Link to={`/admin/learning/${track.id}`}>{track.title}</Link></h3>
                <p>{track.levelCount} levels · {track.topicCount} topics · {track.quizCount} quizzes · {track.projectCount} projects</p>
              </div>
              <div className="ui-actions">
                {track.archived ? <span className="ui-pill">Archived</span> : track.published ? <span className="ui-pill green">Published</span> : <span className="ui-pill amber">Draft</span>}
                <Link to={`/admin/learning/${track.id}`} className="btn btn-outline btn-sm">Manage</Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
