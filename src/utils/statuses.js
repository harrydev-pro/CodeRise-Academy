export const APPLICATION_STATUSES = ["Pending", "Under Review", "Approved", "Rejected", "Enrolled", "Waitlisted"];

export const SUBMISSION_STATUSES = ["Submitted", "Under Review", "Approved", "Needs Corrections", "Rejected"];

// CSS class for a status badge, e.g. "Needs Corrections" -> "status-needs-corrections".
export function statusClass(status, fallback = "pending") {
  return `status-${String(status || fallback).toLowerCase().replace(/\s+/g, "-")}`;
}
