const express = require("express");

const protect = require("../middleware/authMiddleware");

const Employee = require("../models/Employee");
const Project = require("../models/Project");
const Document = require("../models/Document");
const Relationship = require("../models/Relationship");

const { searchRelevantChunks } = require("../services/ragSearchService");
const { generateGeminiResponse } = require("../services/geminiService");

const router = express.Router();

// ============================================================
// SECURITY / LIMITS
// ============================================================

const MAX_QUESTION_LENGTH = 2000;
const MAX_RAG_RESULTS = 5;
const MIN_SIMILARITY = 0.5;
const MAX_GEMINI_SNIPPET_LENGTH = 1500;
const MAX_RESULT_TEXT_LENGTH = 2000;

// ============================================================
// HELPER FUNCTIONS
// ============================================================

const getId = (item) => {
  if (!item) {
    return "";
  }

  return item?._id?.toString() || item?.id?.toString() || "";
};

const normalizeType = (type) => {
  return String(type || "")
    .trim()
    .toLowerCase();
};

const getProjectName = (project) => {
  return (
    project?.projectName || project?.name || project?.title || "Unnamed Project"
  );
};

const getDocumentName = (document) => {
  return document?.title || document?.name || "Untitled Document";
};

const normalizeQuestion = (question) => {
  return String(question || "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};

// ============================================================
// FIND EMPLOYEE FROM QUESTION
// ============================================================

const findEmployeeFromQuestion = (employees, question) => {
  const normalizedQuestion = normalizeQuestion(question);

  return employees.find((employee) => {
    const employeeName = String(employee?.name || "")
      .toLowerCase()
      .trim();

    return employeeName && normalizedQuestion.includes(employeeName);
  });
};

// ============================================================
// FIND PROJECT FROM QUESTION
// ============================================================

const findProjectFromQuestion = (projects, question) => {
  const normalizedQuestion = normalizeQuestion(question);

  // Exact match
  const exactMatch = projects.find((project) => {
    const projectName = String(getProjectName(project)).toLowerCase().trim();

    return projectName && normalizedQuestion.includes(projectName);
  });

  if (exactMatch) {
    return exactMatch;
  }

  // Flexible match
  return projects.find((project) => {
    const projectName = String(getProjectName(project)).toLowerCase().trim();

    if (!projectName) {
      return false;
    }

    const projectWords = projectName
      .split(/\s+/)
      .filter((word) => word.length > 2);

    return (
      projectWords.length > 0 &&
      projectWords.every((word) => normalizedQuestion.includes(word))
    );
  });
};

// ============================================================
// FIND DOCUMENT FROM QUESTION
// ============================================================

const findDocumentFromQuestion = (documents, question) => {
  const normalizedQuestion = normalizeQuestion(question);

  return documents.find((document) => {
    const documentName = String(getDocumentName(document)).toLowerCase().trim();

    return documentName && normalizedQuestion.includes(documentName);
  });
};

// ============================================================
// GET ENTITY NAME
// ============================================================

const getEntityName = async (type, id) => {
  try {
    if (!id) {
      return "Unknown Entity";
    }

    const normalizedType = normalizeType(type);

    if (normalizedType === "employee" || normalizedType === "employees") {
      const entity = await Employee.findById(id).lean();

      return entity?.name || "Unknown Employee";
    }

    if (normalizedType === "project" || normalizedType === "projects") {
      const entity = await Project.findById(id).lean();

      return entity ? getProjectName(entity) : "Unknown Project";
    }

    if (normalizedType === "document" || normalizedType === "documents") {
      const entity = await Document.findById(id).lean();

      return entity ? getDocumentName(entity) : "Unknown Document";
    }

    return "Unknown Entity";
  } catch (error) {
    console.error("Error getting entity name:", error.message);

    return "Unknown Entity";
  }
};

// ============================================================
// GET EMPLOYEES CONNECTED TO PROJECT
// ============================================================

const getEmployeesForProject = (projectId, employees, relationships) => {
  if (!projectId) {
    return [];
  }

  const employeeIds = [];

  relationships.forEach((relationship) => {
    const sourceId = String(relationship?.sourceId || "");

    const targetId = String(relationship?.targetId || "");

    const sourceType = normalizeType(relationship?.sourceType);

    const targetType = normalizeType(relationship?.targetType);

    // Employee -> Project
    if (
      (sourceType === "employee" || sourceType === "employees") &&
      (targetType === "project" || targetType === "projects") &&
      targetId === String(projectId)
    ) {
      employeeIds.push(sourceId);
    }

    // Project -> Employee
    if (
      (sourceType === "project" || sourceType === "projects") &&
      (targetType === "employee" || targetType === "employees") &&
      sourceId === String(projectId)
    ) {
      employeeIds.push(targetId);
    }
  });

  const uniqueEmployeeIds = [...new Set(employeeIds)];

  return employees.filter((employee) =>
    uniqueEmployeeIds.includes(getId(employee)),
  );
};

// ============================================================
// GET PROJECTS CONNECTED TO EMPLOYEE
// ============================================================

const getProjectsForEmployee = (employeeId, projects, relationships) => {
  if (!employeeId) {
    return [];
  }

  const projectIds = [];

  relationships.forEach((relationship) => {
    const sourceId = String(relationship?.sourceId || "");

    const targetId = String(relationship?.targetId || "");

    const sourceType = normalizeType(relationship?.sourceType);

    const targetType = normalizeType(relationship?.targetType);

    // Employee -> Project
    if (
      (sourceType === "employee" || sourceType === "employees") &&
      (targetType === "project" || targetType === "projects") &&
      sourceId === String(employeeId)
    ) {
      projectIds.push(targetId);
    }

    // Project -> Employee
    if (
      (sourceType === "project" || sourceType === "projects") &&
      (targetType === "employee" || targetType === "employees") &&
      targetId === String(employeeId)
    ) {
      projectIds.push(sourceId);
    }
  });

  const uniqueProjectIds = [...new Set(projectIds)];

  return projects.filter((project) =>
    uniqueProjectIds.includes(getId(project)),
  );
};

// ============================================================
// GET DOCUMENTS CONNECTED TO PROJECT
// ============================================================

const getDocumentsForProject = (projectId, documents, relationships) => {
  if (!projectId) {
    return [];
  }

  const documentIds = [];

  relationships.forEach((relationship) => {
    const sourceId = String(relationship?.sourceId || "");

    const targetId = String(relationship?.targetId || "");

    const sourceType = normalizeType(relationship?.sourceType);

    const targetType = normalizeType(relationship?.targetType);

    // Project -> Document
    if (
      (sourceType === "project" || sourceType === "projects") &&
      (targetType === "document" || targetType === "documents") &&
      sourceId === String(projectId)
    ) {
      documentIds.push(targetId);
    }

    // Document -> Project
    if (
      (sourceType === "document" || sourceType === "documents") &&
      (targetType === "project" || targetType === "projects") &&
      targetId === String(projectId)
    ) {
      documentIds.push(sourceId);
    }
  });

  const uniqueDocumentIds = [...new Set(documentIds)];

  return documents.filter((document) =>
    uniqueDocumentIds.includes(getId(document)),
  );
};

// ============================================================
// GET PROJECTS CONNECTED TO DOCUMENT
// ============================================================

const getProjectsForDocument = (documentId, projects, relationships) => {
  if (!documentId) {
    return [];
  }

  const projectIds = [];

  relationships.forEach((relationship) => {
    const sourceId = String(relationship?.sourceId || "");

    const targetId = String(relationship?.targetId || "");

    const sourceType = normalizeType(relationship?.sourceType);

    const targetType = normalizeType(relationship?.targetType);

    // Document -> Project
    if (
      (sourceType === "document" || sourceType === "documents") &&
      (targetType === "project" || targetType === "projects") &&
      sourceId === String(documentId)
    ) {
      projectIds.push(targetId);
    }

    // Project -> Document
    if (
      (sourceType === "project" || sourceType === "projects") &&
      (targetType === "document" || targetType === "documents") &&
      targetId === String(documentId)
    ) {
      projectIds.push(sourceId);
    }
  });

  const uniqueProjectIds = [...new Set(projectIds)];

  return projects.filter((project) =>
    uniqueProjectIds.includes(getId(project)),
  );
};

// ============================================================
// AI ASSISTANT
// ============================================================

router.post("/ask", protect, async (req, res) => {
  try {
    const { question } = req.body || {};

    // ========================================================
    // VALIDATION
    // ========================================================

    if (typeof question !== "string" || question.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid question.",
      });
    }

    if (question.length > MAX_QUESTION_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Question must not exceed ${MAX_QUESTION_LENGTH} characters.`,
      });
    }

    const cleanQuestion = question.replace(/\s+/g, " ").trim();

    const userQuestion = cleanQuestion.toLowerCase();

    // ========================================================
    // GENERAL CONVERSATION
    // ========================================================

    if (["hi", "hello", "hey", "hii", "helo"].includes(userQuestion)) {
      return res.json({
        success: true,
        answer:
          "Hello! 👋 Welcome to the Enterprise Knowledge Management AI Assistant. How can I help you today?",
        data: [],
      });
    }

    if (
      userQuestion.includes("how are you") ||
      userQuestion.includes("how r you")
    ) {
      return res.json({
        success: true,
        answer:
          "I'm doing great! 😊 I'm ready to help you explore Employees, Projects, Documents, Relationships, and the Knowledge Graph.",
        data: [],
      });
    }

    if (
      userQuestion.includes("what can you do") ||
      userQuestion.includes("how can you help") ||
      userQuestion.includes("what do you do")
    ) {
      return res.json({
        success: true,
        answer:
          "I can help you explore Employees, Projects, Documents, Relationships, and Knowledge Graph connections.",
        data: [],
      });
    }

    if (
      userQuestion.includes("who are you") ||
      userQuestion.includes("what are you")
    ) {
      return res.json({
        success: true,
        answer: "I am your Enterprise Knowledge Management AI Assistant. 🤖",
        data: [],
      });
    }

    if (
      userQuestion.includes("thank you") ||
      userQuestion.includes("thanks") ||
      userQuestion === "thank u"
    ) {
      return res.json({
        success: true,
        answer: "You're welcome! 😊 Feel free to ask me anything.",
        data: [],
      });
    }

    if (["bye", "goodbye", "see you"].includes(userQuestion)) {
      return res.json({
        success: true,
        answer: "Goodbye! 👋 Have a great day.",
        data: [],
      });
    }

    // ========================================================
    // SYSTEM OVERVIEW
    // ========================================================

    if (
      userQuestion.includes("system overview") ||
      userQuestion.includes("system summary") ||
      userQuestion === "overview" ||
      userQuestion.includes("give overview")
    ) {
      const [employeeCount, projectCount, documentCount, relationshipCount] =
        await Promise.all([
          Employee.countDocuments(),
          Project.countDocuments(),
          Document.countDocuments(),
          Relationship.countDocuments(),
        ]);

      return res.json({
        success: true,

        answer:
          `System Overview:\n\n` +
          `Employees: ${employeeCount}\n` +
          `Projects: ${projectCount}\n` +
          `Documents: ${documentCount}\n` +
          `Knowledge Relationships: ${relationshipCount}`,

        data: {
          employees: employeeCount,
          projects: projectCount,
          documents: documentCount,
          relationships: relationshipCount,
        },
      });
    }

    // ========================================================
    // LOAD DATA
    // ========================================================

    const [employees, projects, documents, relationships] = await Promise.all([
      Employee.find().lean(),
      Project.find().lean(),
      Document.find().lean(),
      Relationship.find().lean(),
    ]);

    // ========================================================
    // DOCUMENT -> PROJECT -> EMPLOYEE
    // ========================================================

    if (
      userQuestion.includes("employees work on projects related to") ||
      userQuestion.includes("employees working on projects related to") ||
      userQuestion.includes("who works on projects related to")
    ) {
      const foundDocument = findDocumentFromQuestion(documents, userQuestion);

      if (!foundDocument) {
        return res.json({
          success: true,
          answer:
            "Please mention a valid Document name available in the system.",
          data: [],
        });
      }

      const matchedProjects = getProjectsForDocument(
        getId(foundDocument),
        projects,
        relationships,
      );

      if (matchedProjects.length === 0) {
        return res.json({
          success: true,
          answer: `No projects are connected to "${getDocumentName(
            foundDocument,
          )}".`,
          data: [],
        });
      }

      const employeeMap = new Map();

      matchedProjects.forEach((project) => {
        const projectEmployees = getEmployeesForProject(
          getId(project),
          employees,
          relationships,
        );

        projectEmployees.forEach((employee) => {
          employeeMap.set(getId(employee), employee);
        });
      });

      const matchedEmployees = [...employeeMap.values()];

      const projectList = matchedProjects
        .map((project, index) => `${index + 1}. ${getProjectName(project)}`)
        .join("\n");

      const employeeList =
        matchedEmployees.length > 0
          ? matchedEmployees
              .map(
                (employee, index) =>
                  `${index + 1}. ${employee.name} - ${
                    employee.role || employee.department || "Employee"
                  }`,
              )
              .join("\n")
          : "No employees found.";

      return res.json({
        success: true,

        answer:
          `Knowledge Graph reasoning completed.\n\n` +
          `Document:\n${getDocumentName(foundDocument)}\n\n` +
          `Step 1 - Related Projects:\n${projectList}\n\n` +
          `Step 2 - Employees working on those Projects:\n${employeeList}`,

        data: {
          document: foundDocument,
          projects: matchedProjects,
          employees: matchedEmployees,
        },
      });
    }

    // ========================================================
    // EMPLOYEE -> PROJECT -> DOCUMENT
    // ========================================================

    if (
      userQuestion.includes("documents are related to projects connected to") ||
      userQuestion.includes("documents related to projects connected to") ||
      userQuestion.includes(
        "what documents are related to projects connected to",
      )
    ) {
      const foundEmployee = findEmployeeFromQuestion(employees, userQuestion);

      if (!foundEmployee) {
        return res.json({
          success: true,
          answer:
            "Please mention a valid Employee name available in the system.",
          data: [],
        });
      }

      const matchedProjects = getProjectsForEmployee(
        getId(foundEmployee),
        projects,
        relationships,
      );

      if (matchedProjects.length === 0) {
        return res.json({
          success: true,
          answer: `No projects are currently connected to ${foundEmployee.name}.`,
          data: [],
        });
      }

      const documentMap = new Map();

      matchedProjects.forEach((project) => {
        const projectDocuments = getDocumentsForProject(
          getId(project),
          documents,
          relationships,
        );

        projectDocuments.forEach((document) => {
          documentMap.set(getId(document), document);
        });
      });

      const matchedDocuments = [...documentMap.values()];

      const projectList = matchedProjects
        .map((project, index) => `${index + 1}. ${getProjectName(project)}`)
        .join("\n");

      const documentList =
        matchedDocuments.length > 0
          ? matchedDocuments
              .map(
                (document, index) =>
                  `${index + 1}. ${getDocumentName(document)}`,
              )
              .join("\n")
          : "No documents found.";

      return res.json({
        success: true,

        answer:
          `Knowledge Graph reasoning completed.\n\n` +
          `Employee:\n${foundEmployee.name}\n\n` +
          `Step 1 - Projects connected to ${foundEmployee.name}:\n${projectList}\n\n` +
          `Step 2 - Documents related to those Projects:\n${documentList}`,

        data: {
          employee: foundEmployee,
          projects: matchedProjects,
          documents: matchedDocuments,
        },
      });
    }

    // ========================================================
    // PROJECT DETAILS
    // ========================================================

    if (
      userQuestion.includes("project details of") ||
      userQuestion.includes("details of project") ||
      userQuestion.includes("details about project") ||
      userQuestion.includes("information about project") ||
      userQuestion.includes("info about project") ||
      userQuestion.includes("show project details")
    ) {
      const foundProject = findProjectFromQuestion(projects, userQuestion);

      if (!foundProject) {
        return res.json({
          success: true,
          answer:
            "I could not find the project mentioned in your question. Please use the exact project name available in the system.",
          data: [],
        });
      }

      return res.json({
        success: true,

        answer:
          `Project Details:\n\n` +
          `Name: ${getProjectName(foundProject)}\n` +
          `Status: ${foundProject.status || "Not available"}\n` +
          `Description: ${foundProject.description || "Not available"}`,

        data: foundProject,
      });
    }

    // ========================================================
    // EMPLOYEE DETAILS
    // ========================================================

    if (
      userQuestion.includes("employee details of") ||
      userQuestion.includes("details of employee") ||
      userQuestion.includes("details about employee") ||
      userQuestion.includes("information about employee") ||
      userQuestion.includes("employee information") ||
      userQuestion.includes("show employee details") ||
      userQuestion.includes("profile of") ||
      userQuestion.includes("tell me about")
    ) {
      const foundEmployee = findEmployeeFromQuestion(employees, userQuestion);

      if (!foundEmployee) {
        return res.json({
          success: true,
          answer:
            "I could not find the employee mentioned in your question. Please use the exact employee name available in the system.",
          data: [],
        });
      }

      return res.json({
        success: true,

        answer:
          `Employee Details:\n\n` +
          `Name: ${foundEmployee.name || "Not available"}\n` +
          `Email: ${foundEmployee.email || "Not available"}\n` +
          `Role: ${foundEmployee.role || "Not available"}\n` +
          `Department: ${foundEmployee.department || "Not available"}`,

        data: foundEmployee,
      });
    }

    // ========================================================
    // WHO WORKS ON PROJECT
    // ========================================================

    if (
      userQuestion.includes("who works on") ||
      userQuestion.includes("who is working on") ||
      userQuestion.includes("employees working on") ||
      userQuestion.includes("employees work on")
    ) {
      const foundProject = findProjectFromQuestion(projects, userQuestion);

      if (!foundProject) {
        return res.json({
          success: true,
          answer:
            "I could not find the project mentioned in your question. Please use the exact project name available in the system.",
          data: [],
        });
      }

      const matchedEmployees = getEmployeesForProject(
        getId(foundProject),
        employees,
        relationships,
      );

      if (matchedEmployees.length === 0) {
        return res.json({
          success: true,
          answer: `No employees are currently connected to "${getProjectName(
            foundProject,
          )}".`,
          data: [],
        });
      }

      const employeeList = matchedEmployees
        .map(
          (employee, index) =>
            `${index + 1}. ${employee.name} - ${
              employee.role || employee.department || "Employee"
            }`,
        )
        .join("\n");

      return res.json({
        success: true,

        answer: `Employees working on "${getProjectName(
          foundProject,
        )}":\n\n${employeeList}`,

        data: matchedEmployees,
      });
    }

    // ========================================================
    // EMPLOYEE -> PROJECT
    // ========================================================

    const foundEmployee = findEmployeeFromQuestion(employees, userQuestion);

    if (
      foundEmployee &&
      (userQuestion.includes("working on") || userQuestion.includes("works on"))
    ) {
      const matchedProjects = getProjectsForEmployee(
        getId(foundEmployee),
        projects,
        relationships,
      );

      if (matchedProjects.length === 0) {
        return res.json({
          success: true,
          answer: `${foundEmployee.name} is not currently connected to any project.`,
          data: [],
        });
      }

      const projectList = matchedProjects
        .map((project, index) => `${index + 1}. ${getProjectName(project)}`)
        .join("\n");

      return res.json({
        success: true,
        answer: `${foundEmployee.name} is currently working on:\n\n${projectList}`,
        data: matchedProjects,
      });
    }

    // ========================================================
    // PROJECT -> DOCUMENTS
    // ========================================================

    const foundProject = findProjectFromQuestion(projects, userQuestion);

    if (foundProject && userQuestion.includes("document")) {
      const matchedDocuments = getDocumentsForProject(
        getId(foundProject),
        documents,
        relationships,
      );

      if (matchedDocuments.length === 0) {
        return res.json({
          success: true,
          answer: `No documents are currently connected to "${getProjectName(
            foundProject,
          )}".`,
          data: [],
        });
      }

      const documentList = matchedDocuments
        .map((document, index) => `${index + 1}. ${getDocumentName(document)}`)
        .join("\n");

      return res.json({
        success: true,

        answer: `Documents related to "${getProjectName(
          foundProject,
        )}":\n\n${documentList}`,

        data: matchedDocuments,
      });
    }

    // ========================================================
    // SHOW EVERYTHING CONNECTED
    // ========================================================

    if (
      userQuestion.includes("show everything connected to") ||
      userQuestion.includes("show all connections of") ||
      userQuestion.includes("show complete knowledge of") ||
      userQuestion.includes("what is connected to") ||
      userQuestion.includes("show connections of") ||
      userQuestion.includes("show connections for")
    ) {
      let foundEntity = null;
      let entityType = "";
      let entityName = "";

      const employee = findEmployeeFromQuestion(employees, userQuestion);

      const project = findProjectFromQuestion(projects, userQuestion);

      const document = findDocumentFromQuestion(documents, userQuestion);

      if (employee) {
        foundEntity = employee;
        entityType = "Employee";
        entityName = employee.name;
      } else if (project) {
        foundEntity = project;
        entityType = "Project";
        entityName = getProjectName(project);
      } else if (document) {
        foundEntity = document;
        entityType = "Document";
        entityName = getDocumentName(document);
      }

      if (!foundEntity) {
        return res.json({
          success: true,
          answer:
            "I could not find that Employee, Project, or Document. Please enter the exact name available in the system.",
          data: [],
        });
      }

      const entityId = getId(foundEntity);

      const connectedRelationships = relationships.filter(
        (relationship) =>
          String(relationship?.sourceId || "") === entityId ||
          String(relationship?.targetId || "") === entityId,
      );

      if (connectedRelationships.length === 0) {
        return res.json({
          success: true,
          answer: `${entityType} "${entityName}" was found, but it currently has no relationships in the Knowledge Graph.`,
          data: [],
        });
      }

      const connectionList = await Promise.all(
        connectedRelationships.map(async (relationship, index) => {
          const sourceName = await getEntityName(
            relationship.sourceType,
            relationship.sourceId,
          );

          const targetName = await getEntityName(
            relationship.targetType,
            relationship.targetId,
          );

          return `${index + 1}. ${sourceName} → ${
            relationship.relationshipType || "Connected To"
          } → ${targetName}`;
        }),
      );

      return res.json({
        success: true,

        answer:
          `Knowledge Graph connections for ${entityType} "${entityName}":\n\n` +
          connectionList.join("\n") +
          `\n\nTotal Connections: ${connectedRelationships.length}`,

        data: {
          entity: foundEntity,
          entityType,
          relationships: connectedRelationships,
        },
      });
    }

    // ========================================================
    // EMPLOYEE COUNT
    // ========================================================

    if (
      (userQuestion.includes("how many") ||
        userQuestion.includes("count") ||
        userQuestion.includes("total") ||
        userQuestion.includes("number of")) &&
      userQuestion.includes("employee")
    ) {
      return res.json({
        success: true,
        answer: `There are currently ${employees.length} employees in the Enterprise Knowledge Management System.`,
        data: {
          count: employees.length,
        },
      });
    }

    // ========================================================
    // PROJECT COUNT
    // ========================================================

    if (
      (userQuestion.includes("how many") ||
        userQuestion.includes("count") ||
        userQuestion.includes("total") ||
        userQuestion.includes("number of")) &&
      userQuestion.includes("project")
    ) {
      return res.json({
        success: true,
        answer: `There are currently ${projects.length} projects in the Enterprise Knowledge Management System.`,
        data: {
          count: projects.length,
        },
      });
    }

    // ========================================================
    // DOCUMENT COUNT
    // ========================================================

    if (
      (userQuestion.includes("how many") ||
        userQuestion.includes("count") ||
        userQuestion.includes("total") ||
        userQuestion.includes("number of")) &&
      userQuestion.includes("document")
    ) {
      return res.json({
        success: true,
        answer: `There are currently ${documents.length} documents in the Enterprise Knowledge Management System.`,
        data: {
          count: documents.length,
        },
      });
    }

    // ========================================================
    // EMPLOYEES BY DEPARTMENT
    // ========================================================

    if (
      userQuestion.includes("employees in") ||
      userQuestion.includes("employee in") ||
      userQuestion.includes("employees from") ||
      userQuestion.includes("employee from")
    ) {
      const foundDepartment = employees.find((employee) => {
        const department = String(employee?.department || "")
          .toLowerCase()
          .trim();

        return department && userQuestion.includes(department);
      })?.department;

      if (foundDepartment) {
        const matchedEmployees = employees.filter(
          (employee) =>
            String(employee?.department || "")
              .toLowerCase()
              .trim() === String(foundDepartment).toLowerCase().trim(),
        );

        const employeeList = matchedEmployees
          .map(
            (employee, index) =>
              `${index + 1}. ${employee.name} - ${employee.role || "No role"}`,
          )
          .join("\n");

        return res.json({
          success: true,

          answer: `Employees in "${foundDepartment}" Department:\n\n${employeeList}`,

          data: matchedEmployees,
        });
      }
    }

    // ========================================================
    // ACTIVE DOCUMENTS
    // ========================================================

    if (
      userQuestion.includes("approved document") ||
      userQuestion.includes("approved documents") ||
      userQuestion.includes("active document") ||
      userQuestion.includes("active documents")
    ) {
      const activeDocuments = documents.filter(
        (document) =>
          String(document?.status || "")
            .toLowerCase()
            .trim() === "active",
      );

      if (activeDocuments.length === 0) {
        return res.json({
          success: true,
          answer: "There are currently no Active documents in the system.",
          data: [],
        });
      }

      const documentList = activeDocuments
        .map(
          (document, index) =>
            `${index + 1}. ${getDocumentName(document)} - ${
              document.status || "Active"
            }`,
        )
        .join("\n");

      return res.json({
        success: true,

        answer:
          `Active Documents:\n\n${documentList}\n\n` +
          `Note: The current document status system uses "Active" and "Archived".`,

        data: activeDocuments,
      });
    }

    // ========================================================
    // ARCHIVED DOCUMENTS
    // ========================================================

    if (
      userQuestion.includes("archived document") ||
      userQuestion.includes("archived documents")
    ) {
      const archivedDocuments = documents.filter(
        (document) =>
          String(document?.status || "")
            .toLowerCase()
            .trim() === "archived",
      );

      if (archivedDocuments.length === 0) {
        return res.json({
          success: true,
          answer: "There are currently no Archived documents in the system.",
          data: [],
        });
      }

      const documentList = archivedDocuments
        .map(
          (document, index) =>
            `${index + 1}. ${getDocumentName(document)} - ${
              document.status || "Archived"
            }`,
        )
        .join("\n");

      return res.json({
        success: true,
        answer: `Archived Documents:\n\n${documentList}`,
        data: archivedDocuments,
      });
    }

    // ========================================================
    // PLANNING PROJECTS
    // ========================================================

    if (
      userQuestion.includes("planning project") ||
      userQuestion.includes("planning projects")
    ) {
      const planningProjects = projects.filter(
        (project) =>
          String(project?.status || "")
            .toLowerCase()
            .trim() === "planning",
      );

      if (planningProjects.length === 0) {
        return res.json({
          success: true,
          answer: "There are currently no planning projects in the system.",
          data: [],
        });
      }

      const projectList = planningProjects
        .map(
          (project, index) =>
            `${index + 1}. ${getProjectName(project)} - ${
              project.status || "Planning"
            }`,
        )
        .join("\n");

      return res.json({
        success: true,
        answer: `Planning Projects:\n\n${projectList}`,
        data: planningProjects,
      });
    }

    // ========================================================
    // EMPLOYEE LIST
    // ========================================================

    if (
      userQuestion.includes("list employees") ||
      userQuestion.includes("show employees") ||
      userQuestion.includes("show all employees") ||
      userQuestion.includes("employee names") ||
      userQuestion.includes("who are the employees")
    ) {
      if (employees.length === 0) {
        return res.json({
          success: true,
          answer: "There are currently no employees in the system.",
          data: [],
        });
      }

      const employeeList = employees
        .map(
          (employee, index) =>
            `${index + 1}. ${employee.name} - ${employee.role || "No role"} - ${
              employee.department || "No department"
            }`,
        )
        .join("\n");

      return res.json({
        success: true,
        answer: `Employees in the system:\n\n${employeeList}`,
        data: employees,
      });
    }

    // ========================================================
    // PROJECT LIST
    // ========================================================

    if (
      userQuestion.includes("list projects") ||
      userQuestion.includes("show projects") ||
      userQuestion.includes("show all projects") ||
      userQuestion.includes("project names")
    ) {
      if (projects.length === 0) {
        return res.json({
          success: true,
          answer: "There are currently no projects in the system.",
          data: [],
        });
      }

      const projectList = projects
        .map(
          (project, index) =>
            `${index + 1}. ${getProjectName(project)} - ${
              project.status || "No status"
            }`,
        )
        .join("\n");

      return res.json({
        success: true,
        answer: `Projects in the system:\n\n${projectList}`,
        data: projects,
      });
    }

    // ========================================================
    // DOCUMENT LIST
    // ========================================================

    if (
      userQuestion.includes("list documents") ||
      userQuestion.includes("show documents") ||
      userQuestion.includes("show all documents") ||
      userQuestion.includes("document titles")
    ) {
      if (documents.length === 0) {
        return res.json({
          success: true,
          answer: "There are currently no documents in the system.",
          data: [],
        });
      }

      const documentList = documents
        .map(
          (document, index) =>
            `${index + 1}. ${getDocumentName(document)} - ${
              document.status || "No status"
            }`,
        )
        .join("\n");

      return res.json({
        success: true,
        answer: `Documents in the system:\n\n${documentList}`,
        data: documents,
      });
    }

    // ========================================================
    // RELATIONSHIP LIST
    // ========================================================

    if (
      userQuestion.includes("list relationships") ||
      userQuestion.includes("show relationships") ||
      userQuestion === "show connections" ||
      userQuestion === "list connections"
    ) {
      if (relationships.length === 0) {
        return res.json({
          success: true,
          answer:
            "There are currently no relationships in the Knowledge Graph.",
          data: [],
        });
      }

      const relationshipList = await Promise.all(
        relationships.map(async (relationship, index) => {
          const sourceName = await getEntityName(
            relationship.sourceType,
            relationship.sourceId,
          );

          const targetName = await getEntityName(
            relationship.targetType,
            relationship.targetId,
          );

          return `${index + 1}. ${sourceName} (${
            relationship.sourceType || "Unknown"
          }) → ${
            relationship.relationshipType || "Connected To"
          } → ${targetName} (${relationship.targetType || "Unknown"})`;
        }),
      );

      return res.json({
        success: true,
        answer: `Knowledge Relationships:\n\n${relationshipList.join("\n")}`,
        data: relationships,
      });
    }

    // ========================================================
    // KNOWLEDGE GRAPH SUMMARY
    // ========================================================

    if (
      userQuestion.includes("knowledge graph") ||
      userQuestion === "graph" ||
      userQuestion.includes("show graph")
    ) {
      return res.json({
        success: true,

        answer:
          `Knowledge Graph Summary:\n\n` +
          `Employees: ${employees.length}\n` +
          `Projects: ${projects.length}\n` +
          `Documents: ${documents.length}\n` +
          `Relationships: ${relationships.length}\n\n` +
          `The Knowledge Graph connects Employees, Projects and Documents.`,

        data: {
          employees: employees.length,
          projects: projects.length,
          documents: documents.length,
          relationships: relationships.length,
        },
      });
    }

