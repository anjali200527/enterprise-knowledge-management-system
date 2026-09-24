const mongoose = require("mongoose");

// ============================================================
// DOCUMENT SCHEMA
// ============================================================

const documentSchema = new mongoose.Schema(
  {
    // ==========================================================
    // TITLE
    // ==========================================================

    title: {
      type: String,
      required: [true, "Document title is required."],
      trim: true,
      minlength: [2, "Document title must contain at least 2 characters."],
      maxlength: [200, "Document title must not exceed 200 characters."],
    },

    // ==========================================================
    // DESCRIPTION
    // ==========================================================

    description: {
      type: String,
      required: [true, "Document description is required."],
      trim: true,
      minlength: [
        2,
        "Document description must contain at least 2 characters.",
      ],
      maxlength: [
        5000,
        "Document description must not exceed 5000 characters.",
      ],
    },

    // ==========================================================
    // CATEGORY
    // ==========================================================

    category: {
      type: String,
      required: [true, "Document category is required."],
      trim: true,
      minlength: [2, "Document category must contain at least 2 characters."],
      maxlength: [100, "Document category must not exceed 100 characters."],
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
    // ORIGINAL FILE NAME
    // ==========================================================

    fileName: {
      type: String,
      trim: true,
      maxlength: [255, "File name must not exceed 255 characters."],
      default: "",
    },

    // ==========================================================
    // FILE URL
    // ==========================================================
    //
    // This should point to the protected download API,
    // not directly to /uploads.
    //

    fileUrl: {
      type: String,
      trim: true,
      maxlength: [1000, "File URL is too long."],
      default: "",
    },

    // ==========================================================
    // ORIGINAL FILE NAME
    // ==========================================================

    originalFileName: {
      type: String,
      trim: true,
      maxlength: [255, "Original file name must not exceed 255 characters."],
      default: "",
    },

    // ==========================================================
    // FILE PATH
    // ==========================================================
    //
    // Example:
    // /uploads/123abc.pdf
    //

    filePath: {
      type: String,
      trim: true,
      maxlength: [500, "File path is too long."],
      default: "",
    },

    // ==========================================================
    // FILE TYPE / MIME TYPE
    // ==========================================================

    fileType: {
      type: String,
      trim: true,
      maxlength: [200, "File type is too long."],
      default: "",
      enum: {
        values: [
          "",
          "application/pdf",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ],
        message: "Unsupported document file type.",
      },
    },

    // ==========================================================
    // FILE SIZE
    // ==========================================================

    fileSize: {
      type: Number,
      min: [0, "File size cannot be negative."],
      max: [10 * 1024 * 1024, "File size must not exceed 10 MB."],
      default: 0,
    },

    // ==========================================================
    // STATUS
    // ==========================================================

    status: {
      type: String,
      required: [true, "Document status is required."],
      enum: {
        values: ["Active", "Archived"],
        message: "Invalid document status.",
      },
      default: "Active",
    },
  },

  {
    timestamps: true,
  },
);

// ============================================================
// INDEXES
// ============================================================

documentSchema.index({
  createdAt: -1,
});

documentSchema.index({
  department: 1,
});

documentSchema.index({
  category: 1,
});

documentSchema.index({
  status: 1,
});

// ============================================================
// EXPORT MODEL
// ============================================================

const Document =
  mongoose.models.Document || mongoose.model("Document", documentSchema);

module.exports = Document;
