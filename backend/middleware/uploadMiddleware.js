const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

// ============================================================
// UPLOAD DIRECTORY
// ============================================================

const uploadDirectory = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// ============================================================
// ALLOWED FILE TYPES
// ============================================================

const allowedExtensions = [".pdf", ".doc", ".docx", ".xls", ".xlsx"];

const allowedMimeTypes = [
  "application/pdf",

  "application/msword",

  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "application/vnd.ms-excel",

  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

// ============================================================
// STORAGE
// ============================================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    const originalExtension = path.extname(file.originalname).toLowerCase();

    const uniqueName =
      `${Date.now()}-` +
      `${crypto.randomBytes(8).toString("hex")}` +
      originalExtension;

    cb(null, uniqueName);
  },
});

// ============================================================
// FILE FILTER
// ============================================================

const fileFilter = (req, file, cb) => {
  const extension = path.extname(file.originalname).toLowerCase();

  const mimeType = file.mimetype;

  // Check extension
  const extensionAllowed = allowedExtensions.includes(extension);

  // Check MIME type
  const mimeTypeAllowed = allowedMimeTypes.includes(mimeType);

  if (!extensionAllowed || !mimeTypeAllowed) {
    return cb(
      new Error("Only PDF, DOC, DOCX, XLS, and XLSX files are allowed"),
      false,
    );
  }

  cb(null, true);
};

// ============================================================
// MULTER CONFIGURATION
// ============================================================

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 1,
  },
});

// ============================================================
// EXPORT
// ============================================================

module.exports = upload;
