const express = require("express");

const router = express.Router();

// ================= MIDDLEWARE =================

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// ================= CONTROLLERS =================

const {
  getRelationships,
  getRelationshipById,
  addRelationship,
  updateRelationship,
  deleteRelationship,
} = require("../controllers/relationshipController");

// ============================================================
// GET ALL RELATIONSHIPS
// GET /api/relationships
// All authenticated users
// ============================================================

router.get("/", protect, getRelationships);

// ============================================================
// GET SINGLE RELATIONSHIP
// GET /api/relationships/:id
// All authenticated users
// ============================================================

router.get("/:id", protect, getRelationshipById);

// ============================================================
// ADD RELATIONSHIP
// POST /api/relationships
// Admin + Manager
// ============================================================

router.post("/", protect, authorizeRoles("Admin", "Manager"), addRelationship);

// ============================================================
// UPDATE RELATIONSHIP
// PUT /api/relationships/:id
// Admin + Manager
// ============================================================

router.put(
  "/:id",
  protect,
  authorizeRoles("Admin", "Manager"),
  updateRelationship,
);

// ============================================================
// DELETE RELATIONSHIP
// DELETE /api/relationships/:id
// Admin only
// ============================================================

router.delete("/:id", protect, authorizeRoles("Admin"), deleteRelationship);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;
