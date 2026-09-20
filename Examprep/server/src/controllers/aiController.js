import fs from "fs";
import path from "path";
import Question from "../models/Question.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";
import { callClaude, extractJson, shuffleArray } from "../utils/aiHelper.js";

// Upload a PDF document
export const uploadDoc = async (req, res) => {
  try {
    if (!req.file) return sendError(res, "No file uploaded", 400);
    return sendSuccess(
      res,
      { path: req.file.path, originalName: req.file.originalname },
      "Document uploaded successfully",
      201
    );
  } catch (err) {
    return sendError(res, err.message);
  }
};

// Parse PDF and generate questions list
export const generateQuestions = async (req, res) => {
  try {
    const { filePath, topic_id, count = 10, type = "MCQ", difficulty = "medium", customInstructions } = req.body;

    if (!filePath || !topic_id) {
      return sendError(res, "File and topic are required", 400);
    }

    // Parse the PDF
    const { default: parsePDF } = await import("../utils/pdfParser.js");
    const text = await parsePDF(filePath);

    const prompt = `
You are an expert exam question generator. Based on the following study material, generate ${count} questions.

CONFIGURATION:
- Type: ${type}
- Difficulty: ${difficulty}
${customInstructions ? `- Custom instructions: ${customInstructions}` : ""}

The exam format is:
- MCQ: single correct answer with 4 options
- MULTI: multiple correct answers
- NAQ: numeric answer

Return ONLY a single valid JSON object with this exact shape, with no markdown code fences, no commentary, and no trailing text:
{
  "questions": [
    {
      "type": "${type}",
      "question_text": "...",
      "options": [
        { "text": "...", "isCorrect": false },
        { "text": "...", "isCorrect": true }
      ],
      "correct_answer": "answer text or numeric value"
    }
  ]
}

STUDY MATERIAL:
${text.slice(0, 3000)}
`;

    const content = await callClaude([{ role: "user", content: prompt }], true);
    console.log("[ai/generate] raw response:", content);
    const parsed = extractJson(content);

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error(
        "AI response was incomplete. Your OpenRouter credits are too low for the full output — reduce the question count or add credits."
      );
    }

    const shuffledQuestions = parsed.questions.map((q) => ({
      ...q,
      options: shuffleArray(q.options || []),
    }));
    return sendSuccess(res, shuffledQuestions, "Questions generated successfully");
  } catch (err) {
    return sendError(res, err.message);
  }
};

// Approve generated questions and save to DB
export const approveQuestions = async (req, res) => {
  try {
    const { topic_id, questions } = req.body;

    if (!topic_id || !Array.isArray(questions) || questions.length === 0) {
      return sendError(res, "Topic and questions are required", 400);
    }

    const saved = [];

    for (const q of questions) {
      const questionData = {
        topic_id,
        question_text: q.question_text,
        type: q.type || "MCQ",
        difficulty: q.difficulty || "medium",
        correct_answer: q.correct_answer,
        source: "ai",
      };

      if (q.options && q.options.length > 0) {
        questionData.options = q.options.map((opt) => ({
          option_text: opt.text || opt.option_text,
          is_correct: opt.isCorrect !== undefined ? opt.isCorrect : opt.is_correct,
        }));
      }

      const question = await Question.create(questionData);
      saved.push(question._id);
    }

    return sendSuccess(res, saved, `${saved.length} questions published`);
  } catch (err) {
    return sendError(res, err.message);
  }
};

// Chat endpoint for AI assistant
export const chat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return sendError(res, "Messages are required", 400);
    }

    const systemMessage = {
      role: "system",
      content:
        "You are IntelliExam's study assistant. You help students prepare for exams by answering questions about study techniques, explaining concepts, and giving study advice. Be concise and helpful.",
    };

    const content = await callClaude([systemMessage, ...messages]);
    return sendSuccess(res, { reply: content }, "Response generated");
  } catch (err) {
    return sendError(res, err.message);
  }
};

// Roadmap generation from wrong answers
export const generateRoadmap = async (req, res) => {
  try {
    const { wrongAnswers, topicName } = req.body;

    const prompt = `
You are an expert study coach. A student got these questions wrong on ${topicName || "a topic"}:
${wrongAnswers.join("\n")}

Generate a personalized study roadmap as a single valid JSON object (no markdown fences, no commentary):
{
  "weakTopics": ["..."],
  "plan": [
    { "day": 1, "focus": "...", "tasks": ["...", "..."], "resources": ["..."] }
  ],
  "summary": "..."
}
`;

    const content = await callClaude([{ role: "user", content: prompt }], true);
    const parsed = extractJson(content);
    return sendSuccess(res, parsed, "Roadmap generated");
  } catch (err) {
    return sendError(res, err.message);
  }
};

// Study planner
export const generateStudyPlan = async (req, res) => {
  try {
    const { exam_name, exam_date } = req.body;
    const student_id = req.user.id; // user ID is ObjectId

    if (!exam_name || !exam_date) {
      return sendError(res, "Exam name and date are required", 400);
    }

    const daysRemaining = Math.ceil(
      (new Date(exam_date) - new Date()) / (1000 * 60 * 60 * 24)
    );

    if (daysRemaining < 1) {
      return sendError(res, "Exam date must be in the future", 400);
    }

    const prompt = `
Create a study plan for ${exam_name} exam. ${daysRemaining} days remaining.
Return JSON with structure:
{
  "overview": "...",
  "days": [
    { "day": 1, "duration": "2 hours", "focus": "...", "tasks": ["..."], "tips": ["..."] }
  ]
}
Create one entry per day, for ${Math.min(daysRemaining, 30)} days.
`;

    const content = await callClaude([{ role: "user", content: prompt }], true);
    const parsed = extractJson(content);

    return sendSuccess(res, parsed, "Study plan generated");
  } catch (err) {
    return sendError(res, err.message);
  }
};