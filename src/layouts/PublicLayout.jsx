import { Outlet } from "react-router-dom";
import PublicNavbar from "../components/layout/PublicNavbar";
import PublicFooter from "../components/layout/PublicFooter";

export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      <main>
        <Outlet />
      </main>

      <PublicFooter />
    </div>
  );
}