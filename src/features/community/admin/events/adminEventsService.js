import { queryString, uploadFile } from "../../../../services/api/api";
import { requestData } from "../../../../services/api/dataClient";
import { criteriaTotal, hackathonStatus, TEAM_SIZE_RANGE } from "./eventHelpers";
import {
  DEFAULT_CRITERIA,
  DEFAULT_PRIZES,
  DEFAULT_RULES,
  SAMPLE_JUDGES,
  sampleCollaborations,
  sampleHackathons,
  sampleParticipants,
  sampleSubmissions,
  sampleTeams,
} from "./sampleAdminEvents";

// Admin: Collaborations (A05–A06), Teams (A07) and Hackathons (A08–A11).
//
// Every endpoint needs an admin session; the backend checks the role and re-checks every rule
// shown on these screens (team size range, criteria weights = 100, judging, publish rules,
// who may be removed or disqualified). The UI only reflects what the API returns.
//
// Collaborations
//   GET    /admin/community/collaborations?search=&category=&access=&status=&page=&pageSize=
//          -> { collaborations: [row], pagination: { page, totalPages, total }, categories: [...],
//               stats: { collaborations, activeTeams, formingTeams, completedTeams, completionRate } }
//          row: { id, title, category, access, minMembers, maxMembers, teamsFormed, activeTeams,
//                 completedTeams, status: "published" | "draft" | "closed", deadline, updatedAt }
//   GET    /admin/community/collaborations/:id -> { collaboration, categories, teamSizeRange: { min, max } }
//   POST   /admin/community/collaborations      { ...collaboration } -> { collaboration }
//   PUT    /admin/community/collaborations/:id  { ...collaboration } -> { collaboration }
//   POST   /admin/community/collaborations/:id/status { status: "published" | "closed" } -> { collaboration }
//   DELETE /admin/community/collaborations/:id   (only allowed while no team has formed)
//
// Teams
//   GET    /admin/community/teams?search=&collaboration=&status=&page=&pageSize=&all=
//          -> { teams: [team], pagination, projects: [{ id, title }], summary: { teams, projects } }
//          team: { id, name, collaborationId, projectTitle, maxMembers, progress (0–100),
//                  status: "forming" | "active" | "submitted" | "completed" | "incomplete" | "flagged",
//                  reports, lastActivityAt, formedAt, deadline, repository,
//                  members: [{ id, name, initials, role, isLeader, tasksDone, tasksTotal, commits, messages }] }
//   POST   /admin/community/teams/:id/remove { reason } (reason is emailed to the members)
//
// Hackathons
//   GET    /admin/community/hackathons?tab=scheduled|live|ended|drafts&search=&category=
//          -> { hackathons: [row], counts: { scheduled, live, ended, drafts }, live: row | null,
//               recentlyEnded: [row], categories: [...] }
//          row: { id, title, category, status, startsAt, endsAt, registrationClosesAt, participation,
//                 minTeam, maxTeam, prize, registeredCount, teamsCount, submissionsCount,
//                 resultsPublished, judging: { done, total } }
//   GET    /admin/community/hackathons/:id -> { hackathon, categories, judges: [{ id, name, initials }] }
//   POST   /admin/community/hackathons      { ...hackathon }   (status "draft" or "scheduled")
//   PUT    /admin/community/hackathons/:id  { ...hackathon }
//   DELETE /admin/community/hackathons/:id  (drafts only)
//   GET    /admin/community/hackathons/:id/participants?search=&status=&membership=&page=&pageSize=&all=
//          -> { hackathon: { id, title, startsAt, registrationClosesAt, participation, minTeam, maxTeam, participantLimit },
//               participants: [{ id, name, initials, username, email, team, isLeader,
//                                membership: "free" | "premium" | "premium_plus", registeredAt,
//                                status: "registered" | "disqualified", disqualifyReason }],
//               pagination, stats: { registered, teams, withoutTeam, disqualified } }
//   POST   /admin/community/hackathons/:id/participants/:participantId/status { status, reason }
//   POST   /admin/community/hackathons/:id/participants/message { subject, body, recipientIds: [...] | null, sendEmail }
//          (recipientIds null = everyone registered)
//   GET    /admin/community/hackathons/:id/submissions?search=&judging=&page=&pageSize=&all=
//          -> { hackathon: { id, title, status, endsAt, participation, prizes, judges, resultsPublished },
//               submissions: [{ id, rank, team, members, individual, project, projectUrl, submittedAt, late,
//                               judges: [{ id, name, score | null }], average | null,
//                               judging: "judged" | "partial" | "awaiting" | "late" }],
//               pagination, stats: { submissions, registeredTeams, judged, awaiting, judges, assignBy },
//               winners: [top three rows], needsSecondJudge }
//   POST   /admin/community/hackathons/:id/submissions/:submissionId/judges { judgeId }
//   POST   /admin/community/hackathons/:id/results/publish { sendEmail, postAnnouncement } -> { hackathon }
//          (grants the 1st-place Premium month on the server; results cannot be unpublished)
//
// Export CSV: the pages build the CSV in the browser. They call the same list endpoint with
// all=1 (every row matching the current filters, no paging) and download it as a Blob.
//
// On the local dev server, when those requests fail, the pages use an in-memory sample store,
// so every button can be tried. Changes last until the page reloads.

