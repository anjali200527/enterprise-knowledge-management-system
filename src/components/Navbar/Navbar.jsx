import "./Navbar.css";

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import API_URL from "../../config/api";

import {
  FaBell,
  FaSearch,
  FaUserCircle,
  FaUsers,
  FaProjectDiagram,
  FaFileAlt,
} from "react-icons/fa";

function Navbar() {
  // ================= NAVIGATION =================

  const navigate = useNavigate();

  // ================= LOGGED-IN USER =================

  const user = JSON.parse(localStorage.getItem("user") || "null");

  const username = user?.username || user?.name || "User";

  const role = user?.role || "User";

  // ================= SEARCH STATE =================

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= FETCH SEARCH DATA =================

  const fetchSearchResults = async () => {
    const query = searchTerm.trim();

    // Empty search
    if (!query) {
      setSearchResults([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [employeesResponse, projectsResponse, documentsResponse] =
        await Promise.all([
          axios.get(`${API_URL}/api/employees`),
          axios.get(`${API_URL}/api/projects`),
          axios.get(`${API_URL}/api/documents`),
        ]);

      // ================= NORMALIZE API RESPONSES =================

      const employees = Array.isArray(employeesResponse.data)
        ? employeesResponse.data
        : employeesResponse.data?.employees || [];

      const projects = Array.isArray(projectsResponse.data)
        ? projectsResponse.data
        : projectsResponse.data?.projects || [];

      const documents = Array.isArray(documentsResponse.data)
        ? documentsResponse.data
        : documentsResponse.data?.documents || [];

      const lowerQuery = query.toLowerCase();

      // ================= EMPLOYEE SEARCH =================

      const employeeResults = employees
        .filter((employee) => {
          const name = employee.name || employee.fullName || "";

          const email = employee.email || "";

          const department = employee.department || "";

          const role = employee.role || employee.designation || "";

          return (
            name.toLowerCase().includes(lowerQuery) ||
            email.toLowerCase().includes(lowerQuery) ||
            department.toLowerCase().includes(lowerQuery) ||
            role.toLowerCase().includes(lowerQuery)
          );
        })
        .slice(0, 5)
        .map((employee) => ({
          id: employee._id || employee.id,

          title: employee.name || employee.fullName || "Employee",

          subtitle:
            employee.department ||
            employee.email ||
            employee.role ||
            "Employee",

          type: "Employee",

          icon: "employee",

          path: "/employees",
        }));

      // ================= PROJECT SEARCH =================

      const projectResults = projects
        .filter((project) => {
          const projectName =
            project.projectName || project.name || project.title || "";

          const projectDescription = project.description || "";

          const projectStatus = project.status || "";

          return (
            projectName.toLowerCase().includes(lowerQuery) ||
            projectDescription.toLowerCase().includes(lowerQuery) ||
            projectStatus.toLowerCase().includes(lowerQuery)
          );
        })
        .slice(0, 5)
        .map((project) => {
          const projectName =
            project.projectName || project.name || project.title || "Project";

          return {
            id: project._id || project.id,

            title: projectName,

            subtitle: project.description || project.status || "Project",

            type: "Project",

            icon: "project",

            path: "/projects",
          };
        });

      // ================= DOCUMENT SEARCH =================

      const documentResults = documents
        .filter((document) => {
          const title = document.title || document.name || "";

          const description = document.description || "";

          const category = document.category || "";

          const department = document.department || "";

          const fileName = document.originalFileName || document.fileName || "";

          return (
            title.toLowerCase().includes(lowerQuery) ||
            description.toLowerCase().includes(lowerQuery) ||
            category.toLowerCase().includes(lowerQuery) ||
            department.toLowerCase().includes(lowerQuery) ||
            fileName.toLowerCase().includes(lowerQuery)
          );
        })
        .slice(0, 5)
        .map((document) => ({
          id: document._id || document.id,

          title:
            document.title ||
            document.name ||
            document.originalFileName ||
            document.fileName ||
            "Document",

          subtitle:
            document.description ||
            document.category ||
            document.department ||
            "Document",

          type: "Document",

          icon: "document",

          path: "/documents",
        }));

      // ================= COMBINE RESULTS =================

      setSearchResults([
        ...employeeResults,
        ...projectResults,
        ...documentResults,
      ]);
    } catch (error) {
      console.error("Search Error:", error);

      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= SEARCH DELAY =================

  useEffect(() => {
    const delayTimer = setTimeout(() => {
      fetchSearchResults();
    }, 400);

    return () => {
      clearTimeout(delayTimer);
    };
  }, [searchTerm]);

  // ================= RESULT CLICK =================

  const handleResultClick = (result) => {
    if (result.id) {
      navigate(`${result.path}?highlight=${result.id}`);
    } else {
      navigate(result.path);
    }

    // Clear search
    setSearchTerm("");
    setSearchResults([]);
  };

  // ================= ICON =================

  const renderResultIcon = (type) => {
    if (type === "employee") {
      return <FaUsers />;
    }

    if (type === "project") {
      return <FaProjectDiagram />;
    }

    return <FaFileAlt />;
  };

  // ================= UI =================

  return (
    <div className="navbar">
      {/* ================= LEFT ================= */}

      <div className="navbar-left">
        <h2>Enterprise Knowledge Management</h2>

        <p>LLM + Knowledge Graph Dashboard</p>
      </div>

      {/* ================= CENTER SEARCH ================= */}

      <div className="navbar-center">
        <div className="search-wrapper">
          <div className="search-box">
            <FaSearch className="search-icon" />

            <input
              type="text"
              placeholder="Search Employees, Projects, Documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* ================= SEARCH RESULTS ================= */}

          {searchTerm.trim() && (
            <div className="search-results">
              {loading ? (
                <div className="search-empty">Searching...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    className="search-result-item"
                    onClick={() => handleResultClick(result)}
                  >
                    <div className="search-result-icon">
                      {renderResultIcon(result.icon)}
                    </div>

                    <div className="search-result-info">
                      <h4>{result.title}</h4>

                      <p>{result.subtitle}</p>
                    </div>

                    <span className="search-result-type">{result.type}</span>
                  </div>
                ))
              ) : (
                <div className="search-empty">No matching results found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================= RIGHT ================= */}

      <div className="navbar-right">
        <FaBell className="bell" />

        <div className="profile">
          <FaUserCircle className="user" />

          <div>
            <h4>{username}</h4>

            <span>{role}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
