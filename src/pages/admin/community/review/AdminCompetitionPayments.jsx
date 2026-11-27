import { useCallback, useId, useState } from "react";
import { AlertCircle, Clock3, DollarSign, Download, RotateCcw, Search, Wallet } from "lucide-react";

import Loader from "../../../../components/common/Loader";
import Modal from "../../../../components/common/Modal";
import ErrorMessage from "../../../../components/feedback/ErrorMessage";
import Toast from "../../../../components/feedback/Toast";
import {
  downloadCsv,
  exportAdminPayments,
  fullDate,
  getAdminPayments,
  numberFormat,
  PAYMENT_STATUS,
  PAYMENTS_PAGE_SIZE,
  refundAdminPayment,
  REFUND_REASONS,
  usd,
  usdShort,
  verifyAdminPayment,
} from "../../../../features/community/admin/review/reviewService";
import { CompetitionTabs, FilterSelect, SampleNotice, SimplePager, StatTile, Tag } from "../../../../features/community/admin/review/reviewControls";
import { readPage, useCommunityList, useDebouncedSearch, useUrlFilters } from "../../../../features/community/listHooks";

function readFilters(params) {
  const status = params.get("status");
  return {
    search: params.get("q") ?? "",
    competition: params.get("competition") ?? "",
    status: Object.keys(PAYMENT_STATUS).includes(status) ? status : "",
    page: readPage(params),
  };
}

