// Sample Announcements data, used only by the local dev server while the Community API is not
// available (see communityService.js). It mirrors the S23 design and documents the shape the
// backend is expected to return from GET /community/announcements.
//
// Announcement fields:
//   id, category ("projects" | "hackathons" | "competitions" | "collaboration" | "platform" | "premium"),
//   title, body, publishedAt (ISO date), author, read (boolean), pinned (boolean),
//   imageUrl (pinned banner, optional),
//   action: { label, to } (a page inside the app) — optional,
//   secondaryAction: { label, href } (an external page, opens in a new tab) — optional.
// The backend only returns announcements meant for this student (their audience).

const daysAgo = (days) => new Date(Date.now() - days * 86400000).toISOString();

export const SAMPLE_ANNOUNCEMENTS = [
  { id: "fintech-hackathon-open", pinned: true, category: "hackathons", title: "Registration is open for the FinTech for Students Hackathon", body: "Our first 24-hour hackathon starts on Saturday at 10:00 WAT. Work alone or in a team of up to three and build a tool that helps students budget, save or split costs. The winner receives one month of CodeRise Premium, and every participant earns 50 community points and a participation certificate.", publishedAt: daysAgo(1), author: "CodeRise Team", read: true, imageUrl: null, action: { label: "View hackathon", to: "/community/hackathons/fintech-for-students" }, secondaryAction: { label: "Read the full rules", href: "https://example.com/hackathon-rules" } },
  { id: "data-analysis-projects", category: "projects", title: "12 new Data Analysis projects are live", body: "From a customer churn analysis to a sales forecasting dashboard. Seven are free for every student.", publishedAt: daysAgo(3), author: "CodeRise Team", read: false, action: { label: "Browse projects", to: "/community/projects?category=Data+Analysis" } },
  { id: "landing-page-competition", category: "competitions", title: "Best Landing Page Design 2026 – free to enter", body: "Our second free competition. Registration closes soon. First place wins $150 and a winner certificate.", publishedAt: daysAgo(5), author: "CodeRise Team", read: false, action: { label: "See competition", to: "/community/competitions/best-landing-page-2026" } },
  { id: "pricing-masterclass", category: "premium", title: "Masterclass: Pricing your freelance work", body: "A live session for Premium members on Thursday at 18:00 WAT. Recording available for 30 days.", publishedAt: daysAgo(6), author: "CodeRise Team", read: true, action: { label: "Join with Premium", to: "/premium" } },
  { id: "new-team-projects", category: "collaboration", title: "New team projects: Fullstack and Digital Marketing", body: "Five new collaboration briefs for teams of two or three, including a food delivery web app.", publishedAt: daysAgo(10), author: "CodeRise Team", read: true, action: { label: "Find a team", to: "/community/collaborate" } },
  { id: "maintenance-november", category: "platform", title: "Scheduled maintenance on Sunday", body: "Submissions will be paused from 02:00 to 04:00 WAT. Deadlines falling in this window have been extended by two hours.", publishedAt: daysAgo(17), author: "CodeRise Team", read: true },
  { id: "showcase-launch", category: "projects", title: "The Project Showcase is here", body: "Share your finished projects, like and comment on other learners' work, and follow the creators you admire.", publishedAt: daysAgo(24), author: "CodeRise Team", read: true, action: { label: "Visit the showcase", to: "/community/showcase" } },
  { id: "first-competition-results", category: "competitions", title: "Results: Best Virtual Assistant Portfolio", body: "Congratulations to our first competition winners. See the winning portfolios and the judges' comments.", publishedAt: daysAgo(31), author: "CodeRise Team", read: true, action: { label: "See results", to: "/community/competitions/best-virtual-assistant-portfolio/results" } },
  { id: "leaderboard-launch", category: "platform", title: "Introducing the community leaderboard", body: "Earn points for approved projects, hackathons, competitions and helping others, and see how you rank each month.", publishedAt: daysAgo(38), author: "CodeRise Team", read: true, action: { label: "View leaderboard", to: "/community/leaderboard" } },
  { id: "premium-launch", category: "premium", title: "CodeRise Premium is now available", body: "Unlock 38 Premium projects, Premium hackathons and members-only masterclasses.", publishedAt: daysAgo(45), author: "CodeRise Team", read: true, action: { label: "See plans", to: "/premium" } },
];

export const SAMPLE_EMAIL_PREFERENCES = { projects: true, events: true, collaboration: false, platform: true };
