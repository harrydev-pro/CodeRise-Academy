import { Link } from "react-router-dom";
import { Clock3, ClipboardList, Crown, DollarSign, FolderOpen, Trophy, Users, UsersRound, Zap } from "lucide-react";

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import { BarList, LineChart } from "../../../components/ui/Charts";
import { getAdminCommunityOverview } from "../../../features/community/admin/adminCommunityService";
import { useCommunityList, useUrlFilters } from "../../../features/community/listHooks";

const PROJECT_TYPES = {
  premium_project: { label: "Premium project", tone: "purple" },
  free_project: { label: "Free project", tone: "green" },
  collaboration: { label: "Collaboration", tone: "blue" },
  competition: { label: "Competition", tone: "amber" },
};
const numberFormat = new Intl.NumberFormat("en-GB");
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const dayMonth = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const isoDay = (date) => date.toISOString().slice(0, 10);

function daysAgo(iso) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
  return days === 0 ? "today" : days === 1 ? "1 day ago" : `${days} days ago`;
}

// Default period: the first of this month to today.
function defaultRange() {
  const today = new Date();
  return { from: isoDay(new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))), to: isoDay(today) };
}

export default function AdminCommunityOverview() {
  const { params, update } = useUrlFilters();
  const fallback = defaultRange();
  const range = { from: params.get("from") || fallback.from, to: params.get("to") || fallback.to };
  const { data, error, loading, refreshing, reload } = useCommunityList(getAdminCommunityOverview, range);

  return (
    <section className="admin-page community-admin">
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">COMMUNITY MANAGEMENT</span>
          <h1>Community overview</h1>
          <p>Live figures from the database. Revenue shown in USD for the selected period.</p>
        </div>
        <div className="community-admin-range" role="group" aria-label="Period">
          <label>
            <span className="sr-only">From</span>
            <input type="date" className="ui-input" value={range.from} max={range.to} onChange={(event) => event.target.value && update({ from: event.target.value })} />
          </label>
          <label>
            <span className="sr-only">To</span>
            <input type="date" className="ui-input" value={range.to} min={range.from} max={fallback.to} onChange={(event) => event.target.value && update({ to: event.target.value })} />
          </label>
        </div>
      </header>

      {loading && <Loader label="Loading community figures…" />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && (
        <div className={`community-admin-body${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing}>
          {data.isSample && (
            <p className="community-sample-notice" role="status">
              Showing sample data: the admin Community API is not available yet. This notice only appears on the local dev server.
            </p>
          )}

          <OverviewStats stats={data.stats} />

          <div className="community-admin-grid-2">
            <section className="ui-card" aria-labelledby="premium-trend-title">
              <div className="ui-card-header">
                <h2 id="premium-trend-title">Premium subscribers</h2>
                <span className="community-timeline-month">Last {data.premiumTrend.length} weeks</span>
              </div>
              <LineChart
                points={data.premiumTrend}
                label="Premium subscribers"
                caption={data.premiumTrend.length ? `Premium subscribers: ${data.premiumTrend[0].count} → ${data.premiumTrend[data.premiumTrend.length - 1].count}` : undefined}
              />
            </section>

            <section className="ui-card" aria-labelledby="by-category-title">
              <div className="ui-card-header">
                <h2 id="by-category-title">Submissions by category</h2>
                <span className="community-timeline-month">Selected period</span>
              </div>
              <BarList items={data.submissionsByCategory} empty="No submissions in this period." />
            </section>
          </div>

          <section className="ui-card community-admin-table-card" aria-labelledby="pending-title">
            <div className="ui-card-header">
              <h2 id="pending-title">Oldest pending reviews</h2>
              <Link to="/admin/community/submissions" className="btn btn-outline btn-sm">Open submission queue</Link>
            </div>
            {data.oldestPending.length === 0 ? <p className="muted-text">Nothing is waiting for review.</p> : (
              <div className="community-table-wrap" tabIndex={0} role="region" aria-label="Oldest pending reviews (scrolls sideways)">
                <table className="community-table">
                  <thead>
                    <tr>
                      <th scope="col">Student</th>
                      <th scope="col">Project</th>
                      <th scope="col">Type</th>
                      <th scope="col">Submitted</th>
                      <th scope="col">Reviewer</th>
                      <th scope="col"><span className="sr-only">Action</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.oldestPending.map((item) => {
                      const type = PROJECT_TYPES[item.projectType] ?? { label: item.projectType, tone: "neutral" };
                      const reviewPath = `/admin/community/submissions/${encodeURIComponent(item.id)}`;
                      return (
                        <tr key={item.id}>
                          <td><strong>{item.student}</strong></td>
                          <td><Link to={reviewPath} className="community-admin-link">{item.project}</Link></td>
                          <td><span className={`community-tag tag-${type.tone}`}>{type.label}</span></td>
                          <td>{dayMonth.format(new Date(item.submittedAt))} · {daysAgo(item.submittedAt)}</td>
                          <td>{item.reviewer ?? <span className="muted-text">Unassigned</span>}</td>
                          <td className="is-number"><Link to={reviewPath} className="btn btn-outline btn-sm" aria-label={`Review ${item.project} by ${item.student}`}>Review</Link></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="community-admin-grid-2">
            <section className="ui-card" aria-labelledby="events-title">
              <h2 id="events-title">Upcoming events</h2>
              {data.upcomingEvents.length === 0 ? <p className="muted-text">No hackathons or competitions are scheduled.</p> : (
                <ul className="community-list">
                  {data.upcomingEvents.map((event) => (
                    <li key={`${event.type}-${event.id}`} className="community-admin-event">
                      <Link to={`/admin/community/${event.type === "hackathon" ? "hackathons" : "competitions"}/${encodeURIComponent(event.id)}/participants`} className="community-creator-name">
                        <strong>{event.title}</strong>
                        <span>{event.detail}</span>
                      </Link>
                      <span className={`community-tag ${event.type === "hackathon" ? "tag-amber" : "tag-blue"}`}>{event.type === "hackathon" ? "Hackathon" : "Competition"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="ui-card" aria-labelledby="actions-title">
              <h2 id="actions-title">Quick actions</h2>
              <div className="community-admin-actions">
                <Link to="/admin/community/projects/new" className="btn btn-primary">New project</Link>
                <Link to="/admin/community/hackathons/new" className="btn btn-outline">New hackathon</Link>
                <Link to="/admin/community/competitions/new" className="btn btn-outline">New competition</Link>
                <Link to="/admin/community/announcements?new=1" className="btn btn-outline">New announcement</Link>
                <Link to="/admin/community/moderation" className="btn btn-outline">Moderation queue{data.moderationQueue ? ` (${data.moderationQueue})` : ""}</Link>
                <Link to="/admin/community/members?grant=premium" className="btn btn-outline">Grant Premium</Link>
              </div>
            </section>
          </div>
        </div>
      )}
    </section>
  );
}

function OverviewStats({ stats }) {
  const conversion = typeof stats.premiumConversion === "number" ? `${stats.premiumConversion.toFixed(1)}% conversion` : undefined;
  return (
    <div className="community-admin-stats">
      <AdminStat label="Community members" value={numberFormat.format(stats.members)} icon={Users} tone="blue" hint={stats.membersThisMonth ? `+${numberFormat.format(stats.membersThisMonth)} this month` : undefined} hintTone="good" to="/admin/community/members" />
      <AdminStat label="Active Premium members" value={numberFormat.format(stats.premiumMembers)} icon={Crown} tone="purple" hint={conversion} hintTone="good" to="/admin/community/subscriptions" />
      <AdminStat label="Total projects" value={numberFormat.format(stats.projects)} icon={FolderOpen} tone="green" hint={`${stats.freeProjects} free · ${stats.premiumProjects} Premium`} to="/admin/community/projects" />
      <AdminStat label="Active collaboration teams" value={numberFormat.format(stats.activeTeams)} icon={UsersRound} tone="teal" to="/admin/community/teams" />
      <AdminStat label="Active hackathons" value={stats.activeHackathons} icon={Zap} tone="amber" hint={stats.scheduledHackathons ? `${stats.scheduledHackathons} scheduled` : undefined} to="/admin/community/hackathons" />
      <AdminStat label="Active competitions" value={stats.activeCompetitions} icon={Trophy} tone="orange" to="/admin/community/competitions" />
      <AdminStat label="Total submissions" value={numberFormat.format(stats.submissions)} icon={ClipboardList} tone="sky" to="/admin/community/submissions" />
      <AdminStat
        label="Pending reviews"
        value={numberFormat.format(stats.pendingReviews)}
        icon={Clock3}
        tone="amber"
        alert={stats.pendingOlderThan3Days > 0}
        hint={stats.pendingOlderThan3Days ? `${stats.pendingOlderThan3Days} older than 3 days` : undefined}
        hintTone="warn"
        to="/admin/community/submissions?status=pending"
      />
      <AdminStat label="Competition revenue" value={usd.format(stats.competitionRevenueUsd)} icon={DollarSign} tone="green" to="/admin/community/payments" />
      <AdminStat
        label="Subscription revenue (MRR)"
        value={usd.format(stats.mrrUsd)}
        icon={DollarSign}
        tone="purple"
        hint={typeof stats.mrrChangeUsd === "number" ? `${stats.mrrChangeUsd >= 0 ? "+" : "−"}${usd.format(Math.abs(stats.mrrChangeUsd))} vs last month` : undefined}
        hintTone={stats.mrrChangeUsd >= 0 ? "good" : "warn"}
        to="/admin/community/subscriptions"
      />
    </div>
  );
}

function AdminStat({ label, value, icon: Icon, tone, hint, hintTone, alert = false, to }) {
  return (
    <Link to={to} className={`community-admin-stat${alert ? " is-alert" : ""}`}>
      <span className={`community-icon tone-${tone}`}><Icon size={20} aria-hidden="true" /></span>
      <span className="min-w-0">
        <span className="community-stat-label">{label}</span>
        <strong className="community-stat-value">{value}</strong>
        {hint && <span className={`community-admin-hint${hintTone ? ` is-${hintTone}` : ""}`}>{hint}</span>}
      </span>
    </Link>
  );
}
