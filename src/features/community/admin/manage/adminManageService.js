import { queryString, uploadFile } from "../../../../services/api/api";
import { requestData } from "../../../../services/api/dataClient";
import {
  BENEFIT_OPTIONS,
  MEMBER_CATEGORIES,
  RESOLUTION_LABELS,
  SAMPLE_AUDIENCE_OPTIONS,
  SAMPLE_SUBSCRIPTION_STATS,
  sampleAnalytics,
  sampleAnnouncements,
  sampleBadges,
  sampleCategories,
  sampleMembers,
  samplePayments,
  samplePlans,
  samplePointAudit,
  samplePointRules,
  sampleReports,
  sampleSettings,
  sampleSubscriptions,
} from "./sampleAdminManage";

// Admin Community "manage" screens: A19 Announcements, A20 Members, A21 Premium plans,
// A22 Subscriptions, A23 Analytics, A24 Badges, A25 Points, A26 Settings, A27 Reports & moderation.
//
// Every request needs an admin session; the backend checks the role on each call. Access rules
// the pages show (Premium, suspensions, points, badges) are enforced by the backend: these
// screens only send requests and show what the API returns. Points and automatic badges are
// awarded only by verified backend events (approved review, published results, confirmed
// payment); manual changes are logged with the admin's name and reason.
//
// Endpoints and response shapes
// A23 Analytics
//   GET  /admin/community/analytics?from=YYYY-MM-DD&to=YYYY-MM-DD
//        -> { period: { from, to, days },
//             engagement: { monthlyActiveMembers, monthlyActiveChange (%), projectsStarted, projectsStartedChange (%),
//                           projectsCompleted, projectsCompletedChange (%), submissionRate (%), teamsFormed,
//                           teamsFormedChange, collaborationCompletion (%), hackathonRegistrations, hackathonName,
//                           competitionRegistrations, competitionFree, competitionPaid },
//             revenue: { competitionRevenueUsd, competitionRevenueChangeUsd, premiumConversion (%), premiumConversionChange (pts),
//                        mrrUsd, mrrChangeUsd, mrrCompareLabel, cancellations, churnRate (%), cancellationsChange },
//             activeTrend: [{ day, count }], revenueBySource: [{ label, subscriptions, competitions }],
//             funnel: [{ title, count }], topCategories: [{ category, started, completed }] }
// A19 Announcements
//   GET    /admin/community/announcements -> { announcements: [announcement], audienceOptions: { categories: [..], events: [{ id, title, participants }] }, totalMembers }
//          announcement: { id, title, body, category, audience: { type: "all" | "premium" | "free" | "category" | "event", value? },
//                          imageUrl, link, pinned, sendEmail, status: "draft" | "scheduled" | "published",
//                          scheduledAt, publishedAt, updatedAt, reached, openedRate (%) }
//   POST   /admin/community/announcements          { ...announcement, status } -> { announcement }
//   PUT    /admin/community/announcements/:id      { ...announcement, status } -> { announcement }
//   POST   /admin/community/announcements/:id/pin  { pinned } -> { announcement }
//   POST   /admin/community/announcements/:id/cancel  (a scheduled one goes back to draft) -> { announcement }
//   DELETE /admin/community/announcements/:id
//   (The backend sends it at scheduledAt, to the audience it resolves itself, and sends the email when sendEmail is on.)
// A20 Members
//   GET  /admin/community/members?search=&category=&plan=&status=&page=&pageSize=
//        -> { members: [{ id, name, username, email, category, plan: "free" | "premium" | "premium_plus", points, projects,
//                         joinedAt, status: "active" | "suspended", suspendedUntil }],
//             pagination: { page, totalPages, total }, stats: { total, premium, activeThisWeek, suspended }, categories }
//   GET  /admin/community/members/export?search=&category=&plan=&status= -> { csv }
//   POST /admin/community/members/:id/suspend { reason, days (null = until restored), message } -> { member }
//   POST /admin/community/members/:id/restore -> { member }
// A21 Premium plans
//   GET  /admin/community/plans -> { plans: [plan], benefitOptions: [{ key, label }] }
//        plan: { id, name, displayName, priceMonthly, priceYearly, trialDays, description, benefits: [key],
//                billing: { monthly, yearly, quarterly }, includePaidCompetitionEntry, showOnPricing, enabled, isFree,
//                members, subscribers, monthly, yearly, revenueThisMonth, updatedAt, updatedBy }
//   POST /admin/community/plans { ...plan } -> { plan }
//   PUT  /admin/community/plans/:id { ...plan } -> { plan }   (new prices apply to new subscriptions only)
//   POST /admin/community/plans/:id/enabled { enabled } -> { plan }
// A22 Subscriptions
//   GET  /admin/community/subscriptions?tab=subscriptions|complimentary&search=&plan=&status=&page=&pageSize=
//        -> { subscriptions: [{ id, memberId, name, email, plan, cycle: "monthly" | "yearly" | "complimentary", months,
//                               startedAt, endsAt, amount, status: "active" | "expiring" | "complimentary" | "cancelled" | "expired", note }],
//             pagination, counts: { subscriptions, payments, complimentary },
//             stats: { active, activeThisMonth, expired, expiringSoon, mrrUsd, mrrChangeUsd, cancellations30d, churnRate } }
//   GET  /admin/community/subscriptions/payments?search=&page=&pageSize=
//        -> { payments: [{ id, date, member, description, amount, status: "paid" | "failed" | "refunded" }], pagination }
//   POST /admin/community/subscriptions/complimentary { memberId, plan, months, reason, note } -> { subscription }
//        (No payment is taken; the backend grants access and records the admin and reason in the activity log.)
// A24 Badges
//   GET  /admin/community/badges -> { badges: [{ id, name, description, icon, colour, trigger, count, bonusPoints,
//                                              showOnProfile, premiumOnly, enabled, awarded }] }
//   POST /admin/community/badges { ...badge } -> { badge }       PUT /admin/community/badges/:id { ...badge } -> { badge }
//   POST /admin/community/badges/:id/enabled { enabled } -> { badge }
//   POST /admin/community/badges/:id/award { memberId, reason } -> { badge }
// A25 Points
//   GET  /admin/community/points -> { rules: [{ id, activity, triggeredBy, points, maxPerDay (null = no limit), awarded30d, enabled }],
//                                    audit: [{ id, date, member, change (number | null), kind: "adjustment" | "rule_change", reason, by }] }
//   PUT  /admin/community/points/rules { rules: [{ id, points, maxPerDay, enabled }] } -> { rules, audit }
//   POST /admin/community/points/adjustments { memberId, type: "add" | "remove", amount, reason } -> { entry }
// A26 Settings
//   GET  /admin/community/settings -> { settings: { rules, rulesUpdatedAt, rulesUpdatedBy, maxFileSizeMb, filesPerSubmission,
//                                       resubmissions, formats: [{ key, label, enabled }],
//                                       notifications: [{ key, label, inApp, email }],
//                                       moderation: { autoHideAfter, blockedWords, reviewShowcase, allowComments, allowNewMemberComments } },
//                                       categories: [{ id, group: "projects" | "competitions" | "hackathons", name, count, status: "active" | "archived" }] }
//   PUT  /admin/community/settings { settings } -> { settings }
//   POST /admin/community/categories { group, name } -> { category }
//   PUT  /admin/community/categories/:id { name } -> { category }
//   POST /admin/community/categories/:id/archive | /restore -> { category }
// A27 Reports & moderation
//   GET  /admin/community/reports?status=open|in_review|resolved&type=&page=&pageSize=
//        -> { reports: [report], counts: { open, in_review, resolved }, pagination }
//        report: { id, number, type, targetType, targetId, target, excerpt, content, reporter, reporterNote, reports,
//                  createdAt, status, subject: { name, username, memberSince, previousWarnings }, history: [{ label, date }],
//                  resolution: { action, note, by, at } | null }
//        Student reports (POST /community/reports { targetType, targetId, reason, details } from the Showcase) arrive
//        here: reason maps to `type`, details to `reporterNote`.
//   POST /admin/community/reports/:id/actions { action: "review" | "dismiss" | "remove_content" | "warn" | "suspend", note, days? }
//        -> { report }   The backend applies the action and records it in the activity log.
//
// On the local dev server, when those requests fail, the pages use an in-memory sample store so
// every button can be tried. Changes last until the page reloads.

