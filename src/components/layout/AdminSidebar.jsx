import { useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { Settings, X, LogOut } from "lucide-react";

import { adminCommunityNavigation, adminNavigation } from "../../config/navigation";
import { useAuth } from "../../hooks/useAuth";

export default function AdminSidebar({
  open = false,
  onClose,
}) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const firstNavigationLink = useRef(null);

  useEffect(() => {
    if (open) firstNavigationLink.current?.focus();
  }, [open]);

  async function handleLogout() {
    await logout();
    navigate("/", { replace: true });
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
        id="admin-navigation"
        className={[
          "admin-sidebar app-sidebar fixed inset-y-0 left-0 z-50 flex w-72 flex-col text-white",
          "transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0 visible" : "-translate-x-full invisible lg:visible",
        ].join(" ")}
        onKeyDown={(event) => {
          if (open && event.key === "Escape") {
            event.preventDefault();
            onClose();
          }
        }}
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

        <nav aria-label="Admin navigation" className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {adminNavigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                ref={item.path === "/admin" ? firstNavigationLink : undefined}
                to={item.path}
                end={item.path === "/admin"}
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "admin-nav-link-active text-white"
                      : "text-gray-300 hover:bg-white/10 hover:text-white",
                  ].join(" ")
                }
              >
                <Icon size={19} />
                {item.label}
              </NavLink>
            );
          })}

          <div className="admin-nav-group" role="group" aria-labelledby="admin-community-heading">
            <p id="admin-community-heading" className="admin-nav-group-title">
              Community <span className="admin-nav-new">New</span>
            </p>
            {adminCommunityNavigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/admin/community"}
                onClick={onClose}
                className={({ isActive }) =>
                  [
                    "admin-nav-sublink flex items-center rounded-xl px-4 text-sm font-medium transition",
                    isActive
                      ? "admin-nav-link-active text-white"
                      : "text-gray-300 hover:bg-white/10 hover:text-white",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>
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
