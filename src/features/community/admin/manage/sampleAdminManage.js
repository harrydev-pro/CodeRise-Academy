import { POINT_RULES } from "../../sampleCommunityLeaderboard";

// Sample data for the admin "manage" screens (A19–A27), used only on the local dev server while
// the admin Community API is not available (see adminManageService.js). Numbers line up with the
// A01 overview: 1,042 members, 137 Premium (112 Premium + 25 Premium Plus), MRR $1,768 and 6 open
// reports in the moderation queue. Dates are relative to now so they always make sense.

const DAY = 86400000;
const ago = (days, hour = 10) => {
  const date = new Date(Date.now() - days * DAY);
  date.setUTCHours(hour - 1, 0, 0, 0);
  return date.toISOString();
};
const ahead = (days, hour = 10) => ago(-days, hour);

// ---------- A20 Members ----------

export const MEMBER_CATEGORIES = ["Frontend", "Backend", "Fullstack", "Product Design", "Data Analysis", "Digital Marketing", "Mobile Development", "Virtual Assistance"];

const NAMED_MEMBERS = [
  { name: "Chinedu Eze", username: "chinedu.builds", category: "Fullstack", plan: "premium_plus", points: 4860, projects: 21, joined: 268 },
  { name: "Kemi Martins", username: "kemidesigns", category: "Product Design", plan: "premium", points: 4215, projects: 17, joined: 229 },
  { name: "Amara Okafor", username: "amara.codes", category: "Frontend", plan: "free", points: 1240, projects: 5, joined: 177 },
  { name: "Samuel Owusu", username: "samowusu", category: "Backend", plan: "free", points: 980, projects: 4, joined: 130 },
  { name: "Joshua Akande", username: "jakande", category: "Frontend", plan: "free", points: 310, projects: 2, joined: 79, status: "suspended" },
  { name: "Halima Musa", username: "halima.ui", category: "Product Design", plan: "free", points: 760, projects: 3, joined: 56 },
  { name: "David Mensah", username: "dmensah.data", category: "Data Analysis", plan: "premium", points: 3990, projects: 14, joined: 273 },
  { name: "Ifeoma Nwosu", username: "ifeoma.n", category: "Frontend", plan: "premium", points: 3620, projects: 13, joined: 210 },
  { name: "Grace Adeyemi", username: "grace.a", category: "Digital Marketing", plan: "premium", points: 2790, projects: 9, joined: 320 },
  { name: "Tolu Adebayo", username: "tolu.adebayo", category: "Frontend", plan: "premium", points: 1880, projects: 7, joined: 150 },
  { name: "Kwame Asante", username: "kwame.asante", category: "Backend", plan: "premium_plus", points: 2210, projects: 8, joined: 190 },
  { name: "Aisha Bello", username: "aisha.bello", category: "Data Analysis", plan: "free", points: 640, projects: 3, joined: 64 },
  { name: "Daniel Okon", username: "daniel.okon", category: "Fullstack", plan: "free", points: 420, projects: 2, joined: 84 },
  { name: "Fatima Sule", username: "fatima.sule", category: "Product Design", plan: "free", points: 890, projects: 4, joined: 112 },
];

const FIRST = ["Bola", "Emeka", "Ngozi", "Kwesi", "Aisha", "Tunde", "Chioma", "Kofi", "Fola", "Musa", "Ama", "Seun", "Ada", "Ibrahim", "Efua", "Dayo", "Uche", "Nana", "Lola", "Femi", "Akua", "Obi", "Sade", "Yaw", "Rita", "Jide", "Esi", "Kunle", "Mariam", "Tayo", "Zainab", "Yusuf", "Halima", "Kelechi", "Abena", "Segun"];
const LAST = ["Adebayo", "Okeke", "Mensah", "Bello", "Owusu", "Nwachukwu", "Danjuma", "Asante", "Ogunleye", "Abdullahi", "Eze", "Boateng", "Okafor", "Kamara", "Sesay"];

const TOTAL_MEMBERS = 1042;
const PLAN_TARGET = { premium: 112, premium_plus: 25 };

