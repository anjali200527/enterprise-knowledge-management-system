const mongoose = require("mongoose");
const Relationship = require("../models/Relationship");

// ============================================================
// CONSTANTS
// ============================================================

const MAX_DESCRIPTION_LENGTH = 2000;
const MAX_TYPE_LENGTH = 50;
const MAX_RELATIONSHIP_TYPE_LENGTH = 100;

const ALLOWED_ENTITY_TYPES = ["Employee", "Project", "Document"];

// ============================================================
// HELPERS
// ============================================================

const isValidObjectId = (id) => {
  return typeof id === "string" && mongoose.Types.ObjectId.isValid(id);
};

const cleanString = (value) => {
  return typeof value === "string" ? value.trim() : "";
};

const isValidString = (value, maxLength) => {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.trim().length <= maxLength
  );
};

// ============================================================
// GET ALL RELATIONSHIPS
// GET /api/relationships
// ============================================================

exports.getRelationships = async (req, res) => {
  try {
    const relationships = await Relationship.find()
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      count: relationships.length,
      relationships,
    });
  } catch (error) {
    console.error("Get Relationships Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch relationships.",
    });
  }
};

// ============================================================
// GET SINGLE RELATIONSHIP
// GET /api/relationships/:id
// ============================================================

exports.getRelationshipById = async (req, res) => {
  try {
    const relationshipId = req.params.id;

    if (!isValidObjectId(relationshipId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid relationship ID format.",
      });
    }

    const relationship = await Relationship.findById(relationshipId).lean();

    if (!relationship) {
      return res.status(404).json({
        success: false,
        message: "Relationship not found.",
      });
    }

    return res.status(200).json({
      success: true,
      relationship,
    });
  } catch (error) {
    console.error("Get Relationship Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch relationship.",
    });
  }
};

// ============================================================
// ADD RELATIONSHIP
// POST /api/relationships
// ============================================================

exports.addRelationship = async (req, res) => {
  try {
    const body = req.body || {};

    const sourceType = cleanString(body.sourceType);

    const sourceId = cleanString(body.sourceId);

    const targetType = cleanString(body.targetType);

    const targetId = cleanString(body.targetId);

    const relationshipType = cleanString(body.relationshipType);

    const description = cleanString(body.description);

    // ========================================================
    // REQUIRED FIELDS
    // ========================================================

    if (
      !sourceType ||
      !sourceId ||
      !targetType ||
      !targetId ||
      !relationshipType
    ) {
      return res.status(400).json({
        success: false,
        message: "Source, target and relationship type are required.",
      });
    }

    // ========================================================
    // ENTITY TYPE VALIDATION
    // ========================================================

    if (
      !ALLOWED_ENTITY_TYPES.includes(sourceType) ||
      !ALLOWED_ENTITY_TYPES.includes(targetType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid source or target entity type.",
      });
    }

    // ========================================================
    // LENGTH VALIDATION
    // ========================================================

    if (
      sourceType.length > MAX_TYPE_LENGTH ||
      targetType.length > MAX_TYPE_LENGTH ||
      relationshipType.length > MAX_RELATIONSHIP_TYPE_LENGTH
    ) {
      return res.status(400).json({
        success: false,
        message: "Relationship type data is too long.",
      });
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      return res.status(400).json({
        success: false,
        message: "Description must not exceed 2000 characters.",
      });
    }

    // ========================================================
    // SOURCE ID VALIDATION
    // ========================================================

    if (!isValidObjectId(sourceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid source entity ID.",
      });
    }

    // ========================================================
    // TARGET ID VALIDATION
    // ========================================================

    if (!isValidObjectId(targetId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target entity ID.",
      });
    }

    // ========================================================
    // PREVENT SELF RELATIONSHIP
    // ========================================================

    if (sourceType === targetType && sourceId === targetId) {
      return res.status(400).json({
        success: false,
        message: "Source and target cannot be the same entity.",
      });
    }

    // ========================================================
    // DUPLICATE CHECK
    // ========================================================

    const existingRelationship = await Relationship.findOne({
      sourceType,
      sourceId,
      targetType,
      targetId,
      relationshipType,
    }).lean();

    if (existingRelationship) {
      return res.status(409).json({
        success: false,
        message: "This relationship already exists.",
      });
    }

    // ========================================================
    // CREATE
    // ========================================================

    const relationship = await Relationship.create({
      sourceType,
      sourceId,
      targetType,
      targetId,
      relationshipType,
      description,
    });

    return res.status(201).json({
      success: true,
      message: "Relationship added successfully.",
      relationship,
    });
  } catch (error) {
    console.error("Add Relationship Error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid relationship data.",
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This relationship already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to add relationship.",
    });
  }
};

