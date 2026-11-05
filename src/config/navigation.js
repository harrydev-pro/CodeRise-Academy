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

export const adminNavigation = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard },
  { label: "Users", path: "/admin/users", icon: Users },
  { label: "Applications", path: "/admin/applications", icon: FileText },
  { label: "Programs", path: "/admin/programs", icon: GraduationCap },
  { label: "Learning tracks", path: "/admin/learning", icon: BookOpen },
  { label: "Projects", path: "/admin/projects", icon: FolderKanban },
  { label: "Submissions", path: "/admin/submissions", icon: ClipboardCheck },
  { label: "Video courses", path: "/admin/video-courses", icon: Video },
  { label: "Reports", path: "/admin/reports", icon: BarChart3 },
  { label: "Activity log", path: "/admin/activity", icon: History },
  { label: "Notifications", path: "/admin/notifications", icon: Bell },
];
