import { Router } from "express";
import {
  register,
  login,
  firebaseLogin,
  verifyEmail,
  getMe,
  updateProfile,
  changePassword,
} from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/firebase-login", firebaseLogin);
router.get("/verify-email", verifyEmail);
router.get("/me", authenticate, getMe);
router.put("/profile", authenticate, updateProfile);
router.put("/password", authenticate, changePassword);

export default router;