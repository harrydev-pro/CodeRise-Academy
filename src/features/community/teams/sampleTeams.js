import { SAMPLE_COMMUNITY_COLLABORATIONS, SAMPLE_VIEWER_TEAM } from "../sampleCommunityCollaborations";

// Sample data for Collaboration Details (S07), Create Team (S08) and the Team Workspace
// (S09–S10, S09b–S09d). It is used only by the local dev server while the Community API is not
// available (see teamsService.js, which documents the response shapes). Dates are relative to
// now so countdowns and "due this week" always make sense.
//
// The sample viewer is Amara Okafor, leader of Team Nova on "Event Ticketing Website"
// (the same ids as the Collaborate tab: SAMPLE_VIEWER_TEAM / SAMPLE_COMMUNITY_COLLABORATIONS).

const DAY = 86400000;
export const SAMPLE_VIEWER = { username: "amara-okafor", name: "Amara Okafor" };

const ago = (minutes) => new Date(Date.now() - minutes * 60000).toISOString();
const daysAgo = (days) => ago(days * 1440);
// "YYYY-MM-DD", `days` from today (task due dates).
export const dateKey = (days) => new Date(Date.now() + days * DAY).toISOString().slice(0, 10);
// 23:59 West Africa Time (22:59 UTC), `days` from today.
export function deadlineIn(days) {
  const date = new Date(Date.now() + days * DAY);
  date.setUTCHours(22, 59, 0, 0);
  return date.toISOString();
}

const MB = 1024 * 1024;

// ---------- Collaboration details ----------

const ROLE_SETS = {
  development: [
    { id: "frontend", name: "Frontend developer", summary: "Pages, components and state", responsibilities: "Build the pages and components, connect them to the API, keep layouts responsive", keySkills: "React, CSS" },
    { id: "backend", name: "Backend developer", summary: "API, data and auth", responsibilities: "Design the database, build the API endpoints, handle sign-in and payments", keySkills: "Node.js, SQL" },
    { id: "ui-design", name: "UI designer", summary: "Flows, screens and design system", responsibilities: "Map the user flows, design every screen and keep a small design system", keySkills: "Figma, prototyping" },
  ],
  design: [
    { id: "researcher", name: "UX researcher", summary: "Interviews and insights", responsibilities: "Plan and run user interviews, write up the main findings", keySkills: "Interviewing, synthesis" },
    { id: "ui-design", name: "UI designer", summary: "Screens and components", responsibilities: "Design the key screens and the components they share", keySkills: "Figma, typography" },
    { id: "prototyper", name: "Prototyper", summary: "Clickable prototype and testing", responsibilities: "Build the clickable prototype and run a usability test", keySkills: "Prototyping, testing" },
  ],
  marketing: [
    { id: "strategist", name: "Campaign strategist", summary: "Goals, audience and plan", responsibilities: "Set goals, define the audience and plan the calendar", keySkills: "Research, planning" },
    { id: "content", name: "Content creator", summary: "Posts, copy and visuals", responsibilities: "Write the copy and make the visuals for each post", keySkills: "Copywriting, Canva" },
    { id: "analyst", name: "Results analyst", summary: "Tracking and report", responsibilities: "Track results and write the final report", keySkills: "Analytics, Sheets" },
  ],
  data: [
    { id: "data-prep", name: "Data preparer", summary: "Cleaning and modelling", responsibilities: "Clean the data and build the model the dashboard uses", keySkills: "SQL, Python" },
    { id: "analyst", name: "Analyst", summary: "Questions and findings", responsibilities: "Answer the brief's questions and write the findings", keySkills: "Statistics, Excel" },
    { id: "dashboard", name: "Dashboard designer", summary: "Charts and layout", responsibilities: "Design and build the dashboard pages", keySkills: "Power BI, charts" },
  ],
  general: [
    { id: "lead", name: "Project lead", summary: "Plan, tracking and hand-off", responsibilities: "Plan the work, track progress and prepare the final hand-off", keySkills: "Planning, communication" },
    { id: "builder", name: "Builder", summary: "Core deliverables", responsibilities: "Produce the main deliverables in the brief", keySkills: "Core tools for the track" },
    { id: "writer", name: "Researcher & writer", summary: "Research and documentation", responsibilities: "Research the client and write the documentation", keySkills: "Research, writing" },
  ],
};

function roleSetFor(category = "") {
  if (/development|game|ai|cyber/i.test(category)) return ROLE_SETS.development;
  if (/design/i.test(category)) return ROLE_SETS.design;
  if (/marketing/i.test(category)) return ROLE_SETS.marketing;
  if (/data/i.test(category)) return ROLE_SETS.data;
  return ROLE_SETS.general;
}

