import { requestData } from "../../services/api/dataClient";

export const getPrograms = () => requestData("/catalog/programs", "programs");
export const getPublishedPrograms = getPrograms;
export const getProgramById = (programId) => requestData(`/catalog/programs/${encodeURIComponent(programId)}`, "program");
