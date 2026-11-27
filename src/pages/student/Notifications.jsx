import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Bell, CheckCircle2, Info, Trash2 } from "lucide-react";

import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { PageHeader } from "../../components/ui";
import CommunityNotifications from "../../features/community/projects/CommunityNotifications";
import { useApiResource } from "../../hooks/useApiResource";
import { api } from "../../services/api/api";
import { formatDate } from "../../utils/formatDate";

export default function Notifications() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = searchParams.get("tab") === "community" ? "community" : "all";
  const { data: notifications, loading, error, reload } = useApiResource("/notifications/me", "notifications");
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [readNow, setReadNow] = useState(() => new Set());
  const [removing, setRemoving] = useState(() => new Set());

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

  // Community tab (S24): ?tab=community shows community notifications only.
  function selectTab(next) {
    setSearchParams((current) => {
      const params = new URLSearchParams(current);
      if (next === "community") params.set("tab", "community");
      else params.delete("tab");
      return params;
    });
  }
  const isRead = (item) => item.read || readNow.has(item.id);
  const feed = Array.isArray(notifications) ? notifications : [];
  const allUnread = feed.filter((item) => !isRead(item)).length;
  const communityUnread = feed.filter((item) => item.category === "community" && !isRead(item)).length;
  const tabs = (
    <div className="ui-tabs" role="group" aria-label="Filter notifications">
      <button type="button" className={tab === "all" ? "active" : ""} aria-pressed={tab === "all"} onClick={() => selectTab("all")}>
        All {allUnread > 0 && <span className="ui-tab-count">{allUnread}</span>}
      </button>
      <button type="button" className={tab === "community" ? "active" : ""} aria-pressed={tab === "community"} onClick={() => selectTab("community")}>
        Community {communityUnread > 0 && <span className="ui-tab-count">{communityUnread}</span>}
      </button>
    </div>
  );

  if (tab === "community") {
    return (
      <div className="student-page">
        <PageHeader eyebrow="YOUR UPDATES" title="Notifications" description="Updates about your applications, projects, courses and the community." />
        {tabs}
        <CommunityNotifications />
      </div>
    );
  }

  if (loading) return <div className="student-page"><Loader label="Loading notifications…" /></div>;
  if (error) return <div className="student-page">{tabs}<ErrorMessage message={error} onRetry={reload} /></div>;
  const unread = notifications.filter((item) => !isRead(item)).length;

  return (
    <div className="student-page">
      <PageHeader
        eyebrow="YOUR UPDATES"
        title="Notifications"
        description={unread ? `You have ${unread} unread notification${unread === 1 ? "" : "s"}.` : "You're all caught up."}
        actions={unread > 0 && <button type="button" className="btn btn-outline btn-sm" onClick={markAllRead} disabled={busy}>{busy ? "Updating…" : "Mark all as read"}</button>}
      />
      {tabs}
      {actionError && <ErrorMessage message={actionError} />}
      {notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications yet" description="Updates about your applications, projects, and courses appear here." />
      ) : (
        <div className="notification-list">
          {notifications.map((notification) => (
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
