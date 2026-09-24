const mongoose = require("mongoose");

const Employee = require("../models/Employee");
const Project = require("../models/Project");
const Document = require("../models/Document");
const Relationship = require("../models/Relationship");

const { driver, database } = require("../config/neo4j");

// ============================================================
// CONSTANTS
// ============================================================

const ALLOWED_ENTITY_TYPES = ["Employee", "Project", "Document"];

const MAX_SYNC_RECORDS = 10000;

const MAX_TEXT_LENGTH = 5000;

const MAX_FILE_NAME_LENGTH = 255;

// ============================================================
// HELPERS
// ============================================================

const isValidObjectId = (id) => {
  return typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
};

const safeString = (value, maxLength = MAX_TEXT_LENGTH) => {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value).trim();

  return stringValue.length > maxLength
    ? stringValue.slice(0, maxLength)
    : stringValue;
};

const safeDate = (value) => {
  if (!value) {
    return "";
  }

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toISOString();
  } catch {
    return "";
  }
};

const createSession = () => {
  if (!driver) {
    throw new Error("Neo4j driver is not configured.");
  }

  return driver.session({
    database,
  });
};

const closeSession = async (session) => {
  if (!session) {
    return;
  }

  try {
    await session.close();
  } catch (error) {
    console.error("Neo4j session close failed:", error.message);
  }
};

// ============================================================
// SYNC EMPLOYEES
// ============================================================

const syncEmployeesToNeo4j = async () => {
  let session;

  try {
    session = createSession();

    const employees = await Employee.find().limit(MAX_SYNC_RECORDS).lean();

    console.log(`Employees found in MongoDB: ${employees.length}`);

    if (employees.length === 0) {
      console.log("No employees found to sync.");

      return;
    }

    const employeeData = employees
      .filter((employee) => employee?._id)
      .map((employee) => ({
        mongoId: String(employee._id),

        name: safeString(employee.name, 100),

        email: safeString(employee.email, 150),

        department: safeString(employee.department, 100),

        role: safeString(employee.role, 100),
      }));

    if (employeeData.length === 0) {
      console.log("No valid employees found to sync.");

      return;
    }

    await session.run(
      `
        UNWIND $employees AS employee

        MERGE (e:Employee {
          mongoId: employee.mongoId
        })

        SET
          e.name = employee.name,
          e.email = employee.email,
          e.department = employee.department,
          e.role = employee.role
        `,
      {
        employees: employeeData,
      },
    );

    console.log("Employees synced to Neo4j successfully.");
  } catch (error) {
    console.error("Employee Neo4j sync failed:", error.message);

    throw error;
  } finally {
    await closeSession(session);
  }
};

// ============================================================
// SYNC PROJECTS
// ============================================================

const syncProjectsToNeo4j = async () => {
  let session;

  try {
    session = createSession();

    const projects = await Project.find().limit(MAX_SYNC_RECORDS).lean();

    console.log(`Projects found in MongoDB: ${projects.length}`);

    if (projects.length === 0) {
      console.log("No projects found to sync.");

      return;
    }

    const projectData = projects
      .filter((project) => project?._id)
      .map((project) => ({
        mongoId: String(project._id),

        projectName: safeString(project.projectName, 150),

        description: safeString(project.description, 5000),

        department: safeString(project.department, 100),

        projectManager: safeString(project.projectManager, 150),

        status: safeString(project.status, 50),

        startDate: safeDate(project.startDate),

        endDate: safeDate(project.endDate),
      }));

    if (projectData.length === 0) {
      console.log("No valid projects found to sync.");

      return;
    }

    await session.run(
      `
        UNWIND $projects AS project

        MERGE (p:Project {
          mongoId: project.mongoId
        })

        SET
          p.projectName = project.projectName,
          p.description = project.description,
          p.department = project.department,
          p.projectManager = project.projectManager,
          p.status = project.status,
          p.startDate = project.startDate,
          p.endDate = project.endDate
        `,
      {
        projects: projectData,
      },
    );

    console.log("Projects synced to Neo4j successfully.");
  } catch (error) {
    console.error("Project Neo4j sync failed:", error.message);

    throw error;
  } finally {
    await closeSession(session);
  }
};

// ============================================================
// SYNC DOCUMENTS
// ============================================================

