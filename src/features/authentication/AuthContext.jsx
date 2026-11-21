import { useEffect } from "react";

import { useAuthStore } from "../../store/authStore";
import { AUTH_BYPASS_ENABLED, AUTH_BYPASS_ROLE } from "../../config/devAuthBypass";

// Loads the signed-in account once when the app starts. Components read auth state
// through the useAuth() hook, which reads the Zustand store directly.
export function AuthProvider({ children }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <>
      {children}
      {AUTH_BYPASS_ENABLED && (
        <div
          role="status"
          style={{
            position: "fixed",
            bottom: 12,
            left: 12,
            zIndex: 9999,
            background: "#B45309",
            color: "#fff",
            font: "600 12px/1.2 system-ui, sans-serif",
            padding: "6px 10px",
            borderRadius: 8,
            pointerEvents: "none",
          }}
        >
          Login bypass ON · {AUTH_BYPASS_ROLE} (local only)
        </div>
      )}
    </>
  );
}
