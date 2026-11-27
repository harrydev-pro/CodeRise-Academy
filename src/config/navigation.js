import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  FileText,
  ClipboardCheck,
  UserRound,
  Bell,
  Video,
  Users,
  PlayCircle,
  Trophy,
  FolderKanban,
  BarChart3,
  History,
  CreditCard,
  UsersRound,
} from "lucide-react";

export const publicNavigation = [
  {
    label: "Home",
    path: "/",
  },
  {
    label: "About",
    path: "/about",
  },
  {
    label: "Programs",
    path: "/programs",
  },
  {
    label: "Video Courses",
    path: "/video-courses",
  },
  {
    label: "Contact",
    path: "/contact",
  },
];

export const studentNavigation = [
  {
    label: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Free Learning",
    path: "/free-learning",
    icon: BookOpen,
  },
  {
    label: "My Learning",
    path: "/my-learning",
    icon: GraduationCap,
  },
  {
    label: "Video Courses",
    path: "/video-courses",
    icon: Video,
  },
  {
    label: "My Video Courses",
    path: "/my-video-courses",
    icon: PlayCircle,
  },
  {
    label: "Applications",
    path: "/my-applications",
    icon: FileText,
  },
  {
    label: "My Projects",
    path: "/my-submissions",
    icon: ClipboardCheck,
  },
  {
    label: "Community",
    path: "/community",
    icon: UsersRound,
    badge: "New",
  },
  {
    label: "Quiz History",
    path: "/my-results",
    icon: Trophy,
  },
  {
    label: "Notifications",
    path: "/notifications",
    icon: Bell,
  },
  {
    label: "Profile",
    path: "/profile",
    icon: UserRound,
  },
];

// Tab bar shown on every /community screen (see layouts/CommunityLayout.jsx).
export const communityTabs = [
  { label: "Home", path: "/community" },
  { label: "Projects", path: "/community/projects" },
  { label: "Collaborate", path: "/community/collaborate" },
  { label: "Hackathons", path: "/community/hackathons" },
  { label: "Competitions", path: "/community/competitions" },
  { label: "Showcase", path: "/community/showcase" },
  { label: "Leaderboard", path: "/community/leaderboard" },
  { label: "Announcements", path: "/community/announcements" },
  { label: "My Activities", path: "/community/activities" },
];

// The admin sidebar's "Community" group (A01–A27). Text-only links, as in the design.
export const adminCommunityNavigation = [
  { label: "Overview", path: "/admin/community" },
  { label: "Analytics", path: "/admin/community/analytics" },
  { label: "Projects", path: "/admin/community/projects" },
  { label: "Collaborations", path: "/admin/community/collaborations" },
  { label: "Teams", path: "/admin/community/teams" },
  { label: "Hackathons", path: "/admin/community/hackathons" },
  { label: "Competitions", path: "/admin/community/competitions" },
  { label: "Payments", path: "/admin/community/payments" },
  { label: "Submissions & reviews", path: "/admin/community/submissions" },
  { label: "Announcements", path: "/admin/community/announcements" },
  { label: "Members", path: "/admin/community/members" },
  { label: "Premium plans", path: "/admin/community/premium" },
  { label: "Subscriptions", path: "/admin/community/subscriptions" },
  { label: "Badges", path: "/admin/community/badges" },
  { label: "Points", path: "/admin/community/points" },
  { label: "Reports & moderation", path: "/admin/community/moderation" },
  { label: "Settings", path: "/admin/community/settings" },
];

export const adminNavigation = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Applications", path: "/admin/applications", icon: FileText },
  { label: "Payments", path: "/admin/payments", icon: CreditCard },
  { label: "Programs", path: "/admin/programs", icon: GraduationCap },
  { label: "Learning tracks", path: "/admin/learning", icon: BookOpen },
  { label: "Projects", path: "/admin/projects", icon: FolderKanban },
  { label: "Submissions", path: "/admin/submissions", icon: ClipboardCheck },
  { label: "Video courses", path: "/admin/video-courses", icon: Video },
  { label: "Reports", path: "/admin/reports", icon: BarChart3 },
  { label: "Activity log", path: "/admin/activity", icon: History },
  { label: "Notifications", path: "/admin/notifications", icon: Bell },
];
