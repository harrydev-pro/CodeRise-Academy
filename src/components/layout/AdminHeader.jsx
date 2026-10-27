import { Menu, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

export default function AdminHeader({
  title = "Admin dashboard",
  onMenuClick,
}) {
  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between gap-4 border-b border-gray-100 bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open admin navigation"
          className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <h1 className="text-lg font-bold text-ink sm:text-xl">
          {title}
        </h1>
      </div>

      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 sm:text-sm"
      >
        <ExternalLink size={16} />
        <span className="hidden sm:inline">View website</span>
      </Link>
    </header>
  );
}