const TEAM_NAMES = ["Northstar", "Blue Owls", "Code Kitchen", "Bright Sparks", "Hive Mind", "Night Shift"];
const LEADERS = ["Chinedu Eze", "Zainab Ali", "Kofi Mensah", "Sade Ogun", "Lucy Umeh", "Femi Ade"];

function sizeRange(teamSize = "3") {
  const [min, max] = String(teamSize).split(/[–-]/).map((value) => Number(value.trim()));
  return { minMembers: min || 2, maxMembers: max || min || 3 };
}

const DETAILS = {
  "coffee-brand-identity": {
    brief: "Brew & Bean is a new café in Ikeja. Your team will create its logo, colour palette, packaging mock-ups and a one-page brand guide the owner can hand to printers.",
    teamType: "Branding & Graphic Design",
    deadlineDays: 13,
    reviewer: "Grace Adeyemi",
    skills: ["Adobe Illustrator", "Typography", "Colour theory", "Brand strategy", "Mock-ups"],
    roles: [
      { id: "brand-strategist", name: "Brand strategist", summary: "Research, voice, brand guide", responsibilities: "Customer research, brand voice, naming of product lines, final brand guide", keySkills: "Research, writing" },
      { id: "logo-type", name: "Logo & type designer", summary: "Logo system and typography", responsibilities: "Logo system, typography, colour palette, usage rules", keySkills: "Illustrator, typography" },
      { id: "illustrator-packaging", name: "Illustrator / packaging", summary: "Mock-ups and illustrations", responsibilities: "Cup sleeve, bean bag label, menu board mock-ups", keySkills: "Illustrator, mock-ups" },
    ],
    teams: [
      { id: "pixel-and-pour", name: "Pixel & Pour", leaderName: "Kemi Martins", memberInitials: ["KM", "DS"], maxMembers: 3, openRoles: ["illustrator-packaging"], status: "active" },
      { id: "roast-studio", name: "Roast Studio", leaderName: "Tobi Okeke", memberInitials: ["TO"], maxMembers: 2, openRoles: ["brand-strategist"], status: "forming" },
      { id: "crema-collective", name: "Crema Collective", leaderName: "Lara Adewale", memberInitials: ["LA", "NB", "EU"], maxMembers: 3, openRoles: [], status: "active" },
    ],
    deliverables: [
      "Primary logo, secondary mark and favicon (SVG + PNG)",
      "Colour palette with HEX and CMYK values",
      "Three packaging mock-ups",
      "One-page brand guide (PDF)",
      "A short write-up of who did what, signed off by every member",
    ],
  },
  "event-ticketing-website": {
    brief: "Campus clubs sell tickets on paper today. Your team will build a site where students browse events, pick seats, pay in test mode and get a QR e-ticket.",
    teamType: "Website Development",
    deadlineDays: 13,
    reviewer: "Tunde Bello",
    skills: ["React", "Node.js", "Figma", "REST APIs", "Accessibility"],
    roles: [
      { id: "ui-design", name: "UI Design", summary: "Flows, screens, design system", responsibilities: "Booking flow, event pages, design system and mobile layouts", keySkills: "Figma, prototyping" },
      { id: "frontend", name: "Frontend Development", summary: "Pages, seat map, checkout", responsibilities: "Events list, seat selection, checkout and confirmation pages", keySkills: "React, CSS" },
      { id: "backend", name: "Backend Development", summary: "API, bookings, QR tickets", responsibilities: "Database, booking API, payments in test mode, QR ticket generation", keySkills: "Node.js, SQL" },
    ],
    teams: [
      { id: SAMPLE_VIEWER_TEAM.id, name: SAMPLE_VIEWER_TEAM.name, leaderName: "Amara Okafor", memberInitials: ["A", "KM", "DS"], maxMembers: 3, openRoles: [], status: "active" },
      { id: "byte-brigade", name: "Byte Brigade", leaderName: "Chinedu Eze", memberInitials: ["CE", "IN"], maxMembers: 3, openRoles: ["backend"], status: "active" },
      { id: "ticket-tribe", name: "Ticket Tribe", leaderName: "Sade Ogun", memberInitials: ["SO", "BA", "TK"], maxMembers: 3, openRoles: [], status: "active" },
    ],
    deliverables: [
      "Events list with search and filters",
      "Event page with a seat map and checkout (payments in test mode)",
      "QR e-ticket on the confirmation page and by email",
      "README with setup steps and test logins",
      "A short write-up of who did what, signed off by every member",
    ],
  },
};

