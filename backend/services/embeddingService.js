const { pipeline } = require("@xenova/transformers");

// ============================================================
// EMBEDDING CONFIGURATION
// ============================================================

const EMBEDDING_MODEL =
  process.env.EMBEDDING_MODEL || "Xenova/all-MiniLM-L6-v2";

const MAX_TEXT_LENGTH = 10000;

// ============================================================
// EMBEDDING MODEL
// ============================================================

let embedder = null;
let embedderPromise = null;

// ============================================================
// LOAD EMBEDDING MODEL
// ============================================================

const getEmbedder = async () => {
  // Model already loaded
  if (embedder) {
    return embedder;
  }

  // If another request is already loading the model,
  // wait for the same promise instead of loading it again.
  if (embedderPromise) {
    return embedderPromise;
  }

  console.log(`Loading embedding model: ${EMBEDDING_MODEL}`);

  embedderPromise = pipeline("feature-extraction", EMBEDDING_MODEL);

  try {
    embedder = await embedderPromise;

    console.log("Embedding model loaded successfully.");

    return embedder;
  } catch (error) {
    console.error("Embedding model loading failed:", error.message);

    // Allow another attempt later.
    embedderPromise = null;

    throw new Error("Failed to load embedding model.");
  }
};

// ============================================================
// CREATE EMBEDDING
// ============================================================

const createEmbedding = async (text) => {
  if (typeof text !== "string" || text.trim() === "") {
    throw new Error("Text is required to create embedding.");
  }

  const cleanText = text.trim();

  if (cleanText.length > MAX_TEXT_LENGTH) {
    throw new Error("Text must not exceed 10000 characters.");
  }

  const model = await getEmbedder();

  try {
    const output = await model(cleanText, {
      pooling: "mean",
      normalize: true,
    });

    if (!output || !output.data) {
      throw new Error("Embedding model returned an invalid result.");
    }

    const embedding = Array.from(output.data);

    if (embedding.length === 0) {
      throw new Error("Generated embedding is empty.");
    }

    const containsInvalidValue = embedding.some(
      (value) => typeof value !== "number" || !Number.isFinite(value),
    );

    if (containsInvalidValue) {
      throw new Error("Generated embedding contains invalid values.");
    }

    return embedding;
  } catch (error) {
    console.error("Embedding generation failed:", error.message);

    throw new Error("Failed to create text embedding.");
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  createEmbedding,
};
