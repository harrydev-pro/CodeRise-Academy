import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CircleAlert,
  Download,
  FileText,
  Lock,
  Megaphone,
  UsersRound,
  Video,
  Zap,
} from "lucide-react";

import Loader from "../../../components/common/Loader";
import Toast from "../../../components/feedback/Toast";
import { useCommunityList } from "../../../features/community/listHooks";
import { getHackathonWorkspace, setChecklistItem } from "../../../features/community/hackathons/hackathonService";
import {
  avatarTone,
  clockText,
  dayDateTime,
  initials,
  spokenDuration,
  timeAgo,
  timeOnly,
  useServerNow,
  wat,
} from "../../../features/community/hackathons/hackathonUtils";

const ANNOUNCEMENT_STYLE = {
  info: { icon: Megaphone, tone: "blue" },
  warning: { icon: CircleAlert, tone: "amber" },
  start: { icon: Zap, tone: "green" },
};
const RESOURCE_ICONS = { file: FileText, download: Download, video: Video };

export default function HackathonWorkspace() {
  const { id = "" } = useParams();
  const { data, error, loading, reload } = useCommunityList(getHackathonWorkspace, { id });
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);
  const [checked, setChecked] = useState({});
  const detailsPath = `/community/hackathons/${encodeURIComponent(id)}`;

  if (loading) return <Loader label="Opening workspace…" />;
  if (error && !data) return <WorkspaceUnavailable message={error} detailsPath={detailsPath} onRetry={reload} />;
  if (!data) return null;

  const { workspace, isSample, clockOffset } = data;
  const { hackathon, team } = workspace;
  const checklist = workspace.checklist.map((item) => ({ ...item, done: checked[item.id] ?? item.done }));
  const doneCount = checklist.filter((item) => item.done).length;

  async function toggle(item) {
    const done = !item.done;
    setChecked((current) => ({ ...current, [item.id]: done }));
    try {
      await setChecklistItem(hackathon.id, item.id, done, { sample: isSample });
    } catch (toggleError) {
      setChecked((current) => ({ ...current, [item.id]: !done }));
      setToast({ type: "error", message: toggleError.message || "The checklist could not be updated." });
    }
  }

  return (
    <div className="community-library cmh-page">
      {isSample && (
        <p className="community-sample-notice" role="status">
          Showing sample data: the Community API is not available yet. Checklist changes only last until you reload. This notice only appears on the local dev server.
        </p>
      )}

      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">HACKATHON WORKSPACE{team ? ` · ${team.name.toUpperCase()}` : ""}</span>
          <h1>{hackathon.title}</h1>
        </div>
        <div className="cmh-header-actions">
          <Link to={detailsPath} className="btn btn-outline">Challenge brief</Link>
          <Link to={`${detailsPath}/submit`} className="btn btn-primary">{workspace.viewerIsLeader ? "Submit project" : "View submission"}</Link>
        </div>
      </header>

      <TimerPanel hackathon={hackathon} clockOffset={clockOffset} />

      <div className="cmh-workspace-layout">
        <div className="cmh-details-main">
          <section className="community-card" aria-labelledby="cmh-summary">
            <h2 id="cmh-summary" className="cmh-card-title">Challenge summary</h2>
            <p className="cmh-text">{workspace.summary}</p>
            {workspace.summaryTags?.length > 0 && (
              <ul className="cmh-pill-list" aria-label="Requirements">
                {workspace.summaryTags.map((tag) => <li key={tag} className="community-chip">{tag}</li>)}
              </ul>
            )}
          </section>

          <section className="community-card" aria-labelledby="cmh-checklist">
            <div className="community-card-header">
              <h2 id="cmh-checklist" className="cmh-card-title">Submission checklist</h2>
              <span className="cmh-muted" aria-live="polite">{doneCount} of {checklist.length} done</span>
            </div>
            <ul className="cmh-checklist">
              {checklist.map((item) => (
                <li key={item.id}>
                  <label className="cmh-agree">
                    <input type="checkbox" checked={item.done} onChange={() => toggle(item)} />
                    <span className={item.done ? "is-done" : undefined}>{item.label}</span>
                  </label>
                  {item.assignee && <span className="cmh-assignee"><span className="sr-only">Assigned to </span>{item.assignee}</span>}
                </li>
              ))}
            </ul>
          </section>

          <section className="community-card" aria-labelledby="cmh-announcements">
            <h2 id="cmh-announcements" className="cmh-card-title">Announcements from organisers</h2>
            {workspace.announcements.length === 0 ? (
              <p className="muted-text">No announcements yet. Updates from the organisers will appear here.</p>
            ) : (
              <ul className="community-list">
                {workspace.announcements.map((item) => {
                  const style = ANNOUNCEMENT_STYLE[item.kind] ?? ANNOUNCEMENT_STYLE.info;
                  const Icon = style.icon;
                  return (
                    <li key={item.id} className="cmh-announcement">
                      <span className={`community-icon tone-${style.tone}`}><Icon size={18} aria-hidden="true" /></span>
                      <div className="min-w-0">
                        <h3>{item.title}</h3>
                        <p>{item.body}</p>
                        <time dateTime={item.postedAt}>{timeAgo(item.postedAt)}</time>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        <aside className="cmh-details-side" aria-label="Team, resources and submission">
          {team ? (
            <section className="community-card" aria-labelledby="cmh-team">
              <h2 id="cmh-team" className="cmh-card-title cmh-title-tight">{team.name}</h2>
              <p className="cmh-muted">{team.members.length} of {team.maxSize} members</p>
              <ul className="community-list cmh-members">
                {team.members.map((member) => (
                  <li key={member.username}>
                    <span className={`community-avatar community-avatar-md ${member.isViewer ? "avatar-you" : avatarTone(member.username)}`} aria-hidden="true">{initials(member.name)}</span>
                    <Link to={`/community/u/${encodeURIComponent(member.username)}`} className="cmh-member-name">
                      <strong>{member.name}{member.isViewer && <span className="sr-only"> (you)</span>}</strong>
                      <span>{member.isLeader ? "Team leader · " : ""}{member.role}</span>
                    </Link>
                    <span className={`community-tag ${member.presence === "online" ? "tag-green" : "tag-neutral"}`}>{member.presence === "online" ? "Online" : "Away"}</span>
                  </li>
                ))}
              </ul>
              {team.members.length < team.maxSize && (
                <p className="cmh-note"><UsersRound size={15} aria-hidden="true" /> {team.maxSize - team.members.length} place{team.maxSize - team.members.length === 1 ? "" : "s"} left. Invite a teammate from <Link to="/community/collaborate">Collaborate</Link>.</p>
              )}
            </section>
          ) : (
            <section className="community-card" aria-labelledby="cmh-team">
              <h2 id="cmh-team" className="cmh-card-title cmh-title-tight">Individual entry</h2>
              <p className="cmh-muted">You're building this one on your own.</p>
            </section>
          )}

          <section className="community-card" aria-labelledby="cmh-resources">
            <h2 id="cmh-resources" className="cmh-card-title">Resources</h2>
            <ul className="cmh-resources">
              {workspace.resources.map((item) => {
                const Icon = RESOURCE_ICONS[item.kind] ?? FileText;
                return (
                  <li key={item.id}>
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      <Icon size={18} aria-hidden="true" />
                      {item.label}<span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>

          <SubmitCard workspace={workspace} detailsPath={detailsPath} clockOffset={clockOffset} />
        </aside>
      </div>

      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </div>
  );
}

function TimerPanel({ hackathon, clockOffset }) {
  const now = useServerNow(clockOffset);
  const start = new Date(hackathon.startsAt).getTime();
  const end = new Date(hackathon.endsAt).getTime();
  const remaining = Math.max(0, end - now);
  const used = Math.min(100, Math.max(0, Math.round(((now - start) / (end - start)) * 100)));
  const over = remaining === 0;
  // Screen readers hear the remaining time to the minute, not every second.
  const spoken = over ? "Time is up. Submissions are closed." : `${spokenDuration(remaining)} remaining`;

  return (
    <>
      <section className="cmh-timer" aria-label="Time remaining">
        <div className="cmh-timer-top">
          <div className="cmh-timer-main">
            <span className={`cmh-live${over ? " is-over" : ""}`}>{over ? "ENDED" : "LIVE"}</span>
            <div>
              <p className="cmh-timer-label">{over ? "Time's up" : "Time remaining"}</p>
              <p className="cmh-timer-clock" role="timer" aria-label={spoken}><span aria-hidden="true">{clockText(remaining)}</span></p>
            </div>
          </div>
          <p className="cmh-timer-dates">
            <span>Started {wat(dayDateTime, hackathon.startsAt)}</span>
            <span>Submissions close {wat(dayDateTime, hackathon.endsAt)}</span>
          </p>
        </div>
        <div className="cmh-timer-bar" role="progressbar" aria-label="Time used" aria-valuemin={0} aria-valuemax={100} aria-valuenow={used} aria-valuetext={`${used}% of time used`}>
          <span style={{ width: `${used}%` }} />
        </div>
        <div className="cmh-timer-scale" aria-hidden="true">
          <span>{timeOnly.format(new Date(start))}</span>
          <span>{used}% of time used</span>
          <span>{timeOnly.format(new Date(end))}{end - start >= 86400000 ? " tomorrow" : ""}</span>
        </div>
      </section>

      {over ? (
        <p className="cmh-alert is-closed" role="status">
          <Lock size={18} aria-hidden="true" />
          <span><strong>Submissions closed.</strong> The deadline passed at {wat(timeOnly, hackathon.endsAt)}. Results will be published in Announcements.</span>
        </p>
      ) : (
        <p className="cmh-alert">
          <CircleAlert size={18} aria-hidden="true" />
          <span><strong>Don't leave it to the last minute.</strong> Upload a draft submission early — you can update it as many times as you like until {wat(timeOnly, hackathon.endsAt)}.</span>
        </p>
      )}
    </>
  );
}

function SubmitCard({ workspace, detailsPath, clockOffset }) {
  const now = useServerNow(clockOffset, 15000);
  const over = now >= new Date(workspace.hackathon.endsAt).getTime();
  const { status } = workspace.submission ?? {};
  const team = Boolean(workspace.team);

  return (
    <section className="community-card cmh-ready" aria-labelledby="cmh-ready">
      <h2 id="cmh-ready" className="cmh-card-title cmh-title-tight">
        {status === "submitted" ? "Project submitted" : "Ready to submit?"}
      </h2>
      <p className="cmh-note">
        {status === "submitted"
          ? `Your submission is in. ${over ? "Judging starts now." : "You can still update it until the deadline."}`
          : team
            ? "Only the team leader can submit. You can update your submission until the deadline."
            : "You can update your submission until the deadline."}
        {status === "draft" && " A draft is saved."}
      </p>
      {over ? (
        <button type="button" className="btn btn-primary cmh-block" disabled>Submissions closed</button>
      ) : (
        <Link to={`${detailsPath}/submit`} className="btn btn-primary cmh-block">
          {status === "submitted" ? "Update submission" : "Go to submission"}
        </Link>
      )}
    </section>
  );
}

function WorkspaceUnavailable({ message, detailsPath, onRetry }) {
  return (
    <div className="community-library cmh-page">
      <Link to={detailsPath} className="cmh-back"><ArrowLeft size={17} aria-hidden="true" /> Hackathon details</Link>
      <div className="community-card community-empty">
        <span className="community-icon tone-amber"><Lock size={22} aria-hidden="true" /></span>
        <h1 className="cmh-empty-title">The workspace isn't open to you</h1>
        <p className="muted-text">{message}</p>
        <p className="muted-text">The workspace is only for registered participants while the hackathon is live.</p>
        <div className="cmh-header-actions">
          <Link to={detailsPath} className="btn btn-primary">View hackathon</Link>
          <button type="button" className="btn btn-outline" onClick={onRetry}>Try again</button>
        </div>
      </div>
    </div>
  );
}
