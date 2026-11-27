import { Fragment, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ChevronDown, Download } from "lucide-react";

import Loader from "../../../../components/common/Loader";
import Modal from "../../../../components/common/Modal";
import ErrorMessage from "../../../../components/feedback/ErrorMessage";
import Toast from "../../../../components/feedback/Toast";
import { getAdminTeams, removeAdminTeam } from "../../../../features/community/admin/events/adminEventsService";
import { FilterSelect, ProgressBar, SampleNotice, SearchField, Tag } from "../../../../features/community/admin/events/EventControls";
import { downloadCsv, fileDate, formatDate, numberFormat, relativeTime, TEAM_STATUS, useNow } from "../../../../features/community/admin/events/eventHelpers";
import { Pager } from "../../../../features/community/listControls";
import { readPage, useCommunityList, useDebouncedSearch, useUrlFilters } from "../../../../features/community/listHooks";

// A07 Team Management: every collaboration team, its progress and each member's contribution.
const REASON_MIN = 10;

function readFilters(params) {
  return {
    search: params.get("q") ?? "",
    collaboration: params.get("project") ?? "",
    status: Object.keys(TEAM_STATUS).includes(params.get("status")) ? params.get("status") : "",
    page: readPage(params),
  };
}

const CSV_COLUMNS = [
  { label: "Team", value: (team) => team.name },
  { label: "Project", value: (team) => team.projectTitle },
  { label: "Members", value: (team) => `${team.members.length}/${team.maxMembers}` },
  { label: "Member names", value: (team) => team.members.map((member) => `${member.name}${member.isLeader ? " (leader)" : ""}`).join("; ") },
  { label: "Leader", value: (team) => team.members.find((member) => member.isLeader)?.name ?? "" },
  { label: "Progress %", value: (team) => team.progress },
  { label: "Status", value: (team) => TEAM_STATUS[team.status]?.label ?? team.status },
  { label: "Reports", value: (team) => team.reports },
  { label: "Last activity", value: (team) => team.lastActivityAt },
  { label: "Formed", value: (team) => team.formedAt },
  { label: "Deadline", value: (team) => team.deadline },
  { label: "Repository", value: (team) => team.repository },
];

