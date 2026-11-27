import { useCallback, useId, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Award,
  Check,
  CircleCheck,
  Clock,
  Crown,
  Lock,
  Medal,
  Share2,
  Trophy,
  UserRound,
  Zap,
} from "lucide-react";

import Loader from "../../../components/common/Loader";
import Modal from "../../../components/common/Modal";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import Toast from "../../../components/feedback/Toast";
import Countdown from "../../../features/community/Countdown";
import { useCommunityList } from "../../../features/community/listHooks";
import { getHackathon, registerForHackathon, withdrawFromHackathon } from "../../../features/community/hackathons/hackathonService";
import {
  dayDateTime,
  fullDateTime,
  initials,
  numberFormat,
  shortDate,
  useServerNow,
  wat,
} from "../../../features/community/hackathons/hackathonUtils";

const PRIZE_ICONS = { 1: Trophy, 2: Medal, 3: Award };

export default function HackathonDetails() {
  const { id = "" } = useParams();
  const { data, error, loading, reload } = useCommunityList(getHackathon, { id });
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);

  if (loading) return <Loader label="Loading hackathon…" />;
  if (error && !data) {
    return (
      <div className="community-library cmh-page">
        <BackLink />
        <ErrorMessage message={error} onRetry={reload} />
      </div>
    );
  }
  if (!data) return null;

  const { hackathon, isSample, clockOffset } = data;

  async function share() {
    const url = `${window.location.origin}/community/hackathons/${encodeURIComponent(hackathon.id)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: hackathon.title, text: hackathon.tagline, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setToast({ type: "success", message: "Link copied." });
    } catch (shareError) {
      if (shareError?.name !== "AbortError") setToast({ type: "error", message: "The link could not be copied." });
    }
  }

  return (
    <div className="community-library cmh-page">
      <BackLink />

      {isSample && (
        <p className="community-sample-notice" role="status">
          Showing sample data: the Community API is not available yet. Registering only changes this screen until you reload. This notice only appears on the local dev server.
        </p>
      )}

      <Hero hackathon={hackathon} onShare={share} />

      <div className="cmh-details-layout">
        <div className="cmh-details-action">
          <ActionCard key={hackathon.viewerRegistration ? "registered" : "open"} hackathon={hackathon} clockOffset={clockOffset} sample={isSample} onChanged={reload} onToast={setToast} />
        </div>

        <div className="cmh-details-main">
          {hackathon.results && <Results hackathon={hackathon} />}

          <section className="community-card" aria-labelledby="cmh-challenge">
            <h2 id="cmh-challenge" className="cmh-card-title">The challenge</h2>
            <p className="cmh-text">{hackathon.challenge.summary}</p>
            {hackathon.challenge.ideas?.length > 0 && (
              <ul className="cmh-ideas" aria-label="Ideas to get you started">
                {hackathon.challenge.ideas.map((idea) => (
                  <li key={idea.title}>
                    <strong>{idea.title}</strong>
                    <span>{idea.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="community-card" aria-labelledby="cmh-rules">
            <h2 id="cmh-rules" className="cmh-card-title">Rules</h2>
            <ol className="cmh-rules">
              {hackathon.rules.map((rule) => <li key={rule}>{rule}</li>)}
            </ol>
          </section>

          <section className="community-card" aria-labelledby="cmh-criteria">
            <h2 id="cmh-criteria" className="cmh-card-title">Evaluation criteria</h2>
            <ul className="cmh-criteria">
              {hackathon.criteria.map((item) => (
                <li key={item.name}>
                  <span className="cmh-criteria-row">
                    <span>{item.name}</span>
                    <strong>{item.weight}%</strong>
                  </span>
                  <span className="cmh-bar" role="progressbar" aria-label={`${item.name} weight`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={item.weight}>
                    <span style={{ width: `${item.weight}%` }} />
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="community-card" aria-labelledby="cmh-instructions">
            <h2 id="cmh-instructions" className="cmh-card-title">Submission instructions</h2>
            <ul className="cmh-checks">
              {hackathon.submissionInstructions.map((item) => (
                <li key={item}><Check size={18} aria-hidden="true" />{item}</li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="cmh-details-side" aria-label="Prizes and organiser">
          <section className="community-card" aria-labelledby="cmh-prizes">
            <h2 id="cmh-prizes" className="cmh-card-title">Prizes</h2>
            <ul className="cmh-prizes">
              {hackathon.prizes.map((prize) => {
                const Icon = PRIZE_ICONS[prize.place] ?? Award;
                return (
                  <li key={prize.place} className={`cmh-prize place-${prize.place}`}>
                    <span className="cmh-prize-icon" aria-hidden="true"><Icon size={20} /></span>
                    <span className="min-w-0">
                      <strong>{prize.title}</strong>
                      <span>{prize.details}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="cmh-note">{hackathon.participationReward}</p>
          </section>

          <section className="community-card" aria-labelledby="cmh-organiser">
            <h2 id="cmh-organiser" className="cmh-card-title">Organiser</h2>
            <div className="cmh-organiser">
              <span className="community-avatar community-avatar-md avatar-you" aria-hidden="true">{initials(hackathon.organiser.name)}</span>
              <span className="min-w-0">
                <strong>{hackathon.organiser.name}</strong>
                {hackathon.organiser.judges?.length > 0 && <span>Judges: {hackathon.organiser.judges.join(", ")}</span>}
              </span>
            </div>
          </section>
        </aside>
      </div>

      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </div>
  );
}

function BackLink() {
  return (
    <Link to="/community/hackathons" className="cmh-back"><ArrowLeft size={17} aria-hidden="true" /> All hackathons</Link>
  );
}

function Hero({ hackathon, onShare }) {
  const premium = hackathon.access === "premium";
  return (
    <section className="cmh-hero" aria-labelledby="cmh-title">
      <div className="cmh-hero-top">
        <ul className="cmh-hero-tags" aria-label="About this hackathon">
          <li>{hackathon.category}</li>
          <li>24-hour challenge</li>
          <li>{hackathon.format}</li>
          <li className={premium ? "is-premium" : "is-free"}>{premium ? <><Crown size={12} aria-hidden="true" /> Premium</> : "Free entry"}</li>
        </ul>
        <button type="button" className="cmh-hero-share" onClick={onShare} aria-label="Share this hackathon">
          <Share2 size={18} aria-hidden="true" />
        </button>
      </div>
      <p className="cmh-hero-eyebrow">CODERISE HACKATHON{hackathon.monthLabel ? ` · ${hackathon.monthLabel.toUpperCase()}` : ""}</p>
      <h1 id="cmh-title">{hackathon.title}</h1>
      <p className="cmh-hero-tagline">{hackathon.tagline}</p>
      <dl className="cmh-hero-dates">
        <div><dt>Starts</dt><dd>{wat(fullDateTime, hackathon.startsAt)}</dd></div>
        <div><dt>Ends</dt><dd>{wat(fullDateTime, hackathon.endsAt)}</dd></div>
        {hackathon.status === "upcoming" && <div><dt>Registration closes</dt><dd>{wat(dayDateTime, hackathon.registrationClosesAt)}</dd></div>}
        {hackathon.status !== "upcoming" && <div><dt>Results</dt><dd>{hackathon.results ? "Published" : `By ${shortDate.format(new Date(hackathon.resultsAt))}`}</dd></div>}
      </dl>
    </section>
  );
}

function RegisteredCount({ hackathon }) {
  return (
    <p className="cmh-count">
      <UserRound size={16} aria-hidden="true" />
      {numberFormat.format(hackathon.registeredCount)} students registered
      {hackathon.teamsCount ? ` · ${numberFormat.format(hackathon.teamsCount)} teams` : ""}
    </p>
  );
}

function ActionCard({ hackathon, clockOffset, sample, onChanged, onToast }) {
  const now = useServerNow(clockOffset, 30000);
  const { status, viewerRegistration: registration } = hackathon;
  const base = `/community/hackathons/${encodeURIComponent(hackathon.id)}`;

  if (status === "live") {
    return (
      <section className="community-card cmh-action" aria-labelledby="cmh-action-title">
        <h2 id="cmh-action-title" className="cmh-action-label"><span className="community-tag tag-red"><span className="community-live-dot" aria-hidden="true" />Live now</span> Ends in</h2>
        <Countdown target={hackathon.endsAt} doneLabel="Ended" />
        <RegisteredCount hackathon={hackathon} />
        {registration ? (
          <>
            <p className="community-registered"><CircleCheck size={17} aria-hidden="true" /> {registration.teamName ? `Registered with ${registration.teamName}` : "You're registered"}</p>
            <Link to={`${base}/workspace`} className="btn btn-primary cmh-block">Open workspace</Link>
            <Link to={`${base}/submit`} className="btn btn-outline cmh-block">Go to submission</Link>
          </>
        ) : (
          <p className="cmh-note">Registration closed when the hackathon started. Results will be published by {shortDate.format(new Date(hackathon.resultsAt))}.</p>
        )}
      </section>
    );
  }

  if (status === "past") {
    return (
      <section className="community-card cmh-action" aria-labelledby="cmh-action-title">
        <h2 id="cmh-action-title" className="cmh-card-title">{hackathon.results ? "Results published" : "Judging in progress"}</h2>
        <p className="cmh-note">Ended {wat(fullDateTime, hackathon.endsAt)}.</p>
        <RegisteredCount hackathon={hackathon} />
        {hackathon.results ? (
          <>
            <p className="cmh-winner"><Trophy size={18} aria-hidden="true" /> Winner: <strong>{hackathon.results[0].name}</strong></p>
            <a href="#cmh-results" className="btn btn-primary cmh-block">See full results</a>
          </>
        ) : (
          <p className="cmh-note">Results will be published by {shortDate.format(new Date(hackathon.resultsAt))}. We'll notify every participant.</p>
        )}
      </section>
    );
  }

  // Upcoming
  const registrationOpen = hackathon.registrationOpen && now < new Date(hackathon.registrationClosesAt).getTime();
  const locked = hackathon.access === "premium" && !hackathon.viewerHasPremium;

  return (
    <section className="community-card cmh-action" aria-labelledby="cmh-action-title">
      <h2 id="cmh-action-title" className="cmh-action-label">Starts in</h2>
      <Countdown target={hackathon.startsAt} doneLabel="Started" />
      <RegisteredCount hackathon={hackathon} />
      {registration ? (
        <Registered hackathon={hackathon} now={now} sample={sample} onChanged={onChanged} onToast={onToast} />
      ) : locked ? (
        <div className="cmh-locked">
          <span className="community-icon tone-purple"><Lock size={20} aria-hidden="true" /></span>
          <p>This is a Premium hackathon. Upgrade to register, plus every Premium project and team brief.</p>
          <Link to="/premium" className="btn community-btn-premium cmh-block">See Premium plans</Link>
        </div>
      ) : registrationOpen ? (
        <RegisterForm hackathon={hackathon} sample={sample} onChanged={onChanged} onToast={onToast} />
      ) : (
        <p className="cmh-note">Registration has closed. The hackathon starts {wat(dayDateTime, hackathon.startsAt)}.</p>
      )}
    </section>
  );
}

function RegisterForm({ hackathon, sample, onChanged, onToast }) {
  const team = hackathon.participation === "team";
  const [mode, setMode] = useState(team ? "team" : "individual");
  const [teamName, setTeamName] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const uid = useId();

  async function submit(event) {
    event.preventDefault();
    const next = {};
    const name = teamName.trim();
    if (mode === "team" && name.length < 3) next.teamName = "Give your team a name of at least 3 characters.";
    else if (mode === "team" && name.length > 40) next.teamName = "Team names can be up to 40 characters.";
    if (!agreed) next.agreed = "Agree to the rules and code of conduct to register.";
    setErrors(next);
    setFormError("");
    if (Object.keys(next).length) {
      document.getElementById(`${uid}-${next.teamName ? "team" : "agree"}`)?.focus();
      return;
    }
    setSending(true);
    try {
      await registerForHackathon(hackathon.id, { mode, teamName: mode === "team" ? name : "" }, { sample });
      onToast({ type: "success", message: `You're registered for ${hackathon.title}.` });
      onChanged();
    } catch (error) {
      setFormError(error.message || "Your registration could not be saved. Please try again.");
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="cmh-register" onSubmit={submit} noValidate>
      {team && (
        <fieldset className="community-fieldset">
          <legend>How are you taking part?</legend>
          <label className="community-radio">
            <input type="radio" name={`${uid}-mode`} value="team" checked={mode === "team"} onChange={() => setMode("team")} />
            Register a team ({hackathon.teamSize.min}–{hackathon.teamSize.max} people) as its leader
          </label>
          <label className="community-radio">
            <input type="radio" name={`${uid}-mode`} value="match" checked={mode === "match"} onChange={() => { setMode("match"); setErrors((current) => ({ ...current, teamName: undefined })); }} />
            Register alone and be matched with a team
          </label>
        </fieldset>
      )}
      {mode === "team" && (
        <div className="community-field">
          <label htmlFor={`${uid}-team`} className="cmh-label">Team name</label>
          <input
            id={`${uid}-team`}
            className="ui-input"
            value={teamName}
            maxLength={40}
            autoComplete="off"
            placeholder="e.g. Team Byte"
            aria-invalid={Boolean(errors.teamName)}
            aria-describedby={errors.teamName ? `${uid}-team-error` : `${uid}-team-hint`}
            onChange={(event) => setTeamName(event.target.value)}
          />
          {errors.teamName
            ? <p id={`${uid}-team-error`} className="field-error">{errors.teamName}</p>
            : <p id={`${uid}-team-hint`} className="community-field-hint">You'll invite teammates from your team workspace.</p>}
        </div>
      )}
      <div>
        <label className="cmh-agree">
          <input
            id={`${uid}-agree`}
            type="checkbox"
            checked={agreed}
            aria-invalid={Boolean(errors.agreed)}
            aria-describedby={errors.agreed ? `${uid}-agree-error` : undefined}
            onChange={(event) => setAgreed(event.target.checked)}
          />
          <span>I have read the rules and agree to the code of conduct</span>
        </label>
        {errors.agreed && <p id={`${uid}-agree-error`} className="field-error">{errors.agreed}</p>}
      </div>
      {formError && <p className="field-error" role="alert">{formError}</p>}
      <button type="submit" className="btn btn-primary cmh-block" disabled={sending}>
        {sending ? "Registering…" : mode === "team" ? "Register your team" : "Register for this hackathon"}
      </button>
      <p className="cmh-small">
        {hackathon.access === "premium" ? "Premium" : "Free"} · You can withdraw until {shortDate.format(new Date(hackathon.withdrawUntil))}
      </p>
      {mode === "match" && <p className="cmh-small">No team yet? <Link to="/community/collaborate">Find teammates in Collaborate</Link>.</p>}
    </form>
  );
}

