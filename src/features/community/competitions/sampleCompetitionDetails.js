// Sample data for the competition screens (S16 Details, S17 Registration, S18 Payment,
// S19 Results). Used only by the local dev server while the Community API is not available
// (see competitionService.js). The list fields come from SAMPLE_COMMUNITY_COMPETITIONS so the
// ids, fees and dates match the Competitions tab.
import { SAMPLE_COMMUNITY_COMPETITIONS } from "../sampleCommunityCompetitions";

const DAY = 86400000;
const shift = (iso, days) => new Date(new Date(iso).getTime() + days * DAY).toISOString();

export const SAMPLE_VIEWER_PROFILE = { fullName: "Amara Okafor", email: "amara@example.com", displayName: "amara.builds", country: "Nigeria", username: "amara-okafor" };

const DETAILS = {
  "best-landing-page-2026": {
    summary: "Design a high-converting landing page for a real or imagined African start-up, from wireframe to polished UI.",
    description: "Pick a product you believe in and design the landing page that would sell it. Judges look for a clear message, a strong visual hierarchy and a page that works on phones as well as laptops. Figma, Framer or any design tool is fine.",
    format: "Individual",
    rules: [
      "One entry per student. Team entries are not accepted for this competition.",
      "All work must be created after registration opens.",
      "You may use free icon sets and stock photos; credit them in your summary.",
      "Submissions after the deadline are not judged. The deadline is enforced by the system.",
      "Plagiarised or copied work is disqualified.",
    ],
    criteria: [
      { label: "Clarity of message", weight: 30 },
      { label: "Visual design and hierarchy", weight: 30 },
      { label: "Responsive layout", weight: 25 },
      { label: "Presentation", weight: 15 },
    ],
    requirements: [
      { icon: "link", title: "Figma or prototype link", detail: "Shared with view access for judges", required: true },
      { icon: "image", title: "Desktop and phone mock-ups", detail: "PNG or JPG, at least 1440 and 390 wide", required: true },
      { icon: "file", title: "One-page PDF summary", detail: "Audience, goal and key design decisions (max 5 MB)", required: true },
    ],
    checklist: [
      { label: "I can share a public Figma or prototype link", hint: "Judges need view access without signing in." },
      { label: "I can export desktop and phone mock-ups", hint: "PNG or JPG, at least 1440 and 390 pixels wide." },
      { label: "I will write a one-page PDF summary", hint: "Audience, goal and design decisions. Maximum 5 MB." },
    ],
    prizes: [
      { place: 1, title: "1st place", reward: "$150 cash + certificate + 1 month Premium" },
      { place: 2, title: "2nd place", reward: "$75 + certificate" },
      { place: 3, title: "3rd place", reward: "$25 + certificate" },
      { place: "mention", title: "Honourable mentions (3)", reward: "Featured in the showcase + 200 points" },
    ],
  },
  "best-mobile-application": {
    summary: "Design and build a working mobile app that solves a real everyday problem for students or small businesses in your city.",
    description: "Pick one problem you see every day — paying school fees, finding a tutor, tracking a small shop's stock — and ship a mobile app that solves it. Judges are looking for a working product, not just screens. You can use Flutter, React Native, Kotlin or Swift.",
    format: "Individual",
    rules: [
      "One entry per student. Team entries are not accepted for this competition.",
      "All code must be written after registration opens.",
      "Open-source libraries are allowed; credit them in your README.",
      "Submissions after the deadline are not judged. The deadline is enforced by the system.",
      "Plagiarised or copied work is disqualified and the entry fee is not refunded.",
    ],
    criteria: [
      { label: "Problem and usefulness", weight: 30 },
      { label: "Functionality and code quality", weight: 30 },
      { label: "User experience and design", weight: 25 },
      { label: "Presentation (demo video)", weight: 15 },
    ],
    requirements: [
      { icon: "code", title: "GitHub repository", detail: "Public repo with a README and setup steps", required: true },
      { icon: "video", title: "Demo video", detail: "2–3 minute screen recording, link to YouTube or Loom", required: true },
      { icon: "download", title: "APK or TestFlight link", detail: "So judges can install the app", required: false },
      { icon: "file", title: "One-page PDF summary", detail: "Problem, users, features, what you would build next (max 5 MB)", required: true },
    ],
    checklist: [
      { label: "I can submit a public GitHub repository", hint: "With a README and setup steps judges can follow." },
      { label: "I can record a 2–3 minute demo video", hint: "Uploaded to YouTube or Loom and shared as a link." },
      { label: "I will write a one-page PDF summary", hint: "Problem, users, features and next steps. Maximum 5 MB." },
    ],
    prizes: [
      { place: 1, title: "1st place", reward: "$300 + 3 months Premium Plus + certificate" },
      { place: 2, title: "2nd place", reward: "$150 + 1 month Premium Plus + certificate" },
      { place: 3, title: "3rd place", reward: "$75 + 1 month Premium + certificate" },
      { place: "mention", title: "Honourable mentions (3)", reward: "Featured in the showcase + 200 points" },
    ],
  },
};

