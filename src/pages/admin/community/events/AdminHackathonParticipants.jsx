import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Ban, Download, ExternalLink, Send, UserRound, Users, UsersRound } from "lucide-react";

import Loader from "../../../../components/common/Loader";
import Modal from "../../../../components/common/Modal";
import ErrorMessage from "../../../../components/feedback/ErrorMessage";
import Toast from "../../../../components/feedback/Toast";
import {
  getHackathonParticipants,
  messageParticipants,
  PARTICIPANTS_PAGE_SIZE,
  setParticipantStatus,
} from "../../../../features/community/admin/events/adminEventsService";
import { FilterSelect, RowMenu, SampleNotice, SearchField, StatCard, Tag } from "../../../../features/community/admin/events/EventControls";
import {
  downloadCsv,
  fileDate,
  formatDayTime,
  fullDate,
  MEMBERSHIP,
  useNow,
  numberFormat,
} from "../../../../features/community/admin/events/eventHelpers";
import { Pager } from "../../../../features/community/listControls";
import { readPage, useCommunityList, useDebouncedSearch, useUrlFilters } from "../../../../features/community/listHooks";

// A10 Hackathon participants: stats, filters, table, CSV export and messaging.
const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "registered", label: "Registered" },
  { value: "looking", label: "Looking for a team" },
  { value: "disqualified", label: "Disqualified" },
];
const CSV_COLUMNS = [
  { label: "Name", value: (row) => row.name },
  { label: "Email", value: (row) => row.email },
  { label: "Team", value: (row) => row.team ?? "" },
  { label: "Team leader", value: (row) => (row.isLeader ? "Yes" : "No") },
  { label: "Membership", value: (row) => MEMBERSHIP[row.membership]?.label ?? row.membership },
  { label: "Registered (UTC)", value: (row) => row.registeredAt },
  { label: "Status", value: (row) => (row.status === "disqualified" ? `Disqualified: ${row.disqualifyReason}` : "Registered") },
];

function readFilters(params, id) {
  return {
    id,
    search: params.get("q") ?? "",
    status: STATUS_OPTIONS.some((item) => item.value === params.get("status")) ? params.get("status") ?? "" : "",
    membership: Object.keys(MEMBERSHIP).includes(params.get("membership")) ? params.get("membership") : "",
    page: readPage(params),
  };
}

