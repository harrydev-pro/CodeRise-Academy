import { useContext } from "react";

import { AuthContext } from "../features/authentication/authContext";
import { useAuthStore } from "../store/authStore";

export function useAuth() {
  const context = useContext(AuthContext);
  const store = useAuthStore();
  return context ?? store;
}