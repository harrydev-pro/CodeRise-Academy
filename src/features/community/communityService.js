import { queryString } from "../../services/api/api";
import { requestData } from "../../services/api/dataClient";
import { SAMPLE_COMMUNITY_HOME } from "./sampleCommunityHome";
import { PREMIUM_FROM_PRICE, PROJECT_CATEGORIES, SAMPLE_COMMUNITY_PROJECTS } from "./sampleCommunityProjects";
import { SAMPLE_COMMUNITY_COLLABORATIONS, SAMPLE_VIEWER_TEAM } from "./sampleCommunityCollaborations";
import { SAMPLE_COMMUNITY_HACKATHONS } from "./sampleCommunityHackathons";
import { SAMPLE_COMMUNITY_COMPETITIONS } from "./sampleCommunityCompetitions";
import { LEADERBOARD_CATEGORIES, POINT_RULES, SAMPLE_LEADERBOARD, SAMPLE_VIEWER_LEADER } from "./sampleCommunityLeaderboard";
import { SAMPLE_ANNOUNCEMENTS, SAMPLE_EMAIL_PREFERENCES } from "./sampleCommunityAnnouncements";
import { SAMPLE_ACTIVITIES, SAMPLE_ACTIVITY_SUMMARY } from "./sampleCommunityActivities";
import {
  SAMPLE_PROJECT_OF_THE_MONTH,
  SAMPLE_SHOWCASE_COMMENTS,
  SAMPLE_SHOWCASE_PROJECTS,
  SAMPLE_TOP_CREATORS,
  SAMPLE_VIEWER_USERNAME,
  SHOWCASE_CATEGORIES,
} from "./sampleCommunityShowcase";

// The Community API is not live yet. During local development (`npm run dev`) a failed
// request falls back to sample data so the screens can be built and reviewed; pages show a
// notice when it does. Production builds never use the sample: they show the normal error
// message with a retry button instead.

// Community Home (S01): GET /community/home -> { home: {...} }.
export async function getCommunityHome() {
  try {
    const home = await requestData("/community/home", "home");
    if (!home) throw new Error("The community home is not available yet.");
    return { home, isSample: false };
  } catch (error) {
    if (import.meta.env.DEV) return { home: SAMPLE_COMMUNITY_HOME, isSample: true };
    throw error;
  }
}

export const PROJECTS_PAGE_SIZE = 9;

// Project Library (S02): GET /community/projects?search=&category=&access=&level=&sort=&page=&pageSize=
// -> { projects: [...], pagination: { page, totalPages, total }, totalAll, categories: [...], premiumFromPrice }
// access: "free" | "premium"; level: "Beginner" | "Intermediate" | "Advanced" | "Professional";
// sort: "popular" | "recent".
export async function getCommunityProjects(filters) {
  const params = { ...filters, pageSize: PROJECTS_PAGE_SIZE };
  try {
    const result = await requestData(`/community/projects${queryString(params)}`);
    if (!Array.isArray(result?.projects)) throw new Error("The project library is not available yet.");
    return { ...result, isSample: false };
  } catch (error) {
    if (import.meta.env.DEV) return { ...filterSampleProjects(params), isSample: true };
    throw error;
  }
}

// Hackathon Listing (S11): GET /community/hackathons?status=upcoming|live|past
// -> { hackathons: [...], counts: { upcoming, live, past }, viewerHasPremium }
// Upcoming are sorted by start time (soonest first), live by end time, past newest first.
// The backend decides status from server time; the page never trusts the browser clock for it.
export async function getCommunityHackathons(filters) {
  try {
    const result = await requestData(`/community/hackathons${queryString(filters)}`);
    if (!Array.isArray(result?.hackathons)) throw new Error("The hackathon list is not available yet.");
    return { ...result, isSample: false };
  } catch (error) {
    if (import.meta.env.DEV) return { ...filterSampleHackathons(filters), isSample: true };
    throw error;
  }
}

function filterSampleHackathons({ status = "upcoming" }) {
  const byStatus = (value) => SAMPLE_COMMUNITY_HACKATHONS.filter((item) => item.status === value);
  const sorters = {
    upcoming: (a, b) => a.startsAt.localeCompare(b.startsAt),
    live: (a, b) => a.endsAt.localeCompare(b.endsAt),
    past: (a, b) => b.endsAt.localeCompare(a.endsAt),
  };
  return {
    hackathons: byStatus(status).sort(sorters[status] ?? sorters.upcoming),
    counts: { upcoming: byStatus("upcoming").length, live: byStatus("live").length, past: byStatus("past").length },
    viewerHasPremium: false,
  };
}

