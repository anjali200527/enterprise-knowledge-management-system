const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();

const connectDB = require("./config/db");

const { verifyNeo4jConnection } = require("./config/neo4j");

const {
  syncEmployeesToNeo4j,
  syncProjectsToNeo4j,
  syncDocumentsToNeo4j,
  syncRelationshipsToNeo4j,
} = require("./services/neo4jSyncService");

// ================= ROUTES =================

const employeeRoutes = require("./routes/employeeRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const documentRoutes = require("./routes/documentRoutes");
const relationshipRoutes = require("./routes/relationshipRoutes");
const aiRoutes = require("./routes/aiRoutes");
const chatRoutes = require("./routes/chatRoutes");
const neo4jRoutes = require("./routes/neo4jRoutes");

// ================= EXPRESS APP =================

const app = express();

// ================= CONNECT MONGODB =================

connectDB();

// ================= MIDDLEWARE =================

// ============================================================
// CORS
// ============================================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://enterprise-knowledge-frontend-z4je.onrender.com",
  "https://enterprise-knowledge-management-system-1j0lf6hxg.vercel.app",
];

const frontendURL = process.env.FRONTEND_URL;
if (frontendURL && !allowedOrigins.includes(frontendURL)) {
  allowedOrigins.push(frontendURL);
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// ============================================================
// JSON REQUEST BODY
// ============================================================

app.use(
  express.json({
    limit: "1mb",
  }),
);

// ============================================================
// SECURITY HEADERS
// ============================================================

app.disable("x-powered-by");

app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  next();
});

// ============================================================
// IMPORTANT FILE SECURITY
// ============================================================
//
// DO NOT use:
// app.use("/uploads", express.static(...));
//
// Uploaded enterprise documents must not be publicly accessible.
// They should only be accessed through authenticated document APIs.
//
// ============================================================

// ================= DEFAULT ROUTE =================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Enterprise Knowledge Management Backend Running...",
  });
});

// ============================================================
// API ROUTES
// ============================================================

// EMPLOYEE API
app.use("/api/employees", employeeRoutes);

// USER API
app.use("/api/users", userRoutes);

// PROJECT API
app.use("/api/projects", projectRoutes);

// DOCUMENT API
app.use("/api/documents", documentRoutes);

// RELATIONSHIP API
app.use("/api/relationships", relationshipRoutes);

// AI ASSISTANT API
app.use("/api/ai", aiRoutes);

// CHAT API
app.use("/api/chats", chatRoutes);

// NEO4J API
app.use("/api/neo4j", neo4jRoutes);

// ============================================================
// UNKNOWN API ROUTES
// ============================================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found.",
  });
});

// ============================================================
// CENTRALIZED ERROR HANDLER
// ============================================================

app.use((err, req, res, next) => {
  console.error("====================================");
  console.error("SERVER ERROR");
  console.error("Name:", err.name);
  console.error("Message:", err.message);
  console.error("====================================");

  // ==========================================================
  // MULTER ERRORS
  // ==========================================================

  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size must not exceed 10 MB.",
      });
    }

    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Only one file can be uploaded at a time.",
      });
    }

    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(400).json({
        success: false,
        message: "Unexpected file upload field.",
      });
    }

    return res.status(400).json({
      success: false,
      message: "File upload failed.",
    });
  }

  // ==========================================================
  // INVALID FILE TYPE
  // ==========================================================

  if (
    err.message &&
    err.message.includes("Only PDF, DOC, DOCX, XLS, and XLSX files are allowed")
  ) {
    return res.status(400).json({
      success: false,
      message: "Only PDF, DOC, DOCX, XLS, and XLSX files are allowed.",
    });
  }

  // ==========================================================
  // INVALID JSON
  // ==========================================================

  if (err instanceof SyntaxError && err.status === 400 && err.body) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON request.",
    });
  }

  // ==========================================================
  // MONGOOSE VALIDATION ERROR
  // ==========================================================

  if (err.name === "ValidationError") {
    const validationMessages = Object.values(err.errors || {}).map(
      (error) => error.message,
    );

    return res.status(400).json({
      success: false,
      message:
        validationMessages.length > 0
          ? validationMessages.join(", ")
          : "Validation failed.",
    });
  }

  // ==========================================================
  // INVALID MONGODB OBJECT ID
  // ==========================================================

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format.",
    });
  }

  // ==========================================================
  // MONGODB DUPLICATE KEY
  // ==========================================================

  if (err.code === 11000) {
    const duplicateFields = Object.keys(err.keyValue || {});

    return res.status(409).json({
      success: false,
      message:
        duplicateFields.length > 0
          ? `Duplicate value already exists for: ${duplicateFields.join(", ")}.`
          : "Duplicate value already exists.",
    });
  }

  // ==========================================================
  // JWT INVALID TOKEN
  // ==========================================================

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token.",
    });
  }

  // ==========================================================
  // JWT EXPIRED TOKEN
  // ==========================================================

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Authentication token has expired.",
    });
  }

  // ==========================================================
  // NEO4J ERROR
  // ==========================================================

  if (
    err.name === "Neo4jError" ||
    (err.message && err.message.toLowerCase().includes("neo4j"))
  ) {
    console.error("Neo4j Error:", err.message);

    return res.status(500).json({
      success: false,
      message: "Knowledge graph service error.",
    });
  }

  // ==========================================================
  // DEFAULT ERROR
  // ==========================================================

  const statusCode = err.statusCode || err.status || 500;

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "Internal server error."
        : err.message || "Request failed.",
  });
});

// ============================================================
// SERVER PORT
// ============================================================

const PORT = process.env.PORT || 5000;

// ============================================================
// START SERVER
// ============================================================

const startServer = async () => {
  try {
    // --------------------------------------------------------
    // VERIFY NEO4J CONNECTION
    // --------------------------------------------------------

    await verifyNeo4jConnection();

    // --------------------------------------------------------
    // SYNC EMPLOYEES
    // --------------------------------------------------------

    await syncEmployeesToNeo4j();

    // --------------------------------------------------------
    // SYNC PROJECTS
    // --------------------------------------------------------

    await syncProjectsToNeo4j();

    // --------------------------------------------------------
    // SYNC DOCUMENTS
    // --------------------------------------------------------

    await syncDocumentsToNeo4j();

    // --------------------------------------------------------
    // SYNC RELATIONSHIPS
    // --------------------------------------------------------

    await syncRelationshipsToNeo4j();

    // --------------------------------------------------------
    // START EXPRESS SERVER
    // --------------------------------------------------------

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);

      console.log(`🔐 File uploads are protected from direct public access.`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);

    process.exit(1);
  }
};

// ============================================================
// START APPLICATION
// ============================================================

startServer();
