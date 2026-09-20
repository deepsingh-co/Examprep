import { Router } from "express";
import { generateStudyPlan, getMyPlans } from "../controllers/studyPlanController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/generate", authenticate, generateStudyPlan);
router.get("/my", authenticate, getMyPlans);

export default router;