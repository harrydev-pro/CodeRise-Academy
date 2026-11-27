import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList, Eye, Pencil, Plus, Trash2, Users } from "lucide-react";

import Loader from "../../../../components/common/Loader";
import Modal from "../../../../components/common/Modal";
import ErrorMessage from "../../../../components/feedback/ErrorMessage";
import Toast from "../../../../components/feedback/Toast";
import { deleteAdminHackathon, getAdminHackathons } from "../../../../features/community/admin/events/adminEventsService";
import { FilterSelect, RowMenu, SampleNotice, SearchField, Tag } from "../../../../features/community/admin/events/EventControls";
import {
  dayMonth,
  formatDateTime,
  formatDayTime,
  HACKATHON_TABS,
  numberFormat,
  useNow,
} from "../../../../features/community/admin/events/eventHelpers";
import { useCommunityList, useDebouncedSearch, useUrlFilters } from "../../../../features/community/listHooks";

// A08 Hackathon Management: live banner, tabs, table and recently ended hackathons.
const base = "/admin/community/hackathons";

function readFilters(params) {
  const tab = HACKATHON_TABS.some((item) => item.value === params.get("tab")) ? params.get("tab") : "scheduled";
  return { tab, search: params.get("q") ?? "", category: params.get("category") ?? "" };
}

const participationLabel = (row) => (row.participation === "teams" ? `Teams of ${row.minTeam}–${row.maxTeam}` : "Individual");

function dateRange(row) {
  const start = new Date(row.startsAt);
  const end = new Date(row.endsAt);
  const year = new Intl.DateTimeFormat("en-GB", { year: "numeric", timeZone: "Africa/Lagos" }).format(end);
  const startDay = dayMonth.formatToParts(start).find((part) => part.type === "day")?.value;
  const sameMonth = dayMonth.format(start).split(" ")[1] === dayMonth.format(end).split(" ")[1];
  return sameMonth ? `${startDay}–${dayMonth.format(end)} ${year}` : `${dayMonth.format(start)} – ${dayMonth.format(end)} ${year}`;
}

