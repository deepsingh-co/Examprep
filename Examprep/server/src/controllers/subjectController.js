import Subject from "../models/Subject.js";
import Topic from "../models/Topic.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

export const getAllSubjects = async (req, res) => {
  try {
    const { examId } = req.query;
    const query = examId ? { exam_id: examId } : {};
    const subjects = await Subject.find(query).sort({ createdAt: -1 }).lean();
    for (let sub of subjects) {
      sub.topics = await Topic.find({ subject_id: sub._id });
    }
    return sendSuccess(res, subjects);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id).lean();
    if (!subject) return sendError(res, "Subject not found", 404);
    subject.topics = await Topic.find({ subject_id: subject._id });
    return sendSuccess(res, subject);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const createSubject = async (req, res) => {
  try {
    const { name, exam_id, description } = req.body;
    if (!name || !exam_id) {
      return sendError(res, "Name and exam are required", 400);
    }
    const subject = await Subject.create({ name, exam_id, description });
    return sendSuccess(res, subject, "Subject created successfully", 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findByIdAndUpdate(id, req.body, { new: true });
    if (!subject) return sendError(res, "Subject not found", 404);
    return sendSuccess(res, subject, "Subject updated successfully");
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findByIdAndDelete(id);
    if (!subject) return sendError(res, "Subject not found", 404);
    return sendSuccess(res, null, "Subject deleted successfully");
  } catch (err) {
    return sendError(res, err.message);
  }
};