const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

const Chat = require("../models/Chat");

const protect = require("../middleware/authMiddleware");

// ============================================================
// CONSTANTS
// ============================================================

const MAX_QUESTION_LENGTH = 2000;
const MAX_ANSWER_LENGTH = 10000;

// ============================================================
// GET USER CHAT HISTORY
// GET /api/chats
// Logged-in user only
// ============================================================

router.get("/", protect, async (req, res) => {
  try {
    const userId = req.user?.id;

    // ========================================================
    // CHECK USER ID
    // ========================================================

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication information is missing.",
      });
    }

    // ========================================================
    // GET ONLY CURRENT USER'S CHATS
    // ========================================================

    const chats = await Chat.find({
      userId: String(userId),
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    // ========================================================
    // SUCCESS
    // ========================================================

    return res.status(200).json({
      success: true,
      chats,
    });
  } catch (error) {
    console.error("Get Chat History Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch chat history.",
    });
  }
});

// ============================================================
// SAVE CHAT
// POST /api/chats
// Logged-in user only
// ============================================================

router.post("/", protect, async (req, res) => {
  try {
    const userId = req.user?.id;

    // ========================================================
    // CHECK USER ID
    // ========================================================

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication information is missing.",
      });
    }

    // ========================================================
    // GET REQUEST DATA
    // ========================================================

    const body = req.body || {};

    const question =
      typeof body.question === "string" ? body.question.trim() : "";

    const answer = typeof body.answer === "string" ? body.answer.trim() : "";

    // ========================================================
    // VALIDATE QUESTION
    // ========================================================

    if (!question) {
      return res.status(400).json({
        success: false,
        message: "Question is required.",
      });
    }

    // ========================================================
    // VALIDATE ANSWER
    // ========================================================

    if (!answer) {
      return res.status(400).json({
        success: false,
        message: "Answer is required.",
      });
    }

    // ========================================================
    // QUESTION LENGTH LIMIT
    // ========================================================

    if (question.length > MAX_QUESTION_LENGTH) {
      return res.status(400).json({
        success: false,
        message: "Question must not exceed 2000 characters.",
      });
    }

    // ========================================================
    // ANSWER LENGTH LIMIT
    // ========================================================

    if (answer.length > MAX_ANSWER_LENGTH) {
      return res.status(400).json({
        success: false,
        message: "Answer must not exceed 10000 characters.",
      });
    }

    // ========================================================
    // CREATE CHAT
    // ========================================================

    const chat = await Chat.create({
      userId: String(userId),
      question,
      answer,
    });

    // ========================================================
    // SUCCESS
    // ========================================================

    return res.status(201).json({
      success: true,
      message: "Chat saved successfully.",
      chat,
    });
  } catch (error) {
    console.error("Save Chat Error:", error.message);

    // ========================================================
    // MONGOOSE VALIDATION ERROR
    // ========================================================

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid chat data.",
      });
    }

    // ========================================================
    // DEFAULT ERROR
    // ========================================================

    return res.status(500).json({
      success: false,
      message: "Failed to save chat.",
    });
  }
});

// ============================================================
// CLEAR ALL USER CHAT HISTORY
// IMPORTANT: KEEP BEFORE /:id
// DELETE /api/chats/clear
// Logged-in user only
// ============================================================

router.delete("/clear", protect, async (req, res) => {
  try {
    const userId = req.user?.id;

    // ======================================================
    // CHECK USER ID
    // ======================================================

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication information is missing.",
      });
    }

    // ======================================================
    // DELETE ONLY CURRENT USER'S CHATS
    // ======================================================

    const result = await Chat.deleteMany({
      userId: String(userId),
    });

    // ======================================================
    // SUCCESS
    // ======================================================

    return res.status(200).json({
      success: true,
      message: "Chat history cleared successfully.",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Clear Chat History Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to clear chat history.",
    });
  }
});

// ============================================================
// DELETE SINGLE CHAT
// DELETE /api/chats/:id
// Logged-in user can delete only their own chat
// ============================================================

router.delete("/:id", protect, async (req, res) => {
  try {
    const chatId = req.params.id;
    const userId = req.user?.id;

    // ======================================================
    // CHECK USER ID
    // ======================================================

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication information is missing.",
      });
    }

    // ======================================================
    // CHECK CHAT ID
    // ======================================================

    if (!chatId) {
      return res.status(400).json({
        success: false,
        message: "Chat ID is required.",
      });
    }

    // ======================================================
    // VALIDATE MONGODB OBJECT ID
    // ======================================================

    if (!mongoose.Types.ObjectId.isValid(chatId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid chat ID format.",
      });
    }

    // ======================================================
    // DELETE ONLY USER'S OWN CHAT
    // ======================================================

    const chat = await Chat.findOneAndDelete({
      _id: chatId,
      userId: String(userId),
    });

    // ======================================================
    // CHAT NOT FOUND
    // ======================================================

    if (!chat) {
      return res.status(404).json({
        success: false,
        message: "Chat not found or access denied.",
      });
    }

    // ======================================================
    // SUCCESS
    // ======================================================

    return res.status(200).json({
      success: true,
      message: "Chat deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Single Chat Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to delete chat.",
    });
  }
});

// ============================================================
// EXPORT ROUTER
// ============================================================

module.exports = router;
