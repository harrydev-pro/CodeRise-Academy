import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Download, Search } from "lucide-react";

import Loader from "../../../../components/common/Loader";
import ErrorMessage from "../../../../components/feedback/ErrorMessage";
import Toast from "../../../../components/feedback/Toast";
import {
  assignSubmissionReviewer,
  downloadCsv,
  exportAdminSubmissions,
  fullDate,
  getAdminSubmissions,
  numberFormat,
  SUBMISSION_STATUS,
  SUBMISSION_TYPES,
  SUBMISSIONS_PAGE_SIZE,
} from "../../../../features/community/admin/review/reviewService";
import { Avatar, CompetitionTabs, FilterSelect, SampleNotice, Tag } from "../../../../features/community/admin/review/reviewControls";
import { FilterChip, Pager } from "../../../../features/community/listControls";
import { readPage, useCommunityList, useDebouncedSearch, useUrlFilters } from "../../../../features/community/listHooks";

const STATUS_CHIPS = [
  { value: "", label: "All", count: "all" },
  { value: "pending_review", label: "Pending review", count: "pending_review" },
  { value: "under_review", label: "Under Review", count: "under_review" },
  { value: "needs_corrections", label: "Needs Corrections", count: "needs_corrections" },
  { value: "approved", label: "Approved", count: "approved" },
];
// Old links used ?status=pending (A01 overview).
const STATUS_ALIASES = { pending: "pending_review" };
const OPEN_STATUSES = ["pending_review", "under_review"];

function readFilters(params) {
  const raw = params.get("status") ?? "";
  const status = STATUS_ALIASES[raw] ?? raw;
  return {
    status: Object.keys(SUBMISSION_STATUS).includes(status) ? status : "",
    search: params.get("q") ?? "",
    project: params.get("project") ?? "",
    category: params.get("category") ?? "",
    type: Object.keys(SUBMISSION_TYPES).includes(params.get("type")) ? params.get("type") : "",
    reviewer: params.get("reviewer") ?? "",
    page: readPage(params),
  };
}

