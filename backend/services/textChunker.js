// ============================================================
// TEXT CHUNKER
// ============================================================

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_OVERLAP = 200;

const MIN_CHUNK_SIZE = 100;
const MAX_CHUNK_SIZE = 5000;

const MAX_TEXT_LENGTH = 1000000;

// ============================================================
// CHUNK TEXT
// ============================================================

const chunkText = (
  text,
  chunkSize = DEFAULT_CHUNK_SIZE,
  overlap = DEFAULT_OVERLAP,
) => {
  // ==========================================================
  // TEXT VALIDATION
  // ==========================================================

  if (typeof text !== "string") {
    throw new Error("Text must be a string.");
  }

  const cleanText = text.replace(/\s+/g, " ").trim();

  if (!cleanText) {
    return [];
  }

  if (cleanText.length > MAX_TEXT_LENGTH) {
    throw new Error("Text is too large to process.");
  }

  // ==========================================================
  // CHUNK SIZE VALIDATION
  // ==========================================================

  if (
    !Number.isInteger(chunkSize) ||
    chunkSize < MIN_CHUNK_SIZE ||
    chunkSize > MAX_CHUNK_SIZE
  ) {
    throw new Error(
      `Chunk size must be an integer between ${MIN_CHUNK_SIZE} and ${MAX_CHUNK_SIZE}.`,
    );
  }

  // ==========================================================
  // OVERLAP VALIDATION
  // ==========================================================

  if (!Number.isInteger(overlap) || overlap < 0 || overlap >= chunkSize) {
    throw new Error(
      "Overlap must be a non-negative integer smaller than chunk size.",
    );
  }

  // ==========================================================
  // CREATE CHUNKS
  // ==========================================================

  const chunks = [];

  let start = 0;

  while (start < cleanText.length) {
    const end = Math.min(start + chunkSize, cleanText.length);

    const chunk = cleanText.slice(start, end).trim();

    if (chunk) {
      chunks.push(chunk);
    }

    // Stop when the complete text is processed
    if (end >= cleanText.length) {
      break;
    }

    // Move forward while keeping overlap
    start = end - overlap;
  }

  return chunks;
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  chunkText,
};
