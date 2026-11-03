import { requestData } from "../../services/api/dataClient";

export const getVideoCourses = () => requestData("/catalog/video-courses", "courses");
export const getVideoCourseById = (courseId) => requestData(`/catalog/video-courses/${encodeURIComponent(courseId)}`, "course");
