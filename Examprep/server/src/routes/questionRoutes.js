import { Router } from "express";
import {
  getAllQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getQuestionsByTopic,
} from "../controllers/questionController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getAllQuestions);
router.get("/topic/:topicId", getQuestionsByTopic);
router.get("/:id", getQuestionById);
router.post("/", authenticate, authorize("admin"), createQuestion);
router.put("/:id", authenticate, authorize("admin"), updateQuestion);
router.delete("/:id", authenticate, authorize("admin"), deleteQuestion);

export default router;