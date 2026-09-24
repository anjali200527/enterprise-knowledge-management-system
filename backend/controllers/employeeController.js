const mongoose = require("mongoose");

const Employee = require("../models/Employee");

// ============================================================
// CONSTANTS
// ============================================================

const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 150;
const MAX_DEPARTMENT_LENGTH = 100;
const MAX_ROLE_LENGTH = 100;

// ============================================================
// HELPER: VALIDATE EMPLOYEE ID
// ============================================================

const isValidEmployeeId = (id) => {
  return typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
};

// ============================================================
// HELPER: VALIDATE STRING FIELD
// ============================================================

const isValidString = (value, maxLength) => {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maxLength
  );
};

// ============================================================
// HELPER: BASIC EMAIL VALIDATION
// ============================================================

const isValidEmail = (email) => {
  if (typeof email !== "string") {
    return false;
  }

  const trimmedEmail = email.trim();

  if (!trimmedEmail) {
    return false;
  }

  if (trimmedEmail.length > MAX_EMAIL_LENGTH) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
};

// ============================================================
// GET ALL EMPLOYEES
// GET /api/employees
// ============================================================

exports.getEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      employees,
    });
  } catch (error) {
    console.error("Get Employees Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch employees.",
    });
  }
};

// ============================================================
// GET SINGLE EMPLOYEE
// GET /api/employees/:id
// ============================================================

exports.getEmployeeById = async (req, res) => {
  try {
    const employeeId = req.params.id;

    // ========================================================
    // VALIDATE ID
    // ========================================================

    if (!isValidEmployeeId(employeeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID format.",
      });
    }

    // ========================================================
    // FIND EMPLOYEE
    // ========================================================

    const employee = await Employee.findById(employeeId).lean();

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    // ========================================================
    // SUCCESS
    // ========================================================

    return res.status(200).json({
      success: true,
      employee,
    });
  } catch (error) {
    console.error("Get Employee Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch employee.",
    });
  }
};

// ============================================================
// ADD EMPLOYEE
// POST /api/employees
// ============================================================

exports.addEmployee = async (req, res) => {
  try {
    const body = req.body || {};

    const name = typeof body.name === "string" ? body.name.trim() : "";

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    const department =
      typeof body.department === "string" ? body.department.trim() : "";

    const role = typeof body.role === "string" ? body.role.trim() : "";

    // ========================================================
    // REQUIRED FIELD VALIDATION
    // ========================================================

    if (
      !isValidString(name, MAX_NAME_LENGTH) ||
      !isValidEmail(email) ||
      !isValidString(department, MAX_DEPARTMENT_LENGTH) ||
      !isValidString(role, MAX_ROLE_LENGTH)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid name, email, department, and role.",
      });
    }

    // ========================================================
    // CHECK DUPLICATE EMAIL
    // ========================================================

    const existingEmployee = await Employee.findOne({
      email,
    }).lean();

    if (existingEmployee) {
      return res.status(409).json({
        success: false,
        message: "An employee with this email already exists.",
      });
    }

    // ========================================================
    // CREATE EMPLOYEE
    // ========================================================

    const employee = await Employee.create({
      name,
      email,
      department,
      role,
    });

    // ========================================================
    // SUCCESS
    // ========================================================

    return res.status(201).json({
      success: true,
      message: "Employee added successfully.",
      employee,
    });
  } catch (error) {
    console.error("Add Employee Error:", error.message);

    // ========================================================
    // DUPLICATE KEY
    // ========================================================

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An employee with this email already exists.",
      });
    }

    // ========================================================
    // MONGOOSE VALIDATION
    // ========================================================

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid employee data.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add employee.",
    });
  }
};

// ============================================================
// UPDATE EMPLOYEE
// PUT /api/employees/:id
// ============================================================

exports.updateEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;

    // ========================================================
    // VALIDATE ID
    // ========================================================

    if (!isValidEmployeeId(employeeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID format.",
      });
    }

    const body = req.body || {};

    const name = typeof body.name === "string" ? body.name.trim() : "";

    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    const department =
      typeof body.department === "string" ? body.department.trim() : "";

    const role = typeof body.role === "string" ? body.role.trim() : "";

    // ========================================================
    // VALIDATE INPUT
    // ========================================================

    if (
      !isValidString(name, MAX_NAME_LENGTH) ||
      !isValidEmail(email) ||
      !isValidString(department, MAX_DEPARTMENT_LENGTH) ||
      !isValidString(role, MAX_ROLE_LENGTH)
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid name, email, department, and role.",
      });
    }

    // ========================================================
    // CHECK EMPLOYEE EXISTS
    // ========================================================

    const existingEmployee = await Employee.findById(employeeId).lean();

    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    // ========================================================
    // CHECK DUPLICATE EMAIL
    // ========================================================

    const duplicateEmployee = await Employee.findOne({
      email,
      _id: {
        $ne: employeeId,
      },
    }).lean();

    if (duplicateEmployee) {
      return res.status(409).json({
        success: false,
        message: "Another employee with this email already exists.",
      });
    }

    // ========================================================
    // UPDATE EMPLOYEE
    // ========================================================

    const employee = await Employee.findByIdAndUpdate(
      employeeId,
      {
        name,
        email,
        department,
        role,
      },
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    // ========================================================
    // SUCCESS
    // ========================================================

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully.",
      employee,
    });
  } catch (error) {
    console.error("Update Employee Error:", error.message);

    // ========================================================
    // DUPLICATE KEY
    // ========================================================

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An employee with this email already exists.",
      });
    }

    // ========================================================
    // MONGOOSE VALIDATION
    // ========================================================

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid employee data.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update employee.",
    });
  }
};

// ============================================================
// DELETE EMPLOYEE
// DELETE /api/employees/:id
// Admin only - enforced by employeeRoutes.js
// ============================================================

exports.deleteEmployee = async (req, res) => {
  try {
    const employeeId = req.params.id;

    // ========================================================
    // VALIDATE ID
    // ========================================================

    if (!isValidEmployeeId(employeeId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID format.",
      });
    }

    // ========================================================
    // DELETE EMPLOYEE
    // ========================================================

    const employee = await Employee.findByIdAndDelete(employeeId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    // ========================================================
    // SUCCESS
    // ========================================================

    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Employee Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete employee.",
    });
  }
};