// A15 Competition payments. Card details stay with the payment provider; this page only shows
// the brand and last four digits the API returns. Refunds and verification are backend calls.
export default function AdminCompetitionPayments() {
  const { params, update } = useUrlFilters();
  const filters = readFilters(params);
  const { data, error, loading, refreshing, reload } = useCommunityList(getAdminPayments, filters);
  const [searchText, setSearchText] = useDebouncedSearch(filters.search, (q) => update({ q }));
  const [toast, setToast] = useState(null);
  const [busyId, setBusyId] = useState("");
  const [exporting, setExporting] = useState(false);
  const [refunding, setRefunding] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);
  const sample = Boolean(data?.isSample);
  const rows = data?.payments ?? [];
  const firstShown = data ? (data.pagination.page - 1) * PAYMENTS_PAGE_SIZE + 1 : 0;

  async function verify(payment) {
    setBusyId(payment.id);
    try {
      const result = await verifyAdminPayment(payment.id, { sample });
      const status = result?.payment?.status;
      setToast(status === "verified" || !status
        ? { type: "success", message: `${payment.reference} is verified. ${payment.student}'s registration is confirmed.` }
        : { type: "error", message: `The provider still reports ${payment.reference} as ${PAYMENT_STATUS[status]?.label.toLowerCase() ?? status}.` });
      reload();
    } catch (verifyError) {
      setToast({ type: "error", message: verifyError.message || "The provider could not be reached. Please try again." });
    } finally {
      setBusyId("");
    }
  }

  async function exportReport() {
    setExporting(true);
    try {
      const rest = { ...filters };
      delete rest.page;
      downloadCsv("competition-payments.csv", await exportAdminPayments(rest, { sample }));
      setToast({ type: "success", message: "Payment report exported." });
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
          <h1>Competition payments</h1>
          <p>Entry fees in USD. Registrations are confirmed only after the payment provider verifies the charge.</p>
        </div>
        <button type="button" className="btn btn-outline" onClick={exportReport} disabled={exporting || !data}><Download size={17} aria-hidden="true" /> {exporting ? "Exporting…" : "Export report"}</button>
      </header>

      {filters.competition && <CompetitionTabs id={filters.competition} current="payments" viewerRole={data?.viewerRole} />}
      {sample && <SampleNotice>Showing sample data: the admin Community API is not available yet. Refunds and verification are simulated in this browser tab only; no money moves. This notice only appears on the local dev server.</SampleNotice>}
      {loading && <Loader label="Loading payments…" />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && (
        <>
          <div className="community-admin-stats car-stats-4">
            <StatTile label="Gross revenue" value={usdShort.format(data.stats.grossUsd)} icon={DollarSign} tone="green" />
            <StatTile label="Net after refunds" value={usdShort.format(data.stats.netUsd)} icon={Wallet} tone="blue" />
            <StatTile label="Pending verification" value={numberFormat.format(data.stats.pending)} icon={Clock3} tone="amber" />
            <StatTile label="Refunded" value={usdShort.format(data.stats.refundedUsd)} icon={RotateCcw} tone="orange" hint={`${data.stats.refunds} ${data.stats.refunds === 1 ? "refund" : "refunds"}`} />
          </div>

          <section className={`ui-card community-admin-table-card${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing} aria-label="Payments">
            <div className="car-table-toolbar">
              <label className="community-search car-toolbar-search">
                <span className="sr-only">Search payments</span>
                <Search size={18} aria-hidden="true" />
                <input type="search" className="ui-input" placeholder="Search reference or student" value={searchText} onChange={(event) => setSearchText(event.target.value)} />
              </label>
              <div className="car-toolbar-selects">
                <FilterSelect label="Competition" hideLabel value={filters.competition} onChange={(competition) => update({ competition })} options={[{ value: "", label: "All competitions" }, ...(data.competitions ?? []).map((item) => ({ value: item.id, label: item.title }))]} />
                <FilterSelect label="Status" hideLabel value={filters.status} onChange={(status) => update({ status })} options={[{ value: "", label: "All statuses" }, ...Object.entries(PAYMENT_STATUS).map(([value, item]) => ({ value, label: item.label }))]} />
              </div>
            </div>

            {rows.length === 0 ? (
              <div className="community-empty">
                <h2>No payments found</h2>
                <p className="muted-text">Try a different search or filter. Free competitions do not create payments.</p>
              </div>
            ) : (
              <>
                <div className="community-table-wrap" tabIndex={0} role="region" aria-label="Payments table (scrolls sideways)">
                  <table className="community-table car-table-payments">
                    <thead>
                      <tr>
                        <th scope="col">Reference</th>
                        <th scope="col">Student</th>
                        <th scope="col">Competition</th>
                        <th scope="col">Amount</th>
                        <th scope="col">Method</th>
                        <th scope="col">Status</th>
                        <th scope="col">Date</th>
                        <th scope="col"><span className="sr-only">Action</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row) => (
                        <tr key={row.id}>
                          <td><code className="car-reference">{row.reference}</code></td>
                          <td><strong>{row.student}</strong></td>
                          <td>{row.competition}</td>
                          <td><strong>{usd.format(row.amountUsd)}</strong></td>
                          <td>{row.method}</td>
                          <td><Tag map={PAYMENT_STATUS} value={row.status} /></td>
                          <td>{fullDate.format(new Date(row.createdAt))}</td>
                          <td>
                            {row.status === "verified" && data.viewerRole !== "reviewer" && (
                              <button type="button" className="btn btn-outline btn-sm" onClick={() => setRefunding(row)} aria-label={`Refund ${row.reference}`}>Refund</button>
                            )}
                            {row.status === "pending" && (
                              <button type="button" className="btn btn-primary btn-sm" onClick={() => verify(row)} disabled={busyId === row.id}>{busyId === row.id ? "Checking…" : "Verify with provider"}</button>
                            )}
                            {(row.status === "failed" || row.status === "refunded") && <span className="car-cell-sub">{row.note || "—"}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="community-list-footer community-leaderboard-footer">
                  <p>Showing {firstShown}–{firstShown + rows.length - 1} of {numberFormat.format(data.pagination.total)} payments</p>
                  <SimplePager pagination={data.pagination} onPage={(page) => update({ page })} label="Payment pages" />
                </div>
              </>
            )}
          </section>
        </>
      )}

      <RefundDialog
        key={refunding?.id ?? "none"}
        payment={refunding}
        onCancel={() => setRefunding(null)}
        onConfirm={async (reason, note) => {
          await refundAdminPayment(refunding.id, { reason, note }, { sample });
          setToast({ type: "success", message: `${usd.format(refunding.amountUsd)} refunded to ${refunding.student}. The registration is cancelled.` });
          setRefunding(null);
          reload();
        }}
      />
      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </section>
  );
}

// "Refund this entry fee?" (A15, pages 147–149). The refund itself happens on the server through
// the payment provider; the admin only confirms the amount and gives a reason.
function RefundDialog({ payment, onCancel, onConfirm }) {
  const [reason, setReason] = useState(REFUND_REASONS[0]);
  const [note, setNote] = useState("Your refund has been processed. It may take 5–10 business days to appear.");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const reasonId = useId();
  const noteId = useId();

  async function confirm() {
    setBusy(true);
    setError("");
    try {
      await onConfirm(reason, note.trim());
    } catch (refundError) {
      setError(refundError.message || "The refund could not be processed. Nothing was charged or refunded.");
      setBusy(false);
    }
  }

  if (!payment) return null;
  return (
    <Modal open onClose={() => !busy && onCancel()} title="Refund this entry fee?">
      <div className="car-dialog">
        <div className="car-dialog-head">
          <span className="community-delete-icon" aria-hidden="true"><AlertCircle size={22} /></span>
          <p>{payment.student} will lose access to competition materials and the registration will be cancelled.</p>
        </div>
        <dl className="car-dialog-facts">
          <div><dt>Reference</dt><dd><code className="car-reference">{payment.reference}</code></dd></div>
          <div><dt>Competition</dt><dd>{payment.competition}</dd></div>
          <div><dt>Refund amount</dt><dd><strong>{usd.format(payment.amountUsd)} USD</strong></dd></div>
          {typeof payment.providerFeeUsd === "number" && <div><dt>Provider fee (not returned)</dt><dd>{usd.format(payment.providerFeeUsd)}</dd></div>}
        </dl>
        <label htmlFor={reasonId} className="car-field-title">Reason for refund</label>
        <select id={reasonId} className="ui-input" value={reason} onChange={(event) => setReason(event.target.value)}>
          {REFUND_REASONS.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <label htmlFor={noteId} className="car-field-title">Note to student <span className="community-field-optional">(optional)</span></label>
        <textarea id={noteId} className="ui-input" rows={3} maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} />
        {error && <p className="field-error" role="alert">{error}</p>}
        <div className="community-delete-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={onCancel} disabled={busy}>Cancel</button>
          <button type="button" className="btn btn-sm community-btn-danger" onClick={confirm} disabled={busy}>{busy ? "Refunding…" : `Refund ${usd.format(payment.amountUsd)}`}</button>
        </div>
      </div>
    </Modal>
  );
}
