import { useRef } from "react";
import { Link } from "react-router-dom";
import { Clock, Crown, Lock, Search, UserRound } from "lucide-react";

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { COLLABORATIONS_PAGE_SIZE, getCommunityCollaborations } from "../../features/community/communityService";
import { FilterChip, NoResults, Pager } from "../../features/community/listControls";
import { readPage, useCommunityList, useDebouncedSearch, useUrlFilters } from "../../features/community/listHooks";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const SORTS = [
  { value: "open", label: "Most open slots" },
  { value: "newest", label: "Newest" },
  { value: "shortest", label: "Shortest first" },
];

// URL: ?q=&category=&access=&open=1&level=&sort=&page=
function readFilters(params) {
  const access = params.get("access");
  const level = params.get("level");
  const sort = params.get("sort");
  return {
    search: params.get("q") ?? "",
    category: params.get("category") ?? "",
    access: access === "free" || access === "premium" ? access : "",
    open: params.get("open") === "1" ? "1" : "",
    level: LEVELS.includes(level) ? level : "",
    sort: SORTS.some((item) => item.value === sort) ? sort : "open",
    page: readPage(params),
  };
}

export default function CollaborationLibrary() {
  const { params, update, clear } = useUrlFilters({ sort: "open" });
  const filters = readFilters(params);
  const { data, error, loading, refreshing, reload } = useCommunityList(getCommunityCollaborations, filters);
  const [searchText, setSearchText] = useDebouncedSearch(filters.search, (q) => update({ q }));
  const listTop = useRef(null);

  function clearFilters() {
    setSearchText("");
    clear();
  }

  function goToPage(page) {
    update({ page });
    listTop.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const counts = data?.counts;
  const allSelected = !filters.access && !filters.open && !filters.level;
  const pagination = data?.pagination;
  const firstShown = pagination ? (pagination.page - 1) * COLLABORATIONS_PAGE_SIZE + 1 : 0;
  const lastShown = pagination ? firstShown + data.collaborations.length - 1 : 0;

  return (
    <div className="community-library">
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">COLLABORATION PROJECTS</span>
          <h1>Build real projects as a team</h1>
          <p>Join a team of 2–3 learners, split the work by role and submit one final project together.</p>
        </div>
        {data?.viewerTeam && (
          <Link to={`/community/teams/${encodeURIComponent(data.viewerTeam.id)}`} className="btn btn-outline">
            <UserRound size={17} aria-hidden="true" /> My team: {data.viewerTeam.name}
          </Link>
        )}
      </header>

      {data?.isSample && (
        <p className="community-sample-notice" role="status">
          Showing sample data: the Community API is not available yet. This notice only appears on the local dev server.
        </p>
      )}

      <section className="community-card community-filters" aria-label="Search and filter collaboration projects">
        <div className="community-filter-row">
          <label className="community-search">
            <span className="sr-only">Search collaboration projects</span>
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              className="ui-input"
              placeholder="Search by project, skill or role"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </label>
          <label className="community-select community-select-labeled">
            <span className="community-select-label">Category</span>
            <select className="ui-input" value={filters.category} onChange={(event) => update({ category: event.target.value })}>
              <option value="">All categories</option>
              {(data?.categories ?? []).map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label className="community-select community-select-labeled community-select-narrow">
            <span className="community-select-label">Sort</span>
            <select className="ui-input" value={filters.sort} onChange={(event) => update({ sort: event.target.value })}>
              {SORTS.map((sort) => <option key={sort.value} value={sort.value}>{sort.label}</option>)}
            </select>
          </label>
        </div>

        <div className="community-chips" role="group" aria-label="Filter collaboration projects">
          <FilterChip active={allSelected} count={counts?.all} onClick={() => update({ access: "", open: "", level: "" })}>All</FilterChip>
          <FilterChip active={filters.access === "free"} count={counts?.free} onClick={() => update({ access: filters.access === "free" ? "" : "free" })}>Free</FilterChip>
          <FilterChip active={filters.access === "premium"} count={counts?.premium} onClick={() => update({ access: filters.access === "premium" ? "" : "premium" })}>
            <Crown size={14} aria-hidden="true" /> Premium
          </FilterChip>
          <FilterChip active={filters.open === "1"} count={counts?.open} onClick={() => update({ open: filters.open ? "" : "1" })}>Has open slots</FilterChip>
          {LEVELS.map((level) => (
            <FilterChip key={level} active={filters.level === level} onClick={() => update({ level: filters.level === level ? "" : level })}>{level}</FilterChip>
          ))}
        </div>
      </section>

      <div ref={listTop} className="community-scroll-anchor" />

      {loading && <Loader label="Loading collaboration projects…" />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && !error && (
        data.collaborations.length === 0 ? (
          <NoResults onClear={clearFilters} noun="collaboration projects" />
        ) : (
          <>
            <div className={`community-projects${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing}>
              {data.collaborations.map((item) => (
                <CollaborationCard key={item.id} item={item} canOpenPremium={Boolean(data.viewerHasPremium)} />
              ))}
            </div>
            <div className="community-list-footer">
              <p aria-live="polite">Showing {firstShown}–{lastShown} of {pagination.total} {pagination.total === 1 ? "project" : "projects"}</p>
              <Pager pagination={pagination} onPage={goToPage} label="Collaboration pages" />
            </div>
          </>
        )
      )}
    </div>
  );
}

function CollaborationCard({ item, canOpenPremium }) {
  const premium = item.access === "premium";
  const locked = premium && !canOpenPremium;
  const full = item.openSlots <= 0;
  const detailsPath = `/community/collaborate/${encodeURIComponent(item.id)}`;
  const members = item.memberInitials ?? [];

  let action;
  if (locked) {
    action = <Link to="/premium" className="btn btn-outline btn-sm" aria-label={`Unlock ${item.title} with Premium`}><Lock size={15} aria-hidden="true" /> Unlock</Link>;
  } else if (full) {
    action = <Link to={`${detailsPath}/team/new`} className="btn btn-outline btn-sm" aria-label={`Start a new team for ${item.title}`}>Start a new team</Link>;
  } else {
    action = <Link to={detailsPath} className="btn btn-primary btn-sm" aria-label={`View details: ${item.title}`}>View details</Link>;
  }

  return (
    <article className="community-card community-collab-card">
      <div className="community-collab-card-top">
        <span className={`community-tag ${premium ? "tag-purple" : "tag-green"}`}>
          {premium && <Crown size={12} aria-hidden="true" />}{premium ? "Premium" : "Free"}
        </span>
        <span className={`community-tag ${full ? "tag-neutral" : "tag-blue"}`}>
          {full ? "Teams full" : `${item.openSlots} ${item.openSlots === 1 ? "slot" : "slots"} open`}
        </span>
      </div>
      <p className="community-project-track">{item.teamType}</p>
      <h3>{item.title}</h3>
      <p className="community-project-text">{item.description}</p>
      {item.skills?.length > 0 && (
        <ul className="community-skill-list" aria-label="Skills">
          {item.skills.map((skill) => <li key={skill} className="community-skill">{skill}</li>)}
        </ul>
      )}
      <div className="community-project-meta">
        <span className="community-chip">{item.level}</span>
        <span className="community-duration"><Clock size={14} aria-hidden="true" /> {item.duration}</span>
        <span className="community-duration"><UserRound size={14} aria-hidden="true" /> Teams of {item.teamSize}</span>
      </div>
      <div className="community-collab-card-footer">
        {full ? (
          <p className="community-collab-teams">All {item.teamsCount} teams are full</p>
        ) : (
          <div className="community-collab-team">
            <span className="community-avatars" aria-label={`${members.length} ${members.length === 1 ? "member" : "members"}, ${item.openSlots} open ${item.openSlots === 1 ? "slot" : "slots"}`}>
              {members.map((initials, index) => <span key={`${initials}-${index}`} className={`community-avatar avatar-${index % 4}`} aria-hidden="true">{initials}</span>)}
              {Array.from({ length: item.openSlots }, (_, index) => <span key={`open-${index}`} className="community-avatar community-avatar-open" aria-hidden="true" />)}
            </span>
            <span className="community-collab-teams">{item.teamsCount} {item.teamsCount === 1 ? "team" : "teams"}</span>
          </div>
        )}
        {action}
      </div>
    </article>
  );
}