export const MEMBERS_PAGE_SIZE = 7;
export const SUBSCRIPTIONS_PAGE_SIZE = 7;
export const REPORTS_PAGE_SIZE = 8;

const send = (method, path, body) => requestData(path, undefined, { method, body: body === undefined ? undefined : JSON.stringify(body) });
const delay = (value) => new Promise((resolve) => { window.setTimeout(() => resolve(value), 300); });
const clone = (value) => structuredClone(value);
const now = () => new Date().toISOString();

// GET with the dev-server fallback. `check` returns true when the response has the expected shape.
async function load(path, check, sample) {
  try {
    const result = await requestData(path);
    if (!check(result)) throw new Error("This information is not available yet.");
    return { ...result, isSample: false };
  } catch (error) {
    if (import.meta.env.DEV) return { ...clone(sample()), isSample: true };
    throw error;
  }
}

// Runs a change against the API. On the local dev server, if the API isn't there (no response,
// not found, not signed in, or a server error), the change goes to the sample store instead.
// Real validation errors (400 / 409 / 422) are always shown.
async function mutate(real, sampleChange, sample) {
  if (sample) return delay(clone(sampleChange()));
  try {
    return await real();
  } catch (error) {
    const missing = !error.status || [401, 403, 404, 405].includes(error.status) || error.status >= 500;
    if (import.meta.env.DEV && missing) return delay(clone(sampleChange()));
    throw error;
  }
}

