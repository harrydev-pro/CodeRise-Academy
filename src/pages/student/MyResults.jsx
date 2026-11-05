import { Link } from "react-router-dom";
import { Trophy } from "lucide-react";

import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { PageHeader, StatusBadge } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";
import { formatDate } from "../../utils/formatDate";

export default function MyResults() {
  const { data: attempts, loading, error, reload } = useApiResource("/learning/attempts", "attempts");
  if (loading) return <div className="student-page"><Loader label="Loading your quiz history…" /></div>;
  if (error) return <div className="student-page"><ErrorMessage message={error} onRetry={reload} /></div>;

  return (
    <div className="student-page">
      <PageHeader eyebrow="ASSESSMENT HISTORY" title="Quiz History" description="Every quiz attempt you have completed." />
      {attempts.length === 0 ? (
        <EmptyState icon={Trophy} title="No quiz attempts yet" description="Complete a topic quiz in Free Learning to see your results here." actionLabel="Start learning" actionHref="/free-learning" />
      ) : (
        <div className="student-record-list">
          {attempts.map((attempt) => (
            <article className="student-record-card" key={attempt.id}>
              <div className="student-record-icon"><Trophy size={22} aria-hidden="true" /></div>
              <div className="student-record-content">
                <h2>{attempt.quizTitle}</h2>
                <p>{attempt.trackTitle}{attempt.topicTitle ? ` · ${attempt.topicTitle}` : ""}</p>
                <div className="record-meta">
                  <span>{formatDate(attempt.completedAt)}</span>
                  <span>Attempt {attempt.attemptNumber}</span>
                  <span>{attempt.score}/{attempt.totalQuestions} correct · {attempt.percentage}%</span>
                </div>
                <Link className="text-link" to={`/free-learning/${attempt.trackId}/quizzes/${attempt.quizId}/results`} state={{ result: attempt }}>Review answers</Link>
              </div>
              <StatusBadge status={attempt.passed ? "Passed" : "Not passed"} />
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
