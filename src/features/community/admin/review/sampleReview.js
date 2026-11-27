// Sample data for the admin competition, payment and submission-review screens (A12–A18).
// Used only by the local dev server while the admin Community API is missing (see
// reviewService.js). It mirrors the designs and documents the shapes the backend returns.
//
// Competition ids, titles and numbers come from sampleCommunityCompetitions.js so the student
// and admin screens stay consistent. The admin side adds a lifecycle status
// ("draft" | "open" | "judging" | "completed"), judges, prizes and criteria.

import { SAMPLE_COMMUNITY_COMPETITIONS } from "../../sampleCommunityCompetitions";

const DAY = 86400000;
const daysFromNow = (days) => new Date(Date.now() + days * DAY).toISOString();

// A date `days` from today at hh:mm West Africa Time (UTC+1).
function watAt(days, hour = 23, minute = 59) {
  const date = new Date(Date.now() + days * DAY);
  date.setUTCHours(hour - 1, minute, 0, 0);
  return date.toISOString();
}

export const SAMPLE_REVIEWERS = [
  { id: "rev-tunde", name: "Tunde Bello", role: "Lead reviewer" },
  { id: "rev-grace", name: "Grace Adeyemi", role: "Design mentor" },
  { id: "rev-obinna", name: "Obinna Kalu", role: "Marketing mentor" },
  { id: "rev-ngozi", name: "Ngozi Okeke", role: "Backend mentor" },
];

export const SAMPLE_COMPETITION_CATEGORIES = [
  "Product Design (UI/UX)",
  "Mobile App Development",
  "Fullstack Development",
  "Frontend Development",
  "Digital Marketing",
  "Graphic Design",
  "Virtual Assistance",
  "Data Analysis",
];

const PEOPLE = [
  "Chinedu Eze", "Kemi Martins", "Samuel Owusu", "Halima Musa", "Ifeoma Nwosu", "Yaw Boateng", "David Mensah",
  "Amara Okafor", "Tobi Adewale", "Fatima Abubakar", "Adaeze Obi", "Kwame Asante", "Zainab Bello", "Emeka Nnaji",
  "Esi Mensah", "Bola Ajayi", "Musa Ibrahim", "Ama Owusu", "Kofi Adjei", "Ngozi Eze", "Seun Adebayo",
];
const ENTRY_TITLES = [
  "PocketChef recipe app", "Clinic booking flow", "Savings goal tracker", "Campus events app", "Farm market redesign",
  "Bus pass wallet", "Study timer", "Market price checker", "Tailor booking app", "Book swap club", "Gym class planner",
  "Water delivery tracker",
];

const initials = (name) => name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
const username = (name) => name.toLowerCase().replace(/[^a-z]+/g, "-");
const emailFor = (name) => {
  const [first, last = ""] = name.toLowerCase().split(" ");
  return `${first}.${last.slice(0, 1)}@example.com`;
};

