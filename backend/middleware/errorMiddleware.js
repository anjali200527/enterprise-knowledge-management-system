// ============================================
// GLOBAL ERROR HANDLING MIDDLEWARE
// ============================================

const errorHandler = (err, req, res, next) => {
  console.error("❌ Backend Error:");
  console.error(err);

  // Default values
  let statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  let message = err.message || "Internal Server Error";

  // MongoDB duplicate key error
  if (err.code === 11000) {
    statusCode = 409;

    const fields = Object.keys(err.keyValue || {});

    message =
      fields.length > 0
        ? `Duplicate value already exists for: ${fields.join(", ")}`
        : "Duplicate value already exists.";
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;

    const errors = Object.values(err.errors || {}).map(
      (error) => error.message,
    );

    message = errors.length > 0 ? errors.join(", ") : "Validation failed.";
  }

  // Mongoose invalid ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid ID format.";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token has expired.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && {
      error: err.name || "Error",
    }),
  });
};

module.exports = errorHandler;
