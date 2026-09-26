import "./Employees.css";import Navbar from "../../components/Navbar/Navbar";


import { useEffect, useState } from "react";

import {
  FaUserPlus,
  FaEdit,
  FaTrash,
  FaTimes,
} from "react-icons/fa";

import axios from "axios";

import API_URL from "../../config/api";

import { useSearchParams } from "react-router-dom";

function Employees() {
  // ================= API =================

  const EMPLOYEE_API_URL = `${API_URL}/api/employees`;

  // ================= URL SEARCH PARAM =================

  const [searchParams, setSearchParams] = useSearchParams();

  const highlightId = searchParams.get("highlight");

  // ================= STATE =================

  const [employees, setEmployees] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  // ================= ADD MODAL =================

  const [showModal, setShowModal] = useState(false);

  // ================= EDIT MODAL =================

  const [showEditModal, setShowEditModal] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // ================= NEW EMPLOYEE =================

  const [newEmployee, setNewEmployee] = useState({
    name: "",
    email: "",
    department: "",
    role: "",
  });

  // ================= EDIT EMPLOYEE =================

  const [editData, setEditData] = useState({
    name: "",
    email: "",
    department: "",
    role: "",
  });

  // ================= AUTH CONFIG =================

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

  // ================= GET EMPLOYEE ID =================

  const getEmployeeId = (employee) => {
    return employee?._id || employee?.id || null;
  };

  // ================= FETCH EMPLOYEES =================

 const fetchEmployees = async () => {
   try {
     setLoading(true);
     setErrorMessage("");

     const response = await axios.get(EMPLOYEE_API_URL, getAuthConfig());

     let employeeData = [];

     if (Array.isArray(response.data?.employees)) {
       employeeData = response.data.employees;
     } else if (Array.isArray(response.data)) {
       employeeData = response.data;
     } else if (Array.isArray(response.data?.data)) {
       employeeData = response.data.data;
     }

     setEmployees(employeeData);
   } catch (error) {
     console.error(
       "Error fetching employees:",
       error.response?.data || error.message,
     );

     setErrorMessage(
       error.response?.data?.message || "Failed to fetch employees.",
     );

     setEmployees([]);
   } finally {
     setLoading(false);
   }
 };

  // ================= LOAD EMPLOYEES =================

  useEffect(() => {
    fetchEmployees();
  }, []);

  // ================= HIGHLIGHT SEARCH RESULT =================

  useEffect(() => {
    if (!highlightId || employees.length === 0) {
      return;
    }

    const employeeExists = employees.some(
      (employee) =>
        String(getEmployeeId(employee)) ===
        String(highlightId),
    );

    if (!employeeExists) {
      return;
    }

    // Scroll to highlighted employee row
    setTimeout(() => {
      const element = document.getElementById(
        `employee-${highlightId}`,
      );

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 300);

    // Remove highlight parameter after a short delay
    const timer = setTimeout(() => {
      setSearchParams({});
    }, 2500);

    return () => {
      clearTimeout(timer);
    };
  }, [highlightId, employees, setSearchParams]);

  // ================= ADD INPUT =================

  const handleEmployeeChange = (e) => {
    const { name, value } = e.target;

    setNewEmployee((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // ================= EDIT INPUT =================

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // ================= RESET ADD FORM =================

  const resetAddForm = () => {
    setNewEmployee({
      name: "",
      email: "",
      department: "",
      role: "",
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
    setSelectedEmployee(null);

    setEditData({
      name: "",
      email: "",
      department: "",
      role: "",
    });
  };

  // ================= ADD EMPLOYEE =================

  const handleAddEmployee = async (e) => {
    e.preventDefault();

    if (
      !newEmployee.name.trim() ||
      !newEmployee.email.trim() ||
      !newEmployee.department.trim() ||
      !newEmployee.role.trim()
    ) {
      alert("All fields are required.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.post(
        EMPLOYEE_API_URL,
        {
          name: newEmployee.name.trim(),
          email: newEmployee.email.trim(),
          department: newEmployee.department.trim(),
          role: newEmployee.role.trim(),
        },
        getAuthConfig(),
      );

      alert(
        response.data?.message ||
          "Employee added successfully.",
      );

      setShowModal(false);

      resetAddForm();

      await fetchEmployees();
    } catch (error) {
      console.error(
        "Error adding employee:",
        error.response?.data || error.message,
      );

      alert(
        error.response?.data?.message ||
          "Failed to add employee.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ================= OPEN EDIT MODAL =================

  const handleEditClick = (employee) => {
    setSelectedEmployee(employee);

    setEditData({
      name: employee.name || "",
      email: employee.email || "",
      department: employee.department || "",
      role: employee.role || "",
    });

    setShowEditModal(true);
  };

  // ================= UPDATE EMPLOYEE =================

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();

    if (!selectedEmployee) {
      return;
    }

    const employeeId = getEmployeeId(selectedEmployee);

    if (!employeeId) {
      alert(
        "Employee ID not found. Please refresh and try again.",
      );
      return;
    }

    if (
      !editData.name.trim() ||
      !editData.email.trim() ||
      !editData.department.trim() ||
      !editData.role.trim()
    ) {
      alert("All fields are required.");
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.put(
        `${EMPLOYEE_API_URL}/${employeeId}`,
        {
          name: editData.name.trim(),
          email: editData.email.trim(),
          department: editData.department.trim(),
          role: editData.role.trim(),
        },
        getAuthConfig(),
      );

      alert(
        response.data?.message ||
          "Employee updated successfully.",
      );

      setShowEditModal(false);
      setSelectedEmployee(null);

      setEditData({
        name: "",
        email: "",
        department: "",
        role: "",
      });

      await fetchEmployees();
    } catch (error) {
      console.error(
        "Error updating employee:",
        error.response?.data || error.message,
      );

      alert(
        error.response?.data?.message ||
          "Failed to update employee.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ================= DELETE EMPLOYEE =================

  const handleDeleteEmployee = async (employee) => {
    const employeeId = getEmployeeId(employee);

    if (!employeeId) {
      alert("Employee ID not found.");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${
        employee.name || "this employee"
      }?`,
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await axios.delete(
        `${EMPLOYEE_API_URL}/${employeeId}`,
        getAuthConfig(),
      );

      alert(
        response.data?.message ||
          "Employee deleted successfully.",
      );

      await fetchEmployees();
    } catch (error) {
      console.error(
        "Error deleting employee:",
        error.response?.data || error.message,
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete employee.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ================= SEARCH EMPLOYEES =================

  const filteredEmployees = employees.filter(
    (employee) => {
      const searchData = `
        ${employee.name || ""}
        ${employee.email || ""}
        ${employee.department || ""}
        ${employee.role || ""}
      `.toLowerCase();

      return searchData.includes(
        search.trim().toLowerCase(),
      );
    },
  );

  // ================= RETURN =================

  return (
    <div className="employee-container">
      <Navbar />

      {/* ================= HEADER ================= */}

      <div className="employee-header">
        <div>
          <h2>Employee Management</h2>

          <p>
            Manage employees and their enterprise
            information.
          </p>
        </div>

        <button
          type="button"
          className="add-btn"
          onClick={() => setShowModal(true)}
          disabled={submitting}
        >
          <FaUserPlus />
          Add Employee
        </button>
      </div>

      {/* ================= SEARCH ================= */}

      <input
        type="text"
        className="employee-search-box"
        placeholder="Search by name, email, department or role..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* ================= ERROR ================= */}

      {errorMessage && (
        <div className="employee-error">
          <p>{errorMessage}</p>

          <button
            type="button"
            onClick={fetchEmployees}
            disabled={loading}
          >
            Try Again
          </button>
        </div>
      )}

      {/* ================= LOADING ================= */}

      {loading ? (
        <p className="employee-loading">
          Loading employees...
        </p>
      ) : (
        <div className="employee-table-wrapper">

          <table className="employee-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Department</th>
                <th>Role</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredEmployees.length > 0 ? (
                filteredEmployees.map(
                  (employee, index) => {
                    const employeeId =
                      getEmployeeId(employee);

                    const isHighlighted =
                      highlightId &&
                      String(employeeId) ===
                        String(highlightId);

                    return (
                      <tr
                        key={
                          employeeId ||
                          `employee-${index}`
                        }
                        id={
                          employeeId
                            ? `employee-${employeeId}`
                            : undefined
                        }
                        className={
                          isHighlighted
                            ? "employee-highlight"
                            : ""
                        }
                      >

                        <td>
                          {index + 1}
                        </td>

                        <td>
                          {employee.name ||
                            "Not available"}
                        </td>

                        <td>
                          {employee.department ||
                            "Not available"}
                        </td>

                        <td>
                          {employee.role ||
                            "Not available"}
                        </td>

                        <td>
                          {employee.email ||
                            "Not available"}
                        </td>

                        <td>
                          <span className="active">
                            Active
                          </span>
                        </td>

                        <td className="employee-actions">

                          <button
                            type="button"
                            className="edit-btn"
                            title="Edit Employee"
                            disabled={submitting}
                            onClick={() =>
                              handleEditClick(
                                employee,
                              )
                            }
                          >
                            <FaEdit />
                          </button>

                          <button
                            type="button"
                            className="delete-btn"
                            title="Delete Employee"
                            disabled={submitting}
                            onClick={() =>
                              handleDeleteEmployee(
                                employee,
                              )
                            }
                          >
                            <FaTrash />
                          </button>

                        </td>

                      </tr>
                    );
                  },
                )
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="no-employees"
                  >
                    {search
                      ? "No matching employees found."
                      : "No employees found."}
                  </td>
                </tr>
              )}

            </tbody>

          </table>

        </div>
      )}

      {/* ================= ADD EMPLOYEE MODAL ================= */}

      {showModal && (
        <div className="employee-modal-overlay">

          <div className="employee-modal">

            <div className="modal-header">

              <h3>Add New Employee</h3>

              <button
                type="button"
                className="close-btn"
                onClick={closeAddModal}
                disabled={submitting}
              >
                <FaTimes />
              </button>

            </div>

            <form onSubmit={handleAddEmployee}>

              <div className="form-group">
                <label>Employee Name</label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter employee name"
                  value={newEmployee.name}
                  onChange={handleEmployeeChange}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter email address"
                  value={newEmployee.email}
                  onChange={handleEmployeeChange}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="form-group">
                <label>Department</label>

                <input
                  type="text"
                  name="department"
                  placeholder="Enter department"
                  value={newEmployee.department}
                  onChange={handleEmployeeChange}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="form-group">
                <label>Role</label>

                <input
                  type="text"
                  name="role"
                  placeholder="Enter employee role"
                  value={newEmployee.role}
                  onChange={handleEmployeeChange}
                  disabled={submitting}
                  required
                />
              </div>

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
                  {submitting
                    ? "Adding..."
                    : "Add Employee"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* ================= EDIT EMPLOYEE MODAL ================= */}

      {showEditModal && selectedEmployee && (
        <div className="employee-modal-overlay">

          <div className="employee-modal">

            <div className="modal-header">

              <h3>Edit Employee</h3>

              <button
                type="button"
                className="close-btn"
                onClick={closeEditModal}
                disabled={submitting}
              >
                <FaTimes />
              </button>

            </div>

            <form onSubmit={handleUpdateEmployee}>

              <div className="form-group">
                <label>Employee Name</label>

                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleEditChange}
                  disabled={submitting}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>

                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleEditChange}
                  disabled={submitting}
                  required
                />
              </div>

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

              <div className="form-group">
                <label>Role</label>

                <input
                  type="text"
                  name="role"
                  value={editData.role}
                  onChange={handleEditChange}
                  disabled={submitting}
                  required
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
                  {submitting
                    ? "Updating..."
                    : "Update Employee"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Employees;

