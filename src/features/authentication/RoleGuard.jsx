import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";

export default function RoleGuard({
  children,
  allowedRoles = [],
}) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}