// Every other competition gets a sensible brief built from its category.
function genericDetails(item) {
  return {
    summary: `Show your best ${item.category.toLowerCase()} work and get judged by CodeRise reviewers.`,
    description: `Create an original ${item.category.toLowerCase()} project around a real brief. Judges look for quality, originality and how clearly you explain your decisions.`,
    format: "Individual",
    rules: [
      "One entry per student.",
      "All work must be created after registration opens.",
      "Submissions after the deadline are not judged. The deadline is enforced by the system.",
      "Plagiarised or copied work is disqualified.",
    ],
    criteria: [
      { label: "Quality of work", weight: 40 },
      { label: "Originality", weight: 30 },
      { label: "Presentation", weight: 30 },
    ],
    requirements: [
      { icon: "link", title: "Project link", detail: "A public link judges can open", required: true },
      { icon: "file", title: "One-page PDF summary", detail: "Goal, approach and results (max 5 MB)", required: true },
    ],
    checklist: [
      { label: "I can share a public project link", hint: "Judges open it without signing in." },
      { label: "I will write a one-page PDF summary", hint: "Goal, approach and results. Maximum 5 MB." },
    ],
    prizes: [
      { place: 1, title: "1st place", reward: item.prize },
      { place: 2, title: "2nd place", reward: "$50 + certificate" },
      { place: 3, title: "3rd place", reward: "$25 + certificate" },
    ],
  };
}

export function sampleCompetitionDetails(id) {
  const item = SAMPLE_COMMUNITY_COMPETITIONS.find((competition) => competition.id === id);
  if (!item) return null;
  return {
    ...item,
    ...(DETAILS[item.id] ?? genericDetails(item)),
    processingFeeUsd: 0,
    registrationOpensAt: shift(item.registrationClosesAt, -22),
    judgingStartsAt: shift(item.submissionDeadline, 1),
    judgingEndsAt: shift(item.submissionDeadline, 18),
    winnersAnnouncedAt: shift(item.submissionDeadline, 21),
  };
}

// ---------- Results (S19) ----------
const FIRST = ["Kemi", "David", "Ifeoma", "Samuel", "Halima", "Tobi", "Grace", "Chinedu", "Ama", "Kwame", "Zainab", "Emeka", "Fatima", "Yaw", "Ngozi", "Ibrahim", "Esi", "Bola", "Aisha", "Kofi"];
const LAST = ["Martins", "Mensah", "Nwosu", "Owusu", "Musa", "Adewale", "Adeyemi", "Eze", "Boateng", "Bello", "Okeke", "Asante", "Danjuma", "Ofori", "Lawal", "Abubakar", "Quaye", "Afolabi", "Sule", "Appiah"];
const CITIES = ["Lagos", "Accra", "Enugu", "Kumasi", "Kano", "Abuja", "Ibadan", "Port Harcourt", "Takoradi", "Kaduna"];

