import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, MoreHorizontal, Pencil, Plus, Search, Send, Trash2 } from "lucide-react";

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import Toast from "../../../components/feedback/Toast";
import {
  bulkAdminProjects,
  deleteAdminProject,
  getAdminProjects,
  PROJECT_LEVELS,
  setAdminProjectStatus,
} from "../../../features/community/admin/adminProjectsService";
import DeleteProjectDialog from "../../../features/community/admin/DeleteProjectDialog";
import { Pager } from "../../../features/community/listControls";
import { readPage, useCommunityList, useDebouncedSearch, useUrlFilters } from "../../../features/community/listHooks";

const STATUS = {
  published: { label: "Published", tone: "green" },
  draft: { label: "Draft", tone: "amber" },
  unpublished: { label: "Unpublished", tone: "neutral" },
};
const SORTS = [
  { value: "updated", label: "Recently updated" },
  { value: "title", label: "Title A–Z" },
  { value: "submissions", label: "Most submissions" },
];
const fullDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });
const numberFormat = new Intl.NumberFormat("en-GB");

function readFilters(params) {
  const pick = (name, allowed) => (allowed.includes(params.get(name)) ? params.get(name) : "");
  return {
    search: params.get("q") ?? "",
    category: params.get("category") ?? "",
    level: pick("level", PROJECT_LEVELS),
    access: pick("access", ["free", "premium"]),
    status: pick("status", Object.keys(STATUS)),
    sort: pick("sort", SORTS.map((item) => item.value)) || "updated",
    page: readPage(params),
  };
}

