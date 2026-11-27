import { queryString, uploadFile } from "../../../../services/api/api";
import { requestData } from "../../../../services/api/dataClient";
import { buildReviewStore, sampleSubmissionDetail, SAMPLE_COMPETITION_CATEGORIES } from "./sampleReview";

// Admin: competitions, payments, results and the submission review queue (A12–A18).
//
// Every endpoint needs a signed-in admin or an assigned judge/reviewer. The BACKEND enforces who
// can see what: judges and reviewers only get the Submissions, Review and Results data for the
// events they are assigned to, and get 403 for everything else. Responses carry
// `viewerRole: "admin" | "reviewer"`; when it is "reviewer" the pages hide admin-only actions
// (edit, export, payments, reviewer assignment). Hiding is only a convenience, not the guard.
//
// Competitions (A12–A14, A16)
//   GET    /admin/community/competitions?search=&status=&category=&page=&pageSize=
//          -> { competitions: [row], counts: { all, open, judging, completed, draft },
//               stats: { open, entrants, entryFeeRevenueUsd, freeUsed, freeLimit },
//               categories: [...], pagination: { page, totalPages, total }, viewerRole }
//          row: { id, number, title, category, entryFeeUsd, prizeSummary, registrationClosesAt,
//                 submissionDeadline, entrants, participantLimit, status }
//   GET    /admin/community/competitions/meta -> { categories, reviewers, freeUsed, freeLimit, nextNumber }  (for "New competition")
//   GET    /admin/community/competitions/:id -> { competition, categories, reviewers, freeUsed, freeLimit }
//          freeUsed counts the free competitions other than this one.
//   POST   /admin/community/competitions        { ...competition } -> { competition }
//   PUT    /admin/community/competitions/:id    { ...competition } -> { competition }
//   DELETE /admin/community/competitions/:id    (drafts only; 409 otherwise)
//          The first three competitions on the platform are free to enter. After that the
//          backend rejects entryFeeUsd = 0 (422) unless the competition already holds one of
//          the free slots. It also re-checks dates (registration < submission < winners), the
//          criteria total (100) and that at least one judge is assigned before publishing.
//          All dates are ISO strings; the forms show and enter them in West Africa Time.
//   GET    /admin/community/competitions/:id/participants?search=&payment=&submission=&plan=&page=&pageSize=
//          -> { competition: { id, number, title, entryFeeUsd, participantLimit, registrationClosesAt, submissionDeadline, status },
//               stats: { registered, paid, pending, submitted },
//               participants: [{ id, name, initials, email, username, plan, registeredAt,
//                                payment: "paid"|"pending"|"refunded"|"failed"|"plan_benefit"|"free_entry"|"withdrawn",
//                                amountUsd, paymentId, submission: "submitted"|"not_submitted"|"locked"|"withdrawn",
//                                submissionId, score }],
//               pagination, viewerRole }
//   GET    /admin/community/competitions/:id/participants/export?...   -> text/csv
//   GET    /admin/community/competitions/:id/results?limit=
//          -> { competition: { ...summary, prizes, judges, entrants, winnersAnnouncedAt }, entries: [{ id, submissionId, entrant, initials, entryTitle, avgScore,
//               judgesDone, judgesTotal, placement: "first"|"second"|"third"|"mention"|"none" }],
//               total, scored, published, viewerRole }
//   PUT    /admin/community/competitions/:id/results/ranking { entries: [{ id, placement }] }  (in rank order)
//   POST   /admin/community/competitions/:id/results/publish { sendWinnerEmails }
//          The backend issues prizes, certificates and points and sends the emails.
//
// Payments (A15). Card details never reach CodeRise: the payment provider holds them and the
// API only returns the brand and last four digits for display.
//   GET    /admin/community/payments?search=&competition=&status=&page=&pageSize=
//          -> { payments: [{ id, reference, student, competitionId, competition, amountUsd, providerFeeUsd,
//               method, status: "verified"|"pending"|"failed"|"refunded", note, createdAt }],
//               stats: { grossUsd, netUsd, pending, refundedUsd, refunds }, competitions: [{ id, title }], pagination }
//   GET    /admin/community/payments/export?...       -> text/csv
//   POST   /admin/community/payments/:id/verify       -> { payment }   (asks the provider again)
//   POST   /admin/community/payments/:id/refund { reason, note } -> { payment }
//          The backend refunds the full entry fee through the provider and cancels the registration.
//
// Submissions (A17–A18)
//   GET    /admin/community/submissions?status=&search=&project=&category=&type=&reviewer=&page=&pageSize=
//          -> { submissions: [row], counts: { all, pending_review, under_review, needs_corrections, approved },
//               projects: [{ id, title }], categories, reviewers: [{ id, name }], pagination, viewerRole }
//   GET    /admin/community/submissions/export?...    -> text/csv
//   POST   /admin/community/submissions/:id/assign { reviewerId } -> { submission }
//   GET    /admin/community/submissions/:id -> { submission, reviewers, viewerRole }
//   POST   /admin/community/submissions/:id/review
//          { decision: "approved"|"needs_corrections"|"rejected", scores: [{ criterionId, score }],
//            feedback, allowResubmission, suggestShowcase } -> { submission }
//          Points are awarded by the backend on approval, never by the browser.
//
// On the local dev server, when those requests fail, the pages use an in-memory sample store so
// every action can be tried. Changes last until the page reloads.