let members = null;
export function sampleMembers() {
  if (members) return members;
  const list = NAMED_MEMBERS.map((item, index) => ({
    id: `m-${index + 1}`,
    name: item.name,
    username: item.username,
    email: `${item.username.replace(/\./g, "")}@example.com`,
    category: item.category,
    plan: item.plan,
    points: item.points,
    projects: item.projects,
    joinedAt: ago(item.joined),
    status: item.status ?? "active",
    suspendedUntil: item.status === "suspended" ? ahead(5) : null,
  }));
  const used = { premium: list.filter((m) => m.plan === "premium").length, premium_plus: list.filter((m) => m.plan === "premium_plus").length };
  let suspended = list.filter((m) => m.status === "suspended").length;
  for (let i = 0; list.length < TOTAL_MEMBERS; i += 1) {
    const first = FIRST[i % FIRST.length];
    const last = LAST[Math.floor(i / FIRST.length) % LAST.length];
    const clash = i >= FIRST.length * LAST.length || NAMED_MEMBERS.some((item) => item.name === `${first} ${last}`);
    const username = `${first}.${last}${clash ? i : ""}`.toLowerCase();
    let plan = "free";
    if (i % 40 === 7 && used.premium_plus < PLAN_TARGET.premium_plus) { plan = "premium_plus"; used.premium_plus += 1; }
    else if (i % 8 === 2 && used.premium < PLAN_TARGET.premium) { plan = "premium"; used.premium += 1; }
    const isSuspended = i % 300 === 151 && suspended < 4;
    if (isSuspended) suspended += 1;
    const points = Math.max(0, 2600 - ((i * 37) % 2600) - Math.floor(i / 2));
    list.push({
      id: `m-${list.length + 1}`,
      name: `${first} ${last}`,
      username,
      email: `${username.replace(/\./g, "")}@example.com`,
      category: MEMBER_CATEGORIES[i % MEMBER_CATEGORIES.length],
      plan,
      points,
      projects: Math.floor(points / 220),
      joinedAt: ago(5 + ((i * 13) % 360)),
      status: isSuspended ? "suspended" : "active",
      suspendedUntil: isSuspended ? ahead(3 + (i % 10)) : null,
    });
  }
  // Exactly 488 members active in the last 7 days (a fixed shuffle of the list).
  list.forEach((member, index) => { member.activeThisWeek = (index * 389) % TOTAL_MEMBERS < 488; });
  members = list;
  return members;
}

// ---------- A21 Premium plans ----------

export const BENEFIT_OPTIONS = [
  { key: "unlimited_premium_projects", label: "Unlimited Premium projects" },
  { key: "premium_collaborations", label: "Premium collaboration projects" },
  { key: "advanced_resources", label: "Advanced project resources" },
  { key: "exclusive_materials", label: "Exclusive learning materials" },
  { key: "premium_hackathons", label: "Eligible Premium hackathons" },
  { key: "community_badge", label: "Premium community badge" },
  { key: "masterclasses", label: "Exclusive masterclasses" },
  { key: "priority_review", label: "Priority project review" },
  { key: "mentorship_priority", label: "Mentorship priority access" },
  { key: "portfolio_feedback", label: "Portfolio feedback sessions" },
  { key: "free_projects", label: "Free projects & collaborations" },
  { key: "free_events", label: "Free hackathons & competitions" },
  { key: "showcase", label: "Showcase & leaderboard" },
];

let plans = null;
export function samplePlans() {
  if (plans) return plans;
  plans = [
    {
      id: "free", name: "Free", displayName: "CodeRise Free", priceMonthly: 0, priceYearly: 0, trialDays: 0, isFree: true,
      description: "Every registered student starts here.", benefits: ["free_projects", "free_events", "showcase"],
      billing: { monthly: false, yearly: false, quarterly: false }, includePaidCompetitionEntry: false, showOnPricing: true, enabled: true,
      members: 905, subscribers: 0, monthly: 0, yearly: 0, revenueThisMonth: 0, updatedAt: ago(120), updatedBy: "Tunde Bello",
    },
    {
      id: "premium", name: "Premium", displayName: "CodeRise Premium", priceMonthly: 9.99, priceYearly: 99, trialDays: 0,
      description: "For students who want more practical learning opportunities.",
      benefits: ["unlimited_premium_projects", "premium_collaborations", "advanced_resources", "exclusive_materials", "premium_hackathons", "community_badge", "masterclasses"],
      billing: { monthly: true, yearly: true, quarterly: false }, includePaidCompetitionEntry: false, showOnPricing: true, enabled: true,
      subscribers: 112, monthly: 71, yearly: 41, revenueThisMonth: 1268, updatedAt: ago(56), updatedBy: "Tunde Bello",
    },
    {
      id: "premium-plus", name: "Premium Plus", displayName: "CodeRise Premium Plus", priceMonthly: 19.99, priceYearly: 199, trialDays: 0,
      description: "Everything in Premium, plus reviews and feedback from mentors.",
      benefits: ["unlimited_premium_projects", "premium_collaborations", "advanced_resources", "exclusive_materials", "premium_hackathons", "community_badge", "masterclasses", "priority_review", "portfolio_feedback"],
      billing: { monthly: true, yearly: true, quarterly: false }, includePaidCompetitionEntry: true, showOnPricing: true, enabled: true,
      subscribers: 25, monthly: 18, yearly: 7, revenueThisMonth: 500, updatedAt: ago(56), updatedBy: "Tunde Bello",
    },
  ];
  return plans;
}

