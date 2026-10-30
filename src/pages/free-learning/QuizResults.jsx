import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, CircleX, RotateCcw, Trophy } from "lucide-react";
import { readStore } from "../../services/storage/storageAdapter";
import { STORAGE_KEYS } from "../../services/storage/storageKeys";

export default function QuizResults() {
  const { trackId, quizId } = useParams();
  const location = useLocation();
  const savedResults = readStore(STORAGE_KEYS.quizResults, []);
  const result = location.state?.result
    ?? (Array.isArray(savedResults) ? savedResults.find((item) => item.quizId === quizId) : null);

  if (!result) {
    return (
      <main className="page-container free-learning-shell">
        <section className="empty-state">
          <h1>No quiz result found</h1>
          <p>Complete a quiz first to view your result.</p>
          <Link to={`/free-learning/${trackId}/quizzes/${quizId}`} className="btn btn-primary">Start quiz</Link>
        </section>
      </main>
    );
  }

  const passed = result.percentage >= 70;
  const reviewAnswers = Array.isArray(result.reviewAnswers) ? result.reviewAnswers : [];
  const retakeUrl = `/free-learning/${trackId}/quizzes/${result.quizId || quizId}`;

  return (
    <main className="page-container quiz-results-page free-learning-shell">
      <section className="quiz-result-card">
        <div className={`result-icon ${passed ? "passed" : "needs-work"}`}>
          {passed ? <Trophy size={34} /> : <CheckCircle2 size={34} />}
        </div>
        <span className="eyebrow">QUIZ COMPLETED</span>
        <h1>{passed ? "Well done!" : "Keep practicing!"}</h1>
        <p>You completed {result.quizTitle || result.trackTitle}.</p>
        <div className="result-score"><strong>{result.percentage}%</strong><span>Final score</span></div>
        <div className="result-breakdown">
          <div><span>Correct answers</span><strong>{result.score}</strong></div>
          <div><span>Total questions</span><strong>{result.totalQuestions}</strong></div>
          <div><span>Passing score</span><strong>70%</strong></div>
        </div>
        <div className={`result-message ${passed ? "success" : "warning"}`}>
          {passed ? "You achieved the passing score. Review your answers below, then keep learning." : "You have not reached the 70% target yet. Review your mistakes and explanations below, then try again."}
        </div>
        <div className="result-actions">
          <Link to={retakeUrl} className="btn btn-primary"><RotateCcw size={17} /> Retake quiz</Link>
          <Link to={`/free-learning/${trackId}`} className="btn btn-outline"><ArrowLeft size={17} /> Back to lessons</Link>
        </div>
      </section>

      <section className="answer-review" aria-labelledby="answer-review-title">
        <div className="answer-review-heading"><div><span className="eyebrow">LEARN FROM YOUR ANSWERS</span><h2 id="answer-review-title">Answer review</h2></div><span>{reviewAnswers.filter((item) => !item.isCorrect).length} to review</span></div>
        {reviewAnswers.length ? <div className="answer-review-list">{reviewAnswers.map((item, index) => {
          const selectedText = item.selectedAnswer === null ? "Skipped" : item.options?.[item.selectedAnswer] ?? "No answer";
          const correctText = item.options?.[item.correctAnswer] ?? "Correct answer unavailable";
          return <article className={`answer-review-item ${item.isCorrect ? "correct" : "incorrect"}`} key={`${index}-${item.question}`}>
            <div className="answer-review-item-heading"><span>Question {index + 1}</span><strong>{item.isCorrect ? <><CheckCircle2 size={17}/> Correct</> : <><CircleX size={17}/> Review this answer</>}</strong></div>
            <h3>{item.question}</h3>
            <div className="answer-review-response"><div className={item.isCorrect ? "response-correct" : "response-missed"}><span>Your answer</span><strong>{selectedText}</strong></div>{!item.isCorrect && <div className="response-correct"><span>Correct answer</span><strong>{correctText}</strong></div>}</div>
            <div className="answer-explanation"><strong>Explanation</strong><p>{item.explanation || `The correct answer is ${correctText}.`}</p></div>
          </article>;
        })}</div> : <div className="answer-review-empty"><p>This result was saved before answer review was available. Retake the quiz to review your answers and explanations.</p><Link to={retakeUrl} className="btn btn-primary"><RotateCcw size={17}/> Retake quiz</Link></div>}
      </section>
    </main>
  );
}
