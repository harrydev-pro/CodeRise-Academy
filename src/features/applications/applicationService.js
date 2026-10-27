import { STORAGE_KEYS } from "../../services/storage/storageKeys";
import {
  readStore,
  writeStore,
} from "../../services/storage/storageAdapter";

import { generateId } from "../../utils/generateId";
import { logActivity } from "../activity/activityService";

function getAllApplications() {
  const applications = readStore(STORAGE_KEYS.applications, []);

  return Array.isArray(applications) ? applications : [];
}

export function getApplications() {
  return getAllApplications();
}

export function getApplicationById(applicationId) {
  return getAllApplications().find(
    (application) => application.id === applicationId
  ) || null;
}

export function getApplicationsByUser(userId) {
  return getAllApplications().filter(
    (application) => application.userId === userId
  );
}

export function createApplication(applicationData) {
  const applications = getAllApplications();

  const application = {
    ...applicationData,
    id: generateId(),
    status: "Pending",
    adminFeedback: "",
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  writeStore(STORAGE_KEYS.applications, [
    application,
    ...applications,
  ]);

  try {
    logActivity({
      type: "application_submitted",
      description: `Program application submitted for ${application.programTitle}`,
      userId: application.userId,
      userName: application.fullName,
    });
  } catch (error) {
    console.warn("Application activity log could not be saved:", error);
  }

  return application;
}

export function updateApplication(applicationId, updates) {
  const applications = getAllApplications();

  let updatedApplication = null;

  const updatedApplications = applications.map((application) => {
    if (application.id !== applicationId) {
      return application;
    }

    updatedApplication = {
      ...application,
      ...updates,
      id: application.id,
      updatedAt: new Date().toISOString(),
    };

    return updatedApplication;
  });

  if (updatedApplication) {
    writeStore(STORAGE_KEYS.applications, updatedApplications);
  }

  return updatedApplication;
}

export function updateApplicationStatus(
  applicationId,
  status,
  adminFeedback = ""
) {
  const allowedStatuses = [
    "Pending",
    "Under Review",
    "Accepted",
    "Rejected",
    "Waitlisted",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid application status.");
  }

  return updateApplication(applicationId, {
    status,
    adminFeedback,
  });
}

export function deleteApplication(applicationId) {
  const applications = getAllApplications();

  const updatedApplications = applications.filter(
    (application) => application.id !== applicationId
  );

  if (updatedApplications.length === applications.length) {
    return false;
  }

  writeStore(STORAGE_KEYS.applications, updatedApplications);

  return true;
}