import { Bell, CheckCircle2, Info } from "lucide-react";

import EmptyState from "../../components/common/EmptyState";
import { useAuth } from "../../hooks/useAuth";
import { readStore, writeStore } from "../../services/storage/storageAdapter";
import { STORAGE_KEYS } from "../../services/storage/storageKeys";
import { formatDate } from "../../utils/formatDate";

export default function Notifications() {
  const { user } = useAuth();

  const allNotifications = readStore(
    STORAGE_KEYS.NOTIFICATIONS,
    []
  );

  const notifications = allNotifications
    .filter((item) => item.userId === user?.id)
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );

  function markAllRead() {
    const updated = allNotifications.map((item) =>
      item.userId === user?.id
        ? { ...item, read: true }
        : item
    );

    writeStore(STORAGE_KEYS.NOTIFICATIONS, updated);

    // Reloading is not required by React, but this demo page has no
    // notification context yet. Refresh the page to see persisted changes.
    window.location.reload();
  }

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

        {unreadCount > 0 && (
          <button
            className="secondary-action"
            onClick={markAllRead}
          >
            Mark all as read
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