import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowDown, ArrowUp, Check, ChevronLeft, ExternalLink, GripVertical, ShieldCheck } from "lucide-react";

import Loader from "../../../../components/common/Loader";
import Modal from "../../../../components/common/Modal";
import ErrorMessage from "../../../../components/feedback/ErrorMessage";
import Toast from "../../../../components/feedback/Toast";
import {
  COMPETITION_STATUS,
  fullDate,
  getCompetitionResults,
  numberFormat,
  PLACEMENTS,
  publishCompetitionResults,
  RESULTS_PAGE_SIZE,
  saveCompetitionRanking,
} from "../../../../features/community/admin/review/reviewService";
import { Avatar, CompetitionTabs, SampleNotice } from "../../../../features/community/admin/review/reviewControls";
import { useCommunityList } from "../../../../features/community/listHooks";

const PRIZE_KEY = { first: "first", second: "second", third: "third" };

// A16 Results management. Judges score entries; admins and assigned judges rank and publish.
// The backend issues prizes, certificates, points and emails when results are published.
export default function AdminCompetitionResults() {
  const { competitionId } = useParams();
  const [limit, setLimit] = useState(RESULTS_PAGE_SIZE);
  const { data, error, loading, refreshing, reload } = useCommunityList(getCompetitionResults, { id: competitionId, limit });

  if (loading) return <section className="admin-page"><Loader label="Loading results…" /></section>;
  if (!data) {
    return (
      <section className="admin-page community-admin">
        <Link to="/admin/community/competitions" className="community-back-link"><ChevronLeft size={16} aria-hidden="true" /> Back to competitions</Link>
        <ErrorMessage message={error} onRetry={reload} />
      </section>
    );
  }
  return <ResultsBoard key={competitionId} data={data} error={error} refreshing={refreshing} reload={reload} onMore={() => setLimit((value) => value + RESULTS_PAGE_SIZE)} />;
}

