import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Check, CheckCheck, Clipboard, Clock, Crown, Megaphone, SquareCheck, UserPlus, Users } from "lucide-react";

import Loader from "../../../components/common/Loader";
import ErrorMessage from "../../../components/feedback/ErrorMessage";
import Toast from "../../../components/feedback/Toast";
import { useCommunityList } from "../listHooks";
import { formatDeadline, timeAgo } from "./projectHelpers";
import { getCommunityNotifications, markAllCommunityNotificationsRead, markCommunityNotificationRead } from "./projectsService";

// The "Community" tab of the Notifications page (S24, /notifications?tab=community).
// Data: GET /notifications/me?category=community (see projectsService.js).

const TYPE_STYLE = {
  join_request: { icon: UserPlus, tone: "blue" },
  deadline: { icon: Clock, tone: "amber" },
  announcement: { icon: Megaphone, tone: "blue" },
  project_reviewed: { icon: Clipboard, tone: "orange" },
  registration: { icon: Check, tone: "green" },
  team_active: { icon: Users, tone: "teal" },
  task_assigned: { icon: SquareCheck, tone: "sky" },
  new_project: { icon: Crown, tone: "purple" },
};

const DAY = 86400000;
function groupOf(iso) {
  const created = new Date(iso);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  if (created >= startOfToday) return "Today";
  if (Date.now() - created.getTime() < 7 * DAY) return "Earlier this week";
  return "Older";
}

const isInternal = (link) => typeof link === "string" && link.startsWith("/") && !link.startsWith("//");

export default function CommunityNotifications() {
  const first = useCommunityList(getCommunityNotifications, { before: "" });
  const [older, setOlder] = useState({ items: [], nextCursor: undefined });
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [readIds, setReadIds] = useState(() => new Set());
  const [allRead, setAllRead] = useState(false);
  const [marking, setMarking] = useState(false);
  const [toast, setToast] = useState(null);
  const closeToast = useCallback(() => setToast(null), [setToast]);

  if (first.loading) return <Loader label="Loading community notifications…" />;
  if (first.error) return <ErrorMessage message={first.error} onRetry={first.reload} />;

  const data = first.data;
  const sample = Boolean(data.isSample);
  const items = [...data.notifications, ...older.items];
  const nextCursor = older.nextCursor === undefined ? data.nextCursor : older.nextCursor;
  const isRead = (item) => allRead || item.read || readIds.has(item.id);
  const unread = items.filter((item) => !isRead(item)).length;

  function markRead(item) {
    if (isRead(item)) return;
    setReadIds((current) => new Set(current).add(item.id));
    markCommunityNotificationRead(item.id, { sample }).catch(() => {
      setReadIds((current) => { const next = new Set(current); next.delete(item.id); return next; });
    });
  }

  async function markAll() {
    setMarking(true);
    try {
      await markAllCommunityNotificationsRead({ sample });
      setAllRead(true);
    } catch (markError) {
      setToast({ type: "error", message: markError.message || "Could not update notifications." });
    } finally {
      setMarking(false);
    }
  }

  async function loadOlder() {
    setLoadingOlder(true);
    try {
      const result = await getCommunityNotifications({ before: nextCursor });
      setOlder((current) => ({ items: [...current.items, ...result.notifications], nextCursor: result.nextCursor }));
    } catch (loadError) {
      setToast({ type: "error", message: loadError.message || "Could not load older notifications." });
    } finally {
      setLoadingOlder(false);
    }
  }

  const groups = [];
  for (const item of items) {
    const label = groupOf(item.createdAt);
    const group = groups.find((entry) => entry.label === label);
    if (group) group.items.push(item);
    else groups.push({ label, items: [item] });
  }

  return (
    <div className="cmp-notifications">
      {sample && (
        <p className="community-sample-notice" role="status">
          Showing sample community notifications: the API is not available yet. This notice only appears on the local dev server.
        </p>
      )}

      <div className="cmp-notifications-bar">
        <p aria-live="polite">{unread ? `${unread} unread community ${unread === 1 ? "notification" : "notifications"}` : "No unread community notifications"}</p>
        {unread > 0 && (
          <button type="button" className="btn btn-outline btn-sm" onClick={markAll} disabled={marking}>
            <CheckCheck size={16} aria-hidden="true" /> {marking ? "Updating…" : "Mark all as read"}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="community-card community-empty">
          <span className="community-icon tone-blue"><Bell size={22} aria-hidden="true" /></span>
          <h2>No community notifications yet</h2>
          <p className="muted-text">Team requests, project reviews, deadlines and event updates will appear here.</p>
          <Link to="/community" className="btn btn-outline btn-sm">Go to Community</Link>
        </div>
      ) : (
        <div className="community-card cmp-notification-card">
          {groups.map((group) => (
            <section key={group.label} aria-label={group.label}>
              <h2 className="cmp-notification-group">{group.label}</h2>
              <ul className="cmp-notification-list">
                {group.items.map((item) => {
                  const style = TYPE_STYLE[item.type] ?? { icon: Bell, tone: "blue" };
                  const Icon = style.icon;
                  const read = isRead(item);
                  const internal = isInternal(item.link);
                  return (
                    <li key={item.id} className={read ? "" : "is-unread"}>
                      <span className={`community-icon tone-${style.tone}`} aria-hidden="true"><Icon size={19} /></span>
                      <div className="cmp-notification-body">
                        <h3>
                          {internal && !item.actionLabel && !item.linkLabel
                            ? <Link to={item.link} onClick={() => markRead(item)}>{item.title}</Link>
                            : item.title}
                        </h3>
                        <p>
                          {item.message}
                          {item.dueAt ? ` Due ${formatDeadline(item.dueAt)}.` : ""}
                          {internal && item.linkLabel && <> <Link to={item.link} onClick={() => markRead(item)}>{item.linkLabel}</Link></>}
                        </p>
                        {internal && item.actionLabel && (
                          <Link to={item.link} className="btn btn-outline btn-sm cmp-notification-action" onClick={() => markRead(item)}>{item.actionLabel}</Link>
                        )}
                      </div>
                      <div className="cmp-notification-side">
                        <time dateTime={item.createdAt}>{timeAgo(item.createdAt)}</time>
                        {!read && (
                          <button type="button" className="cmp-unread-dot" onClick={() => markRead(item)} aria-label={`Mark as read: ${item.title}`} title="Mark as read" />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      {nextCursor && (
        <button type="button" className="btn btn-outline btn-sm cmp-load-older" onClick={loadOlder} disabled={loadingOlder}>
          {loadingOlder ? "Loading…" : "Load older notifications"}
        </button>
      )}

      <Toast message={toast?.message} type={toast?.type} onClose={closeToast} />
    </div>
  );
}
