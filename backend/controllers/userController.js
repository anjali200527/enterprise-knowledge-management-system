const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// ============================================================
// CONSTANTS
// ============================================================

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

const MAX_USERNAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 150;
const MAX_EMPLOYEE_ID_LENGTH = 50;
const MAX_DEPARTMENT_LENGTH = 100;
const MAX_DESIGNATION_LENGTH = 100;

const RESET_TOKEN_EXPIRY_MINUTES = 15;

// ============================================================
// HELPERS
// ============================================================

// ------------------------------------------------------------
// CLEAN STRING
// ------------------------------------------------------------

const cleanString = (value) => {
  return typeof value === "string" ? value.trim() : "";
};

// ------------------------------------------------------------
// EMAIL VALIDATION
// ------------------------------------------------------------

const isValidEmail = (email) => {
  if (typeof email !== "string" || !email.trim()) {
    return false;
  }

  const cleanEmail = email.trim();

  if (cleanEmail.length > MAX_EMAIL_LENGTH) {
    return false;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
};

// ------------------------------------------------------------
// PASSWORD VALIDATION
// ------------------------------------------------------------

const isValidPassword = (password) => {
  return (
    typeof password === "string" &&
    password.length >= MIN_PASSWORD_LENGTH &&
    password.length <= MAX_PASSWORD_LENGTH
  );
};

// ------------------------------------------------------------
// CHECK JWT SECRET
// ------------------------------------------------------------

const hasJwtSecret = () => {
  return (
    typeof process.env.JWT_SECRET === "string" &&
    process.env.JWT_SECRET.trim().length >= 32
  );
};

// ============================================================
// REGISTER USER
// POST /api/users/register
// ============================================================

exports.register = async (req, res) => {
  try {
    const body = req.body || {};

    const username = cleanString(body.username);
    const email = cleanString(body.email).toLowerCase();
    const password = body.password;

    const employeeId = cleanString(body.employeeId);
    const department = cleanString(body.department);
    const designation = cleanString(body.designation);

    // ========================================================
    // REQUIRED FIELDS
    // ========================================================

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username, email and password are required.",
      });
    }

    // ========================================================
    // USERNAME VALIDATION
    // ========================================================

    if (username.length === 0 || username.length > MAX_USERNAME_LENGTH) {
      return res.status(400).json({
        success: false,
        message: "Username must not exceed 100 characters.",
      });
    }

    // ========================================================
    // EMAIL VALIDATION
    // ========================================================

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // ========================================================
    // PASSWORD VALIDATION
    // ========================================================

    if (!isValidPassword(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must contain 8 to 128 characters.",
      });
    }

    // ========================================================
    // OPTIONAL FIELD LENGTH VALIDATION
    // ========================================================

    if (employeeId.length > MAX_EMPLOYEE_ID_LENGTH) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is too long.",
      });
    }

    if (department.length > MAX_DEPARTMENT_LENGTH) {
      return res.status(400).json({
        success: false,
        message: "Department name is too long.",
      });
    }

    if (designation.length > MAX_DESIGNATION_LENGTH) {
      return res.status(400).json({
        success: false,
        message: "Designation is too long.",
      });
    }

    // ========================================================
    // CHECK EMAIL
    // ========================================================

    const existingUser = await User.findOne({
      email,
    }).lean();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email.",
      });
    }

    // ========================================================
    // CHECK EMPLOYEE ID
    // ========================================================

    if (employeeId) {
      const existingEmployee = await User.findOne({
        employeeId,
      }).lean();

      if (existingEmployee) {
        return res.status(409).json({
          success: false,
          message: "Employee ID already exists.",
        });
      }
    }

    // ========================================================
    // HASH PASSWORD
    // ========================================================

    const hashedPassword = await bcrypt.hash(password, 12);

    // ========================================================
    // CREATE USER
    // ========================================================

    const user = await User.create({
      username,
      email,
      password: hashedPassword,

      employeeId: employeeId || undefined,

      department,
      designation,

      // Public registration can only create Employee accounts
      role: "Employee",

      status: "Active",
    });

    // ========================================================
    // SUCCESS
    // ========================================================

    return res.status(201).json({
      success: true,
      message: "Registration successful.",

      user: {
        id: String(user._id),
        username: user.username,
        email: user.email,
        employeeId: user.employeeId,
        department: user.department,
        designation: user.designation,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Registration Error:", error.message);

    // ========================================================
    // DUPLICATE KEY
    // ========================================================

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "User or employee ID already exists.",
      });
    }

    // ========================================================
    // MONGOOSE VALIDATION
    // ========================================================

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Invalid registration data.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Registration failed.",
    });
  }
};