export const COLLABORATIONS_PAGE_SIZE = 6;
export const TEAMS_PAGE_SIZE = 10;
export const PARTICIPANTS_PAGE_SIZE = 8;
export const SUBMISSIONS_PAGE_SIZE = 7;

export function emptyCollaboration() {
  return {
    id: null,
    title: "",
    category: "",
    level: "",
    access: "free",
    description: "",
    minMembers: TEAM_SIZE_RANGE.min,
    maxMembers: TEAM_SIZE_RANGE.max,
    anyoneCanStart: true,
    leadersApprove: true,
    skills: [],
    roles: [{ name: "", responsibility: "" }],
    submissionRequirements: "",
    formats: ["github", "live"],
    formUntil: "",
    deadline: "",
    pointsPerMember: 100,
    status: "draft",
  };
}

export function emptyHackathon() {
  return {
    id: null,
    title: "",
    category: "",
    access: "free",
    description: "",
    rules: DEFAULT_RULES,
    bannerUrl: "",
    startsAt: "",
    endsAt: "",
    registrationClosesAt: "",
    timezone: "Africa/Lagos",
    participation: "teams",
    minTeam: 2,
    maxTeam: 3,
    participantLimit: 300,
    criteria: structuredClone(DEFAULT_CRITERIA),
    submissionInstructions: "",
    prizes: { ...DEFAULT_PRIZES },
    judges: [],
    status: "draft",
  };
}

// ---------- shared request helpers ----------

const send = (method, path, body) => requestData(path, undefined, { method, body: body === undefined ? undefined : JSON.stringify(body) });
const delay = (value) => new Promise((resolve) => { window.setTimeout(() => resolve(value), 300); });

async function load(path, check, sample) {
  try {
    const result = await requestData(path);
    if (!check(result)) throw new Error("This information is not available yet.");
    return { ...result, isSample: false };
  } catch (error) {
    if (import.meta.env.DEV) return { ...sample(), isSample: true };
    throw error;
  }
}

// Runs a change against the API. On the local dev server, if the API isn't there (no response,
// not found, not signed in, or a server error), the change goes to the sample store instead.
// Real validation errors (400 / 409 / 422) are always shown.
async function mutate(real, sampleChange, sample) {
  if (sample) return delay(sampleChange());
  try {
    return await real();
  } catch (error) {
    const missing = !error.status || [401, 403, 404, 405].includes(error.status) || error.status >= 500;
    if (import.meta.env.DEV && missing) return delay(sampleChange());
    throw error;
  }
}

const enc = encodeURIComponent;

function pageOf(list, page, pageSize, all) {
  if (all) return { rows: list, pagination: { page: 1, totalPages: 1, total: list.length } };
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  const current = Math.min(Math.max(1, Number(page) || 1), totalPages);
  return { rows: list.slice((current - 1) * pageSize, current * pageSize), pagination: { page: current, totalPages, total: list.length } };
}

// ---------- collaborations ----------

