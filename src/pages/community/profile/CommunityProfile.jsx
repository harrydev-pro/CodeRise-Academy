import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Award,
  ChartLine,
  ChartNoAxesColumn,
  CircleCheck,
  CodeXml,
  Crown,
  Heart,
  Lock,
  Monitor,
  Palette,
  Pencil,
  Share2,
  Smartphone,
  Trophy,
  UserRound,
  UsersRound,
  Zap,
} from "lucide-react";

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import Toast from "../../../components/feedback/Toast";
import { setFollowing } from "../../../features/community/communityService";
import { useCommunityList } from "../../../features/community/listHooks";
import { getCertificateDownload, getCommunityProfile } from "../../../features/community/profile/profileService";

const numberFormat = new Intl.NumberFormat("en-GB");
// "Sep 2026", as in the design (en-GB on some browsers writes "Sept").
const shortMonthYear = new Intl.DateTimeFormat("en-GB", { month: "short", year: "numeric" });
const monthYear = { format: (date) => shortMonthYear.format(date).replace("Sept", "Sep") };
// The design shows the earned badges plus the next few to unlock, not every locked badge.
const LOCKED_BADGES_SHOWN = 2;
const joinedFormat = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" });

const PROJECT_STYLE = {
  Frontend: { icon: CodeXml, tone: "blue" },
  Web: { icon: Monitor, tone: "teal" },
  Team: { icon: UsersRound, tone: "orange" },
  "Product Design": { icon: Smartphone, tone: "purple" },
  "Data Analysis": { icon: ChartNoAxesColumn, tone: "teal" },
  "Graphic Design": { icon: Palette, tone: "pink" },
  Mobile: { icon: Smartphone, tone: "orange" },
};
const BADGE_STYLE = {
  "first-project": { icon: Award, tone: "blue" },
  "team-player": { icon: UsersRound, tone: "green" },
  "rising-developer": { icon: ChartLine, tone: "orange" },
  "community-helper": { icon: Heart, tone: "teal" },
  "hackathon-champion": { icon: Trophy, tone: "amber" },
  "project-master": { icon: Award, tone: "purple" },
  "competition-winner": { icon: Trophy, tone: "purple" },
};
const ACTIVITY_STYLE = {
  competition: { icon: Trophy, tone: "purple" },
  hackathon: { icon: Zap, tone: "amber" },
  project: { icon: CircleCheck, tone: "green" },
  team: { icon: UsersRound, tone: "blue" },
};
const STATUS_TAG = { "Under review": "tag-blue", Participated: "tag-green", Approved: "tag-green", Active: "tag-neutral" };

