import { useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowDown, ArrowUp, Crown, Minus } from "lucide-react";

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { getLeaderboard } from "../../features/community/communityService";
import { FilterChip, Pager } from "../../features/community/listControls";
import { readPage, useCommunityList, useUrlFilters } from "../../features/community/listHooks";
import { useAuth } from "../../hooks/useAuth";

const PERIODS = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "alltime", label: "All-time" },
];
const GOLD_BADGES = new Set(["Hackathon Champion", "Competition Winner"]);
const numberFormat = new Intl.NumberFormat("en-GB");
const ordinal = (rank) => {
  const tens = rank % 100;
  if (tens >= 11 && tens <= 13) return `${rank}th`;
  return `${rank}${{ 1: "st", 2: "nd", 3: "rd" }[rank % 10] ?? "th"}`;
};

function initials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "?";
}
function avatarTone(username = "") {
  let hash = 0;
  for (const char of username) hash = (hash * 31 + char.charCodeAt(0)) % 997;
  return `avatar-${hash % 4}`;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const { params, update } = useUrlFilters({ period: "monthly" });
  const period = PERIODS.some((item) => item.value === params.get("period")) ? params.get("period") : "monthly";
  const category = params.get("category") ?? "";
  const page = readPage(params);
  const { data, error, loading, refreshing, reload } = useCommunityList(getLeaderboard, { period, category, page });
  const tableTop = useRef(null);

  if (loading) return <Loader label="Loading the leaderboard…" />;
  if (error && !data) return <ErrorMessage message={error} onRetry={reload} />;

  const { viewer, pagination } = data;
  const showPodium = pagination.page === 1 && data.podium.length > 0;
  // The podium already shows the top three, so the table starts at 4th on the first page.
  const rows = showPodium ? data.entries.filter((entry) => entry.rank > data.podium.length) : data.entries;
  const viewerOnPage = viewer && data.entries.some((entry) => entry.username === viewer.username);
  const viewerInitial = (user?.name || user?.fullName || viewer?.name || "Y").trim().charAt(0).toUpperCase();
  const firstRank = data.entries[0]?.rank ?? 0;
  const lastRank = data.entries[data.entries.length - 1]?.rank ?? 0;

  return (
    <div className="community-library">
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">COMMUNITY RECOGNITION</span>
          <h1>Leaderboard</h1>
          <p>Points come only from verified activity: approved projects, hackathons, competitions and helping others.</p>
        </div>
        {viewer && (
          <div className="community-rank-card">
            <span className="community-avatar avatar-you community-avatar-md" aria-hidden="true">{viewerInitial}</span>
            <div>
              <span>Your rank · {data.periodLabel}</span>
              <strong>#{viewer.rank} · {numberFormat.format(viewer.points)} pts</strong>
            </div>
          </div>
        )}
      </header>

      {data.isSample && (
        <p className="community-sample-notice" role="status">
          Showing sample data: the Community API is not available yet. This notice only appears on the local dev server.
        </p>
      )}

      <div className="community-hackathon-toolbar">
        <div className="community-chips" role="group" aria-label="Time period">
          {PERIODS.map((item) => (
            <FilterChip key={item.value} active={period === item.value} onClick={() => update({ period: item.value })}>{item.label}</FilterChip>
          ))}
        </div>
        <label className="community-inline-select">
          <span>Category</span>
          <select className="ui-input" value={category} onChange={(event) => update({ category: event.target.value })}>
            <option value="">All categories</option>
            {data.categories.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
      </div>

      {error && <ErrorMessage message={error} onRetry={reload} />}

      <div className="community-leaderboard-layout">
        <div className={`community-leaderboard-main${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing}>
          {showPodium && <Podium podium={data.podium} />}

          <section className="community-card community-leaderboard-card" aria-label={`Leaderboard, ${data.periodLabel}${category ? `, ${category}` : ""}`} ref={tableTop}>
            {data.entries.length === 0 ? (
              <p className="muted-text">No one has earned points in this category yet.</p>
            ) : (
              <>
                <div className="community-table-wrap" tabIndex={0} role="region" aria-label="Rankings table (scrolls sideways)">
                  <table className="community-table">
                    <thead>
                      <tr>
                        <th scope="col">Rank</th>
                        <th scope="col">Member</th>
                        <th scope="col">Category</th>
                        <th scope="col">Badges</th>
                        <th scope="col" className="is-number">Points</th>
                        <th scope="col" className="is-center">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((entry) => (
                        <LeaderRow key={entry.username} entry={entry} isViewer={entry.username === viewer?.username} viewerInitial={viewerInitial} />
                      ))}
                      {viewer && !viewerOnPage && (
                        <>
                          <tr className="community-table-gap" aria-hidden="true"><td colSpan={6}>· · ·</td></tr>
                          <LeaderRow entry={viewer} isViewer viewerInitial={viewerInitial} />
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="community-list-footer community-leaderboard-footer">
                  <p>Showing {firstRank}–{lastRank} of {numberFormat.format(pagination.total)} members</p>
                  <Pager
                    pagination={pagination}
                    label="Leaderboard pages"
                    onPage={(next) => {
                      update({ page: next });
                      tableTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  />
                </div>
              </>
            )}
          </section>
        </div>

        <aside className="community-showcase-side" aria-label="Points and milestones">
          <section className="community-card" aria-labelledby="points-title">
            <h2 id="points-title" className="community-side-title community-side-title-tight">How points work</h2>
            <p className="community-side-note">Awarded automatically after an admin verifies the activity. Values may change.</p>
            <dl className="community-points-list">
              {data.pointRules.map((rule) => (
                <div key={rule.label}>
                  <dt>{rule.label}</dt>
                  <dd>{rule.points}</dd>
                </div>
              ))}
            </dl>
          </section>

          {viewer && <Milestone viewer={viewer} />}
        </aside>
      </div>
    </div>
  );
}

function Podium({ podium }) {
  // Shown as 2nd, 1st, 3rd, with 1st raised in the middle.
  const order = [podium[1], podium[0], podium[2]].filter(Boolean);
  return (
    <ol className="community-podium" aria-label="Top three">
      {order.map((entry) => (
        <li key={entry.username} className={`community-podium-place place-${entry.rank}`}>
          {entry.rank === 1 && <Crown className="community-podium-crown" size={26} aria-hidden="true" />}
          <span className="community-podium-avatar" aria-hidden="true">{initials(entry.name)}</span>
          <span className="community-podium-rank">{ordinal(entry.rank)}</span>
          <Link to={`/community/u/${encodeURIComponent(entry.username)}`} className="community-podium-name">{entry.name}</Link>
          <span className="community-podium-category">{entry.category}</span>
          <strong className="community-podium-points">{numberFormat.format(entry.points)}<span className="sr-only"> points</span></strong>
        </li>
      ))}
    </ol>
  );
}

function Change({ value }) {
  if (!value) return <span className="community-change is-same" title="No change"><Minus size={16} aria-hidden="true" /><span className="sr-only">No change</span></span>;
  const up = value > 0;
  const places = Math.abs(value);
  return (
    <span className={`community-change ${up ? "is-up" : "is-down"}`} title={`${up ? "Up" : "Down"} ${places} ${places === 1 ? "place" : "places"}`}>
      {up ? <ArrowUp size={16} aria-hidden="true" /> : <ArrowDown size={16} aria-hidden="true" />}
      {places}
      <span className="sr-only"> {up ? "up" : "down"}</span>
    </span>
  );
}

function LeaderRow({ entry, isViewer, viewerInitial }) {
  return (
    <tr className={isViewer ? "is-viewer" : undefined} aria-current={isViewer ? "true" : undefined}>
      <td className="community-table-rank">{entry.rank}</td>
      <td>
        <span className="community-table-member">
          <span className={`community-avatar ${isViewer ? "community-avatar-viewer" : avatarTone(entry.username)}`} aria-hidden="true">
            {isViewer ? viewerInitial : initials(entry.name)}
          </span>
          {isViewer
            ? <strong>You · {entry.name}</strong>
            : <Link to={`/community/u/${encodeURIComponent(entry.username)}`}>{entry.name}</Link>}
          {entry.premium && <span className="community-tag tag-purple">Premium</span>}
        </span>
      </td>
      <td>{entry.category}</td>
      <td>{entry.badge ? <span className={`community-tag ${GOLD_BADGES.has(entry.badge) ? "tag-amber" : "tag-blue"}`}>{entry.badge}</span> : <span className="muted-text">—</span>}</td>
      <td className="is-number"><strong>{numberFormat.format(entry.points)}</strong></td>
      <td className="is-center"><Change value={entry.change} /></td>
    </tr>
  );
}

function Milestone({ viewer }) {
  const inTopTen = viewer.rank <= 10;
  const progress = viewer.top10Points > 0 ? Math.min(100, Math.round((viewer.points / viewer.top10Points) * 100)) : 100;
  return (
    <section className="community-card" aria-labelledby="milestone-title">
      <h2 id="milestone-title" className="community-side-title community-side-title-tight">Your next milestone</h2>
      <p className="community-side-note">
        {inTopTen ? "You're in the top 10. Keep it up to stay there." : `${numberFormat.format(viewer.pointsToTop10)} points to reach the top 10`}
      </p>
      <div className="community-progress community-progress-wide community-progress-gradient" role="progressbar" aria-label="Progress to the top 10" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${progress}%` }} />
      </div>
      <Link to="/community/projects" className="btn btn-outline btn-sm community-milestone-link">Find a project</Link>
    </section>
  );
}
