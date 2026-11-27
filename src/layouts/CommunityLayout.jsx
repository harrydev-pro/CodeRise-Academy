import { NavLink, Outlet } from "react-router-dom";

import { communityTabs } from "../config/navigation";

// Wraps every /community screen with the Community tab bar. It sits inside StudentLayout,
// so the student sidebar, header and sign-in check still apply.
export default function CommunityLayout() {
  return (
    <div className="community">
      <nav className="community-tabs" aria-label="Community sections">
        {communityTabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.path === "/community"}
            className={({ isActive }) => `community-tab${isActive ? " active" : ""}`}
          >
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
