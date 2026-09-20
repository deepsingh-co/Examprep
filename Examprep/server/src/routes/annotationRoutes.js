import { Router } from "express";
import {
  searchStudent,
  getStudentAttempts,
  getAttemptDetail,
  saveAnnotation,
  getMyAnnotations,
} from "../controllers/annotationController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/search", authenticate, authorize("admin"), searchStudent);
router.get("/my", authenticate, getMyAnnotations);
router.get(
  "/students/:studentId/attempts",
  authenticate,
  authorize("admin"),
  getStudentAttempts
);
router.get(
  "/attempts/:attemptId",
  authenticate,
  authorize("admin"),
  getAttemptDetail
);
router.post("/", authenticate, authorize("admin"), saveAnnotation);

export default router;