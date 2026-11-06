import { requestData } from "../../services/api/dataClient";

export const getProjects = async () => {
  const tracks = await requestData("/learning/tracks", "tracks");
  const projects = await Promise.all(tracks.map((track) => getProjectsByTrack(track.id)));
  return projects.flat();
};
export const getProjectsByTrack = (trackId) => requestData(
  `/learning/tracks/${encodeURIComponent(trackId)}/projects`, "projects",
);
export const getProjectById = (projectId) => requestData(
  `/learning/projects/${encodeURIComponent(projectId)}`, "project",
);
export const submitProject = (submission) => requestData(
  `/learning/projects/${encodeURIComponent(submission.projectId)}/submissions`, "submission",
  { method: "POST", body: JSON.stringify({
    description: submission.description,
    liveUrl: submission.liveUrl || "",
    githubUrl: submission.githubUrl || "",
    selectedFileName: submission.selectedFileName || "",
  }) },
);
export const getMySubmissions = () => requestData("/learning/submissions", "submissions");
export const getInstructorSubmissions = () => requestData("/learning/instructor/submissions", "submissions");
export const reviewSubmission = (submissionId, review) => requestData(
  `/learning/instructor/submissions/${encodeURIComponent(submissionId)}/review`, "submission",
  { method: "PATCH", body: JSON.stringify(review) },
);
