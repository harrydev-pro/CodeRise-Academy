import { useRef, useState } from "react";
import { CheckCircle2, Clock } from "lucide-react";

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import { useCommunityList } from "../../../features/community/listHooks";
import { Avatar, ProgressBar } from "../../../features/community/teams/teamComponents";
import { dayMonth, firstName, formatDeadline, fullDate, isHttpUrl, useNow, useTeamWorkspace } from "../../../features/community/teams/teamHelpers";
import {
  confirmSubmission,
  getTeamSubmission,
  remindMember,
  saveSubmissionDraft,
  submitTeamProject,
} from "../../../features/community/teams/teamsService";

const NOTES_MAX = 1500;
const LINK_FIELDS = [
  { name: "github", label: "GitHub repository", placeholder: "https://github.com/your-team/project", host: /github\.com/i, hostError: "Use a link to a GitHub repository, for example https://github.com/team-nova/event-tickets." },
  { name: "live", label: "Live project URL", placeholder: "https://your-project.vercel.app" },
  { name: "figma", label: "Figma file", placeholder: "https://figma.com/file/…", host: /figma\.com/i, hostError: "Use a link to a Figma file (figma.com)." },
  { name: "video", label: "Demo video", optional: true, placeholder: "https://youtube.com/…" },
];
const NEXT_STEPS = [
  { title: "Submitted", text: "Locked for editing; team is notified." },
  { title: "Under Review", text: "A reviewer scores it against the criteria." },
  { title: "Approved or Needs Corrections", text: "Feedback goes to everyone; resubmit if asked." },
  { title: "Completed", text: "Each member gets 100 points and the Team Player badge." },
];

// S09d Team submission: /community/teams/:teamId/submission
export default function TeamSubmission() {
  const { team, sample, reloadTeam, notify } = useTeamWorkspace();
  const { data, error, loading, reload } = useCommunityList(getTeamSubmission, { teamId: team.id });

  if (loading) return <Loader label="Loading submission…" />;
  if (error && !data) return <ErrorMessage message={error} onRetry={reload} />;

  return (
    <SubmissionForm
      key={data.submission.updatedAt ?? "new"}
      data={data}
      team={team}
      sample={sample}
      notify={notify}
      refresh={() => { reload(); reloadTeam(); }}
    />
  );
}

function validate(values, { submitting }) {
  const errors = {};
  for (const field of LINK_FIELDS) {
    const value = values.links[field.name].trim();
    if (!value) continue;
    if (!isHttpUrl(value)) errors[field.name] = `Enter a full link that starts with https:// for the ${field.label.toLowerCase()}.`;
    else if (field.host && !field.host.test(value)) errors[field.name] = field.hostError;
  }
  if (values.notes.length > NOTES_MAX) errors.notes = `Notes can be up to ${NOTES_MAX} characters.`;
  if (submitting) {
    if (!values.links.github.trim() && !values.links.live.trim() && !values.links.figma.trim()) errors.github = "Add at least one link: GitHub, live URL or Figma.";
    if (!values.agreed) errors.agreed = "Confirm that the work is your team's own.";
  }
  return errors;
}

