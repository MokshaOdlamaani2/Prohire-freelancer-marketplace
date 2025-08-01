import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  if (!token || !user) return <Navigate to="/login" />;
  if (user.role !== role) return <Navigate to={`/${user.role}-dashboard`} />;

  return children;
};

export default ProtectedRoute;
