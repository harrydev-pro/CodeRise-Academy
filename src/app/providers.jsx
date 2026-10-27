import { AuthProvider } from "../features/authentication/AuthContext";

export function AppProvider({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
