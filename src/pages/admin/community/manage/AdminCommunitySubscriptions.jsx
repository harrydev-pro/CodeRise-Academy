import { useState } from "react";
import { Clock3, Crown, DollarSign, Download, Gift, Search, XCircle } from "lucide-react";

import Loader from "../../../../components/common/Loader";
import ErrorMessage from "../../../../components/feedback/ErrorMessage";
import Toast from "../../../../components/feedback/Toast";
import {
  getAdminPayments,
  getAdminSubscriptions,
  PLAN_LABELS,
  SUBSCRIPTIONS_PAGE_SIZE,
} from "../../../../features/community/admin/manage/adminManageService";
import GrantPremiumDialog from "../../../../features/community/admin/manage/GrantPremiumDialog";
import { FilterSelect, SampleNotice, StatCard, StatusTabs } from "../../../../features/community/admin/manage/manageControls";
import { DAY, downloadCsv, fullDate, numberFormat, usd, usdCents, useToastState } from "../../../../features/community/admin/manage/manageUtils";
import { Pager } from "../../../../features/community/listControls";
import { readPage, useCommunityList, useDebouncedSearch, useUrlFilters } from "../../../../features/community/listHooks";

const TABS = ["subscriptions", "payments", "complimentary"];
const SUB_STATUS = {
  active: { label: "Active", tone: "green" },
  expiring: { label: "Expiring", tone: "amber" },
  complimentary: { label: "Complimentary", tone: "purple" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  expired: { label: "Expired", tone: "red" },
};
const PAY_STATUS = { paid: { label: "Paid", tone: "green" }, failed: { label: "Failed", tone: "red" }, refunded: { label: "Refunded", tone: "neutral" } };
const CYCLE = { monthly: "Monthly", yearly: "Yearly" };
const money = (value) => `${value < 0 ? "−" : ""}${usdCents.format(Math.abs(value))}`;
const date = (iso) => fullDate.format(new Date(iso));

function statusLabel(sub) {
  const base = SUB_STATUS[sub.status] ?? { label: sub.status, tone: "neutral" };
  if (sub.status === "expiring") {
    const days = Math.max(0, Math.ceil((new Date(sub.endsAt).getTime() - Date.now()) / DAY));
    return { ...base, label: `Expiring in ${days} ${days === 1 ? "day" : "days"}` };
  }
  return { ...base, label: sub.note ? `${base.label} · ${sub.note}` : base.label };
}

function readFilters(params) {
  const tab = TABS.includes(params.get("tab")) ? params.get("tab") : "subscriptions";
  return {
    tab,
    search: params.get("q") ?? "",
    plan: Object.keys(PLAN_LABELS).includes(params.get("plan")) ? params.get("plan") : "",
    status: Object.keys(SUB_STATUS).includes(params.get("status")) ? params.get("status") : "",
    page: readPage(params),
  };
}

export default function AdminCommunitySubscriptions() {
  const { params, update } = useUrlFilters();
  const filters = readFilters(params);
  const subFilters = filters.tab === "payments" ? { tab: "subscriptions", page: 1 } : filters;
  const subs = useCommunityList(getAdminSubscriptions, subFilters);
  const pays = useCommunityList(getAdminPayments, { search: filters.tab === "payments" ? filters.search : "", page: filters.tab === "payments" ? filters.page : 1 });
  const [searchText, setSearchText] = useDebouncedSearch(filters.search, (q) => update({ q }));
  const [toast, setToast, closeToast] = useToastState();
  const [grantOpen, setGrantOpen] = useState(false);
  const data = subs.data;
  const sample = Boolean(data?.isSample);

  function exportPayments() {
    const rows = [["Date", "Member", "Description", "Amount (USD)", "Status"], ...(pays.data?.payments ?? []).map((p) => [p.date.slice(0, 10), p.member, p.description, p.amount, PAY_STATUS[p.status]?.label ?? p.status])];
    downloadCsv(`community-payments-page-${pays.data?.pagination.page ?? 1}.csv`, rows);
    setToast({ type: "success", message: "Payments on this page exported as CSV." });
  }

  const onPayments = filters.tab === "payments";
  const list = onPayments ? pays : subs;

  return (
    <section className="admin-page community-admin cam-page">
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">PREMIUM MEMBERSHIP</span>
          <h1>Subscriptions</h1>
          <p>Every Premium and Premium Plus subscription, its billing state and payment history. Access is checked by the backend on every request.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setGrantOpen(true)}><Gift size={17} aria-hidden="true" /> Grant complimentary Premium</button>
      </header>

      {sample && <SampleNotice>Granting access changes this browser tab only; no payment or email is involved.</SampleNotice>}
      {subs.loading && <Loader label="Loading subscriptions…" />}
      {subs.error && <ErrorMessage message={subs.error} onRetry={subs.reload} />}

      {data && (
        <>
          <div className="community-admin-stats cam-stats-4">
            <StatCard label="Active subscriptions" value={numberFormat.format(data.stats.active)} icon={Crown} tone="purple" hint={`+${data.stats.activeThisMonth} this month`} hintTone="good" />
            <StatCard label="Expired" value={numberFormat.format(data.stats.expired)} icon={Clock3} tone="slate" hint={`${data.stats.expiringSoon} expire in the next 7 days`} />
            <StatCard label="Monthly recurring revenue" value={usd.format(data.stats.mrrUsd)} icon={DollarSign} tone="green" hint={`${data.stats.mrrChangeUsd >= 0 ? "+" : "−"}${usd.format(Math.abs(data.stats.mrrChangeUsd))} vs last month`} hintTone={data.stats.mrrChangeUsd >= 0 ? "good" : "warn"} />
            <StatCard label="Cancellations (30 days)" value={numberFormat.format(data.stats.cancellations30d)} icon={XCircle} tone="red" hint={`${data.stats.churnRate}% churn`} />
          </div>

          <StatusTabs
            label="Show"
            value={filters.tab}
            onChange={(tab) => update({ tab: tab === "subscriptions" ? "" : tab, status: "", plan: "", q: "" })}
            tabs={[
              { value: "subscriptions", label: "Subscriptions", count: data.counts.subscriptions },
              { value: "payments", label: "Payment history" },
              { value: "complimentary", label: "Complimentary", count: data.counts.complimentary },
            ]}
          />

          <div className="cam-table-filters cam-table-filters-bare">
            <label className="community-admin-field cam-grow">
              <span className="sr-only">Search by name or email</span>
              <span className="community-search">
                <Search size={18} aria-hidden="true" />
                <input type="search" className="ui-input" placeholder={onPayments ? "Search by member name" : "Search by name or email"} value={searchText} onChange={(event) => setSearchText(event.target.value)} />
              </span>
            </label>
            {!onPayments && (
              <>
                <FilterSelect hideLabel label="Plan" value={filters.plan} onChange={(plan) => update({ plan })} options={[{ value: "", label: "All plans" }, { value: "premium", label: "Premium" }, { value: "premium_plus", label: "Premium Plus" }]} />
                {filters.tab === "subscriptions" && (
                  <FilterSelect hideLabel label="Status" value={filters.status} onChange={(status) => update({ status })} options={[{ value: "", label: "All statuses" }, ...Object.entries(SUB_STATUS).map(([value, item]) => ({ value, label: item.label }))]} />
                )}
              </>
            )}
            {onPayments && <button type="button" className="btn btn-outline" onClick={exportPayments} disabled={!pays.data}><Download size={17} aria-hidden="true" /> Export CSV</button>}
          </div>

          {list.error && list !== subs && <ErrorMessage message={list.error} onRetry={list.reload} />}
          {list.loading && list !== subs && <Loader label="Loading payments…" />}

          {list.data && (
            <section className={`ui-card community-admin-table-card${list.refreshing ? " is-refreshing" : ""}`} aria-busy={list.refreshing} aria-label={onPayments ? "Payment history" : "Subscriptions"}>
              {onPayments ? <PaymentsTable rows={pays.data.payments} /> : <SubscriptionsTable rows={data.subscriptions} />}
              <div className="community-list-footer community-leaderboard-footer">
                <p>{list.data.pagination.total === 0 ? "Nothing to show" : `Showing ${(list.data.pagination.page - 1) * SUBSCRIPTIONS_PAGE_SIZE + 1}–${Math.min(list.data.pagination.page * SUBSCRIPTIONS_PAGE_SIZE, list.data.pagination.total)} of ${numberFormat.format(list.data.pagination.total)}`}</p>
                <Pager pagination={list.data.pagination} onPage={(page) => update({ page })} label={onPayments ? "Payment pages" : "Subscription pages"} />
              </div>
            </section>
          )}
        </>
      )}

      <GrantPremiumDialog
        key={grantOpen ? "open" : "closed"}
        open={grantOpen}
        sample={sample}
        onClose={() => setGrantOpen(false)}
        onGranted={(message) => { setGrantOpen(false); setToast({ type: "success", message }); subs.reload(); }}
      />
      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </section>
  );
}