export default function AdminCommunityProjects() {
  const { params, update } = useUrlFilters({ sort: "updated" });
  const filters = readFilters(params);
  const { data, error, loading, refreshing, reload } = useCommunityList(getAdminProjects, filters);
  const [searchText, setSearchText] = useDebouncedSearch(filters.search, (q) => update({ q }));
  const sample = Boolean(data?.isSample);

  // Selection belongs to the current filters and page; changing them clears it.
  const listKey = JSON.stringify(filters);
  const [selection, setSelection] = useState({ key: listKey, ids: new Set() });
  const selected = selection.key === listKey ? selection.ids : new Set();
  const setSelected = (ids) => setSelection({ key: listKey, ids });

  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState(null); // { ids, titles, submissions }
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), [setToast]);

  const rows = data?.projects ?? [];
  const allOnPage = rows.length > 0 && rows.every((row) => selected.has(row.id));
  const someOnPage = rows.some((row) => selected.has(row.id));
  const headerBox = useRef(null);
  useEffect(() => {
    if (headerBox.current) headerBox.current.indeterminate = someOnPage && !allOnPage;
  }, [someOnPage, allOnPage]);

  function toggleRow(id) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  }

  async function runAction(work, success) {
    setBusy(true);
    try {
      await work();
      setToast({ type: "success", message: success });
      setSelected(new Set());
      reload();
    } catch (actionError) {
      setToast({ type: "error", message: actionError.message || "That didn't work. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  const selectedRows = rows.filter((row) => selected.has(row.id));
  const plural = (count) => `${count} ${count === 1 ? "project" : "projects"}`;
  const firstShown = data ? (data.pagination.page - 1) * 8 + 1 : 0;

  return (
    <section className="admin-page community-admin">
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">COMMUNITY MANAGEMENT</span>
          <h1>Community projects</h1>
          <p>Individual project briefs in the Project Library. Separate from learning-track projects.</p>
        </div>
        <Link to="/admin/community/projects/new" className="btn btn-primary"><Plus size={17} aria-hidden="true" /> New project</Link>
      </header>

      {sample && (
        <p className="community-sample-notice" role="status">
          Showing sample data: the admin Community API is not available yet. Changes are kept in this browser tab only. This notice only appears on the local dev server.
        </p>
      )}

      <section className="ui-card community-admin-filters" aria-label="Search and filter projects">
        <label className="community-admin-field community-admin-search">
          <span>Search projects</span>
          <span className="community-search">
            <Search size={18} aria-hidden="true" />
            <input type="search" className="ui-input" placeholder="Search by title or skill" value={searchText} onChange={(event) => setSearchText(event.target.value)} />
          </span>
        </label>
        <div className="community-admin-filter-row">
          <FilterSelect label="Category" value={filters.category} onChange={(category) => update({ category })} options={[{ value: "", label: "All categories" }, ...(data?.categories ?? []).map((item) => ({ value: item, label: item }))]} />
          <FilterSelect label="Difficulty" value={filters.level} onChange={(level) => update({ level })} options={[{ value: "", label: "All levels" }, ...PROJECT_LEVELS.map((item) => ({ value: item, label: item }))]} />
          <FilterSelect label="Access" value={filters.access} onChange={(access) => update({ access })} options={[{ value: "", label: "Free and Premium" }, { value: "free", label: "Free" }, { value: "premium", label: "Premium" }]} />
          <FilterSelect label="Status" value={filters.status} onChange={(status) => update({ status })} options={[{ value: "", label: "All statuses" }, ...Object.entries(STATUS).map(([value, item]) => ({ value, label: item.label }))]} />
          <FilterSelect label="Sort by" value={filters.sort} onChange={(sort) => update({ sort })} options={SORTS} />
        </div>
      </section>

      {selected.size > 0 && (
        <div className="community-bulk-bar" role="region" aria-label="Selected projects">
          <strong>{plural(selected.size)} selected</strong>
          <button type="button" className="btn btn-outline btn-sm" disabled={busy} onClick={() => runAction(() => bulkAdminProjects([...selected], "publish", { sample }), `${plural(selected.size)} published.`)}>Publish</button>
          <button type="button" className="btn btn-outline btn-sm" disabled={busy} onClick={() => runAction(() => bulkAdminProjects([...selected], "unpublish", { sample }), `${plural(selected.size)} unpublished.`)}>Unpublish</button>
          <button type="button" className="btn btn-outline btn-sm community-btn-danger-outline" disabled={busy} onClick={() => setToDelete({ ids: [...selected], titles: selectedRows.map((row) => row.title), submissions: selectedRows.reduce((sum, row) => sum + row.submissions, 0) })}>Delete</button>
          <button type="button" className="community-link-button community-bulk-clear" onClick={() => setSelected(new Set())}>Clear selection</button>
        </div>
      )}

      {loading && <Loader label="Loading projects…" />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && (
        <section className={`ui-card community-admin-table-card${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing} aria-label="Projects">
          {rows.length === 0 ? (
            <div className="community-empty">
              <h2>No projects found</h2>
              <p className="muted-text">Try a different search or filter, or create a new project.</p>
            </div>
          ) : (
            <>
              <div className="community-table-wrap" tabIndex={0} role="region" aria-label="Projects table (scrolls sideways)">
                <table className="community-table community-admin-projects-table">
                  <thead>
                    <tr>
                      <th scope="col" className="community-check-cell">
                        <input
                          ref={headerBox}
                          type="checkbox"
                          aria-label="Select all projects on this page"
                          checked={allOnPage}
                          onChange={() => setSelected(allOnPage ? new Set() : new Set(rows.map((row) => row.id)))}
                        />
                      </th>
                      <th scope="col">Project</th>
                      <th scope="col">Category</th>
                      <th scope="col">Difficulty</th>
                      <th scope="col">Access</th>
                      <th scope="col">Status</th>
                      <th scope="col" className="is-number">Submissions</th>
                      <th scope="col">Updated</th>
                      <th scope="col"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const status = STATUS[row.status] ?? STATUS.draft;
                      const editPath = `/admin/community/projects/${encodeURIComponent(row.id)}/edit`;
                      return (
                        <tr key={row.id} className={selected.has(row.id) ? "is-selected" : undefined}>
                          <td className="community-check-cell">
                            <input type="checkbox" aria-label={`Select ${row.title}`} checked={selected.has(row.id)} onChange={() => toggleRow(row.id)} />
                          </td>
                          <td><Link to={editPath} className="community-admin-link">{row.title}</Link></td>
                          <td>{row.category}</td>
                          <td>{row.level}</td>
                          <td><span className={`community-tag ${row.access === "premium" ? "tag-purple" : "tag-green"}`}>{row.access === "premium" ? "Premium" : "Free"}</span></td>
                          <td><span className={`community-tag tag-${status.tone}`}>{status.label}</span></td>
                          <td className="is-number">{numberFormat.format(row.submissions)}</td>
                          <td>{fullDate.format(new Date(row.updatedAt))}</td>
                          <td className="is-number">
                            <RowMenu
                              row={row}
                              editPath={editPath}
                              disabled={busy}
                              onStatus={(next) => runAction(() => setAdminProjectStatus(row.id, next, { sample }), `“${row.title}” ${next === "published" ? "published" : "unpublished"}.`)}
                              onDelete={() => setToDelete({ ids: [row.id], titles: [row.title], submissions: row.submissions })}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="community-list-footer community-leaderboard-footer">
                <p>Showing {firstShown}–{firstShown + rows.length - 1} of {numberFormat.format(data.pagination.total)} projects</p>
                <Pager pagination={data.pagination} onPage={(page) => update({ page })} label="Project pages" arrows />
              </div>
            </>
          )}
        </section>
      )}

      <DeleteProjectDialog
        key={toDelete?.ids.join(",") ?? "none"}
        open={Boolean(toDelete)}
        titles={toDelete?.titles}
        submissions={toDelete?.submissions}
        onCancel={() => setToDelete(null)}
        onUnpublish={async () => {
          await bulkAdminProjects(toDelete.ids, "unpublish", { sample });
          setToast({ type: "success", message: `${plural(toDelete.ids.length)} unpublished.` });
          setToDelete(null);
          setSelected(new Set());
          reload();
        }}
        onDelete={async () => {
          if (toDelete.ids.length === 1) await deleteAdminProject(toDelete.ids[0], { sample });
          else await bulkAdminProjects(toDelete.ids, "delete", { sample });
          setToast({ type: "success", message: `${plural(toDelete.ids.length)} deleted.` });
          setToDelete(null);
          setSelected(new Set());
          reload();
        }}
      />
      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </section>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="community-admin-field">
      <span>{label}</span>
      <select className="ui-input" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
    </label>
  );
}

// "⋯" menu on each row: Edit, Preview as student, Publish/Unpublish, Delete.
function RowMenu({ row, editPath, disabled, onStatus, onDelete }) {
  // position: the menu is fixed to the window so the table's scroll area can't clip it.
  const [position, setPosition] = useState(null);
  const open = Boolean(position);
  const wrapper = useRef(null);
  const published = row.status === "published";

  function toggle(event) {
    if (open) { setPosition(null); return; }
    const rect = event.currentTarget.getBoundingClientRect();
    const below = window.innerHeight - rect.bottom > 220;
    setPosition({
      right: Math.max(8, window.innerWidth - rect.right),
      ...(below ? { top: rect.bottom + 4, bottom: "auto" } : { top: "auto", bottom: window.innerHeight - rect.top + 4 }),
    });
  }

  useEffect(() => {
    if (!open) return undefined;
    const close = () => setPosition(null);
    function onPointer(event) { if (!wrapper.current?.contains(event.target)) close(); }
    function onKey(event) {
      if (event.key === "Escape") { close(); wrapper.current?.querySelector("button")?.focus(); }
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    wrapper.current?.querySelector('[role="menuitem"]')?.focus();
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const choose = (action) => () => { setPosition(null); action(); };
  const setOpen = (value) => { if (!value) setPosition(null); };

  return (
    <div className="community-row-menu" ref={wrapper}>
      <button type="button" className="community-row-menu-button" aria-haspopup="menu" aria-expanded={open} aria-label={`Actions for ${row.title}`} disabled={disabled} onClick={toggle}>
        <MoreHorizontal size={18} aria-hidden="true" />
      </button>
      {open && (
        <div className="community-row-menu-list" role="menu" aria-label={`Actions for ${row.title}`} style={{ position: "fixed", ...position }}>
          <Link role="menuitem" to={editPath}><Pencil size={15} aria-hidden="true" /> Edit</Link>
          <a role="menuitem" href={`/community/projects/${encodeURIComponent(row.id)}`} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
            <Eye size={15} aria-hidden="true" /> Preview as student<span className="sr-only"> (opens in a new tab)</span>
          </a>
          {published
            ? <button type="button" role="menuitem" onClick={choose(() => onStatus("unpublished"))}><EyeOff size={15} aria-hidden="true" /> Unpublish</button>
            : <button type="button" role="menuitem" onClick={choose(() => onStatus("published"))}><Send size={15} aria-hidden="true" /> Publish</button>}
          <button type="button" role="menuitem" className="is-danger" onClick={choose(onDelete)}><Trash2 size={15} aria-hidden="true" /> Delete</button>
        </div>
      )}
    </div>
  );
}
