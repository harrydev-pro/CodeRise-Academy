import { queryString, uploadFile } from "../../../services/api/api";
import { requestData } from "../../../services/api/dataClient";
import { PROJECT_CATEGORIES, SAMPLE_COMMUNITY_PROJECTS } from "../sampleCommunityProjects";

// Admin: Community project library (A02 list, A03 create, A04 edit).
//
// Endpoints (all need an admin session; the backend checks the role):
//   GET    /admin/community/projects?search=&category=&level=&access=&status=&sort=&page=&pageSize=
//          -> { projects: [row], pagination: { page, totalPages, total }, categories: [...] }
//   GET    /admin/community/projects/:id      -> { project, categories }
//   POST   /admin/community/projects          { ...project }   -> { project }
//   PUT    /admin/community/projects/:id      { ...project }   -> { project }
//   POST   /admin/community/projects/:id/status { status: "published" | "unpublished" } -> { project }
//   DELETE /admin/community/projects/:id
//   POST   /admin/community/projects/bulk     { ids: [...], action: "publish" | "unpublish" | "delete" }
// The backend must re-check the publish rules (required fields, criteria weights = 100).
//
// On the local dev server, when those requests fail, the pages use an in-memory sample store
// instead, so create / edit / publish / delete can be tried. Changes last until the page reloads.

export const PROJECT_LEVELS = ["Beginner", "Intermediate", "Advanced", "Professional"];
export const PROJECT_DURATIONS = ["3 days", "5 days", "1 week", "10 days", "2 weeks", "3 weeks", "4 weeks", "6 weeks"];
export const SUBMISSION_TYPES = [
  { value: "github", label: "GitHub repository link" },
  { value: "live", label: "Live project URL" },
  { value: "figma", label: "Figma link" },
  { value: "pdf", label: "PDF document" },
  { value: "images", label: "Images (PNG, JPG)" },
  { value: "zip", label: "ZIP file (max 50 MB)" },
];
export const ADMIN_PROJECTS_PAGE_SIZE = 8;

export function emptyProject() {
  return {
    id: null,
    title: "",
    category: "",
    level: "",
    duration: "",
    deadline: "",
    shortDescription: "",
    description: "",
    objectives: [""],
    skills: [],
    requirements: "",
    steps: [{ title: "", details: "" }],
    access: "free",
    thumbnailUrl: "",
    referenceImages: [],
    starterFiles: [],
    submissionTypes: ["github", "live"],
    criteria: [{ name: "", weight: "" }],
    status: "draft",
  };
}

// ---------- requests ----------

export async function getAdminProjects(filters) {
  const params = { ...filters, pageSize: ADMIN_PROJECTS_PAGE_SIZE };
  try {
    const result = await requestData(`/admin/community/projects${queryString(params)}`);
    if (!Array.isArray(result?.projects)) throw new Error("The project list is not available yet.");
    return { ...result, isSample: false };
  } catch (error) {
    if (import.meta.env.DEV) return { ...listSample(params), isSample: true };
    throw error;
  }
}

export async function getAdminProject({ id }) {
  if (!id) return { project: emptyProject(), categories: PROJECT_CATEGORIES, isSample: false, isNew: true };
  try {
    const result = await requestData(`/admin/community/projects/${encodeURIComponent(id)}`);
    if (!result?.project) throw new Error("This project could not be found.");
    return { ...result, isSample: false };
  } catch (error) {
    if (import.meta.env.DEV) {
      const project = sampleStore().find((item) => item.id === id);
      if (!project) throw new Error("This project could not be found.", { cause: error });
      return { project: structuredClone(project), categories: PROJECT_CATEGORIES, isSample: true };
    }
    throw error;
  }
}

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

export function saveAdminProject(project, { sample } = {}) {
  return mutate(
    () => (project.id
      ? send("PUT", `/admin/community/projects/${encodeURIComponent(project.id)}`, project)
      : send("POST", "/admin/community/projects", project)),
    () => ({ project: saveSample(project) }),
    sample,
  );
}

