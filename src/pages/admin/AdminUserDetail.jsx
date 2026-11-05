import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { Notice, PageHeader, StatCard, StatusBadge, TableWrap, Tabs } from "../../components/ui";
import { useAuth } from "../../hooks/useAuth";
import { useApiResource } from "../../hooks/useApiResource";
import { api } from "../../services/api/api";
import { formatDate } from "../../utils/formatDate";
import { isAdminRole } from "../../utils/roles";

export default function AdminUserDetail() {
  const { userId } = useParams();
  const { user: me } = useAuth();
  const { data: user, loading, error, reload } = useApiResource(`/admin/users/${encodeURIComponent(userId)}`, "user", null);
  const [tab, setTab] = useState("learning");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  if (loading) return <section className="admin-page"><Loader label="Loading profile…" /></section>;
  if (error) return <section className="admin-page"><ErrorMessage message={error} onRetry={reload} /></section>;
  const isSelf = String(me?.id) === String(user.id);

  async function change(path, body, confirmText) {
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    setNotice(null);
    try {
      await api.patch(`/admin/users/${user.id}/${path}`, body);
      setNotice({ tone: "info", text: "Saved." });
      reload();
    } catch (changeError) {
      setNotice({ tone: "error", text: changeError.message });
    } finally {
      setBusy(false);
    }
  }

  const q = user.quizPerformance;
  return (
    <section className="admin-page">
      <Link to="/admin/users" className="back-link"><ArrowLeft size={17} aria-hidden="true" /> All users</Link>
      <PageHeader
        eyebrow={isAdminRole(user.role) ? "ADMINISTRATOR" : "STUDENT"}
        title={user.name}
        description={`${user.email} · ${user.phone} · registered ${formatDate(user.registeredAt)} · last active ${formatDate(user.lastActiveAt)}`}
        actions={!isSelf && (
          <>
            <Button variant="outline" disabled={busy} onClick={() => change("status", { status: user.status === "active" ? "suspended" : "active" },
              user.status === "active" ? `Deactivate ${user.name}? They will be signed out and cannot sign in until reactivated.` : `Reactivate ${user.name}?`)}>
              {user.status === "active" ? "Deactivate account" : "Reactivate account"}
            </Button>
            <Button variant="ghost" disabled={busy} onClick={() => change("role", { role: isAdminRole(user.role) ? "student" : "admin" },
              isAdminRole(user.role) ? `Remove admin access from ${user.name}?` : `Give ${user.name} full admin access? Admins can manage all content and see every student record.`)}>
              {isAdminRole(user.role) ? "Remove admin access" : "Make admin"}
            </Button>
          </>
        )}
      />
      <Notice tone={notice?.tone}>{notice?.text}</Notice>
      <div className="ui-actions" style={{ marginBottom: 16 }}>
        <StatusBadge status={user.status === "active" ? "Active" : "Deactivated"} />
        {!user.emailVerified && <span className="ui-pill amber">Email not verified</span>}
      </div>

      <div className="ui-grid ui-grid-stats">
        <StatCard label="Tracks started" value={user.learning.length} />
        <StatCard label="Quiz attempts" value={q.attempts} hint={q.attempts ? `${q.passed} passed` : undefined} />
        <StatCard label="Average quiz score" value={q.averageScore === null ? "—" : `${q.averageScore}%`} />
        <StatCard label="Project submissions" value={user.submissions.length} />
        <StatCard label="Applications" value={user.applications.length} />
        <StatCard label="Video courses" value={user.videoCourses.length} />
      </div>

      <div className="ui-card" style={{ marginTop: 20 }}>
        <Tabs value={tab} onChange={setTab} tabs={[
          { value: "learning", label: "Learning" }, { value: "quizzes", label: "Quizzes", count: q.history.length },
          { value: "projects", label: "Projects", count: user.submissions.length }, { value: "applications", label: "Applications", count: user.applications.length },
          { value: "videos", label: "Video courses", count: user.videoCourses.length },
        ]} />
        {tab === "learning" && (user.learning.length === 0 ? <p className="muted-text">No topics completed yet.</p> : (
          <ul className="ui-list">{user.learning.map((row) => (
            <li className="ui-list-item" key={row.trackId}><div className="min-w-0"><h4>{row.trackTitle}</h4><p>{row.completedTopics} of {row.totalTopics} topics</p></div><strong>{row.percentage}%</strong></li>
          ))}</ul>
        ))}
        {tab === "quizzes" && (q.history.length === 0 ? <p className="muted-text">No quiz attempts.</p> : (
          <TableWrap><table className="ui-table"><thead><tr><th>Date</th><th>Quiz</th><th>Track</th><th>Attempt</th><th>Score</th><th>Result</th></tr></thead>
            <tbody>{q.history.map((row) => (
              <tr key={row.id}><td>{formatDate(row.completedAt)}</td><td>{row.quizTitle}{row.topicTitle ? <div className="muted-text">{row.topicTitle}</div> : null}</td><td>{row.trackTitle}</td><td>{row.attemptNumber}</td><td>{row.score}/{row.totalQuestions} ({row.percentage}%)</td><td><StatusBadge status={row.passed ? "Passed" : "Not passed"} /></td></tr>
            ))}</tbody></table></TableWrap>
        ))}
        {tab === "projects" && (user.submissions.length === 0 ? <p className="muted-text">No submissions.</p> : (
          <ul className="ui-list">{user.submissions.map((row) => (
            <li className="ui-list-item" key={row.id}><div className="min-w-0"><h4>{row.projectTitle}</h4><p>{formatDate(row.createdAt)}{row.score !== null ? ` · ${row.score}/${row.maxScore}` : ""}</p></div><StatusBadge status={row.status} /></li>
          ))}</ul>
        ))}
        {tab === "applications" && (user.applications.length === 0 ? <p className="muted-text">No applications.</p> : (
          <ul className="ui-list">{user.applications.map((row) => (
            <li className="ui-list-item" key={row.id}><div className="min-w-0"><h4><Link to={`/admin/applications?q=${encodeURIComponent(user.email)}`}>{row.programTitle}</Link></h4><p>Applied {formatDate(row.submittedAt)}</p></div><StatusBadge status={row.status} /></li>
          ))}</ul>
        ))}
        {tab === "videos" && (user.videoCourses.length === 0 ? <p className="muted-text">No video courses.</p> : (
          <ul className="ui-list">{user.videoCourses.map((row) => (
            <li className="ui-list-item" key={row.enrollmentId}><div className="min-w-0"><h4>{row.courseTitle}</h4><p>{row.completedLessons}/{row.totalLessons} lessons · {row.percentage}%</p></div><StatusBadge status={row.status} /></li>
          ))}</ul>
        ))}
      </div>
    </section>
  );
}
