// Sample Leaderboard data, used only by the local dev server while the Community API is not
// available (see communityService.js). It mirrors the S22 design and documents the shape the
// backend is expected to return from GET /community/leaderboard.
//
// Entry fields: rank, name, username, category, badge (latest badge name or null),
//   points (for the chosen period), change (places moved since the last period; + up, - down),
//   premium (boolean).

export const LEADERBOARD_CATEGORIES = ["Frontend", "Backend", "Fullstack Development", "Product Design", "Data Analysis", "Digital Marketing", "Mobile Development"];

export const POINT_RULES = [
  { label: "Complete an individual project", points: 50 },
  { label: "Complete a collaboration project", points: 100 },
  { label: "Participate in a hackathon", points: 50 },
  { label: "Win a hackathon", points: 300 },
  { label: "Participate in a competition", points: 50 },
  { label: "Win a competition", points: 500 },
  { label: "Help another student", points: 20 },
  { label: "Approved project showcase", points: 30 },
];

export const SAMPLE_VIEWER_LEADER = { name: "Amara Okafor", username: "amara-okafor", category: "Frontend", badge: "First Project", points: 1240, change: 3, premium: false };

const NAMED = [
  { name: "Chinedu Eze", username: "chinedu-eze", category: "Fullstack Development", badge: "Hackathon Champion", points: 4860, change: 0, premium: true },
  { name: "Kemi Martins", username: "kemi-martins", category: "Product Design", badge: "Project Master", points: 4215, change: 1, premium: true },
  { name: "David Mensah", username: "david-mensah", category: "Data Analysis", badge: "Competition Winner", points: 3990, change: -1, premium: false },
  { name: "Ifeoma Nwosu", username: "ifeoma-nwosu", category: "Frontend", badge: "Project Master", points: 3620, change: 2, premium: false },
  { name: "Samuel Owusu", username: "samuel-owusu", category: "Backend", badge: "Hackathon Champion", points: 3410, change: -1, premium: false },
  { name: "Halima Musa", username: "halima-musa", category: "Product Design", badge: "Team Player", points: 3180, change: 1, premium: true },
  { name: "Tobi Adewale", username: "tobi-adewale", category: "Frontend", badge: "Community Helper", points: 2950, change: 0, premium: false },
  { name: "Grace Adeyemi", username: "grace-adeyemi", category: "Digital Marketing", badge: "Competition Winner", points: 2790, change: 2, premium: false },
  { name: "Yusuf Kamara", username: "yusuf-kamara", category: "Mobile Development", badge: "Rising Developer", points: 2640, change: -2, premium: false },
  { name: "Zainab Bello", username: "zainab-bello", category: "Data Analysis", badge: "First Project", points: 2515, change: 1, premium: false },
];

const FIRST = ["Bola", "Emeka", "Ngozi", "Kwame", "Aisha", "Tunde", "Chioma", "Kofi", "Fola", "Musa", "Ama", "Seun", "Ada", "Ibrahim", "Efua", "Dayo", "Uche", "Nana", "Lola", "Femi", "Akua", "Obi", "Sade", "Yaw", "Rita", "Jide", "Esi", "Kunle", "Mariam", "Tayo"];
const LAST = ["Adebayo", "Okeke", "Mensah", "Bello", "Owusu", "Nwachukwu", "Danjuma", "Asante", "Ogunleye", "Abdullahi"];
const BADGES = ["First Project", "Rising Developer", "Team Player", "Community Helper", null];

// Members ranked 11 onwards, with points falling steadily below the top ten.
const GENERATED = FIRST.map((first, index) => {
  const last = LAST[index % LAST.length];
  return {
    name: `${first} ${last}`,
    username: `${first}-${last}`.toLowerCase(),
    category: LEADERBOARD_CATEGORIES[index % LEADERBOARD_CATEGORIES.length],
    badge: BADGES[index % BADGES.length],
    // Seven members between the top ten and the viewer, so the viewer ranks 18th.
    points: index < 7 ? 2400 - index * 150 : 1200 - (index - 7) * 35,
    change: [1, -1, 0, 2, -2, 0][index % 6],
    premium: index % 7 === 3,
  };
});

// Everyone, best first; the viewer lands at rank 18 overall for the month.
export const SAMPLE_LEADERBOARD = [...NAMED, ...GENERATED, SAMPLE_VIEWER_LEADER].sort((a, b) => b.points - a.points);
