import crypto from "crypto";
import User from "../models/User.js";
import { generateToken } from "../utils/jwtHelper.js";
import { sendVerificationEmail } from "../utils/emailHelper.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";
import { adminAuth } from "../config/firebaseAdmin.js";

export const firebaseLogin = async (req, res) => {
  try {
    const { token, role } = req.body;
    if (!token) return sendError(res, "Firebase token is required", 400);

    const decodedToken = await adminAuth.verifyIdToken(token);
    const { email, name, picture } = decodedToken;

    if (!email) return sendError(res, "Email not found in Firebase token", 400);

    let user = await User.findOne({ email });

    if (!user) {
      if (!role) return sendError(res, "Role is required for new users", 400);
      if (!["admin", "student"].includes(role)) return sendError(res, "Invalid role", 400);

      user = await User.create({
        name: name || email.split("@")[0],
        email,
        password: crypto.randomBytes(16).toString("hex"), // Random secure password
        role,
        isVerified: true, // Firebase emails are usually verified, or we trust Google Sign-in
      });
    }

    if (role && user.role !== role) {
      return sendError(res, `This account is not a ${role} account`, 403);
    }

    user.lastLogin = new Date();
    await user.save();

    const jwtToken = generateToken(user._id, user.role);

    return sendSuccess(res, {
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return sendError(res, "Firebase authentication failed: " + err.message, 401);
  }
};


export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return sendError(res, "All fields are required", 400);
    }

    if (!["admin", "student"].includes(role)) {
      return sendError(res, "Invalid role", 400);
    }

    const exists = await User.findOne({ email });
    if (exists) return sendError(res, "Email already registered", 400);

    const verifyToken = crypto.randomBytes(32).toString("hex");

    const user = await User.create({
      name,
      email,
      password,
      role,
      verifyToken,
    });

    let devLink = null;
    let autoVerified = false;
    try {
      const result = await sendVerificationEmail(email, verifyToken);
      if (result?.devLink) devLink = result.devLink;
    } catch (err) {
      console.error("Email send failed (registration still successful):", err.message);
    }

    // In dev mode (no SMTP), auto-verify so user can login immediately
    if (!process.env.SMTP_USER || process.env.SMTP_USER.includes("your_")) {
      user.isVerified = true;
      user.verifyToken = null;
      await user.save();
      autoVerified = true;
    }

    return sendSuccess(
      res,
      { id: user._id, name: user.name, email: user.email, role: user.role, devLink, autoVerified },
      "Registration successful. Please verify your email.",
      201
    );
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return sendError(res, "Email and password are required", 400);
    }

    const user = await User.findOne({ email });
    if (!user) return sendError(res, "Invalid credentials", 401);

    if (role && user.role !== role) {
      return sendError(res, `This account is not a ${role} account`, 403);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return sendError(res, "Invalid credentials", 401);

    if (!user.isVerified) {
      return sendError(res, "Please verify your email first", 403);
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);

    return sendSuccess(res, {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) return sendError(res, "Token is required", 400);

    const user = await User.findOne({ verifyToken: token });
    if (!user) return sendError(res, "Invalid or expired token", 400);

    user.isVerified = true;
    user.verifyToken = null;
    user.lastLogin = new Date();
    await user.save();

    const jwtToken = generateToken(user._id, user.role);

    return sendSuccess(res, {
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    }, "Email verified successfully");
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getMe = async (req, res) => {
  return sendSuccess(res, req.user);
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (email) {
      const exists = await User.findOne({ email });
      if (exists && exists._id.toString() !== user._id.toString()) {
        return sendError(res, "Email already in use", 400);
      }
      user.email = email;
    }

    await user.save();
    return sendSuccess(res, {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }, "Profile updated");
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    if (!currentPassword || !newPassword) {
      return sendError(res, "Both passwords are required", 400);
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return sendError(res, "Current password is incorrect", 400);

    user.password = newPassword;
    await user.save();

    return sendSuccess(res, null, "Password changed successfully");
  } catch (err) {
    return sendError(res, err.message);
  }
};