function ResultsBoard({ data, error, refreshing, reload, onMore }) {
  const { competition, published } = data;
  const sample = Boolean(data.isSample);
  // Local edits on top of the loaded list: the order the admin chose and changed placements.
  const [order, setOrder] = useState([]);
  const [placements, setPlacements] = useState({});
  const [dragId, setDragId] = useState("");
  const [busy, setBusy] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);

  const byId = new Map(data.entries.map((entry) => [entry.id, entry]));
  const entries = [
    ...order.filter((id) => byId.has(id)).map((id) => byId.get(id)),
    ...data.entries.filter((entry) => !order.includes(entry.id)),
  ].map((entry) => ({ ...entry, placement: placements[entry.id] ?? entry.placement }));
  const dirty = order.length > 0 || Object.keys(placements).length > 0;
  const editable = !published;
  const unfinished = entries.filter((entry) => entry.judgesDone < entry.judgesTotal);
  const judgeCount = competition.judges?.length ?? 0;
  const status = COMPETITION_STATUS[competition.status] ?? COMPETITION_STATUS.judging;

  function move(from, to) {
    if (to < 0 || to >= entries.length || from === to) return;
    const ids = entries.map((entry) => entry.id);
    const [moved] = ids.splice(from, 1);
    ids.splice(to, 0, moved);
    setOrder(ids);
  }

  async function saveRanking({ quiet = false } = {}) {
    setBusy("save");
    try {
      await saveCompetitionRanking(competition.id, entries, { sample });
      setOrder([]);
      setPlacements({});
      if (!quiet) setToast({ type: "success", message: "Ranking saved. It stays private until you publish." });
      reload();
      return true;
    } catch (saveError) {
      setToast({ type: "error", message: saveError.message || "The ranking could not be saved." });
      return false;
    } finally {
      setBusy("");
    }
  }

  async function publish(sendWinnerEmails) {
    if (dirty && !(await saveRanking({ quiet: true }))) return;
    setBusy("publish");
    try {
      await publishCompetitionResults(competition.id, { sendWinnerEmails }, { sample });
      setConfirmOpen(false);
      setToast({ type: "success", message: `Official results for ${competition.title} are published${sendWinnerEmails ? " and winner emails are on their way" : ""}.` });
      reload();
    } catch (publishError) {
      setToast({ type: "error", message: publishError.message || "The results could not be published." });
    } finally {
      setBusy("");
    }
  }

  const winners = ["first", "second", "third"].map((key) => entries.find((entry) => entry.placement === key)).filter(Boolean);
  const mentions = entries.filter((entry) => entry.placement === "mention");

  return (
    <section className="admin-page community-admin">
      <Link to="/admin/community/competitions" className="community-back-link"><ChevronLeft size={16} aria-hidden="true" /> Back to competitions</Link>

      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">COMPETITION #{competition.number} · {published ? "RESULTS PUBLISHED" : status.label.toUpperCase()}</span>
          <h1>{competition.title} · Results</h1>
          <p>
            {numberFormat.format(data.total)} {data.total === 1 ? "entry" : "entries"} · scored by {judgeCount} {judgeCount === 1 ? "judge" : "judges"}
            {competition.winnersAnnouncedAt ? ` · winners announced ${fullDate.format(new Date(competition.winnersAnnouncedAt))}` : ""}
          </p>
        </div>
        {editable && data.entries.length > 0 ? (
          <div className="community-editor-actions">
            <button type="button" className="btn btn-outline" onClick={() => saveRanking()} disabled={Boolean(busy) || !dirty}>{busy === "save" ? "Saving…" : "Save ranking"}</button>
            <button type="button" className="btn btn-primary" onClick={() => setConfirmOpen(true)} disabled={Boolean(busy)}>Publish results</button>
          </div>
        ) : published ? (
          <a href={`/community/competitions/${encodeURIComponent(competition.id)}/results`} target="_blank" rel="noopener noreferrer" className="btn btn-outline">
            <ExternalLink size={16} aria-hidden="true" /> View public results<span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : null}
      </header>

      <CompetitionTabs id={competition.id} current="results" viewerRole={data.viewerRole} />
      {sample && <SampleNotice />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      <p className="car-info-banner"><ShieldCheck size={18} aria-hidden="true" /> Only administrators and assigned judges can publish official results. Scores come from judges and cannot be edited by students.</p>

      {data.entries.length === 0 ? (
        <section className="ui-card community-empty">
          <h2>No scored entries yet</h2>
          <p className="muted-text">Results open once the submission deadline has passed and judges start scoring.</p>
        </section>
      ) : (
        <div className="car-results-layout">
          <section className={`ui-card community-admin-table-card${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing} aria-labelledby="scored-title">
            <div className="ui-card-header">
              <h2 id="scored-title">Scored entries</h2>
              <span className="community-timeline-month">{editable ? "Drag rows or choose a placement · " : ""}{numberFormat.format(data.scored)} of {numberFormat.format(data.total)} scored</span>
            </div>
            <div className="community-table-wrap" tabIndex={0} role="region" aria-label="Scored entries (scrolls sideways)">
              <table className="community-table car-table-results">
                <thead>
                  <tr>
                    {editable && <th scope="col"><span className="sr-only">Reorder</span></th>}
                    <th scope="col">Rank</th>
                    <th scope="col">Entrant</th>
                    <th scope="col">Entry</th>
                    <th scope="col">Avg score</th>
                    <th scope="col">Judges</th>
                    <th scope="col">Placement</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, index) => (
                    <tr
                      key={entry.id}
                      draggable={editable}
                      className={dragId === entry.id ? "car-dragging" : undefined}
                      onDragStart={(event) => { setDragId(entry.id); event.dataTransfer.effectAllowed = "move"; }}
                      onDragOver={(event) => { if (dragId) event.preventDefault(); }}
                      onDrop={(event) => { event.preventDefault(); move(entries.findIndex((item) => item.id === dragId), index); setDragId(""); }}
                      onDragEnd={() => setDragId("")}
                    >
                      {editable && (
                        <td className="car-reorder-cell">
                          <GripVertical size={16} aria-hidden="true" className="car-grip" />
                          <button type="button" className="car-mini-button" aria-label={`Move ${entry.entrant} up`} disabled={index === 0} onClick={() => move(index, index - 1)}><ArrowUp size={14} aria-hidden="true" /></button>
                          <button type="button" className="car-mini-button" aria-label={`Move ${entry.entrant} down`} disabled={index === entries.length - 1} onClick={() => move(index, index + 1)}><ArrowDown size={14} aria-hidden="true" /></button>
                        </td>
                      )}
                      <td className="community-table-rank">{index + 1}</td>
                      <td><span className="community-table-member"><Avatar initials={entry.initials} index={index} /><strong>{entry.entrant}</strong></span></td>
                      <td>{entry.submissionId ? <Link to={`/admin/community/submissions/${encodeURIComponent(entry.submissionId)}`} className="community-admin-link">{entry.entryTitle}</Link> : entry.entryTitle}</td>
                      <td><strong>{entry.avgScore.toFixed(1)}</strong></td>
                      <td>{entry.judgesDone < entry.judgesTotal ? <span className="community-tag tag-amber" title="Not every judge has scored this entry">{entry.judgesDone}/{entry.judgesTotal}</span> : `${entry.judgesDone}/${entry.judgesTotal}`}</td>
                      <td>
                        {editable ? (
                          <select className="ui-input car-placement-select" aria-label={`Placement for ${entry.entrant}`} value={entry.placement} onChange={(event) => setPlacements((current) => ({ ...current, [entry.id]: event.target.value }))}>
                            {PLACEMENTS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                          </select>
                        ) : PLACEMENTS.find((item) => item.value === entry.placement)?.label ?? "None"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="community-list-footer community-leaderboard-footer">
              <p>Showing top {entries.length} of {numberFormat.format(data.total)}</p>
              {entries.length < data.total && <button type="button" className="btn btn-outline btn-sm" onClick={onMore} disabled={refreshing}>{refreshing ? "Loading…" : "Load more"}</button>}
            </div>
          </section>

          <aside className="car-results-side">
            <section className="ui-card" aria-labelledby="preview-title">
              <div className="ui-card-header">
                <h2 id="preview-title">Public results preview</h2>
                <span className={`community-tag ${published ? "tag-green" : "tag-neutral"}`}>{published ? "Published" : "Not published"}</span>
              </div>
              {winners.length === 0 && mentions.length === 0 ? <p className="muted-text">Choose placements to see the public results.</p> : (
                <ol className="car-podium-list">
                  {winners.map((entry) => (
                    <li key={entry.id}>
                      <span className={`car-place car-place-${entry.placement}`} aria-hidden="true">{{ first: 1, second: 2, third: 3 }[entry.placement]}</span>
                      <span className="min-w-0">
                        <strong>{entry.entrant}</strong>
                        <small>{PLACEMENTS.find((item) => item.value === entry.placement)?.label} · {entry.entryTitle}{competition.prizes?.[PRIZE_KEY[entry.placement]] ? ` · ${competition.prizes[PRIZE_KEY[entry.placement]]}` : ""}</small>
                      </span>
                    </li>
                  ))}
                  {mentions.length > 0 && (
                    <li>
                      <span className="car-place car-place-mention" aria-hidden="true">HM</span>
                      <span className="min-w-0">
                        <strong>{mentions.map((entry) => entry.entrant).join(", ")}</strong>
                        <small>Honourable {mentions.length === 1 ? "mention" : "mentions"}{competition.prizes?.mentions ? ` · ${competition.prizes.mentions}` : ""}</small>
                      </span>
                    </li>
                  )}
                </ol>
              )}
            </section>
            <section className="ui-card" aria-labelledby="on-publish-title">
              <h2 id="on-publish-title">On publish</h2>
              <ul className="car-check-list">
                <li><Check size={16} aria-hidden="true" /> Winners notified in-app and by email</li>
                <li><Check size={16} aria-hidden="true" /> Points awarded to placed entrants</li>
                <li><Check size={16} aria-hidden="true" /> Certificates and Premium prizes issued</li>
                <li><Check size={16} aria-hidden="true" /> Results page goes live for all students</li>
              </ul>
            </section>
          </aside>
        </div>
      )}

      <PublishDialog
        open={confirmOpen}
        title={competition.title}
        unfinished={unfinished}
        unscored={data.total - data.scored}
        busy={busy === "publish" || busy === "save"}
        onCancel={() => setConfirmOpen(false)}
        onPublish={publish}
      />
      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </section>
  );
}

function PublishDialog({ open, title, unfinished, unscored, busy, onCancel, onPublish }) {
  const [sendEmails, setSendEmails] = useState(true);
  let warning = "";
  if (unscored > 0) {
    const named = unfinished.map((entry) => `${entry.entrant}’s`);
    warning = unscored === 1 && named.length === 1
      ? `One judge has not finished scoring ${named[0]} entry.`
      : `${unscored} ${unscored === 1 ? "entry is" : "entries are"} not fully scored yet${named.length ? ` (including ${named.slice(0, 2).join(" and ")} ${named.length === 1 ? "entry" : "entries"})` : ""}.`;
  }
  return (
    <Modal open={open} onClose={() => !busy && onCancel()} title="Publish official results?">
      <div className="car-dialog">
        <p className="car-dialog-text">Results for {title} will become visible to every student. Prizes, certificates and points will be issued automatically. This cannot be undone.</p>
        {warning && <p className="community-delete-warning" role="alert">{warning}</p>}
        <label className="community-checkbox">
          <input type="checkbox" checked={sendEmails} onChange={(event) => setSendEmails(event.target.checked)} />
          Send winner emails now
        </label>
        <div className="community-delete-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => onPublish(sendEmails)} disabled={busy}>{busy ? "Publishing…" : "Publish results"}</button>
        </div>
      </div>
    </Modal>
  );
}
