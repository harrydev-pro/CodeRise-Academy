import { Trophy, CalendarDays } from "lucide-react";

import EmptyState from "../../components/common/EmptyState";
import { useApiResource } from "../../hooks/useApiResource";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { formatDate } from "../../utils/formatDate";

export default function MyResults() {
  const { data: results, loading, error, reload } = useApiResource("/learning/attempts", "attempts");

  if (loading) return <div className="student-page"><Loader label="Loading your results…" /></div>;
  if (error) return <div className="student-page"><ErrorMessage message={error} onRetry={reload} /></div>;

  if (results.length === 0) {
    return (
      <div className="student-page">
        <div className="student-page-heading">
          <h1>My Results</h1>
          <p>Review your quiz scores and assessment history.</p>
        </div>

        <EmptyState
          icon={Trophy}
          title="No results available"
          description="Complete a quiz in Free Learning to see your results here."
          actionLabel="Start Learning"
          actionHref="/free-learning"
        />
      </div>
    );
  }

  return (
    <div className="student-page">
      <div className="student-page-heading">
        <span className="eyebrow">ASSESSMENT HISTORY</span>
        <h1>My Results</h1>
        <p>Monitor your performance and identify areas to improve.</p>
      </div>

      <div className="student-record-list">
        {results.map((result) => {
          const percentage =
            Number(result.percentage) ||
            (result.totalQuestions
              ? Math.round(
                  (Number(result.score || 0) /
                    Number(result.totalQuestions)) *
                    100
                )
              : 0);

          return (
            <article className="student-record-card" key={result.id}>
              <div className="student-record-icon">
                <Trophy size={23} />
              </div>

              <div className="student-record-content">
                <h2>
                  {result.quizTitle ||
                    result.title ||
                    "Quiz assessment"}
                </h2>

                <p>
                  Score: {result.score ?? 0}
                  {result.totalQuestions
                    ? ` out of ${result.totalQuestions}`
                    : ""}
                </p>

                <div className="record-meta">
                  <span>
                    <CalendarDays size={15} />
                    {formatDate(result.completedAt || result.createdAt)}
                  </span>

                  <span>{percentage}%</span>
                </div>

                <div className="progress-track result-progress">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(100, percentage)
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <span
                className={`status-badge ${
                  percentage >= 70
                    ? "status-completed"
                    : "status-pending"
                }`}
              >
                {percentage >= 70 ? "Good progress" : "Keep practicing"}
              </span>
            </article>
          );
        })}
      </div>
    </div>
  );
}
