const DocumentChunk = require("../models/DocumentChunk");
const { createEmbedding } = require("./embeddingService");

// ============================================================
// CONFIGURATION
// ============================================================

const MIN_SIMILARITY = 0.5;

const DEFAULT_TOP_K = 3;
const MAX_TOP_K = 10;

const MAX_QUESTION_LENGTH = 2000;
const MAX_CHUNK_TEXT_LENGTH = 20000;
const MAX_EMBEDDED_CHUNKS = 10000;

// ============================================================
// COSINE SIMILARITY
// ============================================================

const cosineSimilarity = (vectorA, vectorB) => {
  if (
    !Array.isArray(vectorA) ||
    !Array.isArray(vectorB) ||
    vectorA.length === 0 ||
    vectorB.length === 0 ||
    vectorA.length !== vectorB.length
  ) {
    return 0;
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    const valueA = vectorA[i];
    const valueB = vectorB[i];

    if (
      typeof valueA !== "number" ||
      typeof valueB !== "number" ||
      !Number.isFinite(valueA) ||
      !Number.isFinite(valueB)
    ) {
      return 0;
    }

    dotProduct += valueA * valueB;

    magnitudeA += valueA * valueA;

    magnitudeB += valueB * valueB;
  }

  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }

  const denominator = Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB);

  if (!Number.isFinite(denominator) || denominator === 0) {
    return 0;
  }

  const similarity = dotProduct / denominator;

  if (!Number.isFinite(similarity)) {
    return 0;
  }

  return similarity;
};

// ============================================================
// NORMALIZE TOP K
// ============================================================

const normalizeTopK = (topK) => {
  const numericTopK = Number(topK);

  if (!Number.isFinite(numericTopK) || numericTopK <= 0) {
    return DEFAULT_TOP_K;
  }

  return Math.min(Math.floor(numericTopK), MAX_TOP_K);
};

// ============================================================
// SEARCH RELEVANT DOCUMENT CHUNKS
// ============================================================

const searchRelevantChunks = async (question, topK = DEFAULT_TOP_K) => {
  try {
    // ========================================================
    // QUESTION VALIDATION
    // ========================================================

    if (typeof question !== "string" || question.trim() === "") {
      throw new Error("Question is required.");
    }

    const cleanQuestion = question.trim();

    if (cleanQuestion.length > MAX_QUESTION_LENGTH) {
      throw new Error("Question must not exceed 2000 characters.");
    }

    const normalizedTopK = normalizeTopK(topK);

    // ========================================================
    // CREATE QUESTION EMBEDDING
    // ========================================================

    console.log("Creating embedding for question...");

    const questionEmbedding = await createEmbedding(cleanQuestion);

    if (!Array.isArray(questionEmbedding) || questionEmbedding.length === 0) {
      throw new Error("Question embedding is invalid.");
    }

    console.log("Question embedding created.");

    // ========================================================
    // GET EMBEDDED DOCUMENT CHUNKS
    // ========================================================

    const chunks = await DocumentChunk.find({
      embedding: {
        $exists: true,
        $type: "array",
        $ne: [],
      },
    })
      .select("documentId chunkIndex text title category department embedding")
      .limit(MAX_EMBEDDED_CHUNKS)
      .lean();

    console.log("Total embedded chunks found:", chunks.length);

    if (chunks.length === 0) {
      console.log("No embedded document chunks found.");

      return [];
    }

    // ========================================================
    // CALCULATE SIMILARITY
    // ========================================================

    const results = [];

    for (const chunk of chunks) {
      if (!Array.isArray(chunk.embedding) || chunk.embedding.length === 0) {
        continue;
      }

      // Ignore embeddings with a different dimension
      if (chunk.embedding.length !== questionEmbedding.length) {
        continue;
      }

      const similarity = cosineSimilarity(questionEmbedding, chunk.embedding);

      if (!Number.isFinite(similarity)) {
        continue;
      }

      let chunkText = typeof chunk.text === "string" ? chunk.text.trim() : "";

      if (!chunkText) {
        continue;
      }

      if (chunkText.length > MAX_CHUNK_TEXT_LENGTH) {
        chunkText = chunkText.slice(0, MAX_CHUNK_TEXT_LENGTH);
      }

      results.push({
        documentId: chunk.documentId,

        chunkIndex: chunk.chunkIndex,

        text: chunkText,

        title: typeof chunk.title === "string" ? chunk.title.trim() : "",

        category:
          typeof chunk.category === "string" ? chunk.category.trim() : "",

        department:
          typeof chunk.department === "string" ? chunk.department.trim() : "",

        similarity,
      });
    }

    // ========================================================
    // SORT BY SIMILARITY
    // ========================================================

    results.sort((a, b) => b.similarity - a.similarity);

    if (results.length > 0) {
      console.log(
        "Highest similarity score:",
        results[0].similarity.toFixed(4),
      );
    }

    // ========================================================
    // FILTER RELEVANT RESULTS
    // ========================================================

    const relevantResults = results.filter(
      (result) => result.similarity >= MIN_SIMILARITY,
    );

    console.log("Relevant chunks after threshold:", relevantResults.length);

    // ========================================================
    // NO RELEVANT RESULTS
    // ========================================================

    if (relevantResults.length === 0) {
      console.log("No sufficiently relevant document chunks found.");

      return [];
    }

    // ========================================================
    // RETURN TOP K
    // ========================================================

    return relevantResults.slice(0, normalizedTopK);
  } catch (error) {
    console.error("RAG Search Error:", error.message);

    throw error;
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  cosineSimilarity,
  searchRelevantChunks,
};
