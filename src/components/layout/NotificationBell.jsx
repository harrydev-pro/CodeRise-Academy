import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { useApiResource } from "../../hooks/useApiResource";

// Bell with the unread count. The count refreshes on every page change.
export default function NotificationBell({ to }) {
  const { data, reload } = useApiResource("/notifications/unread-count", "count", 0);
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
  const count = Number(data) || 0;
  return (
    <Link to={to} aria-label={count ? `Notifications, ${count} unread` : "Notifications"} className="notification-bell">
      <Bell size={19} aria-hidden="true" />
      {count > 0 && <span className="notification-bell-count">{count > 99 ? "99+" : count}</span>}
    </Link>
  );
}
