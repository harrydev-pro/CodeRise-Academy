import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  Award,
  Check,
  CircleAlert,
  CircleCheck,
  ClipboardCheck,
  Download,
  FileBadge,
  Lock,
  Star,
  ThumbsUp,
  Trophy,
  Upload,
  Users,
  Zap,
} from "lucide-react";

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { getMyActivities } from "../../features/community/communityService";
import { useCommunityList, useUrlFilters } from "../../features/community/listHooks";

const TABS = [
  { value: "", label: "All activity" },
  { value: "projects", label: "Projects" },
  { value: "teams", label: "Teams" },
  { value: "hackathons", label: "Hackathons" },
  { value: "competitions", label: "Competitions" },
  { value: "certificates", label: "Certificates" },
];
const TYPE_STYLE = {
  project_submitted: { icon: Upload, tone: "blue" },
  corrections_requested: { icon: CircleAlert, tone: "orange" },
  project_approved: { icon: Check, tone: "green" },
  team_joined: { icon: Users, tone: "teal" },
  hackathon_registered: { icon: Zap, tone: "amber" },
  competition_entered: { icon: Trophy, tone: "sky" },
  badge_earned: { icon: Award, tone: "purple" },
  certificate_earned: { icon: FileBadge, tone: "blue" },
};
const BADGE_STYLE = {
  "First Project": { icon: Check, tone: "blue" },
  "Rising Developer": { icon: Activity, tone: "purple" },
  "Team Player": { icon: Users, tone: "green" },
  "Community Helper": { icon: ThumbsUp, tone: "orange" },
};
const EMPTY_TEXT = {
  "": "Your community activity will appear here once you start a project, join a team or enter an event.",
  projects: "You haven't submitted a community project yet.",
  teams: "You haven't joined a team yet.",
  hackathons: "You haven't registered for a hackathon yet.",
  competitions: "You haven't entered a competition yet.",
  certificates: "Certificates appear here when a project is approved or an event finishes.",
};

const numberFormat = new Intl.NumberFormat("en-GB");
const time = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });
const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const monthYear = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });
const monthOnly = new Intl.DateTimeFormat("en-GB", { month: "long" });
const shortMonthYear = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" });

function when(iso) {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return `Today, ${time.format(date)}`;
  if (date.toDateString() === yesterday.toDateString()) return `Yesterday, ${time.format(date)}`;
  return dayMonth.format(date);
}

