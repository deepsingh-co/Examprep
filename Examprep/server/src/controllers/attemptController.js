import { Op } from "sequelize";
import { Question, Option, Topic, Subject, Exam, TestAttempt, TestAttemptAnswer } from "../models/index.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

export const getQuestionsForAttempt = async (topicId) => {
  const questions = await Question.findAll({
    where: { topic_id: topicId },
    include: [{ model: Option, as: "options" }],
  });
  // Shuffle
  return questions.sort(() => Math.random() - 0.5);
};

export const createAttempt = async (req, res) => {
  try {
    const { topic_id } = req.body;
    const student_id = req.user.id;

    if (!topic_id) return sendError(res, "Topic is required", 400);

    const topic = await Topic.findByPk(topic_id);
    if (!topic) return sendError(res, "Topic not found", 404);

    const questions = await getQuestionsForAttempt(topic_id);
    if (questions.length === 0) {
      return sendError(res, "No questions available for this topic", 400);
    }

    const attempt = await TestAttempt.create({
      student_id,
      topic_id,
      total_questions: questions.length,
      status: "in_progress",
    });

    return sendSuccess(res, { attempt, questions }, "Attempt created", 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const submitAttempt = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, time_taken, violations } = req.body;

    const attempt = await TestAttempt.findByPk(id);
    if (!attempt) return sendError(res, "Attempt not found", 404);

    if (attempt.student_id !== req.user.id) {
      return sendError(res, "Unauthorized", 403);
    }

    if (attempt.status === "completed") {
      return sendError(res, "Attempt already submitted", 400);
    }

    const answerRecords = await Promise.all(
      answers.map(async (ans) => {
        const question = await Question.findByPk(ans.question_id, {
          include: [{ model: Option, as: "options" }],
        });
        if (!question) return null;

        let isCorrect = false;

        if (question.type === "MCQ") {
          const selected = ans.selected_option;
          const option = await Option.findByPk(selected);
          isCorrect = option ? option.is_correct : false;
        } else if (question.type === "MULTI") {
          const selectedIds = Array.isArray(ans.selected_options)
            ? ans.selected_options
            : [ans.selected_option];
          const correctOptions = question.options.filter((o) => o.is_correct);
          const correctIds = correctOptions.map((o) => o.id).sort().join(",");
          const selectedIdsSorted = selectedIds.map(Number).sort().join(",");
          isCorrect = correctIds === selectedIdsSorted;
        } else {
          isCorrect =
            String(ans.typed_answer || "").trim().toLowerCase() ===
            String(question.correct_answer || "").trim().toLowerCase();
        }

        return {
          attempt_id: id,
          question_id: ans.question_id,
          selected_option: ans.selected_option || null,
          typed_answer: ans.typed_answer || null,
          is_correct: isCorrect,
        };
      })
    );

    const valid = answerRecords.filter(Boolean);
    await TestAttemptAnswer.bulkCreate(valid);

    const totalCorrect = valid.filter((a) => a.is_correct).length;
    const totalWrong = valid.length - totalCorrect;

    attempt.score = totalCorrect;
    attempt.total_correct = totalCorrect;
    attempt.total_wrong = totalWrong;
    attempt.time_taken = time_taken || 0;
    attempt.violations = violations || 0;
    attempt.status = "completed";
    await attempt.save();

    return sendSuccess(res, attempt, "Attempt submitted", 200);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getAttemptResult = async (req, res) => {
  try {
    const { id } = req.params;

    const attempt = await TestAttempt.findByPk(id, {
      include: [
        {
          model: Topic,
          as: "topic",
          include: [
            {
              model: Subject,
              as: "subject",
              include: [{ model: Exam, as: "exam" }],
            },
          ],
        },
        {
          model: TestAttemptAnswer,
          as: "answers",
          include: [
            {
              model: Question,
              as: "question",
              include: [{ model: Option, as: "options" }],
            },
          ],
        },
      ],
    });
    if (!attempt) return sendError(res, "Attempt not found", 404);
    return sendSuccess(res, attempt);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getMyAttempts = async (req, res) => {
  try {
    const attempts = await TestAttempt.findAll({
      where: { student_id: req.user.id },
      include: [
        {
          model: Topic,
          as: "topic",
          include: [
            {
              model: Subject,
              as: "subject",
              include: [{ model: Exam, as: "exam" }],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });
    return sendSuccess(res, attempts);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getMyBehaviour = async (req, res) => {
  try {
    const attempts = await TestAttempt.findAll({
      where: {
        student_id: req.user.id,
        status: "completed",
        violations: { [Op.gt]: 0 },
      },
      include: [
        {
          model: Topic,
          as: "topic",
          include: [{ model: Subject, as: "subject" }],
        },
      ],
      attributes: ["id", "violations", "createdAt", "score", "total_questions"],
      order: [["createdAt", "DESC"]],
      limit: 50,
    });
    return sendSuccess(res, attempts);
  } catch (err) {
    return sendError(res, err.message);
  }
};