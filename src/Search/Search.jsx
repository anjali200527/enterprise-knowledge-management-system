import "./Search.css";

import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import axios from "axios";

import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import { FaSearch, FaUsers, FaProjectDiagram, FaFileAlt } from "react-icons/fa";

import API_URL from "../../config/api";

function Search() {
  // ================= SEARCH PARAMS =================

  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get("q") || "";

  // ================= STATE =================

  const [employees, setEmployees] = useState([]);

  const [projects, setProjects] = useState([]);

  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [errorMessage, setErrorMessage] = useState("");

  // ================= FETCH DATA =================

  const fetchSearchData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [employeesResponse, projectsResponse, documentsResponse] =
        await Promise.all([
          axios.get(`${API_URL}/api/employees`),

          axios.get(`${API_URL}/api/projects`),

          axios.get(`${API_URL}/api/documents`),
        ]);

      const employeeData = Array.isArray(employeesResponse.data)
        ? employeesResponse.data
        : [];

      const projectData = Array.isArray(projectsResponse.data)
        ? projectsResponse.data
        : [];

      const documentData = Array.isArray(documentsResponse.data)
        ? documentsResponse.data
        : [];

      setEmployees(employeeData);

      setProjects(projectData);

      setDocuments(documentData);
    } catch (error) {
      console.error("Search Error:", error);

      setErrorMessage(
        error.response?.data?.message || "Failed to load search data.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD DATA =================

  useEffect(() => {
    fetchSearchData();
  }, []);

  // ================= FILTER DATA =================

  const query = searchQuery.toLowerCase().trim();

  const filteredEmployees = employees.filter((employee) => {
    const name = employee.name || employee.employeeName || "";

    const email = employee.email || "";

    const department = employee.department || "";

    return (
      name.toLowerCase().includes(query) ||
      email.toLowerCase().includes(query) ||
      department.toLowerCase().includes(query)
    );
  });

  const filteredProjects = projects.filter((project) => {
    const name = project.name || project.projectName || "";

    const description = project.description || "";

    return (
      name.toLowerCase().includes(query) ||
      description.toLowerCase().includes(query)
    );
  });

  const filteredDocuments = documents.filter((document) => {
    const title = document.title || document.documentName || "";

    const description = document.description || "";

    return (
      title.toLowerCase().includes(query) ||
      description.toLowerCase().includes(query)
    );
  });

  const totalResults =
    filteredEmployees.length +
    filteredProjects.length +
    filteredDocuments.length;

  // ================= UI =================

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <Navbar />

        <div className="search-page">
          {/* ================= HEADER ================= */}

          <div className="search-header">
            <h2>
              <FaSearch />
              Search Results
            </h2>

            <p>
              {searchQuery
                ? `Results for "${searchQuery}"`
                : "Search Employees, Projects and Documents"}
            </p>
          </div>

          {/* ================= LOADING ================= */}

          {loading ? (
            <div className="search-loading">
              Searching Enterprise Knowledge...
            </div>
          ) : errorMessage ? (
            <div className="search-error">{errorMessage}</div>
          ) : query === "" ? (
            <div className="empty-search">
              Enter something in the search box to search your Enterprise
              Knowledge Management System.
            </div>
          ) : (
            <>
              {/* ================= RESULT COUNT ================= */}

              <div className="result-count">
                {totalResults} result
                {totalResults !== 1 ? "s" : ""} found
              </div>

              {/* ================= EMPLOYEES ================= */}

              {filteredEmployees.length > 0 && (
                <div className="search-section">
                  <h3>
                    <FaUsers />
                    Employees
                  </h3>

                  <div className="search-results-grid">
                    {filteredEmployees.map((employee) => (
                      <div className="search-result-card" key={employee._id}>
                        <h4>
                          {employee.name || employee.employeeName || "Employee"}
                        </h4>

                        <p>
                          <strong>Email:</strong>{" "}
                          {employee.email || "Not available"}
                        </p>

                        <p>
                          <strong>Department:</strong>{" "}
                          {employee.department || "Not available"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= PROJECTS ================= */}

              {filteredProjects.length > 0 && (
                <div className="search-section">
                  <h3>
                    <FaProjectDiagram />
                    Projects
                  </h3>

                  <div className="search-results-grid">
                    {filteredProjects.map((project) => (
                      <div className="search-result-card" key={project._id}>
                        <h4>
                          {project.name || project.projectName || "Project"}
                        </h4>

                        <p>
                          {project.description || "No description available"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= DOCUMENTS ================= */}

              {filteredDocuments.length > 0 && (
                <div className="search-section">
                  <h3>
                    <FaFileAlt />
                    Documents
                  </h3>

                  <div className="search-results-grid">
                    {filteredDocuments.map((document) => (
                      <div className="search-result-card" key={document._id}>
                        <h4>
                          {document.title ||
                            document.documentName ||
                            "Document"}
                        </h4>

                        <p>
                          {document.description || "No description available"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= NO RESULTS ================= */}

              {totalResults === 0 && (
                <div className="no-results">
                  <FaSearch />

                  <h3>No Results Found</h3>

                  <p>We couldn't find anything matching "{searchQuery}".</p>
                </div>
              )}
            </>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default Search;
