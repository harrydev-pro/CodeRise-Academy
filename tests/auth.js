// Only real API calls, not source files like /src/services/api/client.js
const API = /^https?:\/\/[^/]+\/api\//;
const API_ME = /^https?:\/\/[^/]+\/api\/auth\/me(\?.*)?$/;
const API_DASHBOARD = /^https?:\/\/[^/]+\/api\/learning\/dashboard/;
const API_APPLICATIONS = /^https?:\/\/[^/]+\/api\/applications\/me/;
const API_VIDEOS = /^https?:\/\/[^/]+\/api\/video\/my-courses/;
const API_UNREAD = /^https?:\/\/[^/]+\/api\/notifications\/unread-count/;

function user(role) {
  return {
    id: 1,
    name: "Test User",
    fullName: "Test User",
    email: "test@example.com",
    phone_number: "08000000000",
    role,
    is_verified: true,
  };
}

const dashboard = {
  tracks: [
    {
      id: 1,
      title: "HTML & CSS Basics",
      completedTopics: 2,
      totalTopics: 10,
      percentage: 20,
      currentLevel: "Beginner",
      nextTopic: { id: 3, title: "Flexbox" },
    },
  ],
  overallProgress: 20,
  totalTracks: 1,
  activeTracks: 1,
  completedTopics: 2,
  totalTopics: 10,
  quizzesAttempted: 1,
  averageQuizScore: 80,
  projectsCompleted: 0,
  pendingSubmissions: 0,
  submissionsNeedingCorrections: 0,
  videoCoursesEnrolled: 1,
};

const applications = [
  { id: "APP-001", programTitle: "Frontend Bootcamp", status: "Pending" },
];

const videoCourses = [
  {
    course: { id: 1, title: "Intro to JavaScript" },
    progress: { completedLessons: 1, totalLessons: 8, percentage: 12 },
    enrollment: { status: "active" },
    continueLessonId: 2,
  },
];

const json = (route, body, status = 200) =>
  route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });

// Puts the value where requestData(endpoint, key) might look for it.
const wrap = (key, value) => ({ [key]: value, data: { [key]: value } });

export async function mockApi(page, { role = null } = {}) {
  // Catch-all first (the last registered matching route wins).
  // Keys are missing, so pages fall back to their empty defaults.
  await page.route(API, (route) => json(route, { data: {} }));

  await page.route(API_UNREAD, (route) =>
    json(route, { count: 0, data: { count: 0 } }),
  );
  await page.route(API_DASHBOARD, (route) =>
    json(route, wrap("dashboard", dashboard)),
  );
  await page.route(API_APPLICATIONS, (route) =>
    json(route, wrap("applications", applications)),
  );
  await page.route(API_VIDEOS, (route) =>
    json(route, wrap("courses", videoCourses)),
  );

  await page.route(API_ME, (route) => {
    if (route.request().method() !== "GET") return route.fallback();
    if (!role) return json(route, { message: "Not authenticated" }, 401);
    return json(route, { data: { user: user(role) } });
  });
}

export async function loginAs(page, role) {
  await mockApi(page, { role });
}