function paginate(list, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(list.length / pageSize));
  const current = Math.min(Math.max(1, Number(page) || 1), totalPages);
  return { rows: list.slice((current - 1) * pageSize, current * pageSize), pagination: { page: current, totalPages, total: list.length } };
}

const enc = encodeURIComponent;

// ---------- A23 Analytics ----------

export const getCommunityAnalytics = (range) => load(`/admin/community/analytics${queryString(range)}`, (r) => r?.engagement && r?.revenue, () => sampleAnalytics(range));

// ---------- A19 Announcements ----------

export const ANNOUNCEMENT_CATEGORIES = [
  { value: "projects", label: "Projects" },
  { value: "hackathons", label: "Hackathons" },
  { value: "competitions", label: "Competitions" },
  { value: "collaboration", label: "Collaboration" },
  { value: "premium", label: "Premium" },
  { value: "platform", label: "Platform" },
];

export function emptyAnnouncement() {
  return { id: null, title: "", body: "", category: "", audience: { type: "all" }, imageUrl: "", link: "", pinned: false, sendEmail: false, scheduledAt: null, status: "draft" };
}

export const getAdminAnnouncements = () => load(
  "/admin/community/announcements",
  (r) => Array.isArray(r?.announcements),
  () => ({ announcements: sampleAnnouncements(), audienceOptions: SAMPLE_AUDIENCE_OPTIONS, totalMembers: sampleMembers().length }),
);

function findAnnouncement(id) {
  const item = sampleAnnouncements().find((entry) => entry.id === id);
  if (!item) throw new Error("This announcement could not be found.");
  return item;
}

export function saveAnnouncement(announcement, { sample } = {}) {
  return mutate(
    () => (announcement.id
      ? send("PUT", `/admin/community/announcements/${enc(announcement.id)}`, announcement)
      : send("POST", "/admin/community/announcements", announcement)),
    () => {
      const list = sampleAnnouncements();
      const published = announcement.status === "published";
      const audienceSize = { all: 1042, premium: 137, free: 905, category: 240, event: 212 }[announcement.audience.type] ?? 0;
      if (announcement.id) {
        const item = findAnnouncement(announcement.id);
        Object.assign(item, announcement, {
          updatedAt: now(),
          publishedAt: published ? item.publishedAt ?? now() : item.publishedAt,
          reached: published ? item.reached ?? audienceSize : item.reached,
        });
        return { announcement: item };
      }
      const created = { ...announcement, id: `a-${Date.now()}`, updatedAt: now(), publishedAt: published ? now() : null, reached: published ? audienceSize : null, openedRate: null };
      list.unshift(created);
      return { announcement: created };
    },
    sample,
  );
}

