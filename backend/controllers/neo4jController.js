const { driver, database } = require("../config/neo4j");

// ============================================================
// GET NEO4J GRAPH
// GET /api/neo4j/graph
// ============================================================

const getNeo4jGraph = async (req, res) => {
  let session;

  try {
    // ========================================================
    // CHECK NEO4J DRIVER
    // ========================================================

    if (!driver) {
      console.error("Neo4j driver is not configured.");

      return res.status(500).json({
        success: false,
        message: "Knowledge graph service is not configured.",
      });
    }

    // ========================================================
    // CREATE NEO4J SESSION
    // ========================================================

    session = driver.session({
      database,
    });

    // ========================================================
    // FETCH GRAPH
    // ========================================================
    //
    // Static query:
    // No user-controlled Cypher input is accepted.
    // Therefore Cypher injection is not possible here.
    //
    // LIMIT is intentionally applied to avoid returning
    // an unexpectedly huge graph response.
    // ========================================================

    const result = await session.run(`
      MATCH (n)
      OPTIONAL MATCH (n)-[r]->(m)
      RETURN
        n,
        r,
        m
      LIMIT 5000
    `);

    // ========================================================
    // RESPONSE ARRAYS
    // ========================================================

    const nodes = [];
    const relationships = [];

    const nodeIds = new Set();
    const relationshipIds = new Set();

    // ========================================================
    // PROCESS NEO4J RECORDS
    // ========================================================

    for (const record of result.records) {
      const node = record.get("n");
      const relationship = record.get("r");
      const target = record.get("m");

      // ======================================================
      // SOURCE NODE
      // ======================================================

      if (node) {
        const nodeId = node.identity.toString();

        if (!nodeIds.has(nodeId)) {
          nodes.push({
            id: nodeId,
            labels: Array.isArray(node.labels) ? node.labels : [],
            properties: node.properties || {},
          });

          nodeIds.add(nodeId);
        }
      }

      // ======================================================
      // TARGET NODE
      // ======================================================

      if (target) {
        const targetId = target.identity.toString();

        if (!nodeIds.has(targetId)) {
          nodes.push({
            id: targetId,
            labels: Array.isArray(target.labels) ? target.labels : [],
            properties: target.properties || {},
          });

          nodeIds.add(targetId);
        }
      }

      // ======================================================
      // RELATIONSHIP
      // ======================================================

      if (relationship) {
        const relationshipId = relationship.identity.toString();

        if (!relationshipIds.has(relationshipId)) {
          relationships.push({
            id: relationshipId,
            source: relationship.start.toString(),
            target: relationship.end.toString(),
            type:
              typeof relationship.type === "string"
                ? relationship.type
                : "RELATED_TO",
            properties: relationship.properties || {},
          });

          relationshipIds.add(relationshipId);
        }
      }
    }

    // ========================================================
    // SUCCESS RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,
      nodes,
      relationships,
      counts: {
        nodes: nodes.length,
        relationships: relationships.length,
      },
    });
  } catch (error) {
    // ========================================================
    // LOG INTERNAL ERROR
    // ========================================================

    console.error("Neo4j graph fetch failed:", error.message);

    // ========================================================
    // SAFE CLIENT RESPONSE
    // ========================================================

    return res.status(500).json({
      success: false,
      message: "Failed to fetch knowledge graph.",
    });
  } finally {
    // ========================================================
    // ALWAYS CLOSE SESSION
    // ========================================================

    if (session) {
      try {
        await session.close();
      } catch (closeError) {
        console.error("Neo4j session close failed:", closeError.message);
      }
    }
  }
};

// ============================================================
// EXPORT CONTROLLER
// ============================================================

module.exports = {
  getNeo4jGraph,
};
