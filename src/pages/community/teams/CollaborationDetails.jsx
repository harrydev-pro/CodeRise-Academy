import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, Clock, Crown, Lock, Plus, Star, UserRound, UsersRound } from "lucide-react";

import Loader from "../../../components/common/Loader";
import Modal from "../../../components/common/Modal";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import Toast from "../../../components/feedback/Toast";
import { useCommunityList } from "../../../features/community/listHooks";
import { fullDate, numberFormat } from "../../../features/community/teams/teamHelpers";
import { getCollaborationDetails, requestToJoinTeam, withdrawJoinRequest } from "../../../features/community/teams/teamsService";

const MESSAGE_LIMIT = 300;

// S07 Collaboration Details: /community/collaborate/:id
export default function CollaborationDetails() {
  const { id } = useParams();
  const { data, error, loading, refreshing, reload } = useCommunityList(getCollaborationDetails, { id });
  const [joining, setJoining] = useState(null);
  const [busyTeam, setBusyTeam] = useState("");
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), [setToast]);

  if (loading) return <Loader label="Loading collaboration project…" />;
  if (error && !data) {
    return (
      <div className="community-library">
        <Link to="/community/collaborate" className="cmt-back-link"><ArrowLeft size={16} aria-hidden="true" /> All collaboration projects</Link>
        <ErrorMessage message={error} onRetry={reload} />
      </div>
    );
  }

  const { collaboration: item, viewerTeam, viewerRequest } = data;
  const sample = Boolean(data.isSample);
  const locked = item.access === "premium" && !data.viewerHasPremium;
  const premium = item.access === "premium";
  const openTeams = item.teams.filter((team) => team.openRoles.length > 0 && team.memberInitials.length < team.maxMembers);
  const openSlots = openTeams.reduce((sum, team) => sum + Math.min(team.openRoles.length, team.maxMembers - team.memberInitials.length), 0);
  const sizeText = item.minMembers === item.maxMembers ? `${item.maxMembers}` : `${item.minMembers}–${item.maxMembers}`;
  const roleName = (roleId) => item.roles.find((role) => role.id === roleId)?.name ?? roleId;
  const canJoin = !locked && !viewerTeam && !viewerRequest;
  const createPath = `/community/collaborate/${encodeURIComponent(item.id)}/team/new`;

  async function withdraw(teamId) {
    setBusyTeam(teamId);
    try {
      await withdrawJoinRequest(item.id, teamId, { sample });
      setToast({ type: "success", message: "Your request was withdrawn." });
      reload();
    } catch (withdrawError) {
      setToast({ type: "error", message: withdrawError.message || "Your request could not be withdrawn." });
    } finally {
      setBusyTeam("");
    }
  }

  let heroAction = null;
  if (viewerTeam) {
    heroAction = <Link to={`/community/teams/${encodeURIComponent(viewerTeam.id)}`} className="btn btn-primary">Open {viewerTeam.name} workspace</Link>;
  } else if (locked) {
    heroAction = <Link to="/premium" className="btn community-btn-premium"><Lock size={16} aria-hidden="true" /> Unlock with Premium</Link>;
  } else if (!viewerRequest) {
    heroAction = <Link to={createPath} className="btn btn-outline"><Plus size={17} aria-hidden="true" /> Create a new team</Link>;
  }

  return (
    <div className={`community-library cmt-page${refreshing ? " is-refreshing" : ""}`}>
      <Link to="/community/collaborate" className="cmt-back-link"><ArrowLeft size={16} aria-hidden="true" /> All collaboration projects</Link>

      {sample && (
        <p className="community-sample-notice" role="status">
          Showing sample data: the Community API is not available yet. Join requests only change on screen. This notice only appears on the local dev server.
        </p>
      )}

      <section className="community-card cmt-hero" aria-labelledby="collab-title">
        <div className="min-w-0">
          <div className="community-tags">
            <span className={`community-tag ${premium ? "tag-purple" : "tag-green"}`}>{premium && <Crown size={12} aria-hidden="true" />}{premium ? "Premium" : "Free"}</span>
            <span className="community-chip">{item.level}</span>
            <span className={`community-tag ${openSlots ? "tag-blue" : "tag-neutral"}`}>
              {openSlots ? `${openSlots} open ${openSlots === 1 ? "slot" : "slots"} in ${openTeams.length} ${openTeams.length === 1 ? "team" : "teams"}` : "All teams full"}
            </span>
          </div>
          <p className="cmt-eyebrow">{item.teamType}</p>
          <h1 id="collab-title" className="cmt-title">{item.title}</h1>
          <p className="cmt-hero-text">{item.brief}</p>
          <ul className="cmt-meta" aria-label="Project facts">
            <li><Clock size={15} aria-hidden="true" /> {item.duration}</li>
            <li><UserRound size={15} aria-hidden="true" /> Team size {sizeText}</li>
            <li><CalendarDays size={15} aria-hidden="true" /> Submit by {fullDate.format(new Date(item.deadline))}</li>
            <li><Star size={15} aria-hidden="true" /> +{numberFormat.format(item.pointsPerMember)} points per member</li>
          </ul>
        </div>
        {heroAction && <div className="cmt-hero-action">{heroAction}</div>}
      </section>

      {viewerTeam && (
        <p className="cmt-notice tone-blue" role="status">
          <UsersRound size={18} aria-hidden="true" />
          <span>You are already in <strong>{viewerTeam.name}</strong> for this project. Learners can be in one team per project.</span>
        </p>
      )}
      {viewerRequest && (
        <p className="cmt-notice tone-amber" role="status">
          <Clock size={18} aria-hidden="true" />
          <span>Your request to join <strong>{viewerRequest.teamName}</strong> as {roleName(viewerRequest.roleId)} is waiting for the team leader. You can have one pending request per project.</span>
        </p>
      )}

      {locked && (
        <section className="community-premium-banner" aria-labelledby="premium-lock-title">
          <span className="community-lock-badge"><Lock size={22} aria-hidden="true" /></span>
          <div className="min-w-0">
            <h2 id="premium-lock-title">{item.title} is a Premium project</h2>
            <p>Upgrade to join a team or start your own, plus every other Premium project and team brief.</p>
          </div>
          <Link to="/premium" className="btn community-btn-premium">See Premium plans</Link>
        </section>
      )}

      <div className="cmt-layout">
        <div className="cmt-main">
          <section className="community-card" aria-labelledby="teams-title">
            <h2 id="teams-title" className="cmt-card-title">Teams you can join</h2>
            <p className="cmt-card-sub">The team leader reviews each request. You can have one pending request per project.</p>
            {item.teams.length === 0 ? (
              <div className="community-empty cmt-empty-tight">
                <span className="community-icon tone-green"><UsersRound size={22} aria-hidden="true" /></span>
                <h3>No teams yet</h3>
                <p className="muted-text">Be the first: start a team and invite people to fill the roles.</p>
                {canJoin && <Link to={createPath} className="btn btn-primary btn-sm">Create a team</Link>}
              </div>
            ) : (
              <ul className="cmt-team-list">
                {item.teams.map((team) => {
                  const full = team.openRoles.length === 0 || team.memberInitials.length >= team.maxMembers;
                  const pendingHere = viewerRequest?.teamId === team.id;
                  const isViewerTeam = viewerTeam?.id === team.id;
                  const firstOpen = openTeams[0]?.id === team.id;
                  return (
                    <li key={team.id} className={`cmt-team${full ? " is-full" : ""}`}>
                      <div className="cmt-team-head">
                        <span className="community-avatars" aria-hidden="true">
                          {team.memberInitials.map((initial, index) => <span key={`${initial}-${index}`} className={`community-avatar avatar-${index % 4}`}>{initial}</span>)}
                          {Array.from({ length: Math.max(0, team.maxMembers - team.memberInitials.length) }, (_, index) => <span key={`open-${index}`} className="community-avatar community-avatar-open" />)}
                        </span>
                        <div className="cmt-team-name">
                          <h3>{team.name}</h3>
                          <p>
                            {full
                              ? `${team.memberInitials.length} of ${team.maxMembers} members · ${team.status === "active" ? "Active" : "Forming"}`
                              : `Led by ${team.leaderName} · ${team.memberInitials.length} of ${team.maxMembers} members`}
                          </p>
                        </div>
                        <div className="cmt-team-action">
                          {isViewerTeam && <span className="community-tag tag-blue">Your team</span>}
                          {!isViewerTeam && full && <span className="community-tag tag-neutral">Team full</span>}
                          {!isViewerTeam && !full && pendingHere && (
                            <>
                              <span className="community-tag tag-amber">Request pending</span>
                              <button type="button" className="btn btn-outline btn-sm" disabled={busyTeam === team.id} onClick={() => withdraw(team.id)}>
                                {busyTeam === team.id ? "Withdrawing…" : "Withdraw"}
                              </button>
                            </>
                          )}
                          {!isViewerTeam && !full && !pendingHere && (
                            locked ? (
                              <Link to="/premium" className="btn btn-outline btn-sm" aria-label={`Unlock Premium to join ${team.name}`}><Lock size={14} aria-hidden="true" /> Unlock</Link>
                            ) : (
                              <button
                                type="button"
                                className={`btn btn-sm ${firstOpen ? "btn-primary" : "btn-outline"}`}
                                disabled={!canJoin}
                                aria-label={`Request to join ${team.name}`}
                                onClick={() => setJoining(team)}
                              >
                                Request to join
                              </button>
                            )
                          )}
                        </div>
                      </div>
                      {!full && (
                        <p className="cmt-open-roles">
                          <span>Open {team.openRoles.length === 1 ? "position" : "positions"}:</span>
                          {team.openRoles.map((roleId) => <span key={roleId} className="community-tag tag-blue">{roleName(roleId)}</span>)}
                        </p>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="community-card" aria-labelledby="roles-title">
            <h2 id="roles-title" className="cmt-card-title">Required responsibilities</h2>
            <p className="cmt-card-sub">Roles can be swapped inside the team once it is active.</p>
            <div className="community-table-wrap cmt-table-wrap" tabIndex={0} role="region" aria-label="Roles and responsibilities (scrolls sideways)">
              <table className="community-table cmt-roles-table">
                <thead>
                  <tr>
                    <th scope="col">Role</th>
                    <th scope="col">Responsibilities</th>
                    <th scope="col">Key skills</th>
                  </tr>
                </thead>
                <tbody>
                  {item.roles.map((role) => (
                    <tr key={role.id}>
                      <th scope="row">{role.name}</th>
                      <td>{role.responsibilities}</td>
                      <td>{role.keySkills}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="community-card" aria-labelledby="deliver-title">
            <h2 id="deliver-title" className="cmt-card-title">What you will deliver</h2>
            <ol className="cmt-deliverables">
              {item.deliverables.map((deliverable) => <li key={deliverable}>{deliverable}</li>)}
            </ol>
          </section>
        </div>

        <aside className="cmt-side" aria-label="Project summary">
          <section className="community-card" aria-labelledby="summary-title">
            <h2 id="summary-title" className="cmt-card-title">Project summary</h2>
            <dl className="cmt-summary">
              <div><dt>Access</dt><dd><span className={`community-tag ${premium ? "tag-purple" : "tag-green"}`}>{premium ? "Premium" : "Free"}</span></dd></div>
              <div><dt>Difficulty</dt><dd>{item.level}</dd></div>
              <div><dt>Team size</dt><dd>{sizeText} members</dd></div>
              <div><dt>Available slots</dt><dd>{openSlots} across {openTeams.length} {openTeams.length === 1 ? "team" : "teams"}</dd></div>
              <div><dt>Duration</dt><dd>{item.duration}</dd></div>
              <div><dt>Deadline</dt><dd>{fullDate.format(new Date(item.deadline))}</dd></div>
              <div><dt>Reviewer</dt><dd>{item.reviewer}</dd></div>
            </dl>
          </section>

          <section className="community-card" aria-labelledby="skills-title">
            <h2 id="skills-title" className="cmt-card-title">Required skills</h2>
            <ul className="community-skill-list">
              {item.skills.map((skill) => <li key={skill} className="community-skill">{skill}</li>)}
            </ul>
          </section>

          <section className="community-card cmt-soft-card" aria-labelledby="how-title">
            <h2 id="how-title" className="cmt-card-title">How teams work</h2>
            <p className="cmt-card-sub">Once the team reaches its minimum size it becomes active and gets a shared workspace with tasks, chat, files and a single submission area.</p>
            {viewerTeam && <Link to={`/community/teams/${encodeURIComponent(viewerTeam.id)}`} className="btn btn-outline btn-sm">Open your workspace</Link>}
          </section>
        </aside>
      </div>

      <JoinDialog
        team={joining}
        roleName={roleName}
        onClose={() => setJoining(null)}
        onSubmit={async (values) => {
          await requestToJoinTeam(item.id, joining.id, values, { sample });
          setToast({ type: "success", message: `Request sent to ${joining.name}. The leader will accept or reject it.` });
          setJoining(null);
          reload();
        }}
      />

      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </div>
  );
}

function JoinDialog({ team, roleName, onClose, onSubmit }) {
  const [roleId, setRoleId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const open = Boolean(team);
  const roles = team?.openRoles ?? [];
  const chosen = roles.length === 1 ? roles[0] : roleId;

  function close() {
    setRoleId("");
    setMessage("");
    setError("");
    onClose();
  }

  async function submit(event) {
    event.preventDefault();
    if (!chosen) { setError("Choose the position you want to fill."); return; }
    setSending(true);
    setError("");
    try {
      await onSubmit({ roleId: chosen, message: message.trim() });
      setRoleId("");
      setMessage("");
    } catch (submitError) {
      setError(submitError.message || "Your request could not be sent. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <Modal open={open} onClose={close} title={team ? `Request to join ${team.name}` : ""} description={team ? `Led by ${team.leaderName}. Pick the open position you want to take.` : ""}>
      <form className="community-report-form" onSubmit={submit} noValidate>
        <fieldset>
          <legend>Position</legend>
          {roles.map((id) => (
            <label key={id} className="community-radio">
              <input type="radio" name="join-role" value={id} checked={chosen === id} onChange={() => { setRoleId(id); setError(""); }} />
              {roleName(id)}
            </label>
          ))}
        </fieldset>
        <label htmlFor="join-message">Message to the leader (optional)</label>
        <textarea id="join-message" className="ui-input" rows={3} maxLength={MESSAGE_LIMIT} value={message} placeholder="Say what you can bring to the team" onChange={(event) => setMessage(event.target.value)} />
        {error && <p className="field-error" role="alert">{error}</p>}
        <div className="community-comment-actions">
          <button type="button" className="btn btn-outline btn-sm" onClick={close}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-sm" disabled={sending}>{sending ? "Sending…" : "Send request"}</button>
        </div>
      </form>
    </Modal>
  );
}