// ============================================================
// LOGIN USER
// POST /api/users/login
// ============================================================

exports.login = async (req, res) => {
  try {
    const body = req.body || {};

    const email = cleanString(body.email).toLowerCase();
    const password = body.password;

    // ========================================================
    // VALIDATE FIELDS
    // ========================================================

    if (!email || typeof password !== "string" || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // ========================================================
    // VALIDATE EMAIL
    // ========================================================

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // ========================================================
    // CHECK JWT SECRET
    // ========================================================

    if (!hasJwtSecret()) {
      console.error("JWT_SECRET is missing or too short.");

      return res.status(500).json({
        success: false,
        message: "Authentication service is not configured.",
      });
    }

    // ========================================================
    // FIND USER
    // IMPORTANT:
    // Password is select:false in User model.
    // Explicitly include it for login.
    // ========================================================

    const user = await User.findOne({
      email,
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ========================================================
    // CHECK USER STATUS
    // ========================================================

    if (
      typeof user.status === "string" &&
      user.status.toLowerCase() === "inactive"
    ) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact the administrator.",
      });
    }

    // ========================================================
    // CHECK PASSWORD
    // ========================================================

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ========================================================
    // VALIDATE USER ROLE
    // ========================================================

    const allowedRoles = ["Admin", "Manager", "Employee"];

    if (!allowedRoles.includes(user.role)) {
      console.error("Invalid role for user:", user._id);

      return res.status(403).json({
        success: false,
        message: "User account has an invalid role.",
      });
    }

    // ========================================================
    // GENERATE JWT
    // ========================================================

    const token = jwt.sign(
      {
        id: String(user._id),
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
        algorithm: "HS256",
      },
    );

    // ========================================================
    // SUCCESS
    // ========================================================

    return res.status(200).json({
      success: true,
      message: "Login successful.",

      token,

      user: {
        id: String(user._id),
        username: user.username,
        email: user.email,
        employeeId: user.employeeId,
        department: user.department,
        designation: user.designation,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Login failed.",
    });
  }
};

// ============================================================
// CHANGE PASSWORD
// PUT /api/users/change-password
// Authentication required
// ============================================================

exports.changePassword = async (req, res) => {
  try {
    // ========================================================
    // CHECK AUTHENTICATION
    // ========================================================

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required.",
      });
    }

    const body = req.body || {};

    const currentPassword = body.currentPassword;
    const newPassword = body.newPassword;

    // ========================================================
    // VALIDATE FIELDS
    // ========================================================

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      !currentPassword ||
      !newPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    // ========================================================
    // VALIDATE NEW PASSWORD
    // ========================================================

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password must contain 8 to 128 characters.",
      });
    }

    // ========================================================
    // FIND AUTHENTICATED USER
    // IMPORTANT:
    // Password is select:false.
    // Explicitly include it.
    // ========================================================

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // ========================================================
    // CHECK STATUS
    // ========================================================

    if (
      typeof user.status === "string" &&
      user.status.toLowerCase() === "inactive"
    ) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    // ========================================================
    // CHECK CURRENT PASSWORD
    // ========================================================

    const isCurrentPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    // ========================================================
    // PREVENT SAME PASSWORD
    // ========================================================

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password.",
      });
    }

    // ========================================================
    // HASH NEW PASSWORD
    // ========================================================

    user.password = await bcrypt.hash(newPassword, 12);

    // ========================================================
    // CLEAR OLD RESET TOKEN
    // ========================================================

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error) {
    console.error("Change Password Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to change password.",
    });
  }
};

// ============================================================
// FORGOT PASSWORD
// POST /api/users/forgot-password
// ============================================================

