import "./Navbar.css";
import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import API_URL from "../../config/api";
import {
  FaBell,
  FaSearch,
  FaUserCircle, FaSignOutAlt,
  FaBars,
  FaTimes,
  FaProjectDiagram,
  FaUsers,
  FaFileAlt,
  FaSitemap,
  FaNetworkWired,
  FaRobot,
  FaChartBar,
  FaHistory,
  FaCog,
  FaInfoCircle,
  FaQuestionCircle,
  FaEnvelope,
  FaLifeRing
} from "react-icons/fa";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const username = user?.username || user?.name || "User";

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHamburger, setShowHamburger] = useState(false);

  const notificationsRef = useRef(null);
  const hamburgerMenuRef = useRef(null);
  const hamburgerBtnRef = useRef(null);

  const [notifications, setNotifications] = useState([
    { id: 1, text: "New document added: Q3 Report", time: "10m ago", read: false },
    { id: 2, text: "Project Alpha status updated", time: "1h ago", read: false },
    { id: 3, text: "Employee profile updated", time: "2h ago", read: true },
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      
      if (showHamburger) {
        if (hamburgerMenuRef.current && !hamburgerMenuRef.current.contains(event.target) &&
            hamburgerBtnRef.current && !hamburgerBtnRef.current.contains(event.target)) {
          setShowHamburger(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showHamburger]);

  // Close hamburger on escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowHamburger(false);
        setShowNotifications(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const fetchSearchResults = async () => {
    const query = searchTerm.trim();
    if (!query) {
      setSearchResults([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const [employeesResponse, projectsResponse, documentsResponse] = await Promise.all([
        axios.get(`${API_URL}/api/employees`),
        axios.get(`${API_URL}/api/projects`),
        axios.get(`${API_URL}/api/documents`),
      ]);

      const employees = Array.isArray(employeesResponse.data) ? employeesResponse.data : employeesResponse.data?.employees || [];
      const projects = Array.isArray(projectsResponse.data) ? projectsResponse.data : projectsResponse.data?.projects || [];
      const documents = Array.isArray(documentsResponse.data) ? documentsResponse.data : documentsResponse.data?.documents || [];

      const lowerQuery = query.toLowerCase();

      const employeeResults = employees.filter((employee) => {
        const name = employee.name || employee.fullName || "";
        const email = employee.email || "";
        const department = employee.department || "";
        const role = employee.role || employee.designation || "";
        return name.toLowerCase().includes(lowerQuery) || email.toLowerCase().includes(lowerQuery) || department.toLowerCase().includes(lowerQuery) || role.toLowerCase().includes(lowerQuery);
      }).slice(0, 3).map((employee) => ({
        id: employee._id || employee.id,
        title: employee.name || employee.fullName || "Employee",
        subtitle: employee.department || employee.email || employee.role || "Employee",
        type: "Employee", icon: "employee", path: "/employees",
      }));

      const projectResults = projects.filter((project) => {
        const projectName = project.projectName || project.name || project.title || "";
        const projectDescription = project.description || "";
        return projectName.toLowerCase().includes(lowerQuery) || projectDescription.toLowerCase().includes(lowerQuery);
      }).slice(0, 3).map((project) => ({
        id: project._id || project.id,
        title: project.projectName || project.name || project.title || "Project",
        subtitle: project.description || "Project",
        type: "Project", icon: "project", path: "/projects",
      }));

      const documentResults = documents.filter((document) => {
        const title = document.title || document.name || document.originalFileName || "";
        const category = document.category || document.type || "";
        return title.toLowerCase().includes(lowerQuery) || category.toLowerCase().includes(lowerQuery);
      }).slice(0, 3).map((document) => ({
        id: document._id || document.id,
        title: document.title || document.name || document.originalFileName || "Document",
        subtitle: document.category || document.type || "Document",
        type: "Document", icon: "document", path: "/documents",
      }));

      setSearchResults([...employeeResults, ...projectResults, ...documentResults]);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchSearchResults();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleResultClick = (result) => {
    setSearchTerm("");
    setSearchResults([]);
    navigate(result.path);
  };

  const renderResultIcon = (iconType) => {
    switch (iconType) {
      case "employee": return <FaUsers />;
      case "project": return <FaProjectDiagram />;
      case "document": return <FaFileAlt />;
      default: return <FaSearch />;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const navigateTo = (path) => {
    navigate(path);
    setShowHamburger(false);
  };

  return (
    <div className="navbar">
      
      {/* ================= LEFT ================= */}
      <div className="navbar-left">
        <button 
          className="hamburger-btn" 
          onClick={() => setShowHamburger(!showHamburger)}
          ref={hamburgerBtnRef}
          aria-label="Menu"
        >
          {showHamburger ? <FaTimes /> : <FaBars />}
        </button>

        <div className="app-logo" onClick={() => navigateTo("/dashboard")}>
          <div className="app-logo-mark">K</div>
          <div className="app-logo-text-group">
            <div className="app-logo-text">KnowSphere</div>
            <div className="app-logo-sub">Intelligent Enterprise Knowledge Platform</div>
          </div>
        </div>
      </div>

      {/* ================= HAMBURGER MENU ================= */}
      {showHamburger && (
        <div className="hamburger-menu" ref={hamburgerMenuRef}>
          
          <div className="hamburger-section">
            <h4 className="hamburger-section-title">MAIN</h4>
            <div className={`hamburger-item ${location.pathname === "/dashboard" ? "active" : ""}`} onClick={() => navigateTo("/dashboard")}>
              <FaChartBar className="hamburger-icon" /> Dashboard
            </div>
            <div className={`hamburger-item ${location.pathname === "/employees" ? "active" : ""}`} onClick={() => navigateTo("/employees")}>
              <FaUsers className="hamburger-icon" /> Employees
            </div>
            <div className={`hamburger-item ${location.pathname === "/projects" ? "active" : ""}`} onClick={() => navigateTo("/projects")}>
              <FaProjectDiagram className="hamburger-icon" /> Projects
            </div>
            <div className={`hamburger-item ${location.pathname === "/documents" ? "active" : ""}`} onClick={() => navigateTo("/documents")}>
              <FaFileAlt className="hamburger-icon" /> Documents
            </div>
            <div className={`hamburger-item ${location.pathname === "/relationships" ? "active" : ""}`} onClick={() => navigateTo("/relationships")}>
              <FaSitemap className="hamburger-icon" /> Relationships
            </div>
            <div className={`hamburger-item ${location.pathname === "/knowledgegraph" ? "active" : ""}`} onClick={() => navigateTo("/knowledgegraph")}>
              <FaNetworkWired className="hamburger-icon" /> Knowledge Graph
            </div>
            <div className={`hamburger-item ${location.pathname === "/aiassistant" ? "active" : ""}`} onClick={() => navigateTo("/aiassistant")}>
              <FaRobot className="hamburger-icon" /> AI Assistant
            </div>
            <div className={`hamburger-item ${location.pathname === "/reports" ? "active" : ""}`} onClick={() => navigateTo("/reports")}>
              <FaChartBar className="hamburger-icon" /> Reports
            </div>
            <div className={`hamburger-item ${location.pathname === "/chathistory" ? "active" : ""}`} onClick={() => navigateTo("/chathistory")}>
              <FaHistory className="hamburger-icon" /> Chat History
            </div>
          </div>

          <div className="hamburger-section">
            <h4 className="hamburger-section-title">ACCOUNT</h4>
            <div className={`hamburger-item ${location.pathname === "/profile" ? "active" : ""}`} onClick={() => navigateTo("/profile")}>
              <FaUserCircle className="hamburger-icon" /> Profile
            </div>
            <div className={`hamburger-item ${location.pathname === "/settings" ? "active" : ""}`} onClick={() => navigateTo("/settings")}>
              <FaCog className="hamburger-icon" /> Settings
            </div>
          </div>

          <div className="hamburger-section">
            <h4 className="hamburger-section-title">INFORMATION</h4>
            <div className={`hamburger-item ${location.pathname === "/about" ? "active" : ""}`} onClick={() => navigateTo("/about")}>
              <FaInfoCircle className="hamburger-icon" /> About
            </div>
            <div className={`hamburger-item ${location.pathname === "/help" ? "active" : ""}`} onClick={() => navigateTo("/help")}>
              <FaQuestionCircle className="hamburger-icon" /> Help
            </div>
            <div className={`hamburger-item ${location.pathname === "/support" ? "active" : ""}`} onClick={() => navigateTo("/support")}>
              <FaLifeRing className="hamburger-icon" /> Support
            </div>
            <div className={`hamburger-item ${location.pathname === "/contact" ? "active" : ""}`} onClick={() => navigateTo("/contact")}>
              <FaEnvelope className="hamburger-icon" /> Contact
            </div>
          </div>
          
        </div>
      )}

      {/* ================= CENTER SEARCH ================= */}
      <div className="navbar-center-search">
        <div className="search-wrapper">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {searchTerm.trim() && (
            <div className="search-results">
              {loading ? (
                <div className="search-empty">Searching...</div>
              ) : searchResults.length > 0 ? (
                searchResults.map((result) => (
                  <div key={`${result.type}-${result.id}`} className="search-result-item" onClick={() => handleResultClick(result)}>
                    <div className="search-result-icon">{renderResultIcon(result.icon)}</div>
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
        
        <div className="notification-wrapper" ref={notificationsRef}>
          <div className="bell-container" onClick={() => setShowNotifications(!showNotifications)}>
            <FaBell className="bell" />
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </div>

          {showNotifications && (
            <div className="notification-popover">
              <div className="notification-header">
                <h3>Notifications</h3>
                <button onClick={handleMarkAllAsRead}>Mark all read</button>
              </div>
              <div className="notification-list">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`}>
                      <div className="notification-dot"></div>
                      <div className="notification-content">
                        <p>{notif.text}</p>
                        <span>{notif.time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="notification-empty">No new notifications</div>
                )}
              </div>
            </div>
          )}
        </div>

        
        <div className="profile" onClick={() => navigateTo("/profile")} title="Profile">
          <FaUserCircle className="user-icon" />
        </div>
        <div className="logout-btn" onClick={handleLogout} title="Logout">
          <FaSignOutAlt className="logout-icon" />
        </div>

        
      </div>
    </div>
  );
}

export default Navbar;