// Builds the S07 detail record for any collaboration in the Collaborate tab sample.
export function sampleCollaborationDetails(item) {
  const extra = DETAILS[item.id] ?? {};
  const { minMembers, maxMembers } = sizeRange(item.teamSize);
  const roles = extra.roles ?? roleSetFor(item.category).slice(0, maxMembers);
  let teams = extra.teams;
  if (!teams) {
    const first = item.memberInitials?.length
      ? [{ id: `${item.id}-team-1`, name: TEAM_NAMES[0], leaderName: LEADERS[0], memberInitials: item.memberInitials, maxMembers, openRoles: roles.slice(item.memberInitials.length).slice(0, item.openSlots).map((role) => role.id), status: item.memberInitials.length >= minMembers ? "active" : "forming" }]
      : [];
    const fullCount = Math.min(2, Math.max(0, item.teamsCount - first.length));
    const full = Array.from({ length: fullCount }, (_, index) => ({
      id: `${item.id}-team-${index + 2}`,
      name: TEAM_NAMES[index + 1],
      leaderName: LEADERS[index + 1],
      memberInitials: LEADERS.slice(index + 1, index + 1 + maxMembers).map((name) => name.split(" ").map((part) => part[0]).join("")),
      maxMembers,
      openRoles: [],
      status: "active",
    }));
    teams = [...first, ...full];
  }
  return {
    id: item.id,
    title: item.title,
    teamType: extra.teamType ?? item.teamType,
    category: item.category,
    brief: extra.brief ?? item.description,
    skills: extra.skills ?? item.skills,
    level: item.level,
    duration: item.duration,
    access: item.access,
    minMembers,
    maxMembers,
    deadline: deadlineIn(extra.deadlineDays ?? 21),
    pointsPerMember: 100,
    reviewer: extra.reviewer ?? "Grace Adeyemi",
    roles,
    teams,
    deliverables: extra.deliverables ?? [
      "The finished work described in the brief",
      "A short README or guide explaining how to use it",
      "A short write-up of who did what, signed off by every member",
    ],
  };
}

export const SAMPLE_COLLABORATION_IDS = SAMPLE_COMMUNITY_COLLABORATIONS.map((item) => item.id);

// Usernames that the sample invite check refuses (already in a team for the project).
export const SAMPLE_TAKEN_USERNAMES = { "david.mensah": "Team Nova", "kemi.martins.old": "Pixel & Pour" };
export const SAMPLE_KNOWN_USERS = {
  "kemi.martins": "Kemi Martins",
  "david.mensah": "David Mensah",
  "halima.musa": "Halima Musa",
  "tobi.okeke": "Tobi Okeke",
  "ngozi.bello": "Ngozi Bello",
  "efe.udoh": "Efe Udoh",
};

// ---------- Team workspace (Team Nova) ----------

const MEMBERS = [
  { username: "amara-okafor", name: "Amara Okafor", role: "UI Design", isLeader: true, online: true, lastSeenAt: ago(0) },
  { username: "kemi-martins", name: "Kemi Martins", role: "Frontend Development", isLeader: false, online: true, lastSeenAt: ago(0) },
  { username: "david-mensah", name: "David Mensah", role: "Backend Development", isLeader: false, online: false, lastSeenAt: ago(12) },
];

const task = (id, title, label, assignee, status, dueDays, details = "") => ({
  id, title, details, label, assignee, status, dueDate: dateKey(dueDays), createdBy: "amara-okafor", createdAt: daysAgo(14), updatedAt: daysAgo(Math.max(0, -dueDays)),
});

export const DEFAULT_FOLDERS = [
  { id: "brief", name: "Brief" },
  { id: "design", name: "Design" },
  { id: "code", name: "Code" },
  { id: "final", name: "Final submission" },
];

export const DEFAULT_CHANNELS = ["general", "design", "backend", "submission"];

function message(id, channel, author, body, minutesAgo, extra = {}) {
  return { id, channel, type: "message", author, body, createdAt: ago(minutesAgo), pinned: false, attachment: null, ...extra };
}

