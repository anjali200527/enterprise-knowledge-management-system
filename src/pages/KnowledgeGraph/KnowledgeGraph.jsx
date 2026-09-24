import "./KnowledgeGraph.css";
import { useEffect, useState } from "react";

import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
} from "reactflow";

import "reactflow/dist/style.css";
import axios from "axios";

import API_URL from "../../config/api";

// ======================================================
// KNOWLEDGE GRAPH
// ======================================================

function KnowledgeGraph() {
  // ======================================================
  // STATE
  // ======================================================

  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // ======================================================
  // NORMALIZE NEO4J NODE TYPE
  // ======================================================

  const normalizeNodeType = (labels) => {
    if (!labels) {
      return "";
    }

    if (Array.isArray(labels)) {
      if (labels.includes("Employee")) {
        return "Employee";
      }

      if (labels.includes("Project")) {
        return "Project";
      }

      if (labels.includes("Document")) {
        return "Document";
      }

      return labels[0] || "";
    }

    const value = String(labels).trim().toLowerCase();

    if (value === "employee" || value === "employees") {
      return "Employee";
    }

    if (value === "project" || value === "projects") {
      return "Project";
    }

    if (value === "document" || value === "documents") {
      return "Document";
    }

    return String(labels).trim();
  };

  // ======================================================
  // GET DISPLAY LABEL
  // ======================================================

  const getNodeLabel = (type, properties = {}) => {
    if (type === "Employee") {
      return (
        properties.name ||
        properties.fullName ||
        properties.username ||
        "Employee"
      );
    }

    if (type === "Project") {
      return (
        properties.projectName ||
        properties.name ||
        properties.title ||
        "Project"
      );
    }

    if (type === "Document") {
      return (
        properties.title ||
        properties.name ||
        properties.originalFileName ||
        "Document"
      );
    }

    return type || "Node";
  };

  // ======================================================
  // CREATE EMPLOYEE NODE
  // ======================================================

  const createEmployeeNode = (node, index) => {
    const properties = node.properties || {};

    return {
      id: String(node.id),

      type: "default",

      data: {
        label: (
          <div>
            <div>👤 {getNodeLabel("Employee", properties)}</div>

            {properties.department && (
              <div
                style={{
                  fontSize: "11px",
                  marginTop: "5px",
                  opacity: 0.8,
                }}
              >
                Department: {properties.department}
              </div>
            )}

            {properties.email && (
              <div
                style={{
                  fontSize: "10px",
                  marginTop: "3px",
                  opacity: 0.7,
                }}
              >
                {properties.email}
              </div>
            )}

            {properties.role && (
              <div
                style={{
                  fontSize: "10px",
                  marginTop: "3px",
                  opacity: 0.7,
                }}
              >
                Role: {properties.role}
              </div>
            )}
          </div>
        ),
      },

      position: {
        x: 50,
        y: 80 + index * 170,
      },

      style: {
        background: "#dbeafe",
        border: "2px solid #2563eb",
        borderRadius: "12px",
        padding: "12px 18px",
        fontWeight: "bold",
        minWidth: "210px",
        textAlign: "center",
      },
    };
  };

  // ======================================================
  // CREATE PROJECT NODE
  // ======================================================

  const createProjectNode = (node, index) => {
    const properties = node.properties || {};

    const description = properties.description || "";

    return {
      id: String(node.id),

      type: "default",

      data: {
        label: (
          <div>
            <div>📁 {getNodeLabel("Project", properties)}</div>

            {description && (
              <div
                style={{
                  fontSize: "10px",
                  marginTop: "5px",
                  opacity: 0.7,
                }}
              >
                {description.length > 60
                  ? `${description.substring(0, 60)}...`
                  : description}
              </div>
            )}

            {properties.department && (
              <div
                style={{
                  fontSize: "10px",
                  marginTop: "4px",
                  opacity: 0.7,
                }}
              >
                Department: {properties.department}
              </div>
            )}

            {properties.status && (
              <div
                style={{
                  fontSize: "10px",
                  marginTop: "4px",
                  opacity: 0.7,
                }}
              >
                Status: {properties.status}
              </div>
            )}
          </div>
        ),
      },

      position: {
        x: 450,
        y: 80 + index * 180,
      },

      style: {
        background: "#fef3c7",
        border: "2px solid #f59e0b",
        borderRadius: "12px",
        padding: "12px 18px",
        fontWeight: "bold",
        minWidth: "220px",
        textAlign: "center",
      },
    };
  };

  // ======================================================
  // CREATE DOCUMENT NODE
  // ======================================================

  const createDocumentNode = (node, index) => {
    const properties = node.properties || {};

    return {
      id: String(node.id),

      type: "default",

      data: {
        label: (
          <div>
            <div>📄 {getNodeLabel("Document", properties)}</div>

            {properties.category && (
              <div
                style={{
                  fontSize: "11px",
                  marginTop: "5px",
                  opacity: 0.8,
                }}
              >
                Category: {properties.category}
              </div>
            )}

            {properties.department && (
              <div
                style={{
                  fontSize: "10px",
                  marginTop: "4px",
                  opacity: 0.7,
                }}
              >
                Department: {properties.department}
              </div>
            )}

            {properties.status && (
              <div
                style={{
                  fontSize: "10px",
                  marginTop: "4px",
                  opacity: 0.7,
                }}
              >
                Status: {properties.status}
              </div>
            )}
          </div>
        ),
      },

      position: {
        x: 850,
        y: 80 + index * 170,
      },

      style: {
        background: "#dcfce7",
        border: "2px solid #16a34a",
        borderRadius: "12px",
        padding: "12px 18px",
        fontWeight: "bold",
        minWidth: "220px",
        textAlign: "center",
      },
    };
  };

  // ======================================================
  // FETCH NEO4J GRAPH
  // ======================================================

  const fetchKnowledgeGraph = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      // ----------------------------------------------
      // GET JWT TOKEN
      // ----------------------------------------------

      const token = localStorage.getItem("token");

      console.log("Knowledge Graph token exists:", Boolean(token));

      if (!token) {
        setErrorMessage("Authentication token not found. Please login again.");

        setNodes([]);
        setEdges([]);

        return;
      }

      // ----------------------------------------------
      // API REQUEST
      // ----------------------------------------------

      const response = await axios.get(`${API_URL}/api/neo4j/graph`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Neo4j API response:", response.data);

      const graphData = response.data || {};

      const neo4jNodes = Array.isArray(graphData.nodes) ? graphData.nodes : [];

      const neo4jRelationships = Array.isArray(graphData.relationships)
        ? graphData.relationships
        : [];

      console.log("Neo4j Nodes:", neo4jNodes);

      console.log("Neo4j Relationships:", neo4jRelationships);

      // ==================================================
      // SEPARATE NODE TYPES
      // ==================================================

      const employees = neo4jNodes.filter(
        (node) => normalizeNodeType(node.labels) === "Employee",
      );

      const projects = neo4jNodes.filter(
        (node) => normalizeNodeType(node.labels) === "Project",
      );

      const documents = neo4jNodes.filter(
        (node) => normalizeNodeType(node.labels) === "Document",
      );

      console.log("Employees:", employees);

      console.log("Projects:", projects);

      console.log("Documents:", documents);

      // ==================================================
      // CREATE REACT FLOW NODES
      // ==================================================

      const employeeNodes = employees.map((node, index) =>
        createEmployeeNode(node, index),
      );

      const projectNodes = projects.map((node, index) =>
        createProjectNode(node, index),
      );

      const documentNodes = documents.map((node, index) =>
        createDocumentNode(node, index),
      );

      const allNodes = [...employeeNodes, ...projectNodes, ...documentNodes];

      // ==================================================
      // VALID NODE IDS
      // ==================================================

      const nodeIds = new Set(allNodes.map((node) => String(node.id)));

      // ==================================================
      // CREATE EDGES
      // ==================================================

      const graphEdges = neo4jRelationships
        .filter(
          (relationship) =>
            relationship.source !== undefined &&
            relationship.source !== null &&
            relationship.target !== undefined &&
            relationship.target !== null,
        )
        .filter(
          (relationship) =>
            nodeIds.has(String(relationship.source)) &&
            nodeIds.has(String(relationship.target)),
        )
        .map((relationship, index) => {
          const relationshipLabel =
            relationship.properties?.relationshipType ||
            relationship.type ||
            "RELATED TO";

          return {
            id: relationship.id
              ? `neo4j-relationship-${relationship.id}`
              : `neo4j-relationship-${index}`,

            source: String(relationship.source),

            target: String(relationship.target),

            label: relationshipLabel,

            animated: true,

            markerEnd: {
              type: MarkerType.ArrowClosed,
            },

            style: {
              strokeWidth: 2,
            },

            labelStyle: {
              fontWeight: 700,
              fontSize: 12,
            },

            labelBgStyle: {
              fill: "#ffffff",
              fillOpacity: 0.95,
            },

            labelBgPadding: [5, 3],

            labelBgBorderRadius: 5,
          };
        });

      // ==================================================
      // SET GRAPH
      // ==================================================

      setNodes(allNodes);
      setEdges(graphEdges);

      console.log("Final Knowledge Graph Nodes:", allNodes);

      console.log("Final Knowledge Graph Edges:", graphEdges);
    } catch (error) {
      console.error("Knowledge Graph Error:", error);

      // ==================================================
      // HANDLE AUTH ERROR
      // ==================================================

      if (error.response?.status === 401) {
        setErrorMessage(
          "Your login session is invalid or expired. Please logout and login again.",
        );
      }

      // ==================================================
      // HANDLE FORBIDDEN ERROR
      // ==================================================
      else if (error.response?.status === 403) {
        setErrorMessage(
          "You do not have permission to access the Knowledge Graph.",
        );
      }

      // ==================================================
      // HANDLE OTHER ERRORS
      // ==================================================
      else {
        setErrorMessage(
          error.response?.data?.message ||
            error.message ||
            "Failed to load Knowledge Graph.",
        );
      }

      setNodes([]);
      setEdges([]);
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // LOAD GRAPH ON PAGE LOAD
  // ======================================================

  useEffect(() => {
    fetchKnowledgeGraph();
  }, []);

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="graph-page">
      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="graph-header">
        <div>
          <h2>🧠 Knowledge Graph Visualization</h2>

          <p>
            Explore relationships between Employees, Projects and Documents.
          </p>
        </div>

        <button
          type="button"
          className="refresh-graph-btn"
          onClick={fetchKnowledgeGraph}
          disabled={loading}
        >
          🔄 {loading ? "Refreshing..." : "Refresh Graph"}
        </button>
      </div>

      {/* ==================================================
          SUMMARY
      ================================================== */}

      {!loading && !errorMessage && nodes.length > 0 && (
        <div className="graph-summary">
          <div className="graph-summary-card">
            <strong>{employeesCount(nodes)}</strong>

            <span>Employees</span>
          </div>

          <div className="graph-summary-card">
            <strong>{projectsCount(nodes)}</strong>

            <span>Projects</span>
          </div>

          <div className="graph-summary-card">
            <strong>{documentsCount(nodes)}</strong>

            <span>Documents</span>
          </div>

          <div className="graph-summary-card">
            <strong>{edges.length}</strong>

            <span>Relationships</span>
          </div>
        </div>
      )}

      {/* ==================================================
          GRAPH CONTAINER
      ================================================== */}

      <div className="graph-container">
        {loading ? (
          <div className="graph-loading">
            <div>Loading Knowledge Graph...</div>
          </div>
        ) : errorMessage ? (
          <div className="graph-error">
            <h3>Unable to Load Knowledge Graph</h3>

            <p>{errorMessage}</p>

            <button
              type="button"
              className="refresh-graph-btn"
              onClick={fetchKnowledgeGraph}
            >
              Try Again
            </button>
          </div>
        ) : nodes.length === 0 ? (
          <div className="graph-loading">
            <h3>No Knowledge Graph Data</h3>

            <p>
              Add employees, projects, documents and relationships to visualize
              the knowledge graph.
            </p>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            fitView
            fitViewOptions={{
              padding: 0.25,
              minZoom: 0.4,
              maxZoom: 1.2,
            }}
            attributionPosition="bottom-left"
          >
            <Background gap={20} size={1} />

            <Controls />

            <MiniMap pannable zoomable />
          </ReactFlow>
        )}
      </div>
    </div>
  );
}

// ======================================================
// NODE COUNT HELPERS
// ======================================================

function employeesCount(nodes) {
  return nodes.filter((node) => node.style?.background === "#dbeafe").length;
}

function projectsCount(nodes) {
  return nodes.filter((node) => node.style?.background === "#fef3c7").length;
}

function documentsCount(nodes) {
  return nodes.filter((node) => node.style?.background === "#dcfce7").length;
}

export default KnowledgeGraph;
