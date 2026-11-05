import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCircle2, Info } from "lucide-react";

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
      api.post(`/notifications/${notification.id}/read`, {}).catch(() => {});
    }
    if (notification.link?.startsWith("/")) navigate(notification.link);
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
            <button
              type="button"
              className={`notification-card ${isRead(notification) ? "" : "notification-unread"}`}
              key={notification.id}
              onClick={() => open(notification)}
            >
              <span className="notification-icon">{isRead(notification) ? <CheckCircle2 size={21} aria-hidden="true" /> : <Info size={21} aria-hidden="true" />}</span>
              <span className="notification-content">
                <strong>{notification.title}</strong>
                <span>{notification.message}</span>
                <time dateTime={notification.createdAt}>{formatDate(notification.createdAt)}</time>
              </span>
              {!isRead(notification) && <span className="unread-dot" aria-label="Unread" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
