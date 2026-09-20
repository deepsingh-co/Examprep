import Exam from "../models/Exam.js";
import Subject from "../models/Subject.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

export const getAllExams = async (req, res) => {
  try {
    const exams = await Exam.find().sort({ createdAt: -1 }).lean();
    for (let exam of exams) {
      exam.subjects = await Subject.find({ exam_id: exam._id });
    }
    return sendSuccess(res, exams);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getExamById = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findById(id).lean();
    if (!exam) return sendError(res, "Exam not found", 404);
    exam.subjects = await Subject.find({ exam_id: exam._id });
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
    const exam = await Exam.findByIdAndUpdate(id, req.body, { new: true });
    if (!exam) return sendError(res, "Exam not found", 404);
    return sendSuccess(res, exam, "Exam updated successfully");
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const deleteExam = async (req, res) => {
  try {
    const { id } = req.params;
    const exam = await Exam.findByIdAndDelete(id);
    if (!exam) return sendError(res, "Exam not found", 404);
    return sendSuccess(res, null, "Exam deleted successfully");
  } catch (err) {
    return sendError(res, err.message);
  }
};