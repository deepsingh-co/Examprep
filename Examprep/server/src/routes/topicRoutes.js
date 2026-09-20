import { Router } from "express";
import {
  getAllTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
} from "../controllers/topicController.js";
import { authenticate, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", getAllTopics);
router.get("/:id", getTopicById);
router.post("/", authenticate, authorize("admin"), createTopic);
router.put("/:id", authenticate, authorize("admin"), updateTopic);
router.delete("/:id", authenticate, authorize("admin"), deleteTopic);

export default router;