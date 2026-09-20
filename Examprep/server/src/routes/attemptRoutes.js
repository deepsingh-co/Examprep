import { Router } from "express";
import { createAttempt, submitAttempt, getAttemptResult, getMyAttempts, getMyBehaviour } from "../controllers/attemptController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", authenticate, createAttempt);
router.put("/:id/submit", authenticate, submitAttempt);
router.get("/:id/result", authenticate, getAttemptResult);
router.get("/my", authenticate, getMyAttempts);
router.get("/behaviour", authenticate, getMyBehaviour);

export default router;