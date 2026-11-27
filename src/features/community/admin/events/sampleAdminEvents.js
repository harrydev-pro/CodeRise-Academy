import { SAMPLE_COMMUNITY_COLLABORATIONS, SAMPLE_VIEWER_TEAM } from "../../sampleCommunityCollaborations";
import { SAMPLE_COMMUNITY_HACKATHONS } from "../../sampleCommunityHackathons";
import { DAY, hackathonStatus, HOUR } from "./eventHelpers";

// Sample data for the admin Collaboration, Team and Hackathon screens (A05–A11). Used only by
// the local dev server while the admin Community API is not available. It reuses the ids of the
// student-side samples (sampleCommunityCollaborations.js, sampleCommunityHackathons.js) so links
// between admin and student screens line up. Dates are relative to now.

const fromNow = (ms) => new Date(Date.now() + ms).toISOString();
const dayOffset = (days) => fromNow(days * DAY).slice(0, 10);

export const SAMPLE_JUDGES = [
  { id: "grace-adeyemi", name: "Grace Adeyemi", initials: "GA" },
  { id: "tunde-bello", name: "Tunde Bello", initials: "TB" },
  { id: "michael-osei", name: "Michael Osei", initials: "MO" },
  { id: "ada-nnaji", name: "Ada Nnaji", initials: "AN" },
  { id: "kwame-mensah", name: "Kwame Mensah", initials: "KM" },
];

// ---------- people ----------

const FIRST = ["Amara", "Kemi", "Samuel", "Chinedu", "Halima", "David", "Ifeoma", "Joseph", "Tobi", "Fatima", "Emeka", "Zainab", "Kwesi", "Ngozi", "Bola", "Yusuf", "Adaeze", "Femi", "Aisha", "Uche"];
const LAST = ["Okafor", "Martins", "Owusu", "Eze", "Musa", "Mensah", "Nwosu", "Kariuki", "Oladipo", "Abubakar", "Bello", "Afolabi", "Danjuma", "Boateng", "Ibekwe"];

function personAt(index) {
  const first = FIRST[index % FIRST.length];
  const last = LAST[(index + Math.floor(index / FIRST.length) * 4) % LAST.length];
  const suffix = index >= FIRST.length ? String(index) : "";
  return {
    name: `${first} ${last}`,
    initials: `${first[0]}${last[0]}`,
    username: `${first}-${last}${suffix ? `-${suffix}` : ""}`.toLowerCase(),
    email: `${first}.${last}${suffix}@example.com`.toLowerCase(),
  };
}

// ---------- collaborations ----------

const COLLAB_STATUS = {
  "podcast-launch-kit": "draft",
  "ai-study-buddy-chatbot": "draft",
  "nonprofit-website-refresh": "closed",
  "event-planner-assistant-pack": "closed",
};
const DESIGN_CATEGORIES = ["Product Design (UI/UX)", "Graphic Design"];

export function sampleCollaborations() {
  return SAMPLE_COMMUNITY_COLLABORATIONS.map((item, index) => {
    const status = COLLAB_STATUS[item.id] ?? "published";
    const [min, max] = item.teamSize.split("–").map(Number);
    const design = DESIGN_CATEGORIES.includes(item.category);
    return {
      id: item.id,
      title: item.title,
      category: item.category,
      level: item.level,
      access: item.access,
      description: `${item.description} Teams plan the work together, split it by role and submit one final piece of work.`,
      skills: [...item.skills],
      minMembers: min,
      maxMembers: max || min,
      anyoneCanStart: true,
      leadersApprove: true,
      roles: [
        { name: "Team lead", responsibility: "Plans the work, runs check-ins and submits for the team" },
        ...item.skills.slice(0, 2).map((skill) => ({ name: `${skill} lead`, responsibility: `Owns the ${skill} work and reviews teammates' changes` })),
      ],
      submissionRequirements: design
        ? "One submission per team: Figma file link, a PDF case study and a short note on each member's contribution."
        : "One submission per team: GitHub repository, live URL and a short README describing each member's contribution.",
      formats: design ? ["figma", "pdf"] : ["github", "live"],
      formUntil: status === "closed" ? dayOffset(-40 - index) : status === "draft" ? "" : dayOffset(3 + index),
      deadline: status === "closed" ? dayOffset(-5 - index) : status === "draft" ? "" : dayOffset(10 + index * 2),
      pointsPerMember: 100,
      status,
      createdAt: fromNow(-(60 - index) * DAY),
      createdBy: "Tunde Bello",
      updatedAt: fromNow(-(index * 2 + 1) * DAY),
    };
  });
}

