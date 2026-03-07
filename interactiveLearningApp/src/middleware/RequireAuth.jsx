import { Navigate, Outlet } from "react-router-dom";

const RequireAuth = ({ allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // admin | user

  // Not logged in
  if (!token) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  // Role-based protection (optional)
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;