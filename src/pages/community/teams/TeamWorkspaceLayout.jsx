import { useCallback, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, Crown, Lock } from "lucide-react";

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import Toast from "../../../components/feedback/Toast";
import { useCommunityList } from "../../../features/community/listHooks";
import { Avatar, DeadlineCountdown, ProgressBar } from "../../../features/community/teams/teamComponents";
import { firstName, formatDeadline } from "../../../features/community/teams/teamHelpers";
import { getTeamWorkspace } from "../../../features/community/teams/teamsService";

// Shared layout for the Team Workspace: /community/teams/:teamId (Overview) and the
// /tasks, /chat, /files and /submission tabs, which render in the <Outlet />.
// Only team members can open it: the backend answers 403 for everyone else and the team
// payload says `viewerIsMember` / `viewerIsLeader`; this layout only reflects that.
// The tabs read { team, sample, reloadTeam, notify } with useTeamWorkspace().

// The team is re-read whenever the tab changes, so counts in the header stay current.
const loadTeam = ({ teamId }) => getTeamWorkspace({ teamId });

export default function TeamWorkspaceLayout() {
  const { teamId } = useParams();
  const { pathname } = useLocation();
  const { data, error, loading, refreshing, reload } = useCommunityList(loadTeam, { teamId, view: pathname });
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), [setToast]);

  if (loading) return <Loader label="Opening team workspace…" />;

  if (error && !data) {
    return (
      <div className="community-library">
        <Link to="/community/collaborate" className="cmt-back-link"><ArrowLeft size={16} aria-hidden="true" /> All collaboration projects</Link>
        <ErrorMessage message={error} onRetry={reload} />
      </div>
    );
  }

  const team = data.team;
  const sample = Boolean(data.isSample);

  if (!team.viewerIsMember) {
    return (
      <div className="community-library">
        <Link to="/community/collaborate" className="cmt-back-link"><ArrowLeft size={16} aria-hidden="true" /> All collaboration projects</Link>
        <section className="community-card community-empty" aria-labelledby="members-only-title">
          <span className="community-icon tone-blue"><Lock size={22} aria-hidden="true" /></span>
          <h1 id="members-only-title" className="cmt-empty-title">This workspace is for {team.name} members</h1>
          <p className="muted-text">Only members can see the team's tasks, chat, files and submission. Ask to join an open team from the project page.</p>
          {team.collaboration?.id && (
            <Link to={`/community/collaborate/${encodeURIComponent(team.collaboration.id)}`} className="btn btn-primary">View {team.collaboration.title}</Link>
          )}
        </section>
      </div>
    );
  }

  const base = `/community/teams/${encodeURIComponent(team.id)}`;
  const percent = team.progress.total ? Math.round((team.progress.done / team.progress.total) * 100) : 0;
  const premium = team.collaboration.access === "premium";
  const statusText = team.status === "submitted"
    ? "Submitted"
    : `${team.status === "active" ? "Active" : "Forming"} · ${team.members.length} of ${team.maxMembers} members`;
  const memberNames = team.members.map((member) => `${firstName(member.name)}${member.isLeader ? " (leader)" : ""}`).join(", ");
  const tabs = [
    { to: base, label: "Overview", end: true },
    { to: `${base}/tasks`, label: "Tasks", badge: team.openTasks ? `${team.openTasks} open` : "" },
    { to: `${base}/chat`, label: "Chat", badge: team.newMessages && !pathname.endsWith("/chat") ? `${team.newMessages} new` : "" },
    { to: `${base}/files`, label: "Files" },
    { to: `${base}/submission`, label: "Submission" },
  ];

  return (
    <div className="community-library cmt-page">
      {sample && (
        <p className="community-sample-notice" role="status">
          Showing sample data: the Community API is not available yet. You are Amara, the leader of {team.name}; changes last until the page reloads. This notice only appears on the local dev server.
        </p>
      )}

      <section className="community-card cmt-workspace-header" aria-labelledby="workspace-title" aria-busy={refreshing}>
        <div className="cmt-workspace-top">
          <div className="min-w-0">
            <div className="community-tags">
              <span className={`community-tag ${premium ? "tag-purple" : "tag-green"}`}>{premium && <Crown size={12} aria-hidden="true" />}{premium ? "Premium" : "Free"}</span>
              <span className={`community-tag ${team.status === "forming" ? "tag-amber" : "tag-blue"}`}>{statusText}</span>
            </div>
            <p className="cmt-eyebrow">{team.name} · {team.collaboration.teamType}</p>
            <h1 id="workspace-title" className="cmt-title">{team.collaboration.title}</h1>
            <div className="cmt-workspace-members">
              <span className="community-avatars" aria-hidden="true">
                {team.members.map((member) => <Avatar key={member.username} name={member.name} username={member.username} viewer={member.username === team.viewerUsername} />)}
              </span>
              <span>{memberNames}</span>
            </div>
          </div>
          <div className="cmt-deadline">
            <p>Submission due {formatDeadline(team.deadline)}</p>
            <DeadlineCountdown target={team.deadline} />
          </div>
        </div>

        <div className="cmt-overall">
          <div className="cmt-overall-head">
            <strong id="overall-progress-label">Overall progress</strong>
            <span>{team.progress.done} of {team.progress.total} tasks done · {percent}%</span>
          </div>
          <ProgressBar value={percent} label="Overall progress" className="is-gradient is-thick" />
        </div>

        <nav className="cmt-tabs" aria-label={`${team.name} workspace`}>
          {tabs.map((tab) => (
            <NavLink key={tab.label} to={tab.to} end={tab.end} className={({ isActive }) => `cmt-tab${isActive ? " active" : ""}`}>
              {tab.label}
              {tab.badge && <span className="cmt-tab-badge">{tab.badge}</span>}
            </NavLink>
          ))}
        </nav>
      </section>

      <Outlet context={{ team, sample, reloadTeam: reload, notify: setToast }} />

      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </div>
  );
}
