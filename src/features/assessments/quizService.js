import { STORAGE_KEYS } from "../../services/storage/storageKeys";

import {
  readStore,
  writeStore,
} from "../../services/storage/storageAdapter";

import { initialQuizzes } from "../../data/initialQuizzes";
import { getLessonsByTrack } from "../free-learning/lessonService";

export function getQuizzes() {
  const stored = readStore(
    STORAGE_KEYS.quizzes,
    initialQuizzes
  );

  // Older seed data contained duplicate quiz IDs. Keep one quiz per lesson so
  // the free-learning experience always resolves to a single assessment.
  const seenLessons = new Set();
  const unique = [];
  for (const quiz of (Array.isArray(stored) ? stored : initialQuizzes)) {
    if (!quiz?.lessonId || seenLessons.has(quiz.lessonId)) continue;
    seenLessons.add(quiz.lessonId);
    unique.push(quiz);
  }
  return unique;
}

export function getPublishedQuizzes() {
  return getQuizzes().filter(
    (quiz) => quiz.published
  );
}

export function getQuizById(id) {
  return getQuizzes().find(
    (quiz) => quiz.id === id
  );
}

export function getQuizByLesson(lessonId) {
  return getQuizzes().find(
    (quiz) =>
      quiz.lessonId === lessonId &&
      quiz.published
  );
}

export function getQuizzesByTrack(trackId) {
  const lessonIds = new Set(getLessonsByTrack(trackId).map((lesson) => lesson.id));
  return getQuizzes().filter((quiz) => quiz.trackId === trackId || lessonIds.has(quiz.lessonId));
}

export function saveQuizzes(quizzes) {
  const unique = [];
  const seenLessons = new Set();
  for (const quiz of (Array.isArray(quizzes) ? quizzes : [])) {
    if (!quiz?.lessonId || seenLessons.has(quiz.lessonId)) continue;
    seenLessons.add(quiz.lessonId);
    unique.push(quiz);
  }
  return writeStore(STORAGE_KEYS.quizzes, unique);
}

export function saveQuizForLesson(quiz) {
  const quizzes = getQuizzes();
  const existing = quizzes.find((item) => item.lessonId === quiz.lessonId);
  const savedQuiz = {
    ...existing,
    ...quiz,
    id: existing?.id ?? quiz.id ?? `quiz-${Date.now()}`,
  };
  saveQuizzes(existing
    ? quizzes.map((item) => item.lessonId === quiz.lessonId ? savedQuiz : item)
    : [...quizzes, savedQuiz]);
  return savedQuiz;
}

export function updateQuiz(id, updates) {
  const quizzes = getQuizzes();

  const updatedQuizzes = quizzes.map((quiz) =>
    quiz.id === id
      ? { ...quiz, ...updates }
      : quiz
  );

  saveQuizzes(updatedQuizzes);

  return updatedQuizzes;
}
