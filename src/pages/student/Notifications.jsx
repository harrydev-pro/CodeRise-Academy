import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Bell, CheckCheck, CheckCircle2, Info, Trash2 } from "lucide-react";

import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { PageHeader } from "../../components/ui";
import CommunityNotifications from "../../features/community/projects/CommunityNotifications";
import { useApiResource } from "../../hooks/useApiResource";
import { api } from "../../services/api/api";
import { formatDate } from "../../utils/formatDate";

// Filter tabs from the S24 design: All · Applications · Projects · Courses · Community.
const TABS = [
  { value: "all", label: "All" },
  { value: "applications", label: "Applications" },
  { value: "projects", label: "Projects" },
  { value: "courses", label: "Courses" },
  { value: "community", label: "Community" },
];
const EMPTY_TEXT = {
  all: "Updates about your applications, projects, and courses appear here.",
  applications: "Updates about your program applications appear here.",
  projects: "Updates about your learning-track projects and quizzes appear here.",
  courses: "Updates about your video courses appear here.",
};

// Which tab a notification belongs to. Uses the backend's `category` when it sends one,
// otherwise works it out from the page the notification links to.
function categoryOf(notification) {
  if (notification.category) return notification.category;
  const link = notification.link ?? "";
  if (/^\/(my-applications|apply|application-confirmation|payments)/.test(link)) return "applications";
  if (/^\/(free-learning|my-submissions|my-results)/.test(link)) return "projects";
  if (/^\/(video-courses|my-video-courses|my-learning)/.test(link)) return "courses";
  if (/^\/(community|premium)/.test(link)) return "community";
  return "other";
}

export default function Notifications() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = TABS.some((item) => item.value === searchParams.get("tab")) ? searchParams.get("tab") : "all";
  const { data: notifications, loading, error, reload } = useApiResource("/notifications/me", "notifications");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [readNow, setReadNow] = useState(() => new Set());
  const [removing, setRemoving] = useState(() => new Set());
  // Unread count reported by the Community tab once it has loaded its own feed.
  const [communityUnreadLive, setCommunityUnreadLive] = useState(null);

  useEffect(() => {
    const refresh = () => { if (document.visibilityState === "visible") reload(); };
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [reload]);

  async function markAllRead() {
    setBusy(true);
    setActionError("");
    try {
      await api.post("/notifications/read-all", {});
      reload();
    } catch (requestError) {
      setActionError(requestError.message || "Could not update notifications.");
    } finally {
      setBusy(false);
    }
  }

  async function open(notification) {
    if (!notification.read && !readNow.has(notification.id)) {
      setReadNow((previous) => new Set(previous).add(notification.id));
      try {
        await api.post(`/notifications/${notification.id}/read`, {});
      } catch (requestError) {
        setReadNow((previous) => { const next = new Set(previous); next.delete(notification.id); return next; });
        setActionError(requestError.message || "Could not mark this notification as read.");
        return;
      }
    }
    if (notification.link?.startsWith("/")) navigate(notification.link);
  }

  async function remove(notificationId) {
    setRemoving((previous) => new Set(previous).add(notificationId));
    setActionError("");
    try {
      await api.delete(`/notifications/${notificationId}`);
      reload();
    } catch (requestError) {
      setActionError(requestError.message || "Could not remove this notification.");
    } finally {
      setRemoving((previous) => { const next = new Set(previous); next.delete(notificationId); return next; });
    }
  }

  function selectTab(next) {
    setSearchParams((current) => {
      const params = new URLSearchParams(current);
      if (next === "all") params.delete("tab");
      else params.set("tab", next);
      return params;
    });
  }

  const isRead = (item) => item.read || readNow.has(item.id);
  const feed = Array.isArray(notifications) ? notifications : [];
  const unreadIn = (value) => feed.filter((item) => !isRead(item) && (value === "all" || categoryOf(item) === value)).length;
  const counts = Object.fromEntries(TABS.map((item) => [item.value, unreadIn(item.value)]));
  if (communityUnreadLive !== null) counts.community = communityUnreadLive;

  const tabs = (
    <div className="ui-tabs notification-tabs" role="group" aria-label="Filter notifications">
      {TABS.map((item) => (
        <button key={item.value} type="button" className={tab === item.value ? "active" : ""} aria-pressed={tab === item.value} onClick={() => selectTab(item.value)}>
          {item.label}
          {counts[item.value] > 0 && <span className="ui-tab-count"><span className="sr-only">, </span>{counts[item.value]}<span className="sr-only"> unread</span></span>}
        </button>
      ))}
    </div>
  );

  const header = (actions) => (
    <PageHeader
      eyebrow="YOUR UPDATES"
      title="Notifications"
      description="Updates about your applications, projects, courses and the community."
      actions={actions}
    />
  );

  if (tab === "community") {
    return (
      <div className="student-page">
        <CommunityNotifications header={header} tabs={tabs} onUnreadChange={setCommunityUnreadLive} />
      </div>
    );
  }

  const markAllButton = counts.all > 0 && (
    <button type="button" className="btn btn-outline btn-sm" onClick={markAllRead} disabled={busy}>
      <CheckCheck size={16} aria-hidden="true" /> {busy ? "Updating…" : "Mark all as read"}
    </button>
  );

  if (loading) return <div className="student-page">{header(null)}{tabs}<Loader label="Loading notifications…" /></div>;
  if (error) return <div className="student-page">{header(null)}{tabs}<ErrorMessage message={error} onRetry={reload} /></div>;

  const shown = tab === "all" ? feed : feed.filter((item) => categoryOf(item) === tab);

  return (
    <div className="student-page">
      {header(markAllButton)}
      {tabs}
      {actionError && <ErrorMessage message={actionError} />}
      {shown.length === 0 ? (
        <EmptyState icon={Bell} title={tab === "all" ? "No notifications yet" : `No ${TABS.find((item) => item.value === tab).label.toLowerCase()} notifications`} description={EMPTY_TEXT[tab]} />
      ) : (
        <div className="notification-list">
          {shown.map((notification) => (
            <article
              className={`notification-card ${isRead(notification) ? "" : "notification-unread"}`}
              key={notification.id}
            >
              <button type="button" className="notification-open" onClick={() => open(notification)} aria-label={`${isRead(notification) ? "Read" : "Mark as read"}: ${notification.title}`}>
                <span className="notification-icon">{isRead(notification) ? <CheckCircle2 size={21} aria-hidden="true" /> : <Info size={21} aria-hidden="true" />}</span>
                <span className="notification-content">
                <strong>{notification.title}</strong>
                <span>{notification.message}</span>
                <time dateTime={notification.createdAt}>{formatDate(notification.createdAt)}</time>
                </span>
                {!isRead(notification) && <span className="unread-dot" aria-label="Unread" />}
              </button>
              <button type="button" className="notification-remove" onClick={() => remove(notification.id)} disabled={removing.has(notification.id)} aria-label={`Remove notification: ${notification.title}`} title="Remove notification">
                <Trash2 size={17} aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
