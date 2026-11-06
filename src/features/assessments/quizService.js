import { requestData } from "../../services/api/dataClient";

export const getQuizzesByTrack = (trackId) => requestData(`/learning/tracks/${encodeURIComponent(trackId)}/quizzes`, "quizzes");
export const getQuizById = (quizId) => requestData(`/learning/quizzes/${encodeURIComponent(quizId)}`, "quiz");
export const getPublishedQuizzes = async () => {
  const tracks = await requestData("/learning/tracks", "tracks");
  const quizzes = await Promise.all(tracks.map((track) => getQuizzesByTrack(track.id)));
  return quizzes.flat();
};
export const getQuizByLesson = async (lessonId) => {
  const quizzes = await getPublishedQuizzes();
  const quiz = quizzes.find((item) => item.lessonId === lessonId);
  return quiz ? getQuizById(quiz.id) : null;
};
