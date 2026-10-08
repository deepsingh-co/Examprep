import { Router } from "express";
import {
  createAttempt,
  submitAttempt,
  getAttemptResult,
  getMyAttempts,
  getMyBehaviour,
  getActiveAttempts,
} from "../controllers/attemptController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/active", authenticate, authorize("admin", "faculty"), getActiveAttempts);
router.get("/my", authenticate, getMyAttempts);
router.get("/behaviour", authenticate, getMyBehaviour);
router.post("/", authenticate, createAttempt);
router.put("/:id/submit", authenticate, submitAttempt);
router.get("/:id/result", authenticate, getAttemptResult);

export default router;