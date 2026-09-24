import "./ForgotPassword.css";

import { useState } from "react";

import { FaEnvelope, FaLock } from "react-icons/fa";

import { useNavigate } from "react-router-dom";

import axios from "axios";

import API_URL from "../../config/api";

function ForgotPassword() {
  const navigate = useNavigate();

  // ================= STATES =================

  const [email, setEmail] = useState("");

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState("");

  const [loading, setLoading] = useState(false);

  // ================= SEND RESET LINK =================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ================= CLEAR MESSAGE =================

    setMessage("");
    setMessageType("");

    // ================= VALIDATION =================

    if (!email.trim()) {
      setMessage("Please enter your registered email address.");

      setMessageType("error");

      return;
    }

    try {
      // ================= START LOADING =================

      setLoading(true);

      // ================= API REQUEST =================

      const response = await axios.post(
        `${API_URL}/api/users/forgot-password`,
        {
          email: email.trim().toLowerCase(),
        },
      );

      // ================= SUCCESS RESPONSE =================

      setMessage(
        response.data?.message ||
          "If an account exists with this email, a password reset link will be sent.",
      );

      setMessageType("success");
    } catch (error) {
      console.error("Forgot Password Error:", error);

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
        setMessage("Unable to process your request. Please try again.");

        setMessageType("error");
      }
    } finally {
      // ================= STOP LOADING =================

      setLoading(false);
    }
  };

  // ================= UI =================

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        {/* ================= ICON ================= */}

        <div className="forgot-password-icon">
          <FaLock />
        </div>

        {/* ================= HEADING ================= */}

        <h2>Forgot Password?</h2>

        {/* ================= DESCRIPTION ================= */}

        <p className="forgot-description">
          Enter your registered email address and we will help you reset your
          password.
        </p>

        {/* ================= FORM ================= */}

        <form onSubmit={handleSubmit}>
          {/* ================= EMAIL ================= */}

          <div className="forgot-input-group">
            <FaEnvelope />

            <input
              type="email"
              placeholder="Registered Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* ================= SEND BUTTON ================= */}

          <button type="submit" disabled={loading}>
            {loading ? "SENDING..." : "Send Reset Link"}
          </button>
        </form>

        {/* ================= MESSAGE ================= */}

        {message && (
          <p className={`forgot-message ${messageType}`}>{message}</p>
        )}

        {/* ================= BACK TO LOGIN ================= */}

        <button
          type="button"
          className="back-login-btn"
          onClick={() => navigate("/")}
          disabled={loading}
        >
          ← Back to Login
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;