export const COMPETITIONS_PAGE_SIZE = 8;
export const PARTICIPANTS_PAGE_SIZE = 7;
export const PAYMENTS_PAGE_SIZE = 8;
export const SUBMISSIONS_PAGE_SIZE = 8;
export const RESULTS_PAGE_SIZE = 6;

export const numberFormat = new Intl.NumberFormat("en-GB");
export const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
export const usdShort = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
export const fullDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Africa/Lagos" });
export const watDateTime = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Africa/Lagos" });
export const shortDateTime = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Africa/Lagos" });

export const COMPETITION_STATUS = {
  open: { label: "Open", tone: "green" },
  judging: { label: "Judging", tone: "amber" },
  completed: { label: "Completed", tone: "blue" },
  draft: { label: "Draft", tone: "neutral" },
};
export const SUBMISSION_STATUS = {
  pending_review: { label: "Pending review", tone: "amber" },
  under_review: { label: "Under Review", tone: "blue" },
  needs_corrections: { label: "Needs Corrections", tone: "orange" },
  approved: { label: "Approved", tone: "green" },
  rejected: { label: "Rejected", tone: "red" },
};
export const SUBMISSION_TYPES = {
  premium_project: { label: "Premium project", tone: "purple" },
  free_project: { label: "Free project", tone: "green" },
  collaboration: { label: "Collaboration", tone: "blue" },
  hackathon: { label: "Hackathon", tone: "amber" },
  competition: { label: "Competition", tone: "orange" },
};
export const PAYMENT_STATUS = {
  verified: { label: "Verified", tone: "green" },
  pending: { label: "Pending", tone: "amber" },
  failed: { label: "Failed", tone: "red" },
  refunded: { label: "Refunded", tone: "neutral" },
};
export const PLANS = {
  free: { label: "Free", tone: "neutral" },
  premium: { label: "Premium", tone: "pink" },
  premium_plus: { label: "Premium Plus", tone: "purple" },
};
export const PARTICIPANT_PAYMENT = {
  paid: { label: "Paid", tone: "green" },
  plan_benefit: { label: "Free (plan benefit)", tone: "green" },
  free_entry: { label: "Free entry", tone: "green" },
  pending: { label: "Pending", tone: "amber" },
  failed: { label: "Failed", tone: "red" },
  refunded: { label: "Refunded", tone: "red" },
  withdrawn: { label: "Withdrawn", tone: "neutral" },
};
export const PARTICIPANT_SUBMISSION = {
  submitted: { label: "Submitted", tone: "blue" },
  not_submitted: { label: "Not submitted", tone: "neutral" },
  locked: { label: "Locked until paid", tone: "neutral" },
  withdrawn: { label: "Withdrawn", tone: "neutral" },
};
export const PLACEMENTS = [
  { value: "first", label: "1st place" },
  { value: "second", label: "2nd place" },
  { value: "third", label: "3rd place" },
  { value: "mention", label: "Honourable mention" },
  { value: "none", label: "None" },
];
export const REFUND_REASONS = [
  "Student requested withdrawal",
  "Charged twice",
  "Competition cancelled or changed",
  "Registered by mistake",
  "Other",
];
export const FREE_COMPETITION_LIMIT = 3;

