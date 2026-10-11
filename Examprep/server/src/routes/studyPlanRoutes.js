import { Router } from "express";
import { generateStudyPlan, getMyPlans, markDayProgress } from "../controllers/studyPlanController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/generate", authenticate, generateStudyPlan);
router.get("/my", authenticate, getMyPlans);
router.put("/:id/day", authenticate, markDayProgress);

export default router;