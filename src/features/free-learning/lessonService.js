import { requestData } from "../../services/api/dataClient";

export const getLessonsByTrack = (trackId) => requestData(`/learning/tracks/${encodeURIComponent(trackId)}/lessons`, "lessons");
export const getLessonById = (lessonId) => requestData(`/learning/lessons/${encodeURIComponent(lessonId)}`, "lesson");
export const getPublishedLessons = async () => {
  const tracks = await requestData("/learning/tracks", "tracks");
  const lessons = await Promise.all(tracks.map((track) => getLessonsByTrack(track.id)));
  return lessons.flat();
};
