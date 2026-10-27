import { Navigate, Route, Routes } from "react-router-dom";

import PublicLayout from "../layouts/PublicLayout";
import AuthLayout from "../layouts/AuthLayout";
import StudentLayout from "../layouts/StudentLayout";
import AdminLayout from "../layouts/AdminLayout";

import ProtectedRoute from "../features/authentication/ProtectedRoute";
import RoleGuard from "../features/authentication/RoleGuard";

import Home from "../pages/public/Home";
import About from "../pages/public/About";
import Contact from "../pages/public/Contact";
import Programs from "../pages/public/Programs";
import NotFound from "../pages/public/NotFound";

import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import VerifyEmail from "../pages/auth/VerifyEmail";
import ForgotPassword from "../pages/auth/ForgotPassword";
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
import ProjectSubmission from "../pages/free-learning/ProjectSubmission";

import VideoCourseCatalog from "../pages/video-courses/VideoCourseCatalog";
import VideoCourseDetails from "../pages/video-courses/VideoCourseDetails";
import VideoLessonPlayer from "../pages/video-courses/VideoLessonPlayer";
import Checkout from "../pages/video-courses/Checkout";
import PurchaseConfirmation from "../pages/video-courses/PurchaseConfirmation";

import ApplicationForm from "../pages/applications/ApplicationForm";
import ApplicationConfirmation from "../pages/applications/ApplicationConfirmation";

import AdminDashboard from "../pages/admin/AdminDashboard";
import Users from "../pages/admin/Users";
import ActivityLogs from "../pages/admin/ActivityLogs";
import Courses from "../pages/admin/Courses";
import Lessons from "../pages/admin/Lessons";
import VideoManagement from "../pages/admin/VideoManagement";
import ProgramsManagement from "../pages/admin/Programs";
import Pricing from "../pages/admin/Pricing";
import QuizManagement from "../pages/admin/QuizManagement";
import Submissions from "../pages/admin/Submissions";
import Applications from "../pages/admin/Applications";
import Settings from "../pages/admin/Settings";

function StudentRoute({ children }) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}

function AdminRoute({ children }) {
  return (
    <ProtectedRoute>
      <RoleGuard allowedRoles={["admin"]}>
        {children}
      </RoleGuard>
    </ProtectedRoute>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public website */}
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/programs" element={<Programs />} />

        <Route
          path="/apply/:programId"
          element={
            <StudentRoute>
              <ApplicationForm />
            </StudentRoute>
          }
        />

        <Route
          path="/application-confirmation"
          element={
            <StudentRoute>
              <ApplicationConfirmation />
            </StudentRoute>
          }
        />
      </Route>

      {/* Authentication */}
      <Route element={<AuthLayout />}>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* Student dashboard */}
      <Route
        element={
          <StudentRoute>
            <StudentLayout />
          </StudentRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/my-learning" element={<MyLearning />} />
        <Route path="/my-applications" element={<MyApplications />} />
        <Route path="/my-submissions" element={<MySubmissions />} />
        <Route path="/my-results" element={<MyResults />} />
        <Route path="/my-purchases" element={<MyPurchases />} />
        <Route path="/notifications" element={<Notifications />} />

        {/* Free text-based learning */}
        <Route path="/free-learning" element={<FreeLearning />} />
        <Route
          path="/free-learning/:trackId"
          element={<TrackDetails />}
        />
        <Route
          path="/free-learning/:trackId/lessons/:lessonId"
          element={<LessonDetails />}
        />
        <Route
          path="/free-learning/:trackId/quizzes/:quizId"
          element={<QuizPage />}
        />
        <Route
          path="/free-learning/:trackId/quizzes/:quizId/results"
          element={<QuizResults />}
        />
        <Route
          path="/free-learning/:trackId/projects/:projectId"
          element={<ProjectDetails />}
        />
        <Route
          path="/free-learning/:trackId/projects/:projectId/submit"
          element={<ProjectSubmission />}
        />

        {/* Paid video courses */}
        <Route
          path="/video-courses"
          element={<VideoCourseCatalog />}
        />
        <Route
          path="/video-courses/:courseId"
          element={<VideoCourseDetails />}
        />
        <Route
          path="/video-courses/:courseId/lessons/:lessonId"
          element={<VideoLessonPlayer />}
        />
        <Route
          path="/checkout/:courseId"
          element={<Checkout />}
        />
        <Route
          path="/purchase-confirmation"
          element={<PurchaseConfirmation />}
        />
      </Route>

      {/* Admin area */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="activity" element={<ActivityLogs />} />
        <Route path="courses" element={<Courses />} />
        <Route path="lessons" element={<Lessons />} />
        <Route path="video-management" element={<VideoManagement />} />
        <Route path="programs" element={<ProgramsManagement />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="quizzes" element={<QuizManagement />} />
        <Route path="submissions" element={<Submissions />} />
        <Route path="applications" element={<Applications />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      {/* Unknown URLs */}
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />

      {/* Example redirect for old links */}
      <Route
        path="/student"
        element={<Navigate to="/dashboard" replace />}
      />
    </Routes>
  );
}