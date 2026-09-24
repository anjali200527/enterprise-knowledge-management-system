import "./Reports.css";
import { useEffect, useState } from "react";
import axios from "axios";

import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import {
  FaUsers,
  FaProjectDiagram,
  FaFileAlt,
  FaLink,
  FaChartBar,
} from "react-icons/fa";

import API_URL from "../../config/api";

function Reports() {
  // ================= STATE =================

  const [employeeCount, setEmployeeCount] = useState(0);

  const [projectCount, setProjectCount] = useState(0);

  const [documentCount, setDocumentCount] = useState(0);

  const [relationshipCount, setRelationshipCount] = useState(0);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  // ================= HELPER =================

  const getArrayFromResponse = (response) => {
    if (Array.isArray(response?.data)) {
      return response.data;
    }

    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }

    if (Array.isArray(response?.data?.employees)) {
      return response.data.employees;
    }

    if (Array.isArray(response?.data?.projects)) {
      return response.data.projects;
    }

    if (Array.isArray(response?.data?.documents)) {
      return response.data.documents;
    }

    if (Array.isArray(response?.data?.relationships)) {
      return response.data.relationships;
    }

    return [];
  };

  // ================= FETCH REPORT DATA =================

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

      const employees = getArrayFromResponse(employeesResponse);

      const projects = getArrayFromResponse(projectsResponse);

      const documents = getArrayFromResponse(documentsResponse);

      const relationships = getArrayFromResponse(relationshipsResponse);

      setEmployeeCount(employees.length);

      setProjectCount(projects.length);

      setDocumentCount(documents.length);

      setRelationshipCount(relationships.length);
    } catch (error) {
      console.error("Reports Error:", error);

      if (error.response) {
        setErrorMessage(
          error.response.data?.message ||
            `Server Error: ${error.response.status}`,
        );
      } else if (error.request) {
        setErrorMessage(
          "Unable to connect to the backend server. Make sure the backend is running.",
        );
      } else {
        setErrorMessage(error.message || "Failed to load report data.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD DATA =================

  useEffect(() => {
    fetchReportData();
  }, []);

  // ================= REPORT CARDS =================

  const reportCards = [
    {
      title: "Total Employees",
      value: employeeCount,
      icon: <FaUsers />,
      color: "#2563eb",
    },

    {
      title: "Total Projects",
      value: projectCount,
      icon: <FaProjectDiagram />,
      color: "#16a34a",
    },

    {
      title: "Total Documents",
      value: documentCount,
      icon: <FaFileAlt />,
      color: "#f59e0b",
    },

    {
      title: "Knowledge Relationships",
      value: relationshipCount,
      icon: <FaLink />,
      color: "#9333ea",
    },
  ];

  // ================= UI =================

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <Navbar />

        <div className="reports-page">
          {/* ================= HEADER ================= */}

          <div className="reports-header">
            <div>
              <h2>
                <FaChartBar />
                Enterprise Reports
              </h2>

              <p>Overview of your Enterprise Knowledge Management System</p>
            </div>

            <button
              className="refresh-report-btn"
              onClick={fetchReportData}
              disabled={loading}
            >
              🔄 {loading ? "Refreshing..." : "Refresh Report"}
            </button>
          </div>

          {/* ================= LOADING ================= */}

          {loading ? (
            <div className="reports-loading">Loading report data...</div>
          ) : errorMessage ? (
            <div className="reports-error">
              <h3>Unable to Load Reports</h3>

              <p>{errorMessage}</p>

              <button className="refresh-report-btn" onClick={fetchReportData}>
                Try Again
              </button>
            </div>
          ) : (
            <>
              {/* ================= REPORT CARDS ================= */}

              <div className="report-cards">
                {reportCards.map((card, index) => (
                  <div className="report-card" key={index}>
                    <div
                      className="report-icon"
                      style={{
                        backgroundColor: card.color,
                      }}
                    >
                      {card.icon}
                    </div>

                    <div className="report-info">
                      <h3>{card.title}</h3>

                      <p>{card.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ================= SYSTEM SUMMARY ================= */}

              <div className="report-summary">
                <h3>System Summary</h3>

                <div className="summary-content">
                  <p>
                    Your Enterprise Knowledge Management System currently
                    contains <strong>{employeeCount}</strong> employees working
                    across <strong>{projectCount}</strong> projects.
                  </p>

                  <p>
                    The system manages <strong>{documentCount}</strong>{" "}
                    documents connected through{" "}
                    <strong>{relationshipCount}</strong> knowledge
                    relationships.
                  </p>
                </div>
              </div>

              {/* ================= KNOWLEDGE SYSTEM STATUS ================= */}

              <div className="system-status">
                <h3>Knowledge System Status</h3>

                <div className="status-grid">
                  <div className="status-item">
                    <span>Employee Management</span>

                    <strong className="active-status">Active</strong>
                  </div>

                  <div className="status-item">
                    <span>Project Management</span>

                    <strong className="active-status">Active</strong>
                  </div>

                  <div className="status-item">
                    <span>Document Management</span>

                    <strong className="active-status">Active</strong>
                  </div>

                  <div className="status-item">
                    <span>Knowledge Graph</span>

                    <strong className="active-status">Active</strong>
                  </div>

                  <div className="status-item">
                    <span>AI Assistant</span>

                    <strong className="online-status">Online</strong>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default Reports;
