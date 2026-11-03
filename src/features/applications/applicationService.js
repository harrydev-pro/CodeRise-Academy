import { requestData } from "../../services/api/dataClient";

export const getApplications = () => requestData("/applications", "applications");
export const getApplicationsByUser = () => requestData("/applications/me", "applications");
export const getApplicationById = async (applicationId) => {
  const applications = await getApplicationsByUser();
  return applications.find((application) => application.id === applicationId) || null;
};
export const createApplication = (application) => requestData("/applications", "application", {
  method: "POST",
  body: JSON.stringify({
    fullName: application.fullName,
    email: application.email,
    phone: application.phone,
    programId: application.programId,
    skillLevel: application.skillLevel,
    experience: application.experience,
    reason: application.reason,
    preferredContact: application.preferredContact,
    acceptedTerms: application.acceptedTerms,
  }),
});
export const updateApplicationStatus = (applicationId, status, adminFeedback = "") => requestData(
  `/applications/${encodeURIComponent(applicationId)}/status`, "application",
  { method: "PATCH", body: JSON.stringify({ status, adminFeedback }) },
);
