import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  FileText,
  ClipboardCheck,
  ShoppingBag,
  UserRound,
  Bell,
  Users,
  Activity,
  Video,
  CircleDollarSign,
  Settings,
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
    label: "Contact",
    path: "/contact",
  },
];

export const studentNavigation = [
  {
    label: "Dashboard",
    path: "/student/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Free Learning",
    path: "/free-learning",
    icon: BookOpen,
  },
  {
    label: "My Learning",
    path: "/student/learning",
    icon: GraduationCap,
  },
  {
    label: "Video Courses",
    path: "/video-courses",
    icon: Video,
  },
  {
    label: "Applications",
    path: "/student/applications",
    icon: FileText,
  },
  {
    label: "My Submissions",
    path: "/student/submissions",
    icon: ClipboardCheck,
  },
  {
    label: "My Results",
    path: "/student/results",
    icon: GraduationCap,
  },
  {
    label: "My Purchases",
    path: "/student/purchases",
    icon: ShoppingBag,
  },
  {
    label: "Notifications",
    path: "/student/notifications",
    icon: Bell,
  },
  {
    label: "Profile",
    path: "/student/profile",
    icon: UserRound,
  },
];

export const adminNavigation = [
  {
    label: "Overview",
    path: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Users",
    path: "/admin/users",
    icon: Users,
  },
  {
    label: "Activity Logs",
    path: "/admin/activity",
    icon: Activity,
  },
  {
    label: "Courses",
    path: "/admin/courses",
    icon: BookOpen,
  },
  {
    label: "Lessons",
    path: "/admin/lessons",
    icon: GraduationCap,
  },
  {
    label: "Video Management",
    path: "/admin/videos",
    icon: Video,
  },
  {
    label: "Programs",
    path: "/admin/programs",
    icon: FileText,
  },
  {
    label: "Pricing",
    path: "/admin/pricing",
    icon: CircleDollarSign,
  },
  {
    label: "Quiz Management",
    path: "/admin/quizzes",
    icon: ClipboardCheck,
  },
  {
    label: "Submissions",
    path: "/admin/submissions",
    icon: FileText,
  },
  {
    label: "Applications",
    path: "/admin/applications",
    icon: Users,
  },
  {
    label: "Settings",
    path: "/admin/settings",
    icon: Settings,
  },
];