// Admin view of each competition. Keys match SAMPLE_COMMUNITY_COMPETITIONS ids.
const ADMIN_DETAILS = {
  "best-landing-page-2026": {
    status: "open",
    criteria: [
      { name: "Visual design and hierarchy", weight: 35 },
      { name: "Clarity of message", weight: 25 },
      { name: "Responsiveness", weight: 25 },
      { name: "Accessibility", weight: 15 },
    ],
    prizes: { first: "$150 cash + certificate", second: "1 month Premium", third: "Certificate", mentions: "Certificate + 100 points (up to 5)" },
    judges: ["rev-grace", "rev-tunde"],
  },
  "best-mobile-application": {
    status: "open",
    premiumPlusFree: true,
    criteria: [
      { name: "Functionality", weight: 35 },
      { name: "User experience", weight: 30 },
      { name: "Code quality", weight: 20 },
      { name: "Presentation", weight: 15 },
    ],
    prizes: { first: "$300 cash + 3 months Premium Plus", second: "$100 cash", third: "Certificate", mentions: "Certificate + 100 points (up to 5)" },
    judges: ["rev-tunde", "rev-grace", "rev-ngozi"],
  },
  "best-fullstack-project": {
    status: "judging",
    // Moved into judging for the admin sample so the results screen has a live example.
    dates: { registration: -20, submission: -6, winners: 4 },
    criteria: [
      { name: "Functionality meets requirements", weight: 35 },
      { name: "Code quality and structure", weight: 25 },
      { name: "Security and data handling", weight: 20 },
      { name: "Documentation", weight: 20 },
    ],
    prizes: { first: "$500 cash + featured portfolio placement", second: "$150 cash", third: "1 month Premium + certificate", mentions: "Certificate + 100 points (up to 5)" },
    judges: ["rev-tunde", "rev-ngozi", "rev-grace"],
  },
  "best-digital-marketing-campaign": {
    status: "draft",
    criteria: [
      { name: "Strategy and audience insight", weight: 30 },
      { name: "Creative quality of content", weight: 30 },
      { name: "Budget and measurable goals", weight: 25 },
      { name: "Presentation", weight: 15 },
    ],
    prizes: { first: "$200 cash + certificate", second: "$150 + 1 month Premium", third: "1 month Premium + certificate", mentions: "Certificate + 100 points (up to 5)" },
    judges: ["rev-grace", "rev-obinna"],
    description: "Plan a four-week launch campaign for a fictional Lagos fitness studio. Submit the strategy deck, three social posts and a one-page budget.",
    requirements: "PDF strategy deck (max 15 slides), three images (PNG/JPG), budget sheet (PDF or Google Sheets link).",
  },
  "best-graphic-design-local-cafe": {
    status: "completed",
    criteria: [
      { name: "Concept and originality", weight: 35 },
      { name: "Typography and colour", weight: 25 },
      { name: "Consistency across items", weight: 25 },
      { name: "Presentation", weight: 15 },
    ],
    prizes: { first: "$100 cash + certificate", second: "1 month Premium", third: "Certificate", mentions: "Certificate + 100 points (up to 5)" },
    judges: ["rev-grace", "rev-tunde"],
  },
  "best-virtual-assistant-portfolio": {
    status: "completed",
    criteria: [
      { name: "Range of services shown", weight: 30 },
      { name: "Professional presentation", weight: 30 },
      { name: "Clear pricing and process", weight: 20 },
      { name: "Writing quality", weight: 20 },
    ],
    prizes: { first: "$100 cash + certificate", second: "1 month Premium", third: "Certificate", mentions: "Certificate + 100 points (up to 5)" },
    judges: ["rev-obinna", "rev-tunde"],
  },
};

const DEFAULT_RULES = [
  "1. Individual entries only.",
  "2. All work must be original and created during the competition window.",
  "3. AI tools may be used for research only; disclose any use.",
  "4. One submission per participant. Late entries are not accepted.",
].join("\n");

// Participant pattern from the A14 design, repeated down the list:
// [plan, payment, submission]
const PATTERN = [
  ["premium_plus", "plan_benefit", "submitted"],
  ["premium", "paid", "submitted"],
  ["free", "pending", "locked"],
  ["free", "paid", "not_submitted"],
  ["premium", "paid", "not_submitted"],
  ["free", "refunded", "withdrawn"],
  ["free", "paid", "submitted"],
];

function buildCompetition(base) {
  const extra = ADMIN_DETAILS[base.id] ?? {};
  const status = extra.status ?? "open";
  const registrationClosesAt = extra.dates ? watAt(extra.dates.registration) : base.registrationClosesAt;
  const submissionDeadline = extra.dates ? watAt(extra.dates.submission) : base.submissionDeadline;
  const winnersAnnouncedAt = extra.dates ? watAt(extra.dates.winners, 12, 0) : new Date(new Date(submissionDeadline).getTime() + 10 * DAY).toISOString();
  return {
    id: base.id,
    number: base.number,
    title: base.title,
    category: base.category,
    description: extra.description ?? `${base.title}: build your best entry and submit it before the deadline. Judges score every entry against the published criteria.`,
    rules: DEFAULT_RULES,
    participantLimit: base.capacity,
    entrants: status === "draft" ? 0 : base.participants,
    entryFeeUsd: base.entryFeeUsd,
    premiumPlusFree: Boolean(extra.premiumPlusFree),
    prizeSummary: base.prize,
    prizes: extra.prizes ?? { first: base.prize, second: "", third: "", mentions: "" },
    registrationClosesAt,
    submissionDeadline,
    winnersAnnouncedAt,
    criteria: extra.criteria ?? [{ name: "Overall quality", weight: 100 }],
    submissionRequirements: extra.requirements ?? "A live link or PDF of your entry, plus a short note explaining your choices.",
    resources: base.id === "best-digital-marketing-campaign" ? [{ url: "#fithub-brand-brief", name: "FitHub-brand-brief.pdf", size: 2.4 * 1024 * 1024 }] : [],
    judges: (extra.judges ?? []).map((id, index) => {
      const reviewer = SAMPLE_REVIEWERS.find((item) => item.id === id);
      return { id, name: reviewer.name, role: index === 0 ? "Lead judge" : reviewer.role };
    }),
    announce: true,
    emailNotify: true,
    status,
    resultsPublished: status === "completed",
    createdAt: daysFromNow(-90 + base.number * 6),
    updatedAt: status === "draft" ? daysFromNow(-2 / 1440) : daysFromNow(-base.number),
  };
}

