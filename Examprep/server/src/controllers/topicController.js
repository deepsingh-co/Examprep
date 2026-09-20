import { Topic, Question } from "../models/index.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

export const getAllTopics = async (req, res) => {
  try {
    const { subjectId } = req.query;
    const where = subjectId ? { subject_id: subjectId } : {};
    const topics = await Topic.findAll({
      where,
      include: [{ model: Question, as: "questions" }],
      order: [["createdAt", "DESC"]],
    });
    return sendSuccess(res, topics);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getTopicById = async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await Topic.findByPk(id, {
      include: [{ model: Question, as: "questions" }],
    });
    if (!topic) return sendError(res, "Topic not found", 404);
    return sendSuccess(res, topic);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const createTopic = async (req, res) => {
  try {
    const { name, subject_id, description } = req.body;
    if (!name || !subject_id) {
      return sendError(res, "Name and subject are required", 400);
    }
    const topic = await Topic.create({ name, subject_id, description });
    return sendSuccess(res, topic, "Topic created successfully", 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await Topic.findByPk(id);
    if (!topic) return sendError(res, "Topic not found", 404);
    await topic.update(req.body);
    return sendSuccess(res, topic, "Topic updated successfully");
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await Topic.findByPk(id);
    if (!topic) return sendError(res, "Topic not found", 404);
    await topic.destroy();
    return sendSuccess(res, null, "Topic deleted successfully");
  } catch (err) {
    return sendError(res, err.message);
  }
};