import { Menu } from "lucide-react";
import NotificationBell from "./NotificationBell";

export default function StudentHeader({ onMenuClick }) {
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

        <p className="hidden text-sm font-semibold text-ink md:block">Student portal</p>
      </div>

      <NotificationBell to="/notifications" />
    </header>
  );
}