const RESULT_SETS = {
  "best-graphic-design-local-cafe": {
    track: "Graphic Design",
    judges: 3,
    projects: ["“Kofi Corner” café identity", "“Mama Put” brand refresh", "“Brew & Bole” logo system", "Akara café menu and signage", "Zobo bar packaging", "Suya spot identity", "Chapman café rebrand", "Morning chops visual kit"],
    podium: [
      { comment: "A confident, warm identity that would work on a cup, a sign and an Instagram post. The colour story is excellent." },
      { comment: "Strong typography and a clever logo mark. The menu layout could breathe a little more." },
      { comment: "Lovely packaging ideas. The brand guide explains every decision clearly." },
    ],
    prizes: ["$100 + certificate", "$50 + certificate", "$25 + certificate"],
    viewer: { rank: 23, project: "Lagos street café identity", feedback: [
      { judge: "Reviewer 1", score: 80, comment: "Good colour palette and a clear logo. Show the brand applied on more items, like cups and bags." },
      { judge: "Reviewer 2", score: 78, comment: "The typography pairing works well. Tighten the spacing on the menu so it reads faster." },
      { judge: "Reviewer 3", score: 80, comment: "A solid, consistent submission. Your PDF summary was clear and well structured." },
    ] },
  },
  "best-virtual-assistant-portfolio": {
    track: "Virtual Assistance",
    judges: 2,
    projects: ["Executive assistant portfolio", "Remote admin services site", "Inbox and calendar case studies", "Customer support portfolio", "E-commerce VA portfolio", "Social media assistant portfolio", "Bookkeeping VA showcase", "Travel planning portfolio"],
    podium: [
      { comment: "Clear services, real case studies with numbers and an easy way to book a call. Exactly what clients need." },
      { comment: "Very professional. The client testimonials and process section build trust quickly." },
      { comment: "Well organised and easy to scan. Add one more detailed case study to stand out further." },
    ],
    prizes: ["$100 + certificate", "$50 + certificate", "$25 + certificate"],
    viewer: null,
  },
};

const slug = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

// Builds a full, ranked entry list (one row per participant) with scores going down from 94.6.
function buildEntries(item, set) {
  const entries = [];
  for (let index = 0; index < item.participants; index += 1) {
    const first = FIRST[(index * 7) % FIRST.length];
    const last = LAST[(index * 3 + Math.floor(index / FIRST.length)) % LAST.length];
    const name = `${first} ${last}`;
    const rank = index + 1;
    entries.push({
      rank,
      name,
      username: `${slug(name)}${index >= FIRST.length ? `-${index}` : ""}`,
      track: set.track,
      city: CITIES[index % CITIES.length],
      project: set.projects[index % set.projects.length],
      submittedAt: shift(item.submissionDeadline, -((index % 5) + 1)),
      score: Math.max(41, Math.round((94.6 - index * 0.7 - (index > 10 ? index * 0.08 : 0)) * 10) / 10),
      award: rank <= 3 ? `place_${rank}` : rank <= 6 ? "mention" : null,
      prize: rank <= 3 ? set.prizes[rank - 1] : null,
      judgeComment: rank <= 3 ? set.podium[rank - 1].comment : null,
      isViewer: false,
    });
  }
  if (set.viewer) {
    const viewer = entries[set.viewer.rank - 1];
    Object.assign(viewer, {
      name: SAMPLE_VIEWER_PROFILE.fullName,
      username: SAMPLE_VIEWER_PROFILE.username,
      city: "Lagos",
      project: set.viewer.project,
      points: 50,
      isViewer: true,
    });
  }
  return entries;
}

export function sampleCompetitionResults(id) {
  const competition = sampleCompetitionDetails(id);
  if (!competition) return null;
  const set = RESULT_SETS[id];
  if (competition.status !== "results" || !set) return { competition, published: false };
  const entries = buildEntries(competition, set);
  return {
    competition,
    published: true,
    publishedAt: competition.winnersAnnouncedAt,
    judgesCount: set.judges,
    entriesCount: entries.length,
    entries,
    viewerFeedback: set.viewer ? set.viewer.feedback : null,
  };
}