// ============================================================
// UPDATE RELATIONSHIP
// PUT /api/relationships/:id
// ============================================================

exports.updateRelationship = async (req, res) => {
  try {
    const relationshipId = req.params.id;

    // ========================================================
    // VALIDATE RELATIONSHIP ID
    // ========================================================

    if (!isValidObjectId(relationshipId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid relationship ID format.",
      });
    }

    const body = req.body || {};

    const sourceType = cleanString(body.sourceType);

    const sourceId = cleanString(body.sourceId);

    const targetType = cleanString(body.targetType);

    const targetId = cleanString(body.targetId);

    const relationshipType = cleanString(body.relationshipType);

    const description = cleanString(body.description);

    // ========================================================
    // REQUIRED FIELDS
    // ========================================================

    if (
      !sourceType ||
      !sourceId ||
      !targetType ||
      !targetId ||
      !relationshipType
    ) {
      return res.status(400).json({
        success: false,
        message: "Source, target and relationship type are required.",
      });
    }

    // ========================================================
    // ENTITY TYPE VALIDATION
    // ========================================================

    if (
      !ALLOWED_ENTITY_TYPES.includes(sourceType) ||
      !ALLOWED_ENTITY_TYPES.includes(targetType)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid source or target entity type.",
      });
    }

    // ========================================================
    // LENGTH VALIDATION
    // ========================================================

    if (
      sourceType.length > MAX_TYPE_LENGTH ||
      targetType.length > MAX_TYPE_LENGTH ||
      relationshipType.length > MAX_RELATIONSHIP_TYPE_LENGTH
    ) {
      return res.status(400).json({
        success: false,
        message: "Relationship type data is too long.",
      });
    }

    if (description.length > MAX_DESCRIPTION_LENGTH) {
      return res.status(400).json({
        success: false,
        message: "Description must not exceed 2000 characters.",
      });
    }

    // ========================================================
    // SOURCE / TARGET ID VALIDATION
    // ========================================================

    if (!isValidObjectId(sourceId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid source entity ID.",
      });
    }

    if (!isValidObjectId(targetId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid target entity ID.",
      });
    }

    // ========================================================
    // PREVENT SELF RELATIONSHIP
    // ========================================================

    if (sourceType === targetType && sourceId === targetId) {
      return res.status(400).json({
        success: false,
        message: "Source and target cannot be the same entity.",
      });
    }

    // ========================================================
    // CHECK CURRENT RELATIONSHIP
    // ========================================================

    const currentRelationship = await Relationship.findById(relationshipId);

    if (!currentRelationship) {
      return res.status(404).json({
        success: false,
        message: "Relationship not found.",
      });
    }

    // ========================================================
    // DUPLICATE CHECK
    // ========================================================

    const existingRelationship = await Relationship.findOne({
      sourceType,
      sourceId,
      targetType,
      targetId,
      relationshipType,
      _id: {
        $ne: relationshipId,
      },
    }).lean();

    if (existingRelationship) {
      return res.status(409).json({
        success: false,
        message: "Another identical relationship already exists.",
      });
    }

    // ========================================================
    // UPDATE
    // ========================================================

    const relationship = await Relationship.findByIdAndUpdate(
      relationshipId,
      {
        sourceType,
        sourceId,
        targetType,
        targetId,
        relationshipType,
        description,
      },
      {
        new: true,
        runValidators: true,
      },
    ).lean();

    if (!relationship) {
      return res.status(404).json({
        success: false,
        message: "Relationship not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Relationship updated successfully.",
      relationship,
    });
  } catch (error) {
    console.error("Update Relationship Error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid relationship data.",
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Another identical relationship already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update relationship.",
    });
  }
};

// ============================================================
// DELETE RELATIONSHIP
// DELETE /api/relationships/:id
// ============================================================

exports.deleteRelationship = async (req, res) => {
  try {
    const relationshipId = req.params.id;

    // ========================================================
    // VALIDATE ID
    // ========================================================

    if (!isValidObjectId(relationshipId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid relationship ID format.",
      });
    }

    // ========================================================
    // DELETE
    // ========================================================

    const relationship = await Relationship.findByIdAndDelete(relationshipId);

    if (!relationship) {
      return res.status(404).json({
        success: false,
        message: "Relationship not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Relationship deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Relationship Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete relationship.",
    });
  }
};
