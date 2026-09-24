const mongoose = require("mongoose");

// ============================================================
// EMPLOYEE SCHEMA
// ============================================================

const employeeSchema = new mongoose.Schema(
  {
    // ==========================================================
    // NAME
    // ==========================================================

    name: {
      type: String,
      required: [true, "Employee name is required."],
      trim: true,
      minlength: [2, "Employee name must contain at least 2 characters."],
      maxlength: [100, "Employee name must not exceed 100 characters."],
    },

    // ==========================================================
    // EMAIL
    // ==========================================================

    email: {
      type: String,
      required: [true, "Employee email is required."],
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: [150, "Employee email must not exceed 150 characters."],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid employee email address.",
      ],
    },

    // ==========================================================
    // DEPARTMENT
    // ==========================================================

    department: {
      type: String,
      required: [true, "Department is required."],
      trim: true,
      minlength: [2, "Department must contain at least 2 characters."],
      maxlength: [100, "Department must not exceed 100 characters."],
    },

    // ==========================================================
    // ROLE
    // ==========================================================

    role: {
      type: String,
      required: [true, "Employee role is required."],
      trim: true,
      minlength: [2, "Role must contain at least 2 characters."],
      maxlength: [100, "Role must not exceed 100 characters."],
    },
  },

  {
    timestamps: true,
  },
);

// ============================================================
// EXPORT MODEL
// ============================================================

const Employee =
  mongoose.models.Employee || mongoose.model("Employee", employeeSchema);

module.exports = Employee;
