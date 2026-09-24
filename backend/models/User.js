const mongoose = require("mongoose");

// ============================================================
// USER SCHEMA
// ============================================================

const userSchema = new mongoose.Schema(
  {
    // ==========================================================
    // USERNAME
    // ==========================================================

    username: {
      type: String,
      required: [true, "Username is required."],
      trim: true,
      minlength: [2, "Username must contain at least 2 characters."],
      maxlength: [100, "Username must not exceed 100 characters."],
    },

    // ==========================================================
    // EMAIL
    // ==========================================================

    email: {
      type: String,
      required: [true, "Email is required."],
      trim: true,
      lowercase: true,
      unique: true,
      maxlength: [150, "Email must not exceed 150 characters."],
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please provide a valid email address.",
      ],
    },

    // ==========================================================
    // PASSWORD
    // ==========================================================

    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [8, "Password must contain at least 8 characters."],
      maxlength: [128, "Password must not exceed 128 characters."],
      select: false,
    },

    // ==========================================================
    // EMPLOYEE ID
    // ==========================================================

    employeeId: {
      type: String,
      trim: true,
      maxlength: [50, "Employee ID must not exceed 50 characters."],
      unique: true,
      sparse: true,
      default: undefined,
    },

    // ==========================================================
    // DEPARTMENT
    // ==========================================================

    department: {
      type: String,
      trim: true,
      maxlength: [100, "Department must not exceed 100 characters."],
      default: "",
    },

    // ==========================================================
    // DESIGNATION
    // ==========================================================

    designation: {
      type: String,
      trim: true,
      maxlength: [100, "Designation must not exceed 100 characters."],
      default: "",
    },

    // ==========================================================
    // ROLE
    // ==========================================================

    role: {
      type: String,
      enum: {
        values: ["Admin", "Manager", "Employee"],
        message: "Invalid user role.",
      },
      default: "Employee",
    },

    // ==========================================================
    // STATUS
    // ==========================================================

    status: {
      type: String,
      enum: {
        values: ["Active", "Inactive"],
        message: "Invalid user status.",
      },
      default: "Active",
    },

    // ==========================================================
    // PASSWORD RESET TOKEN
    // ==========================================================

    resetPasswordToken: {
      type: String,
      default: null,
      select: false,
    },

    // ==========================================================
    // PASSWORD RESET EXPIRY
    // ==========================================================

    resetPasswordExpires: {
      type: Date,
      default: null,
      select: false,
    },
  },

  {
    timestamps: true,
  },
);

// ============================================================
// EXPORT MODEL
// ============================================================

const User = mongoose.models.User || mongoose.model("User", userSchema);

module.exports = User;
