import { queryString } from "../../../services/api/api";
import { requestData } from "../../../services/api/dataClient";
import { sampleAdminOverview } from "./sampleAdminCommunity";

// Admin side of the Community (A01–A27). Every call needs an admin session; the backend
// checks the role on each request, so these pages never decide access on their own.
//
// Like the student pages, a failed request on the local dev server falls back to sample data
// (the page shows a notice). Production builds show the normal error with a retry button.

// A01 Overview: GET /admin/community/overview?from=YYYY-MM-DD&to=YYYY-MM-DD
// -> { stats: { members, membersThisMonth, premiumMembers, premiumConversion (%), projects,
//               freeProjects, premiumProjects, activeTeams, activeHackathons, scheduledHackathons,
//               activeCompetitions, submissions, pendingReviews, pendingOlderThan3Days,
//               competitionRevenueUsd, mrrUsd, mrrChangeUsd },
//      premiumTrend: [{ day: "YYYY-MM-DD", count }],     // weekly Premium subscriber totals
//      submissionsByCategory: [{ title, count }],
//      oldestPending: [{ id, student, project, projectType ("premium_project" | "free_project" |
//                        "collaboration" | "competition"), submittedAt, reviewer | null }],
//      upcomingEvents: [{ id, type ("hackathon" | "competition"), title, detail }],
//      moderationQueue }
export async function getAdminCommunityOverview(range) {
  try {
    const overview = await requestData(`/admin/community/overview${queryString(range)}`, "overview");
    if (!overview?.stats) throw new Error("The community overview is not available yet.");
    return { ...overview, isSample: false };
  } catch (error) {
    if (import.meta.env.DEV) return { ...sampleAdminOverview(range), isSample: true };
    throw error;
  }
}
