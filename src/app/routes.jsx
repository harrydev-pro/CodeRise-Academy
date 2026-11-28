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
import Privacy from "../pages/public/Privacy";

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
import PaymentReturn from "../pages/payments/PaymentReturn";

import CommunityLayout from "../layouts/CommunityLayout";
import CollaborationDetails from "../pages/community/teams/CollaborationDetails";
import CreateTeam from "../pages/community/teams/CreateTeam";
import TeamWorkspaceLayout from "../pages/community/teams/TeamWorkspaceLayout";
import TeamOverview from "../pages/community/teams/TeamOverview";
import TeamTasks from "../pages/community/teams/TeamTasks";
import TeamChat from "../pages/community/teams/TeamChat";
import TeamFiles from "../pages/community/teams/TeamFiles";
import TeamSubmission from "../pages/community/teams/TeamSubmission";
import CommunityProjectDetails from "../pages/community/projects/ProjectDetails";
import CommunityProjectSubmission from "../pages/community/projects/ProjectSubmission";
import MyCommunityProjects from "../pages/community/projects/MyCommunityProjects";
import HackathonDetails from "../pages/community/hackathons/HackathonDetails";
import HackathonWorkspace from "../pages/community/hackathons/HackathonWorkspace";
import HackathonSubmission from "../pages/community/hackathons/HackathonSubmission";
import CommunityProfile from "../pages/community/profile/CommunityProfile";
import CompetitionDetails from "../pages/community/competitions/CompetitionDetails";
import CompetitionRegistration from "../pages/community/competitions/CompetitionRegistration";
import CompetitionCheckout from "../pages/community/competitions/CompetitionCheckout";
import CompetitionResults from "../pages/community/competitions/CompetitionResults";
import CompetitionEntry from "../pages/community/competitions/CompetitionEntry";
import PremiumPlans from "../pages/premium/PremiumPlans";
import PremiumCheckout from "../pages/premium/PremiumCheckout";
import Subscription from "../pages/premium/Subscription";
import CommunityHome from "../pages/community/CommunityHome";
import CommunityComingSoon from "../pages/community/CommunityComingSoon";
import ProjectLibrary from "../pages/community/ProjectLibrary";
import CollaborationLibrary from "../pages/community/CollaborationLibrary";
import HackathonListing from "../pages/community/HackathonListing";
import CompetitionListing from "../pages/community/CompetitionListing";
import ProjectShowcase from "../pages/community/ProjectShowcase";
import Leaderboard from "../pages/community/Leaderboard";
import Announcements from "../pages/community/Announcements";
import MyActivities from "../pages/community/MyActivities";

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
const AdminPayments = lazy(() => import("../pages/admin/AdminPayments"));
const AdminReports = lazy(() => import("../pages/admin/AdminReports"));
const AdminActivity = lazy(() => import("../pages/admin/AdminActivity"));
const AdminCommunityOverview = lazy(() => import("../pages/admin/community/AdminCommunityOverview"));
const AdminCommunityProjects = lazy(() => import("../pages/admin/community/AdminCommunityProjects"));
const AdminCommunityProjectEditor = lazy(() => import("../pages/admin/community/AdminProjectEditor"));
const AdminCommunityAnalytics = lazy(() => import("../pages/admin/community/manage/AdminCommunityAnalytics"));
const AdminCommunityAnnouncements = lazy(() => import("../pages/admin/community/manage/AdminCommunityAnnouncements"));
const AdminCommunityMembers = lazy(() => import("../pages/admin/community/manage/AdminCommunityMembers"));
const AdminCommunityPremiumPlans = lazy(() => import("../pages/admin/community/manage/AdminCommunityPremiumPlans"));
const AdminCommunitySubscriptions = lazy(() => import("../pages/admin/community/manage/AdminCommunitySubscriptions"));
const AdminCommunityBadges = lazy(() => import("../pages/admin/community/manage/AdminCommunityBadges"));
const AdminCommunityPoints = lazy(() => import("../pages/admin/community/manage/AdminCommunityPoints"));
const AdminCommunitySettings = lazy(() => import("../pages/admin/community/manage/AdminCommunitySettings"));
const AdminCommunityModeration = lazy(() => import("../pages/admin/community/manage/AdminCommunityModeration"));
const AdminCollaborations = lazy(() => import("../pages/admin/community/events/AdminCollaborations"));
const AdminCollaborationEditor = lazy(() => import("../pages/admin/community/events/AdminCollaborationEditor"));
const AdminTeams = lazy(() => import("../pages/admin/community/events/AdminTeams"));
const AdminHackathons = lazy(() => import("../pages/admin/community/events/AdminHackathons"));
const AdminHackathonEditor = lazy(() => import("../pages/admin/community/events/AdminHackathonEditor"));
const AdminHackathonParticipants = lazy(() => import("../pages/admin/community/events/AdminHackathonParticipants"));
const AdminHackathonSubmissions = lazy(() => import("../pages/admin/community/events/AdminHackathonSubmissions"));
const AdminCompetitions = lazy(() => import("../pages/admin/community/review/AdminCompetitions"));
const AdminCompetitionEditor = lazy(() => import("../pages/admin/community/review/AdminCompetitionEditor"));
const AdminCompetitionParticipants = lazy(() => import("../pages/admin/community/review/AdminCompetitionParticipants"));
const AdminCompetitionResults = lazy(() => import("../pages/admin/community/review/AdminCompetitionResults"));
const AdminCompetitionPayments = lazy(() => import("../pages/admin/community/review/AdminCompetitionPayments"));
const AdminSubmissions = lazy(() => import("../pages/admin/community/review/AdminSubmissions"));
const AdminSubmissionReview = lazy(() => import("../pages/admin/community/review/AdminSubmissionReview"));

