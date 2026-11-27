import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  ChartNoAxesColumn,
  CircleCheck,
  ClipboardList,
  CodeXml,
  Crown,
  Monitor,
  Palette,
  Smartphone,
  Star,
  Trophy,
  UserRound,
  Users,
  Zap,
} from "lucide-react";

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { getCommunityHome } from "../../features/community/communityService";
import Countdown from "../../features/community/Countdown";
import ProjectCard from "../../features/community/ProjectCard";
import { useAuth } from "../../hooks/useAuth";

const ICONS = { code: CodeXml, mobile: Smartphone, chart: ChartNoAxesColumn, palette: Palette, monitor: Monitor };
const numberFormat = new Intl.NumberFormat("en-GB");

function initials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join("") || "?";
}

function useCommunityHome() {
  const [state, setState] = useState({ status: "loading", data: null, error: "" });
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => {
    setState({ status: "loading", data: null, error: "" });
    setRevision((value) => value + 1);
  }, []);

  useEffect(() => {
    let active = true;
    getCommunityHome()
      .then((data) => active && setState({ status: "ready", data, error: "" }))
      .catch((error) => active && setState({ status: "error", data: null, error: error.message || "The community could not be loaded." }));
    return () => { active = false; };
  }, [revision]);

  return { ...state, reload };
}

export default function CommunityHome() {
  const { user } = useAuth();
  const { status, data, error, reload } = useCommunityHome();
  const fullName = (user?.name || user?.fullName || "").trim();
  const firstName = fullName.split(/\s+/)[0] || "there";

  if (status === "loading") return <Loader label="Loading the community…" />;
  if (status === "error") return <ErrorMessage message={error} onRetry={reload} />;

  const { home, isSample } = data;
  const { viewer, stats } = home;
  const isPremium = viewer.membership?.plan && viewer.membership.plan !== "free";
  const profilePath = viewer.username ? `/community/u/${encodeURIComponent(viewer.username)}` : "/profile";

  return (
    <div className="community-home">
      {isSample && (
        <p className="community-sample-notice" role="status">
          Showing sample data: the Community API is not available yet. This notice only appears on the local dev server.
        </p>
      )}

      <section className="community-card community-welcome">
        <div className="community-welcome-profile">
          {user?.avatar_url
            ? <img src={user.avatar_url} alt="" className="community-welcome-avatar" />
            : <span className="community-welcome-avatar" aria-hidden="true">{firstName.charAt(0).toUpperCase()}</span>}
          <div className="min-w-0">
            <span className="eyebrow">CODERISE COMMUNITY</span>
            <h1>Welcome to the community, {firstName}</h1>
            <p>Build real projects, team up with other learners and compete for prizes.</p>
          </div>
        </div>
        <div className="community-welcome-actions">
          <Link to={profilePath} className="btn btn-outline"><UserRound size={17} aria-hidden="true" /> My profile</Link>
          {!isPremium && <Link to="/premium" className="btn community-btn-premium"><Crown size={17} aria-hidden="true" /> Go Premium</Link>}
        </div>
      </section>

      <section className="community-stats" aria-label="Your community at a glance">
        <CommunityStat label="Available projects" value={stats.availableProjects} icon={ClipboardList} tone="blue" />
        <CommunityStat label="Active collaborations" value={stats.activeCollaborations} icon={Users} tone="green" />
        <CommunityStat label="Upcoming hackathons" value={stats.upcomingHackathons} icon={Zap} tone="amber" />
        <CommunityStat label="Active competitions" value={stats.activeCompetitions} icon={Trophy} tone="purple" />
        <CommunityStat label="Projects completed" value={viewer.projectsCompleted} icon={CircleCheck} tone="teal" />
        <CommunityStat label="Community points" value={numberFormat.format(viewer.points ?? 0)} icon={Star} tone="orange" />
        <CommunityStat label="Current ranking" value={viewer.rank ? `#${viewer.rank}` : "—"} icon={ChartNoAxesColumn} tone="sky" />
        <MembershipCard membership={viewer.membership} />
      </section>

      <section className="community-section" aria-labelledby="featured-projects-title">
        <div className="community-section-header">
          <h2 id="featured-projects-title">Featured projects</h2>
          <Link to="/community/projects" className="text-link">View all projects</Link>
        </div>
        {home.featuredProjects?.length ? (
          <div className="community-projects">
            {home.featuredProjects.map((project) => <ProjectCard key={project.slug} project={project} canOpenPremium={isPremium} lockedAction="upgrade" />)}
          </div>
        ) : <p className="muted-text">New projects are on their way.</p>}
      </section>

      <div className="community-columns">
        <div className="community-column">
          <CollaborationCard items={home.collaborations ?? []} />
          {home.hackathon && <HackathonCard hackathon={home.hackathon} />}
          <CompetitionsCard items={home.competitions ?? []} />
          {home.projectOfMonth && <ProjectOfMonth project={home.projectOfMonth} />}
        </div>
        <div className="community-column">
          <AnnouncementsCard items={home.announcements ?? []} />
          <TopMembersCard members={home.topMembers ?? []} viewer={viewer} viewerInitial={firstName.charAt(0).toUpperCase()} />
          {home.challenges?.length > 0 && <ChallengesCard items={home.challenges} />}
        </div>
      </div>
    </div>
  );
}

