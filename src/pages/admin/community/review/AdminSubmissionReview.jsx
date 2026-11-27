import { useCallback, useId, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Check, ChevronLeft, Code2, Download, ExternalLink, FileText, Link2, XCircle } from "lucide-react";

import Loader from "../../../../components/common/Loader";
import Modal from "../../../../components/common/Modal";
import ErrorMessage from "../../../../components/feedback/ErrorMessage";
import Toast from "../../../../components/feedback/Toast";
import {
  assignSubmissionReviewer,
  daysSince,
  fullDate,
  getAdminSubmission,
  PLANS,
  reviewSubmission,
  shortDateTime,
  SUBMISSION_STATUS,
  SUBMISSION_TYPES,
  watDateTime,
} from "../../../../features/community/admin/review/reviewService";
import { Avatar, SampleNotice } from "../../../../features/community/admin/review/reviewControls";
import { useCommunityList } from "../../../../features/community/listHooks";

const DECIDED = ["approved", "needs_corrections", "rejected"];
const WORK_ICONS = { live: Link2, github: Code2, file: FileText };
function ordinal(n) {
  const suffixes = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return `${n}${suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]}`;
}

// A18 Review & feedback. Reviewers see only submissions assigned to them (the backend checks);
// admin-only controls (reviewer assignment, re-opening a decision) are hidden for them.
// Points are awarded by the backend when a submission is approved.
export default function AdminSubmissionReview() {
  const { submissionId } = useParams();
  const { data, error, loading, reload } = useCommunityList(getAdminSubmission, { id: submissionId });

  if (loading) return <section className="admin-page"><Loader label="Loading submission…" /></section>;
  if (!data) {
    return (
      <section className="admin-page community-admin">
        <Link to="/admin/community/submissions" className="community-back-link"><ChevronLeft size={16} aria-hidden="true" /> Back to submissions</Link>
        <ErrorMessage message={error} onRetry={reload} />
      </section>
    );
  }
  return <ReviewForm key={`${data.submission.id}-${data.submission.decidedAt ?? ""}-${data.submission.reviewerId ?? ""}`} data={data} reload={reload} />;
}

function initialScores(rubric) {
  return Object.fromEntries(rubric.map((item) => [item.id, item.score === null || item.score === undefined ? "" : String(item.score)]));
}

