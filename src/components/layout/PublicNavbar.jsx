import { useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X, GraduationCap } from "lucide-react";

import Button from "../common/Button";
import { publicNavigation } from "../../config/navigation";
import { useAuth } from "../../hooks/useAuth";
import { homePathFor } from "../../utils/roles";
import ThemeToggle from "../../features/theme/ThemeToggle";

export default function PublicNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const { isAuthenticated, user } = useAuth();
  const dashboardPath = homePathFor(user);

  return (
    <header
      className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur"
      onKeyDown={(event) => {
        if (event.key === "Escape" && menuOpen) {
          setMenuOpen(false);
          menuButtonRef.current?.focus();
        }
      }}
    >
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

        <nav className="hidden items-center gap-8 lg:flex">
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

        <div className="hidden items-center gap-3 lg:flex">
          <ThemeToggle />
          {isAuthenticated ? (
            <Button as={Link} to={dashboardPath}>
              My Dashboard
            </Button>
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

              <Button
                as={Link}
                to="/register"
                className="public-navbar-auth-button"
              >
                Create account
              </Button>
            </>
          )}
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <ThemeToggle />
          <button
            ref={menuButtonRef}
            type="button"
            className="rounded-xl p-2 text-gray-700 hover:bg-gray-100"
            onClick={() => setMenuOpen((value) => !value)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="public-mobile-menu"
          >
            {menuOpen ? <X size={23} /> : <Menu size={23} />}
          </button>
        </div>
      </div>

      <div
        id="public-mobile-menu"
        hidden={!menuOpen}
        className="border-t border-gray-100 bg-white px-4 py-5 lg:hidden"
      >
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
            <Button
              as={Link}
              to={dashboardPath}
              className="w-full"
              onClick={() => setMenuOpen(false)}
            >
              My Dashboard
            </Button>
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

              <Button
                as={Link}
                to="/register"
                className="public-navbar-auth-button w-full"
                onClick={() => setMenuOpen(false)}
              >
                Create account
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