export function setAdminProjectStatus(id, status, { sample } = {}) {
  return mutate(
    () => send("POST", `/admin/community/projects/${encodeURIComponent(id)}/status`, { status }),
    () => ({ project: updateSample(id, { status }) }),
    sample,
  );
}

export function deleteAdminProject(id, { sample } = {}) {
  return mutate(() => send("DELETE", `/admin/community/projects/${encodeURIComponent(id)}`), () => removeSample([id]), sample);
}

export function bulkAdminProjects(ids, action, { sample } = {}) {
  return mutate(
    () => send("POST", "/admin/community/projects/bulk", { ids, action }),
    () => {
      if (action === "delete") return removeSample(ids);
      const status = action === "publish" ? "published" : "unpublished";
      ids.forEach((id) => updateSample(id, { status }));
      return {};
    },
    sample,
  );
}

// Uploads go to the existing /uploads endpoint. In sample mode the file stays in the browser.
export function uploadProjectFile(file, purpose, { sample } = {}) {
  return mutate(
    async () => {
      const uploaded = await uploadFile(file, purpose);
      return { url: uploaded.url, name: file.name, size: file.size };
    },
    () => ({ url: URL.createObjectURL(file), name: file.name, size: file.size, local: true }),
    sample,
  );
}

// ---------- publish rules (shown on the form; the backend checks them again) ----------

export function criteriaTotal(criteria) {
  return criteria.reduce((sum, item) => sum + (Number(item.weight) || 0), 0);
}

// Returns { field: message }. Drafts only need a title; publishing needs the full brief.
export function validateProject(project, { publishing }) {
  const errors = {};
  if (!project.title.trim()) errors.title = "Give the project a title.";
  else if (project.title.trim().length > 120) errors.title = "Keep the title under 120 characters.";
  if (project.shortDescription.length > 160) errors.shortDescription = "The short description can be up to 160 characters.";
  if (!publishing) return errors;

  if (!project.category) errors.category = "Choose a category.";
  if (!project.level) errors.level = "Choose a difficulty.";
  if (!project.duration) errors.duration = "Choose an estimated duration.";
  if (!project.shortDescription.trim()) errors.shortDescription = "Write a short description for the project card.";
  if (!project.description.trim()) errors.description = "Write the full description students will read.";
  if (!project.objectives.some((item) => item.trim())) errors.objectives = "Add at least one objective.";
  if (!project.steps.some((step) => step.title.trim())) errors.steps = "Add at least one step with a title.";
  if (project.submissionTypes.length === 0) errors.submissionTypes = "Allow at least one way to submit.";
  const named = project.criteria.filter((item) => item.name.trim() || item.weight !== "");
  if (named.length === 0) errors.criteria = "Add at least one evaluation criterion.";
  else if (named.some((item) => !item.name.trim())) errors.criteria = "Every criterion needs a name.";
  else if (criteriaTotal(project.criteria) !== 100) errors.criteria = `Weights add up to ${criteriaTotal(project.criteria)}%. They must total 100% before you can publish.`;
  return errors;
}

// ---------- sample store (local dev only) ----------

let store = null;
const daysAgo = (days) => new Date(Date.now() - days * 86400000).toISOString();
const SAMPLE_STATUS = { "2d-platformer-level": "unpublished", "support-ticket-classifier": "draft", "food-delivery-app-redesign": "draft" };

