// Sample Project Showcase data, used only by the local dev server while the Community API is
// not available (see communityService.js). It mirrors the S20 design and documents the shapes
// the backend is expected to return from GET /community/showcase and GET /community/showcase/:id.
//
// Showcase project fields (list):
//   id, title, category, description, tags[], completedAt (ISO date),
//   author: { name, username, track }, likes, appreciations, commentsCount,
//   links: [{ label: "Live" | "GitHub" | "Figma" | "PDF" | "Report" | "APK", url }],
//   viewerLiked, viewerAppreciated (booleans).
// The detail response adds: source (e.g. "Frontend project library"),
// author.followers, author.viewerFollowing, and comments: [{ id, author: { name, username }, body, createdAt, isCreator }].

export const SHOWCASE_CATEGORIES = ["Frontend", "Product Design", "Data Analysis", "Graphic Design", "Mobile"];

const daysAgo = (days) => new Date(Date.now() - days * 86400000).toISOString();

export const SAMPLE_VIEWER_USERNAME = "amara-okafor";

export const SAMPLE_PROJECT_OF_THE_MONTH = {
  id: "lagos-transit-tracker",
  month: "October 2026",
  title: "Lagos Transit Tracker",
  description: "A live bus-route map for Lagos commuters with arrival estimates, built with React, Leaflet and a Node API. Chinedu receives a recognition certificate, the Project of the Month badge and 1 month of Premium.",
  tags: ["React", "Leaflet", "Node.js"],
  likes: 412,
  author: { name: "Chinedu Eze", username: "chinedu-eze", track: "Fullstack", points: 4860 },
};

export const SAMPLE_TOP_CREATORS = [
  { name: "Chinedu Eze", username: "chinedu-eze", projects: 4, likes: 1140, viewerFollowing: false },
  { name: "Kemi Martins", username: "kemi-martins", projects: 3, likes: 860, viewerFollowing: true },
  { name: "Fatima Abubakar", username: "fatima-abubakar", projects: 2, likes: 512, viewerFollowing: false },
];

const AUTHORS = {
  kemi: { name: "Kemi Martins", username: "kemi-martins", track: "Product Design", followers: 1200, viewerFollowing: true },
  fatima: { name: "Fatima Abubakar", username: "fatima-abubakar", track: "Product Design", followers: 640, viewerFollowing: false },
  david: { name: "David Mensah", username: "david-mensah", track: "Data Analysis", followers: 910, viewerFollowing: false },
  tobi: { name: "Tobi Oladipo", username: "tobi-oladipo", track: "Graphic Design", followers: 310, viewerFollowing: false },
  samuel: { name: "Samuel Owusu", username: "samuel-owusu", track: "Mobile", followers: 270, viewerFollowing: false },
  amara: { name: "Amara Okafor", username: SAMPLE_VIEWER_USERNAME, track: "Frontend", followers: 85, viewerFollowing: false },
  chinedu: { name: "Chinedu Eze", username: "chinedu-eze", track: "Fullstack", followers: 2100, viewerFollowing: false },
  halima: { name: "Halima Musa", username: "halima-musa", track: "Graphic Design", followers: 190, viewerFollowing: false },
  ifeoma: { name: "Ifeoma Nwosu", username: "ifeoma-nwosu", track: "Data Analysis", followers: 420, viewerFollowing: false },
};

const link = (label) => ({ label, url: "https://example.com" });

