const express = require("express");

const router = express.Router();

// ================= MIDDLEWARE =================

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const upload = require("../config/multer");

// ================= CONTROLLERS =================

const {
  getDocuments,
  getDocumentById,
  addDocument,
  updateDocument,
  deleteDocument,
  downloadDocument,
} = require("../controllers/documentController");

// ============================================================
// TEST ROUTE
// GET /api/documents/test
// All authenticated users
// ============================================================

router.get("/test", protect, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Document Route Working",
  });
});

// ============================================================
// GET ALL DOCUMENTS
// GET /api/documents
// All authenticated users
// ============================================================

router.get("/", protect, getDocuments);

// ============================================================
// DOWNLOAD DOCUMENT
// GET /api/documents/:id/download
// All authenticated users
// ============================================================

router.get("/:id/download", protect, downloadDocument);

// ============================================================
// GET SINGLE DOCUMENT
// GET /api/documents/:id
// All authenticated users
// ============================================================

router.get("/:id", protect, getDocumentById);

// ============================================================
// ADD DOCUMENT WITH FILE UPLOAD
// POST /api/documents
// Admin + Manager
// ============================================================

router.post(
  "/",
  protect,
  authorizeRoles("Admin", "Manager"),
  upload.single("file"),
  addDocument,
);

// ============================================================
// UPDATE DOCUMENT WITH OPTIONAL FILE
// PUT /api/documents/:id
// Admin + Manager
// ============================================================

router.put(
  "/:id",
  protect,
  authorizeRoles("Admin", "Manager"),
  upload.single("file"),
  updateDocument,
);

// ============================================================
// DELETE DOCUMENT
// DELETE /api/documents/:id
// Admin only
// ============================================================

router.delete("/:id", protect, authorizeRoles("Admin"), deleteDocument);

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;
