import "./Reports.css";
import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar/Navbar";
import {
  FaUsers,
  FaProjectDiagram,
  FaFileAlt,
  FaSitemap,
  FaChartBar,
  FaSyncAlt,
  FaCheckCircle
} from "react-icons/fa";
import API_URL from "../../config/api";

function Reports() {
  const [employeeCount, setEmployeeCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);
  const [relationshipCount, setRelationshipCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const getArrayFromResponse = (response) => {
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    if (Array.isArray(response?.data?.employees)) return response.data.employees;
    if (Array.isArray(response?.data?.projects)) return response.data.projects;
    if (Array.isArray(response?.data?.documents)) return response.data.documents;
    if (Array.isArray(response?.data?.relationships)) return response.data.relationships;
    return [];
  };

  const fetchReportData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [
        employeesResponse,
        projectsResponse,
        documentsResponse,
        relationshipsResponse,
      ] = await Promise.all([
        axios.get(`${API_URL}/api/employees`),
        axios.get(`${API_URL}/api/projects`),
        axios.get(`${API_URL}/api/documents`),
        axios.get(`${API_URL}/api/relationships`),
      ]);

      setEmployeeCount(getArrayFromResponse(employeesResponse).length);
      setProjectCount(getArrayFromResponse(projectsResponse).length);
      setDocumentCount(getArrayFromResponse(documentsResponse).length);
      setRelationshipCount(getArrayFromResponse(relationshipsResponse).length);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Reports Error:", error);
      if (error.response) {
        setErrorMessage(error.response.data?.message || `Server Error: ${error.response.status}`);
      } else if (error.request) {
        setErrorMessage("Unable to connect to the backend server. Make sure the backend is running.");
      } else {
        setErrorMessage(error.message || "Failed to load report data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, []);

  const reportCards = [
    { title: "Employees", value: employeeCount, icon: <FaUsers /> },
    { title: "Projects", value: projectCount, icon: <FaProjectDiagram /> },
    { title: "Documents", value: documentCount, icon: <FaFileAlt /> },
    { title: "Relationships", value: relationshipCount, icon: <FaSitemap /> },
  ];

  return (
    <div className="reports-wrapper">
      <Navbar />
      <main className="page-container">
        
        <div className="reports-header">
          <div>
            <h2><FaChartBar className="header-icon" /> Reports</h2>
            <p>Enterprise knowledge analytics and insights.</p>
          </div>
          <div className="reports-actions">
            <span className="last-updated">Last updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            <button className="refresh-btn" onClick={fetchReportData} disabled={loading}>
              <FaSyncAlt className={loading ? "spinning" : ""} />
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {loading && !employeeCount ? (
          <div className="reports-loading">Loading report data...</div>
        ) : errorMessage ? (
          <div className="reports-error">
            <h3>Unable to Load Reports</h3>
            <p>{errorMessage}</p>
            <button className="refresh-btn" onClick={fetchReportData}>Try Again</button>
          </div>
        ) : (
          <div className="reports-content">
            
            <section className="reports-section">
              <h3>Overview / Summary</h3>
              <div className="reports-grid">
                {reportCards.map((card, index) => (
                  <div className="reports-card" key={index}>
                    <div className="reports-card-icon">{card.icon}</div>
                    <div className="reports-card-info">
                      <h4>{card.title}</h4>
                      <div className="reports-card-value">{card.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="reports-split">
              <section className="reports-section flex-1">
                <h3>Knowledge Activity</h3>
                <div className="reports-panel">
                  <p className="summary-text">
                    Your KnowSphere currently contains <strong>{employeeCount}</strong> employees working across <strong>{projectCount}</strong> projects. 
                    The system manages <strong>{documentCount}</strong> documents connected through <strong>{relationshipCount}</strong> knowledge relationships.
                  </p>
                  
                  <div className="activity-stats">
                    <div className="stat-row">
                      <span>Graph Density</span>
                      <strong>{employeeCount + projectCount > 0 ? (relationshipCount / (employeeCount + projectCount)).toFixed(2) : 0} connections / node</strong>
                    </div>
                    <div className="stat-row">
                      <span>System Health</span>
                      <strong className="status-good"><FaCheckCircle /> Optimal</strong>
                    </div>
                  </div>
                </div>
              </section>

              <section className="reports-section flex-1">
                <h3>System Status</h3>
                <div className="reports-panel">
                  <ul className="status-list">
                    <li>
                      <span>Employee Data Sync</span>
                      <span className="badge active">Active</span>
                    </li>
                    <li>
                      <span>Project Indexing</span>
                      <span className="badge active">Active</span>
                    </li>
                    <li>
                      <span>Document Processing</span>
                      <span className="badge active">Active</span>
                    </li>
                    <li>
                      <span>Knowledge Graph Engine</span>
                      <span className="badge active">Active</span>
                    </li>
                    <li>
                      <span>AI Assistant API</span>
                      <span className="badge active">Online</span>
                    </li>
                  </ul>
                </div>
              </section>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}

export default Reports;
