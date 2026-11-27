import { Link } from "react-router-dom";
import {
  Bot,
  CalendarDays,
  ChartNoAxesColumn,
  CircleCheck,
  Clock,
  CodeXml,
  Crown,
  HeartPulse,
  Lock,
  Palette,
  Smartphone,
  Trophy,
  UserRound,
  Zap,
} from "lucide-react";

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { getCommunityHackathons } from "../../features/community/communityService";
import Countdown from "../../features/community/Countdown";
import { FilterChip } from "../../features/community/listControls";
import { useCommunityList, useUrlFilters } from "../../features/community/listHooks";

const STATUSES = [
  { value: "upcoming", label: "Upcoming", empty: "No hackathons are scheduled right now. New ones are announced in Announcements." },
  { value: "live", label: "Live", empty: "No hackathon is running right now." },
  { value: "past", label: "Past", empty: "No hackathons have finished yet." },
];

// Banner colour and icon for each hackathon category.
const CATEGORY_STYLE = {
  FinTech: { icon: Zap, tone: "blue" },
  "Product Design": { icon: Palette, tone: "purple" },
  "Web Development": { icon: CodeXml, tone: "indigo" },
  "Data Analysis": { icon: ChartNoAxesColumn, tone: "teal" },
  "AI & Machine Learning": { icon: Bot, tone: "indigo" },
  "Mobile Development": { icon: Smartphone, tone: "orange" },
  "Graphic Design": { icon: Palette, tone: "pink" },
  Health: { icon: HeartPulse, tone: "teal" },
};

// All hackathon times are shown in West Africa Time, whatever the viewer's own time zone.
const TIME_ZONE = "Africa/Lagos";
const dayTime = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: TIME_ZONE });
const dateTime = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: TIME_ZONE });
const dateOnly = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: TIME_ZONE });
const numberFormat = new Intl.NumberFormat("en-GB");

function durationLabel(startsAt, endsAt) {
  const hours = Math.round((new Date(endsAt) - new Date(startsAt)) / 3600000);
  return hours % 24 === 0 && hours > 24 ? `${hours / 24} days` : `${hours} hours`;
}

