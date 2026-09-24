const mongoose = require("mongoose");

// ============================================================
// CONNECT TO MONGODB
// ============================================================

const connectDB = async () => {
  try {
    // ==========================================================
    // CHECK MONGO URI
    // ==========================================================

    if (
      !process.env.MONGO_URI ||
      typeof process.env.MONGO_URI !== "string" ||
      process.env.MONGO_URI.trim() === ""
    ) {
      console.error("❌ MONGO_URI is not configured in .env");

      process.exit(1);
    }

    // ==========================================================
    // MONGODB CONNECTION
    // ==========================================================

    await mongoose.connect(process.env.MONGO_URI.trim(), {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log("✅ MongoDB Connected Successfully");

    console.log(`📦 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("❌ MongoDB Connection Failed");

    console.error("Reason:", error.message);

    process.exit(1);
  }
};

// ============================================================
// MONGODB CONNECTION EVENTS
// ============================================================

mongoose.connection.on("error", (error) => {
  console.error("❌ MongoDB Runtime Error:", error.message);
});

mongoose.connection.on("disconnected", () => {
  console.warn("⚠️ MongoDB Disconnected.");
});

// ============================================================
// EXPORT
// ============================================================

module.exports = connectDB;