export function getAdminCollaborations(filters) {
  const params = { ...filters, pageSize: COLLABORATIONS_PAGE_SIZE };
  return load(`/admin/community/collaborations${queryString(params)}`, (result) => Array.isArray(result?.collaborations), () => listCollaborationsSample(params));
}

export async function getAdminCollaboration({ id }) {
  if (!id) return { collaboration: emptyCollaboration(), categories: collabCategories(), teamSizeRange: TEAM_SIZE_RANGE, isSample: false, isNew: true };
  try {
    const result = await requestData(`/admin/community/collaborations/${enc(id)}`);
    if (!result?.collaboration) throw new Error("This collaboration could not be found.");
    return { teamSizeRange: TEAM_SIZE_RANGE, ...result, isSample: false };
  } catch (error) {
    if (import.meta.env.DEV) {
      const item = stores().collaborations.find((entry) => entry.id === id);
      if (!item) throw new Error("This collaboration could not be found.", { cause: error });
      return { collaboration: structuredClone(item), categories: collabCategories(), teamSizeRange: TEAM_SIZE_RANGE, isSample: true };
    }
    throw error;
  }
}

export function saveAdminCollaboration(collaboration, { sample } = {}) {
  return mutate(
    () => (collaboration.id
      ? send("PUT", `/admin/community/collaborations/${enc(collaboration.id)}`, collaboration)
      : send("POST", "/admin/community/collaborations", collaboration)),
    () => ({ collaboration: saveSampleItem(stores().collaborations, collaboration) }),
    sample,
  );
}

export function setAdminCollaborationStatus(id, status, { sample } = {}) {
  return mutate(
    () => send("POST", `/admin/community/collaborations/${enc(id)}/status`, { status }),
    () => ({ collaboration: updateSampleItem(stores().collaborations, id, { status }) }),
    sample,
  );
}

export function deleteAdminCollaboration(id, { sample } = {}) {
  return mutate(
    () => send("DELETE", `/admin/community/collaborations/${enc(id)}`),
    () => {
      const state = stores();
      if (state.teams.some((team) => team.collaborationId === id)) throw new Error("Teams have formed on this project. Close it instead of deleting it.");
      state.collaborations = state.collaborations.filter((item) => item.id !== id);
      return {};
    },
    sample,
  );
}

// Returns { field: message }. Drafts only need a title; publishing needs everything.
export function validateCollaboration(item, { publishing, range = TEAM_SIZE_RANGE }) {
  const errors = {};
  if (!item.title.trim()) errors.title = "Give the project a title.";
  else if (item.title.trim().length > 120) errors.title = "Keep the title under 120 characters.";
  const min = Number(item.minMembers);
  const max = Number(item.maxMembers);
  if (!Number.isInteger(min) || min < range.min || min > range.max) errors.minMembers = `Minimum members must be between ${range.min} and ${range.max}.`;
  if (!Number.isInteger(max) || max < range.min || max > range.max) errors.maxMembers = `Maximum members must be between ${range.min} and ${range.max}.`;
  else if (!errors.minMembers && max < min) errors.maxMembers = "Maximum members can't be lower than the minimum.";
  if (item.formUntil && item.deadline && item.deadline < item.formUntil) errors.deadline = "The submission deadline must be after teams stop forming.";
  if (item.pointsPerMember !== "" && (Number(item.pointsPerMember) < 0 || Number(item.pointsPerMember) > 1000)) errors.pointsPerMember = "Points must be between 0 and 1,000.";
  if (!publishing) return errors;

  if (!item.category) errors.category = "Choose a category.";
  if (!item.level) errors.level = "Choose a difficulty.";
  if (!item.description.trim()) errors.description = "Write the project description students will read.";
  if (!item.roles.some((role) => role.name.trim())) errors.roles = "Add at least one role.";
  else if (item.roles.some((role) => !role.name.trim() && role.responsibility.trim())) errors.roles = "Every role needs a name.";
  if (!item.submissionRequirements.trim()) errors.submissionRequirements = "Explain what each team must submit.";
  if (item.formats.length === 0) errors.formats = "Accept at least one format.";
  if (!item.formUntil) errors.formUntil = "Choose the last day teams can form.";
  else if (item.formUntil < new Date().toISOString().slice(0, 10) && item.status !== "published") errors.formUntil = "This date has passed. Choose a future date.";
  if (!item.deadline) errors.deadline = "Choose a submission deadline.";
  if (item.pointsPerMember === "") errors.pointsPerMember = "Enter the points each member gets (0 for none).";
  return errors;
}

