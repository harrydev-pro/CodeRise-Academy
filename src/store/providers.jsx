import { AuthProvider } from "../features/authentication/AuthContext.jsx";

export function AppProvider({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
