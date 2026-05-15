import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function RequireRole({ allow = [], children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (allow.length && !allow.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