export const pinAnnouncement = (id, pinned, { sample } = {}) => mutate(
  () => send("POST", `/admin/community/announcements/${enc(id)}/pin`, { pinned }),
  () => ({ announcement: Object.assign(findAnnouncement(id), { pinned, updatedAt: now() }) }),
  sample,
);

export const cancelScheduledAnnouncement = (id, { sample } = {}) => mutate(
  () => send("POST", `/admin/community/announcements/${enc(id)}/cancel`),
  () => ({ announcement: Object.assign(findAnnouncement(id), { status: "draft", scheduledAt: null, updatedAt: now() }) }),
  sample,
);

export const deleteAnnouncement = (id, { sample } = {}) => mutate(
  () => send("DELETE", `/admin/community/announcements/${enc(id)}`),
  () => {
    const list = sampleAnnouncements();
    list.splice(list.findIndex((item) => item.id === id), 1);
    return {};
  },
  sample,
);

// Cover image upload (existing /uploads endpoint). In sample mode the file stays in the browser.
export const uploadAnnouncementImage = (file, { sample } = {}) => mutate(
  async () => ({ url: (await uploadFile(file, "image")).url }),
  () => ({ url: URL.createObjectURL(file) }),
  sample,
);

// ---------- A20 Members ----------

export const PLAN_LABELS = { free: "Free", premium: "Premium", premium_plus: "Premium Plus" };

function filterMembers({ search = "", category = "", plan = "", status = "" }) {
  const term = search.trim().toLowerCase();
  return sampleMembers().filter((m) => (
    (!term || `${m.name} ${m.username} ${m.email}`.toLowerCase().includes(term))
    && (!category || m.category === category)
    && (!plan || m.plan === plan)
    && (!status || m.status === status)
  ));
}

function memberStats() {
  const all = sampleMembers();
  return {
    total: all.length,
    premium: all.filter((m) => m.plan !== "free").length,
    activeThisWeek: all.filter((m) => m.activeThisWeek).length,
    suspended: all.filter((m) => m.status === "suspended").length,
  };
}

export function getAdminMembers(filters) {
  const params = { ...filters, pageSize: filters.pageSize ?? MEMBERS_PAGE_SIZE };
  return load(`/admin/community/members${queryString(params)}`, (r) => Array.isArray(r?.members), () => {
    const { rows, pagination } = paginate(filterMembers(params), params.page, params.pageSize);
    return { members: rows, pagination, stats: memberStats(), categories: MEMBER_CATEGORIES };
  });
}

// Member picker used by grant / award / adjustment forms.
export async function searchMembers(search) {
  const result = await getAdminMembers({ search, pageSize: 6, page: 1 });
  return result.members;
}

export function exportMembersCsv(filters, { sample } = {}) {
  return mutate(
    () => requestData(`/admin/community/members/export${queryString(filters)}`),
    () => {
      const rows = [["Name", "Username", "Email", "Course", "Plan", "Points", "Projects", "Joined", "Status"]];
      filterMembers(filters).forEach((m) => rows.push([m.name, m.username, m.email, m.category, PLAN_LABELS[m.plan], m.points, m.projects, m.joinedAt.slice(0, 10), m.status]));
      return { rows };
    },
    sample,
  );
}

function findMember(id) {
  const member = sampleMembers().find((m) => m.id === id);
  if (!member) throw new Error("This member could not be found.");
  return member;
}

export const suspendMember = (id, { reason, days, message }, { sample } = {}) => mutate(
  () => send("POST", `/admin/community/members/${enc(id)}/suspend`, { reason, days, message }),
  () => ({ member: Object.assign(findMember(id), { status: "suspended", suspendedUntil: days ? new Date(Date.now() + days * 86400000).toISOString() : null }) }),
  sample,
);