function SubscriptionsTable({ rows }) {
  if (rows.length === 0) {
    return <div className="community-empty"><h2>No subscriptions found</h2><p className="muted-text">Try a different search or filter.</p></div>;
  }
  return (
    <div className="community-table-wrap" tabIndex={0} role="region" aria-label="Subscriptions table (scrolls sideways)">
      <table className="community-table cam-subs-table">
        <thead>
          <tr>
            <th scope="col">Member</th>
            <th scope="col">Plan</th>
            <th scope="col">Cycle</th>
            <th scope="col">Started</th>
            <th scope="col">Next billing / expiry</th>
            <th scope="col" className="is-number">Amount</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((sub) => {
            const status = statusLabel(sub);
            const ended = ["cancelled", "expired"].includes(sub.status);
            return (
              <tr key={sub.id}>
                <th scope="row"><span className="cam-member-name"><strong>{sub.name}</strong><small>{sub.email}</small></span></th>
                <td>{PLAN_LABELS[sub.plan] ?? sub.plan}</td>
                <td>{sub.cycle === "complimentary" ? `${sub.months ?? 1} ${sub.months === 1 || !sub.months ? "month" : "months"}` : CYCLE[sub.cycle] ?? sub.cycle}</td>
                <td>{date(sub.startedAt)}</td>
                <td>{ended ? `${sub.status === "expired" ? "Expired" : "Ended"} ${date(sub.endsAt)}` : date(sub.endsAt)}</td>
                <td className="is-number">{money(sub.amount)}</td>
                <td><span className={`community-tag tag-${status.tone}`}>{status.label}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function PaymentsTable({ rows }) {
  if (rows.length === 0) {
    return <div className="community-empty"><h2>No payments found</h2><p className="muted-text">Try a different search.</p></div>;
  }
  return (
    <div className="community-table-wrap" tabIndex={0} role="region" aria-label="Payment history (scrolls sideways)">
      <table className="community-table">
        <thead>
          <tr>
            <th scope="col">Date</th>
            <th scope="col">Member</th>
            <th scope="col">Description</th>
            <th scope="col" className="is-number">Amount</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((payment) => {
            const status = PAY_STATUS[payment.status] ?? { label: payment.status, tone: "neutral" };
            return (
              <tr key={payment.id}>
                <td>{date(payment.date)}</td>
                <th scope="row" className="cam-th-plain">{payment.member}</th>
                <td>{payment.description}</td>
                <td className="is-number">{money(payment.amount)}</td>
                <td><span className={`community-tag tag-${status.tone}`}>{status.label}</span></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
