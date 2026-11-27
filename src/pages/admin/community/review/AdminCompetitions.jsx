import { Link } from "react-router-dom";
import { AlertCircle, BarChart3, CreditCard, DollarSign, Pencil, Plus, Search, Trophy, Users } from "lucide-react";

import Loader from "../../../../components/common/Loader";
import ErrorMessage from "../../../../components/feedback/ErrorMessage";
import {
  COMPETITION_STATUS,
  COMPETITIONS_PAGE_SIZE,
  fullDate,
  getAdminCompetitions,
  numberFormat,
  usd,
  usdShort,
} from "../../../../features/community/admin/review/reviewService";
import { FilterSelect, RowMenu, SampleNotice, SimplePager, StatTile, Tag } from "../../../../features/community/admin/review/reviewControls";
import { FilterChip } from "../../../../features/community/listControls";
import { readPage, useCommunityList, useDebouncedSearch, useUrlFilters } from "../../../../features/community/listHooks";

const STATUS_CHIPS = [
  { value: "", label: "All", count: "all" },
  { value: "open", label: "Open", count: "open" },
  { value: "judging", label: "Judging", count: "judging" },
  { value: "completed", label: "Completed", count: "completed" },
  { value: "draft", label: "Draft", count: "draft" },
];

function readFilters(params) {
  const status = params.get("status");
  return {
    search: params.get("q") ?? "",
    status: Object.keys(COMPETITION_STATUS).includes(status) ? status : "",
    category: params.get("category") ?? "",
    page: readPage(params),
  };
}

// A12 Competition management.
export default function AdminCompetitions() {
  const { params, update } = useUrlFilters();
  const filters = readFilters(params);
  const { data, error, loading, refreshing, reload } = useCommunityList(getAdminCompetitions, filters);
  const [searchText, setSearchText] = useDebouncedSearch(filters.search, (q) => update({ q }));
  const rows = data?.competitions ?? [];
  const stats = data?.stats;
  const freeLeft = stats ? Math.max(0, stats.freeLimit - stats.freeUsed) : 0;
  const firstShown = data ? (data.pagination.page - 1) * COMPETITIONS_PAGE_SIZE + 1 : 0;

  return (
    <section className="admin-page community-admin">
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">COMMUNITY MANAGEMENT</span>
          <h1>Competitions</h1>
          <p>Skill-based competitions with prizes. Entry fees are set per competition in USD.</p>
        </div>
        <Link to="/admin/community/competitions/new" className="btn btn-primary"><Plus size={17} aria-hidden="true" /> New competition</Link>
      </header>

      {data?.isSample && <SampleNotice />}
      {loading && <Loader label="Loading competitions…" />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="community-admin-stats car-stats-4">
            <StatTile label="Open competitions" value={numberFormat.format(stats.open)} icon={Trophy} tone="blue" />
            <StatTile label="Total entrants" value={numberFormat.format(stats.entrants)} icon={Users} tone="green" />
            <StatTile label="Entry fee revenue" value={usdShort.format(stats.entryFeeRevenueUsd)} icon={DollarSign} tone="purple" />
            <StatTile
              label="Free competitions used"
              value={`${stats.freeUsed} of ${stats.freeLimit}`}
              icon={AlertCircle}
              tone="amber"
              alert={freeLeft === 0}
              hint={freeLeft === 0 ? "New competitions default to paid" : `${freeLeft} free ${freeLeft === 1 ? "slot" : "slots"} left`}
              hintTone={freeLeft === 0 ? "warn" : "good"}
            />
          </div>

          <section className={`ui-card community-admin-table-card${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing} aria-label="Competitions">
            <div className="car-table-toolbar">
              <label className="community-search car-toolbar-search">
                <span className="sr-only">Search competitions</span>
                <Search size={18} aria-hidden="true" />
                <input type="search" className="ui-input" placeholder="Search competitions" value={searchText} onChange={(event) => setSearchText(event.target.value)} />
              </label>
              <div className="community-chips" role="group" aria-label="Filter by status">
                {STATUS_CHIPS.map((chip) => (
                  <FilterChip key={chip.label} active={filters.status === chip.value} onClick={() => update({ status: chip.value })} count={data.counts?.[chip.count] ?? 0}>
                    {chip.label}
                  </FilterChip>
                ))}
              </div>
              <div className="car-toolbar-select">
                <FilterSelect label="Category" hideLabel value={filters.category} onChange={(category) => update({ category })} options={[{ value: "", label: "All categories" }, ...(data.categories ?? []).map((item) => ({ value: item, label: item }))]} />
              </div>
            </div>

            {rows.length === 0 ? (
              <div className="community-empty">
                <h2>No competitions found</h2>
                <p className="muted-text">Try a different search or filter, or create a new competition.</p>
              </div>
            ) : (
              <>
                <div className="community-table-wrap" tabIndex={0} role="region" aria-label="Competitions table (scrolls sideways)">
                  <table className="community-table car-table-competitions">
                    <thead>
                      <tr>
                        <th scope="col">Competition</th>
                        <th scope="col">Category</th>
                        <th scope="col">Entry fee</th>
                        <th scope="col">Prize</th>
                        <th scope="col">Registration</th>
                        <th scope="col">Submission</th>
                        <th scope="col">Participants</th>
                        <th scope="col">Status</th>
                        <th scope="col"><span className="sr-only">Actions</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => {
                        const base = `/admin/community/competitions/${encodeURIComponent(row.id)}`;
                        const hasEntries = row.status !== "draft";
                        return (
                          <tr key={row.id}>
                            <td>
                              <Link to={hasEntries ? `${base}/participants` : `${base}/edit`} className="community-admin-link car-cell-title">{row.title}</Link>
                              <span className="car-cell-sub">Competition #{row.number}</span>
                            </td>
                            <td>{row.category}</td>
                            <td>{row.entryFeeUsd > 0 ? <span className="community-tag tag-blue">{usd.format(row.entryFeeUsd).replace(".00", "")}</span> : <span className="community-tag tag-green">Free</span>}</td>
                            <td className="car-cell-wrap">{row.prizeSummary}</td>
                            <td>{row.registrationClosesAt ? fullDate.format(new Date(row.registrationClosesAt)) : "—"}</td>
                            <td>{row.submissionDeadline ? fullDate.format(new Date(row.submissionDeadline)) : "—"}</td>
                            <td>{numberFormat.format(row.entrants)} / {numberFormat.format(row.participantLimit || 0)}</td>
                            <td><Tag map={COMPETITION_STATUS} value={row.status} /></td>
                            <td className="is-number">
                              <RowMenu
                                label={`Actions for ${row.title}`}
                                items={[
                                  { key: "edit", label: "Edit details", icon: Pencil, to: `${base}/edit` },
                                  ...(hasEntries ? [
                                    { key: "participants", label: "Participants", icon: Users, to: `${base}/participants` },
                                    ...(row.entryFeeUsd > 0 ? [{ key: "payments", label: "Payments", icon: CreditCard, to: `/admin/community/payments?competition=${encodeURIComponent(row.id)}` }] : []),
                                    { key: "results", label: "Results", icon: BarChart3, to: `${base}/results` },
                                  ] : []),
                                ]}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="community-list-footer community-leaderboard-footer">
                  <p>Showing {firstShown}–{firstShown + rows.length - 1} of {numberFormat.format(data.pagination.total)} competitions</p>
                  <SimplePager pagination={data.pagination} onPage={(page) => update({ page })} label="Competition pages" />
                </div>
              </>
            )}
          </section>
        </>
      )}
    </section>
  );
}