function CommunityStat({ label, value, icon: Icon, tone }) {
  return (
    <div className="community-stat">
      <span className={`community-icon tone-${tone}`}><Icon size={20} aria-hidden="true" /></span>
      <div className="min-w-0">
        <p className="community-stat-label">{label}</p>
        <strong className="community-stat-value">{value ?? "—"}</strong>
      </div>
    </div>
  );
}

function MembershipCard({ membership = {} }) {
  const plan = membership.plan || "free";
  const planName = { free: "Free plan", premium: "Premium", premium_plus: "Premium Plus" }[plan] || plan;
  return (
    <Link to={plan === "free" ? "/premium" : "/account/subscription"} className="community-stat community-stat-membership">
      <span className="community-icon community-icon-solid-purple"><Crown size={20} aria-hidden="true" /></span>
      <div className="min-w-0">
        <p className="community-stat-label">Membership</p>
        <strong className="community-stat-plan">{planName}</strong>
        {plan === "free" && membership.lockedPremiumProjects > 0 && (
          <span className="community-stat-upsell">Unlock {membership.lockedPremiumProjects} Premium projects</span>
        )}
      </div>
    </Link>
  );
}

function CardHeader({ title, linkTo, linkLabel, id }) {
  return (
    <div className="community-card-header">
      <h2 id={id}>{title}</h2>
      {linkTo && <Link to={linkTo} className="text-link">{linkLabel}</Link>}
    </div>
  );
}

