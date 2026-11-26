import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CircleDollarSign, Clock3, CreditCard, Wallet } from "lucide-react";

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { PageHeader, Pagination, SelectField, StatCard, StatusBadge, TableWrap, Tabs, TextField } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";
import { queryString } from "../../services/api/api";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { PAYMENT_FILTERS, paymentLabel } from "../../utils/applicationPayment";

const TYPES = [
  { value: "", label: "Everything" },
  { value: "application", label: "Program fees" },
  { value: "course", label: "Video courses" },
];

function itemLink(payment) {
  if (payment.type === "application" || payment.applicationId) {
    const query = payment.email || payment.studentEmail || payment.applicationId;
    return { to: `/admin/applications${queryString({ q: query })}`, label: payment.programTitle || payment.itemTitle || "Program application" };
  }
  if (payment.courseId) return { to: `/admin/video-courses/${payment.courseId}`, label: payment.courseTitle || payment.itemTitle || "Video course" };
  return { to: "", label: payment.itemTitle || "—" };
}

export default function AdminPayments() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const filters = { status: params.get("status") || "", type: params.get("type") || "", q: params.get("q") || "", page: params.get("page") || "1" };
  const { data, loading, error, reload } = useApiResource(`/admin/payments${queryString(filters)}`, null, null);
  const update = (changes) => setParams(Object.fromEntries(Object.entries({ ...filters, page: "1", ...changes }).filter(([, value]) => value)), { replace: true });
  const summary = data?.summary || {};

  return (
    <section className="admin-page">
      <PageHeader eyebrow="FINANCE" title="Payments" description="Program fees and video course payments, from Paystack and recorded by admins." />

      {data && (
        <div className="ui-grid ui-grid-stats">
          <StatCard label="Collected" value={formatCurrency(summary.collected ?? 0)} icon={Wallet} tone="green" />
          <StatCard label="Paid program fees" value={summary.paidApplications ?? 0} icon={CircleDollarSign} to="/admin/payments?type=application&status=successful" />
          <StatCard label="Approved, awaiting payment" value={summary.awaitingPayment ?? 0} icon={Clock3} tone="amber" to="/admin/applications?status=Approved&paymentStatus=unpaid" />
          <StatCard label="Failed or abandoned" value={summary.failed ?? 0} icon={CreditCard} tone="red" to="/admin/payments?status=failed" />
        </div>
      )}

      <Tabs value={filters.status} onChange={(status) => update({ status })} label="Filter by payment status"
        tabs={PAYMENT_FILTERS.filter((option) => option.value !== "unpaid").map((option) => ({ ...option, count: option.value ? data?.statusCounts?.[option.value] : undefined }))} />
      <form className="ui-toolbar" onSubmit={(event) => { event.preventDefault(); update({ q: search.trim() }); }}>
        <TextField label="Search" type="search" value={search} onChange={setSearch} placeholder="Name, email, or reference" />
        <SelectField label="Type" value={filters.type} onChange={(type) => update({ type })} options={TYPES} />
        <button type="submit" className="btn btn-primary ui-toolbar-fixed">Search</button>
      </form>

      {loading ? <Loader label="Loading payments…" /> : error ? <ErrorMessage message={error} onRetry={reload} /> : !data?.payments?.length ? <p className="muted-text">No payments match these filters.</p> : (
        <>
          <TableWrap>
            <table className="ui-table">
              <thead><tr><th>Date</th><th>Student</th><th>For</th><th>Amount</th><th>Status</th><th>Reference</th></tr></thead>
              <tbody>
                {data.payments.map((payment) => {
                  const item = itemLink(payment);
                  return (
                    <tr key={payment.id || payment.reference}>
                      <td>{formatDate(payment.paidAt || payment.createdAt)}</td>
                      <td>
                        {payment.userId ? <Link className="text-link" to={`/admin/users/${payment.userId}`}>{payment.studentName || payment.email || "Student"}</Link> : (payment.studentName || payment.email || "—")}
                      </td>
                      <td>{item.to ? <Link className="text-link" to={item.to}>{item.label}</Link> : item.label}</td>
                      <td>{formatCurrency(payment.amount, payment.currency || "NGN")}</td>
                      <td><StatusBadge status={paymentLabel(payment.status)} /></td>
                      <td>{payment.reference || "—"}{payment.method === "manual" && <small className="ui-hint"> · recorded by {payment.recordedBy || "admin"}</small>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </TableWrap>
          <Pagination pagination={data.pagination} onPage={(page) => update({ page: String(page) })} />
        </>
      )}
    </section>
  );
}
