const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// ============================================================
// UPLOAD DIRECTORY
// ============================================================

const uploadDirectory = path.resolve(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// ============================================================
// ALLOWED FILE TYPES
// ============================================================

const allowedMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const allowedExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx"];

// ============================================================
// STORAGE
// ============================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    try {
      const originalName =
        typeof file.originalname === "string" ? file.originalname : "";

      const extension = path.extname(originalName).toLowerCase();

      // Generate cryptographically strong random filename.
      const randomName = crypto.randomBytes(16).toString("hex");

      const uniqueName = `${Date.now()}-${randomName}${extension}`;

      cb(null, uniqueName);
    } catch (error) {
      cb(error);
    }
  },
});

// ============================================================
// FILE FILTER
// ============================================================

const fileFilter = (req, file, cb) => {
  try {
    if (
      !file ||
      typeof file.originalname !== "string" ||
      typeof file.mimetype !== "string"
    ) {
      return cb(new Error("Invalid uploaded file."), false);
    }

    const originalName = file.originalname.trim();

    if (!originalName) {
      return cb(new Error("Uploaded file name is required."), false);
    }

    // Prevent excessively long original names.
    if (originalName.length > 255) {
      return cb(new Error("File name must not exceed 255 characters."), false);
    }

    const extension = path.extname(originalName).toLowerCase();

    const mimeType = file.mimetype.trim().toLowerCase();

    const extensionAllowed = allowedExtensions.includes(extension);

    const mimeTypeAllowed = allowedMimeTypes.includes(mimeType);

    if (!extensionAllowed || !mimeTypeAllowed) {
      return cb(
        new Error("Only PDF, DOC, DOCX, XLS, and XLSX files are allowed"),
        false,
      );
    }

    return cb(null, true);
  } catch (error) {
    return cb(error, false);
  }
};

// ============================================================
// MULTER CONFIGURATION
// ============================================================

const upload = multer({
  storage,

  fileFilter,

  limits: {
    // Maximum file size: 10 MB
    fileSize: 10 * 1024 * 1024,

    // Only one file
    files: 1,

    // Maximum number of non-file fields
    fields: 20,

    // Maximum size of a single field
    fieldSize: 1024 * 1024,

    // Maximum number of parts
    parts: 21,
  },
});

// ============================================================
// EXPORT
// ============================================================

module.exports = upload;