// Competition Listing (S15): GET /community/competitions?filter=all|open|free|results&search=
// -> { competitions: [...], counts: { all, open, free, results }, viewerRegistrations }
// Open competitions come first (by competition number), then finished ones, newest first.
export async function getCommunityCompetitions(filters) {
  try {
    const result = await requestData(`/community/competitions${queryString(filters)}`);
    if (!Array.isArray(result?.competitions)) throw new Error("The competition list is not available yet.");
    return { ...result, isSample: false };
  } catch (error) {
    if (import.meta.env.DEV) return { ...filterSampleCompetitions(filters), isSample: true };
    throw error;
  }
}

const isOpenCompetition = (item) => item.status === "open" || item.status === "closing_soon";

function filterSampleCompetitions({ filter = "all", search = "" }) {
  const term = search.trim().toLowerCase();
  const searched = SAMPLE_COMMUNITY_COMPETITIONS.filter((item) => !term || `${item.title} ${item.category} ${item.prize}`.toLowerCase().includes(term));
  const tests = {
    all: () => true,
    open: isOpenCompetition,
    free: (item) => item.entryFeeUsd === 0,
    results: (item) => item.status === "results",
  };
  const competitions = searched
    .filter(tests[filter] ?? tests.all)
    .sort((a, b) => (isOpenCompetition(b) - isOpenCompetition(a)) || (isOpenCompetition(a) ? a.number - b.number : b.number - a.number));
  return {
    competitions,
    counts: Object.fromEntries(Object.entries(tests).map(([name, test]) => [name, searched.filter(test).length])),
    viewerRegistrations: SAMPLE_COMMUNITY_COMPETITIONS.filter((item) => item.viewerRegistered).length,
  };
}

export const ACTIVITIES_PAGE_SIZE = 7;

// Which activity types each My Activities tab shows.
export const ACTIVITY_TABS = {
  projects: ["project_submitted", "corrections_requested", "project_approved"],
  teams: ["team_joined"],
  hackathons: ["hackathon_registered"],
  competitions: ["competition_entered"],
  certificates: ["certificate_earned"],
};

// My Activities (S25): GET /community/activities?tab=&before=&pageSize=
// -> { activities: [...newest first], nextCursor: string | null,
//      stats: { projectsCompleted, teamsJoined, hackathons, points },
//      badges: { earned: [{ id, name, earnedAt }], total, next: { name, hint } | null },
//      certificates: [{ id, title, subject, issuedAt, downloadUrl }],
//      pointsThisMonth: { earned, pointsToTop10, top10Progress (0–100) }, viewerUsername }
// tab: "projects" | "teams" | "hackathons" | "competitions" | "certificates" (empty = all).
export async function getMyActivities(filters) {
  const params = { ...filters, pageSize: ACTIVITIES_PAGE_SIZE };
  try {
    const result = await requestData(`/community/activities${queryString(params)}`);
    if (!Array.isArray(result?.activities)) throw new Error("Your activity is not available yet.");
    return { ...result, isSample: false };
  } catch (error) {
    if (import.meta.env.DEV) return { ...filterSampleActivities(params), isSample: true };
    throw error;
  }
}

function filterSampleActivities({ tab = "", before = "", pageSize }) {
  const types = ACTIVITY_TABS[tab];
  const list = SAMPLE_ACTIVITIES
    .filter((item) => !types || types.includes(item.type))
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));
  const start = before ? list.findIndex((item) => item.id === before) + 1 : 0;
  const activities = list.slice(start, start + pageSize);
  const last = activities[activities.length - 1];
  return { ...SAMPLE_ACTIVITY_SUMMARY, activities, nextCursor: last && start + pageSize < list.length ? last.id : null };
}

export const ANNOUNCEMENTS_PAGE_SIZE = 5;

// Announcements (S23): GET /community/announcements?category=&before=&pageSize=
// -> { pinned: {...} | null (first page only), announcements: [...], nextCursor: string | null,
//      emailPreferences: { projects, events, collaboration, platform }, viewerHasPremium }
// `before` is the nextCursor from the previous page ("Load older announcements").
export async function getAnnouncements(filters) {
  const params = { ...filters, pageSize: ANNOUNCEMENTS_PAGE_SIZE };
  try {
    const result = await requestData(`/community/announcements${queryString(params)}`);
    if (!Array.isArray(result?.announcements)) throw new Error("Announcements are not available yet.");
    return { ...result, isSample: false };
  } catch (error) {
    if (import.meta.env.DEV) return { ...filterSampleAnnouncements(params), isSample: true };
    throw error;
  }
}