// ---------- teams ----------

export function getAdminTeams(filters) {
  const params = { ...filters, pageSize: TEAMS_PAGE_SIZE };
  return load(`/admin/community/teams${queryString({ ...params, all: params.all ? 1 : "" })}`, (result) => Array.isArray(result?.teams), () => listTeamsSample(params));
}

export function removeAdminTeam(id, reason, { sample } = {}) {
  return mutate(
    () => send("POST", `/admin/community/teams/${enc(id)}/remove`, { reason }),
    () => {
      const state = stores();
      state.teams = state.teams.filter((team) => team.id !== id);
      return {};
    },
    sample,
  );
}

// ---------- hackathons ----------

export function getAdminHackathons(filters) {
  return load(`/admin/community/hackathons${queryString(filters)}`, (result) => Array.isArray(result?.hackathons), () => listHackathonsSample(filters));
}

export async function getAdminHackathon({ id }) {
  if (!id) return { hackathon: emptyHackathon(), categories: hackathonCategories(), judges: SAMPLE_JUDGES, isSample: false, isNew: true };
  try {
    const result = await requestData(`/admin/community/hackathons/${enc(id)}`);
    if (!result?.hackathon) throw new Error("This hackathon could not be found.");
    return { ...result, isSample: false };
  } catch (error) {
    if (import.meta.env.DEV) {
      const item = findHackathon(id, error);
      return { hackathon: { ...structuredClone(item), status: hackathonStatus(item) }, categories: hackathonCategories(), judges: SAMPLE_JUDGES, isSample: true };
    }
    throw error;
  }
}

export function saveAdminHackathon(hackathon, { sample } = {}) {
  return mutate(
    () => (hackathon.id
      ? send("PUT", `/admin/community/hackathons/${enc(hackathon.id)}`, hackathon)
      : send("POST", "/admin/community/hackathons", hackathon)),
    () => {
      const saved = saveSampleItem(stores().hackathons, { ...hackathon, status: hackathon.status === "draft" ? "draft" : "scheduled" }, { registeredCount: 0, resultsPublished: false });
      return { hackathon: { ...saved, status: hackathonStatus(saved) } };
    },
    sample,
  );
}

export function deleteAdminHackathon(id, { sample } = {}) {
  return mutate(
    () => send("DELETE", `/admin/community/hackathons/${enc(id)}`),
    () => {
      const state = stores();
      state.hackathons = state.hackathons.filter((item) => item.id !== id);
      return {};
    },
    sample,
  );
}

export function validateHackathon(item, { publishing }) {
  const errors = {};
  if (!item.title.trim()) errors.title = "Give the hackathon a title.";
  else if (item.title.trim().length > 120) errors.title = "Keep the title under 120 characters.";
  const starts = item.startsAt ? new Date(item.startsAt).getTime() : null;
  const ends = item.endsAt ? new Date(item.endsAt).getTime() : null;
  const closes = item.registrationClosesAt ? new Date(item.registrationClosesAt).getTime() : null;
  if (starts && ends && ends <= starts) errors.endsAt = "The end must be after the start.";
  if (starts && closes && closes > starts) errors.registrationClosesAt = "Registration must close before the hackathon starts.";
  if (item.participation === "teams") {
    const min = Number(item.minTeam);
    const max = Number(item.maxTeam);
    if (!Number.isInteger(min) || min < 2 || min > 6) errors.minTeam = "Minimum team size must be between 2 and 6.";
    if (!Number.isInteger(max) || max < 2 || max > 6) errors.maxTeam = "Maximum team size must be between 2 and 6.";
    else if (!errors.minTeam && max < min) errors.maxTeam = "Maximum team size can't be lower than the minimum.";
  }
  if (item.participantLimit !== "" && (!Number.isInteger(Number(item.participantLimit)) || Number(item.participantLimit) < 1)) errors.participantLimit = "Enter a whole number, or leave it empty for no limit.";
  if (!publishing) return errors;

  if (!item.category) errors.category = "Choose a category.";
  if (!item.description.trim()) errors.description = "Describe the challenge.";
  if (!item.rules.trim()) errors.rules = "Add the rules.";
  if (!starts) errors.startsAt = "Choose when the hackathon starts.";
  else if (starts < Date.now() && hackathonStatus(item) === "draft") errors.startsAt = "The start time has passed. Choose a future time.";
  if (!ends) errors.endsAt = "Choose when the hackathon ends.";
  if (!closes) errors.registrationClosesAt = "Choose when registration closes.";
  const named = item.criteria.filter((criterion) => criterion.name.trim() || criterion.weight !== "");
  if (named.length === 0) errors.criteria = "Add at least one evaluation criterion.";
  else if (named.some((criterion) => !criterion.name.trim())) errors.criteria = "Every criterion needs a name.";
  else if (criteriaTotal(item.criteria) !== 100) errors.criteria = `Weights add up to ${criteriaTotal(item.criteria)}%. They must total 100%.`;
  if (!item.submissionInstructions.trim()) errors.submissionInstructions = "Tell participants what to submit.";
  if (!item.prizes.first.trim()) errors.prizes = "Describe the 1st place prize.";
  if (item.judges.length === 0) errors.judges = "Assign at least one judge.";
  return errors;
}

