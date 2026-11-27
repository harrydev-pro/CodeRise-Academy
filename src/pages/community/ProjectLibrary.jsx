import { useRef } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Crown, Search } from "lucide-react";

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { getCommunityProjects } from "../../features/community/communityService";
import { FilterChip, NoResults, Pager } from "../../features/community/listControls";
import { readPage, useCommunityList, useDebouncedSearch, useUrlFilters } from "../../features/community/listHooks";
import ProjectCard from "../../features/community/ProjectCard";

const LEVELS = ["Beginner", "Intermediate", "Advanced", "Professional"];
const SORTS = [
  { value: "popular", label: "Most popular" },
  { value: "recent", label: "Recently added" },
];

// URL: ?q=&category=&access=&level=&sort=&page=
function readFilters(params) {
  const access = params.get("access");
  const level = params.get("level");
  return {
    search: params.get("q") ?? "",
    category: params.get("category") ?? "",
    access: access === "free" || access === "premium" ? access : "",
    level: LEVELS.includes(level) ? level : "",
    sort: params.get("sort") === "recent" ? "recent" : "popular",
    page: readPage(params),
  };
}

export default function ProjectLibrary() {
  const { params, update, clear } = useUrlFilters({ sort: "popular" });
  const filters = readFilters(params);
  const { data, error, loading, refreshing, reload } = useCommunityList(getCommunityProjects, filters);
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

  const hasFilters = Boolean(filters.search || filters.category || filters.access || filters.level || filters.sort !== "popular");
  const allSelected = !filters.access && !filters.level;

  return (
    <div className="community-library">
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">PROJECT LIBRARY</span>
          <h1>Real-world projects</h1>
          {data && (
            <p>
              {data.totalAll} practical projects across {data.categories?.length ?? 0} skill categories. Pick one, build it, and get reviewed.
            </p>
          )}
        </div>
        <Link to="/community/my-projects" className="btn btn-outline">
          <ClipboardList size={17} aria-hidden="true" /> My community projects
        </Link>
      </header>

      {data?.isSample && (
        <p className="community-sample-notice" role="status">
          Showing sample data: the Community API is not available yet. This notice only appears on the local dev server.
        </p>
      )}

      <section className="community-card community-filters" aria-label="Search and filter projects">
        <div className="community-filter-row">
          <label className="community-search">
            <span className="sr-only">Search projects</span>
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              className="ui-input"
              placeholder="Search projects, skills or tools"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
            />
          </label>
          <label className="community-select">
            <span className="sr-only">Category</span>
            <select className="ui-input" value={filters.category} onChange={(event) => update({ category: event.target.value })}>
              <option value="">All categories</option>
              {(data?.categories ?? []).map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
          </label>
          <label className="community-select">
            <span className="sr-only">Sort projects</span>
            <select className="ui-input" value={filters.sort} onChange={(event) => update({ sort: event.target.value })}>
              {SORTS.map((sort) => <option key={sort.value} value={sort.value}>Sort: {sort.label}</option>)}
            </select>
          </label>
        </div>

        <div className="community-chips">
          <div className="community-chip-group" role="group" aria-label="Access">
            <FilterChip active={allSelected} onClick={() => update({ access: "", level: "" })}>All</FilterChip>
            <FilterChip active={filters.access === "free"} onClick={() => update({ access: filters.access === "free" ? "" : "free" })}>Free</FilterChip>
            <FilterChip active={filters.access === "premium"} onClick={() => update({ access: filters.access === "premium" ? "" : "premium" })}>
              <Crown size={14} aria-hidden="true" /> Premium
            </FilterChip>
          </div>
          <div className="community-chip-group" role="group" aria-label="Level">
            {LEVELS.map((level) => (
              <FilterChip key={level} active={filters.level === level} onClick={() => update({ level: filters.level === level ? "" : level })}>{level}</FilterChip>
            ))}
          </div>
          <div className="community-chip-group" role="group" aria-label="Sort">
            <FilterChip active={filters.sort === "recent"} onClick={() => update({ sort: "recent" })}>Recently added</FilterChip>
            <FilterChip active={filters.sort === "popular"} onClick={() => update({ sort: "popular" })}>Most popular</FilterChip>
          </div>
        </div>

        <div className="community-filter-footer">
          <p aria-live="polite">
            {data ? `Showing ${data.projects.length} of ${data.pagination.total} ${data.pagination.total === 1 ? "project" : "projects"}` : " "}
          </p>
          {hasFilters && <button type="button" className="community-link-button" onClick={clearFilters}>Clear filters</button>}
        </div>
      </section>

      <div ref={listTop} className="community-scroll-anchor" />

      {loading && <Loader label="Loading projects…" />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && !error && (
        data.projects.length === 0 ? (
          <NoResults onClear={clearFilters} />
        ) : (
          <>
            <div className={`community-projects${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing}>
              {data.projects.map((project) => (
                <ProjectCard
                  key={project.slug}
                  project={project}
                  canOpenPremium={Boolean(data.viewerHasPremium)}
                  lockedAction="preview"
                  premiumFromPrice={data.premiumFromPrice}
                  showStarted
                />
              ))}
            </div>
            <Pager pagination={data.pagination} onPage={goToPage} label="Project pages" arrows />
          </>
        )
      )}
    </div>
  );
}