// ---------- teams ----------

const TEAM_NAMES = ["Pixel Pioneers", "Byte Builders", "Lagos Logic", "Night Shift", "Code Crafters", "Harmattan Hackers", "Kobo Crew", "Team Ledger", "Naira Ninjas", "Bright Sparks", "Delta Devs", "Savannah Squad", "Team Akoko", "Lagoon Labs", "Baobab Builders", "Sahel Stack", "Team Orbit", "Palm Tree Labs", "Cowry Coders", "Team Zenith"];
const ROLES = ["UI Design", "Frontend Development", "Backend Development"];
const STATUS_CYCLE = ["active", "active", "forming", "submitted", "active", "flagged", "completed"];
const slug = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function teamName(index) {
  const base = TEAM_NAMES[index % TEAM_NAMES.length];
  return index >= TEAM_NAMES.length ? `${base} ${Math.floor(index / TEAM_NAMES.length) + 1}` : base;
}

export function sampleTeams(collaborations) {
  const teams = [];
  let personIndex = 8; // 0–2 are Team Nova
  let nameIndex = 0;
  collaborations.filter((collab) => collab.status !== "draft").forEach((collab, ci) => {
    const count = SAMPLE_COMMUNITY_COLLABORATIONS.find((item) => item.id === collab.id)?.teamsCount ?? 1;
    for (let t = 0; t < count; t += 1) {
      if (collab.id === "event-ticketing-website" && t === 0) {
        teams.push({
          id: SAMPLE_VIEWER_TEAM.id,
          name: SAMPLE_VIEWER_TEAM.name,
          collaborationId: collab.id,
          projectTitle: collab.title,
          maxMembers: collab.maxMembers,
          members: [
            { id: "amara-okafor", name: "Amara Okafor", initials: "AO", role: "UI Design", isLeader: true, tasksDone: 9, tasksTotal: 12, commits: 58, messages: 64 },
            { id: "kemi-martins", name: "Kemi Martins", initials: "KM", role: "Frontend Development", isLeader: false, tasksDone: 7, tasksTotal: 11, commits: 42, messages: 51 },
            { id: "samuel-owusu", name: "Samuel Owusu", initials: "SO", role: "Backend Development", isLeader: false, tasksDone: 4, tasksTotal: 10, commits: 27, messages: 23 },
          ],
          progress: 62,
          status: "active",
          reports: 0,
          lastActivityAt: fromNow(-2 * HOUR),
          formedAt: fromNow(-21 * DAY),
          deadline: collab.deadline,
          repository: "github.com/team-nova/event-ticketing",
        });
        continue;
      }
      const status = collab.status === "closed" ? (t % 4 === 3 ? "incomplete" : "completed") : STATUS_CYCLE[(ci + t) % STATUS_CYCLE.length];
      const progress = { forming: 0, submitted: 100, completed: 100, incomplete: 45, flagged: 18 }[status] ?? 20 + ((ci * 13 + t * 29) % 70);
      const size = status === "forming" ? 1 : t % 2 ? collab.minMembers : collab.maxMembers;
      const name = teamName(nameIndex);
      nameIndex += 1;
      const members = Array.from({ length: size }, (_, m) => {
        const person = personAt(personIndex);
        personIndex += 1;
        const tasksTotal = 10 + ((m + t) % 3);
        return {
          id: person.username,
          name: person.name,
          initials: person.initials,
          role: ROLES[m] ?? "Team member",
          isLeader: m === 0,
          tasksTotal,
          tasksDone: Math.round((tasksTotal * Math.max(0, progress - m * 8)) / 100),
          commits: Math.round(progress * (0.7 - m * 0.15)),
          messages: progress ? 12 + ((ci + m * 7 + t * 3) % 50) : 2,
        };
      });
      const ended = status === "completed" || status === "incomplete";
      teams.push({
        id: `team-${slug(name)}`,
        name,
        collaborationId: collab.id,
        projectTitle: collab.title,
        maxMembers: collab.maxMembers,
        members,
        progress,
        status,
        reports: status === "flagged" ? 2 : 0,
        lastActivityAt: fromNow(-(ended ? 20 + ci : ((ci * 5 + t * 11) % 200) / 24) * DAY),
        formedAt: fromNow(-(18 + ci + t) * DAY),
        deadline: collab.deadline,
        repository: `github.com/${slug(name)}/${collab.id}`,
      });
    }
  });
  return teams;
}

