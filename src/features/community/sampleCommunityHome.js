// Sample Community Home data, used only by the local dev server while the Community API
// is not available (see communityService.js). It mirrors the S01 design and documents the
// response shape the backend is expected to return from GET /community/home.

const HOUR = 60 * 60 * 1000;

// Keep the sample countdown in the future however long ago the dev server started.
const hackathonStart = new Date(Date.now() + (8 * 24 + 14) * HOUR + 22 * 60 * 1000).toISOString();

export const SAMPLE_COMMUNITY_HOME = {
  viewer: {
    username: "amara-okafor",
    membership: { plan: "free", lockedPremiumProjects: 38 },
    projectsCompleted: 5,
    points: 1240,
    rank: 18,
    pointsToTop10: 410,
  },
  stats: {
    availableProjects: 64,
    activeCollaborations: 2,
    upcomingHackathons: 3,
    activeCompetitions: 2,
  },
  featuredProjects: [
    {
      slug: "restaurant-landing-page",
      title: "Restaurant Landing Page",
      track: "Frontend Development",
      description: "Build a responsive one-page site with a menu, opening hours and a reservation form.",
      level: "Beginner",
      duration: "5 days",
      access: "free",
      icon: "code",
    },
    {
      slug: "mobile-banking-app-ui",
      title: "Mobile Banking App UI",
      track: "Product Design (UI/UX)",
      description: "Design onboarding, account overview and transfer flows with a reusable component set.",
      level: "Intermediate",
      duration: "2 weeks",
      access: "premium",
      icon: "mobile",
    },
    {
      slug: "sales-performance-dashboard",
      title: "Sales Performance Dashboard",
      track: "Data Analysis",
      description: "Clean a year of store sales data and present monthly trends and top products.",
      level: "Beginner",
      duration: "1 week",
      access: "free",
      icon: "chart",
    },
  ],
  collaborations: [
    {
      id: "event-ticketing-website",
      kind: "member",
      title: "Event Ticketing Website",
      teamId: "team-nova",
      teamName: "Team Nova",
      members: 3,
      maxMembers: 3,
      due: "2 Dec",
      progress: 62,
      icon: "code",
    },
    {
      id: "coffee-brand-identity",
      kind: "open",
      title: "Coffee Brand Identity",
      track: "Branding & Graphic Design",
      openSlots: 1,
      lookingFor: "Illustrator",
      memberInitials: ["KM", "DS"],
      icon: "palette",
    },
  ],
  hackathon: {
    id: "fintech-for-students",
    title: "FinTech for Students Hackathon",
    description: "Build a tool that helps students budget, save or split costs.",
    tags: ["24-hour challenge", "Free entry", "Teams of 2–3"],
    startsAt: hackathonStart,
    prize: "Winner gets 1 month of CodeRise Premium",
  },
  competitions: [
    {
      id: "best-landing-page-2026",
      title: "Best Landing Page Design 2026",
      closes: "30 Nov",
      prize: "$150 + certificate",
      entryFee: null,
      icon: "monitor",
    },
    {
      id: "best-mobile-application",
      title: "Best Mobile Application",
      closes: "12 Dec",
      prize: "$300 + 3 months Premium Plus",
      entryFee: "$5",
      icon: "mobile",
    },
  ],
  projectOfMonth: {
    month: "October",
    title: "Lagos Transit Tracker",
    author: "Chinedu Eze",
    description: "A live bus-route map built with React and Leaflet. See how it was built in the showcase.",
    showcaseId: "lagos-transit-tracker",
  },
  announcements: [
    { id: "a1", tag: "Pinned", title: "Hackathon registration is open", meta: "Today · CodeRise Team" },
    { id: "a2", tag: "New", title: "12 new Data Analysis projects added", meta: "17 Nov" },
    { id: "a3", tag: "Premium", title: "Masterclass: Pricing your freelance work", meta: "14 Nov" },
  ],
  topMembers: [
    { rank: 1, name: "Chinedu Eze", username: "chinedu-eze", track: "Fullstack", points: 4860 },
    { rank: 2, name: "Kemi Martins", username: "kemi-martins", track: "Product Design", points: 4215 },
    { rank: 3, name: "David Mensah", username: "david-mensah", track: "Data Analysis", points: 3990 },
  ],
  challenges: [
    { id: "c1", cadence: "Weekly", premium: false, ends: "Ends Sun", title: "Build a calculator in 48 hours", points: 40, joined: 126 },
    { id: "c2", cadence: "Monthly", premium: true, ends: "Ends 30 Nov", title: "Design a mobile banking interface", points: 120, joined: 58 },
  ],
};
