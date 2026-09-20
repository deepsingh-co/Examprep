import { Router } from "express";
import {
  uploadDoc,
  generateQuestions,
  approveQuestions,
  generateRoadmap,
  chat,
} from "../controllers/aiController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = Router();

router.post(
  "/upload",
  authenticate,
  authorize("admin"),
  upload.single("pdf"),
  uploadDoc
);
router.post("/generate", authenticate, authorize("admin"), generateQuestions);
router.post("/approve", authenticate, authorize("admin"), approveQuestions);
router.post("/roadmap", authenticate, generateRoadmap);
router.post("/chat", authenticate, chat);

export default router;