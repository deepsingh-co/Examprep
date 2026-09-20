import Question from "../models/Question.js";
import Topic from "../models/Topic.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

export const getAllQuestions = async (req, res) => {
  try {
    const { topicId } = req.query;
    const query = topicId ? { topic_id: topicId } : {};
    const questions = await Question.find(query).sort({ createdAt: -1 });
    return sendSuccess(res, questions);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);
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

    const questionData = {
      topic_id,
      question_text,
      type,
      difficulty,
      correct_answer,
      source: "manual",
    };

    if (options && options.length > 0) {
      questionData.options = options.map((opt) => ({
        option_text: opt.text || opt.option_text,
        is_correct: opt.isCorrect !== undefined ? opt.isCorrect : opt.is_correct,
      }));
    }

    const question = await Question.create(questionData);
    return sendSuccess(res, question, "Question created successfully", 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findById(id);
    if (!question) return sendError(res, "Question not found", 404);

    const { options, ...rest } = req.body;

    if (options) {
      rest.options = options.map((opt) => ({
        option_text: opt.text || opt.option_text,
        is_correct: opt.isCorrect !== undefined ? opt.isCorrect : opt.is_correct,
      }));
    }

    const updated = await Question.findByIdAndUpdate(id, rest, { new: true });
    return sendSuccess(res, updated, "Question updated successfully");
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const question = await Question.findByIdAndDelete(id);
    if (!question) return sendError(res, "Question not found", 404);
    return sendSuccess(res, null, "Question deleted successfully");
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getQuestionsByTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const topic = await Topic.findById(topicId);
    if (!topic) return sendError(res, "Topic not found", 404);

    const questions = await Question.find({ topic_id: topicId });
    return sendSuccess(res, questions);
  } catch (err) {
    return sendError(res, err.message);
  }
};