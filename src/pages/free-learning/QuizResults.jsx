import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, RotateCcw, Trophy } from "lucide-react";

import { useApiResource } from "../../hooks/useApiResource";
import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";

export default function QuizResults() {
  const { trackId, quizId } = useParams();
  const location = useLocation();
  const hasNavigationResult = Boolean(location.state?.result);
  const attemptsResource = useApiResource("/learning/attempts", "attempts", undefined, !hasNavigationResult);
  const result = location.state?.result || attemptsResource.data.find((item) => item.quizId === quizId);

  if (!hasNavigationResult && attemptsResource.loading) return <main className="page-container"><Loader label="Loading quiz result…" /></main>;
  if (!hasNavigationResult && attemptsResource.error) return <main className="page-container"><ErrorMessage message={attemptsResource.error} onRetry={attemptsResource.reload} /></main>;
  if (!result) {
    return <main className="page-container"><EmptyState title="No quiz result found" description="Complete a quiz first to view your result." action={<Link to={`/free-learning/${trackId}/quizzes/${quizId}`} className="btn btn-primary">Start quiz</Link>} /></main>;
  }

  const passed = result.passed ?? result.percentage >= (result.passMark || 70);
  return <main className="page-container quiz-results-page"><section className="quiz-result-card">
    <div className={`result-icon ${passed ? "passed" : "needs-work"}`}>{passed ? <Trophy size={34} /> : <CheckCircle2 size={34} />}</div>
    <span className="eyebrow">QUIZ COMPLETED</span>
    <h1>{passed ? "Well done!" : "Keep practicing!"}</h1>
    <p>You have completed the {result.trackTitle} knowledge check.</p>
    <div className="result-score"><strong>{result.percentage}%</strong><span>Final score</span></div>
    <div className="result-breakdown"><div><span>Correct answers</span><strong>{result.score}</strong></div><div><span>Total questions</span><strong>{result.totalQuestions}</strong></div><div><span>Passing score</span><strong>{result.passMark || 70}%</strong></div></div>
    <div className={`result-message ${passed ? "success" : "warning"}`}>{passed ? "You achieved the passing score. Continue learning and put your knowledge into practice." : "You haven't reached the passing score yet. Review the lessons and try again."}</div>
    {Array.isArray(result.answers) && <details className="mt-6 text-left"><summary className="cursor-pointer font-semibold">Review your answers</summary><div className="mt-4 space-y-4">{result.answers.map((answer) => <article key={answer.questionId}><h3 className="font-semibold">{answer.question}</h3><p>{answer.isCorrect ? "Correct" : `Correct answer: ${answer.options?.[answer.correctAnswer] || answer.correctAnswer + 1}`}</p>{answer.explanation && <p>{answer.explanation}</p>}</article>)}</div></details>}
    <div className="result-actions"><Link to={`/free-learning/${trackId}/quizzes/${result.quizId || quizId}`} className="btn btn-primary"><RotateCcw size={17} /> Try again</Link><Link to={`/free-learning/${trackId}`} className="btn btn-outline"><ArrowLeft size={17} /> Back to lessons</Link></div>
  </section></main>;
}
