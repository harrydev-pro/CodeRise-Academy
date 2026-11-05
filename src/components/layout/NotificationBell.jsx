import { Link, useLocation } from "react-router-dom";
import { Bell } from "lucide-react";
import { useApiResource } from "../../hooks/useApiResource";

// Bell with the unread count. The count refreshes on every page change.
export default function NotificationBell({ to }) {
  const { pathname } = useLocation();
  const { data } = useApiResource(`/notifications/unread-count?at=${encodeURIComponent(pathname)}`, "count", 0);
  const count = Number(data) || 0;
  return (
    <Link to={to} aria-label={count ? `Notifications, ${count} unread` : "Notifications"} className="notification-bell">
      <Bell size={19} aria-hidden="true" />
      {count > 0 && <span className="notification-bell-count">{count > 99 ? "99+" : count}</span>}
    </Link>
  );
}
