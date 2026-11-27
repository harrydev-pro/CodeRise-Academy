import { queryString, uploadFile } from "../../../services/api/api";
import { requestData } from "../../../services/api/dataClient";
import { SAMPLE_COMMUNITY_PROJECTS } from "../sampleCommunityProjects";
import {
  createSampleCommunityNotifications,
  createSampleMyProjects,
  daysFromNow,
  sampleProjectDetail,
} from "./sampleProjectDetails";

// Community projects for the student: S03 Project Details, S04 Project Submission,
// S05 My Community Projects, and the Community tab of Notifications (S24).
//
// Endpoints (student session; the backend checks every rule again — Premium access, who may
// submit, deadlines, resubmissions left, file types and sizes. The UI only reflects what the
// API returns, e.g. `project.locked`, `viewerHasPremium`, `canSubmit`, `resubmissionsLeft`):
//
//   GET  /community/projects/:slug
//        -> { project, viewerHasPremium, viewerStatus, premiumFromPrice, premiumProjectCount }
//        project: { slug, title, category, description, level, duration, access, started, addedAt,
//                   points, maxScore, passMark, resubmissionsAllowed, locked,
//                   previewAvailable, objectives[], requirements[], steps[{ title, details }], stepsTotal,
//                   referenceImages[{ caption, url }], skills[], resources[{ name, kind: "pdf"|"zip"|"link", size, url }],
//                   briefUrl, submission: { links[{ type: "github"|"live"|"figma", required }],
//                                           files: { kinds["pdf"|"images"|"zip"], required, maxFiles, maxSizeMb } },
//                   submissionRequirements[], criteria[{ name, check, points }] }
//        A free viewer of a Premium project gets `locked: true` and only the preview fields
//        (objectives and the first steps), or nothing but basics when previewAvailable is false.
//   POST /community/projects/:slug/start            -> { status: "in_progress", dueAt }
//   GET  /community/projects/:slug/submission
//        -> { project (basics + submission rules + points + maxScore), viewerStatus, dueAt,
//             draft: { links: { github, live, figma }, files[{ name, size, url }], notes } | null,
//             feedback: { reviewer, text } | null, resubmissionsLeft, canSubmit }
//   PUT  /community/projects/:slug/submission/draft { links, files, notes }        -> { draft }
//   POST /community/projects/:slug/submission { links, files, notes, confirmations } -> { submission: { status } }
//   POST /uploads (purpose "attachment") for files, via uploadFile()
//   GET  /community/my-projects?status=
//        -> { projects[{ slug, title, category, access, status, score, maxScore, feedback, links[{ type, label, url }],
//             files[], notes, certificateUrl, pointsEarned, showcased, canPublishToShowcase, resubmissionsLeft,
//             dueAt, progress: { done, total }, startedAt, submittedAt, reviewedAt, completedAt, savedAt }],
//             counts: { all, not_started, in_progress, submitted, under_review, approved, needs_corrections, completed } }
//   POST /community/my-projects/:slug/showcase  -> { project }   (publishes an approved project to the Showcase)
//   GET  /notifications/me?category=community&before=&pageSize=
//        -> { notifications[{ id, type, title, message, createdAt, read, link, actionLabel, linkLabel, dueAt }], nextCursor }
//   POST /notifications/:id/read, POST /notifications/read-all { category: "community" }
//
// On the local dev server, when the API is missing, reads fall back to sample data
// (`isSample: true`) and writes go to an in-memory sample store so every button can be tried.
// Changes last until the page reloads. Production builds always show the real error.

export const PROJECT_STATUSES = [
  { value: "not_started", label: "Not Started", tone: "neutral" },
  { value: "in_progress", label: "In Progress", tone: "blue" },
  { value: "submitted", label: "Submitted", tone: "neutral" },
  { value: "under_review", label: "Under Review", tone: "blue" },
  { value: "approved", label: "Approved", tone: "green" },
  { value: "needs_corrections", label: "Needs Corrections", tone: "orange" },
  { value: "completed", label: "Completed", tone: "teal" },
];
export const statusInfo = (value) => PROJECT_STATUSES.find((item) => item.value === value) ?? PROJECT_STATUSES[0];

// Statuses in which the viewer may (re)submit. The backend decides `canSubmit`.
export const EDITABLE_STATUSES = ["not_started", "in_progress", "needs_corrections"];

