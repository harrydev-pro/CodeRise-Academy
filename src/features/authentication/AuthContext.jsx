import {
  createContext,
  useCallback,
  useState,
} from "react";

import {
  getAuthenticatedUser,
  loginUser,
  logoutUser,
  registerUser,
} from "./authService";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getAuthenticatedUser);
  const loading = false;

  const register = useCallback(async (form) => {
    return registerUser(form);
  }, []);

  const login = useCallback(async (form) => {
    const result = await loginUser(form);

    if (result.success) {
      setUser(result.user);
    }

    return result;
  }, []);

  const logout = useCallback(async () => {
    await logoutUser();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === "admin",
    register,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
