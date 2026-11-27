import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, Download, Search } from "lucide-react";

import Loader from "../../../../components/common/Loader";
import ErrorMessage from "../../../../components/feedback/ErrorMessage";
import Toast from "../../../../components/feedback/Toast";
import {
  downloadCsv,
  exportCompetitionParticipants,
  fullDate,
  getCompetitionParticipants,
  numberFormat,
  PARTICIPANT_CSV_HEADER,
  PARTICIPANT_PAYMENT,
  PARTICIPANT_SUBMISSION,
  participantCsvRow,
  PARTICIPANTS_PAGE_SIZE,
  PLANS,
  toCsv,
  usd,
} from "../../../../features/community/admin/review/reviewService";
import { Avatar, CompetitionTabs, FilterSelect, SampleNotice, SimplePager, StatTile, Tag } from "../../../../features/community/admin/review/reviewControls";
import { readPage, useCommunityList, useDebouncedSearch, useUrlFilters } from "../../../../features/community/listHooks";

function readFilters(params, id) {
  const pick = (name, allowed) => (allowed.includes(params.get(name)) ? params.get(name) : "");
  return {
    id,
    search: params.get("q") ?? "",
    payment: pick("payment", Object.keys(PARTICIPANT_PAYMENT)),
    submission: pick("submission", Object.keys(PARTICIPANT_SUBMISSION)),
    plan: pick("plan", Object.keys(PLANS)),
    page: readPage(params),
  };
}

