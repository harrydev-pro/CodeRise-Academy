import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Award, Check, CircleCheck, Star, Trophy } from "lucide-react";

import CategoryIcon from "../../../features/community/competitions/CategoryIcon";
import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import { getCompetition } from "../../../features/community/competitions/competitionService";
import {
  competitionPath,
  daysUntil,
  formatDate,
  formatDateTime,
  formatNumber,
  formatRange,
  formatUsd,
  isFull,
  isRegistrationOpen,
  placesLeft,
  REQUIREMENT_ICONS,
} from "../../../features/community/competitions/competitionFormat";
import { useCommunityList } from "../../../features/community/listHooks";

const PRIZE_STYLE = {
  1: { icon: Trophy, tone: "amber" },
  2: { icon: Award, tone: "slate" },
  3: { icon: Award, tone: "orange" },
  mention: { icon: Star, tone: "blue" },
};

// S16 Competition Details: /community/competitions/:id
export default function CompetitionDetails() {
  const { id } = useParams();
  const { data, error, loading, reload } = useCommunityList(getCompetition, { id });

  if (loading) return <Loader label="Loading competition…" />;
  if (error) {
    return (
      <div className="cmc-page">
        <BackLink />
        <ErrorMessage message={error} onRetry={reload} />
      </div>
    );
  }

  const { competition } = data;
  const free = !competition.entryFeeUsd;

  return (
    <div className="cmc-page">
      <BackLink />

      {data.isSample && (
        <p className="community-sample-notice" role="status">
          Showing sample data: the Community API is not available yet. This notice only appears on the local dev server.
        </p>
      )}

      <section className="community-card cmc-hero" aria-labelledby="cmc-title">
        <div className="cmc-hero-top">
          <span className="cmc-hero-icon"><CategoryIcon category={competition.category} size={30} /></span>
          <div className="min-w-0">
            <div className="community-tags">
              <span className="community-tag tag-blue">{competition.category}</span>
              <StatusTag competition={competition} />
              <span className="community-tag tag-neutral">{competition.format} entry</span>
            </div>
            <span className="eyebrow">CODERISE COMPETITION · #{competition.number}</span>
            <h1 id="cmc-title">{competition.title}</h1>
            <p>{competition.summary}</p>
          </div>
        </div>
        <dl className="cmc-hero-facts">
          <div>
            <dt>Entry fee</dt>
            <dd>{free ? "Free" : <>{formatUsd(competition.entryFeeUsd)} <small>USD</small></>}</dd>
          </div>
          <div>
            <dt>Registration closes</dt>
            <dd>{formatDateTime(competition.registrationClosesAt)}</dd>
          </div>
          <div>
            <dt>Submission deadline</dt>
            <dd>{formatDateTime(competition.submissionDeadline)}</dd>
          </div>
          <div>
            <dt>Winners announced</dt>
            <dd>{formatDate(competition.winnersAnnouncedAt)}</dd>
          </div>
        </dl>
      </section>

      <div className="cmc-layout">
        <div className="cmc-main">
          <section className="community-card cmc-section" aria-labelledby="cmc-about">
            <h2 id="cmc-about">About this competition</h2>
            <p className="cmc-body-text">{competition.description}</p>
          </section>

          <section className="community-card cmc-section" aria-labelledby="cmc-rules" id="competition-rules">
            <h2 id="cmc-rules">Rules</h2>
            <ul className="cmc-rules">
              {competition.rules.map((rule) => (
                <li key={rule}><Check size={18} aria-hidden="true" /> <span>{rule}</span></li>
              ))}
            </ul>
          </section>

          <section className="community-card cmc-section" aria-labelledby="cmc-criteria">
            <h2 id="cmc-criteria">Evaluation criteria</h2>
            <ul className="cmc-criteria">
              {competition.criteria.map((criterion) => (
                <li key={criterion.label}>
                  <div className="cmc-criteria-head">
                    <span>{criterion.label}</span>
                    <strong>{criterion.weight}%</strong>
                  </div>
                  <div className="community-progress community-progress-wide community-progress-gradient cmc-bar" aria-hidden="true">
                    <span style={{ width: `${criterion.weight}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="community-card cmc-section" aria-labelledby="cmc-requirements">
            <h2 id="cmc-requirements">Submission requirements</h2>
            <ul className="community-list cmc-requirements">
              {competition.requirements.map((item) => {
                const ItemIcon = REQUIREMENT_ICONS[item.icon] ?? REQUIREMENT_ICONS.file;
                return (
                  <li key={item.title}>
                    <span className="cmc-requirement-icon"><ItemIcon size={18} aria-hidden="true" /></span>
                    <div className="min-w-0">
                      <strong>{item.title}</strong>
                      <span>{item.detail}</span>
                    </div>
                    {item.required
                      ? <span className="community-tag tag-red">Required</span>
                      : <span className="community-tag tag-neutral">Optional</span>}
                  </li>
                );
              })}
            </ul>
          </section>
        </div>

        <aside className="cmc-side" aria-label="Registration and prizes">
          <RegistrationCard competition={competition} />

          <section className="community-card" aria-labelledby="cmc-prizes">
            <h2 className="community-side-title" id="cmc-prizes">Prizes</h2>
            <ul className="community-list cmc-prizes">
              {competition.prizes.map((prize) => {
                const style = PRIZE_STYLE[prize.place] ?? PRIZE_STYLE.mention;
                const PrizeIcon = style.icon;
                return (
                  <li key={prize.title}>
                    <span className={`community-icon tone-${style.tone}`}><PrizeIcon size={18} aria-hidden="true" /></span>
                    <div className="min-w-0">
                      <strong>{prize.title}</strong>
                      <span>{prize.reward}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="community-card" aria-labelledby="cmc-dates">
            <h2 className="community-side-title" id="cmc-dates">Key dates</h2>
            <dl className="cmc-facts">
              <div><dt>Registration opens</dt><dd>{formatDate(competition.registrationOpensAt)}</dd></div>
              <div><dt>Registration closes</dt><dd>{formatDate(competition.registrationClosesAt)}</dd></div>
              <div><dt>Submission deadline</dt><dd>{formatDate(competition.submissionDeadline)}</dd></div>
              <div><dt>Judging</dt><dd>{formatRange(competition.judgingStartsAt, competition.judgingEndsAt)}</dd></div>
              <div><dt>Winners announced</dt><dd>{formatDate(competition.winnersAnnouncedAt)}</dd></div>
            </dl>
            <p className="cmc-small-note">All times are West Africa Time (WAT).</p>
          </section>
        </aside>
      </div>
    </div>
  );
}

function BackLink() {
  return (
    <Link to="/community/competitions" className="cmc-back">
      <ArrowLeft size={17} aria-hidden="true" /> All competitions
    </Link>
  );
}

function StatusTag({ competition }) {
  if (competition.status === "results") return <span className="community-tag tag-neutral">Results published</span>;
  if (competition.status === "closed") return <span className="community-tag tag-neutral">Registration closed</span>;
  if (isFull(competition)) return <span className="community-tag tag-neutral">Full</span>;
  if (competition.status === "closing_soon") return <span className="community-tag tag-amber">Closing soon</span>;
  return <span className="community-tag tag-amber">Registration open</span>;
}

function daysLeftText(iso) {
  const days = daysUntil(iso);
  if (days === null || days < 0) return null;
  if (days <= 1) return "Closes today";
  return `${days} days left`;
}

function RegistrationCard({ competition }) {
  const path = competitionPath(competition.id);
  const free = !competition.entryFeeUsd;
  const open = isRegistrationOpen(competition);
  const full = isFull(competition);
  const fill = competition.capacity > 0 ? Math.min(100, Math.round((competition.participants / competition.capacity) * 100)) : 0;
  const daysLeft = open ? daysLeftText(competition.registrationClosesAt) : null;

  let action;
  if (competition.status === "results") {
    action = <Link to={`${path}/results`} className="btn btn-primary btn-full">View results <ArrowRight size={17} aria-hidden="true" /></Link>;
  } else if (competition.viewerRegistered) {
    action = (
      <>
        <p className="cmc-registered" role="status"><CircleCheck size={18} aria-hidden="true" /> You're registered</p>
        <Link to="/community/activities?tab=competitions" className="btn btn-outline btn-full">My registrations</Link>
      </>
    );
  } else if (!open) {
    action = <p className="cmc-closed-note">Registration has closed for this competition.</p>;
  } else if (full) {
    action = <p className="cmc-closed-note">This competition is full. Watch Announcements for the next one.</p>;
  } else {
    action = (
      <Link to={`${path}/register`} className="btn btn-primary btn-full">
        {free ? "Register for free" : `Register for ${formatUsd(competition.entryFeeUsd)}`} <ArrowRight size={17} aria-hidden="true" />
      </Link>
    );
  }

  return (
    <section className="community-card cmc-register-card" aria-labelledby="cmc-registration">
      <div className="cmc-register-head">
        <h2 className="community-side-title" id="cmc-registration">Registration</h2>
        {daysLeft && <span className="community-tag tag-amber">{daysLeft}</span>}
      </div>
      <div className="community-participants-head">
        <span>Participants</span>
        <strong>{formatNumber(competition.participants)} / {formatNumber(competition.capacity)}</strong>
      </div>
      <div className="community-progress community-progress-wide community-progress-gradient cmc-bar" role="progressbar" aria-label="Places taken" aria-valuenow={fill} aria-valuemin={0} aria-valuemax={100}>
        <span style={{ width: `${fill}%` }} />
      </div>
      <p className="cmc-small-note">{formatNumber(placesLeft(competition))} places left</p>

      <dl className="cmc-facts cmc-facts-bordered">
        <div><dt>Entry fee</dt><dd>{free ? "Free" : `${formatUsd(competition.entryFeeUsd)} USD`}</dd></div>
        <div><dt>Category</dt><dd>{competition.category}</dd></div>
        <div><dt>Format</dt><dd>{competition.format}</dd></div>
      </dl>

      <div className="cmc-register-action">{action}</div>
      {!free && competition.status !== "results" && <p className="cmc-small-note cmc-center">Entry fees are separate from Premium membership.</p>}
    </section>
  );
}