export default function MyActivities() {
  const { params, update } = useUrlFilters();
  const tab = TABS.some((item) => item.value === params.get("tab")) ? params.get("tab") : "";
  const { data, error, loading, refreshing, reload } = useCommunityList(getMyActivities, { tab });
  const [earlier, setEarlier] = useState({ tab: null, items: [], cursor: null, loading: false, error: "" });

  const earlierForTab = earlier.tab === tab ? earlier : null;
  const nextCursor = earlierForTab ? earlierForTab.cursor : data?.nextCursor;

  async function loadEarlier() {
    setEarlier((current) => ({ ...(current.tab === tab ? current : { tab, items: [] }), loading: true, error: "" }));
    try {
      const result = await getMyActivities({ tab, before: nextCursor });
      setEarlier((current) => ({ tab, items: [...(current.tab === tab ? current.items : []), ...result.activities], cursor: result.nextCursor, loading: false, error: "" }));
    } catch (loadError) {
      setEarlier((current) => ({ ...current, loading: false, error: loadError.message || "Earlier activity could not be loaded." }));
    }
  }

  if (loading) return <Loader label="Loading your activity…" />;
  if (error && !data) return <ErrorMessage message={error} onRetry={reload} />;

  const { stats, badges, certificates, pointsThisMonth } = data;
  const activities = [...data.activities, ...(earlierForTab?.items ?? [])];
  const now = new Date();

  return (
    <div className="community-library">
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">YOUR COMMUNITY JOURNEY</span>
          <h1>My Activities</h1>
          <p>Everything you have built, joined and earned in the CodeRise Community.</p>
        </div>
        {data.viewerUsername && (
          <Link to={`/community/u/${encodeURIComponent(data.viewerUsername)}`} className="btn btn-outline">View public profile</Link>
        )}
      </header>

      {data.isSample && (
        <p className="community-sample-notice" role="status">
          Showing sample data: the Community API is not available yet. This notice only appears on the local dev server.
        </p>
      )}

      <section className="community-stats community-stats-four" aria-label="Your totals">
        <Stat label="Projects completed" value={stats.projectsCompleted} icon={ClipboardCheck} tone="blue" />
        <Stat label="Teams joined" value={stats.teamsJoined} icon={Users} tone="green" />
        <Stat label="Hackathons" value={stats.hackathons} icon={Zap} tone="amber" />
        <Stat label="Community points" value={numberFormat.format(stats.points)} icon={Star} tone="orange" />
      </section>

      <nav className="community-segmented" aria-label="Activity type">
        {TABS.map((item) => (
          <button key={item.value || "all"} type="button" className={tab === item.value ? "active" : ""} aria-pressed={tab === item.value} onClick={() => update({ tab: item.value })}>
            {item.label}
          </button>
        ))}
      </nav>

      {error && <ErrorMessage message={error} onRetry={reload} />}

      <div className="community-leaderboard-layout community-activities-layout">
        <section className={`community-card community-timeline-card${refreshing ? " is-refreshing" : ""}`} aria-labelledby="activity-title" aria-busy={refreshing}>
          <div className="community-card-header">
            <h2 id="activity-title">{tab ? TABS.find((item) => item.value === tab).label : "Recent activity"}</h2>
            <span className="community-timeline-month">{monthYear.format(activities[0] ? new Date(activities[0].occurredAt) : now)}</span>
          </div>

          {activities.length === 0 ? (
            <p className="muted-text">{EMPTY_TEXT[tab]}</p>
          ) : (
            <ol className="community-timeline">
              {activities.map((item) => {
                const style = TYPE_STYLE[item.type] ?? { icon: CircleCheck, tone: "blue" };
                const Icon = style.icon;
                return (
                  <li key={item.id} className="community-timeline-item">
                    <span className={`community-timeline-icon community-icon tone-${style.tone}`}><Icon size={17} aria-hidden="true" /></span>
                    <div className="community-timeline-body">
                      <h3>{item.title}</h3>
                      <p className="community-timeline-details">
                        {item.details?.join(" · ")}
                        {item.link && <>{item.details?.length ? " · " : ""}<Link to={item.link.to}>{item.link.label}</Link></>}
                      </p>
                    </div>
                    <time className="community-timeline-date" dateTime={item.occurredAt}>{when(item.occurredAt)}</time>
                  </li>
                );
              })}
            </ol>
          )}

          {earlierForTab?.error && <ErrorMessage message={earlierForTab.error} onRetry={loadEarlier} />}
          {nextCursor && (
            <button type="button" className="btn btn-outline btn-sm community-load-older" onClick={loadEarlier} disabled={earlierForTab?.loading}>
              {earlierForTab?.loading ? "Loading…" : "Load earlier activity"}
            </button>
          )}
        </section>

        <aside className="community-showcase-side" aria-label="Badges, certificates and points">
          <section className="community-card" aria-labelledby="badges-title">
            <div className="community-card-header">
              <h2 id="badges-title">Badges earned</h2>
              <span className="community-timeline-month">{badges.earned.length} of {badges.total}</span>
            </div>
            <ul className="community-badge-grid">
              {badges.earned.map((badge) => {
                const style = BADGE_STYLE[badge.name] ?? { icon: Award, tone: "purple" };
                const Icon = style.icon;
                return (
                  <li key={badge.id} className="community-badge">
                    <span className={`community-badge-icon community-icon tone-${style.tone}`}><Icon size={22} aria-hidden="true" /></span>
                    <strong>{badge.name}</strong>
                    <span>{shortMonthYear.format(new Date(badge.earnedAt))}</span>
                  </li>
                );
              })}
            </ul>
            {badges.next && (
              <div className="community-badge-next">
                <span className="community-icon tone-slate"><Lock size={17} aria-hidden="true" /></span>
                <div>
                  <strong>Next: {badges.next.name}</strong>
                  <span>{badges.next.hint}</span>
                </div>
              </div>
            )}
          </section>

          <section className="community-card" aria-labelledby="certificates-title">
            <h2 id="certificates-title" className="community-side-title">Certificates</h2>
            {certificates.length === 0 ? <p className="community-side-note">No certificates yet.</p> : (
              <ul className="community-list">
                {certificates.map((certificate) => (
                  <li key={certificate.id} className="community-certificate">
                    <span className="community-icon tone-blue"><Award size={18} aria-hidden="true" /></span>
                    <div className="min-w-0">
                      <strong>{certificate.title}</strong>
                      <span>{certificate.subject} · {dayMonth.format(new Date(certificate.issuedAt))}</span>
                    </div>
                    {certificate.downloadUrl ? (
                      <a className="btn btn-outline btn-sm" href={certificate.downloadUrl} download aria-label={`Download ${certificate.title} certificate for ${certificate.subject} (PDF)`}>
                        <Download size={15} aria-hidden="true" /> PDF
                      </a>
                    ) : (
                      <button type="button" className="btn btn-outline btn-sm" disabled title="The PDF is still being prepared" aria-label={`${certificate.title} certificate for ${certificate.subject}: PDF not ready yet`}>
                        <Download size={15} aria-hidden="true" /> PDF
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="community-card" aria-labelledby="points-month-title">
            <h2 id="points-month-title" className="community-side-title community-side-title-tight">Points this month</h2>
            <div className="community-points-month">
              <span>Earned in {monthOnly.format(now)}</span>
              <strong>+{numberFormat.format(pointsThisMonth.earned)}</strong>
            </div>
            <div className="community-progress community-progress-wide community-progress-gradient" role="progressbar" aria-label="Progress to the top 10" aria-valuenow={pointsThisMonth.top10Progress} aria-valuemin={0} aria-valuemax={100}>
              <span style={{ width: `${pointsThisMonth.top10Progress}%` }} />
            </div>
            <p className="community-side-note community-points-note">
              {pointsThisMonth.pointsToTop10 > 0 ? `${numberFormat.format(pointsThisMonth.pointsToTop10)} points to reach the top 10 · ` : "You're in the top 10 · "}
              <Link to="/community/leaderboard">Leaderboard</Link>
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, tone }) {
  return (
    <div className="community-stat">
      <span className={`community-icon tone-${tone}`}><Icon size={20} aria-hidden="true" /></span>
      <div className="min-w-0">
        <p className="community-stat-label">{label}</p>
        <strong className="community-stat-value">{value ?? "—"}</strong>
      </div>
    </div>
  );
}