// A14 Competition participants.
export default function AdminCompetitionParticipants() {
  const { competitionId } = useParams();
  const { params, update } = useUrlFilters();
  const filters = readFilters(params, competitionId);
  const { data, error, loading, refreshing, reload } = useCommunityList(getCompetitionParticipants, filters);
  const [searchText, setSearchText] = useDebouncedSearch(filters.search, (q) => update({ q }));
  const [toast, setToast] = useState(null);
  const [exporting, setExporting] = useState(false);
  const closeToast = useCallback(() => setToast(null), []);

  const listKey = JSON.stringify(filters);
  const [selection, setSelection] = useState({ key: listKey, ids: new Set() });
  const selected = selection.key === listKey ? selection.ids : new Set();
  const setSelected = (ids) => setSelection({ key: listKey, ids });

  const rows = data?.participants ?? [];
  const allOnPage = rows.length > 0 && rows.every((row) => selected.has(row.id));
  const someOnPage = rows.some((row) => selected.has(row.id));
  const headerBox = useRef(null);
  useEffect(() => {
    if (headerBox.current) headerBox.current.indeterminate = someOnPage && !allOnPage;
  }, [someOnPage, allOnPage]);

  const competition = data?.competition;
  const fileBase = `${competitionId}-participants`;

  async function exportAll() {
    setExporting(true);
    try {
      const { id, ...rest } = filters;
      delete rest.page;
      const csv = await exportCompetitionParticipants({ id, ...rest }, { sample: data?.isSample });
      downloadCsv(`${fileBase}.csv`, csv);
      setToast({ type: "success", message: "Participant list exported." });
    } catch (exportError) {
      setToast({ type: "error", message: exportError.message || "The export failed. Please try again." });
    } finally {
      setExporting(false);
    }
  }

  function exportSelected() {
    downloadCsv(`${fileBase}-selected.csv`, toCsv(PARTICIPANT_CSV_HEADER, rows.filter((row) => selected.has(row.id)).map(participantCsvRow)));
  }

  function toggleRow(id) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  }

  if (loading) return <section className="admin-page"><Loader label="Loading participants…" /></section>;
  if (error && !data) {
    return (
      <section className="admin-page community-admin">
        <Link to="/admin/community/competitions" className="community-back-link"><ChevronLeft size={16} aria-hidden="true" /> Back to competitions</Link>
        <ErrorMessage message={error} onRetry={reload} />
      </section>
    );
  }

  const fee = competition.entryFeeUsd > 0;
  const firstShown = (data.pagination.page - 1) * PARTICIPANTS_PAGE_SIZE + 1;

  return (
    <section className="admin-page community-admin">
      <Link to="/admin/community/competitions" className="community-back-link"><ChevronLeft size={16} aria-hidden="true" /> Back to competitions</Link>

      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">COMPETITION #{competition.number} · {fee ? `${usd.format(competition.entryFeeUsd).replace(".00", "")} ENTRY` : "FREE ENTRY"}</span>
          <h1>{competition.title}</h1>
          <p>Registration closes {fullDate.format(new Date(competition.registrationClosesAt))} · Submissions due {fullDate.format(new Date(competition.submissionDeadline))}</p>
        </div>
        <div className="community-editor-actions">
          <Link to={`/admin/community/competitions/${encodeURIComponent(competitionId)}/edit`} className="btn btn-outline">Edit competition</Link>
          <button type="button" className="btn btn-primary" onClick={exportAll} disabled={exporting}><Download size={17} aria-hidden="true" /> {exporting ? "Exporting…" : "Export CSV"}</button>
        </div>
      </header>

      <CompetitionTabs id={competitionId} current="participants" viewerRole={data.viewerRole} />
      {data.isSample && <SampleNotice />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      <div className="community-admin-stats car-stats-4">
        <StatTile label="Registered" value={numberFormat.format(data.stats.registered)} suffix={competition.participantLimit ? `/ ${numberFormat.format(competition.participantLimit)}` : undefined} />
        <StatTile label={fee ? "Paid & confirmed" : "Confirmed"} value={numberFormat.format(data.stats.paid)} />
        <StatTile label="Payment pending" value={numberFormat.format(data.stats.pending)} valueTone={data.stats.pending ? "warn" : undefined} />
        <StatTile label="Submitted so far" value={numberFormat.format(data.stats.submitted)} />
      </div>

      {selected.size > 0 && (
        <div className="community-bulk-bar" role="region" aria-label="Selected participants">
          <strong>{selected.size} selected</strong>
          <button type="button" className="btn btn-outline btn-sm" onClick={exportSelected}>Export selected</button>
          <button type="button" className="community-link-button community-bulk-clear" onClick={() => setSelected(new Set())}>Clear selection</button>
        </div>
      )}

      <section className={`ui-card community-admin-table-card${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing} aria-label="Participants">
        <div className="car-table-toolbar">
          <label className="community-search car-toolbar-search">
            <span className="sr-only">Search participants</span>
            <Search size={18} aria-hidden="true" />
            <input type="search" className="ui-input" placeholder="Search by name or email" value={searchText} onChange={(event) => setSearchText(event.target.value)} />
          </label>
          <div className="car-toolbar-selects">
            <FilterSelect label="Payment" hideLabel value={filters.payment} onChange={(payment) => update({ payment })} options={[{ value: "", label: "All payments" }, ...Object.entries(PARTICIPANT_PAYMENT).map(([value, item]) => ({ value, label: item.label }))]} />
            <FilterSelect label="Submission" hideLabel value={filters.submission} onChange={(submission) => update({ submission })} options={[{ value: "", label: "All submissions" }, ...Object.entries(PARTICIPANT_SUBMISSION).map(([value, item]) => ({ value, label: item.label }))]} />
            <FilterSelect label="Plan" hideLabel value={filters.plan} onChange={(plan) => update({ plan })} options={[{ value: "", label: "All plans" }, ...Object.entries(PLANS).map(([value, item]) => ({ value, label: item.label }))]} />
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="community-empty">
            <h2>{data.pagination.total === 0 && !filters.search && !filters.payment && !filters.submission && !filters.plan ? "No participants yet" : "No participants match your filters"}</h2>
            <p className="muted-text">Registrations appear here as soon as students sign up.</p>
          </div>
        ) : (
          <>
            <div className="community-table-wrap" tabIndex={0} role="region" aria-label="Participants table (scrolls sideways)">
              <table className="community-table car-table-participants">
                <thead>
                  <tr>
                    <th scope="col" className="community-check-cell">
                      <input ref={headerBox} type="checkbox" aria-label="Select all participants on this page" checked={allOnPage} onChange={() => setSelected(allOnPage ? new Set() : new Set(rows.map((row) => row.id)))} />
                    </th>
                    <th scope="col">Participant</th>
                    <th scope="col">Plan</th>
                    <th scope="col">Registered</th>
                    <th scope="col">Payment</th>
                    <th scope="col">Submission</th>
                    <th scope="col">Score</th>
                    <th scope="col"><span className="sr-only">Action</span></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => {
                    const payment = PARTICIPANT_PAYMENT[row.payment] ?? { label: row.payment, tone: "neutral" };
                    return (
                      <tr key={row.id} className={selected.has(row.id) ? "is-selected" : undefined}>
                        <td className="community-check-cell"><input type="checkbox" aria-label={`Select ${row.name}`} checked={selected.has(row.id)} onChange={() => toggleRow(row.id)} /></td>
                        <td>
                          <span className="community-table-member">
                            <Avatar initials={row.initials} index={index} />
                            <span><strong className="car-cell-title">{row.name}</strong><span className="car-cell-sub">{row.email}</span></span>
                          </span>
                        </td>
                        <td><Tag map={PLANS} value={row.plan} /></td>
                        <td>{fullDate.format(new Date(row.registeredAt))}</td>
                        <td><span className={`community-tag tag-${payment.tone}`}>{payment.label}{row.payment === "paid" && row.amountUsd ? ` · ${usd.format(row.amountUsd)}` : ""}</span></td>
                        <td><Tag map={PARTICIPANT_SUBMISSION} value={row.submission} /></td>
                        <td>{typeof row.score === "number" ? row.score.toFixed(1) : "—"}</td>
                        <td className="is-number">
                          {row.payment === "pending" && row.paymentId ? (
                            <Link to={`/admin/community/payments?q=${encodeURIComponent(row.paymentId)}`} className="btn btn-outline btn-sm" aria-label={`Check payment for ${row.name}`}>Check payment</Link>
                          ) : row.submissionId ? (
                            <Link to={`/admin/community/submissions/${encodeURIComponent(row.submissionId)}`} className="btn btn-outline btn-sm" aria-label={`View submission by ${row.name}`}>View</Link>
                          ) : (
                            <Link to={`/community/u/${encodeURIComponent(row.username)}`} className="btn btn-outline btn-sm" aria-label={`View ${row.name}'s profile`}>View</Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="community-list-footer community-leaderboard-footer">
              <p>Showing {firstShown}–{firstShown + rows.length - 1} of {numberFormat.format(data.pagination.total)} participants</p>
              <SimplePager pagination={data.pagination} onPage={(page) => update({ page })} label="Participant pages" />
            </div>
          </>
        )}
      </section>
      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </section>
  );
}
