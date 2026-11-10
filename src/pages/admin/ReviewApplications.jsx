import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronDown } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { Notice, PageHeader, Pagination, SelectField, StatusBadge, Tabs, TextArea, TextField } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";
import { api, queryString } from "../../services/api/api";
import { formatCurrency } from "../../utils/formatCurrency";
import { formatDate } from "../../utils/formatDate";
import { getProgramPrice } from "../../utils/programPrice";
import { APPLICATION_STATUSES } from "../../utils/statuses";

function ApplicationDetail({ id, onChanged }) {
  const { data: application, loading, error, reload } = useApiResource(`/admin/applications/${id}`, "application", null);
  const [status, setStatus] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [note, setNote] = useState("");
  const [internal, setInternal] = useState(null);
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  if (loading) return <Loader label="Loading application…" />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;
  const currentStatus = status ?? application.status;
  const currentFeedback = feedback ?? application.adminFeedback;
  const currentInternal = internal ?? application.internalNotes;

  async function act(action, message) {
    setSaving(true);
    setNotice(null);
    try {
      await action();
      setNotice({ tone: "info", text: message });
      setNote("");
      reload();
      // Also shown at page level: with a status filter, this application may leave the list.
      onChanged(`${application.fullName || application.studentName}: ${message}`);
    } catch (actionError) {
      setNotice({ tone: "error", text: actionError.message });
    } finally {
      setSaving(false);
    }
  }

  const rows = [["Email", application.email], ["Phone", application.phone], ["Preferred contact", application.preferredContact], ["Skill level", application.skillLevel],
    ["Learning goals", application.learningGoals], ["Why they want to join", application.reason], ["Experience", application.experience],
    ["Price when applying", formatCurrency(getProgramPrice(application))], ["Account", application.studentName]].filter(([, value]) => value);

  return (
    <div className="application-details">
      <dl>{rows.map(([label, value]) => <div className="application-detail-row" key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
      <div className="ui-grid ui-grid-2">
        <form className="ui-form" onSubmit={(event) => { event.preventDefault(); act(() => api.patch(`/admin/applications/${id}/status`, { status: currentStatus, adminFeedback: currentFeedback.trim(), note: note.trim() }), "Status saved. The student was notified."); }}>
          <h3>Update status</h3>
          <SelectField label="Status" value={currentStatus} onChange={setStatus} options={APPLICATION_STATUSES} />
          <TextArea label="Message to the student" rows={3} value={currentFeedback} onChange={setFeedback} hint="Shown to the student with the status." />
          <TextArea label="Internal note for this change (optional)" rows={2} value={note} onChange={setNote} hint="Only admins see this, in the history." />
          <p className="ui-hint">Approval is not payment. Mark “Enrolled” only once the student has actually joined the program.</p>
          <div className="ui-form-actions"><Button type="submit" loading={saving}>Save status</Button></div>
        </form>
        <div className="ui-form">
          <h3>Internal notes</h3>
          <TextArea label="Notes (admins only)" rows={5} value={currentInternal} onChange={setInternal} />
          <div className="ui-form-actions"><Button variant="outline" loading={saving} onClick={() => act(() => api.patch(`/admin/applications/${id}/notes`, { internalNotes: currentInternal }), "Notes saved.")}>Save notes</Button></div>
          <h3>History</h3>
          <ol className="ui-timeline">
            {(application.history || []).map((entry) => (
              <li key={entry.id}><strong>{entry.fromStatus ? `${entry.fromStatus} → ${entry.toStatus}` : entry.toStatus}</strong>
                <small>{formatDate(entry.createdAt)}{entry.changedBy ? ` · ${entry.changedBy}` : ""}</small>
                {entry.note && <small>{entry.note}</small>}</li>
            ))}
          </ol>
        </div>
      </div>
      <Notice tone={notice?.tone}>{notice?.text}</Notice>
    </div>
  );
}

export default function ReviewApplications() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const [openId, setOpenId] = useState(null);
  const [pageNotice, setPageNotice] = useState("");
  const filters = { status: params.get("status") || "", programId: params.get("programId") || "", q: params.get("q") || "", page: params.get("page") || "1", sort: params.get("sort") || "-submittedAt" };
  const { data, loading, error, reload } = useApiResource(`/admin/applications${queryString(filters)}`, null, null);
  const programs = useApiResource("/admin/programs?includeArchived=true", "programs");
  const update = (changes) => setParams(Object.fromEntries(Object.entries({ ...filters, page: "1", ...changes }).filter(([, value]) => value)), { replace: true });
  const counts = data?.statusCounts || {};

  return (
    <section className="admin-page">
      <PageHeader eyebrow="ADMISSIONS" title="Program applications" description="Review applications, update their status, and keep internal notes." />
      <Tabs value={filters.status} onChange={(status) => update({ status })} label="Filter by status"
        tabs={[{ value: "", label: "All", count: Object.values(counts).reduce((a, b) => a + b, 0) }, ...APPLICATION_STATUSES.map((status) => ({ value: status, label: status, count: counts[status] || 0 }))]} />
      <form className="ui-toolbar" onSubmit={(event) => { event.preventDefault(); update({ q: search.trim() }); }}>
        <TextField label="Search" type="search" value={search} onChange={setSearch} placeholder="Name, email, or phone" />
        <SelectField label="Program" value={filters.programId} onChange={(programId) => update({ programId })} options={[{ value: "", label: "All programs" }, ...programs.data.map((program) => ({ value: program.id, label: program.title }))]} />
        <SelectField label="Sort" value={filters.sort} onChange={(sort) => update({ sort })} options={[{ value: "-submittedAt", label: "Newest first" }, { value: "submittedAt", label: "Oldest first" }, { value: "-updatedAt", label: "Recently updated" }]} />
        <button type="submit" className="btn btn-primary ui-toolbar-fixed">Search</button>
      </form>
      <Notice>{pageNotice}</Notice>
      {loading ? <Loader label="Loading applications…" /> : error ? <ErrorMessage message={error} onRetry={reload} /> : data.applications.length === 0 ? <p className="muted-text">No applications match these filters.</p> : (
        <>
          <ul className="ui-list">
            {data.applications.map((application) => {
              const open = openId === application.id;
              return (
                <li key={application.id} className="ui-card">
                  <div className="ui-card-header">
                    <div className="min-w-0">
                      <span className="eyebrow">{application.programTitle}</span>
                      <h3>{application.fullName || application.studentName}</h3>
                      <p className="muted-text">Applied {formatDate(application.submittedAt)} · ref {application.id}{application.userId && <> · <Link to={`/admin/users/${application.userId}`} className="text-link">profile</Link></>}</p>
                    </div>
                    <StatusBadge status={application.status} />
                  </div>
                  <button type="button" className="application-toggle" aria-expanded={open} onClick={() => setOpenId(open ? null : application.id)}>
                    {open ? "Hide details" : "Review application"} <ChevronDown size={16} aria-hidden="true" className={open ? "rotate-180" : ""} />
                  </button>
                  {open && <ApplicationDetail id={application.id} onChanged={(message) => { setPageNotice(message); reload(); }} />}
                </li>
              );
            })}
          </ul>
          <Pagination pagination={data.pagination} onPage={(page) => update({ page: String(page) })} />
        </>
      )}
    </section>
  );
}