const syncDocumentsToNeo4j = async () => {
  let session;

  try {
    session = createSession();

    const documents = await Document.find().limit(MAX_SYNC_RECORDS).lean();

    console.log(`Documents found in MongoDB: ${documents.length}`);

    if (documents.length === 0) {
      console.log("No documents found to sync.");

      return;
    }

    const documentData = documents
      .filter((document) => document?._id)
      .map((document) => ({
        mongoId: String(document._id),

        title: safeString(document.title, 200),

        description: safeString(document.description, 5000),

        category: safeString(document.category, 100),

        department: safeString(document.department, 100),

        fileName: safeString(document.fileName, MAX_FILE_NAME_LENGTH),

        originalFileName: safeString(
          document.originalFileName,
          MAX_FILE_NAME_LENGTH,
        ),

        fileType: safeString(document.fileType, 200),

        fileSize: Number.isFinite(document.fileSize) ? document.fileSize : 0,

        status: safeString(document.status, 50),
      }));

    if (documentData.length === 0) {
      console.log("No valid documents found to sync.");

      return;
    }

    await session.run(
      `
        UNWIND $documents AS document

        MERGE (d:Document {
          mongoId: document.mongoId
        })

        SET
          d.title = document.title,
          d.description = document.description,
          d.category = document.category,
          d.department = document.department,
          d.fileName = document.fileName,
          d.originalFileName = document.originalFileName,
          d.fileType = document.fileType,
          d.fileSize = document.fileSize,
          d.status = document.status
        `,
      {
        documents: documentData,
      },
    );

    console.log("Documents synced to Neo4j successfully.");
  } catch (error) {
    console.error("Document Neo4j sync failed:", error.message);

    throw error;
  } finally {
    await closeSession(session);
  }
};

// ============================================================
// SYNC RELATIONSHIPS
// ============================================================

const syncRelationshipsToNeo4j = async () => {
  let session;

  try {
    session = createSession();

    const relationships = await Relationship.find()
      .limit(MAX_SYNC_RECORDS)
      .lean();

    console.log(`Relationships found in MongoDB: ${relationships.length}`);

    if (relationships.length === 0) {
      console.log("No relationships found to sync.");

      return;
    }

    let syncedCount = 0;
    let skippedCount = 0;

    for (const relationship of relationships) {
      if (
        !relationship?._id ||
        !relationship.sourceType ||
        !relationship.targetType ||
        !relationship.sourceId ||
        !relationship.targetId
      ) {
        skippedCount++;

        continue;
      }

      const sourceType = safeString(relationship.sourceType, 50);

      const targetType = safeString(relationship.targetType, 50);

      // ======================================================
      // IMPORTANT:
      // Only allow predefined Neo4j labels.
      // Never directly use arbitrary user input in Cypher.
      // ======================================================

      if (
        !ALLOWED_ENTITY_TYPES.includes(sourceType) ||
        !ALLOWED_ENTITY_TYPES.includes(targetType)
      ) {
        console.warn(
          "Skipping invalid relationship entity type:",
          relationship._id,
        );

        skippedCount++;

        continue;
      }

      const sourceMongoId = String(relationship.sourceId);

      const targetMongoId = String(relationship.targetId);

      if (!isValidObjectId(sourceMongoId) || !isValidObjectId(targetMongoId)) {
        console.warn(
          "Skipping relationship with invalid entity ID:",
          relationship._id,
        );

        skippedCount++;

        continue;
      }

      if (sourceType === targetType && sourceMongoId === targetMongoId) {
        console.warn("Skipping self relationship:", relationship._id);

        skippedCount++;

        continue;
      }

      const mongoId = String(relationship._id);

      const relationshipType = safeString(relationship.relationshipType, 100);

      const description = safeString(relationship.description, 2000);

      await session.run(
        `
          MATCH (source:${sourceType} {
            mongoId: $sourceMongoId
          })

          MATCH (target:${targetType} {
            mongoId: $targetMongoId
          })

          MERGE (source)-[r:RELATED_TO {
            mongoId: $mongoId
          }]->(target)

          SET
            r.relationshipType = $relationshipType,
            r.description = $description
          `,
        {
          mongoId,

          sourceMongoId,

          targetMongoId,

          relationshipType,

          description,
        },
      );

      syncedCount++;
    }

    console.log(`Relationships synced: ${syncedCount}`);

    console.log(`Relationships skipped: ${skippedCount}`);

    console.log("Relationships synced to Neo4j successfully.");
  } catch (error) {
    console.error("Relationship Neo4j sync failed:", error.message);

    throw error;
  } finally {
    await closeSession(session);
  }
};

// ============================================================
// EXPORT SERVICES
// ============================================================

module.exports = {
  syncEmployeesToNeo4j,
  syncProjectsToNeo4j,
  syncDocumentsToNeo4j,
  syncRelationshipsToNeo4j,
};