export default function HackathonListing() {
  const { params, update } = useUrlFilters({ status: "upcoming" });
  const status = STATUSES.some((item) => item.value === params.get("status")) ? params.get("status") : "upcoming";
  const { data, error, loading, refreshing, reload } = useCommunityList(getCommunityHackathons, { status });
  const current = STATUSES.find((item) => item.value === status);

  return (
    <div className="community-library">
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">24-HOUR CHALLENGES</span>
          <h1>Hackathons</h1>
          <p>Build a working project in 24 hours. Winners receive one month of CodeRise Premium, certificates and community points.</p>
        </div>
      </header>

      {data?.isSample && (
        <p className="community-sample-notice" role="status">
          Showing sample data: the Community API is not available yet. This notice only appears on the local dev server.
        </p>
      )}

      <div className="community-hackathon-toolbar">
        <div className="community-chips" role="group" aria-label="Hackathon status">
          {STATUSES.map((item) => (
            <FilterChip key={item.value} active={status === item.value} count={data?.counts?.[item.value]} onClick={() => update({ status: item.value })}>
              {item.label}
            </FilterChip>
          ))}
        </div>
        <p className="community-timezone"><Clock size={17} aria-hidden="true" /> All times in West Africa Time (WAT)</p>
      </div>

      {loading && <Loader label="Loading hackathons…" />}
      {error && <ErrorMessage message={error} onRetry={reload} />}

      {data && !error && (
        data.hackathons.length === 0 ? (
          <div className="community-card community-empty">
            <span className="community-icon tone-amber"><Zap size={22} aria-hidden="true" /></span>
            <h2>Nothing here yet</h2>
            <p className="muted-text">{current.empty}</p>
          </div>
        ) : (
          <div className={`community-hackathon-list${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing}>
            {data.hackathons.map((hackathon) => (
              <HackathonCard key={hackathon.id} hackathon={hackathon} canJoinPremium={Boolean(data.viewerHasPremium)} />
            ))}
          </div>
        )
      )}

      {data && !data.viewerHasPremium && (
        <section className="community-premium-banner" aria-label="CodeRise Premium">
          <span className="community-icon community-icon-solid-purple"><Crown size={22} aria-hidden="true" /></span>
          <div className="min-w-0">
            <h2>Premium members join every eligible Premium hackathon</h2>
            <p>Free hackathons stay open to all registered students.</p>
          </div>
          <Link to="/premium" className="btn btn-sm community-btn-premium">See plans</Link>
        </section>
      )}
    </div>
  );
}

function StatusTag({ hackathon }) {
  if (hackathon.status === "live") return <span className="community-tag tag-red"><span className="community-live-dot" aria-hidden="true" />Live now</span>;
  if (hackathon.status === "past") return <span className="community-tag tag-neutral">{hackathon.winner ? "Results published" : "Judging"}</span>;
  return hackathon.registrationOpen
    ? <span className="community-tag tag-amber">Registration open</span>
    : <span className="community-tag tag-neutral">Registration closed</span>;
}

function HackathonCard({ hackathon, canJoinPremium }) {
  const style = CATEGORY_STYLE[hackathon.category] ?? { icon: Zap, tone: "blue" };
  const Icon = style.icon;
  const premium = hackathon.access === "premium";
  const locked = premium && !canJoinPremium;
  const detailsPath = `/community/hackathons/${encodeURIComponent(hackathon.id)}`;
  const { status } = hackathon;

  let primary = null;
  if (status === "upcoming") {
    if (hackathon.viewerRegistered) primary = <span className="community-registered"><CircleCheck size={17} aria-hidden="true" /> Registered</span>;
    else if (locked) primary = <Link to="/premium" className="btn btn-sm community-btn-premium" aria-label={`${hackathon.title} is for Premium members. See plans`}><Lock size={15} aria-hidden="true" /> Premium only</Link>;
    else if (hackathon.registrationOpen) primary = <Link to={detailsPath} className="btn btn-primary btn-sm" aria-label={`Register for ${hackathon.title}`}>Register</Link>;
  } else if (status === "live" && hackathon.viewerRegistered) {
    primary = <Link to={`${detailsPath}/workspace`} className="btn btn-primary btn-sm">Open workspace</Link>;
  }

  return (
    <article className="community-hackathon-card">
      <div className={`community-hackathon-banner banner-${style.tone}`}>
        <div className="community-banner-tags">
          <span>{hackathon.category}</span>
          <span>{hackathon.format}</span>
        </div>
        <div>
          <Icon size={36} strokeWidth={1.7} aria-hidden="true" />
          <p className="community-banner-length">{durationLabel(hackathon.startsAt, hackathon.endsAt)}</p>
          <p className="community-banner-dates">
            {dayTime.format(new Date(hackathon.startsAt))} → {dayTime.format(new Date(hackathon.endsAt))}
          </p>
        </div>
      </div>

      <div className="community-hackathon-body">
        <div className="community-collab-card-top">
          <StatusTag hackathon={hackathon} />
          {premium
            ? <span className="community-tag tag-purple"><Crown size={12} aria-hidden="true" /> Premium hackathon</span>
            : <span className="community-tag tag-green">Free entry</span>}
        </div>
        <h2>{hackathon.title}</h2>
        <p className="community-hackathon-text">{hackathon.description}</p>
        <div className="community-hackathon-facts">
          {status === "upcoming" && (
            <span><CalendarDays size={15} aria-hidden="true" /> Register by {dateTime.format(new Date(hackathon.registrationClosesAt))}</span>
          )}
          {status === "past" && (
            <span><CalendarDays size={15} aria-hidden="true" /> Ended {dateOnly.format(new Date(hackathon.endsAt))}</span>
          )}
          <span><UserRound size={15} aria-hidden="true" /> {numberFormat.format(hackathon.registeredCount)} registered</span>
          {status === "past"
            ? <span className="community-prize"><Trophy size={15} aria-hidden="true" /> {hackathon.winner ? `Winner: ${hackathon.winner}` : "Results coming soon"}</span>
            : <span className="community-prize"><Trophy size={15} aria-hidden="true" /> Winner: {hackathon.prize}</span>}
        </div>

        <div className="community-hackathon-actions">
          {status !== "past" && (
            <div className="community-hackathon-timer">
              <p className="community-countdown-label">{status === "live" ? "Ends in" : "Starts in"}</p>
              <Countdown target={status === "live" ? hackathon.endsAt : hackathon.startsAt} doneLabel={status === "live" ? "Ended" : "Started"} />
            </div>
          )}
          <div className="community-hackathon-buttons">
            <Link to={detailsPath} className="btn btn-outline btn-sm" aria-label={`${status === "past" ? "View results" : "View details"}: ${hackathon.title}`}>
              {status === "past" ? "View results" : "View details"}
            </Link>
            {primary}
          </div>
        </div>
      </div>
    </article>
  );
}