function buildParticipants(competition) {
  const list = [];
  const regEnd = Math.min(Date.now(), new Date(competition.registrationClosesAt).getTime());
  const paidEntry = competition.entryFeeUsd > 0;
  const closed = competition.status === "judging" || competition.status === "completed";
  for (let i = 0; i < competition.entrants; i += 1) {
    const name = PEOPLE[(i + competition.number * 3) % PEOPLE.length];
    let [plan, payment, submission] = PATTERN[i % PATTERN.length];
    if (!paidEntry) {
      payment = payment === "refunded" ? "withdrawn" : "free_entry";
      if (submission === "locked") submission = "not_submitted";
    } else if (payment === "plan_benefit" && !competition.premiumPlusFree) payment = "paid";
    if (closed && submission === "not_submitted" && i % 3 !== 0) submission = "submitted";
    if (closed && submission === "locked") { payment = "failed"; submission = "not_submitted"; }
    list.push({
      id: `${competition.id}-p${i + 1}`,
      name: i >= PEOPLE.length ? `${name} ${Math.floor(i / PEOPLE.length) + 1}` : name,
      initials: initials(name),
      email: i >= PEOPLE.length ? emailFor(name).replace("@", `${Math.floor(i / PEOPLE.length) + 1}@`) : emailFor(name),
      username: username(name),
      plan,
      registeredAt: new Date(regEnd - (0.4 + i * 0.35) * DAY).toISOString(),
      payment,
      amountUsd: ["paid", "pending", "refunded", "failed"].includes(payment) ? competition.entryFeeUsd : 0,
      submission,
      submissionId: null,
      score: null,
    });
  }
  return list;
}

// Default project rubric (A18 design).
export const DEFAULT_RUBRIC = [
  { id: "c1", name: "Functionality meets requirements", hint: "Cart, checkout, filters, product pages", weight: 40 },
  { id: "c2", name: "Code quality and structure", hint: "Components, state, naming", weight: 25 },
  { id: "c3", name: "Responsive, accessible UI", hint: "Breakpoints, contrast, keyboard", weight: 15 },
  { id: "c4", name: "Performance", hint: "Load time, large lists", weight: 10 },
  { id: "c5", name: "README and documentation", hint: "Setup steps, decisions", weight: 10 },
];

// Submissions in the A17 design plus the four the A01 overview links to (sub-1001 … sub-1004).
const BASE_SUBMISSIONS = [
  { id: "sub-1001", student: "Ifeoma Nwosu", detail: "Frontend Development", title: "E-commerce Storefront", projectId: "e-commerce-storefront", projectType: "premium_project", category: "Frontend Development", status: "pending_review", submittedDays: -5, reviewerId: null, plan: "premium" },
  { id: "sub-1002", student: "Team Nova", detail: "3 members", team: true, title: "Event Ticketing Website", projectId: "event-ticketing-website", projectType: "collaboration", category: "Frontend Development", status: "under_review", submittedDays: -4, reviewerId: "rev-grace" },
  { id: "sub-1003", student: "Samuel Owusu", detail: "Backend Development", title: "Authentication REST API", projectId: "authentication-rest-api", projectType: "free_project", category: "Backend Development", status: "under_review", submittedDays: -3, reviewerId: "rev-tunde" },
  { id: "sub-1004", student: "Halima Musa", detail: "Product Design", title: "Best Landing Page Design 2026", projectId: "best-landing-page-2026", projectType: "competition", category: "Product Design (UI/UX)", status: "pending_review", submittedDays: -2, reviewerId: null },
  { id: "sub-1005", student: "Amara Okafor", detail: "Frontend Development", title: "Restaurant Landing Page", projectId: "restaurant-landing-page", projectType: "free_project", category: "Frontend Development", status: "approved", submittedDays: -7, reviewerId: "rev-grace", score: 88 },
  { id: "sub-1006", student: "David Mensah", detail: "Data Analysis", title: "Sales Performance Dashboard", projectId: "sales-performance-dashboard", projectType: "free_project", category: "Data Analysis", status: "needs_corrections", submittedDays: -8, reviewerId: "rev-tunde", score: 61 },
  { id: "sub-1007", student: "Byte Knights", detail: "2 members", team: true, title: "Campus Study Buddy", projectId: "fintech-for-students", projectType: "hackathon", category: "Fullstack Development", status: "approved", submittedDays: -17, reviewerId: "rev-grace", score: 90 },
  { id: "sub-1008", student: "Chinedu Eze", detail: "Fullstack", title: "Mobile Banking App UI", projectId: "mobile-banking-app-ui", projectType: "premium_project", category: "Product Design (UI/UX)", status: "approved", submittedDays: -18, reviewerId: "rev-tunde", score: 92 },
  { id: "sub-1009", student: "Zainab Bello", detail: "Frontend Development", title: "Weather Dashboard", projectId: "weather-dashboard", projectType: "free_project", category: "Frontend Development", status: "pending_review", submittedDays: -1, reviewerId: null },
  { id: "sub-1010", student: "Emeka Nnaji", detail: "Backend Development", title: "Inventory REST API", projectId: "inventory-rest-api", projectType: "premium_project", category: "Backend Development", status: "rejected", submittedDays: -12, reviewerId: "rev-ngozi", score: 34 },
];