function Registered({ hackathon, now, sample, onChanged, onToast }) {
  const registration = hackathon.viewerRegistration;
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const canWithdraw = now < new Date(hackathon.withdrawUntil).getTime();
  const closeDialog = useCallback(() => { setConfirming(false); setError(""); }, []);

  async function withdraw() {
    setSending(true);
    setError("");
    try {
      await withdrawFromHackathon(hackathon.id, { sample });
      setConfirming(false);
      onToast({ type: "success", message: `You've withdrawn from ${hackathon.title}.` });
      onChanged();
    } catch (withdrawError) {
      setError(withdrawError.message || "We couldn't withdraw you. Please try again.");
    } finally {
      setSending(false);
    }
  }

  const detail = registration.mode === "match"
    ? "We'll match you with a team before the start. Check your notifications."
    : registration.mode === "team"
      ? `${registration.teamName}${registration.isLeader ? " · You're the team leader" : ""}`
      : "Individual entry";

  return (
    <div className="cmh-registered">
      <p className="community-registered"><CircleCheck size={17} aria-hidden="true" /> You're registered</p>
      <p className="cmh-note">{detail}</p>
      <p className="cmh-note"><Clock size={15} aria-hidden="true" /> The workspace opens {wat(dayDateTime, hackathon.startsAt)}.</p>
      {canWithdraw && (
        <button type="button" className="btn btn-outline btn-sm cmh-block" onClick={() => setConfirming(true)}>Withdraw</button>
      )}
      <Modal open={confirming} onClose={closeDialog} title="Withdraw from this hackathon?" description={registration.mode === "team" && registration.isLeader ? `${registration.teamName} will be removed too. Your teammates will be told.` : "Your place will be released. You can register again while registration is open."}>
        {error && <p className="field-error" role="alert">{error}</p>}
        <div className="cmh-dialog-actions">
          <button type="button" className="btn btn-outline" onClick={closeDialog}>Cancel</button>
          <button type="button" className="btn community-btn-danger" onClick={withdraw} disabled={sending}>{sending ? "Withdrawing…" : "Withdraw"}</button>
        </div>
      </Modal>
    </div>
  );
}

