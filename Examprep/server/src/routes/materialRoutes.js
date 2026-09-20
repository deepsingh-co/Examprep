import { Router } from "express";
import {
  uploadStudyMaterial,
  getStudyMaterials,
  deleteStudyMaterial,
  uploadPYQ,
  getPYQs,
} from "../controllers/materialController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = Router();

// Study Materials
router.post(
  "/",
  authenticate,
  authorize("admin", "faculty"),
  upload.single("file"),
  uploadStudyMaterial
);
router.get("/", authenticate, getStudyMaterials);
router.delete("/:id", authenticate, authorize("admin", "faculty"), deleteStudyMaterial);

// PYQs
router.post(
  "/pyqs",
  authenticate,
  authorize("admin", "faculty"),
  upload.single("file"),
  uploadPYQ
);
router.get("/pyqs", authenticate, getPYQs);

export default router;
