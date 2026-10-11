import StudyPlan from "../models/StudyPlan.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";
import { callClaude, extractJson } from "../utils/aiHelper.js";

const CHUNK_DAYS = 30;
const MAX_PLAN_DAYS = 365;

const startOfLocalDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const daysBetween = (a, b) =>
  Math.round((startOfLocalDay(b) - startOfLocalDay(a)) / (1000 * 60 * 60 * 24));

const isoDate = (d) => {
  const x = startOfLocalDay(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, "0")}-${String(x.getDate()).padStart(2, "0")}`;
};

const normalizeDays = (rawDays, offset = 0) =>
  (rawDays || [])
    .filter((d) => d && Array.isArray(d.tasks))
    .map((d, i) => ({
      day: offset + i + 1,
      duration: d.duration || "2 hours",
      focus: d.focus || "Revision & practice",
      tasks: d.tasks,
      tips: Array.isArray(d.tips) ? d.tips : [],
    }));

// Days past today that were never completed get their tasks redistributed
// over the remaining days. Idempotent: each past day merges only once
// (guarded by day.merged).
export const ensureAdjusted = async (plan) => {
  const days = plan.plan_data?.days;
  if (!Array.isArray(days) || days.length === 0) return plan;

  const startDate = plan.start_date || plan.createdAt || new Date();
  const todayIdx = daysBetween(new Date(startDate), new Date());
  if (todayIdx < 0 || todayIdx >= days.length) return plan;

  const completed = new Set(plan.completed_days || []);
  const pastPending = [];
  let changed = false;

  days.forEach((d, i) => {
    const dayNo = d.day || i + 1;
    if (i < todayIdx && !completed.has(dayNo) && !d.merged) {
      d.merged = true;
      d.missed = true;
      pastPending.push({ dayNo, tasks: d.tasks || [] });
      changed = true;
    }
  });

  if (!changed || pastPending.length === 0) return plan;

  const future = days.filter((_, i) => i >= todayIdx);
  if (future.length === 0) return plan;

  const backlog = pastPending.flatMap((p) =>
    p.tasks.map((t) => `🔁 Catch-up (Day ${p.dayNo}): ${t}`)
  );

  backlog.forEach((task, k) => {
    const target = future[k % future.length];
    target.tasks = [...(target.tasks || []), task];
  });

  plan.markModified("plan_data");
  await plan.save();
  return plan;
};

const generateChunk = async (exam_name, exam_date, daysRemaining, fromDay, toDay, previousFocus) => {
  const prompt =
    previousFocus.length === 0
      ? `You are an AI study planner. ${exam_name} starts today and the exam is on ${isoDate(new Date(exam_date))} (${daysRemaining} days from now).
Create days Day ${fromDay} to Day ${toDay} of a day-by-day study plan as JSON:
{
  "overview": "short 2-3 sentence summary of the full plan strategy",
  "days": [
    { "day": ${fromDay}, "duration": "2 hours", "focus": "topic focus", "tasks": ["3-5 concrete tasks", "..."], "tips": ["1-2 short tips"] }
  ]
}
Rules: exactly ${toDay - fromDay + 1} days, task lists short, no repeated filler, cover the syllabus progressively with revision near the end.
Return ONLY a single valid JSON object with no markdown fences and no commentary.`
      : `You are an AI study planner for ${exam_name} (exam on ${isoDate(new Date(exam_date))}, ${daysRemaining} days total).
Topics already scheduled so far: ${previousFocus.join("; ")}.
Continue the SAME plan for days Day ${fromDay} to Day ${toDay}. Do NOT repeat already-covered topics; cover the remaining syllabus plus spaced revision.
JSON format:
{
  "days": [
    { "day": ${fromDay}, "duration": "2 hours", "focus": "topic focus", "tasks": ["3-5 concrete tasks", "..."], "tips": ["1-2 short tips"] }
  ]
}
Rules: exactly ${toDay - fromDay + 1} days.
Return ONLY a single valid JSON object with no markdown fences and no commentary.`;

  const maxTokens = Math.min(7000, 1500 + (toDay - fromDay + 1) * 170);
  const content = await callClaude([{ role: "user", content: prompt }], false, maxTokens);
  const parsed = extractJson(content);
  return {
    overview: typeof parsed.overview === "string" ? parsed.overview : "",
    days: normalizeDays(parsed.days, fromDay - 1),
  };
};

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

    const planDays = Math.min(daysRemaining, MAX_PLAN_DAYS);
    const collected = [];
    let overview = "";

    while (collected.length < planDays) {
      const fromDay = collected.length + 1;
      const toDay = Math.min(collected.length + CHUNK_DAYS, planDays);
      try {
        const chunk = await generateChunk(
          exam_name,
          exam_date,
          daysRemaining,
          fromDay,
          toDay,
          collected.map((d) => d.focus)
        );
        if (chunk.days.length === 0) throw new Error("empty chunk");
        if (!overview && chunk.overview) overview = chunk.overview;
        collected.push(...chunk.days);
      } catch (chunkErr) {
        if (collected.length === 0) throw chunkErr;
        // Keep the plan full-length even if a later AI chunk fails:
        // roll forward previous focuses until every day is covered.
        while (collected.length < planDays) {
          const i = collected.length;
          const src = collected[(i - fromDay + 1) % collected.length];
          collected.push({
            day: i + 1,
            duration: src.duration || "2 hours",
            focus: src.focus || "Revision & practice",
            tasks: [
              `Revise: ${src.focus || "earlier topics"}`,
              "Solve 20 practice questions on Day " + (i - CHUNK_DAYS + 1) + " topics",
              "Update your short notes",
            ],
            tips: ["Stay consistent — revision beats cramming."],
          });
        }
        break;
      }
    }

    const plan = await StudyPlan.create({
      student_id,
      exam_name,
      exam_date,
      start_date: new Date(),
      completed_days: [],
      plan_data: {
        overview:
          overview ||
          `A ${planDays}-day plan from today until ${exam_name} on ${isoDate(new Date(exam_date))}, blending new topics, practice and spaced revision.`,
        days: collected.slice(0, planDays).map((d, i) => ({ ...d, day: i + 1 })),
      },
    });

    return sendSuccess(res, plan, "Study plan generated and saved");
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getMyPlans = async (req, res) => {
  try {
    const plans = await StudyPlan.find({ student_id: req.user.id }).sort({ createdAt: -1 });

    // Auto-upgrade: redistribute missed days before returning active plans
    for (const plan of plans) {
      if (new Date(plan.exam_date) >= startOfLocalDay(new Date())) {
        await ensureAdjusted(plan);
      }
    }

    return sendSuccess(res, plans);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const markDayProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { day, completed } = req.body;

    const plan = await StudyPlan.findOne({ _id: id, student_id: req.user.id });
    if (!plan) return sendError(res, "Plan not found", 404);

    const dayNo = Number(day);
    if (!Number.isInteger(dayNo) || dayNo < 1) {
      return sendError(res, "Invalid day", 400);
    }

    const list = plan.completed_days || [];
    if (completed) {
      if (!list.includes(dayNo)) plan.completed_days = [...list, dayNo];
    } else {
      plan.completed_days = list.filter((d) => d !== dayNo);
    }
    await plan.save();

    return sendSuccess(res, plan, completed ? "Day marked complete" : "Day reopened");
  } catch (err) {
    return sendError(res, err.message);
  }
};
