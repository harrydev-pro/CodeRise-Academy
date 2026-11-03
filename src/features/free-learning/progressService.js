import { requestData } from "../../services/api/dataClient";

export const getUserProgress = () => requestData("/learning/progress", "progress");

export const markLessonCompleted = (_userId, _trackId, lessonId) => requestData(
  `/learning/lessons/${encodeURIComponent(lessonId)}/complete`,
  "progress",
  { method: "POST", body: JSON.stringify({}) },
);

export function getCompletionPercentage(completed, total) {
  return total ? Math.round((completed / total) * 100) : 0;
}
