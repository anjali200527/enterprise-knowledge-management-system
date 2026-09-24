const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const fsp = require("fs").promises;

const Document = require("../models/Document");
const DocumentChunk = require("../models/DocumentChunk");

const { extractDocumentText } = require("../services/documentExtractor");

const { chunkText } = require("../services/textChunker");

const { createEmbedding } = require("../services/embeddingService");

// ============================================================
// CONSTANTS
// ============================================================

const MAX_TITLE_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 5000;
const MAX_CATEGORY_LENGTH = 100;
const MAX_DEPARTMENT_LENGTH = 100;
const MAX_STATUS_LENGTH = 50;

// ============================================================
// HELPERS
// ============================================================

const isValidDocumentId = (id) => {
  return typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
};

// ============================================================
// STRING VALIDATION
// ============================================================

const isValidString = (value, maxLength) => {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maxLength
  );
};

// ============================================================
// DELETE FILE SAFELY
// ============================================================

const deleteFileSafely = async (filePath) => {
  if (!filePath) {
    return;
  }

  try {
    await fsp.unlink(filePath);

    console.log("File deleted successfully.");
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("File deletion error:", error.message);
    }
  }
};

// ============================================================
// GET SAFE PHYSICAL UPLOAD PATH
// Prevents path traversal
// ============================================================

const getSafeUploadFilePath = (storedFilePath) => {
  if (
    typeof storedFilePath !== "string" ||
    !storedFilePath.startsWith("/uploads/")
  ) {
    return null;
  }

  const fileName = path.basename(storedFilePath);

  if (!fileName || fileName === "." || fileName === "..") {
    return null;
  }

  const uploadDirectory = path.resolve(__dirname, "..", "uploads");

  const resolvedFilePath = path.resolve(uploadDirectory, fileName);

  if (!resolvedFilePath.startsWith(`${uploadDirectory}${path.sep}`)) {
    return null;
  }

  return resolvedFilePath;
};

// ============================================================
// GET BACKEND URL
// ============================================================

