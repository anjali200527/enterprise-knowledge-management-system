const express = require("express");

const router = express.Router();

// ================= MIDDLEWARE =================

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

// ================= CONTROLLERS =================

const {
  getEmployees,
  getEmployeeById,
  addEmployee,
  updateEmployee,
  deleteEmployee,
} = require("../controllers/employeeController");

// ============================================================
// TEST ROUTE
// GET /api/employees/test
// All authenticated users
// ============================================================

router.get("/test", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Employee Route Working",
  });
});

// ============================================================
// GET ALL EMPLOYEES
// GET /api/employees
// Admin + Manager + Employee
// ============================================================

router.get("/", protect, getEmployees);

// ============================================================
// GET SINGLE EMPLOYEE
// GET /api/employees/:id
// Admin + Manager + Employee
// ============================================================

router.get("/:id", protect, getEmployeeById);

// ============================================================
// ADD EMPLOYEE
// POST /api/employees
// Admin + Manager
// ============================================================

router.post("/", protect, authorizeRoles("Admin", "Manager"), addEmployee);

// ============================================================
// UPDATE EMPLOYEE
// PUT /api/employees/:id
// Admin + Manager
// ============================================================

router.put("/:id", protect, authorizeRoles("Admin", "Manager"), updateEmployee);

// ============================================================
// DELETE EMPLOYEE
// DELETE /api/employees/:id
// Admin only
// ============================================================

router.delete("/:id", protect, authorizeRoles("Admin"), deleteEmployee);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;
