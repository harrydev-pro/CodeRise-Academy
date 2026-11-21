import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, GraduationCap } from "lucide-react";

import Button from "../common/Button";
import { publicNavigation } from "../../config/navigation";
import { useAuth } from "../../hooks/useAuth";
import { homePathFor } from "../../utils/roles";

export default function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const dashboardPath = homePathFor(user);

  return (
    <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
            <GraduationCap size={25} />
          </div>

          <div>
            <span className="block text-lg font-extrabold tracking-tight text-ink">
              CodeRise
            </span>

            <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600">
              Academy
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {publicNavigation.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className="public-nav-link text-base font-medium text-gray-600"
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <Link to={dashboardPath}>
              <Button>My Dashboard</Button>
            </Link>
          ) : (
            <>
              <Button
                as={NavLink}
                to="/login"
                end
                variant="ghost"
                className="public-navbar-auth-button public-navbar-login"
              >
                Log in
              </Button>

              <Link to="/register">
                <Button className="public-navbar-auth-button">
                  Create account
                </Button>
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-xl p-2 text-gray-700 hover:bg-gray-100 md:hidden"
          onClick={() => setMenuOpen((value) => !value)}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-5 md:hidden">
          <nav className="flex flex-col gap-4">
            {publicNavigation.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className="public-nav-link text-base font-medium text-gray-600"
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}

            {isAuthenticated ? (
              <Link to={dashboardPath} onClick={() => setMenuOpen(false)}>
                <Button className="w-full">My Dashboard</Button>
              </Link>
            ) : (
              <>
                <Button
                  as={NavLink}
                  to="/login"
                  end
                  variant="ghost"
                  className="public-navbar-auth-button public-navbar-login w-full"
                  onClick={() => setMenuOpen(false)}
                >
                  Log in
                </Button>

                <Link to="/register" onClick={() => setMenuOpen(false)}>
                  <Button className="public-navbar-auth-button w-full">
                    Create account
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
