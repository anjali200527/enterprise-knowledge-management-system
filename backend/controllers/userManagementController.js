const User = require("../models/User");
const bcrypt = require("bcryptjs");

// ================= GET ALL USERS =================

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });

    return res.status(200).json(users);
  } catch (error) {
    console.error("Get Users Error:", error);

    return res.status(500).json({
      message: error.message || "Failed to fetch users.",
    });
  }
};

// ================= GET SINGLE USER =================

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error("Get User Error:", error);

    return res.status(500).json({
      message: error.message || "Failed to fetch user.",
    });
  }
};

// ================= ADD USER =================

exports.addUser = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      employeeId,
      department,
      designation,
      role,
      status,
    } = req.body;

    // ================= VALIDATION =================

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "Username, email and password are required.",
      });
    }

    // ================= CHECK EMAIL =================

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User with this email already exists.",
      });
    }

    // ================= CHECK EMPLOYEE ID =================

    if (employeeId) {
      const existingEmployee = await User.findOne({
        employeeId,
      });

      if (existingEmployee) {
        return res.status(400).json({
          message: "Employee ID already exists.",
        });
      }
    }

    // ================= HASH PASSWORD =================

    const hashedPassword = await bcrypt.hash(password, 10);

    // ================= CREATE USER =================

    const user = new User({
      username,
      email,
      password: hashedPassword,
      employeeId: employeeId || "",
      department: department || "",
      designation: designation || "",
      role: role || "Employee",
      status: status || "Active",
    });

    await user.save();

    // ================= REMOVE PASSWORD =================

    const userData = user.toObject();

    delete userData.password;

    return res.status(201).json({
      message: "User added successfully.",
      user: userData,
    });
  } catch (error) {
    console.error("Add User Error:", error);

    return res.status(500).json({
      message: error.message || "Failed to add user.",
    });
  }
};

// ================= UPDATE USER =================

exports.updateUser = async (req, res) => {
  try {
    const {
      username,
      email,
      employeeId,
      department,
      designation,
      role,
      status,
    } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    // ================= CHECK EMAIL =================

    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        email,
      });

      if (existingUser) {
        return res.status(400).json({
          message: "Email already belongs to another user.",
        });
      }
    }

    // ================= CHECK EMPLOYEE ID =================

    if (employeeId && employeeId !== user.employeeId) {
      const existingEmployee = await User.findOne({
        employeeId,
      });

      if (existingEmployee) {
        return res.status(400).json({
          message: "Employee ID already belongs to another user.",
        });
      }
    }

    // ================= UPDATE FIELDS =================

    user.username = username || user.username;

    user.email = email || user.email;

    user.employeeId = employeeId || "";

    user.department = department || "";

    user.designation = designation || "";

    user.role = role || user.role;

    user.status = status || user.status;

    await user.save();

    const userData = user.toObject();

    delete userData.password;

    return res.status(200).json({
      message: "User updated successfully.",
      user: userData,
    });
  } catch (error) {
    console.error("Update User Error:", error);

    return res.status(500).json({
      message: error.message || "Failed to update user.",
    });
  }
};

// ================= DELETE USER =================

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("Delete User Error:", error);

    return res.status(500).json({
      message: error.message || "Failed to delete user.",
    });
  }
};
