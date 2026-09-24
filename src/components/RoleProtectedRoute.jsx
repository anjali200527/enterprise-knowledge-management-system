import { Navigate } from "react-router-dom";

function RoleProtectedRoute({ children, allowedRoles }) {
  // ================= GET TOKEN =================

  const token = localStorage.getItem("token");

  // ================= GET USER =================

  const storedUser = localStorage.getItem("user");

  // ================= LOGIN CHECK =================

  if (!token || !storedUser) {
    return <Navigate to="/" replace />;
  }

  let user;

  // ================= PARSE USER DATA =================

  try {
    user = JSON.parse(storedUser);
  } catch (error) {
    console.error("Invalid user data:", error);

    
localStorage.removeItem("token");
localStorage.removeItem("user");

return (
  <Navigate
    to="/"
    replace
  />
);
;
  }

  // ================= VALIDATE ROLE =================

  if (!user || !user.role) {
    return <Navigate to="/dashboard" replace />;
  }

  // ================= ROLE ACCESS CHECK =================

  if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
    console.error("allowedRoles is missing or invalid");

    
return (
  <Navigate
    to="/dashboard"
    replace
  />
);
;
  }

  // ================= CHECK USER ROLE =================

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // ================= ALLOW ACCESS =================

  return children;
}

export default RoleProtectedRoute;