// Banner uploads go to the existing /uploads endpoint. In sample mode the file stays in the browser.
export function uploadEventImage(file, { sample } = {}) {
  return mutate(
    async () => {
      const uploaded = await uploadFile(file, "image");
      return { url: uploaded.url, name: file.name };
    },
    () => ({ url: URL.createObjectURL(file), name: file.name, local: true }),
    sample,
  );
}

// ---------- participants ----------

export function getHackathonParticipants(filters) {
  const { id, ...rest } = filters;
  const params = { ...rest, pageSize: PARTICIPANTS_PAGE_SIZE, all: rest.all ? 1 : "" };
  return load(`/admin/community/hackathons/${enc(id)}/participants${queryString(params)}`, (result) => Array.isArray(result?.participants), () => listParticipantsSample(id, { ...rest, pageSize: PARTICIPANTS_PAGE_SIZE }));
}

export function setParticipantStatus(hackathonId, participantId, status, reason, { sample } = {}) {
  return mutate(
    () => send("POST", `/admin/community/hackathons/${enc(hackathonId)}/participants/${enc(participantId)}/status`, { status, reason }),
    () => {
      const person = participantsFor(findHackathon(hackathonId)).find((item) => item.id === participantId);
      if (!person) throw new Error("This participant could not be found.");
      Object.assign(person, { status, disqualifyReason: status === "disqualified" ? reason : "" });
      return { participant: { ...person } };
    },
    sample,
  );
}

export function messageParticipants(hackathonId, message, { sample } = {}) {
  return mutate(
    () => send("POST", `/admin/community/hackathons/${enc(hackathonId)}/participants/message`, message),
    () => {
      const people = participantsFor(findHackathon(hackathonId)).filter((item) => item.status === "registered");
      return { sent: message.recipientIds ? message.recipientIds.length : people.length };
    },
    sample,
  );
}

// ---------- submissions ----------

export function getHackathonSubmissions(filters) {
  const { id, ...rest } = filters;
  const params = { ...rest, pageSize: SUBMISSIONS_PAGE_SIZE, all: rest.all ? 1 : "" };
  return load(`/admin/community/hackathons/${enc(id)}/submissions${queryString(params)}`, (result) => Array.isArray(result?.submissions), () => listSubmissionsSample(id, { ...rest, pageSize: SUBMISSIONS_PAGE_SIZE }));
}

export function assignJudge(hackathonId, submissionId, judgeId, { sample } = {}) {
  return mutate(
    () => send("POST", `/admin/community/hackathons/${enc(hackathonId)}/submissions/${enc(submissionId)}/judges`, { judgeId }),
    () => {
      const hackathon = findHackathon(hackathonId);
      const submission = submissionsFor(hackathon).find((item) => item.id === submissionId);
      const judge = [...hackathon.judges, ...SAMPLE_JUDGES].find((item) => item.id === judgeId);
      if (!submission || !judge) throw new Error("That judge could not be assigned.");
      if (!submission.judges.some((item) => item.id === judgeId)) submission.judges.push({ id: judge.id, name: judge.name, score: null });
      return {};
    },
    sample,
  );
}

