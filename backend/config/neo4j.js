const neo4j = require("neo4j-driver");

// ============================================================
// NEO4J CONFIGURATION
// ============================================================

const uri = process.env.NEO4J_URI || "bolt://127.0.0.1:7687";

const username = process.env.NEO4J_USERNAME || "neo4j";

const password = process.env.NEO4J_PASSWORD;

const database = process.env.NEO4J_DATABASE || "neo4j";

// ============================================================
// VALIDATE CONFIGURATION
// ============================================================

if (typeof uri !== "string" || uri.trim() === "") {
  throw new Error("NEO4J_URI is not configured.");
}

if (typeof username !== "string" || username.trim() === "") {
  throw new Error("NEO4J_USERNAME is not configured.");
}

if (typeof password !== "string" || password.trim() === "") {
  throw new Error("NEO4J_PASSWORD is not configured.");
}

if (typeof database !== "string" || database.trim() === "") {
  throw new Error("NEO4J_DATABASE is not configured.");
}

// ============================================================
// CREATE NEO4J DRIVER
// ============================================================

const driver = neo4j.driver(
  uri.trim(),
  neo4j.auth.basic(username.trim(), password.trim()),
  {
    connectionTimeout: 10000,

    maxConnectionPoolSize: 50,

    maxTransactionRetryTime: 15000,
  },
);

// ============================================================
// VERIFY NEO4J CONNECTION
// ============================================================

const verifyNeo4jConnection = async () => {
  let session;

  try {
    session = driver.session({
      database: database.trim(),
    });

    const result = await session.run(
      "RETURN 'EKMS Neo4j Connected' AS message",
    );

    const message = result.records[0]?.get("message");

    console.log(message || "Neo4j Connected Successfully");
  } catch (error) {
    console.error("❌ Neo4j Connection Failed:", error.message);

    throw error;
  } finally {
    if (session) {
      try {
        await session.close();
      } catch (closeError) {
        console.error("Neo4j Session Close Error:", closeError.message);
      }
    }
  }
};

// ============================================================
// CLOSE NEO4J DRIVER
// ============================================================

const closeNeo4jDriver = async () => {
  try {
    await driver.close();

    console.log("Neo4j Driver Closed Successfully");
  } catch (error) {
    console.error("Neo4j Driver Close Error:", error.message);
  }
};

// ============================================================
// EXPORT
// ============================================================

module.exports = {
  driver,
  database: database.trim(),
  verifyNeo4jConnection,
  closeNeo4jDriver,
};