// POST /community/announcements/read-all
export const markAllAnnouncementsRead = ({ sample } = {}) => (sample ? sampleDelay({}) : post("/community/announcements/read-all"));
// POST /community/announcements/:id/read
export const markAnnouncementRead = (id, { sample } = {}) => (sample ? sampleDelay({}) : post(`/community/announcements/${encodeURIComponent(id)}/read`));
// PUT /community/email-preferences { projects, events, collaboration, platform }
export const saveEmailPreferences = (preferences, { sample } = {}) =>
  sample ? sampleDelay({}) : requestData("/community/email-preferences", undefined, { method: "PUT", body: JSON.stringify(preferences) });

function filterSampleAnnouncements({ category = "", before = "", pageSize }) {
  const matching = SAMPLE_ANNOUNCEMENTS.filter((item) => !category || item.category === category);
  const pinned = before ? null : matching.find((item) => item.pinned) ?? null;
  const list = matching.filter((item) => item !== pinned).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const start = before ? list.findIndex((item) => item.id === before) + 1 : 0;
  const announcements = list.slice(start, start + pageSize);
  const last = announcements[announcements.length - 1];
  return {
    pinned,
    announcements,
    nextCursor: last && start + pageSize < list.length ? last.id : null,
    emailPreferences: SAMPLE_EMAIL_PREFERENCES,
    viewerHasPremium: false,
  };
}

export const LEADERBOARD_PAGE_SIZE = 10;

// Leaderboard (S22): GET /community/leaderboard?period=weekly|monthly|alltime&category=&page=&pageSize=
// -> { entries: [...this page, ranks included], podium: [1st, 2nd, 3rd] (same period + category),
//      pagination: { page, totalPages, total }, periodLabel (e.g. "November"),
//      viewer: { ...entry, rank, pointsToTop10, top10Points } | null,
//      categories: [...], pointRules: [{ label, points }] }
// Points come only from activity the backend has verified; the page never adds them up itself.
export async function getLeaderboard(filters) {
  const params = { ...filters, pageSize: LEADERBOARD_PAGE_SIZE };
  try {
    const result = await requestData(`/community/leaderboard${queryString(params)}`);
    if (!Array.isArray(result?.entries)) throw new Error("The leaderboard is not available yet.");
    return { ...result, isSample: false };
  } catch (error) {
    if (import.meta.env.DEV) return { ...filterSampleLeaderboard(params), isSample: true };
    throw error;
  }
}

function filterSampleLeaderboard({ period = "monthly", category = "", page = 1, pageSize }) {
  // Weekly and all-time totals are scaled from the monthly sample so each tab looks different.
  const scale = { weekly: 0.24, monthly: 1, alltime: 3.4 }[period] ?? 1;
  const ranked = SAMPLE_LEADERBOARD
    .filter((entry) => !category || entry.category === category)
    .map((entry) => ({ ...entry, points: Math.round(entry.points * scale) }))
    .sort((a, b) => b.points - a.points)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  const totalPages = Math.max(1, Math.ceil(ranked.length / pageSize));
  const current = Math.min(Math.max(1, Number(page) || 1), totalPages);
  const viewerEntry = ranked.find((entry) => entry.username === SAMPLE_VIEWER_LEADER.username);
  const tenth = ranked[Math.min(9, ranked.length - 1)];
  const now = new Date();
  return {
    entries: ranked.slice((current - 1) * pageSize, current * pageSize),
    podium: ranked.slice(0, 3),
    pagination: { page: current, totalPages, total: ranked.length },
    periodLabel: { weekly: "This week", monthly: now.toLocaleString("en-GB", { month: "long" }), alltime: "All-time" }[period],
    viewer: viewerEntry ? {
      ...viewerEntry,
      top10Points: tenth.points,
      pointsToTop10: viewerEntry.rank <= 10 ? 0 : tenth.points - viewerEntry.points,
    } : null,
    categories: LEADERBOARD_CATEGORIES,
    pointRules: POINT_RULES,
  };
}

export const SHOWCASE_PAGE_SIZE = 6;