export default function AdminHackathonParticipants() {
  const { id } = useParams();
  const { params, update } = useUrlFilters();
  const filters = readFilters(params, id);
  const { data, error, loading, refreshing, reload } = useCommunityList(getHackathonParticipants, filters);
  const [searchText, setSearchText] = useDebouncedSearch(filters.search, (q) => update({ q }));
  const sample = Boolean(data?.isSample);
  const now = useNow(60000);

  const listKey = JSON.stringify(filters);
  const [selection, setSelection] = useState({ key: listKey, ids: new Set() });
  const selected = selection.key === listKey ? selection.ids : new Set();
  const setSelected = (ids) => setSelection({ key: listKey, ids });

  const [busy, setBusy] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [messageTo, setMessageTo] = useState(null); // { ids: [...] | null, label }
  const [toDisqualify, setToDisqualify] = useState(null);
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), [setToast]);

  const rows = data?.participants ?? [];
  const hackathon = data?.hackathon;
  const allOnPage = rows.length > 0 && rows.every((row) => selected.has(row.id));
  const someOnPage = rows.some((row) => selected.has(row.id));
  const headerBox = useRef(null);
  useEffect(() => {
    if (headerBox.current) headerBox.current.indeterminate = someOnPage && !allOnPage;
  }, [someOnPage, allOnPage]);

  function toggleRow(rowId) {
    const next = new Set(selected);
    if (next.has(rowId)) next.delete(rowId); else next.add(rowId);
    setSelected(next);
  }

  async function restore(row) {
    setBusy(true);
    try {
      await setParticipantStatus(id, row.id, "registered", "", { sample });
      setToast({ type: "success", message: `${row.name} is registered again.` });
      reload();
    } catch (restoreError) {
      setToast({ type: "error", message: restoreError.message || "That didn't work. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  async function exportCsv() {
    setExporting(true);
    try {
      const all = await getHackathonParticipants({ ...filters, page: 1, all: true });
      downloadCsv(`${id}-participants-${fileDate()}.csv`, CSV_COLUMNS, all.participants);
      setToast({ type: "success", message: `Exported ${numberFormat.format(all.participants.length)} participants.` });
    } catch (exportError) {
      setToast({ type: "error", message: exportError.message || "The export failed. Please try again." });
    } finally {
      setExporting(false);
    }
  }

  const firstShown = data ? (data.pagination.page - 1) * PARTICIPANTS_PAGE_SIZE + 1 : 0;
  const teams = hackathon?.participation === "teams";

  return (
    <section className="admin-page community-admin">
      <Link to="/admin/community/hackathons" className="community-back-link"><ArrowLeft size={16} aria-hidden="true" /> Back to hackathons</Link>
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">{hackathon ? `${hackathon.title} · ${fullDate.format(new Date(hackathon.startsAt))}`.toUpperCase() : "HACKATHON"}</span>
          <h1>Participants</h1>
          {hackathon && (
            <p>
              {teams ? `Teams of ${hackathon.minTeam}–${hackathon.maxTeam}` : "Individual"} · Registration
              {new Date(hackathon.registrationClosesAt).getTime() > now ? " closes " : " closed "}
              {formatDayTime(hackathon.registrationClosesAt)} WAT
            </p>
          )}
        </div>
        <div className="cae-actions">
          <button type="button" className="btn btn-outline" onClick={exportCsv} disabled={!data || exporting}><Download size={17} aria-hidden="true" /> {exporting ? "Exporting…" : "Export CSV"}</button>
          <button type="button" className="btn btn-primary" onClick={() => setMessageTo({ ids: null, label: "all registered participants" })} disabled={!data || !data.stats.registered}>
            <Send size={17} aria-hidden="true" /> Message all participants
          </button>
        </div>
      </header>

      {sample && <SampleNotice />}
      {loading && <Loader label="Loading participants…" />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && (
        <div className="community-admin-stats cae-stats">
          <StatCard label="Registered" value={numberFormat.format(data.stats.registered)} icon={Users} tone="blue" hint={hackathon.participantLimit ? `of ${numberFormat.format(hackathon.participantLimit)} places` : "No limit"} />
          {teams && <StatCard label="Teams formed" value={numberFormat.format(data.stats.teams)} icon={UsersRound} tone="green" />}
          {teams && <StatCard label="Without a team" value={numberFormat.format(data.stats.withoutTeam)} icon={UserRound} tone="amber" />}
          <StatCard label="Disqualified" value={numberFormat.format(data.stats.disqualified)} icon={Ban} tone="red" />
        </div>
      )}

      {selected.size > 0 && (
        <div className="community-bulk-bar" role="region" aria-label="Selected participants">
          <strong>{selected.size} selected</strong>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setMessageTo({ ids: [...selected], label: `${selected.size} selected ${selected.size === 1 ? "participant" : "participants"}` })}>Message selected</button>
          <button type="button" className="community-link-button community-bulk-clear" onClick={() => setSelected(new Set())}>Clear selection</button>
        </div>
      )}

      {data && (
        <section className={`ui-card community-admin-table-card${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing} aria-label="Participants">
          <div className="cae-toolbar">
            <SearchField label="Search participants" placeholder="Search by name, email or team" value={searchText} onChange={setSearchText} />
            <FilterSelect label="Status" value={filters.status} onChange={(status) => update({ status })} options={teams ? STATUS_OPTIONS : STATUS_OPTIONS.filter((item) => item.value !== "looking")} />
            <FilterSelect label="Membership" value={filters.membership} onChange={(membership) => update({ membership })} options={[{ value: "", label: "All members" }, ...Object.entries(MEMBERSHIP).map(([value, item]) => ({ value, label: item.label }))]} />
            {rows.length > 0 && <p className="cae-showing" aria-live="polite">Showing {firstShown}–{firstShown + rows.length - 1} of {numberFormat.format(data.pagination.total)}</p>}
          </div>

          {rows.length === 0 ? (
            <div className="community-empty">
              <h2>{filters.search || filters.status || filters.membership ? "No participants match your filters" : "No one has registered yet"}</h2>
              <p className="muted-text">{filters.search || filters.status || filters.membership ? "Try a different search or filter." : "Registrations appear here as soon as students sign up."}</p>
            </div>
          ) : (
            <>
              <div className="community-table-wrap" tabIndex={0} role="region" aria-label="Participants table (scrolls sideways)">
                <table className="community-table cae-table-participants">
                  <thead>
                    <tr>
                      <th scope="col" className="community-check-cell">
                        <input ref={headerBox} type="checkbox" aria-label="Select all participants on this page" checked={allOnPage} onChange={() => setSelected(allOnPage ? new Set() : new Set(rows.map((row) => row.id)))} />
                      </th>
                      <th scope="col">Participant</th>
                      {teams && <th scope="col">Team</th>}
                      <th scope="col">Membership</th>
                      <th scope="col">Registered</th>
                      <th scope="col">Status</th>
                      <th scope="col"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => {
                      const membership = MEMBERSHIP[row.membership] ?? MEMBERSHIP.free;
                      const disqualified = row.status === "disqualified";
                      return (
                        <tr key={row.id} className={selected.has(row.id) ? "is-selected" : undefined}>
                          <td className="community-check-cell"><input type="checkbox" aria-label={`Select ${row.name}`} checked={selected.has(row.id)} onChange={() => toggleRow(row.id)} /></td>
                          <td>
                            <span className="community-table-member">
                              <span className={`community-avatar avatar-${index % 4}`} aria-hidden="true">{row.initials}</span>
                              <span className="cae-person"><strong>{row.name}</strong><span className="cae-sub">{row.email}</span></span>
                            </span>
                          </td>
                          {teams && (
                            <td>
                              {row.team
                                ? <>{row.team}{row.isLeader && <span className="cae-muted"> · Leader</span>}</>
                                : <Tag tone="amber">Looking for a team</Tag>}
                            </td>
                          )}
                          <td><Tag tone={membership.tone}>{membership.label}</Tag></td>
                          <td>{formatDayTime(row.registeredAt)}</td>
                          <td>{disqualified ? <Tag tone="red">Disqualified{row.disqualifyReason ? ` · ${row.disqualifyReason}` : ""}</Tag> : <Tag tone="blue">Registered</Tag>}</td>
                          <td className="is-number">
                            {disqualified ? (
                              <button type="button" className="btn btn-outline btn-sm" disabled={busy} onClick={() => restore(row)}>Restore<span className="sr-only"> {row.name}</span></button>
                            ) : (
                              <RowMenu
                                label={`Actions for ${row.name}`}
                                disabled={busy}
                                items={[
                                  { label: "View community profile", icon: ExternalLink, href: `/community/u/${encodeURIComponent(row.username)}` },
                                  { label: "Send message", icon: Send, onSelect: () => setMessageTo({ ids: [row.id], label: row.name }) },
                                  { label: "Disqualify", icon: Ban, danger: true, onSelect: () => setToDisqualify(row) },
                                ]}
                              />
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="community-list-footer community-leaderboard-footer">
                <p>Page {data.pagination.page} of {data.pagination.totalPages}</p>
                <Pager pagination={data.pagination} onPage={(page) => update({ page })} label="Participant pages" />
              </div>
            </>
          )}
        </section>
      )}

      <MessageDialog
        key={messageTo ? JSON.stringify(messageTo.ids) : "closed"}
        target={messageTo}
        hackathonTitle={hackathon?.title}
        onCancel={() => setMessageTo(null)}
        onSend={async (message) => {
          const result = await messageParticipants(id, { ...message, recipientIds: messageTo.ids }, { sample });
          const sent = result?.sent ?? messageTo.ids?.length;
          setToast({ type: "success", message: `Message sent${typeof sent === "number" ? ` to ${numberFormat.format(sent)} ${sent === 1 ? "participant" : "participants"}` : ""}.` });
          setMessageTo(null);
          setSelected(new Set());
        }}
      />
      <DisqualifyDialog
        key={toDisqualify?.id ?? "none"}
        participant={toDisqualify}
        onCancel={() => setToDisqualify(null)}
        onConfirm={async (reason) => {
          await setParticipantStatus(id, toDisqualify.id, "disqualified", reason, { sample });
          setToast({ type: "success", message: `${toDisqualify.name} was disqualified and has been told why.` });
          setToDisqualify(null);
          reload();
        }}
      />
      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </section>
  );
}

function MessageDialog({ target, hackathonTitle, onCancel, onSend }) {
  const [subject, setSubject] = useState(hackathonTitle ? `${hackathonTitle}: update` : "");
  const [body, setBody] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    const found = {};
    if (!subject.trim()) found.subject = "Add a subject.";
    if (body.trim().length < 10) found.body = "Write a message of at least 10 characters.";
    setErrors(found);
    if (Object.keys(found).length) { document.getElementById(found.subject ? "message-subject" : "message-body")?.focus(); return; }
    setBusy(true);
    try {
      await onSend({ subject: subject.trim(), body: body.trim(), sendEmail });
    } catch (sendError) {
      setErrors({ form: sendError.message || "The message could not be sent. Please try again." });
      setBusy(false);
    }
  }

  return (
    <Modal open={Boolean(target)} onClose={() => !busy && onCancel()} title="Message participants" description={target ? `To ${target.label}. They see it in Community notifications.` : undefined} size="max-w-xl">
      <form className="cae-dialog-form" onSubmit={submit} noValidate>
        <div className="community-field">
          <label className="cae-label" htmlFor="message-subject">Subject</label>
          <input id="message-subject" className="ui-input" value={subject} maxLength={120} aria-invalid={Boolean(errors.subject)} aria-describedby={errors.subject ? "message-subject-error" : undefined} onChange={(event) => setSubject(event.target.value)} />
          {errors.subject && <p id="message-subject-error" className="field-error">{errors.subject}</p>}
        </div>
        <div className="community-field">
          <label className="cae-label" htmlFor="message-body">Message</label>
          <textarea id="message-body" className="ui-input" rows={6} value={body} maxLength={2000} aria-invalid={Boolean(errors.body)} aria-describedby={errors.body ? "message-body-error" : undefined} onChange={(event) => setBody(event.target.value)} />
          {errors.body && <p id="message-body-error" className="field-error">{errors.body}</p>}
        </div>
        <label className="community-checkbox"><input type="checkbox" checked={sendEmail} onChange={(event) => setSendEmail(event.target.checked)} /> Also send by email</label>
        {errors.form && <p className="field-error" role="alert">{errors.form}</p>}
        <div className="community-delete-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={busy}><Send size={15} aria-hidden="true" /> {busy ? "Sending…" : "Send message"}</button>
        </div>
      </form>
    </Modal>
  );
}

function DisqualifyDialog({ participant, onCancel, onConfirm }) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    if (reason.trim().length < 3) { setError("Give a short reason. The participant will see it."); return; }
    setBusy(true);
    setError("");
    try {
      await onConfirm(reason.trim());
    } catch (actionError) {
      setError(actionError.message || "That didn't work. Please try again.");
      setBusy(false);
    }
  }

  return (
    <Modal open={Boolean(participant)} onClose={() => !busy && onCancel()} title={`Disqualify ${participant?.name ?? "participant"}?`}>
      <form className="community-delete-dialog" onSubmit={submit} noValidate>
        <p>They can no longer submit or appear in results{participant?.team ? `, and ${participant.team} loses a member` : ""}. You can restore them later.</p>
        <label htmlFor="disqualify-reason">Reason (shared with the participant)</label>
        <input id="disqualify-reason" className="ui-input" value={reason} placeholder="For example: duplicate account" aria-invalid={Boolean(error)} aria-describedby={error ? "disqualify-error" : undefined} onChange={(event) => setReason(event.target.value)} />
        {error && <p id="disqualify-error" className="field-error" role="alert">{error}</p>}
        <div className="community-delete-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="submit" className="btn btn-sm community-btn-danger" disabled={busy}>{busy ? "Disqualifying…" : "Disqualify"}</button>
        </div>
      </form>
    </Modal>
  );
}
