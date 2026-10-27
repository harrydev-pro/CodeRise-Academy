import { STORAGE_KEYS } from "../../services/storage/storageKeys";

import {
  readStore,
  writeStore,
} from "../../services/storage/storageAdapter";

import { initialQuizzes } from "../../data/initialQuizzes";
import { getLessonsByTrack } from "../free-learning/lessonService";

export function getQuizzes() {
  return readStore(
    STORAGE_KEYS.quizzes,
    initialQuizzes
  );
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
  return writeStore(
    STORAGE_KEYS.quizzes,
    quizzes
  );
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