// Project Showcase (S20): GET /community/showcase?category=&sort=appreciated|liked|newest&page=&pageSize=
// -> { projects: [...], pagination: { page, totalPages, total }, categories: [...],
//      projectOfTheMonth: {...} | null, topCreators: [...], viewerUsername }
export async function getShowcase(filters) {
  const params = { ...filters, pageSize: SHOWCASE_PAGE_SIZE };
  try {
    const result = await requestData(`/community/showcase${queryString(params)}`);
    if (!Array.isArray(result?.projects)) throw new Error("The showcase is not available yet.");
    return { ...result, isSample: false };
  } catch (error) {
    if (import.meta.env.DEV) return { ...filterSampleShowcase(params), isSample: true };
    throw error;
  }
}

// GET /community/showcase/:id -> { project: { ...list fields, source, author: { ..., followers, viewerFollowing }, comments: [...] } }
export async function getShowcaseProject({ id }) {
  try {
    const project = await requestData(`/community/showcase/${encodeURIComponent(id)}`, "project");
    if (!project) throw new Error("This project is not available.");
    return { project, isSample: false };
  } catch (error) {
    if (import.meta.env.DEV) {
      const project = SAMPLE_SHOWCASE_PROJECTS.find((item) => item.id === id);
      if (!project) throw new Error("This project is not available.", { cause: error });
      const comments = SAMPLE_SHOWCASE_COMMENTS[id] ?? (project.commentsCount > 0 ? [
        { id: `${id}-c1`, author: { name: "David Mensah", username: "david-mensah" }, body: `Really clean work on ${project.title}. What was the hardest part?`, createdAt: new Date(Date.now() - 86400000).toISOString(), isCreator: false },
      ] : []);
      return { project: { ...project, comments }, isSample: true };
    }
    throw error;
  }
}

// Showcase actions. With `sample: true` (local dev with sample data) nothing is sent: the page
// updates only on screen, so the buttons can be tried before the API exists.
const sampleDelay = (value) => new Promise((resolve) => { window.setTimeout(() => resolve(value), 250); });
const post = (path, body) => requestData(path, undefined, { method: "POST", body: JSON.stringify(body ?? {}) });
const remove = (path) => requestData(path, undefined, { method: "DELETE" });

// POST / DELETE /community/showcase/:id/like
export const setShowcaseLike = (id, liked, { sample } = {}) =>
  sample ? sampleDelay({}) : (liked ? post : remove)(`/community/showcase/${encodeURIComponent(id)}/like`);

// POST /community/showcase/:id/appreciate (one appreciation per person)
export const appreciateShowcaseProject = (id, { sample } = {}) =>
  sample ? sampleDelay({}) : post(`/community/showcase/${encodeURIComponent(id)}/appreciate`);

// POST /community/showcase/:id/comments { body } -> { comment }
export const commentOnShowcaseProject = (id, body, { sample, author } = {}) =>
  sample
    ? sampleDelay({ comment: { id: `local-${Date.now()}`, author, body, createdAt: new Date().toISOString(), isCreator: false } })
    : requestData(`/community/showcase/${encodeURIComponent(id)}/comments`, undefined, { method: "POST", body: JSON.stringify({ body }) });

// POST / DELETE /community/users/:username/follow
export const setFollowing = (username, following, { sample } = {}) =>
  sample ? sampleDelay({}) : (following ? post : remove)(`/community/users/${encodeURIComponent(username)}/follow`);

// POST /community/reports { targetType, targetId, reason, details } (reviewed in A27 Moderation)
export const reportCommunityContent = (report, { sample } = {}) =>
  sample ? sampleDelay({}) : post("/community/reports", report);

function filterSampleShowcase({ category = "", sort = "appreciated", page = 1, pageSize }) {
  const matches = SAMPLE_SHOWCASE_PROJECTS.filter((item) => item.id !== SAMPLE_PROJECT_OF_THE_MONTH.id && (!category || item.category === category));
  const sorters = {
    appreciated: (a, b) => b.appreciations - a.appreciations,
    liked: (a, b) => b.likes - a.likes,
    newest: (a, b) => b.completedAt.localeCompare(a.completedAt),
  };
  matches.sort(sorters[sort] ?? sorters.appreciated);
  const totalPages = Math.max(1, Math.ceil(matches.length / pageSize));
  const current = Math.min(Math.max(1, Number(page) || 1), totalPages);
  return {
    projects: matches.slice((current - 1) * pageSize, current * pageSize),
    pagination: { page: current, totalPages, total: matches.length },
    categories: SHOWCASE_CATEGORIES,
    projectOfTheMonth: SAMPLE_PROJECT_OF_THE_MONTH,
    topCreators: SAMPLE_TOP_CREATORS,
    viewerUsername: SAMPLE_VIEWER_USERNAME,
  };
}

