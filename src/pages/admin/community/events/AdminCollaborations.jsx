import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { CircleCheck, Clock, Eye, FolderOpen, Lock, Pencil, Plus, Send, Trash2, Users } from "lucide-react";

import Loader from "../../../../components/common/Loader";
import Modal from "../../../../components/common/Modal";
import ErrorMessage from "../../../../components/feedback/ErrorMessage";
import Toast from "../../../../components/feedback/Toast";
import {
  COLLABORATIONS_PAGE_SIZE,
  deleteAdminCollaboration,
  getAdminCollaborations,
  setAdminCollaborationStatus,
} from "../../../../features/community/admin/events/adminEventsService";
import { FilterSelect, RowMenu, SampleNotice, SearchField, StatCard, Tag } from "../../../../features/community/admin/events/EventControls";
import { COLLAB_STATUS, formatDate, numberFormat } from "../../../../features/community/admin/events/eventHelpers";
import { Pager } from "../../../../features/community/listControls";
import { readPage, useCommunityList, useDebouncedSearch, useUrlFilters } from "../../../../features/community/listHooks";

// A05 Collaboration Management: team projects for 2–3 learners.
function readFilters(params) {
  const pick = (name, allowed) => (allowed.includes(params.get(name)) ? params.get(name) : "");
  return {
    search: params.get("q") ?? "",
    category: params.get("category") ?? "",
    access: pick("access", ["free", "premium"]),
    status: pick("status", Object.keys(COLLAB_STATUS)),
    page: readPage(params),
  };
}

function deadlineText(row) {
  if (!row.deadline) return "No deadline set";
  if (row.status === "closed") return `Closed ${formatDate(row.deadline)}`;
  return `Due ${formatDate(row.deadline)}`;
}

