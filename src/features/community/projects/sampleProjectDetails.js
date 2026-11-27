import { PREMIUM_FROM_PRICE, SAMPLE_COMMUNITY_PROJECTS } from "../sampleCommunityProjects";

// Sample data for S03 Project Details, S04 Project Submission, S05 My Community Projects and
// the Community tab of Notifications (S24). Used only by the local dev server while the
// Community API is not available (see projectsService.js). Project basics come from the
// Project Library sample so slugs, titles and access match S02.
// All dates are relative to "now" so deadlines and "2h ago" always make sense.

const DAY = 86400000;
const HOUR = 3600000;
export const daysFromNow = (days) => new Date(Date.now() + days * DAY).toISOString();
const hoursAgo = (hours) => new Date(Date.now() - hours * HOUR).toISOString();

export const SAMPLE_VIEWER_HAS_PREMIUM = false;
export { PREMIUM_FROM_PRICE };

// Rich brief for the project shown in the design.
const RESTAURANT_BRIEF = {
  description: "Build a responsive one-page website for “Mama Ada’s Kitchen”, a family restaurant in Lekki. The page needs a hero, menu, opening hours, location map and a working reservation form.",
  points: 50,
  objectives: [
    "Structure a multi-section page with semantic HTML.",
    "Build a mobile-first layout with Flexbox and CSS Grid.",
    "Validate a reservation form with JavaScript.",
    "Deploy the site and share a live link.",
  ],
  requirements: [
    "Sticky navigation that collapses into a menu below 768px.",
    "Menu section with at least 3 categories and 9 dishes, prices in ₦.",
    "Reservation form: name, phone, date, time, guests — all required, with error messages.",
    "Lighthouse accessibility score of 90 or higher.",
  ],
  steps: [
    { title: "Plan the sections", details: "Sketch the hero, menu, hours, map and form on paper or in Figma before coding." },
    { title: "Write the HTML", details: "Use header, nav, main, section and footer. Add alt text to every image." },
    { title: "Style mobile first", details: "Start at 375px wide, then add breakpoints at 768px and 1200px." },
    { title: "Add form validation", details: "Show inline errors and a success message when the reservation is valid." },
    { title: "Deploy and submit", details: "Publish to GitHub Pages or Netlify, then submit your repository and live links." },
  ],
  referenceImages: [
    { caption: "Hero – desktop", url: null },
    { caption: "Menu section", url: null },
    { caption: "Mobile layout", url: null },
  ],
  skills: ["HTML5", "CSS Flexbox", "CSS Grid", "JavaScript DOM", "Git & GitHub"],
  resources: [
    { name: "Project brief.pdf", kind: "pdf", size: "420 KB", url: null },
    { name: "Food photos & logo.zip", kind: "zip", size: "8.2 MB", url: null },
    { name: "Figma wireframe", kind: "link", size: "External link", url: null },
  ],
  submission: {
    links: [
      { type: "github", required: true },
      { type: "live", required: true },
      { type: "figma", required: false },
    ],
    files: { kinds: ["pdf", "images", "zip"], required: false, maxFiles: 5, maxSizeMb: 25 },
  },
  submissionRequirements: ["Public GitHub repository link", "Live site URL", "Optional: screenshots (PNG/JPG, max 10 MB)"],
  criteria: [
    { name: "Layout & responsiveness", check: "Works at 375, 768 and 1440px without overflow", points: 30 },
    { name: "Code quality", check: "Semantic HTML, tidy CSS, no inline styles", points: 25 },
    { name: "Form validation", check: "Required fields, clear errors, success state", points: 20 },
    { name: "Accessibility", check: "Alt text, labels, contrast, keyboard use", points: 15 },
    { name: "Deployment", check: "Live link loads and matches the repository", points: 10 },
  ],
};

const DESIGN_CATEGORIES = ["Product Design (UI/UX)", "Graphic Design"];
const DOC_CATEGORIES = ["Virtual Assistance", "Digital Marketing", "Cybersecurity", "Data Analysis"];

