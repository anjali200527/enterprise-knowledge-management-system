import "./Relationships.css";

import { useEffect, useState } from "react";
import { FaProjectDiagram, FaSave, FaTimes } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import API_URL from "../../config/api";

function AddRelationship() {
  // ================= API URLS =================

  const RELATIONSHIP_API = `${API_URL}/api/relationships`;

  const EMPLOYEE_API = `${API_URL}/api/employees`;

  const PROJECT_API = `${API_URL}/api/projects`;

  const DOCUMENT_API = `${API_URL}/api/documents`;

  // ================= NAVIGATE =================

  const navigate = useNavigate();

  // ================= FORM DATA =================

  const [relationshipData, setRelationshipData] = useState({
    sourceType: "Employee",
    sourceId: "",
    relationshipType: "Works On",
    targetType: "Project",
    targetId: "",
    description: "",
  });

  // ================= ENTITY DATA =================

  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);

  // ================= STATES =================

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // ================= GET ID =================

  const getId = (item) => {
    return item?._id || item?.id || "";
  };

  // ================= GET API ARRAY =================

  const getApiArray = (data, key) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.[key])) {
      return data[key];
    }

    return [];
  };

  // ================= FETCH ENTITIES =================

  const fetchEntities = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [employeesResponse, projectsResponse, documentsResponse] =
        await Promise.all([
          axios.get(EMPLOYEE_API),
          axios.get(PROJECT_API),
          axios.get(DOCUMENT_API),
        ]);

      setEmployees(getApiArray(employeesResponse.data, "employees"));

      setProjects(getApiArray(projectsResponse.data, "projects"));

      setDocuments(getApiArray(documentsResponse.data, "documents"));
    } catch (error) {
      console.error("Error loading entities:", error);

      setErrorMessage(
        error.response?.data?.message ||
          "Failed to load employees, projects and documents.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= LOAD DATA =================

  useEffect(() => {
    fetchEntities();
  }, []);

  // ================= GET ENTITIES BY TYPE =================

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

  const getEntityName = (type, entity) => {
    if (!entity) {
      return "Unknown";
    }

    switch (type) {
      case "Employee":
        return entity.name || entity.fullName || entity.email || "Employee";

      case "Project":
        return entity.projectName || entity.name || entity.title || "Project";

      case "Document":
        return (
          entity.title || entity.name || entity.originalFileName || "Document"
        );

      default:
        return "Unknown";
    }
  };

  // ================= FORM CHANGE =================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setRelationshipData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // ================= SOURCE TYPE CHANGE =================

  const handleSourceTypeChange = (e) => {
    const value = e.target.value;

    setRelationshipData((previousData) => ({
      ...previousData,
      sourceType: value,
      sourceId: "",
    }));
  };

  // ================= TARGET TYPE CHANGE =================

  const handleTargetTypeChange = (e) => {
    const value = e.target.value;

    setRelationshipData((previousData) => ({
      ...previousData,
      targetType: value,
      targetId: "",
    }));
  };

  // ================= VALIDATE =================

  const validateRelationship = () => {
    if (
      !relationshipData.sourceType ||
      !relationshipData.sourceId ||
      !relationshipData.relationshipType ||
      !relationshipData.targetType ||
      !relationshipData.targetId
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

  // ================= ADD RELATIONSHIP =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateRelationship()) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.post(RELATIONSHIP_API, relationshipData);

      alert(response.data?.message || "Relationship added successfully.");

      navigate("/relationships");
    } catch (error) {
      console.error("Error adding relationship:", error);

      alert(error.response?.data?.message || "Failed to add relationship.");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= CANCEL =================

  const handleCancel = () => {
    if (submitting) {
      return;
    }

    navigate("/relationships");
  };

  // ================= ENTITY OPTIONS =================

  const renderEntityOptions = (type) => {
    const entities = getEntitiesByType(type);

    if (entities.length === 0) {
      return (
        <option value="" disabled>
          No {type}s available
        </option>
      );
    }

    return entities.map((entity) => {
      const entityId = getId(entity);

      return (
        <option key={entityId} value={entityId}>
          {getEntityName(type, entity)}
        </option>
      );
    });
  };

  // ================= LOADING =================

  if (loading) {
    return (
      <div className="relationship-add-page">
        <div className="relationship-add-card">
          <div className="relationship-page-loading">
            Loading relationship data...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relationship-add-page">
      {/* ================= HEADER ================= */}

      <div className="relationship-add-header">
        <div>
          <h2>
            <FaProjectDiagram /> Add Relationship
          </h2>

          <p>Create a connection between employees, projects and documents.</p>
        </div>
      </div>

      {/* ================= ERROR ================= */}

      {errorMessage && (
        <div className="relationship-error">
          <p>{errorMessage}</p>

          <button type="button" onClick={fetchEntities}>
            Try Again
          </button>
        </div>
      )}

      {/* ================= FORM CARD ================= */}

      <div className="relationship-add-card">
        <form className="relationship-add-form" onSubmit={handleSubmit}>
          {/* ================= SOURCE TYPE ================= */}

          <div className="form-group">
            <label>
              Source Type
              <span className="required-star">*</span>
            </label>

            <select
              name="sourceType"
              value={relationshipData.sourceType}
              onChange={handleSourceTypeChange}
              disabled={submitting}
            >
              <option value="Employee">Employee</option>

              <option value="Project">Project</option>

              <option value="Document">Document</option>
            </select>
          </div>

          {/* ================= SOURCE ================= */}

          <div className="form-group">
            <label>
              Select Source
              <span className="required-star">*</span>
            </label>

            <select
              name="sourceId"
              value={relationshipData.sourceId}
              onChange={handleChange}
              disabled={submitting}
              required
            >
              <option value="">Select Source</option>

              {renderEntityOptions(relationshipData.sourceType)}
            </select>
          </div>

          {/* ================= RELATIONSHIP TYPE ================= */}

          <div className="form-group">
            <label>
              Relationship Type
              <span className="required-star">*</span>
            </label>

            <input
              type="text"
              name="relationshipType"
              placeholder="Example: Works On"
              value={relationshipData.relationshipType}
              onChange={handleChange}
              disabled={submitting}
              required
            />
          </div>

          {/* ================= TARGET TYPE ================= */}

          <div className="form-group">
            <label>
              Target Type
              <span className="required-star">*</span>
            </label>

            <select
              name="targetType"
              value={relationshipData.targetType}
              onChange={handleTargetTypeChange}
              disabled={submitting}
            >
              <option value="Employee">Employee</option>

              <option value="Project">Project</option>

              <option value="Document">Document</option>
            </select>
          </div>

          {/* ================= TARGET ================= */}

          <div className="form-group">
            <label>
              Select Target
              <span className="required-star">*</span>
            </label>

            <select
              name="targetId"
              value={relationshipData.targetId}
              onChange={handleChange}
              disabled={submitting}
              required
            >
              <option value="">Select Target</option>

              {renderEntityOptions(relationshipData.targetType)}
            </select>
          </div>

          {/* ================= DESCRIPTION ================= */}

          <div className="form-group full-width">
            <label>Description</label>

            <textarea
              name="description"
              placeholder="Enter relationship description (optional)"
              value={relationshipData.description}
              onChange={handleChange}
              disabled={submitting}
              rows="5"
            />
          </div>

          {/* ================= BUTTONS ================= */}

          <div className="relationship-form-buttons">
            <button
              type="button"
              className="relationship-cancel-btn"
              onClick={handleCancel}
              disabled={submitting}
            >
              <FaTimes />
              Cancel
            </button>

            <button
              type="submit"
              className="relationship-save-btn"
              disabled={submitting}
            >
              <FaSave />

              {submitting ? "Adding..." : "Add Relationship"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddRelationship;
