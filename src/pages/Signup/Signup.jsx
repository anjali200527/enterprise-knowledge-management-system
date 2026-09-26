import "./Signup.css";

import { useState } from "react";

import { FaUser, FaEnvelope, FaLock, FaUserTie } from "react-icons/fa";

import { Link, useNavigate } from "react-router-dom";

import axios from "axios";

import Footer from "../../components/Footer/Footer";

import API_URL from "../../config/api";

function Signup() {
  const navigate = useNavigate();

  // ================= FORM DATA =================

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
  });

  // ================= LOADING =================

  const [loading, setLoading] = useState(false);

  // ================= HANDLE INPUT CHANGE =================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };

  // ================= REGISTER USER =================

  const handleRegister = async (e) => {
    e.preventDefault();

    // ================= TRIM VALUES =================

    const username = formData.username.trim();

    const email = formData.email.trim().toLowerCase();

    const password = formData.password.trim();

    const confirmPassword = formData.confirmPassword.trim();

    const role = formData.role;

    // ================= VALIDATION =================

    if (!username || !email || !password || !confirmPassword || !role) {
      alert("Please fill all fields.");

      return;
    }

    // ================= PASSWORD LENGTH =================

    if (password.length < 6) {
      alert("Password must contain at least 6 characters.");

      return;
    }

    // ================= PASSWORD MATCH =================

    if (password !== confirmPassword) {
      alert("Passwords do not match!");

      return;
    }

    try {
      setLoading(true);

      console.log("Sending registration request...");

      // ================= API REQUEST =================

      const response = await axios.post(`${API_URL}/api/users/register`, {
        username,
        email,
        password,
        role,
      });

      console.log("Registration successful:", response.data);

      alert(response.data.message || "Registration Successful!");

      // ================= CLEAR FORM =================

      setFormData({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "",
      });

      // ================= GO TO LOGIN =================

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Registration Error:", error);

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else if (
        error.code === "ERR_NETWORK" ||
        error.message === "Network Error"
      ) {
        alert(
          "Cannot connect to the backend server. Please check your connection or server status.",
        );
      } else {
        alert("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================

  return (
    <div className="signup-page">
      <div className="signup-card">
        <h2>Create Your Account</h2>

        <p>KnowSphere: Intelligent Enterprise Knowledge Platform</p>

        <form onSubmit={handleRegister}>
          {/* ================= FULL NAME ================= */}

          <div className="input-box">
            <FaUser className="icon" />

            <input
              type="text"
              name="username"
              placeholder="Full Name"
              value={formData.username}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          {/* ================= EMAIL ================= */}

          <div className="input-box">
            <FaEnvelope className="icon" />

            <input
              type="email"
              name="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          {/* ================= PASSWORD ================= */}

          <div className="input-box">
            <FaLock className="icon" />

            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          {/* ================= CONFIRM PASSWORD ================= */}

          <div className="input-box">
            <FaLock className="icon" />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          {/* ================= ROLE ================= */}

          <div className="input-box">
            <FaUserTie className="icon" />

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
              required
            >
              <option value="">Select Role</option>

              <option value="Employee">Employee</option>

              <option value="Manager">Manager</option>

              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* ================= REGISTER BUTTON ================= */}

          <button type="submit" className="register-btn" disabled={loading}>
            {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
          </button>

          {/* ================= LOGIN LINK ================= */}

          <div className="back-login">
            Already have an account?
            <Link to="/login"> Login</Link>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}

export default Signup;
