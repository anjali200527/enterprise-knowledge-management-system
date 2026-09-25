import "./Login.css";

import { FaEnvelope, FaLock, FaUserCircle } from "react-icons/fa";

import { Link, useNavigate } from "react-router-dom";

import { useState } from "react";

import axios from "axios";

import API_URL from "../../config/api";

function Login() {
  // ================= NAVIGATION =================

  const navigate = useNavigate();

  // ================= STATES =================

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  // ================= LOGIN =================

  const handleLogin = async (e) => {
    e.preventDefault();

    // ================= CLEAR ERROR =================

    setErrorMessage("");

    // ================= VALIDATION =================

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");

      return;
    }

    if (!password.trim()) {
      setErrorMessage("Please enter your password.");

      return;
    }

    try {
      setLoading(true);

      // ================= API REQUEST =================

      const response = await axios.post(`${API_URL}/api/users/login`, {
        email: email.trim().toLowerCase(),

        password,
      });

      // ================= GET RESPONSE DATA =================

      const { token, user, message } = response.data;

      // ================= VALIDATE TOKEN =================

      if (!token) {
        setErrorMessage("Login failed. Token was not received.");

        return;
      }

      // ================= SAVE JWT TOKEN =================

      localStorage.setItem("token", token);

      // ================= SAVE USER DETAILS =================

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));

        // ================= SAVE ROLE =================

        localStorage.setItem("role", user.role || "Employee");
      }

      // ================= SUCCESS MESSAGE =================

      console.log(message || "Login successful.");

      console.log("Logged in User:", user);

      // ================= ROLE BASED REDIRECT =================

      if (user?.role === "Admin") {
        navigate("/dashboard", {
          replace: true,
        });
      } else if (user?.role === "Manager") {
        navigate("/dashboard", {
          replace: true,
        });
      } else {
        navigate("/dashboard", {
          replace: true,
        });
      }
    } catch (error) {
      console.error("Login Error:", error);

      // ================= BACKEND ERROR =================

      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      }

      // ================= NETWORK ERROR =================
      else if (
        error.code === "ERR_NETWORK" ||
        error.message === "Network Error"
      ) {
        setErrorMessage(
          "Cannot connect to the backend server. Please check your connection or server status.",
        );
      }

      // ================= OTHER ERROR =================
      else {
        setErrorMessage("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================

  return (
    <div className="login-page">
      {/* ================= HEADER ================= */}

      <header className="top-header">
        <div className="logo-section">
          <FaUserCircle className="header-logo" />

          <div>
            <h1>Enterprise Knowledge Management System</h1>

            <p>
              AI-Powered Knowledge Discovery using Large Language Models &
              Knowledge Graphs
            </p>
          </div>
        </div>
      </header>

      {/* ================= LOGIN CONTAINER ================= */}

      <div className="login-container">
        <div className="login-card">
          <h2>Welcome Back 👋</h2>

          <p>Please sign in to continue</p>

          {/* ================= ERROR MESSAGE ================= */}

          {errorMessage && (
            <div className="login-error-message">{errorMessage}</div>
          )}

          {/* ================= LOGIN FORM ================= */}

          <form onSubmit={handleLogin}>
            {/* ================= EMAIL ================= */}

            <div className="input-box">
              <FaEnvelope className="icon" />

              <input
                type="email"
                placeholder="Enter Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {/* ================= PASSWORD ================= */}

            <div className="input-box">
              <FaLock className="icon" />

              <input
                type="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {/* ================= LOGIN OPTIONS ================= */}

            <div className="login-options">
              <label>
                <input type="checkbox" disabled={loading} />
                Remember Me
              </label>

              {/* ================= FORGOT PASSWORD ================= */}

              <Link to="/forgot-password">Forgot Password?</Link>
            </div>

            {/* ================= LOGIN BUTTON ================= */}

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "LOGGING IN..." : "LOGIN"}
            </button>

            {/* ================= SIGNUP ================= */}

            <div className="signup-link">
              Don't have an account?
              <Link to="/signup"> Sign Up</Link>
            </div>
          </form>
        </div>
      </div>

      {/* ================= FOOTER ================= */}

      <footer className="footer">
        © 2026 Enterprise Knowledge Management System | React • Node.js •
        MongoDB • Neo4j • Gemini AI
      </footer>
    </div>
  );
}

export default Login;
