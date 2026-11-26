import { useMemo, useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { Navigate, useLocation } from "react-router-dom";

import AdminSidebar from "../components/layout/AdminSidebar";
import AdminHeader from "../components/layout/AdminHeader";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/common/Loader";
import { adminNavigation } from "../config/navigation";
import { isAdminRole } from "../utils/roles";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const { user, loading } = useAuth();
  const location = useLocation();
  const title = useMemo(() => {
    const activeItem = adminNavigation.find(({ path }) =>
      path === "/admin" ? location.pathname === path : location.pathname.startsWith(path),
    );
    return activeItem?.label || "Administration";
  }, [location.pathname]);

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

      <div className="admin-layout-main min-h-screen lg:pl-72">
        <AdminHeader
          title={title}
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