// ============================================================
// RAG DOCUMENT SEARCH + GEMINI
// ============================================================

try {
  console.log("Running RAG search for:", cleanQuestion);

  // ----------------------------------------------------------
  // STEP 1: SEARCH RELEVANT DOCUMENT CHUNKS
  // ----------------------------------------------------------

  const ragResults = await searchRelevantChunks(
    cleanQuestion,
    MAX_RAG_RESULTS
  );

  console.log(
    "RAG results found:",
    Array.isArray(ragResults) ? ragResults.length : 0
  );

  // ----------------------------------------------------------
  // STEP 2: FILTER BY SIMILARITY
  // ----------------------------------------------------------

  const relevantResults = Array.isArray(ragResults)
    ? ragResults.filter(
        (result) =>
          Number(result?.similarity || 0) >= MIN_SIMILARITY
      )
    : [];

  if (relevantResults.length === 0) {
    return res.json({
      success: true,
      answer:
        "The requested information is not available in the enterprise knowledge.",
      data: {
        source: "RAG",
        sources: [],
        results: [],
      },
    });
  }

  // ----------------------------------------------------------
  // STEP 3: GROUP CHUNKS BY DOCUMENT
  // ----------------------------------------------------------

  const groupedDocuments = new Map();

  relevantResults.forEach((result) => {
    const documentId = String(
      result?.documentId ||
        result?._id ||
        result?.title ||
        "unknown"
    );

    if (!groupedDocuments.has(documentId)) {
      groupedDocuments.set(documentId, {
        title: result?.title || "Uploaded Document",
        category: result?.category || "",
        department: result?.department || "",
        chunks: [],
      });
    }

    groupedDocuments
      .get(documentId)
      .chunks.push(result);
  });

  // ----------------------------------------------------------
  // STEP 4: BUILD CONTEXT FOR GEMINI
  // ----------------------------------------------------------

  const geminiContext = [...groupedDocuments.values()]
    .map((document, documentIndex) => {
      const text = document.chunks
        .slice()
        .sort(
          (a, b) =>
            Number(b?.similarity || 0) -
            Number(a?.similarity || 0)
        )
        .map((chunk) =>
          String(chunk?.text || "")
            .replace(/\s+/g, " ")
            .trim()
        )
        .filter(Boolean)
        .join(" ");

      const snippet =
        text.length > MAX_GEMINI_SNIPPET_LENGTH
          ? `${text
              .slice(0, MAX_GEMINI_SNIPPET_LENGTH)
              .trim()}...`
          : text;

      return (
        `Document ${documentIndex + 1}:\n` +
        `Title: ${document.title}\n` +
        `Category: ${document.category || "N/A"}\n` +
        `Department: ${document.department || "N/A"}\n` +
        `Content:\n${snippet}`
      );
    })
    .join("\n\n");

  if (!geminiContext.trim()) {
    return res.json({
      success: true,
      answer:
        "I found relevant documents, but there is no readable document content available to answer the question.",
      data: {
        source: "RAG",
        sources: [],
        results: [],
      },
    });
  }

  console.log("Gemini context created successfully.");

  // ----------------------------------------------------------
  // STEP 5: SEND RAG CONTEXT TO GEMINI
  // ----------------------------------------------------------

  console.log("Sending RAG context to Gemini...");

  const geminiAnswer = await generateGeminiResponse(
    cleanQuestion,
    geminiContext
  );

  if (
    typeof geminiAnswer !== "string" ||
    geminiAnswer.trim() === ""
  ) {
    return res.status(502).json({
      success: false,
      message:
        "Gemini did not return a valid answer.",
    });
  }

  console.log(
    "Gemini response generated successfully."
  );

  // ----------------------------------------------------------
  // STEP 6: SOURCE DOCUMENT NAMES
  // ----------------------------------------------------------

  const sourceNames = [...groupedDocuments.values()]
    .map((document) => document.title)
    .filter(Boolean);

  // ----------------------------------------------------------
  // STEP 7: RETURN FINAL AI RESPONSE
  // ----------------------------------------------------------

  return res.json({
    success: true,

    answer: geminiAnswer.trim(),

    data: {
      source: "RAG + Gemini",

      sources: sourceNames,

      results: relevantResults.map((result) => ({
        documentId: result?.documentId,

        title:
          result?.title ||
          "Uploaded Document",

        category:
          result?.category || "",

        department:
          result?.department || "",

        chunkIndex:
          result?.chunkIndex,

        similarity: Number(
          Number(
            result?.similarity || 0
          ).toFixed(4)
        ),

        text: String(
          result?.text || ""
        ).slice(
          0,
          MAX_RESULT_TEXT_LENGTH
        ),
      })),
    },
  });
} catch (ragError) {
  console.error(
    "RAG + Gemini Error:",
    ragError.message
  );

  return res.status(500).json({
    success: false,
    message:
      "Unable to process the knowledge-based request.",
  });
}

  } catch (error) {
    // ========================================================
    // GLOBAL AI ROUTE ERROR
    // ========================================================

    console.error("AI Assistant Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process AI request.",
    });
  }
});

// ============================================================
// EXPORT
// ============================================================

module.exports = router;
