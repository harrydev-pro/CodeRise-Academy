// Only real API calls, not source files like /src/services/api/client.js
const API = /^https?:\/\/[^/]+\/api\//;
const API_CSRF = /^https?:\/\/[^/]+\/api\/auth\/csrf(\?.*)?$/;
const API_ME = /^https?:\/\/[^/]+\/api\/auth\/me(\?.*)?$/;
const API_DASHBOARD = /^https?:\/\/[^/]+\/api\/learning\/dashboard/;
const API_APPLICATIONS = /^https?:\/\/[^/]+\/api\/applications\/me/;
const API_VIDEOS = /^https?:\/\/[^/]+\/api\/video\/my-courses/;
const API_UNREAD = /^https?:\/\/[^/]+\/api\/notifications\/unread-count/;

const A_OVERVIEW = /^https?:\/\/[^/]+\/api\/admin\/analytics\/overview/;
const A_TRENDS = /^https?:\/\/[^/]+\/api\/admin\/analytics\/trends/;
const A_USERS = /^https?:\/\/[^/]+\/api\/admin\/users(\?.*)?$/;
const A_SUBMISSIONS = /^https?:\/\/[^/]+\/api\/admin\/submissions(\?.*)?$/;
const A_APPLICATIONS = /^https?:\/\/[^/]+\/api\/admin\/applications(\?.*)?$/;
const A_PROGRAMS_ARCHIVED =
  /^https?:\/\/[^/]+\/api\/admin\/programs\?includeArchived=true/;
const A_REPORTS_LIST = /^https?:\/\/[^/]+\/api\/admin\/reports(\?.*)?$/;
const A_REPORT = /^https?:\/\/[^/]+\/api\/admin\/reports\/[^?]+/;

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

// ---- Admin data ----
const overview = {
  totalUsers: 120,
  activeUsers: 45,
  totalStudents: 110,
  studentsCurrentlyLearning: 30,
  totalTracks: 4,
  totalQuizAttempts: 200,
  totalQuestions: 80,
  totalQuizSubmissions: 150,
  totalProjectSubmissions: 60,
  pendingSubmissions: 5,
  totalApplications: 25,
  pendingApplications: 4,
  approvedApplications: 15,
  totalVideoCourses: 3,
  totalEnrollments: 40,
  pendingAccessRequests: 2,
};

// Charts get empty lists. Chart accessibility needs a separate populated check.
const trends = {
  registrations: [],
  activeUsers: [],
  applications: [],
  submissions: [],
  quizAttempts: [],
  popularTracks: [],
  quizPerformance: [],
  applicationsByProgram: [],
};

const pagination = {
  page: 1,
  pageSize: 20,
  total: 1,
  totalPages: 1,
  totalItems: 1,
};

const adminUsers = {
  users: [
    {
      id: 2,
      name: "Ada Student",
      email: "ada@example.com",
      phone: "08011111111",
      registeredAt: "2026-11-01T10:00:00Z",
      status: "active",
      role: "student",
      activeTracks: 1,
      quizAttempts: 2,
      projectSubmissions: 1,
      applications: 1,
    },
  ],
  pagination,
};

const adminSubmissions = {
  submissions: [
    {
      id: 11,
      status: "Submitted",
      score: null,
      feedback: "",
      description: "A responsive landing page.",
      createdAt: "2026-11-10T09:00:00Z",
      reviewedAt: null,
      reviewedBy: null,
      liveUrl: "https://example.com",
      githubUrl: "https://github.com/example/repo",
      figmaUrl: null,
      attachment: null,
      project: {
        id: 1,
        title: "Landing page",
        trackTitle: "HTML & CSS Basics",
        maxScore: 100,
      },
      student: { id: 2, name: "Ada Student", email: "ada@example.com" },
    },
  ],
  pagination,
};

const adminApplications = {
  applications: [
    {
      id: "APP-001",
      fullName: "Ada Student",
      studentName: "Ada Student",
      userId: 2,
      programTitle: "Frontend Bootcamp",
      status: "Pending",
      submittedAt: "2026-11-05T12:00:00Z",
    },
  ],
  statusCounts: { Pending: 1 },
  pagination,
};

const adminPrograms = [{ id: 1, title: "Frontend Bootcamp" }];
const reportsList = [{ id: "registrations", title: "Registrations" }];
const report = {
  columns: ["Name", "Email", "Registered"],
  rows: [["Ada Student", "ada@example.com", "2026-11-01T10:00:00Z"]],
  truncated: false,
};

const json = (route, body, status = 200) =>
  route.fulfill({
    status,
    contentType: "application/json",
    body: JSON.stringify(body),
  });

// Puts the value where requestData(endpoint, key) might look for it (student pages).
const wrap = (key, value) => ({ [key]: value, data: { [key]: value } });

export async function mockApi(page, { role = null } = {}) {
  // Catch-all first (the last registered matching route wins).
  await page.route(API, (route) => json(route, { data: {} }));

  await page.route(API_CSRF, (route) =>
    json(route, { csrfToken: "test-csrf-token" }),
  );
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

  // Admin
  await page.route(A_OVERVIEW, (route) => json(route, { data: { overview } }));
  await page.route(A_TRENDS, (route) => json(route, { data: { trends } }));
  await page.route(A_USERS, (route) => json(route, { data: adminUsers }));
  await page.route(A_SUBMISSIONS, (route) =>
    json(route, { data: adminSubmissions }),
  );
  await page.route(A_APPLICATIONS, (route) =>
    json(route, { data: adminApplications }),
  );
  await page.route(A_PROGRAMS_ARCHIVED, (route) =>
    json(route, { data: { programs: adminPrograms } }),
  );
  await page.route(A_REPORTS_LIST, (route) =>
    json(route, { data: { reports: reportsList } }),
  );
  await page.route(A_REPORT, (route) => json(route, { data: { report } }));

  await page.route(API_ME, (route) => {
    if (route.request().method() !== "GET") return route.fallback();
    if (!role) return json(route, { message: "Not authenticated" }, 401);
    return json(route, { data: { user: user(role) } });
  });
}

export async function loginAs(page, role) {
  await mockApi(page, { role });
}
