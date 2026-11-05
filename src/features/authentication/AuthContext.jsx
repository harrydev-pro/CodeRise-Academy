import { useEffect } from "react";

import { useAuthStore } from "../../store/authStore";

// Loads the signed-in account once when the app starts. Components read auth state
// through the useAuth() hook, which reads the Zustand store directly.
export function AuthProvider({ children }) {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return children;
}
