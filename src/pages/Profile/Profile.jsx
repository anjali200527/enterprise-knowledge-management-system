import "./Profile.css";
import {
  FaArrowLeft,
  FaUserCircle,
  FaEnvelope,
  FaUserTag,
  FaShieldAlt,
  FaEdit,
  FaLock,
  FaSignOutAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Profile() {
  const navigate = useNavigate();

  const storedUser = localStorage.getItem("user");

  let user = {};

  try {
    user = storedUser ? JSON.parse(storedUser) : {};
  } catch (error) {
    console.error("Invalid user data:", error);
    user = {};
  }

  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState({
    username: user.username || user.name || "",
    email: user.email || "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");

  const rawRole = user.role || "Employee";

  const role = rawRole.charAt(0).toUpperCase() + rawRole.slice(1).toLowerCase();

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfileData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  };

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPasswordData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
  };

  const handleProfileSave = (event) => {
    event.preventDefault();

    const updatedUser = {
      ...user,
      username: profileData.username,
      name: profileData.username,
      email: profileData.email,
    };

    localStorage.setItem("user", JSON.stringify(updatedUser));

    setIsEditing(false);

    setMessage("Profile information updated successfully.");
  };

  const handlePasswordSubmit = (event) => {
    event.preventDefault();

    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setMessage("Please fill in all password fields.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage("New password and confirm password do not match.");
      return;
    }

    setMessage("Password change request submitted successfully.");

    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/", {
      replace: true,
    });
  };

  return (
    <div className="profile-page">
      {/* HEADER */}
      <header className="profile-header">
        <div>
          <span className="profile-label">MY PROFILE</span>

          <h1>Profile & Account</h1>

          <p>Manage your account information and security settings.</p>
        </div>

        <button
          type="button"
          className="profile-back-button"
          onClick={() => navigate("/dashboard")}
        >
          <FaArrowLeft />
          <span>Back to Dashboard</span>
        </button>
      </header>

      <main className="profile-content">
        {/* PROFILE CARD */}
        <section className="profile-main-card">
          <div className="profile-avatar">
            <FaUserCircle />
          </div>

          <div className="profile-main-info">
            <h2>{profileData.username || "User"}</h2>

            <p>{profileData.email || "No email available"}</p>

            <span className="profile-role-badge">{role}</span>
          </div>
        </section>

        {/* MESSAGE */}
        {message && <div className="profile-message">{message}</div>}

        {/* ACCOUNT INFORMATION */}
        <section className="profile-section">
          <div className="profile-section-heading">
            <div>
              <span className="profile-label">ACCOUNT INFORMATION</span>

              <h2>Personal Details</h2>
            </div>

            <button
              type="button"
              className="profile-edit-button"
              onClick={() => {
                setIsEditing(!isEditing);
                setMessage("");
              }}
            >
              <FaEdit />
              <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
            </button>
          </div>

          <form className="profile-form" onSubmit={handleProfileSave}>
            <div className="profile-form-group">
              <label htmlFor="username">
                <FaUserTag />
                Username
              </label>

              <input
                id="username"
                type="text"
                name="username"
                value={profileData.username}
                onChange={handleProfileChange}
                disabled={!isEditing}
                required
              />
            </div>

            <div className="profile-form-group">
              <label htmlFor="email">
                <FaEnvelope />
                Email Address
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleProfileChange}
                disabled={!isEditing}
                required
              />
            </div>

            <div className="profile-form-group">
              <label>
                <FaShieldAlt />
                Account Role
              </label>

              <input type="text" value={role} disabled />
            </div>

            {isEditing && (
              <button type="submit" className="profile-save-button">
                Save Changes
              </button>
            )}
          </form>
        </section>

        {/* SECURITY */}
        <section className="profile-section">
          <div className="profile-section-heading">
            <div>
              <span className="profile-label">ACCOUNT SECURITY</span>

              <h2>Change Password</h2>
            </div>

            <div className="security-icon">
              <FaLock />
            </div>
          </div>

          <form className="profile-form" onSubmit={handlePasswordSubmit}>
            <div className="profile-form-group">
              <label htmlFor="currentPassword">Current Password</label>

              <input
                id="currentPassword"
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter current password"
                required
              />
            </div>

            <div className="profile-form-row">
              <div className="profile-form-group">
                <label htmlFor="newPassword">New Password</label>

                <input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  required
                />
              </div>

              <div className="profile-form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>

                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm new password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="profile-password-button">
              <FaLock />
              Update Password
            </button>
          </form>
        </section>

        {/* ACCOUNT STATUS */}
        <section className="profile-status-card">
          <div>
            <span className="profile-label">ACCOUNT STATUS</span>

            <h2>Account Active</h2>

            <p>
              Your account is currently active and you can access the features
              available to your assigned role.
            </p>
          </div>

          <div className="profile-status-indicator">
            <span></span>
            Active
          </div>
        </section>

        {/* LOGOUT */}
        <section className="profile-logout-section">
          <div>
            <h2>Sign Out</h2>

            <p>Sign out of your EKMS account on this device.</p>
          </div>

          <button
            type="button"
            className="profile-logout-button"
            onClick={handleLogout}
          >
            <FaSignOutAlt />
            Logout
          </button>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="profile-footer">
        <p>
          © {new Date().getFullYear()} Enterprise Knowledge Management System
        </p>

        <span>Knowledge • Collaboration • Intelligence</span>
      </footer>
    </div>
  );
}

export default Profile;
