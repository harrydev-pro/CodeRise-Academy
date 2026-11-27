import { useState } from "react";
import { Link } from "react-router-dom";
import { SendHorizontal, Upload } from "lucide-react";

import Loader from "../../../components/common/Loader";
import Modal from "../../../components/common/Modal";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import { useCommunityList } from "../../../features/community/listHooks";
import { Avatar, FileAction, FileIcon, ProgressBar, TaskStatusTag } from "../../../features/community/teams/teamComponents";
import { dayMonth, firstName, formatBytes, formatDueDate, timeOfDay, useTeamWorkspace } from "../../../features/community/teams/teamHelpers";
import { decideJoinRequest, getTeamOverview, sendTeamMessage, updateMemberRoles } from "../../../features/community/teams/teamsService";

const ROLE_MAX = 40;

// S09 Team Workspace overview: /community/teams/:teamId
export default function TeamOverview() {
  const { team, sample, reloadTeam, notify } = useTeamWorkspace();
  const { data, error, loading, reload } = useCommunityList(getTeamOverview, { teamId: team.id });
  const [deciding, setDeciding] = useState("");
  const [rolesOpen, setRolesOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);

  if (loading) return <Loader label="Loading overview…" />;
  if (error && !data) return <ErrorMessage message={error} onRetry={reload} />;

  const base = `/community/teams/${encodeURIComponent(team.id)}`;
  const full = team.members.length >= team.maxMembers;
  const memberName = (username) => team.members.find((member) => member.username === username)?.name ?? "Unassigned";
  const submitted = team.status === "submitted";

  async function decide(request, decision) {
    setDeciding(`${request.id}:${decision}`);
    try {
      await decideJoinRequest(team.id, request.id, decision, { sample });
      notify({ type: "success", message: decision === "accept" ? `${request.name} joined ${team.name}.` : `You rejected ${request.name}'s request.` });
      reload();
      reloadTeam();
    } catch (decideError) {
      notify({ type: "error", message: decideError.message || "That request could not be updated." });
    } finally {
      setDeciding("");
    }
  }

  async function sendMessage(event) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    try {
      await sendTeamMessage(team.id, { channel: "general", body, mentions: [], attachment: null }, { sample });
      setDraft("");
      reload();
    } catch (sendError) {
      notify({ type: "error", message: sendError.message || "Your message could not be sent." });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="cmt-layout cmt-layout-wide">
      <div className="cmt-main">
        <section className="community-card" aria-labelledby="members-title">
          <div className="community-card-header">
            <h2 id="members-title">Members &amp; contribution</h2>
            {team.viewerIsLeader && <button type="button" className="btn btn-outline btn-sm" onClick={() => setRolesOpen(true)}>Edit roles</button>}
          </div>
          <ul className="community-list">
            {team.members.map((member) => (
              <li key={member.username} className="cmt-member">
                <Avatar name={member.name} username={member.username} viewer={member.username === team.viewerUsername} size="md" />
                <div className="cmt-member-body">
                  <p className="cmt-member-name">
                    <strong>{member.name}</strong>
                    {member.isLeader && <span className="community-tag tag-blue">Leader</span>}
                  </p>
                  <p className="cmt-member-meta">{member.role} · {member.tasksDone} {member.tasksDone === 1 ? "task" : "tasks"} done</p>
                  <ProgressBar value={member.contribution} label={`${member.name}'s share of completed tasks`} className="is-gradient" />
                </div>
                <strong className="cmt-member-percent">{member.contribution}%</strong>
              </li>
            ))}
            {(team.invites ?? []).map((invite) => (
              <li key={invite.username} className="cmt-member">
                <span className="community-avatar community-avatar-open community-avatar-md" aria-hidden="true" />
                <div className="cmt-member-body">
                  <p className="cmt-member-name"><strong>@{invite.username}</strong><span className="community-tag tag-amber">Invited</span></p>
                  <p className="cmt-member-meta">{invite.roleName} · waiting for them to accept</p>
                </div>
              </li>
            ))}
          </ul>
          {team.status === "forming" && (
            <p className="cmt-note">Your team becomes active at {team.minMembers} members. Invite people or accept join requests to get started.</p>
          )}
        </section>

        <section className="community-card" aria-labelledby="due-title">
          <div className="community-card-header">
            <h2 id="due-title">Due this week</h2>
            <Link to={`${base}/tasks`} className="text-link">Open task board</Link>
          </div>
          {data.dueThisWeek.length === 0 ? (
            <p className="muted-text">Nothing is due in the next 7 days.</p>
          ) : (
            <ul className="community-list">
              {data.dueThisWeek.map((task) => (
                <li key={task.id} className="cmt-due">
                  <TaskStatusTag status={task.status} />
                  <span className="cmt-due-title">{task.title}</span>
                  <span className="cmt-due-meta">{firstName(memberName(task.assignee))} · {formatDueDate(task.dueDate)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="community-card" aria-labelledby="files-title">
          <div className="community-card-header">
            <h2 id="files-title">Shared files</h2>
            <Link to={`${base}/files`} className="btn btn-outline btn-sm"><Upload size={15} aria-hidden="true" /> Upload</Link>
          </div>
          {data.recentFiles.length === 0 ? (
            <p className="muted-text">No files yet. Upload the brief, designs or links your team will use.</p>
          ) : (
            <ul className="community-list">
              {data.recentFiles.map((file) => (
                <li key={file.id} className="cmt-file-row">
                  <FileIcon kind={file.kind} />
                  <span className="cmt-file-name">
                    <strong>{file.name}</strong>
                    <small>{file.type === "link" ? "Link" : formatBytes(file.size)} · {firstName(file.addedBy.name)} · {dayMonth.format(new Date(file.updatedAt))}</small>
                  </span>
                  <FileAction file={file} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <aside className="cmt-side" aria-label="Requests, chat and submission">
        {team.viewerIsLeader && (
          <section className="community-card cmt-requests" aria-labelledby="requests-title">
            <div className="community-card-header">
              <h2 id="requests-title">Join requests</h2>
              <span className="community-tag tag-blue">Leader only</span>
            </div>
            {data.joinRequests.length === 0 ? (
              <p className="muted-text">No requests waiting.</p>
            ) : (
              <>
                {full && <p className="cmt-card-sub">Your team is full ({team.members.length} of {team.maxMembers}). Accepting would exceed the limit, so new requests are on hold.</p>}
                <ul className="cmt-request-list">
                  {data.joinRequests.map((request) => (
                    <li key={request.id} className="cmt-request">
                      <div className="cmt-request-head">
                        <Avatar name={request.name} username={request.username} />
                        <span className="cmt-file-name">
                          <strong>{request.name}</strong>
                          <small>{request.track} · {request.projectsCompleted} projects completed</small>
                        </span>
                      </div>
                      <p className="cmt-request-role">Wants: <strong>{request.roleName}</strong></p>
                      {request.message && <p className="cmt-request-message">“{request.message}”</p>}
                      <div className="cmt-button-pair">
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          disabled={full || Boolean(deciding)}
                          aria-describedby={full ? "requests-title" : undefined}
                          onClick={() => decide(request, "accept")}
                        >
                          {deciding === `${request.id}:accept` ? "Accepting…" : "Accept"}
                        </button>
                        <button type="button" className="btn btn-outline btn-sm" disabled={Boolean(deciding)} onClick={() => decide(request, "reject")}>
                          {deciding === `${request.id}:reject` ? "Rejecting…" : "Reject"}
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>
        )}

        <section className="community-card" aria-labelledby="chat-preview-title">
          <div className="community-card-header">
            <h2 id="chat-preview-title">Team chat</h2>
            <span className="cmt-muted-small">{team.members.filter((member) => member.online).length} online</span>
          </div>
          {data.recentMessages.length === 0 ? (
            <p className="muted-text">No messages yet. Say hello to your team.</p>
          ) : (
            <ul className="cmt-bubbles" aria-label="Latest messages in #general">
              {data.recentMessages.map((message) => {
                const own = message.author?.username === team.viewerUsername;
                return (
                  <li key={message.id} className={`cmt-bubble-row${own ? " is-own" : ""}`}>
                    <Avatar name={message.author?.name ?? "CodeRise"} username={message.author?.username} viewer={own} size="sm" />
                    <div className="min-w-0">
                      <p className="cmt-bubble-meta">{own ? "You" : firstName(message.author?.name)} · <time dateTime={message.createdAt}>{timeOfDay.format(new Date(message.createdAt))}</time></p>
                      <p className="cmt-bubble">{message.body}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <form className="cmt-quick-send" onSubmit={sendMessage}>
            <label htmlFor="overview-message" className="sr-only">Message {team.name}</label>
            <input id="overview-message" className="ui-input" placeholder={`Message ${team.name}`} value={draft} maxLength={2000} onChange={(event) => setDraft(event.target.value)} />
            <button type="submit" className="btn btn-primary cmt-icon-btn" disabled={sending || !draft.trim()} aria-label="Send message">
              <SendHorizontal size={18} aria-hidden="true" />
            </button>
          </form>
          <Link to={`${base}/chat`} className="text-link cmt-small-link">Open full chat</Link>
        </section>

        <section className="community-card" aria-labelledby="final-title">
          <h2 id="final-title" className="cmt-card-title">Final submission</h2>
          <p className="cmt-card-sub">
            {submitted ? "Your team has submitted. You'll be notified when the review is ready." : "One submission for the whole team. Only the leader can submit once every member has confirmed."}
          </p>
          <ul className="cmt-confirm-chips" aria-label="Member confirmations">
            {data.confirmations.map((item) => (
              <li key={item.username} className={`community-tag ${item.confirmedAt ? "tag-green" : "tag-neutral"}`}>
                {firstName(item.name)} {item.confirmedAt ? "ready" : "pending"}
              </li>
            ))}
          </ul>
          <Link to={`${base}/submission`} className="btn btn-outline cmt-full-btn">{submitted ? "View submission" : "Prepare submission"}</Link>
        </section>
      </aside>

      <EditRolesDialog
        open={rolesOpen}
        members={team.members}
        onClose={() => setRolesOpen(false)}
        onSave={async (roles) => {
          await updateMemberRoles(team.id, roles, { sample });
          setRolesOpen(false);
          notify({ type: "success", message: "Roles updated." });
          reload();
          reloadTeam();
        }}
      />
    </div>
  );
}

function EditRolesDialog({ open, members, onClose, onSave }) {
  const [roles, setRoles] = useState(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const current = roles ?? Object.fromEntries(members.map((member) => [member.username, member.role]));

  function close() {
    setRoles(null);
    setError("");
    onClose();
  }

  async function submit(event) {
    event.preventDefault();
    if (Object.values(current).some((role) => !role.trim())) { setError("Every member needs a role."); return; }
    setSaving(true);
    setError("");
    try {
      await onSave(Object.fromEntries(Object.entries(current).map(([username, role]) => [username, role.trim()])));
      setRoles(null);
    } catch (saveError) {
      setError(saveError.message || "Roles could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal open={open} onClose={close} title="Edit roles" description="Swap or rename roles. Every member sees the change.">
      <form className="community-report-form" onSubmit={submit} noValidate>
        {members.map((member) => (
          <div key={member.username} className="community-field">
            <label htmlFor={`role-${member.username}`} className="cmt-label">{member.name}{member.isLeader ? " (leader)" : ""}</label>
            <input
              id={`role-${member.username}`}
              className="ui-input"
              maxLength={ROLE_MAX}
              value={current[member.username] ?? ""}
              onChange={(event) => setRoles({ ...current, [member.username]: event.target.value })}
            />
          </div>
        ))}
        {error && <p className="field-error" role="alert">{error}</p>}
        <div className="community-comment-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={close}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? "Saving…" : "Save roles"}</button>
        </div>
      </form>
    </Modal>
  );
}