function SubmissionForm({ data, team, sample, notify, refresh }) {
  const { submission, contributions, confirmations, openTasks, deadline } = data;
  const [values, setValues] = useState({ links: { ...submission.links }, notes: submission.notes ?? "", agreed: false });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [working, setWorking] = useState("");
  const summaryRef = useRef(null);

  const submitted = submission.status === "submitted";
  const now = useNow(60000);
  const closed = !submitted && now > new Date(deadline).getTime();
  const editable = team.viewerIsLeader && !submitted && !closed;
  const allConfirmed = confirmations.every((item) => item.confirmedAt);
  const waiting = confirmations.filter((item) => !item.confirmedAt).length;
  const viewerConfirmation = confirmations.find((item) => item.username === team.viewerUsername);
  const leader = team.members.find((member) => member.isLeader);

  function changeLink(name, value) {
    const next = { ...values, links: { ...values.links, [name]: value } };
    setValues(next);
    if (errors[name]) setErrors(validate(next, { submitting: false }));
  }

  async function run(kind, action, success) {
    setWorking(kind);
    setFormError("");
    try {
      await action();
      notify({ type: "success", message: success });
      refresh();
    } catch (actionError) {
      setFormError(actionError.message || "That could not be saved. Your changes are still here.");
      window.requestAnimationFrame(() => summaryRef.current?.focus());
    } finally {
      setWorking("");
    }
  }

  function saveDraft() {
    const found = validate(values, { submitting: false });
    setErrors(found);
    if (Object.keys(found).length) { window.requestAnimationFrame(() => summaryRef.current?.focus()); return; }
    run("draft", () => saveSubmissionDraft(team.id, { links: values.links, notes: values.notes.trim() }, { sample }), "Draft saved. Your team can see it.");
  }

  function submit(event) {
    event.preventDefault();
    const found = validate(values, { submitting: true });
    setErrors(found);
    if (Object.keys(found).length) { window.requestAnimationFrame(() => summaryRef.current?.focus()); return; }
    run("submit", () => submitTeamProject(team.id, { links: values.links, notes: values.notes.trim(), agreed: true }, { sample }), `${team.name}'s project was submitted for review.`);
  }

  const errorList = Object.entries(errors);

  return (
    <div className="cmt-layout cmt-layout-wide">
      <form className="community-card cmt-form-card" onSubmit={submit} noValidate aria-labelledby="submission-title">
        <div>
          <h2 id="submission-title" className="cmt-card-title">Final team submission</h2>
          <p className="cmt-card-sub">The team submits one final project. Every member confirms their part, then the leader submits before {formatDeadline(deadline)}.</p>
        </div>

        {submitted && (
          <p className="cmt-notice tone-green" role="status">
            <CheckCircle2 size={18} aria-hidden="true" />
            <span><strong>Submitted {fullDate.format(new Date(submission.submittedAt))}.</strong> Your project is under review and locked for editing. Each team submits once.</span>
          </p>
        )}
        {closed && (
          <p className="cmt-notice tone-amber" role="status">
            <Clock size={18} aria-hidden="true" />
            <span><strong>Submissions closed.</strong> The deadline passed on {formatDeadline(deadline)}.</span>
          </p>
        )}
        {!team.viewerIsLeader && !submitted && !closed && (
          <p className="cmt-notice tone-blue" role="status">
            <span>Only the team leader{leader ? ` (${firstName(leader.name)})` : ""} can edit the links and submit. Check them, then confirm your part.</span>
          </p>
        )}

        {(errorList.length > 0 || formError) && (
          <div className="community-error-summary" role="alert" tabIndex={-1} ref={summaryRef}>
            <strong>{formError ? "That didn't work." : "Fix these first:"}</strong>
            {formError && <p className="cmt-summary-text">{formError}</p>}
            {errorList.length > 0 && (
              <ul>
                {errorList.map(([name, message]) => <li key={name}><a href={`#submission-${name}`}>{message}</a></li>)}
              </ul>
            )}
          </div>
        )}

        <div className="cmt-field-pair">
          {LINK_FIELDS.map((field) => (
            <div key={field.name} className="community-field">
              <div className="community-field-label">
                <label htmlFor={`submission-${field.name}`}>{field.label}</label>
                {field.optional && <span className="community-field-optional">Optional</span>}
              </div>
              <input
                id={`submission-${field.name}`}
                type="url"
                className="ui-input"
                placeholder={field.placeholder}
                value={values.links[field.name]}
                readOnly={!editable}
                aria-invalid={Boolean(errors[field.name])}
                aria-describedby={errors[field.name] ? `submission-${field.name}-error` : undefined}
                onChange={(event) => changeLink(field.name, event.target.value)}
              />
              {errors[field.name] && <p id={`submission-${field.name}-error`} className="field-error">{errors[field.name]}</p>}
            </div>
          ))}
        </div>

        <div className="community-field">
          <div className="community-field-label">
            <label htmlFor="submission-notes">Notes for the reviewer</label>
            <span className={`community-field-counter${values.notes.length > NOTES_MAX ? " is-over" : ""}`}>{values.notes.length}/{NOTES_MAX}</span>
          </div>
          <textarea id="submission-notes" className="ui-input" rows={4} value={values.notes} readOnly={!editable} aria-invalid={Boolean(errors.notes)} onChange={(event) => setValues({ ...values, notes: event.target.value })} />
          {errors.notes && <p className="field-error">{errors.notes}</p>}
        </div>

        <div>
          <h3 className="cmt-label">Contribution summary</h3>
          <ul className="community-list cmt-contrib-list">
            {contributions.map((member) => (
              <li key={member.username} className="cmt-member">
                <Avatar name={member.name} username={member.username} viewer={member.username === team.viewerUsername} />
                <div className="cmt-member-body">
                  <p className="cmt-member-name"><strong>{member.name}</strong> · {member.role}</p>
                  <ProgressBar value={member.contribution} label={`${member.name}'s share of completed tasks`} className="is-gradient" />
                </div>
                <span className="cmt-muted-small">{member.tasksDone} {member.tasksDone === 1 ? "task" : "tasks"} · {member.contribution}%</span>
              </li>
            ))}
          </ul>
        </div>

        {!submitted && openTasks > 0 && (
          <p className="cmt-notice tone-amber">{openTasks} {openTasks === 1 ? "task is" : "tasks are"} still open on the board. You can submit anyway, but reviewers will see {openTasks === 1 ? "it" : "them"} as unfinished.</p>
        )}

        {editable && (
          <div className="cmt-submit-area">
            <label className="community-checkbox" htmlFor="submission-agreed">
              <input id="submission-agreed" type="checkbox" checked={values.agreed} aria-invalid={Boolean(errors.agreed)} onChange={(event) => setValues({ ...values, agreed: event.target.checked })} />
              All work is our own and follows the CodeRise community rules
            </label>
            {errors.agreed && <p className="field-error">{errors.agreed}</p>}
            <div className="cmt-button-row">
              <button type="button" className="btn btn-outline" disabled={Boolean(working)} onClick={saveDraft}>{working === "draft" ? "Saving…" : "Save draft"}</button>
              <button type="submit" className="btn btn-primary" disabled={!allConfirmed || Boolean(working)} aria-describedby="submit-hint">
                {working === "submit" ? "Submitting…" : "Submit for review"}
              </button>
            </div>
            <p id="submit-hint" className="cmt-muted-small cmt-submit-hint">
              {allConfirmed ? "Everyone has confirmed. Once submitted, the project is locked." : `Submit unlocks when all ${confirmations.length} members have confirmed (${waiting} waiting).`}
            </p>
          </div>
        )}
      </form>

      <aside className="cmt-side" aria-label="Confirmations and next steps">
        <section className="community-card" aria-labelledby="confirm-title">
          <h2 id="confirm-title" className="cmt-card-title">Member confirmations</h2>
          <ul className="community-list">
            {confirmations.map((item) => {
              const isViewer = item.username === team.viewerUsername;
              return (
                <li key={item.username} className="cmt-presence">
                  <Avatar name={item.name} username={item.username} viewer={isViewer} />
                  <span className="cmt-file-name">
                    <strong>{firstName(item.name)}{isViewer ? " (you)" : ""}</strong>
                    <small>{item.confirmedAt ? `Confirmed ${dayMonth.format(new Date(item.confirmedAt))}` : "Not yet confirmed"}</small>
                  </span>
                  {item.confirmedAt ? (
                    <span className="community-tag tag-green">Ready</span>
                  ) : !submitted && !isViewer && team.viewerIsLeader ? (
                    <button type="button" className="btn btn-outline btn-sm" disabled={Boolean(working)} onClick={() => run(`remind-${item.username}`, () => remindMember(team.id, item.username, { sample }), `Reminder sent to ${firstName(item.name)}.`)}>
                      {working === `remind-${item.username}` ? "Sending…" : "Remind"}<span className="sr-only"> {item.name}</span>
                    </button>
                  ) : (
                    <span className="community-tag tag-neutral">Pending</span>
                  )}
                </li>
              );
            })}
          </ul>
          {viewerConfirmation && !viewerConfirmation.confirmedAt && !submitted && !closed && (
            <button type="button" className="btn btn-primary cmt-full-btn" disabled={Boolean(working)} onClick={() => run("confirm", () => confirmSubmission(team.id, { sample }), "You confirmed your part of the project.")}>
              {working === "confirm" ? "Confirming…" : "Confirm my part"}
            </button>
          )}
        </section>

        <section className="community-card" aria-labelledby="next-title">
          <h2 id="next-title" className="cmt-card-title">What happens next</h2>
          <ol className="cmt-steps">
            {NEXT_STEPS.map((step, index) => (
              <li key={step.title}>
                <span className="cmt-step-number" aria-hidden="true">{index + 1}</span>
                <span><strong>{step.title}</strong><small>{step.text}</small></span>
              </li>
            ))}
          </ol>
        </section>
      </aside>
    </div>
  );
}
