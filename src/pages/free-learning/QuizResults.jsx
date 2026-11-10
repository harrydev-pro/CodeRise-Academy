import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Clock3, RotateCcw, Trophy, XCircle, MinusCircle } from "lucide-react";

import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { StatusBadge } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";
import { formatDate } from "../../utils/formatDate";

function formatSeconds(value) {
  if (value === null || value === undefined) return "—";
  const minutes = Math.floor(value / 60);
  const seconds = value % 60;
  return minutes ? `${minutes} min ${seconds} s` : `${seconds} s`;
}

export default function QuizResults() {
  const { trackId, quizId } = useParams();
  const location = useLocation();
  const historyResource = useApiResource(`/learning/attempts?quizId=${encodeURIComponent(quizId)}`, "attempts");
  const quizResource = useApiResource(`/learning/quizzes/${encodeURIComponent(quizId)}`, "quiz", null);
  const [selectedId, setSelectedId] = useState(location.state?.result?.id || null);

  if (historyResource.loading || quizResource.loading) return <div className="page-container"><Loader label="Loading your results…" /></div>;
  if (historyResource.error) return <div className="page-container"><ErrorMessage message={historyResource.error} onRetry={historyResource.reload} /></div>;

  const history = historyResource.data;
  const result = history.find((item) => item.id === selectedId) || location.state?.result || history[0];
  if (!result) {
    return <div className="page-container"><EmptyState title="No quiz results yet" description="Complete this quiz to see your results." actionLabel="Start quiz" actionHref={`/free-learning/${trackId}/quizzes/${quizId}`} /></div>;
  }

  const quiz = quizResource.data;
  const attemptsLeft = quiz?.maxAttempts ? Math.max(0, quiz.maxAttempts - history.length) : null;
  const answers = Array.isArray(result.answers) ? result.answers : [];
  const showKey = answers.some((item) => item.correctAnswer !== undefined);
  const incorrect = result.incorrect ?? answers.filter((item) => item.selectedAnswer !== null && item.selectedAnswer !== undefined && !item.isCorrect).length;
  const unanswered = result.unanswered ?? answers.filter((item) => item.selectedAnswer === null || item.selectedAnswer === undefined).length;

  return (
    <div className="page-container quiz-results-page">
      <section className="quiz-result-card">
        <div className={`result-icon ${result.passed ? "passed" : "needs-work"}`}>{result.passed ? <Trophy size={34} aria-hidden="true" /> : <RotateCcw size={34} aria-hidden="true" />}</div>
        <span className="eyebrow">{result.quizTitle} · ATTEMPT {result.attemptNumber}</span>
        <h1>{result.passed ? "Well done, you passed!" : "Keep practising!"}</h1>
        {location.state?.auto && location.state?.result?.id === result.id && <p className="alert alert-info">Time ran out, so your quiz was submitted automatically.</p>}
        {result.status === "expired" && <p className="alert alert-info">This attempt ended when the time limit was reached.</p>}

        <div className="result-score"><strong>{result.percentage}%</strong><span>{result.passed ? "Passed" : "Not passed"} · pass mark {result.passMark}%</span></div>

        <div className="ui-grid ui-grid-stats result-stats">
          <div className="result-stat"><span>Total questions</span><strong>{result.totalQuestions}</strong></div>
          <div className="result-stat good"><span><CheckCircle2 size={14} aria-hidden="true" /> Correct</span><strong>{result.score}</strong></div>
          <div className="result-stat bad"><span><XCircle size={14} aria-hidden="true" /> Incorrect</span><strong>{incorrect}</strong></div>
          <div className="result-stat"><span><MinusCircle size={14} aria-hidden="true" /> Unanswered</span><strong>{unanswered}</strong></div>
          <div className="result-stat"><span><Clock3 size={14} aria-hidden="true" /> Time spent</span><strong>{formatSeconds(result.timeSpentSeconds)}</strong></div>
        </div>

        <div className="result-actions">
          {attemptsLeft !== 0 && <Link to={`/free-learning/${trackId}/quizzes/${quizId}`} className="btn btn-primary"><RotateCcw size={17} aria-hidden="true" /> Retake quiz{attemptsLeft ? ` (${attemptsLeft} left)` : ""}</Link>}
          <Link to={result.lessonId ? `/free-learning/${trackId}/lessons/${result.lessonId}` : `/free-learning/${trackId}`} className="btn btn-outline"><ArrowLeft size={17} aria-hidden="true" /> Back to the topic</Link>
        </div>
      </section>

      {answers.length > 0 && (
        <section className="ui-card quiz-review">
          <h2>Question-by-question review</h2>
          {!showKey && <p className="muted-text">Correct answers are not shown for this quiz.</p>}
          <ol className="quiz-review-list">
            {answers.map((item, index) => {
              const options = Array.isArray(item.options) ? item.options : [];
              const answered = item.selectedAnswer !== null && item.selectedAnswer !== undefined;
              return (
                <li key={item.questionId || index} className={item.isCorrect ? "correct" : answered ? "wrong" : "skipped"}>
                  <h3>{index + 1}. {item.question}</h3>
                  <p><strong>Your answer:</strong> {answered ? options[item.selectedAnswer] ?? `Option ${item.selectedAnswer + 1}` : "Not answered"} {item.isCorrect ? "✓" : ""}</p>
                  {showKey && !item.isCorrect && <p><strong>Correct answer:</strong> {options[item.correctAnswer] ?? `Option ${item.correctAnswer + 1}`}</p>}
                  {item.explanation && <p className="muted-text">{item.explanation}</p>}
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {history.length > 1 && (
        <section className="ui-card quiz-review">
          <h2>Your attempts</h2>
          <ul className="ui-list">
            {history.map((item) => (
              <li className="ui-list-item" key={item.id}>
                <div className="min-w-0">
                  <h4>Attempt {item.attemptNumber}: {item.percentage}%</h4>
                  <p>{formatDate(item.completedAt)} · {item.score}/{item.totalQuestions} correct</p>
                </div>
                <div className="ui-actions">
                  <StatusBadge status={item.passed ? "Passed" : "Not passed"} />
                  {item.id !== result.id && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedId(item.id)}>View</button>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
