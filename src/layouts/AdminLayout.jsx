import { useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { Navigate, useLocation } from "react-router-dom";

import AdminSidebar from "../components/layout/AdminSidebar";
import AdminHeader from "../components/layout/AdminHeader";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/common/Loader";
import { adminNavigation } from "../config/navigation";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  const location = useLocation();
  const title = useMemo(() => {
    const activeItem = adminNavigation.find(({ path }) =>
      path === "/admin" ? location.pathname === path : location.pathname.startsWith(path),
    );
    return activeItem?.label || "Administration";
  }, [location.pathname]);

  if (loading) return <Loader fullScreen />;
  if (!user) return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  if (user.role !== "instructor") return <Navigate to="/dashboard" replace />;

  return (
    <div className="admin-layout min-h-screen">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="admin-layout-main min-h-screen lg:pl-72">
        <AdminHeader
          title={title}
          user={user}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