export const LINK_FIELDS = {
  github: { label: "GitHub repository", placeholder: "https://github.com/your-name/your-repo", host: "github.com", example: "https://github.com/amara-o/restaurant-site" },
  live: { label: "Live project URL", placeholder: "https://your-site.netlify.app", host: null, example: "https://mama-adas-kitchen.netlify.app" },
  figma: { label: "Figma link", placeholder: "https://www.figma.com/file/…", host: "figma.com", example: "https://www.figma.com/file/abc123/project" },
};
export const FILE_KINDS = {
  pdf: { label: "PDF", accept: [".pdf", "application/pdf"] },
  images: { label: "PNG, JPG", accept: [".png", ".jpg", ".jpeg", "image/png", "image/jpeg"] },
  zip: { label: "ZIP", accept: [".zip", "application/zip", "application/x-zip-compressed"] },
};

// ---------- helpers ----------

const send = (method, path, body) => requestData(path, undefined, { method, body: body === undefined ? undefined : JSON.stringify(body) });
const delay = (value) => new Promise((resolve) => { window.setTimeout(() => resolve(value), 350); });
const enc = encodeURIComponent;

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

async function readWithSample(real, sample) {
  try {
    return { ...(await real()), isSample: false };
  } catch (error) {
    if (import.meta.env.DEV) {
      const result = sample(error);
      return { ...result, isSample: true };
    }
    throw error;
  }
}

// ---------- sample store (local dev only) ----------

let myProjects = null;
let drafts = {};
let notifications = null;

function store() {
  if (!myProjects) myProjects = createSampleMyProjects();
  return myProjects;
}
function notificationStore() {
  if (!notifications) notifications = createSampleCommunityNotifications();
  return notifications;
}
const findMine = (slug) => store().find((item) => item.slug === slug);
const basicsOf = (slug) => SAMPLE_COMMUNITY_PROJECTS.find((item) => item.slug === slug);

function upsertMine(slug, changes) {
  const current = findMine(slug);
  if (current) Object.assign(current, changes);
  else store().unshift({ slug, ...changes });
  return findMine(slug);
}

const notFound = (error) => new Error("This project could not be found.", { cause: error });

// ---------- S03 Project Details ----------

export function getProjectDetail({ slug }) {
  return readWithSample(
    async () => {
      const result = await requestData(`/community/projects/${enc(slug)}`);
      if (!result?.project) throw new Error("This project could not be found.");
      return result;
    },
    (error) => {
      const detail = sampleProjectDetail(slug, findMine(slug)?.status);
      if (!detail) throw notFound(error);
      return detail;
    },
  );
}

export function startProject(slug, { sample } = {}) {
  return mutate(
    () => send("POST", `/community/projects/${enc(slug)}/start`, {}),
    () => {
      const mine = findMine(slug);
      if (mine && mine.status !== "not_started") return { status: mine.status, dueAt: mine.dueAt };
      const dueAt = daysFromNow(14);
      upsertMine(slug, { status: "in_progress", startedAt: new Date().toISOString(), dueAt, progress: { done: 0, total: 5 } });
      return { status: "in_progress", dueAt };
    },
    sample,
  );
}

// ---------- S04 Project Submission ----------

export function getProjectSubmission({ slug }) {
  return readWithSample(
    async () => {
      const result = await requestData(`/community/projects/${enc(slug)}/submission`);
      if (!result?.project) throw new Error("This project could not be found.");
      return result;
    },
    (error) => {
      const mine = findMine(slug);
      const detail = sampleProjectDetail(slug, mine?.status);
      if (!detail) throw notFound(error);
      const status = mine?.status ?? "not_started";
      const resubmissionsLeft = mine?.resubmissionsLeft ?? 1;
      return {
        project: detail.project,
        viewerHasPremium: detail.viewerHasPremium,
        premiumFromPrice: detail.premiumFromPrice,
        viewerStatus: status,
        dueAt: mine?.dueAt ?? daysFromNow(14),
        draft: drafts[slug] ?? null,
        feedback: mine?.feedback ?? null,
        resubmissionsLeft,
        canSubmit: !detail.project.locked && EDITABLE_STATUSES.includes(status) && (status !== "needs_corrections" || resubmissionsLeft > 0),
      };
    },
  );
}

export function saveSubmissionDraft(slug, draft, { sample } = {}) {
  return mutate(
    () => send("PUT", `/community/projects/${enc(slug)}/submission/draft`, draft),
    () => {
      drafts = { ...drafts, [slug]: structuredClone(draft) };
      const mine = findMine(slug);
      if (!mine || mine.status === "not_started") upsertMine(slug, { status: "in_progress", startedAt: new Date().toISOString(), dueAt: daysFromNow(14), progress: { done: 1, total: 5 } });
      return { draft };
    },
    sample,
  );
}

