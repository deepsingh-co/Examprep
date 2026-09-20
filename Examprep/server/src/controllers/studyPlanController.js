import StudyPlan from "../models/StudyPlan.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";
import { callClaude, extractJson } from "../utils/aiHelper.js";

export const generateStudyPlan = async (req, res) => {
  try {
    const { exam_name, exam_date } = req.body;
    const student_id = req.user.id;

    if (!exam_name || !exam_date) {
      return sendError(res, "Exam name and date are required", 400);
    }

    const daysRemaining = Math.ceil(
      (new Date(exam_date) - new Date()) / (1000 * 60 * 60 * 24)
    );

    if (daysRemaining < 1) {
      return sendError(res, "Exam date must be in the future", 400);
    }

    const planDays = Math.min(daysRemaining, 14);

    const prompt = `
You are an AI study planner. ${exam_name} is in ${daysRemaining} days.
Create a personalized day-by-day study plan as JSON:
{
  "overview": "short summary of the plan",
  "days": [
    { "day": 1, "duration": "2 hours", "focus": "...", "tasks": ["..."], "tips": ["..."] }
  ]
}
Generate exactly ${planDays} days.
Return ONLY a single valid JSON object with no markdown fences and no commentary.
`;

    const content = await callClaude(
      [{ role: "user", content: prompt }],
      false,
      4096
    );
    const parsed = extractJson(content);

    if (!Array.isArray(parsed.days) || parsed.days.length === 0) {
      throw new Error(
        "AI returned an incomplete study plan. Please try again or pick a closer exam date."
      );
    }

    const plan = await StudyPlan.create({
      student_id,
      exam_name,
      exam_date,
      plan_data: parsed,
    });

    return sendSuccess(res, plan, "Study plan generated and saved");
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getMyPlans = async (req, res) => {
  try {
    const plans = await StudyPlan.find({ student_id: req.user.id }).sort({ createdAt: -1 });
    return sendSuccess(res, plans);
  } catch (err) {
    return sendError(res, err.message);
  }
};