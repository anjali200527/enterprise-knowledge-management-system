const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // ==================================================
    // CHECK AUTHENTICATION
    // ==================================================

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Authentication is required.",
      });
    }

    // ==================================================
    // CHECK USER ROLE
    // ==================================================

    if (typeof req.user.role !== "string" || req.user.role.trim() === "") {
      return res.status(403).json({
        success: false,
        message: "Access denied. User role is not available.",
      });
    }

    // ==================================================
    // CHECK ALLOWED ROLES CONFIGURATION
    // ==================================================

    if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) {
      console.error("Role authorization error: No allowed roles configured.");

      return res.status(500).json({
        success: false,
        message: "Authorization configuration error.",
      });
    }

    // ==================================================
    // NORMALIZE USER ROLE
    // ==================================================

    const userRole = req.user.role.trim();

    // ==================================================
    // NORMALIZE ALLOWED ROLES
    // ==================================================

    const normalizedAllowedRoles = allowedRoles
      .filter((role) => typeof role === "string" && role.trim() !== "")
      .map((role) => role.trim());

    // ==================================================
    // CHECK ROLE PERMISSION
    // ==================================================

    if (!normalizedAllowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied. You do not have permission to perform this action.",
      });
    }

    // ==================================================
    // ACCESS GRANTED
    // ==================================================

    return next();
  };
};

// ======================================================
// EXPORT
// ======================================================

module.exports = authorizeRoles;
