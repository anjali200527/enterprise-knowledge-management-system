const mongoose = require("mongoose");

const Project = require("../models/Project");

// ============================================================
// CONSTANTS
// ============================================================

const MAX_PROJECT_NAME_LENGTH = 150;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_DEPARTMENT_LENGTH = 100;
const MAX_MANAGER_LENGTH = 150;

const ALLOWED_STATUSES = [
  "Planning",
  "In Progress",
  "Completed",
  "On Hold",
  "Cancelled",
];

// ============================================================
// HELPER: VALIDATE PROJECT ID
// ============================================================

const isValidProjectId = (id) => {
  return typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
};

// ============================================================
// HELPER: VALIDATE STRING
// ============================================================

const isValidString = (value, maxLength) => {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maxLength
  );
};

// ============================================================
// GET ALL PROJECTS
// GET /api/projects
// ============================================================

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Get Projects Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch projects.",
    });
  }
};

// ============================================================
// GET SINGLE PROJECT
// GET /api/projects/:id
// ============================================================

exports.getProjectById = async (req, res) => {
  try {
    const projectId = req.params.id;

    // ========================================================
    // VALIDATE ID
    // ========================================================

    if (!isValidProjectId(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID format.",
      });
    }

    // ========================================================
    // FIND PROJECT
    // ========================================================

    const project = await Project.findById(projectId).lean();

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    return res.status(200).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error("Get Project Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch project.",
    });
  }
};

// ============================================================
// ADD PROJECT
// POST /api/projects
// Admin + Manager
// ============================================================

exports.addProject = async (req, res) => {
  try {
    const body = req.body || {};

    // ========================================================
    // NORMALIZE INPUT
    // ========================================================

    const projectName =
      typeof body.projectName === "string" ? body.projectName.trim() : "";

    const description =
      typeof body.description === "string" ? body.description.trim() : "";

    const department =
      typeof body.department === "string" ? body.department.trim() : "";

    const projectManager =
      typeof body.projectManager === "string" ? body.projectManager.trim() : "";

    const status =
      typeof body.status === "string" ? body.status.trim() : "Planning";

    const startDate = body.startDate ? new Date(body.startDate) : null;
    const endDate = body.endDate ? new Date(body.endDate) : null;

    // ========================================================
    // VALIDATE REQUIRED FIELDS
    // ========================================================

    if (
      !isValidString(projectName, MAX_PROJECT_NAME_LENGTH) ||
      !isValidString(description, MAX_DESCRIPTION_LENGTH) ||
      !isValidString(department, MAX_DEPARTMENT_LENGTH) ||
      !isValidString(projectManager, MAX_MANAGER_LENGTH)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide valid project name, description, department, and project manager.",
      });
    }

    // ========================================================
    // VALIDATE STATUS
    // ========================================================

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project status.",
      });
    }

    // ========================================================
    // CREATE PROJECT
    // ========================================================

    const project = await Project.create({
      projectName,
      description,
      department,
      projectManager,
      status,
      startDate,
      endDate,
    });

    // ========================================================
    // SUCCESS
    // ========================================================

    return res.status(201).json({
      success: true,
      message: "Project added successfully.",
      project,
    });
  } catch (error) {
    console.error("Add Project Error:", error.message);

    // ========================================================
    // MONGOOSE VALIDATION ERROR
    // ========================================================

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid project data.",
      });
    }

    // ========================================================
    // DUPLICATE KEY
    // ========================================================

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A project with the same unique value already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add project.",
    });
  }
};

// ============================================================
// UPDATE PROJECT
// PUT /api/projects/:id
// Admin + Manager
// ============================================================

exports.updateProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    // ========================================================
    // VALIDATE ID
    // ========================================================

    if (!isValidProjectId(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID format.",
      });
    }

    const body = req.body || {};

    // ========================================================
    // NORMALIZE INPUT
    // ========================================================

    const projectName =
      typeof body.projectName === "string" ? body.projectName.trim() : "";

    const description =
      typeof body.description === "string" ? body.description.trim() : "";

    const department =
      typeof body.department === "string" ? body.department.trim() : "";

    const projectManager =
      typeof body.projectManager === "string" ? body.projectManager.trim() : "";

    const status = typeof body.status === "string" ? body.status.trim() : "";

    const startDate = body.startDate ? new Date(body.startDate) : null;
    const endDate = body.endDate ? new Date(body.endDate) : null;

    // ========================================================
    // VALIDATE INPUT
    // ========================================================

    if (
      !isValidString(projectName, MAX_PROJECT_NAME_LENGTH) ||
      !isValidString(description, MAX_DESCRIPTION_LENGTH) ||
      !isValidString(department, MAX_DEPARTMENT_LENGTH) ||
      !isValidString(projectManager, MAX_MANAGER_LENGTH)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide valid project name, description, department, and project manager.",
      });
    }

    // ========================================================
    // VALIDATE STATUS
    // ========================================================

    if (!ALLOWED_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project status.",
      });
    }

    // ========================================================
    // UPDATE PROJECT
    // ========================================================

    const project = await Project.findByIdAndUpdate(
      projectId,
      {
        projectName,
        description,
        department,
        projectManager,
        status,
        startDate,
        endDate,
      },
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    // ========================================================
    // PROJECT NOT FOUND
    // ========================================================

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // ========================================================
    // SUCCESS
    // ========================================================

    return res.status(200).json({
      success: true,
      message: "Project updated successfully.",
      project,
    });
  } catch (error) {
    console.error("Update Project Error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid project data.",
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A project with the same unique value already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update project.",
    });
  }
};

// ============================================================
// DELETE PROJECT
// DELETE /api/projects/:id
// Admin only - enforced by projectRoutes.js
// ============================================================

exports.deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    // ========================================================
    // VALIDATE ID
    // ========================================================

    if (!isValidProjectId(projectId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID format.",
      });
    }

    // ========================================================
    // DELETE PROJECT
    // ========================================================

    const project = await Project.findByIdAndDelete(projectId);

    // ========================================================
    // PROJECT NOT FOUND
    // ========================================================

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }

    // ========================================================
    // SUCCESS
    // ========================================================

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Project Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete project.",
    });
  }
};
