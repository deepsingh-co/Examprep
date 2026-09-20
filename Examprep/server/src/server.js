import express from "express";
import http from "http";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import examRoutes from "./routes/examRoutes.js";
import subjectRoutes from "./routes/subjectRoutes.js";
import topicRoutes from "./routes/topicRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import annotationRoutes from "./routes/annotationRoutes.js";
import attemptRoutes from "./routes/attemptRoutes.js";
import studyPlanRoutes from "./routes/studyPlanRoutes.js";
import battleRoutes from "./routes/battleRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import { setupSocket } from "./socket.js";
import academicRoutes from "./routes/academicRoutes.js";
import materialRoutes from "./routes/materialRoutes.js";
import aiKnowledgeRoutes from "./routes/aiKnowledgeRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/academic", academicRoutes);
app.use("/api/materials", materialRoutes);
app.use("/api/knowledge", aiKnowledgeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/annotations", annotationRoutes);
app.use("/api/attempts", attemptRoutes);
app.use("/api/study-plans", studyPlanRoutes);
app.use("/api/battles", battleRoutes);
app.use("/api/chat", chatRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use(errorHandler);

setupSocket(server);

const start = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

start();