import { useState } from "react";
import { Link } from "react-router-dom";
import { useApiResource } from "../../hooks/useApiResource";
import { updateApplicationStatus } from "../../features/applications/applicationService";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import Button from "../../components/common/Button";

const statuses = ["Pending", "Under Review", "Accepted", "Rejected", "Waitlisted"];

export default function ReviewApplications() {
  const resource = useApiResource("/applications", "applications");
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleUpdate(event, application) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setSavingId(application.id);
    setError("");
    setNotice("");
    try {
      await updateApplicationStatus(application.id, values.get("status"), String(values.get("feedback") || "").trim());
      setNotice("Application status saved and the student was notified.");
      resource.reload();
    } catch (requestError) {
      setError(requestError.message || "Could not update this application.");
    } finally {
      setSavingId("");
    }
  }

  if (resource.loading) return <section className="admin-page"><Loader label="Loading applications…" /></section>;
  if (resource.error) return <section className="admin-page"><ErrorMessage message={resource.error} onRetry={resource.reload} /></section>;

  return <section className="admin-page">
    <div className="admin-page-title"><div><span className="admin-eyebrow">INSTRUCTOR WORKSPACE</span><h2>Program Applications</h2><p>Review applicant details, update status, and leave feedback.</p></div></div>
    {error && <ErrorMessage message={error} />}
    {notice && <p className="alert alert-info" role="status">{notice}</p>}
    {resource.data.length === 0 ? <EmptyState title="No applications yet" description="Program applications will appear here." /> :
      <div className="space-y-5">{resource.data.map((application) => <article className="admin-table-panel p-5" key={application.id}>
        <div className="mb-4"><span className="admin-eyebrow">{application.programTitle}</span><h3 className="mt-1 text-lg font-semibold">{application.fullName || application.studentName}</h3><p>{application.email} · {application.phone}</p><p className="mt-3"><strong>Experience:</strong> {application.experience || "Not provided"}</p><p className="mt-2 whitespace-pre-wrap"><strong>Reason for applying:</strong> {application.reason}</p><p className="mt-2"><strong>Skill level:</strong> {application.skillLevel}</p></div>
        <form onSubmit={(event) => handleUpdate(event, application)} className="grid gap-3 md:grid-cols-2">
          <label className="text-sm">Status<select name="status" defaultValue={application.status} className="form-input mt-1">{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
          <label className="text-sm md:col-span-2">Feedback<textarea name="feedback" rows="3" maxLength="5000" defaultValue={application.adminFeedback || ""} className="form-input mt-1" /></label>
          <Button type="submit" loading={savingId === application.id} disabled={Boolean(savingId)}>Save update</Button>
        </form>
      </article>)}</div>}
    <p className="mt-6"><Link to="/admin" className="text-link">Back to instructor dashboard</Link></p>
  </section>;
}
