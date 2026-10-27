import { NavLink, Link } from "react-router-dom";
import { LogOut, X, GraduationCap } from "lucide-react";

import { studentNavigation } from "../../config/navigation";
import { useAuth } from "../../hooks/useAuth";

export default function StudentSidebar({
  open = false,
  onClose,
}) {
  const { user, logout } = useAuth();

  async function handleLogout() {
    await logout();
    window.location.href = "/login";
  }

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-gray-950/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-gray-100 bg-white",
          "transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-gray-100 px-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="rounded-xl bg-brand-600 p-2.5 text-white">
              <GraduationCap size={23} />
            </div>

            <div>
              <p className="font-extrabold text-ink">
                CodeRise
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600">
                Student portal
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 hover:bg-gray-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="border-b border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-100 font-bold text-brand-700">
              {user?.fullName?.charAt(0)?.toUpperCase() ?? "S"}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">
                {user?.fullName ?? "Student"}
              </p>

              <p className="truncate text-xs text-gray-500">
                {user?.email ?? ""}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {studentNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/student/dashboard"}
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-ink",
                  ].join(" ")
                }
              >
                <Icon size={19} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut size={19} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}