import { useCallback, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, CircleAlert, CircleCheck } from "lucide-react";

import CategoryIcon from "../../../features/community/competitions/CategoryIcon";
import Loader from "../../../components/common/Loader";
import Modal from "../../../components/common/Modal";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import Toast from "../../../components/feedback/Toast";
import CompetitionSteps from "../../../features/community/competitions/CompetitionSteps";
import { getCompetition, registerForCompetition } from "../../../features/community/competitions/competitionService";
import {
  competitionPath,
  formatDate,
  formatDateTime,
  formatNumber,
  formatUsd,
  isFull,
  isRegistrationOpen,
  placesLeft,
} from "../../../features/community/competitions/competitionFormat";
import { useCommunityList } from "../../../features/community/listHooks";
import { useAuth } from "../../../hooks/useAuth";

const COUNT_WORDS = ["no", "one", "both", "all three", "all four", "all five", "all six"];
const countWord = (count) => COUNT_WORDS[count] ?? `all ${count}`;

// S17 Competition Registration: /community/competitions/:id/register
export default function CompetitionRegistration() {
  const { id } = useParams();
  const { data, error, loading, reload } = useCommunityList(getCompetition, { id });

  if (loading) return <Loader label="Loading registration…" />;
  if (error) {
    return (
      <div className="cmc-page">
        <Link to={competitionPath(id)} className="cmc-back"><ArrowLeft size={17} aria-hidden="true" /> Back to competition</Link>
        <ErrorMessage message={error} onRetry={reload} />
      </div>
    );
  }
  // Keyed by id so the ticks reset if the student moves to another competition.
  return <RegistrationForm key={data.competition.id} competition={data.competition} sample={Boolean(data.isSample)} />;
}

