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
    learningGoals: application.learningGoals,
    reason: application.reason,
    preferredContact: application.preferredContact,
    acceptedTerms: application.acceptedTerms,
  }),
});
// Starts Paystack checkout for an approved application. The backend returns the
// Paystack page to open; Paystack sends the student back to /payments/return.
export const startApplicationPayment = (applicationId) => requestData(
  `/payments/paystack/initialize/application/${encodeURIComponent(applicationId)}`, null,
  { method: "POST", body: JSON.stringify({}) },
);
export const updateApplicationStatus = (applicationId, status, adminFeedback = "") => requestData(
  `/applications/${encodeURIComponent(applicationId)}/status`, "application",
  { method: "PATCH", body: JSON.stringify({ status, adminFeedback }) },
);
