const mongoose = require("mongoose");

// ============================================================
// CONSTANTS
// ============================================================

const ALLOWED_ENTITY_TYPES = ["Employee", "Project", "Document"];

const MAX_RELATIONSHIP_TYPE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 2000;

// ============================================================
// RELATIONSHIP SCHEMA
// ============================================================

const relationshipSchema = new mongoose.Schema(
  {
    // ==========================================================
    // SOURCE TYPE
    // ==========================================================

    sourceType: {
      type: String,
      required: [true, "Source entity type is required."],
      enum: {
        values: ALLOWED_ENTITY_TYPES,
        message: "Invalid source entity type.",
      },
      trim: true,
    },

    // ==========================================================
    // SOURCE ID
    // ==========================================================

    sourceId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Source entity ID is required."],
      index: true,
    },

    // ==========================================================
    // TARGET TYPE
    // ==========================================================

    targetType: {
      type: String,
      required: [true, "Target entity type is required."],
      enum: {
        values: ALLOWED_ENTITY_TYPES,
        message: "Invalid target entity type.",
      },
      trim: true,
    },

    // ==========================================================
    // TARGET ID
    // ==========================================================

    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, "Target entity ID is required."],
      index: true,
    },

    // ==========================================================
    // RELATIONSHIP TYPE
    // ==========================================================

    relationshipType: {
      type: String,
      required: [true, "Relationship type is required."],
      trim: true,
      minlength: [1, "Relationship type cannot be empty."],
      maxlength: [
        MAX_RELATIONSHIP_TYPE_LENGTH,
        "Relationship type must not exceed 100 characters.",
      ],
    },

    // ==========================================================
    // DESCRIPTION
    // ==========================================================

    description: {
      type: String,
      trim: true,
      maxlength: [
        MAX_DESCRIPTION_LENGTH,
        "Description must not exceed 2000 characters.",
      ],
      default: "",
    },
  },

  {
    timestamps: true,
  },
);

// ============================================================
// PREVENT SELF RELATIONSHIP
// ============================================================

relationshipSchema.pre("validate", function (next) {
  if (
    this.sourceType === this.targetType &&
    this.sourceId &&
    this.targetId &&
    this.sourceId.equals(this.targetId)
  ) {
    return next(new Error("Source and target cannot be the same entity."));
  }

  next();
});

// ============================================================
// UNIQUE RELATIONSHIP INDEX
// ============================================================
//
// Prevent duplicate relationships such as:
//
// Employee A
//   -> WORKS_ON
// Project B
//
// from being stored more than once.
//

relationshipSchema.index(
  {
    sourceType: 1,
    sourceId: 1,
    targetType: 1,
    targetId: 1,
    relationshipType: 1,
  },
  {
    unique: true,
  },
);

// ============================================================
// QUERY INDEXES
// ============================================================

relationshipSchema.index({
  sourceType: 1,
  sourceId: 1,
});

relationshipSchema.index({
  targetType: 1,
  targetId: 1,
});

relationshipSchema.index({
  createdAt: -1,
});

// ============================================================
// EXPORT MODEL
// ============================================================

const Relationship =
  mongoose.models.Relationship ||
  mongoose.model("Relationship", relationshipSchema);

module.exports = Relationship;
