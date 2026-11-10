import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import AuthLayout from "../layouts/AuthLayout";
import StudentLayout from "../layouts/StudentLayout";
import AdminLayout from "../layouts/AdminLayout";

import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";
import Programs from "../pages/public/Programs";
import ProgramDetails from "../pages/public/ProgramDetails";
import NotFound from "../pages/public/NotFound";

import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import VerifyEmail from "../pages/auth/VerifyEmail";
import ForgotPassword from "../pages/auth/ForgetPassword";
import ResetPassword from "../pages/auth/ResetPassword";

import Dashboard from "../pages/student/Dashboard";
import Profile from "../pages/student/Profile";
import MyLearning from "../pages/student/MyLearning";
import MyApplications from "../pages/student/MyApplications";
import MySubmissions from "../pages/student/MySubmissions";
import MyResults from "../pages/student/MyResults";
import Notifications from "../pages/student/Notifications";
import MyVideoCourses from "../pages/student/MyVideoCourses";

import FreeLearning from "../pages/free-learning/FreeLearning";
import TrackDetails from "../pages/free-learning/TrackDetails";
import LessonDetails from "../pages/free-learning/LessonDetails";
import QuizPage from "../pages/free-learning/QuizPage";
import QuizResults from "../pages/free-learning/QuizResults";
import ProjectDetails from "../pages/free-learning/ProjectDetails";
import ProjectBrief from "../pages/free-learning/ProjectBrief";
import ProjectSubmission from "../pages/free-learning/ProjectSubmissions";

import VideoCourseCatalog from "../pages/video-courses/VideoCourseCatalog";
import VideoCourseDetails from "../pages/video-courses/VideoCourseDetails";
import VideoLessonPlayer from "../pages/video-courses/VideoLessonPlayer";

import ApplicationForm from "../pages/applications/ApplicationForm";
import ApplicationConfirmation from "../pages/applications/ApplicationConfirmation";
// The admin dashboard is loaded only when an administrator opens it, so students never
// download it (App.jsx shows a loader while a page loads).
const AdminOverview = lazy(() => import("../pages/admin/AdminOverview"));
const AdminUsers = lazy(() => import("../pages/admin/AdminUsers"));
const AdminUserDetail = lazy(() => import("../pages/admin/AdminUserDetail"));
const AdminPrograms = lazy(() => import("../pages/admin/AdminPrograms"));
const AdminProgramEditor = lazy(() => import("../pages/admin/AdminProgramEditor"));
const AdminLearning = lazy(() => import("../pages/admin/AdminLearning"));
const AdminTrackEditor = lazy(() => import("../pages/admin/AdminTrackEditor"));
const AdminTopicEditor = lazy(() => import("../pages/admin/AdminTopicEditor"));
const AdminProjects = lazy(() => import("../pages/admin/AdminProjects"));
const AdminProjectEditor = lazy(() => import("../pages/admin/AdminProjectEditor"));
const ReviewSubmissions = lazy(() => import("../pages/admin/ReviewSubmissions"));
const AdminVideoCourses = lazy(() => import("../pages/admin/AdminVideoCourses"));
const AdminVideoCourseEditor = lazy(() => import("../pages/admin/AdminVideoCourseEditor"));
const ReviewApplications = lazy(() => import("../pages/admin/ReviewApplications"));
const AdminReports = lazy(() => import("../pages/admin/AdminReports"));
const AdminActivity = lazy(() => import("../pages/admin/AdminActivity"));

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/programs/:programId" element={<ProgramDetails />} />
        <Route path="/apply/:programId" element={<ApplicationForm />} />
        <Route path="/application-confirmation" element={<ApplicationConfirmation />} />
        <Route path="/application-confirmation/:applicationId" element={<ApplicationConfirmation />} />
        <Route path="/video-courses" element={<VideoCourseCatalog />} />
        <Route path="/video-courses/:courseId" element={<VideoCourseDetails />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      <Route element={<StudentLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-learning" element={<MyLearning />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/my-submissions" element={<MySubmissions />} />
        <Route path="/my-results" element={<MyResults />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/my-video-courses" element={<MyVideoCourses />} />
        <Route path="/free-learning" element={<FreeLearning />} />
        <Route path="/free-learning/:trackId" element={<TrackDetails />} />
        <Route path="/free-learning/:trackId/lessons/:lessonId" element={<LessonDetails />} />
        <Route path="/free-learning/:trackId/quizzes/:quizId" element={<QuizPage />} />
        <Route path="/free-learning/:trackId/quizzes/:quizId/results" element={<QuizResults />} />
        <Route path="/free-learning/:trackId/projects" element={<ProjectDetails />} />
        <Route path="/free-learning/:trackId/projects/:projectId" element={<ProjectBrief />} />
        <Route path="/free-learning/:trackId/projects/:projectId/submit" element={<ProjectSubmission />} />
        <Route path="/video-courses/:courseId/lessons/:lessonId" element={<VideoLessonPlayer />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="users/:userId" element={<AdminUserDetail />} />
        <Route path="programs" element={<AdminPrograms />} />
        <Route path="programs/:programId" element={<AdminProgramEditor />} />
        <Route path="learning" element={<AdminLearning />} />
        <Route path="learning/:trackId" element={<AdminTrackEditor />} />
        <Route path="topics/:topicId" element={<AdminTopicEditor />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="projects/:projectId" element={<AdminProjectEditor />} />
        <Route path="submissions" element={<ReviewSubmissions />} />
        <Route path="video-courses" element={<AdminVideoCourses />} />
        <Route path="video-courses/:courseId" element={<AdminVideoCourseEditor />} />
        <Route path="applications" element={<ReviewApplications />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="activity" element={<AdminActivity />} />
        <Route path="notifications" element={<Notifications />} />
      </Route>

      <Route path="/student" element={<Navigate to="/dashboard" replace />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
