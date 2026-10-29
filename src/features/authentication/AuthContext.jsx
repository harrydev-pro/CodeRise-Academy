import { useEffect, useMemo } from "react";

import { AuthContext } from "./authContext";
import { useAuthStore } from "../../store/authStore";

export function AuthProvider({ children }) {
  const auth = useAuthStore();
  const initialize = auth.initialize;

  useEffect(() => {
    initialize();
  }, [initialize]);

  const value = useMemo(() => ({
    ...auth,
    login: auth.login,
    register: auth.register,
    logout: auth.logout,
    initialize: auth.initialize,
    setAuth: auth.setAuth,
    clearAuth: auth.clearAuth,
  }), [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
