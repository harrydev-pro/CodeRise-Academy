import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, ClipboardCheck, Clock3, SkipForward } from "lucide-react";
import { getTrackById } from "../../features/free-learning/trackService";
import { getQuizById, getQuizByLesson } from "../../features/assessments/quizService";
import { getLessonById } from "../../features/free-learning/lessonService";
import { readStore, writeStore } from "../../services/storage/storageAdapter";
import { STORAGE_KEYS } from "../../services/storage/storageKeys";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";

const DEFAULT_MINUTES = [5, 10, 15, 20, 30];

export default function QuizPage() {
  const { trackId, quizId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const track = getTrackById(trackId);
  const requestedQuiz = getQuizById(quizId);
  const lesson = requestedQuiz?.lessonId ? getLessonById(requestedQuiz.lessonId) : null;
  const quiz = lesson ? getQuizByLesson(lesson.id) : requestedQuiz;
  const allQuestions = useMemo(() => (quiz?.questions ?? []).filter((item) => item?.question?.trim() && item.options?.length), [quiz]);

  const [phase, setPhase] = useState("setup");
  const [questionCount, setQuestionCount] = useState(0);
  const [minutes, setMinutes] = useState(Number(quiz?.durationMinutes) || 10);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);
  const finishQuizRef = useRef(null);

  useEffect(() => {
    if (phase !== "active") return undefined;
    const timer = window.setInterval(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  useEffect(() => {
    finishQuizRef.current = finishQuiz;
  });

  useEffect(() => {
    if (phase === "active" && secondsLeft === 0) finishQuizRef.current?.();
  }, [secondsLeft, phase]);

  if (!track) return <main className="page-container free-learning-shell"><EmptyState title="Learning track not found" description="Return to free learning and choose a track." action={<Link className="btn btn-primary" to="/free-learning">Browse tracks</Link>} /></main>;
  if (!quiz || !allQuestions.length) return <main className="page-container free-learning-shell"><EmptyState title={quiz ? "Quiz being prepared" : "Quiz coming soon"} description={quiz ? "This lesson’s quiz is published, but its questions have not been added yet." : "This lesson does not have a published quiz yet."} action={<Link className="btn btn-primary" to={lesson ? `/free-learning/${trackId}/lessons/${lesson.id}` : `/free-learning/${trackId}`}>Return to lesson</Link>} /></main>;

  const question = questions[currentIndex];
  const instructions = Array.isArray(quiz.instructions)
    ? quiz.instructions
    : String(quiz.instructions || "Read each question carefully. Choose one answer, or skip and return before submitting. Your quiz ends when the timer runs out.").split("\n").filter(Boolean);

  function startQuiz(event) {
    event.preventDefault();
    const shuffled = [...allQuestions].sort(() => Math.random() - 0.5).slice(0, Math.min(questionCount || allQuestions.length, allQuestions.length));
    setQuestions(shuffled);
    setCurrentIndex(0);
    setAnswers({});
    setSecondsLeft(minutes * 60);
    setPhase("active");
  }

  function finishQuiz() {
    if (!questions.length) return;
    const score = questions.reduce((total, item, index) => total + (Number(answers[index]) === Number(item.correctAnswer ?? item.correctAnswerIndex) ? 1 : 0), 0);
    const reviewAnswers = questions.map((item, index) => {
      const correctAnswer = Number(item.correctAnswer ?? item.correctAnswerIndex);
      const selectedAnswer = answers[index] === undefined ? null : Number(answers[index]);
      return {
        question: item.question,
        options: item.options,
        selectedAnswer,
        correctAnswer,
        isCorrect: selectedAnswer === correctAnswer,
        explanation: item.explanation || "Review the lesson to understand why this is the correct answer.",
      };
    });
    const result = {
      id: `quiz-${Date.now()}`, quizId: quiz.id, userId: user?.id, trackId,
      lessonId: lesson?.id, lessonTitle: lesson?.title, trackTitle: track.title,
      quizTitle: quiz.title || lesson?.title || "Lesson quiz", score,
      totalQuestions: questions.length, percentage: Math.round((score / questions.length) * 100),
      answers, reviewAnswers, completedAt: new Date().toISOString(),
    };
    const saved = readStore(STORAGE_KEYS.quizResults, []);
    writeStore(STORAGE_KEYS.quizResults, [{ ...result, createdAt: result.completedAt }, ...(Array.isArray(saved) ? saved : [])]);
    setPhase("done");
    navigate(`/free-learning/${trackId}/quizzes/${quiz.id}/results`, { state: { result } });
  }

  function goNext() {
    if (currentIndex === questions.length - 1) setPhase("review");
    else setCurrentIndex((index) => index + 1);
  }
  function skip() {
    if (currentIndex < questions.length - 1) setCurrentIndex((index) => index + 1);
    else setPhase("review");
  }
  const timeLabel = `${Math.floor(secondsLeft / 60).toString().padStart(2, "0")}:${(secondsLeft % 60).toString().padStart(2, "0")}`;

  if (phase === "setup") return (
    <main className="page-container quiz-page free-learning-shell">
      <Link to={lesson ? `/free-learning/${trackId}/lessons/${lesson.id}` : `/free-learning/${trackId}`} className="back-link"><ArrowLeft size={17}/> Back to {lesson?.title || track.title}</Link>
      <section className="quiz-setup-card">
        <div className="quiz-setup-icon"><ClipboardCheck size={25}/></div>
        <span className="eyebrow">LESSON KNOWLEDGE CHECK</span>
        <h1>{quiz.title || lesson?.title || `${track.title} quiz`}</h1>
        <p className="quiz-setup-subtitle">{lesson?.title ? `A short check-in for “${lesson.title}”.` : `A short check-in for ${track.title}.`}</p>
        <div className="quiz-instructions"><h2>Before you begin</h2><ul>{instructions.map((item, index) => <li key={index}>{item}</li>)}</ul></div>
        <form className="quiz-settings" onSubmit={startQuiz}>
          <label>Questions to answer<select value={questionCount || allQuestions.length} onChange={(event) => setQuestionCount(Number(event.target.value))}>{Array.from({ length: allQuestions.length }, (_, index) => index + 1).map((number) => <option value={number} key={number}>{number} {number === 1 ? "question" : "questions"}</option>)}</select><small>{allQuestions.length} available for this lesson</small></label>
          <label>Time limit<select value={minutes} onChange={(event) => setMinutes(Number(event.target.value))}>{[...new Set([...DEFAULT_MINUTES, Number(quiz.durationMinutes) || 10])].sort((a, b) => a - b).map((value) => <option key={value} value={value}>{value} minutes</option>)}</select><small>Timer starts when you begin</small></label>
          <Button type="submit">Start quiz <ArrowRight size={17}/></Button>
        </form>
      </section>
    </main>
  );

  if (phase === "review") return <main className="page-container quiz-page free-learning-shell"><section className="quiz-summary-card"><div className="quiz-summary-icon"><ClipboardCheck size={30}/></div><h1>Ready to submit?</h1><p>You answered {Object.keys(answers).length} of {questions.length} questions. Unanswered questions count as incorrect.</p><div className="quiz-summary-actions"><Button onClick={finishQuiz}>Submit quiz <ArrowRight size={17}/></Button><Button variant="outline" onClick={() => setPhase("active")}>Review answers</Button></div></section></main>;

  return <main className="page-container quiz-page free-learning-shell">
    <div className="quiz-active-top"><Link to={lesson ? `/free-learning/${trackId}/lessons/${lesson.id}` : `/free-learning/${trackId}`} className="back-link"><ArrowLeft size={17}/> Exit quiz</Link><span className={`quiz-timer ${secondsLeft < 60 ? "urgent" : ""}`}><Clock3 size={17}/>{timeLabel}</span></div>
    <section className="quiz-card">
      <div className="quiz-header"><div><span className="eyebrow">{lesson?.title || track.title}</span><h1>{quiz.title || "Lesson quiz"}</h1></div><span className="quiz-counter">{currentIndex + 1} / {questions.length}</span></div>
      <div className="progress-track"><div className="progress-fill" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}/></div>
      <div className="quiz-question"><span>QUESTION {currentIndex + 1}</span><h2>{question.question}</h2></div>
      <div className="quiz-options">{question.options.map((option, index) => {
        const selected = answers[currentIndex] === index;
        return <button type="button" key={`${index}-${option}`} className={`quiz-option ${selected ? "selected" : ""}`} onClick={() => setAnswers((previous) => ({ ...previous, [currentIndex]: index }))}><span className="quiz-option-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span>{selected && <Check size={18}/>}</button>;
      })}</div>
      <div className="quiz-footer"><Button variant="outline" disabled={currentIndex === 0} onClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))}><ArrowLeft size={17}/> Previous</Button><div className="quiz-footer-right"><Button variant="outline" onClick={skip}><SkipForward size={16}/> Skip</Button><Button onClick={goNext}>{currentIndex === questions.length - 1 ? "Review quiz" : "Next"}<ArrowRight size={17}/></Button></div></div>
    </section>
    <nav className="quiz-question-nav" aria-label="Quiz questions">{questions.map((_, index) => <button type="button" key={index} aria-label={`Go to question ${index + 1}`} aria-current={currentIndex === index ? "step" : undefined} className={`${currentIndex === index ? "current" : ""} ${answers[index] !== undefined ? "answered" : ""}`} onClick={() => setCurrentIndex(index)}>{index + 1}</button>)}</nav>
  </main>;
}
