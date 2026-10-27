import { STORAGE_KEYS } from "../../services/storage/storageKeys";

import {
  readStore,
  writeStore,
} from "../../services/storage/storageAdapter";

export function getProgress() {
  return readStore(
    STORAGE_KEYS.progress,
    {}
  );
}

export function getStudentProgress(userId) {
  const progress = getProgress();

  return progress[userId] ?? {
    completedLessons: [],
    completedQuizzes: [],
    completedProjects: [],
  };
}

export function saveStudentProgress(
  userId,
  updates
) {
  const progress = getProgress();

  const existing = progress[userId] ?? {
    completedLessons: [],
    completedQuizzes: [],
    completedProjects: [],
  };

  const updatedProgress = {
    ...progress,

    [userId]: {
      ...existing,
      ...updates,
    },
  };

  writeStore(
    STORAGE_KEYS.progress,
    updatedProgress
  );

  return updatedProgress[userId];
}

export function markLessonComplete(
  userId,
  lessonId
) {
  const student = getStudentProgress(userId);

  const completedLessons = new Set(
    student.completedLessons
  );

  completedLessons.add(lessonId);

  return saveStudentProgress(userId, {
    completedLessons: [...completedLessons],
  });
}

export function getCompletionPercentage(
  completed,
  total
) {
  if (!total) return 0;

  return Math.round(
    (completed / total) * 100
  );
}