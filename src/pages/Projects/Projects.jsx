import "./Projects.css";import Navbar from "../../components/Navbar/Navbar";


import { useEffect, useState } from "react";

import { FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";

import axios from "axios";

import API_URL from "../../config/api";

function Projects() {
  // ================= API =================

  const PROJECT_API_URL = `${API_URL}/api/projects`;

  // ================= STATES =================

  const [projects, setProjects] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  // ================= ADD MODAL =================

  const [showModal, setShowModal] = useState(false);

  // ================= EDIT MODAL =================

  const [showEditModal, setShowEditModal] = useState(false);

  // ================= SELECTED PROJECT =================

  const [selectedProject, setSelectedProject] = useState(null);

  // ================= NEW PROJECT =================

  const [newProject, setNewProject] = useState({
    projectName: "",
    description: "",
    department: "",
    projectManager: "",
    status: "Planning",
  });

  // ================= AUTH HEADER =================

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    };
  };

  // ================= GET PROJECT ID =================

  const getProjectId = (project) => {
    return project?._id || project?.id;
  };

  // ================= FETCH PROJECTS =================

  const fetchProjects = async () => {
    try {
      setLoading(true);

      setErrorMessage("");

      const response = await axios.get(PROJECT_API_URL, getAuthConfig());

      let projectData = [];

      // FORMAT 1
      // { projects: [...] }

      if (Array.isArray(response.data?.projects)) {
        projectData = response.data.projects;
      }

      // FORMAT 2
      // [...]
      else if (Array.isArray(response.data)) {
        projectData = response.data;
      }

      setProjects(projectData);
    } catch (error) {
      console.error(
        "Error fetching projects:",
        error.response?.data || error.message,
      );

      setErrorMessage(
        error.response?.data?.message || "Failed to fetch projects.",
      );

      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD PROJECTS =================

  useEffect(() => {
    fetchProjects();
  }, []);

  // ================= HANDLE ADD CHANGE =================

  const handleProjectChange = (e) => {
    const { name, value } = e.target;

    setNewProject((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // ================= HANDLE EDIT CHANGE =================

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setSelectedProject((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // ================= RESET ADD FORM =================

  const resetAddForm = () => {
    setNewProject({
      projectName: "",
      description: "",
      department: "",
      projectManager: "",
      status: "Planning",
    });
  };

  // ================= CLOSE ADD MODAL =================

  const closeAddModal = () => {
    if (submitting) {
      return;
    }

    setShowModal(false);

    resetAddForm();
  };

  // ================= CLOSE EDIT MODAL =================

  const closeEditModal = () => {
    if (submitting) {
      return;
    }

    setShowEditModal(false);

    setSelectedProject(null);
  };

  // ================= ADD PROJECT =================

  const handleAddProject = async (e) => {
    e.preventDefault();

    if (
      !newProject.projectName.trim() ||
      !newProject.description.trim() ||
      !newProject.department.trim() ||
      !newProject.projectManager.trim()
    ) {
      alert("All required fields must be filled.");

      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.post(
        PROJECT_API_URL,
        {
          projectName: newProject.projectName.trim(),

          description: newProject.description.trim(),

          department: newProject.department.trim(),

          projectManager: newProject.projectManager.trim(),

          status: newProject.status,
        },
        getAuthConfig(),
      );

      alert(response.data?.message || "Project added successfully.");

      await fetchProjects();

      closeAddModal();
    } catch (error) {
      console.error(
        "Error adding project:",
        error.response?.data || error.message,
      );

      alert(error.response?.data?.message || "Failed to add project.");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= OPEN EDIT MODAL =================

  const handleEditClick = (project) => {
    setSelectedProject({
      ...project,
    });

    setShowEditModal(true);
  };

  // ================= UPDATE PROJECT =================

  const handleUpdateProject = async (e) => {
    e.preventDefault();

    if (!selectedProject) {
      return;
    }

    const projectId = getProjectId(selectedProject);

    if (!projectId) {
      alert("Project ID not found.");

      return;
    }

    if (
      !selectedProject.projectName?.trim() ||
      !selectedProject.description?.trim() ||
      !selectedProject.department?.trim() ||
      !selectedProject.projectManager?.trim()
    ) {
      alert("All required fields must be filled.");

      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.put(
        `${PROJECT_API_URL}/${projectId}`,
        {
          projectName: selectedProject.projectName.trim(),

          description: selectedProject.description.trim(),

          department: selectedProject.department.trim(),

          projectManager: selectedProject.projectManager.trim(),

          status: selectedProject.status,
        },
        getAuthConfig(),
      );

      alert(response.data?.message || "Project updated successfully.");

      await fetchProjects();

      setShowEditModal(false);

      setSelectedProject(null);
    } catch (error) {
      console.error(
        "Update Project Error:",
        error.response?.data || error.message,
      );

      alert(error.response?.data?.message || "Failed to update project.");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= DELETE PROJECT =================

  const handleDeleteProject = async (project) => {
    const projectId = getProjectId(project);

    if (!projectId) {
      alert("Project ID not found.");

      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${project.projectName}"?`,
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.delete(
        `${PROJECT_API_URL}/${projectId}`,
        getAuthConfig(),
      );

      alert(response.data?.message || "Project deleted successfully.");

      await fetchProjects();
    } catch (error) {
      console.error(
        "Delete Project Error:",
        error.response?.data || error.message,
      );

      alert(error.response?.data?.message || "Failed to delete project.");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= SEARCH PROJECTS =================

  const filteredProjects = projects.filter((project) => {
    const searchData = `
        ${project.projectName || ""}
        ${project.description || ""}
        ${project.department || ""}
        ${project.projectManager || ""}
        ${project.status || ""}
      `.toLowerCase();

    return searchData.includes(search.trim().toLowerCase());
  });

  // ================= STATUS CLASS =================

  const getStatusClass = (status) => {
    if (!status) {
      return "";
    }

    return status.toLowerCase().replace(/\s/g, "-");
  };

  return (
    <div className="project-container">
      <Navbar />
      {/* ================= HEADER ================= */}

      <div className="project-header">
        <div>
          <h2>Project Management</h2>

          <p>Manage enterprise projects and project information.</p>
        </div>

        <button
          type="button"
          className="add-project"
          onClick={() => setShowModal(true)}
          disabled={submitting}
        >
          <FaPlus />
          Add Project
        </button>
      </div>

      {/* ================= SEARCH ================= */}

      <input
        type="text"
        placeholder="Search project, manager, department or status..."
        className="search-project"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ================= ERROR ================= */}

      {errorMessage && (
        <div className="project-error">
          <p>{errorMessage}</p>

          <button type="button" onClick={fetchProjects}>
            Try Again
          </button>
        </div>
      )}

      {/* ================= TABLE ================= */}

      {loading ? (
        <p className="loading-text">Loading projects...</p>
      ) : (
        <div className="project-table-wrapper">
          <table className="project-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Project</th>
                <th>Manager</th>
                <th>Department</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, index) => {
                  const projectId = getProjectId(project);

                  return (
                    <tr key={projectId || index}>
                      <td>{index + 1}</td>

                      <td>{project.projectName || "Not available"}</td>

                      <td>{project.projectManager || "Not available"}</td>

                      <td>{project.department || "Not available"}</td>

                      <td>
                        <span
                          className={`status ${getStatusClass(project.status)}`}
                        >
                          {project.status || "Planning"}
                        </span>
                      </td>

                      <td className="project-actions">
                        <button
                          type="button"
                          className="edit"
                          disabled={submitting}
                          onClick={() => handleEditClick(project)}
                        >
                          <FaEdit />
                        </button>

                        <button
                          type="button"
                          className="delete"
                          disabled={submitting}
                          onClick={() => handleDeleteProject(project)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="no-data">
                    {search
                      ? "No matching projects found."
                      : "No projects found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= ADD MODAL ================= */}

      {showModal && (
        <div className="project-modal-overlay">
          <div className="project-modal">
            <div className="modal-header">
              <h3>Add New Project</h3>

              <button
                type="button"
                className="close-btn"
                onClick={closeAddModal}
                disabled={submitting}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAddProject}>
              <ProjectFormFields
                project={newProject}
                onChange={handleProjectChange}
                submitting={submitting}
              />

              <div className="modal-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeAddModal}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={submitting}
                >
                  {submitting ? "Adding..." : "Add Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= EDIT MODAL ================= */}

      {showEditModal && selectedProject && (
        <div className="project-modal-overlay">
          <div className="project-modal">
            <div className="modal-header">
              <h3>Edit Project</h3>

              <button
                type="button"
                className="close-btn"
                onClick={closeEditModal}
                disabled={submitting}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleUpdateProject}>
              <ProjectFormFields
                project={selectedProject}
                onChange={handleEditChange}
                submitting={submitting}
              />

              <div className="modal-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeEditModal}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-btn"
                  disabled={submitting}
                >
                  {submitting ? "Updating..." : "Update Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ================= REUSABLE PROJECT FORM =================

function ProjectFormFields({ project, onChange, submitting }) {
  return (
    <>
      {/* PROJECT NAME */}

      <div className="form-group">
        <label>Project Name</label>

        <input
          type="text"
          name="projectName"
          placeholder="Enter project name"
          value={project.projectName || ""}
          onChange={onChange}
          disabled={submitting}
          required
        />
      </div>

      {/* DESCRIPTION */}

      <div className="form-group">
        <label>Description</label>

        <textarea
          name="description"
          placeholder="Enter project description"
          value={project.description || ""}
          onChange={onChange}
          disabled={submitting}
          required
        />
      </div>

      {/* DEPARTMENT */}

      <div className="form-group">
        <label>Department</label>

        <input
          type="text"
          name="department"
          placeholder="Enter department"
          value={project.department || ""}
          onChange={onChange}
          disabled={submitting}
          required
        />
      </div>

      {/* PROJECT MANAGER */}

      <div className="form-group">
        <label>Project Manager</label>

        <input
          type="text"
          name="projectManager"
          placeholder="Enter project manager name"
          value={project.projectManager || ""}
          onChange={onChange}
          disabled={submitting}
          required
        />
      </div>

      {/* STATUS */}

      <div className="form-group">
        <label>Status</label>

        <select
          name="status"
          value={project.status || "Planning"}
          onChange={onChange}
          disabled={submitting}
        >
          <option value="Planning">Planning</option>

          <option value="In Progress">In Progress</option>

          <option value="Completed">Completed</option>
        </select>
      </div>
    </>
  );
}

export default Projects;
