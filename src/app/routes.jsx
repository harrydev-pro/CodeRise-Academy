import { Navigate, Route, Routes } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import AuthLayout from "../layouts/AuthLayout";
import StudentLayout from "../layouts/StudentLayout";
import AdminLayout from "../layouts/AdminLayout";

import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";
import Programs from "../pages/public/Programs";
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
import MyPurchases from "../pages/student/MyPurchases";
import Notifications from "../pages/student/Notifications";

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
import Checkout from "../pages/video-courses/Checkout";
import PurchaseConfirmation from "../pages/video-courses/PurchaseConfirmation";

import ApplicationForm from "../pages/applications/ApplicationForm";
import ApplicationConfirmation from "../pages/applications/ApplicationConfirmation";
import AdminOverview from "../pages/admin/AdminOverview";
import AdminPage from "../pages/admin/AdminPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/programs" element={<Programs />} />
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
        <Route path="/my-purchases" element={<MyPurchases />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/free-learning" element={<FreeLearning />} />
        <Route path="/free-learning/:trackId" element={<TrackDetails />} />
        <Route path="/free-learning/:trackId/lessons/:lessonId" element={<LessonDetails />} />
        <Route path="/free-learning/:trackId/quizzes/:quizId" element={<QuizPage />} />
        <Route path="/free-learning/:trackId/quizzes/:quizId/results" element={<QuizResults />} />
        <Route path="/free-learning/:trackId/projects" element={<ProjectDetails />} />
        <Route path="/free-learning/:trackId/projects/:projectId" element={<ProjectBrief />} />
        <Route path="/free-learning/:trackId/projects/:projectId/submit" element={<ProjectSubmission />} />
        <Route path="/video-courses/:courseId/lessons/:lessonId" element={<VideoLessonPlayer />} />
        <Route path="/checkout/:courseId" element={<Checkout />} />
        <Route path="/video-courses/:courseId/confirmation" element={<PurchaseConfirmation />} />
        <Route path="/purchase-confirmation" element={<PurchaseConfirmation />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminOverview />} />
        <Route path="users" element={<AdminPage />} />
        <Route path="activity" element={<AdminPage />} />
        <Route path="courses" element={<AdminPage />} />
        <Route path="lessons" element={<AdminPage />} />
        <Route path="video-management" element={<AdminPage />} />
        <Route path="programs" element={<AdminPage />} />
        <Route path="pricing" element={<AdminPage />} />
        <Route path="quizzes" element={<AdminPage />} />
        <Route path="submissions" element={<AdminPage />} />
        <Route path="applications" element={<AdminPage />} />
        <Route path="settings" element={<AdminPage />} />
      </Route>

      <Route path="/student" element={<Navigate to="/dashboard" replace />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
