const mongoose = require("mongoose");

// ============================================================
// PROJECT SCHEMA
// ============================================================

const projectSchema = new mongoose.Schema(
  {
    // ==========================================================
    // PROJECT NAME
    // ==========================================================

    projectName: {
      type: String,
      required: [true, "Project name is required."],
      trim: true,
      minlength: [2, "Project name must contain at least 2 characters."],
      maxlength: [150, "Project name must not exceed 150 characters."],
    },

    // ==========================================================
    // DESCRIPTION
    // ==========================================================

    description: {
      type: String,
      required: [true, "Project description is required."],
      trim: true,
      minlength: [2, "Project description must contain at least 2 characters."],
      maxlength: [5000, "Project description must not exceed 5000 characters."],
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
    // PROJECT MANAGER
    // ==========================================================

    projectManager: {
      type: String,
      required: [true, "Project manager is required."],
      trim: true,
      minlength: [2, "Project manager must contain at least 2 characters."],
      maxlength: [150, "Project manager must not exceed 150 characters."],
    },

    // ==========================================================
    // STATUS
    // ==========================================================

    status: {
      type: String,
      required: [true, "Project status is required."],
      enum: {
        values: ["Planning", "In Progress", "Completed"],
        message: "Invalid project status.",
      },
      default: "Planning",
    },

    // ==========================================================
    // START DATE
    // ==========================================================

    startDate: {
      type: Date,
      required: [true, "Project start date is required."],
    },

    // ==========================================================
    // END DATE
    // ==========================================================

    endDate: {
      type: Date,
      required: [true, "Project end date is required."],
      validate: {
        validator: function (value) {
          return !this.startDate || value >= this.startDate;
        },
        message: "End date cannot be earlier than start date.",
      },
    },
  },

  {
    timestamps: true,
  },
);

// ============================================================
// EXPORT MODEL
// ============================================================

const Project =
  mongoose.models.Project || mongoose.model("Project", projectSchema);

module.exports = Project;
