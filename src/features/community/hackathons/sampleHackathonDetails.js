// Sample hackathon detail, workspace and submission data, used only by the local dev server while
// the Community API is not available (see hackathonService.js). It builds on the Hackathon
// Listing sample (SAMPLE_COMMUNITY_HACKATHONS) so ids, titles and dates match the Hackathons tab.
//
// Detail fields (GET /community/hackathons/:id -> { hackathon }), on top of the listing fields:
//   tagline, monthLabel, challenge: { summary, ideas: [{ title, text }] },
//   participation: "team" | "individual", teamSize: { min, max } (team only), teamsCount,
//   rules: [string], criteria: [{ name, weight }] (weights add up to 100),
//   prizes: [{ place: 1 | 2 | 3, title, details, premium }], participationReward,
//   submissionInstructions: [string], organiser: { name, judges: [string] },
//   resultsAt, withdrawUntil (ISO dates),
//   viewerRegistration: null | { mode: "team" | "match" | "individual", teamName, isLeader },
//   viewerHasPremium, results: null | [{ rank, name, project, score, isViewer }],
//   serverNow (ISO date: the server clock, used for countdowns and the deadline).

import { SAMPLE_COMMUNITY_HACKATHONS } from "../sampleCommunityHackathons";

const DAY = 86400000;
const HOUR = 3600000;
const shift = (iso, ms) => new Date(new Date(iso).getTime() + ms).toISOString();

const DEFAULT_CRITERIA = [
  { name: "Solves the problem", weight: 30 },
  { name: "Working functionality", weight: 25 },
  { name: "User experience and design", weight: 20 },
  { name: "Code quality", weight: 15 },
  { name: "Presentation (2-minute demo video)", weight: 10 },
];

const DEFAULT_PRIZES = (teams) => [
  { place: 1, title: "1st place", details: `1 month CodeRise Premium${teams ? " per member" : ""} · winner badge · +300 points`, premium: true },
  { place: 2, title: "2nd place", details: "Recognition certificate · featured portfolio spot · +150 points", premium: false },
  { place: 3, title: "3rd place", details: "Recognition certificate · +100 points", premium: false },
];

const DEFAULT_INSTRUCTIONS = [
  "Public GitHub repository with a README explaining how to run the project",
  "Live link (Vercel, Netlify or similar) or an APK for mobile apps",
  "A demo video of 2 minutes or less (YouTube or Loom link)",
  "Up to 5 screenshots (PNG or JPG, 5 MB each)",
];

const EXTRA = {
  "fintech-for-students": {
    tagline: "Build a tool that helps students budget, save or split shared costs — in 24 hours.",
    challenge: {
      summary: "Many students run out of money before the end of the month, and splitting rent, data bundles or food between flatmates causes arguments. Build a working web or mobile app that helps a student take control of one part of their money.",
      ideas: [
        { title: "Budget planner", text: "Track allowance and spending by category." },
        { title: "Savings goals", text: "Help students save towards fees or a laptop." },
        { title: "Cost splitter", text: "Share bills fairly between flatmates." },
      ],
    },
    teamsCount: 61,
  },
  "build-for-small-businesses": {
    tagline: "Ship a tool that saves a local shop owner an hour a week.",
    challenge: {
      summary: "Market traders in Lagos and Accra track stock in notebooks. Build a simple, mobile-friendly tool that helps a trader record sales, see what is running low and know their best-selling items for the week.",
      ideas: [
        { title: "Sales log", text: "Record a sale in two taps." },
        { title: "Stock alerts", text: "Warn the trader before an item runs out." },
        { title: "Weekly report", text: "Show the week's best sellers." },
      ],
      tags: ["Must work on a phone", "Offline-friendly is a bonus", "Any stack"],
    },
    teamsCount: 48,
  },
  "climate-data-challenge": {
    results: [
      { rank: 1, name: "Team Harmattan", project: "RainReady", score: 91, isViewer: true },
      { rank: 2, name: "Team Baobab", project: "PlantWise Dashboard", score: 87, isViewer: false },
      { rank: 3, name: "Team Sahel", project: "Farmcast", score: 84, isViewer: false },
      { rank: 4, name: "Team Kente", project: "Seasons", score: 79, isViewer: false },
      { rank: 5, name: "Team Okra", project: "Agro Insights", score: 76, isViewer: false },
    ],
    viewerRegistration: { mode: "team", teamName: "Team Harmattan", isLeader: false },
  },
};

const monthFormat = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "Africa/Lagos" });
const shortDay = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "Africa/Lagos" });
const timeOnly = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });

function rulesFor(item, team) {
  const deadline = `${timeOnly.format(new Date(item.endsAt))} WAT on ${shortDay.format(new Date(item.endsAt))}`;
  return [
    team
      ? "Teams of 2 or 3 registered CodeRise students. You can register alone and be matched with a team."
      : "Individual entry only: one registered CodeRise student per entry.",
    "All code and designs must be created during the 24 hours. Open-source libraries and UI kits are allowed.",
    team ? `One submission per team, made by the team leader before ${deadline}.` : `One submission per student, made before ${deadline}.`,
    "Late submissions are not accepted. The upload closes automatically at the deadline.",
    "Plagiarised or AI-generated projects without meaningful changes will be disqualified.",
  ];
}

