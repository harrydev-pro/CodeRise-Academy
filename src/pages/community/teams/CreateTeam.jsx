import { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AlertCircle, ArrowLeft, Lock, X } from "lucide-react";

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import { useCommunityList } from "../../../features/community/listHooks";
import { fullDate } from "../../../features/community/teams/teamHelpers";
import { checkInvite, createTeam, getCollaborationDetails } from "../../../features/community/teams/teamsService";

const NAME_MIN = 3;
const NAME_MAX = 30;
const PITCH_MAX = 280;

// S08 Create Team: /community/collaborate/:id/team/new
export default function CreateTeam() {
  const { id } = useParams();
  const { data, error, loading, reload } = useCommunityList(getCollaborationDetails, { id });
  const backPath = `/community/collaborate/${encodeURIComponent(id)}`;

  if (loading) return <Loader label="Loading project…" />;
  if (error && !data) {
    return (
      <div className="community-library">
        <Link to="/community/collaborate" className="cmt-back-link"><ArrowLeft size={16} aria-hidden="true" /> All collaboration projects</Link>
        <ErrorMessage message={error} onRetry={reload} />
      </div>
    );
  }

  const item = data.collaboration;
  const locked = item.access === "premium" && !data.viewerHasPremium;

  return (
    <div className="community-library cmt-page">
      <Link to={backPath} className="cmt-back-link"><ArrowLeft size={16} aria-hidden="true" /> Back to {item.title}</Link>
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">NEW COLLABORATION TEAM</span>
          <h1>Create a team</h1>
          <p>You will be the team leader. Your team becomes active once it reaches {item.minMembers} members.</p>
        </div>
      </header>

      {data.isSample && (
        <p className="community-sample-notice" role="status">
          Showing sample data: the Community API is not available yet. A team you create here only exists until the page reloads. Try inviting @kemi.martins (works) or @david.mensah (already in a team). This notice only appears on the local dev server.
        </p>
      )}

      {locked ? (
        <section className="community-card community-empty" aria-labelledby="locked-title">
          <span className="community-lock-badge"><Lock size={22} aria-hidden="true" /></span>
          <h2 id="locked-title">{item.title} is a Premium project</h2>
          <p className="muted-text">Upgrade to start a team for this project, plus every other Premium project and team brief.</p>
          <div className="cmt-button-row">
            <Link to="/premium" className="btn community-btn-premium">See Premium plans</Link>
            <Link to={backPath} className="btn btn-outline">Not now</Link>
          </div>
        </section>
      ) : data.viewerTeam ? (
        <section className="community-card community-empty" aria-labelledby="has-team-title">
          <h2 id="has-team-title">You are already in {data.viewerTeam.name}</h2>
          <p className="muted-text">You can be in one team per project, so you can't start another team for {item.title}.</p>
          <Link to={`/community/teams/${encodeURIComponent(data.viewerTeam.id)}`} className="btn btn-primary">Open {data.viewerTeam.name} workspace</Link>
        </section>
      ) : (
        <CreateTeamForm key={item.id} item={item} sample={Boolean(data.isSample)} backPath={backPath} />
      )}
    </div>
  );
}

function validate(values, item) {
  const errors = {};
  const name = values.name.trim();
  if (name.length < NAME_MIN || name.length > NAME_MAX) errors.name = `Give your team a name of ${NAME_MIN}–${NAME_MAX} characters.`;
  if (values.pitch.length > PITCH_MAX) errors.pitch = `Keep the pitch under ${PITCH_MAX} characters.`;
  if (values.size < item.minMembers || values.size > item.maxMembers) errors.size = `This project allows ${item.minMembers}–${item.maxMembers} members.`;
  if (!values.roleId) errors.roleId = "Choose your role.";
  const others = values.size - 1;
  if (values.openRoleIds.length === 0) errors.openRoleIds = "Choose at least one role for other members to fill.";
  else if (values.openRoleIds.length > others) errors.openRoleIds = `A team of ${values.size} has room for ${others} more ${others === 1 ? "member" : "members"}. Untick ${values.openRoleIds.length - others === 1 ? "a role" : "some roles"}.`;
  if (values.invites.length > others) errors.invites = `Invites count towards your team size. A team of ${values.size} can invite up to ${others}.`;
  else if (values.invites.some((invite) => !values.openRoleIds.includes(invite.roleId))) errors.invites = "Each invited member needs one of the open positions.";
  return errors;
}

const FIELD_IDS = { name: "team-name", pitch: "team-pitch", roleId: "team-role", openRoleIds: "team-open-roles", invites: "invite-username" };