// A plausible brief for every other project in the library.
function genericBrief(project) {
  const design = DESIGN_CATEGORIES.includes(project.category);
  const docs = DOC_CATEGORIES.includes(project.category);
  const links = design
    ? [{ type: "figma", required: true }, { type: "live", required: false }]
    : docs
      ? [{ type: "live", required: false }]
      : [{ type: "github", required: true }, { type: "live", required: !project.category.includes("Backend") && !project.category.includes("AI") }];
  return {
    description: `${project.description} Plan the work, build it step by step and submit it for a reviewer to score.`,
    points: { Beginner: 50, Intermediate: 75, Advanced: 100, Professional: 150 }[project.level] ?? 50,
    objectives: [
      "Plan the project before you start building.",
      "Build every required feature from the brief.",
      "Explain your decisions in a short README or summary.",
    ],
    requirements: [
      "Every required feature in the brief works.",
      design ? "Designs are shown at mobile and desktop sizes." : "It works on mobile and desktop.",
      "A short write-up explaining your choices.",
    ],
    steps: [
      { title: "Read the brief", details: "Note every requirement and the evaluation criteria before you start." },
      { title: "Plan the work", details: "Sketch the structure and list the tasks in the order you will do them." },
      { title: "Build the core", details: "Get the main features working end to end first." },
      { title: "Polish and test", details: "Fix edge cases, check accessibility and tidy your work." },
      { title: "Submit", details: "Share your links and files, then add notes for the reviewer." },
    ],
    referenceImages: [{ caption: "Example layout", url: null }, { caption: "Detail view", url: null }, { caption: "Mobile view", url: null }],
    skills: design ? ["Figma", "Prototyping", "Visual hierarchy"] : docs ? ["Research", "Planning", "Clear writing"] : ["Git & GitHub", "Problem solving", "Testing"],
    resources: [
      { name: "Project brief.pdf", kind: "pdf", size: "380 KB", url: null },
      { name: "Starter files.zip", kind: "zip", size: "2.4 MB", url: null },
    ],
    submission: { links, files: { kinds: design || docs ? ["pdf", "images", "zip"] : ["images", "zip"], required: docs && links.every((link) => !link.required), maxFiles: 5, maxSizeMb: 25 } },
    submissionRequirements: [
      ...links.map((link) => `${link.required ? "" : "Optional: "}${{ github: "Public GitHub repository link", live: "Live project URL", figma: "Figma file link" }[link.type]}`),
      "Optional: screenshots or a PDF summary",
    ],
    criteria: [
      { name: "Meets the brief", check: "Every required feature is present and works", points: 40 },
      { name: "Quality", check: design ? "Consistent spacing, type and colour" : "Clean, readable and organised work", points: 30 },
      { name: "Accessibility", check: "Readable contrast, labels and keyboard use", points: 15 },
      { name: "Presentation", check: "Clear write-up and easy to review", points: 15 },
    ],
  };
}

const PREVIEW_STEPS = 2;

// GET /community/projects/:slug in sample mode. Free viewers of a Premium project get a
// preview only (objectives and the first steps), like the real API is expected to return.
export function sampleProjectDetail(slug, progressStatus) {
  const basics = SAMPLE_COMMUNITY_PROJECTS.find((item) => item.slug === slug);
  if (!basics) return null;
  const brief = slug === "restaurant-landing-page" ? RESTAURANT_BRIEF : genericBrief(basics);
  const project = {
    ...basics,
    ...brief,
    maxScore: 100,
    passMark: 70,
    resubmissionsAllowed: 1,
    addedAt: basics.addedAt,
  };
  const locked = basics.access === "premium" && !SAMPLE_VIEWER_HAS_PREMIUM;
  if (!locked) return { project: { ...project, locked: false }, viewerHasPremium: SAMPLE_VIEWER_HAS_PREMIUM, viewerStatus: progressStatus ?? "not_started", premiumFromPrice: PREMIUM_FROM_PRICE };

  const preview = basics.previewAvailable === false
    ? { ...basics, locked: true, previewAvailable: false, objectives: [], steps: [], stepsTotal: 0 }
    : {
      ...basics,
      description: project.description,
      points: project.points,
      maxScore: project.maxScore,
      skills: project.skills,
      objectives: project.objectives,
      steps: project.steps.slice(0, PREVIEW_STEPS),
      stepsTotal: project.steps.length,
      locked: true,
    };
  return {
    project: preview,
    viewerHasPremium: false,
    viewerStatus: progressStatus ?? "not_started",
    premiumFromPrice: PREMIUM_FROM_PRICE,
    premiumProjectCount: SAMPLE_COMMUNITY_PROJECTS.filter((item) => item.access === "premium").length,
  };
}