export function buildTeamNova() {
  const kemi = { username: "kemi-martins", name: "Kemi Martins" };
  const david = { username: "david-mensah", name: "David Mensah" };
  const amara = { username: "amara-okafor", name: "Amara Okafor" };
  const deadline = deadlineIn(13);
  const deadlineText = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" }).format(new Date(deadline));
  return {
    id: SAMPLE_VIEWER_TEAM.id,
    name: SAMPLE_VIEWER_TEAM.name,
    pitch: "A fast, mobile-first ticketing site for campus events.",
    collaborationId: "event-ticketing-website",
    visibility: "open",
    minMembers: 3,
    maxMembers: 3,
    deadline,
    members: MEMBERS.map((member) => ({ ...member })),
    invites: [],
    joinRequests: [
      { id: "jr-halima", username: "halima-musa", name: "Halima Musa", track: "Backend", projectsCompleted: 7, roleName: "Backend Development", message: "I've built two booking APIs before and would love to help with payments.", createdAt: ago(300) },
    ],
    tasks: [
      task("t-1", "Mobile layouts for event detail", "UI Design", "amara-okafor", "todo", 3, "Design the event detail page at 360px and 768px, including the sticky Book button."),
      task("t-2", "Email confirmation template", "Frontend", "kemi-martins", "todo", 5, "HTML email with the event, seats and the QR code."),
      task("t-3", "Rate-limit the booking endpoint", "Backend", "david-mensah", "todo", 6, "Limit to 10 booking attempts a minute per user."),
      task("t-4", "Organiser dashboard wireframe", "UI Design", "amara-okafor", "todo", 8),
      task("t-5", "Checkout page with seat selection", "Frontend", "kemi-martins", "in_progress", 1, "Connect the seat map to checkout and show the total."),
      task("t-6", "Ticket QR code generation API", "Backend", "david-mensah", "in_progress", 2, "Return a signed token and a PNG for each ticket."),
      task("t-7", "Design system: buttons, inputs, cards", "UI Design", "amara-okafor", "done", -12),
      task("t-8", "Events list with search and filters", "Frontend", "kemi-martins", "done", -10),
      task("t-9", "Database schema and seed data", "Backend", "david-mensah", "done", -14),
      task("t-10", "Booking flow wireframes", "UI Design", "amara-okafor", "done", -15),
      task("t-11", "Seat map component", "Frontend", "kemi-martins", "done", -2),
      task("t-12", "Auth with email and password", "Backend", "david-mensah", "done", -9),
      task("t-13", "Event card and empty states", "UI Design", "amara-okafor", "done", -6),
    ],
    channels: [
      { id: "general", name: "general", unread: 4 },
      { id: "design", name: "design", unread: 0 },
      { id: "backend", name: "backend", unread: 0 },
      { id: "submission", name: "submission", unread: 0 },
    ],
    messages: [
      message("m-1", "general", amara, `Stand-up every day at 8pm WAT in #general. Deadline: ${deadlineText} WAT.`, 7 * 1440, { pinned: true }),
      message("m-2", "general", kemi, "Seat map is done on desktop. I pushed it to the feature/seat-map branch. Can someone test on mobile?", 26 * 60),
      message("m-3", "general", david, "Nice. The QR ticket endpoint is live on staging: /api/tickets/:id/qr. It returns a PNG.", 25 * 60 + 43, { pinned: true }),
      message("m-4", "general", amara, "I'll test the seat map on my phone tonight and update the confirmation screen to show the QR code.", 25 * 60 + 34),
      { id: "m-5", channel: "general", type: "event", author: null, body: "Kemi completed “Seat map component”", event: { kind: "task_done", taskId: "t-11", title: "Task moved to Done" }, createdAt: ago(25 * 60 + 22), pinned: false, attachment: null },
      message("m-6", "general", kemi, "Uploaded the new checkout mockups to Files.", 25 * 60 - 10, { attachment: { name: "checkout-v3.fig", kind: "figma", url: "https://www.figma.com/file/nova-checkout", size: null } }),
      message("m-7", "general", kemi, "Seat map is working on desktop. Pushing the mobile fix tonight.", 140),
      message("m-8", "general", david, "QR endpoint returns a signed token now. Docs are in the shared files. @Amara can you check the confirmation copy?", 132, { mentions: ["amara-okafor"] }),
      message("m-9", "design", amara, "Sharing the type scale: 32 / 24 / 18 / 16 / 14. Please use the tokens, not raw sizes.", 3 * 1440),
      message("m-10", "design", kemi, "Got it. I've swapped the event cards to the tokens.", 3 * 1440 - 40),
      message("m-11", "backend", david, "Bookings now lock seats for 10 minutes while checkout is open.", 2 * 1440),
      message("m-12", "backend", kemi, "Perfect, I'll show a timer on the checkout page.", 2 * 1440 - 25),
      message("m-13", "submission", amara, "I've started the submission draft. Please confirm your part on the Submission tab when you're happy.", 1440 * 5),
    ],
    folders: DEFAULT_FOLDERS.map((folder) => ({ ...folder })),
    files: [
      { id: "f-1", name: "checkout-v3.fig", type: "link", kind: "figma", note: "Figma link · v3", folderId: "design", addedBy: kemi, updatedAt: ago(140), size: null, url: "https://www.figma.com/file/nova-checkout", readOnly: false },
      { id: "f-2", name: "project-brief.pdf", type: "file", kind: "pdf", note: "From CodeRise · read-only", folderId: "brief", addedBy: { username: "coderise", name: "CodeRise" }, updatedAt: daysAgo(22), size: 1.2 * MB, url: null, readOnly: true },
      { id: "f-3", name: "GitHub – team-nova/event-tickets", type: "link", kind: "github", note: "Repository link", folderId: "code", addedBy: david, updatedAt: daysAgo(8), size: null, url: "https://github.com/team-nova/event-tickets", readOnly: false },
      { id: "f-4", name: "brand-assets.zip", type: "file", kind: "zip", note: "Logos, fonts and icons", folderId: "design", addedBy: amara, updatedAt: daysAgo(14), size: 18.4 * MB, url: null, readOnly: false },
      { id: "f-5", name: "api-endpoints.md", type: "file", kind: "doc", note: "Documentation", folderId: "code", addedBy: david, updatedAt: daysAgo(16), size: 6 * 1024, url: null, readOnly: false },
      { id: "f-6", name: "Figma – Ticketing UI v3", type: "link", kind: "figma", note: "Design file", folderId: "design", addedBy: amara, updatedAt: daysAgo(8), size: null, url: "https://www.figma.com/file/nova-ticketing-ui", readOnly: false },
      { id: "f-7", name: "event-detail-mobile.png", type: "file", kind: "image", note: "Mobile mock-up", folderId: "design", addedBy: amara, updatedAt: daysAgo(3), size: 820 * 1024, url: null, readOnly: false },
      { id: "f-8", name: "Brief notes (Google Drive)", type: "link", kind: "drive", note: "Shared doc", folderId: "brief", addedBy: amara, updatedAt: daysAgo(20), size: null, url: "https://drive.google.com/", readOnly: false },
    ],
    storageLimitBytes: 500 * MB,
    otherStorageBytes: 64 * MB,
    submission: {
      status: "draft",
      links: {
        github: "https://github.com/team-nova/event-tickets",
        live: "https://team-nova-tickets.vercel.app",
        figma: "https://www.figma.com/file/nova-checkout",
        video: "",
      },
      notes: "Event listing, seat selection, checkout and QR e-tickets are complete. Payments use test mode. Test login is in the README.",
      submittedAt: null,
      updatedAt: daysAgo(2),
    },
    confirmations: {
      "amara-okafor": daysAgo(6),
      "kemi-martins": daysAgo(5),
      "david-mensah": null,
    },
  };
}

