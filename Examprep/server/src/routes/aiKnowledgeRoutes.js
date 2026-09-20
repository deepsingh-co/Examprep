import { Router } from "express";
import { generateResource } from "../controllers/aiKnowledgeController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

// Endpoint for generating Summaries, Flashcards, Mindmaps, MCQs based on Study Materials
router.post("/generate", authenticate, generateResource);

export default router;
