const express = require("express");

const router = express.Router();

// ================= MIDDLEWARE =================

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// ================= CONTROLLERS =================

const {
  getProjects,
  getProjectById,
  addProject,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

// ============================================================
// TEST ROUTE
// GET /api/projects/test
// All authenticated users
// ============================================================

router.get("/test", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Project Route Working",
  });
});

// ============================================================
// GET ALL PROJECTS
// GET /api/projects
// Admin + Manager + Employee
// ============================================================

router.get("/", protect, getProjects);

// ============================================================
// GET SINGLE PROJECT
// GET /api/projects/:id
// Admin + Manager + Employee
// ============================================================

router.get("/:id", protect, getProjectById);

// ============================================================
// ADD PROJECT
// POST /api/projects
// Admin + Manager
// ============================================================

router.post("/", protect, authorizeRoles("Admin", "Manager"), addProject);

// ============================================================
// UPDATE PROJECT
// PUT /api/projects/:id
// Admin + Manager
// ============================================================

router.put("/:id", protect, authorizeRoles("Admin", "Manager"), updateProject);

// ============================================================
// DELETE PROJECT
// DELETE /api/projects/:id
// Admin only
// ============================================================

router.delete("/:id", protect, authorizeRoles("Admin"), deleteProject);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;
