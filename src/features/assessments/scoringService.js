export function calculateQuizScore(
  questions,
  answers
) {
  let correct = 0;

  const reviewedAnswers = questions.map(
    (question) => {
      const selectedAnswer = answers[question.id];

      const isCorrect =
        selectedAnswer === question.correctAnswer;

      if (isCorrect) {
        correct += 1;
      }

      return {
        questionId: question.id,

        question: question.question,

        selectedAnswer,

        correctAnswer: question.correctAnswer,

        isCorrect,

        explanation: question.explanation,
      };
    }
  );

  const total = questions.length;

  const percentage =
    total > 0
      ? Math.round((correct / total) * 100)
      : 0;

  return {
    correct,
    total,
    percentage,
    answers: reviewedAnswers,
  };
}

export function hasPassedQuiz(
  percentage,
  passMark = 60
) {
  return percentage >= passMark;
}