function Results({ hackathon }) {
  const team = hackathon.participation === "team";
  return (
    <section className="community-card" id="cmh-results" aria-labelledby="cmh-results-title">
      <div className="community-card-header">
        <h2 id="cmh-results-title" className="cmh-card-title">Results</h2>
        <span className="community-tag tag-green"><Zap size={12} aria-hidden="true" /> Published</span>
      </div>
      <div className="community-table-wrap" tabIndex={0} role="region" aria-label="Hackathon results (scrolls sideways)">
        <table className="community-table cmh-results-table">
          <thead>
            <tr>
              <th scope="col">Rank</th>
              <th scope="col">{team ? "Team" : "Participant"}</th>
              <th scope="col">Project</th>
              <th scope="col">Score</th>
            </tr>
          </thead>
          <tbody>
            {hackathon.results.map((row) => (
              <tr key={row.rank} className={row.isViewer ? "is-viewer" : undefined}>
                <td className="community-table-rank">#{row.rank}</td>
                <th scope="row">{row.name}{row.isViewer && <span className="community-tag tag-blue cmh-you">You</span>}</th>
                <td>{row.project}</td>
                <td><strong>{row.score}</strong>/100</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="cmh-note">Judged on the criteria below. Certificates and points have been added to every participant's profile.</p>
    </section>
  );
}
