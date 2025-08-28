import User from "../models/User.js";
import Organization from "../models/Organization.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import { logLoginAttempt } from "../utils/logger.js";
dotenv.config();

// Register a new user
export const register = async (req, res) => {
  try {
    const { email, password, organization, name, role } = req.body;
    if (!email || !password || !organization) {
      return res
        .status(400)
        .json({ message: "Email, password, and organization are required." });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      await logLoginAttempt({ email, success: false });
      return res.status(409).json({ message: "User already exists." });
    }

    // Find or create organization
    let org = await Organization.findOne({ name: organization });
    if (!org) {
      org = new Organization({ name: organization });
      await org.save();
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      organizationId: org._id,
      name,
      role: role || "user",
    });
    await user.save();

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        organizationId: org._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    await logLoginAttempt({
      email,
      success: true,
      userId: user._id,
      organizationId: org._id,
    });
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        name: user.name,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Registration failed.", error: err.message });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      await logLoginAttempt({ email, success: false });
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await logLoginAttempt({
        email,
        success: false,
        userId: user._id,
        organizationId: user.organizationId,
      });
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
        organizationId: user.organizationId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    await logLoginAttempt({
      email,
      success: true,
      userId: user._id,
      organizationId: user.organizationId,
    });
    res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        name: user.name,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed.", error: err.message });
  }
};
