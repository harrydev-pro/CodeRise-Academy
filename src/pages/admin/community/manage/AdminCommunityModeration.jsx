import { useRef, useState } from "react";
import { Ban, ShieldAlert, Trash2 } from "lucide-react";

import Loader from "../../../../components/common/Loader";
import ErrorMessage from "../../../../components/feedback/ErrorMessage";
import Toast from "../../../../components/feedback/Toast";
import { getAdminReports, moderateReport, REPORT_TYPES, RESOLUTION_LABELS } from "../../../../features/community/admin/manage/adminManageService";
import { ConfirmDialog, FilterSelect, MemberAvatar, SampleNotice, StatusTabs } from "../../../../features/community/admin/manage/manageControls";
import { dayMonth, fullDate, monthYear, useToastState } from "../../../../features/community/admin/manage/manageUtils";
import { Pager } from "../../../../features/community/listControls";
import { readPage, useCommunityList, useUrlFilters } from "../../../../features/community/listHooks";

const STATUSES = ["open", "in_review", "resolved"];
const TARGET_LINKS = {
  showcase: (id) => `/community/showcase?project=${encodeURIComponent(id)}`,
  profile: (id) => `/community/u/${encodeURIComponent(id)}`,
  submission: (id) => `/admin/community/submissions/${encodeURIComponent(id)}`,
};
const ACTIONS = {
  dismiss: { title: "Dismiss this report?", body: "The content stays up and the reporter is told no rule was broken.", confirm: "Dismiss report", done: "Report dismissed." },
  remove_content: { title: "Remove this content?", body: "The content is hidden from every student. The author is told which rule it broke.", confirm: "Remove content", done: "Content removed.", danger: true },
  warn: { title: "Warn this member?", body: "They receive a warning with your note. Warnings are shown on future reports about them.", confirm: "Send warning", done: "Warning sent." },
  suspend: { title: "Suspend this member?", body: "They keep their courses but cannot post, join teams or enter events while suspended.", confirm: "Suspend member", done: "Member suspended.", danger: true },
};
const SUSPEND_DAYS = [
  { value: "3", label: "3 days" },
  { value: "7", label: "7 days" },
  { value: "14", label: "14 days" },
  { value: "30", label: "30 days" },
  { value: "", label: "Until restored" },
];

