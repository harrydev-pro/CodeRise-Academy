import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Trophy } from "lucide-react";

import Loader from "../../../../components/common/Loader";
import Modal from "../../../../components/common/Modal";
import ErrorMessage from "../../../../components/feedback/ErrorMessage";
import Toast from "../../../../components/feedback/Toast";
import {
  assignJudge,
  getHackathonSubmissions,
  publishHackathonResults,
  SUBMISSIONS_PAGE_SIZE,
} from "../../../../features/community/admin/events/adminEventsService";
import { FilterSelect, SampleNotice, SearchField, StatCard, Tag } from "../../../../features/community/admin/events/EventControls";
import {
  dayMonth,
  downloadCsv,
  fileDate,
  formatDayTime,
  JUDGING_STATUS,
  numberFormat,
  timeWat,
} from "../../../../features/community/admin/events/eventHelpers";
import { Pager } from "../../../../features/community/listControls";
import { readPage, useCommunityList, useDebouncedSearch, useUrlFilters } from "../../../../features/community/listHooks";

// A11 Hackathon submissions: assign judges, review scores and publish the official winners.
const PLACES = ["1st", "2nd", "3rd"];
const PLACE_LABEL = ["Champion", "Runner-up", "Third place"];
const PLACE_POINTS = [300, 150, 100];
const scoreFormat = new Intl.NumberFormat("en-GB", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function readFilters(params, id) {
  return {
    id,
    search: params.get("q") ?? "",
    judging: Object.keys(JUDGING_STATUS).includes(params.get("judging")) ? params.get("judging") : "",
    page: readPage(params),
  };
}

const membersLabel = (row) => (row.individual ? "Individual" : `${row.members[0] ?? ""}${row.members.length > 1 ? ` +${row.members.length - 1}` : ""}`);
const submittedLabel = (iso) => `${dayMonth.format(new Date(iso))} · ${timeWat.format(new Date(iso))}`;

const CSV_COLUMNS = [
  { label: "Rank", value: (row) => row.rank ?? "" },
  { label: "Team", value: (row) => row.team },
  { label: "Members", value: (row) => row.members.join("; ") },
  { label: "Project", value: (row) => row.project },
  { label: "Project link", value: (row) => row.projectUrl },
  { label: "Submitted (UTC)", value: (row) => row.submittedAt },
  { label: "Late", value: (row) => (row.late ? "Yes" : "No") },
  { label: "Judges", value: (row) => row.judges.map((judge) => judge.name).join("; ") },
  { label: "Judge scores", value: (row) => row.judges.map((judge) => (judge.score === null ? "—" : judge.score)).join("; ") },
  { label: "Average", value: (row) => row.average ?? "" },
  { label: "Status", value: (row) => JUDGING_STATUS[row.judging]?.label ?? row.judging },
];

export default function AdminHackathonSubmissions() {
  const { id } = useParams();
  const { params, update } = useUrlFilters();
  const filters = readFilters(params, id);
  const { data, error, loading, refreshing, reload } = useCommunityList(getHackathonSubmissions, filters);
  const [searchText, setSearchText] = useDebouncedSearch(filters.search, (q) => update({ q }));
  const sample = Boolean(data?.isSample);
  const [assigning, setAssigning] = useState("");
  const [exporting, setExporting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), [setToast]);

  const hackathon = data?.hackathon;
  const rows = data?.submissions ?? [];
  const stats = data?.stats;
  const winners = data?.winners ?? [];
  const ended = hackathon?.status === "ended";
  const canPublish = ended && !hackathon?.resultsPublished && winners.length > 0;
  const firstShown = data ? (data.pagination.page - 1) * SUBMISSIONS_PAGE_SIZE + 1 : 0;

  async function assign(row, judgeId) {
    if (!judgeId) return;
    setAssigning(row.id);
    try {
      await assignJudge(id, row.id, judgeId, { sample });
      const judge = hackathon.judges.find((item) => item.id === judgeId);
      setToast({ type: "success", message: `${judge?.name ?? "Judge"} will score ${row.project}.` });
      reload();
    } catch (assignError) {
      setToast({ type: "error", message: assignError.message || "The judge could not be assigned." });
    } finally {
      setAssigning("");
    }
  }

  async function exportCsv() {
    setExporting(true);
    try {
      const all = await getHackathonSubmissions({ ...filters, page: 1, all: true });
      downloadCsv(`${id}-submissions-${fileDate()}.csv`, CSV_COLUMNS, all.submissions);
      setToast({ type: "success", message: `Exported ${numberFormat.format(all.submissions.length)} submissions.` });
    } catch (exportError) {
      setToast({ type: "error", message: exportError.message || "The export failed. Please try again." });
    } finally {
      setExporting(false);
    }
  }

  const prizeLines = hackathon ? [
    `${hackathon.prizes.first}${hackathon.participation === "teams" ? " per member" : ""} · Winner certificate · ${PLACE_POINTS[0]} pts`,
    `${hackathon.prizes.second || "Recognition"} · Certificate · ${PLACE_POINTS[1]} pts`,
    `${hackathon.prizes.third || "Recognition"} · Certificate · ${PLACE_POINTS[2]} pts`,
  ] : [];

  return (
    <section className="admin-page community-admin">
      <Link to="/admin/community/hackathons" className="community-back-link"><ArrowLeft size={16} aria-hidden="true" /> Back to hackathons</Link>
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">HACKATHONS{hackathon ? ` · ${hackathon.title.toUpperCase()}` : ""}</span>
          <h1>Hackathon submissions</h1>
          {hackathon && (
            <p>
              Assign judges, review scores and publish the official results.{" "}
              {ended ? `Submissions closed ${formatDayTime(hackathon.endsAt)} WAT.` : hackathon.status === "live" ? `Submissions close ${formatDayTime(hackathon.endsAt)} WAT.` : "Submissions open when the hackathon starts."}
            </p>
          )}
          {hackathon && (
            <div className="cae-actions cae-header-buttons">
              <Link to={`/admin/community/hackathons/${encodeURIComponent(id)}/participants`} className="btn btn-outline">Participants</Link>
              <button type="button" className="btn btn-outline" onClick={exportCsv} disabled={exporting || !stats?.submissions}>{exporting ? "Exporting…" : "Export CSV"}</button>
              {hackathon.resultsPublished
                ? <span className="community-tag tag-green cae-published-tag">Results published</span>
                : <button type="button" className="btn btn-primary" onClick={() => setConfirmOpen(true)} disabled={!canPublish}>Publish winners</button>}
            </div>
          )}
        </div>
      </header>

      {sample && <SampleNotice />}
      {loading && <Loader label="Loading submissions…" />}
      {error && <ErrorMessage message={error} onRetry={reload} />}
      {hackathon && !ended && !hackathon.resultsPublished && (
        <p className="cae-info">Winners can be published once the hackathon has ended and the judges have scored.</p>
      )}

      {stats && (
        <div className="community-admin-stats cae-stats">
          <StatCard label="Submissions" value={numberFormat.format(stats.submissions)} hint={`from ${numberFormat.format(stats.registeredTeams)} registered ${hackathon.participation === "teams" ? "teams" : "participants"}`} />
          <StatCard label="Fully judged" value={numberFormat.format(stats.judged)} hint={stats.submissions ? `${Math.round((stats.judged / stats.submissions) * 100)}% complete` : undefined} hintTone="good" />
          <StatCard label="Awaiting a judge" value={numberFormat.format(stats.awaiting)} hint={stats.awaiting ? `Assign before ${dayMonth.format(new Date(stats.assignBy))}` : "All assigned"} hintTone={stats.awaiting ? "warn" : "good"} />
          <StatCard label="Judges" value={numberFormat.format(stats.judges.length)} hint={stats.judges.map((name) => name.split(" ")[0]).join(", ")} />
        </div>
      )}

      {data && (
        <section className={`ui-card community-admin-table-card${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing} aria-label="Submissions">
          <div className="cae-toolbar">
            <SearchField label="Search submissions" placeholder="Search team or project" value={searchText} onChange={setSearchText} />
            <FilterSelect label="Judging status" value={filters.judging} onChange={(judging) => update({ judging })} options={[{ value: "", label: "All judging statuses" }, ...Object.entries(JUDGING_STATUS).map(([value, item]) => ({ value, label: item.label }))]} />
            <p className="cae-showing">Sorted by average score</p>
          </div>

          {rows.length === 0 ? (
            <div className="community-empty">
              <span className="community-icon tone-amber" aria-hidden="true"><Trophy size={22} /></span>
              <h2>{filters.search || filters.judging ? "No submissions match your filters" : "No submissions yet"}</h2>
              <p className="muted-text">{filters.search || filters.judging ? "Try a different search or status." : "Submissions appear here as teams submit during the hackathon."}</p>
            </div>
          ) : (
            <>
              <div className="community-table-wrap" tabIndex={0} role="region" aria-label="Submissions table (scrolls sideways)">
                <table className="community-table cae-table-submissions">
                  <thead>
                    <tr>
                      <th scope="col">Rank</th>
                      <th scope="col">Team</th>
                      <th scope="col">Project</th>
                      <th scope="col">Submitted</th>
                      <th scope="col">Judges</th>
                      <th scope="col">Judge scores</th>
                      <th scope="col">Average</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => {
                      const status = JUDGING_STATUS[row.judging] ?? JUDGING_STATUS.awaiting;
                      const scored = row.judges.filter((judge) => judge.score !== null).length;
                      const available = hackathon.judges.filter((judge) => !row.judges.some((item) => item.id === judge.id));
                      const needsJudge = !row.late && row.judges.length < 2 && available.length > 0 && !hackathon.resultsPublished;
                      return (
                        <tr key={row.id} className={row.rank && row.rank <= 3 ? `cae-place-${row.rank}` : undefined}>
                          <td>{row.rank ? (row.rank <= 3 ? <span className={`cae-rank cae-rank-${row.rank}`}>{PLACES[row.rank - 1]}</span> : row.rank) : <><span aria-hidden="true">—</span><span className="sr-only">Not ranked</span></>}</td>
                          <th scope="row" className="cae-person"><strong>{row.team}</strong><span className="cae-sub">{membersLabel(row)}</span></th>
                          <td><a href={row.projectUrl} target="_blank" rel="noopener noreferrer" className="community-admin-link">{row.project}<span className="sr-only"> (opens in a new tab)</span></a></td>
                          <td>{submittedLabel(row.submittedAt)}</td>
                          {row.late ? (
                            <td colSpan={3} className="cae-muted">Submitted {Math.max(1, Math.round((new Date(row.submittedAt) - new Date(hackathon.endsAt)) / 60000))} minutes after the deadline</td>
                          ) : (
                            <>
                              <td>
                                <span className="cae-judge-cell">
                                  {row.judges.length > 0 && <span>{row.judges.map((judge) => judge.name.split(" ")[0]).join(", ")}</span>}
                                  {needsJudge && (
                                    <select
                                      className="ui-input cae-assign"
                                      aria-label={`Assign a judge to ${row.project}`}
                                      value=""
                                      disabled={assigning === row.id}
                                      onChange={(event) => assign(row, event.target.value)}
                                    >
                                      <option value="">{assigning === row.id ? "Assigning…" : row.judges.length ? "Add judge…" : "Assign judge…"}</option>
                                      {available.map((judge) => <option key={judge.id} value={judge.id}>{judge.name}</option>)}
                                    </select>
                                  )}
                                </span>
                              </td>
                              <td>{row.judges.length ? row.judges.map((judge) => (judge.score === null ? "—" : judge.score)).join(" · ") : "— · —"}</td>
                              <td><strong>{row.average === null ? "—" : scoreFormat.format(row.average)}</strong></td>
                            </>
                          )}
                          <td><Tag tone={status.tone}>{row.judging === "partial" ? `${scored} of ${row.judges.length} judged` : status.label}</Tag></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="community-list-footer community-leaderboard-footer">
                <p>Showing {firstShown}–{firstShown + rows.length - 1} of {numberFormat.format(data.pagination.total)}</p>
                <Pager pagination={data.pagination} onPage={(page) => update({ page })} label="Submission pages" />
              </div>
            </>
          )}
        </section>
      )}

      {data && winners.length > 0 && (
        <section className="ui-card cae-winners" aria-labelledby="winners-title">
          <h2 id="winners-title">{hackathon.resultsPublished ? "Official winners" : "Winners to publish"}</h2>
          <p className="cae-hint">Only administrators and assigned judges can publish official results.</p>
          <ol>
            {winners.map((row, index) => (
              <li key={row.id} className={index === 0 ? "is-first" : undefined}>
                <div className="min-w-0">
                  <strong>{PLACES[index]} · {row.team} — {row.project}</strong>
                  <span className="cae-sub">{prizeLines[index]}</span>
                </div>
                <Tag tone={index === 0 ? "amber" : "neutral"}>{PLACE_LABEL[index]}</Tag>
              </li>
            ))}
          </ol>
          {data.needsSecondJudge > 0 && !hackathon.resultsPublished && (
            <p className="cae-hint">
              {data.needsSecondJudge} {data.needsSecondJudge === 1 ? "submission still needs" : "submissions still need"} a second judge. Publishing is allowed, but those scores will not be final.
            </p>
          )}
        </section>
      )}

      <PublishDialog
        key={confirmOpen ? "open" : "closed"}
        open={confirmOpen}
        hackathon={hackathon}
        winner={winners[0]}
        teams={stats?.registeredTeams ?? 0}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={async (options) => {
          await publishHackathonResults(id, options, { sample });
          setToast({ type: "success", message: "Results published. Winners and participants are being notified." });
          setConfirmOpen(false);
          reload();
        }}
      />
      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </section>
  );
}

function PublishDialog({ open, hackathon, winner, teams, onCancel, onConfirm }) {
  const [sendEmail, setSendEmail] = useState(true);
  const [postAnnouncement, setPostAnnouncement] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!hackathon) return null;
  const memberCount = winner?.members.length ?? 0;

  async function confirm() {
    setBusy(true);
    setError("");
    try {
      await onConfirm({ sendEmail, postAnnouncement });
    } catch (publishError) {
      setError(publishError.message || "The results could not be published. Please try again.");
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={() => !busy && onCancel()} title="Publish official results?" size="max-w-xl">
      <div className="cae-dialog-form">
        <div className="cae-dialog-lead">
          <span className="community-icon tone-purple" aria-hidden="true"><Trophy size={20} /></span>
          <p>
            This makes the {hackathon.title} leaderboard public, notifies all {numberFormat.format(teams)} {hackathon.participation === "teams" ? "teams" : "participants"}
            {hackathon.prizes.grantPremium && winner
              ? <> and automatically grants <strong>1 month of CodeRise Premium</strong> to {hackathon.participation === "teams" ? `the ${memberCount} ${memberCount === 1 ? "member" : "members"} of ${winner.team}` : winner.team}.</>
              : "."}
          </p>
        </div>
        <p className="cae-warning">Results cannot be unpublished. Corrections later will show as an edit on the public page.</p>
        <label className="community-checkbox"><input type="checkbox" checked={sendEmail} onChange={(event) => setSendEmail(event.target.checked)} /> Send email to all participants</label>
        <label className="community-checkbox"><input type="checkbox" checked={postAnnouncement} onChange={(event) => setPostAnnouncement(event.target.checked)} /> Post a community announcement</label>
        {error && <p className="field-error" role="alert">{error}</p>}
        <div className="community-delete-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={confirm} disabled={busy}>{busy ? "Publishing…" : "Publish results"}</button>
        </div>
      </div>
    </Modal>
  );
}
