import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  // User is not logged in
  if (!token || token.trim() === "") {
    return <Navigate to="/" replace />;
  }

  // User is logged in
  return children;
}

export default ProtectedRoute;