// ---------- A22 Subscriptions ----------

let subscriptions = null;
let payments = null;
const PRICE = { premium: { monthly: 9.99, yearly: 99 }, premium_plus: { monthly: 19.99, yearly: 199 } };
const NAMED_SUBS = {
  "Kemi Martins": { plan: "premium_plus", cycle: "yearly", started: 255, status: "active" },
  "Chinedu Eze": { plan: "premium", cycle: "monthly", started: 115, status: "active" },
  "Ifeoma Nwosu": { plan: "premium", cycle: "monthly", started: 36, status: "expiring", renewsIn: 3 },
  "David Mensah": { plan: "premium", cycle: "complimentary", started: 25, status: "complimentary", note: "Hackathon winner", renewsIn: 5 },
  "Samuel Owusu": { plan: "premium", cycle: "monthly", started: 165, status: "cancelled", endedAgo: 12 },
  "Halima Musa": { plan: "premium_plus", cycle: "monthly", started: 149, status: "expired", note: "payment failed", endedAgo: 26 },
  "Grace Adeyemi": { plan: "premium", cycle: "yearly", started: 322, status: "active" },
};

export function sampleSubscriptions() {
  if (subscriptions) return subscriptions;
  const all = sampleMembers();
  const list = [];
  let complimentary = 0;
  let expiring = 0;
  let expired = 0;
  const add = (member, values) => list.push({ id: `sub-${list.length + 1}`, memberId: member.id, name: member.name, email: member.email, ...values });

  // Named rows first so the table opens on the design's examples.
  Object.entries(NAMED_SUBS).forEach(([name, item]) => {
    const member = all.find((m) => m.name === name);
    const plan = member.plan === "free" ? item.plan : member.plan;
    const amount = item.cycle === "complimentary" ? 0 : PRICE[plan][item.cycle];
    const startedAt = ago(item.started);
    const periodDays = item.cycle === "yearly" ? 365 : 30;
    const endsAt = item.endedAgo ? ago(item.endedAgo) : item.renewsIn ? ahead(item.renewsIn) : new Date(new Date(startedAt).getTime() + Math.ceil(item.started / periodDays) * periodDays * DAY).toISOString();
    if (item.status === "complimentary") complimentary += 1;
    if (item.status === "expiring") expiring += 1;
    if (["expired", "cancelled"].includes(item.status)) expired += 1;
    add(member, { plan, cycle: item.cycle, startedAt, endsAt, amount, status: item.status, note: item.note ?? "", months: item.cycle === "complimentary" ? 1 : null });
  });

  all.forEach((member, index) => {
    if (NAMED_SUBS[member.name]) return;
    if (member.plan !== "free") {
      let status = "active";
      if (complimentary < 11 && index % 9 === 4) { status = "complimentary"; complimentary += 1; }
      else if (expiring < 9 && index % 11 === 6) { status = "expiring"; expiring += 1; }
      const cycle = status === "complimentary" ? "complimentary" : index % 5 < 2 ? "yearly" : "monthly";
      const started = 10 + (index % 200);
      add(member, {
        plan: member.plan, cycle, startedAt: ago(started),
        endsAt: status === "expiring" ? ahead(1 + (index % 6)) : ahead(cycle === "yearly" ? 365 - (started % 365) : 30 - (started % 30) || 30),
        amount: cycle === "complimentary" ? 0 : PRICE[member.plan][cycle], status,
        note: status === "complimentary" ? ["Hackathon winner", "Competition prize", "Staff discretion", "Support goodwill"][index % 4] : "",
        months: status === "complimentary" ? 1 + (index % 3) : null,
      });
    } else if (expired < 42 && member.status === "active" && index % 21 === 4) {
      expired += 1;
      const status = index % 3 === 0 ? "expired" : "cancelled";
      add(member, {
        plan: index % 4 === 0 ? "premium_plus" : "premium", cycle: "monthly", startedAt: ago(90 + (index % 120)), endsAt: ago(2 + (index % 60)),
        amount: index % 4 === 0 ? 19.99 : 9.99, status, note: status === "expired" && index % 2 ? "payment failed" : "", months: null,
      });
    }
  });
  subscriptions = list;
  return subscriptions;
}

