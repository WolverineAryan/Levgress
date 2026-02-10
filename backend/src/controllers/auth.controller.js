const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { hashPassword, comparePassword } = require("../utils/password");
const StudentStats = require("../models/StudentStats");
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Register (initially for admin use / seed)
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, department, batch } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role,
      department,
      batch
    });

    res.status(201).json({ message: "User created" });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
if (user.role === "STUDENT") {
  const existingStats = await StudentStats.findOne({ studentId: user._id });

  if (!existingStats) {
    await StudentStats.create({
      studentId: user._id
    });
  }
}

    const token = generateToken(user);

    res.json({
      token,
      role: user.role,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed" });
  }
};

// Get current user
exports.me = async (req, res) => {
  res.json({ user: req.user });
};