export const restoreMember = (id, { sample } = {}) => mutate(
  () => send("POST", `/admin/community/members/${enc(id)}/restore`),
  () => ({ member: Object.assign(findMember(id), { status: "active", suspendedUntil: null }) }),
  sample,
);

// ---------- A21 Premium plans ----------

export function emptyPlan() {
  return {
    id: null, name: "", displayName: "", priceMonthly: "", priceYearly: "", trialDays: 0, description: "", benefits: [],
    billing: { monthly: true, yearly: true, quarterly: false }, includePaidCompetitionEntry: false, showOnPricing: false, enabled: false,
    isFree: false, subscribers: 0, monthly: 0, yearly: 0, revenueThisMonth: 0,
  };
}

export const getAdminPlans = () => load("/admin/community/plans", (r) => Array.isArray(r?.plans), () => ({ plans: samplePlans(), benefitOptions: BENEFIT_OPTIONS }));

export function savePlan(plan, { sample } = {}) {
  return mutate(
    () => (plan.id ? send("PUT", `/admin/community/plans/${enc(plan.id)}`, plan) : send("POST", "/admin/community/plans", plan)),
    () => {
      const list = samplePlans();
      if (plan.id) {
        const index = list.findIndex((item) => item.id === plan.id);
        list[index] = { ...list[index], ...plan, updatedAt: now(), updatedBy: "You" };
        return { plan: list[index] };
      }
      let id = plan.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "plan";
      while (list.some((item) => item.id === id)) id = `${id}-2`;
      const created = { ...plan, id, updatedAt: now(), updatedBy: "You" };
      list.push(created);
      return { plan: created };
    },
    sample,
  );
}

export const setPlanEnabled = (id, enabled, { sample } = {}) => mutate(
  () => send("POST", `/admin/community/plans/${enc(id)}/enabled`, { enabled }),
  () => {
    const plan = samplePlans().find((item) => item.id === id);
    if (plan.isFree && !enabled) throw new Error("The Free plan is always on.");
    return { plan: Object.assign(plan, { enabled }) };
  },
  sample,
);

// ---------- A22 Subscriptions ----------

function subscriptionStats() {
  const subs = sampleSubscriptions();
  const current = subs.filter((s) => ["active", "expiring", "complimentary"].includes(s.status));
  return {
    active: current.length,
    expired: subs.length - current.length,
    expiringSoon: subs.filter((s) => s.status === "expiring").length,
    ...SAMPLE_SUBSCRIPTION_STATS,
  };
}
function subscriptionCounts() {
  const subs = sampleSubscriptions();
  return { subscriptions: subs.length, payments: samplePayments().length, complimentary: subs.filter((s) => s.status === "complimentary").length };
}

export function getAdminSubscriptions(filters) {
  const params = { ...filters, pageSize: SUBSCRIPTIONS_PAGE_SIZE };
  return load(`/admin/community/subscriptions${queryString(params)}`, (r) => Array.isArray(r?.subscriptions), () => {
    const term = (params.search ?? "").trim().toLowerCase();
    const matches = sampleSubscriptions().filter((s) => (
      (params.tab !== "complimentary" || s.status === "complimentary")
      && (!term || `${s.name} ${s.email}`.toLowerCase().includes(term))
      && (!params.plan || s.plan === params.plan)
      && (!params.status || s.status === params.status)
    ));
    const { rows, pagination } = paginate(matches, params.page, params.pageSize);
    return { subscriptions: rows, pagination, counts: subscriptionCounts(), stats: subscriptionStats() };
  });
}

export function getAdminPayments(filters) {
  const params = { ...filters, pageSize: SUBSCRIPTIONS_PAGE_SIZE };
  return load(`/admin/community/subscriptions/payments${queryString(params)}`, (r) => Array.isArray(r?.payments), () => {
    const term = (params.search ?? "").trim().toLowerCase();
    const matches = samplePayments().filter((p) => !term || p.member.toLowerCase().includes(term));
    const { rows, pagination } = paginate(matches, params.page, params.pageSize);
    return { payments: rows, pagination };
  });
}

