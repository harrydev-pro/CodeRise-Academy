import { AuthProvider } from "../features/authentication/AuthContext";

export function AppProviders({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}