function RegistrationForm({ competition, sample }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const path = competitionPath(competition.id);
  const free = !competition.entryFeeUsd;

  const items = [
    ...competition.checklist,
    { label: `I will submit before ${formatDateTime(competition.submissionDeadline)}`, hint: "Late submissions are not accepted by the system." },
  ];
  const [checks, setChecks] = useState(() => items.map(() => false));
  const [acceptedRules, setAcceptedRules] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [sending, setSending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);
  const closeRules = useCallback(() => setRulesOpen(false), []);
  const summaryRef = useRef(null);

  const ticked = checks.filter(Boolean).length;
  const complete = ticked === items.length && acceptedRules;
  const viewer = { ...competition.viewer };
  const fullName = viewer.fullName || user?.fullName || user?.name || "";
  const email = viewer.email || user?.email || "";

  if (confirmed || competition.viewerRegistered) {
    return (
      <div className="cmc-page">
        <PageHeading competition={competition} free={free} />
        {sample && <SampleNotice />}
        <CompetitionSteps current={3} free={free} complete />
        <section className="community-card cmc-result-card is-success" aria-labelledby="cmc-confirmed">
          <span className="cmc-result-icon"><CircleCheck size={30} aria-hidden="true" /></span>
          <h2 id="cmc-confirmed">Registration confirmed</h2>
          <p>
            You're registered for {competition.title}. Submit your entry before {formatDateTime(competition.submissionDeadline)}.
            {competition.viewerRegistration?.receiptNumber ? ` Receipt ${competition.viewerRegistration.receiptNumber}.` : ""}
          </p>
          <div className="cmc-result-actions">
            <Link to={path} className="btn btn-primary">Back to competition</Link>
            <Link to="/community/activities?tab=competitions" className="btn btn-outline">My registrations</Link>
          </div>
        </section>
        <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
      </div>
    );
  }

  const blocked = competition.status === "results" ? "Results for this competition are already published."
    : !isRegistrationOpen(competition) ? "Registration has closed for this competition."
      : isFull(competition) ? "This competition is full." : "";
  if (blocked) {
    return (
      <div className="cmc-page">
        <PageHeading competition={competition} free={free} />
        <section className="community-card community-empty">
          <span className="community-icon tone-amber"><CircleAlert size={22} aria-hidden="true" /></span>
          <h2>You can't register right now</h2>
          <p className="muted-text">{blocked}</p>
          <Link to={path} className="btn btn-outline">Back to competition</Link>
        </section>
      </div>
    );
  }

  function toggle(index) {
    setChecks((current) => current.map((value, position) => (position === index ? !value : value)));
  }

  async function submit(event) {
    event.preventDefault();
    if (!complete) {
      setShowErrors(true);
      window.requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    const confirmations = items.map((_, index) => index);
    if (!free) {
      navigate(`${path}/checkout`, { state: { acceptedRules: true, confirmations } });
      return;
    }
    setSending(true);
    try {
      await registerForCompetition(competition.id, { confirmations }, { sample });
      setConfirmed(true);
      setToast({ type: "success", message: `You're registered for ${competition.title}.` });
    } catch (submitError) {
      setToast({ type: "error", message: submitError.message || "Your registration could not be saved. Please try again." });
    } finally {
      setSending(false);
    }
  }

  const missing = [
    ...items.map((item, index) => (!checks[index] ? { id: `cmc-check-${index}`, label: item.label } : null)).filter(Boolean),
    ...(!acceptedRules ? [{ id: "cmc-accept-rules", label: "Agree to the competition rules" }] : []),
  ];
  const hint = ticked < items.length
    ? `Tick ${countWord(items.length)} requirements to continue.`
    : "Agree to the competition rules to continue.";

  return (
    <form className="cmc-page" onSubmit={submit} noValidate>
      <PageHeading competition={competition} free={free} />
      {sample && <SampleNotice />}
      <CompetitionSteps current={1} free={free} />

      {showErrors && missing.length > 0 && (
        <div className="community-error-summary" role="alert" tabIndex={-1} ref={summaryRef}>
          <strong>Before you continue:</strong>
          <ul>
            {missing.map((item) => <li key={item.id}><a href={`#${item.id}`}>{item.label}</a></li>)}
          </ul>
        </div>
      )}

      <div className="cmc-layout">
        <div className="cmc-main">
          <fieldset className="community-card cmc-section cmc-fieldset">
            <legend className="cmc-legend"><h2>Before you register</h2></legend>
            <p className="cmc-section-intro">Tick each item to confirm you can meet it. You need {countWord(items.length)} to continue.</p>
            <div className="cmc-checklist">
              {items.map((item, index) => {
                const invalid = showErrors && !checks[index];
                return (
                  <label key={item.label} className={`cmc-check${checks[index] ? " is-checked" : ""}${invalid ? " is-invalid" : ""}`} htmlFor={`cmc-check-${index}`}>
                    <input
                      id={`cmc-check-${index}`}
                      type="checkbox"
                      checked={checks[index]}
                      onChange={() => toggle(index)}
                      aria-describedby={`cmc-check-hint-${index}`}
                      aria-invalid={invalid || undefined}
                    />
                    <span>
                      <strong>{item.label}</strong>
                      <span id={`cmc-check-hint-${index}`}>{item.hint}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          <section className="community-card cmc-section" aria-labelledby="cmc-details">
            <div className="cmc-section-head">
              <h2 id="cmc-details">Your details</h2>
              <Link to="/profile" className="text-link">Edit in profile</Link>
            </div>
            <p className="cmc-section-intro">These come from your CodeRise account and appear on certificates and results.</p>
            <div className="community-field-grid cmc-details-grid">
              <ReadOnlyField id="cmc-full-name" label="Full name" value={fullName} />
              <ReadOnlyField id="cmc-email" label="Email address" value={email} />
              <ReadOnlyField id="cmc-display-name" label="Display name in results" value={viewer.displayName || fullName} />
              <ReadOnlyField id="cmc-country" label="Country" value={viewer.country || "Not set"} />
            </div>
          </section>

          <div className="community-card cmc-section">
            <div className={`cmc-accept${acceptedRules ? " is-checked" : ""}${showErrors && !acceptedRules ? " is-invalid" : ""}`}>
              <input
                id="cmc-accept-rules"
                type="checkbox"
                checked={acceptedRules}
                onChange={(event) => setAcceptedRules(event.target.checked)}
                aria-invalid={(showErrors && !acceptedRules) || undefined}
              />
              <label htmlFor="cmc-accept-rules">
                I have read and agree to the competition rules. I understand that copied work is disqualified{free ? "." : " and the entry fee is not refunded in that case."}
              </label>
            </div>
            <button type="button" className="community-link-button cmc-rules-button" onClick={() => setRulesOpen(true)}>Read the competition rules</button>
          </div>
        </div>

        <aside className="cmc-side" aria-label="Registration summary">
          <section className="community-card" aria-labelledby="cmc-summary-title">
            <div className="cmc-mini">
              <span className="cmc-mini-icon"><CategoryIcon category={competition.category} size={20} /></span>
              <div className="min-w-0">
                <h2 id="cmc-summary-title">{competition.title}</h2>
                <p>{competition.category} · {competition.format}</p>
              </div>
            </div>
            <dl className="cmc-facts">
              <div><dt>Entry fee</dt><dd>{free ? "Free" : formatUsd(competition.entryFeeUsd)}</dd></div>
              <div><dt>Places left</dt><dd>{formatNumber(placesLeft(competition))} of {formatNumber(competition.capacity)}</dd></div>
              <div><dt>Registration closes</dt><dd>{formatDate(competition.registrationClosesAt)}</dd></div>
            </dl>
            <button type="submit" className="btn btn-primary btn-full cmc-submit" disabled={sending} aria-describedby={complete ? undefined : "cmc-hint"}>
              {sending ? "Registering…" : free ? "Confirm registration" : "Continue to payment"} {!sending && <ArrowRight size={17} aria-hidden="true" />}
            </button>
            {!complete && (
              <p className="cmc-warning" id="cmc-hint"><CircleAlert size={16} aria-hidden="true" /> {hint}</p>
            )}
          </section>

          <section className="community-card" aria-labelledby="cmc-next">
            <h2 className="community-side-title" id="cmc-next">What happens next</h2>
            <ol className="cmc-next">
              {free ? (
                <>
                  <li>You confirm your registration. Entry is free.</li>
                  <li>Your place is saved straight away.</li>
                  <li>Competition materials unlock and you can submit before the deadline.</li>
                </>
              ) : (
                <>
                  <li>You pay securely in USD.</li>
                  <li>We verify the payment on our side, usually in seconds.</li>
                  <li>Your place is confirmed and competition materials unlock.</li>
                </>
              )}
            </ol>
          </section>
        </aside>
      </div>

      <Modal open={rulesOpen} onClose={closeRules} title="Competition rules" description={competition.title}>
        <ul className="cmc-rules cmc-rules-modal">
          {competition.rules.map((rule) => <li key={rule}><CircleCheck size={18} aria-hidden="true" /> <span>{rule}</span></li>)}
        </ul>
        <div className="cmc-result-actions">
          <button type="button" className="btn btn-primary" onClick={closeRules}>Close</button>
        </div>
      </Modal>

      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </form>
  );
}

function PageHeading({ competition, free }) {
  return (
    <>
      <Link to={competitionPath(competition.id)} className="cmc-back"><ArrowLeft size={17} aria-hidden="true" /> Back to competition</Link>
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">COMPETITION REGISTRATION</span>
          <h1>Register for {competition.title}</h1>
          <p>
            {free
              ? "Review the requirements, confirm your details and register. Entry is free."
              : `Review the requirements, confirm your details, then pay the ${formatUsd(competition.entryFeeUsd)} entry fee to secure your place.`}
          </p>
        </div>
      </header>
    </>
  );
}

function ReadOnlyField({ id, label, value }) {
  return (
    <div className="community-field">
      <label htmlFor={id} className="cmc-field-label">{label}</label>
      <input id={id} className="ui-input cmc-readonly" value={value} readOnly />
    </div>
  );
}

function SampleNotice() {
  return (
    <p className="community-sample-notice" role="status">
      Showing sample data: the Community API is not available yet. Registrations only change on screen. This notice only appears on the local dev server.
    </p>
  );
}