export default function AdminCommunityModeration() {
  const { params, update } = useUrlFilters();
  const filters = {
    status: STATUSES.includes(params.get("status")) ? params.get("status") : "open",
    type: Object.keys(REPORT_TYPES).includes(params.get("type")) ? params.get("type") : "",
    page: readPage(params),
  };
  const { data, error, loading, refreshing, reload } = useCommunityList(getAdminReports, filters);
  const [selectedId, setSelectedId] = useState(null);
  const [toast, setToast, closeToast] = useToastState();
  const detailRef = useRef(null);
  const sample = Boolean(data?.isSample);
  const rows = data?.reports ?? [];
  const selected = rows.find((row) => row.id === selectedId) ?? rows[0] ?? null;

  function select(id) {
    setSelectedId(id);
    window.requestAnimationFrame(() => {
      if (window.matchMedia("(max-width: 1099px)").matches) detailRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      detailRef.current?.focus({ preventScroll: true });
    });
  }

  return (
    <section className="admin-page community-admin cam-page">
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">TRUST &amp; SAFETY</span>
          <h1>Reports and moderation</h1>
          <p>Content and members reported by students. Every action is recorded in the activity log.</p>
        </div>
      </header>

      {sample && <SampleNotice>Actions change this browser tab only; nobody is notified.</SampleNotice>}

      <div className="cam-toolbar">
        <StatusTabs
          label="Report status"
          value={filters.status}
          onChange={(status) => update({ status: status === "open" ? "" : status })}
          tabs={[
            { value: "open", label: "Open", count: data?.counts.open },
            { value: "in_review", label: "In review", count: data?.counts.in_review },
            { value: "resolved", label: "Resolved", count: data?.counts.resolved },
          ]}
        />
        <FilterSelect hideLabel label="Report type" value={filters.type} onChange={(type) => update({ type })} options={[{ value: "", label: "All report types" }, ...Object.entries(REPORT_TYPES).map(([value, item]) => ({ value, label: item.label }))]} />
      </div>

      {loading && <Loader label="Loading reports…" />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && (
        <div className={`cam-split${rows.length ? "" : " is-single"}`}>
          <section className={`ui-card community-admin-table-card cam-split-main${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing} aria-label="Reports">
            {rows.length === 0 ? (
              <div className="community-empty">
                <span className="community-icon tone-green"><ShieldAlert size={22} aria-hidden="true" /></span>
                <h2>{filters.status === "open" ? "No open reports" : "Nothing here"}</h2>
                <p className="muted-text">{filters.status === "open" ? "The queue is clear. New student reports will appear here." : "Try another tab or report type."}</p>
              </div>
            ) : (
              <>
                <div className="community-table-wrap" tabIndex={0} role="region" aria-label="Reports table (scrolls sideways)">
                  <table className="community-table cam-reports-table">
                    <thead>
                      <tr>
                        <th scope="col">Type</th>
                        <th scope="col">Reported content</th>
                        <th scope="col">Reporter</th>
                        <th scope="col">Date</th>
                        <th scope="col" className="is-number">Reports</th>
                        {filters.status === "resolved" && <th scope="col">Outcome</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => {
                        const type = REPORT_TYPES[row.type] ?? REPORT_TYPES.other;
                        const active = selected?.id === row.id;
                        return (
                          <tr key={row.id} className={active ? "is-selected" : undefined}>
                            <td><span className={`community-tag tag-${type.tone}`}>{type.label}</span></td>
                            <td className="cam-wrap-cell">
                              <button type="button" className="cam-report-link" aria-pressed={active} onClick={() => select(row.id)}>
                                <strong>{row.target}</strong>
                                <span>{row.excerpt}</span>
                              </button>
                            </td>
                            <td>{row.reporter}</td>
                            <td>{dayMonth.format(new Date(row.createdAt))}</td>
                            <td className="is-number">{row.reports}</td>
                            {filters.status === "resolved" && <td>{RESOLUTION_LABELS[row.resolution?.action] ?? "—"}</td>}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {data.pagination.totalPages > 1 && (
                  <div className="community-list-footer community-leaderboard-footer">
                    <p>Page {data.pagination.page} of {data.pagination.totalPages}</p>
                    <Pager pagination={data.pagination} onPage={(page) => update({ page })} label="Report pages" />
                  </div>
                )}
              </>
            )}
          </section>

          {selected && (
            <div className="cam-split-side" ref={detailRef} tabIndex={-1} aria-label="Selected report">
              <ReportDetail
                key={selected.id}
                report={selected}
                sample={sample}
                onDone={(message) => { setToast({ type: "success", message }); setSelectedId(null); reload(); }}
                onError={(message) => setToast({ type: "error", message })}
              />
            </div>
          )}
        </div>
      )}
      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </section>
  );
}

function ReportDetail({ report, sample, onDone, onError }) {
  const [note, setNote] = useState("");
  const [action, setAction] = useState(null);
  const [days, setDays] = useState("14");
  const [busy, setBusy] = useState(false);
  const type = REPORT_TYPES[report.type] ?? REPORT_TYPES.other;
  const link = TARGET_LINKS[report.targetType]?.(report.targetId);
  const resolved = report.status === "resolved";

  async function run(kind) {
    setBusy(true);
    try {
      await moderateReport(report.id, { action: kind, note: note.trim(), days: kind === "suspend" && days ? Number(days) : undefined }, { sample });
      setAction(null);
      onDone(kind === "review" ? "Moved to In review." : ACTIONS[kind].done);
    } catch (actionError) {
      setAction(null);
      onError(actionError.message || "That didn't work. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const current = action ? ACTIONS[action] : null;
  return (
    <article className="ui-card cam-report" aria-labelledby="report-title">
      <div className="cam-report-top">
        <span className={`community-tag tag-${type.tone}`}>{type.label}</span>
        <span className="cam-muted-small">Report #{report.number} · {fullDate.format(new Date(report.createdAt))}</span>
      </div>
      <h2 id="report-title">{report.target}</h2>
      {link && <a className="community-admin-link cam-small-link" href={link} target="_blank" rel="noopener noreferrer">Open the reported content<span className="sr-only"> (opens in a new tab)</span></a>}

      <div className="cam-report-content">
        <div className="cam-report-author">
          <MemberAvatar name={report.subject.name} index={1} />
          <span className="min-w-0">
            <strong>{report.subject.name}</strong>
            <small>Member since {monthYear.format(new Date(report.subject.memberSince))} · {report.subject.previousWarnings ? `${report.subject.previousWarnings} previous ${report.subject.previousWarnings === 1 ? "warning" : "warnings"}` : "no previous warnings"}</small>
          </span>
        </div>
        <blockquote>{report.content}</blockquote>
      </div>

      <h3>Reporter notes</h3>
      <p className="cam-muted-small">{report.reporterNote ? <>“{report.reporterNote}” — {report.reporter}</> : `No note from ${report.reporter}.`}{report.reports > 1 ? ` Reported ${report.reports} times.` : ""}</p>

      {report.history.length > 0 && (
        <>
          <h3>History</h3>
          <dl className="cam-history">
            {report.history.map((item) => <div key={`${item.label}-${item.date}`}><dt>{item.label}</dt><dd>{fullDate.format(new Date(item.date))}</dd></div>)}
          </dl>
        </>
      )}

      {resolved ? (
        <p className="cam-resolution" role="status">
          <strong>{RESOLUTION_LABELS[report.resolution?.action] ?? "Resolved"}</strong>
          {report.resolution && ` by ${report.resolution.by} on ${fullDate.format(new Date(report.resolution.at))}.`}
          {report.resolution?.note && ` Note: ${report.resolution.note}`}
        </p>
      ) : (
        <>
          <div className="community-field">
            <label htmlFor="moderator-note" className="cam-label">Moderator note</label>
            <textarea id="moderator-note" className="ui-input" rows={3} value={note} placeholder="Kept in the activity log. Included in the message to the member for warnings and suspensions." onChange={(event) => setNote(event.target.value)} />
          </div>
          <div className="cam-report-actions">
            <button type="button" className="btn btn-outline" onClick={() => setAction("dismiss")} disabled={busy}>Dismiss</button>
            <button type="button" className="btn btn-outline" onClick={() => setAction("remove_content")} disabled={busy}>Remove content</button>
            <button type="button" className="btn btn-outline cam-btn-warn" onClick={() => setAction("warn")} disabled={busy}>Warn user</button>
            <button type="button" className="btn community-btn-danger" onClick={() => setAction("suspend")} disabled={busy}>Suspend user</button>
          </div>
          {report.status === "open" && (
            <button type="button" className="community-link-button cam-review-link" onClick={() => run("review")} disabled={busy}>Mark as in review</button>
          )}
        </>
      )}

      <ConfirmDialog
        open={Boolean(current)}
        title={current?.title ?? ""}
        confirmLabel={current?.confirm ?? ""}
        busyLabel="Working…"
        danger={Boolean(current?.danger)}
        busy={busy}
        icon={action === "suspend" ? <Ban size={22} /> : action === "remove_content" ? <Trash2 size={22} /> : null}
        onCancel={() => setAction(null)}
        onConfirm={() => run(action)}
      >
        <p>{current?.body} The action is recorded in the activity log{note.trim() ? " with your note" : ""}.</p>
        {action === "suspend" && (
          <div className="community-field">
            <label htmlFor="report-suspend-days" className="cam-label">Duration</label>
            <select id="report-suspend-days" className="ui-input" value={days} onChange={(event) => setDays(event.target.value)}>
              {SUSPEND_DAYS.map((item) => <option key={item.label} value={item.value}>{item.label}</option>)}
            </select>
          </div>
        )}
      </ConfirmDialog>
    </article>
  );
}
