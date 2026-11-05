import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, Clock3, FolderKanban } from "lucide-react";

import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { useApiResource } from "../../hooks/useApiResource";

function TopicList({ trackId, topics, completed }) {
  return (
    <ol className="topic-list">
      {topics.map((topic) => {
        const done = completed.has(topic.id);
        return (
          <li key={topic.id}>
            <Link to={`/free-learning/${trackId}/lessons/${topic.id}`} className={`topic-row ${done ? "done" : ""}`}>
              {done ? <CheckCircle2 size={22} aria-hidden="true" className="topic-status done" /> : <Circle size={22} aria-hidden="true" className="topic-status" />}
              <span className="min-w-0">
                <strong>{topic.title}</strong>
                {topic.description && <small>{topic.description}</small>}
              </span>
              {topic.duration && <span className="ui-pill"><Clock3 size={13} aria-hidden="true" /> {topic.duration}</span>}
              <span className="sr-only">{done ? "Completed" : "Not completed"}</span>
              <ArrowRight size={18} aria-hidden="true" className="topic-arrow" />
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

export default function TrackDetails() {
  const { trackId } = useParams();
  const trackResource = useApiResource(`/learning/tracks/${encodeURIComponent(trackId)}`, "track", null);
  const progressResource = useApiResource("/learning/progress", "progress");
  const track = trackResource.data;

  if (trackResource.loading || progressResource.loading) return <div className="page-container"><Loader label="Loading this learning track…" /></div>;
  if (trackResource.error && !/not found/i.test(trackResource.error)) return <div className="page-container"><ErrorMessage message={trackResource.error} onRetry={trackResource.reload} /></div>;
  if (!track) {
    return <div className="page-container"><EmptyState title="Learning track not found" description="This track may have been removed." actionLabel="Browse learning tracks" actionHref="/free-learning" /></div>;
  }

  const completed = new Set(progressResource.data.filter((item) => item.trackId === track.id).map((item) => item.lessonId));
  const allTopics = [...track.levels.flatMap((level) => level.topics), ...track.ungroupedTopics];
  const done = allTopics.filter((topic) => completed.has(topic.id)).length;
  const percentage = allTopics.length ? Math.round((done / allTopics.length) * 100) : 0;
  const next = allTopics.find((topic) => !completed.has(topic.id));

  return (
    <div className="page-container free-learning-shell">
      <Link to="/free-learning" className="back-link"><ArrowLeft size={17} aria-hidden="true" /> All learning tracks</Link>

      <section className="track-detail-hero">
        <span className="eyebrow">FREE LEARNING TRACK</span>
        <h1>{track.title}</h1>
        <p>{track.description}</p>
        <div className="progress-summary">
          <div className="progress-summary-heading"><span>Your progress</span><strong>{percentage}%</strong></div>
          <div className="ui-progress" role="progressbar" aria-label="Track progress" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${percentage}%` }} /></div>
          <small>{done} of {allTopics.length} topics completed</small>
        </div>
        <div className="track-hero-actions">
          {next && <Link to={`/free-learning/${track.id}/lessons/${next.id}`} className="btn btn-primary">{done ? "Continue" : "Start"}: {next.title} <ArrowRight size={17} aria-hidden="true" /></Link>}
          <Link to={`/free-learning/${track.id}/projects`} className="btn btn-outline"><FolderKanban size={17} aria-hidden="true" /> Practical projects</Link>
        </div>
      </section>

      {allTopics.length === 0 ? (
        <EmptyState title="No topics published yet" description="Topics will appear here when they are added to this track." />
      ) : (
        <div className="track-levels">
          {track.levels.filter((level) => level.topics.length > 0).map((level) => {
            const levelDone = level.topics.filter((topic) => completed.has(topic.id)).length;
            return (
              <section className="ui-card track-level" key={level.id}>
                <div className="ui-card-header">
                  <h2>{level.title}</h2>
                  <span className={`ui-pill ${levelDone === level.topics.length ? "green" : ""}`}>{levelDone}/{level.topics.length} completed</span>
                </div>
                {level.description && <p className="muted-text">{level.description}</p>}
                <TopicList trackId={track.id} topics={level.topics} completed={completed} />
              </section>
            );
          })}
          {track.ungroupedTopics.length > 0 && (
            <section className="ui-card track-level">
              <div className="ui-card-header"><h2>More topics</h2></div>
              <TopicList trackId={track.id} topics={track.ungroupedTopics} completed={completed} />
            </section>
          )}
        </div>
      )}
    </div>
  );
}
