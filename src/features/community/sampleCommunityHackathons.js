// Sample Hackathon Listing data, used only by the local dev server while the Community API is
// not available (see communityService.js). It mirrors the S11 design and documents the shape
// the backend is expected to return from GET /community/hackathons.
//
// Hackathon fields:
//   id, title, description, category (banner tag), format ("Teams of 2–3" | "Individual"),
//   access ("free" | "premium"), status ("upcoming" | "live" | "past"),
//   registrationOpen (boolean), registrationClosesAt, startsAt, endsAt (ISO dates),
//   registeredCount, prize (display text), viewerRegistered (boolean),
//   winner (past only: display text, or null until results are published).

// Dates are relative to now so the sample countdowns always make sense.
// watHour is the hour in West Africa Time (UTC+1).
function at(daysFromNow, watHour, minute = 0) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + daysFromNow);
  date.setUTCHours(watHour - 1, minute, 0, 0);
  return date.toISOString();
}
const HOUR = 60 * 60 * 1000;
const plus24h = (iso) => new Date(new Date(iso).getTime() + 24 * HOUR).toISOString();

const fintechStart = at(9, 10);
const clinicStart = at(23, 9);
const liveStart = new Date(Date.now() - 9 * HOUR).toISOString();

export const SAMPLE_COMMUNITY_HACKATHONS = [
  { id: "fintech-for-students", title: "FinTech for Students Hackathon", description: "Build a tool that helps students budget, save or split shared costs. Any stack, any platform — it just has to work.", category: "FinTech", format: "Teams of 2–3", access: "free", status: "upcoming", registrationOpen: true, registrationClosesAt: at(8, 23, 59), startsAt: fintechStart, endsAt: plus24h(fintechStart), registeredCount: 212, prize: "1 month Premium", viewerRegistered: false },
  { id: "health-clinic-booking-redesign", title: "Redesign a Health Clinic Booking App", description: "Research, wireframe and prototype a booking flow patients over 50 can use without help.", category: "Product Design", format: "Individual", access: "premium", status: "upcoming", registrationOpen: true, registrationClosesAt: at(22, 23, 59), startsAt: clinicStart, endsAt: plus24h(clinicStart), registeredCount: 74, prize: "1 month Premium", viewerRegistered: false },
  { id: "build-for-small-businesses", title: "Build for Small Businesses", description: "Ship a tool that saves a local shop owner an hour a week: stock, bookings, invoices or reviews.", category: "Web Development", format: "Teams of 2–3", access: "free", status: "live", registrationOpen: false, registrationClosesAt: liveStart, startsAt: liveStart, endsAt: plus24h(liveStart), registeredCount: 186, prize: "1 month Premium", viewerRegistered: true },
  { id: "climate-data-challenge", title: "Climate Data Challenge", description: "Turn open rainfall and temperature data into a dashboard that helps farmers plan planting.", category: "Data Analysis", format: "Teams of 2–3", access: "free", status: "past", registrationOpen: false, registrationClosesAt: at(-20, 9), startsAt: at(-19, 10), endsAt: at(-18, 10), registeredCount: 164, prize: "1 month Premium", viewerRegistered: true, winner: "Team Harmattan" },
  { id: "ai-study-tools", title: "AI Study Tools Sprint", description: "Build an assistant that turns lecture notes into flashcards and practice questions.", category: "AI & Machine Learning", format: "Individual", access: "premium", status: "past", registrationOpen: false, registrationClosesAt: at(-34, 9), startsAt: at(-33, 10), endsAt: at(-32, 10), registeredCount: 98, prize: "1 month Premium", viewerRegistered: false, winner: "Ifeoma Nwosu" },
  { id: "campus-life-apps", title: "Campus Life Apps", description: "Make student life easier: timetables, hostel maintenance requests or campus maps.", category: "Mobile Development", format: "Teams of 2–3", access: "free", status: "past", registrationOpen: false, registrationClosesAt: at(-48, 9), startsAt: at(-47, 10), endsAt: at(-46, 10), registeredCount: 231, prize: "1 month Premium", viewerRegistered: false, winner: "Team Lagoon" },
  { id: "accessible-web-weekend", title: "Accessible Web Weekend", description: "Fix the accessibility of a real nonprofit website and document every change.", category: "Web Development", format: "Individual", access: "free", status: "past", registrationOpen: false, registrationClosesAt: at(-62, 9), startsAt: at(-61, 10), endsAt: at(-60, 10), registeredCount: 120, prize: "1 month Premium", viewerRegistered: false, winner: "Samuel Okoro" },
  { id: "brand-in-a-day", title: "Brand in a Day", description: "Create a full brand identity for a new juice bar, from logo to social templates.", category: "Graphic Design", format: "Individual", access: "free", status: "past", registrationOpen: false, registrationClosesAt: at(-76, 9), startsAt: at(-75, 10), endsAt: at(-74, 10), registeredCount: 143, prize: "1 month Premium", viewerRegistered: false, winner: "Halima Musa" },
  { id: "health-tech-hack", title: "HealthTech Hack", description: "Help a community clinic track appointments and remind patients by SMS.", category: "Health", format: "Teams of 2–3", access: "premium", status: "past", registrationOpen: false, registrationClosesAt: at(-90, 9), startsAt: at(-89, 10), endsAt: at(-88, 10), registeredCount: 87, prize: "1 month Premium", viewerRegistered: false, winner: null },
];