// Admin Community screens not built yet show a placeholder instead of the 404 page.
const adminCommunityPending = (title) => (
  <CommunityComingSoon title={title} backTo="/admin/community" backLabel="Back to Community overview" />
);

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/payments/return" element={<PaymentReturn />} />
        <Route index element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy" element={<Privacy />} />
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

        {/* Community: Home is built; the other screens show a placeholder until they are. */}
        <Route path="/community" element={<CommunityLayout />}>
          <Route index element={<CommunityHome />} />
          <Route path="projects" element={<ProjectLibrary />} />
          <Route path="projects/:slug" element={<CommunityProjectDetails />} />
          <Route path="projects/:slug/submit" element={<CommunityProjectSubmission />} />
          <Route path="projects/*" element={<CommunityComingSoon title="Projects" />} />
          <Route path="my-projects" element={<MyCommunityProjects />} />
          <Route path="collaborate" element={<CollaborationLibrary />} />
          <Route path="collaborate/:id" element={<CollaborationDetails />} />
          <Route path="collaborate/:id/team/new" element={<CreateTeam />} />
          <Route path="collaborate/*" element={<CommunityComingSoon title="Collaborate" />} />
          <Route path="teams/:teamId" element={<TeamWorkspaceLayout />}>
            <Route index element={<TeamOverview />} />
            <Route path="tasks" element={<TeamTasks />} />
            <Route path="chat" element={<TeamChat />} />
            <Route path="files" element={<TeamFiles />} />
            <Route path="submission" element={<TeamSubmission />} />
          </Route>
          <Route path="teams/*" element={<CommunityComingSoon title="Team Workspace" />} />
          <Route path="hackathons" element={<HackathonListing />} />
          <Route path="hackathons/:id" element={<HackathonDetails />} />
          <Route path="hackathons/:id/workspace" element={<HackathonWorkspace />} />
          <Route path="hackathons/:id/submit" element={<HackathonSubmission />} />
          <Route path="hackathons/*" element={<CommunityComingSoon title="Hackathons" />} />
          <Route path="competitions" element={<CompetitionListing />} />
          <Route path="competitions/:id" element={<CompetitionDetails />} />
          <Route path="competitions/:id/register" element={<CompetitionRegistration />} />
          <Route path="competitions/:id/checkout" element={<CompetitionCheckout />} />
          <Route path="competitions/:id/results" element={<CompetitionResults />} />
          <Route path="competitions/:id/entry" element={<CompetitionEntry />} />
          <Route path="competitions/*" element={<CommunityComingSoon title="Competitions" />} />
          <Route path="showcase" element={<ProjectShowcase />} />
          <Route path="u/:username" element={<CommunityProfile />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="activities" element={<MyActivities />} />
          <Route path="*" element={<CommunityComingSoon title="Community" />} />
        </Route>
        <Route path="/premium" element={<PremiumPlans />} />
        <Route path="/premium/checkout" element={<PremiumCheckout />} />
        <Route path="/account/subscription" element={<Subscription />} />
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
        <Route path="payments" element={<AdminPayments />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="activity" element={<AdminActivity />} />
        <Route path="notifications" element={<Notifications />} />

        <Route path="community" element={<AdminCommunityOverview />} />
        <Route path="community/analytics" element={<AdminCommunityAnalytics />} />
        <Route path="community/projects" element={<AdminCommunityProjects />} />
        <Route path="community/projects/new" element={<AdminCommunityProjectEditor />} />
        <Route path="community/projects/:projectId/edit" element={<AdminCommunityProjectEditor />} />
        <Route path="community/projects/*" element={adminCommunityPending("Community projects")} />
        <Route path="community/collaborations" element={<AdminCollaborations />} />
        <Route path="community/collaborations/new" element={<AdminCollaborationEditor />} />
        <Route path="community/collaborations/:id/edit" element={<AdminCollaborationEditor />} />
        <Route path="community/collaborations/*" element={adminCommunityPending("Collaborations")} />
        <Route path="community/teams" element={<AdminTeams />} />
        <Route path="community/hackathons" element={<AdminHackathons />} />
        <Route path="community/hackathons/new" element={<AdminHackathonEditor />} />
        <Route path="community/hackathons/:id/edit" element={<AdminHackathonEditor />} />
        <Route path="community/hackathons/:id/participants" element={<AdminHackathonParticipants />} />
        <Route path="community/hackathons/:id/submissions" element={<AdminHackathonSubmissions />} />
        <Route path="community/hackathons/*" element={adminCommunityPending("Hackathons")} />
        <Route path="community/competitions" element={<AdminCompetitions />} />
        <Route path="community/competitions/new" element={<AdminCompetitionEditor />} />
        <Route path="community/competitions/:competitionId/edit" element={<AdminCompetitionEditor />} />
        <Route path="community/competitions/:competitionId/participants" element={<AdminCompetitionParticipants />} />
        <Route path="community/competitions/:competitionId/results" element={<AdminCompetitionResults />} />
        <Route path="community/competitions/*" element={adminCommunityPending("Competitions")} />
        <Route path="community/payments" element={<AdminCompetitionPayments />} />
        <Route path="community/submissions" element={<AdminSubmissions />} />
        <Route path="community/submissions/:submissionId" element={<AdminSubmissionReview />} />
        <Route path="community/announcements" element={<AdminCommunityAnnouncements />} />
        <Route path="community/members" element={<AdminCommunityMembers />} />
        <Route path="community/premium" element={<AdminCommunityPremiumPlans />} />
        <Route path="community/subscriptions" element={<AdminCommunitySubscriptions />} />
        <Route path="community/badges" element={<AdminCommunityBadges />} />
        <Route path="community/points" element={<AdminCommunityPoints />} />
        <Route path="community/moderation" element={<AdminCommunityModeration />} />
        <Route path="community/settings" element={<AdminCommunitySettings />} />
        <Route path="community/*" element={adminCommunityPending("Community")} />
      </Route>

      <Route path="/student" element={<Navigate to="/dashboard" replace />} />
      <Route path="/404" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
