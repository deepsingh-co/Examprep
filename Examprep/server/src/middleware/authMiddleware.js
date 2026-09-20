import { verifyToken } from "../utils/jwtHelper.js";
import User from "../models/User.js";
import { sendError } from "../utils/responseHelper.js";

export const authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return sendError(res, "No token provided", 401);
    }

    const decoded = verifyToken(header.split(" ")[1]);
    const user = await User.findById(decoded.id).select("-password -verifyToken");

    if (!user) return sendError(res, "User not found", 401);

    req.user = user;
    next();
  } catch {
    return sendError(res, "Invalid token", 401);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(res, "Access denied", 403);
    }
    next();
  };
};