export function samplePayments() {
  if (payments) return payments;
  const subs = sampleSubscriptions().filter((sub) => sub.cycle !== "complimentary");
  const fixed = [
    { name: "Tolu Adebayo", description: "Premium · monthly", amount: 9.99, status: "paid", days: 0 },
    { name: "Kwame Asante", description: "Premium Plus · yearly", amount: 199, status: "paid", days: 1 },
    { name: "Halima Musa", description: "Premium Plus · monthly", amount: 19.99, status: "failed", days: 2 },
    { name: "Samuel Owusu", description: "Refund · cancelled within 48h", amount: -9.99, status: "refunded", days: 4 },
  ];
  payments = [
    ...fixed.map((item, index) => ({ id: `pay-${index + 1}`, date: ago(item.days, 14), member: item.name, description: item.description, amount: item.amount, status: item.status })),
    ...subs.slice(0, 36).map((sub, index) => ({
      id: `pay-${index + 10}`,
      date: ago(5 + index, 12),
      member: sub.name,
      description: `${sub.plan === "premium_plus" ? "Premium Plus" : "Premium"} · ${sub.cycle}`,
      amount: sub.amount,
      status: index % 13 === 7 ? "failed" : "paid",
    })),
  ];
  return payments;
}

export const SAMPLE_SUBSCRIPTION_STATS = { activeThisMonth: 19, mrrUsd: 1768, mrrChangeUsd: 214, cancellations30d: 6, churnRate: 4.4 };

// ---------- A24 Badges ----------

let badges = null;
export function sampleBadges() {
  if (badges) return badges;
  badges = [
    { id: "first-project", name: "First Project", icon: "rocket", colour: "blue", trigger: "individual_project_approved", count: 1, bonusPoints: 20, description: "Completed your first Community project.", awarded: 486, enabled: true, showOnProfile: true, premiumOnly: false },
    { id: "project-master", name: "Project Master", icon: "star", colour: "teal", trigger: "projects_approved_score80", count: 10, bonusPoints: 100, description: "Ten projects approved with an average score of 80 or more.", awarded: 37, enabled: true, showOnProfile: true, premiumOnly: false },
    { id: "team-player", name: "Team Player", icon: "users", colour: "green", trigger: "collaboration_completed", count: 3, bonusPoints: 50, description: "Completed three collaboration projects with a team.", awarded: 112, enabled: true, showOnProfile: true, premiumOnly: false },
    { id: "hackathon-champion", name: "Hackathon Champion", icon: "zap", colour: "amber", trigger: "hackathon_first_place", count: 1, bonusPoints: 100, description: "Won first place in a hackathon.", awarded: 4, enabled: true, showOnProfile: true, premiumOnly: false },
    { id: "competition-winner", name: "Competition Winner", icon: "trophy", colour: "orange", trigger: "competition_podium", count: 1, bonusPoints: 100, description: "Placed first, second or third in a competition.", awarded: 9, enabled: true, showOnProfile: true, premiumOnly: false },
    { id: "rising-developer", name: "Rising Developer", icon: "trending", colour: "purple", trigger: "points_first_30_days", count: 500, bonusPoints: 0, description: "Earned 500 points in your first 30 days.", awarded: 58, enabled: true, showOnProfile: true, premiumOnly: false },
    { id: "community-helper", name: "Community Helper", icon: "heart", colour: "pink", trigger: "helpful_answers", count: 10, bonusPoints: 30, description: "Ten answers marked helpful by other students.", awarded: 0, enabled: false, showOnProfile: true, premiumOnly: false },
  ];
  return badges;
}

// ---------- A25 Points ----------

const RULE_DETAILS = [
  { id: "individual_project", triggeredBy: "Submission approved by reviewer", awarded30d: 9400, maxPerDay: "" },
  { id: "collaboration_project", triggeredBy: "Team submission approved", awarded30d: 5100, maxPerDay: "" },
  { id: "hackathon_participation", triggeredBy: "Submission received before deadline", awarded30d: 3350, maxPerDay: "" },
  { id: "hackathon_win", triggeredBy: "Official results published", awarded30d: 900, maxPerDay: "" },
  { id: "competition_participation", triggeredBy: "Registration confirmed and entry submitted", awarded30d: 4200, maxPerDay: "" },
  { id: "competition_win", triggeredBy: "Official results published", awarded30d: 1000, maxPerDay: "" },
  { id: "help_student", triggeredBy: "Answer marked helpful by the asker", awarded30d: 1860, maxPerDay: 5 },
  { id: "showcase_approved", triggeredBy: "Showcase post approved by moderator", awarded30d: 2040, maxPerDay: 2 },
];

