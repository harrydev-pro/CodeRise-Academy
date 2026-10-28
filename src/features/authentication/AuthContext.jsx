import { useMemo } from "react";

import { AuthContext } from "./authContext";
import { useAuthStore } from "../../store/authStore";

export function AuthProvider({ children }) {
  const auth = useAuthStore();

  const value = useMemo(() => ({
    ...auth,
    login: auth.login,
    register: auth.register,
    logout: auth.logout,
    setAuth: auth.setAuth,
    clearAuth: auth.clearAuth,
  }), [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