export default function CommunityProfile() {
  const { username = "" } = useParams();
  const { data, error, loading, reload } = useCommunityList(getCommunityProfile, { username });
  const [follow, setFollow] = useState({}); // username -> { following, followers }
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);

  if (loading) return <Loader label="Loading profile…" />;
  if (error && !data) {
    return (
      <div className="community-library cmh-page">
        <ErrorMessage message={error} onRetry={reload} />
        <Link to="/community/leaderboard" className="cmh-back">Browse the leaderboard</Link>
      </div>
    );
  }
  if (!data) return null;

  const { profile, isSample } = data;
  const local = follow[profile.username];
  const following = local?.following ?? Boolean(profile.viewerFollowing);
  const followers = local?.followers ?? profile.stats.followers;

  async function toggleFollow() {
    const next = !following;
    setFollow((current) => ({ ...current, [profile.username]: { following: next, followers: followers + (next ? 1 : -1) } }));
    try {
      await setFollowing(profile.username, next, { sample: isSample });
    } catch (followError) {
      setFollow((current) => ({ ...current, [profile.username]: { following: !next, followers } }));
      setToast({ type: "error", message: followError.message || "That change could not be saved." });
    }
  }

  async function share() {
    const url = `${window.location.origin}/community/u/${encodeURIComponent(profile.username)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${profile.name} on CodeRise`, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setToast({ type: "success", message: "Profile link copied." });
    } catch (shareError) {
      if (shareError?.name !== "AbortError") setToast({ type: "error", message: "The link could not be copied." });
    }
  }

  async function download(certificate) {
    try {
      const result = await getCertificateDownload(certificate.id, { sample: isSample });
      if (result?.url) window.open(result.url, "_blank", "noopener,noreferrer");
      else setToast({ type: "success", message: "Sample mode: certificates download once the Community API is live." });
    } catch (downloadError) {
      setToast({ type: "error", message: downloadError.message || "The certificate could not be downloaded." });
    }
  }

  const earned = profile.badges.filter((badge) => badge.earnedAt);
  const shownBadges = [...earned, ...profile.badges.filter((badge) => !badge.earnedAt).slice(0, LOCKED_BADGES_SHOWN)];
  const stats = [
    { label: "Projects completed", value: numberFormat.format(profile.stats.projectsCompleted) },
    { label: "Collaborations", value: numberFormat.format(profile.stats.collaborations) },
    { label: "Hackathons", value: numberFormat.format(profile.stats.hackathons) },
    { label: "Competitions", value: numberFormat.format(profile.stats.competitions) },
    { label: "Community points", value: numberFormat.format(profile.stats.points) },
    { label: "Followers · Following", value: `${numberFormat.format(followers)} · ${numberFormat.format(profile.stats.following)}` },
  ];

  return (
    <div className="community-library cmh-page">
      {isSample && (
        <p className="community-sample-notice" role="status">
          Showing sample data: the Community API is not available yet. Follows only change on screen. This notice only appears on the local dev server.
        </p>
      )}

      <section className="community-card cmh-profile" aria-labelledby="cmh-profile-name">
        <div className="cmh-profile-cover" aria-hidden="true" />
        <div className="cmh-profile-head">
          <span className={`cmh-profile-avatar${profile.isViewer ? " is-viewer" : ""}`} aria-hidden="true">{profile.name.trim().charAt(0).toUpperCase() || "?"}</span>
          <div className="cmh-profile-id">
            <div className="cmh-profile-name">
              <h1 id="cmh-profile-name">{profile.name}</h1>
              <span className={`community-tag ${profile.plan === "premium" ? "tag-purple" : "tag-neutral"}`}>
                {profile.plan === "premium" ? <><Crown size={12} aria-hidden="true" /> Premium</> : "Free plan"}
              </span>
              {profile.title && <span className="community-tag tag-blue">{profile.title}</span>}
            </div>
            <p className="cmh-profile-meta">
              @{profile.handle}{profile.location ? ` · ${profile.location}` : ""} · Joined {joinedFormat.format(new Date(profile.joinedAt))}
            </p>
          </div>
          <div className="cmh-profile-actions">
            <button type="button" className="btn btn-outline" onClick={share}><Share2 size={17} aria-hidden="true" /> Share profile</button>
            {profile.isViewer ? (
              <Link to="/profile" className="btn btn-primary"><Pencil size={16} aria-hidden="true" /> Edit profile</Link>
            ) : (
              <button
                type="button"
                className={`btn ${following ? "btn-outline" : "btn-primary"}`}
                aria-pressed={following}
                onClick={toggleFollow}
              >
                <UserRound size={17} aria-hidden="true" /> {following ? "Following" : "Follow"}
              </button>
            )}
          </div>
        </div>
        <div className="cmh-profile-body">
          {profile.bio && <p className="cmh-text">{profile.bio}</p>}
          {profile.skills.length > 0 && (
            <ul className="cmh-pill-list" aria-label="Skills">
              {profile.skills.map((skill) => <li key={skill} className="community-chip">{skill}</li>)}
            </ul>
          )}
          {profile.learning.length > 0 && (
            <div className="cmh-learning">
              <span id="cmh-learning-label">Learning:</span>
              <ul className="cmh-pill-list" aria-labelledby="cmh-learning-label">
                {profile.learning.map((item) => <li key={item} className="community-tag tag-blue">{item}</li>)}
              </ul>
            </div>
          )}
        </div>
      </section>

      <dl className="cmh-profile-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="community-card">
            <dt>{stat.label}</dt>
            <dd>{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="cmh-workspace-layout">
        <div className="cmh-details-main">
          <section className="community-card" aria-labelledby="cmh-projects">
            <div className="community-card-header">
              <h2 id="cmh-projects" className="cmh-card-title">Public projects</h2>
              {profile.isViewer && profile.hiddenPrivateCount > 0 && (
                <span className="cmh-muted"><Lock size={14} aria-hidden="true" /> {profile.hiddenPrivateCount} private project{profile.hiddenPrivateCount === 1 ? "" : "s"} hidden</span>
              )}
            </div>
            {profile.projects.length === 0 ? (
              <div className="community-empty cmh-empty-inline">
                <span className="community-icon tone-blue"><CodeXml size={22} aria-hidden="true" /></span>
                <p className="muted-text">{profile.isViewer ? "Finish a project and make it public to show it here." : `${profile.name.split(" ")[0]} hasn't shared any public projects yet.`}</p>
                {profile.isViewer && <Link to="/community/projects" className="btn btn-primary btn-sm">Browse projects</Link>}
              </div>
            ) : (
              <ul className="cmh-project-grid">
                {profile.projects.map((project) => <ProfileProject key={project.id} project={project} />)}
              </ul>
            )}
          </section>

          <section className="community-card" aria-labelledby="cmh-activity">
            <h2 id="cmh-activity" className="cmh-card-title">Activity history</h2>
            {profile.activity.length === 0 ? (
              <p className="muted-text">No community activity yet.</p>
            ) : (
              <ul className="community-list">
                {profile.activity.map((item) => {
                  const style = ACTIVITY_STYLE[item.type] ?? ACTIVITY_STYLE.project;
                  const Icon = style.icon;
                  return (
                    <li key={item.id} className="cmh-activity">
                      <span className={`community-icon tone-${style.tone}`}><Icon size={18} aria-hidden="true" /></span>
                      <span className="min-w-0">
                        <strong>{item.title}</strong>
                        <span>{item.details}</span>
                      </span>
                      {item.status && <span className={`community-tag ${STATUS_TAG[item.status] ?? "tag-neutral"}`}>{item.status}</span>}
                    </li>
                  );
                })}
              </ul>
            )}
            {profile.isViewer && <Link to="/community/activities" className="text-link cmh-more-link">See all my activity</Link>}
          </section>
        </div>

        <aside className="cmh-details-side" aria-label="Badges and certificates">
          <section className="community-card" aria-labelledby="cmh-badges">
            <div className="community-card-header">
              <h2 id="cmh-badges" className="cmh-card-title">Awards &amp; badges</h2>
              <span className="cmh-muted">{earned.length} of {profile.badges.length}</span>
            </div>
            <ul className="community-badge-grid">
              {shownBadges.map((badge) => {
                const style = BADGE_STYLE[badge.id] ?? { icon: Award, tone: "blue" };
                const Icon = badge.earnedAt ? style.icon : Lock;
                return (
                  <li key={badge.id} className={`community-badge${badge.earnedAt ? "" : " cmh-badge-locked"}`}>
                    <span className={`community-icon community-badge-icon ${badge.earnedAt ? `tone-${style.tone}` : "tone-slate"}`}><Icon size={22} aria-hidden="true" /></span>
                    <strong>{badge.name}</strong>
                    <span>{badge.earnedAt ? monthYear.format(new Date(badge.earnedAt)) : <><span className="sr-only">Locked: </span>{badge.hint}</>}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          {profile.certificates.length > 0 && (
            <section className="community-card" aria-labelledby="cmh-certificates">
              <h2 id="cmh-certificates" className="cmh-card-title">Certificates</h2>
              <ul className="community-list">
                {profile.certificates.map((certificate) => (
                  <li key={certificate.id} className="community-certificate">
                    <div className="min-w-0">
                      <strong>{certificate.title}</strong>
                      <span>{certificate.subject} · {monthYear.format(new Date(certificate.issuedAt))}</span>
                    </div>
                    {profile.isViewer && (
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => download(certificate)} aria-label={`Download ${certificate.title} certificate: ${certificate.subject}`}>Download</button>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {profile.isViewer && profile.plan !== "premium" && !profile.viewerHasPremium && (
            <section className="community-card community-premium-side" aria-labelledby="cmh-premium">
              <h2 id="cmh-premium" className="community-side-title cmh-premium-title">Get the Premium badge</h2>
              <p className="cmh-note">Premium members get a profile badge, Premium projects and exclusive masterclasses.</p>
              <Link to="/premium" className="btn btn-sm community-btn-premium">See plans</Link>
            </section>
          )}
        </aside>
      </div>

      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </div>
  );
}

function ProfileProject({ project }) {
  const style = PROJECT_STYLE[project.kind === "collaboration" ? "Team" : project.category] ?? PROJECT_STYLE.Frontend;
  const Icon = style.icon;
  const second = project.kind === "collaboration"
    ? project.detail
    : `${numberFormat.format(project.likes ?? 0)} likes · ${numberFormat.format(project.comments ?? 0)} comments`;
  return (
    <li className="cmh-project">
      <div className={`cmh-project-cover cover-${style.tone}`} aria-hidden="true"><Icon size={34} strokeWidth={1.6} /></div>
      <div className="cmh-project-body">
        <h3>
          {project.showcaseId
            ? <Link to={`/community/showcase?project=${encodeURIComponent(project.showcaseId)}`} className="cmh-project-link">{project.title}</Link>
            : project.title}
        </h3>
        <p>{project.meta}</p>
        {second && <p>{second}</p>}
      </div>
    </li>
  );
}
