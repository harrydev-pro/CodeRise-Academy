import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, ClipboardCheck } from "lucide-react";

import { useApiResource } from "../../hooks/useApiResource";
import { requestData } from "../../services/api/dataClient";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";

export default function QuizPage() {
  const { trackId, quizId } = useParams();
  const navigate = useNavigate();
  const trackResource = useApiResource(`/learning/tracks/${encodeURIComponent(trackId)}`, "track", null);
  const quizResource = useApiResource(`/learning/quizzes/${encodeURIComponent(quizId)}`, "quiz", null);
  const track = trackResource.data;
  const quiz = quizResource.data;
  const questions = quiz?.questions || [];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (trackResource.loading || quizResource.loading) return <main className="page-container"><Loader label="Loading quiz…" /></main>;
  if (trackResource.error || quizResource.error) {
    const failedResource = trackResource.error ? trackResource : quizResource;
    return <main className="page-container"><ErrorMessage message={failedResource.error} onRetry={() => { trackResource.reload(); quizResource.reload(); }} /></main>;
  }
  if (!track || !quiz || quiz.trackId !== trackId || questions.length === 0) {
    return <main className="page-container"><EmptyState title="Quiz unavailable" description="This quiz may have been removed or is not published yet." action={<Link to={`/free-learning/${trackId}`} className="btn btn-primary">Return to track</Link>} /></main>;
  }

  async function finishQuiz() {
    if (Object.keys(answers).length !== questions.length) {
      setError("Please answer every question before submitting your quiz.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const result = await requestData(`/learning/quizzes/${encodeURIComponent(quiz.id)}/attempts`, "result", {
        method: "POST",
        body: JSON.stringify({ answers: Object.fromEntries(Object.entries(answers).map(([index, answer]) => [questions[Number(index)].id, answer])) }),
      });
      navigate(`/free-learning/${trackId}/quizzes/${quiz.id}/results`, { state: { result }, replace: true });
    } catch (requestError) {
      setError(requestError.message || "We couldn't save your quiz result. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (showSummary) {
    return <main className="page-container quiz-page"><section className="quiz-summary-card">
      <div className="quiz-summary-icon"><ClipboardCheck size={30} /></div>
      <h1>Ready to submit your quiz?</h1>
      <p>You answered {Object.keys(answers).length} of {questions.length} questions. Your score will be calculated securely.</p>
      {error && <ErrorMessage message={error} />}
      <div className="quiz-summary-actions">
        <Button onClick={finishQuiz} loading={saving}>Submit quiz <ArrowRight size={17} /></Button>
        <Button variant="outline" disabled={saving} onClick={() => { setCurrentIndex(0); setShowSummary(false); }}>Review answers</Button>
      </div>
    </section></main>;
  }

  const question = questions[currentIndex];
  const selectedAnswer = answers[currentIndex];
  return <main className="page-container quiz-page">
    <Link to={`/free-learning/${trackId}`} className="back-link"><ArrowLeft size={17} /> Back to {track.title}</Link>
    <section className="quiz-card">
      <div className="quiz-header"><div><span className="eyebrow">KNOWLEDGE CHECK</span><h1>{quiz.title || `${track.title} Quiz`}</h1></div><span className="quiz-counter">{currentIndex + 1} / {questions.length}</span></div>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} /></div>
      <div className="quiz-question"><span>QUESTION {currentIndex + 1}</span><h2>{question.question}</h2></div>
      <div className="quiz-options">
        {(question.options || []).map((option, index) => (
          <button type="button" key={index} className={`quiz-option ${selectedAnswer === index ? "selected" : ""}`} onClick={() => { setAnswers((previous) => ({ ...previous, [currentIndex]: index })); setError(""); }}>
            <span className="quiz-option-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span>
          </button>
        ))}
      </div>
      {error && <ErrorMessage message={error} />}
      <div className="quiz-footer">
        <Button variant="outline" disabled={currentIndex === 0} onClick={() => setCurrentIndex((index) => index - 1)}>Previous</Button>
        <Button disabled={selectedAnswer === undefined} onClick={() => currentIndex === questions.length - 1 ? setShowSummary(true) : setCurrentIndex((index) => index + 1)}>
          {currentIndex === questions.length - 1 ? "Review summary" : "Next question"} <ArrowRight size={17} />
        </Button>
      </div>
    </section>
  </main>;
}
