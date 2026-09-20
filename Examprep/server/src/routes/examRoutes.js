import { Router } from "express";
import {
  getAllExams,
  getExamById,
  createExam,
  updateExam,
  deleteExam,
} from "../controllers/examController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getAllExams);
router.get("/:id", getExamById);
router.post("/", authenticate, authorize("admin"), createExam);
router.put("/:id", authenticate, authorize("admin"), updateExam);
router.delete("/:id", authenticate, authorize("admin"), deleteExam);

export default router;