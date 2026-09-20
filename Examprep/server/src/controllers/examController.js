import { Exam, Subject } from "../models/index.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

export const getAllExams = async (req, res) => {
  try {
    const exams = await Exam.findAll({
      include: [{ model: Subject, as: "subjects" }],
      order: [["createdAt", "DESC"]],
    });
    return sendSuccess(res, exams);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getExamById = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findByPk(id, {
      include: [{ model: Subject, as: "subjects" }],
    });
    if (!exam) return sendError(res, "Exam not found", 404);
    return sendSuccess(res, exam);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const createExam = async (req, res) => {
  try {
    const { name, description, duration, total_marks } = req.body;
    if (!name || !duration || !total_marks) {
      return sendError(res, "Name, duration, and total marks are required", 400);
    }
    const exam = await Exam.create({ name, description, duration, total_marks });
    return sendSuccess(res, exam, "Exam created successfully", 201);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const updateExam = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findByPk(id);
    if (!exam) return sendError(res, "Exam not found", 404);
    await exam.update(req.body);
    return sendSuccess(res, exam, "Exam updated successfully");
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findByPk(id);
    if (!exam) return sendError(res, "Exam not found", 404);
    await exam.destroy();
    return sendSuccess(res, null, "Exam deleted successfully");
  } catch (err) {
    return sendError(res, err.message);
  }
};