export default function AdminHackathons() {
  const { params, update } = useUrlFilters({ tab: "scheduled" });
  const filters = readFilters(params);
  const { data, error, loading, refreshing, reload } = useCommunityList(getAdminHackathons, filters);
  const [searchText, setSearchText] = useDebouncedSearch(filters.search, (q) => update({ q }));
  const sample = Boolean(data?.isSample);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), [setToast]);

  const rows = data?.hackathons ?? [];

  async function remove() {
    setBusy(true);
    try {
      await deleteAdminHackathon(toDelete.id, { sample });
      setToast({ type: "success", message: `“${toDelete.title}” deleted.` });
      setToDelete(null);
      reload();
    } catch (deleteError) {
      setToast({ type: "error", message: deleteError.message || "The draft could not be deleted." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-page community-admin">
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">COMMUNITY MANAGEMENT</span>
          <h1>Hackathons</h1>
          <p>24-hour build challenges. Create, schedule, judge and publish winners without code changes.</p>
        </div>
        <Link to={`${base}/new`} className="btn btn-primary"><Plus size={17} aria-hidden="true" /> New hackathon</Link>
      </header>

      {sample && <SampleNotice />}
      {loading && <Loader label="Loading hackathons…" />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data?.live && <LiveBanner hackathon={data.live} />}

      {data && (
        <section className={`ui-card community-admin-table-card${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing} aria-labelledby="hackathon-tabs-label">
          <h2 id="hackathon-tabs-label" className="sr-only">Hackathons by status</h2>
          <nav className="cae-tabs" aria-label="Hackathon status">
            {HACKATHON_TABS.map((tab) => (
              <button key={tab.value} type="button" className={`cae-tab${filters.tab === tab.value ? " active" : ""}`} aria-pressed={filters.tab === tab.value} onClick={() => update({ tab: tab.value })}>
                {tab.label} <span className="community-chip-count">{data.counts[tab.value] ?? 0}</span>
              </button>
            ))}
          </nav>
          <div className="cae-toolbar">
            <SearchField label="Search hackathons" placeholder="Search hackathons" value={searchText} onChange={setSearchText} />
            <FilterSelect label="Category" value={filters.category} onChange={(category) => update({ category })} options={[{ value: "", label: "All categories" }, ...data.categories.map((item) => ({ value: item, label: item }))]} />
          </div>

          {rows.length === 0 ? (
            <div className="community-empty">
              <h2>No {HACKATHON_TABS.find((tab) => tab.value === filters.tab)?.label.toLowerCase()} hackathons</h2>
              <p className="muted-text">{filters.search || filters.category ? "Try a different search or category." : "Create a hackathon to get started."}</p>
            </div>
          ) : (
            <div className="community-table-wrap" tabIndex={0} role="region" aria-label="Hackathons table (scrolls sideways)">
              <table className="community-table cae-table-hackathons">
                <thead>
                  <tr>
                    <th scope="col">Hackathon</th>
                    <th scope="col">Start</th>
                    <th scope="col">End</th>
                    <th scope="col">Reg. closes</th>
                    <th scope="col">Participation</th>
                    <th scope="col" className="is-number">Registered</th>
                    <th scope="col" className="is-number">Submissions</th>
                    <th scope="col"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const id = encodeURIComponent(row.id);
                    const hasEntries = row.status === "live" || row.status === "ended";
                    return (
                      <tr key={row.id}>
                        <td>
                          <Link to={`${base}/${id}/edit`} className="community-admin-link">{row.title}</Link>
                          <span className="cae-sub">{row.category} · Prize: {row.prize}</span>
                        </td>
                        <td>{formatDateTime(row.startsAt)}</td>
                        <td>{formatDateTime(row.endsAt)}</td>
                        <td>{formatDayTime(row.registrationClosesAt)}</td>
                        <td><Tag tone={row.participation === "teams" ? "blue" : "neutral"}>{participationLabel(row)}</Tag></td>
                        <td className="is-number">{numberFormat.format(row.registeredCount)}</td>
                        <td className="is-number">{hasEntries ? numberFormat.format(row.submissionsCount) : "–"}</td>
                        <td className="is-number">
                          <RowMenu
                            label={`Actions for ${row.title}`}
                            items={[
                              { label: "Edit", icon: Pencil, to: `${base}/${id}/edit` },
                              ...(row.status !== "draft" ? [
                                { label: "Participants", icon: Users, to: `${base}/${id}/participants` },
                                { label: "Submissions", icon: ClipboardList, to: `${base}/${id}/submissions` },
                                { label: "View public page", icon: Eye, href: `/community/hackathons/${id}` },
                              ] : []),
                              ...(row.status === "draft" ? [{ label: "Delete draft", icon: Trash2, danger: true, onSelect: () => setToDelete(row) }] : []),
                            ]}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {data.recentlyEnded.length > 0 && filters.tab !== "ended" && (
            <div className="cae-recent">
              <h2>Recently ended</h2>
              <ul>
                {data.recentlyEnded.map((row) => (
                  <li key={row.id}>
                    <div className="min-w-0">
                      <strong>{row.title}</strong>
                      <span className="cae-sub">{dateRange(row)} · {participationLabel(row)}</span>
                    </div>
                    <span>{numberFormat.format(row.registeredCount)} registered</span>
                    <span>{numberFormat.format(row.submissionsCount)} submissions</span>
                    <span>
                      {row.resultsPublished
                        ? <Tag tone="green">Results published</Tag>
                        : <Tag tone="amber">Judging · {row.judging?.done ?? 0} of {row.judging?.total ?? 0} judges done</Tag>}
                    </span>
                    <Link to={`${base}/${encodeURIComponent(row.id)}/submissions`} className="btn btn-outline btn-sm">
                      {row.resultsPublished ? "View results" : "Open judging"}<span className="sr-only"> for {row.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <Modal open={Boolean(toDelete)} onClose={() => !busy && setToDelete(null)} title={`Delete “${toDelete?.title ?? ""}”?`}>
        <div className="community-delete-dialog">
          <span className="community-delete-icon" aria-hidden="true"><Trash2 size={22} /></span>
          <p>This draft has never been scheduled, so no student has seen it. Deleting it cannot be undone.</p>
          <div className="community-delete-actions">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setToDelete(null)} disabled={busy}>Cancel</button>
            <button type="button" className="btn btn-sm community-btn-danger" onClick={remove} disabled={busy}>{busy ? "Deleting…" : "Delete draft"}</button>
          </div>
        </div>
      </Modal>
      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </section>
  );
}

function LiveBanner({ hackathon }) {
  const now = useNow();
  const remaining = Math.max(0, new Date(hackathon.endsAt).getTime() - now);
  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor(remaining / 60000) % 60;
  const seconds = Math.floor(remaining / 1000) % 60;
  const clock = [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
  const id = encodeURIComponent(hackathon.id);
  return (
    <section className="cae-live" aria-labelledby="live-hackathon-title">
      <span className="community-tag tag-red cae-live-tag"><span className="community-live-dot" aria-hidden="true" /> Live now</span>
      <div className="cae-live-text min-w-0">
        <h2 id="live-hackathon-title">{hackathon.title}</h2>
        <p>
          Started {formatDayTime(hackathon.startsAt)} WAT · ends {formatDayTime(hackathon.endsAt)} WAT · {numberFormat.format(hackathon.registeredCount)} participants
          {hackathon.participation === "teams" ? ` · ${numberFormat.format(hackathon.teamsCount)} teams` : ""}
        </p>
      </div>
      <div className="cae-live-timer" role="timer" aria-label={remaining > 0 ? `${hours} hours and ${minutes} minutes remaining` : "Ended"}>
        <strong aria-hidden="true">{clock}</strong>
        <span aria-hidden="true">time remaining</span>
      </div>
      <div className="cae-actions">
        <Link to={`${base}/${id}/participants`} className="btn btn-outline btn-sm">Participants</Link>
        <Link to={`${base}/${id}/submissions`} className="btn btn-outline btn-sm">Submissions ({numberFormat.format(hackathon.submissionsCount)})</Link>
      </div>
    </section>
  );
}
