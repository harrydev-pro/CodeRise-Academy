import { Link, useLocation, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  Trophy,
} from "lucide-react";


export default function QuizResults() {
  const { trackId, quizId } = useParams();
  const location = useLocation();

  const result = location.state?.result;

  if (!result) {
    return (
      <main className="page-container">
        <section className="empty-state">
          <h1>No quiz result found</h1>
          <p>
            Complete a quiz first to view your result.
          </p>

          <Link
            to={`/free-learning/${trackId}/quizzes/${quizId}`}
            className="btn btn-primary"
          >
            Start quiz
          </Link>
        </section>
      </main>
    );
  }

  const passed = result.percentage >= 70;

  return (
    <main className="page-container quiz-results-page">
      <section className="quiz-result-card">
        <div className={`result-icon ${passed ? "passed" : "needs-work"}`}>
          {passed ? <Trophy size={34} /> : <CheckCircle2 size={34} />}
        </div>

        <span className="eyebrow">QUIZ COMPLETED</span>

        <h1>{passed ? "Well done!" : "Keep practicing!"}</h1>

        <p>
          You have completed the {result.trackTitle} knowledge check.
        </p>

        <div className="result-score">
          <strong>{result.percentage}%</strong>
          <span>Final score</span>
        </div>

        <div className="result-breakdown">
          <div>
            <span>Correct answers</span>
            <strong>{result.score}</strong>
          </div>

          <div>
            <span>Total questions</span>
            <strong>{result.totalQuestions}</strong>
          </div>

          <div>
            <span>Passing score</span>
            <strong>70%</strong>
          </div>
        </div>

        <div className={`result-message ${passed ? "success" : "warning"}`}>
          {passed
            ? "You achieved the passing score. Continue learning and put your knowledge into practice."
            : "You haven't reached the 70% target yet. Review the lessons and try again."}
        </div>

        <div className="result-actions">
          <Link
            to={`/free-learning/${trackId}/quizzes/${result.quizId || quizId}`}
            className="btn btn-primary"
          >
            <RotateCcw size={17} />
            Try again
          </Link>

          <Link
            to={`/free-learning/${trackId}`}
            className="btn btn-outline"
          >
            <ArrowLeft size={17} />
            Back to lessons
          </Link>
        </div>
      </section>
    </main>
  );
}
