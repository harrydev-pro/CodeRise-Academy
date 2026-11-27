import { Link } from "react-router-dom";
import { CircleCheck, Gift, Search, Trophy } from "lucide-react";

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { getCommunityCompetitions } from "../../features/community/communityService";
import { FilterChip, NoResults } from "../../features/community/listControls";
import { useCommunityList, useDebouncedSearch, useUrlFilters } from "../../features/community/listHooks";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "open", label: "Open" },
  { value: "free", label: "Free" },
  { value: "results", label: "Results" },
];

// Competition dates are shown in West Africa Time, like the rest of the Community.
const TIME_ZONE = "Africa/Lagos";
const longDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: TIME_ZONE });
const shortDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: TIME_ZONE });
const timeOnly = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: TIME_ZONE });
const numberFormat = new Intl.NumberFormat("en-GB");
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2, minimumFractionDigits: 0 });

function closingText(iso, withTime) {
  const date = new Date(iso);
  if (date.getTime() <= Date.now()) return `Closed ${shortDate.format(date)}`;
  return withTime ? `${longDate.format(date)}, ${timeOnly.format(date)} WAT` : longDate.format(date);
}

export default function CompetitionListing() {
  const { params, update } = useUrlFilters({ filter: "all" });
  const filter = FILTERS.some((item) => item.value === params.get("filter")) ? params.get("filter") : "all";
  const search = params.get("q") ?? "";
  const { data, error, loading, refreshing, reload } = useCommunityList(getCommunityCompetitions, { filter, search });
  const [searchText, setSearchText] = useDebouncedSearch(search, (q) => update({ q }));

  function clearFilters() {
    setSearchText("");
    update({ q: "", filter: "all" });
  }

  return (
    <div className="community-library">
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">SKILL COMPETITIONS</span>
          <h1>Competitions</h1>
          <p>Show your best work, get judged by industry reviewers and win prizes. All prices in USD.</p>
        </div>
        <Link to="/community/activities?tab=competitions" className="btn btn-outline">
          My registrations{typeof data?.viewerRegistrations === "number" ? ` (${data.viewerRegistrations})` : ""}
        </Link>
      </header>

      {data?.isSample && (
        <p className="community-sample-notice" role="status">
          Showing sample data: the Community API is not available yet. This notice only appears on the local dev server.
        </p>
      )}

      <p className="community-free-notice">
        <Gift size={20} aria-hidden="true" />
        <span><strong>Our first three competitions are free to enter.</strong> Paid competitions charge a small entry fee, shown on each card before you register.</span>
      </p>

      <div className="community-hackathon-toolbar">
        <div className="community-chips" role="group" aria-label="Filter competitions">
          {FILTERS.map((item) => (
            <FilterChip key={item.value} active={filter === item.value} count={data?.counts?.[item.value]} onClick={() => update({ filter: item.value })}>
              {item.label}
            </FilterChip>
          ))}
        </div>
        <label className="community-search community-search-compact">
          <span className="sr-only">Search competitions</span>
          <Search size={18} aria-hidden="true" />
          <input
            type="search"
            className="ui-input"
            placeholder="Search competitions"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
          />
        </label>
      </div>

      {loading && <Loader label="Loading competitions…" />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && !error && (
        data.competitions.length === 0 ? (
          search ? <NoResults onClear={clearFilters} noun="competitions" /> : (
            <div className="community-card community-empty">
              <span className="community-icon tone-purple"><Trophy size={22} aria-hidden="true" /></span>
              <h2>Nothing here yet</h2>
              <p className="muted-text">New competitions are announced in Announcements.</p>
            </div>
          )
        ) : (
          <div className={`community-competition-grid${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing}>
            {data.competitions.map((competition) => <CompetitionCard key={competition.id} competition={competition} />)}
          </div>
        )
      )}
    </div>
  );
}

function StatusTag({ competition, full }) {
  const { status } = competition;
  if (status === "results") return <span className="community-tag tag-neutral">Results published</span>;
  if (status === "closed") return <span className="community-tag tag-neutral">Registration closed</span>;
  if (full) return <span className="community-tag tag-neutral">Full</span>;
  if (status === "closing_soon") return <span className="community-tag tag-amber">Closing soon</span>;
  return <span className="community-tag tag-green">Open</span>;
}

function CompetitionCard({ competition }) {
  const detailsPath = `/community/competitions/${encodeURIComponent(competition.id)}`;
  const isOpen = competition.status === "open" || competition.status === "closing_soon";
  const full = competition.capacity > 0 && competition.participants >= competition.capacity;
  const fill = competition.capacity > 0 ? Math.min(100, Math.round((competition.participants / competition.capacity) * 100)) : 0;
  const free = !competition.entryFeeUsd;

  let actions;
  if (competition.status === "results") {
    actions = <Link to={`${detailsPath}/results`} className="btn btn-outline btn-sm" aria-label={`View results: ${competition.title}`}>View results</Link>;
  } else {
    actions = (
      <>
        <Link to={detailsPath} className="btn btn-outline btn-sm" aria-label={`View details: ${competition.title}`}>View details</Link>
        {competition.viewerRegistered && <span className="community-registered"><CircleCheck size={17} aria-hidden="true" /> Registered</span>}
        {!competition.viewerRegistered && isOpen && !full && (
          <Link to={`${detailsPath}/register`} className="btn btn-primary btn-sm" aria-label={`Register for ${competition.title}${free ? " (free entry)" : ` (${usd.format(competition.entryFeeUsd)} entry)`}`}>Register</Link>
        )}
      </>
    );
  }

  return (
    <article className="community-card community-competition-card">
      <div className="community-competition-top">
        <div className="community-tags">
          <StatusTag competition={competition} full={full} />
          {free
            ? <span className="community-tag tag-green">Free entry</span>
            : <span className="community-tag tag-blue">{usd.format(competition.entryFeeUsd)} entry</span>}
        </div>
        <span className="community-competition-number">Competition #{competition.number}</span>
      </div>
      <p className="community-project-track">{competition.category}</p>
      <h2>{competition.title}</h2>
      <p className="community-prize"><Trophy size={16} aria-hidden="true" /> {competition.prize}</p>

      <dl className="community-competition-dates">
        <div>
          <dt>Registration closes</dt>
          <dd>{closingText(competition.registrationClosesAt, false)}</dd>
        </div>
        <div>
          <dt>Submission deadline</dt>
          <dd>{closingText(competition.submissionDeadline, true)}</dd>
        </div>
      </dl>

      <div className="community-participants">
        <div className="community-participants-head">
          <span>Participants</span>
          <strong>{numberFormat.format(competition.participants)} / {numberFormat.format(competition.capacity)}</strong>
        </div>
        <div className="community-progress community-progress-wide" role="progressbar" aria-label={`${competition.title} places taken`} aria-valuenow={fill} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ width: `${fill}%` }} />
        </div>
      </div>

      <div className="community-hackathon-buttons">{actions}</div>
    </article>
  );
}