function CreateTeamForm({ item, sample, backPath }) {
  const navigate = useNavigate();
  const summaryRef = useRef(null);
  const [values, setValues] = useState(() => {
    const roleId = item.roles[0]?.id ?? "";
    return {
      name: "",
      pitch: "",
      size: item.maxMembers,
      roleId,
      openRoleIds: item.roles.filter((role) => role.id !== roleId).slice(0, item.maxMembers - 1).map((role) => role.id),
      invites: [],
      visibility: "open",
    };
  });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [inviteError, setInviteError] = useState(null);
  const [checking, setChecking] = useState(false);

  const roleName = (roleId) => item.roles.find((role) => role.id === roleId)?.name ?? roleId;
  const sizes = Array.from({ length: item.maxMembers - item.minMembers + 1 }, (_, index) => item.minMembers + index);
  const openSlots = Math.max(0, values.size - 1 - values.invites.length);

  function change(next) {
    const updated = { ...values, ...next };
    setValues(updated);
    if (submitted) setErrors(validate(updated, item));
  }

  function chooseRole(roleId) {
    change({
      roleId,
      openRoleIds: values.openRoleIds.filter((id) => id !== roleId),
      invites: values.invites.filter((invite) => invite.roleId !== roleId),
    });
  }

  function toggleOpenRole(roleId) {
    const on = values.openRoleIds.includes(roleId);
    change({
      openRoleIds: on ? values.openRoleIds.filter((id) => id !== roleId) : [...values.openRoleIds, roleId],
      invites: on ? values.invites.filter((invite) => invite.roleId !== roleId) : values.invites,
    });
  }

  async function addInvite() {
    const username = inviteName.replace(/^@/, "").trim().toLowerCase();
    const roleId = inviteRole || values.openRoleIds.find((id) => !values.invites.some((invite) => invite.roleId === id)) || "";
    if (!username) { setInviteError({ title: "Enter a username.", reason: "Use their CodeRise username, for example @kemi.martins." }); return; }
    if (values.invites.some((invite) => invite.username === username)) { setInviteError({ title: `@${username} is already invited.`, reason: "" }); return; }
    if (values.invites.length >= values.size - 1) { setInviteError({ title: "Your team is full.", reason: `Invites count towards your team size of ${values.size}.` }); return; }
    if (!roleId) { setInviteError({ title: "Tick an open position first.", reason: "Each invited member fills one open position." }); return; }
    setChecking(true);
    setInviteError(null);
    try {
      const result = await checkInvite(item.id, username, { sample });
      if (!result.ok) {
        setInviteError({ title: `@${username} can't be invited.`, reason: result.reason });
        return;
      }
      change({ invites: [...values.invites, { username: result.username, name: result.name, roleId }] });
      setInviteName("");
      setInviteRole("");
    } catch (checkError) {
      setInviteError({ title: "That username could not be checked.", reason: checkError.message || "Please try again." });
    } finally {
      setChecking(false);
    }
  }

  async function submit(event) {
    event.preventDefault();
    setSubmitted(true);
    setFormError("");
    const found = validate(values, item);
    setErrors(found);
    if (Object.keys(found).length) {
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setSaving(true);
    try {
      const result = await createTeam(item.id, {
        name: values.name.trim(),
        pitch: values.pitch.trim(),
        size: values.size,
        roleId: values.roleId,
        openRoleIds: values.openRoleIds,
        invites: values.invites.map(({ username, roleId }) => ({ username, roleId })),
        visibility: values.visibility,
      }, { sample });
      navigate(`/community/teams/${encodeURIComponent(result.team.id)}`);
    } catch (createError) {
      setFormError(createError.message || "Your team could not be created. Please try again.");
      window.requestAnimationFrame(() => summaryRef.current?.focus());
    } finally {
      setSaving(false);
    }
  }

  const errorList = Object.entries(errors);
  const describe = (name, hint) => [hint, errors[name] ? `${name}-error` : ""].filter(Boolean).join(" ") || undefined;

  return (
    <form id="create-team-form" className="cmt-layout" onSubmit={submit} noValidate>
      <div className="cmt-main">
        {(errorList.length > 0 || formError) && (
          <div className="community-error-summary" role="alert" tabIndex={-1} ref={summaryRef}>
            <strong>{formError ? "Your team was not created." : "Fix these before creating your team:"}</strong>
            {formError && <p className="cmt-summary-text">{formError}</p>}
            {errorList.length > 0 && (
              <ul>
                {errorList.map(([name, message]) => <li key={name}><a href={`#${name === "size" ? `team-size-${item.minMembers}` : FIELD_IDS[name]}`}>{message}</a></li>)}
              </ul>
            )}
          </div>
        )}

        <section className="community-card cmt-form-card" aria-labelledby="details-title">
          <h2 id="details-title" className="cmt-card-title">Team details</h2>
          <div className="community-field">
            <div className="community-field-label">
              <label htmlFor="team-name">Team name</label>
              <span className={`community-field-counter${values.name.length > NAME_MAX ? " is-over" : ""}`}>{values.name.length}/{NAME_MAX}</span>
            </div>
            <input id="team-name" className="ui-input" value={values.name} maxLength={NAME_MAX + 10} aria-invalid={Boolean(errors.name)} aria-describedby={describe("name", "team-name-hint")} onChange={(event) => change({ name: event.target.value })} placeholder="e.g. Bean There" />
            <p id="team-name-hint" className="community-field-hint">{NAME_MIN}–{NAME_MAX} characters. Visible to other learners.</p>
            {errors.name && <p id="name-error" className="field-error">{errors.name}</p>}
          </div>
          <div className="community-field">
            <div className="community-field-label">
              <label htmlFor="team-pitch">Short pitch</label>
              <span className="community-field-optional">Optional</span>
              <span className={`community-field-counter${values.pitch.length > PITCH_MAX ? " is-over" : ""}`}>{values.pitch.length}/{PITCH_MAX}</span>
            </div>
            <textarea id="team-pitch" className="ui-input" rows={3} value={values.pitch} aria-invalid={Boolean(errors.pitch)} aria-describedby={describe("pitch")} onChange={(event) => change({ pitch: event.target.value })} placeholder="What will your team build, and how?" />
            {errors.pitch && <p id="pitch-error" className="field-error">{errors.pitch}</p>}
          </div>
          <fieldset className="community-fieldset">
            <legend>Team size</legend>
            <div className="cmt-size-row">
              <div className="cmt-segmented" role="group" aria-label="Team size">
                {sizes.map((size) => (
                  <button key={size} id={`team-size-${size}`} type="button" className={values.size === size ? "active" : ""} aria-pressed={values.size === size} onClick={() => change({ size })}>
                    {size} members
                  </button>
                ))}
              </div>
              <p className="community-field-hint">This project allows {item.minMembers}–{item.maxMembers} members (set by CodeRise).</p>
            </div>
            {errors.size && <p id="size-error" className="field-error">{errors.size}</p>}
          </fieldset>
        </section>

        <section className="community-card cmt-form-card" aria-labelledby="role-title">
          <div>
            <h2 id="role-title" className="cmt-card-title">Your role</h2>
            <p className="cmt-card-sub">Pick what you will be responsible for. You can change it later in the workspace.</p>
          </div>
          <fieldset className="community-fieldset" id="team-role" tabIndex={-1}>
            <legend className="sr-only">Your role</legend>
            <div className="cmt-option-grid">
              {item.roles.map((role) => (
                <label key={role.id} className={`cmt-option${values.roleId === role.id ? " is-selected" : ""}`}>
                  <input type="radio" name="team-role" value={role.id} checked={values.roleId === role.id} onChange={() => chooseRole(role.id)} />
                  <span><strong>{role.name}</strong><small>{role.summary}</small></span>
                </label>
              ))}
            </div>
            {errors.roleId && <p id="roleId-error" className="field-error">{errors.roleId}</p>}
          </fieldset>
        </section>

        <section className="community-card cmt-form-card" aria-labelledby="open-title">
          <div>
            <h2 id="open-title" className="cmt-card-title">Open positions</h2>
            <p className="cmt-card-sub">These roles will be shown to learners who browse this project.</p>
          </div>
          <fieldset className="community-fieldset" id="team-open-roles" tabIndex={-1} aria-describedby={errors.openRoleIds ? "openRoleIds-error" : undefined}>
            <legend className="sr-only">Roles to fill</legend>
            <div className="cmt-option-grid">
              {item.roles.filter((role) => role.id !== values.roleId).map((role) => {
                const checked = values.openRoleIds.includes(role.id);
                const invited = values.invites.find((invite) => invite.roleId === role.id);
                return (
                  <label key={role.id} className={`cmt-option${checked ? " is-selected" : ""}`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleOpenRole(role.id)} />
                    <span>
                      <strong>{role.name}</strong>
                      <small>{!checked ? "Not needed" : invited ? `Reserved for @${invited.username}` : values.visibility === "open" ? "Open to requests" : "Invite only"}</small>
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.openRoleIds && <p id="openRoleIds-error" className="field-error">{errors.openRoleIds}</p>}
          </fieldset>
        </section>

        <section className="community-card cmt-form-card" aria-labelledby="invite-title">
          <div>
            <h2 id="invite-title" className="cmt-card-title">Invite members</h2>
            <p className="cmt-card-sub">Invite by CodeRise username. Invites count towards your team size and are sent when you create the team.</p>
          </div>
          <div className="cmt-invite-row">
            <label className="sr-only" htmlFor="invite-username">CodeRise username</label>
            <input
              id="invite-username"
              className="ui-input"
              placeholder="@username"
              value={inviteName}
              autoComplete="off"
              aria-invalid={Boolean(inviteError)}
              aria-describedby={inviteError ? "invite-error" : undefined}
              onChange={(event) => { setInviteName(event.target.value); setInviteError(null); }}
              onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addInvite(); } }}
            />
            <label className="sr-only" htmlFor="invite-role">Position for this member</label>
            <select id="invite-role" className="ui-input" value={inviteRole} onChange={(event) => setInviteRole(event.target.value)}>
              <option value="">Next open position</option>
              {values.openRoleIds.map((roleId) => <option key={roleId} value={roleId}>{roleName(roleId)}</option>)}
            </select>
            <button type="button" className="btn btn-outline" disabled={checking} onClick={addInvite}>{checking ? "Checking…" : "Add invite"}</button>
          </div>
          {values.invites.length > 0 && (
            <ul className="cmt-invite-list" aria-label="Invited members">
              {values.invites.map((invite) => (
                <li key={invite.username} className="cmt-invite-chip">
                  @{invite.username} · {roleName(invite.roleId)}
                  <button type="button" aria-label={`Remove invite for @${invite.username}`} onClick={() => change({ invites: values.invites.filter((entry) => entry.username !== invite.username) })}>
                    <X size={14} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {inviteError && (
            <p id="invite-error" className="cmt-inline-alert" role="alert">
              <AlertCircle size={18} aria-hidden="true" />
              <span><strong>{inviteError.title}</strong> {inviteError.reason}</span>
            </p>
          )}
          {errors.invites && <p id="invites-error" className="field-error">{errors.invites}</p>}
        </section>

        <section className="community-card cmt-form-card" aria-labelledby="visibility-title">
          <h2 id="visibility-title" className="cmt-card-title">Team visibility</h2>
          <fieldset className="community-fieldset">
            <legend className="sr-only">Team visibility</legend>
            {[
              { value: "open", title: "Open to requests", text: "Anyone can request to join; you accept or reject each request." },
              { value: "invite", title: "Invite only", text: "The team is hidden from the join list." },
            ].map((option) => (
              <label key={option.value} className={`cmt-option cmt-option-wide${values.visibility === option.value ? " is-selected" : ""}`}>
                <input type="radio" name="team-visibility" value={option.value} checked={values.visibility === option.value} onChange={() => change({ visibility: option.value })} />
                <span><strong>{option.title}</strong><small>{option.text}</small></span>
              </label>
            ))}
          </fieldset>
        </section>
      </div>

      <aside className="cmt-side" aria-label="Team summary">
        <section className="community-card cmt-sticky" aria-labelledby="create-summary-title">
          <h2 id="create-summary-title" className="cmt-card-title">Summary</h2>
          <dl className="cmt-summary">
            <div><dt>Project</dt><dd>{item.title}</dd></div>
            <div><dt>Access</dt><dd><span className={`community-tag ${item.access === "premium" ? "tag-purple" : "tag-green"}`}>{item.access === "premium" ? "Premium" : "Free"}</span></dd></div>
            <div><dt>Team name</dt><dd>{values.name.trim() || "—"}</dd></div>
            <div><dt>Max members</dt><dd>{values.size} members</dd></div>
            <div><dt>Your role</dt><dd>{roleName(values.roleId) || "—"}</dd></div>
            <div><dt>Invited</dt><dd>{values.invites.length} {values.invites.length === 1 ? "member" : "members"}</dd></div>
            <div><dt>Open slots</dt><dd>{openSlots} {openSlots === 1 ? "slot" : "slots"}</dd></div>
            <div><dt>Deadline</dt><dd>{fullDate.format(new Date(item.deadline))}</dd></div>
          </dl>
          <div className="cmt-stack-buttons">
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? "Creating team…" : "Create team"}</button>
            <Link to={backPath} className="btn btn-outline">Cancel</Link>
          </div>
        </section>
        <section className="community-card cmt-soft-card" aria-labelledby="rules-title">
          <h2 id="rules-title" className="cmt-card-title">Team rules</h2>
          <ul className="cmt-rules">
            <li>You can lead one team per project.</li>
            <li>Teams can't go over their maximum size.</li>
            <li>The team submits one final project.</li>
            <li>Every member's contribution is tracked.</li>
          </ul>
        </section>
      </aside>
    </form>
  );
}
