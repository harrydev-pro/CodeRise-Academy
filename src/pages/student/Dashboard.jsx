import { Link } from "react-router-dom";
import { ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, FileText, FolderKanban, Gauge, Hourglass, Layers, Trophy, Video } from "lucide-react";

import Loader from "../../components/common/Loader";
import TrackIcon from "../../components/common/TrackIcon";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { StatCard, StatusBadge } from "../../components/ui";
import { useAuth } from "../../hooks/useAuth";
import { useApiResource } from "../../hooks/useApiResource";

export default function Dashboard() {
  const { user } = useAuth();
  const summary = useApiResource("/learning/dashboard", "dashboard", null);
  const applications = useApiResource("/applications/me", "applications");
  const videos = useApiResource("/video/my-courses", "courses");
  const firstName = (user?.name || user?.fullName || "").trim().split(/\s+/)[0] || "Student";

  if (summary.loading) return <div className="student-page"><Loader label="Loading your dashboard…" /></div>;
  if (summary.error) return <div className="student-page"><ErrorMessage message={summary.error} onRetry={summary.reload} /></div>;
  const stats = summary.data;
  const activeTracks = stats.tracks.filter((track) => track.completedTopics > 0 && track.percentage < 100);
  const suggested = activeTracks.length ? activeTracks : stats.tracks.filter((track) => track.nextTopic).slice(0, 3);

  return (
    <div className="student-page">
      <section className="dashboard-welcome">
        <div className="dashboard-welcome-profile">
          {user?.avatar_url ? <img src={user.avatar_url} alt="" className="dashboard-avatar" /> : <span className="dashboard-avatar">{firstName.charAt(0).toUpperCase()}</span>}
          <div>
            <span className="eyebrow">STUDENT DASHBOARD</span>
            <h1>Welcome back, {firstName}!</h1>
            <p>Overall progress: <strong>{stats.overallProgress}%</strong> of all published topics.</p>
          </div>
        </div>
      </section>

      <section className="ui-grid ui-grid-stats student-section">
        <StatCard label="Learning tracks" value={stats.totalTracks} icon={Layers} />
        <StatCard label="Active tracks" value={stats.activeTracks} icon={BookOpen} tone="teal" />
        <StatCard label="Topics completed" value={`${stats.completedTopics}/${stats.totalTopics}`} icon={CheckCircle2} tone="green" />
        <StatCard label="Quizzes attempted" value={stats.quizzesAttempted} icon={ClipboardCheck} tone="purple" />
        <StatCard label="Average quiz score" value={stats.averageQuizScore === null ? "—" : `${stats.averageQuizScore}%`} icon={Trophy} tone="amber" />
        <StatCard label="Projects approved" value={stats.projectsCompleted} icon={FolderKanban} tone="green" />
        <StatCard label="Pending submissions" value={stats.pendingSubmissions} icon={Hourglass} tone="amber" hint={stats.submissionsNeedingCorrections ? `${stats.submissionsNeedingCorrections} need corrections` : undefined} />
        <StatCard label="Video courses" value={stats.videoCoursesEnrolled} icon={Video} tone="blue" />
        <StatCard label="Overall progress" value={`${stats.overallProgress}%`} icon={Gauge} tone="teal" />
      </section>

      <section className="student-section">
        <div className="ui-card-header"><h2>{activeTracks.length ? "Continue learning" : "Start learning"}</h2><Link to="/my-learning" className="text-link">My learning <ArrowRight size={16} aria-hidden="true" /></Link></div>
        {suggested.length === 0 ? <p className="muted-text">No learning tracks are available yet.</p> : (
          <div className="ui-grid ui-grid-cards">
            {suggested.map((track) => (
              <article className="ui-card dashboard-track" key={track.id}>
                <div className="dashboard-track-head">
                  <span className="student-track-icon"><TrackIcon track={track} size={22} /></span>
                  <div className="min-w-0"><h3>{track.title}</h3>{track.currentLevel && <p className="muted-text">{track.currentLevel} level</p>}</div>
                </div>
                <div className="ui-progress" role="progressbar" aria-label={`${track.title} progress`} aria-valuenow={track.percentage} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${track.percentage}%` }} /></div>
                <p className="muted-text">{track.completedTopics} of {track.totalTopics} topics · {track.percentage}%</p>
                {track.nextTopic && <Link to={`/free-learning/${track.id}/lessons/${track.nextTopic.id}`} className="btn btn-primary">Next: {track.nextTopic.title}</Link>}
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="ui-grid ui-grid-2 student-section">
        <section className="ui-card">
          <div className="ui-card-header"><h2>My applications</h2><Link to="/my-applications" className="text-link">View all</Link></div>
          {applications.data.length === 0 ? (
            <p className="muted-text">You have not applied for a program yet. <Link to="/programs" className="text-link">Explore programs</Link></p>
          ) : (
            <ul className="ui-list">
              {applications.data.slice(0, 3).map((application) => (
                <li className="ui-list-item" key={application.id}>
                  <div className="min-w-0"><h4>{application.programTitle}</h4><p>Reference {application.id}</p></div>
                  <StatusBadge status={application.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="ui-card">
          <div className="ui-card-header"><h2>My video courses</h2><Link to="/my-video-courses" className="text-link">View all</Link></div>
          {videos.data.length === 0 ? (
            <p className="muted-text">You are not enrolled in a video course yet. <Link to="/video-courses" className="text-link">Browse courses</Link></p>
          ) : (
            <ul className="ui-list">
              {videos.data.slice(0, 3).map((item) => (
                <li className="ui-list-item" key={item.course.id}>
                  <div className="min-w-0"><h4>{item.course.title}</h4><p>{item.progress.completedLessons}/{item.progress.totalLessons} lessons · {item.progress.percentage}%</p></div>
                  {item.enrollment.status === "active" && item.continueLessonId
                    ? <Link className="btn btn-outline btn-sm" to={`/video-courses/${item.course.id}/lessons/${item.continueLessonId}`}>Continue</Link>
                    : <StatusBadge status={item.enrollment.status === "pending" ? "Pending" : item.enrollment.status} />}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="student-section dashboard-application-banner">
        <div>
          <span className="eyebrow">READY FOR STRUCTURED TRAINING?</span>
          <h2>Take the next step in your learning journey.</h2>
          <p>Explore our full training programs and apply when you are ready.</p>
        </div>
        <Link to="/programs" className="btn btn-primary">Explore programs <FileText size={17} aria-hidden="true" /></Link>
      </section>
    </div>
  );
}