function compactSubmission(row) {
  return {
    id: row.id,
    student: row.student,
    studentDetail: row.detail,
    studentInitials: initials(row.student),
    username: row.team ? null : username(row.student),
    team: Boolean(row.team),
    plan: row.plan ?? "free",
    title: row.title,
    projectId: row.projectId,
    projectType: row.projectType,
    category: row.category,
    competitionId: row.competitionId ?? (row.projectType === "competition" ? row.projectId : null),
    status: row.status,
    submittedAt: row.submittedAt ?? daysFromNow(row.submittedDays ?? -1),
    reviewerId: row.reviewerId ?? null,
    score: row.score ?? null,
    scores: null,
    feedback: "",
    allowResubmission: true,
    suggestShowcase: false,
    attempt: row.attempt ?? 1,
    decidedAt: ["approved", "needs_corrections", "rejected"].includes(row.status) ? daysFromNow((row.submittedDays ?? -1) + 2) : null,
  };
}

// Builds the whole linked sample store: competitions, participants, payments, submissions and
// competition results all point at each other.
export function buildReviewStore() {
  const competitions = SAMPLE_COMMUNITY_COMPETITIONS.map(buildCompetition);
  const participants = {};
  const results = {};
  const submissions = BASE_SUBMISSIONS.map(compactSubmission);
  const payments = [];
  let reference = 20481;

  competitions.forEach((competition) => {
    const people = buildParticipants(competition);
    participants[competition.id] = people;
    const closed = competition.status === "judging" || competition.status === "completed";
    const submitted = people.filter((person) => person.submission === "submitted");

    submitted.forEach((person, index) => {
      const id = `sub-c${competition.number}-${index + 1}`;
      person.submissionId = id;
      const score = closed ? Math.round((95 - index * (25 / Math.max(submitted.length, 1)) - (index % 3) * 0.4) * 10) / 10 : null;
      if (competition.status === "completed") person.score = score;
      submissions.push(compactSubmission({
        id,
        student: person.name,
        detail: competition.category,
        plan: person.plan,
        title: ENTRY_TITLES[index % ENTRY_TITLES.length],
        projectId: competition.id,
        competitionId: competition.id,
        projectType: "competition",
        category: competition.category,
        status: competition.status === "completed" ? "approved" : closed ? "under_review" : index % 3 === 0 ? "under_review" : "pending_review",
        submittedAt: new Date(Math.min(Date.now(), new Date(competition.submissionDeadline).getTime()) - (index * 0.2 + 0.3) * DAY).toISOString(),
        reviewerId: closed || index % 3 === 0 ? competition.judges[index % Math.max(competition.judges.length, 1)]?.id ?? null : null,
        score: competition.status === "completed" ? score : null,
      }));
    });

    if (closed) {
      const judgeCount = Math.max(competition.judges.length, 1);
      results[competition.id] = {
        published: competition.status === "completed",
        entries: submitted
          .map((person, index) => ({
            id: person.submissionId,
            submissionId: person.submissionId,
            entrant: person.name,
            initials: person.initials,
            entryTitle: ENTRY_TITLES[index % ENTRY_TITLES.length],
            avgScore: Math.round((94.3 - index * (22 / Math.max(submitted.length, 1)) - (index % 3) * 0.35) * 10) / 10,
            judgesDone: competition.status === "judging" && index === 5 ? judgeCount - 1 : judgeCount,
            judgesTotal: judgeCount,
          }))
          .sort((a, b) => b.avgScore - a.avgScore)
          .map((entry, index) => ({ ...entry, placement: ["first", "second", "third", "mention", "mention"][index] ?? "none" })),
      };
    }

    if (competition.entryFeeUsd > 0) {
      people.forEach((person, index) => {
        if (!["paid", "pending", "refunded", "failed"].includes(person.payment)) return;
        const brand = ["Visa", "Mastercard", "Verve"][index % 3];
        const status = { paid: "verified", pending: "pending", refunded: "refunded", failed: "failed" }[person.payment];
        person.paymentId = `CR-PAY-${reference}`;
        payments.push({
          id: `CR-PAY-${reference}`,
          reference: `CR-PAY-${reference}`,
          participantId: person.id,
          student: person.name,
          competitionId: competition.id,
          competition: competition.title,
          amountUsd: competition.entryFeeUsd,
          providerFeeUsd: Math.round((competition.entryFeeUsd * 0.029 + 0.15) * 100) / 100,
          method: `${brand} •••• ${String(4821 - index * 137).slice(-4).padStart(4, "0")}`,
          status,
          note: status === "failed" ? "Card declined" : status === "refunded" ? `Withdrew ${new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(person.registeredAt))}` : "",
          createdAt: person.registeredAt,
        });
        reference -= 2;
      });
    }
  });

  payments.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  submissions.sort((a, b) => b.submittedAt.localeCompare(a.submittedAt));
  return { competitions, participants, results, submissions, payments, reviewers: SAMPLE_REVIEWERS };
}