export function grantComplimentary({ memberId, plan, months, reason, note }, { sample } = {}) {
  return mutate(
    () => send("POST", "/admin/community/subscriptions/complimentary", { memberId, plan, months, reason, note }),
    () => {
      const member = findMember(memberId);
      if (member.plan !== "free") throw new Error(`${member.name} already has ${PLAN_LABELS[member.plan]}.`);
      member.plan = plan;
      const subscription = {
        id: `sub-${Date.now()}`, memberId, name: member.name, email: member.email, plan, cycle: "complimentary", months,
        startedAt: now(), endsAt: new Date(Date.now() + months * 30 * 86400000).toISOString(), amount: 0, status: "complimentary", note: reason,
      };
      sampleSubscriptions().unshift(subscription);
      return { subscription };
    },
    sample,
  );
}

// ---------- A24 Badges ----------

export const getAdminBadges = () => load("/admin/community/badges", (r) => Array.isArray(r?.badges), () => ({ badges: sampleBadges() }));

export function emptyBadge() {
  return { id: null, name: "", description: "", icon: "award", colour: "blue", trigger: "individual_project_approved", count: 1, bonusPoints: 0, showOnProfile: true, premiumOnly: false, enabled: false, awarded: 0 };
}

export function saveBadge(badge, { sample } = {}) {
  return mutate(
    () => (badge.id ? send("PUT", `/admin/community/badges/${enc(badge.id)}`, badge) : send("POST", "/admin/community/badges", badge)),
    () => {
      const list = sampleBadges();
      if (badge.id) {
        const index = list.findIndex((item) => item.id === badge.id);
        list[index] = { ...list[index], ...badge };
        return { badge: list[index] };
      }
      const created = { awarded: 0, ...badge, id: `badge-${Date.now()}` };
      list.push(created);
      return { badge: created };
    },
    sample,
  );
}

export const setBadgeEnabled = (id, enabled, { sample } = {}) => mutate(
  () => send("POST", `/admin/community/badges/${enc(id)}/enabled`, { enabled }),
  () => ({ badge: Object.assign(sampleBadges().find((item) => item.id === id), { enabled }) }),
  sample,
);

export const awardBadge = (id, { memberId, reason }, { sample } = {}) => mutate(
  () => send("POST", `/admin/community/badges/${enc(id)}/award`, { memberId, reason }),
  () => {
    findMember(memberId);
    const badge = sampleBadges().find((item) => item.id === id);
    badge.awarded += 1;
    return { badge };
  },
  sample,
);

// ---------- A25 Points ----------

export const getPointSettings = () => load("/admin/community/points", (r) => Array.isArray(r?.rules), () => ({ rules: samplePointRules(), audit: samplePointAudit() }));

export function savePointRules(rules, { sample } = {}) {
  const payload = rules.map(({ id, points, maxPerDay, enabled }) => ({ id, points: Number(points), maxPerDay: maxPerDay === "" ? null : Number(maxPerDay), enabled }));
  return mutate(
    () => send("PUT", "/admin/community/points/rules", { rules: payload }),
    () => {
      const stored = samplePointRules();
      const audit = samplePointAudit();
      payload.forEach((change) => {
        const rule = stored.find((item) => item.id === change.id);
        const notes = [];
        if (rule.points !== change.points) notes.push(`${rule.activity} changed from ${rule.points} to ${change.points}`);
        if (rule.enabled !== change.enabled) notes.push(`${rule.activity} ${change.enabled ? "turned on" : "turned off"}`);
        if ((rule.maxPerDay === "" ? null : rule.maxPerDay) !== change.maxPerDay) notes.push(`${rule.activity} daily limit set to ${change.maxPerDay ?? "no limit"}`);
        notes.forEach((reason) => audit.unshift({ id: `audit-${Date.now()}-${audit.length}`, date: now(), member: "All members", change: null, kind: "rule_change", reason, by: "You" }));
        Object.assign(rule, { points: change.points, enabled: change.enabled, maxPerDay: change.maxPerDay ?? "" });
      });
      return { rules: stored, audit };
    },
    sample,
  );
}