let pointRules = null;
let pointAudit = null;
export function samplePointRules() {
  if (!pointRules) {
    pointRules = POINT_RULES.map((rule, index) => ({ ...RULE_DETAILS[index], activity: rule.label, points: rule.points, enabled: true }));
  }
  return pointRules;
}
export function samplePointAudit() {
  if (!pointAudit) {
    pointAudit = [
      { id: "audit-4", date: ago(9), member: "Daniel Okon", change: -100, kind: "adjustment", reason: "Collaboration submission removed: copied repository", by: "Grace Adeyemi" },
      { id: "audit-3", date: ago(13), member: "Fatima Sule", change: 50, kind: "adjustment", reason: "Missed award for approved project", by: "Tunde Bello" },
      { id: "audit-2", date: ago(17), member: "All members", change: null, kind: "rule_change", reason: "Showcase approval raised from 20 to 30", by: "Tunde Bello" },
      { id: "audit-1", date: ago(24), member: "Kwame Asante", change: 20, kind: "adjustment", reason: "Helpful answer not counted", by: "Grace Adeyemi" },
    ];
  }
  return pointAudit;
}

// ---------- A26 Settings ----------

let settings = null;
let categories = null;
export function sampleSettings() {
  if (!settings) {
    settings = {
      rules: [
        "1. Be respectful. No harassment, hate speech or personal attacks.",
        "2. Submit only your own work. Credit any code, images or templates you reuse.",
        "3. Do not share competition or hackathon solutions before the deadline.",
        "4. No spam, advertising or links to paid services.",
        "5. Report problems instead of arguing in comments.",
      ].join("\n"),
      rulesUpdatedAt: ago(30),
      rulesUpdatedBy: "Tunde Bello",
      maxFileSizeMb: 25,
      filesPerSubmission: 5,
      resubmissions: "2",
      formats: [
        { key: "github", label: "GitHub link", enabled: true },
        { key: "live", label: "Live URL", enabled: true },
        { key: "figma", label: "Figma link", enabled: true },
        { key: "pdf", label: "PDF", enabled: true },
        { key: "images", label: "PNG / JPG", enabled: true },
        { key: "zip", label: "ZIP", enabled: true },
        { key: "xlsx", label: "XLSX", enabled: false },
      ],
      notifications: [
        { key: "project_published", label: "New project published", inApp: true, email: false },
        { key: "collaboration_request", label: "Collaboration request", inApp: true, email: true },
        { key: "submission_reviewed", label: "Submission reviewed", inApp: true, email: true },
        { key: "hackathon_deadline", label: "Hackathon deadline (2h left)", inApp: true, email: true },
        { key: "payment_successful", label: "Payment successful", inApp: true, email: true },
        { key: "premium_expiring", label: "Premium expiring (7 days)", inApp: true, email: true },
        { key: "announcement_published", label: "Announcement published", inApp: true, email: false },
      ],
      moderation: { autoHideAfter: "3", blockedWords: "scam, buy followers, whatsapp me", reviewShowcase: true, allowComments: true, allowNewMemberComments: false },
    };
  }
  return settings;
}
export function sampleCategories() {
  if (!categories) {
    const make = (group, rows) => rows.map(([name, count, status = "active"], index) => ({ id: `${group}-${index + 1}`, group, name, count, status }));
    categories = [
      ...make("projects", [["Frontend Development", 14], ["Product Design (UI/UX)", 11], ["Data Analysis", 9], ["Virtual Assistance", 6], ["Robotics", 0, "archived"]]),
      ...make("competitions", [["Web Design", 3], ["Mobile Apps", 2], ["Portfolio", 1]]),
      ...make("hackathons", [["FinTech", 1], ["EdTech", 1], ["Open theme", 0]]),
    ];
  }
  return categories;
}

// ---------- A27 Reports & moderation ----------