export function publishHackathonResults(hackathonId, options, { sample } = {}) {
  return mutate(
    () => send("POST", `/admin/community/hackathons/${enc(hackathonId)}/results/publish`, options),
    () => {
      const hackathon = findHackathon(hackathonId);
      if (hackathonStatus(hackathon) !== "ended") throw new Error("Results can only be published after the hackathon ends.");
      hackathon.resultsPublished = true;
      return { hackathon: { ...hackathon } };
    },
    sample,
  );
}

// ---------- sample store (local dev only) ----------

let state = null;
const participantCache = new Map();
const submissionCache = new Map();

function stores() {
  if (!state) {
    const collaborations = sampleCollaborations();
    state = { collaborations, teams: sampleTeams(collaborations), hackathons: sampleHackathons() };
  }
  return state;
}

const unique = (values) => [...new Set(values)].sort((a, b) => a.localeCompare(b));
const collabCategories = () => unique(stores().collaborations.map((item) => item.category));
const hackathonCategories = () => unique(["FinTech", "Product Design", "Web Development", "Data Analysis", "AI & Machine Learning", "Mobile Development", "Graphic Design", "Health", ...stores().hackathons.map((item) => item.category)]);
const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "item";

function findHackathon(id, cause) {
  const item = stores().hackathons.find((entry) => entry.id === id);
  if (!item) throw new Error("This hackathon could not be found.", { cause });
  return item;
}

function saveSampleItem(list, item, createExtras = {}) {
  const now = new Date().toISOString();
  if (item.id) {
    const index = list.findIndex((entry) => entry.id === item.id);
    if (index < 0) throw new Error("This item could not be found.");
    list[index] = { ...list[index], ...item, updatedAt: now };
    return structuredClone(list[index]);
  }
  let id = slugify(item.title);
  while (list.some((entry) => entry.id === id)) id = `${id}-2`;
  const created = { ...item, ...createExtras, id, createdAt: now, createdBy: "You", updatedAt: now };
  list.unshift(created);
  return structuredClone(created);
}

function updateSampleItem(list, id, changes) {
  const item = list.find((entry) => entry.id === id);
  if (!item) throw new Error("This item could not be found.");
  Object.assign(item, changes, { updatedAt: new Date().toISOString() });
  return structuredClone(item);
}

function teamCounts(collaborationId) {
  const teams = stores().teams.filter((team) => team.collaborationId === collaborationId);
  return {
    teamsFormed: teams.length,
    activeTeams: teams.filter((team) => ["forming", "active", "submitted", "flagged"].includes(team.status)).length,
    completedTeams: teams.filter((team) => team.status === "completed").length,
  };
}

function listCollaborationsSample({ search = "", category = "", access = "", status = "", page = 1, pageSize }) {
  const { collaborations, teams } = stores();
  const term = search.trim().toLowerCase();
  const matches = collaborations
    .filter((item) => (
      (!term || `${item.title} ${item.category} ${item.skills.join(" ")}`.toLowerCase().includes(term))
      && (!category || item.category === category)
      && (!access || item.access === access)
      && (!status || item.status === status)
    ))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const { rows, pagination } = pageOf(matches, page, pageSize);
  const completed = teams.filter((team) => team.status === "completed").length;
  const finished = completed + teams.filter((team) => team.status === "incomplete").length;
  return {
    collaborations: rows.map((item) => ({
      id: item.id, title: item.title, category: item.category, access: item.access, minMembers: item.minMembers, maxMembers: item.maxMembers,
      status: item.status, deadline: item.deadline, updatedAt: item.updatedAt, ...teamCounts(item.id),
    })),
    pagination,
    categories: collabCategories(),
    stats: {
      collaborations: collaborations.length,
      activeTeams: teams.filter((team) => ["active", "submitted", "flagged"].includes(team.status)).length,
      formingTeams: teams.filter((team) => team.status === "forming").length,
      completedTeams: completed,
      completionRate: finished ? Math.round((completed / finished) * 100) : null,
    },
  };
}

