// Sample Project Library data, used only by the local dev server while the Community API
// is not available (see communityService.js). It mirrors the S02 design and documents the
// project shape the backend is expected to return from GET /community/projects.
//
// Project fields:
//   slug, title, category, description, level ("Beginner" | "Intermediate" | "Advanced" | "Professional"),
//   duration (display text), access ("free" | "premium"), started (number of students),
//   addedAt (ISO date), isNew (boolean),
//   previewAvailable (premium only; false = free users cannot open a preview at all).

export const PROJECT_CATEGORIES = [
  "Frontend Development",
  "Backend Development",
  "Fullstack Development",
  "Product Design (UI/UX)",
  "Graphic Design",
  "Data Analysis",
  "Mobile App Development",
  "Virtual Assistance",
  "Game Development",
  "Cybersecurity",
  "Digital Marketing",
  "AI & Machine Learning",
];

export const PREMIUM_FROM_PRICE = "$9.99/mo";

export const SAMPLE_COMMUNITY_PROJECTS = [
  { slug: "restaurant-landing-page", title: "Restaurant Landing Page", category: "Frontend Development", description: "A responsive one-page site with menu, opening hours and a reservation form.", level: "Beginner", duration: "5 days", access: "free", started: 412, addedAt: "2026-06-02" },
  { slug: "authentication-rest-api", title: "Authentication REST API", category: "Backend Development", description: "Sign-up, login, JWT refresh and password reset with Node.js and PostgreSQL.", level: "Intermediate", duration: "10 days", access: "free", started: 238, addedAt: "2026-06-10" },
  { slug: "mobile-banking-app-ui", title: "Mobile Banking App UI", category: "Product Design (UI/UX)", description: "Onboarding, account overview and transfer flows with a reusable component set.", level: "Intermediate", duration: "2 weeks", access: "premium", started: 187, addedAt: "2026-07-01" },
  { slug: "sales-performance-dashboard", title: "Sales Performance Dashboard", category: "Data Analysis", description: "Clean a year of store sales data and present monthly trends and top products.", level: "Beginner", duration: "1 week", access: "free", started: 301, addedAt: "2026-07-14" },
  { slug: "coffee-shop-brand-identity", title: "Coffee Shop Brand Identity", category: "Graphic Design", description: "Logo, colour palette, type system and packaging mock-ups for a local café.", level: "Advanced", duration: "2 weeks", access: "premium", started: 96, addedAt: "2026-08-03" },
  { slug: "executive-inbox-calendar-setup", title: "Executive Inbox & Calendar Setup", category: "Virtual Assistance", description: "Organise a sample inbox with labels and filters, then plan a week of meetings.", level: "Beginner", duration: "3 days", access: "free", started: 154, addedAt: "2026-08-20" },
  { slug: "expense-tracker-app", title: "Expense Tracker App", category: "Mobile App Development", description: "A React Native app to log spending, set budgets and view weekly summaries.", level: "Intermediate", duration: "2 weeks", access: "free", started: 42, addedAt: "2026-11-15", isNew: true },
  { slug: "ecommerce-storefront", title: "E-commerce Storefront", category: "Fullstack Development", description: "Product catalogue, cart, checkout with test payments and an admin order view.", level: "Professional", duration: "4 weeks", access: "premium", started: 73, addedAt: "2026-09-05" },
  { slug: "2d-platformer-level", title: "2D Platformer Level", category: "Game Development", description: "Design and build one playable level with checkpoints, enemies and a boss.", level: "Advanced", duration: "3 weeks", access: "premium", started: 38, addedAt: "2026-09-18", previewAvailable: false },
  { slug: "portfolio-website", title: "Personal Portfolio Website", category: "Frontend Development", description: "A fast, accessible portfolio with a projects grid, about page and contact form.", level: "Beginner", duration: "4 days", access: "free", started: 520, addedAt: "2026-05-12" },
  { slug: "weather-app-api", title: "Weather App with a Public API", category: "Frontend Development", description: "Fetch live forecasts, handle loading and errors, and save favourite cities.", level: "Intermediate", duration: "1 week", access: "free", started: 266, addedAt: "2026-10-02" },
  { slug: "task-manager-api", title: "Task Manager API", category: "Backend Development", description: "CRUD endpoints, validation, pagination and tests for a team task board.", level: "Intermediate", duration: "1 week", access: "free", started: 133, addedAt: "2026-10-21", isNew: true },
  { slug: "realtime-chat-app", title: "Real-time Chat App", category: "Fullstack Development", description: "Rooms, typing indicators and message history with WebSockets and MongoDB.", level: "Advanced", duration: "3 weeks", access: "premium", started: 88, addedAt: "2026-10-30" },
  { slug: "food-delivery-app-redesign", title: "Food Delivery App Redesign", category: "Product Design (UI/UX)", description: "Research pain points, redesign the ordering flow and test it with five users.", level: "Advanced", duration: "3 weeks", access: "premium", started: 64, addedAt: "2026-11-08", isNew: true },
  { slug: "event-poster-series", title: "Event Poster Series", category: "Graphic Design", description: "Three matching posters for a tech meetup in print and social sizes.", level: "Beginner", duration: "4 days", access: "free", started: 140, addedAt: "2026-06-25" },
  { slug: "customer-churn-analysis", title: "Customer Churn Analysis", category: "Data Analysis", description: "Explore subscription data, find churn drivers and present recommendations.", level: "Advanced", duration: "2 weeks", access: "premium", started: 57, addedAt: "2026-09-29" },
  { slug: "habit-tracker-app", title: "Habit Tracker App", category: "Mobile App Development", description: "Daily check-ins, streaks and reminders with local notifications.", level: "Beginner", duration: "1 week", access: "free", started: 98, addedAt: "2026-08-11" },
  { slug: "social-media-content-calendar", title: "Social Media Content Calendar", category: "Virtual Assistance", description: "Plan a month of posts for a small business and schedule them in a free tool.", level: "Intermediate", duration: "5 days", access: "free", started: 77, addedAt: "2026-09-09" },
  { slug: "quiz-game", title: "Browser Quiz Game", category: "Game Development", description: "A timed quiz game with levels, a score board and sound effects.", level: "Beginner", duration: "5 days", access: "free", started: 112, addedAt: "2026-07-22" },
  { slug: "web-app-security-audit", title: "Web App Security Audit", category: "Cybersecurity", description: "Audit a deliberately vulnerable app against the OWASP Top 10 and write a report.", level: "Professional", duration: "3 weeks", access: "premium", started: 31, addedAt: "2026-10-12" },
  { slug: "product-launch-campaign", title: "Product Launch Campaign", category: "Digital Marketing", description: "Plan a launch with audience research, ad copy, a landing page and a budget.", level: "Intermediate", duration: "2 weeks", access: "free", started: 59, addedAt: "2026-08-28" },
  { slug: "support-ticket-classifier", title: "Support Ticket Classifier", category: "AI & Machine Learning", description: "Train a model to sort support tickets by topic and measure its accuracy.", level: "Advanced", duration: "3 weeks", access: "premium", started: 45, addedAt: "2026-11-02", isNew: true },
];
