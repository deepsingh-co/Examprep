import { Router } from "express";
import { createRoom, joinRoom, getRoom, getRanking } from "../controllers/battleController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/create", authenticate, createRoom);
router.post("/join", authenticate, joinRoom);
router.get("/room/:roomCode", authenticate, getRoom);
router.get("/ranking/:examId", getRanking);

export default router;