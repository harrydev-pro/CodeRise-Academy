import { Menu, ExternalLink, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminHeader({
  title = "Admin dashboard",
  onMenuClick,
  user,
}) {
  const initials = (user?.name || user?.email || "Admin")
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  return (
    <header className="admin-header sticky top-0 z-30 flex h-[76px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open admin navigation"
          className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div className="min-w-0">
          <p className="admin-header-context">CODERISE ACADEMY <span>/</span> ADMIN</p>
          <h1 className="truncate text-lg font-bold text-ink sm:text-xl">{title}</h1>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <div className="admin-user-chip" title={user?.email || user?.name || "Administrator"}>
          <span className="admin-user-avatar"><ShieldCheck size={17} /></span>
          <span className="hidden max-w-36 truncate sm:block">{user?.name || "Instructor"}</span>
          <span className="admin-user-initials sm:hidden">{initials}</span>
        </div>
        <Link to="/" className="admin-site-link">
          <ExternalLink size={16} />
          <span className="hidden sm:inline">View website</span>
        </Link>
      </div>
    </header>
  );
}
