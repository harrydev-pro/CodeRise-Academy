// Sample Community Profile data, used only by the local dev server while the Community API is not
// available (see profileService.js). It mirrors the S21 design and documents the shape the backend
// is expected to return from GET /community/users/:username -> { profile }.
//
// Profile fields:
//   name, username, handle, location, joinedAt (ISO), bio, plan ("free" | "premium"),
//   title (latest badge name or null), skills: [string], learning: [string],
//   stats: { projectsCompleted, collaborations, hackathons, competitions, points, followers, following },
//   projects: [{ id, title, category, kind: "project" | "collaboration", meta, likes, comments,
//                showcaseId (opens in the Showcase) | null }]
//     -> PUBLIC projects only. Private projects are never sent to other people;
//   hiddenPrivateCount: number for the owner, null for everyone else,
//   badges: [{ id, name, earnedAt (ISO) | null, hint }] (earnedAt null = still locked),
//   certificates: [{ id, title, subject, issuedAt, downloadUrl }],
//   activity: [{ id, type: "competition" | "hackathon" | "project" | "team", title, details, status }],
//   isViewer (this is the signed-in student's own profile), viewerFollowing, viewerHasPremium.

import { SAMPLE_LEADERBOARD } from "../sampleCommunityLeaderboard";
import { SAMPLE_SHOWCASE_PROJECTS, SAMPLE_TOP_CREATORS, SAMPLE_VIEWER_USERNAME } from "../sampleCommunityShowcase";

export { SAMPLE_VIEWER_USERNAME };

const MONTH = 30 * 86400000;
const monthsAgo = (months) => new Date(Date.now() - months * MONTH).toISOString();

const ALL_BADGES = [
  { id: "first-project", name: "First Project", hint: "Get your first project approved" },
  { id: "team-player", name: "Team Player", hint: "Complete a team project" },
  { id: "rising-developer", name: "Rising Developer", hint: "Complete 5 projects in 30 days" },
  { id: "community-helper", name: "Community Helper", hint: "Help 10 other students" },
  { id: "hackathon-champion", name: "Hackathon Champion", hint: "Win a hackathon" },
  { id: "project-master", name: "Project Master", hint: "Complete 10 projects" },
  { id: "competition-winner", name: "Competition Winner", hint: "Win a competition" },
];

function badgesFor(earned) {
  return ALL_BADGES.map((badge) => ({ ...badge, earnedAt: earned[badge.id] ?? null }));
}

const AMARA = {
  name: "Amara Okafor",
  username: SAMPLE_VIEWER_USERNAME,
  handle: "amara.codes",
  location: "Lagos, Nigeria",
  joinedAt: monthsAgo(8),
  bio: "Frontend learner who loves turning messy ideas into clean, accessible interfaces. Currently building with React and learning product design on the side.",
  plan: "free",
  title: "Rising Developer",
  skills: ["HTML", "CSS", "JavaScript", "React", "Figma", "Git"],
  learning: ["Frontend Development", "Product Design"],
  stats: { projectsCompleted: 5, collaborations: 2, hackathons: 1, competitions: 1, points: 1240, followers: 86, following: 41 },
  projects: [
    { id: "personal-portfolio", title: "Personal Portfolio", category: "Frontend", kind: "project", meta: "Frontend · Score 92/100", likes: 64, comments: 7, showcaseId: "personal-portfolio-amara" },
    { id: "restaurant-landing-page", title: "Restaurant Landing Page", category: "Web", kind: "project", meta: "Frontend · Score 88/100", likes: 41, comments: 3, showcaseId: null },
    { id: "event-ticketing-website", title: "Event Ticketing Website", category: "Team", kind: "collaboration", meta: "Team Nova · In progress", detail: "Collaboration · 3 members", showcaseId: null },
  ],
  hiddenPrivateCount: 2,
  badges: badgesFor({ "first-project": monthsAgo(8), "team-player": monthsAgo(0.3), "rising-developer": monthsAgo(1), "community-helper": monthsAgo(2) }),
  certificates: [
    { id: "cert-hack", title: "Hackathon Participation", subject: "Green Campus 24h", issuedAt: monthsAgo(1.2), downloadUrl: null },
    { id: "cert-portfolio", title: "Project Completion", subject: "Personal Portfolio", issuedAt: monthsAgo(1), downloadUrl: null },
  ],
  activity: [
    { id: "ac1", type: "competition", title: "Entered Best Landing Page Design 2026", details: "Competition · Submitted 10 days ago", status: "Under review" },
    { id: "ac2", type: "hackathon", title: "Green Campus 24h Hackathon", details: "Hackathon · Team EcoBuild · 7th of 46", status: "Participated" },
    { id: "ac3", type: "project", title: "Personal Portfolio approved", details: "Project · Score 92/100", status: "Approved" },
    { id: "ac4", type: "team", title: "Joined Team Nova", details: "Collaboration · Frontend Developer role", status: "Active" },
  ],
  viewerFollowing: false,
};