// A brand-new team created in sample mode (S08).
export function buildNewTeam({ id, name, pitch, collaboration, size, roleName, invites, openRoleNames, visibility }) {
  return {
    id,
    name,
    pitch,
    collaborationId: collaboration.id,
    visibility,
    minMembers: collaboration.minMembers,
    maxMembers: size,
    deadline: collaboration.deadline,
    members: [{ ...SAMPLE_VIEWER, role: roleName, isLeader: true, online: true, lastSeenAt: new Date().toISOString() }],
    invites: invites.map((invite) => ({ ...invite, status: "pending" })),
    openRoleNames,
    joinRequests: [],
    tasks: [],
    channels: DEFAULT_CHANNELS.map((channel) => ({ id: channel, name: channel, unread: 0 })),
    messages: [
      { id: `${id}-created`, channel: "general", type: "event", author: null, body: `${SAMPLE_VIEWER.name} created ${name}`, event: { kind: "team_created", title: "Team created" }, createdAt: new Date().toISOString(), pinned: false, attachment: null },
    ],
    folders: DEFAULT_FOLDERS.map((folder) => ({ ...folder })),
    files: [],
    storageLimitBytes: 500 * MB,
    otherStorageBytes: 0,
    submission: { status: "draft", links: { github: "", live: "", figma: "", video: "" }, notes: "", submittedAt: null, updatedAt: null },
    confirmations: { [SAMPLE_VIEWER.username]: null },
  };
}