export const SAMPLE_SHOWCASE_PROJECTS = [
  { id: "afrobeats-concert-tickets", title: "Afrobeats Concert Tickets", category: "Frontend", description: "Ticket booking site with seat selection, promo codes and a QR e-ticket.", source: "Frontend project library", tags: ["Next.js", "Tailwind", "Stripe test mode"], completedAt: daysAgo(15), author: AUTHORS.kemi, likes: 238, appreciations: 64, commentsCount: 31, links: [link("Live"), link("GitHub")], viewerLiked: true, viewerAppreciated: false },
  { id: "ajo-savings-app-ui", title: "Ajo Savings App UI", category: "Product Design", description: "A rotating-savings app for groups of friends, with contribution reminders and a payout calendar.", source: "Product Design project library", tags: ["Figma", "Prototype"], completedAt: daysAgo(18), author: AUTHORS.fatima, likes: 196, appreciations: 51, commentsCount: 22, links: [link("Figma")], viewerLiked: false, viewerAppreciated: false },
  { id: "nigerian-rainfall-trends", title: "Nigerian Rainfall Trends", category: "Data Analysis", description: "Thirty years of rainfall data by state, with a dashboard showing how the rainy season has shifted.", source: "Data Analysis project library", tags: ["Python", "Pandas", "Power BI"], completedAt: daysAgo(21), author: AUTHORS.david, likes: 154, appreciations: 47, commentsCount: 18, links: [link("Report"), link("GitHub")], viewerLiked: false, viewerAppreciated: false },
  { id: "zobo-drinks-brand-identity", title: "Zobo Drinks Brand Identity", category: "Graphic Design", description: "Logo, bottle labels and social templates for a small zobo drinks brand.", source: "Graphic Design project library", tags: ["Illustrator", "Brand guide"], completedAt: daysAgo(24), author: AUTHORS.tobi, likes: 121, appreciations: 39, commentsCount: 9, links: [link("PDF")], viewerLiked: false, viewerAppreciated: false },
  { id: "expense-splitter-roommates", title: "Expense Splitter for Roommates", category: "Mobile", description: "Log shared bills, split them fairly and settle up with a single tap.", source: "Mobile project library", tags: ["React Native", "Firebase"], completedAt: daysAgo(26), author: AUTHORS.samuel, likes: 98, appreciations: 30, commentsCount: 12, links: [link("APK"), link("GitHub")], viewerLiked: false, viewerAppreciated: false },
  { id: "personal-portfolio-amara", title: "Personal Portfolio", category: "Frontend", description: "My first portfolio site with a projects grid, about page and contact form.", source: "Frontend project library", tags: ["HTML", "CSS", "JavaScript"], completedAt: daysAgo(30), author: AUTHORS.amara, likes: 64, appreciations: 12, commentsCount: 7, links: [link("Live"), link("GitHub")], viewerLiked: false, viewerAppreciated: false },
  { id: "lagos-transit-tracker", title: "Lagos Transit Tracker", category: "Frontend", description: "A live bus-route map for Lagos commuters with arrival estimates.", source: "Fullstack project library", tags: ["React", "Leaflet", "Node.js"], completedAt: daysAgo(45), author: AUTHORS.chinedu, likes: 412, appreciations: 120, commentsCount: 56, links: [link("Live"), link("GitHub")], viewerLiked: true, viewerAppreciated: true },
  { id: "market-price-tracker", title: "Market Price Tracker", category: "Data Analysis", description: "Weekly food prices from three Lagos markets, cleaned and charted.", source: "Data Analysis project library", tags: ["Excel", "Power BI"], completedAt: daysAgo(12), author: AUTHORS.ifeoma, likes: 88, appreciations: 28, commentsCount: 6, links: [link("Report")], viewerLiked: false, viewerAppreciated: false },
  { id: "jollof-festival-poster", title: "Jollof Festival Poster Series", category: "Graphic Design", description: "Three posters and an Instagram carousel for a food festival.", source: "Graphic Design project library", tags: ["Photoshop", "Typography"], completedAt: daysAgo(9), author: AUTHORS.halima, likes: 76, appreciations: 25, commentsCount: 5, links: [link("PDF")], viewerLiked: false, viewerAppreciated: false },
  { id: "clinic-queue-app", title: "Clinic Queue App", category: "Mobile", description: "Patients join a clinic queue from their phone and get a text when it's their turn.", source: "Mobile project library", tags: ["Flutter", "Supabase"], completedAt: daysAgo(6), author: AUTHORS.samuel, likes: 57, appreciations: 14, commentsCount: 4, links: [link("APK")], viewerLiked: false, viewerAppreciated: false },
  { id: "bookshop-redesign", title: "Neighbourhood Bookshop Redesign", category: "Product Design", description: "A cleaner shopping and click-and-collect flow for a small bookshop.", source: "Product Design project library", tags: ["Figma", "User testing"], completedAt: daysAgo(4), author: AUTHORS.kemi, likes: 49, appreciations: 18, commentsCount: 3, links: [link("Figma")], viewerLiked: false, viewerAppreciated: false },
  { id: "weather-now", title: "Weather Now", category: "Frontend", description: "A fast weather app with saved cities and a seven-day forecast.", source: "Frontend project library", tags: ["React", "OpenWeather API"], completedAt: daysAgo(2), author: AUTHORS.chinedu, likes: 33, appreciations: 8, commentsCount: 2, links: [link("Live"), link("GitHub")], viewerLiked: false, viewerAppreciated: false },
];

export const SAMPLE_SHOWCASE_COMMENTS = {
  "afrobeats-concert-tickets": [
    { id: "c1", author: { name: "Chinedu Eze", username: "chinedu-eze" }, body: "The seat map is really smooth. How did you handle sold-out seats?", createdAt: daysAgo(2), isCreator: false },
    { id: "c2", author: { name: "Kemi Martins", username: "kemi-martins" }, body: "Thanks! The API returns a status per seat and I disable those buttons.", createdAt: daysAgo(2), isCreator: true },
  ],
};
