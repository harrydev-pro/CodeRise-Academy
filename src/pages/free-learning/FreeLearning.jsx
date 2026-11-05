import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, ClipboardCheck, FolderKanban } from "lucide-react";

import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import TrackIcon from "../../components/common/TrackIcon";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { useApiResource } from "../../hooks/useApiResource";

export default function FreeLearning() {
  const tracksResource = useApiResource("/learning/tracks", "tracks");
  const dashboardResource = useApiResource("/learning/dashboard", "dashboard", null);
  const tracks = tracksResource.data;
  const summaries = new Map((dashboardResource.data?.tracks || []).map((track) => [track.id, track]));

  return (
    <div className="page-container free-learning-shell">
      <section className="learning-hero">
        <span className="eyebrow">FREE LEARNING</span>
        <h1>Learn a new skill, one topic at a time.</h1>
        <p>Choose a track, read the notes for each topic, test yourself with quizzes, and practise with real projects. Your progress is saved automatically.</p>
      </section>

      <section className="section-block">
        <div className="section-heading">
          <div>
            <span className="eyebrow">START LEARNING</span>
            <h2>Choose your learning track</h2>
          </div>
        </div>

        {tracksResource.loading ? <Loader label="Loading learning tracks…" /> : tracksResource.error ? <ErrorMessage message={tracksResource.error} onRetry={tracksResource.reload} /> : tracks.length === 0 ? (
          <EmptyState title="No learning tracks yet" description="Learning tracks will appear here when they are published." />
        ) : (
          <div className="ui-grid ui-grid-cards">
            {tracks.map((track) => {
              const summary = summaries.get(track.id);
              const started = summary?.completedTopics > 0;
              const continueTo = summary?.nextTopic
                ? `/free-learning/${track.id}/lessons/${summary.nextTopic.id}`
                : `/free-learning/${track.id}`;
              return (
                <article className="track-card learning-track-card" key={track.id}>
                  {track.imageUrl ? <img src={track.imageUrl} alt="" className="learning-track-image" loading="lazy" /> : (
                    <div className="track-card-icon"><TrackIcon track={track} /></div>
                  )}
                  <h3>{track.title}</h3>
                  <p>{track.description || "Guided topics, quizzes, and practical projects."}</p>
                  <div className="ui-meta">
                    <span><BookOpen size={15} aria-hidden="true" /> {track.topicCount} topics</span>
                    <span><ClipboardCheck size={15} aria-hidden="true" /> {track.quizCount} quizzes</span>
                    <span><FolderKanban size={15} aria-hidden="true" /> {track.projectCount} projects</span>
                  </div>
                  {summary && (
                    <div className="learning-track-progress">
                      <div className="progress-heading"><span>Your progress</span><strong>{summary.percentage}%</strong></div>
                      <div className="ui-progress" role="progressbar" aria-label={`${track.title} progress`} aria-valuenow={summary.percentage} aria-valuemin={0} aria-valuemax={100}>
                        <span style={{ width: `${summary.percentage}%` }} />
                      </div>
                    </div>
                  )}
                  <div className="learning-track-actions">
                    <Link to={continueTo} className="btn btn-primary">
                      {summary?.percentage === 100 ? "Review track" : started ? "Continue learning" : "Start learning"} <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                    <Link to={`/free-learning/${track.id}`} className="text-link">View curriculum</Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
