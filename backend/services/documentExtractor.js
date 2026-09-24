const fs = require("fs");
const path = require("path");

const { PDFParse } = require("pdf-parse");
const mammoth = require("mammoth");
const XLSX = require("xlsx");

// ============================================================
// CONSTANTS
// ============================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const ALLOWED_FILE_TYPES = [
  "application/pdf",

  "application/msword",

  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "application/vnd.ms-excel",

  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

// ============================================================
// UPLOAD DIRECTORY
// ============================================================

const uploadDirectory = path.resolve(__dirname, "..", "uploads");

// ============================================================
// VALIDATE FILE PATH
// ============================================================

const getSafePhysicalPath = (filePath) => {
  if (typeof filePath !== "string" || filePath.trim() === "") {
    throw new Error("File path is required.");
  }

  let normalizedFilePath = filePath.trim();

  // Convert URL-style upload path:
  // /uploads/file.pdf
  // into:
  // file.pdf
  normalizedFilePath = normalizedFilePath.replace(/^\/+uploads\/+/i, "");

  normalizedFilePath = normalizedFilePath.replace(/^uploads[\\/]+/i, "");

  // Remove leading slashes/backslashes.
  normalizedFilePath = normalizedFilePath.replace(/^[\\/]+/, "");

  const physicalPath = path.resolve(uploadDirectory, normalizedFilePath);

  // Ensure the resolved path stays inside uploads directory.
  const relativePath = path.relative(uploadDirectory, physicalPath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error("Invalid file path.");
  }

  return physicalPath;
};

// ============================================================
// VALIDATE FILE
// ============================================================

const validateFile = (physicalPath, fileType) => {
  if (!ALLOWED_FILE_TYPES.includes(fileType)) {
    throw new Error(`Unsupported document type: ${fileType}`);
  }

  if (!fs.existsSync(physicalPath)) {
    throw new Error("Uploaded file was not found.");
  }

  const stats = fs.statSync(physicalPath);

  if (!stats.isFile()) {
    throw new Error("Uploaded path does not point to a valid file.");
  }

  if (stats.size === 0) {
    throw new Error("Uploaded file is empty.");
  }

  if (stats.size > MAX_FILE_SIZE) {
    throw new Error("Uploaded file exceeds the 10 MB size limit.");
  }

  return stats;
};

// ============================================================
// EXTRACT EXCEL TEXT
// ============================================================

const extractSpreadsheetText = (physicalPath) => {
  const workbook = XLSX.readFile(physicalPath, {
    cellDates: true,
    cellNF: false,
    cellText: true,
  });

  let extractedText = "";

  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];

    const sheetText = XLSX.utils.sheet_to_csv(worksheet);

    extractedText += `\nSheet: ${sheetName}\n`;

    extractedText += sheetText;

    extractedText += "\n";
  });

  return extractedText.trim();
};

// ============================================================
// DOCUMENT TEXT EXTRACTOR
// ============================================================

const extractDocumentText = async (filePath, fileType) => {
  let parser = null;

  try {
    // ========================================================
    // BASIC VALIDATION
    // ========================================================

    if (typeof fileType !== "string" || fileType.trim() === "") {
      throw new Error("Document file type is required.");
    }

    const normalizedFileType = fileType.trim().toLowerCase();

    // ========================================================
    // SAFE PHYSICAL PATH
    // ========================================================

    const physicalPath = getSafePhysicalPath(filePath);

    console.log("Reading uploaded document.");

    // ========================================================
    // FILE VALIDATION
    // ========================================================

    const stats = validateFile(physicalPath, normalizedFileType);

    console.log("Document file size:", stats.size, "bytes");

    // ========================================================
    // PDF
    // ========================================================

    if (normalizedFileType === "application/pdf") {
      const fileBuffer = fs.readFileSync(physicalPath);

      if (!fileBuffer || fileBuffer.length === 0) {
        throw new Error("PDF file is empty.");
      }

      parser = new PDFParse({
        data: fileBuffer,
      });

      const result = await parser.getText();

      const extractedText =
        typeof result?.text === "string" ? result.text.trim() : "";

      console.log("PDF extracted text length:", extractedText.length);

      if (!extractedText) {
        console.warn("Warning: No text could be extracted from this PDF.");
      }

      return extractedText;
    }

    // ========================================================
    // DOCX
    // ========================================================

    if (
      normalizedFileType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({
        path: physicalPath,
      });

      const extractedText =
        typeof result?.value === "string" ? result.value.trim() : "";

      console.log("DOCX extracted text length:", extractedText.length);

      if (!extractedText) {
        console.warn(
          "Warning: No text could be extracted from this DOCX file.",
        );
      }

      return extractedText;
    }

    // ========================================================
    // XLSX
    // ========================================================

    if (
      normalizedFileType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      const extractedText = extractSpreadsheetText(physicalPath);

      console.log("XLSX extracted text length:", extractedText.length);

      if (!extractedText) {
        console.warn(
          "Warning: No text could be extracted from this XLSX file.",
        );
      }

      return extractedText;
    }

    // ========================================================
    // XLS
    // ========================================================

    if (normalizedFileType === "application/vnd.ms-excel") {
      const extractedText = extractSpreadsheetText(physicalPath);

      console.log("XLS extracted text length:", extractedText.length);

      if (!extractedText) {
        console.warn("Warning: No text could be extracted from this XLS file.");
      }

      return extractedText;
    }

    // ========================================================
    // DOC
    // ========================================================

    if (normalizedFileType === "application/msword") {
      throw new Error(
        "Old DOC files are not supported yet. Please upload DOCX instead.",
      );
    }

    // ========================================================
    // UNSUPPORTED TYPE
    // ========================================================

    throw new Error("Unsupported document type.");
  } catch (error) {
    console.error("Document Extraction Error:", error.message);

    throw error;
  } finally {
    // ========================================================
    // CLEAN UP PDF PARSER
    // ========================================================

    if (parser) {
      try {
        await parser.destroy();
      } catch (destroyError) {
        console.error("PDF Parser Cleanup Error:", destroyError.message);
      }
    }
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  extractDocumentText,
};
