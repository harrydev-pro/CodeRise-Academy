import { useRef, useState } from "react";
import { Outlet } from "react-router-dom";
import { Navigate, useLocation } from "react-router-dom";

import StudentSidebar from "../components/layout/StudentSidebar";
import StudentHeader from "../components/layout/StudentHeader";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/common/Loader";

export default function StudentLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const { user, loading } = useAuth();
  const location = useLocation();

  function closeSidebar() {
    setSidebarOpen(false);
    if (window.matchMedia("(max-width: 1023px)").matches) {
      menuButtonRef.current?.focus();
    }
  }

  if (loading) return <Loader fullScreen />;
  if (!user) return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  if (user.role !== "student") return <Navigate to="/admin" replace />;

  return (
    <div className="min-h-screen bg-surface">
      <StudentSidebar
        open={sidebarOpen}
        onClose={closeSidebar}
      />

      <div className="min-h-screen lg:pl-72">
        <StudentHeader
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
