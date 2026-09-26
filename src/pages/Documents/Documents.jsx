import "./Documents.css";import Navbar from "../../components/Navbar/Navbar";


import { useEffect, useState } from "react";

import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaTimes,
  FaFileAlt,
  FaDownload,
} from "react-icons/fa";

import axios from "axios";

import API_URL from "../../config/api";

function Documents() {
  // ================= API =================

  const DOCUMENT_API_URL = `${API_URL}/api/documents`;

  // ================= STATES =================

  const [documents, setDocuments] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  // ================= ADD MODAL =================

  const [showModal, setShowModal] = useState(false);

  // ================= EDIT MODAL =================

  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedDocument, setSelectedDocument] = useState(null);

  // ================= NEW DOCUMENT =================

  const [newDocument, setNewDocument] = useState({
    title: "",
    description: "",
    category: "",
    department: "",
    status: "Active",
    file: null,
  });

  // ================= EDIT DOCUMENT =================

  const [editData, setEditData] = useState({
    title: "",
    description: "",
    category: "",
    department: "",
    status: "Active",
    file: null,
  });

  // =================================================
  // GET AUTH HEADERS
  // =================================================

  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  };

  // =================================================
  // GET DOCUMENT ID
  // =================================================

  const getDocumentId = (document) => {
    return document?._id || document?.id;
  };

  // =================================================
  // FETCH DOCUMENTS
  // =================================================

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await axios.get(DOCUMENT_API_URL, getAuthConfig());

      const documentData = Array.isArray(response.data)
        ? response.data
        : response.data?.documents || [];

      setDocuments(documentData);
    } catch (error) {
      console.error("Error fetching documents:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");

        setErrorMessage("Your session has expired. Please login again.");

        return;
      }

      setErrorMessage(
        error.response?.data?.message || "Failed to fetch documents.",
      );

      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // =================================================
  // LOAD DOCUMENTS
  // =================================================

  useEffect(() => {
    fetchDocuments();
  }, []);

  // =================================================
  // ADD FORM CHANGE
  // =================================================

  const handleDocumentChange = (e) => {
    const { name, value } = e.target;

    setNewDocument((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // =================================================
  // ADD FILE CHANGE
  // =================================================

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;

    setNewDocument((previousData) => ({
      ...previousData,
      file,
    }));
  };

  // =================================================
  // EDIT FORM CHANGE
  // =================================================

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // =================================================
  // EDIT FILE CHANGE
  // =================================================

  const handleEditFileChange = (e) => {
    const file = e.target.files?.[0] || null;

    setEditData((previousData) => ({
      ...previousData,
      file,
    }));
  };

  // =================================================
  // RESET ADD FORM
  // =================================================

  const resetAddForm = () => {
    setNewDocument({
      title: "",
      description: "",
      category: "",
      department: "",
      status: "Active",
      file: null,
    });
  };

  // =================================================
  // CLOSE ADD MODAL
  // =================================================

  const closeAddModal = () => {
    if (submitting) {
      return;
    }

    setShowModal(false);

    resetAddForm();
  };

  // =================================================
  // CLOSE EDIT MODAL
  // =================================================

  const closeEditModal = () => {
    if (submitting) {
      return;
    }

    setShowEditModal(false);

    setSelectedDocument(null);

    setEditData({
      title: "",
      description: "",
      category: "",
      department: "",
      status: "Active",
      file: null,
    });
  };

  // =================================================
  // DOWNLOAD DOCUMENT
  // =================================================

  const handleDownloadDocument = async (document) => {
    const documentId = getDocumentId(document);

    if (!documentId) {
      alert("Document ID not found.");

      return;
    }

    try {
      const response = await axios.get(
        `${DOCUMENT_API_URL}/${documentId}/download`,
        {
          ...getAuthConfig(),
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data]);

      const downloadUrl = window.URL.createObjectURL(blob);

      const link = window.document.createElement("a");

      link.href = downloadUrl;

      link.download =
        document.originalFileName || document.fileName || "document";

      window.document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Document download error:", error);

      if (error.response?.status === 401) {
        alert("Your session has expired. Please login again.");

        localStorage.removeItem("token");

        return;
      }

      alert(error.response?.data?.message || "Failed to download document.");
    }
  };

  // =================================================
  // ADD DOCUMENT
  // =================================================

  const handleAddDocument = async (e) => {
    e.preventDefault();

    if (!newDocument.file) {
      alert("Please select a document file.");

      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("title", newDocument.title);

      formData.append("description", newDocument.description);

      formData.append("category", newDocument.category);

      formData.append("department", newDocument.department);

      formData.append("status", newDocument.status);

      formData.append("file", newDocument.file);

      const response = await axios.post(
        DOCUMENT_API_URL,
        formData,
        getAuthConfig(),
      );

      const createdDocument = response.data?.document || response.data;

      setDocuments((previousDocuments) => [
        createdDocument,
        ...previousDocuments,
      ]);

      alert(response.data?.message || "Document added successfully.");

      setShowModal(false);

      resetAddForm();
    } catch (error) {
      console.error("Error adding document:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");

        alert("Your session has expired. Please login again.");

        return;
      }

      alert(error.response?.data?.message || "Failed to add document.");
    } finally {
      setSubmitting(false);
    }
  };

  // =================================================
  // OPEN EDIT MODAL
  // =================================================

  const handleEditClick = (document) => {
    setSelectedDocument(document);

    setEditData({
      title: document.title || "",
      description: document.description || "",
      category: document.category || "",
      department: document.department || "",
      status: document.status || "Active",
      file: null,
    });

    setShowEditModal(true);
  };

  // =================================================
  // UPDATE DOCUMENT
  // =================================================

  const handleUpdateDocument = async (e) => {
    e.preventDefault();

    if (!selectedDocument) {
      return;
    }

    const documentId = getDocumentId(selectedDocument);

    if (!documentId) {
      alert("Document ID not found. Please refresh and try again.");

      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("title", editData.title);

      formData.append("description", editData.description);

      formData.append("category", editData.category);

      formData.append("department", editData.department);

      formData.append("status", editData.status);

      if (editData.file) {
        formData.append("file", editData.file);
      }

      const response = await axios.put(
        `${DOCUMENT_API_URL}/${documentId}`,
        formData,
        getAuthConfig(),
      );

      const updatedDocument = response.data?.document || response.data;

      setDocuments((previousDocuments) =>
        previousDocuments.map((document) =>
          getDocumentId(document) === documentId ? updatedDocument : document,
        ),
      );

      alert(response.data?.message || "Document updated successfully.");

      closeEditModal();
    } catch (error) {
      console.error("Error updating document:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");

        alert("Your session has expired. Please login again.");

        return;
      }

      alert(error.response?.data?.message || "Failed to update document.");
    } finally {
      setSubmitting(false);
    }
  };

  // =================================================
  // DELETE DOCUMENT
  // =================================================

  const handleDeleteDocument = async (document) => {
    const documentId = getDocumentId(document);

    if (!documentId) {
      alert("Document ID not found.");

      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${document.title || "this document"}"?`,
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.delete(
        `${DOCUMENT_API_URL}/${documentId}`,
        getAuthConfig(),
      );

      setDocuments((previousDocuments) =>
        previousDocuments.filter(
          (documentItem) => getDocumentId(documentItem) !== documentId,
        ),
      );

      alert(response.data?.message || "Document deleted successfully.");
    } catch (error) {
      console.error("Error deleting document:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");

        alert("Your session has expired. Please login again.");

        return;
      }

      alert(error.response?.data?.message || "Failed to delete document.");
    } finally {
      setSubmitting(false);
    }
  };

  // =================================================
  // SEARCH DOCUMENTS
  // =================================================

  const filteredDocuments = documents.filter((document) => {
    const searchData = `
          ${document.title || ""}
          ${document.description || ""}
          ${document.category || ""}
          ${document.department || ""}
          ${document.fileName || ""}
          ${document.originalFileName || ""}
          ${document.status || ""}
        `.toLowerCase();

    return searchData.includes(search.toLowerCase());
  });

  // =================================================
  // RETURN
  // =================================================

  return (
    <div className="documents-container">
      <Navbar />
      {/* ================= HEADER ================= */}

      <div className="documents-header">
        <div>
          <h2>Document Management</h2>

          <p>Manage enterprise documents and knowledge resources.</p>
        </div>

        <button
          type="button"
          className="upload-btn"
          onClick={() => setShowModal(true)}
          disabled={submitting}
        >
          <FaPlus />
          Add Document
        </button>
      </div>

      {/* ================= SEARCH ================= */}

      <input
        type="text"
        className="search-document"
        placeholder="Search documents..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ================= ERROR ================= */}

      {errorMessage && (
        <div className="document-error">
          <p>{errorMessage}</p>

          <button type="button" onClick={fetchDocuments}>
            Try Again
          </button>
        </div>
      )}

      {/* ================= LOADING ================= */}

      {loading ? (
        <p className="loading-text">Loading documents...</p>
      ) : (
        <div className="documents-table-wrapper">
          <table className="documents-table">
            <thead>
              <tr>
                <th>ID</th>

                <th>Document</th>

                <th>Category</th>

                <th>Department</th>

                <th>File</th>

                <th>Status</th>

                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map((document, index) => {
                  const documentId = getDocumentId(document);

                  const displayFileName =
                    document.originalFileName ||
                    document.fileName ||
                    "Document";

                  return (
                    <tr key={documentId || index}>
                      <td>{index + 1}</td>

                      {/* DOCUMENT */}

                      <td>
                        <div className="document-title">
                          <FaFileAlt />

                          <div>
                            <strong>
                              {document.title || "Untitled Document"}
                            </strong>

                            <p>{document.description || "No description"}</p>
                          </div>
                        </div>
                      </td>

                      {/* CATEGORY */}

                      <td>{document.category || "Not available"}</td>

                      {/* DEPARTMENT */}

                      <td>{document.department || "Not available"}</td>

                      {/* FILE */}

                      <td>
                        {documentId ? (
                          <button
                            type="button"
                            className="document-link"
                            onClick={() => handleDownloadDocument(document)}
                            disabled={submitting}
                          >
                            <FaDownload /> {displayFileName}
                          </button>
                        ) : (
                          displayFileName
                        )}
                      </td>

                      {/* STATUS */}

                      <td>
                        <span
                          className={`document-status ${(
                            document.status || "Active"
                          )
                            .replace(/\s/g, "")
                            .toLowerCase()}`}
                        >
                          {document.status || "Active"}
                        </span>
                      </td>

                      {/* ACTIONS */}

                      <td>
                        <button
                          type="button"
                          className="edit-btn"
                          title="Edit Document"
                          disabled={submitting}
                          onClick={() => handleEditClick(document)}
                        >
                          <FaEdit />
                        </button>

                        <button
                          type="button"
                          className="document-delete-btn"
                          title="Delete Document"
                          disabled={submitting}
                          onClick={() => handleDeleteDocument(document)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="no-data">
                    {search
                      ? "No matching documents found."
                      : "No documents found."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* =====================================================
          ADD DOCUMENT MODAL
      ===================================================== */}

      {showModal && (
        <div className="document-modal-overlay">
          <div className="document-modal">
            <div className="document-modal-header">
              <h3>Add New Document</h3>

              <button
                type="button"
                className="document-close-btn"
                onClick={closeAddModal}
                disabled={submitting}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleAddDocument}>
              {/* TITLE */}

              <div className="form-group">
                <label>Document Title</label>

                <input
                  type="text"
                  name="title"
                  placeholder="Enter document title"
                  value={newDocument.title}
                  onChange={handleDocumentChange}
                  disabled={submitting}
                  required
                />
              </div>

              {/* DESCRIPTION */}

              <div className="form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  placeholder="Enter document description"
                  value={newDocument.description}
                  onChange={handleDocumentChange}
                  disabled={submitting}
                  required
                />
              </div>

              {/* CATEGORY */}

              <div className="form-group">
                <label>Category</label>

                <input
                  type="text"
                  name="category"
                  placeholder="Example: Policy, Technical, HR"
                  value={newDocument.category}
                  onChange={handleDocumentChange}
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
                  value={newDocument.department}
                  onChange={handleDocumentChange}
                  disabled={submitting}
                  required
                />
              </div>

              {/* FILE */}

              <div className="form-group">
                <label>Upload Document</label>

                <input
                  type="file"
                  name="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileChange}
                  disabled={submitting}
                  required
                />

                {newDocument.file && (
                  <p className="selected-file-name">
                    Selected: {newDocument.file.name}
                  </p>
                )}
              </div>

              {/* STATUS */}

              <div className="form-group">
                <label>Status</label>

                <select
                  name="status"
                  value={newDocument.status}
                  onChange={handleDocumentChange}
                  disabled={submitting}
                >
                  <option value="Active">Active</option>

                  <option value="Archived">Archived</option>
                </select>
              </div>

              {/* BUTTONS */}

              <div className="document-modal-buttons">
                <button
                  type="button"
                  className="document-cancel-btn"
                  onClick={closeAddModal}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="document-save-btn"
                  disabled={submitting}
                >
                  {submitting ? "Uploading..." : "Add Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =====================================================
          EDIT DOCUMENT MODAL
      ===================================================== */}

      {showEditModal && selectedDocument && (
        <div className="document-modal-overlay">
          <div className="document-modal">
            <div className="document-modal-header">
              <h3>Edit Document</h3>

              <button
                type="button"
                className="document-close-btn"
                onClick={closeEditModal}
                disabled={submitting}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleUpdateDocument}>
              {/* TITLE */}

              <div className="form-group">
                <label>Document Title</label>

                <input
                  type="text"
                  name="title"
                  value={editData.title}
                  onChange={handleEditChange}
                  disabled={submitting}
                  required
                />
              </div>

              {/* DESCRIPTION */}

              <div className="form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  value={editData.description}
                  onChange={handleEditChange}
                  disabled={submitting}
                  required
                />
              </div>

              {/* CATEGORY */}

              <div className="form-group">
                <label>Category</label>

                <input
                  type="text"
                  name="category"
                  value={editData.category}
                  onChange={handleEditChange}
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
                  value={editData.department}
                  onChange={handleEditChange}
                  disabled={submitting}
                  required
                />
              </div>

              {/* CURRENT FILE */}

              <div className="form-group">
                <label>Current File</label>

                {selectedDocument._id ? (
                  <button
                    type="button"
                    className="document-link"
                    onClick={() => handleDownloadDocument(selectedDocument)}
                    disabled={submitting}
                  >
                    <FaDownload />{" "}
                    {selectedDocument.originalFileName ||
                      selectedDocument.fileName ||
                      "Open Current File"}
                  </button>
                ) : (
                  <p>No file uploaded</p>
                )}
              </div>

              {/* REPLACE FILE */}

              <div className="form-group">
                <label>
                  Replace File
                  <span> (Optional)</span>
                </label>

                <input
                  type="file"
                  name="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleEditFileChange}
                  disabled={submitting}
                />

                {editData.file && (
                  <p className="selected-file-name">
                    New file: {editData.file.name}
                  </p>
                )}
              </div>

              {/* STATUS */}

              <div className="form-group">
                <label>Status</label>

                <select
                  name="status"
                  value={editData.status}
                  onChange={handleEditChange}
                  disabled={submitting}
                >
                  <option value="Active">Active</option>

                  <option value="Archived">Archived</option>
                </select>
              </div>

              {/* BUTTONS */}

              <div className="document-modal-buttons">
                <button
                  type="button"
                  className="document-cancel-btn"
                  onClick={closeEditModal}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="document-save-btn"
                  disabled={submitting}
                >
                  {submitting ? "Updating..." : "Update Document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Documents;