function ReviewForm({ data, reload }) {
  const { submission, reviewers = [] } = data;
  const sample = Boolean(data.isSample);
  const isReviewer = data.viewerRole === "reviewer";
  const rubric = submission.rubric ?? [];
  const [scores, setScores] = useState(() => initialScores(rubric));
  const [feedback, setFeedback] = useState(submission.feedback ?? "");
  const [allowResubmission, setAllowResubmission] = useState(submission.allowResubmission ?? true);
  const [suggestShowcase, setSuggestShowcase] = useState(Boolean(submission.suggestShowcase));
  const [reopened, setReopened] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);
  const feedbackId = useId();
  const reviewerSelectId = useId();

  const decided = DECIDED.includes(submission.status) && !reopened;
  const total = rubric.reduce((sum, item) => sum + (Number(scores[item.id]) || 0), 0);
  const maxTotal = rubric.reduce((sum, item) => sum + item.weight, 0);
  const student = submission.student;
  const type = SUBMISSION_TYPES[submission.projectType];
  const waitingDays = daysSince(submission.submittedAt);

  function setScore(id, value) {
    setScores((current) => ({ ...current, [id]: value }));
    if (errors.scores) setErrors((current) => ({ ...current, scores: undefined }));
  }

  function validate(decision) {
    const found = {};
    const bad = rubric.find((item) => scores[item.id] !== "" && !(Number(scores[item.id]) >= 0 && Number(scores[item.id]) <= item.weight));
    if (bad) found.scores = `Score “${bad.name}” between 0 and ${bad.weight}.`;
    else if (decision === "approved" && rubric.some((item) => scores[item.id] === "")) found.scores = "Score every criterion before approving.";
    if (decision !== "approved" && feedback.trim().length < 20) found.feedback = "Explain what the student should change (at least 20 characters).";
    return found;
  }

  async function decide(decision) {
    const found = validate(decision);
    setErrors(found);
    if (Object.keys(found).length) {
      window.requestAnimationFrame(() => document.getElementById(found.scores ? "review-rubric" : feedbackId)?.focus());
      return false;
    }
    setBusy(decision);
    try {
      await reviewSubmission(submission.id, {
        decision,
        scores: rubric.map((item) => ({ criterionId: item.id, score: scores[item.id] === "" ? null : Number(scores[item.id]) })),
        feedback: feedback.trim(),
        allowResubmission,
        suggestShowcase,
      }, { sample });
      const messages = {
        approved: `Approved with ${total} / ${maxTotal}.${submission.pointsOnApproval ? ` ${submission.pointsOnApproval} points will be awarded by the server.` : ""} ${student.name} has been notified.`,
        needs_corrections: `Corrections requested. ${student.name} has been notified.`,
        rejected: `Submission rejected. ${student.name} has been notified.`,
      };
      setToast({ type: "success", message: messages[decision] });
      setRejectOpen(false);
      reload();
      return true;
    } catch (reviewError) {
      setToast({ type: "error", message: reviewError.message || "The review could not be saved. Your scores and feedback are still here." });
      return false;
    } finally {
      setBusy("");
    }
  }

  async function changeReviewer(reviewerId) {
    setBusy("assign");
    try {
      await assignSubmissionReviewer(submission.id, reviewerId, { sample });
      setToast({ type: "success", message: reviewerId ? `Assigned to ${reviewers.find((item) => item.id === reviewerId)?.name}.` : "Reviewer removed." });
      reload();
    } catch (assignError) {
      setToast({ type: "error", message: assignError.message || "The reviewer could not be changed." });
    } finally {
      setBusy("");
    }
  }

  const reviewerName = reviewers.find((item) => item.id === submission.reviewerId)?.name;
  const approveLabel = submission.pointsOnApproval ? `Approve · award ${submission.pointsOnApproval} points` : "Approve";

  return (
    <section className="admin-page community-admin">
      <Link to="/admin/community/submissions" className="community-back-link"><ChevronLeft size={16} aria-hidden="true" /> Back to submissions</Link>

      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">REVIEW AND FEEDBACK</span>
          <h1>{submission.title}</h1>
          <div className="car-review-meta">
            <span className={`community-tag tag-${SUBMISSION_STATUS[submission.status]?.tone ?? "neutral"}`}>
              {SUBMISSION_STATUS[submission.status]?.label ?? submission.status}{!DECIDED.includes(submission.status) && waitingDays > 0 ? ` · ${waitingDays} ${waitingDays === 1 ? "day" : "days"}` : ""}
            </span>
            {type && <span className={`community-tag tag-${type.tone}`}>{type.label}</span>}
            <span className="car-cell-sub">Submitted {watDateTime.format(new Date(submission.submittedAt))} WAT · Attempt {submission.attempt ?? 1}</span>
          </div>
        </div>
        <div className="car-reviewer-pick">
          <label htmlFor={reviewerSelectId}>Reviewer</label>
          {isReviewer ? (
            <strong id={reviewerSelectId}>{reviewerName ?? "You"}</strong>
          ) : (
            <select id={reviewerSelectId} className="ui-input" value={submission.reviewerId ?? ""} disabled={busy === "assign" || decided} onChange={(event) => changeReviewer(event.target.value)}>
              <option value="">Unassigned</option>
              {reviewers.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          )}
        </div>
      </header>

      {sample && <SampleNotice>Showing sample data: the admin Community API is not available yet. Decisions are kept in this browser tab only and no points are awarded. This notice only appears on the local dev server.</SampleNotice>}

      <div className="car-review-layout">
        <div className="car-review-main">
          <section className="ui-card car-review-student-mini" aria-label="Student">
            <Avatar initials={student.initials} index={1} size="community-avatar-lg" />
            <span className="min-w-0">
              <strong>{student.name}</strong>
              <small>{[student.detail, PLANS[student.plan]?.label !== "Free" ? PLANS[student.plan]?.label : null, `${ordinal(submission.attempt ?? 1)} attempt`].filter(Boolean).join(" · ")}</small>
            </span>
            <time dateTime={submission.submittedAt}>{fullDate.format(new Date(submission.submittedAt)).replace(/ \d{4}$/, "")}</time>
          </section>

          <section className="ui-card" aria-labelledby="work-title">
            <h2 id="work-title">Submitted work</h2>
            <ul className="car-work-list">
              {submission.work.map((item) => {
                const Icon = WORK_ICONS[item.kind] ?? FileText;
                const isFile = item.kind === "file";
                return (
                  <li key={item.url}>
                    <a href={item.url} target={isFile ? undefined : "_blank"} rel="noopener noreferrer" download={isFile ? item.label : undefined} className="car-work-item">
                      <span className="community-icon tone-blue"><Icon size={18} aria-hidden="true" /></span>
                      <span className="min-w-0"><strong>{item.label}</strong><small>{item.detail}</small></span>
                      {isFile ? <Download size={17} aria-hidden="true" /> : <ExternalLink size={17} aria-hidden="true" />}
                      <span className="sr-only">{isFile ? " (download)" : " (opens in a new tab)"}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
            {submission.previewHost && (
              <div className="car-site-preview" aria-hidden="true">
                <div className="car-site-bar"><span /><span /><span /><em>{submission.previewHost}</em></div>
                <div className="car-site-body">
                  <div className="car-site-nav"><i /><i /><i /></div>
                  <div className="car-site-hero" />
                  <div className="car-site-cards"><i /><i /><i /><i /></div>
                </div>
              </div>
            )}
            {submission.note && (
              <>
                <h3 className="car-subheading">Student’s note</h3>
                <p className="car-note">{submission.note}</p>
              </>
            )}
          </section>

          <section className="ui-card car-review-student" aria-label="Student details">
            <div className="car-student-head">
              <Avatar initials={student.initials} index={1} size="community-avatar-lg" />
              <span className="min-w-0">
                <strong>{student.name}</strong>
                <small>{[student.email, student.team ? student.detail : PLANS[student.plan] ? `${PLANS[student.plan].label} member` : null].filter(Boolean).join(" · ")}</small>
              </span>
              {student.username && <Link to={`/community/u/${encodeURIComponent(student.username)}`} className="btn btn-outline btn-sm">View profile</Link>}
            </div>
            {submission.studentStats && (
              <dl className="community-points-list community-details-list">
                <div><dt>Category</dt><dd>{submission.studentStats.category}</dd></div>
                <div><dt>Projects completed</dt><dd>{submission.studentStats.projectsCompleted}</dd></div>
                <div><dt>Average score</dt><dd>{submission.studentStats.averageScore} / 100</dd></div>
              </dl>
            )}
          </section>
        </div>

        <div className="car-review-side">
          <fieldset className="ui-card car-rubric" disabled={decided || Boolean(busy)} id="review-rubric" tabIndex={-1} aria-describedby={errors.scores ? "rubric-error" : undefined}>
            <legend className="sr-only">Scoring rubric</legend>
            <div className="ui-card-header">
              <h2 aria-hidden="true">Scoring rubric</h2>
              <span className="community-timeline-month">Out of the weight shown</span>
            </div>
            <ul className="car-rubric-list">
              {rubric.map((item) => (
                <li key={item.id}>
                  <label htmlFor={`score-${item.id}`} className="min-w-0">
                    <strong>{item.name}</strong>
                    <small>{item.hint ? `${item.hint} · ` : ""}out of {item.weight}</small>
                  </label>
                  <span className="car-score-input">
                    <input
                      id={`score-${item.id}`}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={item.weight}
                      className="ui-input"
                      value={scores[item.id]}
                      aria-invalid={Boolean(errors.scores) && (scores[item.id] === "" || Number(scores[item.id]) > item.weight)}
                      onChange={(event) => setScore(item.id, event.target.value)}
                    />
                    <span aria-hidden="true">/ {item.weight}</span>
                  </span>
                </li>
              ))}
            </ul>
            {errors.scores && <p id="rubric-error" className="field-error">{errors.scores}</p>}
            <div className="car-total" aria-live="polite">
              <span>Total score</span>
              <strong>{total} / {maxTotal}</strong>
            </div>
          </fieldset>

          <section className="ui-card car-decision" aria-label="Feedback and decision">
            {decided ? (
              <div className="car-decided">
                <span className={`community-tag tag-${SUBMISSION_STATUS[submission.status]?.tone}`}>{SUBMISSION_STATUS[submission.status]?.label}</span>
                <p>{submission.decidedAt ? `Decided ${shortDateTime.format(new Date(submission.decidedAt))} WAT` : "A decision has been sent to the student."}{reviewerName ? ` by ${reviewerName}` : ""}.</p>
                {submission.feedback && <p className="car-note">{submission.feedback}</p>}
                {!isReviewer && <button type="button" className="btn btn-outline btn-sm" onClick={() => setReopened(true)}>Change decision</button>}
              </div>
            ) : (
              <>
                <div className="community-field">
                  <label htmlFor={feedbackId} className="car-field-title">Feedback to student</label>
                  <textarea
                    id={feedbackId}
                    className="ui-input"
                    rows={6}
                    value={feedback}
                    disabled={Boolean(busy)}
                    aria-invalid={Boolean(errors.feedback)}
                    aria-describedby={errors.feedback ? `${feedbackId}-error` : undefined}
                    onChange={(event) => { setFeedback(event.target.value); if (errors.feedback) setErrors((current) => ({ ...current, feedback: undefined })); }}
                  />
                  {errors.feedback && <p id={`${feedbackId}-error`} className="field-error">{errors.feedback}</p>}
                </div>
                <label className="community-checkbox"><input type="checkbox" checked={allowResubmission} disabled={Boolean(busy)} onChange={(event) => setAllowResubmission(event.target.checked)} /> Allow resubmission</label>
                <label className="community-checkbox"><input type="checkbox" checked={suggestShowcase} disabled={Boolean(busy)} onChange={(event) => setSuggestShowcase(event.target.checked)} /> Suggest for Project Showcase{submission.showcasePoints ? ` (+${submission.showcasePoints} points)` : ""}</label>
                <div className="car-decision-buttons">
                  <button type="button" className="btn car-btn-approve" onClick={() => decide("approved")} disabled={Boolean(busy)}><Check size={17} aria-hidden="true" /> {busy === "approved" ? "Approving…" : approveLabel}</button>
                  <button type="button" className="btn car-btn-corrections" onClick={() => decide("needs_corrections")} disabled={Boolean(busy)}>{busy === "needs_corrections" ? "Sending…" : "Request corrections"}</button>
                </div>
                <button type="button" className="community-link-button car-reject-link" onClick={() => { const found = validate("rejected"); setErrors(found); if (!Object.keys(found).length) setRejectOpen(true); }} disabled={Boolean(busy)}>
                  <XCircle size={15} aria-hidden="true" /> Reject submission
                </button>
                <p className="car-field-help">
                  {submission.pointsOnApproval ? `Approving awards ${submission.pointsOnApproval} community points through the backend and notifies the student.` : "The student is notified by in-app message and email."}
                </p>
                {reopened && <button type="button" className="community-link-button" onClick={() => setReopened(false)}>Keep the current decision</button>}
              </>
            )}
          </section>

          {submission.history?.length > 0 && (
            <section className="ui-card" aria-labelledby="history-title">
              <h2 id="history-title">History</h2>
              <ol className="car-history">
                {submission.history.map((item, index) => (
                  <li key={`${item.label}-${item.at}`} className={index === 0 ? "is-latest" : undefined}>
                    <strong>{item.label}</strong>
                    <time dateTime={item.at}>{shortDateTime.format(new Date(item.at))}</time>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>
      </div>

      <Modal open={rejectOpen} onClose={() => busy !== "rejected" && setRejectOpen(false)} title="Reject this submission?">
        <div className="car-dialog">
          <p className="car-dialog-text">
            {student.name} will see your feedback and the submission will be closed with no points.
            {allowResubmission ? " They can submit a new attempt." : " Resubmission is turned off, so they cannot try again."}
          </p>
          <div className="community-delete-actions">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setRejectOpen(false)} disabled={busy === "rejected"}>Cancel</button>
            <button type="button" className="btn btn-sm community-btn-danger" onClick={() => decide("rejected")} disabled={busy === "rejected"}>{busy === "rejected" ? "Rejecting…" : "Reject submission"}</button>
          </div>
        </div>
      </Modal>
      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </section>
  );
}