// ---------- hackathons ----------

export const DEFAULT_CRITERIA = [
  { name: "Problem fit and usefulness", weight: 30 },
  { name: "Working functionality", weight: 30 },
  { name: "Design and user experience", weight: 25 },
  { name: "Presentation and README", weight: 15 },
];
export const DEFAULT_RULES = [
  "1. All code and designs must be created during the 24 hours.",
  "2. Open-source libraries are allowed and must be listed in your README.",
  "3. One submission per team. Late submissions are not accepted.",
  "4. Be respectful in team chat and community spaces.",
].join("\n");
export const DEFAULT_PRIZES = {
  first: "1 month CodeRise Premium",
  grantPremium: true,
  second: "Recognition badge + 300 points",
  third: "Recognition badge + 200 points",
  certificate: true,
  featureWinners: true,
};

function at(daysFromNow, watHour) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromNow);
  date.setUTCHours(watHour - 1, 0, 0, 0);
  return date.toISOString();
}

export function sampleHackathons() {
  const list = SAMPLE_COMMUNITY_HACKATHONS.map((item, index) => ({
    id: item.id,
    title: item.title,
    category: item.category,
    description: item.description,
    rules: DEFAULT_RULES,
    bannerUrl: "",
    access: item.access,
    startsAt: item.startsAt,
    endsAt: item.endsAt,
    registrationClosesAt: item.registrationClosesAt,
    timezone: "Africa/Lagos",
    participation: item.format.startsWith("Teams") ? "teams" : "individual",
    minTeam: 2,
    maxTeam: 3,
    participantLimit: 300,
    criteria: structuredClone(DEFAULT_CRITERIA),
    submissionInstructions: "Submit before the deadline: a GitHub repository link, a live demo URL or a 3-minute video walkthrough, and a README listing team members and libraries used.",
    prizes: { ...DEFAULT_PRIZES },
    judges: SAMPLE_JUDGES.slice(0, item.status === "past" ? 5 : 3).map((judge) => ({ ...judge })),
    status: "scheduled", // the timing decides scheduled / live / ended
    registeredCount: item.registeredCount,
    resultsPublished: item.status === "past" && Boolean(item.winner),
    createdAt: fromNow(-(40 + index * 5) * DAY),
    updatedAt: fromNow(-(index + 1) * DAY),
  }));
  const draftStart = at(40, 10);
  list.push({
    ...list[0],
    id: "open-data-weekend",
    title: "Open Data Weekend",
    category: "Data Analysis",
    description: "Use open government data to answer a question that matters to your community, and present it as a dashboard or data story.",
    access: "free",
    startsAt: draftStart,
    endsAt: new Date(new Date(draftStart).getTime() + DAY).toISOString(),
    registrationClosesAt: at(39, 23),
    participation: "individual",
    judges: [],
    status: "draft",
    registeredCount: 0,
    resultsPublished: false,
    prizes: { ...DEFAULT_PRIZES },
    criteria: structuredClone(DEFAULT_CRITERIA),
  });
  return list;
}

const HACK_TEAMS = ["Team Nova", "Lagos Logic", "Ledger Lions", "Night Shift", "Kobo Crew", "Team Ledger", "Naira Ninjas", "Byte Builders", "Team Akoko", "Pixel Pioneers", "Harmattan Hackers", "Lagoon Labs", "Delta Devs", "Sahel Stack", "Cowry Coders", "Team Orbit"];
const MEMBERSHIPS = ["free", "premium", "free", "premium_plus", "free", "free", "premium"];

function hackTeamName(index) {
  const base = HACK_TEAMS[index % HACK_TEAMS.length];
  return index >= HACK_TEAMS.length ? `${base} ${Math.floor(index / HACK_TEAMS.length) + 1}` : base;
}

