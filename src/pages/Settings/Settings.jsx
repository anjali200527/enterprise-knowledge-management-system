import "./Settings.css";
import { useState } from "react";
import axios from "axios";

import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import {
  FaUser,
  FaEnvelope,
  FaUserTag,
  FaLock,
  FaSave,
  FaCog,
  FaBell,
  FaDesktop,
  FaPalette,
  FaShieldAlt,
} from "react-icons/fa";

import API_URL from "../../config/api";

function Settings() {
  // ================= USER =================
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const username = user?.username || user?.name || "User";
  const email = user?.email || "Not available";
  const role = user?.role || "User";

  // ================= STATE =================
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // ================= CHANGE PASSWORD =================
  const handlePasswordChange = async () => {
    setMessage("");
    setMessageType("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setMessage("Please fill all password fields.");
      setMessageType("error");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("New password and confirm password do not match.");
      setMessageType("error");
      return;
    }
    if (newPassword.length < 6) {
      setMessage("Password must contain at least 6 characters.");
      setMessageType("error");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setMessage("Authentication token not found. Please login again.");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.put(
        `${API_URL}/api/users/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setMessage(response.data.message || "Password changed successfully.");
      setMessageType("success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      console.error("Change Password Error:", error);
      setMessage(error.response?.data?.message || "Failed to change password.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page-wrapper">
      <Navbar />

      <main className="settings-main-content">
        <div className="settings-container">
          {/* ================= HEADER ================= */}
          <div className="settings-header">
            <h2>Settings</h2>
            <p>Manage your KnowSphere account and application preferences.</p>
          </div>

          {/* ================= ACCOUNT ================= */}
          <section className="settings-section">
            <div className="settings-section-header">
              <FaUser />
              <h3>Account</h3>
            </div>
            
            <div className="settings-card">
              <div className="settings-card-header">
                <h4>Profile Information</h4>
                <p>Your personal account details and role.</p>
              </div>
              
              <div className="profile-grid">
                <div className="profile-item">
                  <div className="profile-icon-wrapper"><FaUser /></div>
                  <div className="profile-details">
                    <span>Name</span>
                    <strong>{username}</strong>
                  </div>
                </div>

                <div className="profile-item">
                  <div className="profile-icon-wrapper"><FaEnvelope /></div>
                  <div className="profile-details">
                    <span>Email</span>
                    <strong>{email}</strong>
                  </div>
                </div>

                <div className="profile-item">
                  <div className="profile-icon-wrapper"><FaUserTag /></div>
                  <div className="profile-details">
                    <span>Role</span>
                    <strong>{role}</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= APPEARANCE ================= */}
          <section className="settings-section">
            <div className="settings-section-header">
              <FaPalette />
              <h3>Appearance</h3>
            </div>
            
            <div className="settings-card">
              <div className="settings-card-header">
                <h4>Theme & Interface</h4>
                <p>Customize how KnowSphere looks on your device.</p>
              </div>

              <div className="settings-toggle-row">
                <div className="toggle-info">
                  <FaDesktop className="toggle-icon" />
                  <div>
                    <strong>Dark Mode</strong>
                    <span>Use a darker theme for low-light environments (Coming soon).</span>
                  </div>
                </div>
                <label className="toggle-switch disabled">
                  <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} disabled />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </section>

          {/* ================= NOTIFICATIONS ================= */}
          <section className="settings-section">
            <div className="settings-section-header">
              <FaBell />
              <h3>Notifications</h3>
            </div>
            
            <div className="settings-card">
              <div className="settings-card-header">
                <h4>Notification Preferences</h4>
                <p>Control what updates you receive.</p>
              </div>

              <div className="settings-toggle-row">
                <div className="toggle-info">
                  <FaBell className="toggle-icon" />
                  <div>
                    <strong>In-App Notifications</strong>
                    <span>Receive alerts for document updates and project changes.</span>
                  </div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={notificationsEnabled} onChange={() => setNotificationsEnabled(!notificationsEnabled)} />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </section>

          {/* ================= SECURITY ================= */}
          <section className="settings-section">
            <div className="settings-section-header">
              <FaShieldAlt />
              <h3>Security</h3>
            </div>
            
            <div className="settings-card">
              <div className="settings-card-header">
                <h4>Account Security</h4>
                <p>Update your password to keep your account secure.</p>
              </div>

              <div className="password-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    value={currentPassword}
                    disabled={loading}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    disabled={loading}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    disabled={loading}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  className="save-settings-btn"
                  onClick={handlePasswordChange}
                  disabled={loading}
                >
                  <FaSave />
                  {loading ? "Updating..." : "Update Password"}
                </button>

                {message && (
                  <div className={`settings-message ${messageType}`}>
                    {message}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ================= APPLICATION ================= */}
          <section className="settings-section">
            <div className="settings-section-header">
              <FaCog />
              <h3>Application Preferences</h3>
            </div>
            
            <div className="settings-card">
              <div className="settings-card-header">
                <h4>System Information</h4>
                <p>Details about your current KnowSphere environment.</p>
              </div>

              <div className="system-info-grid">
                <div className="system-info-item">
                  <span>System</span>
                  <strong>KnowSphere</strong>
                </div>
                <div className="system-info-item">
                  <span>Version</span>
                  <strong>1.0.0</strong>
                </div>
                <div className="system-info-item">
                  <span>Database</span>
                  <strong>MongoDB + Neo4j</strong>
                </div>
                <div className="system-info-item">
                  <span>Backend</span>
                  <strong>Node.js + Express</strong>
                </div>
              </div>
            </div>
          </section>

        </div>
        <Footer />
      </main>
    </div>
  );
}

export default Settings;