const OPEN_REPORTS = [
  { type: "harassment", targetType: "comment", targetId: "c-8812", target: "Comment on “Lagos Transit Tracker”", excerpt: "“Nobody asked for this, quit coding…”", content: "“Nobody asked for this, quit coding. This is the worst project on the showcase and you should be embarrassed.”", reporter: "Chinedu Eze", reporterNote: "This is the third comment like this on my projects this week.", reports: 3, days: 0, subject: { name: "Daniel Okon", username: "daniel.okon", memberSince: ago(84), previousWarnings: 1 }, history: [{ label: "Warning: abusive comment", date: ago(17) }, { label: "Report dismissed", date: ago(29) }] },
  { type: "copyright", targetType: "showcase", targetId: "netflix-clone-ui", target: "Showcase: “Netflix Clone UI”", excerpt: "Uses copyrighted posters and logo", content: "Showcase post with 12 screenshots using official film posters and the Netflix logo, with no credit or note.", reporter: "Kemi Martins", reporterNote: "The posters and logo are copied from the real site.", reports: 1, days: 1, subject: { name: "Seun Bello", username: "seun.bello", memberSince: ago(140), previousWarnings: 0 }, history: [] },
  { type: "fake_submission", targetType: "submission", targetId: "sub-2207", target: "Submission: Authentication REST API", excerpt: "Repository matches another student's", content: "The submitted repository has the same commit history as a submission approved three weeks earlier, with only the README changed.", reporter: "Reviewer: Grace Adeyemi", reporterNote: "Commit hashes match sub-1987.", reports: 1, days: 1, subject: { name: "Kunle Ogunleye", username: "kunle.ogunleye", memberSince: ago(60), previousWarnings: 0 }, history: [] },
  { type: "spam", targetType: "comment", targetId: "c-8790", target: "Comment on “Coffee Brand Identity”", excerpt: "“Get 5,000 followers today, DM me…”", content: "“Get 5,000 followers today, DM me on WhatsApp for the best price!!!”", reporter: "David Mensah", reporterNote: "", reports: 5, days: 2, subject: { name: "Rita Asante", username: "rita.asante", memberSince: ago(6), previousWarnings: 0 }, history: [] },
  { type: "abusive_comment", targetType: "team_chat", targetId: "team-orbit", target: "Team chat: Team Orbit", excerpt: "Insults directed at a team member", content: "Three messages in the team chat calling a team member “useless” and telling them to leave the team.", reporter: "Fatima Sule", reporterNote: "I am the team member. I did my tasks on time.", reports: 1, days: 3, subject: { name: "Yaw Danjuma", username: "yaw.danjuma", memberSince: ago(210), previousWarnings: 0 }, history: [] },
  { type: "spam", targetType: "profile", targetId: "crypto_mentor_99", target: "Profile: “crypto_mentor_99”", excerpt: "Bio links to an investment scheme", content: "Profile bio: “Turn $50 into $500 in a week. Message me for my trading group.” with an external link.", reporter: "Tolu Adebayo", reporterNote: "", reports: 4, days: 4, subject: { name: "crypto_mentor_99", username: "crypto_mentor_99", memberSince: ago(3), previousWarnings: 0 }, history: [] },
];
const REVIEW_REPORTS = [
  { type: "plagiarism", targetType: "showcase", targetId: "weather-dashboard", target: "Showcase: “Weather Dashboard”", excerpt: "Same design as a public template", content: "The showcase post matches a paid template from a theme marketplace, with no credit.", reporter: "Ifeoma Nwosu", reporterNote: "Template link in my message to support.", reports: 2, days: 5, subject: { name: "Femi Okeke", username: "femi.okeke", memberSince: ago(95), previousWarnings: 0 }, history: [] },
  { type: "harassment", targetType: "comment", targetId: "c-8701", target: "Comment on “Budget Buddy”", excerpt: "“Girls can't build backends…”", content: "“Girls can't build backends, someone else obviously did this for you.”", reporter: "Aisha Bello", reporterNote: "", reports: 2, days: 6, subject: { name: "Obi Mensah", username: "obi.mensah", memberSince: ago(120), previousWarnings: 1 }, history: [{ label: "Warning: harassment", date: ago(40) }] },
];
const RESOLVED_TEMPLATES = [
  ["spam", "comment", "Comment on a showcase project", "Link to a paid course", "remove_content"],
  ["abusive_comment", "comment", "Comment on a collaboration brief", "Rude reply to a question", "warn"],
  ["copyright", "showcase", "Showcase project", "Stock photos without licence", "dismiss"],
  ["fake_submission", "submission", "Project submission", "Copied repository", "suspend"],
  ["other", "profile", "Profile", "Offensive display name", "remove_content"],
  ["spam", "team_chat", "Team chat", "Repeated advertising", "warn"],
];
const PEOPLE = ["Bola Adebayo", "Emeka Okeke", "Ngozi Mensah", "Kofi Bello", "Chioma Owusu", "Seun Asante", "Ada Kamara", "Uche Eze", "Lola Sesay", "Jide Boateng", "Esi Okafor"];
export const RESOLUTION_LABELS = { dismiss: "Dismissed", remove_content: "Content removed", warn: "User warned", suspend: "User suspended" };

