import "./Settings.css";
import { useState } from "react";
import axios from "axios";

import Sidebar from "../../components/Sidebar/Sidebar";
import Navbar from "../../components/Navbar/Navbar";
import Footer from "../../components/Footer/Footer";

import {
  FaUser,
  FaEnvelope,
  FaUserTag,
  FaLock,
  FaSave,
  FaCog,
} from "react-icons/fa";

import API_URL from "../../config/api";

function Settings() {
  // ================= USER =================

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // ================= STATE =================

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState("");

  const [loading, setLoading] = useState(false);

  // ================= CHANGE PASSWORD =================

  const handlePasswordChange = async () => {
    setMessage("");
    setMessageType("");

    // ================= VALIDATION =================

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

    // ================= JWT TOKEN =================

    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Authentication token not found. Please login again.");

      setMessageType("error");
      return;
    }

    try {
      setLoading(true);

      // ================= BACKEND API =================

      const response = await axios.put(
        `${API_URL}/api/users/change-password`,
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      // ================= SUCCESS =================

      setMessage(response.data.message || "Password changed successfully.");

      setMessageType("success");

      // ================= CLEAR FORM =================

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

  // ================= UI =================

  return (
    <div className="dashboard">
      <Sidebar />

      <div className="main">
        <Navbar />

        <div className="settings-page">
          {/* ================= HEADER ================= */}

          <div className="settings-header">
            <h2>
              <FaCog />
              Settings
            </h2>

            <p>
              Manage your account and Enterprise Knowledge Management System
              settings.
            </p>
          </div>

          {/* ================= USER PROFILE ================= */}

          <div className="settings-card">
            <h3>
              <FaUser />
              User Profile
            </h3>

            <div className="profile-grid">
              {/* USERNAME */}

              <div className="profile-item">
                <FaUser />

                <div>
                  <span>Username</span>

                  <strong>{user?.username || user?.name || "User"}</strong>
                </div>
              </div>

              {/* EMAIL */}

              <div className="profile-item">
                <FaEnvelope />

                <div>
                  <span>Email</span>

                  <strong>{user?.email || "Not available"}</strong>
                </div>
              </div>

              {/* ROLE */}

              <div className="profile-item">
                <FaUserTag />

                <div>
                  <span>Role</span>

                  <strong>{user?.role || "User"}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* ================= CHANGE PASSWORD ================= */}

          <div className="settings-card">
            <h3>
              <FaLock />
              Change Password
            </h3>

            <div className="password-form">
              {/* CURRENT PASSWORD */}

              <input
                type="password"
                placeholder="Current Password"
                value={currentPassword}
                disabled={loading}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />

              {/* NEW PASSWORD */}

              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                disabled={loading}
                onChange={(e) => setNewPassword(e.target.value)}
              />

              {/* CONFIRM PASSWORD */}

              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                disabled={loading}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />

              {/* SAVE BUTTON */}

              <button
                type="button"
                className="save-settings-btn"
                onClick={handlePasswordChange}
                disabled={loading}
              >
                <FaSave />

                {loading ? "Updating..." : "Save Password"}
              </button>

              {/* MESSAGE */}

              {message && (
                <p className={`settings-message ${messageType}`}>{message}</p>
              )}
            </div>
          </div>

          {/* ================= SYSTEM INFORMATION ================= */}

          <div className="settings-card">
            <h3>
              <FaCog />
              System Information
            </h3>

            <div className="system-info">
              <p>
                <strong>System:</strong> Enterprise Knowledge Management System
              </p>

              <p>
                <strong>Version:</strong> 1.0.0
              </p>

              <p>
                <strong>Database:</strong> MongoDB
              </p>

              <p>
                <strong>Backend:</strong> Node.js + Express
              </p>

              <p>
                <strong>Frontend:</strong> React
              </p>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}

export default Settings;
