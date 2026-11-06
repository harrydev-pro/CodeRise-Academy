import { useState } from "react";
import { Link } from "react-router-dom";
import { useApiResource } from "../../hooks/useApiResource";
import { reviewSubmission } from "../../features/assessments/submissionService";
import Loader from "../../components/common/Loader";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import Button from "../../components/common/Button";

export default function ReviewSubmissions() {
  const resource = useApiResource("/learning/instructor/submissions", "submissions");
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function handleReview(event, submission) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const scoreText = values.get("score");
    const score = scoreText === "" ? null : Number(scoreText);
    if (score !== null && (!Number.isInteger(score) || score < 0 || score > submission.maxScore)) {
      setError(`Enter a score from 0 to ${submission.maxScore}.`);
      return;
    }
    setSavingId(submission.id);
    setError("");
    setNotice("");
    try {
      await reviewSubmission(submission.id, {
        status: values.get("status"),
        feedback: String(values.get("feedback") || "").trim(),
        score,
      });
      setNotice("Review saved and the student was notified.");
      resource.reload();
    } catch (requestError) {
      setError(requestError.message || "Could not save this review.");
    } finally {
      setSavingId("");
    }
  }

  if (resource.loading) return <section className="admin-page"><Loader label="Loading project submissions…" /></section>;
  if (resource.error) return <section className="admin-page"><ErrorMessage message={resource.error} onRetry={resource.reload} /></section>;

  return <section className="admin-page">
    <div className="admin-page-title"><div><span className="admin-eyebrow">INSTRUCTOR WORKSPACE</span><h2>Project Submissions</h2><p>Review student work and provide scores and feedback.</p></div></div>
    {error && <ErrorMessage message={error} />}
    {notice && <p className="alert alert-info" role="status">{notice}</p>}
    {resource.data.length === 0 ? <EmptyState title="No submissions yet" description="Student project submissions will appear here." /> :
      <div className="space-y-5">{resource.data.map((submission) => <article className="admin-table-panel p-5" key={submission.id}>
        <div className="mb-4"><span className="admin-eyebrow">{submission.studentName} · {submission.studentEmail}</span><h3 className="mt-1 text-lg font-semibold">{submission.projectTitle}</h3><p className="mt-2 whitespace-pre-wrap">{submission.description}</p>
          <div className="mt-3 flex flex-wrap gap-4">{submission.liveUrl && <a className="text-link" href={submission.liveUrl} target="_blank" rel="noreferrer">Live project</a>}{submission.githubUrl && <a className="text-link" href={submission.githubUrl} target="_blank" rel="noreferrer">GitHub repository</a>}</div>
        </div>
        <form onSubmit={(event) => handleReview(event, submission)} className="grid gap-3 md:grid-cols-3">
          <label className="text-sm">Status<select name="status" defaultValue={submission.status} className="form-input mt-1"><option>Under Review</option><option>Reviewed</option></select></label>
          <label className="text-sm">Score (maximum {submission.maxScore})<input name="score" type="number" min="0" max={submission.maxScore} defaultValue={submission.score ?? ""} className="form-input mt-1" /></label>
          <label className="text-sm md:col-span-3">Feedback<textarea name="feedback" rows="3" maxLength="5000" defaultValue={submission.feedback || ""} className="form-input mt-1" /></label>
          <Button type="submit" loading={savingId === submission.id} disabled={Boolean(savingId)}>Save review</Button>
        </form>
      </article>)}</div>}
    <p className="mt-6"><Link to="/admin" className="text-link">Back to instructor dashboard</Link></p>
  </section>;
}