function CollaborationCard({ items }) {
  return (
    <section className="community-card" aria-labelledby="collab-title">
      <CardHeader id="collab-title" title="Active collaboration" linkTo="/community/collaborate" linkLabel="Browse teams" />
      {items.length === 0 ? (
        <p className="muted-text">You are not in a team yet. <Link to="/community/collaborate" className="text-link">Find a team to join</Link></p>
      ) : (
        <ul className="community-list">
          {items.map((item) => {
            const Icon = ICONS[item.icon] || CodeXml;
            const mine = item.kind === "member";
            return (
              <li key={item.id} className="community-collab">
                <span className={`community-icon tone-${mine ? "blue" : "purple"}`}><Icon size={20} aria-hidden="true" /></span>
                <div className="community-collab-body">
                  <h3>{item.title}</h3>
                  {mine ? (
                    <>
                      <p>Your team · {item.teamName} · {item.members} of {item.maxMembers} members · Due {item.due}</p>
                      {typeof item.progress === "number" && (
                        <div className="community-progress" role="progressbar" aria-label={`${item.title} progress`} aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={100}>
                          <span style={{ width: `${item.progress}%` }} />
                        </div>
                      )}
                    </>
                  ) : (
                    <p>{item.track} · {item.openSlots} {item.openSlots === 1 ? "slot" : "slots"} open · Looking for: {item.lookingFor}</p>
                  )}
                </div>
                <div className="community-collab-actions">
                  {!mine && item.memberInitials?.length > 0 && (
                    <span className="community-avatars" aria-label={`${item.memberInitials.length} current members`}>
                      {item.memberInitials.map((value, index) => <span key={`${value}-${index}`} className={`community-avatar avatar-${index % 4}`} aria-hidden="true">{value}</span>)}
                    </span>
                  )}
                  {mine
                    ? <Link to={`/community/teams/${encodeURIComponent(item.teamId)}`} className="btn btn-outline btn-sm">Open workspace</Link>
                    : <Link to={`/community/collaborate/${encodeURIComponent(item.id)}`} className="btn btn-primary btn-sm">Request to join</Link>}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

const startFormat = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });

function HackathonCard({ hackathon }) {
  const tagTones = ["amber", "green", "blue"];
  return (
    <section className="community-card" aria-labelledby="hackathon-title">
      <CardHeader id="hackathon-title" title="Upcoming hackathons" linkTo="/community/hackathons" linkLabel="All hackathons" />
      <div className="community-hackathon">
        <div className="min-w-0">
          <div className="community-tags">
            {hackathon.tags?.map((tag, index) => <span key={tag} className={`community-tag tag-${tagTones[index % tagTones.length]}`}>{tag}</span>)}
          </div>
          <h3>{hackathon.title}</h3>
          <p className="community-hackathon-text">
            {hackathon.description} Starts {startFormat.format(new Date(hackathon.startsAt))} WAT.
          </p>
          {hackathon.prize && <p className="community-prize"><Trophy size={16} aria-hidden="true" /> {hackathon.prize}</p>}
        </div>
        <div className="community-hackathon-side">
          <p className="community-countdown-label">Starts in</p>
          <Countdown target={hackathon.startsAt} />
          <Link to={`/community/hackathons/${encodeURIComponent(hackathon.id)}`} className="btn btn-primary btn-sm">Register now</Link>
        </div>
      </div>
    </section>
  );
}

function CompetitionsCard({ items }) {
  return (
    <section className="community-card" aria-labelledby="competitions-title">
      <CardHeader id="competitions-title" title="Current competitions" linkTo="/community/competitions" linkLabel="All competitions" />
      {items.length === 0 ? <p className="muted-text">No competitions are open right now.</p> : (
        <ul className="community-list">
          {items.map((item, index) => {
            const Icon = ICONS[item.icon] || Trophy;
            return (
              <li key={item.id}>
                <Link to={`/community/competitions/${encodeURIComponent(item.id)}`} className="community-competition">
                  <span className={`community-icon tone-${index % 2 ? "amber" : "blue"}`}><Icon size={20} aria-hidden="true" /></span>
                  <span className="community-competition-body">
                    <strong>{item.title}</strong>
                    <span>Registration closes {item.closes} · Prize: {item.prize}</span>
                  </span>
                  <span className={`community-tag ${item.entryFee ? "tag-blue" : "tag-green"}`}>{item.entryFee ? `${item.entryFee} entry` : "Free entry"}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function ProjectOfMonth({ project }) {
  return (
    <section className="community-spotlight" aria-labelledby="potm-title">
      <span className="community-spotlight-eyebrow">PROJECT OF THE MONTH · {project.month?.toUpperCase()}</span>
      <h2 id="potm-title">“{project.title}” by {project.author}</h2>
      <p>{project.description}</p>
      <Link to="/community/showcase" className="btn community-btn-light">View showcase <ArrowRight size={16} aria-hidden="true" /></Link>
    </section>
  );
}

function AnnouncementsCard({ items }) {
  const tone = (tag = "") => ({ pinned: "blue", premium: "purple" }[tag.toLowerCase()] || "neutral");
  return (
    <section className="community-card" aria-labelledby="announcements-title">
      <CardHeader id="announcements-title" title="Announcements" linkTo="/community/announcements" linkLabel="View all" />
      {items.length === 0 ? <p className="muted-text">No announcements yet.</p> : (
        <ul className="community-list">
          {items.map((item) => (
            <li key={item.id} className="community-announcement">
              {item.tag && <span className={`community-tag tag-${tone(item.tag)}`}>{item.tag}</span>}
              <div className="min-w-0">
                <h3>{item.title}</h3>
                <p>{item.meta}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function TopMembersCard({ members, viewer, viewerInitial }) {
  const viewerInTop = members.some((member) => member.username && member.username === viewer.username);
  return (
    <section className="community-card" aria-labelledby="members-title">
      <div className="community-card-header community-card-header-stacked">
        <h2 id="members-title">Top community members</h2>
        <Link to="/community/leaderboard" className="text-link">Leaderboard</Link>
      </div>
      <ol className="community-list community-leaders">
        {members.map((member, index) => (
          <li key={member.username || member.name}>
            <Link to={`/community/u/${encodeURIComponent(member.username)}`} className="community-leader">
              <span className={`community-leader-rank rank-${member.rank}`}>{member.rank}</span>
              <span className={`community-avatar avatar-${index % 4}`} aria-hidden="true">{initials(member.name)}</span>
              <span className="community-leader-name"><strong>{member.name}</strong><span>{member.track}</span></span>
              <span className="community-leader-points">{numberFormat.format(member.points)}<span className="sr-only"> points</span></span>
            </Link>
          </li>
        ))}
        {!viewerInTop && viewer.rank && (
          <li className="community-leader community-leader-you">
            <span className="community-leader-rank">{viewer.rank}</span>
            <span className="community-avatar avatar-you" aria-hidden="true">{viewerInitial || "Y"}</span>
            <span className="community-leader-name">
              <strong>You</strong>
              {viewer.pointsToTop10 > 0 && <span>{numberFormat.format(viewer.pointsToTop10)} pts to top 10</span>}
            </span>
            <span className="community-leader-points">{numberFormat.format(viewer.points ?? 0)}<span className="sr-only"> points</span></span>
          </li>
        )}
      </ol>
    </section>
  );
}

function ChallengesCard({ items }) {
  return (
    <section className="community-card" aria-labelledby="challenges-title">
      <CardHeader id="challenges-title" title="Community challenges" />
      <ul className="community-challenges">
        {items.map((item) => (
          <li key={item.id} className="community-challenge">
            <div className="community-challenge-top">
              <span className={`community-tag ${item.premium ? "tag-purple" : "tag-blue"}`}>{item.cadence}{item.premium ? " · Premium" : ""}</span>
              <span className="community-challenge-ends">{item.ends}</span>
            </div>
            <h3>{item.title}</h3>
            <p>+{item.points} points · {numberFormat.format(item.joined)} joined</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