export function sampleParticipants(hackathon) {
  const teams = hackathon.participation === "teams";
  const base = Math.min(Date.now(), new Date(hackathon.registrationClosesAt).getTime());
  const list = [];
  let teamNo = 0;
  let slot = 0;
  let teamSize = 3;
  for (let i = 0; i < hackathon.registeredCount; i += 1) {
    const person = personAt(i);
    const looking = teams && i % 15 === 4;
    let team = null;
    let isLeader = false;
    if (teams && !looking) {
      if (slot === 0) teamSize = teamNo % 4 === 2 ? 2 : 3;
      team = hackTeamName(teamNo);
      isLeader = slot === 0;
      slot += 1;
      if (slot >= teamSize) { slot = 0; teamNo += 1; }
    }
    const disqualified = i === 7 || i === 150;
    list.push({
      id: `${hackathon.id}-p${i}`,
      name: person.name,
      initials: person.initials,
      username: person.username,
      email: person.email,
      team,
      isLeader,
      membership: MEMBERSHIPS[i % MEMBERSHIPS.length],
      registeredAt: new Date(base - (i * 1.7 + 1) * HOUR).toISOString(),
      status: disqualified ? "disqualified" : "registered",
      disqualifyReason: disqualified ? "duplicate account" : "",
    });
  }
  return list;
}

const PROJECT_NAMES = ["SplitSmart", "KoboJar Savings", "CampusCash", "FeeTrack", "BudgetBuddy", "RentShare", "LunchPool", "SaveCircle", "Ajo Online", "PocketPlan", "DuesDesk", "ShareBills", "Thrift Tracker", "StudyFund", "CoinCampus", "MealSplit", "Hostel Ledger", "Tuition Timer", "SmartPurse", "NairaNotes", "Group Wallet", "Receipt Radar", "SpendSense", "GoalJar"];
const MINUTE = 60 * 1000;

export function sampleSubmissions(hackathon, participants) {
  const status = hackathonStatus(hackathon);
  if (status === "draft" || status === "scheduled") return [];
  const active = participants.filter((person) => person.status === "registered");
  let entrants;
  if (hackathon.participation === "teams") {
    const byTeam = new Map();
    active.filter((person) => person.team).forEach((person) => {
      if (!byTeam.has(person.team)) byTeam.set(person.team, []);
      byTeam.get(person.team).push(person.name);
    });
    entrants = [...byTeam.entries()].map(([name, members]) => ({ name, members, individual: false }));
  } else {
    entrants = active.map((person) => ({ name: person.name, members: [person.name], individual: true }));
  }
  const live = status === "live";
  const count = Math.min(entrants.length, live ? 12 : 24);
  const judges = hackathon.judges.length ? hackathon.judges : SAMPLE_JUDGES.slice(0, 2);
  const endsAt = new Date(hackathon.endsAt).getTime();
  return entrants.slice(0, count).map((entrant, i) => {
    const late = !live && i === count - 1;
    const submittedAt = late ? endsAt + 3 * MINUTE : live ? Date.now() - (i * 23 + 5) * MINUTE : endsAt - (i * 37 + 2) * MINUTE;
    const pair = [judges[i % judges.length], judges[(i + 1) % judges.length]].filter((judge, index, all) => all.findIndex((item) => item.id === judge.id) === index);
    let assigned = [];
    let partial = false;
    if (!late) {
      if (hackathon.resultsPublished) assigned = pair;
      else if (live) assigned = i < 3 ? pair : [];
      else if (i % 6 === 5) assigned = [];
      else { assigned = pair; partial = i % 5 === 4; }
    }
    const base = 94 - i * 1.6;
    const project = PROJECT_NAMES[i % PROJECT_NAMES.length];
    return {
      id: `${hackathon.id}-s${i}`,
      team: entrant.name,
      members: entrant.members,
      individual: entrant.individual,
      project,
      projectUrl: `https://github.com/example/${slug(project)}`,
      submittedAt: new Date(submittedAt).toISOString(),
      late,
      judges: assigned.map((judge, k) => ({
        id: judge.id,
        name: judge.name,
        score: live || (partial && k === 1) ? null : Math.min(100, Math.round(base + (k ? -2 : 1) + (i % 3))),
      })),
    };
  });
}

