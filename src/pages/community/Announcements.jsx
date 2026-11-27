import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Check, CircleAlert, Crown, ExternalLink, FolderOpen, Pin, Trophy, Users, Zap } from "lucide-react";

import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import Toast from "../../components/feedback/Toast";
import { getAnnouncements, markAllAnnouncementsRead, markAnnouncementRead, saveEmailPreferences } from "../../features/community/communityService";
import { FilterChip } from "../../features/community/listControls";
import { useCommunityList, useUrlFilters } from "../../features/community/listHooks";
import { useAuth } from "../../hooks/useAuth";

const CATEGORIES = [
  { value: "projects", label: "Projects", tag: "Projects", tone: "green", icon: FolderOpen },
  { value: "hackathons", label: "Hackathons", tag: "Hackathon", tone: "amber", icon: Zap },
  { value: "competitions", label: "Competitions", tag: "Competitions", tone: "blue", icon: Trophy },
  { value: "collaboration", label: "Collaboration", tag: "Collaboration", tone: "teal", icon: Users },
  { value: "platform", label: "Platform", tag: "Platform notice", tone: "amber", icon: CircleAlert },
  { value: "premium", label: "Premium", tag: "Premium", tone: "purple", icon: Crown },
];
const CATEGORY_BY_VALUE = Object.fromEntries(CATEGORIES.map((item) => [item.value, item]));
const EMAIL_TOPICS = [
  { key: "projects", label: "New projects" },
  { key: "events", label: "Hackathons and competitions" },
  { key: "collaboration", label: "Collaboration opportunities" },
  { key: "platform", label: "Platform notices" },
];
const fullDate = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function Announcements() {
  const { user } = useAuth();
  const { params, update } = useUrlFilters();
  const category = CATEGORY_BY_VALUE[params.get("category")] ? params.get("category") : "";
  const { data, error, loading, refreshing, reload } = useCommunityList(getAnnouncements, { category });
  const sample = Boolean(data?.isSample);

  // Older pages loaded with "Load older announcements", kept per category.
  const [older, setOlder] = useState({ category: null, items: [], cursor: null, loading: false, error: "" });
  // Read state and email choices changed on this page, layered over the server data.
  const [readIds, setReadIds] = useState(() => new Set());
  const [allRead, setAllRead] = useState(false);
  const [emailChanges, setEmailChanges] = useState({});
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), []);

  const olderForCategory = older.category === category ? older : null;
  const nextCursor = olderForCategory ? olderForCategory.cursor : data?.nextCursor;
  const isRead = (item) => allRead || item.read || readIds.has(item.id);

  async function loadOlder() {
    setOlder((current) => ({ ...(current.category === category ? current : { category, items: [] }), loading: true, error: "" }));
    try {
      const result = await getAnnouncements({ category, before: nextCursor });
      setOlder((current) => ({ category, items: [...(current.category === category ? current.items : []), ...result.announcements], cursor: result.nextCursor, loading: false, error: "" }));
    } catch (loadError) {
      setOlder((current) => ({ ...current, loading: false, error: loadError.message || "Older announcements could not be loaded." }));
    }
  }

  async function markAllRead() {
    setAllRead(true);
    try {
      await markAllAnnouncementsRead({ sample });
    } catch (markError) {
      setAllRead(false);
      setToast({ type: "error", message: markError.message || "Announcements could not be marked as read." });
    }
  }

  function markRead(item) {
    if (isRead(item)) return;
    setReadIds((current) => new Set(current).add(item.id));
    // Best effort: a failure here only means the dot comes back next visit.
    markAnnouncementRead(item.id, { sample }).catch(() => {});
  }

  async function toggleEmail(key, value) {
    const next = { ...data.emailPreferences, ...emailChanges, [key]: value };
    setEmailChanges((current) => ({ ...current, [key]: value }));
    try {
      await saveEmailPreferences(next, { sample });
      setToast({ type: "success", message: "Email preferences saved." });
    } catch (saveError) {
      setEmailChanges((current) => ({ ...current, [key]: !value }));
      setToast({ type: "error", message: saveError.message || "Your email preferences could not be saved." });
    }
  }

  if (loading) return <Loader label="Loading announcements…" />;
  if (error && !data) return <ErrorMessage message={error} onRetry={reload} />;

  const items = [...data.announcements, ...(olderForCategory?.items ?? [])];
  const unread = [data.pinned, ...items].filter((item) => item && !isRead(item)).length;
  const emailPreferences = { ...data.emailPreferences, ...emailChanges };
  const currentCategory = CATEGORY_BY_VALUE[category];

  return (
    <div className="community-library">
      <header className="community-page-header">
        <div className="min-w-0">
          <span className="eyebrow">COMMUNITY UPDATES</span>
          <h1>Announcements</h1>
          <p>News from the CodeRise team about projects, events and your membership.</p>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={markAllRead} disabled={unread === 0}>
          <Check size={16} aria-hidden="true" /> {unread === 0 ? "All caught up" : "Mark all as read"}
        </button>
      </header>

      {sample && (
        <p className="community-sample-notice" role="status">
          Showing sample data: the Community API is not available yet. Read marks and email choices only change on screen. This notice only appears on the local dev server.
        </p>
      )}

      <div className="community-chips" role="group" aria-label="Announcement topic">
        <FilterChip active={!category} onClick={() => update({ category: "" })}>All</FilterChip>
        {CATEGORIES.map((item) => (
          <FilterChip key={item.value} active={category === item.value} onClick={() => update({ category: item.value })}>{item.label}</FilterChip>
        ))}
      </div>

      {error && <ErrorMessage message={error} onRetry={reload} />}

      <div className="community-leaderboard-layout community-announcements-layout">
        <div className={`community-announcement-feed${refreshing ? " is-refreshing" : ""}`} aria-busy={refreshing}>
          {data.pinned && <PinnedAnnouncement item={data.pinned} unread={!isRead(data.pinned)} onOpen={() => markRead(data.pinned)} />}

          {items.length === 0 && !data.pinned ? (
            <div className="community-card community-empty">
              <span className="community-icon tone-blue"><Check size={22} aria-hidden="true" /></span>
              <h2>No announcements{currentCategory ? ` about ${currentCategory.label.toLowerCase()}` : ""} yet</h2>
              <p className="muted-text">New updates from the CodeRise team will appear here.</p>
            </div>
          ) : (
            <ul className="community-announcement-list">
              {items.map((item) => (
                <AnnouncementItem key={item.id} item={item} unread={!isRead(item)} premium={Boolean(data.viewerHasPremium)} onOpen={() => markRead(item)} />
              ))}
            </ul>
          )}

          {olderForCategory?.error && <ErrorMessage message={olderForCategory.error} onRetry={loadOlder} />}
          {nextCursor && (
            <button type="button" className="btn btn-outline community-load-older" onClick={loadOlder} disabled={olderForCategory?.loading}>
              {olderForCategory?.loading ? "Loading…" : "Load older announcements"}
            </button>
          )}
        </div>

        <aside className="community-showcase-side" aria-label="Announcement settings">
          <section className="community-card" aria-labelledby="loop-title">
            <h2 id="loop-title" className="community-side-title community-side-title-tight">Stay in the loop</h2>
            <p className="community-side-note">
              We also send important announcements to {user?.email ? <strong className="community-break">{user.email}</strong> : "your email address"}.
            </p>
            <fieldset className="community-email-prefs">
              <legend className="sr-only">Email me about</legend>
              {EMAIL_TOPICS.map((topic) => (
                <label key={topic.key} className="community-checkbox">
                  <input type="checkbox" checked={Boolean(emailPreferences[topic.key])} onChange={(event) => toggleEmail(topic.key, event.target.checked)} />
                  {topic.label}
                </label>
              ))}
            </fieldset>
          </section>

          {!data.viewerHasPremium && (
            <section className="community-card community-premium-side" aria-labelledby="premium-announcements-title">
              <span className="community-tag tag-purple">Premium</span>
              <h2 id="premium-announcements-title" className="community-side-title community-side-title-tight">Get Premium-only announcements</h2>
              <p className="community-side-note">Masterclasses, expert workshops and early access to selected team projects.</p>
              <Link to="/premium" className="btn btn-sm community-btn-premium">See plans</Link>
            </section>
          )}
        </aside>
      </div>

      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </div>
  );
}

