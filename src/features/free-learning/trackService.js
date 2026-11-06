import { requestData } from "../../services/api/dataClient";

export const getTracks = () => requestData("/learning/tracks", "tracks");
export const getPublishedTracks = getTracks;
export const getTrackById = (id) => requestData(`/learning/tracks/${encodeURIComponent(id)}`, "track");
