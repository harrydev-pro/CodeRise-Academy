import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCircle2, Info, Trash2 } from "lucide-react";

import EmptyState from "../../components/common/EmptyState";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";
import { PageHeader } from "../../components/ui";
import { useApiResource } from "../../hooks/useApiResource";
import { api } from "../../services/api/api";
import { formatDate } from "../../utils/formatDate";

export default function Notifications() {
  const navigate = useNavigate();
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

  if (loading) return <div className="student-page"><Loader label="Loading notifications…" /></div>;
  if (error) return <div className="student-page"><ErrorMessage message={error} onRetry={reload} /></div>;
  const isRead = (item) => item.read || readNow.has(item.id);
  const unread = notifications.filter((item) => !isRead(item)).length;

  return (
    <div className="student-page">
      <PageHeader
        eyebrow="YOUR UPDATES"
        title="Notifications"
        description={unread ? `You have ${unread} unread notification${unread === 1 ? "" : "s"}.` : "You're all caught up."}
        actions={unread > 0 && <button type="button" className="btn btn-outline btn-sm" onClick={markAllRead} disabled={busy}>{busy ? "Updating…" : "Mark all as read"}</button>}
      />
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