// A17 Submission management: one queue for every project, collaboration, hackathon and
// competition submission. Reviewers only receive the submissions they are assigned to.
export default function AdminSubmissions() {
  const { params, update } = useUrlFilters();
  const filters = readFilters(params);
  const { data, error, loading, refreshing, reload } = useCommunityList(getAdminSubmissions, filters);
  const [searchText, setSearchText] = useDebouncedSearch(filters.search, (q) => update({ q }));
  const [toast, setToast] = useState(null);
  const [assigning, setAssigning] = useState("");
  const [exporting, setExporting] = useState(false);
  const closeToast = useCallback(() => setToast(null), []);
  const sample = Boolean(data?.isSample);
  const isReviewer = data?.viewerRole === "reviewer";
  const rows = data?.submissions ?? [];
  const firstShown = data ? (data.pagination.page - 1) * SUBMISSIONS_PAGE_SIZE + 1 : 0;
  const competitionFilter = filters.type === "competition" && filters.project ? filters.project : "";

  async function assign(row, reviewerId) {
    setAssigning(row.id);
    try {
      await assignSubmissionReviewer(row.id, reviewerId, { sample });
      const name = data.reviewers.find((item) => item.id === reviewerId)?.name;
      setToast({ type: "success", message: name ? `${row.title} assigned to ${name}.` : `${row.title} is unassigned.` });
      reload();
    } catch (assignError) {
      setToast({ type: "error", message: assignError.message || "The reviewer could not be changed." });
    } finally {
      setAssigning("");
    }
  }

  async function exportCsv() {
    setExporting(true);
    try {
      const rest = { ...filters };
      delete rest.page;
      downloadCsv("community-submissions.csv", await exportAdminSubmissions(rest, { sample }));
      setToast({ type: "success", message: "Submissions exported." });
    } catch (exportError) {
      setToast({ type: "error", message: exportError.message || "The export failed. Please try again." });
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="admin-page community-admin">
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">COMMUNITY MANAGEMENT</span>
          <h1>Submissions</h1>
          <p>{isReviewer ? "Submissions assigned to you." : "Every project, collaboration, hackathon and competition submission in one queue."}</p>
        </div>
        {!isReviewer && <button type="button" className="btn btn-outline" onClick={exportCsv} disabled={exporting || !data}><Download size={17} aria-hidden="true" /> {exporting ? "Exporting…" : "Export CSV"}</button>}
      </header>

      {competitionFilter && <CompetitionTabs id={competitionFilter} current="submissions" viewerRole={data?.viewerRole} />}
      {sample && <SampleNotice />}

      <div className="community-chips" role="group" aria-label="Filter by status">
        {STATUS_CHIPS.map((chip) => (
          <FilterChip key={chip.label} active={filters.status === chip.value} onClick={() => update({ status: chip.value })} count={data ? data.counts?.[chip.count] ?? 0 : undefined}>
            {chip.label}
          </FilterChip>
        ))}
      </div>

      <section className="ui-card community-admin-filters" aria-label="Filter submissions">
        <div className="community-admin-filter-row car-submission-filters">
          <label className="community-admin-field">
            <span>Student</span>
            <span className="community-search">
              <Search size={18} aria-hidden="true" />
              <input type="search" className="ui-input" placeholder="Name or email" value={searchText} onChange={(event) => setSearchText(event.target.value)} />
            </span>
          </label>
          <FilterSelect label="Project" value={filters.project} onChange={(project) => update({ project })} options={[{ value: "", label: "All projects" }, ...(data?.projects ?? []).map((item) => ({ value: item.id, label: item.title }))]} />
          <FilterSelect label="Category" value={filters.category} onChange={(category) => update({ category })} options={[{ value: "", label: "All categories" }, ...(data?.categories ?? []).map((item) => ({ value: item, label: item }))]} />
          <FilterSelect label="Type" value={filters.type} onChange={(type) => update({ type })} options={[{ value: "", label: "All types" }, ...Object.entries(SUBMISSION_TYPES).map(([value, item]) => ({ value, label: item.label }))]} />
          {!isReviewer && (
            <FilterSelect label="Reviewer" value={filters.reviewer} onChange={(reviewer) => update({ reviewer })} options={[{ value: "", label: "Anyone" }, { value: "unassigned", label: "Unassigned" }, ...(data?.reviewers ?? []).map((item) => ({ value: item.id, label: item.name }))]} />
          )}
        </div>
      </section>

      {loading && <Loader label="Loading submissions…" />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && (
        <section className={`ui-card community-admin-table-card${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing} aria-label="Submissions">
          {rows.length === 0 ? (
            <div className="community-empty">
              <h2>No submissions found</h2>
              <p className="muted-text">Nothing matches these filters. Try another status or clear a filter.</p>
            </div>
          ) : (
            <>
              <div className="community-table-wrap" tabIndex={0} role="region" aria-label="Submissions table (scrolls sideways)">
                <table className="community-table car-table-submissions">
                  <thead>
                    <tr>
                      <th scope="col">Student</th>
                      <th scope="col">Project</th>
                      <th scope="col">Type</th>
                      <th scope="col">Submitted</th>
                      <th scope="col">Status</th>
                      <th scope="col">Reviewer</th>
                      <th scope="col">Score</th>
                      <th scope="col"><span className="sr-only">Action</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => {
                      const reviewPath = `/admin/community/submissions/${encodeURIComponent(row.id)}`;
                      const canAssign = !isReviewer && OPEN_STATUSES.includes(row.status);
                      return (
                        <tr key={row.id}>
                          <td>
                            <span className="community-table-member">
                              <Avatar initials={row.studentInitials} index={index} />
                              <span><strong className="car-cell-title">{row.student}</strong><span className="car-cell-sub">{row.studentDetail}</span></span>
                            </span>
                          </td>
                          <td><Link to={reviewPath} className="community-admin-link">{row.title}</Link></td>
                          <td><Tag map={SUBMISSION_TYPES} value={row.projectType} /></td>
                          <td>{fullDate.format(new Date(row.submittedAt))}</td>
                          <td><Tag map={SUBMISSION_STATUS} value={row.status} /></td>
                          <td>
                            {canAssign ? (
                              <select className="ui-input car-reviewer-select" aria-label={`Reviewer for ${row.title} by ${row.student}`} value={row.reviewerId ?? ""} disabled={assigning === row.id} onChange={(event) => assign(row, event.target.value)}>
                                <option value="">Unassigned</option>
                                {data.reviewers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                              </select>
                            ) : row.reviewerName ?? <span className="muted-text">Unassigned</span>}
                          </td>
                          <td>{typeof row.score === "number" ? `${row.score}` : "—"}</td>
                          <td className="is-number">
                            <Link to={reviewPath} className={`btn btn-sm ${OPEN_STATUSES.includes(row.status) ? "btn-primary" : "btn-outline"}`} aria-label={`${OPEN_STATUSES.includes(row.status) ? "Review" : "Open"} ${row.title} by ${row.student}`}>
                              {OPEN_STATUSES.includes(row.status) ? "Review" : "Open"}
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="community-list-footer community-leaderboard-footer">
                <p>Showing {firstShown}–{firstShown + rows.length - 1} of {numberFormat.format(data.pagination.total)} submissions</p>
                <Pager pagination={data.pagination} onPage={(page) => update({ page })} label="Submission pages" arrows />
              </div>
            </>
          )}
        </section>
      )}
      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </section>
  );
}
