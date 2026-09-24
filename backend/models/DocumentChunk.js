const mongoose = require("mongoose");

// ============================================================
// DOCUMENT CHUNK SCHEMA
// ============================================================

const documentChunkSchema = new mongoose.Schema(
  {
    // ==========================================================
    // ORIGINAL DOCUMENT REFERENCE
    // ==========================================================

    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
      required: [true, "Document reference is required."],
    },

    // ==========================================================
    // CHUNK INDEX
    // ==========================================================

    chunkIndex: {
      type: Number,
      required: [true, "Chunk index is required."],
      min: [0, "Chunk index cannot be negative."],
      validate: {
        validator: Number.isInteger,
        message: "Chunk index must be an integer.",
      },
    },

    // ==========================================================
    // EXTRACTED TEXT
    // ==========================================================

    text: {
      type: String,
      required: [true, "Chunk text is required."],
      trim: true,
      minlength: [1, "Chunk text cannot be empty."],
      maxlength: [20000, "Chunk text must not exceed 20000 characters."],
    },

    // ==========================================================
    // EMBEDDING
    // ==========================================================

    embedding: {
      type: [Number],
      default: [],
      validate: {
        validator: function (value) {
          if (!Array.isArray(value)) {
            return false;
          }

          return value.every(
            (number) => typeof number === "number" && Number.isFinite(number),
          );
        },
        message: "Embedding must contain only valid numbers.",
      },
    },

    // ==========================================================
    // DOCUMENT TITLE
    // ==========================================================

    title: {
      type: String,
      trim: true,
      maxlength: [200, "Document title must not exceed 200 characters."],
      default: "",
    },

    // ==========================================================
    // CATEGORY
    // ==========================================================

    category: {
      type: String,
      trim: true,
      maxlength: [100, "Category must not exceed 100 characters."],
      default: "",
    },

    // ==========================================================
    // DEPARTMENT
    // ==========================================================

    department: {
      type: String,
      trim: true,
      maxlength: [100, "Department must not exceed 100 characters."],
      default: "",
    },
  },

  {
    timestamps: true,
  },
);

// ============================================================
// INDEX
// ============================================================

// Prevent duplicate chunk indexes inside the same document.
// This index also supports efficient lookup and chunk ordering.
documentChunkSchema.index(
  {
    documentId: 1,
    chunkIndex: 1,
  },
  {
    unique: true,
  },
);

// ============================================================
// MODEL
// ============================================================

const DocumentChunk =
  mongoose.models.DocumentChunk ||
  mongoose.model("DocumentChunk", documentChunkSchema);

module.exports = DocumentChunk;
