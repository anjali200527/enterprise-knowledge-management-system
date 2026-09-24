import "./Dashboard.css";

import { useState, useEffect, useCallback } from "react";

import axios from "axios";

import { Link } from "react-router-dom";

import Sidebar from "../../components/Sidebar/Sidebar";
import API_URL from "../../config/api";

import {
  FaUsers,
  FaProjectDiagram,
  FaFileAlt,
  FaSitemap,
  FaSyncAlt,
  FaBars,
  FaTimes,
  FaUserCircle,
  FaBell,
} from "react-icons/fa";

function Dashboard() {
  // =====================================================
  // USER
  // =====================================================

  const [user, setUser] = useState(null);

  // =====================================================
  // SIDEBAR
  // =====================================================

  const [sidebarOpen, setSidebarOpen] = useState(true);

  // =====================================================
  // DASHBOARD COUNTS
  // =====================================================

  const [employeeCount, setEmployeeCount] = useState(0);
  const [projectCount, setProjectCount] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);
  const [relationshipCount, setRelationshipCount] = useState(0);

  // =====================================================
  // RECENT DOCUMENTS
  // =====================================================

  const [recentDocuments, setRecentDocuments] = useState([]);

  // =====================================================
  // LOADING STATES
  // =====================================================

  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [loadingRelationships, setLoadingRelationships] = useState(false);

  const [refreshing, setRefreshing] = useState(false);

  // =====================================================
  // LOAD USER
  // =====================================================

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (!storedUser) {
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } catch (error) {
      console.error("User data error:", error);

      localStorage.removeItem("user");
      localStorage.removeItem("token");

      window.location.href = "/";
    }
  }, []);

  // =====================================================
  // USER ROLE
  // =====================================================

  const userRole = user?.role || "Employee";

  // =====================================================
  // USER NAME
  // =====================================================

  const userName = user?.username || user?.name || "User";

  // =====================================================
  // AUTH CONFIG
  // =====================================================

  const getAuthConfig = useCallback(() => {
    const token = localStorage.getItem("token");

    return {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    };
  }, []);

  // =====================================================
  // SIDEBAR TOGGLE
  // =====================================================

  const toggleSidebar = () => {
    setSidebarOpen((previousState) => !previousState);
  };

  // =====================================================
  // FETCH EMPLOYEE COUNT
  // =====================================================

  const fetchEmployeeCount = useCallback(async () => {
    if (!user) {
      return;
    }

    try {
      setLoadingEmployees(true);

      const response = await axios.get(
        `${API_URL}/api/employees`,
        getAuthConfig(),
      );

      console.log("Employee API Response:", response.data);

      if (typeof response.data?.count === "number") {
        setEmployeeCount(response.data.count);
      } else if (Array.isArray(response.data?.employees)) {
        setEmployeeCount(response.data.employees.length);
      } else if (Array.isArray(response.data)) {
        setEmployeeCount(response.data.length);
      } else {
        setEmployeeCount(0);
      }
    } catch (error) {
      console.error(
        "Dashboard Employee Count Error:",
        error.response?.data || error.message,
      );

      setEmployeeCount(0);
    } finally {
      setLoadingEmployees(false);
    }
  }, [user, getAuthConfig]);

  // =====================================================
  // FETCH PROJECT COUNT
  // =====================================================

  const fetchProjectCount = useCallback(async () => {
    try {
      setLoadingProjects(true);

      const response = await axios.get(
        `${API_URL}/api/projects`,
        getAuthConfig(),
      );

      console.log("Project API Response:", response.data);

      if (typeof response.data?.count === "number") {
        setProjectCount(response.data.count);
      } else if (Array.isArray(response.data?.projects)) {
        setProjectCount(response.data.projects.length);
      } else if (Array.isArray(response.data)) {
        setProjectCount(response.data.length);
      } else {
        setProjectCount(0);
      }
    } catch (error) {
      console.error(
        "Dashboard Project Count Error:",
        error.response?.data || error.message,
      );

      setProjectCount(0);
    } finally {
      setLoadingProjects(false);
    }
  }, [getAuthConfig]);

  // =====================================================
  // FETCH DOCUMENT DATA
  // =====================================================

  const fetchDocumentData = useCallback(async () => {
    try {
      setLoadingDocuments(true);

      const response = await axios.get(
        `${API_URL}/api/documents`,
        getAuthConfig(),
      );

      console.log("Document API Response:", response.data);

      let documentData = [];

      if (Array.isArray(response.data?.documents)) {
        documentData = response.data.documents;
      } else if (Array.isArray(response.data)) {
        documentData = response.data;
      }

      if (typeof response.data?.count === "number") {
        setDocumentCount(response.data.count);
      } else {
        setDocumentCount(documentData.length);
      }

      const sortedDocuments = [...documentData].sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0);
        const dateB = new Date(b.updatedAt || b.createdAt || 0);

        return dateB - dateA;
      });

      setRecentDocuments(sortedDocuments.slice(0, 5));
    } catch (error) {
      console.error(
        "Dashboard Document Count Error:",
        error.response?.data || error.message,
      );

      setDocumentCount(0);
      setRecentDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  }, [getAuthConfig]);

  // =====================================================
  // FETCH RELATIONSHIP COUNT
  // =====================================================

  const fetchRelationshipCount = useCallback(async () => {
    try {
      setLoadingRelationships(true);

      const response = await axios.get(
        `${API_URL}/api/relationships`,
        getAuthConfig(),
      );

      console.log("Relationship API Response:", response.data);

      if (typeof response.data?.count === "number") {
        setRelationshipCount(response.data.count);
      } else if (Array.isArray(response.data?.relationships)) {
        setRelationshipCount(response.data.relationships.length);
      } else if (Array.isArray(response.data)) {
        setRelationshipCount(response.data.length);
      } else {
        setRelationshipCount(0);
      }
    } catch (error) {
      console.error(
        "Dashboard Relationship Count Error:",
        error.response?.data || error.message,
      );

      setRelationshipCount(0);
    } finally {
      setLoadingRelationships(false);
    }
  }, [getAuthConfig]);

  // =====================================================
  // INITIAL DATA LOAD
  // =====================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    fetchEmployeeCount();
    fetchProjectCount();
    fetchDocumentData();
    fetchRelationshipCount();
  }, [
    user,
    fetchEmployeeCount,
    fetchProjectCount,
    fetchDocumentData,
    fetchRelationshipCount,
  ]);

  // =====================================================
  // REFRESH DASHBOARD
  // =====================================================

  const refreshDashboard = async () => {
    try {
      setRefreshing(true);

      await Promise.all([
        fetchEmployeeCount(),
        fetchProjectCount(),
        fetchDocumentData(),
        fetchRelationshipCount(),
      ]);
    } catch (error) {
      console.error("Dashboard Refresh Error:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="dashboard">
      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <main className="main">
        {/* =================================================
            DASHBOARD HEADER
        ================================================= */}

        <header className="dashboard-header">
          {/* LEFT SIDE */}

          <div className="dashboard-header-left">
            <button
              type="button"
              className="dashboard-menu-button"
              onClick={toggleSidebar}
              aria-label={
                sidebarOpen ? "Close navigation menu" : "Open navigation menu"
              }
              title={sidebarOpen ? "Close menu" : "Open menu"}
            >
              {sidebarOpen ? <FaTimes /> : <FaBars />}
            </button>

            <div className="dashboard-header-title">
              <span>Enterprise Knowledge Management System</span>
            </div>
          </div>

          {/* RIGHT SIDE */}

          <nav
            className="dashboard-header-nav"
            aria-label="Dashboard navigation"
          >
            {/* ABOUT US */}

            <Link to="/about">About Us</Link>

            {/* HELP */}

            <Link to="/help">Help</Link>

            {/* CONTACT US */}

            <Link to="/contact">Contact Us</Link>

            {/* NOTIFICATIONS */}

            <button
              type="button"
              className="header-icon-button"
              title="Notifications"
              aria-label="Notifications"
            >
              <FaBell />
            </button>

            {/* PROFILE */}

            <Link to="/profile" className="header-profile-link" title="Profile">
              <FaUserCircle />
              <span>Profile</span>
            </Link>
          </nav>
        </header>

        {/* =================================================
            DASHBOARD CONTENT
        ================================================= */}

        <div className="content">
          {/* =================================================
              WELCOME SECTION
          ================================================= */}

          <section className="welcome-section">
            <div className="welcome-content">
              <div className="welcome-text">
                <h2>Welcome back, {userName} 👋</h2>

                <p>Welcome to the Enterprise Knowledge Management System.</p>

                <span className="user-role">{userRole}</span>
              </div>

              <div className="welcome-actions">
                <button
                  type="button"
                  className="refresh-button"
                  onClick={refreshDashboard}
                  disabled={refreshing}
                >
                  <FaSyncAlt
                    className={
                      refreshing ? "refresh-icon spinning" : "refresh-icon"
                    }
                  />

                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>
          </section>

          {/* =================================================
              DASHBOARD CARDS
          ================================================= */}

          <section className="cards">
            {/* EMPLOYEES */}

            <div className="card">
              <div
                className="icon"
                style={{
                  background: "#4facfe",
                }}
              >
                <FaUsers />
              </div>

              <h3>Total Employees</h3>

              <p>{loadingEmployees ? "..." : employeeCount}</p>
            </div>

            {/* PROJECTS */}

            <div className="card">
              <div
                className="icon"
                style={{
                  background: "#43e97b",
                }}
              >
                <FaProjectDiagram />
              </div>

              <h3>Total Projects</h3>

              <p>{loadingProjects ? "..." : projectCount}</p>
            </div>

            {/* DOCUMENTS */}

            <div className="card">
              <div
                className="icon"
                style={{
                  background: "#fa709a",
                }}
              >
                <FaFileAlt />
              </div>

              <h3>Total Documents</h3>

              <p>{loadingDocuments ? "..." : documentCount}</p>
            </div>

            {/* KNOWLEDGE GRAPH */}

            <div className="card">
              <div
                className="icon"
                style={{
                  background: "#667eea",
                }}
              >
                <FaSitemap />
              </div>

              <h3>Knowledge Graph</h3>

              <p>{loadingRelationships ? "..." : relationshipCount}</p>
            </div>
          </section>

          {/* =================================================
              LOWER DASHBOARD SECTIONS
          ================================================= */}

          <section className="dashboard-sections">
            {/* RECENT ACTIVITY */}

            <div className="recent-activity">
              <h3>Recent Activity</h3>

              <ul>
                <li>Welcome to Enterprise Knowledge Management System.</li>

                <li>
                  You are logged in as <strong>{userRole}</strong>.
                </li>

                <li>
                  Total employees currently available:{" "}
                  <strong>{loadingEmployees ? "..." : employeeCount}</strong>
                </li>

                <li>
                  Total projects currently available:{" "}
                  <strong>{loadingProjects ? "..." : projectCount}</strong>
                </li>

                <li>
                  Total documents currently available:{" "}
                  <strong>{loadingDocuments ? "..." : documentCount}</strong>
                </li>

                <li>
                  Knowledge graph relationships:{" "}
                  <strong>
                    {loadingRelationships ? "..." : relationshipCount}
                  </strong>
                </li>

                <li>Explore documents, projects and knowledge graphs.</li>
              </ul>
            </div>

            {/* RECENT DOCUMENTS */}

            <div className="recent-documents">
              <h3>Recent Documents</h3>

              <div className="recent-documents-table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Document</th>
                      <th>Type</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loadingDocuments ? (
                      <tr>
                        <td colSpan="3">Loading documents...</td>
                      </tr>
                    ) : recentDocuments.length > 0 ? (
                      recentDocuments.map((document, index) => {
                        const documentStatus = (document.status || "Active")
                          .replace(/\s/g, "")
                          .toLowerCase();

                        return (
                          <tr key={document._id || document.id || index}>
                            <td>
                              <span className="recent-document-name">
                                {document.title ||
                                  document.name ||
                                  "Untitled Document"}
                              </span>
                            </td>

                            <td>
                              <span className="recent-document-category">
                                {document.category ||
                                  document.type ||
                                  "Not Available"}
                              </span>
                            </td>

                            <td>
                              <span
                                className={`recent-document-status ${documentStatus}`}
                              >
                                {document.status || "Active"}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="3" className="no-recent-documents">
                          No documents available yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer className="dashboard-footer">
          <div className="footer-content">
            <p>
              © {new Date().getFullYear()} Enterprise Knowledge Management
              System
            </p>

            <div className="footer-links">
              Knowledge • Collaboration • Intelligence
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default Dashboard;