const EXTRA = {
  "chinedu-eze": {
    handle: "chinedu.builds", location: "Abuja, Nigeria", joinedAt: monthsAgo(20), plan: "premium",
    bio: "Fullstack developer who loves maps, transport data and shipping fast. Project of the Month winner for Lagos Transit Tracker.",
    skills: ["React", "Node.js", "PostgreSQL", "Leaflet", "TypeScript"], learning: ["Fullstack Development"],
    stats: { projectsCompleted: 14, collaborations: 4, hackathons: 6, competitions: 3, followers: 2100, following: 120 },
    badges: { "first-project": monthsAgo(19), "team-player": monthsAgo(15), "rising-developer": monthsAgo(14), "community-helper": monthsAgo(9), "hackathon-champion": monthsAgo(5), "project-master": monthsAgo(3) },
  },
  "kemi-martins": {
    handle: "kemi.designs", location: "Ibadan, Nigeria", joinedAt: monthsAgo(16), plan: "premium",
    bio: "Product designer who codes a little. I care about booking flows that anyone can use, whatever their age or phone.",
    skills: ["Figma", "Prototyping", "User research", "Next.js", "Tailwind"], learning: ["Product Design", "Frontend Development"],
    stats: { projectsCompleted: 11, collaborations: 5, hackathons: 4, competitions: 2, followers: 1200, following: 210 },
    badges: { "first-project": monthsAgo(15), "team-player": monthsAgo(12), "rising-developer": monthsAgo(11), "community-helper": monthsAgo(6), "project-master": monthsAgo(2) },
  },
};

const BADGE_IDS = Object.fromEntries(ALL_BADGES.map((badge) => [badge.name, badge.id]));

// Builds a public profile for any other member found in the Leaderboard or Showcase samples.
function buildOtherProfile(username) {
  const leader = SAMPLE_LEADERBOARD.find((entry) => entry.username === username);
  const shown = SAMPLE_SHOWCASE_PROJECTS.filter((project) => project.author.username === username);
  const author = shown[0]?.author;
  if (!leader && !author) return null;
  const extra = EXTRA[username] ?? {};
  const name = leader?.name ?? author.name;
  const track = author?.track ?? leader?.category ?? "Frontend";
  const creator = SAMPLE_TOP_CREATORS.find((item) => item.username === username);
  const earned = extra.badges ?? { "first-project": monthsAgo(6), ...(leader?.badge && BADGE_IDS[leader.badge] ? { [BADGE_IDS[leader.badge]]: monthsAgo(2) } : {}) };
  const stats = {
    projectsCompleted: Math.max(shown.length, 3), collaborations: 1, hackathons: 1, competitions: 0, followers: author?.followers ?? 48, following: 30,
    ...extra.stats,
    points: leader?.points ?? 600,
  };
  return {
    name,
    username,
    handle: extra.handle ?? username.replace("-", "."),
    location: extra.location ?? "Lagos, Nigeria",
    joinedAt: extra.joinedAt ?? monthsAgo(10),
    bio: extra.bio ?? `${track} learner at CodeRise, sharing finished projects with the community.`,
    plan: extra.plan ?? (leader?.premium ? "premium" : "free"),
    title: leader?.badge ?? null,
    skills: extra.skills ?? [...new Set(shown.flatMap((project) => project.tags))].slice(0, 6),
    learning: extra.learning ?? [track],
    stats,
    projects: shown.map((project) => ({
      id: project.id, title: project.title, category: project.category, kind: "project",
      meta: `${project.category} · Completed`, likes: project.likes, comments: project.commentsCount, showcaseId: project.id,
    })),
    hiddenPrivateCount: null, // never revealed to other people
    badges: badgesFor(earned),
    certificates: shown.slice(0, 2).map((project) => ({ id: `cert-${project.id}`, title: "Project Completion", subject: project.title, issuedAt: project.completedAt, downloadUrl: null })),
    activity: shown.slice(0, 4).map((project) => ({ id: `act-${project.id}`, type: "project", title: `${project.title} approved`, details: `Project · ${project.category}`, status: "Approved" })),
    viewerFollowing: Boolean(author?.viewerFollowing ?? creator?.viewerFollowing),
  };
}

export function findSampleProfile(username) {
  if (username === SAMPLE_VIEWER_USERNAME) return { ...AMARA, isViewer: true, viewerHasPremium: false };
  const profile = buildOtherProfile(username);
  return profile ? { ...profile, isViewer: false, viewerHasPremium: false } : null;
}