export default function AdminTeams() {
  const { params, update } = useUrlFilters();
  const filters = readFilters(params);
  const { data, error, loading, refreshing, reload } = useCommunityList(getAdminTeams, filters);
  const [searchText, setSearchText] = useDebouncedSearch(filters.search, (q) => update({ q }));
  const sample = Boolean(data?.isSample);
  const now = useNow(60000);
  const [expanded, setExpanded] = useState(null);
  const [toRemove, setToRemove] = useState(null);
  const [exporting, setExporting] = useState(false);
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), [setToast]);

  const rows = data?.teams ?? [];

  async function exportCsv() {
    setExporting(true);
    try {
      const all = await getAdminTeams({ ...filters, page: 1, all: true });
      downloadCsv(`coderise-teams-${fileDate()}.csv`, CSV_COLUMNS, all.teams);
      setToast({ type: "success", message: `Exported ${numberFormat.format(all.teams.length)} teams.` });
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
          <h1>Collaboration teams</h1>
          <p>
            Monitor team formation, progress and each member&apos;s contribution.
            {data?.summary && ` ${numberFormat.format(data.summary.teams)} teams across ${numberFormat.format(data.summary.projects)} projects.`}
          </p>
        </div>
        <button type="button" className="btn btn-outline" onClick={exportCsv} disabled={!data || exporting}>
          <Download size={17} aria-hidden="true" /> {exporting ? "Exporting…" : "Export CSV"}
        </button>
      </header>

      {sample && <SampleNotice />}
      {loading && <Loader label="Loading teams…" />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && (
        <section className={`ui-card community-admin-table-card${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing} aria-label="Teams">
          <div className="cae-toolbar">
            <SearchField label="Search teams" placeholder="Search teams or members" value={searchText} onChange={setSearchText} />
            <FilterSelect label="Project" value={filters.collaboration} onChange={(project) => update({ project })} options={[{ value: "", label: "All projects" }, ...data.projects.map((item) => ({ value: item.id, label: item.title }))]} />
            <FilterSelect label="Status" value={filters.status} onChange={(status) => update({ status })} options={[{ value: "", label: "All statuses" }, ...Object.entries(TEAM_STATUS).map(([value, item]) => ({ value, label: item.label }))]} />
            <p className="cae-showing" aria-live="polite">{numberFormat.format(data.pagination.total)} {data.pagination.total === 1 ? "team" : "teams"}</p>
          </div>

          {rows.length === 0 ? (
            <div className="community-empty">
              <h2>No teams found</h2>
              <p className="muted-text">Try a different search or filter.</p>
            </div>
          ) : (
            <>
              <div className="community-table-wrap" tabIndex={0} role="region" aria-label="Teams table (scrolls sideways)">
                <table className="community-table cae-table-teams">
                  <thead>
                    <tr>
                      <th scope="col">Team</th>
                      <th scope="col">Project</th>
                      <th scope="col">Members</th>
                      <th scope="col">Leader</th>
                      <th scope="col">Progress</th>
                      <th scope="col">Last activity</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((team) => {
                      const open = expanded === team.id;
                      const status = TEAM_STATUS[team.status] ?? TEAM_STATUS.active;
                      const leader = team.members.find((member) => member.isLeader);
                      return (
                        <Fragment key={team.id}>
                          <tr className={open ? "cae-row-open" : undefined}>
                            <th scope="row" className="cae-team-cell">
                              <button type="button" className="cae-expand" aria-expanded={open} aria-controls={`team-${team.id}`} onClick={() => setExpanded(open ? null : team.id)}>
                                <ChevronDown size={16} aria-hidden="true" />
                                {team.name}
                                <span className="sr-only">, {open ? "hide" : "show"} member contribution</span>
                              </button>
                            </th>
                            <td>{team.projectTitle}</td>
                            <td>
                              <span className="cae-members">
                                <span className="community-avatars" aria-hidden="true">
                                  {team.members.map((member, index) => <span key={member.id} className={`community-avatar community-avatar-sm avatar-${index % 4}`}>{member.initials}</span>)}
                                </span>
                                <span>{team.members.length}/{team.maxMembers}</span>
                              </span>
                            </td>
                            <td>{leader?.name ?? "—"}</td>
                            <td><ProgressBar value={team.progress} label={`${team.name} progress`} /></td>
                            <td>{relativeTime(team.lastActivityAt, now)}</td>
                            <td><Tag tone={status.tone}>{status.label}{team.status === "flagged" && team.reports ? ` · ${team.reports} ${team.reports === 1 ? "report" : "reports"}` : ""}</Tag></td>
                          </tr>
                          {open && (
                            <tr className="cae-detail-row">
                              <td colSpan={7} id={`team-${team.id}`}>
                                <TeamDetails team={team} onRemove={() => setToRemove(team)} />
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {data.pagination.totalPages > 1 && (
                <div className="community-list-footer community-leaderboard-footer">
                  <p>Page {data.pagination.page} of {data.pagination.totalPages}</p>
                  <Pager pagination={data.pagination} onPage={(page) => update({ page })} label="Team pages" />
                </div>
              )}
            </>
          )}
        </section>
      )}

      <RemoveTeamDialog
        key={toRemove?.id ?? "none"}
        team={toRemove}
        onCancel={() => setToRemove(null)}
        onConfirm={async (reason) => {
          await removeAdminTeam(toRemove.id, reason, { sample });
          setToast({ type: "success", message: `${toRemove.name} was removed. Members have been notified.` });
          setToRemove(null);
          setExpanded(null);
          reload();
        }}
      />
      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </section>
  );
}

function TeamDetails({ team, onRemove }) {
  return (
    <div className="cae-team-details">
      <div className="cae-contribution">
        <h3>Member contribution</h3>
        <div className="cae-inner-scroll">
          <table className="community-table cae-inner-table">
            <thead>
              <tr>
                <th scope="col">Member</th>
                <th scope="col">Role</th>
                <th scope="col">Tasks done</th>
                <th scope="col">Commits</th>
                <th scope="col">Messages</th>
              </tr>
            </thead>
            <tbody>
              {team.members.map((member) => (
                <tr key={member.id}>
                  <th scope="row">{member.name}{member.isLeader && <> <Tag tone="blue">Leader</Tag></>}</th>
                  <td>{member.role}</td>
                  <td>{member.tasksDone} of {member.tasksTotal}</td>
                  <td>{numberFormat.format(member.commits)}</td>
                  <td>{numberFormat.format(member.messages)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="cae-team-meta">
        <h3>Team details</h3>
        <p>Formed {formatDate(team.formedAt)}{team.deadline ? ` · Deadline ${formatDate(team.deadline)}` : ""}</p>
        {team.repository && <p className="cae-break">Repository: {team.repository}</p>}
        <div className="cae-actions">
          <Link to={`/community/teams/${encodeURIComponent(team.id)}`} className="btn btn-outline btn-sm">Open workspace</Link>
          <button type="button" className="btn btn-outline btn-sm community-btn-danger-outline" onClick={onRemove}>Remove team</button>
        </div>
      </div>
    </div>
  );
}

function RemoveTeamDialog({ team, onCancel, onConfirm }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const count = team?.members.length ?? 0;

  async function submit(event) {
    event.preventDefault();
    if (reason.trim().length < REASON_MIN) { setError(`Give a reason of at least ${REASON_MIN} characters. Members will see it.`); return; }
    setBusy(true);
    setError("");
    try {
      await onConfirm(reason.trim());
    } catch (removeError) {
      setError(removeError.message || "The team could not be removed. Please try again.");
      setBusy(false);
    }
  }

  return (
    <Modal open={Boolean(team)} onClose={() => !busy && onCancel()} title={`Remove ${team?.name ?? "team"}?`}>
      <form className="community-delete-dialog" onSubmit={submit} noValidate>
        <div className="cae-dialog-lead">
          <span className="community-delete-icon" aria-hidden="true"><AlertTriangle size={22} /></span>
          <p>All {count} {count === 1 ? "member" : "members"} will lose access to the workspace, tasks and files. This cannot be undone. Members are notified by email.</p>
        </div>
        <label htmlFor="remove-reason">Reason (shared with members)</label>
        <textarea
          id="remove-reason"
          className="ui-input"
          rows={3}
          value={reason}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "remove-reason-error" : undefined}
          onChange={(event) => setReason(event.target.value)}
        />
        {error && <p id="remove-reason-error" className="field-error" role="alert">{error}</p>}
        <div className="community-delete-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="submit" className="btn btn-sm community-btn-danger" disabled={busy}>{busy ? "Removing…" : "Remove team"}</button>
        </div>
      </form>
    </Modal>
  );
}
