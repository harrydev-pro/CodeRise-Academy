import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import Loader from "../../components/common/Loader";
import TrackIcon from "../../components/common/TrackIcon";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { PageHeader } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";

function TrackCard({ track }) {
  return (
    <article className="ui-card my-learning-card">
      <div className="dashboard-track-head">
        <span className="student-track-icon"><TrackIcon track={track} size={22} /></span>
        <div className="min-w-0"><h2>{track.title}</h2>{track.currentLevel && <p className="muted-text">Current level: {track.currentLevel}</p>}</div>
      </div>
      <div className="ui-progress" role="progressbar" aria-label={`${track.title} progress`} aria-valuenow={track.percentage} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${track.percentage}%` }} /></div>
      <dl className="my-learning-stats">
        <div><dt>Completed</dt><dd>{track.completedTopics}</dd></div>
        <div><dt>Remaining</dt><dd>{track.remainingTopics}</dd></div>
        <div><dt>Progress</dt><dd>{track.percentage}%</dd></div>
        <div><dt>Quiz average</dt><dd>{track.averageQuizScore === null ? "—" : `${track.averageQuizScore}%`}</dd></div>
      </dl>
      <Link to={track.nextTopic ? `/free-learning/${track.id}/lessons/${track.nextTopic.id}` : `/free-learning/${track.id}`} className="btn btn-primary">
        {track.nextTopic ? (track.completedTopics ? "Continue learning" : "Start learning") : "Review track"} <ArrowRight size={17} aria-hidden="true" />
      </Link>
    </article>
  );
}

export default function MyLearning() {
  const { data, loading, error, reload } = useApiResource("/learning/dashboard", "dashboard", null);
  if (loading) return <div className="student-page"><Loader label="Loading your learning progress…" /></div>;
  if (error) return <div className="student-page"><ErrorMessage message={error} onRetry={reload} /></div>;
  const started = data.tracks.filter((track) => track.completedTopics > 0 || track.quizAttempts > 0);
  const notStarted = data.tracks.filter((track) => !started.includes(track));

  return (
    <div className="student-page">
      <PageHeader eyebrow="YOUR LEARNING JOURNEY" title="My Learning" description="Your progress in every learning track." />
      {started.length > 0 && (
        <section className="student-section">
          <h2 className="section-title">Tracks you have started</h2>
          <div className="ui-grid ui-grid-cards">{started.map((track) => <TrackCard track={track} key={track.id} />)}</div>
        </section>
      )}
      {notStarted.length > 0 && (
        <section className="student-section">
          <h2 className="section-title">{started.length ? "More tracks to explore" : "Choose a track to begin"}</h2>
          <div className="ui-grid ui-grid-cards">{notStarted.map((track) => <TrackCard track={track} key={track.id} />)}</div>
        </section>
      )}
    </div>
  );
}
