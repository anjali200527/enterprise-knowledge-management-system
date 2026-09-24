const Employee = require("../models/Employee");
const Project = require("../models/Project");
const Document = require("../models/Document");

const {
  searchRelevantChunks,
} = require("../services/ragSearchService");

const {
  generateGeminiResponse,
} = require("../services/geminiService");

// ================= CONSTANTS =================

const MAX_QUESTION_LENGTH = 2000;

// ================= AI ASSISTANT =================

exports.askAI = async (req, res) => {
  try {
    const { question } = req.body;

    // ==================================================
    // VALIDATION
    // ==================================================

    if (
      typeof question !== "string" ||
      question.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a question",
      });
    }

    const cleanQuestion = question.trim();

    if (
      cleanQuestion.length >
      MAX_QUESTION_LENGTH
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Question must not exceed 2000 characters.",
      });
    }

    const query =
      cleanQuestion.toLowerCase();

    // ==================================================
    // EMPLOYEE QUERIES
    // ==================================================

    // Show all employees

    if (
      query.includes("show all employees") ||
      query.includes("list employees")
    ) {
      const employees =
        await Employee.find()
          .sort({ createdAt: -1 })
          .limit(100)
          .lean();

      return res.status(200).json({
        success: true,
        answer: `There are ${employees.length} employees in the system.`,
        data: employees,
        type: "employees",
      });
    }

    // Development department

    if (
      query.includes("development")
    ) {
      const employees =
        await Employee.find({
          department: /development/i,
        })
          .sort({ createdAt: -1 })
          .limit(100)
          .lean();

      return res.status(200).json({
        success: true,
        answer: `There are ${employees.length} employees in the Development department.`,
        data: employees,
        type: "employees",
      });
    }

    // AI Research department

    if (
      query.includes("ai research")
    ) {
      const employees =
        await Employee.find({
          department: /ai research/i,
        })
          .sort({ createdAt: -1 })
          .limit(100)
          .lean();

      return res.status(200).json({
        success: true,
        answer: `There are ${employees.length} employees in the AI Research department.`,
        data: employees,
        type: "employees",
      });
    }

    // Employee count

    if (
      query.includes("how many employees") ||
      query.includes("number of employees") ||
      query === "employees"
    ) {
      const employeeCount =
        await Employee.countDocuments();

      return res.status(200).json({
        success: true,
        answer: `There are currently ${employeeCount} employees in the Enterprise Knowledge Management System.`,
        data: [],
        count: employeeCount,
        type: "employees",
      });
    }

    // ==================================================
    // PROJECT QUERIES
    // ==================================================

    // Show all projects

    if (
      query.includes("show all projects") ||
      query.includes("list projects")
    ) {
      const projects =
        await Project.find()
          .sort({ createdAt: -1 })
          .limit(100)
          .lean();

      return res.status(200).json({
        success: true,
        answer: `There are ${projects.length} projects in the system.`,
        data: projects,
        type: "projects",
      });
    }

    // Completed projects

    if (
      query.includes("completed project") ||
      query.includes("completed projects")
    ) {
      const projects =
        await Project.find({
          status: /completed/i,
        })
          .sort({ createdAt: -1 })
          .limit(100)
          .lean();

      return res.status(200).json({
        success: true,
        answer: `There are ${projects.length} completed projects.`,
        data: projects,
        type: "projects",
      });
    }

    // Planning projects

    if (
      query.includes("planning project") ||
      query.includes("planning projects")
    ) {
      const projects =
        await Project.find({
          status: /planning/i,
        })
          .sort({ createdAt: -1 })
          .limit(100)
          .lean();

      return res.status(200).json({
        success: true,
        answer: `There are ${projects.length} projects currently in the planning stage.`,
        data: projects,
        type: "projects",
      });
    }

    // In-progress projects

    if (
      query.includes("in progress project") ||
      query.includes("in progress projects") ||
      query.includes("ongoing project") ||
      query.includes("ongoing projects")
    ) {
      const projects =
        await Project.find({
          status: /in progress/i,
        })
          .sort({ createdAt: -1 })
          .limit(100)
          .lean();

      return res.status(200).json({
        success: true,
        answer: `There are ${projects.length} projects currently in progress.`,
        data: projects,
        type: "projects",
      });
    }

    // Project count

    if (
      query.includes("how many projects") ||
      query.includes("number of projects") ||
      query === "projects"
    ) {
      const projectCount =
        await Project.countDocuments();

      return res.status(200).json({
        success: true,
        answer: `There are currently ${projectCount} projects in the Enterprise Knowledge Management System.`,
        data: [],
        count: projectCount,
        type: "projects",
      });
    }

    // ==================================================
    // DOCUMENT QUERIES
    // ==================================================

    // Show all documents

    if (
      query.includes("show all documents") ||
      query.includes("list documents")
    ) {
      const documents =
        await Document.find()
          .sort({ createdAt: -1 })
          .limit(100)
          .lean();

      return res.status(200).json({
        success: true,
        answer: `There are ${documents.length} documents in the system.`,
        data: documents,
        type: "documents",
      });
    }

    // Active documents

    if (
      query.includes("active document") ||
      query.includes("active documents")
    ) {
      const documents =
        await Document.find({
          status: /active/i,
        })
          .sort({ createdAt: -1 })
          .limit(100)
          .lean();

      return res.status(200).json({
        success: true,
        answer: `There are ${documents.length} active documents.`,
        data: documents,
        type: "documents",
      });
    }

    // Archived documents

    if (
      query.includes("archived document") ||
      query.includes("archived documents")
    ) {
      const documents =
        await Document.find({
          status: /archived/i,
        })
          .sort({ createdAt: -1 })
          .limit(100)
          .lean();

      return res.status(200).json({
        success: true,
        answer: `There are ${documents.length} archived documents.`,
        data: documents,
        type: "documents",
      });
    }

    // Document count

    if (
      query.includes("how many documents") ||
      query.includes("number of documents") ||
      query === "documents"
    ) {
      const documentCount =
        await Document.countDocuments();

      return res.status(200).json({
        success: true,
        answer: `There are currently ${documentCount} documents in the Enterprise Knowledge Management System.`,
        data: [],
        count: documentCount,
        type: "documents",
      });
    }

    // ==================================================
    // SEARCH EMPLOYEE BY NAME
    // ==================================================

    if (
      query.startsWith("find employee ")
    ) {
      const employeeName =
        cleanQuestion
          .replace(/^find employee/i, "")
          .trim();

      if (!employeeName) {
        return res.status(400).json({
          success: false,
          message:
            "Please provide an employee name.",
        });
      }

      const employees =
        await Employee.find({
          name: {
            $regex: employeeName,
            $options: "i",
          },
        })
          .limit(50)
          .lean();

      return res.status(200).json({
        success: true,
        answer:
          employees.length > 0
            ? `Found ${employees.length} employee(s) matching "${employeeName}".`
            : `No employees found matching "${employeeName}".`,
        data: employees,
        type: "employees",
      });
    }

    // ==================================================
    // SEARCH PROJECT BY NAME
    // ==================================================

    if (
      query.startsWith("find project ")
    ) {
      const projectName =
        cleanQuestion
          .replace(/^find project/i, "")
          .trim();

      if (!projectName) {
        return res.status(400).json({
          success: false,
          message:
            "Please provide a project name.",
        });
      }

      const projects =
        await Project.find({
          projectName: {
            $regex: projectName,
            $options: "i",
          },
        })
          .limit(50)
          .lean();

      return res.status(200).json({
        success: true,
        answer:
          projects.length > 0
            ? `Found ${projects.length} project(s) matching "${projectName}".`
            : `No projects found matching "${projectName}".`,
        data: projects,
        type: "projects",
      });
    }

    // ==================================================
    // SEARCH DOCUMENT BY TITLE
    // ==================================================

    if (
      query.startsWith("find document ")
    ) {
      const documentTitle =
        cleanQuestion
          .replace(/^find document/i, "")
          .trim();

      if (!documentTitle) {
        return res.status(400).json({
          success: false,
          message:
            "Please provide a document title.",
        });
      }

      const documents =
        await Document.find({
          title: {
            $regex: documentTitle,
            $options: "i",
          },
        })
          .limit(50)
          .lean();

      return res.status(200).json({
        success: true,
        answer:
          documents.length > 0
            ? `Found ${documents.length} document(s) matching "${documentTitle}".`
            : `No documents found matching "${documentTitle}".`,
        data: documents,
        type: "documents",
      });
    }

    // ==================================================
    // RAG SEMANTIC SEARCH + GEMINI AI
    // ==================================================

    try {
      const relevantChunks = await searchRelevantChunks(
        cleanQuestion,
        3
      );

      if (relevantChunks && relevantChunks.length > 0) {
        const context = relevantChunks
          .map(
            (chunk, index) =>
              `Source ${index + 1}:
Title: ${chunk.title || "Untitled"}
Category: ${chunk.category || "N/A"}
Department: ${chunk.department || "N/A"}
Content:
${chunk.text || ""}`
          )
          .join("\n\n");

        console.log(
          `RAG found ${relevantChunks.length} relevant chunk(s).`
        );

        // Send retrieved knowledge to Gemini
        const aiAnswer = await generateGeminiResponse(
          cleanQuestion,
          context
        );

        return res.status(200).json({
          success: true,
          answer: aiAnswer,
          data: relevantChunks,
          context,
          type: "rag-ai",
        });
      }

      console.log("No relevant RAG chunks found.");
    } catch (ragGeminiError) {
      console.error(
        "RAG/Gemini Error:",
        ragGeminiError.message
      );

      // Continue to general response
    }

    // ==================================================
    // GENERAL RESPONSE
    // ==================================================

    return res.status(200).json({
      success: true,
      answer:
        "I can help you with Employees, Projects, Documents, and uploaded enterprise knowledge. Try questions such as: 'Show all employees', 'How many projects', 'Show completed projects', 'Show active documents', 'Find employee John', or ask a question about an uploaded document.",
      data: [],
      type: "general",
    });
  } catch (error) {
    console.error(
      "AI Assistant Error:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to process your question.",
    });
  }
};

