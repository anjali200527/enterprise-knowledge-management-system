import "./Dashboard.css";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import API_URL from "../../config/api";
import {
  FaUsers,
  FaProjectDiagram,
  FaFileAlt,
  FaSitemap,
  FaSyncAlt,
  FaPlus,
  FaUpload,
  FaArrowRight,
  FaRobot,
  FaNetworkWired
} from "react-icons/fa";
import Navbar from "../../components/Navbar/Navbar";

function Dashboard() {
  const [user, setUser] = useState(null);
  
  const [employeeCount, setEmployeeCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);
  const [relationshipCount, setRelationshipCount] = useState(0);
  const [recentDocuments, setRecentDocuments] = useState([]);

  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [loadingRelationships, setLoadingRelationships] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return;
    try {
      setUser(JSON.parse(storedUser));
    } catch (error) {
      console.error("User data error:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/";
    }
  }, []);

  const userName = user?.username || user?.name || "User";

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem("token");
    return {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const fetchEmployeeCount = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingEmployees(true);
      const response = await axios.get(`${API_URL}/api/employees`, getAuthConfig());
      if (typeof response.data?.count === "number") setEmployeeCount(response.data.count);
      else if (Array.isArray(response.data?.employees)) setEmployeeCount(response.data.employees.length);
      else if (Array.isArray(response.data)) setEmployeeCount(response.data.length);
      else setEmployeeCount(0);
    } catch (error) {
      console.error("Dashboard Employee Count Error:", error);
      setEmployeeCount(0);
    } finally {
      setLoadingEmployees(false);
    }
  }, [user, getAuthConfig]);

  const fetchProjectCount = useCallback(async () => {
    try {
      setLoadingProjects(true);
      const response = await axios.get(`${API_URL}/api/projects`, getAuthConfig());
      if (typeof response.data?.count === "number") setProjectCount(response.data.count);
      else if (Array.isArray(response.data?.projects)) setProjectCount(response.data.projects.length);
      else if (Array.isArray(response.data)) setProjectCount(response.data.length);
      else setProjectCount(0);
    } catch (error) {
      console.error("Dashboard Project Count Error:", error);
      setProjectCount(0);
    } finally {
      setLoadingProjects(false);
    }
  }, [getAuthConfig]);

  const fetchDocumentData = useCallback(async () => {
    try {
      setLoadingDocuments(true);
      const response = await axios.get(`${API_URL}/api/documents`, getAuthConfig());
      let documentData = [];
      if (Array.isArray(response.data?.documents)) documentData = response.data.documents;
      else if (Array.isArray(response.data)) documentData = response.data;

      if (typeof response.data?.count === "number") setDocumentCount(response.data.count);
      else setDocumentCount(documentData.length);

      const sortedDocuments = [...documentData].sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0);
        const dateB = new Date(b.updatedAt || b.createdAt || 0);
        return dateB - dateA;
      });
      setRecentDocuments(sortedDocuments.slice(0, 5));
    } catch (error) {
      console.error("Dashboard Document Count Error:", error);
      setDocumentCount(0);
      setRecentDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  }, [getAuthConfig]);

  const fetchRelationshipCount = useCallback(async () => {
    try {
      setLoadingRelationships(true);
      const response = await axios.get(`${API_URL}/api/relationships`, getAuthConfig());
      if (typeof response.data?.count === "number") setRelationshipCount(response.data.count);
      else if (Array.isArray(response.data?.relationships)) setRelationshipCount(response.data.relationships.length);
      else if (Array.isArray(response.data)) setRelationshipCount(response.data.length);
      else setRelationshipCount(0);
    } catch (error) {
      console.error("Dashboard Relationship Count Error:", error);
      setRelationshipCount(0);
    } finally {
      setLoadingRelationships(false);
    }
  }, [getAuthConfig]);

  useEffect(() => {
    if (!user) return;
    fetchEmployeeCount();
    fetchProjectCount();
    fetchDocumentData();
    fetchRelationshipCount();
  }, [user, fetchEmployeeCount, fetchProjectCount, fetchDocumentData, fetchRelationshipCount]);

  const refreshDashboard = async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        fetchEmployeeCount(),
        fetchProjectCount(),
        fetchDocumentData(),
        fetchRelationshipCount(),
      ]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Dashboard Refresh Error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="dashboard">
      
      <Navbar />
      <main className="dashboard-main">

        {/* ================= CONTENT ================= */}
        <div className="dashboard-content">
          
          <section className="dashboard-overview">
            <div className="overview-header">
              <div>
                <h2>Welcome back, {userName}</h2>
                <p>Here’s an overview of your enterprise knowledge environment.</p>
              </div>
              <div className="overview-actions">
                <span className="last-updated">Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <button
                  type="button"
                  className="refresh-button"
                  onClick={refreshDashboard}
                  disabled={refreshing}
                >
                  <FaSyncAlt className={refreshing ? "spinning" : ""} />
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>
          </section>

          {/* ================= KPI SECTION ================= */}
          <section className="metrics-row">
            <div className="metric-card">
              <div className="metric-icon"><FaUsers /></div>
              <div className="metric-info">
                <span className="metric-label">Employees</span>
                <span className="metric-value">{loadingEmployees ? "..." : employeeCount}</span>
                <span className="metric-sub">Active profiles</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><FaProjectDiagram /></div>
              <div className="metric-info">
                <span className="metric-label">Projects</span>
                <span className="metric-value">{loadingProjects ? "..." : projectCount}</span>
                <span className="metric-sub">Enterprise initiatives</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><FaFileAlt /></div>
              <div className="metric-info">
                <span className="metric-label">Documents</span>
                <span className="metric-value">{loadingDocuments ? "..." : documentCount}</span>
                <span className="metric-sub">Indexed files</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-icon"><FaSitemap /></div>
              <div className="metric-info">
                <span className="metric-label">Relationships</span>
                <span className="metric-value">{loadingRelationships ? "..." : relationshipCount}</span>
                <span className="metric-sub">Graph connections</span>
              </div>
            </div>
          </section>

          <div className="dashboard-layout">
            <div className="dashboard-column-main">
              
              {/* ================= KNOWLEDGE OVERVIEW ================= */}
              <section className="panel platform-overview-panel">
                <div className="panel-header">
                  <h3>Knowledge Platform Overview</h3>
                </div>
                <div className="platform-workflow-container">
                  <p className="workflow-desc">KnowSphere connects isolated enterprise data into a unified, intelligent graph.</p>
                  <div className="platform-workflow">
                     <div className="workflow-step">
                        <div className="workflow-icon"><FaUsers /></div>
                        <span>Employees</span>
                     </div>
                     <div className="workflow-arrow"><FaArrowRight /></div>
                     <div className="workflow-step">
                        <div className="workflow-icon"><FaProjectDiagram /></div>
                        <span>Projects</span>
                     </div>
                     <div className="workflow-arrow"><FaArrowRight /></div>
                     <div className="workflow-step">
                        <div className="workflow-icon"><FaFileAlt /></div>
                        <span>Documents</span>
                     </div>
                     <div className="workflow-arrow"><FaArrowRight /></div>
                     <div className="workflow-step final">
                        <div className="workflow-icon"><FaNetworkWired /></div>
                        <span>Knowledge Graph</span>
                     </div>
                  </div>
                </div>
              </section>

              {/* ================= RECENT DOCUMENTS ================= */}
              <section className="panel recent-documents-panel">
                <div className="panel-header">
                  <h3>Recently Added Documents</h3>
                  <Link to="/documents" className="view-all">View All <FaArrowRight /></Link>
                </div>
                <div className="table-responsive">
                  <table className="enterprise-table">
                    <thead>
                      <tr>
                        <th>Document Name</th>
                        <th>Category</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loadingDocuments ? (
                        <tr><td colSpan="3" className="loading-cell">Loading documents...</td></tr>
                      ) : recentDocuments.length > 0 ? (
                        recentDocuments.map((doc, idx) => (
                          <tr key={doc._id || doc.id || idx}>
                            <td className="doc-name">{doc.title || doc.name || "Untitled"}</td>
                            <td><span className="enterprise-badge">{doc.category || doc.type || "N/A"}</span></td>
                            <td><span className="enterprise-badge outline">{doc.status || "Active"}</span></td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan="3" className="empty-cell">No documents found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <div className="dashboard-column-side">
              
              {/* ================= QUICK ACTIONS ================= */}
              <section className="panel quick-actions-panel">
                <div className="panel-header">
                  <h3>Quick Actions</h3>
                </div>
                <div className="quick-actions-list">
                  <Link to="/employees/new" className="action-row">
                    <div className="action-row-icon"><FaPlus /></div>
                    <div className="action-row-text">Add Employee</div>
                  </Link>
                  <Link to="/projects/new" className="action-row">
                    <div className="action-row-icon"><FaProjectDiagram /></div>
                    <div className="action-row-text">Create Project</div>
                  </Link>
                  <Link to="/documents/upload" className="action-row">
                    <div className="action-row-icon"><FaUpload /></div>
                    <div className="action-row-text">Upload Document</div>
                  </Link>
                  <Link to="/graph" className="action-row">
                    <div className="action-row-icon"><FaSitemap /></div>
                    <div className="action-row-text">View Knowledge Graph</div>
                  </Link>
                </div>
              </section>

              {/* ================= AI PROMO ================= */}
              <section className="panel ai-promo-panel">
                <div className="ai-promo-icon-wrap">
                  <FaRobot />
                </div>
                <h3>Ask your enterprise knowledge</h3>
                <p>Explore employees, projects, documents and relationships using the KnowSphere AI Assistant.</p>
                <Link to="/ai-assistant" className="btn-primary">Open AI Assistant</Link>
              </section>

            </div>
          </div>
        </div>

        <footer className="dashboard-footer">
          <p>© {new Date().getFullYear()} KnowSphere Enterprise</p>
        </footer>
      </main>
    </div>
  );
}

export default Dashboard;
