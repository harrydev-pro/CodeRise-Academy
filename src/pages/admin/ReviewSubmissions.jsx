import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ExternalLink, Paperclip } from "lucide-react";

import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { Notice, PageHeader, Pagination, SelectField, StatusBadge, TextArea, TextField } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";
import { api, queryString } from "../../services/api/api";
import { formatDate } from "../../utils/formatDate";
import { SUBMISSION_STATUSES } from "../../utils/statuses";

function ReviewForm({ submission, onSaved }) {
  const statuses = SUBMISSION_STATUSES.includes(submission.status) ? SUBMISSION_STATUSES : [submission.status, ...SUBMISSION_STATUSES];
  const [form, setForm] = useState({ status: submission.status === "Submitted" ? "Approved" : submission.status, score: submission.score ?? "", feedback: submission.feedback || "" });
  const [notice, setNotice] = useState(null);
  const [saving, setSaving] = useState(false);
  async function save(event) {
    event.preventDefault();
    const score = form.score === "" ? null : Number(form.score);
    if (score !== null && (!Number.isInteger(score) || score < 0 || score > submission.project.maxScore)) {
      return setNotice({ tone: "error", text: `Enter a whole-number score from 0 to ${submission.project.maxScore}.` });
    }
    setSaving(true);
    setNotice(null);
    try {
      await api.patch(`/admin/submissions/${submission.id}/review`, { status: form.status, feedback: form.feedback.trim(), score });
      // Shown at page level: with a status filter, the reviewed card may leave the list.
      onSaved(`Review saved for ${submission.student.name} (${form.status}). The student has been notified.`);
    } catch (error) {
      setNotice({ tone: "error", text: error.message });
    } finally {
      setSaving(false);
    }
  }
  return (
    <form className="ui-form" onSubmit={save} noValidate>
      <div className="ui-form-grid">
        <SelectField label="Status" value={form.status} onChange={(status) => setForm((f) => ({ ...f, status }))} options={statuses} />
        <TextField label={`Score (out of ${submission.project.maxScore})`} type="number" inputMode="numeric" min="0" max={submission.project.maxScore} value={form.score} onChange={(score) => setForm((f) => ({ ...f, score }))} />
      </div>
      <TextArea label="Feedback for the student" rows={3} value={form.feedback} onChange={(feedback) => setForm((f) => ({ ...f, feedback }))} />
      <Notice tone={notice?.tone}>{notice?.text}</Notice>
      <div className="ui-form-actions"><Button type="submit" loading={saving}>Save review</Button></div>
    </form>
  );
}

export default function ReviewSubmissions() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState(params.get("q") || "");
  const filters = { status: params.get("status") || "", projectId: params.get("projectId") || "", q: params.get("q") || "", page: params.get("page") || "1" };
  const { data, loading, error, reload } = useApiResource(`/admin/submissions${queryString(filters)}`, null, null);
  const [pageNotice, setPageNotice] = useState("");
  const update = (changes) => setParams(Object.fromEntries(Object.entries({ ...filters, page: "1", ...changes }).filter(([, value]) => value)), { replace: true });

  return (
    <section className="admin-page">
      <PageHeader eyebrow="REVIEW" title="Project submissions" description="Review student work, give a score and feedback, approve or request corrections." />
      <form className="ui-toolbar" onSubmit={(event) => { event.preventDefault(); update({ q: search.trim() }); }}>
        <TextField label="Search" type="search" value={search} onChange={setSearch} placeholder="Student or project" />
        <SelectField label="Status" value={filters.status} onChange={(status) => update({ status })} options={[{ value: "", label: "All statuses" }, ...SUBMISSION_STATUSES, "Reviewed"]} />
        <button type="submit" className="btn btn-primary ui-toolbar-fixed">Search</button>
        {filters.projectId && <button type="button" className="btn btn-ghost ui-toolbar-fixed" onClick={() => update({ projectId: "" })}>Clear project filter</button>}
      </form>
      <Notice>{pageNotice}</Notice>
      {loading ? <Loader label="Loading submissions…" /> : error ? <ErrorMessage message={error} onRetry={reload} /> : data.submissions.length === 0 ? <p className="muted-text">No submissions match these filters.</p> : (
        <>
          <div className="ui-grid">
            {data.submissions.map((submission) => (
              <article className="ui-card" key={submission.id}>
                <div className="ui-card-header">
                  <div className="min-w-0">
                    <span className="eyebrow">{submission.project.trackTitle}</span>
                    <h3>{submission.project.title}</h3>
                    <p className="muted-text">{submission.student.name} · {submission.student.email} · {formatDate(submission.createdAt)}</p>
                  </div>
                  <StatusBadge status={submission.status} fallback="submitted" />
                </div>
                <p className="brief-text">{submission.description}</p>
                <div className="ui-actions submission-links">
                  {[["Live", submission.liveUrl], ["GitHub", submission.githubUrl], ["Figma", submission.figmaUrl]].filter(([, url]) => url).map(([label, url]) => (
                    <a key={label} href={url} target="_blank" rel="noopener noreferrer" className="text-link"><ExternalLink size={14} aria-hidden="true" /> {label}</a>
                  ))}
                  {submission.attachment && <a href={submission.attachment.url} target="_blank" rel="noopener noreferrer" className="text-link"><Paperclip size={14} aria-hidden="true" /> {submission.attachment.name}</a>}
                </div>
                {submission.reviewedAt && <p className="muted-text">Last reviewed {formatDate(submission.reviewedAt)}{submission.reviewedBy ? ` by ${submission.reviewedBy}` : ""}</p>}
                <ReviewForm key={`${submission.id}-${submission.reviewedAt}`} submission={submission} onSaved={(message) => { setPageNotice(message); reload(); }} />
              </article>
            ))}
          </div>
          <Pagination pagination={data.pagination} onPage={(page) => update({ page: String(page) })} />
        </>
      )}
    </section>
  );
}
