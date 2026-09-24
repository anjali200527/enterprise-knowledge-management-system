import "./ResetPassword.css";

import { useState } from "react";

import { FaLock, FaCheckCircle } from "react-icons/fa";

import { useNavigate, useParams } from "react-router-dom";

import axios from "axios";

import API_URL from "../../config/api";

function ResetPassword() {
  const navigate = useNavigate();

  const { token } = useParams();

  // ================= STATES =================

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState("");

  const [loading, setLoading] = useState(false);

  const [resetSuccess, setResetSuccess] = useState(false);

  // ================= RESET PASSWORD =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ================= CLEAR MESSAGE =================

    setMessage("");
    setMessageType("");

    // ================= TOKEN VALIDATION =================

    if (!token) {
      setMessage("Password reset link is invalid.");

      setMessageType("error");

      return;
    }

    // ================= PASSWORD VALIDATION =================

    if (!newPassword) {
      setMessage("Please enter your new password.");

      setMessageType("error");

      return;
    }

    if (newPassword.length < 6) {
      setMessage("Password must contain at least 6 characters.");

      setMessageType("error");

      return;
    }

    // ================= CONFIRM PASSWORD =================

    if (!confirmPassword) {
      setMessage("Please confirm your new password.");

      setMessageType("error");

      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage("New password and confirm password do not match.");

      setMessageType("error");

      return;
    }

    try {
      // ================= START LOADING =================

      setLoading(true);

      // ================= API REQUEST =================

      const response = await axios.post(`${API_URL}/api/users/reset-password`, {
        token,
        newPassword,
      });

      // ================= SUCCESS =================

      setMessage(
        response.data?.message ||
          "Password reset successful. Please login with your new password.",
      );

      setMessageType("success");

      setResetSuccess(true);

      // Clear password fields

      setNewPassword("");

      setConfirmPassword("");
    } catch (error) {
      console.error("Reset Password Error:", error);

      // ================= BACKEND ERROR =================

      if (error.response?.data?.message) {
        setMessage(error.response.data.message);

        setMessageType("error");
      }

      // ================= NETWORK ERROR =================
      else if (
        error.code === "ERR_NETWORK" ||
        error.message === "Network Error"
      ) {
        setMessage(
          "Cannot connect to backend. Please check whether the backend server is running on port 5000.",
        );

        setMessageType("error");
      }

      // ================= OTHER ERROR =================
      else {
        setMessage("Unable to reset password. Please try again.");

        setMessageType("error");
      }
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================

  return (
    <div className="reset-password-page">
      <div className="reset-password-card">
        {/* ================= ICON ================= */}

        <div className="reset-password-icon">
          {resetSuccess ? <FaCheckCircle /> : <FaLock />}
        </div>

        {/* ================= HEADING ================= */}

        <h2>
          {resetSuccess ? "Password Reset Successful!" : "Reset Password"}
        </h2>

        {/* ================= DESCRIPTION ================= */}

        <p className="reset-description">
          {resetSuccess
            ? "Your password has been updated successfully. You can now login with your new password."
            : "Enter your new password below to reset your account password."}
        </p>

        {/* ================= FORM ================= */}

        {!resetSuccess && (
          <form onSubmit={handleSubmit}>
            {/* ================= NEW PASSWORD ================= */}

            <div className="reset-input-group">
              <FaLock />

              <input
                type="password"
                placeholder="Enter New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {/* ================= CONFIRM PASSWORD ================= */}

            <div className="reset-input-group">
              <FaLock />

              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {/* ================= RESET BUTTON ================= */}

            <button type="submit" disabled={loading}>
              {loading ? "RESETTING..." : "Reset Password"}
            </button>
          </form>
        )}

        {/* ================= MESSAGE ================= */}

        {message && !resetSuccess && (
          <p className={`reset-message ${messageType}`}>{message}</p>
        )}

        {/* ================= LOGIN BUTTON ================= */}

        <button
          type="button"
          className="back-login-btn"
          onClick={() => navigate("/")}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}

export default ResetPassword;