const getBackendUrl = () => {
  return (
    process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`
  ).replace(/\/$/, "");
};

// ============================================================
// GET ALL DOCUMENTS
// GET /api/documents
// ============================================================

exports.getDocuments = async (req, res) => {
  try {
    const documents = await Document.find()
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: documents.length,
      documents,
    });
  } catch (error) {
    console.error("Get Documents Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch documents.",
    });
  }
};

// ============================================================
// GET SINGLE DOCUMENT
// GET /api/documents/:id
// ============================================================

exports.getDocumentById = async (req, res) => {
  try {
    const documentId = req.params.id;

    // ========================================================
    // VALIDATE ID
    // ========================================================

    if (!isValidDocumentId(documentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID format.",
      });
    }

    // ========================================================
    // FIND DOCUMENT
    // ========================================================

    const document = await Document.findById(documentId).lean();

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    return res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    console.error("Get Document Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch document.",
    });
  }
};

// ============================================================
// ADD DOCUMENT WITH FILE UPLOAD
// POST /api/documents
// Admin + Manager - enforced by route
// ============================================================

exports.addDocument = async (req, res) => {
  let createdDocument = null;

  try {
    const body = req.body || {};

    const title = typeof body.title === "string" ? body.title.trim() : "";

    const description =
      typeof body.description === "string" ? body.description.trim() : "";

    const category =
      typeof body.category === "string" ? body.category.trim() : "";

    const department =
      typeof body.department === "string" ? body.department.trim() : "";

    const status =
      typeof body.status === "string" && body.status.trim()
        ? body.status.trim()
        : "Active";

    // ========================================================
    // VALIDATE TEXT FIELDS
    // ========================================================

    if (
      !isValidString(title, MAX_TITLE_LENGTH) ||
      !isValidString(description, MAX_DESCRIPTION_LENGTH) ||
      !isValidString(category, MAX_CATEGORY_LENGTH) ||
      !isValidString(department, MAX_DEPARTMENT_LENGTH) ||
      !isValidString(status, MAX_STATUS_LENGTH)
    ) {
      if (req.file) {
        await deleteFileSafely(req.file.path);
      }

      return res.status(400).json({
        success: false,
        message:
          "Please provide valid title, description, category, department and status.",
      });
    }

    // ========================================================
    // VALIDATE FILE
    // ========================================================

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a document file.",
      });
    }

    // ========================================================
    // FILE INFORMATION
    // ========================================================

    const originalFileName =
      typeof req.file.originalname === "string"
        ? req.file.originalname
        : "document";

    const filePath = `/uploads/${req.file.filename}`;

    const fileType = req.file.mimetype;
    const fileSize = req.file.size;

    // ========================================================
    // CREATE DOCUMENT
    // ========================================================

    createdDocument = await Document.create({
      title,
      description,
      category,
      department,

      fileName: originalFileName,

      originalFileName: originalFileName,

      filePath,

      fileUrl: `${getBackendUrl()}/api/documents/TEMP/download`,

      fileType,

      fileSize,

      status,
    });

    // ========================================================
    // SET PROTECTED DOWNLOAD URL
    // ========================================================

    createdDocument.fileUrl = `${getBackendUrl()}/api/documents/${createdDocument._id}/download`;

    await createdDocument.save();

    // ========================================================
    // EXTRACT DOCUMENT TEXT
    // ========================================================

    const extractedText = await extractDocumentText(
      createdDocument.filePath,
      createdDocument.fileType,
    );

    const safeExtractedText =
      typeof extractedText === "string" ? extractedText.trim() : "";

    console.log(`Extracted text length: ${safeExtractedText.length}`);

    // ========================================================
    // SPLIT TEXT INTO CHUNKS
    // ========================================================

    const chunks = chunkText(safeExtractedText);

    console.log(`Total chunks created: ${chunks.length}`);

    // ========================================================
    // CREATE CHUNKS + EMBEDDINGS
    // ========================================================

    if (chunks.length > 0) {
      const chunkDocuments = [];

      for (let index = 0; index < chunks.length; index++) {
        const chunk = chunks[index];

        if (typeof chunk !== "string" || !chunk.trim()) {
          continue;
        }

        console.log(
          `Creating embedding for chunk ${index + 1}/${chunks.length}...`,
        );

        const embedding = await createEmbedding(chunk);

        if (!Array.isArray(embedding) || embedding.length === 0) {
          throw new Error("Failed to create document embedding.");
        }

        chunkDocuments.push({
          documentId: createdDocument._id,

          chunkIndex: index,

          text: chunk,

          embedding,

          title: createdDocument.title,

          category: createdDocument.category,

          department: createdDocument.department,
        });
      }

      // ======================================================
      // SAVE CHUNKS
      // ======================================================

      if (chunkDocuments.length > 0) {
        await DocumentChunk.insertMany(chunkDocuments);

        console.log(`${chunkDocuments.length} chunks with embeddings saved.`);
      }
    }

    // ========================================================
    // SUCCESS
    // ========================================================

    return res.status(201).json({
      success: true,
      message: "Document uploaded and processed successfully.",
      document: createdDocument,
      chunksCreated: chunks.length,
    });
  } catch (error) {
    console.error("Add Document Error:", error.message);

    // ========================================================
    // DELETE CREATED CHUNKS
    // ========================================================

    if (createdDocument?._id) {
      try {
        await DocumentChunk.deleteMany({
          documentId: createdDocument._id,
        });
      } catch (chunkError) {
        console.error("Failed to cleanup document chunks:", chunkError.message);
      }
    }

    // ========================================================
    // DELETE CREATED DOCUMENT
    // ========================================================

    if (createdDocument?._id) {
      try {
        await Document.findByIdAndDelete(createdDocument._id);
      } catch (documentError) {
        console.error("Failed to cleanup document:", documentError.message);
      }
    }

    // ========================================================
    // DELETE UPLOADED FILE
    // ========================================================

    if (req.file) {
      await deleteFileSafely(req.file.path);
    }

    // ========================================================
    // MONGOOSE VALIDATION ERROR
    // ========================================================

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid document data.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to upload and process document.",
    });
  }
};

// ============================================================
// UPDATE DOCUMENT
// PUT /api/documents/:id
// Admin + Manager - enforced by route
// ============================================================

exports.updateDocument = async (req, res) => {
  let newFilePath = null;

  try {
    const documentId = req.params.id;

    // ========================================================
    // VALIDATE ID
    // ========================================================

    if (!isValidDocumentId(documentId)) {
      if (req.file) {
        await deleteFileSafely(req.file.path);
      }

      return res.status(400).json({
        success: false,
        message: "Invalid document ID format.",
      });
    }

    const body = req.body || {};

    const title = typeof body.title === "string" ? body.title.trim() : "";

    const description =
      typeof body.description === "string" ? body.description.trim() : "";

    const category =
      typeof body.category === "string" ? body.category.trim() : "";

    const department =
      typeof body.department === "string" ? body.department.trim() : "";

    const status =
      typeof body.status === "string" && body.status.trim()
        ? body.status.trim()
        : "Active";

    // ========================================================
    // VALIDATE TEXT FIELDS
    // ========================================================

    if (
      !isValidString(title, MAX_TITLE_LENGTH) ||
      !isValidString(description, MAX_DESCRIPTION_LENGTH) ||
      !isValidString(category, MAX_CATEGORY_LENGTH) ||
      !isValidString(department, MAX_DEPARTMENT_LENGTH) ||
      !isValidString(status, MAX_STATUS_LENGTH)
    ) {
      if (req.file) {
        await deleteFileSafely(req.file.path);
      }

      return res.status(400).json({
        success: false,
        message:
          "Please provide valid title, description, category, department and status.",
      });
    }

    // ========================================================
    // FIND DOCUMENT
    // ========================================================

    const document = await Document.findById(documentId);

    if (!document) {
      if (req.file) {
        await deleteFileSafely(req.file.path);
      }

      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    // ========================================================
    // SAVE OLD FILE INFORMATION
    // ========================================================

    const oldFilePath = document.filePath;

    // ========================================================
    // CASE 1: NEW FILE PROVIDED
    // ========================================================

    if (req.file) {
      newFilePath = `/uploads/${req.file.filename}`;

      const newFileType = req.file.mimetype;

      // ======================================================
      // EXTRACT NEW FILE TEXT
      // ======================================================

      console.log("Processing new document file for RAG...");

      const extractedText = await extractDocumentText(newFilePath, newFileType);

      const safeExtractedText =
        typeof extractedText === "string" ? extractedText.trim() : "";

      console.log(
        `Updated document extracted text length: ${safeExtractedText.length}`,
      );

      // ======================================================
      // CREATE NEW CHUNKS
      // ======================================================

      const chunks = chunkText(safeExtractedText);

      console.log(`Updated document chunks created: ${chunks.length}`);

      // ======================================================
      // CREATE NEW EMBEDDINGS
      // ======================================================

      const chunkDocuments = [];

      for (let index = 0; index < chunks.length; index++) {
        const chunk = chunks[index];

        if (typeof chunk !== "string" || !chunk.trim()) {
          continue;
        }

        console.log(
          `Creating updated embedding for chunk ${
            index + 1
          }/${chunks.length}...`,
        );

        const embedding = await createEmbedding(chunk);

        if (!Array.isArray(embedding) || embedding.length === 0) {
          throw new Error("Failed to create document embedding.");
        }

        chunkDocuments.push({
          documentId: document._id,

          chunkIndex: index,

          text: chunk,

          embedding,

          title,

          category,

          department,
        });
      }

      // ======================================================
      // UPDATE DOCUMENT
      // ======================================================

      document.title = title;
      document.description = description;
      document.category = category;
      document.department = department;
      document.status = status;

      document.fileName = req.file.originalname;

      document.originalFileName = req.file.originalname;

      document.filePath = newFilePath;

      document.fileUrl = `${getBackendUrl()}/api/documents/${document._id}/download`;

      document.fileType = newFileType;

      document.fileSize = req.file.size;

      const updatedDocument = await document.save();

      // ======================================================
      // DELETE OLD CHUNKS
      // ======================================================

      await DocumentChunk.deleteMany({
        documentId: document._id,
      });

      // ======================================================
      // SAVE NEW CHUNKS
      // ======================================================

      if (chunkDocuments.length > 0) {
        await DocumentChunk.insertMany(chunkDocuments);

        console.log(`${chunkDocuments.length} updated chunks saved.`);
      }

      // ======================================================
      // DELETE OLD PHYSICAL FILE
      // ======================================================

      const oldPhysicalPath = getSafeUploadFilePath(oldFilePath);

      if (oldPhysicalPath && oldPhysicalPath !== req.file.path) {
        await deleteFileSafely(oldPhysicalPath);
      }

      // ======================================================
      // SUCCESS
      // ======================================================

      return res.status(200).json({
        success: true,
        message: "Document, file, chunks and embeddings updated successfully.",
        document: updatedDocument,
        chunksCreated: chunkDocuments.length,
      });
    }

    // ========================================================
    // CASE 2: NO NEW FILE
    // ========================================================

    document.title = title;
    document.description = description;
    document.category = category;
    document.department = department;
    document.status = status;

    const updatedDocument = await document.save();

    // ========================================================
    // UPDATE EXISTING CHUNK METADATA
    // ========================================================

    await DocumentChunk.updateMany(
      {
        documentId: document._id,
      },
      {
        $set: {
          title: document.title,

          category: document.category,

          department: document.department,
        },
      },
    );

    // ========================================================
    // SUCCESS
    // ========================================================

    return res.status(200).json({
      success: true,
      message: "Document information updated successfully.",
      document: updatedDocument,
    });
  } catch (error) {
    console.error("Update Document Error:", error.message);

    // ========================================================
    // DELETE NEW FILE IF UPDATE PROCESS FAILS
    // ========================================================

    if (req.file) {
      await deleteFileSafely(req.file.path);
    }

    // ========================================================
    // ERROR RESPONSE
    // ========================================================

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid document data.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update document.",
    });
  }
};

// ============================================================
// DELETE DOCUMENT
// DELETE /api/documents/:id
// Admin only - enforced by route
// ============================================================

exports.deleteDocument = async (req, res) => {
  try {
    const documentId = req.params.id;

    // ========================================================
    // VALIDATE ID
    // ========================================================

    if (!isValidDocumentId(documentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID format.",
      });
    }

    // ========================================================
    // FIND DOCUMENT FIRST
    // ========================================================

    const document = await Document.findById(documentId);

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    // ========================================================
    // DELETE DOCUMENT CHUNKS
    // ========================================================

    await DocumentChunk.deleteMany({
      documentId: document._id,
    });

    // ========================================================
    // DELETE DOCUMENT
    // ========================================================

    await Document.findByIdAndDelete(document._id);

    // ========================================================
    // DELETE PHYSICAL FILE
    // ========================================================

    const physicalFilePath = getSafeUploadFilePath(document.filePath);

    if (physicalFilePath) {
      await deleteFileSafely(physicalFilePath);
    }

    // ========================================================
    // SUCCESS
    // ========================================================

    return res.status(200).json({
      success: true,
      message: "Document and its chunks deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Document Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete document.",
    });
  }
};

// ============================================================
// DOWNLOAD DOCUMENT
// GET /api/documents/:id/download
// Authentication enforced by documentRoutes.js
// ============================================================

exports.downloadDocument = async (req, res) => {
  try {
    const documentId = req.params.id;

    // ========================================================
    // VALIDATE ID
    // ========================================================

    if (!isValidDocumentId(documentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid document ID format.",
      });
    }

    // ========================================================
    // FIND DOCUMENT
    // ========================================================

    const document = await Document.findById(documentId).lean();

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found.",
      });
    }

    // ========================================================
    // CHECK STORED FILE PATH
    // ========================================================

    if (!document.filePath || typeof document.filePath !== "string") {
      return res.status(404).json({
        success: false,
        message: "File is not available for this document.",
      });
    }

    // ========================================================
    // GET SAFE PHYSICAL PATH
    // ========================================================

    const physicalFilePath = getSafeUploadFilePath(document.filePath);

    if (!physicalFilePath) {
      return res.status(403).json({
        success: false,
        message: "Invalid file path.",
      });
    }

    // ========================================================
    // CHECK FILE EXISTS
    // ========================================================

    try {
      await fsp.access(physicalFilePath, fs.constants.F_OK);
    } catch {
      return res.status(404).json({
        success: false,
        message: "Uploaded file not found.",
      });
    }

    // ========================================================
    // SAFE DOWNLOAD NAME
    // ========================================================

    const originalName =
      document.originalFileName ||
      document.fileName ||
      path.basename(physicalFilePath);

    const safeDownloadName = path
      .basename(String(originalName))
      .replace(/[\r\n"]/g, "_");

    // ========================================================
    // DOWNLOAD
    // ========================================================

    return res.download(physicalFilePath, safeDownloadName, (error) => {
      if (error) {
        console.error("File download error:", error.message);

        if (!res.headersSent) {
          return res.status(500).json({
            success: false,
            message: "Failed to download document.",
          });
        }
      }
    });
  } catch (error) {
    console.error("Download Document Error:", error.message);

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to download document.",
      });
    }
  }
};