export function buildSampleHackathon(item) {
  const team = item.format !== "Individual";
  const extra = EXTRA[item.id] ?? {};
  const registered = item.viewerRegistered;
  return {
    ...item,
    tagline: extra.tagline ?? item.description,
    monthLabel: monthFormat.format(new Date(item.startsAt)),
    challenge: extra.challenge ?? { summary: item.description, ideas: [] },
    participation: team ? "team" : "individual",
    teamSize: team ? { min: 2, max: 3 } : null,
    teamsCount: extra.teamsCount ?? (team ? Math.round(item.registeredCount / 2.8) : null),
    rules: rulesFor(item, team),
    criteria: DEFAULT_CRITERIA,
    prizes: DEFAULT_PRIZES(team),
    participationReward: `Every ${team ? "team" : "student"} that submits gets a participation certificate and +50 points.`,
    submissionInstructions: DEFAULT_INSTRUCTIONS,
    organiser: { name: "CodeRise Community Team", judges: ["Grace Adeyemi", "Tunde Bello"] },
    resultsAt: shift(item.endsAt, 4 * DAY),
    withdrawUntil: item.registrationClosesAt,
    viewerRegistration: extra.viewerRegistration ?? (registered
      ? (team ? { mode: "team", teamName: "Team Byte", isLeader: true } : { mode: "individual", teamName: null, isLeader: true })
      : null),
    viewerHasPremium: false,
    results: item.status === "past" && item.winner ? (extra.results ?? [
      { rank: 1, name: item.winner, project: "Winning entry", score: 90, isViewer: false },
      { rank: 2, name: team ? "Team Ember" : "Bola Adebayo", project: "Runner-up entry", score: 85, isViewer: false },
      { rank: 3, name: team ? "Team Delta" : "Kofi Asante", project: "Third-place entry", score: 81, isViewer: false },
    ]) : null,
    serverNow: new Date().toISOString(),
  };
}

export const findSampleHackathon = (id) => SAMPLE_COMMUNITY_HACKATHONS.find((item) => item.id === id);

// Workspace (GET /community/hackathons/:id/workspace -> { workspace }):
//   team: { name, members: [{ name, username, role, isLeader, presence: "online" | "away" }] } | null,
//   viewerIsLeader, summary, summaryTags: [string],
//   checklist: [{ id, label, assignee, done }],
//   announcements: [{ id, kind: "info" | "warning" | "start", title, body, postedAt }],
//   resources: [{ id, label, kind: "file" | "download" | "video", url }],
//   submission: { status: "none" | "draft" | "submitted", updatedAt },
//   serverNow.
export function buildSampleWorkspace(hackathon) {
  const team = hackathon.participation === "team";
  const members = team ? [
    { name: "Amara Okafor", username: "amara-okafor", role: "Frontend", isLeader: true, presence: "online", isViewer: true },
    { name: "Kemi Martins", username: "kemi-martins", role: "UI design", isLeader: false, presence: "online" },
    { name: "Samuel Owusu", username: "samuel-owusu", role: "Backend", isLeader: false, presence: "away" },
  ] : [];
  return {
    team: team ? { name: hackathon.viewerRegistration?.teamName ?? "Team Byte", members, maxSize: hackathon.teamSize.max } : null,
    viewerIsLeader: Boolean(hackathon.viewerRegistration?.isLeader),
    summary: hackathon.challenge.summary,
    summaryTags: hackathon.challenge.tags ?? [],
    checklist: [
      { id: "repo", label: "Create the GitHub repository and README", assignee: "Samuel", done: true },
      { id: "screens", label: "Finish sales and stock screens", assignee: "Amara", done: true },
      { id: "deploy", label: "Deploy a live version", assignee: "Samuel", done: false },
      { id: "video", label: "Record a demo video (max 3 min)", assignee: "Kemi", done: false },
      { id: "shots", label: "Take up to 5 screenshots", assignee: "Kemi", done: false },
    ],
    announcements: [
      { id: "an1", kind: "info", title: "Mentor office hours at 18:00 WAT", body: "Grace Adeyemi will answer questions on the live call for 30 minutes. Link in Resources.", postedAt: new Date(Date.now() - 2 * HOUR).toISOString() },
      { id: "an2", kind: "warning", title: "Clarification: demo video length", body: "Videos may be up to 3 minutes. Anything longer won't be watched past 3:00.", postedAt: shift(hackathon.startsAt, 42 * 60000) },
      { id: "an3", kind: "start", title: "The hackathon has started", body: `Good luck to all ${hackathon.teamsCount ?? hackathon.registeredCount} ${team ? "teams" : "participants"}. Read the brief carefully before you start building.`, postedAt: hackathon.startsAt },
    ],
    resources: [
      { id: "brief", label: "Challenge brief (PDF, 420 KB)", kind: "file", url: "https://example.com/brief.pdf" },
      { id: "data", label: "Sample trader data (CSV)", kind: "download", url: "https://example.com/traders.csv" },
      { id: "call", label: "Mentor call link (18:00 WAT)", kind: "video", url: "https://example.com/call" },
    ],
    submission: { status: "none", updatedAt: null },
  };
}

// Submission (GET /community/hackathons/:id/submission -> { submission, ... }):
//   submission: { projectName, githubUrl, liveUrl, videoUrl, description,
//                 screenshots: [{ name, url, size }], confirmed, status: "none" | "draft" | "submitted",
//                 submittedAt, updatedAt }
export function buildSampleSubmission() {
  return {
    projectName: "StockMate",
    githubUrl: "https://github.com/team-byte/stockmate",
    liveUrl: "https://stockmate-byte.vercel.app",
    videoUrl: "",
    description: "StockMate lets market traders log a sale in two taps, warns them when an item is running low and shows the week's best sellers. It works offline and syncs when the phone reconnects.",
    screenshots: [],
    confirmed: false,
    status: "draft",
    submittedAt: null,
    updatedAt: new Date(Date.now() - HOUR).toISOString(),
  };
}
