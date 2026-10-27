import { STORAGE_KEYS } from "../../services/storage/storageKeys";

import {
  readStore,
  writeStore,
} from "../../services/storage/storageAdapter";

import { initialLessons } from "../../data/initialLessons";

export function getLessons() {
  return readStore(
    STORAGE_KEYS.lessons,
    initialLessons
  );
}

export function getPublishedLessons() {
  return getLessons().filter(
    (lesson) => lesson.published
  );
}

export function getLessonById(id) {
  return getLessons().find(
    (lesson) => lesson.id === id
  );
}

export function getLessonsByTrack(trackId) {
  return getLessons().filter(
    (lesson) => lesson.trackId === trackId
  );
}

export function saveLessons(lessons) {
  return writeStore(
    STORAGE_KEYS.lessons,
    lessons
  );
}

export function updateLesson(id, updates) {
  const lessons = getLessons();

  const updatedLessons = lessons.map((lesson) =>
    lesson.id === id
      ? { ...lesson, ...updates }
      : lesson
  );

  saveLessons(updatedLessons);

  return updatedLessons;
}

export function addLesson(lesson) {
  const lessons = getLessons();

  const updatedLessons = [
    ...lessons,
    {
      ...lesson,
      id:
        lesson.id ??
        `lesson-${Date.now()}`,
    },
  ];

  saveLessons(updatedLessons);

  return updatedLessons;
}