import { useState } from "react";
import { Activity, BookOpen, ClipboardCheck, FileCheck2, FileClock, FileText, GraduationCap, HelpCircle, ListChecks, ThumbsUp, UserCheck, Users, Video, PlayCircle } from "lucide-react";

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { BarList, LineChart } from "../../components/ui/Charts";
import { PageHeader, StatCard, TextField } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";
import { queryString } from "../../services/api/api";

const day = (date) => date.toISOString().slice(0, 10);

export default function AdminOverview() {
  const [range, setRange] = useState(() => ({ from: day(new Date(Date.now() - 29 * 86400000)), to: day(new Date()) }));
  const overview = useApiResource("/admin/analytics/overview", "overview", null);
  const trends = useApiResource(`/admin/analytics/trends${queryString(range)}`, "trends", null);

  if (overview.loading) return <section className="admin-page"><Loader label="Loading dashboard…" /></section>;
  if (overview.error) return <section className="admin-page"><ErrorMessage message={overview.error} onRetry={overview.reload} /></section>;
  const o = overview.data;
  const t = trends.data;

  return (
    <section className="admin-page">
      <PageHeader eyebrow="ADMIN DASHBOARD" title="Academy overview" description="Live figures from the database. Active means signed in during the last 30 days." />

      <div className="ui-grid ui-grid-stats">
        <StatCard label="Registered users" value={o.totalUsers} icon={Users} to="/admin/users" />
        <StatCard label="Active users (30 days)" value={o.activeUsers} icon={UserCheck} tone="green" />
        <StatCard label="Students" value={o.totalStudents} icon={GraduationCap} tone="teal" to="/admin/users?role=student" />
        <StatCard label="Students currently learning" value={o.studentsCurrentlyLearning} icon={Activity} tone="purple" />
        <StatCard label="Learning tracks" value={o.totalTracks} icon={BookOpen} to="/admin/learning" />
        <StatCard label="Quiz attempts" value={o.totalQuizAttempts} icon={ClipboardCheck} tone="purple" />
        <StatCard label="Quiz questions" value={o.totalQuestions} icon={HelpCircle} tone="teal" />
        <StatCard label="Quiz submissions" value={o.totalQuizSubmissions} icon={ListChecks} tone="blue" />
        <StatCard label="Project submissions" value={o.totalProjectSubmissions} icon={FileCheck2} tone="amber" to="/admin/submissions" hint={o.pendingSubmissions ? `${o.pendingSubmissions} awaiting review` : undefined} />
        <StatCard label="Program applications" value={o.totalApplications} icon={FileText} to="/admin/applications" />
        <StatCard label="Pending applications" value={o.pendingApplications} icon={FileClock} tone="amber" to="/admin/applications?status=Pending" />
        <StatCard label="Approved applications" value={o.approvedApplications} icon={ThumbsUp} tone="green" to="/admin/applications?status=Approved" />
        <StatCard label="Video courses" value={o.totalVideoCourses} icon={Video} to="/admin/video-courses" />
        <StatCard label="Course enrollments" value={o.totalEnrollments} icon={PlayCircle} tone="teal" hint={o.pendingAccessRequests ? `${o.pendingAccessRequests} access requests` : undefined} />
      </div>

      <div className="ui-card admin-range">
        <div className="ui-card-header"><h2>Trends</h2></div>
        <div className="ui-toolbar">
          <TextField label="From" type="date" value={range.from} max={range.to} onChange={(from) => from && setRange((r) => ({ ...r, from }))} />
          <TextField label="To" type="date" value={range.to} min={range.from} onChange={(to) => to && setRange((r) => ({ ...r, to }))} />
        </div>
        {trends.loading ? <Loader label="Loading charts…" /> : trends.error ? <ErrorMessage message={trends.error} onRetry={trends.reload} /> : (
          <div className="ui-grid ui-grid-2">
            <div className="ui-card"><h3>User registrations</h3><LineChart points={t.registrations} label="Registrations" /></div>
            <div className="ui-card"><h3>Active users per day</h3><LineChart points={t.activeUsers} label="Active-user days" /></div>
            <div className="ui-card"><h3>Program applications</h3><LineChart points={t.applications} label="Applications" /></div>
            <div className="ui-card"><h3>Project submissions</h3><LineChart points={t.submissions} label="Submissions" /></div>
            <div className="ui-card"><h3>Quiz attempts</h3><LineChart points={t.quizAttempts} label="Quiz attempts" /></div>
            <div className="ui-card"><h3>Most popular learning tracks</h3><BarList items={t.popularTracks} valueKey="learners" suffix=" learners" /></div>
            <div className="ui-card"><h3>Average quiz score by track</h3><BarList items={t.quizPerformance} valueKey="averageScore" suffix="%" /></div>
            <div className="ui-card">
              <h3>Applications by program</h3>
              <BarList items={t.applicationsByProgram.map((row) => ({ ...row, title: `${row.title} · ${row.status}` }))} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
