import { useState } from "react";
import { Download } from "lucide-react";

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { PageHeader, SelectField, TableWrap, TextField } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";
import { API_BASE_URL } from "../../services/api/client";
import { queryString } from "../../services/api/api";
import { formatDate } from "../../utils/formatDate";

const day = (date) => date.toISOString().slice(0, 10);
const isDateLike = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value);

export default function AdminReports() {
  const reports = useApiResource("/admin/reports", "reports");
  const [type, setType] = useState("registrations");
  const [range, setRange] = useState(() => ({ from: day(new Date(Date.now() - 29 * 86400000)), to: day(new Date()) }));
  const report = useApiResource(`/admin/reports/${type}${queryString(range)}`, "report", null);
  const csvHref = `${API_BASE_URL}/admin/reports/${type}${queryString({ ...range, format: "csv" })}`;

  return (
    <section className="admin-page">
      <PageHeader eyebrow="INSIGHTS" title="Reports" description="Filter by date and download any report as CSV for Excel or Google Sheets." />
      <div className="ui-toolbar">
        <SelectField label="Report" value={type} onChange={setType} options={reports.data.map((item) => ({ value: item.id, label: item.title }))} />
        <TextField label="From" type="date" value={range.from} max={range.to} onChange={(from) => from && setRange((r) => ({ ...r, from }))} />
        <TextField label="To" type="date" value={range.to} min={range.from} onChange={(to) => to && setRange((r) => ({ ...r, to }))} />
        <a className="btn btn-outline ui-toolbar-fixed" href={csvHref} download><Download size={16} aria-hidden="true" /> Download CSV</a>
      </div>
      {report.loading ? <Loader label="Building report…" /> : report.error ? <ErrorMessage message={report.error} onRetry={report.reload} /> : (
        <>
          <p className="muted-text">{report.data.rows.length} rows{report.data.truncated ? " (showing the first 5,000; narrow the dates for more)" : ""}.</p>
          {report.data.rows.length === 0 ? <p className="muted-text">No records in this period.</p> : (
            <TableWrap>
              <table className="ui-table">
                <thead><tr>{report.data.columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
                <tbody>
                  {report.data.rows.slice(0, 500).map((row, index) => (
                    <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{isDateLike(cell) ? formatDate(cell) : cell === null || cell === undefined ? "—" : String(cell)}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </TableWrap>
          )}
          {report.data.rows.length > 500 && <p className="ui-hint">Showing 500 rows on screen. The CSV download contains all rows.</p>}
        </>
      )}
    </section>
  );
}
