import { useState } from "react";
import { Bell, CheckCircle2, Info } from "lucide-react";

import EmptyState from "../../components/common/EmptyState";
import { useApiResource } from "../../hooks/useApiResource";
import { requestData } from "../../services/api/dataClient";
import { formatDate } from "../../utils/formatDate";
import Loader from "../../components/common/Loader";
import ErrorMessage from "../../components/feedback/ErrorMessage";

export default function Notifications() {
  const { data: notifications, loading, error, reload } = useApiResource("/notifications/me", "notifications");
  const [markingRead, setMarkingRead] = useState(false);
  const [actionError, setActionError] = useState("");

  async function markAllRead() {
    setMarkingRead(true);
    setActionError("");
    try {
      await requestData("/notifications/read-all", null, { method: "POST", body: JSON.stringify({}) });
      reload();
    } catch (requestError) {
      setActionError(requestError.message || "Could not update notifications. Please try again.");
    } finally {
      setMarkingRead(false);
    }
  }

  if (loading) return <div className="student-page"><Loader label="Loading notifications…" /></div>;
  if (error) return <div className="student-page"><ErrorMessage message={error} onRetry={reload} /></div>;

  if (notifications.length === 0) {
    return (
      <div className="student-page">
        <div className="student-page-heading">
          <h1>Notifications</h1>
          <p>Updates about your learning and account.</p>
        </div>

        <EmptyState
          icon={Bell}
          title="You're all caught up"
          description="New notifications will appear here when available."
        />
      </div>
    );
  }

  const unreadCount = notifications.filter(
    (item) => !item.read
  ).length;

  return (
    <div className="student-page">
      <div className="student-page-heading notification-heading">
        <div>
          <span className="eyebrow">YOUR UPDATES</span>
          <h1>Notifications</h1>
          <p>
            You have {unreadCount} unread notification
            {unreadCount === 1 ? "" : "s"}.
          </p>
        </div>

        {actionError && <ErrorMessage message={actionError} />}
        {unreadCount > 0 && (
          <button
            className="secondary-action"
            onClick={markAllRead}
            disabled={markingRead}
          >
            {markingRead ? "Updating…" : "Mark all as read"}
          </button>
        )}
      </div>

      <div className="notification-list">
        {notifications.map((notification) => (
          <article
            className={`notification-card ${
              notification.read ? "" : "notification-unread"
            }`}
            key={notification.id}
          >
            <span className="notification-icon">
              {notification.read ? (
                <CheckCircle2 size={21} />
              ) : (
                <Info size={21} />
              )}
            </span>

            <div className="notification-content">
              <h2>{notification.title || "Academy update"}</h2>

              <p>
                {notification.message || notification.body || ""}
              </p>

              <time>
                {formatDate(notification.createdAt)}
              </time>
            </div>

            {!notification.read && (
              <span className="unread-dot" aria-label="Unread" />
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
