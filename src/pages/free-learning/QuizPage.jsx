import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CircleX,
  ClipboardCheck,
} from "lucide-react";

import { getTrackById } from "../../features/free-learning/trackService";
import {
  getQuizzesByTrack,
  getQuizById,
} from "../../features/assessments/quizService";
import { readStore, writeStore } from "../../services/storage/storageAdapter";
import { STORAGE_KEYS } from "../../services/storage/storageKeys";
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/common/Button";
import EmptyState from "../../components/common/EmptyState";

export default function QuizPage() {
  const { trackId, quizId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const track = getTrackById(trackId);
  const quizzes = getQuizzesByTrack(trackId);
  const quiz = getQuizById(quizId) ?? quizzes[0];

  const questions = useMemo(() => {
    return quiz?.questions ?? [];
  }, [quiz]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState({});
  const [showSummary, setShowSummary] = useState(false);

  if (!track) {
    return (
      <main className="page-container">
        <EmptyState
          title="Learning track not found"
          description="Return to the learning catalog and choose another track."
          action={
            <Link to="/free-learning" className="btn btn-primary">
              Browse tracks
            </Link>
          }
        />
      </main>
    );
  }

  if (questions.length === 0) {
    return (
      <main className="page-container">
        <EmptyState
          title="No quiz available"
          description="A quiz has not been published for this track yet."
          action={
            <Link
              to={`/free-learning/${trackId}`}
              className="btn btn-primary"
            >
              Return to track
            </Link>
          }
        />
      </main>
    );
  }

  const question = questions[currentIndex];
  const selectedAnswer = answers[currentIndex];
  const isChecked = checked[currentIndex] === true;

  function getCorrectIndex(item) {
    if (Number.isInteger(item.correctAnswer)) {
      return item.correctAnswer;
    }

    if (Number.isInteger(item.correctAnswerIndex)) {
      return item.correctAnswerIndex;
    }

    return -1;
  }

  function handleCheckAnswer() {
    if (selectedAnswer === undefined) return;

    setChecked((previous) => ({
      ...previous,
      [currentIndex]: true,
    }));
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((previous) => previous + 1);
      return;
    }

    setShowSummary(true);
  }

  function finishQuiz() {
    const score = questions.reduce((total, item, index) => {
      return total + (
        answers[index] === getCorrectIndex(item) ? 1 : 0
      );
    }, 0);

    const result = {
      id: `quiz-${Date.now()}`,
      quizId: quiz.id,
      userId: user?.id,
      trackId,
      trackTitle: track.title,
      quizTitle: quiz.title,
      score,
      totalQuestions: questions.length,
      percentage: Math.round((score / questions.length) * 100),
      answers,
      completedAt: new Date().toISOString(),
    };

    const savedResults = readStore(STORAGE_KEYS.quizResults, []);
    writeStore(STORAGE_KEYS.quizResults, [
      { ...result, createdAt: result.completedAt },
      ...savedResults,
    ]);

    navigate(`/free-learning/${trackId}/quizzes/${quiz.id}/results`, {
      state: { result },
    });
  }

  if (showSummary) {
    return (
      <main className="page-container quiz-page">
        <section className="quiz-summary-card">
          <div className="quiz-summary-icon">
            <ClipboardCheck size={30} />
          </div>

          <h1>Ready to see your results?</h1>

          <p>
            You answered {Object.keys(answers).length} of{" "}
            {questions.length} questions.
          </p>

          <div className="quiz-summary-actions">
            <Button onClick={finishQuiz}>
              Finish quiz <ArrowRight size={17} />
            </Button>

            <Button
              variant="outline"
              onClick={() => {
                setCurrentIndex(0);
                setShowSummary(false);
              }}
            >
              Review answers
            </Button>
          </div>
        </section>
      </main>
    );
  }

  const correctIndex = getCorrectIndex(question);

  return (
    <main className="page-container quiz-page">
      <Link
        to={`/free-learning/${trackId}`}
        className="back-link"
      >
        <ArrowLeft size={17} />
        Back to {track.title}
      </Link>

      <section className="quiz-card">
        <div className="quiz-header">
          <div>
            <span className="eyebrow">KNOWLEDGE CHECK</span>
            <h1>{track.title} Quiz</h1>
          </div>

          <span className="quiz-counter">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        <div className="progress-track">
          <div
            className="progress-fill"
            style={{
              width: `${((currentIndex + 1) / questions.length) * 100}%`,
            }}
          />
        </div>

        <div className="quiz-question">
          <span>QUESTION {currentIndex + 1}</span>
          <h2>{question.question}</h2>
        </div>

        <div className="quiz-options">
          {(question.options || []).map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = correctIndex === index;

            let className = "quiz-option";

            if (isSelected) className += " selected";
            if (isChecked && isCorrect) className += " correct";
            if (isChecked && isSelected && !isCorrect) {
              className += " incorrect";
            }

            return (
              <button
                type="button"
                key={index}
                className={className}
                onClick={() => {
                  if (isChecked) return;

                  setAnswers((previous) => ({
                    ...previous,
                    [currentIndex]: index,
                  }));
                }}
                disabled={isChecked}
              >
                <span className="quiz-option-letter">
                  {String.fromCharCode(65 + index)}
                </span>

                <span>{option}</span>

                {isChecked && isCorrect && (
                  <CheckCircle2 size={19} />
                )}

                {isChecked && isSelected && !isCorrect && (
                  <CircleX size={19} />
                )}
              </button>
            );
          })}
        </div>

        {isChecked && (
          <div
            className={`quiz-feedback ${
              selectedAnswer === correctIndex ? "success" : "error"
            }`}
            role="status"
          >
            <strong>
              {selectedAnswer === correctIndex
                ? "Correct answer!"
                : "Not quite. Review the explanation below."}
            </strong>

            <p>
              {question.explanation ||
                "Review this question in your lesson materials before continuing."}
            </p>
          </div>
        )}

        <div className="quiz-footer">
          {!isChecked ? (
            <Button
              onClick={handleCheckAnswer}
              disabled={selectedAnswer === undefined}
            >
              Check answer
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {currentIndex === questions.length - 1
                ? "Review summary"
                : "Next question"}
              <ArrowRight size={17} />
            </Button>
          )}
        </div>
      </section>
    </main>
  );
}