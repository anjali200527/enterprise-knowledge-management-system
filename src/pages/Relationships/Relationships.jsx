import "./Relationships.css";

import { useEffect, useState } from "react";

import { FaPlus, FaEdit, FaTrash, FaProjectDiagram } from "react-icons/fa";

import axios from "axios";
import { useNavigate } from "react-router-dom";

import API_URL from "../../config/api";

function Relationships() {
  // ================= API URLS =================

  const RELATIONSHIP_API = `${API_URL}/api/relationships`;

  const EMPLOYEE_API = `${API_URL}/api/employees`;

  const PROJECT_API = `${API_URL}/api/projects`;

  const DOCUMENT_API = `${API_URL}/api/documents`;

  // ================= STATES =================

  const [relationships, setRelationships] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  // ================= EDIT STATES =================

  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedRelationship, setSelectedRelationship] = useState(null);

  const [editData, setEditData] = useState({
    sourceType: "Employee",
    sourceId: "",
    targetType: "Project",
    targetId: "",
    relationshipType: "Works On",
    description: "",
  });

  // ================= NAVIGATE =================

  const navigate = useNavigate();

  // ================= GET ID =================

  const getId = (item) => {
    return item?._id || item?.id || "";
  };

  // ================= NORMALIZE API DATA =================

  const getApiArray = (data, key) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.[key])) {
      return data[key];
    }

    return [];
  };

  // ================= FETCH ALL DATA =================

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [
        relationshipsResponse,
        employeesResponse,
        projectsResponse,
        documentsResponse,
      ] = await Promise.all([
        axios.get(RELATIONSHIP_API),
        axios.get(EMPLOYEE_API),
        axios.get(PROJECT_API),
        axios.get(DOCUMENT_API),
      ]);

      const relationshipData = getApiArray(
        relationshipsResponse.data,
        "relationships",
      );

      const employeeData = getApiArray(employeesResponse.data, "employees");

      const projectData = getApiArray(projectsResponse.data, "projects");

      const documentData = getApiArray(documentsResponse.data, "documents");

      setRelationships(relationshipData);
      setEmployees(employeeData);
      setProjects(projectData);
      setDocuments(documentData);
    } catch (error) {
      console.error("Error fetching relationship data:", error);

      setErrorMessage(
        error.response?.data?.message || "Failed to load relationship data.",
      );

      setRelationships([]);
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD DATA =================

  useEffect(() => {
    fetchAllData();
  }, []);

  // ================= GET ENTITIES =================

  const getEntitiesByType = (type) => {
    switch (type) {
      case "Employee":
        return employees;

      case "Project":
        return projects;

      case "Document":
        return documents;

      default:
        return [];
    }
  };

  // ================= GET ENTITY NAME =================

  const getEntityName = (type, id) => {
    const entities = getEntitiesByType(type);

    const entity = entities.find((item) => String(getId(item)) === String(id));

    if (!entity) {
      return "Unknown";
    }

    switch (type) {
      case "Employee":
        return entity.name || entity.email || "Employee";

      case "Project":
        return entity.projectName || entity.name || "Project";

      case "Document":
        return entity.title || entity.name || "Document";

      default:
        return "Unknown";
    }
  };

  // ================= GET RELATIONSHIP ID =================

  const getRelationshipId = (relationship) => {
    return relationship?._id || relationship?.id || "";
  };

  // ================= EDIT SOURCE TYPE CHANGE =================

  const handleEditSourceTypeChange = (e) => {
    const value = e.target.value;

    setEditData((previousData) => ({
      ...previousData,
      sourceType: value,
      sourceId: "",
    }));
  };

  // ================= EDIT TARGET TYPE CHANGE =================

  const handleEditTargetTypeChange = (e) => {
    const value = e.target.value;

    setEditData((previousData) => ({
      ...previousData,
      targetType: value,
      targetId: "",
    }));
  };

  // ================= EDIT FORM CHANGE =================

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // ================= CLOSE EDIT MODAL =================

  const closeEditModal = () => {
    if (submitting) {
      return;
    }

    setShowEditModal(false);

    setSelectedRelationship(null);

    setEditData({
      sourceType: "Employee",
      sourceId: "",
      targetType: "Project",
      targetId: "",
      relationshipType: "Works On",
      description: "",
    });
  };

  // ================= VALIDATE RELATIONSHIP =================

  const validateRelationship = (relationshipData) => {
    if (
      !relationshipData.sourceType ||
      !relationshipData.sourceId ||
      !relationshipData.targetType ||
      !relationshipData.targetId ||
      !relationshipData.relationshipType
    ) {
      alert("Please fill all required relationship fields.");

      return false;
    }

    if (
      relationshipData.sourceType === relationshipData.targetType &&
      String(relationshipData.sourceId) === String(relationshipData.targetId)
    ) {
      alert("Source and target cannot be the same entity.");

      return false;
    }

    return true;
  };

  // ================= OPEN EDIT MODAL =================

  const handleEditClick = (relationship) => {
    setSelectedRelationship(relationship);

    setEditData({
      sourceType: relationship.sourceType || "Employee",

      sourceId: relationship.sourceId || "",

      targetType: relationship.targetType || "Project",

      targetId: relationship.targetId || "",

      relationshipType: relationship.relationshipType || "",

      description: relationship.description || "",
    });

    setShowEditModal(true);
  };

  // ================= UPDATE RELATIONSHIP =================

  const handleUpdateRelationship = async (e) => {
    e.preventDefault();

    if (!selectedRelationship) {
      return;
    }

    if (!validateRelationship(editData)) {
      return;
    }

    const relationshipId = getRelationshipId(selectedRelationship);

    if (!relationshipId) {
      alert("Relationship ID not found.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.put(
        `${RELATIONSHIP_API}/${relationshipId}`,
        editData,
      );

      const updatedRelationship = response.data?.relationship || response.data;

      setRelationships((previousRelationships) =>
        previousRelationships.map((relationship) =>
          String(getRelationshipId(relationship)) === String(relationshipId)
            ? updatedRelationship
            : relationship,
        ),
      );

      alert(response.data?.message || "Relationship updated successfully.");

      closeEditModal();
    } catch (error) {
      console.error("Update Relationship Error:", error);

      alert(error.response?.data?.message || "Failed to update relationship.");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= DELETE RELATIONSHIP =================

  const handleDeleteRelationship = async (relationship) => {
    const relationshipId = getRelationshipId(relationship);

    if (!relationshipId) {
      alert("Relationship ID not found.");
      return;
    }

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this relationship?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.delete(
        `${RELATIONSHIP_API}/${relationshipId}`,
      );

      setRelationships((previousRelationships) =>
        previousRelationships.filter(
          (relationshipItem) =>
            String(getRelationshipId(relationshipItem)) !==
            String(relationshipId),
        ),
      );

      alert(response.data?.message || "Relationship deleted successfully.");
    } catch (error) {
      console.error("Delete Relationship Error:", error);

      alert(error.response?.data?.message || "Failed to delete relationship.");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= SEARCH =================

  const filteredRelationships = relationships.filter((relationship) => {
    const sourceName = getEntityName(
      relationship.sourceType,
      relationship.sourceId,
    );

    const targetName = getEntityName(
      relationship.targetType,
      relationship.targetId,
    );

    const searchData = `
        ${sourceName}
        ${targetName}
        ${relationship.sourceType || ""}
        ${relationship.targetType || ""}
        ${relationship.relationshipType || ""}
        ${relationship.description || ""}
      `.toLowerCase();

    return searchData.includes(search.toLowerCase());
  });

  // ================= ENTITY OPTIONS =================

  const renderEntityOptions = (type) => {
    return getEntitiesByType(type).map((entity) => {
      const entityId = getId(entity);

      return (
        <option key={entityId} value={entityId}>
          {getEntityName(type, entityId)}
        </option>
      );
    });
  };

  return (
    <div className="relationships-container">
      {/* ================= HEADER ================= */}

      <div className="relationships-header">
        <div>
          <h2>
            <FaProjectDiagram /> Relationship Management
          </h2>

          <p>Manage connections between employees, projects and documents.</p>
        </div>

        <div className="relationship-count">
          Total Relationships: {relationships.length}
        </div>
      </div>

      {/* ================= ADD RELATIONSHIP BUTTON ================= */}

      <div className="add-relationship-card">
        <div>
          <h3>
            <FaProjectDiagram /> Add New Relationship
          </h3>

          <p>Create a connection between employees, projects and documents.</p>
        </div>

        <button
          type="button"
          className="add-relationship-btn"
          onClick={() => navigate("/relationships/add")}
        >
          <FaPlus />
          Add Relationship
        </button>
      </div>

      {/* ================= SEARCH + TABLE ================= */}

      <div className="relationships-table-card">
        <h3>All Relationships</h3>

        <input
          type="text"
          className="relationship-search-box"
          placeholder="Search relationships..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* ================= ERROR ================= */}

        {errorMessage && (
          <div className="relationship-error">
            <p>{errorMessage}</p>

            <button type="button" onClick={fetchAllData}>
              Try Again
            </button>
          </div>
        )}

        {/* ================= TABLE ================= */}

        {loading ? (
          <p className="relationship-loading">Loading relationships...</p>
        ) : (
          <div className="relationship-table-wrapper">
            <table className="relationships-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Source</th>
                  <th>Relationship</th>
                  <th>Target</th>
                  <th>Description</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredRelationships.length > 0 ? (
                  filteredRelationships.map((relationship, index) => {
                    const relationshipId = getRelationshipId(relationship);

                    return (
                      <tr key={relationshipId || index}>
                        <td>{index + 1}</td>

                        <td>
                          <strong>
                            {getEntityName(
                              relationship.sourceType,
                              relationship.sourceId,
                            )}
                          </strong>

                          <small>{relationship.sourceType}</small>
                        </td>

                        <td>
                          <span className="relationship-badge">
                            {relationship.relationshipType}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {getEntityName(
                              relationship.targetType,
                              relationship.targetId,
                            )}
                          </strong>

                          <small>{relationship.targetType}</small>
                        </td>

                        <td>{relationship.description || "No description"}</td>

                        <td>
                          <button
                            type="button"
                            className="edit-btn"
                            title="Edit Relationship"
                            disabled={submitting}
                            onClick={() => handleEditClick(relationship)}
                          >
                            <FaEdit />
                          </button>

                          <button
                            type="button"
                            className="delete-relationship-btn"
                            title="Delete Relationship"
                            disabled={submitting}
                            onClick={() =>
                              handleDeleteRelationship(relationship)
                            }
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="no-relationships">
                      {search
                        ? "No matching relationships found."
                        : "No relationships found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ================= EDIT MODAL ================= */}

      {showEditModal && selectedRelationship && (
        <div className="relationship-modal-overlay">
          <div className="relationship-modal">
            <div className="modal-header">
              <h3>Edit Relationship</h3>

              <button
                type="button"
                className="close-btn"
                onClick={closeEditModal}
                disabled={submitting}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdateRelationship}>
              <div className="form-group">
                <label>Source Type</label>

                <select
                  value={editData.sourceType}
                  onChange={handleEditSourceTypeChange}
                  disabled={submitting}
                >
                  <option value="Employee">Employee</option>

                  <option value="Project">Project</option>

                  <option value="Document">Document</option>
                </select>
              </div>

              <div className="form-group">
                <label>Select Source</label>

                <select
                  name="sourceId"
                  value={editData.sourceId}
                  onChange={handleEditChange}
                  disabled={submitting}
                  required
                >
                  <option value="">Select Source</option>

                  {renderEntityOptions(editData.sourceType)}
                </select>
              </div>

              <div className="form-group">
                <label>Relationship Type</label>

                <input
                  type="text"
                  name="relationshipType"
                  value={editData.relationshipType}
                  onChange={handleEditChange}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="form-group">
                <label>Target Type</label>

                <select
                  value={editData.targetType}
                  onChange={handleEditTargetTypeChange}
                  disabled={submitting}
                >
                  <option value="Employee">Employee</option>

                  <option value="Project">Project</option>

                  <option value="Document">Document</option>
                </select>
              </div>

              <div className="form-group">
                <label>Select Target</label>

                <select
                  name="targetId"
                  value={editData.targetId}
                  onChange={handleEditChange}
                  disabled={submitting}
                  required
                >
                  <option value="">Select Target</option>

                  {renderEntityOptions(editData.targetType)}
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  placeholder="Optional description"
                  value={editData.description}
                  onChange={handleEditChange}
                  disabled={submitting}
                />
              </div>

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
                  {submitting ? "Updating..." : "Update Relationship"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Relationships;
