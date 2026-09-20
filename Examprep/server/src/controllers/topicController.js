import Topic from "../models/Topic.js";
import Question from "../models/Question.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

export const getAllTopics = async (req, res) => {
  try {
    const { subjectId } = req.query;
    const query = subjectId ? { subject_id: subjectId } : {};
    const topics = await Topic.find(query).sort({ createdAt: -1 }).lean();
    for (let topic of topics) {
      topic.questions = await Question.find({ topic_id: topic._id });
    }
    return sendSuccess(res, topics);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getTopicById = async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await Topic.findById(id).lean();
    if (!topic) return sendError(res, "Topic not found", 404);
    topic.questions = await Question.find({ topic_id: topic._id });
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
    const topic = await Topic.findByIdAndUpdate(id, req.body, { new: true });
    if (!topic) return sendError(res, "Topic not found", 404);
    return sendSuccess(res, topic, "Topic updated successfully");
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await Topic.findByIdAndDelete(id);
    if (!topic) return sendError(res, "Topic not found", 404);
    return sendSuccess(res, null, "Topic deleted successfully");
  } catch (err) {
    return sendError(res, err.message);
  }
};