function sampleStore() {
  if (!store) {
    store = SAMPLE_COMMUNITY_PROJECTS.map((item, index) => ({
      ...emptyProject(),
      id: item.slug,
      title: item.title,
      category: item.category,
      level: item.level,
      duration: item.duration,
      shortDescription: item.description,
      description: `${item.description} Students plan the work, build it step by step and submit it for review.`,
      objectives: ["Plan the project before building", "Build every required feature", "Write a short README explaining your choices"],
      skills: item.category.includes("Design") ? ["Figma", "Prototyping"] : ["Git", "Problem solving"],
      requirements: "All required features work\nResponsive from 360px to desktop\nA README with setup steps",
      steps: [
        { title: "Plan the work", details: "List the features and sketch the main screens." },
        { title: "Build the core features", details: "Start with the most important flow and test it." },
        { title: "Polish and submit", details: "Fix bugs, write the README and submit your links." },
      ],
      access: item.access,
      submissionTypes: item.category.includes("Design") ? ["figma", "pdf", "images"] : ["github", "live"],
      criteria: [
        { name: "Meets the requirements", weight: 40 },
        { name: "Quality and structure", weight: 30 },
        { name: "Design and accessibility", weight: 20 },
        { name: "Documentation", weight: 10 },
      ],
      status: SAMPLE_STATUS[item.slug] ?? "published",
      submissions: SAMPLE_STATUS[item.slug] === "draft" ? 0 : Math.round(item.started * 0.45),
      studentsStarted: item.started,
      approvalRate: 60 + (index * 7) % 35,
      createdAt: daysAgo(80 - index),
      createdBy: "Tunde Bello",
      publishedAt: SAMPLE_STATUS[item.slug] === "draft" ? null : daysAgo(70 - index),
      updatedAt: daysAgo(index * 3 + 1),
      lastEditedBy: index % 2 ? "Grace Adeyemi" : "Tunde Bello",
    }));
  }
  return store;
}

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "project";

function saveSample(project) {
  const now = new Date().toISOString();
  const list = sampleStore();
  if (project.id) {
    const index = list.findIndex((item) => item.id === project.id);
    const previous = list[index];
    const next = { ...previous, ...project, updatedAt: now, lastEditedBy: "You", publishedAt: project.status === "published" ? previous.publishedAt ?? now : previous.publishedAt };
    list[index] = next;
    return structuredClone(next);
  }
  let id = slugify(project.title);
  while (list.some((item) => item.id === id)) id = `${id}-2`;
  const created = { ...project, id, submissions: 0, studentsStarted: 0, approvalRate: null, createdAt: now, createdBy: "You", updatedAt: now, lastEditedBy: "You", publishedAt: project.status === "published" ? now : null };
  list.unshift(created);
  return structuredClone(created);
}

function updateSample(id, changes) {
  const item = sampleStore().find((entry) => entry.id === id);
  if (!item) throw new Error("This project could not be found.");
  Object.assign(item, changes, { updatedAt: new Date().toISOString(), lastEditedBy: "You" });
  if (changes.status === "published" && !item.publishedAt) item.publishedAt = item.updatedAt;
  return structuredClone(item);
}

function removeSample(ids) {
  store = sampleStore().filter((item) => !ids.includes(item.id));
  return {};
}

function listSample({ search = "", category = "", level = "", access = "", status = "", sort = "updated", page = 1, pageSize }) {
  const term = search.trim().toLowerCase();
  const matches = sampleStore().filter((item) => (
    (!term || `${item.title} ${item.skills.join(" ")} ${item.category}`.toLowerCase().includes(term))
    && (!category || item.category === category)
    && (!level || item.level === level)
    && (!access || item.access === access)
    && (!status || item.status === status)
  ));
  const sorters = {
    updated: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
    title: (a, b) => a.title.localeCompare(b.title),
    submissions: (a, b) => b.submissions - a.submissions,
  };
  matches.sort(sorters[sort] ?? sorters.updated);
  const totalPages = Math.max(1, Math.ceil(matches.length / pageSize));
  const current = Math.min(Math.max(1, Number(page) || 1), totalPages);
  return {
    projects: matches.slice((current - 1) * pageSize, current * pageSize).map((item) => ({
      id: item.id, title: item.title, category: item.category, level: item.level, access: item.access,
      status: item.status, submissions: item.submissions, updatedAt: item.updatedAt,
    })),
    pagination: { page: current, totalPages, total: matches.length },
    categories: PROJECT_CATEGORIES,
  };
}