function listTeamsSample({ search = "", collaboration = "", status = "", page = 1, pageSize, all }) {
  const { teams, collaborations } = stores();
  const term = search.trim().toLowerCase();
  const matches = teams
    .filter((team) => (
      (!term || `${team.name} ${team.projectTitle} ${team.members.map((member) => member.name).join(" ")}`.toLowerCase().includes(term))
      && (!collaboration || team.collaborationId === collaboration)
      && (!status || team.status === status)
    ))
    .sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt));
  const { rows, pagination } = pageOf(matches, page, pageSize, all);
  const withTeams = collaborations.filter((item) => teams.some((team) => team.collaborationId === item.id));
  return {
    teams: structuredClone(rows),
    pagination,
    projects: withTeams.map((item) => ({ id: item.id, title: item.title })).sort((a, b) => a.title.localeCompare(b.title)),
    summary: { teams: teams.length, projects: withTeams.length },
  };
}

function participantsFor(hackathon) {
  if (!participantCache.has(hackathon.id)) participantCache.set(hackathon.id, sampleParticipants(hackathon));
  return participantCache.get(hackathon.id);
}

function submissionsFor(hackathon) {
  if (!submissionCache.has(hackathon.id)) submissionCache.set(hackathon.id, sampleSubmissions(hackathon, participantsFor(hackathon)));
  return submissionCache.get(hackathon.id);
}

function judgingProgress(hackathon) {
  const submissions = submissionsFor(hackathon);
  const assigned = hackathon.judges.filter((judge) => submissions.some((item) => item.judges.some((entry) => entry.id === judge.id)));
  const done = assigned.filter((judge) => submissions.every((item) => item.judges.every((entry) => entry.id !== judge.id || entry.score !== null)));
  return { done: done.length, total: hackathon.judges.length };
}

function hackathonRow(item) {
  const status = hackathonStatus(item);
  const participants = item.registeredCount ? participantsFor(item) : [];
  const teams = new Set(participants.filter((person) => person.team).map((person) => person.team)).size;
  const submissions = status === "live" || status === "ended" ? submissionsFor(item).length : 0;
  return {
    id: item.id, title: item.title, category: item.category, status, startsAt: item.startsAt, endsAt: item.endsAt,
    registrationClosesAt: item.registrationClosesAt, participation: item.participation, minTeam: item.minTeam, maxTeam: item.maxTeam,
    prize: item.prizes.first.replace(/^1 month CodeRise Premium$/, "1 month Premium"), registeredCount: item.registeredCount,
    teamsCount: teams, submissionsCount: submissions, resultsPublished: item.resultsPublished,
    judging: status === "ended" ? judgingProgress(item) : null,
  };
}

function listHackathonsSample({ tab = "scheduled", search = "", category = "" }) {
  const rows = stores().hackathons.map(hackathonRow);
  const tabStatus = { scheduled: "scheduled", live: "live", ended: "ended", drafts: "draft" };
  const term = search.trim().toLowerCase();
  const inTab = rows
    .filter((row) => row.status === (tabStatus[tab] ?? "scheduled"))
    .filter((row) => (!term || `${row.title} ${row.category}`.toLowerCase().includes(term)) && (!category || row.category === category))
    .sort((a, b) => (tab === "ended" ? b.startsAt.localeCompare(a.startsAt) : a.startsAt.localeCompare(b.startsAt)));
  const count = (status) => rows.filter((row) => row.status === status).length;
  return {
    hackathons: inTab,
    counts: { scheduled: count("scheduled"), live: count("live"), ended: count("ended"), drafts: count("draft") },
    live: rows.find((row) => row.status === "live") ?? null,
    // Latest ended first, plus any still being judged so they are not forgotten.
    recentlyEnded: rows
      .filter((row) => row.status === "ended")
      .sort((a, b) => b.endsAt.localeCompare(a.endsAt))
      .filter((row, index) => index < 2 || !row.resultsPublished)
      .slice(0, 3),
    categories: hackathonCategories(),
  };
}