export function relativeTime(iso) {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.round(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"} ago`;
}

export function daysSince(iso) {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
}

// <input type="datetime-local"> values are entered in West Africa Time (UTC+1, no daylight saving).
export function isoToWatInput(iso) {
  if (!iso) return "";
  const date = new Date(new Date(iso).getTime() + 3600000);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 16);
}
export function watInputToIso(value) {
  if (!value) return "";
  const date = new Date(`${value}:00Z`);
  return Number.isNaN(date.getTime()) ? "" : new Date(date.getTime() - 3600000).toISOString();
}

// ---------- plumbing ----------

const send = (method, path, body) => requestData(path, undefined, { method, body: body === undefined ? undefined : JSON.stringify(body) });
const delay = (value) => new Promise((resolve) => { window.setTimeout(() => resolve(value), 300); });

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

async function read(path, check, sampleRead) {
  try {
    const result = await requestData(path);
    if (!check(result)) throw new Error("This information is not available yet.");
    return { viewerRole: "admin", ...result, isSample: false };
  } catch (error) {
    if (import.meta.env.DEV) return { viewerRole: "admin", ...sampleRead(), isSample: true };
    throw error;
  }
}

let store = null;
function db() {
  if (!store) store = buildReviewStore();
  return store;
}

function paginate(list, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  const current = Math.min(Math.max(1, Number(page) || 1), totalPages);
  return { items: list.slice((current - 1) * pageSize, current * pageSize), pagination: { page: current, totalPages, total: list.length } };
}

const matches = (text, term) => !term || text.toLowerCase().includes(term.trim().toLowerCase());

// ---------- CSV export ----------