export const COLLABORATIONS_PAGE_SIZE = 6;

// Collaboration Library (S06): GET /community/collaborations?search=&category=&access=&open=&level=&sort=&page=&pageSize=
// -> { collaborations: [...], pagination: { page, totalPages, total },
//      counts: { all, free, premium, open },   // for the filter chips, after search and category
//      categories: [...], viewerTeam: { id, name } | null, viewerHasPremium }
// access: "free" | "premium"; open: "1" = only projects with an open slot;
// level: "Beginner" | "Intermediate" | "Advanced"; sort: "open" | "newest" | "shortest".
export async function getCommunityCollaborations(filters) {
  const params = { ...filters, pageSize: COLLABORATIONS_PAGE_SIZE };
  try {
    const result = await requestData(`/community/collaborations${queryString(params)}`);
    if (!Array.isArray(result?.collaborations)) throw new Error("The collaboration library is not available yet.");
    return { ...result, isSample: false };
  } catch (error) {
    if (import.meta.env.DEV) return { ...filterSampleCollaborations(params), isSample: true };
    throw error;
  }
}

// "10 days" / "3 weeks" -> days, for the "Shortest first" sort in the sample.
function durationInDays(text = "") {
  const [amount, unit = ""] = text.split(" ");
  return (Number(amount) || 0) * (unit.startsWith("week") ? 7 : 1);
}

function filterSampleCollaborations({ search = "", category = "", access = "", open = "", level = "", sort = "open", page = 1, pageSize }) {
  const term = search.trim().toLowerCase();
  const searched = SAMPLE_COMMUNITY_COLLABORATIONS.filter((item) => (
    (!term || `${item.title} ${item.description} ${item.teamType} ${item.skills.join(" ")}`.toLowerCase().includes(term))
    && (!category || item.category === category)
  ));
  const matches = searched.filter((item) => (
    (!access || item.access === access)
    && (!open || item.openSlots > 0)
    && (!level || item.level === level)
  ));
  const sorters = {
    open: (a, b) => b.openSlots - a.openSlots || b.teamsCount - a.teamsCount,
    newest: (a, b) => b.addedAt.localeCompare(a.addedAt),
    shortest: (a, b) => durationInDays(a.duration) - durationInDays(b.duration),
  };
  matches.sort(sorters[sort] ?? sorters.open);

  const totalPages = Math.max(1, Math.ceil(matches.length / pageSize));
  const current = Math.min(Math.max(1, Number(page) || 1), totalPages);
  return {
    collaborations: matches.slice((current - 1) * pageSize, current * pageSize),
    pagination: { page: current, totalPages, total: matches.length },
    counts: {
      all: searched.length,
      free: searched.filter((item) => item.access === "free").length,
      premium: searched.filter((item) => item.access === "premium").length,
      open: searched.filter((item) => item.openSlots > 0).length,
    },
    categories: [...new Set(SAMPLE_COMMUNITY_COLLABORATIONS.map((item) => item.category))].sort(),
    viewerTeam: SAMPLE_VIEWER_TEAM,
    viewerHasPremium: false,
  };
}

function filterSampleProjects({ search = "", category = "", access = "", level = "", sort = "popular", page = 1, pageSize }) {
  const term = search.trim().toLowerCase();
  const matches = SAMPLE_COMMUNITY_PROJECTS.filter((project) => (
    (!term || `${project.title} ${project.description} ${project.category}`.toLowerCase().includes(term))
    && (!category || project.category === category)
    && (!access || project.access === access)
    && (!level || project.level === level)
  ));
  matches.sort(sort === "recent"
    ? (a, b) => b.addedAt.localeCompare(a.addedAt)
    : (a, b) => b.started - a.started);

  const totalPages = Math.max(1, Math.ceil(matches.length / pageSize));
  const current = Math.min(Math.max(1, Number(page) || 1), totalPages);
  return {
    projects: matches.slice((current - 1) * pageSize, current * pageSize),
    pagination: { page: current, totalPages, total: matches.length },
    totalAll: SAMPLE_COMMUNITY_PROJECTS.length,
    categories: PROJECT_CATEGORIES,
    premiumFromPrice: PREMIUM_FROM_PRICE,
  };
}
