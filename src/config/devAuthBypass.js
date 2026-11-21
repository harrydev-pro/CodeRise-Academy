// Local-only login bypass for frontend work.
//
// Turn it on in `.env.local` (or `.env`), then restart `npm run dev`:
//   VITE_AUTH_BYPASS=true
//   VITE_AUTH_BYPASS_ROLE=student   # or "admin"
//
// It only works when all of these are true:
//   - the app runs under the Vite dev server (`import.meta.env.DEV`); production
//     builds compile this to `false`, so the bypass cannot ship;
//   - the page is opened on this machine (localhost, 127.0.0.1 or [::1]);
//   - VITE_AUTH_BYPASS is exactly "true".
// The backend is not bypassed: API calls that need a real session will still fail.

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);

function isLocalHost() {
  if (typeof window === "undefined") return false;
  return LOCAL_HOSTS.has(window.location.hostname);
}

const flag = String(import.meta.env.VITE_AUTH_BYPASS ?? "").trim().toLowerCase();

export const AUTH_BYPASS_ENABLED = import.meta.env.DEV && flag === "true" && isLocalHost();

const roleSetting = String(import.meta.env.VITE_AUTH_BYPASS_ROLE ?? "student").trim().toLowerCase();
export const AUTH_BYPASS_ROLE = roleSetting === "admin" ? "admin" : "student";

export function createBypassUser() {
  const isAdmin = AUTH_BYPASS_ROLE === "admin";
  const name = isAdmin ? "Local Admin" : "Local Student";
  return {
    id: `local-bypass-${AUTH_BYPASS_ROLE}`,
    name,
    fullName: name,
    email: isAdmin ? "admin@localhost" : "student@localhost",
    role: AUTH_BYPASS_ROLE,
    status: "active",
    phone_number: "",
    avatar_url: null,
    isBypassUser: true,
  };
}

if (AUTH_BYPASS_ENABLED) {
  console.warn(
    `[CodeRise] Local login bypass is ON (role: ${AUTH_BYPASS_ROLE}). Set VITE_AUTH_BYPASS=false to turn it off.`,
  );
}
