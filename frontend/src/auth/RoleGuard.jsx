import { Navigate } from "react-router-dom";

export default function RoleGuard({ allowedRole, children }) {
  const role = localStorage.getItem("role");

  if (role !== allowedRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