let reports = null;
export function sampleReports() {
  if (reports) return reports;
  let number = 2291;
  const build = (item, status) => ({
    id: `r-${number}`,
    number: `R-${number--}`,
    type: item.type,
    targetType: item.targetType,
    targetId: item.targetId,
    target: item.target,
    excerpt: item.excerpt,
    content: item.content,
    reporter: item.reporter,
    reporterNote: item.reporterNote,
    reports: item.reports,
    createdAt: ago(item.days, 9 + (number % 8)),
    status,
    subject: item.subject,
    history: item.history,
    resolution: null,
  });
  const resolved = Array.from({ length: 84 }, (_, index) => {
    const [type, targetType, target, excerpt, action] = RESOLVED_TEMPLATES[index % RESOLVED_TEMPLATES.length];
    const subject = PEOPLE[index % PEOPLE.length];
    return {
      ...build({
        type, targetType, targetId: `t-${index}`, target: `${target} by ${subject}`, excerpt, content: excerpt, reporter: PEOPLE[(index + 4) % PEOPLE.length], reporterNote: "",
        reports: 1 + (index % 3), days: 8 + index, subject: { name: subject, username: subject.toLowerCase().replace(" ", "."), memberSince: ago(150 + index), previousWarnings: index % 4 === 0 ? 1 : 0 }, history: [],
      }, "resolved"),
      resolution: { action, note: "", by: index % 2 ? "Grace Adeyemi" : "Tunde Bello", at: ago(7 + index) },
    };
  });
  reports = [...OPEN_REPORTS.map((item) => build(item, "open")), ...REVIEW_REPORTS.map((item) => build(item, "in_review")), ...resolved];
  return reports;
}

// ---------- A19 Announcements ----------

let announcements = null;
export const SAMPLE_AUDIENCE_OPTIONS = {
  categories: ["Frontend Development", "Backend Development", "Product Design (UI/UX)", "Data Analysis", "Digital Marketing", "Virtual Assistance"],
  events: [
    { id: "fintech-for-students", title: "FinTech for Students Hackathon", participants: 212 },
    { id: "best-landing-page-2026", title: "Best Landing Page Design 2026", participants: 164 },
    { id: "best-mobile-application", title: "Best Mobile Application", participants: 58 },
  ],
};

export function sampleAnnouncements() {
  if (announcements) return announcements;
  const base = { imageUrl: "", link: "", pinned: false, sendEmail: false, scheduledAt: null, publishedAt: null, reached: null, openedRate: null };
  announcements = [
    { ...base, id: "a-14", status: "draft", title: "FinTech for Students Hackathon: final reminders", body: "The hackathon starts on Saturday at 10:00 WAT and runs for 24 hours. Make sure your team is confirmed by Friday 18:00, read the judging criteria, and test your submission links before the deadline. Good luck!", category: "hackathons", audience: { type: "event", value: "fintech-for-students" }, link: "https://coderise.academy/community/hackathons/fintech-for-students", sendEmail: true, updatedAt: new Date(Date.now() - 5 * 60000).toISOString() },
    { ...base, id: "a-13", status: "published", title: "Hackathon registration is open", body: "Our first 24-hour hackathon starts soon. Work alone or in a team of up to three.", category: "hackathons", audience: { type: "all" }, pinned: true, publishedAt: ago(8), updatedAt: ago(8), reached: 1042, openedRate: 63 },
    { ...base, id: "a-12", status: "scheduled", title: "December Premium masterclass line-up", body: "Four live sessions for Premium members in December, from portfolio reviews to pricing your work.", category: "premium", audience: { type: "premium" }, scheduledAt: ahead(4, 9), updatedAt: ago(9) },
    { ...base, id: "a-11", status: "published", title: "12 new Data Analysis projects added", body: "From a customer churn analysis to a sales forecasting dashboard. Seven are free for every student.", category: "projects", audience: { type: "category", value: "Data Analysis" }, publishedAt: ago(10), updatedAt: ago(10), reached: 284, openedRate: 58 },
    { ...base, id: "a-10", status: "published", title: "Masterclass: Pricing your freelance work", body: "A live session for Premium members on Thursday at 18:00 WAT.", category: "premium", audience: { type: "premium" }, publishedAt: ago(13), updatedAt: ago(13), reached: 137, openedRate: 71 },
    { ...base, id: "a-9", status: "draft", title: "Showcase guidelines update", body: "We are updating what can be posted in the showcase.", category: "platform", audience: { type: "all" }, updatedAt: ago(2) },
    { ...base, id: "a-8", status: "scheduled", title: "Best Mobile Application: last week to register", body: "Registration closes next week. The entry fee is $5.", category: "competitions", audience: { type: "free" }, scheduledAt: ahead(8, 12), updatedAt: ago(3) },
    { ...base, id: "a-7", status: "published", title: "Best Landing Page Design 2026 – free to enter", body: "Our second free competition. First place wins $150 and a winner certificate.", category: "competitions", audience: { type: "all" }, publishedAt: ago(15), updatedAt: ago(15), reached: 1042, openedRate: 49 },
    { ...base, id: "a-6", status: "published", title: "New team projects: Fullstack and Digital Marketing", body: "Five new collaboration briefs for teams of two or three.", category: "collaboration", audience: { type: "all" }, publishedAt: ago(20), updatedAt: ago(20), reached: 1031, openedRate: 41 },
    { ...base, id: "a-5", status: "draft", title: "Mentor office hours (idea)", body: "", category: "premium", audience: { type: "premium" }, updatedAt: ago(6) },
    { ...base, id: "a-4", status: "published", title: "Scheduled maintenance on Sunday", body: "Submissions will be paused from 02:00 to 04:00 WAT.", category: "platform", audience: { type: "all" }, publishedAt: ago(27), updatedAt: ago(27), reached: 1018, openedRate: 37 },
    { ...base, id: "a-3", status: "published", title: "The Project Showcase is here", body: "Share your finished projects and follow the creators you admire.", category: "projects", audience: { type: "all" }, publishedAt: ago(34), updatedAt: ago(34), reached: 1002, openedRate: 55 },
    { ...base, id: "a-2", status: "published", title: "Introducing the community leaderboard", body: "Earn points for approved projects, hackathons, competitions and helping others.", category: "platform", audience: { type: "all" }, publishedAt: ago(48), updatedAt: ago(48), reached: 987, openedRate: 52 },
    { ...base, id: "a-1", status: "published", title: "CodeRise Premium is now available", body: "Unlock Premium projects, Premium hackathons and members-only masterclasses.", category: "premium", audience: { type: "free" }, publishedAt: ago(55), updatedAt: ago(55), reached: 905, openedRate: 44 },
  ];
  return announcements;
}