function CategoryTag({ category }) {
  const meta = CATEGORY_BY_VALUE[category];
  return meta ? <span className={`community-tag tag-${meta.tone}`}>{meta.tag}</span> : null;
}

function ActionLink({ action, onOpen, className }) {
  if (!action) return null;
  return <Link to={action.to} className={className} onClick={onOpen}>{action.label}</Link>;
}

function PinnedAnnouncement({ item, unread, onOpen }) {
  const meta = CATEGORY_BY_VALUE[item.category];
  const Icon = meta?.icon ?? Pin;
  return (
    <article className="community-card community-pinned" aria-labelledby={`announcement-${item.id}`}>
      <div className={`community-pinned-banner cover-${meta?.tone === "amber" ? "blue" : meta?.tone ?? "blue"}`}>
        <span className="community-access community-pinned-flag"><Pin size={12} aria-hidden="true" /> Pinned</span>
        {item.imageUrl ? <img src={item.imageUrl} alt="" /> : <Icon size={56} strokeWidth={1.5} aria-hidden="true" />}
      </div>
      <div className="community-pinned-body">
        <p className="community-announcement-meta">
          <CategoryTag category={item.category} />
          <span>{fullDate.format(new Date(item.publishedAt))}{item.author ? ` · ${item.author}` : ""}</span>
          {unread && <span className="sr-only">Unread</span>}
        </p>
        <h2 id={`announcement-${item.id}`}>{item.title}</h2>
        <p className="community-announcement-body">{item.body}</p>
        {(item.action || item.secondaryAction) && (
          <div className="community-hackathon-buttons">
            <ActionLink action={item.action} onOpen={onOpen} className="btn btn-primary btn-sm" />
            {item.secondaryAction && (
              <a href={item.secondaryAction.href} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" onClick={onOpen}>
                <ExternalLink size={15} aria-hidden="true" /> {item.secondaryAction.label}<span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

function AnnouncementItem({ item, unread, premium, onOpen }) {
  const meta = CATEGORY_BY_VALUE[item.category];
  const Icon = meta?.icon ?? CircleAlert;
  const premiumLink = item.category === "premium" && !premium;
  return (
    <li className={`community-card community-announcement-item${unread ? " is-unread" : ""}`}>
      {unread && <span className="community-unread-dot" aria-hidden="true" />}
      <span className={`community-icon tone-${meta?.tone ?? "blue"}`}><Icon size={20} aria-hidden="true" /></span>
      <div className="min-w-0">
        <p className="community-announcement-meta">
          <CategoryTag category={item.category} />
          <span>{fullDate.format(new Date(item.publishedAt))}</span>
          {unread && <span className="sr-only">Unread</span>}
        </p>
        <h3>{item.title}</h3>
        <p className="community-announcement-body">{item.body}</p>
        <ActionLink
          action={premiumLink ? { ...item.action, to: "/premium" } : item.action}
          onOpen={onOpen}
          className={`community-announcement-link${item.category === "premium" ? " is-premium" : ""}`}
        />
      </div>
    </li>
  );
}
