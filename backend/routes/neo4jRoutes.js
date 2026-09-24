const express = require("express");

const router = express.Router();

// ============================================================
// MIDDLEWARE
// ============================================================

const protect = require("../middleware/authMiddleware");

// ============================================================
// CONTROLLER
// ============================================================

const { getNeo4jGraph } = require("../controllers/neo4jController");

// ============================================================
// TEST ROUTE
// GET /api/neo4j/test
// Logged-in users only
// ============================================================

router.get("/test", protect, (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Neo4j Route Working",
  });
});

// ============================================================
// GET NEO4J KNOWLEDGE GRAPH
// GET /api/neo4j/graph
// Logged-in users only
// ============================================================

router.get("/graph", protect, getNeo4jGraph);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;
