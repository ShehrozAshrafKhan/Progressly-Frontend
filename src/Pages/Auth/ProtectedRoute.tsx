import { Navigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import type { JSX } from "react";

const ProtectedRoute = ({ allowedRoles, children }: { allowedRoles: string[], children: JSX.Element }) => {
  const { user } = useUser();

  if (!user) return <Navigate to="/login" />;

  const isAuthorized = user.roles.some((role) => allowedRoles.includes(role));

  return isAuthorized ? children : <Navigate to="/unauthorized" />;
};

export default ProtectedRoute;
