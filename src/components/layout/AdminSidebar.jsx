import { NavLink, Link } from "react-router-dom";
import { Settings, X, LogOut } from "lucide-react";

import { adminNavigation } from "../../config/navigation";
import { useAuth } from "../../hooks/useAuth";

export default function AdminSidebar({
  open = false,
  onClose,
}) {
  const { logout } = useAuth();

  async function handleLogout() {
    await logout();
    window.location.href = "/login";
  }

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Close admin navigation"
          className="fixed inset-0 z-40 bg-gray-950/40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#17152a] text-white",
          "transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="rounded-xl bg-brand-600 p-2.5">
              <Settings size={23} />
            </div>

            <div>
              <p className="font-extrabold">CodeRise</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-purple-300">
                Administration
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close admin sidebar"
            className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {adminNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin"}
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-brand-600 text-white"
                      : "text-gray-300 hover:bg-white/10 hover:text-white",
                  ].join(" ")
                }
              >
                <Icon size={19} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white"
          >
            <LogOut size={19} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}