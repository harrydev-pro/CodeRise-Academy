// Sample My Activities data, used only by the local dev server while the Community API is not
// available (see communityService.js). It mirrors the S25 design and documents the shape the
// backend is expected to return from GET /community/activities.
//
// Activity fields:
//   id, type ("project_submitted" | "corrections_requested" | "project_approved" | "team_joined" |
//             "hackathon_registered" | "competition_entered" | "badge_earned" | "certificate_earned"),
//   title, occurredAt (ISO date), details: [short lines], link: { label, to } (optional).

const ago = (days, hours = 0) => new Date(Date.now() - (days * 24 + hours) * 3600000).toISOString();

export const SAMPLE_ACTIVITIES = [
  { id: "a1", type: "project_submitted", title: "Submitted Restaurant Landing Page", occurredAt: ago(0, 1), details: ["Waiting for review"], link: { label: "View status", to: "/community/my-projects" } },
  { id: "a2", type: "hackathon_registered", title: "Registered for FinTech for Students Hackathon", occurredAt: ago(8), details: ["Starts Sat, 10:00 WAT · Team Ledger (2 of 3)"], link: { label: "View hackathon", to: "/community/hackathons/fintech-for-students" } },
  { id: "a3", type: "corrections_requested", title: "Corrections requested on Authentication REST API", occurredAt: ago(9), details: ["Score 61/100 · Resubmit within 7 days"], link: { label: "See feedback", to: "/community/my-projects" } },
  { id: "a4", type: "project_approved", title: "Executive Inbox & Calendar Setup approved", occurredAt: ago(11), details: ["88/100 · +50 points"] },
  { id: "a5", type: "team_joined", title: "Joined Team Nova", occurredAt: ago(14), details: ["Event Ticketing Website · Role: Frontend Developer"], link: { label: "Open workspace", to: "/community/teams/team-nova" } },
  { id: "a6", type: "badge_earned", title: "Earned the “Rising Developer” badge", occurredAt: ago(14, 2), details: ["Completed 5 projects in 30 days"] },
  { id: "a7", type: "competition_entered", title: "Entered Best Landing Page Design 2026", occurredAt: ago(17), details: ["Free entry · Submission due in 10 days"], link: { label: "See competition", to: "/community/competitions/best-landing-page-2026" } },
  { id: "a8", type: "certificate_earned", title: "Certificate: Project Completion", occurredAt: ago(14, 4), details: ["Sales Performance Dashboard"] },
  { id: "a9", type: "project_approved", title: "Sales Performance Dashboard approved", occurredAt: ago(14, 5), details: ["92/100 · +50 points"] },
  { id: "a10", type: "team_joined", title: "Joined Team Harmattan", occurredAt: ago(20), details: ["Climate Data Challenge · Role: Data Analyst"] },
  { id: "a11", type: "hackathon_registered", title: "Registered for Climate Data Challenge", occurredAt: ago(21), details: ["Team Harmattan (3 of 3)"] },
  { id: "a12", type: "badge_earned", title: "Earned the “Team Player” badge", occurredAt: ago(18), details: ["Completed your first team project"] },
  { id: "a13", type: "project_approved", title: "Personal Portfolio approved", occurredAt: ago(30), details: ["85/100 · +50 points"] },
  { id: "a14", type: "badge_earned", title: "Earned the “First Project” badge", occurredAt: ago(30, 1), details: ["Your first approved community project"] },
];

export const SAMPLE_ACTIVITY_SUMMARY = {
  viewerUsername: "amara-okafor",
  stats: { projectsCompleted: 5, teamsJoined: 2, hackathons: 1, points: 1240 },
  badges: {
    total: 12,
    earned: [
      { id: "first-project", name: "First Project", earnedAt: ago(30) },
      { id: "rising-developer", name: "Rising Developer", earnedAt: ago(14) },
      { id: "team-player", name: "Team Player", earnedAt: ago(18) },
      { id: "community-helper", name: "Community Helper", earnedAt: ago(16) },
    ],
    next: { name: "Project Master", hint: "Complete 5 more projects" },
  },
  certificates: [
    { id: "cert-1", title: "Project Completion", subject: "Sales Performance Dashboard", issuedAt: ago(14), downloadUrl: null },
    { id: "cert-2", title: "Project Completion", subject: "Executive Inbox & Calendar", issuedAt: ago(11), downloadUrl: null },
  ],
  pointsThisMonth: { earned: 320, pointsToTop10: 410, top10Progress: 75 },
};