// ---------- A23 Analytics ----------

// Figures for a 30-day period; other periods scale the counts (rates stay the same).
export function sampleAnalytics({ from, to }) {
  const end = to ? new Date(`${to}T00:00:00Z`) : new Date();
  const start = from ? new Date(`${from}T00:00:00Z`) : new Date(end.getTime() - 30 * DAY);
  const days = Math.max(1, Math.round((end - start) / DAY) + 1);
  const scale = (value) => Math.max(0, Math.round((value * days) / 30));
  const monthLabel = new Intl.DateTimeFormat("en-GB", { month: "short", timeZone: "UTC" });
  const previousMonth = new Intl.DateTimeFormat("en-GB", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - 1, 1)));
  return {
    period: { from: from ?? start.toISOString().slice(0, 10), to: to ?? end.toISOString().slice(0, 10), days },
    engagement: {
      monthlyActiveMembers: 684, monthlyActiveChange: 9.4,
      projectsStarted: scale(512), projectsStartedChange: 12.0,
      projectsCompleted: scale(231), projectsCompletedChange: 6.5,
      submissionRate: 58,
      teamsFormed: scale(29), teamsFormedChange: 4,
      collaborationCompletion: 71,
      hackathonRegistrations: 212, hackathonName: "FinTech for Students",
      competitionRegistrations: 222, competitionFree: 164, competitionPaid: 58,
    },
    revenue: {
      competitionRevenueUsd: scale(1385), competitionRevenueChangeUsd: scale(290),
      premiumConversion: 13.1, premiumConversionChange: 1.8,
      mrrUsd: 1768, mrrChangeUsd: 214, mrrCompareLabel: previousMonth,
      cancellations: scale(9), churnRate: 6.2, cancellationsChange: 2,
    },
    activeTrend: [512, 538, 560, 577, 601, 622, 655, 684].map((count, index) => ({
      day: new Date(end.getTime() - (7 - index) * 7 * DAY).toISOString().slice(0, 10),
      count,
    })),
    revenueBySource: [[820, 0], [1010, 0], [1180, 0], [1554, 495], [1768, 1385]].map(([subscriptions, competitions], index) => ({
      label: monthLabel.format(new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - 4 + index, 1))),
      subscriptions,
      competitions,
    })),
    funnel: [
      { title: "Viewed a Premium project", count: scale(412) },
      { title: "Opened pricing page", count: scale(238) },
      { title: "Started checkout", count: scale(96) },
      { title: "Subscribed", count: scale(54) },
    ],
    topCategories: [
      { category: "Frontend Development", started: scale(184), completed: scale(92) },
      { category: "Product Design (UI/UX)", started: scale(121), completed: scale(57) },
      { category: "Data Analysis", started: scale(88), completed: scale(41) },
      { category: "Backend Development", started: scale(63), completed: scale(24) },
      { category: "Virtual Assistance", started: scale(56), completed: scale(17) },
    ],
  };
}
