import { useMemo, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { Navigate, useLocation } from "react-router-dom";

import AdminSidebar from "../components/layout/AdminSidebar";
import AdminHeader from "../components/layout/AdminHeader";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/common/Loader";
import { adminCommunityNavigation, adminNavigation } from "../config/navigation";
import { isAdminRole } from "../utils/roles";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const { user, loading } = useAuth();
  const location = useLocation();
  const { title, section } = useMemo(() => {
    const { pathname } = location;
    if (pathname === "/admin/community" || pathname.startsWith("/admin/community/")) {
      // Longest matching path wins, so /admin/community/projects is "Projects", not "Overview".
      const match = adminCommunityNavigation
        .filter(({ path }) => pathname === path || pathname.startsWith(`${path}/`))
        .sort((a, b) => b.path.length - a.path.length)[0];
      // Sub-pages get their own heading, e.g. "New project" / "Edit project".
      const singular = (match?.label ?? "item").toLowerCase().replace(/s$/, "");
      if (pathname.endsWith("/new")) return { title: `New ${singular}`, section: "Community" };
      if (pathname.endsWith("/edit")) return { title: `Edit ${singular}`, section: "Community" };
      return { title: match?.label || "Community", section: "Community" };
    }
    const activeItem = adminNavigation.find(({ path }) =>
      path === "/admin" ? pathname === path : pathname.startsWith(path),
    );
    return { title: activeItem?.label || "Administration", section: null };
  }, [location]);

  function closeSidebar() {
    setSidebarOpen(false);
    if (window.matchMedia("(max-width: 1023px)").matches) {
      menuButtonRef.current?.focus();
    }
  }

  if (loading) return <Loader fullScreen />;
  if (!user) return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  if (!isAdminRole(user.role)) return <Navigate to="/dashboard" replace />;

  return (
    <div className="admin-layout min-h-screen">
      <AdminSidebar
        open={sidebarOpen}
        onClose={closeSidebar}
      />

      <div className="admin-layout-main min-h-screen lg:pl-80">
        <AdminHeader
          title={title}
          section={section}
          user={user}
          menuButtonRef={menuButtonRef}
          menuOpen={sidebarOpen}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