export default function AdminCollaborations() {
  const { params, update } = useUrlFilters();
  const filters = readFilters(params);
  const { data, error, loading, refreshing, reload } = useCommunityList(getAdminCollaborations, filters);
  const [searchText, setSearchText] = useDebouncedSearch(filters.search, (q) => update({ q }));
  const sample = Boolean(data?.isSample);
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState(null);
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), [setToast]);

  async function runAction(work, success) {
    setBusy(true);
    try {
      await work();
      setToast({ type: "success", message: success });
      reload();
      return true;
    } catch (actionError) {
      setToast({ type: "error", message: actionError.message || "That didn't work. Please try again." });
      return false;
    } finally {
      setBusy(false);
    }
  }

  const rows = data?.collaborations ?? [];
  const stats = data?.stats;
  const firstShown = data ? (data.pagination.page - 1) * COLLABORATIONS_PAGE_SIZE + 1 : 0;

  return (
    <section className="admin-page community-admin">
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">COMMUNITY MANAGEMENT</span>
          <h1>Collaboration projects</h1>
          <p>Team projects for 2–3 learners. Set team size, access and roles for each project.</p>
        </div>
        <Link to="/admin/community/collaborations/new" className="btn btn-primary"><Plus size={17} aria-hidden="true" /> New collaboration</Link>
      </header>

      {sample && <SampleNotice />}
      {loading && <Loader label="Loading collaborations…" />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {stats && (
        <div className="community-admin-stats cae-stats">
          <StatCard label="Collaboration projects" value={numberFormat.format(stats.collaborations)} icon={FolderOpen} tone="blue" />
          <StatCard label="Active teams" value={numberFormat.format(stats.activeTeams)} icon={Users} tone="green" />
          <StatCard label="Teams forming" value={numberFormat.format(stats.formingTeams)} icon={Clock} tone="amber" />
          <StatCard
            label="Completed teams"
            value={numberFormat.format(stats.completedTeams)}
            icon={CircleCheck}
            tone="teal"
            hint={typeof stats.completionRate === "number" ? `${stats.completionRate}% completion rate` : undefined}
            hintTone="good"
          />
        </div>
      )}

      {data && (
        <section className={`ui-card community-admin-table-card${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing} aria-label="Collaboration projects">
          <div className="cae-toolbar">
            <SearchField label="Search projects" placeholder="Search projects" value={searchText} onChange={setSearchText} />
            <FilterSelect label="Category" value={filters.category} onChange={(category) => update({ category })} options={[{ value: "", label: "All categories" }, ...data.categories.map((item) => ({ value: item, label: item }))]} />
            <FilterSelect label="Access" value={filters.access} onChange={(access) => update({ access })} options={[{ value: "", label: "All access" }, { value: "free", label: "Free" }, { value: "premium", label: "Premium" }]} />
            <FilterSelect label="Status" value={filters.status} onChange={(status) => update({ status })} options={[{ value: "", label: "All statuses" }, ...Object.entries(COLLAB_STATUS).map(([value, item]) => ({ value, label: item.label }))]} />
            <p className="cae-showing" aria-live="polite">Showing {rows.length} of {numberFormat.format(data.pagination.total)}</p>
          </div>

          {rows.length === 0 ? (
            <div className="community-empty">
              <h2>No collaboration projects found</h2>
              <p className="muted-text">Try a different search or filter, or create a new collaboration.</p>
            </div>
          ) : (
            <>
              <div className="community-table-wrap" tabIndex={0} role="region" aria-label="Collaboration projects table (scrolls sideways)">
                <table className="community-table cae-table-collabs">
                  <thead>
                    <tr>
                      <th scope="col">Project</th>
                      <th scope="col">Category</th>
                      <th scope="col">Access</th>
                      <th scope="col">Team size</th>
                      <th scope="col">Teams formed</th>
                      <th scope="col">Active / completed</th>
                      <th scope="col">Status</th>
                      <th scope="col"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const status = COLLAB_STATUS[row.status] ?? COLLAB_STATUS.draft;
                      const editPath = `/admin/community/collaborations/${encodeURIComponent(row.id)}/edit`;
                      return (
                        <tr key={row.id}>
                          <td>
                            <Link to={editPath} className="community-admin-link">{row.title}</Link>
                            <span className="cae-sub">{deadlineText(row)}</span>
                          </td>
                          <td>{row.category}</td>
                          <td><Tag tone={row.access === "premium" ? "purple" : "green"}>{row.access === "premium" ? "Premium" : "Free"}</Tag></td>
                          <td>{row.minMembers}–{row.maxMembers}</td>
                          <td>{numberFormat.format(row.teamsFormed)}</td>
                          <td>{row.activeTeams} / {row.completedTeams}</td>
                          <td><Tag tone={status.tone}>{status.label}</Tag></td>
                          <td className="is-number">
                            <RowMenu
                              label={`Actions for ${row.title}`}
                              disabled={busy}
                              items={[
                                { label: "Edit", icon: Pencil, to: editPath },
                                { label: "View teams", icon: Users, to: `/admin/community/teams?project=${encodeURIComponent(row.id)}` },
                                { label: "Preview as student", icon: Eye, href: `/community/collaborate/${encodeURIComponent(row.id)}` },
                                row.status === "published"
                                  ? { label: "Close to new teams", icon: Lock, onSelect: () => runAction(() => setAdminCollaborationStatus(row.id, "closed", { sample }), `“${row.title}” is closed. Existing teams keep working.`) }
                                  : { label: row.status === "closed" ? "Reopen" : "Publish", icon: Send, onSelect: () => runAction(() => setAdminCollaborationStatus(row.id, "published", { sample }), `“${row.title}” is published.`) },
                                ...(row.teamsFormed === 0 ? [{ label: "Delete", icon: Trash2, danger: true, onSelect: () => setToDelete(row) }] : []),
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
                <p>Page {data.pagination.page} of {data.pagination.totalPages}<span className="sr-only">, projects {firstShown}–{firstShown + rows.length - 1}</span></p>
                <Pager pagination={data.pagination} onPage={(page) => update({ page })} label="Collaboration pages" />
              </div>
            </>
          )}
        </section>
      )}

      <Modal open={Boolean(toDelete)} onClose={() => !busy && setToDelete(null)} title={`Delete “${toDelete?.title ?? ""}”?`}>
        <div className="community-delete-dialog">
          <span className="community-delete-icon" aria-hidden="true"><Trash2 size={22} /></span>
          <p>This removes the project from the Collaboration library. No teams have formed on it yet. This cannot be undone.</p>
          <div className="community-delete-actions">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setToDelete(null)} disabled={busy}>Cancel</button>
            <button
              type="button"
              className="btn btn-sm community-btn-danger"
              disabled={busy}
              onClick={async () => {
                const done = await runAction(() => deleteAdminCollaboration(toDelete.id, { sample }), `“${toDelete.title}” deleted.`);
                if (done) setToDelete(null);
              }}
            >
              {busy ? "Deleting…" : "Delete project"}
            </button>
          </div>
        </div>
      </Modal>
      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </section>
  );
}
