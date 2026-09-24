const mongoose = require("mongoose");

// ============================================================
// CONSTANTS
// ============================================================

const MAX_QUESTION_LENGTH = 2000;
const MAX_ANSWER_LENGTH = 10000;

// ============================================================
// CHAT SCHEMA
// ============================================================

const chatSchema = new mongoose.Schema(
  {
    // ==========================================================
    // USER ID
    // ==========================================================
    //
    // Stored as String because your current chatRoutes.js
    // uses String(req.user.id).
    //

    userId: {
      type: String,
      required: [true, "User ID is required."],
      trim: true,
      maxlength: [100, "User ID is too long."],
      index: true,
    },

    // ==========================================================
    // QUESTION
    // ==========================================================

    question: {
      type: String,
      required: [true, "Question is required."],
      trim: true,
      minlength: [1, "Question cannot be empty."],
      maxlength: [
        MAX_QUESTION_LENGTH,
        "Question must not exceed 2000 characters.",
      ],
    },

    // ==========================================================
    // ANSWER
    // ==========================================================

    answer: {
      type: String,
      required: [true, "Answer is required."],
      trim: true,
      minlength: [1, "Answer cannot be empty."],
      maxlength: [
        MAX_ANSWER_LENGTH,
        "Answer must not exceed 10000 characters.",
      ],
    },
  },

  {
    timestamps: true,
  },
);

// ============================================================
// INDEXES
// ============================================================

// Fast retrieval of a user's chat history.
chatSchema.index({
  userId: 1,
  createdAt: -1,
});

// Fast sorting by latest chats.
chatSchema.index({
  createdAt: -1,
});

// ============================================================
// EXPORT MODEL
// ============================================================

const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);

module.exports = Chat;