// Fills in the review screen for one compact submission row (links, rubric, note, history).
export function sampleSubmissionDetail(row, competition) {
  const slug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const handle = row.username ?? slug;
  const rubric = (competition?.criteria?.length
    ? competition.criteria.map((item, index) => ({ id: `c${index + 1}`, name: item.name, hint: "", weight: Number(item.weight) || 0 }))
    : DEFAULT_RUBRIC
  ).map((item, index) => ({
    ...item,
    score: row.scores ? row.scores[item.id] ?? null : row.score !== null ? Math.round((item.weight * row.score) / 100) : row.id === "sub-1001" ? [36, 21, 11, 7, 9][index] ?? null : null,
  }));
  const submittedAt = row.submittedAt;
  const history = [
    ...(row.decidedAt ? [{ label: { approved: "Approved", needs_corrections: "Corrections requested", rejected: "Rejected" }[row.status] ?? "Reviewed", at: row.decidedAt }] : []),
    ...(row.reviewerId ? [{ label: `Assigned to ${SAMPLE_REVIEWERS.find((item) => item.id === row.reviewerId)?.name ?? "a reviewer"}`, at: new Date(new Date(submittedAt).getTime() + 2.5 * DAY).toISOString() }] : []),
    { label: `Submitted by ${row.student}`, at: submittedAt },
    { label: row.projectType === "competition" ? "Registered for the competition" : "Project started", at: new Date(new Date(submittedAt).getTime() - 12 * DAY).toISOString() },
  ];
  return {
    ...row,
    student: {
      name: row.student,
      initials: row.studentInitials,
      email: row.team ? null : emailFor(row.student),
      username: row.username,
      plan: row.plan,
      detail: row.studentDetail,
      team: row.team,
    },
    work: [
      { kind: "live", label: "Live site", url: `https://${handle}-${slug}.netlify.app`, detail: `${handle}-${slug}.netlify.app` },
      { kind: "github", label: "GitHub repository", url: `https://github.com/${handle}/${slug}`, detail: `github.com/${handle}/${slug} · 46 commits` },
      { kind: "file", label: "project-notes.pdf", url: "#project-notes", detail: "840 KB · uploaded file" },
    ],
    previewHost: `${handle}-${slug}.netlify.app`,
    note: row.id === "sub-1001"
      ? "I used React with Context for the cart and Stripe test mode for checkout. The product filters work on mobile but the price slider is still a bit slow with many items."
      : "I focused on the core flow first, then on mobile layout and accessibility. The README explains how to run it locally.",
    rubric,
    feedback: row.feedback || (row.id === "sub-1001" ? "Great work, Ifeoma. The checkout flow is clear and the cart keeps its state across pages. To reach the next level, debounce the price slider so filtering stays smooth with 200+ products, and add visible focus styles to the product cards for keyboard users." : ""),
    studentStats: { category: row.category, projectsCompleted: 7, averageScore: 84 },
    pointsOnApproval: row.projectType === "competition" ? 0 : 50,
    showcasePoints: 30,
    history,
  };
}
