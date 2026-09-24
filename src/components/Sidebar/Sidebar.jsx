import "./Sidebar.css";

import { useEffect } from "react";

import {
  FaHome,
  FaUsers,
  FaProjectDiagram,
  FaFileAlt,
  FaSitemap,
  FaRobot,
  FaChartBar,
  FaCog,
  FaSignOutAlt,
  FaLink,
  FaHistory,
  FaTimes,
} from "react-icons/fa";

import { Link, useNavigate, useLocation } from "react-router-dom";

function Sidebar({ sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  /* =====================================================
     GET LOGGED-IN USER
  ===================================================== */

  const storedUser = localStorage.getItem("user");

  let user = null;

  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Invalid user data:", error);

    localStorage.removeItem("user");
    localStorage.removeItem("token");

    user = null;
  }

  /* =====================================================
     GET USER ROLE
  ===================================================== */

  const rawRole = user?.role || "Employee";

  const userRole =
    rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();

  /* =====================================================
     CLOSE SIDEBAR
  ===================================================== */

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  /* =====================================================
     MOBILE NAVIGATION
  ===================================================== */

  const handleNavigation = () => {
    if (window.innerWidth <= 768) {
      closeSidebar();
    }
  };

  /* =====================================================
     ESCAPE KEY
  ===================================================== */

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && sidebarOpen) {
        closeSidebar();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [sidebarOpen]);

  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setSidebarOpen(false);

    navigate("/", {
      replace: true,
    });
  };

  /* =====================================================
     ACTIVE LINK
  ===================================================== */

  const isActive = (path) => {
    return location.pathname === path;
  };

  /* =====================================================
     ROLE ACCESS
  ===================================================== */

  const hasAccess = (allowedRoles) => {
    return allowedRoles.includes(userRole);
  };

  /* =====================================================
     RENDER
  ===================================================== */

  return (
    <>
      {/* =================================================
          SIDEBAR OVERLAY
          Mobile only
      ================================================= */}

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <aside
        className={`sidebar ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        {/* =================================================
            CLOSE BUTTON
        ================================================= */}

        <button
          type="button"
          className="sidebar-close-button"
          onClick={closeSidebar}
          aria-label="Close sidebar"
          title="Close sidebar"
        >
          <FaTimes />
        </button>

        {/* =================================================
            LOGO
        ================================================= */}

        <div className="logo">
          <h1>EKMS</h1>
          <p>Enterprise AI</p>
        </div>

        {/* =================================================
            USER INFORMATION
        ================================================= */}

        {user && (
          <div className="sidebar-user">
            <h4>{user.username || user.name || "User"}</h4>

            <p>{userRole}</p>
          </div>
        )}

        {/* =================================================
            NAVIGATION
        ================================================= */}

        <ul>
          {/* ================= DASHBOARD ================= */}

          <li>
            <Link
              to="/dashboard"
              className={isActive("/dashboard") ? "active" : ""}
              onClick={handleNavigation}
            >
              <FaHome />
              <span>Dashboard</span>
            </Link>
          </li>

          {/* ================= EMPLOYEES ================= */}

          {hasAccess(["Admin", "Manager", "Employee"]) && (
            <li>
              <Link
                to="/employees"
                className={isActive("/employees") ? "active" : ""}
                onClick={handleNavigation}
              >
                <FaUsers />
                <span>Employees</span>
              </Link>
            </li>
          )}

          {/* ================= PROJECTS ================= */}

          <li>
            <Link
              to="/projects"
              className={isActive("/projects") ? "active" : ""}
              onClick={handleNavigation}
            >
              <FaProjectDiagram />
              <span>Projects</span>
            </Link>
          </li>

          {/* ================= DOCUMENTS ================= */}

          <li>
            <Link
              to="/documents"
              className={isActive("/documents") ? "active" : ""}
              onClick={handleNavigation}
            >
              <FaFileAlt />
              <span>Documents</span>
            </Link>
          </li>

          {/* ================= RELATIONSHIPS ================= */}

          {hasAccess(["Admin", "Manager", "Employee"]) && (
            <li>
              <Link
                to="/relationships"
                className={isActive("/relationships") ? "active" : ""}
                onClick={handleNavigation}
              >
                <FaLink />
                <span>Relationships</span>
              </Link>
            </li>
          )}

          {/* ================= KNOWLEDGE GRAPH ================= */}

          <li>
            <Link
              to="/knowledgegraph"
              className={isActive("/knowledgegraph") ? "active" : ""}
              onClick={handleNavigation}
            >
              <FaSitemap />
              <span>Knowledge Graph</span>
            </Link>
          </li>

          {/* ================= AI ASSISTANT ================= */}

          <li>
            <Link
              to="/aiassistant"
              className={isActive("/aiassistant") ? "active" : ""}
              onClick={handleNavigation}
            >
              <FaRobot />
              <span>AI Assistant</span>
            </Link>
          </li>

          {/* ================= CHAT HISTORY ================= */}

          <li>
            <Link
              to="/chathistory"
              className={isActive("/chathistory") ? "active" : ""}
              onClick={handleNavigation}
            >
              <FaHistory />
              <span>Chat History</span>
            </Link>
          </li>

          {/* ================= REPORTS ================= */}

          {hasAccess(["Admin", "Manager"]) && (
            <li>
              <Link
                to="/reports"
                className={isActive("/reports") ? "active" : ""}
                onClick={handleNavigation}
              >
                <FaChartBar />
                <span>Reports</span>
              </Link>
            </li>
          )}

          {/* ================= SETTINGS ================= */}

          <li>
            <Link
              to="/settings"
              className={isActive("/settings") ? "active" : ""}
              onClick={handleNavigation}
            >
              <FaCog />
              <span>Settings</span>
            </Link>
          </li>
        </ul>

        {/* =================================================
            LOGOUT
        ================================================= */}

        <div className="logout">
          <button type="button" onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
