export const ROUTES = {
  home: "/",
  signIn: "/login",
  register: "/register",
  verify: "/verify-email",
  forgotPassword: "/forgot-password",

  // Other public pages worth checking
  publicExtra: ["/about", "/contact", "/programs", "/video-courses"],

  student: [
    "/dashboard",
    "/my-learning",
    "/free-learning",
    "/my-applications",
    "/my-submissions",
    "/my-results",
    "/notifications",
    "/profile",
  ],

  admin: [
    "/admin",
    "/admin/users",
    "/admin/programs",
    "/admin/learning",
    "/admin/submissions",
    "/admin/applications",
    "/admin/reports",
  ],
};
