import { Subject, Topic } from "../models/index.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

export const getAllSubjects = async (req, res) => {
  try {
    const { examId } = req.query;
    const where = examId ? { exam_id: examId } : {};
    const subjects = await Subject.findAll({
      where,
      include: [{ model: Topic, as: "topics" }],
      order: [["createdAt", "DESC"]],
    });
    return sendSuccess(res, subjects);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findByPk(id, {
      include: [{ model: Topic, as: "topics" }],
    });
    if (!subject) return sendError(res, "Subject not found", 404);
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
    const subject = await Subject.findByPk(id);
    if (!subject) return sendError(res, "Subject not found", 404);
    await subject.update(req.body);
    return sendSuccess(res, subject, "Subject updated successfully");
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findByPk(id);
    if (!subject) return sendError(res, "Subject not found", 404);
    await subject.destroy();
    return sendSuccess(res, null, "Subject deleted successfully");
  } catch (err) {
    return sendError(res, err.message);
  }
};