export function adjustPoints({ memberId, type, amount, reason }, { sample } = {}) {
  return mutate(
    () => send("POST", "/admin/community/points/adjustments", { memberId, type, amount, reason }),
    () => {
      const member = findMember(memberId);
      const change = type === "remove" ? -amount : amount;
      member.points = Math.max(0, member.points + change);
      const entry = { id: `audit-${Date.now()}`, date: now(), member: member.name, change, kind: "adjustment", reason, by: "You" };
      samplePointAudit().unshift(entry);
      return { entry };
    },
    sample,
  );
}

// ---------- A26 Settings ----------

export const getCommunitySettings = () => load("/admin/community/settings", (r) => r?.settings, () => ({ settings: sampleSettings(), categories: sampleCategories() }));

export const saveCommunitySettings = (settings, { sample } = {}) => mutate(
  () => send("PUT", "/admin/community/settings", { settings }),
  () => {
    const stored = sampleSettings();
    const rulesChanged = stored.rules !== settings.rules;
    Object.assign(stored, settings, rulesChanged ? { rulesUpdatedAt: now(), rulesUpdatedBy: "You" } : {});
    return { settings: stored };
  },
  sample,
);

function findCategory(id) {
  const category = sampleCategories().find((item) => item.id === id);
  if (!category) throw new Error("This category could not be found.");
  return category;
}
function checkCategoryName(group, name, id) {
  if (sampleCategories().some((item) => item.group === group && item.id !== id && item.name.toLowerCase() === name.toLowerCase())) {
    throw new Error(`“${name}” already exists.`);
  }
}

export const addCategory = (group, name, { sample } = {}) => mutate(
  () => send("POST", "/admin/community/categories", { group, name }),
  () => {
    checkCategoryName(group, name);
    const category = { id: `${group}-${Date.now()}`, group, name, count: 0, status: "active" };
    sampleCategories().push(category);
    return { category };
  },
  sample,
);

export const renameCategory = (id, name, { sample } = {}) => mutate(
  () => send("PUT", `/admin/community/categories/${enc(id)}`, { name }),
  () => {
    const category = findCategory(id);
    checkCategoryName(category.group, name, id);
    return { category: Object.assign(category, { name }) };
  },
  sample,
);

export const setCategoryArchived = (id, archived, { sample } = {}) => mutate(
  () => send("POST", `/admin/community/categories/${enc(id)}/${archived ? "archive" : "restore"}`),
  () => ({ category: Object.assign(findCategory(id), { status: archived ? "archived" : "active" }) }),
  sample,
);

// ---------- A27 Reports & moderation ----------

export const REPORT_TYPES = {
  harassment: { label: "Harassment", tone: "red" },
  copyright: { label: "Copyright", tone: "amber" },
  fake_submission: { label: "Fake submission", tone: "blue" },
  spam: { label: "Spam", tone: "neutral" },
  abusive_comment: { label: "Abusive comment", tone: "red" },
  plagiarism: { label: "Not their own work", tone: "purple" },
  other: { label: "Other", tone: "neutral" },
};
export { RESOLUTION_LABELS };

export function getAdminReports(filters) {
  const params = { ...filters, pageSize: REPORTS_PAGE_SIZE };
  return load(`/admin/community/reports${queryString(params)}`, (r) => Array.isArray(r?.reports), () => {
    const all = sampleReports();
    const counts = { open: 0, in_review: 0, resolved: 0 };
    all.forEach((item) => { counts[item.status] += 1; });
    const matches = all.filter((item) => item.status === (params.status || "open") && (!params.type || item.type === params.type));
    const { rows, pagination } = paginate(matches, params.page, params.pageSize);
    return { reports: rows, counts, pagination };
  });
}

export const moderateReport = (id, { action, note, days }, { sample } = {}) => mutate(
  () => send("POST", `/admin/community/reports/${enc(id)}/actions`, { action, note, days }),
  () => {
    const report = sampleReports().find((item) => item.id === id);
    if (!report) throw new Error("This report could not be found.");
    if (action === "review") report.status = "in_review";
    else {
      report.status = "resolved";
      report.resolution = { action, note, by: "You", at: now() };
      if (action === "warn") report.subject.previousWarnings += 1;
    }
    return { report };
  },
  sample,
);
