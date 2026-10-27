import { useState } from "react";
import { Menu, Bell, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function StudentHeader({ onMenuClick }) {
  const [search, setSearch] = useState("");

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between gap-4 border-b border-gray-100 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="rounded-xl p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div className="hidden items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 md:flex">
          <Search size={17} className="text-gray-400" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search learning materials..."
            aria-label="Search learning materials"
            className="w-52 bg-transparent py-2.5 text-sm outline-none lg:w-72"
          />
        </div>
      </div>

      <Link
        to="/student/notifications"
        aria-label="View notifications"
        className="relative rounded-xl border border-gray-200 p-2.5 text-gray-600 hover:bg-gray-50"
      >
        <Bell size={19} />
      </Link>
    </header>
  );
}