function listParticipantsSample(id, { search = "", status = "", membership = "", page = 1, pageSize, all }) {
  const hackathon = findHackathon(id);
  const people = participantsFor(hackathon);
  const term = search.trim().toLowerCase();
  const matches = people.filter((person) => (
    (!term || `${person.name} ${person.email} ${person.team ?? ""}`.toLowerCase().includes(term))
    && (!status
      || (status === "looking" ? person.status === "registered" && !person.team && hackathon.participation === "teams" : person.status === status))
    && (!membership || person.membership === membership)
  ));
  const { rows, pagination } = pageOf(matches, page, pageSize, all);
  const active = people.filter((person) => person.status === "registered");
  return {
    hackathon: {
      id: hackathon.id, title: hackathon.title, startsAt: hackathon.startsAt, registrationClosesAt: hackathon.registrationClosesAt,
      participation: hackathon.participation, minTeam: hackathon.minTeam, maxTeam: hackathon.maxTeam, participantLimit: hackathon.participantLimit,
      status: hackathonStatus(hackathon),
    },
    participants: rows.map((person) => ({ ...person })),
    pagination,
    stats: {
      registered: people.length,
      teams: new Set(active.filter((person) => person.team).map((person) => person.team)).size,
      withoutTeam: hackathon.participation === "teams" ? active.filter((person) => !person.team).length : null,
      disqualified: people.filter((person) => person.status === "disqualified").length,
    },
  };
}

function judgingState(submission) {
  if (submission.late) return "late";
  if (submission.judges.length === 0) return "awaiting";
  const scored = submission.judges.filter((judge) => judge.score !== null).length;
  return submission.judges.length >= 2 && scored === submission.judges.length ? "judged" : "partial";
}

function listSubmissionsSample(id, { search = "", judging = "", page = 1, pageSize, all }) {
  const hackathon = findHackathon(id);
  const enriched = submissionsFor(hackathon).map((item) => {
    const scores = item.judges.map((judge) => judge.score).filter((score) => score !== null);
    return {
      ...structuredClone(item),
      average: scores.length && !item.late ? Math.round((scores.reduce((sum, score) => sum + score, 0) / scores.length) * 10) / 10 : null,
      judging: judgingState(item),
    };
  });
  enriched.sort((a, b) => (a.late - b.late) || ((b.average ?? -1) - (a.average ?? -1)));
  let rank = 0;
  enriched.forEach((item) => { item.rank = item.average !== null ? (rank += 1) : null; });
  const term = search.trim().toLowerCase();
  const matches = enriched.filter((item) => (
    (!term || `${item.team} ${item.project} ${item.members.join(" ")}`.toLowerCase().includes(term))
    && (!judging || item.judging === judging)
  ));
  const { rows, pagination } = pageOf(matches, page, pageSize, all);
  const status = hackathonStatus(hackathon);
  const participants = participantsFor(hackathon);
  const registeredTeams = hackathon.participation === "teams"
    ? new Set(participants.filter((person) => person.team && person.status === "registered").map((person) => person.team)).size
    : participants.filter((person) => person.status === "registered").length;
  return {
    hackathon: {
      id: hackathon.id, title: hackathon.title, status, endsAt: hackathon.endsAt, participation: hackathon.participation,
      prizes: { ...hackathon.prizes }, judges: hackathon.judges.length ? hackathon.judges.map((judge) => ({ ...judge })) : SAMPLE_JUDGES.slice(0, 2),
      resultsPublished: hackathon.resultsPublished,
    },
    submissions: rows,
    pagination,
    stats: {
      submissions: enriched.length,
      registeredTeams,
      judged: enriched.filter((item) => item.judging === "judged").length,
      awaiting: enriched.filter((item) => item.judging === "awaiting").length,
      judges: hackathon.judges.length ? hackathon.judges.map((judge) => judge.name) : SAMPLE_JUDGES.slice(0, 2).map((judge) => judge.name),
      assignBy: new Date(new Date(hackathon.endsAt).getTime() + 3 * 86400000).toISOString(),
    },
    winners: enriched.filter((item) => item.rank && item.rank <= 3).map((item) => ({ ...item })),
    needsSecondJudge: enriched.filter((item) => item.judging === "partial").length,
  };
}