// The viewer's projects (S05). Statuses:
//   not_started | in_progress | submitted | under_review | approved | needs_corrections | completed
export function createSampleMyProjects() {
  return [
    {
      slug: "sales-performance-dashboard", status: "completed", score: 94, completedAt: daysFromNow(-15),
      feedback: { reviewer: "Grace Adeyemi", text: "Excellent data cleaning notes and a clear story in the monthly trend chart. Added to the Showcase." },
      links: [{ type: "live", label: "Live dashboard", url: "https://example.com/sales-dashboard" }],
      certificateUrl: null, pointsEarned: 50, showcased: true,
    },
    {
      slug: "executive-inbox-calendar-setup", status: "approved", score: 88, reviewedAt: daysFromNow(-12),
      feedback: { reviewer: null, text: "Clean label structure. Next time add time-zone notes for international meetings." },
      links: [{ type: "live", label: "Shared calendar", url: "https://example.com/calendar" }],
      files: [{ name: "inbox-setup-summary.pdf", size: 640000 }],
      notes: "Labels follow the client's departments; filters are listed in the PDF.",
      canPublishToShowcase: true, pointsEarned: 50,
    },
    {
      slug: "authentication-rest-api", status: "needs_corrections", score: 61, reviewedAt: daysFromNow(-10),
      feedback: { reviewer: "Tunde Bello", text: "Password reset tokens never expire and the refresh endpoint returns 500 when the token is missing. Fix both and resubmit." },
      links: [{ type: "github", label: "Repository", url: "https://github.com/amaraokafor/auth-api" }],
      resubmissionsLeft: 1, dueAt: daysFromNow(5),
    },
    {
      slug: "restaurant-landing-page", status: "under_review", submittedAt: daysFromNow(-8),
      links: [
        { type: "live", label: "Live site", url: "https://mama-adas-kitchen.netlify.app" },
        { type: "github", label: "Repository", url: "https://github.com/amaraokafor/mama-adas-kitchen" },
      ],
    },
    { slug: "expense-tracker-app", status: "submitted", submittedAt: daysFromNow(-9), links: [] },
    { slug: "mobile-banking-app-ui", status: "in_progress", startedAt: daysFromNow(-17), dueAt: daysFromNow(5), progress: { done: 3, total: 7 } },
    { slug: "coffee-shop-brand-identity", status: "not_started", savedAt: daysFromNow(-19) },
  ];
}

// Community notifications (S24, Notifications page ?tab=community).
// type: join_request | deadline | announcement | project_reviewed | registration | team_active | task_assigned | new_project
export function createSampleCommunityNotifications() {
  return [
    { id: "cn-1", type: "join_request", title: "Someone wants to join your team", message: "Kwame Asante asked to join Team Ledger for the FinTech for Students Hackathon as Backend Developer.", createdAt: hoursAgo(2), read: false, link: "/community/teams/team-ledger", actionLabel: "Review request" },
    { id: "cn-2", type: "deadline", title: "Your submission deadline is approaching", message: "Authentication REST API corrections are due in 5 days.", dueAt: daysFromNow(5), createdAt: hoursAgo(5), read: false, link: "/community/projects/authentication-rest-api/submit" },
    { id: "cn-3", type: "announcement", title: "New community announcement", message: "Hackathon registration is open — the winner receives one month of CodeRise Premium.", createdAt: hoursAgo(8), read: false, link: "/community/announcements" },
    { id: "cn-4", type: "project_reviewed", title: "Your project has been reviewed", message: "Authentication REST API — Needs Corrections (61/100).", createdAt: hoursAgo(24 * 3 + 2), read: true, link: "/community/my-projects?status=needs_corrections", linkLabel: "See feedback" },
    { id: "cn-5", type: "registration", title: "Your registration is confirmed", message: "You are registered for FinTech for Students Hackathon. Starts 28 Nov, 10:00 WAT.", createdAt: hoursAgo(24 * 3 + 6), read: true, link: "/community/hackathons" },
    { id: "cn-6", type: "team_active", title: "Your team is now active", message: "Team Nova has 3 of 3 members. Open the workspace to assign roles.", createdAt: hoursAgo(24 * 4 + 3), read: true, link: "/community/activities" },
    { id: "cn-7", type: "task_assigned", title: "A new task has been assigned", message: "Daniel Mensah assigned you “Build checkout page” in Event Ticketing Website.", createdAt: hoursAgo(24 * 5 + 1), read: true, link: "/community/activities" },
    { id: "cn-8", type: "new_project", title: "A new project is available", message: "Expense Tracker App (Mobile App Development, Intermediate) was added to the library.", createdAt: hoursAgo(24 * 6 + 4), read: true, link: "/community/projects/expense-tracker-app" },
    { id: "cn-9", type: "project_reviewed", title: "Your project has been reviewed", message: "Sales Performance Dashboard — Completed (94/100). Added to the Showcase.", createdAt: hoursAgo(24 * 15), read: true, link: "/community/my-projects?status=completed", linkLabel: "See feedback" },
    { id: "cn-10", type: "new_project", title: "A new project is available", message: "Food Delivery App Redesign (Product Design, Advanced) was added to the library.", createdAt: hoursAgo(24 * 19), read: true, link: "/community/projects/food-delivery-app-redesign" },
  ];
}
