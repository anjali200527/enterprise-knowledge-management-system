const jwt = require("jsonwebtoken");

// ======================================================
// AUTHENTICATION MIDDLEWARE
// ======================================================

const protect = (req, res, next) => {
  try {
    // ==================================================
    // CHECK JWT SECRET
    // ==================================================

    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === "") {
      console.error("JWT_SECRET is not configured in .env");

      return res.status(500).json({
        success: false,
        message: "Authentication service is not configured.",
      });
    }

    // ==================================================
    // GET AUTHORIZATION HEADER
    // ==================================================

    const authorizationHeader = req.headers.authorization;

    if (
      typeof authorizationHeader !== "string" ||
      authorizationHeader.trim() === ""
    ) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Authentication token is required.",
      });
    }

    // ==================================================
    // CHECK BEARER FORMAT
    // ==================================================

    const parts = authorizationHeader.trim().split(/\s+/);

    if (parts.length !== 2) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid authentication format.",
      });
    }

    const [scheme, token] = parts;

    if (scheme.toLowerCase() !== "bearer" || !token || token.trim() === "") {
      return res.status(401).json({
        success: false,
        message: "Access denied. Invalid authentication format.",
      });
    }

    // ==================================================
    // VERIFY JWT
    // ==================================================

    const decoded = jwt.verify(token.trim(), process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    // ==================================================
    // VALIDATE DECODED TOKEN
    // ==================================================

    if (!decoded || typeof decoded !== "object") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    // ==================================================
    // VALIDATE USER ID
    // ==================================================

    if (!decoded.id || typeof decoded.id !== "string") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    // ==================================================
    // VALIDATE USER ROLE
    // ==================================================

    if (!decoded.role || typeof decoded.role !== "string") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token.",
      });
    }

    // ==================================================
    // ALLOWED ROLES
    // ==================================================

    const allowedRoles = ["Admin", "Manager", "Employee"];

    if (!allowedRoles.includes(decoded.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Invalid user role.",
      });
    }

    // ==================================================
    // SAVE AUTHENTICATED USER
    // ==================================================

    req.user = {
      id: decoded.id,
      email: typeof decoded.email === "string" ? decoded.email : undefined,
      role: decoded.role,
    };

    // ==================================================
    // AUTHENTICATION SUCCESS
    // ==================================================

    console.log("Authentication successful:", {
      id: req.user.id,
      role: req.user.role,
    });

    // ==================================================
    // CONTINUE REQUEST
    // ==================================================

    return next();
  } catch (error) {
    // ==================================================
    // TOKEN EXPIRED
    // ==================================================

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Authentication token has expired. Please login again.",
      });
    }

    // ==================================================
    // INVALID TOKEN
    // ==================================================

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token. Please login again.",
      });
    }

    // ==================================================
    // INVALID TOKEN CLAIMS / OTHER JWT ERROR
    // ==================================================

    if (error.name === "NotBeforeError") {
      return res.status(401).json({
        success: false,
        message: "Authentication token is not active yet.",
      });
    }

    // ==================================================
    // OTHER AUTHENTICATION ERROR
    // ==================================================

    console.error("Authentication Error:", error.message);

    return res.status(401).json({
      success: false,
      message: "Authentication failed. Please login again.",
    });
  }
};

// ======================================================
// EXPORT
// ======================================================

module.exports = protect;
