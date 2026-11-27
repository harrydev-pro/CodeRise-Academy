// Sample Competition Listing data, used only by the local dev server while the Community API
// is not available (see communityService.js). It mirrors the S15 design and documents the
// shape the backend is expected to return from GET /community/competitions.
//
// Competition fields:
//   id, number (Competition #n), title, category, prize (display text),
//   entryFeeUsd (0 = free entry; all prices in USD),
//   status ("open" | "closing_soon" | "closed" | "results"),
//   registrationClosesAt, submissionDeadline (ISO dates),
//   participants, capacity, viewerRegistered (boolean).
// The backend sets the status from server time; "closing_soon" is its call too.

// Dates relative to now so the sample always makes sense. watHour is West Africa Time (UTC+1).
function at(daysFromNow, watHour = 23, minute = 59) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromNow);
  date.setUTCHours(watHour - 1, minute, 0, 0);
  return date.toISOString();
}

export const SAMPLE_COMMUNITY_COMPETITIONS = [
  { id: "best-landing-page-2026", number: 3, title: "Best Landing Page Design 2026", category: "Product Design (UI/UX)", prize: "$150 cash + certificate + 1 month Premium", entryFeeUsd: 0, status: "open", registrationClosesAt: at(3), submissionDeadline: at(10), participants: 164, capacity: 250, viewerRegistered: true },
  { id: "best-mobile-application", number: 4, title: "Best Mobile Application", category: "Mobile App Development", prize: "$300 cash + 3 months Premium Plus", entryFeeUsd: 5, status: "open", registrationClosesAt: at(15), submissionDeadline: at(23), participants: 58, capacity: 150, viewerRegistered: false },
  { id: "best-fullstack-project", number: 5, title: "Best Fullstack Project", category: "Fullstack Development", prize: "$500 cash + featured portfolio placement", entryFeeUsd: 10, status: "closing_soon", registrationClosesAt: at(1), submissionDeadline: at(9), participants: 92, capacity: 100, viewerRegistered: false },
  { id: "best-digital-marketing-campaign", number: 6, title: "Best Digital Marketing Campaign", category: "Digital Marketing", prize: "$200 cash + certificate", entryFeeUsd: 5, status: "open", registrationClosesAt: at(18), submissionDeadline: at(39), participants: 21, capacity: 120, viewerRegistered: false },
  { id: "best-graphic-design-local-cafe", number: 2, title: "Best Graphic Design: Brand for a Local Café", category: "Graphic Design", prize: "$100 cash + certificate", entryFeeUsd: 0, status: "results", registrationClosesAt: at(-48), submissionDeadline: at(-34), participants: 211, capacity: 250, viewerRegistered: false },
  { id: "best-virtual-assistant-portfolio", number: 1, title: "Best Virtual Assistant Portfolio", category: "Virtual Assistance", prize: "$100 cash + certificate", entryFeeUsd: 0, status: "results", registrationClosesAt: at(-76), submissionDeadline: at(-62), participants: 138, capacity: 200, viewerRegistered: false },
];
