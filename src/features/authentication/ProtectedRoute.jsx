import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import Loader from "../../components/common/Loader";

export default function ProtectedRoute({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader fullScreen text="Checking your account..." />;
  }

  if (!isAuthenticated || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: {
            pathname: location.pathname,
            search: location.search,
          },
        }}
      />
    );
  }

  return children;
}