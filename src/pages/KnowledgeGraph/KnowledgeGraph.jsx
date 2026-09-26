import "./KnowledgeGraph.css";
import Navbar from "../../components/Navbar/Navbar";
import { useEffect, useState, useMemo } from "react";
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import axios from "axios";
import API_URL from "../../config/api";
import { FaNetworkWired, FaSearch, FaUsers, FaFolder, FaFileAlt, FaTimes, FaProjectDiagram, FaArrowLeft, FaBars } from "react-icons/fa";

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

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState(null);

  // ======================================================
  // NORMALIZE NEO4J NODE TYPE
  // ======================================================

  const normalizeNodeType = (labels) => {
    if (!labels) return "";
    if (Array.isArray(labels)) {
      if (labels.includes("Employee")) return "Employee";
      if (labels.includes("Project")) return "Project";
      if (labels.includes("Document")) return "Document";
      return labels[0] || "";
    }
    const value = String(labels).trim().toLowerCase();
    if (value === "employee" || value === "employees") return "Employee";
    if (value === "project" || value === "projects") return "Project";
    if (value === "document" || value === "documents") return "Document";
    return String(labels).trim();
  };

  // ======================================================
  // GET DISPLAY LABEL
  // ======================================================

  const getNodeLabel = (type, properties = {}) => {
    if (type === "Employee") {
      return properties.name || properties.fullName || properties.username || "Employee";
    }
    if (type === "Project") {
      return properties.projectName || properties.name || properties.title || "Project";
    }
    if (type === "Document") {
      return properties.title || properties.name || properties.originalFileName || "Document";
    }
    return type || "Node";
  };

  // ======================================================
  // CREATE NODES FOR GRAPH VISUALIZATION
  // ======================================================

  const createGraphNode = (node, type) => {
    const properties = node.properties || {};
    const labelText = getNodeLabel(type, properties);
    
    let icon, color, bgColor;
    if (type === "Employee") { icon = <FaUsers />; color = "#176B67"; bgColor = "#E3F0EE"; }
    else if (type === "Project") { icon = <FaFolder />; color = "#161616"; bgColor = "#FFFFFF"; }
    else { icon = <FaFileAlt />; color = "#66706E"; bgColor = "#F6F4EE"; }

    return {
      id: String(node.id),
      type: "default",
      className: `kg-graph-node kg-node-${type.toLowerCase()}`,
      data: {
        entityType: type,
        rawLabel: labelText,
        properties: properties,
        label: (
          <div className="kg-graph-node-content">
            <div className="kg-graph-node-header">
              <span className="kg-graph-node-icon" style={{color}}>{icon}</span>
              <span className="kg-graph-node-title">{labelText}</span>
            </div>
            {type === "Employee" && properties.role && <div className="kg-graph-node-detail">{properties.role}</div>}
            {type === "Project" && properties.status && <div className="kg-graph-node-detail">{properties.status}</div>}
            {type === "Document" && properties.category && <div className="kg-graph-node-detail">{properties.category}</div>}
          </div>
        ),
      },
      position: { x: Math.random() * 500, y: Math.random() * 500 }, // Will be arranged by react flow or can be set fixed
    };
  };

  // ======================================================
  // FETCH NEO4J GRAPH
  // ======================================================

  const fetchKnowledgeGraph = async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSelectedProjectId(null);

      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("Authentication token not found. Please login again.");
        return;
      }

      const response = await axios.get(`${API_URL}/api/neo4j/graph`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const graphData = response.data || {};
      const neo4jNodes = Array.isArray(graphData.nodes) ? graphData.nodes : [];
      const neo4jRelationships = Array.isArray(graphData.relationships) ? graphData.relationships : [];

      const parsedNodes = neo4jNodes.map(node => {
        const type = normalizeNodeType(node.labels);
        return {
          id: String(node.id),
          type,
          rawLabel: getNodeLabel(type, node.properties || {}),
          properties: node.properties || {}
        };
      });

      const parsedEdges = neo4jRelationships
        .filter((rel) => rel.source != null && rel.target != null)
        .map((rel, index) => ({
          id: rel.id ? `neo4j-rel-${rel.id}` : `neo4j-rel-${index}`,
          source: String(rel.source),
          target: String(rel.target),
          label: rel.properties?.relationshipType || rel.type || "RELATED TO",
        }));

      setNodes(parsedNodes);
      setEdges(parsedEdges);
    } catch (error) {
      console.error("Knowledge Graph Error:", error);
      if (error.response?.status === 401) {
        setErrorMessage("Your login session is invalid or expired. Please login again.");
      } else {
        setErrorMessage(error.response?.data?.message || "Failed to load Knowledge Graph.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeGraph();
  }, []);

  // ======================================================
  // DERIVED STATE
  // ======================================================

  const projects = useMemo(() => nodes.filter(n => n.type === "Project"), [nodes]);
  const employees = useMemo(() => nodes.filter(n => n.type === "Employee"), [nodes]);
  const documents = useMemo(() => nodes.filter(n => n.type === "Document"), [nodes]);

  // If search query is active on main page, filter projects
  const filteredProjects = useMemo(() => {
    if (!searchQuery) return projects;
    return projects.filter(p => p.rawLabel.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [projects, searchQuery]);

  // When a project is selected
  const selectedProjectData = useMemo(() => {
    if (!selectedProjectId) return null;
    return projects.find(p => p.id === selectedProjectId);
  }, [selectedProjectId, projects]);

  const relatedEntities = useMemo(() => {
    if (!selectedProjectId) return { employees: [], documents: [], nodeIds: new Set() };
    
    const connectedIds = new Set();
    edges.forEach(e => {
      if (e.source === selectedProjectId) connectedIds.add(e.target);
      if (e.target === selectedProjectId) connectedIds.add(e.source);
    });

    const relatedEmployees = employees.filter(e => connectedIds.has(e.id));
    const relatedDocuments = documents.filter(d => connectedIds.has(d.id));
    
    // Also add the project itself
    connectedIds.add(selectedProjectId);

    // Apply search filter within selected project view
    const filteredEmployees = searchQuery 
      ? relatedEmployees.filter(e => e.rawLabel.toLowerCase().includes(searchQuery.toLowerCase()))
      : relatedEmployees;
      
    const filteredDocuments = searchQuery 
      ? relatedDocuments.filter(d => d.rawLabel.toLowerCase().includes(searchQuery.toLowerCase()))
      : relatedDocuments;

    return { employees: filteredEmployees, documents: filteredDocuments, nodeIds: connectedIds };
  }, [selectedProjectId, edges, employees, documents, searchQuery]);

  // Graph Data for Selected Project
  const graphData = useMemo(() => {
    if (!selectedProjectId) return { nodes: [], edges: [] };
    
    const { nodeIds } = relatedEntities;
    
    // Create visualization nodes
    const visNodes = nodes
      .filter(n => nodeIds.has(n.id))
      .map((n, i) => {
        const visNode = createGraphNode(n, n.type);
        // Basic circular layout around the project
        if (n.id === selectedProjectId) {
          visNode.position = { x: 400, y: 300 }; // Center
        } else {
          const angle = (i / (nodeIds.size - 1)) * 2 * Math.PI;
          const radius = 250;
          visNode.position = { 
            x: 400 + radius * Math.cos(angle), 
            y: 300 + radius * Math.sin(angle) 
          };
        }
        return visNode;
      });

    const visEdges = edges
      .filter(e => nodeIds.has(e.source) && nodeIds.has(e.target))
      .map(e => ({
        ...e,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#A0A0A0' },
        style: { strokeWidth: 2, stroke: '#C0C0C0' },
        labelStyle: { fontWeight: 600, fontSize: 11, fill: "#666666" },
        labelBgStyle: { fill: "#FFFFFF", fillOpacity: 0.9, stroke: "#E4E4E0", strokeWidth: 1, rx: 4 },
        labelBgPadding: [6, 4],
      }));

    return { nodes: visNodes, edges: visEdges };
  }, [selectedProjectId, nodes, edges, relatedEntities]);


  // Helper to count connections for project cards
  const getProjectStats = (projectId) => {
    const connectedIds = new Set();
    edges.forEach(e => {
      if (e.source === projectId) connectedIds.add(e.target);
      if (e.target === projectId) connectedIds.add(e.source);
    });
    
    const empCount = employees.filter(e => connectedIds.has(e.id)).length;
    const docCount = documents.filter(d => connectedIds.has(d.id)).length;
    
    return { empCount, docCount };
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="kg-page-wrapper">
      <Navbar />
      
      
      <main className="kg-main-area">
        {/* HEADER */}
        <header className="kg-header">
          <div className="kg-header-left">
            
            <div>
              {selectedProjectId ? (
                <>
                  <h1>{selectedProjectData?.rawLabel || "Project Details"}</h1>
                  <p>Explore connected people, documents and relationships.</p>
                </>
              ) : (
                <>
                  <h1>Projects</h1>
                  <p>Select a project to explore its connected people, documents and relationships.</p>
                </>
              )}
            </div>
          </div>
          
          <div className="kg-header-right">
            <div className="kg-search-bar">
              <FaSearch />
              <input 
                type="text" 
                placeholder={selectedProjectId ? "Search within project..." : "Search projects..."} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {selectedProjectId && (
              <button className="kg-back-btn" onClick={() => setSelectedProjectId(null)}>
                <FaArrowLeft /> Back to Projects
              </button>
            )}
          </div>
        </header>

        <div className="kg-content">
          {loading ? (
            <div className="kg-loading-state">
              <div className="kg-spinner"></div>
              <p>Loading enterprise knowledge...</p>
            </div>
          ) : errorMessage ? (
            <div className="kg-error-state">
              <h3>Unable to Load Knowledge Graph</h3>
              <p>{errorMessage}</p>
              <button className="kg-refresh-btn" onClick={fetchKnowledgeGraph}>Try Again</button>
            </div>
          ) : !selectedProjectId ? (
            
            /* ================= VIEW A: PROJECT CARDS ================= */
            <div className="kg-projects-view">
              {filteredProjects.length === 0 ? (
                <div className="kg-empty-state">
                  <FaFolder className="kg-empty-icon" />
                  <h3>No projects found</h3>
                  <p>There are no projects matching your search criteria.</p>
                </div>
              ) : (
                <div className="kg-project-cards-grid">
                  {filteredProjects.map(proj => {
                    const stats = getProjectStats(proj.id);
                    return (
                      <div className="kg-project-card" key={proj.id} onClick={() => setSelectedProjectId(proj.id)}>
                        <div className="kg-project-card-header">
                          <span className="kg-project-icon"><FaFolder /></span>
                          <span className="kg-project-dept">{proj.properties.department || "Organization"}</span>
                        </div>
                        <h3>{proj.rawLabel}</h3>
                        <p className="kg-project-desc">{proj.properties.description || "No description available."}</p>
                        
                        <div className="kg-project-stats">
                          <div className="kg-stat"><FaUsers /> <span>{stats.empCount} Employees</span></div>
                          <div className="kg-stat"><FaFileAlt /> <span>{stats.docCount} Documents</span></div>
                        </div>
                        
                        <button className="kg-explore-btn">Explore Project</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            
            /* ================= VIEW B: PROJECT DETAILS & GRAPH ================= */
            <div className="kg-project-detail-view">
              
              <div className="kg-detail-top-section">
                <div className="kg-detail-info-card">
                  <h2>{selectedProjectData.rawLabel}</h2>
                  {selectedProjectData.properties.description && (
                    <p className="kg-detail-desc">{selectedProjectData.properties.description}</p>
                  )}
                  <div className="kg-detail-props">
                    {selectedProjectData.properties.department && (
                      <div className="kg-detail-prop"><span>Department:</span> {selectedProjectData.properties.department}</div>
                    )}
                    {selectedProjectData.properties.status && (
                      <div className="kg-detail-prop"><span>Status:</span> {selectedProjectData.properties.status}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="kg-detail-lists">
                <div className="kg-related-list-container">
                  <div className="kg-list-header">
                    <h3><FaUsers /> Related Employees</h3>
                    <span className="kg-badge">{relatedEntities.employees.length}</span>
                  </div>
                  {relatedEntities.employees.length === 0 ? (
                    <div className="kg-list-empty">No related employees found.</div>
                  ) : (
                    <ul className="kg-related-list">
                      {relatedEntities.employees.map(emp => (
                        <li key={emp.id} className="kg-related-item">
                          <strong>{emp.rawLabel}</strong>
                          <span>{emp.properties.role || emp.properties.department || "Employee"}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="kg-related-list-container">
                  <div className="kg-list-header">
                    <h3><FaFileAlt /> Related Documents</h3>
                    <span className="kg-badge">{relatedEntities.documents.length}</span>
                  </div>
                  {relatedEntities.documents.length === 0 ? (
                    <div className="kg-list-empty">No related documents found.</div>
                  ) : (
                    <ul className="kg-related-list">
                      {relatedEntities.documents.map(doc => (
                        <li key={doc.id} className="kg-related-item">
                          <strong>{doc.rawLabel}</strong>
                          <span>{doc.properties.category || doc.properties.status || "Document"}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* REACT FLOW GRAPH FOR SELECTED PROJECT */}
              <div className="kg-graph-section">
                <h3>Project Graph Visualization</h3>
                <div className="kg-canvas-container">
                  <ReactFlow
                    nodes={graphData.nodes}
                    edges={graphData.edges}
                    fitView
                    fitViewOptions={{ padding: 0.25, minZoom: 0.4, maxZoom: 1.2 }}
                    attributionPosition="bottom-left"
                    nodesDraggable={true}
                    nodesConnectable={false}
                  >
                    <Background gap={20} size={1} color="#E1E3DE" />
                    <Controls />
                  </ReactFlow>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default KnowledgeGraph;
