const express = require("express");

const router = express.Router();

// ================= MIDDLEWARE =================

const protect = require("../middleware/authMiddleware");

// ================= CONTROLLERS =================

const {
  register,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");

// ============================================================
// TEST ROUTE
// GET /api/users
// Public route
// ============================================================

router.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "User Route Working",
  });
});

// ============================================================
// REGISTER
// POST /api/users/register
// Public route
// ============================================================

router.post("/register", register);

// ============================================================
// LOGIN
// POST /api/users/login
// Public route
// ============================================================

router.post("/login", login);

// ============================================================
// CHANGE PASSWORD
// PUT /api/users/change-password
// Authenticated users only
// ============================================================

router.put("/change-password", protect, changePassword);

// ============================================================
// FORGOT PASSWORD
// POST /api/users/forgot-password
// Public route
// ============================================================

router.post("/forgot-password", forgotPassword);

// ============================================================
// RESET PASSWORD
// POST /api/users/reset-password
// Public route with secure reset token
// ============================================================

router.post("/reset-password", resetPassword);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;
