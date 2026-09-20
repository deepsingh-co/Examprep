import { Router } from "express";
import {
  getAllSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
} from "../controllers/subjectController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getAllSubjects);
router.get("/:id", getSubjectById);
router.post("/", authenticate, authorize("admin"), createSubject);
router.put("/:id", authenticate, authorize("admin"), updateSubject);
router.delete("/:id", authenticate, authorize("admin"), deleteSubject);

export default router;