import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardCheck, Clock3, XCircle } from "lucide-react";

import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { useApiResource } from "../../hooks/useApiResource";
import { api } from "../../services/api/api";

// Answers in progress are kept in this browser tab only, so a reload (common on iPhones)
// does not lose them. They are not sensitive and are removed after submission.
const storageKey = (attemptId) => `coderise-quiz-${attemptId}`;
function loadSavedAnswers(attemptId) {
  try {
    return JSON.parse(sessionStorage.getItem(storageKey(attemptId)) || "{}");
  } catch {
    return {};
  }
}
function saveAnswers(attemptId, answers) {
  try {
    sessionStorage.setItem(storageKey(attemptId), JSON.stringify(answers));
  } catch {
    // Storage can be unavailable (private browsing); answers still live in memory.
  }
}
function clearAnswers(attemptId) {
  try {
    sessionStorage.removeItem(storageKey(attemptId));
  } catch {
    // Nothing to clear.
  }
}

function formatClock(seconds) {
  const safe = Math.max(0, Math.floor(seconds));
  return `${Math.floor(safe / 60)}:${String(safe % 60).padStart(2, "0")}`;
}

export default function QuizPage() {
  const { trackId, quizId } = useParams();
  const navigate = useNavigate();
  const quizResource = useApiResource(`/learning/quizzes/${encodeURIComponent(quizId)}`, "quiz", null);
  const historyResource = useApiResource(`/learning/attempts?quizId=${encodeURIComponent(quizId)}`, "attempts");

  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [locked, setLocked] = useState({});
  const [index, setIndex] = useState(0);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [revealing, setRevealing] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [clockOffset, setClockOffset] = useState(0);
  const submittedRef = useRef(false);
  const answersRef = useRef({});

  const quiz = quizResource.data;
  const finishedAttempts = historyResource.data.length;
  const attemptsLeft = quiz?.maxAttempts ? Math.max(0, quiz.maxAttempts - finishedAttempts) : null;

  async function submit(auto = false) {
    if (!attempt || submittedRef.current) return;
    submittedRef.current = true;
    setSubmitting(true);
    setError("");
    try {
      const result = await api.post(`/learning/attempts/${attempt.id}/submit`, { answers: answersRef.current }, "result");
      clearAnswers(attempt.id);
      navigate(`/free-learning/${trackId}/quizzes/${quizId}/results`, { replace: true, state: { result, auto } });
    } catch (submitError) {
      submittedRef.current = false;
      setError(submitError.message || "We couldn't submit your quiz. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  // Countdown. Time comes from the server (expiresAt), corrected for the device clock.
  const submitRef = useRef(submit);
  useEffect(() => {
    submitRef.current = submit;
  });
  useEffect(() => {
    if (!attempt?.expiresAt) return undefined;
    const timer = setInterval(() => {
      const current = Date.now();
      setNow(current);
      const remaining = (new Date(attempt.expiresAt).getTime() - (current + clockOffset)) / 1000;
      if (remaining <= 0) submitRef.current(true);
    }, 1000);
    return () => clearInterval(timer);
  }, [attempt, clockOffset]);

  async function start() {
    setStarting(true);
    setError("");
    try {
      const started = await api.post(`/learning/quizzes/${encodeURIComponent(quizId)}/attempts/start`, {}, "attempt");
      setClockOffset(new Date(started.serverTime).getTime() - Date.now());
      const saved = loadSavedAnswers(started.id);
      const fromLocks = Object.fromEntries(Object.entries(started.lockedAnswers || {}).map(([id, item]) => [id, item.selectedAnswer]));
      const restored = { ...saved, ...fromLocks };
      answersRef.current = restored;
      submittedRef.current = false;
      setAnswers(restored);
      setLocked(started.lockedAnswers || {});
      setIndex(0);
      setAttempt(started);
      setNow(Date.now());
    } catch (startError) {
      setError(startError.message || "The quiz could not be started.");
    } finally {
      setStarting(false);
    }
  }

  async function choose(question, optionIndex) {
    if (locked[question.id] || submitting) return;
    if (attempt.showExplanations === "immediately") {
      setRevealing(true);
      setError("");
      try {
        const revealed = await api.post(`/learning/attempts/${attempt.id}/answer`, { questionId: question.id, answer: optionIndex }, "answer");
        const next = { ...answersRef.current, [question.id]: revealed.selectedAnswer };
        answersRef.current = next;
        setAnswers(next);
        setLocked((previous) => ({ ...previous, [question.id]: revealed }));
        saveAnswers(attempt.id, next);
      } catch (revealError) {
        setError(revealError.message || "Your answer could not be saved.");
      } finally {
        setRevealing(false);
      }
      return;
    }
    const next = { ...answersRef.current, [question.id]: optionIndex };
    answersRef.current = next;
    setAnswers(next);
    saveAnswers(attempt.id, next);
  }

  if (quizResource.loading || historyResource.loading) return <div className="page-container"><Loader label="Loading quiz…" /></div>;
  if (quizResource.error && !/not found/i.test(quizResource.error)) return <div className="page-container"><ErrorMessage message={quizResource.error} onRetry={quizResource.reload} /></div>;
  if (!quiz || quiz.trackId !== trackId || !quiz.questionCount) {
    return <div className="page-container"><EmptyState title="Quiz unavailable" description="This quiz may have been removed or is not published yet." actionLabel="Return to track" actionHref={`/free-learning/${trackId}`} /></div>;
  }

  // Intro screen
  if (!attempt) {
    const backTo = quiz.lessonId ? `/free-learning/${trackId}/lessons/${quiz.lessonId}` : `/free-learning/${trackId}`;
    return (
      <div className="page-container quiz-page">
        <Link to={backTo} className="back-link"><ArrowLeft size={17} aria-hidden="true" /> Back to the topic</Link>
        <section className="quiz-card quiz-intro">
          <div className="quiz-summary-icon"><ClipboardCheck size={30} aria-hidden="true" /></div>
          <span className="eyebrow">KNOWLEDGE CHECK</span>
          <h1>{quiz.title}</h1>
          <ul className="quiz-rules">
            <li><strong>{quiz.questionsServed}</strong> questions</li>
            <li>{quiz.timeLimitMinutes ? <><strong>{quiz.timeLimitMinutes} minutes</strong> (submits automatically when time runs out)</> : "No time limit"}</li>
            <li>Pass mark: <strong>{quiz.passMark}%</strong></li>
            <li>{quiz.maxAttempts ? <>Attempts: <strong>{finishedAttempts} of {quiz.maxAttempts}</strong> used</> : "Unlimited attempts"}</li>
            <li>{quiz.showExplanations === "immediately" ? "You see the answer and explanation after each question" : quiz.showExplanations === "never" ? "Your score is shown after you submit" : "Answers and explanations are shown after you submit"}</li>
          </ul>
          {error && <ErrorMessage message={error} />}
          {attemptsLeft === 0 ? (
            <p className="alert alert-info">You have used all the attempts for this quiz.</p>
          ) : (
            <Button onClick={start} loading={starting} fullWidth>{finishedAttempts ? "Start a new attempt" : "Start quiz"} <ArrowRight size={17} aria-hidden="true" /></Button>
          )}
          {finishedAttempts > 0 && <Link className="text-link" to={`/free-learning/${trackId}/quizzes/${quizId}/results`}>View your previous results</Link>}
        </section>
      </div>
    );
  }

  const questions = attempt.questions;
  const question = questions[index];
  const remaining = attempt.expiresAt ? (new Date(attempt.expiresAt).getTime() - (now + clockOffset)) / 1000 : null;
  const answeredCount = questions.filter((item) => answers[item.id] !== undefined).length;
  const lock = locked[question.id];
  const isLast = index === questions.length - 1;

  return (
    <div className="page-container quiz-page">
      <section className="quiz-card">
        <div className="quiz-header quiz-sticky">
          <div className="min-w-0">
            <span className="eyebrow">ATTEMPT {attempt.attemptNumber}</span>
            <h1>{attempt.quizTitle}</h1>
          </div>
          {remaining !== null && (
            <span className={`quiz-timer ${remaining < 60 ? "urgent" : ""}`} role="timer" aria-live={remaining < 60 ? "assertive" : "off"}>
              <Clock3 size={16} aria-hidden="true" /> {formatClock(remaining)}
            </span>
          )}
        </div>

        <div className="ui-progress" aria-hidden="true"><span style={{ width: `${(answeredCount / questions.length) * 100}%` }} /></div>
        <p className="muted-text">{answeredCount} of {questions.length} answered</p>

        <div className="quiz-question">
          <span>QUESTION {index + 1} OF {questions.length}</span>
          <h2>{question.question}</h2>
        </div>

        <div className="quiz-options" role="radiogroup" aria-label={`Answers for question ${index + 1}`}>
          {question.options.map((option, optionIndex) => {
            const selected = answers[question.id] === optionIndex;
            const state = lock ? (optionIndex === lock.correctAnswer ? "correct" : selected ? "wrong" : "") : "";
            return (
              <button
                type="button"
                role="radio"
                aria-checked={selected}
                key={optionIndex}
                className={`quiz-option ${selected ? "selected" : ""} ${state}`}
                onClick={() => choose(question, optionIndex)}
                disabled={Boolean(lock) || revealing || submitting}
              >
                <span className="quiz-option-letter">{String.fromCharCode(65 + optionIndex)}</span>
                <span>{option}</span>
                {state === "correct" && <CheckCircle2 size={18} aria-label="Correct answer" />}
                {state === "wrong" && <XCircle size={18} aria-label="Your answer" />}
              </button>
            );
          })}
        </div>

        {lock && (
          <div className={`result-message ${lock.isCorrect ? "success" : "warning"}`}>
            <strong>{lock.isCorrect ? "Correct!" : "Not quite."}</strong> {lock.explanation}
          </div>
        )}

        {error && <ErrorMessage message={error} />}

        <div className="quiz-footer">
          <Button variant="outline" disabled={index === 0 || submitting} onClick={() => setIndex((value) => value - 1)}>Previous</Button>
          {isLast ? (
            <Button
              loading={submitting}
              onClick={() => {
                const unanswered = questions.length - answeredCount;
                if (unanswered && !window.confirm(`You have ${unanswered} unanswered question${unanswered === 1 ? "" : "s"}. Submit anyway?`)) return;
                submit(false);
              }}
            >
              Submit quiz
            </Button>
          ) : (
            <Button disabled={submitting} onClick={() => setIndex((value) => value + 1)}>Next <ArrowRight size={17} aria-hidden="true" /></Button>
          )}
        </div>

        <nav className="quiz-map" aria-label="Jump to a question">
          {questions.map((item, itemIndex) => (
            <button
              type="button"
              key={item.id}
              className={`${itemIndex === index ? "current" : ""} ${answers[item.id] !== undefined ? "answered" : ""}`}
              onClick={() => setIndex(itemIndex)}
              aria-label={`Question ${itemIndex + 1}${answers[item.id] !== undefined ? ", answered" : ""}`}
              aria-current={itemIndex === index ? "step" : undefined}
            >
              {itemIndex + 1}
            </button>
          ))}
        </nav>
      </section>
    </div>
  );
}
