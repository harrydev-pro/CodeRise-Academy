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

export function getUserProgress(userId) {
  if (!userId) return [];
  const stored = getStudentProgress(userId);
  if (Array.isArray(stored)) return stored;
  const tracks = Array.isArray(stored.tracks) ? stored.tracks : [];
  const completed = Array.isArray(stored.completedLessons) ? stored.completedLessons : [];
  return [...tracks, ...completed.map((lessonId) => ({ lessonId, completed: true }))];
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

export function markLessonCompleted(userId, trackId, lessonId) {
  const student = getStudentProgress(userId);
  const completedLessons = new Set(student.completedLessons || []);
  completedLessons.add(lessonId);
  const tracks = Array.isArray(student.tracks) ? student.tracks : [];
  const withoutExisting = tracks.filter((item) => item.lessonId !== lessonId);
  saveStudentProgress(userId, {
    completedLessons: [...completedLessons],
    tracks: [...withoutExisting, { trackId, lessonId, completed: true }],
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