exports.forgotPassword = async (req, res) => {
  try {
    const body = req.body || {};

    const email = cleanString(body.email).toLowerCase();

    // ========================================================
    // VALIDATE EMAIL
    // ========================================================

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email address is required.",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
    }

    // ========================================================
    // FIND USER
    // ========================================================

    const user = await User.findOne({
      email,
    });

    // ========================================================
    // GENERIC RESPONSE
    // Prevent account/email enumeration.
    // ========================================================

    const genericMessage =
      "If an account exists with this email, a password reset link will be sent.";

    if (!user) {
      return res.status(200).json({
        success: true,
        message: genericMessage,
      });
    }

    // ========================================================
    // CHECK STATUS
    // ========================================================

    if (
      typeof user.status === "string" &&
      user.status.toLowerCase() === "inactive"
    ) {
      return res.status(200).json({
        success: true,
        message: genericMessage,
      });
    }

    // ========================================================
    // GENERATE RESET TOKEN
    // ========================================================

    const resetToken = crypto.randomBytes(32).toString("hex");

    // ========================================================
    // HASH RESET TOKEN
    // ========================================================

    const hashedResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // ========================================================
    // TOKEN EXPIRY
    // ========================================================

    const resetTokenExpiry = new Date(
      Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000,
    );

    // ========================================================
    // SAVE RESET TOKEN
    // ========================================================

    user.resetPasswordToken = hashedResetToken;

    user.resetPasswordExpires = resetTokenExpiry;

    await user.save();

    // ========================================================
    // RESET URL
    // ========================================================

    const frontendURL = (
      process.env.FRONTEND_URL || "http://localhost:5173"
    ).replace(/\/$/, "");

    const resetURL = `${frontendURL}/reset-password/${resetToken}`;

    // ========================================================
    // DEVELOPMENT ONLY
    // ========================================================

    // Do NOT return this token in the API response.
    // Do NOT keep this console log in production.

    if (process.env.NODE_ENV !== "production") {
      console.log("Password reset URL generated for development:");

      console.log(resetURL);

      console.log(
        `Reset link expires in ${RESET_TOKEN_EXPIRY_MINUTES} minutes.`,
      );
    }

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(200).json({
      success: true,
      message: genericMessage,
    });
  } catch (error) {
    console.error("Forgot Password Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to process password reset request.",
    });
  }
};

// ============================================================
// RESET PASSWORD
// POST /api/users/reset-password
// ============================================================

exports.resetPassword = async (req, res) => {
  try {
    const body = req.body || {};

    const token = cleanString(body.token);

    const newPassword = body.newPassword;

    // ========================================================
    // VALIDATE TOKEN
    // ========================================================

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Password reset token is required.",
      });
    }

    // ========================================================
    // TOKEN LENGTH VALIDATION
    // ========================================================

    if (token.length !== 64 || !/^[a-fA-F0-9]+$/.test(token)) {
      return res.status(400).json({
        success: false,
        message: "Invalid password reset token.",
      });
    }

    // ========================================================
    // VALIDATE PASSWORD
    // ========================================================

    if (typeof newPassword !== "string" || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required.",
      });
    }

    if (!isValidPassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message: "New password must contain 8 to 128 characters.",
      });
    }

    // ========================================================
    // HASH RECEIVED TOKEN
    // ========================================================

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // ========================================================
    // FIND USER WITH VALID TOKEN
    // IMPORTANT:
    // Explicitly include password because it is select:false.
    // ========================================================

    const user = await User.findOne({
      resetPasswordToken: hashedToken,

      resetPasswordExpires: {
        $gt: new Date(),
      },
    }).select("+password");

    // ========================================================
    // INVALID / EXPIRED TOKEN
    // ========================================================

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset link is invalid or expired.",
      });
    }

    // ========================================================
    // CHECK USER STATUS
    // ========================================================

    if (
      typeof user.status === "string" &&
      user.status.toLowerCase() === "inactive"
    ) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    // ========================================================
    // PREVENT SAME PASSWORD
    // ========================================================

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from your current password.",
      });
    }

    // ========================================================
    // HASH NEW PASSWORD
    // ========================================================

    user.password = await bcrypt.hash(newPassword, 12);

    // ========================================================
    // INVALIDATE RESET TOKEN
    // Makes the reset token single-use.
    // ========================================================

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    // ========================================================
    // SUCCESS
    // ========================================================

    return res.status(200).json({
      success: true,
      message:
        "Password reset successful. Please login with your new password.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to reset password.",
    });
  }
};
