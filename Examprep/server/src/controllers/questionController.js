import { Question, Option, Topic } from "../models/index.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

export const getAllQuestions = async (req, res) => {
  try {
    const { topicId } = req.query;
    const where = topicId ? { topic_id: topicId } : {};
    const questions = await Question.findAll({
      where,
      include: [{ model: Option, as: "options" }],
      order: [["createdAt", "DESC"]],
    });
    return sendSuccess(res, questions);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findByPk(id, {
      include: [{ model: Option, as: "options" }],
    });
    if (!question) return sendError(res, "Question not found", 404);
    return sendSuccess(res, question);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const createQuestion = async (req, res) => {
  try {
    const { topic_id, question_text, type, difficulty, correct_answer, options } = req.body;

    if (!topic_id || !question_text || !type) {
      return sendError(res, "Topic, question text, and type are required", 400);
    }

    const question = await Question.create({
      topic_id,
      question_text,
      type,
      difficulty,
      correct_answer,
      source: "manual",
    });

    if (options && options.length > 0) {
      const optionRecords = options.map((opt) => ({
        question_id: question.id,
        option_text: opt.text,
        is_correct: opt.isCorrect,
      }));
      await Option.bulkCreate(optionRecords);
    }

    const created = await Question.findByPk(question.id, {
      include: [{ model: Option, as: "options" }],
    });
    return sendSuccess(res, created, "Question created successfully", 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findByPk(id);
    if (!question) return sendError(res, "Question not found", 404);

    const { options, ...rest } = req.body;
    await question.update(rest);

    if (options) {
      await Option.destroy({ where: { question_id: id } });
      const optionRecords = options.map((opt) => ({
        question_id: id,
        option_text: opt.text,
        is_correct: opt.isCorrect,
      }));
      await Option.bulkCreate(optionRecords);
    }

    const updated = await Question.findByPk(id, {
      include: [{ model: Option, as: "options" }],
    });
    return sendSuccess(res, updated, "Question updated successfully");
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findByPk(id);
    if (!question) return sendError(res, "Question not found", 404);
    await Option.destroy({ where: { question_id: id } });
    await question.destroy();
    return sendSuccess(res, null, "Question deleted successfully");
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getQuestionsByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const topic = await Topic.findByPk(topicId);
    if (!topic) return sendError(res, "Topic not found", 404);

    const questions = await Question.findAll({
      where: { topic_id: topicId },
      include: [{ model: Option, as: "options" }],
    });
    return sendSuccess(res, questions);
  } catch (err) {
    return sendError(res, err.message);
  }
};