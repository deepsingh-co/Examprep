import Subject from "../models/Subject.js";
import Unit from "../models/Unit.js";
import Topic from "../models/Topic.js";
import { sendSuccess, sendError } from "../utils/responseHelper.js";

export const getAllSubjects = async (req, res) => {
  try {
    const { examId, semester_id, department_id, university_id } = req.query;
    const query = {};
    if (examId) query.exam_id = examId;
    if (semester_id) query.semester_id = semester_id;
    if (department_id) query.department_id = department_id;
    if (university_id) query.university_id = university_id;

    const subjects = await Subject.find(query).sort({ createdAt: -1 }).lean();
    for (let sub of subjects) {
      sub.units = await Unit.find({ subject_id: sub._id }).sort({ order: 1 });
    }
    return sendSuccess(res, subjects);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const subject = await Subject.findById(id)
      .populate("assigned_faculty", "name email")
      .lean();
    if (!subject) return sendError(res, "Subject not found", 404);
    subject.units = await Unit.find({ subject_id: subject._id }).sort({ order: 1 });
    return sendSuccess(res, subject);
  } catch (err) {
    return sendError(res, err.message);
  }
};

export const createSubject = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return sendError(res, "Name is required", 400);
    }
    const subject = await Subject.create(req.body);
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