const LINK_LABELS = { github: "Repository", live: "Live site", figma: "Figma file" };

export function submitProject(slug, submission, { sample } = {}) {
  return mutate(
    () => send("POST", `/community/projects/${enc(slug)}/submission`, submission),
    () => {
      const mine = findMine(slug);
      const resubmissionsLeft = mine?.status === "needs_corrections" ? Math.max(0, (mine.resubmissionsLeft ?? 1) - 1) : mine?.resubmissionsLeft;
      drafts = Object.fromEntries(Object.entries(drafts).filter(([key]) => key !== slug));
      upsertMine(slug, {
        status: "under_review",
        submittedAt: new Date().toISOString(),
        score: undefined,
        feedback: mine?.status === "needs_corrections" ? mine.feedback : undefined,
        resubmissionsLeft,
        links: Object.entries(submission.links).filter(([, url]) => url).map(([type, url]) => ({ type, label: LINK_LABELS[type] ?? type, url })),
        files: submission.files,
        notes: submission.notes,
        progress: undefined,
      });
      return { submission: { status: "under_review" } };
    },
    sample,
  );
}

// Uploads go to the existing /uploads endpoint. In sample mode the file stays in the browser.
export function uploadSubmissionFile(file, { sample } = {}) {
  return mutate(
    async () => {
      const uploaded = await uploadFile(file, "attachment");
      return { url: uploaded?.url, name: file.name, size: file.size };
    },
    () => ({ url: null, name: file.name, size: file.size, local: true }),
    sample,
  );
}

// ---------- S05 My Community Projects ----------

function withBasics(item) {
  const basics = basicsOf(item.slug) ?? {};
  return { maxScore: 100, title: item.slug, ...basics, ...item, files: item.files ?? [], links: item.links ?? [] };
}

export function getMyCommunityProjects({ status = "" }) {
  return readWithSample(
    async () => {
      const result = await requestData(`/community/my-projects${queryString({ status })}`);
      if (!Array.isArray(result?.projects)) throw new Error("Your community projects are not available yet.");
      return result;
    },
    () => {
      const all = store().map(withBasics);
      const counts = { all: all.length };
      all.forEach((item) => { counts[item.status] = (counts[item.status] ?? 0) + 1; });
      return { projects: all.filter((item) => !status || item.status === status), counts };
    },
  );
}

export function publishToShowcase(slug, { sample } = {}) {
  return mutate(
    () => send("POST", `/community/my-projects/${enc(slug)}/showcase`, {}),
    () => ({ project: withBasics(upsertMine(slug, { status: "completed", showcased: true, canPublishToShowcase: false, completedAt: new Date().toISOString() })) }),
    sample,
  );
}

// ---------- S24 Notifications: Community tab ----------

export const COMMUNITY_NOTIFICATIONS_PAGE_SIZE = 8;

export function getCommunityNotifications({ before = "" }) {
  const params = { category: "community", before, pageSize: COMMUNITY_NOTIFICATIONS_PAGE_SIZE };
  return readWithSample(
    async () => {
      const result = await requestData(`/notifications/me${queryString(params)}`);
      const list = Array.isArray(result) ? result : result?.notifications;
      if (!Array.isArray(list)) throw new Error("Community notifications are not available yet.");
      return { notifications: list, nextCursor: result?.nextCursor ?? null };
    },
    () => {
      const list = [...notificationStore()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      const start = before ? list.findIndex((item) => item.id === before) + 1 : 0;
      const page = list.slice(start, start + params.pageSize);
      const last = page[page.length - 1];
      return {
        notifications: page.map((item) => ({ ...item })),
        nextCursor: last && start + params.pageSize < list.length ? last.id : null,
      };
    },
  );
}

export function markCommunityNotificationRead(id, { sample } = {}) {
  return mutate(
    () => send("POST", `/notifications/${enc(id)}/read`, {}),
    () => { const item = notificationStore().find((entry) => entry.id === id); if (item) item.read = true; return {}; },
    sample,
  );
}

export function markAllCommunityNotificationsRead({ sample } = {}) {
  return mutate(
    () => send("POST", "/notifications/read-all", { category: "community" }),
    () => { notificationStore().forEach((item) => { item.read = true; }); return {}; },
    sample,
  );
}
