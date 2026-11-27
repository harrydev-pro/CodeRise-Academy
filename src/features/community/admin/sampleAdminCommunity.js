// Sample admin Community data for the local dev server only (see adminCommunityService.js).
// It mirrors the A01 design and documents the response shapes.

const DAY = 86400000;
const isoDay = (date) => date.toISOString().slice(0, 10);
const daysAgo = (days) => new Date(Date.now() - days * DAY).toISOString();

export function sampleAdminOverview({ to } = {}) {
  const end = to ? new Date(`${to}T00:00:00Z`) : new Date();
  // Eight weekly points ending on the chosen "to" date.
  const premiumTrend = [82, 88, 95, 101, 110, 118, 129, 137].map((count, index) => ({
    day: isoDay(new Date(end.getTime() - (7 - index) * 7 * DAY)),
    count,
  }));

  return {
    stats: {
      members: 1042,
      membersThisMonth: 86,
      premiumMembers: 137,
      premiumConversion: 13.1,
      projects: 64,
      freeProjects: 26,
      premiumProjects: 38,
      activeTeams: 41,
      activeHackathons: 1,
      scheduledHackathons: 2,
      activeCompetitions: 2,
      submissions: 2318,
      pendingReviews: 47,
      pendingOlderThan3Days: 12,
      competitionRevenueUsd: 1385,
      mrrUsd: 1768,
      mrrChangeUsd: 214,
    },
    premiumTrend,
    submissionsByCategory: [
      { title: "Frontend Development", count: 214 },
      { title: "Product Design (UI/UX)", count: 138 },
      { title: "Data Analysis", count: 97 },
      { title: "Backend Development", count: 71 },
    ],
    oldestPending: [
      { id: "sub-1001", student: "Ifeoma Nwosu", project: "E-commerce Storefront", projectType: "premium_project", submittedAt: daysAgo(5), reviewer: null },
      { id: "sub-1002", student: "Team Nova", project: "Event Ticketing Website", projectType: "collaboration", submittedAt: daysAgo(4), reviewer: "Grace Adeyemi" },
      { id: "sub-1003", student: "Samuel Owusu", project: "Authentication REST API", projectType: "free_project", submittedAt: daysAgo(3), reviewer: "Tunde Bello" },
      { id: "sub-1004", student: "Halima Musa", project: "Best Landing Page Design 2026", projectType: "competition", submittedAt: daysAgo(2), reviewer: null },
    ],
    upcomingEvents: [
      { id: "fintech-for-students", type: "hackathon", title: "FinTech for Students Hackathon", detail: "Starts in 9 days, 10:00 WAT · 212 registered" },
      { id: "best-landing-page-2026", type: "competition", title: "Best Landing Page Design 2026", detail: "Registration closes in 3 days · 164 entrants" },
      { id: "best-mobile-application", type: "competition", title: "Best Mobile Application", detail: "$5 entry · 58 paid · closes in 15 days" },
    ],
    moderationQueue: 6,
  };
}
