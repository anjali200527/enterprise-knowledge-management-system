import "./Login.css";
import { FaEnvelope, FaLock, FaUserCircle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import API_URL from "../../config/api";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

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

      const response = await axios.post(`${API_URL}/api/users/login`, {
        email: email.trim().toLowerCase(),
        password,
      });

      const { token, user, message } = response.data;

      if (!token) {
        setErrorMessage("Login failed. Token was not received.");
        return;
      }

      localStorage.setItem("token", token);

      if (user) {
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("role", user.role || "Employee");
      }

      console.log(message || "Login successful.");
      console.log("Logged in User:", user);

      navigate("/dashboard", { replace: true });
    } catch (error) {
      console.error("Login Error:", error);

      if (error.response?.data?.message) {
        setErrorMessage(error.response.data.message);
      } else if (
        error.code === "ERR_NETWORK" ||
        error.message === "Network Error"
      ) {
        setErrorMessage(
          "Cannot connect to the backend server. Please check your connection or server status."
        );
      } else {
        setErrorMessage("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* BACKGROUND ANIMATION */}
      <div className="login-background"></div>

      {/* LOGIN CONTENT */}
      <div className="login-content-wrapper">
        <div className="login-brand-header">
          <div className="login-logo">
            <FaUserCircle />
          </div>
          <div className="login-brand-text">
            <h1>KnowSphere</h1>
            <p>Intelligent Enterprise Knowledge Platform</p>
          </div>
        </div>

        <div className="login-card">
          <h2>Welcome Back 👋</h2>
          <p className="login-subtitle">Please sign in to continue</p>

          {errorMessage && (
            <div className="login-error-message">{errorMessage}</div>
          )}

          <form onSubmit={handleLogin} className="login-form">
            <div className="input-group">
              <label>Email Address</label>
              <div className="input-box">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  placeholder="Enter Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-box">
                <FaLock className="input-icon" />
                <input
                  type="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input type="checkbox" disabled={loading} />
                <span>Remember Me</span>
              </label>
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot Password?
              </Link>
            </div>

            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>

            <div className="signup-link">
              Don't have an account? <Link to="/signup">Sign Up</Link>
            </div>
          </form>
        </div>

        <footer className="login-footer">
          © {new Date().getFullYear()} KnowSphere | React • Node.js • MongoDB • Neo4j • Gemini AI
        </footer>
      </div>
    </div>
  );
}

export default Login;