function csvCell(value) {
  const text = value === null || value === undefined ? "" : String(value);
  // Leading = + - @ would run as a formula in spreadsheet apps.
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return /[",\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}
export function toCsv(header, rows) {
  return [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
}
export function downloadCsv(filename, csv) {
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// The server builds the export (all pages). In sample mode the CSV is built from the sample store.
async function exportCsv(path, sampleCsv, sample) {
  const csv = await mutate(async () => {
    const text = await requestData(path);
    if (typeof text !== "string") throw Object.assign(new Error("The export is not available yet."), { status: 404 });
    return text;
  }, sampleCsv, sample);
  return csv;
}

// ---------- competitions ----------

function competitionRow(item) {
  return {
    id: item.id, number: item.number, title: item.title, category: item.category, entryFeeUsd: item.entryFeeUsd,
    prizeSummary: item.prizeSummary, registrationClosesAt: item.registrationClosesAt, submissionDeadline: item.submissionDeadline,
    entrants: item.entrants, participantLimit: item.participantLimit, status: item.status,
  };
}

function freeUsedSample(exceptId) {
  return db().competitions.filter((item) => item.entryFeeUsd === 0 && item.status !== "draft" && item.id !== exceptId).length;
}

function revenueFor(competitionId) {
  return db().payments.filter((item) => item.status === "verified" && (!competitionId || item.competitionId === competitionId)).reduce((sum, item) => sum + item.amountUsd, 0);
}

export function getAdminCompetitions(filters) {
  const params = { ...filters, pageSize: COMPETITIONS_PAGE_SIZE };
  return read(`/admin/community/competitions${queryString(params)}`, (result) => Array.isArray(result?.competitions), () => {
    const all = db().competitions;
    const filtered = all.filter((item) => matches(`${item.title} ${item.category} #${item.number}`, params.search ?? "") && (!params.category || item.category === params.category));
    const counts = { all: filtered.length };
    Object.keys(COMPETITION_STATUS).forEach((status) => { counts[status] = filtered.filter((item) => item.status === status).length; });
    const list = filtered.filter((item) => !params.status || item.status === params.status).sort((a, b) => a.number - b.number);
    const { items, pagination } = paginate(list, params.page, params.pageSize);
    return {
      competitions: items.map(competitionRow),
      counts,
      stats: {
        open: all.filter((item) => item.status === "open").length,
        entrants: all.reduce((sum, item) => sum + item.entrants, 0),
        entryFeeRevenueUsd: revenueFor(),
        freeUsed: freeUsedSample(),
        freeLimit: FREE_COMPETITION_LIMIT,
      },
      categories: SAMPLE_COMPETITION_CATEGORIES,
      pagination,
    };
  });
}

export function emptyCompetition() {
  return {
    id: null,
    number: null,
    title: "",
    category: "",
    participantLimit: "",
    description: "",
    rules: "",
    entryFeeUsd: "",
    premiumPlusFree: false,
    prizes: { first: "", second: "", third: "", mentions: "" },
    registrationClosesAt: "",
    submissionDeadline: "",
    winnersAnnouncedAt: "",
    criteria: [{ name: "", weight: "" }],
    submissionRequirements: "",
    resources: [],
    judges: [],
    announce: true,
    emailNotify: true,
    status: "draft",
    updatedAt: null,
  };
}

export async function getAdminCompetition({ id }) {
  if (!id) {
    // A new competition still needs the reviewer list and the free-slot count.
    return read("/admin/community/competitions/meta", (result) => Array.isArray(result?.reviewers), () => ({
      categories: SAMPLE_COMPETITION_CATEGORIES,
      reviewers: db().reviewers,
      freeUsed: freeUsedSample(),
      freeLimit: FREE_COMPETITION_LIMIT,
      nextNumber: Math.max(...db().competitions.map((item) => item.number)) + 1,
    })).then((result) => ({ ...result, competition: { ...emptyCompetition(), number: result.nextNumber ?? null }, isNew: true }));
  }
  return read(`/admin/community/competitions/${encodeURIComponent(id)}`, (result) => Boolean(result?.competition), () => {
    const competition = db().competitions.find((item) => item.id === id);
    if (!competition) throw new Error("This competition could not be found.");
    return { competition: structuredClone(competition), categories: SAMPLE_COMPETITION_CATEGORIES, reviewers: db().reviewers, freeUsed: freeUsedSample(id), freeLimit: FREE_COMPETITION_LIMIT };
  });
}

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "competition";

export function saveAdminCompetition(competition, { sample } = {}) {
  return mutate(
    () => (competition.id
      ? send("PUT", `/admin/community/competitions/${encodeURIComponent(competition.id)}`, competition)
      : send("POST", "/admin/community/competitions", competition)),
    () => {
      const list = db().competitions;
      const now = new Date().toISOString();
      if (competition.entryFeeUsd === 0 && competition.status !== "draft" && freeUsedSample(competition.id) >= FREE_COMPETITION_LIMIT) {
        throw new Error("The three free competitions have been used. Set an entry fee to publish.");
      }
      const prizeSummary = competition.prizes.first || "Prizes to be announced";
      if (competition.id) {
        const index = list.findIndex((item) => item.id === competition.id);
        list[index] = { ...list[index], ...competition, prizeSummary, updatedAt: now };
        return { competition: structuredClone(list[index]) };
      }
      let id = slugify(competition.title);
      while (list.some((item) => item.id === id)) id = `${id}-2`;
      const number = Math.max(...list.map((item) => item.number)) + 1;
      const created = { ...competition, id, number, entrants: 0, prizeSummary, resultsPublished: false, createdAt: now, updatedAt: now };
      list.push(created);
      db().participants[id] = [];
      return { competition: structuredClone(created) };
    },
    sample,
  );
}

export function deleteAdminCompetition(id, { sample } = {}) {
  return mutate(
    () => send("DELETE", `/admin/community/competitions/${encodeURIComponent(id)}`),
    () => { db().competitions = db().competitions.filter((item) => item.id !== id); return {}; },
    sample,
  );
}

export function uploadCompetitionFile(file, { sample } = {}) {
  return mutate(
    async () => {
      const uploaded = await uploadFile(file, "attachment");
      return { url: uploaded.url, name: file.name, size: file.size };
    },
    () => ({ url: URL.createObjectURL(file), name: file.name, size: file.size, local: true }),
    sample,
  );
}

export function criteriaTotal(criteria) {
  return criteria.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);
}

// Returns { field: message }. Drafts only need a title; publishing needs everything.
// The backend checks all of this again.
export function validateCompetition(competition, { publishing, freeAllowed }) {
  const errors = {};
  if (!competition.title.trim()) errors.title = "Give the competition a title.";
  else if (competition.title.trim().length > 120) errors.title = "Keep the title under 120 characters.";
  // entryFeeUsd is 0 for free entry, otherwise the typed amount (string or number).
  const fee = competition.entryFeeUsd;
  const amount = Number(fee);
  if (fee !== 0 && fee !== "" && fee !== null && !(amount >= 1 && amount <= 500)) errors.entryFeeUsd = "Set an entry fee between $1 and $500.";
  if (!publishing) return errors;

  if (!competition.category) errors.category = "Choose a category.";
  if (!(Number(competition.participantLimit) > 0)) errors.participantLimit = "Set a participant limit of at least 1.";
  if (!competition.description.trim()) errors.description = "Write a description students will read.";
  if (!competition.rules.trim()) errors.rules = "Add the competition rules.";
  if (fee === "" || fee === null) errors.entryFeeUsd = "Set the entry fee in USD.";
  else if (fee === 0 && competition.premiumPlusFree) errors.entryFeeUsd = "The Premium Plus benefit only applies to paid competitions.";
  else if (fee === 0 && !freeAllowed) errors.entryFeeUsd = "The three free competitions have been used. Set an entry fee.";
  const reg = Date.parse(competition.registrationClosesAt);
  const sub = Date.parse(competition.submissionDeadline);
  const win = Date.parse(competition.winnersAnnouncedAt);
  if (!reg) errors.registrationClosesAt = "Set the registration deadline.";
  else if (competition.status !== "judging" && competition.status !== "completed" && reg < Date.now()) errors.registrationClosesAt = "The registration deadline must be in the future.";
  if (!sub) errors.submissionDeadline = "Set the submission deadline.";
  else if (reg && sub <= reg) errors.submissionDeadline = "The submission deadline must be after registration closes.";
  if (!win) errors.winnersAnnouncedAt = "Set the winner announcement date.";
  else if (sub && win <= sub) errors.winnersAnnouncedAt = "Announce winners after the submission deadline.";
  if (!competition.prizes.first.trim()) errors.prizes = "Describe at least the 1st place prize.";
  const named = competition.criteria.filter((item) => item.name.trim() || item.weight !== "");
  if (named.length === 0) errors.criteria = "Add at least one judging criterion.";
  else if (named.some((item) => !item.name.trim())) errors.criteria = "Every criterion needs a name.";
  else if (criteriaTotal(competition.criteria) !== 100) errors.criteria = `Weights add up to ${criteriaTotal(competition.criteria)}%. They must total 100% before you can publish.`;
  if (competition.judges.length === 0) errors.judges = "Assign at least one judge.";
  return errors;
}

// ---------- participants ----------

function competitionSummary(item) {
  return {
    id: item.id, number: item.number, title: item.title, entryFeeUsd: item.entryFeeUsd, participantLimit: item.participantLimit,
    registrationClosesAt: item.registrationClosesAt, submissionDeadline: item.submissionDeadline, status: item.status, resultsPublished: item.resultsPublished,
  };
}

function findCompetition(id) {
  const competition = db().competitions.find((item) => item.id === id);
  if (!competition) throw new Error("This competition could not be found.");
  return competition;
}

function filterParticipants(id, { search = "", payment = "", submission = "", plan = "" }) {
  return (db().participants[id] ?? []).filter((item) => (
    matches(`${item.name} ${item.email}`, search)
    && (!payment || item.payment === payment)
    && (!submission || item.submission === submission)
    && (!plan || item.plan === plan)
  ));
}

export function getCompetitionParticipants({ id, ...filters }) {
  const params = { ...filters, pageSize: PARTICIPANTS_PAGE_SIZE };
  return read(`/admin/community/competitions/${encodeURIComponent(id)}/participants${queryString(params)}`, (result) => Array.isArray(result?.participants), () => {
    const competition = findCompetition(id);
    const everyone = db().participants[id] ?? [];
    const { items, pagination } = paginate(filterParticipants(id, params), params.page, params.pageSize);
    return {
      competition: competitionSummary(competition),
      stats: {
        registered: everyone.filter((item) => !["refunded", "withdrawn", "failed"].includes(item.payment)).length,
        paid: everyone.filter((item) => ["paid", "plan_benefit", "free_entry"].includes(item.payment)).length,
        pending: everyone.filter((item) => item.payment === "pending").length,
        submitted: everyone.filter((item) => item.submission === "submitted").length,
      },
      participants: structuredClone(items),
      pagination,
    };
  });
}

export const PARTICIPANT_CSV_HEADER = ["Name", "Email", "Plan", "Registered (WAT)", "Payment", "Amount (USD)", "Submission", "Score"];
export function participantCsvRow(item) {
  return [item.name, item.email, PLANS[item.plan]?.label ?? item.plan, watDateTime.format(new Date(item.registeredAt)), PARTICIPANT_PAYMENT[item.payment]?.label ?? item.payment, item.amountUsd ? item.amountUsd.toFixed(2) : "0.00", PARTICIPANT_SUBMISSION[item.submission]?.label ?? item.submission, item.score ?? ""];
}

export function exportCompetitionParticipants({ id, ...filters }, { sample } = {}) {
  return exportCsv(
    `/admin/community/competitions/${encodeURIComponent(id)}/participants/export${queryString(filters)}`,
    () => toCsv(PARTICIPANT_CSV_HEADER, filterParticipants(id, filters).map(participantCsvRow)),
    sample,
  );
}

// ---------- results ----------

export function getCompetitionResults({ id, limit }) {
  return read(`/admin/community/competitions/${encodeURIComponent(id)}/results${queryString({ limit })}`, (result) => Array.isArray(result?.entries), () => {
    const competition = findCompetition(id);
    const results = db().results[id] ?? { published: false, entries: [] };
    return {
      competition: { ...competitionSummary(competition), prizes: competition.prizes, judges: competition.judges, entrants: competition.entrants, winnersAnnouncedAt: competition.winnersAnnouncedAt },
      entries: structuredClone(results.entries.slice(0, limit || RESULTS_PAGE_SIZE)),
      total: results.entries.length,
      scored: results.entries.filter((item) => item.judgesDone >= item.judgesTotal).length,
      published: results.published,
    };
  });
}

export function saveCompetitionRanking(id, entries, { sample } = {}) {
  const payload = entries.map(({ id: entryId, placement }) => ({ id: entryId, placement }));
  return mutate(
    () => send("PUT", `/admin/community/competitions/${encodeURIComponent(id)}/results/ranking`, { entries: payload }),
    () => {
      const results = db().results[id];
      if (!results) throw new Error("There are no results to rank yet.");
      const byId = new Map(results.entries.map((item) => [item.id, item]));
      const ranked = payload.map((item) => ({ ...byId.get(item.id), placement: item.placement }));
      const rest = results.entries.filter((item) => !payload.some((entry) => entry.id === item.id));
      results.entries = [...ranked, ...rest];
      return {};
    },
    sample,
  );
}

export function publishCompetitionResults(id, { sendWinnerEmails }, { sample } = {}) {
  return mutate(
    () => send("POST", `/admin/community/competitions/${encodeURIComponent(id)}/results/publish`, { sendWinnerEmails }),
    () => {
      const competition = findCompetition(id);
      competition.status = "completed";
      competition.resultsPublished = true;
      if (db().results[id]) db().results[id].published = true;
      return {};
    },
    sample,
  );
}

// ---------- payments ----------

function filterPayments({ search = "", competition = "", status = "" }) {
  return db().payments.filter((item) => (
    matches(`${item.reference} ${item.student} ${item.competition}`, search)
    && (!competition || item.competitionId === competition)
    && (!status || item.status === status)
  ));
}

export function getAdminPayments(filters) {
  const params = { ...filters, pageSize: PAYMENTS_PAGE_SIZE };
  return read(`/admin/community/payments${queryString(params)}`, (result) => Array.isArray(result?.payments), () => {
    const all = db().payments;
    const gross = all.filter((item) => item.status === "verified" || item.status === "refunded").reduce((sum, item) => sum + item.amountUsd, 0);
    const refunded = all.filter((item) => item.status === "refunded");
    const refundedUsd = refunded.reduce((sum, item) => sum + item.amountUsd, 0);
    const { items, pagination } = paginate(filterPayments(params), params.page, params.pageSize);
    return {
      payments: structuredClone(items),
      stats: { grossUsd: gross, netUsd: gross - refundedUsd, pending: all.filter((item) => item.status === "pending").length, refundedUsd, refunds: refunded.length },
      competitions: db().competitions.filter((item) => item.entryFeeUsd > 0).map(({ id, title }) => ({ id, title })),
      pagination,
    };
  });
}

export const PAYMENT_CSV_HEADER = ["Reference", "Student", "Competition", "Amount (USD)", "Provider fee (USD)", "Method", "Status", "Date (WAT)", "Note"];
export function exportAdminPayments(filters, { sample } = {}) {
  return exportCsv(
    `/admin/community/payments/export${queryString(filters)}`,
    () => toCsv(PAYMENT_CSV_HEADER, filterPayments(filters).map((item) => [item.reference, item.student, item.competition, item.amountUsd.toFixed(2), item.providerFeeUsd.toFixed(2), item.method, PAYMENT_STATUS[item.status]?.label ?? item.status, watDateTime.format(new Date(item.createdAt)), item.note])),
    sample,
  );
}

function updatePaymentSample(id, change) {
  const payment = db().payments.find((item) => item.id === id);
  if (!payment) throw new Error("This payment could not be found.");
  change(payment);
  const person = (db().participants[payment.competitionId] ?? []).find((item) => item.id === payment.participantId);
  if (person) {
    if (payment.status === "verified") { person.payment = "paid"; if (person.submission === "locked") person.submission = "not_submitted"; }
    if (payment.status === "refunded") { person.payment = "refunded"; person.submission = "withdrawn"; }
  }
  return { payment: structuredClone(payment) };
}

export function verifyAdminPayment(id, { sample } = {}) {
  return mutate(
    () => send("POST", `/admin/community/payments/${encodeURIComponent(id)}/verify`),
    () => updatePaymentSample(id, (payment) => { payment.status = "verified"; payment.note = ""; }),
    sample,
  );
}

export function refundAdminPayment(id, { reason, note }, { sample } = {}) {
  return mutate(
    () => send("POST", `/admin/community/payments/${encodeURIComponent(id)}/refund`, { reason, note }),
    () => updatePaymentSample(id, (payment) => {
      if (payment.status !== "verified") throw new Error("Only verified payments can be refunded.");
      payment.status = "refunded";
      payment.note = `Refunded · ${reason}`;
    }),
    sample,
  );
}

// ---------- submissions ----------

function filterSubmissions({ search = "", project = "", category = "", type = "", reviewer = "" }) {
  return db().submissions.filter((item) => (
    matches(`${item.student} ${item.username ?? ""}`, search)
    && (!project || item.projectId === project)
    && (!category || item.category === category)
    && (!type || item.projectType === type)
    && (!reviewer || (reviewer === "unassigned" ? !item.reviewerId : item.reviewerId === reviewer))
  ));
}

function submissionRow(item) {
  const reviewer = db().reviewers.find((entry) => entry.id === item.reviewerId);
  return {
    id: item.id, student: item.student, studentDetail: item.studentDetail, studentInitials: item.studentInitials, username: item.username,
    title: item.title, projectId: item.projectId, projectType: item.projectType, category: item.category, status: item.status,
    submittedAt: item.submittedAt, reviewerId: item.reviewerId, reviewerName: reviewer?.name ?? null, score: item.score,
  };
}

export function getAdminSubmissions(filters) {
  const params = { ...filters, pageSize: SUBMISSIONS_PAGE_SIZE };
  return read(`/admin/community/submissions${queryString(params)}`, (result) => Array.isArray(result?.submissions), () => {
    const filtered = filterSubmissions(params);
    const counts = { all: filtered.length };
    ["pending_review", "under_review", "needs_corrections", "approved"].forEach((status) => { counts[status] = filtered.filter((item) => item.status === status).length; });
    const { items, pagination } = paginate(filtered.filter((item) => !params.status || item.status === params.status), params.page, params.pageSize);
    const projects = new Map();
    db().submissions.forEach((item) => { if (!projects.has(item.projectId)) projects.set(item.projectId, item.projectType === "competition" ? db().competitions.find((entry) => entry.id === item.projectId)?.title ?? item.title : item.title); });
    return {
      submissions: items.map(submissionRow),
      counts,
      projects: [...projects].map(([id, title]) => ({ id, title })).sort((a, b) => a.title.localeCompare(b.title)),
      categories: [...new Set(db().submissions.map((item) => item.category))].sort(),
      reviewers: db().reviewers.map(({ id, name }) => ({ id, name })),
      pagination,
    };
  });
}

export const SUBMISSION_CSV_HEADER = ["ID", "Student", "Project", "Type", "Category", "Submitted (WAT)", "Status", "Reviewer", "Score"];
export function exportAdminSubmissions(filters, { sample } = {}) {
  return exportCsv(
    `/admin/community/submissions/export${queryString(filters)}`,
    () => toCsv(SUBMISSION_CSV_HEADER, filterSubmissions(filters).filter((item) => !filters.status || item.status === filters.status).map((item) => {
      const row = submissionRow(item);
      return [row.id, row.student, row.title, SUBMISSION_TYPES[row.projectType]?.label ?? row.projectType, row.category, watDateTime.format(new Date(row.submittedAt)), SUBMISSION_STATUS[row.status]?.label ?? row.status, row.reviewerName ?? "Unassigned", row.score ?? ""];
    })),
    sample,
  );
}

function findSubmission(id) {
  const item = db().submissions.find((entry) => entry.id === id);
  if (!item) throw new Error("This submission could not be found.");
  return item;
}

export function assignSubmissionReviewer(id, reviewerId, { sample } = {}) {
  return mutate(
    () => send("POST", `/admin/community/submissions/${encodeURIComponent(id)}/assign`, { reviewerId: reviewerId || null }),
    () => {
      const item = findSubmission(id);
      item.reviewerId = reviewerId || null;
      if (reviewerId && item.status === "pending_review") item.status = "under_review";
      if (!reviewerId && item.status === "under_review") item.status = "pending_review";
      return { submission: submissionRow(item) };
    },
    sample,
  );
}

export function getAdminSubmission({ id }) {
  return read(`/admin/community/submissions/${encodeURIComponent(id)}`, (result) => Boolean(result?.submission), () => {
    const item = findSubmission(id);
    const competition = item.competitionId ? db().competitions.find((entry) => entry.id === item.competitionId) : null;
    return { submission: structuredClone(sampleSubmissionDetail(item, competition)), reviewers: db().reviewers.map(({ id: reviewerId, name }) => ({ id: reviewerId, name })) };
  });
}

export function reviewSubmission(id, review, { sample } = {}) {
  return mutate(
    () => send("POST", `/admin/community/submissions/${encodeURIComponent(id)}/review`, review),
    () => {
      const item = findSubmission(id);
      const total = review.scores.reduce((sum, entry) => sum + (Number(entry.score) || 0), 0);
      Object.assign(item, {
        status: review.decision,
        score: total,
        scores: Object.fromEntries(review.scores.map((entry) => [entry.criterionId, entry.score])),
        feedback: review.feedback,
        allowResubmission: review.allowResubmission,
        suggestShowcase: review.suggestShowcase,
        decidedAt: new Date().toISOString(),
      });
      const competition = item.competitionId ? db().competitions.find((entry) => entry.id === item.competitionId) : null;
      return { submission: structuredClone(sampleSubmissionDetail(item, competition)) };
    },
    sample,
  );
}
